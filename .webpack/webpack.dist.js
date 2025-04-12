// webpack.prod.js
import { merge } from 'webpack-merge'
import common from './webpack.common.js'
import path from 'path'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import CompressionPlugin from 'compression-webpack-plugin'

export default merge(common, {
    mode: 'production',
    devtool: 'source-map',
    output: {
        path: path.resolve('dist/client'),
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
})
