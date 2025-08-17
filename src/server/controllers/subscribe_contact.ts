import { sql } from '@server/models/postgres_client'
import { API, HTTP_STATUS, META_EVENTS } from '@shared/constants/app.constants'
import Contacts, { ContactsInitializer } from '@shared/schemas/database/public/Contacts'
import ContactStatus from '@shared/schemas/database/public/ContactStatus'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'
import {
    CONTACT_RESPONSE_OUTCOME,
    Subscribe_Contact_Request,
    Subscribe_Contact_Response_Outcome,
    validate_request,
    validate_response,
} from '@shared/validations/subscribe_contact.validation'
import { Request, Response } from 'express'
import { send_meta_event } from '../services/send_meta_event'
import { create_action } from '../services/create_action'
import { send_welcome_email } from '@shared/templates/emails/welcome/welcome'
import { EMAIL_TEMPLATES } from '@shared/constants/emails.constants'
import { check_has_reservation } from '@server/services/check_reservation'

export async function subscribe_contact(req: Request, res: Response) {
    const request_data = validate_request(req.body)
    const { email, subscription, utm_params, timezone } = request_data

    let contact = await get_contact(email)
    let outcome: Subscribe_Contact_Response_Outcome
    let message: string

    if (contact) {
        if (contact.subscriptions?.includes(subscription)) {
            outcome = CONTACT_RESPONSE_OUTCOME.ALREADY_SUBSCRIBED
            message = 'Email is already subscribed to this newsletter'
        } else {
            contact = await update_contact_subscriptions(contact, subscription)
            outcome = CONTACT_RESPONSE_OUTCOME.RESUBSCRIBED
            message = 'Contact resubscribed successfully'
        }
    } else {
        contact = await create_contact(email, subscription)
        outcome = CONTACT_RESPONSE_OUTCOME.NEW_CONTACT
        message = 'New contact created and subscribed successfully'
    }

    // Check if user has reservation
    const has_reserved = await check_has_reservation(contact?.uuid)

    const response = validate_response({
        success: true,
        message,
        data: {
            contact_id: contact.uuid,
            outcome,
            processed_at: new Date().toISOString(),
            has_reserved,
        },
    })

    res.status(HTTP_STATUS.CREATED).json(response)

    // REQUEST ENDS HERE

    const subscribe_contact_action_data = create_action_data(
        req,
        API.EVENTS.ACTIONS.SUBSCRIBE_CONTACT,
        contact,
        { outcome, has_reserved },
        request_data,
    )
    create_action(subscribe_contact_action_data)

    if (outcome !== CONTACT_RESPONSE_OUTCOME.NEW_CONTACT) return
    send_meta_event(META_EVENTS.LEAD, null, req, contact.uuid, utm_params)
}

async function get_contact(email: string) {
    const contacts = await sql<Contacts[]>`
        SELECT uuid, subscriptions
        FROM contacts
        WHERE email = ${email}
    `

    if (contacts.length === 0) {
        return null
    }

    return contacts[0]
}

async function create_contact(email: string, subscription: ContactSubscriptions): Promise<Contacts> {
    const new_contact: ContactsInitializer = {
        email,
        status: ContactStatus.lead,
        subscriptions: [subscription],
    }

    const new_contacts = await sql.insert<Contacts[]>('contacts', [new_contact])

    if (new_contacts.length === 0) {
        throw new Error('Failed to create contact')
    }

    return new_contacts[0]
}

async function update_contact_subscriptions(contact: Contacts, subscription: ContactSubscriptions) {
    const contacts = await sql.update<Contacts[]>('contacts', [
        {
            uuid: contact.uuid,
            subscriptions: [...(contact.subscriptions ?? []), subscription],
        },
    ])

    if (contacts.length === 0) {
        throw new Error('Failed to update contact')
    }

    return contacts[0]
}

function create_action_data(
    req: Request,
    action: string,
    contact: Contacts,
    details: Record<string, any>,
    request_data: Subscribe_Contact_Request,
) {
    return {
        req: req,
        action: action,
        contact_uuid: contact.uuid,
        details: details,
        utm_params: request_data.utm_params,
        timezone: request_data.timezone,
    }
}
