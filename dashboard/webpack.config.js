const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { AureliaPlugin } = require('aurelia-webpack-plugin');
const { optimize: { CommonsChunkPlugin }, ProvidePlugin, DefinePlugin } = require('webpack');

// config helpers:
const ensureArray = config =>
  (config && (Array.isArray(config) ? config : [config])) || [];
const when = (condition, config, negativeConfig) =>
  (condition ? ensureArray(config) : ensureArray(negativeConfig));

// primary config:
const title = 'Admin Dashboard';
const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'src');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const baseUrl = '/';

let DEBUG = !(process.env.NODE_ENV && JSON.stringify(process.env.NODE_ENV).replace(' ', '') === '"production"');
let ENV = JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : 'development');
let GLOBALS = {
  'process.env.NODE_ENV': process.env.NODE_ENV,
  '__ENV__': ENV,
  '__DEV__': DEBUG
};

console.log(GLOBALS);

const cssRules = [
  { loader: 'css-loader' },
  {
    loader: 'postcss-loader',
    options: {
      plugins: () => [
        require('autoprefixer')({ browsers: ['last 2 versions'] })
      ]
    }
  }
];


module.exports = ({ production, server, extractCss, coverage } = {}) => ({
  resolve: {
    extensions: ['.js'],
    modules: [srcDir, 'node_modules']
  },
  entry: {
    app: ['aurelia-bootstrapper'],
    vendor: ['bluebird']
  },
  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: production ?
      '[name].[chunkhash].bundle.js' : '[name].[hash].bundle.js',
    sourceMapFilename: production ?
      '[name].[chunkhash].bundle.map' : '[name].[hash].bundle.map',
    chunkFilename: production ?
      '[name].[chunkhash].chunk.js' : '[name].[hash].chunk.js'
  },
  devServer: {
    contentBase: outDir,
    // serve index.html for all 404 (required for push-state)
    historyApiFallback: true
  },
  module: {
    rules: [
      // CSS required in JS/TS files should use the style-loader that auto-injects it into the website
      // only when the issuer is a .js/.ts file, so the loaders are not applied inside html templates
      {
        test: /\.css$/i,
        issuer: [{ not: [{ test: /\.html$/i }] }],
        use: extractCss ?
          ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: cssRules
          }) : ['style-loader', ...cssRules]
      },
      {
        test: /\.css$/i,
        issuer: [{ test: /\.html$/i }],
        // CSS required in templates cannot be extracted safely
        // because Aurelia would try to require it again in runtime
        use: cssRules
      },
      { test: /\.html$/i, loader: 'html-loader' },
      {
        test: /\.js$/i,
        loader: 'babel-loader',
        exclude: nodeModulesDir,
        options: coverage ? { sourceMap: 'inline', plugins: ['istanbul'] } : {}
      },
      { test: /\.json$/i, loader: 'json-loader' },
      // use Bluebird as the global Promise implementation:
      {
        test: /[\/\\]node_modules[\/\\]bluebird[\/\\].+\.js$/,
        loader: 'expose-loader?Promise'
      },
      // // exposes jQuery globally as $ and as jQuery:
      // {
      //   test: require.resolve('jquery'),
      //   loader: 'expose-loader?$!expose-loader?jQuery'
      // },
      // embed small images and fonts as Data Urls and larger ones as files:
      {
        test: /\.(png|gif|jpg|cur)$/i,
        loader: 'url-loader',
        options: { limit: 8192 }
      },
      {
        test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
        loader: 'url-loader',
        options: { limit: 10000, mimetype: 'application/font-woff2' }
      },
      {
        test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
        loader: 'url-loader',
        options: { limit: 10000, mimetype: 'application/font-woff' }
      },
      // load these fonts normally, as files:
      {
        test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new DefinePlugin(GLOBALS),
    new AureliaPlugin(),
    new ProvidePlugin({
      Promise: 'bluebird'
    }),
    new HtmlWebpackPlugin({
      template: 'index.ejs',
      minify: production ? {
        removeComments: true,
        collapseWhitespace: true
      } : undefined,
      metadata: {
        // available in index.ejs //F
        title,
        server,
        baseUrl
      }
    }),
    new CopyWebpackPlugin([{ from: 'static/favicon.ico', to: 'favicon.ico' }]),
    ...when(
      extractCss,
      new ExtractTextPlugin({
        filename: production ? '[contenthash].css' : '[id].css',
        allChunks: true
      })
    ),
    ...when(
      production,
      new CommonsChunkPlugin({
        name: 'common'
      })
    )
  ]
});
