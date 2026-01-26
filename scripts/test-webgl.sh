#!/bin/bash
# Iron Frontier - WebGL E2E Test Script
# Builds WebGL and runs Playwright tests

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UNITY_PATH="/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity"
WEBGL_BUILD="$PROJECT_ROOT/Builds/WebGL/IronFrontier"

echo "=== Iron Frontier WebGL E2E Test Runner ==="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check for required tools
check_tool() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}$1 not found!${NC}"
        return 1
    fi
    return 0
}

# Parse arguments
BUILD_WEBGL=false
BROWSER="chromium"
HEADED=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD_WEBGL=true
            shift
            ;;
        --browser)
            BROWSER="$2"
            shift 2
            ;;
        --headed)
            HEADED=true
            shift
            ;;
        --all-browsers)
            BROWSER="all"
            shift
            ;;
        *)
            echo "Usage: $0 [--build] [--browser chromium|firefox|webkit|all] [--headed]"
            exit 1
            ;;
    esac
done

# Build WebGL if requested or if build doesn't exist
if [ "$BUILD_WEBGL" = true ] || [ ! -d "$WEBGL_BUILD" ]; then
    echo -e "${YELLOW}Building WebGL...${NC}"

    if [ ! -f "$UNITY_PATH" ]; then
        echo -e "${RED}Unity not found at: $UNITY_PATH${NC}"
        exit 1
    fi

    "$UNITY_PATH" \
        -batchmode \
        -quit \
        -projectPath "$PROJECT_ROOT" \
        -executeMethod IronFrontier.Editor.BuildScript.BuildWebGL \
        -logFile -

    if [ ! -d "$WEBGL_BUILD" ]; then
        echo -e "${RED}WebGL build failed!${NC}"
        exit 1
    fi

    echo -e "${GREEN}WebGL build complete!${NC}"
fi

# Install Playwright dependencies if needed
cd "$PROJECT_ROOT/tests/e2e"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing test dependencies...${NC}"
    npm install
fi

# Install browsers if needed
if ! npx playwright --version &> /dev/null; then
    echo -e "${YELLOW}Installing Playwright browsers...${NC}"
    npx playwright install --with-deps
fi

# Prepare test command
TEST_CMD="npx playwright test"

if [ "$BROWSER" = "all" ]; then
    TEST_CMD="$TEST_CMD"
else
    TEST_CMD="$TEST_CMD --project=$BROWSER"
fi

if [ "$HEADED" = true ]; then
    TEST_CMD="$TEST_CMD --headed"
fi

# Run tests
echo ""
echo -e "${GREEN}Running Playwright tests...${NC}"
echo "Browser: $BROWSER"
echo "WebGL Build: $WEBGL_BUILD"
echo ""

# Start server and run tests
$TEST_CMD

TEST_EXIT=$?

echo ""
if [ $TEST_EXIT -eq 0 ]; then
    echo -e "${GREEN}=== All tests passed! ===${NC}"
else
    echo -e "${RED}=== Some tests failed ===${NC}"
    echo "View report: npx playwright show-report"
fi

exit $TEST_EXIT
