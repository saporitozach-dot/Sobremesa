ENTRY ?= index.tsx
BUNDLE_OUT ?= ios/main.jsbundle
ASSETS_DEST ?= ios

.PHONY: help bundle-ios

help:
	@echo "Available targets:"
	@echo "  bundle-ios    Bundle the iOS app JS with ENTRY=$(ENTRY), OUTPUT=$(BUNDLE_OUT), ASSETS_DEST=$(ASSETS_DEST)"

bundle-ios:
	@echo "Bundling iOS app with entry $(ENTRY), output $(BUNDLE_OUT), assets destination $(ASSETS_DEST)"
	@OUTPUT=$(BUNDLE_OUT) ASSETS_DEST=$(ASSETS_DEST) bash scripts/bundle-ios.sh $(ENTRY)
