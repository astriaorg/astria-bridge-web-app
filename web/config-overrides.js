const webpack = require("webpack");

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

  config.ignoreWarnings = [
    {
      module: /node_modules/,
      message: /Failed to parse source map/,
    },
  ];

  // Enhanced optimization configuration with safer chunking
  config.optimization = {
    ...config.optimization,
    usedExports: true,
    providedExports: true,
    sideEffects: true,
    minimize: true,
    splitChunks: {
      chunks: "all",
      maxInitialRequests: 25,
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        // Main vendor bundle for larger modules
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
          priority: 10,
          enforce: true,
        },
        // Separate bundle for react and related packages
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
          name: "react-vendor",
          chunks: "all",
          priority: 20,
        },
        // Bundle for wallet-related packages
        wallets: {
          test: /[\\/]node_modules[\\/](@cosmjs|@keplr-wallet|@rainbow-me)[\\/]/,
          name: "wallet-vendor",
          chunks: "all",
          priority: 15,
        },
        // Common code used across multiple components
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          priority: 5,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
  };

  config.module.rules.push({
    test: /\.js$/,
    include: /node_modules/,
    sideEffects: false,
  });

  config.optimization.concatenateModules = true;

  config.cache = {
    type: "filesystem",
    allowCollectingMemory: true,
    buildDependencies: {
      config: [__filename],
    },
  };

  return config;
};
