#!/usr/bin/env bash

set -e

HOME_FILE="_site/index.html"

echo "Testing Hero section..."

echo "Checking Hero structure..."
grep -q 'id="front"' "$HOME_FILE"
grep -q 'class="hero-content"' "$HOME_FILE"
grep -q 'class="hero-visual"' "$HOME_FILE"
grep -q 'class="hero-actions"' "$HOME_FILE"

echo "Checking Hero content..."
grep -q 'Edwin Holanda' "$HOME_FILE"
grep -q 'Senior Game Developer' "$HOME_FILE"
grep -q 'I build gameplay systems, tools and mobile features with Unity and C#.' "$HOME_FILE"

echo "Checking Hero CTAs..."
grep -q 'href="#projects"' "$HOME_FILE"
grep -q 'View Work' "$HOME_FILE"

grep -q 'href="#contact"' "$HOME_FILE"
grep -q 'Contact' "$HOME_FILE"

echo "Checking Hero heading..."
test "$(grep -c '<h1' "$HOME_FILE")" -eq 1

echo "Checking old Hero behavior was removed..."

if grep -q 'href="/"[^>]*class="profile-pic-link"' "$HOME_FILE"; then
    echo "ERROR: Old clickable Hero logo is still present"
    exit 1
fi

echo "Hero tests passed"