import { Request, Response } from 'express'
import { HTTP_STATUS, API, ENV } from '@shared/constants/app.constants'
import Contacts, { ContactsUuid } from '@shared/schemas/database/public/Contacts'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'
import { sql } from '@server/models/postgres_client'
import {
    validate_smtp2go_request,
    type Smtp2go_Event,
    type Smtp2go_Processed_Event,
    type Smtp2go_Delivered_Event,
    type Smtp2go_Open_Event,
    type Smtp2go_Click_Event,
    type Smtp2go_Bounce_Event,
    type Smtp2go_Spam_Event,
    type Smtp2go_Unsubscribe_Event,
    type Smtp2go_Resubscribe_Event,
    type Smtp2go_Reject_Event,
} from '@shared/validations/smtp2go_webhook.validation'
import { create_action } from '@server/services/create_action'
import { log_webhook_event } from '@server/services/log_webhook'

/**
 * SMTP2GO Event Webhook Controller
 *
 * WEBHOOK PECULIARITY: SMTP2GO sends events as single JSON objects via POST.
 * Basic Authentication is used for security.
 * Custom category tracking via X-Category header.
 */
export async function smtp2go_webhook(req: Request, res: Response) {
    try {
        // Guard: Verify Basic Authentication
        if (!verify_basic_auth(req)) {
            console.error('❌ SMTP2GO webhook authentication failed')

            // Log authentication error
            await log_webhook_event({
                webhook_source: 'smtp2go',
                request_method: req.method,
                request_url: req.originalUrl,
                request_headers: req.headers,
                request_body: req.body,
                processing_outcome: 'validation_error',
                processing_message: 'Basic authentication validation failed',
                error_details: { error: 'Authentication failed' },
                response_status: 401,
            })

            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Unauthorized' })
        }

        // Guard: Validate request body structure (single event object)
        const validated_event = validate_smtp2go_request(req.body)

        // Process the single event
        await process_smtp2go_event(validated_event, req)

        // SUCCESS: Webhook processed
        res.sendStatus(HTTP_STATUS.OK)
        // REQUEST ENDS HERE
    } catch (error) {
        console.error('❌ SMTP2GO webhook error:', error)

        // Log validation or processing error
        await log_webhook_event({
            webhook_source: 'smtp2go',
            request_method: req.method,
            request_url: req.originalUrl,
            request_headers: req.headers,
            request_body: req.body,
            processing_outcome: 'validation_error',
            processing_message: 'SMTP2GO webhook processing failed',
            error_details: { error: error },
            response_status: error instanceof Error && error.name === 'ZodError' ? 400 : 500,
        })

        // Return 400 for validation errors, 500 for others
        const status =
            error instanceof Error && error.name === 'ZodError'
                ? HTTP_STATUS.BAD_REQUEST
                : HTTP_STATUS.INTERNAL_SERVER_ERROR

        res.status(status).json({ error: 'Webhook processing failed' })
    }
}

/**
 * Process individual SMTP2GO event with type-safe handling and database logging
 */
async function process_smtp2go_event(event: Smtp2go_Event, req: Request): Promise<void> {
    const { event: event_type, rcpt, time, subject, recipients } = event
    const category = event['X-Category'] || 'unknown'

    // Normalize recipients to always be an array
    const recipient_emails = normalize_recipients(rcpt, recipients)

    // Create contact lookup map for all recipients
    const contact_map = await create_contact_map(recipient_emails)

    // Process each recipient separately
    for (const recipient_email of recipient_emails) {
        const contact = contact_map.get(recipient_email)

        if (!contact) {
            console.warn('⚠️ Contact not found for SMTP2GO event', {
                event_type: event_type,
                recipient: recipient_email,
                category: category,
            })

            // Log only the error case - contact not found
            await log_webhook_event({
                webhook_source: 'smtp2go',
                request_method: req.method,
                request_url: req.originalUrl,
                request_body: event,
                processing_outcome: 'contact_not_found',
                processing_message: `SMTP2GO ${event_type} event - contact not found: ${recipient_email}`,
                response_status: 200, // We still return 200 to the webhook sender
            })

            continue // Skip this recipient, continue with others
        }

        // Process event for this specific recipient
        try {
            await process_event_for_recipient(event, contact, recipient_email, category)
        } catch (error) {
            console.error('❌ Error processing SMTP2GO event for recipient:', error)

            // Log processing error for this specific recipient
            await log_webhook_event({
                webhook_source: 'smtp2go',
                request_method: req.method,
                request_url: req.originalUrl,
                request_body: event,
                processing_outcome: 'processing_error',
                processing_message: `Error processing SMTP2GO ${event_type} event for ${recipient_email}`,
                error_details: { error: error },
                contact_uuid: contact.uuid,
                response_status: 500,
            })
        }
    }
}

