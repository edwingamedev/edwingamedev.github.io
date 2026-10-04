#!/usr/bin/env bash

set -e

HOME_FILE="_site/index.html"

PROJECT_FILE=$(find _site/projects -name "index.html" | head -n 1)

echo "Testing homepage metadata..."

grep -q 'Edwin Holanda | Senior Game Developer' "$HOME_FILE"
grep -q 'name="description"' "$HOME_FILE"
grep -q 'rel="canonical"' "$HOME_FILE"
grep -q 'property="og:title"' "$HOME_FILE"
grep -q 'property="og:description"' "$HOME_FILE"
grep -q 'property="og:image"' "$HOME_FILE"
grep -q 'property="og:url"' "$HOME_FILE"
grep -q 'name="twitter:card"' "$HOME_FILE"

echo "Homepage metadata OK"

if [ -n "$PROJECT_FILE" ]; then
    echo "Testing project metadata..."

    grep -q '| Edwin Holanda' "$PROJECT_FILE"
    grep -q 'property="og:title"' "$PROJECT_FILE"
    grep -q 'property="og:image"' "$PROJECT_FILE"
    grep -q 'name="twitter:title"' "$PROJECT_FILE"

    echo "Project metadata OK"
fi

echo "Testing absolute URLs..."

grep -q 'https://edwingamedev.github.io' "$HOME_FILE"

echo "Testing duplicate metadata..."

test "$(grep -c '<title>' "$HOME_FILE")" -eq 1
test "$(grep -c 'name="description"' "$HOME_FILE")" -eq 1
test "$(grep -c 'property="og:title"' "$HOME_FILE")" -eq 1

echo "SEO tests passed"