import { Request, Response } from 'express'
import { Contacts_Services } from '@api_services/contacts.services'
import { Events_Services } from '@api_services/events.services'
import { Addresses_Services } from '@api_services/addresses.services'
import { handle_error } from '@api_utils/handle_error'
import EventOutcome from 'src/schemas/public/EventOutcome'

export class Contacts_Controllers {
    static async create_lead(req: Request, res: Response): Promise<Response> {
        const events = new Events_Services()
        events.base_event.action = req.method + ' - ' + req.originalUrl
        events.base_event.origin = req.get('Referrer') ?? 'api'
        events.base_event.occurred_at = new Date()

        try {
            const addresses_created = await Addresses_Services.get_or_create(req.geo_infos)
            const contacts_created = await Contacts_Services.create_lead(req.body)

            events.base_event.outcome = EventOutcome.success
            events.base_event.address_uuid = addresses_created[0].uuid

            // Batch Event Data
            events.batch_data.contact_uuid = contacts_created.map(({ uuid }) => uuid)

            return res.status(201).json(contacts_created.map(({ uuid, email }) => ({ uuid, email })))
        } catch (err) {
            events.base_event.outcome = EventOutcome.failure
            events.base_event.details = JSON.stringify(err)

            return handle_error(res, err)
        } finally {
            events.create()
        }
    }

    static async subscribe_to_newsletter(req: Request, res: Response): Promise<Response> {
        const events = new Events_Services()
        events.base_event.action = req.method + ' - ' + req.originalUrl
        events.base_event.origin = req.get('Referrer') ?? 'api'
        events.base_event.occurred_at = new Date()

        try {
            const addresses_created = await Addresses_Services.get_or_create(req.geo_infos)
            const contacts_created = await Contacts_Services.subscribe_to_newsletter(req.body)

            events.base_event.outcome = EventOutcome.success
            events.base_event.address_uuid = addresses_created[0].uuid

            // Batch Event Data
            events.batch_data.contact_uuid = contacts_created.map(({ uuid }) => uuid)

            return res.status(200).json(contacts_created.map(({ uuid, email }) => ({ uuid, email })))
        } catch (err) {
            events.base_event.outcome = EventOutcome.failure
            events.base_event.details = JSON.stringify(err)

            return handle_error(res, err)
        } finally {
            events.create()
        }
    }

    static async unsubscribe_to_newsletter(req: Request, res: Response): Promise<Response> {
        const events = new Events_Services()
        events.base_event.action = req.method + ' - ' + req.originalUrl
        events.base_event.origin = req.get('Referrer') ?? 'api'
        events.base_event.occurred_at = new Date()

        try {
            const addresses_created = await Addresses_Services.get_or_create(req.geo_infos)
            const contacts_created = await Contacts_Services.unsubscribe_to_newsletter(req.body)

            events.base_event.outcome = EventOutcome.success
            events.base_event.address_uuid = addresses_created[0].uuid

            // Batch Event Data
            events.batch_data.contact_uuid = contacts_created.map(({ uuid }) => uuid)

            return res.status(200).json(contacts_created.map(({ uuid, email }) => ({ uuid, email })))
        } catch (err) {
            events.base_event.outcome = EventOutcome.failure
            events.base_event.details = JSON.stringify(err)

            return handle_error(res, err)
        } finally {
            events.create()
        }
    }
}
