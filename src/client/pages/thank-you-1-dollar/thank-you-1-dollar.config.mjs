// src/client/pages/thank-you-1-dollar/thank-you-1-dollar.config.mjs
export default function thank_you_1_dollar_config({ env, BASE_URL }) {
    return {
        filename: 'thank-you-1-dollar/index.html',
        import: './src/client/pages/thank-you-1-dollar/thank-you-1-dollar.pug',
        data: {
            env,
            url: `${BASE_URL}/thank-you-1-dollar`,
            title: 'Thank you for your support! - Tricky Dragons',
            description:
                'Thank you for your $1 contribution to Tricky Dragons. Your support means the world to us.',
            robots: 'noindex, follow',
        },
    }
}
