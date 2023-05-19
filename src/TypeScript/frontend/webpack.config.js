var InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

var HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');

const ASSET_PATH = process.env.ASSET_PATH || '/';

module.exports = {
  entry: './src/index.tsx',
  mode: 'production',
  target: 'web',
  output: {
    publicPath: ASSET_PATH,
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, './dist')
    },
    hot: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.json', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve('public/index.html'),
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/.+[.]js/]),
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-typescript',
              //'@babel/preset-env', //commented out to allow es6 syntax in the transpiled code. This is faster in chrome
              '@babel/preset-react',
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
