#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  Building IronTrack iOS App (.ipa)"
echo "  For sideloading with iLoader"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/build"
IOS_DIR="$PROJECT_ROOT/ios/IronTrack"

# 1. Build Frontend
echo "==> Building web frontend..."
cd "$PROJECT_ROOT"
npm run build

# 2. Sync to iOS assets directory
echo "==> Embedding web bundle into iOS project..."
mkdir -p "$IOS_DIR/IronTrack/www"
cp -R "$PROJECT_ROOT/dist/"* "$IOS_DIR/IronTrack/www/"

# 3. Create build directory
mkdir -p "$BUILD_DIR"

if command -v xcodebuild >/dev/null 2>&1 && xcodebuild -version >/dev/null 2>&1; then
    echo "==> Archiving iOS project with xcodebuild..."
    cd "$IOS_DIR"
    
    xcodebuild archive \
      -project IronTrack.xcodeproj \
      -scheme IronTrack \
      -configuration Release \
      -destination "generic/platform=iOS" \
      -archivePath "$BUILD_DIR/IronTrack.xcarchive" \
      CODE_SIGN_IDENTITY="" \
      CODE_SIGNING_REQUIRED=NO \
      CODE_SIGNING_ALLOWED=NO

    echo "==> Packaging .ipa archive for sideloading (iLoader)..."
    mkdir -p "$BUILD_DIR/Payload"
    cp -R "$BUILD_DIR/IronTrack.xcarchive/Products/Applications/IronTrack.app" "$BUILD_DIR/Payload/"
    
    cd "$BUILD_DIR"
    zip -qr "IronTrack.ipa" "Payload"
    rm -rf "Payload"

    echo ""
    echo " SUCCESS! IronTrack.ipa generated at:"
    echo " -> $BUILD_DIR/IronTrack.ipa"
    echo ""
    echo "You can now open iLoader on your computer and sideload IronTrack.ipa onto your iPhone!"
else
    echo "Notice: xcodebuild is not available in the current environment or active directory."
    echo "You can build the IPA using one of the following simple options:"
    echo "  1. GitHub Actions: Push to your GitHub repo and the automated workflow will build IronTrack.ipa for you to download from GitHub Releases!"
    echo "  2. Open $IOS_DIR/IronTrack.xcodeproj in Xcode on your Mac and choose Product -> Archive."
fi

