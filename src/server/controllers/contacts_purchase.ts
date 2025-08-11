import { Request, Response } from 'express'
import { HTTP_STATUS, API, META_EVENTS } from '@shared/constants/app.constants'
import { validate_request, validate_response } from '@shared/validations/contacts_purchase.validation'
import { sql } from '@server/models/postgres_client'
import Contacts, { ContactsInitializer } from '@shared/schemas/database/public/Contacts'
import ContactStatus from '@shared/schemas/database/public/ContactStatus'
import { create_action } from '@server/services/create_action'
import { send_meta_event } from '@server/services/send_meta_event'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
})

export async function contacts_purchase(req: Request, res: Response) {
    const request_data = validate_request(req.body)
    const { email, session_id, timezone, utm_params } = request_data

    // Early response
    const response = validate_response({
        success: true,
        message: 'Purchase processing initiated',
    })
    res.status(HTTP_STATUS.CREATED).json(response)

    // REQUEST ENDS HERE

    try {
        // 1. Retrieve Stripe session with expanded details
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['line_items', 'customer_details'],
        })

        if (!session) {
            return
        }

        // 2. Find or create contact
        let contact = await get_contact_by_email(email)
        if (!contact) {
            contact = await create_contact_from_session(email, session)
        } else {
            // Update contact with name from Stripe if missing
            contact = await update_contact_with_stripe_data(contact, session)
        }

        // 3. Check for duplicate order (dedup on session_id)
        const existing_order = await get_order_by_session_id(session_id)
        if (existing_order) {
            return
        }

        // 4. Create billing address if customer details available
        let billing_address_uuid = null
        if (session.customer_details?.address) {
            billing_address_uuid = await create_or_get_address(
                contact.uuid,
                'billing',
                session.customer_details.address,
            )
        }

        // 5. Create order record
        const order = await create_order({
            contact_uuid: contact.uuid,
            email: email,
            session,
            billing_address_uuid,
            utm_params,
            timezone,
            req,
        })

        // 6. Send Meta Purchase event
        await send_meta_event(META_EVENTS.PURCHASE, null, req, contact.uuid, utm_params)

        // 7. Record action in actions table
        await create_action({
            action: API.EVENTS.ACTIONS.PURCHASE,
            req,
            contact_uuid: contact.uuid,
            details: {
                context: 'checkout_page',
                session_id: session_id,
                order_id: order.uuid,
                amount_total: session.amount_total,
                currency: session.currency,
                payment_status: session.payment_status,
                order_status: 'pending',
            },
            utm_params,
            timezone,
        })
    } catch (error) {
        console.error('Error processing purchase:', {
            session_id,
            email,
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}

async function get_contact_by_email(email: string): Promise<Contacts | null> {
    const contacts = await sql<Contacts[]>`
        SELECT uuid, email, first_name, last_name, status, subscriptions
        FROM contacts
        WHERE email = ${email}
        LIMIT 1
    `
    return contacts.length > 0 ? contacts[0] : null
}

async function create_contact_from_session(
    email: string,
    session: Stripe.Checkout.Session,
): Promise<Contacts> {
    const customer_name = session.customer_details?.name || ''
    const [first_name, ...last_name_parts] = customer_name.split(' ')
    const last_name = last_name_parts.join(' ')

    const new_contact: ContactsInitializer = {
        email,
        status: ContactStatus.customer, // They made a purchase, so they're a customer
        first_name: first_name || null,
        last_name: last_name || null,
    }

    const contacts = await sql.insert<Contacts[]>('contacts', [new_contact])
    if (contacts.length === 0) {
        throw new Error('Failed to create contact')
    }

    return contacts[0]
}

async function update_contact_with_stripe_data(
    contact: Contacts,
    session: Stripe.Checkout.Session,
): Promise<Contacts> {
    const customer_name = session.customer_details?.name || ''
    const [first_name, ...last_name_parts] = customer_name.split(' ')
    const last_name = last_name_parts.join(' ')

    // Only update if names are missing
    const should_update = (!contact.first_name && first_name) || (!contact.last_name && last_name)

    if (!should_update) {
        return contact
    }

    const update_data: any = { uuid: contact.uuid }
    if (!contact.first_name && first_name) update_data.first_name = first_name
    if (!contact.last_name && last_name) update_data.last_name = last_name

    // Update status to customer if they weren't already
    if (contact.status !== ContactStatus.customer) {
        update_data.status = ContactStatus.customer
    }

    const updated_contacts = await sql.update<Contacts[]>('contacts', [update_data])
    return updated_contacts.length > 0 ? updated_contacts[0] : contact
}

async function get_order_by_session_id(session_id: string) {
    const orders = await sql<[{ uuid: string }]>`
        SELECT uuid
        FROM orders
        WHERE stripe_session_id = ${session_id}
        LIMIT 1
    `
    return orders.length > 0 ? orders[0] : null
}

async function create_or_get_address(
    contact_uuid: string,
    type: 'billing' | 'shipping',
    address: Stripe.Address,
): Promise<string> {
    // Check if address already exists for this contact
    const existing_addresses = await sql<{ uuid: string }[]>`
        SELECT uuid
        FROM addresses
        WHERE contact_uuid = ${contact_uuid}
          AND type = ${type}
          AND line1 = ${address.line1 || ''}
          AND COALESCE(line2, '') = ${address.line2 || ''}
          AND COALESCE(city, '') = ${address.city || ''}
          AND COALESCE(state, '') = ${address.state || ''}
          AND COALESCE(postal_code, '') = ${address.postal_code || ''}
          AND COALESCE(country, '') = ${address.country || ''}
        LIMIT 1
    `

    if (existing_addresses.length > 0) {
        return existing_addresses[0].uuid
    }

    // Create new address
    const address_data = {
        contact_uuid,
        type,
        line1: address.line1 || '',
        line2: address.line2 || null,
        city: address.city || null,
        state: address.state || null,
        postal_code: address.postal_code || null,
        country: address.country || null,
        is_default: true, // First address of this type becomes default
    }

    const addresses = await sql.insert<{ uuid: string }[]>('addresses', [address_data])
    if (addresses.length === 0) {
        throw new Error('Failed to create address')
    }

    return addresses[0].uuid
}

interface CreateOrderParams {
    contact_uuid: string
    email: string
    session: Stripe.Checkout.Session
    billing_address_uuid: string | null
    utm_params?: any
    timezone?: string
    req: Request
}

async function create_order(params: CreateOrderParams) {
    const { contact_uuid, email, session, billing_address_uuid, utm_params, timezone, req } = params

    const order_data = {
        contact_uuid,
        email,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'pending', // Will be updated to 'paid' by webhook
        amount_total: session.amount_total || 0,
        currency: session.currency || 'usd',
        billing_address_uuid,
        line_items: session.line_items?.data || null,
        utm_source: utm_params?.utm_source || null,
        utm_medium: utm_params?.utm_medium || null,
        utm_campaign: utm_params?.utm_campaign || null,
        utm_term: utm_params?.utm_term || null,
        utm_content: utm_params?.utm_content || null,
        country: req.geo_infos?.country || null,
        region: req.geo_infos?.region || null,
        city: req.geo_infos?.city || null,
        timezone: timezone || req.geo_infos?.timezone || null,
        latitude: req.geo_infos?.latitude || null,
        longitude: req.geo_infos?.longitude || null,
        occurred_at: req.time_infos?.utc_occurred_at || new Date(),
        local_occurred_at: req.time_infos?.local_occurred_at || null,
    }

    const orders = await sql.insert<{ uuid: string }[]>('orders', [order_data])
    if (orders.length === 0) {
        throw new Error('Failed to create order')
    }

    return orders[0]
}
