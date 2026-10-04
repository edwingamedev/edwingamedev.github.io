#!/usr/bin/env bash

set -e

HOME_FILE="_site/index.html"

echo "Testing Skills section..."

echo "Checking section exists..."
grep -q 'id="skills"' "$HOME_FILE"
HOME_HTML=$(tr '\n\r\t' '   ' < "$HOME_FILE" | tr -s ' ')

echo "Checking core stack..."
grep -q 'Unity' "$HOME_FILE"
grep -q 'C#' "$HOME_FILE"

echo "Checking skill categories..."
grep -q 'Gameplay' "$HOME_FILE"
grep -q 'Engineering' "$HOME_FILE"
grep -q 'LiveOps' "$HOME_FILE"
grep -q 'Tools' "$HOME_FILE"
grep -q 'SDK &amp; Integration\|SDK & Integration' "$HOME_FILE"
grep -q 'Platforms' "$HOME_FILE"

echo "Checking representative skills..."
grep -q 'Gameplay Systems' "$HOME_FILE"
grep -q 'Dependency Injection' "$HOME_FILE"
grep -q 'Performance Optimization' "$HOME_FILE"
grep -q 'Remote Configuration' "$HOME_FILE"
grep -q 'Unity Editor Tools' "$HOME_FILE"
grep -q 'REST APIs' "$HOME_FILE"
grep -q 'Android' "$HOME_FILE"
grep -q 'WebGL' "$HOME_FILE"

echo "Checking old progress bars were removed..."

if grep -q 'progressbar' "$HOME_FILE"; then
    echo "ERROR: Old progress bar markup is still present"
    exit 1
fi

echo "Checking old skill levels were removed..."

if grep -q 'aria-valuenow=' "$HOME_FILE"; then
    echo "ERROR: Old numeric skill levels are still present"
    exit 1
fi

echo "Skills tests passed"