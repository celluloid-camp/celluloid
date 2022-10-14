const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const isProduction = process.env.NODE_ENV === 'production';
const basePath = path.resolve(__dirname, './');
const rootPath = path.resolve(basePath, '../../');
const srcPath = path.resolve(basePath, './src');
const buildPath = path.resolve(basePath, './build');

const output = {
  path: buildPath,
  filename: 'index.js',
  chunkFilename: '[id].[chunkhash].js',
};

const plugins = [
  new webpack.IgnorePlugin({resourceRegExp:/\.(css|less)$/}),
  new webpack.BannerPlugin('require("source-map-support").install();'),
  new webpack.IgnorePlugin({resourceRegExp:/dtrace-provider/}),
];

const rules = [
  {
    test: /\.ts$/,
    exclude: /node_modules/,
    include: srcPath,
    use: ['babel-loader', 'ts-loader', 'source-map-loader'],
  },
];

const webpackConfig = {
  mode: process.env.NODE_ENV,
  devtool: isProduction ? 'source-map' : 'cheap-source-map',
  context: srcPath,
  target: 'node',
  externals: [
    nodeExternals(),
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../../node_modules')
    })
  ],
  entry: [path.join(srcPath, 'Server')],
  output,
  resolve: {
    extensions: ['.js', '.json', '.ts'],
    modules: [
      srcPath,
      path.join(basePath, 'node_modules'),
      path.join(rootPath, 'node_modules')
    ],
  },
  node: {
    // console: false,
    global: false,
    // process: false,
    // Buffer: false,
    __filename: false,
    __dirname: false,
  },
  plugins,
  module: { rules },
};

module.exports = webpackConfig;
