import { Addresses_Services } from '@server_services/addresses.services'
import { Contacts_Services } from '@server_services/contacts.services'
import { Emails_Services } from '@server_services/emails.services'
import { Events_Services } from '@server_services/events.services'
import { handle_error } from '@server_utils/handle_error'
import { Request, Response } from 'express'
import EventOutcome from '@schemas/public/EventOutcome'
import Contacts from '@schemas/public/Contacts'

export class Emails_Welcome_Controllers {
    static async internal(contacts: Contacts[]) {
        try {
            await Emails_Services.send_welcome(contacts)
        } catch (err) {
            events.base_event.outcome = EventOutcome.failure
            events.base_event.details = Events_Services.write_error_details(err)
        }
    }
}
