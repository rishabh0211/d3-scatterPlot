const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {

  const isProduction = env === 'production';

  return {
    entry: "./src/main.js",
    output: {
      path: path.join(__dirname, 'public', 'dist'),
      filename: "bundle.[contenthash].js",
      publicPath: '/dist'
    },
    module: {
      rules: [{
          test: /\.(png|jpg)$/,
          use: ['file-loader']
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"]
            }
          }
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader']
        }
      ]
    },
    plugins: [
      new TerserPlugin(),
      new MiniCssExtractPlugin({
        filename: 'styles.[contenthash].css'
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './src/index.html'
      })
    ]
  };
};