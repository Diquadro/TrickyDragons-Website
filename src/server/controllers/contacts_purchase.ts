import { Request, Response } from 'express'
import { HTTP_STATUS, API, META_EVENTS } from '@shared/constants/app.constants'
import { validate_request, validate_response } from '@shared/validations/contacts_purchase.validation'
import { sql } from '@server/models/postgres_client'
import Contacts, { ContactsInitializer } from '@shared/schemas/database/public/Contacts'
import ContactStatus from '@shared/schemas/database/public/ContactStatus'
import Orders from '@shared/schemas/database/public/Orders'
import { create_action } from '@server/services/create_action'
import { send_meta_event } from '@server/services/send_meta_event'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
})

/**
 * Contacts Purchase Controller - UPDATED FOR WEBHOOK-FIRST APPROACH
 *
 * This controller no longer creates orders - that's handled by webhooks.
 * Instead, it:
 * 1. Verifies the Stripe session status
 * 2. Finds or creates the contact
 * 3. Sends Meta events for tracking
 * 4. Logs the purchase action
 * 5. Returns order status (order should already exist from webhook)
 */
export async function contacts_purchase(req: Request, res: Response) {
    const request_data = validate_request(req.body)
    const { email, session_id, timezone, utm_params } = request_data

    // Early response - user doesn't need to wait for background processing
    const response = validate_response({
        success: true,
        message: 'Purchase confirmation initiated',
    })
    res.status(HTTP_STATUS.OK).json(response)

    // REQUEST ENDS HERE - Background processing follows

    // 1. Retrieve Stripe session to verify status
    const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['customer_details'],
    })

    if (!session) {
        console.error('Stripe session not found in background processing:', { session_id, email })
        return
    }

    // 2. Verify payment was successful
    if (session.payment_status !== 'paid') {
        console.warn('Payment not completed in background processing:', {
            session_id,
            email,
            payment_status: session.payment_status,
            session_status: session.status,
        })
        return
    }

    // 3. Find or create contact
    let contact = await get_contact_by_email(email)
    if (!contact) {
        contact = await create_contact_from_session(email, session)
    } else {
        // Update contact with name from Stripe if missing
        contact = await update_contact_with_stripe_data(contact, session)
    }

    // 4. Check if order exists (should have been created by webhook)
    const existing_order = await get_order_by_session_id(session_id)

    // 5. Send Meta Purchase event with value and currency
    await send_meta_event(META_EVENTS.PURCHASE, null, req, contact.uuid, utm_params, {
        value: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents to dollars
        currency: session.currency?.toUpperCase() || 'USD',
    })

    // 6. Record action in actions table (with order reference if available)
    await create_action({
        action: API.EVENTS.ACTIONS.PURCHASE,
        req,
        contact_uuid: contact.uuid,
        order_uuid: existing_order?.uuid,
        details: {
            context: 'thank_you_page',
            session_id: session_id,
            order_uuid: existing_order?.uuid || null,
            amount_total: session.amount_total,
            currency: session.currency,
            payment_status: session.payment_status,
            order_status: existing_order?.status || 'webhook_pending',
            webhook_created_order: existing_order ? true : false,
        },
        utm_params,
        timezone,
    })
}

async function get_contact_by_email(email: string): Promise<Contacts | null> {
    const contacts = await sql<Contacts[]>`
        SELECT * FROM contacts 
        WHERE email = ${email}
        LIMIT 1
    `

    return contacts.length > 0 ? contacts[0] : null
}

async function create_contact_from_session(
    email: string,
    session: Stripe.Checkout.Session,
): Promise<Contacts> {
    const customer_details = session.customer_details

    const contact_data: ContactsInitializer = {
        email: email,
        status: ContactStatus.prospect, // Prospect since they're in the purchase flow
        subscriptions: [], // Empty subscriptions array
        first_name: customer_details?.name?.split(' ')[0] || null,
        last_name: customer_details?.name?.split(' ').slice(1).join(' ') || null,
    }

    const contacts = await sql.insert<Contacts[]>('contacts', [contact_data])
    if (contacts.length === 0) {
        throw new Error('Failed to create contact')
    }

    console.warn('New contact created during purchase flow:', {
        uuid: contacts[0].uuid,
        email: email,
        name: customer_details?.name,
        context: 'thank_you_page',
    })

    return contacts[0]
}

async function update_contact_with_stripe_data(
    contact: Contacts,
    session: Stripe.Checkout.Session,
): Promise<Contacts> {
    const customer_details = session.customer_details

    // Prepare contact update data
    const contact_update: Partial<Contacts> = {
        uuid: contact.uuid, // Required for sql.update
    }

    let needs_update = false

    // Update status: only lead -> prospect (customer is set manually)
    if (contact.status === ContactStatus.lead) {
        contact_update.status = ContactStatus.prospect
        needs_update = true
    }

    // Update name if missing and Stripe has it
    if ((!contact.first_name || !contact.last_name) && customer_details?.name) {
        const name_parts = customer_details.name.split(' ')
        if (!contact.first_name && name_parts[0]) {
            contact_update.first_name = name_parts[0]
            needs_update = true
        }
        if (!contact.last_name && name_parts.length > 1) {
            contact_update.last_name = name_parts.slice(1).join(' ')
            needs_update = true
        }
    }

    if (needs_update) {
        const updated_contacts = await sql.update<Contacts[]>('contacts', [contact_update])

        if (updated_contacts.length > 0) {
            return updated_contacts[0]
        }
    }

    return contact
}

async function get_order_by_session_id(session_id: string): Promise<Orders | null> {
    const orders = await sql<Orders[]>`
        SELECT * FROM orders 
        WHERE stripe_session_id = ${session_id}
        LIMIT 1
    `

    return orders.length > 0 ? orders[0] : null
}
