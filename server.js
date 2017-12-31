const express = require('express');
const webpackMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const app = express();

app.use(webpackMiddleware(webpack(webpackConfig)));

app.listen(4000, () => {
  console.log('Listening on http://localhost:4000');
})
