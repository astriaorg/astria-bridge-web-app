# Web

This directory contains the source code and tooling for the front-end web
portion of the Astria React starter. It contains some Astria assets (like
fonts!), branded styling, and some common React components (but not many).

## Table of Contents

1. [Dependencies](#dependencies)
2. [Setup](#setup)
3. [Available Scripts](#available-scripts)
4. [Styling](#styling)

## Dependencies

This web app is a Typescript
[CRA](https://github.com/facebook/create-react-app) app.

* [Node.js v18](https://nodejs.org/en/)
  * Not required, but I recommend
    using [Volta](https://github.com/volta-cli/volta)
    to easily manage multiple versions of Node on your machine
  * Can also use [nvm](https://github.com/nvm-sh/nvm)
  * Or install [Node18](https://nodejs.org/en/about/previous-releases) manually
  * [Just](https://github.com/casey/just#installation) - command runner

## Setup

```sh
# generate env file
cp .env.example .env
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section
about [running tests](https://facebook.github.io/create-react-app/docs/running-tests)
for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the
best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section
about [deployment](https://facebook.github.io/create-react-app/docs/deployment)
for more information.

## Styling

Uses [bulma](https://bulma.io/) for styling.

Can override variables in [src/styles/index.scss](src/styles/index.scss).

<https://bulma.io/documentation/customize/variables/>
<https://bulma.io/documentation/components/navbar/#variables>
