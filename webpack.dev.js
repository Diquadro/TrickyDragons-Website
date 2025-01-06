const path = require('path')
const PugPlugin = require('pug-plugin')

module.exports = {
    mode: 'development',
    entry: './src/www/ts/main.ts',
    devtool: 'inline-source-map',
    plugins: [
        new PugPlugin({
            pretty: 'auto',
            //☝🏽 Format HTML (only in dev mode)
            entry: {
                // Insert your PUG templates here
                index: './src/www/views/landingpage/landingpage.pug',
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
        path: path.resolve(__dirname, 'dist/www'),
        clean: true,
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist/www'),
        },
        hot: true,
        // watchFiles: {
        //     paths: ['src/**/*.*'],
        //     //☝🏽 Enables live reload in these folders

        // },
    },
    optimization: {
        runtimeChunk: 'single',
    },
    // stats: 'errors-only',
    //☝🏽 For a cleaner dev-server run
}
