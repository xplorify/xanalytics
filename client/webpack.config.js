var fs = require('fs');
var url = require('url');
var path = require('path');
var webpack = require('webpack');
var WebpackMd5Hash = require('webpack-md5-hash');
var ManifestPlugin = require('webpack-manifest-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
var DEBUG = process.env.NODE_ENV ? !(JSON.stringify(process.env.NODE_ENV).replace(" ", "") === '"prd"') : true;
var ENV = process.env.NODE_ENV ? process.env.NODE_ENV.replace(" ", "") : "dev";
var fileName = ENV == 'dev' ? '[name].js' : '[name].[chunkhash].js';
var chunkFilename = ENV == 'dev' ? '[name].chunk.js' : '[name].[chunkhash].chunk.js';
console.log(ENV);
console.log(DEBUG);

// console.log(require("../../../Learning/Angular/MyFirstApp/package.json"));
var GLOBALS = {
    // 'process.env.NODE_ENV': ENV,
    '__ENV__': JSON.stringify(ENV),
    '__DEV__': DEBUG
};

module.exports = {
    // Main entry directory and file
    // devtool: DEBUG ? 'cheap-module-eval-source-map': 'source-map',
    entry: {
        app: [
            // 'webpack/hot/dev-server',
            path.join(__dirname, 'app', 'xanalytics.js')
        ]
    },

    // Output directories and file
    output: {
        path: path.join(__dirname, 'dist'),
        filename: fileName,
        chunkFilename: chunkFilename,
        publicPath: '/dist/'
            //  publicPath: '/Xplorify.WebSpa/dist/'
    },

    // Custom plugins
    plugins: [
            new webpack.DefinePlugin(GLOBALS),
            // new webpack.ProvidePlugin({
            //     $: "jquery",
            //     "window.$": "jquery",
            //     jQuery: "jquery",
            //     "window.jQuery": "jquery",
            //     Q: "q",
            //     "window.Q": "q"
            // }),
            new WebpackMd5Hash(),
            new ManifestPlugin(),
            new HtmlWebpackPlugin({
                filename: '../index.html',
                template: './index.ejs'
            }),
            new InlineManifestWebpackPlugin({
                name: 'webpackManifest'
            }),
            new webpack.optimize.OccurenceOrderPlugin()
            // new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/)
        ]
        .concat(DEBUG ? [] : [
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin(),
            new webpack.optimize.AggressiveMergingPlugin({ moveToParents: true })
        ]),

    module: {
        loaders: [{
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: ["es2015"]
                }
            },
            { test: /\.html$/, loader: 'html' },
            { test: /\.json$/, loader: 'json-loader' },
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.less$/, loader: 'style!css!less' },
            { test: /\.scss$/, loader: "style!css!sass" },
            { test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/font-woff" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/octet-stream" },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=image/svg+xml" },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]
            }
        ]
    },

    resolve: {
        extensions: ['', '.js', '.jsx', '.json', 'wav'],

        modulesDirectories: [
            'node_modules',
            'app'
        ],

        root: path.join(__dirname, 'app'),
    },
    node: {
        // console: 'empty',
        fs: 'empty',
        // net: 'empty',
        tls: 'empty'
    },
    externals: {
        "window": "window",
        "document": "document",
        "navigator": "navigator"
    },

    devServer: {
        contentBase: __dirname,
        hot: false,
        inline: true,
        historyApiFallback: true,
        stats: { colors: true },
        progress: true
    }
};