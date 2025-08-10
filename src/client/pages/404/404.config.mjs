// src/client/pages/404/404.config.mjs
export default function not_found_config({ env, BASE_URL }) {
    return {
        filename: '404.html',
        import: './src/client/pages/404/404.pug',
        data: {
            env,
            url: `${BASE_URL}/404`,
            title: '404 - Page Not Found | Tricky Dragons',
            description: "Oops! The page you're looking for doesn't exist.",
            robots: 'noindex, nofollow',
        },
    }
}
