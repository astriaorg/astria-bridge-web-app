import 'justfile.codestyle'
import 'justfile.utils'
import 'justfile.tests'

mod web

_default:
  @just --list

# generate codebase.md that is useful to feed to LLMs
[group('extra')]
ai-digest:
   npx ai-digest -i web --show-output-files
