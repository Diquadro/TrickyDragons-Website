// webpack.common.js
import dotenv from 'dotenv'
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

import webpack from 'webpack'
import PugPlugin from 'pug-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import path from 'path'
import pagesConfig from './pages.config.mjs'

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
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve('./.configs/.tsconfig/tsconfig.client.json'),
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        alias: {
            '@client': path.resolve('src/client'),
            '@server': path.resolve('src/server'),
            '@database': path.resolve('src/database'),
            '@shared': path.resolve('src/shared'),
        },
        extensions: ['.tsx', '.ts', '.js', '.css', '.scss'],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.CLIENT_URL': JSON.stringify(process.env.CLIENT_URL),
            'process.env.API_URL': JSON.stringify(process.env.API_URL),
            'process.env.SERVER_HOST': JSON.stringify(process.env.SERVER_HOST),
            'process.env.SERVER_PORT': JSON.stringify(process.env.SERVER_PORT),
        }),
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
