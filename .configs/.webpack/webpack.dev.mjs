// webpack.dev.js
import { merge } from 'webpack-merge'
import common from './webpack.common.mjs'
import path from 'path'
import CopyPlugin from 'copy-webpack-plugin'

export default merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve('dev/client'), // Must be an absolute path
        clean: true,
    },
    devServer: {
        compress: true, // Abilita gzip compression
        port: 5500, // Cambia la porta se necessario
        hot: true, // Abilita Hot Module Replacement
        open: true, // Apre automaticamente il browser
        historyApiFallback: true, // Per supportare SPA con routing lato client
        watchFiles: ['src/www/**/*'], // Per ricaricare i file automaticamente
        liveReload: true, // Ricarica la pagina quando un file cambia
        allowedHosts: 'all',
        client: {
            webSocketURL: {
                protocol: 'wss',
                hostname: 'trickydragons.loca.lt',
                port: 443,
                pathname: '/ws',
            },
        },
        // Headers per HTTPS
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*',
        },
        proxy: [
            {
                context: ['/v1', '/v2'],
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
                cookieDomainRewrite: 'localhost', // Riscrive il dominio dei cookie
                onProxyRes: function (proxyRes, req, res) {
                    // Gestisce i cookie nella risposta del proxy
                    const cookies = proxyRes.headers['set-cookie']
                    if (cookies) {
                        const newCookies = cookies.map((cookie) =>
                            cookie.replace(/Domain=[^;]+;/, 'Domain=localhost;'),
                        )
                        proxyRes.headers['set-cookie'] = newCookies
                    }
                },
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: 'src/client/robots/robots.dev.txt', to: 'robots.txt' }],
        }),
    ],
})
