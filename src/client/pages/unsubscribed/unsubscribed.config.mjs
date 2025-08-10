// src/client/pages/unsubscribed/unsubscribed.config.mjs
export default function unsubscribed_config({ env, BASE_URL }) {
    return {
        filename: 'unsubscribed/index.html',
        import: './src/client/pages/unsubscribed/unsubscribed.pug',
        data: {
            env,
            url: `${BASE_URL}/unsubscribed`,
            title: 'Unsubscribed - Tricky Dragons',
            description:
                'You have been unsubscribed from the Tricky Dragons newsletter. You will no longer receive updates on the Kickstarter launch.',
            robots: 'noindex, follow',
        },
    }
}
