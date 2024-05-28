# Astria BridgePage Web App

This directory contains the source code and tooling for the front-end for
the Astria bridge.

## Components

* `public/index.html` - import styles, fonts; define react root element
* `index.tsx` - React application setup; styles imported
* `App.tsx` - main application component; define routes; use context providers
* `chainInfos` - Celestia and Astria chain information
* `components` - React components
* `contexts` - React context definitions
* `pages` - React components for each page
* `providers` - React context provider definitions
* `services` - api services; Keplr services; IBC services; 3rd party wrappers;
etc.
* `styles` - all style definitions; using scss
* `types` - type definitions
* `utils` - utility functions

## Commands

```bash
# install npm deps and run web app locally
just install-web-deps
just generate-initial-web-env
just run-web-local

# build web app static files
just build-web
```
