const path = require('path')
const PugPlugin = require('pug-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
        new PugPlugin({
            pretty: 'auto',
            //☝🏽 Format HTML (only in dev mode)
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
        path: path.resolve(__dirname, 'dev/www'),
        clean: true,
    },
    optimization: {
        runtimeChunk: 'single',
    },
}
