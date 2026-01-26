#!/bin/bash
# Iron Frontier - Unity Module Setup Script
# Installs required build support modules for target platforms

set -e

UNITY_VERSION="6000.3.5f1"
UNITY_HUB="/Applications/Unity Hub.app/Contents/MacOS/Unity Hub"

echo "=== Iron Frontier Unity Module Setup ==="
echo "Unity Version: $UNITY_VERSION"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Unity Hub is installed
if [ ! -f "$UNITY_HUB" ]; then
    echo -e "${RED}Unity Hub not found!${NC}"
    echo "Please install Unity Hub from: https://unity.com/download"
    exit 1
fi

echo -e "${GREEN}Unity Hub found${NC}"
echo ""

# Function to install a module
install_module() {
    local module_name=$1
    local module_id=$2

    echo -e "${YELLOW}Installing $module_name...${NC}"
    "$UNITY_HUB" -- --headless install-modules \
        --version "$UNITY_VERSION" \
        --module "$module_id" \
        --childModules
    echo -e "${GREEN}$module_name installed!${NC}"
}

# Menu for module selection
echo "Select modules to install:"
echo "1) iOS Build Support"
echo "2) Android Build Support (includes SDK/NDK/JDK)"
echo "3) WebGL Build Support"
echo "4) All Target Platforms (iOS + Android + WebGL)"
echo "5) Exit"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        install_module "iOS Build Support" "ios"
        ;;
    2)
        install_module "Android Build Support" "android"
        ;;
    3)
        install_module "WebGL Build Support" "webgl"
        ;;
    4)
        install_module "iOS Build Support" "ios"
        install_module "Android Build Support" "android"
        install_module "WebGL Build Support" "webgl"
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}=== Module Installation Complete ===${NC}"
echo ""
echo "You can now build for the installed platforms."
echo "Use the following commands:"
echo ""
echo "  iOS:     ./scripts/build.sh ios"
echo "  Android: ./scripts/build.sh android"
echo "  WebGL:   ./scripts/build.sh webgl"
echo ""
echo "Or from Unity Editor: Build > Build [Platform]"
