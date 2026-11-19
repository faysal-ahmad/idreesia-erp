#!/usr/bin/env bash
#
# Creates idreesia-mobile's Cordova project from scratch (a CI runner has no
# .meteor/local/cordova-build). Meteor 3.5 can't do that while
# .meteor/cordova-plugins lists `file://` plugins: adding the platform fails
# with npm EINVALIDPACKAGENAME (see cordova-plugins/README.md). So this builds
# once without those lines, which adds the platforms and the registry plugins,
# then restores the file. The real build that follows installs the local
# plugins into the existing project.
#
# Usage: scripts/prepare-cordova-project.sh <android|ios> <server-url> <mobile-settings.json>
set -euo pipefail

platform="$1"
server="$2"
settings="$3"

cd "$(dirname "$0")/../idreesia-mobile"

plugins=.meteor/cordova-plugins
backup=$(mktemp)
output=$(mktemp -d)
cp "$plugins" "$backup"
trap 'cp "$backup" "$plugins"; rm -rf "$backup" "$output"' EXIT

grep -v 'file://' "$backup" > "$plugins"

METEOR_PACKAGE_DIRS=../ meteor build "$output" \
  --platforms "$platform" \
  --server "$server" \
  --mobile-settings "$settings"
