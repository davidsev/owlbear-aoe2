const path = require('path');
const copyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    devtool: (process.env.NODE_ENV === 'development' ? 'inline-source-map' : false),
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['raw-loader', 'postcss-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.css'],
        fallback: { 'buffer': false }
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'AoE',
            filename: 'frame.html',
        }),
        new copyPlugin({
            patterns: [
                { from: 'static' }
            ]
        }),
    ],
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },

};
