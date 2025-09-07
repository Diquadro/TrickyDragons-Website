// src/client/pages/thank-you-vip/thank-you-vip.config.mjs
export default function thank_you_vip_config({ env, BASE_URL }) {
    return {
        filename: 'thank-you-vip/index.html',
        import: './src/client/pages/thank-you-vip/thank-you-vip.pug',
        data: {
            env,
            url: `${BASE_URL}/thank-you-vip`,
            title: 'Thank you for your support! - Tricky Dragons',
            description:
                'Thank you for your $1 contribution to Tricky Dragons. Your support means the world to us.',
            robots: 'noindex, follow',
        },
    }
}
