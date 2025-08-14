import { CronJob } from 'cron'
import { sql } from '@server/models/postgres_client'
import { send_welcome_email } from '@shared/templates/emails/welcome/welcome'
import { EMAIL_TEMPLATES } from '@shared/constants/emails.constants'
import Contacts from '@shared/schemas/database/public/Contacts'
import { ENV } from '@shared/constants/app.constants'
import { check_has_kse_reservation } from '@server/services/check_kse_reservation'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'

/**
 * Welcome Email Cron Job
 *
 * Automatically sends welcome emails to new newsletter subscribers.
 *
 * Logic:
 * 1. Finds contacts subscribed to newsletter
 * 2. Filters contacts who haven't received welcome email yet
 * 3. Waits 15 minutes after signup to allow funnel completion
 * 4. Sends different welcome emails based on whether they have a KSE reservation order
 *
 * Runs every 10 minutes to process pending welcome emails.
 */

const time_interval = ENV.PRODUCTION ? 9 * 60 * 1000 : 2 * 60 * 1000 // Use different intervals for production/local
const cron_interval = ENV.PRODUCTION ? '*/10 * * * *' : '*/2 * * * *' // Use different intervals for production/local

export const welcome_email_cron = new CronJob(
    cron_interval,
    async () => {
        console.log('🕒 Running welcome email cron job...')

        try {
            await process_welcome_emails()
        } catch (error) {
            console.error('❌ Error in welcome email cron job:', error)
        }
    },
    null, // onComplete callback
    false, // start immediately
    'Europe/Rome', // timezone
)

/**
 * Main processing function for welcome emails
 * Finds eligible contacts and sends appropriate welcome emails
 */
export async function process_welcome_emails() {
    // Get contacts eligible for welcome email
    const eligible_contacts = await get_eligible_contacts()

    console.log(`📧 Found ${eligible_contacts.length} contacts eligible for welcome email`)

    for (const contact of eligible_contacts) {
        try {
            // Check if contact has a KSE reservation order
            const has_kse_reservation = await check_has_kse_reservation(contact.uuid)

            if (has_kse_reservation) {
                // TODO: Send welcome email for reservation customers
                // await send_welcome_email_reservation(contact.email)
                console.log(
                    `🎯 Contact ${contact.email} has KSE reservation - skipping for now (welcome_email_reservation not implemented yet)`,
                )

                // For now, mark as processed to avoid repeated attempts
                await mark_email_as_sent(contact.uuid, EMAIL_TEMPLATES.WELCOME_RESERVATION)
            } else {
                // Send standard welcome email
                await send_welcome_email(contact.email)
                await mark_email_as_sent(contact.uuid, EMAIL_TEMPLATES.WELCOME)

                console.log(`✅ Sent welcome email to ${contact.email}`)
            }

            // Add a small delay between emails to avoid overwhelming the email service
            await sleep(1000) // 1 second delay
        } catch (error) {
            console.error(`❌ Failed to send welcome email to ${contact.email}:`, error)
        }
    }
}

/**
 * Get contacts eligible for welcome email
 *
 * Criteria:
 * - Subscribed to newsletter
 * - Haven't received welcome email yet
 * - Created at least 15 minutes ago (to allow funnel completion)
 */
async function get_eligible_contacts(): Promise<Contacts[]> {
    const cutoff_date = new Date(Date.now() - time_interval)

    const contacts = await sql<Contacts[]>`
        SELECT * FROM contacts 
        WHERE 
            -- Must be subscribed to newsletter
            subscriptions @> ARRAY[${ContactSubscriptions.newsletter}]::contact_subscriptions[]
            -- Must not have received welcome email yet
            AND (
                sent_emails IS NULL 
                OR NOT (
                    sent_emails @> ARRAY[${EMAIL_TEMPLATES.WELCOME}]::text[]
                    OR sent_emails @> ARRAY[${EMAIL_TEMPLATES.WELCOME_RESERVATION}]::text[]
                )
            )
            -- Must have been created at least the specified time ago
            AND created_date < ${cutoff_date}
        ORDER BY created_date ASC
        LIMIT 50 -- Process max 50 contacts per run to avoid overwhelming
    `

    return contacts
}

/**
 * Mark email as sent for a contact
 * Updates the sent_emails array to track which emails have been sent
 * @param contact_uuid Contact UUID
 * @param email_template Email template identifier
 */
async function mark_email_as_sent(contact_uuid: string, email_template: string): Promise<void> {
    // First get the current contact to access current sent_emails
    const contacts = await sql<Contacts[]>`
        SELECT uuid, sent_emails FROM contacts 
        WHERE uuid = ${contact_uuid}
        LIMIT 1
    `

    if (contacts.length === 0) {
        throw new Error(`Contact not found: ${contact_uuid}`)
    }

    const contact = contacts[0]
    const current_sent_emails = contact.sent_emails || []
    const updated_sent_emails = [...current_sent_emails, email_template]

    // Update using sql.update following project patterns
    const updated_contacts = await sql.update<Contacts[]>('contacts', [
        {
            uuid: contact_uuid,
            sent_emails: updated_sent_emails,
        },
    ])

    if (updated_contacts.length === 0) {
        throw new Error(`Failed to update contact: ${contact_uuid}`)
    }
}

// TODO: Implement welcome email for reservation customers
// async function send_welcome_email_reservation(contact_email: string): Promise<void> {
//     // This will be implemented later with a different template
//     // Similar to send_welcome_email but with reservation-specific content
//     // Use EMAIL_TEMPLATES.WELCOME_RESERVATION for tracking
//     console.log(`📝 TODO: Implement welcome_email_reservation for ${contact_email}`)
// }

/**
 * Utility function to add delay between operations
 * @param ms Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
