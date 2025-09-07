import { Request, Response } from 'express'
import Stripe from 'stripe'
import { STRIPE } from '@shared/constants/app.constants'

// This is your test secret API key.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: STRIPE.API_VERSION,
})

export async function create_checkout_session(req: Request, res: Response): Promise<void> {
    // Build return URL with custom parameters from frontend + session_id
    let return_url = req.body.return_url

    // Add session_id parameter to the return URL (preserve literal {CHECKOUT_SESSION_ID} for Stripe)
    const separator = return_url.includes('?') ? '&' : '?'
    const final_return_url = `${return_url}${separator}session_id={CHECKOUT_SESSION_ID}`

    const customer_email = req.body.email

    const session = await stripe.checkout.sessions.create({
        ui_mode: 'custom',
        customer_email: customer_email,
        billing_address_collection: 'required',
        line_items: [
            {
                price: req.body.product_id,
                quantity: 1,
            },
        ],
        mode: 'payment',
        payment_method_types: ['card'],
        return_url: final_return_url,
        payment_intent_data: {
            receipt_email: customer_email,
            metadata: {
                customer_email: customer_email,
            },
        },
    })

    res.send({ clientSecret: session.client_secret })
}
