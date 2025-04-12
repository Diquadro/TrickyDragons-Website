const BASE_URL = 'https://www.trickydragons.com'

export default [
    {
        filename: 'index.html',
        import: './src/client/pages/landingpage/landingpage.pug',
        data: {
            url: `${BASE_URL}/`,
            title: 'Tricky Dragons - Fast-Paced Card Game of Strategy & Chaos',
            description:
                'Discover Tricky Dragons, a fast-paced card game where strategy meets chaos! Master the elements and outsmart your friends. Coming soon on Kickstarter.',
            keywords: [
                'Tricky Dragons',
                'trickydragons',
                'card game',
                'fantasy game',
                'strategy game',
                'Kickstarter games',
                'board games',
                'multiplayer card game',
                'family-friendly games',
                'quick card games',
                'easy card games',
            ],
            robots: 'index, follow',
        },
    },
    {
        filename: 'email_deactivation/index.html',
        import: './src/client/pages/email_deactivation/email_deactivation.pug',
        data: {
            url: `${BASE_URL}/email_deactivation`,
            title: 'Email Deactivation - Tricky Dragons',
            description: 'Deactivate your email subscription from Tricky Dragons.',
            robots: 'noindex, nofollow',
        },
    },
    {
        filename: 'privacy_policy/index.html',
        import: './src/client/pages/privacy_policy/privacy_policy.pug',
        data: {
            url: `${BASE_URL}/privacy_policy`,
            title: 'Privacy Policy - Tricky Dragons',
            description: 'Read our Privacy Policy to learn how we handle your data.',
            robots: 'noindex, nofollow',
        },
    },
    {
        filename: 'terms_and_conditions/index.html',
        import: './src/client/pages/terms_and_conditions/terms_and_conditions.pug',
        data: {
            url: `${BASE_URL}/terms_and_conditions`,
            title: 'Terms and Conditions - Tricky Dragons',
            description: 'Read the Terms and Conditions of Tricky Dragons.',
            robots: 'noindex, nofollow',
        },
    },
    {
        filename: '404.html',
        import: './src/client/pages/404/404.pug',
        data: {
            url: `${BASE_URL}/404`,
            title: '404 - Page Not Found | Tricky Dragons',
            description: "Oops! The page you're looking for doesn't exist.",
            robots: 'noindex, nofollow',
        },
    },
    {
        filename: 'cookie_policy/index.html',
        import: './src/client/pages/cookie_policy/cookie_policy.pug',
        data: {
            url: `${BASE_URL}/cookie_policy`,
            title: 'Cookie Policy - Tricky Dragons',
            description: 'Learn how we use cookies to enhance your experience on our website.',
            robots: 'noindex, nofollow',
        },
    },
]
