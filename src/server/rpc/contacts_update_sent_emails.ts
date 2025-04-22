import Contacts from '@schemas/public/Contacts'
import { sql } from '@server_models/models'
import { try_catch } from '@server_utils/try_catch'

export async function contacts_update_sent_emails(contacts: Contacts[], email_name: string) {
    const [ok, err, data] = await try_catch(contacts_update_sent_emails_service(contacts, email_name))
    if (!ok) {
        console.error(err)
        return []
    }

    return data
}

async function contacts_update_sent_emails_service(contacts: Contacts[], email_name: string) {
    const contact_to_update = contacts.map((c) => ({
        uuid: c.uuid,
        sent_emails: [...(c.sent_emails ?? []), email_name],
    }))

    sql.update<Contacts[]>('contacts', contact_to_update)
}