/**
 * Normalize recipients to always return an array of email addresses
 */
function normalize_recipients(rcpt?: string, recipients?: string | string[]): string[] {
    const emails: string[] = []

    console.log('Normalizing recipients:', { rcpt, recipients })

    // Add rcpt if present
    if (rcpt) {
        emails.push(rcpt)
    }

    // Add recipients if present
    if (recipients) {
        if (Array.isArray(recipients)) {
            emails.push(...recipients)
        } else {
            emails.push(recipients)
        }
    }

    // Remove duplicates and filter out empty strings
    return [...new Set(emails)].filter((email) => email && email.trim() !== '')
}

/**
 * Create a map of email -> contact for batch lookup
 */
async function create_contact_map(
    emails: string[],
): Promise<Map<string, { uuid: ContactsUuid; email: string }>> {
    const contact_map = new Map<string, { uuid: ContactsUuid; email: string }>()

    if (emails.length === 0) {
        return contact_map
    }

    try {
        // Batch lookup all contacts
        const contacts = await sql`
			SELECT uuid, email
			FROM contacts 
			WHERE email = ANY(${emails})
		`

        // Populate the map
        for (const contact of contacts) {
            contact_map.set(contact.email, {
                uuid: contact.uuid as ContactsUuid,
                email: contact.email,
            })
        }
    } catch (error) {
        console.error('Error in batch contact lookup:', error)
        throw error
    }

    return contact_map
}

/**
 * Process a specific event for a single recipient
 */
async function process_event_for_recipient(
    event: Smtp2go_Event,
    contact: { uuid: ContactsUuid; email: string },
    recipient_email: string,
    category: string,
): Promise<void> {
    switch (event.event) {
        case 'processed':
            await handle_processed_event(
                event as Smtp2go_Processed_Event,
                contact.uuid,
                recipient_email,
                category,
            )
            break
        case 'delivered':
            await handle_delivered_event(
                event as Smtp2go_Delivered_Event,
                contact.uuid,
                recipient_email,
                category,
            )
            break
        case 'open':
            await handle_open_event(event as Smtp2go_Open_Event, contact.uuid, recipient_email, category)
            break
        case 'click':
            await handle_click_event(event as Smtp2go_Click_Event, contact.uuid, recipient_email, category)
            break
        case 'bounce':
            await handle_bounce_event(event as Smtp2go_Bounce_Event, contact.uuid, recipient_email, category)
            break
        case 'spam':
            await handle_spam_event(event as Smtp2go_Spam_Event, contact.uuid, recipient_email, category)
            break
        case 'unsubscribe':
            await handle_unsubscribe_event(
                event as Smtp2go_Unsubscribe_Event,
                contact.uuid,
                recipient_email,
                category,
            )
            break
        case 'resubscribe':
            await handle_resubscribe_event(
                event as Smtp2go_Resubscribe_Event,
                contact.uuid,
                recipient_email,
                category,
            )
            break
        case 'reject':
            await handle_reject_event(event as Smtp2go_Reject_Event, contact.uuid, recipient_email, category)
            break
        default:
            console.warn('❓ Unknown SMTP2GO event type:', event.event)
    }
}

/**
 * Extract custom headers from the event (using passthrough fields)
 */
