#!/bin/bash
# Iron Frontier - Build Script
# Usage: ./scripts/build.sh [ios|android|webgl|macos] [release]

set -e

PLATFORM=${1:-macos}
BUILD_TYPE=${2:-development}
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UNITY_PATH="/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity"

echo "=== Iron Frontier Build Script ==="
echo "Platform: $PLATFORM"
echo "Build Type: $BUILD_TYPE"
echo "Project: $PROJECT_ROOT"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check Unity exists
if [ ! -f "$UNITY_PATH" ]; then
    echo -e "${RED}Unity 6000.3.5f1 not found!${NC}"
    echo "Expected path: $UNITY_PATH"
    exit 1
fi

# Set build method based on platform and type
case $PLATFORM in
    ios)
        if [ "$BUILD_TYPE" = "release" ]; then
            BUILD_METHOD="IronFrontier.Editor.BuildScript.BuildiOSRelease"
        else
            BUILD_METHOD="IronFrontier.Editor.BuildScript.BuildiOS"
        fi
        ;;
    android)
        if [ "$BUILD_TYPE" = "release" ]; then
            BUILD_METHOD="IronFrontier.Editor.BuildScript.BuildAndroidRelease"
        else
            BUILD_METHOD="IronFrontier.Editor.BuildScript.BuildAndroid"
        fi
        ;;
    webgl)
        if [ "$BUILD_TYPE" = "release" ]; then
            BUILD_METHOD="IronFrontier.Editor.BuildScript.BuildWebGLRelease"
        else
            BUILD_METHOD="IronFrontier.Editor.BuildScript.BuildWebGL"
        fi
        ;;
    macos)
        BUILD_METHOD="IronFrontier.Editor.BuildScript.BuildMacOS"
        ;;
    *)
        echo "Usage: $0 [ios|android|webgl|macos] [release]"
        exit 1
        ;;
esac

echo -e "${YELLOW}Starting Unity build...${NC}"
echo "Build Method: $BUILD_METHOD"
echo ""

# Run Unity build
"$UNITY_PATH" \
    -batchmode \
    -quit \
    -projectPath "$PROJECT_ROOT" \
    -executeMethod "$BUILD_METHOD" \
    -logFile -

BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=== Build Complete ===${NC}"
    echo "Output: $PROJECT_ROOT/Builds/$PLATFORM/"

    # For iOS, show next steps
    if [ "$PLATFORM" = "ios" ]; then
        echo ""
        echo "Next steps for iOS:"
        echo "  1. Open Builds/iOS/IronFrontier.xcodeproj in Xcode"
        echo "  2. Select your development team"
        echo "  3. Build and run on simulator or device"
        echo ""
        echo "Or install directly to simulator:"
        echo "  xcrun simctl install booted Builds/iOS/IronFrontier.app"
    fi

    # For Android, show APK location
    if [ "$PLATFORM" = "android" ]; then
        echo ""
        echo "APK Location: $PROJECT_ROOT/Builds/Android/IronFrontier.apk"
        echo ""
        echo "Install to device/emulator:"
        echo "  adb install -r Builds/Android/IronFrontier.apk"
    fi
else
    echo ""
    echo -e "${RED}=== Build Failed ===${NC}"
    exit 1
fi
