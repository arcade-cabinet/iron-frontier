# Expo Unified Architecture Migration

## Overview

Migrate Iron Frontier from a pnpm workspace monorepo with separate web/mobile apps to a **single unified Expo application** that targets web, iOS, and Android. This follows Expo's recommended best practices for universal apps and eliminates unnecessary complexity.

## Problem Statement

Currently:
- **Complex monorepo**: `apps/web/`, `apps/mobile/`, `packages/shared/`, `packages/assets/`, etc.
- **Separate apps**: Different entry points, build systems, and workflows
- **Duplicated code**: Similar game logic, UI components, and state management in both apps
- **Different build systems**: Vite (web) vs Metro/EAS (mobile)
- **Different development workflows**: `pnpm dev` vs `pnpm dev:mobile`
- **Version mismatches**: Three.js 0.176 (web) vs 0.170 (mobile)
- **Maintenance overhead**: Managing workspace dependencies, build configs, and platform-specific code

**The Solution**: One Expo app with platform-specific code where needed (`.web.tsx`, `.native.tsx`, `.ios.tsx`, `.android.tsx`)

## Goals

1. **Single Expo app** targeting web, iOS, and Android (no monorepo)
2. **Flatten structure** following Expo's recommended project layout
3. **Single development workflow**: `expo start` for all platforms
4. **Unified dependencies**: One package.json, one node_modules
5. **Platform-specific code only where necessary**: Use `.web.tsx`, `.native.tsx` extensions
6. **Proper Expo configuration** following official setup guides
7. **NativeWind** for unified Tailwind styling across platforms
8. **Maintain 60fps** performance target on all platforms
9. **Preserve game logic**: Keep all game data, schemas, and generators
10. **Simplify CI/CD**: Single build pipeline for all platforms

## User Stories

### 1. Developer Experience

**As a developer**, I want to run a single command to start development on all platforms, so that I don't need to manage separate web and mobile workflows.

**Acceptance Criteria:**
- 1.1 Running `expo start` launches dev server for web, iOS, and Android
- 1.2 Hot reload works on all platforms simultaneously
- 1.3 Single TypeScript configuration covers all platforms
- 1.4 Shared components render correctly on web and native

### 2. Project Setup

**As a developer**, I want the project properly configured following Expo's official setup guides, so that we have a maintainable foundation.

**Acceptance Criteria:**
- 2.1 Project created using `tabs` template (`npx create-expo-app --template tabs`)
- 2.2 Expo modules properly installed (expo-gl, expo-asset, expo-sqlite, etc.)
- 2.3 Development builds configured for iOS and Android
- 2.4 Web support enabled with Metro bundler (`expo.web.bundler: "metro"` in app.json)
- 2.5 Metro config includes support for 3D asset extensions (.glb, .gltf, .obj, .mtl)
- 2.6 EAS Build configured (eas.json) for all platforms
- 2.7 All platform-specific configurations in place (app.json, metro.config.js, tsconfig.json)

### 3. Styling System

**As a developer**, I want NativeWind (Tailwind CSS) working across all platforms, so that styling is consistent and maintainable.