function extractCustomHeaders(event: any): Record<string, any> {
    const knownFields = new Set([
        'event',
        'email_id',
        'id',
        'rcpt',
        'sender',
        'from',
        'from_address',
        'from_name',
        'recipients',
        'time',
        'sendtime',
        'subject',
        'Message-Id',
        'message-id',
        'message',
        'context',
        'host',
        'auth',
        'bounce',
        'user-agent',
        'read-secs',
        'client',
        'client-device',
        'client-os',
        'geoip-continent',
        'geoip-country',
        'geoip-city',
        'srchost',
        'url',
        'X-Category',
        'opened-at',
        'clicked-at',
    ])

    const customHeaders: Record<string, any> = {}
    for (const [key, value] of Object.entries(event)) {
        if (!knownFields.has(key)) {
            customHeaders[key] = value
        }
    }

    return customHeaders
}

// Event handler functions with database integration
async function handle_processed_event(
    event: Smtp2go_Processed_Event,
    contact_uuid: ContactsUuid,
    recipient_email: string,
    category: string,
): Promise<void> {
    // Update contact sent_emails for processed events
    await update_contact_sent_emails(recipient_email, category)

    // Create action in database
    await create_action({
        action: API.EVENTS.ACTIONS.SMTP2GO_EMAIL_PROCESSED,
        contact_uuid: contact_uuid,
        endpoint: 'WEBHOOK - smtp2go',
        origin: 'smtp2go',
        occurred_at: new Date(),
        details: {
            recipient: recipient_email,
            email_id: event.email_id,
            subject: event.subject,
            category: category,
            auth: event.auth,
        },
        payload: event,
    })
}

async function handle_delivered_event(
    event: Smtp2go_Delivered_Event,
    contact_uuid: ContactsUuid,
    recipient_email: string,
    category: string,
): Promise<void> {
    // Create action in database
    await create_action({
        action: API.EVENTS.ACTIONS.SMTP2GO_EMAIL_DELIVERED,
        contact_uuid: contact_uuid,
        endpoint: 'WEBHOOK - smtp2go',
        origin: 'smtp2go',
        occurred_at: new Date(),
        details: {
            recipient: recipient_email,
            message: event.message,
            host: event.host,
            category: category,
        },
        payload: event,
    })
}

async function handle_open_event(
    event: Smtp2go_Open_Event,
    contact_uuid: ContactsUuid,
    recipient_email: string,
    category: string,
): Promise<void> {
    // Create action in database
    await create_action({
        action: API.EVENTS.ACTIONS.SMTP2GO_EMAIL_OPENED,
        contact_uuid: contact_uuid,
        endpoint: 'WEBHOOK - smtp2go',
        origin: 'smtp2go',
        occurred_at: new Date(),
        details: {
            recipient: recipient_email,
            user_agent: event['user-agent'],
            client: event.client,
            read_seconds: event['read-secs'],
            opened_at: event['opened-at'],
            category: category,
            geoip_country: event['geoip-country'],
            geoip_city: event['geoip-city'],
        },
        payload: event,
    })
}

async function handle_click_event(
    event: Smtp2go_Click_Event,
    contact_uuid: ContactsUuid,
    recipient_email: string,
    category: string,
): Promise<void> {
    // Create action in database
    await create_action({
        action: API.EVENTS.ACTIONS.SMTP2GO_EMAIL_CLICKED,
        contact_uuid: contact_uuid,
        endpoint: 'WEBHOOK - smtp2go',
        origin: 'smtp2go',
        occurred_at: new Date(),
        details: {
            recipient: recipient_email,
            url: event.url,
            user_agent: event['user-agent'],
            client: event.client,
            clicked_at: event['clicked-at'],
            category: category,
            geoip_country: event['geoip-country'],
            geoip_city: event['geoip-city'],
        },
        payload: event,
    })
}

