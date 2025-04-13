// webpack.prod.js
const { merge } = require('webpack-merge')
const common = require('./webpack.common.cjs')
const path = require('path')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    output: {
        path: path.resolve('prod/client'),
        clean: true,
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                },
            }),
            new CssMinimizerPlugin(),
        ],
        splitChunks: {
            chunks: 'all',
        },
        runtimeChunk: false,
    },
    plugins: [
        new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
        }),
        new CopyPlugin({
            patterns: [{ from: 'src/client/robots/robots.prod.txt', to: 'robots.txt' }],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve('./.configs/.tsconfig/tsconfig.client.prod.json'),
                        },
                    },
                ],
            },
        ],
    },
})
