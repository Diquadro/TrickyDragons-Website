// webpack.common.js
import PugPlugin from 'pug-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import path from 'path'
import pagesConfig from './pages.config.js'

export default {
    module: {
        rules: [
            {
                test: /\.(css|sass|scss)$/,
                use: ['css-loader', 'sass-loader'],
            },
            {
                test: /\.(png|jpg|jpeg|ico|webp)/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/imgs/[name].[hash:8][ext]',
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[name][ext][query]',
                },
            },
        ],
    },
    resolve: {
        alias: {
            '@client_imgs': path.resolve('src/client/imgs'),
            '@client_components': path.resolve('src/client/components'),
            '@client_pages': path.resolve('src/client/pages'),
            '@client_layouts': path.resolve('src/client/layouts'),
            '@client_ts': path.resolve('src/client/ts'),
            '@shared': path.resolve('src/shared'),
        },
        extensions: ['.tsx', '.ts', '.js', '.css', '.scss'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'src/client/imgs/_hosted', to: 'assets/imgs/hosted' },
                { from: 'src/client/sitemap.xml', to: '' },
                { from: 'src/client/site.webmanifest', to: '' },
            ],
        }),
        new PugPlugin({
            entry: pagesConfig,
            pretty: true,
            js: {
                filename: 'assets/js/[name].[contenthash:8].js',
            },
            css: { filename: 'assets/css/[name].[contenthash:8].css' },
            preload: [
                {
                    test: /_preload\.(webp|png|jpe?g|svg)\?portrait$/i,
                    as: 'image',
                    attributes: { media: '(max-width: 1400px)' },
                },
                {
                    test: /_preload\.(webp|png|jpe?g|svg)\?landscape$/i,
                    as: 'image',
                    attributes: { media: '(min-width: 1400px)' },
                },
            ],
        }),
    ],
    ignoreWarnings: [
        {
            message: /Conflicting values for 'process.env.NODE_ENV'/,
        },
    ],
}
