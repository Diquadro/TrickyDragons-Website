import { z } from 'zod'

// Stripe webhook event structure
export const stripe_webhook_event_schema = z.object({
    id: z.string(),
    object: z.literal('event'),
    type: z.string(),
    created: z.number(),
    api_version: z.string().optional(),
    data: z.object({
        object: z.any(), // The actual Stripe object (session, payment_intent, etc.)
    }),
    livemode: z.boolean(),
    pending_webhooks: z.number(),
    request: z
        .object({
            id: z.string().nullable(),
            idempotency_key: z.string().nullable(),
        })
        .nullable(),
})

// Checkout session object (when type = 'checkout.session.completed')
export const checkout_session_schema = z.object({
    id: z.string(),
    object: z.literal('checkout.session'),
    amount_total: z.number(),
    currency: z.string(),
    customer_email: z.string().nullable(),
    payment_status: z.enum(['paid', 'unpaid', 'no_payment_required']),
    status: z.enum(['open', 'complete', 'expired']),
    payment_intent: z.string().nullable(),
})

// Payment intent object (when type = 'payment_intent.*')
export const payment_intent_schema = z.object({
    id: z.string(),
    object: z.literal('payment_intent'),
    amount: z.number(),
    currency: z.string(),
    status: z.enum([
        'requires_payment_method',
        'requires_confirmation',
        'requires_action',
        'processing',
        'requires_capture',
        'canceled',
        'succeeded',
    ]),
    metadata: z.record(z.string()).optional(),
})

export type Stripe_Webhook_Event = z.infer<typeof stripe_webhook_event_schema>
export type Checkout_Session = z.infer<typeof checkout_session_schema>
export type Payment_Intent = z.infer<typeof payment_intent_schema>

export function validate_webhook_event(body: any): Stripe_Webhook_Event {
    const validation = stripe_webhook_event_schema.safeParse(body)
    if (!validation.success) {
        throw new Error(`Invalid webhook event: ${validation.error.message}`)
    }
    return validation.data
}

export function validate_checkout_session(obj: any): Checkout_Session {
    const validation = checkout_session_schema.safeParse(obj)
    if (!validation.success) {
        throw new Error(`Invalid checkout session: ${validation.error.message}`)
    }
    return validation.data
}

export function validate_payment_intent(obj: any): Payment_Intent {
    const validation = payment_intent_schema.safeParse(obj)
    if (!validation.success) {
        throw new Error(`Invalid payment intent: ${validation.error.message}`)
    }
    return validation.data
}
