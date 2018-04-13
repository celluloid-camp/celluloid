const Path = require('path');
const webpack = require('webpack');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';
const srcPath = Path.join(__dirname, './server');
const distPath = Path.join(__dirname, './dist');

const output = {
  path: distPath,
  filename: 'index.js',
  chunkFilename: '[id].[chunkhash].js',
};

const externals = fs.readdirSync('node_modules')
  .reduce((acc, mod) => {
    if (mod === '.bin') {
      return acc;
    }
    acc[mod] = 'commonjs ' + mod;
    return acc;
  }, {});


const plugins = [
  new webpack.IgnorePlugin(/\.(css|less)$/),
  new webpack.BannerPlugin('require("source-map-support").install();'),
  new webpack.IgnorePlugin(/dtrace-provider/),
];

const rules = [
  {
    test: /\.ts$/,
    exclude: /node_modules/,
    include: srcPath,
    use: ['babel-loader', 'ts-loader'],
  },
];

const webpackConfig = {
  devtool: isProduction ? 'source-map' : 'cheap-eval-source-map',
  context: srcPath,
  target: 'node',
  externals,
  entry: [Path.join(srcPath, 'src', 'Server')],
  output,
  resolve: {
    extensions: ['.ts'],
    modules: [
      srcPath,
      'node_modules',
    ],
  },
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
  },
  plugins,
  module: { rules },
};

module.exports = webpackConfig;
