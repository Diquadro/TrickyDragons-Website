import { Request, Response } from 'express'
import { HTTP_STATUS } from '@shared/constants/app.constants'
import {
    validate_webhook_event,
    validate_payment_intent,
    validate_refund,
    type Stripe_Webhook_Event,
    type Payment_Intent,
    type Refund,
} from '@shared/validations/stripe_webhook.validation'
import { sql } from '@server/models/postgres_client'
import { create_action } from '@server/services/create_action'
import ActionOutcome from '@shared/schemas/database/public/ActionOutcome'
import ContactStatus from '@shared/schemas/database/public/ContactStatus'
import { ContactsUuid } from '@shared/schemas/database/public/Contacts'
import { OrdersUuid } from '@shared/schemas/database/public/Orders'
import OrderStatus from '@shared/schemas/database/public/OrderStatus'
import Orders from '@shared/schemas/database/public/Orders'
import AddressType from '@shared/schemas/database/public/AddressType'
import Stripe from 'stripe'

// Initialize Stripe for webhook signature verification and API calls
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
})

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * Stripe Webhook Controller
 * New webhook-first approach: Creates orders if they don't exist, with proper idempotency
 * and comprehensive logging via actions table
 */
export async function stripe_webhook(req: Request, res: Response): Promise<void> {
    // TODO: Implement proper webhook signature verification for production
    // const signature = req.get('stripe-signature')!
    // const event = stripe.webhooks.constructEvent(req.body, signature, WEBHOOK_SECRET)

    // For now, validate webhook event structure
    const signature = req.get('stripe-signature')
    if (!signature) {
        console.error('Missing Stripe signature')
        res.status(HTTP_STATUS.BAD_REQUEST).send('Missing signature')
        return
    }

    const event = validate_webhook_event(req.body)

    // Early response - Stripe expects quick acknowledgment
    res.status(HTTP_STATUS.OK).send('Webhook received')

    // REQUEST ENDS HERE - Background processing follows

    // Process event with new webhook-first logic
    await process_stripe_event(event, req)
}

/**
 * Process individual Stripe event based on its type
 * Includes new events: refund.created
 */
async function process_stripe_event(event: Stripe_Webhook_Event, req: Request): Promise<void> {
    switch (event.type) {
        case 'payment_intent.succeeded':
            await handle_payment_intent_succeeded(event, req)
            break

        case 'payment_intent.payment_failed':
            await handle_payment_intent_failed(event, req)
            break

        case 'payment_intent.canceled':
            await handle_payment_intent_canceled(event, req)
            break

        case 'refund.created':
            await handle_refund_created(event, req)
            break

        default:
            console.warn('Unhandled webhook event type:', event.type)
            break
    }
}

/**
 * Handle successful payment intent
 * Primary event for order creation - most reliable indicator of completed payment
 */
async function handle_payment_intent_succeeded(event: Stripe_Webhook_Event, req: Request): Promise<void> {
    const payment_intent = validate_payment_intent(event.data.object)
    const action_name = 'stripe_webhook_payment_succeeded'

    // 1. Check idempotency
    const existing_action = await check_event_already_processed(event.id, action_name)
    if (existing_action) {
        return
    }

    // 2. Retrieve session (optional enrichment) and upsert order
    const session = await get_session_for_payment_intent(payment_intent.id)
    const order = await upsert_order_from_event({
        req,
        status: OrderStatus.paid,
        payment_intent,
        session,
    })

    // 3. Log webhook action
    await log_webhook_action(event, action_name, order.uuid, order.contact_uuid!, req, {
        payment_intent_id: payment_intent.id,
        session_id: session?.id ?? null,
        amount_total: session?.amount_total ?? payment_intent.amount,
        currency: (session?.currency ?? payment_intent.currency ?? 'usd').toLowerCase(),
        order_status: OrderStatus.paid,
    })
}

/**
 * Handle failed payment intent
 */
async function handle_payment_intent_failed(event: Stripe_Webhook_Event, req: Request): Promise<void> {
    const payment_intent = validate_payment_intent(event.data.object)
    const action_name = 'stripe_webhook_payment_failed'

    // 1. Check idempotency
    const existing_action = await check_event_already_processed(event.id, action_name)
    if (existing_action) {
        return
    }

    // 2. Retrieve session (optional) and upsert order with failed status
    const session = await get_session_for_payment_intent(payment_intent.id)
    const order = await upsert_order_from_event({
        req,
        status: OrderStatus.failed,
        payment_intent,
        session,
    })

    // 3. Log webhook action
    await log_webhook_action(event, action_name, order.uuid, order.contact_uuid!, req, {
        payment_intent_id: payment_intent.id,
        session_id: session?.id ?? null,
        amount_total: session?.amount_total ?? payment_intent.amount,
        currency: (session?.currency ?? payment_intent.currency ?? 'usd').toLowerCase(),
        order_status: OrderStatus.failed,
        failure_reason: 'payment_failed',
    })
}

