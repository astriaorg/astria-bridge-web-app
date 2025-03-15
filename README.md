# Astria BridgePage Web App

This directory contains the source code and tooling for the front-end for
the Astria bridge.

## `web` application directory structure

* `config-overrides.js` - used by `react-app-rewired` to override CRA's default
  webpack config
* `public/index.html`
  * html meta stuff, import styles and fonts
  * define React root element
* `src/index.tsx`
  * React application setup
  * import styles
  * ConfigContextProvider is here to provide config to App
* `src/App.tsx`
  * main application component
  * define routes
  * rest of context providers, e.g. notifications, rainbowkit, etc
* `src/setupTests.tsx`
  * most jest mocks defined here (some mocks defined in individual test files)
  * browser global mocks defined here
* `src/testHelpers.tsx` - helper functions for testing
* `src/components` - More general React components for the app, e.g. Navbar,
  Dropdown, CopyToClipboardButton, etc
* `src/config` - Configuration for the web app
  * `src/config/chainConfigs` - Celestia and Astria chain information
  * `src/config/contexts` - Config context and context provider
  * `src/config/hooks` - Custom hook to make config easy to use
  * `src/config/env.ts` - Environment variable definitions plus utilities for
    consuming them
  * `src/config/index.ts` - AppConfig and exports
* `src/features` - Organizes components, contexts, hooks, services, types, and
  utils for different features
  * `src/features/CosmosWallet` - User for interacting with Keplr wallet
  * `src/features/EvmWallet` - Used for interacting with EVM wallets
  * `src/features/Notifications` - Used for displaying notifications and toasts
* `src/pages`
  * React components for each page
  * `src/pages/Layout.tsx`
    * page layout component using `<Outlet />`
    * contains `<Navbar />`, `<Notification />`
* `src/styles`
  * all style definitions
  * using scss
  * using [bulma](https://bulma.io/documentation/) css framework

## Commands

```bash
# install npm deps and run web app locally
just web init-env
just web install
just web run

# build web app static files
just web build
```

## How Tos

* How to add new chain configs for a new environment (e.g. you want to add new
  chain configs for "mainnet")
  * create file that will contain the config values

    ```sh
    touch web/src/config/chainConfigs/ChainConfigsMainnet.ts
    ```

  * import new configs in
    `astria-bridge-web-app/web/src/config/chainConfigs/index.ts`, while renaming
    them

    ```typescript
    import {
      evmChains as mainnetEvmChains,
      ibcChains as mainnetIbcChains,
    } from "./ChainConfigsMainnet"; 
    ```

  * add entry to `EVM_CHAIN_CONFIGS`

    ```typescript
    const ENV_CHAIN_CONFIGS = {
      local: { evm: localEvmChains, ibc: localIbcChains },
      dusk: { evm: duskEvmChains, ibc: duskIbcChains },
      dawn: { evm: dawnEvmChains, ibc: dawnIbcChains },
      mainnet: { evm: mainnetEvmChains, ibc: mainnetIbcChains },
    } as const;
    ```
