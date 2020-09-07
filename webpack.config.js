const path = require('path'); //including the path package
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');

module.exports = {
  entry: ['./public/js/index.js'],
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'js/bundle.js',
  },
  devServer: {
    contentBase: './public/base',
  },
  plugins: [
    new HtmlWebpackPugPlugin({
      filename: 'base.pug',
      template: './views/base.pug',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.pug$/,
        use: {
          loader: 'pug-loader',
        },
      },
    ],
  },
};