async function handle_bounce_event(
    event: Smtp2go_Bounce_Event,
    contact_uuid: ContactsUuid,
    recipient_email: string,
    category: string,
): Promise<void> {
    console.warn('⚠️ Email bounced', {
        recipient: recipient_email,
        bounce_type: event.bounce,
        message: event.message,
        host: event.host,
        context: event.context,
        category: category,
        custom_headers: extractCustomHeaders(event),
    })

    // Create action in database
    await create_action({
        action: API.EVENTS.ACTIONS.SMTP2GO_EMAIL_BOUNCED,
        contact_uuid: contact_uuid,
        endpoint: 'WEBHOOK - smtp2go',
        origin: 'smtp2go',
        occurred_at: new Date(),
        details: {
            recipient: recipient_email,
            bounce_type: event.bounce,
            message: event.message,
            host: event.host,
            context: event.context,
            category: category,
        },
        payload: event,
    })

    // BUSINESS LOGIC: Remove newsletter subscription for bounced emails
    await remove_newsletter_subscription(contact_uuid, 'bounce')
}

async function handle_spam_event(
    event: Smtp2go_Spam_Event,
    contact_uuid: ContactsUuid,
    recipient_email: string,
    category: string,
): Promise<void> {
    console.warn('🚨 Spam report received', {
        recipient: recipient_email,
        category: category,
        custom_headers: extractCustomHeaders(event),
    })

    // Create action in database FIRST
    await create_action({
        action: API.EVENTS.ACTIONS.SMTP2GO_EMAIL_SPAM,
        contact_uuid: contact_uuid,
        endpoint: 'WEBHOOK - smtp2go',
        origin: 'smtp2go',
        occurred_at: new Date(),
        details: {
            recipient: recipient_email,
            category: category,
        },
        payload: event,
    })

    // BUSINESS LOGIC: Check if this is the second spam report for this contact
    const spam_count = await count_spam_actions(contact_uuid)

    if (spam_count >= 2) {
        console.warn(
            `🚨 Second spam report detected for contact ${contact_uuid} - removing newsletter subscription`,
        )
        await remove_newsletter_subscription(contact_uuid, 'spam')
    } else {
        console.warn(
            `🚨 First spam report for contact ${contact_uuid} - keeping subscription (count: ${spam_count})`,
        )
    }
}

async function handle_unsubscribe_event(
    event: Smtp2go_Unsubscribe_Event,
    contact_uuid: ContactsUuid,
    recipient_email: string,
    category: string,
): Promise<void> {
    // Create action in database
    await create_action({
        action: API.EVENTS.ACTIONS.SMTP2GO_EMAIL_UNSUBSCRIBED,
        contact_uuid: contact_uuid,
        endpoint: 'WEBHOOK - smtp2go',
        origin: 'smtp2go',
        occurred_at: new Date(),
        details: {
            recipient: recipient_email,
            category: category,
        },
        payload: event,
    })
}

async function handle_resubscribe_event(
    event: Smtp2go_Resubscribe_Event,
    contact_uuid: ContactsUuid,
    recipient_email: string,
    category: string,
): Promise<void> {
    // For now, we log this but don't have a specific action constant for resubscribe
    // Could be added to constants if needed
}

async function handle_reject_event(
    event: Smtp2go_Reject_Event,
    contact_uuid: ContactsUuid,
    recipient_email: string,
    category: string,
): Promise<void> {
    console.warn('🚫 Email rejected by SMTP2GO', {
        recipient: recipient_email,
        message: event.message,
        context: event.context,
        category: category,
        custom_headers: extractCustomHeaders(event),
    })

    // Create action in database
    await create_action({
        action: API.EVENTS.ACTIONS.SMTP2GO_EMAIL_REJECTED,
        contact_uuid: contact_uuid,
        endpoint: 'WEBHOOK - smtp2go',
        origin: 'smtp2go',
        occurred_at: new Date(),
        details: {
            recipient: recipient_email,
            message: event.message,
            context: event.context,
            category: category,
        },
        payload: event,
    })
}

/**
 * Verify SMTP2GO Basic Authentication
 */
