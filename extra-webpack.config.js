const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  // // Other rules...
  plugins: [
    new NodePolyfillPlugin()
  ],
  module: {
    rules: [
      // {
      //   test: /\.html$/,
      //   use: 'html-loader',
      // },
      // {
      //   loader: 'babel-loader',
      //   test: /\.jsx?$/,
      //   exclude: /node_modules/,
      //   query: {
      //     presets: ['es2015']
      //   }
      // }
      // // ...other rules...
    ],
  },
}