#!/bin/bash
# Keep embedded Xcode bundles in production mode to avoid Metro devtools websocket errors.
set -euo pipefail

RN_XCODE="$(node --print "require('path').join(require('path').dirname(require.resolve('react-native/package.json')), 'scripts/react-native-xcode.sh')")"

if grep -q 'Embedded bundles cannot use Metro devtools' "$RN_XCODE"; then
  exit 0
fi

perl -0pi -e 's/    DEV=true\n    ;;/    if [[ "\$FORCE_BUNDLING" ]]; then\n      echo "FORCE_BUNDLING enabled; continuing to bundle."\n      # Embedded bundles cannot use Metro devtools websockets.\n      DEV=false\n    else\n      DEV=true\n    fi\n    ;;/s' "$RN_XCODE"
