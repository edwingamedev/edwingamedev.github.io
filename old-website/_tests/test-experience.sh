#!/usr/bin/env bash

set -e

HOME_FILE="_site/index.html"

echo "Testing Experience section..."

echo "Checking Experience section exists..."
grep -q 'id="experience"' "$HOME_FILE"
grep -q 'Experience' "$HOME_FILE"

echo "Checking companies..."
grep -q 'Miniclip' "$HOME_FILE"
grep -q 'Marmalade Game Studio' "$HOME_FILE"
grep -q 'Edwin Game Dev' "$HOME_FILE"
grep -q 'Ideas Farm' "$HOME_FILE"

echo "Checking roles..."
grep -q 'Senior Unity Developer' "$HOME_FILE"
grep -q 'Senior Game Programmer' "$HOME_FILE"
grep -q 'Independent Game Developer' "$HOME_FILE"

echo "Checking representative highlights..."
grep -q 'Gameplay and LiveOps systems' "$HOME_FILE"
grep -q 'Worked on Ticket to Ride' "$HOME_FILE"
grep -q 'Full project ownership' "$HOME_FILE"
grep -q 'Mentored junior developers' "$HOME_FILE"

echo "Checking navigation includes Experience..."
grep -q 'href="#experience"' "$HOME_FILE"
grep -q 'EXPERIENCE' "$HOME_FILE"

echo "Checking section order..."

PROJECTS_LINE=$(grep -n 'id="projects"' "$HOME_FILE" | head -n 1 | cut -d: -f1)
EXPERIENCE_LINE=$(grep -n 'id="experience"' "$HOME_FILE" | head -n 1 | cut -d: -f1)
SKILLS_LINE=$(grep -n 'id="skills"' "$HOME_FILE" | head -n 1 | cut -d: -f1)
ABOUT_LINE=$(grep -n 'id="about"' "$HOME_FILE" | head -n 1 | cut -d: -f1)
CONTACT_LINE=$(grep -n 'id="contact"' "$HOME_FILE" | head -n 1 | cut -d: -f1)

if [ -z "$PROJECTS_LINE" ] || \
   [ -z "$EXPERIENCE_LINE" ] || \
   [ -z "$SKILLS_LINE" ] || \
   [ -z "$ABOUT_LINE" ] || \
   [ -z "$CONTACT_LINE" ]; then

    echo "ERROR: One or more homepage sections were not found"
    exit 1
fi

if [ "$PROJECTS_LINE" -ge "$EXPERIENCE_LINE" ]; then
    echo "ERROR: PROJECTS must appear before EXPERIENCE"
    exit 1
fi

if [ "$EXPERIENCE_LINE" -ge "$SKILLS_LINE" ]; then
    echo "ERROR: EXPERIENCE must appear before SKILLS"
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

echo "Experience tests passed"