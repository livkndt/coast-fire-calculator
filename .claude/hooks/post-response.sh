#!/usr/bin/env bash
# Runs after every Claude response. Autofixes lint, then checks typecheck + tests.
# Blocks Claude's stop and returns failures as feedback if anything is red.

set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

FAILURES=""

lint_out=$(npx eslint . --ext .ts,.vue --fix --quiet 2>&1) || {
  FAILURES="${FAILURES}### Lint errors (after --fix)\n${lint_out}\n\n"
}

tc_out=$(npx tsc --noEmit 2>&1) || {
  FAILURES="${FAILURES}### Typecheck errors\n${tc_out}\n\n"
}

test_out=$(npx vitest run 2>&1 | tail -20) || {
  FAILURES="${FAILURES}### Test failures\n${test_out}\n\n"
}

if [ -n "$FAILURES" ]; then
  reason=$(printf '%s' "$FAILURES" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")
  echo "{\"decision\": \"block\", \"reason\": $reason}"
fi
