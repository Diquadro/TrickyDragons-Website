// src/client/pages/landingpage/landingpage.config.mjs
export default function landingpage_config({ env, BASE_URL }) {
    return {
        filename: 'index.html',
        import: './src/client/pages/landingpage/landingpage.pug',
        data: {
            env,
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
    }
}
