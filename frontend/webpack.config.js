const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpack = require('webpack');

module.exports = (env = {}) => {
  const mode = env.mode || 'none';

  const isLocal = mode === 'none';
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  const dotenvFile =
    {
      none: './.env.local',
      development: './.env.dev',
      production: './.env.prod',
    }[mode] || './.env.prod';

  return {
    mode,
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isLocal ? '[name].js' : '[name].[contenthash].js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@components': path.resolve(__dirname, 'src/components/'),
        '@utils': path.resolve(__dirname, 'src/utils/'),
      },
    },
    devtool: isLocal ? 'eval-source-map' : isDev ? 'source-map' : false,
    devServer: isLocal
      ? {
          static: path.join(__dirname, 'public'),
          historyApiFallback: true,
          hot: true,
          open: true,
          port: 3000,
        }
      : undefined,
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
            },
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: './public/index.html' }),
      new Dotenv({ path: dotenvFile }),
      ...(isLocal ? [] : [new CleanWebpackPlugin()]),
      ...(env.analyze ? [new BundleAnalyzerPlugin()] : []),
    ],
    optimization: isLocal
      ? undefined
      : {
          splitChunks: { chunks: 'all' },
          minimize: true,
        },
  };
};
