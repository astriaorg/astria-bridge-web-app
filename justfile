import 'justfile.codestyle'
import 'justfile.tests'

default:
  @just --list

# Project Setup

# copies web/.env.example to web/.env
generate-initial-web-env:
  cp web/.env.example web/.envlocaldev

# installs npm deps for web
install-web-deps:
  cd web && npm install

# builds the typescript for the front end app
build-web:
  cd web && npm run build

# deploys a temporarily accessible preview of the site
deploy-hosting-preview:
  GOOGLE_APPLICATION_CREDENTIALS=./web/src/gsa-key.json \
    firebase hosting:channel:deploy astriatest

# run front end app locally,
# with file watching that triggers rebuilds
run-web-local:
  cp web/.env.example web/.env
  cd web && npm run start

## Utilities

# encodes a file as base64
encode-base64 filepath:
  base64 -i {{filepath}}

# compacts contents of json file
compact-json filepath:
  cat {{filepath}} | jq -c

# generate a bearer token for the actuation-gateway service
generate-bearer-token:
  openssl rand -base64 24 | tr -dc A-Za-z0-9 | head -c 32
