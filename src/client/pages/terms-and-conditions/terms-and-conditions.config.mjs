// src/client/pages/terms-and-conditions/terms-and-conditions.config.mjs
export default function terms_and_conditions_config({ env, BASE_URL }) {
    return {
        filename: 'terms-of-service/index.html',
        import: './src/client/pages/terms-and-conditions/terms-and-conditions.pug',
        data: {
            env,
            url: `${BASE_URL}/terms-of-service`,
            title: 'Terms of Service - Tricky Dragons',
            description:
                'Read the terms of service for Tricky Dragons card game. Learn about our policies and user agreements.',
            robots: 'index, follow',
        },
    }
}
