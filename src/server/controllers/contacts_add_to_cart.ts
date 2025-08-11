import { Request, Response } from 'express'
import { HTTP_STATUS, API, META_EVENTS } from '@shared/constants/app.constants'
import { validate_request, validate_response } from '@shared/validations/contacts_add_to_cart.validation'
import { sql } from '@server/models/postgres_client'
import Contacts from '@shared/schemas/database/public/Contacts'
import { create_action } from '@server/services/create_action'
import { send_meta_event } from '@server/services/send_meta_event'

export async function contacts_add_to_cart(req: Request, res: Response) {
    const request_data = validate_request(req.body)
    const email = request_data.email

    // Early response
    const response = validate_response({ success: true })
    res.status(HTTP_STATUS.CREATED).json(response)

    // REQUEST ENDS HERE

    const contact = await get_contact_by_email(email)
    if (!contact) return

    // Dedup: check if an add_to_cart already exists for reservation context
    const already_added = await exists_add_to_cart_for_reservation(contact.uuid)

    // Send Meta event only if first time
    if (!already_added) {
        await send_meta_event(META_EVENTS.ADD_TO_CART, null, req, contact.uuid, request_data.utm_params)
    }

    // Always record action in DB for audit/history
    await create_action({
        action: API.EVENTS.ACTIONS.ADD_TO_CART,
        req,
        contact_uuid: contact.uuid,
        details: { context: 'landing_page_reservation' },
        utm_params: request_data.utm_params,
        timezone: request_data.timezone,
    })
}

async function get_contact_by_email(email: string): Promise<Contacts | null> {
    const contacts = await sql<Contacts[]>`
        SELECT uuid, email
        FROM contacts
        WHERE email = ${email}
        LIMIT 1
    `

    if (contacts.length === 0) return null
    return contacts[0]
}

async function exists_add_to_cart_for_reservation(contact_uuid: string): Promise<boolean> {
    const result = await sql<[{ exists: boolean }]>`
        SELECT EXISTS (
            SELECT 1
            FROM actions
            WHERE contact_uuid = ${contact_uuid}
              AND action = ${API.EVENTS.ACTIONS.ADD_TO_CART}
              AND (details ->> 'context') = 'landing_page_reservation'
        ) as exists
    `
    return result[0]?.exists === true
}
