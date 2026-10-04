#!/usr/bin/env bash

set -e

echo "Building site..."
bundle exec jekyll build

echo
echo "Running SEO tests..."
bash _tests/test-seo.sh

echo
echo "Running HTML semantics tests..."
bash _tests/test-html.sh

echo
echo "Running navigation tests..."
bash _tests/test-navigation.sh

echo
echo "Running Hero tests..."
bash _tests/test-hero.sh

echo
echo "Running Experience tests..."
bash _tests/test-experience.sh

echo
echo "Running About tests..."
bash _tests/test-about.sh

echo
echo "Running Skills tests..."
bash _tests/test-skills.sh

echo
echo "Running Contact tests..."
bash _tests/test-contact.sh

echo
echo "All tests passed"