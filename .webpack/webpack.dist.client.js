import path from 'path'
import { fileURLToPath } from 'url'
import PugPlugin from 'pug-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'

const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory

export default {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
        new PugPlugin({
            entry: {
                // Insert your PUG templates here
                index: './src/www/views/landingpage/landingpage.pug',
                404: './src/www/views/404/404.pug',
            },
            js: {
                filename: 'assets/js/[name].[contenthash:8].js',
            },
            css: {
                filename: 'assets/css/[name].[contenthash:8].css',
            },
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'src/www/imgs/social_images/Open_Graph_1200x630.webp',
                    to: 'assets/img/Open_Graph_1200x630.webp',
                },
                {
                    from: 'src/www/sitemap.xml',
                    to: '',
                },
                {
                    from: 'src/www/robots.txt',
                    to: '',
                },
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(css|sass|scss)$/,
                use: ['css-loader', 'sass-loader'],
                //☝🏽 Load Sass files
            },
            {
                // To use images on pug files:
                test: /\.(png|jpg|jpeg|ico|webp)/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/img/[name].[hash:8][ext]',
                },
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                // To use fonts on pug files:
                test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[name][ext][query]',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, '../dist/www'),
        clean: true,
    },
    optimization: {
        minimizer: [new CssMinimizerPlugin()],
        runtimeChunk: 'single',
    },
}
