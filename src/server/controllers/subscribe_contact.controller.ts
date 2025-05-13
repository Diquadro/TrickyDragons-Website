import { Request, Response } from 'express'
import {
    CONTACT_RESPONSE_OUTCOME,
    Subscribe_Contact_Response_Outcome,
    subscribe_contacts_request_schema,
    subscribe_contacts_response_schema,
} from '@shared/validations/subscribe_contact.validation'
import { Contacts_Service } from '@server/services/contacts.service'
import { try_catch } from '@shared/utils/try_catch'
import { Addresses_Service } from '@server/services/addresses.service'
import { EventsInitializer } from '@shared/schemas/public/Events'
import { Events_Service } from '@server/services/events.service'
import EventDirection from '@shared/schemas/public/EventDirection'
import EventOutcome from '@shared/schemas/public/EventOutcome'
import { API, HTTP_STATUS } from '@shared/constants/app.constants'
import { Welcome_Email } from '@shared/templates/emails/welcome/welcome'
import { AddressesUuid } from '@shared/schemas/public/Addresses'
import { ContactsUuid } from '@shared/schemas/public/Contacts'

export abstract class Subscribe_Contact_Controller {
    static async http(req: Request, res: Response) {
        const validation = subscribe_contacts_request_schema.safeParse(req.body)

        if (!validation.success) {
            console.error(validation.error)
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.error })
        }

        const { email, subscription } = validation.data
        const [response_ok, response_error, response] = await try_catch(
            Contacts_Service.subscribe(email, subscription),
        )

        if (!response_ok) {
            console.error(response_error)
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: response_error.message })
        }

        res.status(HTTP_STATUS.OK)
            .json(subscribe_contacts_response_schema.parse({ outcome: response.outcome }))
            .send()

        const [addresses_ok, addresses_error, addresses] = await try_catch(
            Addresses_Service.get_or_create(req),
        )

        if (!addresses_ok) {
            console.error(addresses_error)
        }

        Subscribe_Contact_Controller.create_success_event(
            req,
            response.outcome,
            response.contacts[0].uuid,
            addresses?.[0]?.uuid,
        ).catch(console.error)

        if (response.outcome !== CONTACT_RESPONSE_OUTCOME.NEW_CONTACT) {
            return
        }

        Welcome_Email.send_log_update(
            API.EVENTS.ORIGINS.SUBSCRIBE_CONTACT,
            response.contacts[0],
            addresses?.[0],
        ).catch(console.error)
    }

    static async create_success_event(
        req: Request,
        outcome: Subscribe_Contact_Response_Outcome,
        contact_uuid: ContactsUuid,
        address_uuid?: AddressesUuid,
    ) {
        const success_subscribe_event: EventsInitializer = {
            action: API.EVENTS.ACTIONS.SUBSCRIBE_CONTACT,
            direction: EventDirection.inbound,
            endpoint: `${req.method} - ${req.originalUrl}`,
            origin: req.get('Referrer'),
            occurred_at: new Date(),
            outcome: EventOutcome.success,
            details: { outcome: outcome },
            address_uuid: address_uuid,
            contact_uuid: contact_uuid,
        }

        return await Events_Service.create(success_subscribe_event)
    }

    // static async create_failure_event(req: Request, error: Error) {
    //     const failure_subscribe_event: EventsInitializer = {
    //         action: API.EVENTS.ACTIONS.SUBSCRIBE_CONTACT,
    //         direction: EventDirection.inbound,
    //         endpoint: `${req.method} - ${req.originalUrl}`,
    //         origin: req.get('Referrer'),
    //         occurred_at: new Date(),
    //         outcome: EventOutcome.failure,
    //         details: {
    //             message: error.message,
    //             stack: error.stack,
    //         },
    //     }

    //     return await Events_Service.create(failure_subscribe_event)
    // }
}
