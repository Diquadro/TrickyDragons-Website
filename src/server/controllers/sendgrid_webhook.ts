import { Request, Response } from 'express'
import {
    validate_sendgrid_request,
    type Sendgrid_Event,
    type Sendgrid_Processed_Event,
    type Sendgrid_Deferred_Event,
    type Sendgrid_Delivered_Event,
    type Sendgrid_Open_Event,
    type Sendgrid_Click_Event,
    type Sendgrid_Bounce_Event,
    type Sendgrid_Dropped_Event,
    type Sendgrid_Spamreport_Event,
    type Sendgrid_Unsubscribe_Event,
    type Sendgrid_Group_Unsubscribe_Event,
    type Sendgrid_Group_Resubscribe_Event,
} from '@shared/validations/sendgrid_webhook.validation'
import { HTTP_STATUS } from '@shared/constants/app.constants'

/**
 * SendGrid Event Webhook Controller
 *
 * WEBHOOK PECULIARITY: SendGrid sends events as JSON arrays via POST.
 * Unlike internal APIs, webhook responses don't need structured JSON - just HTTP status.
 */
export async function sendgrid_webhook(req: Request, res: Response): Promise<void> {
    console.log('📨 SendGrid webhook received')

    // Guard: Validate request body structure
    const validated_events = validate_sendgrid_request(req.body)

    console.log(`✅ Validated ${validated_events.length} SendGrid events`)

    // Guard: Handle empty events array
    if (validated_events.length === 0) {
        console.log('⚠️ No events in SendGrid webhook payload')
        res.sendStatus(HTTP_STATUS.OK)
        return
    }

    // Process events immediately (synchronous for webhook reliability)
    for (const event of validated_events) {
        await process_sendgrid_event(event)
    }

    // SUCCESS: Webhook processed
    res.sendStatus(HTTP_STATUS.OK)
    // REQUEST ENDS HERE

    console.log('✅ SendGrid webhook processing completed')
}

/**
 * Process individual SendGrid event with type-safe handling
 */
async function process_sendgrid_event(event: Sendgrid_Event): Promise<void> {
    const { event: event_type, email, timestamp, category, environment, template } = event

    console.log('📧 Processing SendGrid event:', {
        type: event_type,
        email,
        timestamp: new Date(timestamp * 1000).toISOString(),
        category,
        tracking: { environment, template },
    })

    // Type-safe event processing using separate functions
    switch (event.event) {
        case 'processed':
            await handle_processed_event(event as Sendgrid_Processed_Event)
            break
        case 'deferred':
            await handle_deferred_event(event as Sendgrid_Deferred_Event)
            break
        case 'delivered':
            await handle_delivered_event(event as Sendgrid_Delivered_Event)
            break
        case 'open':
            await handle_open_event(event as Sendgrid_Open_Event)
            break
        case 'click':
            await handle_click_event(event as Sendgrid_Click_Event)
            break
        case 'bounce':
            await handle_bounce_event(event as Sendgrid_Bounce_Event)
            break
        case 'dropped':
            await handle_dropped_event(event as Sendgrid_Dropped_Event)
            break
        case 'spamreport':
            await handle_spamreport_event(event as Sendgrid_Spamreport_Event)
            break
        case 'unsubscribe':
            await handle_unsubscribe_event(event as Sendgrid_Unsubscribe_Event)
            break
        case 'group_unsubscribe':
            await handle_group_unsubscribe_event(event as Sendgrid_Group_Unsubscribe_Event)
            break
        case 'group_resubscribe':
            await handle_group_resubscribe_event(event as Sendgrid_Group_Resubscribe_Event)
            break
        default:
            console.log('❓ Unknown SendGrid event type:', event)
            break
    }
}

// Event handler functions with specific types
async function handle_processed_event(event: Sendgrid_Processed_Event): Promise<void> {
    console.log('⚙️ Email processed', {
        email: event.email,
        category: event.category,
        tracking: { environment: event.environment, template: event.template },
    })
    // TODO: Log email processing
}

async function handle_deferred_event(event: Sendgrid_Deferred_Event): Promise<void> {
    console.log('⏳ Email deferred', {
        email: event.email,
        response: event.response,
        attempt: event.attempt,
        tracking: { environment: event.environment, template: event.template },
    })
    // TODO: Handle email deferral
}

async function handle_delivered_event(event: Sendgrid_Delivered_Event): Promise<void> {
    console.log('📬 Email delivered successfully', {
        email: event.email,
        response: event.response,
        tracking: { environment: event.environment, template: event.template },
    })
    // TODO: Update database with delivery status
}

async function handle_open_event(event: Sendgrid_Open_Event): Promise<void> {
    console.log('👀 Email opened', {
        email: event.email,
        userAgent: event.useragent,
        ip: event.ip,
        tracking: { environment: event.environment, template: event.template },
    })
    // TODO: Track email open analytics
}

async function handle_click_event(event: Sendgrid_Click_Event): Promise<void> {
    console.log('🖱️ Email link clicked', {
        email: event.email,
        url: event.url,
        userAgent: event.useragent,
        tracking: { environment: event.environment, template: event.template },
    })
    // TODO: Track click analytics
}

async function handle_bounce_event(event: Sendgrid_Bounce_Event): Promise<void> {
    console.log('⚠️ Email bounced', {
        email: event.email,
        reason: event.reason,
        status: event.status,
        type: event.type,
        tracking: { environment: event.environment, template: event.template },
    })
    // TODO: Handle bounce management
}

async function handle_dropped_event(event: Sendgrid_Dropped_Event): Promise<void> {
    console.log('🚫 Email dropped', {
        email: event.email,
        reason: event.reason,
        status: event.status,
        tracking: { environment: event.environment, template: event.template },
    })
    // TODO: Handle dropped email logic
}

async function handle_spamreport_event(event: Sendgrid_Spamreport_Event): Promise<void> {
    console.log('🚨 Spam report received', {
        email: event.email,
        tracking: { environment: event.environment, template: event.template },
    })
    // TODO: Handle spam reports
}

async function handle_unsubscribe_event(event: Sendgrid_Unsubscribe_Event): Promise<void> {
    console.log('✋ User unsubscribed', {
        email: event.email,
        tracking: { environment: event.environment, template: event.template },
    })
    // TODO: Handle unsubscribe logic
}

async function handle_group_unsubscribe_event(event: Sendgrid_Group_Unsubscribe_Event): Promise<void> {
    console.log('✋ Group unsubscribe', {
        email: event.email,
        asm_group_id: event.asm_group_id,
        url: event.url,
        tracking: { environment: event.environment, template: event.template },
    })
    // TODO: Handle group unsubscribe
}

async function handle_group_resubscribe_event(event: Sendgrid_Group_Resubscribe_Event): Promise<void> {
    console.log('🔄 Group resubscribe', {
        email: event.email,
        asm_group_id: event.asm_group_id,
        url: event.url,
        tracking: { environment: event.environment, template: event.template },
    })
    // TODO: Handle group resubscribe
}
