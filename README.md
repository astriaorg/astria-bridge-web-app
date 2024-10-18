# Astria BridgePage Web App

This directory contains the source code and tooling for the front-end for
the Astria bridge.

## `web` application directory structure

* `public/index.html`
  * html meta stuff, import styles and fonts
  * define React root element
* `src/index.tsx`
  * React application setup
  * import styles
* `src/App.tsx`
  * main application component
  * define routes
  * use context providers
* `src/chainInfos` - Celestia and Astria chain information
* `src/components` - React components
* `src/contexts` - React context definitions
* `src/pages`
  * React components for each page
  * `src/pages/Layout.tsx`
    * page layout component using `<Outlet />`
    * contains `<Navbar />`, `<Notification />`
* `src/providers` - React context provider definitions
* `src/services`
  * api services
  * Keplr services
  * IBC services
  * 3rd party wrappers
* `src/styles`
  * all style definitions
  * using scss
  * using [bulma](https://bulma.io/documentation/) css framework
* `src/types` - type definitions
* `src/utils` - utility functions

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
  * update logic in `getIbcChains` and `getEvmChains`. add new condition to
    check for the new environment and use the correct config
    ```typescript
    if (getEnvVariable("REACT_APP_ENV") === "mainnet") {
      return mainnetIbcChains;
    }
    ```
