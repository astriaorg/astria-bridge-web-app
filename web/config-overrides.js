const webpack = require("webpack");

// This file is used by react-app-rewired.
// Needed to browserify crypto for some cosmos key stuff I believe.
module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    os: require.resolve("os-browserify/browser"),
    buffer: require.resolve("buffer/"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    process: require.resolve("process/browser"),
    vm: require.resolve("vm-browserify"),
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);

  // ignoring hundreds of source map warnings,
  // so that the dev server build output is actually clean
  config.ignoreWarnings = [
    {
      module: /node_modules/,
      message: /Failed to parse source map/,
    },
  ];

  return config;
};
