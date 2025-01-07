const path = require('path')
const PugPlugin = require('pug-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
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
                // JS output filename with hash for unique id
                filename: 'assets/js/[name].[contenthash:8].js',
            },
            css: {
                // CSS output filename with hash for unique id
                filename: 'assets/css/[name].[contenthash:8].css',
            },
            loaderOptions: {
                sources: [
                    {
                        tag: 'meta',
                        attributes: ['content'],
                        // allow to handeln an image in the 'content' attribute of the 'meta' tag
                        // when the 'property' attribute contains one of: 'og:image', 'og:video'
                        filter: ({ attributes }) => {
                            const attrName = 'property'
                            const attrValues = ['og:image', 'og:video']
                            if (!attributes[attrName] || attrValues.indexOf(attributes[attrName]) < 0) {
                                return false // return false to disable processing
                            }
                            // return true // or undefined to enable processing
                        },
                    },
                ],
            },
        }),
        // new MiniCssExtractPlugin(),
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
            {
                test: /\.xml/,
                type: 'asset/resource',
                generator: {
                    filename: 'sitemap.xml',
                },
            },
            {
                test: /\.txt/,
                type: 'asset/resource',
                generator: {
                    filename: 'robots.txt',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist/www'),
        clean: true,
    },
    optimization: {
        minimizer: [new CssMinimizerPlugin()],
        runtimeChunk: 'single',
    },
}
