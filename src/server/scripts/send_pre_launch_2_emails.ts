import dotenv from 'dotenv'

// Must run before any dynamic import in main() below - see send_pre_launch_emails.ts for why
// (both the DB client and the email transporters read process.env at their own import time).
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

import Contacts from '@shared/schemas/database/public/Contacts'
import ContactStatus from '@shared/schemas/database/public/ContactStatus'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'

/**
 * One-off script to send the second pre-launch email (pre_launch_non_vip_2 / pre_launch_vip_2)
 * to both segments together, in a single combined send queue.
 *
 * Unlike send_pre_launch_emails.ts (one segment per run), this script builds one queue mixing
 * both non-vip (status = lead) and vip (status = prospect) contacts, ordered:
 *   1. Contacts who opened the corresponding first pre-launch email (pre_launch_non_vip_1 /
 *      pre_launch_vip_1) - warmer relationship, better odds of a second open.
 *   2. Everyone else, newest subscriber first.
 * Newsletter subscription is re-checked fresh at run time (some contacts unsubscribe between
 * campaigns), and non-vip contacts still go through the same "authentic subscribe" check used
 * for the first non-vip send (bulk-imported OR a real subscribe_contact action with a
 * utm_source) - vip contacts already proved themselves with a real $1 payment.
 *
 * Safe to re-run: eligibility excludes contacts who already have the template in `sent_emails`.
 *
 * Usage:
 *   npx tsx src/server/scripts/send_pre_launch_2_emails.ts [--dry-run] [--delay-ms=12000]
 *
 * --delay-ms controls the pause between sends (default 12000ms = one email every 12s = ~300/hour).
 */

type SqlClient = typeof import('@server/models/postgres_client').sql
type Contact_With_Open = Contacts & { opened_previous: boolean }

interface Send_Job {
    contact: Contact_With_Open
    template: string
    send_email: (contact_email: string) => Promise<unknown>
}

const MAX_RETRIES = 2
const RETRY_BACKOFF_MS = 3000

// Exact `source` value used by the one-off CSV import for this campaign
// (src/server/scripts/import_contacts.ts) - not the generic 'migration' string.
const MIGRATION_SOURCE = '2026_09_18_Migration'

async function main() {
    const { sql } = await import('@server/models/postgres_client')
    const { mark_email_as_sent } = await import('@server/services/email_tracking_service')
    const { send_pre_launch_non_vip_2_email } = await import(
        '@shared/templates/emails/pre_launch_non_vip_2/pre_launch_non_vip_2'
    )
    const { send_pre_launch_vip_2_email } = await import(
        '@shared/templates/emails/pre_launch_vip_2/pre_launch_vip_2'
    )
    const { EMAIL_TEMPLATES } = await import('@shared/constants/emails.constants')

    try {
        const dry_run = process.argv.includes('--dry-run')
        const delay_arg = process.argv.find((arg) => arg.startsWith('--delay-ms='))
        const delay_ms = delay_arg ? Number(delay_arg.split('=')[1]) : 12000

        if (!Number.isFinite(delay_ms) || delay_ms < 0) {
            console.error(`Invalid --delay-ms value: ${delay_arg}`)
            process.exit(1)
        }

        const non_vip_contacts = await get_segment_contacts(
            sql,
            ContactStatus.lead,
            EMAIL_TEMPLATES.PRE_LAUNCH_NON_VIP_2,
            EMAIL_TEMPLATES.PRE_LAUNCH_NON_VIP_1,
            true,
        )
        const vip_contacts = await get_segment_contacts(
            sql,
            ContactStatus.prospect,
            EMAIL_TEMPLATES.PRE_LAUNCH_VIP_2,
            EMAIL_TEMPLATES.PRE_LAUNCH_VIP_1,
            false,
        )

        const jobs: Send_Job[] = [
            ...non_vip_contacts.map((contact) => ({
                contact,
                template: EMAIL_TEMPLATES.PRE_LAUNCH_NON_VIP_2,
                send_email: send_pre_launch_non_vip_2_email,
            })),
            ...vip_contacts.map((contact) => ({
                contact,
                template: EMAIL_TEMPLATES.PRE_LAUNCH_VIP_2,
                send_email: send_pre_launch_vip_2_email,
            })),
        ]

        // Opened the previous email first, then newest subscriber first within each group.
        jobs.sort((a, b) => {
            if (a.contact.opened_previous !== b.contact.opened_previous) {
                return a.contact.opened_previous ? -1 : 1
            }
            const a_time = a.contact.created_date ? new Date(a.contact.created_date).getTime() : 0
            const b_time = b.contact.created_date ? new Date(b.contact.created_date).getTime() : 0
            return b_time - a_time
        })

        console.log(
            `📧 Found ${jobs.length} contacts eligible (non_vip: ${non_vip_contacts.length}, vip: ${vip_contacts.length}, delay: ${delay_ms}ms)`,
        )

        if (dry_run) {
            jobs.forEach((job) =>
                console.log(
                    `  - ${job.contact.email} -> ${job.template} (opened previous: ${job.contact.opened_previous})`,
                ),
            )
            console.log('\n🔎 Dry run: no email sent, no contact marked as sent.')
            return
        }

        let sent = 0
        let failed = 0

        for (const job of jobs) {
            try {
                await send_with_retry(() => job.send_email(job.contact.email), job.contact.email)
                await mark_email_as_sent(job.contact.uuid, job.template)

                sent++
                console.log(`✅ Sent ${job.template} to ${job.contact.email} (${sent}/${jobs.length})`)
            } catch (error) {
                failed++
                console.error(`❌ Failed to send ${job.template} to ${job.contact.email}:`, error)
            }

            await sleep(delay_ms)
        }

        console.log(`\n✅ Send complete: ${sent} sent, ${failed} failed`)
    } finally {
        await sql.end()
    }
}

