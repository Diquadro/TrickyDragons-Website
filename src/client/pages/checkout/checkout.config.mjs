// src/client/pages/checkout/checkout.config.mjs
export default function checkout_config({ env, BASE_URL }) {
    return {
        filename: 'checkout/index.html',
        import: './src/client/pages/checkout/checkout.pug',
        data: {
            env,
            url: `${BASE_URL}/checkout`,
            title: 'Checkout - Tricky Dragons Card Game',
            description:
                'Secure checkout for Tricky Dragons card game. Complete your purchase safely with Stripe.',
            robots: 'noindex, follow',
        },
    }
}
