// src/client/pages/welcome-back/welcome-back.config.mjs
export default function welcome_back_config({ env, BASE_URL }) {
    return {
        filename: 'welcome-back/index.html',
        import: './src/client/pages/welcome-back/walcome-back.pug',
        data: {
            env,
            url: `${BASE_URL}/welcome-back`,
            title: 'Welcome back! - Tricky Dragons',
            description:
                'Welcome back to Tricky Dragons! Catch up on updates and continue your journey with us.',
            robots: 'noindex, follow',
        },
    }
}
