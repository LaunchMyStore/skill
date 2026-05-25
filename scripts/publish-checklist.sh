#!/usr/bin/env bash
# Pre-release gate. Run from repo root:
#   bash scripts/publish-checklist.sh
#
# Exits non-zero if any forbidden token leaks into shipped content.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> brand + internals + secrets + test creds + localhost grep"
PATTERN='shopify|BackendNest|CustomerLMS|TeamInfra|order\.service\.ts|sections\.service\.ts|npm_O|npm_w|hc_live_|master\.morris0792|raja337276|127\.0\.0\.1:8080|localhost:'

if grep -rniE "$PATTERN" \
    --include='*.md' \
    --include='*.mdx' \
    --include='*.json' \
    --include='*.js' \
    --include='*.ts' \
    --include='*.tsx' \
    --include='*.liquid' \
    --include='*.aqua' \
    --exclude-dir=scripts \
    .; then
  echo
  echo "!! release gate FAILED — fix the matches above before publishing"
  exit 1
fi

echo "==> all clean. safe to publish."
