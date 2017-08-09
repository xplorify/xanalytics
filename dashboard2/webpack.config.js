const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const argv = require('yargs').argv;

const fileName = "build.js";
const chunkFilename = "[name].chunk.js";
const ENV = argv.env;

let DEBUG = !(process.env.NODE_ENV && JSON.stringify(process.env.NODE_ENV).replace(' ', '') === '"production"');
var GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  '__ENV__': JSON.stringify(ENV),
  '__DEV__': DEBUG
};
console.log(GLOBALS);

module.exports = {
  // This is the "main" file which should include all other modules
  entry: './app/main.js',
  // Where should the compiled file go?
  output: {
    // To the `dist` folder
    path: path.join(__dirname, 'dist'),
    // With the filename `build.js` so it's dist/build.js
    filename: fileName,
    chunkFilename: chunkFilename,
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      'vue': 'vue/dist/vue.js',
      'app': path.resolve(__dirname, '../app'),
      'assets': path.resolve(__dirname, '../app/assets'),
      'components': path.resolve(__dirname, '../app/components')
    }
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.html$/, loader: 'html' },
      { test: /\.vue$/, loader: 'vue-loader' },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'url-loader?limit=10000',
          'img-loader'
        ]
      },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './index.ejs'
    }),
    new webpack.DefinePlugin(GLOBALS)
  ],
  devServer: {
    contentBase: __dirname,
    inline: true,
    hot: true,
    historyApiFallback: true,
    stats: { colors: true },
    port: 8081
  },
  node: {
    tls: false
  }
}
