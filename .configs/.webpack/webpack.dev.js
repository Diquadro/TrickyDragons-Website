// webpack.dev.js
import webpack from 'webpack'
import { merge } from 'webpack-merge'
import common from './webpack.common.js'
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
        proxy: [
            {
                context: ['/v1'],
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('dev'),
        }),
        new CopyPlugin({
            patterns: [{ from: 'src/client/robots/robots.dev.txt', to: 'robots.txt' }],
        }),
    ],
})
