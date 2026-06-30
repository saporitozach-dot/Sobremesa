#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/ruby/bin:$HOME/.local/node-v22.16.0-darwin-arm64/bin:$PATH"

cd "$ROOT"

echo "→ Bundling JavaScript..."
BUNDLE_OUT="$ROOT/ios/Sobremesa/main.jsbundle"
ENTRY_FILE="$(node -e "require('expo/scripts/resolveAppEntry')" "$ROOT" ios absolute | tail -n 1)"
CLI_PATH="$(node --print "require.resolve('@expo/cli', { paths: [require.resolve('expo/package.json')] })")"
node "$CLI_PATH" export:embed \
  --entry-file "$ENTRY_FILE" \
  --platform ios \
  --dev false \
  --bundle-output "$BUNDLE_OUT" \
  --assets-dest "$ROOT/ios/Sobremesa" \
  --reset-cache

echo "→ Clean building iOS..."
cd ios
xcodebuild clean -workspace Sobremesa.xcworkspace -scheme Sobremesa -configuration Debug -quiet
xcodebuild \
  -workspace Sobremesa.xcworkspace \
  -scheme Sobremesa \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  build

APP="$HOME/Library/Developer/Xcode/DerivedData/Sobremesa-bepailrylgtotxepaatiirekhpdm/Build/Products/Debug-iphonesimulator/Sobremesa.app"
if [[ -d "$APP" ]]; then
  echo "→ Installing on booted simulator..."
  xcrun simctl install booted "$APP" || true
  xcrun simctl launch booted com.sobremesa.app || true
fi

echo "✓ Rebuild complete"
