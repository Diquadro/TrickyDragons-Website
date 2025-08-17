import { CronJob } from 'cron'
import { sql } from '@server/models/postgres_client'
import { send_welcome_vip_1_email } from '@shared/templates/emails/welcome_email_vip_1/welcome_email_vip_1'
import { EMAIL_TEMPLATES } from '@shared/constants/emails.constants'
import Contacts from '@shared/schemas/database/public/Contacts'
import { ENV, API, STRIPE } from '@shared/constants/app.constants'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'

/**
 * Welcome Email VIP #1 Cron Job
 *
 * Sends first welcome email to newsletter subscribers who have purchased a reservation.
 *
 * Logic:
 * - Subscribed to newsletter
 * - HAS reservation purchase (exists in paid orders)
 * - Haven't received welcome_vip_1 yet
 * - Created at least [EMAIL_DELAY] ago
 *
 * Timing: Every 2 minutes (dev/local) or 10 minutes (production)
 */

// Development: 2 minutes delay, check every 2 minutes
// Production: 24 hours delay, check every 10 minutes
const EMAIL_DELAY = ENV.DEVELOPMENT ? 2 * 60 * 1000 : 24 * 60 * 60 * 1000 // 2min vs 24h
const CRON_INTERVAL = ENV.PRODUCTION ? '*/10 * * * *' : '*/2 * * * *' // 10min vs 2min

export const welcome_email_vip_1_cron = new CronJob(
    CRON_INTERVAL,
    async () => {
        console.log('🕒 Running welcome_email_vip_1 cron job...')

        try {
            await process_welcome_vip_1_emails()
        } catch (error) {
            console.error('❌ Error in welcome_email_vip_1 cron job:', error)
        }
    },
    null, // onComplete callback
    false, // start immediately
    'Europe/Rome', // timezone
)

/**
 * Main processing function for welcome VIP #1 emails
 */
export async function process_welcome_vip_1_emails() {
    const eligible_contacts = await get_eligible_contacts()

    console.log(`📧 Found ${eligible_contacts.length} contacts eligible for welcome_vip_1 email`)

    for (const contact of eligible_contacts) {
        try {
            // Use first_name from contact, fallback to "Friend"
            const first_name = contact.first_name || 'Friend'

            await send_welcome_vip_1_email(contact.email, first_name)
            await mark_email_as_sent(contact.uuid, EMAIL_TEMPLATES.WELCOME_VIP_1)

            console.log(`✅ Sent welcome_vip_1 email to ${contact.email} (${first_name})`)

            // Small delay between emails
            await sleep(1000)
        } catch (error) {
            console.error(`❌ Failed to send welcome_vip_1 email to ${contact.email}:`, error)
        }
    }
}

/**
 * Get contacts eligible for welcome_vip_1 email
 *
 * Criteria:
 * - Subscribed to newsletter
 * - HAS reservation purchase (exists in paid orders)
 * - Haven't received welcome_vip_1 yet
 * - Created at least EMAIL_DELAY ago
 */
async function get_eligible_contacts(): Promise<Contacts[]> {
    const cutoff_date = new Date(Date.now() - EMAIL_DELAY)

    const contacts = await sql<Contacts[]>`
        SELECT c.* FROM contacts c
        WHERE 
            -- Must be subscribed to newsletter
            c.subscriptions @> ARRAY[${ContactSubscriptions.newsletter}]::contact_subscriptions[]
            
            -- Must HAVE reservation (exists in paid orders for "Tricky Dragons Reservation")
            AND c.uuid IN (
                SELECT DISTINCT contact_uuid 
                FROM orders 
                WHERE status = 'paid'
                AND line_items::text LIKE '%' || ${STRIPE.PRODUCTS.TRICKY_DRAGONS_RESERVATION} || '%'
                AND contact_uuid IS NOT NULL
            )
            
            -- Must not have received welcome_vip_1 yet
            AND (
                c.sent_emails IS NULL 
                OR NOT c.sent_emails @> ARRAY[${EMAIL_TEMPLATES.WELCOME_VIP_1}]::text[]
            )
            
            -- Must have been created at least EMAIL_DELAY ago
            AND c.created_date < ${cutoff_date}
            
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
