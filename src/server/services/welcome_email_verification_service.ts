import { sql } from '@server/models/postgres_client'
import Contacts from '@shared/schemas/database/public/Contacts'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'

/**
 * Verify contact eligibility for welcome email
 *
 * Criteria (FAIL FAST approach):
 * 1. Contact must exist
 * 2. Contact must be subscribed to newsletter
 * 3. Contact must not have already received this email type
 */
export async function verify_contact_eligibility_for_welcome_email(
    email: string,
    email_template: string,
): Promise<Contacts> {
    // Get contact by email
    const contacts = await sql<Contacts[]>`
        SELECT uuid, email, first_name, subscriptions, sent_emails
        FROM contacts
        WHERE email = ${email}
    `

    // FAIL FAST: Contact must exist
    if (contacts.length === 0) {
        throw new Error(`Contact with email ${email} not found`)
    }

    const contact = contacts[0]

    // FAIL FAST: Contact must be subscribed to newsletter
    if (!contact.subscriptions?.includes(ContactSubscriptions.newsletter)) {
        throw new Error(`Contact ${email} is not subscribed to newsletter`)
    }

    // FAIL FAST: Contact must not have already received this email
    if (contact.sent_emails?.includes(email_template)) {
        throw new Error(`Contact ${email} has already received email template ${email_template}`)
    }

    return contact
}
