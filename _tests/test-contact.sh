#!/usr/bin/env bash

set -e

HOME_FILE="_site/index.html"

normalize_html() {
    tr '\n\r\t' '   ' < "$1" | tr -s ' '
}

strip_tags() {
    sed 's/<[^>]*>/ /g' | tr -s ' '
}

HOME_HTML=$(normalize_html "$HOME_FILE")
HOME_TEXT=$(printf '%s\n' "$HOME_HTML" | strip_tags)

echo "Testing Contact section..."

echo "Checking Contact section exists..."
echo "$HOME_HTML" | grep -q 'id="contact"'
echo "$HOME_TEXT" | grep -q 'Contact'

echo "Checking updated Contact content..."
echo "$HOME_TEXT" | grep -q "I'm open to opportunities, collaborations and conversations about game development."
echo "$HOME_TEXT" | grep -q 'The best way to reach me is by email.'
echo "$HOME_TEXT" | grep -q 'GitHub'
echo "$HOME_TEXT" | grep -q 'LinkedIn'
echo "$HOME_TEXT" | grep -q 'Game Jolt'

echo "Checking contact methods..."
echo "$HOME_HTML" | grep -q 'mailto:'
echo "$HOME_HTML" | grep -q 'aria-label="GitHub"'
echo "$HOME_HTML" | grep -q 'aria-label="LinkedIn"'
echo "$HOME_HTML" | grep -q 'aria-label="Game Jolt"'

echo "Checking removed social links..."

if echo "$HOME_HTML" | grep -q 'aria-label="Instagram"'; then
    echo "ERROR: Instagram link is still present"
    exit 1
fi

if echo "$HOME_HTML" | grep -q 'aria-label="Twitter"'; then
    echo "ERROR: Twitter link is still present"
    exit 1
fi

echo "Checking external link security..."

CONTACT_BLOCK=$(awk '
    /<section[^>]*id="contact"/ {
        collecting = 1
    }

    collecting {
        print
    }

    collecting && /<\/section>/ {
        exit
    }
' "$HOME_FILE")

CONTACT_HTML=$(printf '%s\n' "$CONTACT_BLOCK" \
    | tr '\n\r\t' '   ' \
    | tr -s ' ')

UNSAFE_LINKS=$(printf '%s\n' "$CONTACT_HTML" \
    | grep -o '<a[^>]*target="_blank"[^>]*>' \
    | grep -v 'rel="noopener noreferrer"' || true)

if [ -n "$UNSAFE_LINKS" ]; then
    echo "$UNSAFE_LINKS"
    echo 'ERROR: Found unsafe external link in Contact section'
    exit 1
fi

echo "Contact tests passed"