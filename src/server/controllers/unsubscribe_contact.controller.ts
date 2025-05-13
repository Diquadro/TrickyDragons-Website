import { Request, Response } from 'express'
import {
    UNSUBSCRIBE_RESPONSE_OUTCOME,
    Unsubscribe_Contact_Response_Outcome,
    unsubscribe_contacts_request_schema,
    unsubscribe_contacts_response_schema,
} from '@shared/validations/unsubscribe_contact.validation'
import { Contacts_Service } from '@server/services/contacts.service'
import { try_catch } from '@shared/utils/try_catch'
import { Addresses_Service } from '@server/services/addresses.service'
import { EventsInitializer } from '@shared/schemas/public/Events'
import { Events_Service } from '@server/services/events.service'
import EventDirection from '@shared/schemas/public/EventDirection'
import EventOutcome from '@shared/schemas/public/EventOutcome'
import { API, HTTP_STATUS } from '@shared/constants/app.constants'
import { AddressesUuid } from '@shared/schemas/public/Addresses'
import { ContactsUuid } from '@shared/schemas/public/Contacts'

export abstract class Unsubscribe_Contact_Controller {
    static async http(req: Request, res: Response) {
        const validation = unsubscribe_contacts_request_schema.safeParse(req.body)

        if (!validation.success) {
            console.error(validation.error)
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.error })
        }

        const { email, subscription } = validation.data
        const [response_ok, response_error, response] = await try_catch(
            Contacts_Service.unsubscribe(email, subscription),
        )

        if (!response_ok) {
            console.error(response_error)
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: response_error.message })
        }

        res.status(HTTP_STATUS.OK)
            .json(unsubscribe_contacts_response_schema.parse({ outcome: response.outcome }))
            .send()

        if (response.outcome === UNSUBSCRIBE_RESPONSE_OUTCOME.NOT_FOUND) {
            return
        }

        const [addresses_ok, addresses_error, addresses] = await try_catch(
            Addresses_Service.get_or_create(req),
        )

        if (!addresses_ok) {
            console.error(addresses_error)
        }

        if (response.outcome === UNSUBSCRIBE_RESPONSE_OUTCOME.UNSUBSCRIBED) {
            Unsubscribe_Contact_Controller.create_success_event(
                req,
                response.outcome,
                response.contacts[0].uuid,
                addresses?.[0]?.uuid,
            ).catch(console.error)
        }
    }

    static async create_success_event(
        req: Request,
        outcome: Unsubscribe_Contact_Response_Outcome,
        contact_uuid: ContactsUuid,
        address_uuid?: AddressesUuid,
    ) {
        const success_unsubscribe_event: EventsInitializer = {
            action: API.EVENTS.ACTIONS.UNSUBSCRIBE_CONTACT,
            direction: EventDirection.inbound,
            endpoint: `${req.method} - ${req.originalUrl}`,
            origin: req.get('Referrer'),
            occurred_at: new Date(),
            outcome: EventOutcome.success,
            details: { outcome: outcome },
            address_uuid: address_uuid,
            contact_uuid: contact_uuid,
        }

        return await Events_Service.create(success_unsubscribe_event)
    }
}
