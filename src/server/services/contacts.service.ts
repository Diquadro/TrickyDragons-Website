import { sql } from '@server/models/postgres_client'
import Contacts, { ContactsInitializer, ContactsMutator } from '@shared/schemas/public/Contacts'
import ContactStatus from '@shared/schemas/public/ContactStatus'
import ContactSubscriptions from '@shared/schemas/public/ContactSubscriptions'
import {
    CONTACT_RESPONSE_OUTCOME,
    Subscribe_Contact_Response_Outcome,
} from '@shared/validations/subscribe_contact.validations'

export abstract class Contacts_Service {
    static async subscribe(
        email: string,
        subscription: ContactSubscriptions,
    ): Promise<{
        contacts: Contacts[]
        outcome: Subscribe_Contact_Response_Outcome
    }> {
        const contacts = await Contacts_Service.find_by_email(email)

        const contact = contacts[0]

        if (!contact) {
            const new_contact: ContactsInitializer = {
                email,
                status: ContactStatus.lead,
                subscriptions: [subscription],
            }

            const newContacts = await sql.insert<Contacts[]>('contacts', [new_contact])

            return {
                contacts: newContacts,
                outcome: CONTACT_RESPONSE_OUTCOME.NEW_CONTACT,
            }
        } else if (contact.subscriptions?.includes(subscription)) {
            return {
                contacts: [contact],
                outcome: CONTACT_RESPONSE_OUTCOME.ALREADY_SUBSCRIBED,
            }
        } else {
            const updated_contacts = await sql.update<Contacts[]>('contacts', [
                {
                    uuid: contact.uuid,
                    subscriptions: [...(contact.subscriptions ?? []), subscription],
                },
            ])

            return {
                contacts: updated_contacts,
                outcome: CONTACT_RESPONSE_OUTCOME.RESUBSCRIBED,
            }
        }
    }

    static async update(contact: ContactsMutator) {
        return await sql.update<Contacts[]>('contacts', [contact])
    }

    static async find_by_email(email: string): Promise<Contacts[]> {
        return await sql<Contacts[]>`
            SELECT * 
            FROM contacts
            WHERE email = ${email}
        `
    }
}
