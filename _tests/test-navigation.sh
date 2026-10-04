#!/usr/bin/env bash

set -e

HOME_FILE="_site/index.html"

echo "Testing navigation..."

echo "Checking homepage nav items..."

grep -q 'href="#projects"' "$HOME_FILE"
grep -q 'href="#skills"' "$HOME_FILE"
grep -q 'href="#about"' "$HOME_FILE"
grep -q 'href="#contact"' "$HOME_FILE"

grep -q 'PROJECTS' "$HOME_FILE"
grep -q 'SKILLS' "$HOME_FILE"
grep -q 'ABOUT' "$HOME_FILE"
grep -q 'CONTACT' "$HOME_FILE"

echo "Checking removed HOME nav item..."

if grep -q '>HOME<' "$HOME_FILE"; then
    echo "ERROR: HOME item should not be present in homepage navigation"
    exit 1
fi

echo "Checking logo points to hero on homepage..."

LOGO_BLOCK=$(awk '
    /class="nav-logo-button"/ {
        collecting = 1
        tag = $0

        if ($0 ~ />/) {
            print tag
            exit
        }

        next
    }

    collecting {
        tag = tag " " $0

        if ($0 ~ />/) {
            print tag
            exit
        }
    }
' "$HOME_FILE")

echo "$LOGO_BLOCK" | grep -q 'href="#front"'

echo "Checking section order..."

PROJECTS_LINE=$(grep -n 'id="projects"' "$HOME_FILE" | head -n 1 | cut -d: -f1)
SKILLS_LINE=$(grep -n 'id="skills"' "$HOME_FILE" | head -n 1 | cut -d: -f1)
ABOUT_LINE=$(grep -n 'id="about"' "$HOME_FILE" | head -n 1 | cut -d: -f1)
CONTACT_LINE=$(grep -n 'id="contact"' "$HOME_FILE" | head -n 1 | cut -d: -f1)

if [ -z "$PROJECTS_LINE" ] || [ -z "$SKILLS_LINE" ] || [ -z "$ABOUT_LINE" ] || [ -z "$CONTACT_LINE" ]; then
    echo "ERROR: One or more homepage sections were not found"
    exit 1
fi

if [ "$PROJECTS_LINE" -ge "$SKILLS_LINE" ]; then
    echo "ERROR: PROJECTS must appear before SKILLS"
    exit 1
fi

if [ "$SKILLS_LINE" -ge "$ABOUT_LINE" ]; then
    echo "ERROR: SKILLS must appear before ABOUT"
    exit 1
fi

if [ "$ABOUT_LINE" -ge "$CONTACT_LINE" ]; then
    echo "ERROR: ABOUT must appear before CONTACT"
    exit 1
fi

echo "Navigation tests passed"