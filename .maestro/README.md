# Maestro E2E Tests for Iron Frontier

This directory contains end-to-end tests for the Iron Frontier mobile app using [Maestro](https://maestro.mobile.dev/).

## Overview

Iron Frontier is a steampunk western RPG with the following key screens:
- **Splash Screen** - Animated gears with "Loading Steam..." text
- **Title Screen** - Main menu with Continue/New Game/About options
- **Character Creation** - Name input for new characters (max 20 chars)
- **Gameplay** - 3D isometric view with HUD, action bar, and various panels

## Test Flows

| Flow | Description | Tags |
|------|-------------|------|
| `app-launch.yaml` | Verifies app launches and shows main screen | smoke, launch |
| `main-menu.yaml` | Tests navigation through main menu options | navigation, menu |
| `new-game.yaml` | Tests complete new game flow | gameplay, new-game, critical |
| `character-creation.yaml` | Tests character name input validation | character, input-validation |
| `basic-gameplay.yaml` | Tests basic game interactions | gameplay, interactions, critical |

## Prerequisites

### Install Maestro CLI

```bash
# macOS/Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify installation
maestro --version
```

### Android Emulator Setup

1. Install Android Studio and create an emulator (API 33+ recommended)
2. Start the emulator:
```bash
# List available emulators
emulator -list-avds

# Start emulator
emulator -avd <emulator_name>
```

3. Install the debug APK:
```bash
adb install apps/mobile/iron-frontier-debug.apk
```

## Running Tests

### Run All Tests

```bash
# From repository root
maestro test .maestro/

# Or specify output directory
maestro test .maestro/ --output .maestro/report/
```

### Run Single Test

```bash
# Run specific flow
maestro test .maestro/app-launch.yaml

# Run with debug output
maestro test .maestro/app-launch.yaml --debug-output debug/
```

### Run Tests by Tag

```bash
# Run smoke tests only
maestro test .maestro/ --include-tags smoke

# Run critical tests
maestro test .maestro/ --include-tags critical

# Exclude certain tags
maestro test .maestro/ --exclude-tags input-validation
```

### Run on Specific Device

```bash
# List connected devices
adb devices

# Run on specific device
maestro test .maestro/ --device <device_id>
```

## Running in CI

The GitHub Actions workflow at `.github/workflows/mobile.yml` already has Maestro tests configured. Tests run automatically on pull requests after the Android APK is built.

### CI Configuration

The workflow:
1. Builds the debug APK using EAS Build
2. Starts an Android emulator (API 33, x86_64)
3. Installs the APK
4. Runs `maestro test .maestro/`
5. Uploads the test report as an artifact

### Local CI Simulation

```bash
# Build the APK locally
cd apps/mobile
eas build --platform android --profile debug --local --output ./iron-frontier-debug.apk

# Run tests
maestro test .maestro/
```

## Test Configuration

The `config.yaml` file contains global configuration:

```yaml
appId: com.ironfrontier.mobile
env:
  APP_NAME: "Iron Frontier"
  TEST_PLAYER_NAME: "TestOutlaw"
```

## Writing New Tests

### Flow Structure

```yaml
appId: com.ironfrontier.mobile
name: "Test Name"
tags:
  - tag1
  - tag2

---

- launchApp:
    appId: com.ironfrontier.mobile
    clearState: true

# Test steps here...
```

### Important Timeouts

Due to WebGPU rendering and procedural world generation, use generous timeouts:

| Operation | Recommended Timeout |
|-----------|---------------------|
| App launch | 15000ms |
| World loading | 30000ms |
| UI panel open | 5000ms |
| Standard interaction | 3000ms |

### Selectors

The app uses text-based selectors primarily. Common patterns:

```yaml
# Text matching
- tapOn:
    text: "Button Text"

# Regex matching
- tapOn:
    text: ".*partial.*"
    regex: true

# Test ID (when available)
- tapOn:
    id: "game-hud"
```

### Taking Screenshots

Screenshots are saved to help debug failures:

```yaml
- takeScreenshot: screenshots/descriptive_name
```

## Troubleshooting

### App Not Starting

1. Verify APK is installed: `adb shell pm list packages | grep ironfrontier`
2. Check emulator is running: `adb devices`
3. Try clearing app data: `adb shell pm clear com.ironfrontier.mobile`

### Timeouts

If tests timeout waiting for elements:
1. Increase the timeout value
2. Check if the element text/ID matches exactly
3. Try using regex matching for partial text

### WebGPU Issues

The app uses WebGPU for 3D rendering. If emulator doesn't support it:
1. Use an emulator with API 33+ and x86_64 architecture
2. Enable hardware acceleration: `-gpu host` or `-gpu swiftshader_indirect`
3. Ensure enough RAM allocated to emulator (4GB+)

### Screenshots Directory

If screenshots aren't saving:
```bash
mkdir -p .maestro/screenshots
```

## App Bundle ID

The mobile app uses the bundle ID: `com.ironfrontier.mobile`

This should match what's configured in `apps/mobile/app.json` (when that file exists).

## File Structure

```
.maestro/
  config.yaml              # Global Maestro configuration
  README.md                # This documentation
  app-launch.yaml          # App launch test
  main-menu.yaml           # Main menu navigation test
  new-game.yaml            # New game flow test
  character-creation.yaml  # Character creation test
  basic-gameplay.yaml      # Basic gameplay test
  screenshots/             # Test screenshots (gitignored)
  report/                  # Test reports (gitignored)
```
