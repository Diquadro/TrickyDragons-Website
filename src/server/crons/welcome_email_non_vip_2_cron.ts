import { CronJob } from 'cron'
import { sql } from '@server/models/postgres_client'
import { send_welcome_non_vip_2_email } from '@shared/templates/emails/welcome_email_non_vip_2/welcome_email_non_vip_2'
import { EMAIL_TEMPLATES } from '@shared/constants/emails.constants'
import Contacts from '@shared/schemas/database/public/Contacts'
import { ENV, API, STRIPE } from '@shared/constants/app.constants'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'

/**
 * Welcome Email Non-VIP #2 Cron Job
 *
 * Sends second welcome email to newsletter subscribers who haven't purchased a reservation
 * and haven't opened the first welcome email after the specified delay.
 *
 * Logic:
 * - Subscribed to newsletter
 * - NO reservation purchase (not in paid orders)
 * - Already sent welcome_non_vip_1
 * - Haven't sent welcome_non_vip_2 yet
 * - First email was delivered at least [EMAIL_DELAY] ago
 * - First email was NOT opened (no SMTP2GO_EMAIL_OPENED action)
 *
 * Timing: Every 2 minutes (dev/local) or 10 minutes (production)
 */

// Development: 2 minutes delay, check every 2 minutes
// Production: 24 hours delay, check every 10 minutes
const EMAIL_DELAY = ENV.DEVELOPMENT ? 2 * 60 * 1000 : 24 * 60 * 60 * 1000 // 2min vs 24h
const CRON_INTERVAL = ENV.PRODUCTION ? '*/10 * * * *' : '*/2 * * * *' // 10min vs 2min

export const welcome_email_non_vip_2_cron = new CronJob(
    CRON_INTERVAL,
    async () => {
        console.log('🕒 Running welcome_email_non_vip_2 cron job...')

        try {
            await process_welcome_non_vip_2_emails()
        } catch (error) {
            console.error('❌ Error in welcome_email_non_vip_2 cron job:', error)
        }
    },
    null, // onComplete callback
    false, // start immediately
    'Europe/Rome', // timezone
)

/**
 * Main processing function for welcome non-VIP #2 emails
 */
export async function process_welcome_non_vip_2_emails() {
    const eligible_contacts = await get_eligible_contacts()

    console.log(`📧 Found ${eligible_contacts.length} contacts eligible for welcome_non_vip_2 email`)

    for (const contact of eligible_contacts) {
        try {
            await send_welcome_non_vip_2_email(contact.email)
            await mark_email_as_sent(contact.uuid, EMAIL_TEMPLATES.WELCOME_NON_VIP_2)

            console.log(`✅ Sent welcome_non_vip_2 email to ${contact.email}`)

            // Small delay between emails
            await sleep(1000)
        } catch (error) {
            console.error(`❌ Failed to send welcome_non_vip_2 email to ${contact.email}:`, error)
        }
    }
}

/**
 * Get contacts eligible for welcome_non_vip_2 email
 *
 * Criteria:
 * - Subscribed to newsletter
 * - NO reservation purchase (not in paid orders)
 * - Already sent welcome_non_vip_1
 * - Haven't sent welcome_non_vip_2 yet
 * - First email was delivered at least EMAIL_DELAY ago
 * - First email was NOT opened (no SMTP2GO_EMAIL_OPENED action)
 */
async function get_eligible_contacts(): Promise<Contacts[]> {
    const cutoff_date = new Date(Date.now() - EMAIL_DELAY)

    const contacts = await sql<Contacts[]>`
        SELECT c.* FROM contacts c
        WHERE 
            -- Must be subscribed to newsletter
            c.subscriptions @> ARRAY[${ContactSubscriptions.newsletter}]::contact_subscriptions[]
            
            -- Must NOT have reservation (not in paid orders for "Tricky Dragons Reservation")
            AND c.uuid NOT IN (
                SELECT DISTINCT contact_uuid 
                FROM orders 
                WHERE status = 'paid'
                AND line_items::text LIKE '%' || ${STRIPE.PRODUCTS.TRICKY_DRAGONS_RESERVATION} || '%'
                AND contact_uuid IS NOT NULL
            )
            
            -- Must have received welcome_non_vip_1 but not welcome_non_vip_2
            AND c.sent_emails @> ARRAY[${EMAIL_TEMPLATES.WELCOME_NON_VIP_1}]::text[]
            AND (
                c.sent_emails IS NULL 
                OR NOT c.sent_emails @> ARRAY[${EMAIL_TEMPLATES.WELCOME_NON_VIP_2}]::text[]
            )
            
            -- Must have NOT opened the first email (no open action)
            AND NOT EXISTS (
                SELECT 1 FROM actions a 
                WHERE a.contact_uuid = c.uuid 
                  AND a.action = ${API.EVENTS.ACTIONS.SMTP2GO_EMAIL_OPENED}
                  AND a.details->>'category' = ${EMAIL_TEMPLATES.WELCOME_NON_VIP_1}
            )
            
            -- First email must have been delivered at least EMAIL_DELAY ago
            AND EXISTS (
                SELECT 1 FROM actions a2
                WHERE a2.contact_uuid = c.uuid
                  AND a2.action = ${API.EVENTS.ACTIONS.SMTP2GO_EMAIL_DELIVERED} 
                  AND a2.details->>'category' = ${EMAIL_TEMPLATES.WELCOME_NON_VIP_1}
                  AND a2.occurred_at < ${cutoff_date}
            )
            
        ORDER BY c.created_date ASC
        LIMIT 50 -- Process max 50 contacts per run
    `

    return contacts
}

/**
 * Mark email as sent for a contact
 */
async function mark_email_as_sent(contact_uuid: string, email_template: string): Promise<void> {
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

    await sql.update<Contacts[]>('contacts', [
        {
            uuid: contact_uuid,
            sent_emails: updated_sent_emails,
        },
    ])
}

/**
 * Utility function to add delay between operations
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
