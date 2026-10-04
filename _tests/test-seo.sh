#!/usr/bin/env bash

set -e

HOME_FILE="_site/index.html"
PROJECT_FILE=$(find _site/projects -name "index.html" | head -n 1)

normalize_html() {
    tr '\n\r\t' '   ' < "$1" | tr -s ' '
}

HOME_HTML=$(normalize_html "$HOME_FILE")

echo "Testing homepage metadata..."

echo "$HOME_HTML" | grep -q '<title>Edwin Holanda | Senior Game Developer</title>'
echo "$HOME_HTML" | grep -q 'name="description"'
echo "$HOME_HTML" | grep -q 'rel="canonical"'
echo "$HOME_HTML" | grep -q 'property="og:title"'
echo "$HOME_HTML" | grep -q 'property="og:description"'
echo "$HOME_HTML" | grep -q 'property="og:image"'
echo "$HOME_HTML" | grep -q 'property="og:url"'
echo "$HOME_HTML" | grep -q 'name="twitter:card"'

echo "Homepage metadata OK"

if [ -n "$PROJECT_FILE" ]; then
    echo "Testing project metadata..."

    PROJECT_HTML=$(normalize_html "$PROJECT_FILE")

    echo "$PROJECT_HTML" | grep -q '| Edwin Holanda</title>'
    echo "$PROJECT_HTML" | grep -q 'property="og:title"'
    echo "$PROJECT_HTML" | grep -q 'property="og:image"'
    echo "$PROJECT_HTML" | grep -q 'name="twitter:title"'

    echo "Project metadata OK"
fi

echo "Testing absolute URLs..."

echo "$HOME_HTML" | grep -q 'https://edwingamedev.github.io'

echo "Testing duplicate metadata..."

test "$(grep -c '<title>' "$HOME_FILE")" -eq 1
test "$(grep -c 'name="description"' "$HOME_FILE")" -eq 1
test "$(grep -c 'property="og:title"' "$HOME_FILE")" -eq 1

echo "SEO tests passed"