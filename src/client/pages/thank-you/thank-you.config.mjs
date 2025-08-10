// src/client/pages/thank-you/thank-you.config.mjs
export default function thank_you_config({ env, BASE_URL }) {
    return {
        filename: 'thank-you/index.html',
        import: './src/client/pages/thank-you/thank-you.pug',
        data: {
            env,
            url: `${BASE_URL}/thank-you`,
            title: 'Thank you for subscribing! - Tricky Dragons',
            description:
                'Thank you for subscribing to the newsletter of Tricky Dragons. You will receive exclusive updates on the Kickstarter launch.',
            robots: 'noindex, follow',
        },
    }
}
