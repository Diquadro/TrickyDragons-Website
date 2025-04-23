import { Request, Response } from 'express'
import { Base64_Url } from '@shared/utils/base64_url'
import { EventsInitializer } from '@shared/schemas/public/Events'
import { Events_Service } from '@server/services/events.service'
import EventDirection from '@shared/schemas/public/EventDirection'
import EventOutcome from '@shared/schemas/public/EventOutcome'
import { API, HTTP_STATUS, CLIENT } from '@shared/constants/app.constants'
import { try_catch } from '@shared/utils/try_catch'
import { Addresses_Service } from '@server/services/addresses.service'
import Contacts, { ContactsUuid } from '@shared/schemas/public/Contacts'
import { AddressesUuid } from '@shared/schemas/public/Addresses'
import { redirect_payload_schema, Redirect_Payload } from '@shared/validations/redirect.validations'
import { Contacts_Service } from '@server/services/contacts.service'

export abstract class Redirect_Controller {
    static async http(req: Request, res: Response) {
        const decoded = Base64_Url.decode_json(req.params.data64)
        const payload_validation = redirect_payload_schema.safeParse(decoded)

        if (!payload_validation.success) {
            console.error('Invalid redirect data format', payload_validation.error)
            return res.redirect(CLIENT.URL)
        }

        const payload = payload_validation.data
        res.redirect(payload.redirect_url || CLIENT.URL)

        // Retrieve geographic information if possible
        const [addresses_ok, addresses_error, addresses] = await try_catch(
            Addresses_Service.get_or_create(req),
        )

        if (!addresses_ok) {
            console.error('Failed to get/create address:', addresses_error)
        }

        // Retrieve the contact associated with the email if present
        const contacts = await Redirect_Controller.get_contact(payload.email)

        // Track the redirect event
        Redirect_Controller.create_success_event(
            req,
            payload,
            contacts?.[0]?.uuid,
            addresses?.[0]?.uuid,
        ).catch(console.error)
    }

    static async get_contact(email?: string): Promise<Contacts[]> {
        if (!email) {
            return []
        }

        const [contacts_ok, contacts_error, contacts] = await try_catch(Contacts_Service.find_by_email(email))

        if (!contacts_ok) {
            console.error('Failed to find contact by email:', contacts_error)
        }

        return contacts ?? []
    }

    static async create_success_event(
        req: Request,
        payload: Redirect_Payload,
        contact_uuid?: ContactsUuid,
        address_uuid?: AddressesUuid,
    ) {
        const success_event: EventsInitializer = {
            action: API.EVENTS.ACTIONS.REDIRECT,
            direction: EventDirection.outbound,
            endpoint: `${req.method} - ${req.originalUrl}`,
            origin: req.get('Referrer') ?? payload?.origin ?? API.EVENTS.ORIGINS.INTERNAL,
            occurred_at: new Date(),
            outcome: EventOutcome.success,
            details: payload,
            contact_uuid: contact_uuid,
            address_uuid: address_uuid,
        }

        return await Events_Service.create(success_event)
    }

    static async create_failure_event(req: Request, error: Error) {
        const failure_event: EventsInitializer = {
            action: API.EVENTS.ACTIONS.REDIRECT,
            direction: EventDirection.outbound,
            endpoint: `${req.method} - ${req.originalUrl}`,
            origin: req.get('Referrer'),
            occurred_at: new Date(),
            outcome: EventOutcome.failure,
            details: {
                message: error.message,
                stack: error.stack,
            },
        }

        return await Events_Service.create(failure_event)
    }
}