**Acceptance Criteria:**
- 3.1 NativeWind installed and configured following [Expo Tailwind Guide](https://docs.expo.dev/guides/tailwind/)
- 3.2 Tailwind classes work on web, iOS, and Android
- 3.3 Platform-specific styles supported using `web:` and `native:` prefixes
- 3.4 Existing Steampunk color palette (amber/brass) preserved in tailwind.config.js
- 3.5 Replace shadcn/ui (Radix) components with React Native equivalents
- 3.6 Use react-native-reanimated for animations across platforms

### 4. 3D Rendering

**As a developer**, I want a unified 3D rendering approach using Three.js that works on all platforms, so that game visuals are consistent.

**Acceptance Criteria:**
- 4.1 Upgrade to Three.js 0.176 across all platforms (currently 0.176 web, 0.170 mobile)
- 4.2 Use React Three Fiber (R3F) for web rendering with Metro bundler
- 4.3 Use expo-gl + expo-three for native (iOS/Android) rendering
- 4.4 Create platform-specific Canvas wrappers: `GameCanvas.web.tsx` (R3F) and `GameCanvas.native.tsx` (expo-gl)
- 4.5 Share scene components (lights, meshes, cameras) between platforms using platform-agnostic JSX
- 4.6 Migrate existing R3F scenes (OverworldSceneR3F, CombatSceneR3F) to new structure
- 4.7 Use `expo-asset` for loading 3D models with platform-specific URIs
- 4.8 Maintain 60fps performance target on all platforms

### 5. Flattened Project Structure

**As a developer**, I want a single Expo project following recommended best practices, so that the codebase is simple and maintainable.

**Acceptance Criteria:**
- 5.1 Flatten monorepo into single Expo project at root level (no pnpm workspaces)
- 5.2 Follow Expo's recommended directory structure:
  - `app/` - Expo Router pages (file-based routing)
  - `components/` - Reusable UI components
  - `src/` - Core application code (game logic, store, lib, types)
  - `assets/` - Images, fonts, 3D models (Git LFS)
  - `__tests__/` - Test files (unit, e2e)
- 5.3 Platform-specific code uses `.web.tsx`, `.native.tsx`, `.ios.tsx`, `.android.tsx` extensions
- 5.4 Game logic from `packages/shared/` moved to `src/game/`
- 5.5 Single `package.json` with all dependencies (no workspace config)
- 5.6 Remove `pnpm-workspace.yaml` and workspace-related configs
- 5.7 Assets from `packages/assets/` moved to `assets/` directory
- 5.8 Update all import paths to new structure (no `@iron-frontier/shared` aliases)

### 6. Migration Path

**As a developer**, I want a clear migration path from the monorepo to a single Expo app, so that we don't lose existing functionality.

**Acceptance Criteria:**
- 6.1 Create new Expo project using `tabs` template
- 6.2 Migrate game logic from `packages/shared/src/` to `src/game/`
- 6.3 Migrate web components from `apps/web/src/` with platform-specific variants (`.web.tsx`)
- 6.4 Migrate mobile components from `apps/mobile/src/` with platform-specific variants (`.native.tsx`)
- 6.5 Merge Zustand stores: `webGameStore.ts` + `mobileGameStore.ts` → `src/store/gameStore.ts`
- 6.6 Migrate assets from `packages/assets/` to `assets/` (maintain Git LFS)
- 6.7 Update all import paths from `@iron-frontier/shared` to relative paths
- 6.8 Migrate tests from Vitest to Jest (203 tests)
- 6.9 Update CI/CD workflows for single-app build (EAS Build + Playwright + Maestro)
- 6.10 Update documentation to reflect new structure

## Non-Functional Requirements

### Performance
- Maintain 60fps on mid-range devices
- Web bundle size should not significantly increase
- Native app size should remain reasonable (<50MB)

### Compatibility
- Support iOS 13+
- Support Android API 21+ (Android 5.0)
- Support modern web browsers (Chrome, Safari, Firefox, Edge)

### Developer Experience
- Fast refresh on all platforms (<2s)
- Clear error messages
- Good TypeScript support
- Comprehensive documentation

## Technical Constraints

1. Must use Expo SDK 54 (latest stable)
2. Must preserve all existing game logic, schemas, and data
3. Must support offline gameplay
4. Must maintain SQLite persistence (expo-sqlite for native, sql.js for web)
5. Must maintain all 203 existing tests (migrated to new structure)
6. Must support Git LFS for 3D models and textures
7. Must maintain 60fps performance target

## Out of Scope

- Migrating `apps/docs/` (can remain separate or be removed)
- Changing game design or mechanics
- Rewriting game logic (only moving/reorganizing)
- Adding new features beyond architectural migration
- Optimizing 3D rendering performance (maintain current performance)
- Changing art assets or visual style

## Success Metrics

1. **Single command**: `expo start` launches web, iOS, and Android
2. **All tests pass**: 203 tests migrated and passing with Jest
3. **All platforms build**: Web, iOS, and Android builds succeed via EAS
4. **Performance maintained**: 60fps on all platforms
5. **Simplified structure**: No monorepo, no workspace config, single package.json
6. **Reduced complexity**: Fewer configuration files, simpler CI/CD
7. **Developer experience**: Faster install, simpler commands, clearer structure
8. **Bundle size**: Web build ≤ 10 MB (currently 7.7 MB with Vite)

## Key Decisions & Trade-offs

### ✅ Decisions Made

1. **Metro over Vite**: Use Metro bundler for all platforms (official Expo/React Native bundler)
   - **Pro**: Single bundler, official support, web support in SDK 50+
   - **Con**: May be slightly slower than Vite for web dev server
   - **Mitigation**: Metro performance is acceptable, and consistency is more valuable

2. **Tabs Template**: Use `tabs` template as starting point
   - **Pro**: Includes Expo Router, TypeScript, NativeWind, navigation examples
   - **Con**: Need to customize for game-specific navigation
   - **Mitigation**: Template provides good foundation, easy to customize

3. **Platform-Specific Canvas**: Separate `GameCanvas.web.tsx` and `GameCanvas.native.tsx`
   - **Pro**: Clean separation, optimal for each platform
   - **Con**: Two implementations to maintain
   - **Mitigation**: Share scene components, only Canvas wrapper differs

4. **NativeWind for Styling**: Replace shadcn/ui with NativeWind + React Native components
   - **Pro**: Unified Tailwind styling, works across platforms
   - **Con**: Need to rebuild UI components
   - **Mitigation**: NativeWind is mature, good documentation

5. **Jest over Vitest**: Use Jest (Expo default) instead of Vitest
   - **Pro**: Official Expo testing framework, better React Native support
   - **Con**: Need to migrate 203 tests
   - **Mitigation**: Migration is straightforward, mostly syntax changes

6. **Flatten Monorepo**: Single Expo project, no pnpm workspaces
   - **Pro**: Simpler structure, easier to understand, faster installs
   - **Con**: Lose workspace benefits (shared dependencies)
   - **Mitigation**: Single app doesn't need workspace complexity

### ⚠️ Trade-offs

1. **Bundle Size**: Metro may produce slightly larger web bundles than Vite
   - **Current**: 7.7 MB (Vite single file)
   - **Expected**: 8-10 MB (Metro with chunks)
   - **Acceptable**: Still reasonable for a 3D game

2. **Development Speed**: Metro dev server may be slower than Vite
   - **Impact**: Slightly longer initial startup
   - **Acceptable**: Fast refresh is still fast, consistency is more important

3. **UI Component Rewrite**: Need to replace shadcn/ui components
   - **Impact**: Time investment to rebuild UI
   - **Acceptable**: NativeWind provides good alternatives, better cross-platform support

4. **Test Migration**: Converting 203 tests from Vitest to Jest
   - **Impact**: Time investment, potential for bugs
   - **Acceptable**: Jest is more appropriate for React Native, migration is straightforward

### 🔄 Reversible Decisions

These decisions can be changed later if needed:

1. **Tabs Template**: Can switch to blank template or custom navigation
2. **NativeWind**: Can switch to other styling solutions (StyleSheet, Tamagui)
3. **Three.js Version**: Can upgrade/downgrade as needed
4. **Asset Loading**: Can switch between expo-asset and custom loaders

### 🚫 Irreversible Decisions

These decisions are hard to reverse:

1. **Flatten Monorepo**: Once flattened, hard to go back to workspace structure
2. **Metro Bundler**: Switching back to Vite would require significant rework
3. **Expo Router**: Switching to React Navigation would require route rewrite

## Technical Solutions (Research Findings)

### 1. Expo Project Structure ✅

**Template**: Use `tabs` template (`npx create-expo-app --template tabs`)
- Provides Expo Router with tab navigation out of the box
- Includes TypeScript, NativeWind, and platform-specific examples
- Best starting point for universal apps with navigation

**Directory Structure** (Expo Best Practices):
```
iron-frontier/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (tabs)/            # Tab navigation group
│   │   ├── _layout.tsx    # Tab layout
│   │   ├── index.tsx      # Home/Game screen
│   │   └── inventory.tsx  # Inventory screen
│   ├── _layout.tsx        # Root layout
│   └── +not-found.tsx     # 404 page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── game/             # Game-specific components
├── src/                  # Core application code
│   ├── game/            # Game logic (from packages/shared)
│   │   ├── data/        # Schemas, items, NPCs, quests
│   │   ├── generation/  # Procedural generators
│   │   └── systems/     # Combat, dialogue, etc.
│   ├── store/           # Unified Zustand store
│   ├── lib/             # Utilities, helpers
│   └── types/           # TypeScript types
├── assets/              # Images, fonts, 3D models (Git LFS)
│   ├── models/         # 3D models (.glb, .gltf)
│   ├── textures/       # Texture files
│   └── fonts/          # Custom fonts
├── __tests__/          # Test files
│   ├── unit/          # Unit tests (Jest)
│   ├── e2e/           # E2E tests
│   │   ├── web/       # Playwright tests
│   │   └── mobile/    # Maestro tests
│   └── setup.ts       # Test setup
├── app.json           # Expo configuration
├── metro.config.js    # Metro bundler config
├── package.json       # Single package.json
└── tsconfig.json      # TypeScript config
```

### 2. Bundler Configuration ✅

**Metro Bundler** (Official Expo/React Native bundler):
- Use Metro for all platforms (web, iOS, Android)
- Enable web support: `expo.web.bundler: "metro"` in app.json (SDK 50+)
- Metro supports tree shaking and bundle splitting for web
- Performance comparable to Vite for production builds

**Web Optimization**:
```json
// app.json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "static"
    }
  }
}
```

**Metro Config** for Three.js:
```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .glb, .gltf files
config.resolver.assetExts.push('glb', 'gltf', 'obj', 'mtl');

module.exports = config;
```

### 3. 3D Rendering Strategy ✅

**Unified Three.js Version**: 0.176 (latest stable)
- Upgrade mobile from 0.170 to 0.176 for consistency

**Platform-Specific Rendering**:

**Web** (React Three Fiber):
```tsx
// components/game/GameCanvas.web.tsx
import { Canvas } from '@react-three/fiber';

export function GameCanvas({ children }) {
  return (
    <Canvas camera={{ position: [0, 10, 10] }}>
      {children}
    </Canvas>
  );
}
```

**Native** (expo-gl):
```tsx
// components/game/GameCanvas.native.tsx
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';

export function GameCanvas({ children }) {
  const onContextCreate = async (gl) => {
    const renderer = new Renderer({ gl });
    // Setup Three.js scene manually
  };
  
  return <GLView onContextCreate={onContextCreate} />;
}
```

**Shared Scene Logic**:
```tsx
// components/game/scenes/OverworldScene.tsx
// Platform-agnostic scene components
export function OverworldScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <HexGrid />
      <PlayerCharacter />
    </>
  );
}
```

**Pattern**: Use `.web.tsx` and `.native.tsx` for Canvas wrapper, share scene components.

### 4. Styling System ✅

**NativeWind** (Tailwind for React Native):
- Install: `npx expo install nativewind tailwindcss`
- Configure following [Expo Tailwind Guide](https://docs.expo.dev/guides/tailwind/)
- Works across web, iOS, and Android
- Supports platform-specific styles: `className="bg-blue-500 web:bg-red-500"`

**Setup**:
```js
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Steampunk palette
        brass: { /* amber shades */ },
      },
    },
  },
};
```

**UI Components**:
- Replace shadcn/ui (Radix) with React Native equivalents
- Use `react-native-reanimated` for animations
- Platform-specific components where needed (e.g., `Button.web.tsx`, `Button.native.tsx`)

### 5. Asset Management ✅

**Expo Asset System**:
```tsx
// Using expo-asset
import { useAssets } from 'expo-asset';

function GameScene() {
  const [assets] = useAssets([
    require('../assets/models/character.glb'),
    require('../assets/textures/terrain.png'),
  ]);
  
  if (!assets) return <LoadingScreen />;
  
  return <Scene modelUri={assets[0].localUri} />;
}
```

**Git LFS**: Continue using for 3D models and textures
- Keep `.gitattributes` configuration
- Assets in `assets/` directory (Expo convention)

**Platform-Specific Loading**:
- Web: Load from public URL or bundled assets
- Native: Use `expo-asset` with `localUri`
- Use platform-specific loaders if needed (`.web.tsx`, `.native.tsx`)

### 6. State Management ✅

**Unified Zustand Store**:
```tsx
// src/store/gameStore.ts
import { create } from 'zustand';
import { Platform } from 'react-native';

interface GameState {
  // Shared state
  phase: GamePhase;
  playerStats: PlayerStats;
  inventory: Item[];
  
  // Platform-specific state (if needed)
  renderMode?: 'webgl' | 'webgpu'; // web only
  deviceInfo?: DeviceInfo;         // native only
}

export const useGameStore = create<GameState>((set) => ({
  // Shared logic
  phase: 'title',
  setPhase: (phase) => set({ phase }),
  
  // Platform-specific initialization
  ...(Platform.OS === 'web' ? {
    renderMode: 'webgpu',
  } : {
    deviceInfo: getDeviceInfo(),
  }),
}));
```

**Migration**: Merge `webGameStore.ts` and `mobileGameStore.ts` into single store with platform checks.

### 7. Testing Strategy ✅

**Unit Tests** (Jest - Expo default):
```bash
# Install Jest (comes with Expo)
npx expo install jest-expo jest @testing-library/react-native

# Run tests
npm test
```

**E2E Tests**:
- **Web**: Playwright (keep existing tests)
  - Run against `expo export:web` output
  - Update URLs to Expo web server
- **Mobile**: Maestro (keep existing tests)
  - Run against development builds
  - Update app IDs if needed

**Test Structure**:
```
__tests__/
├── unit/
│   ├── game/
│   │   ├── store.test.ts
│   │   └── generators.test.ts
│   └── components/
│       └── GameCanvas.test.tsx
├── e2e/
│   ├── web/
│   │   └── gameplay.spec.ts (Playwright)
│   └── mobile/
│       └── gameplay.yaml (Maestro)
└── setup.ts
```

**Migration**: Convert Vitest tests to Jest (minimal changes needed).

### 8. CI/CD with EAS ✅

**EAS Build** (All Platforms):
```yaml
# eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true },
      "android": { "buildType": "apk" }
    },
    "production": {
      "ios": { "simulator": false },
      "android": { "buildType": "aab" }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Build Commands**:
```bash
# Web
npx expo export:web
# Output: dist/ directory (static files)

# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production

# All platforms
eas build --platform all --profile production
```

**GitHub Actions Workflow**:
```yaml
# .github/workflows/ci.yml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npm test
      - run: npm run typecheck
  
  build-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npx expo export:web
      - uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: dist/
  
  build-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
      - run: eas build --platform all --non-interactive
```

**Deployment**:
- **Web**: Deploy `dist/` to static hosting (Vercel, Netlify, GitHub Pages)
- **iOS**: Submit to App Store via `eas submit --platform ios`
- **Android**: Submit to Play Store via `eas submit --platform android`

### 9. Bundle Size Optimization ✅

**Metro Web Optimization**:
- Tree shaking enabled by default (SDK 50+)
- Bundle splitting for code splitting
- Asset optimization (images, fonts)

**Expected Bundle Size**:
- Current Vite build: 7.7 MB (single file)
- Metro build: Similar size, but split into chunks
- Use `npx expo export:web --dump-sourcemap` to analyze

**Optimization Strategies**:
- Lazy load 3D models with `React.lazy()`
- Use `expo-asset` for on-demand loading
- Enable Hermes engine for native (smaller bundle)
- Use `expo-optimize` for image compression

## Migration Strategy

### Phase 1: Setup New Expo Project
1. Create new Expo project: `npx create-expo-app iron-frontier --template tabs`
2. Install core dependencies (Three.js 0.176, Zustand, expo-gl, expo-asset, etc.)
3. Configure Metro bundler for 3D assets (.glb, .gltf, .obj, .mtl)
4. Setup NativeWind following Expo Tailwind guide
5. Configure EAS Build (eas.json)
6. Setup Git LFS for assets

### Phase 2: Migrate Game Logic
1. Copy `packages/shared/src/` → `src/game/`
2. Update import paths (remove `@iron-frontier/shared` aliases)
3. Merge Zustand stores into `src/store/gameStore.ts`
4. Add platform-specific checks where needed (`Platform.OS === 'web'`)

### Phase 3: Migrate 3D Rendering
1. Create `components/game/GameCanvas.web.tsx` (R3F wrapper)
2. Create `components/game/GameCanvas.native.tsx` (expo-gl wrapper)
3. Migrate scene components from `apps/web/src/game/scenes/r3f/`
4. Make scenes platform-agnostic (remove R3F-specific code)
5. Test rendering on all platforms

### Phase 4: Migrate UI Components
1. Copy shared UI components to `components/ui/`
2. Replace shadcn/ui with React Native equivalents
3. Create platform-specific variants where needed (`.web.tsx`, `.native.tsx`)
4. Apply NativeWind styling
5. Test responsive design on all platforms

### Phase 5: Migrate Assets
1. Copy `packages/assets/` → `assets/`
2. Update asset loading to use `expo-asset`
3. Test Git LFS integration
4. Verify assets load on web and native

### Phase 6: Migrate Tests
1. Convert Vitest tests to Jest
2. Update test imports and paths
3. Setup Jest config for Expo
4. Update Playwright tests for Expo web
5. Update Maestro tests for new app structure
6. Verify all 203 tests pass

### Phase 7: Update CI/CD
1. Update GitHub Actions workflows
2. Configure EAS Build for all platforms
3. Setup web deployment (static hosting)
4. Test full CI/CD pipeline

### Phase 8: Cleanup
1. Remove old monorepo structure (`apps/`, `packages/`)
2. Remove `pnpm-workspace.yaml`
3. Update documentation
4. Archive old code (Git tag)

## Dependencies

### Core
- `expo` ^54.0.0 (latest stable)
- `react` ^19.0.0
- `react-native` ^0.81.0
- `expo-router` ^5.0.6

### 3D Rendering
- `three` ^0.176.0 (unified version)
- `@react-three/fiber` ^9.1.2 (web)
- `@react-three/drei` ^9.122.0 (web)
- `expo-gl` ^15.0.2 (native)
- `expo-three` ^8.0.0 (native)

### Styling
- `nativewind` ^4.1.23
- `tailwindcss` ^4.0.0
- `react-native-reanimated` ^3.16.5

### State & Data
- `zustand` ^5.0.10
- `expo-sqlite` ^15.0.4 (native)
- `sql.js` ^1.12.0 (web)
- `zod` ^4.0.0

### Assets
- `expo-asset` ^11.0.1
- `expo-file-system` ^18.0.6

### Testing
- `jest` ^29.7.0 (Expo default)
- `jest-expo` ^54.0.0
- `@testing-library/react-native` ^12.9.0
- `playwright` ^1.49.1 (web E2E)
- `maestro` (mobile E2E - CLI tool)

### Build & Development
- `@expo/metro-config` ^0.20.0
- `eas-cli` ^14.2.0
- `typescript` ^5.7.2

### Removed Dependencies (No Longer Needed)
- `vite` (replaced by Metro)
- `@vitejs/plugin-react` (replaced by Metro)
- `pnpm` (use npm or yarn)
- Workspace-related packages

## Current Architecture Analysis

### Monorepo Structure (TO BE FLATTENED)
```
iron-frontier/
├── apps/
│   ├── web/          # React 19 + Vite + R3F
│   ├── mobile/       # Expo 54 + React Native + expo-gl
│   └── docs/         # Astro (separate, may keep)
├── packages/
│   ├── shared/       # Game logic (TO BE MOVED to src/)
│   ├── assets/       # 3D models (TO BE MOVED to assets/)
│   ├── types/        # TypeScript types (TO BE MERGED)
│   └── ui/           # UI components (TO BE MERGED)
├── pnpm-workspace.yaml  # TO BE REMOVED
└── package.json      # Root workspace config (TO BE REPLACED)
```

### Web App (apps/web/) - TO BE MIGRATED
- **Entry**: `main.tsx` → `App.tsx` → `R3FGame.tsx`
- **3D**: React Three Fiber Canvas with SceneRouter
- **Scenes**: `scenes/r3f/OverworldSceneR3F.tsx`, `CombatSceneR3F.tsx`
- **UI**: React DOM overlay with shadcn/ui components
- **Store**: `game/store/webGameStore.ts` (Zustand)
- **Build**: Vite with single-file output (7.7 MB)
- **Tests**: 203 tests passing (Vitest + Playwright)

### Mobile App (apps/mobile/) - TO BE MIGRATED
- **Entry**: `app/index.tsx` → `MobileGameView.tsx`
- **3D**: Custom ThreeCanvas wrapper around expo-gl
- **Scenes**: Placeholder scene in MobileGameView (cacti, rocks, building)
- **UI**: React Native components with MobileGameHUD
- **Store**: `game/store/mobileGameStore.ts` (Zustand)
- **Build**: EAS Build for iOS/Android
- **Tests**: Jest + Maestro E2E

### Shared Package (packages/shared/) - TO BE MOVED
- Game logic, schemas, generators → `src/game/`
- Data definitions → `src/data/`
- Types → `src/types/`
- Utilities → `src/lib/`

### Target Structure (Expo Best Practices)
```
iron-frontier/
├── app/              # Expo Router pages
│   ├── (tabs)/      # Tab navigation
│   ├── _layout.tsx
│   └── index.tsx
├── src/
│   ├── components/  # Shared components
│   ├── game/        # Game logic (from packages/shared)
│   ├── data/        # Game data, schemas
│   ├── store/       # Unified Zustand store
│   ├── lib/         # Utilities
│   └── types/       # TypeScript types
├── assets/          # 3D models, textures (Git LFS)
├── __tests__/       # Tests
├── app.json         # Expo config
├── package.json     # Single package.json
└── tsconfig.json    # TypeScript config
```

## References

- [Expo Setup Guide - Android](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated&mode=development-build&buildEnv=local)
- [Expo Setup Guide - iOS](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated&mode=development-build&buildEnv=local)
- [Create Expo Project](https://docs.expo.dev/get-started/create-a-project/)
- [Expo Templates](https://docs.expo.dev/more/create-expo/#--template)
- [Installing Expo Modules](https://docs.expo.dev/bare/installing-expo-modules/)
- [Expo Tailwind Guide](https://docs.expo.dev/guides/tailwind/)
- [Expo Web Workflow](https://docs.expo.dev/workflow/web/)
- [Metro Bundler for Web](https://docs.expo.dev/guides/customizing-metro/#web-support)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [expo-gl Documentation](https://docs.expo.dev/versions/latest/sdk/gl-view/)
- [expo-three Documentation](https://github.com/expo/expo-three)
- [expo-asset Documentation](https://docs.expo.dev/versions/latest/sdk/asset/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Platform-Specific Extensions](https://docs.expo.dev/guides/platform-specific-code/#platform-specific-extensions)

## Open Questions

### Low Priority (Can be resolved during design phase)

1. **Tab Navigation Structure**: What tabs should the game have?
   - Option A: Single "Game" tab with modal overlays
   - Option B: Multiple tabs (Game, Inventory, Map, Settings)
   - **Recommendation**: Start with Option A, add tabs if needed

2. **Asset Preloading**: Should we preload all 3D models on app start?
   - Option A: Preload everything (slower start, smoother gameplay)
   - Option B: Lazy load on demand (faster start, potential stutters)
   - **Recommendation**: Hybrid approach - preload critical assets, lazy load others

3. **SQLite Strategy**: Should we use same database schema for web and native?
   - Option A: Unified schema (easier to maintain)
   - Option B: Platform-specific schemas (optimized for each)
   - **Recommendation**: Option A - unified schema

4. **Documentation Site**: What to do with `apps/docs/`?
   - Option A: Keep as separate Astro site
   - Option B: Migrate to Expo web pages
   - Option C: Remove entirely
   - **Recommendation**: Option A - keep separate

## Risks & Mitigations

### High Risk

1. **Risk**: Metro bundler performance on web may be slower than Vite
   - **Impact**: Slower development workflow
   - **Probability**: Medium
   - **Mitigation**: Test early, optimize Metro config, consider webpack fallback if needed

2. **Risk**: R3F may not work well with Metro bundler
   - **Impact**: Need to rewrite 3D rendering for web
   - **Probability**: Low (R3F is widely used with Metro)
   - **Mitigation**: Test R3F + Metro early in Phase 3

3. **Risk**: Test migration may introduce bugs
   - **Impact**: Tests pass but code is broken
   - **Probability**: Medium
   - **Mitigation**: Manual testing after migration, gradual rollout

### Medium Risk

4. **Risk**: Bundle size may increase significantly
   - **Impact**: Slower web load times
   - **Probability**: Medium
   - **Mitigation**: Use bundle analyzer, optimize imports, lazy loading

5. **Risk**: Platform-specific code may diverge over time
   - **Impact**: Maintenance burden, inconsistent behavior
   - **Probability**: Medium
   - **Mitigation**: Share as much code as possible, regular cross-platform testing

6. **Risk**: NativeWind may not support all Tailwind features
   - **Impact**: Need to rewrite some styles
   - **Probability**: Low (NativeWind is mature)
   - **Mitigation**: Test early, use platform-specific styles where needed

### Low Risk

7. **Risk**: Git LFS may cause issues with new structure
   - **Impact**: Assets not loading correctly
   - **Probability**: Low
   - **Mitigation**: Test Git LFS early, update .gitattributes if needed

8. **Risk**: CI/CD pipeline may be more complex
   - **Impact**: Longer build times, more configuration
   - **Probability**: Low (EAS simplifies multi-platform builds)
   - **Mitigation**: Use EAS Workflows, test pipeline early

## Next Steps

1. **Review Requirements**: Get user approval on this requirements document
2. **Create Design Document**: Detail implementation plan with:
   - Exact directory structure
   - File-by-file migration plan
   - Code examples for key patterns
   - Testing strategy
   - CI/CD configuration
3. **Create Task List**: Break down implementation into actionable tasks
4. **Begin Implementation**: Start with Phase 1 (Setup New Expo Project)
