// src/client/pages/admin/admin.config.mjs
export default function admin_config({ env, BASE_URL }) {
    return {
        filename: 'admin/index.html',
        import: './src/client/pages/admin/admin.pug',
        data: {
            env,
            url: `${BASE_URL}/admin`,
            title: 'Admin Dashboard - TrickyDragons',
            description: 'Admin dashboard for managing TrickyDragons data',
            keywords: ['admin', 'dashboard', 'management'],
            robots: 'noindex, nofollow',
        },
    }
}