/**
 * Get contacts eligible for a segment's second pre-launch email:
 * - Subscribed to newsletter (checked fresh - some contacts unsubscribe between campaigns)
 * - Matching status for the segment
 * - Haven't already received `template`
 * - If `require_authentic_subscribe`: either bulk-imported (already vetted) or backed by a
 *   real subscribe_contact action with a utm_source
 *
 * Also computes `opened_previous`: whether the contact opened `previous_template`.
 */
async function get_segment_contacts(
    sql: SqlClient,
    status: ContactStatus,
    template: string,
    previous_template: string,
    require_authentic_subscribe: boolean,
): Promise<Contact_With_Open[]> {
    // Only ever comes from our own call sites (never user input), so it's safe to interpolate
    // directly - sql`` would otherwise quote it as a string literal.
    const authenticity_clause = require_authentic_subscribe
        ? sql`
            AND (
                source = ${MIGRATION_SOURCE}
                OR EXISTS (
                    SELECT 1 FROM actions a
                    WHERE a.contact_uuid = contacts.uuid
                      AND a.action LIKE '%subscribe_contact'
                      AND a.action NOT LIKE '%unsubscribe%'
                      AND a.utm_source IS NOT NULL
                )
            )
        `
        : sql``

    const contacts = await sql<Contact_With_Open[]>`
        SELECT
            contacts.*,
            EXISTS (
                SELECT 1 FROM actions a
                WHERE a.contact_uuid = contacts.uuid
                  AND a.action = 'v2_smtp2go_email_opened'
                  AND a.details->>'category' = ${previous_template}
            ) AS opened_previous
        FROM contacts
        WHERE
            subscriptions @> ARRAY[${ContactSubscriptions.newsletter}]::contact_subscriptions[]
            AND status = ${status}
            AND NOT (COALESCE(sent_emails, ARRAY[]::text[]) @> ARRAY[${template}]::text[])
            ${authenticity_clause}
    `

    return contacts
}

/**
 * Retries a transient send failure a couple of times with backoff before giving up.
 * Contacts that exhaust retries stay unmarked in `sent_emails`, so a later re-run of
 * the script will pick them up again.
 */
async function send_with_retry(send: () => Promise<unknown>, contact_email: string): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
        try {
            await send()
            return
        } catch (error) {
            if (attempt > MAX_RETRIES) throw error
            console.warn(
                `⚠️  Send to ${contact_email} failed (attempt ${attempt}/${MAX_RETRIES + 1}), retrying in ${RETRY_BACKOFF_MS}ms...`,
            )
            await sleep(RETRY_BACKOFF_MS)
        }
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

main().catch((error) => {
    console.error('❌ Send script failed:', error)
    process.exit(1)
})
