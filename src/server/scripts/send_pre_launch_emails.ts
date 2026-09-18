import dotenv from 'dotenv'

// Must run before any dynamic import in main() below - both '@server/models/postgres_client'
// (throws if PG_URI is missing) and '@shared/constants/emails.constants' (creates all
// nodemailer transporters, including Ethereal's auth, at module load time) read process.env
// as soon as they're imported. Everything that touches either of those, directly or
// transitively, has to be loaded dynamically inside main() - AFTER this call - not via a
// static top-level import, otherwise it evaluates before dotenv has populated process.env.
// Tries the local .env, then Render's Secret File path (/etc/secrets/.env).
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

import Contacts from '@shared/schemas/database/public/Contacts'
import ContactStatus from '@shared/schemas/database/public/ContactStatus'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'

/**
 * One-off script to send the pre-launch announcement email to newsletter subscribers.
 *
 * Segments:
 * - non_vip -> contacts with status = lead  -> pre_launch_non_vip_1
 * - vip     -> contacts with status = prospect -> pre_launch_vip_1
 *
 * Not a cron: this is meant to be run once, on demand, when the launch is announced.
 * Safe to re-run: eligibility excludes contacts who already have the template in
 * `sent_emails`, so a second run (or a retry after a partial failure) only reaches
 * contacts that haven't received it yet.
 *
 * The script loads its own .env (locally, or Render's /etc/secrets/.env Secret File
 * when run from the Render Shell) - no --env-file flag needed.
 *
 * Usage:
 *   npx tsx src/server/scripts/send_pre_launch_emails.ts non_vip [--dry-run] [--delay-ms=100]
 *   npx tsx src/server/scripts/send_pre_launch_emails.ts vip [--dry-run] [--delay-ms=100]
 *
 * --delay-ms controls the pause between sends (default 100ms = ~10 emails/sec).
 * On a transient send failure, the contact is retried a couple of times with backoff
 * before being counted as failed - and since eligibility excludes already-sent contacts,
 * simply re-running the script later picks up anyone that still failed.
 */

type Segment = 'non_vip' | 'vip'
type SqlClient = typeof import('@server/models/postgres_client').sql

const MAX_RETRIES = 2
const RETRY_BACKOFF_MS = 3000

async function main() {
    // Loaded lazily (after dotenv.config() above) so that every env-var-sensitive module
    // - the DB client and the email templates/transporters - sees the env vars regardless
    // of where they came from.
    const { sql } = await import('@server/models/postgres_client')
    const { mark_email_as_sent } = await import('@server/services/email_tracking_service')
    const { send_pre_launch_non_vip_1_email } = await import(
        '@shared/templates/emails/pre_launch_non_vip_1/pre_launch_non_vip_1'
    )
    const { send_pre_launch_vip_1_email } = await import(
        '@shared/templates/emails/pre_launch_vip_1/pre_launch_vip_1'
    )
    const { EMAIL_TEMPLATES } = await import('@shared/constants/emails.constants')

    const segment_config: Record<
        Segment,
        {
            status: ContactStatus
            template: string
            send_email: (contact_email: string) => Promise<unknown>
        }
    > = {
        non_vip: {
            status: ContactStatus.lead,
            template: EMAIL_TEMPLATES.PRE_LAUNCH_NON_VIP_1,
            send_email: send_pre_launch_non_vip_1_email,
        },
        vip: {
            status: ContactStatus.prospect,
            template: EMAIL_TEMPLATES.PRE_LAUNCH_VIP_1,
            send_email: send_pre_launch_vip_1_email,
        },
    }

    try {
        const segment_arg = process.argv[2] as Segment | undefined
        const dry_run = process.argv.includes('--dry-run')
        const delay_arg = process.argv.find((arg) => arg.startsWith('--delay-ms='))
        const delay_ms = delay_arg ? Number(delay_arg.split('=')[1]) : 100

        if (!segment_arg || !(segment_arg in segment_config)) {
            console.error(
                'Usage: tsx ... src/server/scripts/send_pre_launch_emails.ts <non_vip|vip> [--dry-run] [--delay-ms=100]',
            )
            process.exit(1)
        }

        if (!Number.isFinite(delay_ms) || delay_ms < 0) {
            console.error(`Invalid --delay-ms value: ${delay_arg}`)
            process.exit(1)
        }

        const config = segment_config[segment_arg]
        const eligible_contacts = await get_eligible_contacts(sql, config.status, config.template)

        console.log(
            `📧 Found ${eligible_contacts.length} contacts eligible for ${config.template} (segment: ${segment_arg}, delay: ${delay_ms}ms)`,
        )

        if (dry_run) {
            eligible_contacts.forEach((contact) => console.log(`  - ${contact.email}`))
            console.log('\n🔎 Dry run: no email sent, no contact marked as sent.')
            return
        }

        let sent = 0
        let failed = 0

        for (const contact of eligible_contacts) {
            try {
                await send_with_retry(() => config.send_email(contact.email), contact.email)
                await mark_email_as_sent(contact.uuid, config.template)

                sent++
                console.log(
                    `✅ Sent ${config.template} to ${contact.email} (${sent}/${eligible_contacts.length})`,
                )
            } catch (error) {
                failed++
                console.error(`❌ Failed to send ${config.template} to ${contact.email}:`, error)
            }

            await sleep(delay_ms)
        }

        console.log(`\n✅ Send complete: ${sent} sent, ${failed} failed (segment: ${segment_arg})`)
    } finally {
        await sql.end()
    }
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

/**
 * Get contacts eligible for a pre-launch email:
 * - Subscribed to newsletter
 * - Matching status for the segment (lead for non-vip, prospect for vip)
 * - Haven't already received this template
 *
 * No `source` filter and no creation-date cutoff on purpose: unlike the welcome-email
 * crons, this is a one-off send meant to reach everyone eligible right now, including
 * contacts bulk-imported from external campaigns.
 */
async function get_eligible_contacts(
    sql: SqlClient,
    status: ContactStatus,
    template: string,
): Promise<Contacts[]> {
    const contacts = await sql<Contacts[]>`
        SELECT * FROM contacts
        WHERE
            subscriptions @> ARRAY[${ContactSubscriptions.newsletter}]::contact_subscriptions[]
            AND status = ${status}
            AND NOT (COALESCE(sent_emails, ARRAY[]::text[]) @> ARRAY[${template}]::text[])
        ORDER BY created_date ASC
    `

    return contacts
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

main().catch((error) => {
    console.error('❌ Send script failed:', error)
    process.exit(1)
})
