const path = require('path');
const copyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack').DefinePlugin;
const version = require('./package.json').version;

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: process.env.URL_PREFIX || '',
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
        new DefinePlugin({
            URL_PREFIX: JSON.stringify(process.env.URL_PREFIX || ''),
            VERSION: JSON.stringify(version) || 'ERROR',
        }),
        new copyPlugin({
            patterns: [
                {
                    from: 'static',
                },
                {
                    from: 'static/manifest.json',
                    transform: (content, path) => {
                        let manifest = JSON.parse(content.toString());
                        manifest.version = process.env.npm_package_version;
                        const url_prefix = process.env.URL_PREFIX || '';
                        manifest.background_url = url_prefix + manifest.background_url;
                        manifest.icon = url_prefix + manifest.icon;
                        return JSON.stringify(manifest, null, 4);
                    },
                },
            ]
        }),
    ],
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },

};
