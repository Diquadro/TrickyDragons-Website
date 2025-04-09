import { Addresses_Services } from '@api_services/addresses.services'
import { Contacts_Services } from '@api_services/contacts.services'
import { Events_Services } from '@api_services/events.services'
import { handle_error } from '@api_utils/handle_error'
import { Request, Response } from 'express'
import EventOutcome from 'src/schemas/public/EventOutcome'
import { Redirects_Services } from '@api_services/redirects.services'

export class Redirects_Controllers {
    static async redirect(req: Request, res: Response): Promise<Response> {
        const events = new Events_Services()
        events.base_event.action = req.method + ' - ' + req.originalUrl
        events.base_event.occurred_at = new Date()

        try {
            const { redirect_url, origin } = Redirects_Services.decode_data(req.params.data64)
            events.base_event.origin = origin

            const addresses_created = await Addresses_Services.get_or_create(req.geo_infos)

            events.base_event.outcome = EventOutcome.success
            events.base_event.address_uuid = addresses_created[0].uuid

            res.redirect(redirect_url)
            return res
        } catch (err) {
            events.base_event.outcome = EventOutcome.failure
            events.base_event.details = JSON.stringify(err)

            return handle_error(res, err)
        } finally {
            events.create()
        }
    }
}
