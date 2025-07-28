// pages.config.mjs
import dotenv from 'dotenv'
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

const BASE_URL = 'https://www.trickydragons.com'
const env = process.env.NODE_ENV

export default [
    {
        filename: 'index.html',
        import: './src/client/pages/landingpage/landingpage.pug',
        data: {
            env: env,
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
            env: env,
            url: `${BASE_URL}/email_deactivation`,
            title: 'Email Deactivation - Tricky Dragons',
            description: 'Deactivate your email subscription from Tricky Dragons.',
            robots: 'noindex, nofollow',
        },
    },
    {
        filename: '404.html',
        import: './src/client/pages/404/404.pug',
        data: {
            env: env,
            url: `${BASE_URL}/404`,
            title: '404 - Page Not Found | Tricky Dragons',
            description: "Oops! The page you're looking for doesn't exist.",
            robots: 'noindex, nofollow',
        },
    },
    {
        filename: 'thank-you/index.html',
        import: './src/client/pages/thank-you/thank-you.pug',
        data: {
            env: env,
            url: `${BASE_URL}/thank-you`,
            title: 'Thank you for subscribing! - Tricky Dragons',
            description:
                'Thank you for subscribing to the newsletter of Tricky Dragons. You will receive exclusive updates on the Kickstarter launch.',
            robots: 'noindex, nofollow',
        },
    },
]
