import { sql } from '@server/models/postgres_client'
import { API } from '@shared/constants/app.constants'
import { Base64_Url } from '@shared/utils/base64_url'
import { validate_payload, Redirect_Payload } from '@shared/validations/redirect.validation'
import { Request, Response } from 'express'
import Contacts from '@shared/schemas/database/public/Contacts'
import AnalyticsEventName from '@shared/schemas/database/public/AnalyticsEventName'
import { create_action } from '@server/services/create_action'
import { create_analytics_event } from '@server/services/create_analytics_event'

/**
 * Handle redirect requests with Base64-encoded payload
 * Processes the redirect, logs analytics event, then redirects user
 */
export async function redirect(req: Request, res: Response) {
    // 1. Decode and validate Base64 payload
    const decoded_data = Base64_Url.decode_json(req.query.data64 as string)
    const payload = validate_payload(decoded_data)

    // 2. Perform redirect first (fail-fast for user experience)
    if (payload.keep_data64) {
        res.redirect(302, `${payload.redirect_url}?data64=${req.query.data64}`)
    } else {
        res.redirect(302, payload.redirect_url)
    }

    // 3. Process analytics in background (doesn't affect user experience)
    // REQUEST ENDS HERE for the user

    const analytics_event_data = create_analytics_event_data(payload)
    create_analytics_event(analytics_event_data, req)

    if (!payload.email) return

    const contact = await get_contact_by_email(payload.email)
    if (!contact) return

    const action_data = create_action_data(payload, req, contact)
    create_action(action_data)
}

/**
 * Get contact by email
 */
async function get_contact_by_email(email: string): Promise<Contacts | null> {
    const contacts = await sql<Contacts[]>`
        SELECT uuid, email
        FROM contacts
        WHERE email = ${email}
        LIMIT 1
    `

    if (contacts.length === 0) {
        return null
    }

    return contacts[0]
}

function create_analytics_event_data(payload: Redirect_Payload) {
    return {
        event_name: AnalyticsEventName.link_click,
        details: { redirect_url: payload.redirect_url },
        page_title: payload.utm_params?.utm_campaign,
        utm_params: payload.utm_params,
    }
}

function create_action_data(payload: Redirect_Payload, req: Request, contact: Contacts) {
    return {
        action: API.EVENTS.ACTIONS.REDIRECT,
        req: req,
        contact_uuid: contact.uuid,
        details: { redirect_url: payload.redirect_url },
        utm_params: payload.utm_params,
    }
}
