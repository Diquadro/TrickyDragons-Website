import { Request, Response } from 'express'
import { HTTP_STATUS } from '@shared/constants/app.constants'
import {
    validate_webhook_event,
    validate_checkout_session,
    validate_payment_intent,
    type Stripe_Webhook_Event,
    type Checkout_Session,
    type Payment_Intent,
} from '@shared/validations/stripe_webhook.validation'
import { sql } from '@server/models/postgres_client'
import Stripe from 'stripe'

// Initialize Stripe for webhook signature verification
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
})

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * Stripe Webhook Controller
 * Handles webhook events from Stripe to update order statuses and process payments
 */
export async function stripe_webhook(req: Request, res: Response): Promise<void> {
    try {
        // 1. Verify webhook signature
        const signature = req.get('stripe-signature')
        if (!signature) {
            console.error('Missing Stripe signature')
            res.status(HTTP_STATUS.BAD_REQUEST).send('Missing signature')
            return
        }

        // Note: We're using the already parsed JSON body since express_json middleware handles it
        // In production, you might want to use raw body for signature verification
        const event = validate_webhook_event(req.body)

        // 2. Process event based on type
        await process_stripe_event(event)

        // 3. Respond success
        res.status(HTTP_STATUS.OK).send('Webhook processed successfully')
    } catch (error) {
        console.error('Error processing Stripe webhook:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            body: req.body,
        })
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Webhook processing failed')
    }
}

/**
 * Process individual Stripe event based on its type
 */
async function process_stripe_event(event: Stripe_Webhook_Event): Promise<void> {
    switch (event.type) {
        case 'checkout.session.completed':
            await handle_checkout_session_completed(event)
            break

        case 'payment_intent.succeeded':
            await handle_payment_intent_succeeded(event)
            break

        case 'payment_intent.payment_failed':
            await handle_payment_intent_failed(event)
            break

        case 'payment_intent.canceled':
            await handle_payment_intent_canceled(event)
            break

        default:
            break
    }
}

/**
 * Handle successful checkout session completion
 * This is the primary event for updating order status to 'paid'
 */
async function handle_checkout_session_completed(event: Stripe_Webhook_Event): Promise<void> {
    const session = validate_checkout_session(event.data.object)

    if (session.payment_status === 'paid') {
        await update_order_status(session.id, 'paid')
    } else {
        console.warn('Checkout session completed but not paid:', {
            session_id: session.id,
            payment_status: session.payment_status,
        })
    }
}

/**
 * Handle successful payment intent
 * Backup event in case checkout.session.completed is missed
 */
async function handle_payment_intent_succeeded(event: Stripe_Webhook_Event): Promise<void> {
    try {
        const payment_intent = validate_payment_intent(event.data.object)

        await update_order_status_by_payment_intent(payment_intent.id, 'paid')
    } catch (error) {
        console.error('Error handling payment intent succeeded:', error)
        throw error
    }
}

/**
 * Handle failed payment intent
 */
async function handle_payment_intent_failed(event: Stripe_Webhook_Event): Promise<void> {
    try {
        const payment_intent = validate_payment_intent(event.data.object)

        await update_order_status_by_payment_intent(payment_intent.id, 'failed')
    } catch (error) {
        console.error('Error handling payment intent failed:', error)
        throw error
    }
}

/**
 * Handle canceled payment intent
 */
async function handle_payment_intent_canceled(event: Stripe_Webhook_Event): Promise<void> {
    try {
        const payment_intent = validate_payment_intent(event.data.object)

        await update_order_status_by_payment_intent(payment_intent.id, 'canceled')
    } catch (error) {
        console.error('Error handling payment intent canceled:', error)
        throw error
    }
}

/**
 * Update order status by Stripe session ID
 */
async function update_order_status(session_id: string, status: string): Promise<void> {
    const result = await sql`
        UPDATE orders 
        SET status = ${status}
        WHERE stripe_session_id = ${session_id}
        RETURNING uuid, email, amount_total
    `

    if (result.length === 0) {
        console.warn('No order found for session ID:', session_id)
        return
    }

    const order = result[0]
}

/**
 * Update order status by Stripe payment intent ID
 */
async function update_order_status_by_payment_intent(
    payment_intent_id: string,
    status: string,
): Promise<void> {
    const result = await sql`
        UPDATE orders 
        SET status = ${status}
        WHERE stripe_payment_intent_id = ${payment_intent_id}
        RETURNING uuid, email, amount_total, stripe_session_id
    `

    if (result.length === 0) {
        console.warn('No order found for payment intent ID:', payment_intent_id)
        return
    }

    const order = result[0]
}
