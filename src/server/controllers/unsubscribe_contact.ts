import { sql } from '@server/models/postgres_client'
import { API, HTTP_STATUS } from '@shared/constants/app.constants'
import Contacts from '@shared/schemas/database/public/Contacts'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'
import {
    CONTACT_UNSUBSCRIBE_OUTCOME,
    Unsubscribe_Contact_Request,
    Unsubscribe_Contact_Response_Outcome,
    validate_request,
    validate_response,
} from '@shared/validations/unsubscribe_contact.validation'
import { Request, Response } from 'express'
import { create_action } from '../services/create_action'
import { create_analytics_event } from '@server/services/create_analytics_event'

export async function unsubscribe_contact(req: Request, res: Response) {
    const request_data = validate_request(req.body)
    const { email, subscription } = request_data

    console.log('request_data', email)

    const contact = await get_contact(email)
    let outcome: Unsubscribe_Contact_Response_Outcome
    let message: string

    if (!contact) {
        outcome = CONTACT_UNSUBSCRIBE_OUTCOME.CONTACT_NOT_FOUND
        message = 'Contact not found with this email address'
    } else if (!contact.subscriptions?.includes(subscription)) {
        outcome = CONTACT_UNSUBSCRIBE_OUTCOME.ALREADY_UNSUBSCRIBED
        message = 'Email is already unsubscribed from this newsletter'
    } else {
        await remove_contact_subscription(contact, subscription)
        outcome = CONTACT_UNSUBSCRIBE_OUTCOME.SUCCESSFULLY_UNSUBSCRIBED
        message = 'Successfully unsubscribed from newsletter'
    }

    const response = validate_response({
        success: true,
        message,
        data: {
            contact_id: contact?.uuid,
            outcome,
            processed_at: new Date().toISOString(),
        },
    })

    res.status(HTTP_STATUS.OK).json(response)

    // REQUEST ENDS HERE
    if (!contact) return
    const unsubscribe_contact_action_data = create_action_data(
        req,
        API.EVENTS.ACTIONS.UNSUBSCRIBE_CONTACT,
        contact,
        { outcome },
        request_data,
    )
    create_action(unsubscribe_contact_action_data)
}

async function get_contact(email: string): Promise<Contacts | null> {
    const contacts = await sql<Contacts[]>`
        SELECT uuid, subscriptions, status
        FROM contacts
        WHERE email = ${email}
        LIMIT 1
    `

    return contacts.length > 0 ? contacts[0] : null
}

async function remove_contact_subscription(
    contact: Contacts,
    subscription: ContactSubscriptions,
): Promise<Contacts> {
    // Remove the subscription from the array
    const updated_subscriptions = contact.subscriptions?.filter((sub) => sub !== subscription) || []

    const updated_contacts = await sql.update<Contacts[]>('contacts', [
        {
            uuid: contact.uuid,
            subscriptions: updated_subscriptions,
        },
    ])

    if (updated_contacts.length === 0) {
        throw new Error('Failed to update contact subscriptions')
    }

    return updated_contacts[0]
}

function create_action_data(
    req: Request,
    action: string,
    contact: Contacts,
    details: Record<string, any>,
    request_data: Unsubscribe_Contact_Request,
) {
    return {
        action: action,
        req: req,
        contact_uuid: contact.uuid,
        details: details,
        utm_params: request_data.utm_params,
        timezone: request_data.timezone,
    }
}
