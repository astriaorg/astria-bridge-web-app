const webpack = require("webpack");

// For react-app-rewired to override the default webpack configuration
module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    buffer: false,
    crypto: false,
    events: false,
    path: false,
    stream: require.resolve("stream-browserify"),
    string_decoder: false,
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
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