/**
 * Handle canceled payment intent
 */
async function handle_payment_intent_canceled(event: Stripe_Webhook_Event, req: Request): Promise<void> {
    const payment_intent = validate_payment_intent(event.data.object)
    const action_name = 'stripe_webhook_payment_canceled'

    // 1. Check idempotency
    const existing_action = await check_event_already_processed(event.id, action_name)
    if (existing_action) {
        return
    }

    // 2. Retrieve session (optional) and upsert order with canceled status
    const session = await get_session_for_payment_intent(payment_intent.id)
    const order = await upsert_order_from_event({
        req,
        status: OrderStatus.canceled,
        payment_intent,
        session,
    })

    // 3. Log webhook action
    await log_webhook_action(event, action_name, order.uuid, order.contact_uuid!, req, {
        payment_intent_id: payment_intent.id,
        session_id: session?.id ?? null,
        amount_total: session?.amount_total ?? payment_intent.amount,
        currency: (session?.currency ?? payment_intent.currency ?? 'usd').toLowerCase(),
        order_status: OrderStatus.canceled,
        cancellation_reason: 'user_canceled',
    })
}

/**
 * Handle refund created
 * New event for tracking refunds
 */
async function handle_refund_created(event: Stripe_Webhook_Event, req: Request): Promise<void> {
    const refund = validate_refund(event.data.object)
    const action_name = 'stripe_webhook_refund_created'

    // 1. Check idempotency
    const existing_action = await check_event_already_processed(event.id, action_name)
    if (existing_action) {
        return
    }

    // 2. Find order by payment_intent or charge
    const payment_intent_id = refund.payment_intent
    const charge_id = refund.charge

    let order: Orders | null = null

    if (payment_intent_id) {
        const order_result = await sql<Orders[]>`
            SELECT * FROM orders 
            WHERE stripe_payment_intent_id = ${payment_intent_id}
        `
        order = order_result[0] || null
    }

    if (!order && charge_id) {
        // TODO: Fallback logic to find order by charge_id if needed
        console.warn('Could not find order for refund by charge_id:', charge_id)
    }

    if (!order) {
        console.warn('Could not find order for refund:', {
            refund_id: refund.id,
            payment_intent_id,
            charge_id,
        })
        return
    }

    // 3. Update order status to refunded (only if currently paid)
    if (order.status === OrderStatus.paid) {
        await sql.update<Orders[]>('orders', [
            {
                uuid: order.uuid,
                status: OrderStatus.refunded,
            },
        ])
    } else {
        console.warn('Order not in paid status, cannot refund:', {
            order_uuid: order.uuid,
            current_status: order.status,
        })
    }

    // 4. Log webhook action
    await log_webhook_action(event, action_name, order.uuid, order.contact_uuid!, req, {
        refund_id: refund.id,
        payment_intent_id: payment_intent_id,
        charge_id: charge_id,
        amount: refund.amount,
        currency: refund.currency,
        reason: refund.reason,
        order_status: OrderStatus.refunded,
    })
}

/**
 * Check if a specific Stripe event has already been processed
 * Uses actions table for idempotency checking
 */
async function check_event_already_processed(stripe_event_id: string, action_name: string): Promise<boolean> {
    const existing_actions = await sql`
        SELECT uuid FROM actions 
        WHERE action = ${action_name}
          AND details->>'stripe_event_id' = ${stripe_event_id}
    `

    return existing_actions.length > 0
}

/**
 * Retrieve Checkout Session for a PaymentIntent (expanded with line_items and customer_details)
 */
async function get_session_for_payment_intent(
    payment_intent_id: string,
): Promise<Stripe.Checkout.Session | null> {
    try {
        const list = await stripe.checkout.sessions.list({ payment_intent: payment_intent_id, limit: 1 })
        if (list.data.length === 0) return null
        return await stripe.checkout.sessions.retrieve(list.data[0].id, {
            expand: ['line_items', 'customer_details'],
        })
    } catch (error) {
        console.error('get_session_for_payment_intent failed', {
            payment_intent_id,
            error: (error as Error).message,
        })
        return null
    }
}

