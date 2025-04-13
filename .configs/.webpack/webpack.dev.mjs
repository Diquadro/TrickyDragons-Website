// webpack.dev.js
import webpack from 'webpack'
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
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('dev'),
        }),
        new CopyPlugin({
            patterns: [{ from: 'src/client/robots/robots.dev.txt', to: 'robots.txt' }],
        }),
    ],
})
