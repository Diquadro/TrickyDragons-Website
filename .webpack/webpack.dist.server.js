import path from 'path'
import { fileURLToPath } from 'url'
import nodeExternals from 'webpack-node-externals'

const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory

export default {
    target: 'node',
    mode: 'production',
    entry: './src/server/main.js',
    output: {
        path: path.resolve(__dirname, '../dist/server'),
        filename: 'server.cjs',
        clean: true,
    },
    devtool: 'source-map',
    externals: [nodeExternals()], // Prevent bundling node_modules
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    stats: {
        colors: true,
        reasons: false,
        chunks: false,
    },
}