function verify_basic_auth(req: Request): boolean {
    const authHeader = req.get('authorization')

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        console.warn('⚠️ Missing or invalid Authorization header')
        return false
    }

    // Extract credentials from Basic auth header
    const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8')
    const [username, password] = credentials.split(':')

    // Verify against environment variables
    let expectedUsername
    let expectedPassword

    if (ENV.PRODUCTION) {
        expectedUsername = process.env.SMTP2GO_WEBHOOK_USERNAME_PROD
        expectedPassword = process.env.SMTP2GO_WEBHOOK_PASSWORD_PROD
    } else {
        expectedUsername = process.env.SMTP2GO_WEBHOOK_USERNAME_PROD_SANDBOX
        expectedPassword = process.env.SMTP2GO_WEBHOOK_PASSWORD_PROD_SANDBOX
    }

    if (!expectedUsername || !expectedPassword) {
        console.error('❌ SMTP2GO webhook credentials not configured in environment')
        return false
    }

    const isValid = username === expectedUsername && password === expectedPassword

    if (!isValid) {
        console.error('❌ Invalid SMTP2GO webhook credentials')
    }

    return isValid
}

/**
 * Remove newsletter subscription from contact due to bounce/spam
 */
async function remove_newsletter_subscription(
    contact_uuid: ContactsUuid,
    reason: 'bounce' | 'spam',
): Promise<void> {
    try {
        // Get current contact with subscriptions
        const contacts = await sql`
			SELECT uuid, email, subscriptions
			FROM contacts 
			WHERE uuid = ${contact_uuid}
			LIMIT 1
		`

        if (contacts.length === 0) {
            console.error('❌ Contact not found for unsubscribe:', contact_uuid)
            return
        }

        const contact = contacts[0] as {
            uuid: ContactsUuid
            email: string
            subscriptions: ContactSubscriptions[] | null
        }
        const current_subscriptions = contact.subscriptions || []

        // Remove newsletter subscription if present
        const updated_subscriptions = current_subscriptions.filter(
            (sub) => sub !== ContactSubscriptions.newsletter,
        )

        // Only update if there was actually a newsletter subscription
        if (current_subscriptions.length !== updated_subscriptions.length) {
            await sql.update('contacts', [
                {
                    uuid: contact.uuid,
                    subscriptions: updated_subscriptions,
                },
            ])

            console.warn(`📤 Newsletter subscription removed due to ${reason}`, {
                contact_uuid: contact.uuid,
                email: contact.email,
                reason: reason,
                removed_subscription: ContactSubscriptions.newsletter,
                remaining_subscriptions: updated_subscriptions,
            })
        }
    } catch (error) {
        console.error('Error removing newsletter subscription:', error)
        throw error
    }
}

/**
 * Count spam actions for a contact to determine if we should unsubscribe
 */
async function count_spam_actions(contact_uuid: ContactsUuid): Promise<number> {
    try {
        const result = await sql`
			SELECT COUNT(*) as spam_count
			FROM actions 
			WHERE contact_uuid = ${contact_uuid}
			  AND action = ${API.EVENTS.ACTIONS.SMTP2GO_EMAIL_SPAM}
		`

        return parseInt(result[0].spam_count) || 0
    } catch (error) {
        console.error('Error counting spam actions:', error)
        throw error
    }
}

async function update_contact_sent_emails(email: string, sent_email: string) {
    try {
        // Get contact with sent_emails field
        const contacts = await sql`
			SELECT uuid, email, sent_emails
			FROM contacts 
			WHERE email = ${email}
			LIMIT 1
		`

        if (contacts.length === 0) {
            console.error('❌ Contact not found for sent_emails update:', email)
            return
        }

        const contact = contacts[0] as { uuid: ContactsUuid; email: string; sent_emails: string[] | null }

        // Update contact with new sent_email (avoid duplicates)
        const current_sent_emails = contact.sent_emails || []
        const updated_sent_emails = current_sent_emails.includes(sent_email)
            ? current_sent_emails
            : [sent_email, ...current_sent_emails]

        await sql.update('contacts', [
            {
                uuid: contact.uuid,
                sent_emails: updated_sent_emails,
            },
        ])
    } catch (error) {
        console.error('Error updating contact sent_emails:', error)
        throw error
    }
}
