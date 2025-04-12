import { sql } from '@server_models/models'
import Contacts from 'src/schemas/public/Contacts'

export class Contacts_Models {
    static async get_by_emails(emails: string[]) {
        return await sql<Contacts[]>`
            SELECT *
            FROM contacts
            WHERE email = ANY(${emails})
        `
    }
}
