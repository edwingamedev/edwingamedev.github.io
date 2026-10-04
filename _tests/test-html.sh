#!/usr/bin/env bash

set -e

HOME_FILE="_site/index.html"

echo "Testing HTML semantics and accessibility..."

echo "Checking invalid </br> tags..."
if grep -R -n '</br>' _site; then
    echo "ERROR: Found invalid </br> tags"
    exit 1
fi

echo "Checking deprecated project-image ids..."
if grep -R -n 'id="project-image"' _site; then
    echo "ERROR: Found project-image used as an id"
    exit 1
fi

echo "Checking homepage structure..."
grep -q '<html lang="en">' "$HOME_FILE"
grep -q '<main>' "$HOME_FILE"
grep -q '<nav' "$HOME_FILE"
grep -q '<footer' "$HOME_FILE"

echo "Checking heading hierarchy..."
test "$(grep -c '<h1' "$HOME_FILE")" -eq 1
test "$(grep -c '<h2' "$HOME_FILE")" -ge 4

echo "Checking navigation accessibility..."
grep -q 'aria-label="Primary navigation"' "$HOME_FILE"
grep -q 'aria-controls="navLinks"' "$HOME_FILE"
grep -q 'aria-expanded="false"' "$HOME_FILE"
grep -q 'aria-label="Back to top"' "$HOME_FILE"

echo "Checking images for alt attributes..."
MISSING_ALT=$(grep -R '<img ' _site \
    | grep -v 'alt=' \
    | grep -v 'aria-hidden="true"' || true)

if [ -n "$MISSING_ALT" ]; then
    echo "$MISSING_ALT"
    echo "ERROR: Found image without alt attribute"
    exit 1
fi

echo "Checking iframes for titles..."

MISSING_IFRAME_TITLE=$(awk '
    /<iframe/ {
        collecting = 1
        tag = $0
        next
    }

    collecting {
        tag = tag " " $0

        if ($0 ~ />/) {
            if (tag !~ /title[[:space:]]*=/) {
                print tag
            }

            collecting = 0
            tag = ""
        }
    }
' $(find _site -name "*.html"))

if [ -n "$MISSING_IFRAME_TITLE" ]; then
    echo "$MISSING_IFRAME_TITLE"
    echo "ERROR: Found iframe without title attribute"
    exit 1
fi

echo "Checking target=_blank security attributes..."

UNSAFE_BLANK_LINKS=$(awk '
    /<a[[:space:]>]/ {
        collecting = 1
        tag = $0

        if ($0 ~ />/) {
            if (tag ~ /target[[:space:]]*=[[:space:]]*"_blank"/ &&
                tag !~ /rel[[:space:]]*=[[:space:]]*"noopener noreferrer"/) {
                print tag
            }

            collecting = 0
            tag = ""
        }

        next
    }

    collecting {
        tag = tag " " $0

        if ($0 ~ />/) {
            if (tag ~ /target[[:space:]]*=[[:space:]]*"_blank"/ &&
                tag !~ /rel[[:space:]]*=[[:space:]]*"noopener noreferrer"/) {
                print tag
            }

            collecting = 0
            tag = ""
        }
    }
' $(find _site -name "*.html"))

if [ -n "$UNSAFE_BLANK_LINKS" ]; then
    echo "$UNSAFE_BLANK_LINKS"
    echo 'ERROR: Found target="_blank" without rel="noopener noreferrer"'
    exit 1
fi

echo "Checking duplicate footer..."
test "$(grep -c '<footer' "$HOME_FILE")" -eq 1

echo "Checking duplicate navbar..."
test "$(grep -c '<nav' "$HOME_FILE")" -eq 1

echo "HTML semantics and accessibility tests passed"