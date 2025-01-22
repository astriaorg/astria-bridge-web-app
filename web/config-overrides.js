const fs = require("fs");
const path = require("path");
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

  // generate file for domain verification for walletconnect
  const walletConnectVerificationCode = process.env.REACT_APP_WALLET_CONNECT_DOMAIN_VERIFICATION_CODE;
  if (walletConnectVerificationCode) {
    const wellKnownFolder = path.join(__dirname, "public/.well-known");
    const walletConnectVerificationPath = path.join(wellKnownFolder, "walletconnect.txt");
    if (!fs.existsSync(wellKnownFolder)) {
      fs.mkdirSync(wellKnownFolder);
    }
    fs.writeFileSync(walletConnectVerificationPath, walletConnectVerificationCode);
    console.log(
      `Generated walletconnect.txt with content:`,
      walletConnectVerificationCode
    );

  }
  // optimize for build by default but not for local dev server
  if (process.env.WEBPACK_OPTIMIZE_FOR_BUILD !== "false") {
    // optimization configuration with safer chunking
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
          // main vendor bundle for larger modules
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all",
            priority: 10,
            enforce: true,
          },
          // separate bundle for react and related packages
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
            name: "react-vendor",
            chunks: "all",
            priority: 20,
          },
          // bundle for wallet-related packages
          wallets: {
            test: /[\\/]node_modules[\\/](@cosmjs|@rainbow-me|osmojs|@cosmos-kit|chain-registry|ethers|viem|wagmi)[\\/]/,
            name: "wallet-vendor",
            chunks: "all",
            priority: 15,
          },
          // common code used across multiple components
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
  }

  return config;
};
