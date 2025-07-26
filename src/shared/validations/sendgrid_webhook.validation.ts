import { z } from 'zod'

// SendGrid Event Types
export const sendgrid_event_type_enum = z.enum([
    'processed',
    'deferred',
    'delivered',
    'open',
    'click',
    'bounce',
    'dropped',
    'spamreport',
    'unsubscribe',
    'group_unsubscribe',
    'group_resubscribe',
])

// Base SendGrid event schema
// Note: SendGrid flattens unique_args as top-level properties in webhook events
export const sendgrid_base_event_schema = z.object({
    event: sendgrid_event_type_enum,
    email: z.string().email(),
    timestamp: z.number(),
    'smtp-id': z.string().optional(),
    sg_event_id: z.string().optional(),
    sg_message_id: z.string().optional(),
    useragent: z.string().optional(),
    ip: z.string().optional(),

    // SendGrid sends category as string, not array
    category: z.string().optional(),

    // Flattened unique_args (our custom tracking data)
    environment: z.string().optional(),
    template: z.string().optional(),

    // Other potential SendGrid fields
    tls: z.number().optional(),
    send_at: z.number().optional(),
})

// Specific event schemas
export const sendgrid_processed_event_schema = sendgrid_base_event_schema.extend({
    event: z.literal(sendgrid_event_type_enum.enum.processed),
})

export const sendgrid_deferred_event_schema = sendgrid_base_event_schema.extend({
    event: z.literal(sendgrid_event_type_enum.enum.deferred),
    response: z.string().optional(),
    attempt: z.string().optional(),
})

export const sendgrid_delivered_event_schema = sendgrid_base_event_schema.extend({
    event: z.literal(sendgrid_event_type_enum.enum.delivered),
    response: z.string().optional(),
})

export const sendgrid_open_event_schema = sendgrid_base_event_schema.extend({
    event: z.literal(sendgrid_event_type_enum.enum.open),
    useragent: z.string().optional(),
})

export const sendgrid_click_event_schema = sendgrid_base_event_schema.extend({
    event: z.literal(sendgrid_event_type_enum.enum.click),
    url: z.string().url(),
    useragent: z.string().optional(),
})

export const sendgrid_bounce_event_schema = sendgrid_base_event_schema.extend({
    event: z.literal(sendgrid_event_type_enum.enum.bounce),
    reason: z.string(),
    status: z.string().optional(),
    type: z.string().optional(),
})

export const sendgrid_dropped_event_schema = sendgrid_base_event_schema.extend({
    event: z.literal(sendgrid_event_type_enum.enum.dropped),
    reason: z.string(),
    status: z.string().optional(),
})

export const sendgrid_spamreport_event_schema = sendgrid_base_event_schema.extend({
    event: z.literal(sendgrid_event_type_enum.enum.spamreport),
})

export const sendgrid_unsubscribe_event_schema = sendgrid_base_event_schema.extend({
    event: z.literal(sendgrid_event_type_enum.enum.unsubscribe),
})

export const sendgrid_group_unsubscribe_event_schema = sendgrid_base_event_schema.extend({
    event: z.literal(sendgrid_event_type_enum.enum.group_unsubscribe),
    url: z.string().optional(),
    asm_group_id: z.number().optional(),
})

export const sendgrid_group_resubscribe_event_schema = sendgrid_base_event_schema.extend({
    event: z.literal(sendgrid_event_type_enum.enum.group_resubscribe),
    url: z.string().optional(),
    asm_group_id: z.number().optional(),
})

// Discriminated union for all SendGrid events
export const sendgrid_event_schema = z
    .discriminatedUnion('event', [
        sendgrid_processed_event_schema,
        sendgrid_deferred_event_schema,
        sendgrid_delivered_event_schema,
        sendgrid_open_event_schema,
        sendgrid_click_event_schema,
        sendgrid_bounce_event_schema,
        sendgrid_dropped_event_schema,
        sendgrid_spamreport_event_schema,
        sendgrid_unsubscribe_event_schema,
        sendgrid_group_unsubscribe_event_schema,
        sendgrid_group_resubscribe_event_schema,
    ])
    .or(
        // Fallback for unknown events - minimal validation
        z
            .object({
                event: z.string(),
                email: z.string().email(),
                timestamp: z.number(),
            })
            .passthrough(),
    )

// SendGrid sends events as an array
export const sendgrid_webhook_request_schema = z.array(sendgrid_event_schema)

// Export types
export type Sendgrid_Event_Type = z.infer<typeof sendgrid_event_type_enum>
export type Sendgrid_Event = z.infer<typeof sendgrid_event_schema>
export type Sendgrid_Webhook_Request = z.infer<typeof sendgrid_webhook_request_schema>

// Specific event types for type-safe handling
export type Sendgrid_Processed_Event = z.infer<typeof sendgrid_processed_event_schema>
export type Sendgrid_Deferred_Event = z.infer<typeof sendgrid_deferred_event_schema>
export type Sendgrid_Delivered_Event = z.infer<typeof sendgrid_delivered_event_schema>
export type Sendgrid_Open_Event = z.infer<typeof sendgrid_open_event_schema>
export type Sendgrid_Click_Event = z.infer<typeof sendgrid_click_event_schema>
export type Sendgrid_Bounce_Event = z.infer<typeof sendgrid_bounce_event_schema>
export type Sendgrid_Dropped_Event = z.infer<typeof sendgrid_dropped_event_schema>
export type Sendgrid_Spamreport_Event = z.infer<typeof sendgrid_spamreport_event_schema>
export type Sendgrid_Unsubscribe_Event = z.infer<typeof sendgrid_unsubscribe_event_schema>
export type Sendgrid_Group_Unsubscribe_Event = z.infer<typeof sendgrid_group_unsubscribe_event_schema>
export type Sendgrid_Group_Resubscribe_Event = z.infer<typeof sendgrid_group_resubscribe_event_schema>

// Validation functions
export function validate_sendgrid_request(data: unknown): Sendgrid_Webhook_Request {
    return sendgrid_webhook_request_schema.parse(data)
}

export function validate_sendgrid_event(event: unknown): Sendgrid_Event {
    return sendgrid_event_schema.parse(event)
}
