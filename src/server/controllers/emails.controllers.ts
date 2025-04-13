import { Addresses_Services } from '@server_services/addresses.services'
import { Contacts_Services } from '@server_services/contacts.services'
import { Emails_Services } from '@server_services/emails.services'
import { Events_Services } from '@server_services/events.services'
import { handle_error } from '@server_utils/handle_error'
import { Request, Response } from 'express'
import EventOutcome from '@schemas/public/EventOutcome'

export class Emails_Controllers {
    static async send_welcome(req: Request, res: Response): Promise<Response> {
        const events = new Events_Services()
        events.base_event.action = req.method + ' - ' + req.originalUrl
        events.base_event.origin = req.get('Referrer') ?? 'api'
        events.base_event.occurred_at = new Date()

        try {
            const addresses_created = await Addresses_Services.get_or_create(req.geo_infos)
            const db_contacts = await Contacts_Services.get_by_emails(req.body)
            await Emails_Services.send_welcome(db_contacts)

            events.base_event.outcome = EventOutcome.success
            events.base_event.address_uuid = addresses_created[0].uuid

            // Batch Event Data
            events.batch_data.contact_uuid = db_contacts.map(({ uuid }) => uuid)

            return res.status(200).json(req.body)
        } catch (err) {
            console.log('EMAIL error ->', err, JSON.stringify(err))
            events.base_event.outcome = EventOutcome.failure
            events.base_event.details = JSON.stringify({
                name: err.name,
                message: err.message,
                stack: err.stack,
            })

            return handle_error(res, err)
        } finally {
            events.create()
        }
    }
}
