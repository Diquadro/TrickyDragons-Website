import path from 'path'
import { fileURLToPath } from 'url'
import nodeExternals from 'webpack-node-externals'

const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory

export default {
    target: 'node',
    mode: 'development',
    entry: './src/server/main.js',
    output: {
        path: path.resolve(__dirname, '../dev/server'),
        filename: 'server.cjs',
    },
    devtool: 'inline-source-map',
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
}
