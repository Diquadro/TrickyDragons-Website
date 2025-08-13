import { z } from 'zod'

// SMTP2GO Event Types (based on official documentation)
export const smtp2go_event_type_enum = z.enum([
    'processed',
    'delivered',
    'open',
    'click',
    'bounce',
    'spam',
    'unsubscribe',
    'resubscribe',
    'reject',
])

// Base SMTP2GO event schema - Simplified and linear approach
// Handles all event types with a single flexible schema
export const smtp2go_base_event_schema = z.object({
    event: smtp2go_event_type_enum,

    // Core identification fields (always present)
    email_id: z.string(),
    id: z.string(),

    // Email addressing fields - flexible handling
    rcpt: z.string().email().optional(), // May be missing in processed events
    sender: z.string().optional(),
    from: z.string().optional(),
    from_address: z.string().optional(),
    from_name: z.string().optional(),
    recipients: z.union([z.string(), z.array(z.string())]).optional(), // Used when rcpt is missing

    // Timing fields (flexible string handling)
    time: z.string(), // UTC timestamp
    sendtime: z.string().optional(),
    'opened-at': z.string().optional(),
    'clicked-at': z.string().optional(),

    // Email content fields
    subject: z.string().optional(),
    'Message-Id': z.string().optional(),
    'message-id': z.string().optional(),

    // Custom headers (our tracking)
    'X-Category': z.string().optional(),

    // Server response fields
    message: z.string().optional(),
    context: z.string().optional(),
    host: z.string().optional(),
    auth: z.string().optional(),

    // Event-specific fields (all optional for flexibility)
    bounce: z.enum(['hard', 'soft']).optional(),
    url: z.string().optional(), // For click events
    'user-agent': z.string().optional(),
    'read-secs': z.union([z.number(), z.string().transform(Number)]).optional(),
    client: z.string().optional(),
    'client-device': z.string().optional(),
    'client-os': z.string().optional(),

    // Geo IP fields
    'geoip-continent': z.string().optional(),
    'geoip-country': z.string().optional(),
    'geoip-city': z.string().optional(),
    srchost: z.string().optional(),
}).passthrough() // Allow additional custom headers
// Simplified approach: Use only the base schema for all events
// This eliminates complex discriminated unions while maintaining type safety

// SMTP2GO sends single events as objects (not arrays like SendGrid)
export const smtp2go_webhook_request_schema = smtp2go_base_event_schema

// Export types - simplified to use base schema
export type Smtp2go_Event_Type = z.infer<typeof smtp2go_event_type_enum>
export type Smtp2go_Event = z.infer<typeof smtp2go_base_event_schema>
export type Smtp2go_Webhook_Request = z.infer<typeof smtp2go_webhook_request_schema>

// Specific event types for type-safe handling (all use base schema)
export type Smtp2go_Processed_Event = Smtp2go_Event & { event: 'processed' }
export type Smtp2go_Delivered_Event = Smtp2go_Event & { event: 'delivered' }
export type Smtp2go_Open_Event = Smtp2go_Event & { event: 'open' }
export type Smtp2go_Click_Event = Smtp2go_Event & { event: 'click' }
export type Smtp2go_Bounce_Event = Smtp2go_Event & { event: 'bounce' }
export type Smtp2go_Spam_Event = Smtp2go_Event & { event: 'spam' }
export type Smtp2go_Unsubscribe_Event = Smtp2go_Event & { event: 'unsubscribe' }
export type Smtp2go_Resubscribe_Event = Smtp2go_Event & { event: 'resubscribe' }
export type Smtp2go_Reject_Event = Smtp2go_Event & { event: 'reject' }

// Validation functions - simplified
export function validate_smtp2go_request(data: unknown): Smtp2go_Event {
    return smtp2go_webhook_request_schema.parse(data)
}

export function validate_smtp2go_event(event: unknown): Smtp2go_Event {
    return smtp2go_base_event_schema.parse(event)
}