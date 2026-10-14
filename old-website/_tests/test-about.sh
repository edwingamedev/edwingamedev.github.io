#!/usr/bin/env bash

set -e

HOME_FILE="_site/index.html"

NORMALIZED_HOME=$(tr '\n' ' ' < "$HOME_FILE" | sed 's/[[:space:]]\+/ /g')

echo "Testing About section..."

echo "Checking About section exists..."
grep -q 'id="about"' "$HOME_FILE"
grep -q 'About' "$HOME_FILE"

echo "Checking updated About content..."
grep -q "Senior Game Developer" <<< "$NORMALIZED_HOME"
grep -q "over 13 years of professional experience" <<< "$NORMALIZED_HOME"
grep -q "gameplay systems, tools, mobile development and game architecture" <<< "$NORMALIZED_HOME"
grep -q 'shipped games' "$HOME_FILE"
grep -q 'LiveOps systems' "$HOME_FILE"
grep -q 'independently' "$HOME_FILE"

echo "Checking old About copy was removed..."

if grep -q 'passionate about games' "$HOME_FILE"; then
    echo "ERROR: Old About copy is still present"
    exit 1
fi

if grep -q 'more than 30 projects' "$HOME_FILE"; then
    echo "ERROR: Old project-count copy is still present"
    exit 1
fi

if grep -q 'adapt to any type of code base' "$HOME_FILE"; then
    echo "ERROR: Old codebase copy is still present"
    exit 1
fi

echo "Checking About image accessibility..."
grep -q 'alt="Edwin Holanda"' "$HOME_FILE"

echo "About tests passed"