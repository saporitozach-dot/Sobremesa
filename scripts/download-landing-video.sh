#!/usr/bin/env bash
# Download royalty-free restaurant dining loop for the landing screen.
# Mixkit license: free for commercial use — https://mixkit.co/license/
set -euo pipefail

OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/assets/video"
OUT_FILE="$OUT_DIR/auth-loop.mp4"
URL="https://assets.mixkit.co/videos/4385/4385-720.mp4"

mkdir -p "$OUT_DIR"

echo "→ Downloading restaurant dining clip..."
curl -fL \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
  -H "Referer: https://mixkit.co/" \
  -o "$OUT_FILE" \
  "$URL"

echo "✓ Saved $OUT_FILE ($(du -h "$OUT_FILE" | cut -f1))"
