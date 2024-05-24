import 'justfile.codestyle'
import 'justfile.starter-app'
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
