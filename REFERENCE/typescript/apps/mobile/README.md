# @iron-frontier/mobile

Mobile app for Iron Frontier using Expo SDK 54 with **React Native Filament** for 3D rendering.

## Requirements

- Node.js 20.19.4+
- pnpm 10+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- For iOS development: Xcode 16.1+ (macOS only)
- For Android development: Android Studio with SDK 36

## Setup

```bash
# From monorepo root
pnpm install

# Navigate to mobile app
cd apps/mobile

# Create native builds (required for Filament - Expo Go not supported)
npx expo prebuild
```

## Development

```bash
# Start with development client
pnpm dev

# Run on Android emulator
pnpm android

# Run on iOS simulator (macOS only)
pnpm ios
```

## Building

### Debug APK (Android)

```bash
# Build debug APK for testing
pnpm build:android
```

### iOS Simulator Build

```bash
# Build for iOS simulator
pnpm build:ios
```

## 3D Rendering with Filament

This app uses [React Native Filament](https://github.com/margelo/react-native-filament) for 3D rendering instead of WebGPU. Filament is Google's physically-based rendering engine.

### Key Features

- **PBR Materials**: Physically-based rendering for realistic lighting
- **GLB Model Loading**: Supports .glb models via require() or remote URLs
- **Metal/Vulkan**: Uses Metal on iOS and Vulkan/OpenGL on Android
- **Separate Render Thread**: Rendering happens off the JS thread

### FilamentRenderer Component

```tsx
import { FilamentRenderer } from "../src/components/FilamentRenderer";

// Load a bundled GLB model
<FilamentRenderer
  modelSource={require("./assets/models/cactus.glb")}
  cameraPosition={[0, 2, 5]}
  cameraTarget={[0, 0.5, 0]}
  onReady={() => console.log("Scene ready!")}
/>

// Load a remote model
<FilamentRenderer
  modelSource={{ uri: "https://example.com/model.glb" }}
  modelScale={[0.5, 0.5, 0.5]}
/>
```

### Custom Scenes

For more control, use the exported Filament components directly:

```tsx
import {
  FilamentSceneContainer,
  FilamentView,
  Camera,
  DefaultLight,
  Model,
} from "../src/components/FilamentRenderer";

<FilamentSceneContainer>
  <FilamentView style={{ flex: 1 }}>
    <Camera cameraPosition={[0, 5, 10]} />
    <DefaultLight />
    <Model source={require("./model.glb")} />
  </FilamentView>
</FilamentSceneContainer>
```

## Notes

- Filament is not supported in Expo Go; you must use a development build
- iOS Simulator: May need to disable Metal Validation in Xcode's Edit Scheme
- Ensure `.glb` files are added to Metro's asset extensions (already configured)

## Project Structure

```
apps/mobile/
├── app/                 # Expo Router pages
│   ├── _layout.tsx      # Root layout
│   └── index.tsx        # Home screen
├── src/
│   └── components/      # React Native components
│       ├── index.ts     # Component exports
│       └── FilamentRenderer.tsx
├── assets/
│   └── models/          # GLB model assets
│       └── cactus1.glb  # Test model
├── app.json             # Expo configuration
├── eas.json             # EAS Build configuration
├── metro.config.js      # Metro bundler config (GLB support)
├── babel.config.js      # Babel config (worklets plugin)
└── tsconfig.json        # TypeScript configuration
```

## Dependencies

- `expo` ~54.0.0 - Expo SDK with React 19.1 support
- `react-native-filament` ^1.9.0 - Filament rendering engine for React Native
- `react-native-worklets-core` ^1.6.2 - Worklets for off-thread execution
- `@iron-frontier/shared` - Shared game logic and types
- `@iron-frontier/assets` - Shared game assets (models, textures)