interface UpsertOrderFromEventParams {
    req: Request
    status: OrderStatus
    payment_intent: Payment_Intent
    session: Stripe.Checkout.Session | null
}

/**
 * Upsert order from PI + optional Session. Single linear flow.
 */
async function upsert_order_from_event(params: UpsertOrderFromEventParams): Promise<Orders> {
    const { req, status, payment_intent, session } = params

    const email =
        session?.customer_email ||
        session?.customer_details?.email ||
        payment_intent.receipt_email ||
        payment_intent.metadata?.customer_email ||
        null

    if (!email) {
        throw new Error('Cannot create order: missing email in PI/Session')
    }

    const contact = await get_or_create_contact_by_email(email)

    // Maybe create billing address
    const billing_address_uuid = session?.customer_details?.address
        ? ((await create_or_get_address(
              contact.uuid,
              AddressType.billing,
              session.customer_details.address,
          )) as any)
        : null

    // Check existing order (by session or PI)
    const existing = await sql<Orders[]>`
        SELECT * FROM orders 
        WHERE stripe_session_id = ${session?.id ?? null} OR stripe_payment_intent_id = ${payment_intent.id}
        LIMIT 1
    `

    const base_data = {
        contact_uuid: contact.uuid,
        email,
        stripe_session_id: session?.id ?? null,
        stripe_payment_intent_id: payment_intent.id,
        status,
        amount_total: session?.amount_total ?? payment_intent.amount ?? 0,
        currency: (session?.currency ?? payment_intent.currency ?? 'usd').toLowerCase(),
        billing_address_uuid,
        line_items: session?.line_items?.data ?? null,
        // authoritative billing snapshot from checkout
        billing_name: session?.customer_details?.name ?? null,
        billing_email: session?.customer_details?.email ?? email ?? null,
        billing_phone: session?.customer_details?.phone ?? null,
        billing_country: session?.customer_details?.address?.country ?? null,
        billing_region: session?.customer_details?.address?.state ?? null,
        billing_city: session?.customer_details?.address?.city ?? null,
        billing_postal_code: session?.customer_details?.address?.postal_code ?? null,
        billing_line1: session?.customer_details?.address?.line1 ?? null,
        billing_line2: session?.customer_details?.address?.line2 ?? null,
        occurred_at: req.time_infos?.utc_occurred_at ?? new Date(),
        local_occurred_at: req.time_infos?.local_occurred_at ?? null,
    }

    if (existing.length > 0) {
        const current = existing[0]
        const should_upgrade = should_update_order_status(current.status, status)
        const update_record: Partial<Orders> & { uuid: OrdersUuid } = { uuid: current.uuid }

        if (should_upgrade) update_record.status = status
        if (!current.stripe_session_id && base_data.stripe_session_id)
            update_record.stripe_session_id = base_data.stripe_session_id
        if (!current.amount_total && base_data.amount_total)
            update_record.amount_total = String(base_data.amount_total)
        if (!current.currency && base_data.currency) update_record.currency = base_data.currency
        if (!current.billing_address_uuid && base_data.billing_address_uuid)
            update_record.billing_address_uuid = base_data.billing_address_uuid
        if (!current.line_items && base_data.line_items) update_record.line_items = base_data.line_items

        // Always refresh billing snapshot if missing
        if (!current.billing_name && base_data.billing_name)
            update_record.billing_name = base_data.billing_name
        if (!current.billing_email && base_data.billing_email)
            update_record.billing_email = base_data.billing_email
        if (!current.billing_phone && base_data.billing_phone)
            update_record.billing_phone = base_data.billing_phone
        if (!current.billing_country && base_data.billing_country)
            update_record.billing_country = base_data.billing_country
        if (!current.billing_region && base_data.billing_region)
            update_record.billing_region = base_data.billing_region
        if (!current.billing_city && base_data.billing_city)
            update_record.billing_city = base_data.billing_city
        if (!current.billing_postal_code && base_data.billing_postal_code)
            update_record.billing_postal_code = base_data.billing_postal_code
        if (!current.billing_line1 && base_data.billing_line1)
            update_record.billing_line1 = base_data.billing_line1
        if (!current.billing_line2 && base_data.billing_line2)
            update_record.billing_line2 = base_data.billing_line2

        const updated = await sql.update<Orders[]>('orders', [update_record])
        return updated[0]
    }

    const created = await sql.insert<Orders[]>('orders', [base_data])
    return created[0]
}

