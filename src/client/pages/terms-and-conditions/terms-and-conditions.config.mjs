// src/client/pages/terms-and-conditions/terms-and-conditions.config.mjs
export default function terms_and_conditions_config({ env, BASE_URL }) {
    return {
        filename: 'terms-and-conditions/index.html',
        import: './src/client/pages/terms-and-conditions/terms-and-conditions.pug',
        data: {
            env,
            url: `${BASE_URL}/terms-and-conditions`,
            title: 'Terms and Conditions - Tricky Dragons',
            description:
                'Read the terms and conditions for Tricky Dragons card game. Learn about our policies and user agreements.',
            robots: 'index, follow',
        },
    }
}
