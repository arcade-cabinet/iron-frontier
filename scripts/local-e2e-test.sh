#!/bin/bash
# Iron Frontier - Local E2E Testing Script
# Usage: ./scripts/local-e2e-test.sh [ios|android|all]

set -e

PLATFORM=${1:-ios}
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Iron Frontier E2E Test Runner ==="
echo "Platform: $PLATFORM"
echo "Project: $PROJECT_ROOT"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Maestro is installed
if ! command -v maestro &> /dev/null; then
    echo -e "${YELLOW}Maestro not found. Installing...${NC}"
    curl -Ls "https://get.maestro.mobile.dev" | bash
    export PATH="$HOME/.maestro/bin:$PATH"
fi

# Function to run iOS tests
run_ios_tests() {
    echo -e "${GREEN}=== Running iOS E2E Tests ===${NC}"

    # Check for running iOS simulator
    DEVICE_ID=$(xcrun simctl list devices booted | grep -E "iPhone|iPad" | head -1 | awk -F '[()]' '{print $2}')

    if [ -z "$DEVICE_ID" ]; then
        echo -e "${YELLOW}No iOS simulator running. Starting iPhone 17 Pro...${NC}"
        DEVICE_ID=$(xcrun simctl list devices available | grep "iPhone 17 Pro" | head -1 | awk -F '[()]' '{print $2}')
        xcrun simctl boot "$DEVICE_ID"
        sleep 5
    fi

    echo "Using device: $DEVICE_ID"

    # Run Maestro tests
    cd "$PROJECT_ROOT"
    maestro test .maestro/flows/ \
        --device "$DEVICE_ID" \
        --env IOS_APP_ID=com.ironfrontier.game \
        --format junit \
        --output "$PROJECT_ROOT/test-results/ios"

    echo -e "${GREEN}iOS tests complete!${NC}"
}

# Function to run Android tests
run_android_tests() {
    echo -e "${GREEN}=== Running Android E2E Tests ===${NC}"

    # Check for running Android emulator
    DEVICE_ID=$(adb devices | grep -v "List" | grep "device$" | head -1 | cut -f1)

    if [ -z "$DEVICE_ID" ]; then
        echo -e "${RED}No Android emulator running!${NC}"
        echo "Please start an Android emulator first:"
        echo "  emulator -avd Pixel_8a_API_34"
        exit 1
    fi

    echo "Using device: $DEVICE_ID"

    # Run Maestro tests
    cd "$PROJECT_ROOT"
    maestro test .maestro/flows/ \
        --device "$DEVICE_ID" \
        --env ANDROID_APP_ID=com.ironfrontier.game \
        --format junit \
        --output "$PROJECT_ROOT/test-results/android"

    echo -e "${GREEN}Android tests complete!${NC}"
}

# Create test results directory
mkdir -p "$PROJECT_ROOT/test-results"

# Run tests based on platform
case $PLATFORM in
    ios)
        run_ios_tests
        ;;
    android)
        run_android_tests
        ;;
    all)
        run_ios_tests
        run_android_tests
        ;;
    *)
        echo "Usage: $0 [ios|android|all]"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}=== E2E Testing Complete ===${NC}"
echo "Results saved to: $PROJECT_ROOT/test-results/"
