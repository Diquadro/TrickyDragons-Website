const path = require('path')

module.exports = {
    entry: './src/www/ts/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist/www'),
    },
}
