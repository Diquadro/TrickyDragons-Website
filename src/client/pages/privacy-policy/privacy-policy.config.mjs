// src/client/pages/privacy-policy/privacy-policy.config.mjs
export default function privacy_policy_config({ env, BASE_URL }) {
    return {
        filename: 'privacy-policy/index.html',
        import: './src/client/pages/privacy-policy/privacy-policy.pug',
        data: {
            env,
            url: `${BASE_URL}/privacy-policy`,
            title: 'Privacy Policy - Tricky Dragons',
            description:
                'Learn about our privacy policy for Tricky Dragons. Understand how we collect, use, and protect your personal information.',
            robots: 'index, follow',
        },
    }
}
