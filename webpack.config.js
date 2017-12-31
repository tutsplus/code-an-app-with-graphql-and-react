const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './client/index.js',
  output: {
    path: '/tmp',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { use: 'babel-loader', test: /\.js$/, exclude: /node_modules/ },
      { use: ['style-loader', 'css-loader'], test: /\.css$/ }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.html'
    })
  ]
};
