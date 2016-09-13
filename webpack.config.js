var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'app/public');
var APP_DIR = path.resolve(__dirname, 'app/scripts');
var STYLE_DIR = path.resolve(__dirname, 'app/stylesheets');

var config = {
    entry: APP_DIR + '/main.jsx',
    output: {
        path: BUILD_DIR,
        publicPath: './public/',
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                include: STYLE_DIR,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.jsx?/,
                include: APP_DIR,
                loader: 'babel'
            },
            {
                test: /\.png$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.jpg$/,
                loader: 'file-loader'
            }
        ]
    }
};

module.exports = config;
