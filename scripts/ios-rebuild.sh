#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/ruby/bin:$HOME/.local/node-v22.16.0-darwin-arm64/bin:$PATH"

cd "$ROOT"

echo "→ Installing iOS pods..."
cd ios
export PATH="$HOME/.local/ruby/bin:$PATH"
security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > /tmp/ios-cacert.pem 2>/dev/null || true
export SSL_CERT_FILE=/tmp/ios-cacert.pem
if ! pod install --no-repo-update; then
  echo "pod install failed; continuing with existing Pods if present."
fi
ruby "$ROOT/scripts/patch-ios-explicit-modules.rb"

echo "→ Bundling JavaScript..."
cd "$ROOT"
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

echo "→ Patching Xcode explicit-module settings..."
ruby "$ROOT/scripts/patch-ios-explicit-modules.rb"

echo "→ Wiring bundled assets into Copy Bundle Resources..."
ruby "$ROOT/scripts/add-assets-resource.rb"

echo "→ Clearing stale DerivedData..."
find "$HOME/Library/Developer/Xcode/DerivedData" -maxdepth 1 -type d -name 'Sobremesa-*' -exec rm -rf {} + 2>/dev/null || true

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

# Ask Xcode where it actually put the product. The DerivedData hash changes
# whenever the project moves, and a stale hardcoded path made this step silently
# no-op — the build succeeded and the simulator kept running the old install.
BUILT_PRODUCTS_DIR="$(xcodebuild \
  -workspace Sobremesa.xcworkspace \
  -scheme Sobremesa \
  -configuration Debug \
  -sdk iphonesimulator \
  -showBuildSettings 2>/dev/null | awk -F' = ' '/ BUILT_PRODUCTS_DIR /{print $2; exit}')"
APP="$BUILT_PRODUCTS_DIR/Sobremesa.app"
if [[ -d "$APP" ]]; then
  echo "→ Installing on booted simulator..."
  xcrun simctl install booted "$APP"
  xcrun simctl terminate booted com.saporitozach.sobremesa 2>/dev/null || true
  xcrun simctl launch booted com.saporitozach.sobremesa
else
  echo "! Built product not found at $APP — skipping install." >&2
fi

echo "✓ Rebuild complete"
