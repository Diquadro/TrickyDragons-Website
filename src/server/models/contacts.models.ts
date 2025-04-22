import { sql } from '@server_models/models'
import Contacts from '@schemas/public/Contacts'

export class Contacts_Models {
    static async get_by_emails(emails: string[]): Promise<Contacts[]> {
        return await sql<Contacts[]>`
            SELECT *
            FROM contacts
            WHERE email = ANY(${emails})
        `
    }
}
