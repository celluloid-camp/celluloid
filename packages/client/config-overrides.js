const webpack = require('webpack');
module.exports = function override(config, env) {
  config.resolve = config.resolve || {};
  config.resolve.fallback = config.resolve.fallback || {};
  config.resolve.fallback.crypto = require.resolve('crypto-browserify');
  config.resolve.fallback.stream = require.resolve('stream-browserify');
  config.resolve.fallback.buffer = require.resolve("buffer")
  config.resolve.alias.buffer = 'buffer'
  config.plugins = config.plugins || [];
  config.plugins.push(new webpack.ProvidePlugin({Buffer: ['buffer', 'Buffer'],}));
  return config;
}