/**
 * Determine if order status should be updated based on status hierarchy
 * Hierarchy: paid -> refunded
 * failed/canceled/refunded are final states
 */
function should_update_order_status(current_status: OrderStatus, new_status: OrderStatus): boolean {
    // If status is the same, no update needed
    if (current_status === new_status) {
        return false
    }

    // Status hierarchy rules
    switch (current_status) {
        case OrderStatus.paid:
            // paid can only become refunded
            return new_status === OrderStatus.refunded

        case OrderStatus.failed:
        case OrderStatus.canceled:
        case OrderStatus.refunded:
            // These are final states, no updates allowed
            return false

        default:
            // Unknown status, allow update but log warning
            console.warn('Unknown current order status, allowing update:', {
                current_status,
                new_status,
            })
            return true
    }
}

/**
 * Log webhook action with order reference for comprehensive tracking
 */
async function log_webhook_action(
    event: Stripe_Webhook_Event,
    action_name: string,
    order_uuid: OrdersUuid,
    contact_uuid: ContactsUuid,
    req: Request,
    additional_details: Record<string, any> = {},
): Promise<void> {
    const action_details = {
        stripe_event_id: event.id,
        stripe_event_type: event.type,
        ...additional_details,
    }

    await create_action({
        action: action_name,
        req: req,
        contact_uuid: contact_uuid,
        order_uuid: order_uuid,
        outcome: ActionOutcome.success,
        details: action_details,
    })
}

/**
 * Get or create contact by email
 * Updates contact status to prospect when creating order
 */
async function get_or_create_contact_by_email(email: string): Promise<{ uuid: ContactsUuid; email: string }> {
    // 1. Try to find existing contact
    const existing_contacts = await sql`
        SELECT uuid, email, status FROM contacts 
        WHERE email = ${email}
        LIMIT 1
    `

    if (existing_contacts.length > 0) {
        const contact = existing_contacts[0] as { uuid: ContactsUuid; email: string; status: string }

        // Update contact status: only lead -> prospect (customer is set manually)
        if (contact.status === ContactStatus.lead) {
            await sql.update('contacts', [
                {
                    uuid: contact.uuid,
                    status: ContactStatus.prospect,
                },
            ])
        }

        return { uuid: contact.uuid, email: contact.email }
    }

    // 2. Create new contact
    console.warn('Creating new contact from webhook - this may indicate missing newsletter signup:', {
        email: email,
        context: 'stripe_webhook',
    })

    const new_contact_data = {
        email: email,
        status: ContactStatus.prospect, // Prospect since they're making a purchase
        subscriptions: [], // Empty subscriptions array
    }

    const created_contacts = await sql.insert<{ uuid: ContactsUuid; email: string }[]>('contacts', [
        new_contact_data,
    ])
    if (created_contacts.length === 0) {
        throw new Error('Failed to create contact')
    }

    const new_contact = created_contacts[0] as { uuid: ContactsUuid; email: string }

    return new_contact
}

/**
 * Create or get address for billing
 * Implementazione completa della creazione indirizzi
 */
async function create_or_get_address(
    contact_uuid: ContactsUuid,
    address_type: AddressType,
    stripe_address: Stripe.Address,
): Promise<string | null> {
    // 1. Check if similar address already exists for this contact
    const existing_addresses = await sql`
        SELECT uuid FROM addresses 
        WHERE contact_uuid = ${contact_uuid}
          AND type = ${address_type}
          AND country = ${stripe_address.country}
          AND postal_code = ${stripe_address.postal_code}
          AND line1 = ${stripe_address.line1}
        LIMIT 1
    `

    if (existing_addresses.length > 0) {
        return existing_addresses[0].uuid as string
    }

    // 2. Create new address
    const address_data = {
        contact_uuid: contact_uuid,
        type: address_type,
        line1: stripe_address.line1,
        line2: stripe_address.line2,
        city: stripe_address.city,
        state: stripe_address.state,
        postal_code: stripe_address.postal_code,
        country: stripe_address.country,
    }

    const created_addresses = await sql.insert<{ uuid: string }[]>('addresses', [address_data])
    if (created_addresses.length === 0) {
        console.error('Failed to create address')
        return null
    }

    return created_addresses[0].uuid
}
