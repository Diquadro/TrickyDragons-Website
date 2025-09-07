import { Request, Response } from 'express'
import Stripe from 'stripe'
import { STRIPE } from '@shared/constants/app.constants'

// This is your test secret API key.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: STRIPE.API_VERSION,
})

export async function get_session_status(req: Request, res: Response): Promise<void> {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id as string, {
        expand: ['payment_intent'],
    })

    res.send({
        status: session.status,
        payment_status: session.payment_status,
        payment_intent_id: (session.payment_intent as Stripe.PaymentIntent)?.id,
        payment_intent_status: (session.payment_intent as Stripe.PaymentIntent)?.status,
    })
}
