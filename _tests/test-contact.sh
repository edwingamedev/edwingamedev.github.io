#!/usr/bin/env bash

set -e

HOME_FILE="_site/index.html"

echo "Testing Contact section..."

echo "Checking Contact section exists..."
grep -q 'id="contact"' "$HOME_FILE"
grep -q 'Contact' "$HOME_FILE"

echo "Checking updated Contact content..."
grep -q "I'm open to opportunities, collaborations and conversations about game development." "$HOME_FILE"
grep -q 'The best way to reach me is by email.' "$HOME_FILE"
grep -q 'GitHub' "$HOME_FILE"
grep -q 'LinkedIn' "$HOME_FILE"
grep -q 'Game Jolt' "$HOME_FILE"

echo "Checking contact methods..."
grep -q 'mailto:' "$HOME_FILE"
grep -q 'aria-label="GitHub"' "$HOME_FILE"
grep -q 'aria-label="LinkedIn"' "$HOME_FILE"
grep -q 'aria-label="Game Jolt"' "$HOME_FILE"

echo "Checking removed social links..."

if grep -q 'aria-label="Instagram"' "$HOME_FILE"; then
    echo "ERROR: Instagram link is still present"
    exit 1
fi

if grep -q 'aria-label="Twitter"' "$HOME_FILE"; then
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

UNSAFE_LINKS=$(printf '%s\n' "$CONTACT_BLOCK" | awk '
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
')

if [ -n "$UNSAFE_LINKS" ]; then
    echo "$UNSAFE_LINKS"
    echo 'ERROR: Found unsafe external link in Contact section'
    exit 1
fi

echo "Contact tests passed"