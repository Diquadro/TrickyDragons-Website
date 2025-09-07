import { sql } from '@server/models/postgres_client'

/**
 * Mark email as sent for a contact
 */
export async function mark_email_as_sent(contact_uuid: string, email_template: string): Promise<void> {
    await sql`
        UPDATE contacts 
        SET sent_emails = COALESCE(sent_emails, ARRAY[]::text[]) || ARRAY[${email_template}]::text[]
        WHERE uuid = ${contact_uuid}
          AND NOT (COALESCE(sent_emails, ARRAY[]::text[]) @> ARRAY[${email_template}]::text[])
    `
}
