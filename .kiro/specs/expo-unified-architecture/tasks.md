# Expo Unified Architecture Migration - Tasks

## Overview

This task list breaks down the migration from a pnpm workspace monorepo to a single unified Expo application into actionable tasks. Tasks are organized by phase and include validation criteria.

**Total Estimated Time**: 23-32 days (5-6 weeks with 20% buffer)

---

## Phase 1: Setup New Expo Project (2-3 days)

### 1.1 Create Expo Project
- [ ] 1.1.1 Create new Expo project using tabs template: `npx create-expo-app iron-frontier --template tabs`
- [ ] 1.1.2 Verify project structure matches Expo best practices
- [ ] 1.1.3 Initialize Git repository and create initial commit
- [ ] 1.1.4 Setup Git LFS: copy `.gitattributes` from old project and run `git lfs install`

### 1.2 Install Core Dependencies
- [ ] 1.2.1 Install Expo core packages: `expo-router`, `expo-screen-orientation`
- [ ] 1.2.2 Install 3D rendering packages: `three@0.176.0`, `@react-three/fiber`, `@react-three/drei`, `expo-gl`, `expo-three`
- [ ] 1.2.3 Install state management: `zustand`, `expo-sqlite`, `@react-native-async-storage/async-storage`, `sql.js`, `zod`
- [ ] 1.2.4 Install styling packages: `nativewind`, `tailwindcss`, `react-native-reanimated`
- [ ] 1.2.5 Install testing packages: `jest-expo`, `jest`, `@testing-library/react-native`, `playwright`
- [ ] 1.2.6 Verify all dependencies install without errors

### 1.3 Configure Metro Bundler
- [ ] 1.3.1 Create `metro.config.js` with Expo default config
- [ ] 1.3.2 Add 3D asset extensions: `.glb`, `.gltf`, `.obj`, `.mtl`, `.fbx`, `.dae`
- [ ] 1.3.3 Configure source map exclusion from assets
- [ ] 1.3.4 Test Metro bundler starts successfully

### 1.4 Configure Expo App
- [ ] 1.4.1 Update `app.json` with game metadata (name, slug, version)
- [ ] 1.4.2 Set orientation to "default" (support both portrait and landscape)
- [ ] 1.4.3 Configure iOS settings: orientation support, tablet support, resizable activity
- [ ] 1.4.4 Configure Android settings: adaptive icon, resizable activity for foldables
- [ ] 1.4.5 Enable Metro web bundler: `expo.web.bundler: "metro"`
- [ ] 1.4.6 Add Expo plugins: `expo-router`, `expo-asset`, `expo-screen-orientation`

### 1.5 Setup NativeWind
- [ ] 1.5.1 Create `tailwind.config.js` with content paths
- [ ] 1.5.2 Add Steampunk color palette (brass, copper, steam, amber shades)
- [ ] 1.5.3 Configure responsive breakpoints (xs, sm, md, lg, xl, fold)
- [ ] 1.5.4 Update `babel.config.js` to include NativeWind preset
- [ ] 1.5.5 Test NativeWind classes render correctly on web and native

### 1.6 Configure EAS Build
- [ ] 1.6.1 Create `eas.json` with build profiles (development, preview, production)
- [ ] 1.6.2 Configure Android preview profile for debug APKs (all architectures)
- [ ] 1.6.3 Configure iOS development builds
- [ ] 1.6.4 Test EAS configuration validates: `eas build:configure`

### 1.7 Setup Responsive Design Infrastructure
- [ ] 1.7.1 Create `src/lib/orientation.ts` with `useOrientation` hook
- [ ] 1.7.2 Create `src/lib/foldable.ts` with `useFoldableState` hook
- [ ] 1.7.3 Create `src/lib/layout.ts` with `getLayoutConfig` and `useLayoutConfig`
- [ ] 1.7.4 Test orientation detection on emulators
- [ ] 1.7.5 Test foldable detection on Pixel Fold emulator

### 1.8 Validation
- [ ] 1.8.1 Run `expo start` and verify web, iOS, Android all launch
- [ ] 1.8.2 Test on Pixel 8A emulator (portrait and landscape)
- [ ] 1.8.3 Test on Pixel Fold emulator (folded and unfolded)
- [ ] 1.8.4 Test on Pixel Tablet emulator
- [ ] 1.8.5 Test on iPhone 17 simulator
- [ ] 1.8.6 Test on iPad simulator
- [ ] 1.8.7 Verify orientation changes work smoothly
- [ ] 1.8.8 Verify fold/unfold transitions work on Pixel Fold

---

## Phase 2: Migrate Game Logic (3-4 days)

### 2.1 Copy Game Data and Schemas
- [ ] 2.1.1 Create `src/game/` directory structure
- [ ] 2.1.2 Copy `packages/shared/src/data/schemas/` to `src/game/data/schemas/`
- [ ] 2.1.3 Copy `packages/shared/src/data/items/` to `src/game/data/items/`
- [ ] 2.1.4 Copy `packages/shared/src/data/npcs/` to `src/game/data/npcs/`
- [ ] 2.1.5 Copy `packages/shared/src/data/quests/` to `src/game/data/quests/`
- [ ] 2.1.6 Copy `packages/shared/src/data/dialogues/` to `src/game/data/dialogues/`
- [ ] 2.1.7 Copy `packages/shared/src/data/world/` to `src/game/data/world/` (authored content)

### 2.2 Copy Game Systems
- [ ] 2.2.1 Copy `packages/shared/src/systems/` to `src/game/systems/`
- [ ] 2.2.2 Copy time system, fatigue system, provisions system
- [ ] 2.2.3 Copy combat system logic
- [ ] 2.2.4 Copy dialogue system
- [ ] 2.2.5 Copy inventory system

### 2.3 Copy Procedural Generators
- [ ] 2.3.1 Copy `packages/shared/src/generation/` to `src/game/generation/`
- [ ] 2.3.2 Copy all generator files (name, NPC, quest, item, world)
- [ ] 2.3.3 Copy generation templates and pools

### 2.4 Copy Utilities and Types
- [ ] 2.4.1 Copy `packages/shared/src/lib/` to `src/lib/`
- [ ] 2.4.2 Copy `packages/shared/src/types/` to `src/types/`
- [ ] 2.4.3 Copy PRNG, hex utilities, and other helpers

### 2.5 Update Import Paths
- [ ] 2.5.1 Find and replace `@iron-frontier/shared` with relative paths
- [ ] 2.5.2 Update all imports in copied files to use `@/` path alias
- [ ] 2.5.3 Fix any circular dependency issues
- [ ] 2.5.4 Run TypeScript compiler to find remaining import errors

### 2.6 Create Unified Zustand Store
- [ ] 2.6.1 Create `src/store/gameStore.ts` with base interface
- [ ] 2.6.2 Merge state from `webGameStore.ts` and `mobileGameStore.ts`
- [ ] 2.6.3 Add platform-specific initialization using `Platform.OS`
- [ ] 2.6.4 Configure Zustand persist middleware with AsyncStorage/localStorage
- [ ] 2.6.5 Create store slices: `playerSlice`, `worldSlice`, `combatSlice`, `uiSlice`
- [ ] 2.6.6 Add actions for all game operations

### 2.7 Create Platform-Specific Database
- [ ] 2.7.1 Create `src/lib/database.ts` with Database interface
- [ ] 2.7.2 Create `src/lib/database.web.ts` with sql.js implementation
- [ ] 2.7.3 Create `src/lib/database.native.ts` with expo-sqlite implementation
- [ ] 2.7.4 Implement table creation for player, inventory, quests, world state
- [ ] 2.7.5 Test database operations on web and native

### 2.8 Validation
- [ ] 2.8.1 Run `npm run typecheck` - all errors resolved
- [ ] 2.8.2 Import game store in test file - no errors
- [ ] 2.8.3 Initialize database on web - succeeds
- [ ] 2.8.4 Initialize database on native - succeeds
- [ ] 2.8.5 Load game data (items, NPCs, quests) - succeeds
- [ ] 2.8.6 Verify Zod schemas validate correctly

---

## Phase 3: Migrate 3D Rendering (4-5 days)

### 3.1 Create Platform-Specific Canvas Wrappers
- [ ] 3.1.1 Create `components/game/GameCanvas.web.tsx` with R3F Canvas
- [ ] 3.1.2 Configure R3F Canvas: shadows, antialiasing, camera setup
- [ ] 3.1.3 Add OrbitControls for web camera control
- [ ] 3.1.4 Create `components/game/GameCanvas.native.tsx` with expo-gl
- [ ] 3.1.5 Setup Three.js renderer, scene, and camera for native
- [ ] 3.1.6 Implement render loop for native
- [ ] 3.1.7 Test both Canvas implementations render basic geometry

### 3.2 Migrate Scene Components
- [ ] 3.2.1 Copy `apps/web/src/game/scenes/r3f/` to `components/game/scenes/`
- [ ] 3.2.2 Make OverworldScene platform-agnostic (remove R3F-specific code)
- [ ] 3.2.3 Make CombatScene platform-agnostic
- [ ] 3.2.4 Make TravelScene platform-agnostic
- [ ] 3.2.5 Create shared lighting components (ambient, directional)
- [ ] 3.2.6 Create shared mesh components (HexGrid, PlayerCharacter, NPCCharacter)

### 3.3 Implement Asset Loading
- [ ] 3.3.1 Create `src/lib/assets.ts` with `loadModel` function
- [ ] 3.3.2 Implement web asset loading (public URL)
- [ ] 3.3.3 Implement native asset loading (expo-asset with localUri)
- [ ] 3.3.4 Create asset preloading utility
- [ ] 3.3.5 Test 3D model loading on web
- [ ] 3.3.6 Test 3D model loading on native

### 3.4 Setup Camera Controls
- [ ] 3.4.1 Implement touch controls for mobile (pan, pinch, rotate)
- [ ] 3.4.2 Implement mouse controls for web (drag, scroll, click)
- [ ] 3.4.3 Add camera follow player logic
- [ ] 3.4.4 Add camera bounds to keep player visible
- [ ] 3.4.5 Test camera controls on all devices

### 3.5 Optimize Rendering
- [ ] 3.5.1 Implement LOD (Level of Detail) system
- [ ] 3.5.2 Add frustum culling
- [ ] 3.5.3 Implement object pooling for frequently created meshes
- [ ] 3.5.4 Add performance monitoring (FPS counter)
- [ ] 3.5.5 Test 60fps target on mid-range devices

### 3.6 Validation
- [ ] 3.6.1 3D scenes render on web without errors
- [ ] 3.6.2 3D scenes render on iOS without errors
- [ ] 3.6.3 3D scenes render on Android without errors
- [ ] 3.6.4 Assets load correctly on all platforms
- [ ] 3.6.5 Camera controls work smoothly
- [ ] 3.6.6 Performance meets 60fps target on Pixel 8A
- [ ] 3.6.7 Performance meets 60fps target on iPhone 17

---

## Phase 4: Migrate UI Components (3-4 days)

### 4.1 Create Base UI Components
- [x] 4.1.1 Create `components/ui/Button.tsx` with NativeWind styling
- [x] 4.1.2 Create `components/ui/Card.tsx` with Steampunk theme
- [x] 4.1.3 Create `components/ui/Modal.tsx` using React Native Modal
- [x] 4.1.4 Create `components/ui/Input.tsx` with TextInput
- [x] 4.1.5 Create `components/ui/Progress.tsx` for health/XP bars
- [x] 4.1.6 Test all base components on web and native

### 4.2 Create Adaptive HUD Components
- [x] 4.2.1 Create `components/game/hud/MinimalHUD.tsx` (portrait phone)
- [x] 4.2.2 Create `components/game/hud/CompactHUD.tsx` (landscape phone)
- [x] 4.2.3 Create `components/game/hud/FullHUD.tsx` (tablet/foldable)
- [x] 4.2.4 Create `components/game/hud/AdaptiveHUD.tsx` with mode switching
- [x] 4.2.5 Test HUD adapts correctly on all devices and orientations

### 4.3 Migrate Game UI Panels
- [x] 4.3.1 Migrate ActionBar with NativeWind (bottom navigation)
- [x] 4.3.2 Migrate DialogueBox with typewriter effect
- [x] 4.3.3 Migrate InventoryPanel with grid layout
- [x] 4.3.4 Migrate CombatPanel with turn-based UI
- [x] 4.3.5 Migrate ShopPanel with item list
- [x] 4.3.6 Migrate QuestPanel with quest log
- [x] 4.3.7 Migrate SettingsPanel with game options
- [x] 4.3.8 Apply Steampunk styling to all panels

### 4.4 Setup Navigation
- [ ] 4.4.1 Configure Expo Router tabs in `app/(tabs)/_layout.tsx`
- [ ] 4.4.2 Create tab screens: index (game), inventory, settings
- [ ] 4.4.3 Implement modal navigation for panels
- [ ] 4.4.4 Add tab bar icons with Steampunk theme
- [ ] 4.4.5 Test navigation on all platforms

### 4.5 Implement Responsive Design
- [ ] 4.5.1 Test UI on Pixel 8A (portrait and landscape)
- [ ] 4.5.2 Test UI on Pixel Fold (folded and unfolded)
- [ ] 4.5.3 Test UI on Pixel Tablet
- [ ] 4.5.4 Test UI on iPhone 17 (portrait and landscape)
- [ ] 4.5.5 Test UI on iPad
- [ ] 4.5.6 Verify touch targets are minimum 44x44px
- [ ] 4.5.7 Verify text is readable on all screen sizes

### 4.6 Add Animations
- [ ] 4.6.1 Add panel slide-in/out animations with react-native-reanimated
- [ ] 4.6.2 Add button press animations
- [ ] 4.6.3 Add item pickup animations
- [ ] 4.6.4 Add level up animations
- [ ] 4.6.5 Test animations run at 60fps

### 4.7 Validation
- [ ] 4.7.1 All UI components render correctly on web
- [ ] 4.7.2 All UI components render correctly on native
- [ ] 4.7.3 Styling matches Steampunk theme (brass, amber, copper colors)
- [ ] 4.7.4 Navigation works on all platforms
- [ ] 4.7.5 Responsive design works on all devices
- [ ] 4.7.6 Animations are smooth (60fps)
- [ ] 4.7.7 Touch targets meet 44x44px minimum

---

## Phase 5: Migrate Assets (1-2 days)

### 5.1 Copy Assets
- [ ] 5.1.1 Create `assets/` directory structure (models, textures, fonts, images)
- [ ] 5.1.2 Copy 3D models from `packages/assets/models/` to `assets/models/`
- [ ] 5.1.3 Copy textures from `packages/assets/textures/` to `assets/textures/`
- [ ] 5.1.4 Copy fonts to `assets/fonts/`
- [ ] 5.1.5 Copy UI images to `assets/images/`

### 5.2 Update Asset References
- [ ] 5.2.1 Update all `require()` statements to point to new asset paths
- [ ] 5.2.2 Update asset loading code to use `expo-asset`
- [ ] 5.2.3 Test asset loading on web
- [ ] 5.2.4 Test asset loading on native

### 5.3 Verify Git LFS
- [ ] 5.3.1 Run `git lfs ls-files` to verify LFS tracking
- [ ] 5.3.2 Verify `.glb`, `.gltf`, `.png`, `.jpg` files are tracked by LFS
- [ ] 5.3.3 Verify assets are not in regular Git (only LFS pointers)
- [ ] 5.3.4 Test Git LFS pull on fresh clone

### 5.4 Optimize Assets
- [ ] 5.4.1 Run `expo-optimize` for images
- [ ] 5.4.2 Check 3D model file sizes (compress if needed)
- [ ] 5.4.3 Verify total asset size is reasonable (<50MB)

### 5.5 Validation
- [ ] 5.5.1 All assets load correctly on web
- [ ] 5.5.2 All assets load correctly on iOS
- [ ] 5.5.3 All assets load correctly on Android
- [ ] 5.5.4 Git LFS tracking works correctly
- [ ] 5.5.5 Asset file sizes are reasonable
- [ ] 5.5.6 No assets in regular Git (only LFS pointers)

---

## Phase 6: Migrate Tests (3-4 days)

### 6.1 Setup Jest Configuration
- [ ] 6.1.1 Create `jest.config.js` with jest-expo preset
- [ ] 6.1.2 Configure transform ignore patterns for React Native modules
- [ ] 6.1.3 Create `__tests__/setup.ts` with test environment setup
- [ ] 6.1.4 Mock Expo modules (expo-asset, expo-gl, expo-sqlite)
- [ ] 6.1.5 Configure coverage collection

### 6.2 Convert Unit Tests
- [ ] 6.2.1 Convert store tests from Vitest to Jest
- [ ] 6.2.2 Convert component tests from Vitest to Jest
- [ ] 6.2.3 Convert game logic tests from Vitest to Jest
- [ ] 6.2.4 Update test imports (replace Vitest with Jest)
- [ ] 6.2.5 Fix any compatibility issues
- [ ] 6.2.6 Run all unit tests - verify 203 tests pass

### 6.3 Create Responsive Design Tests (Playwright)
- [ ] 6.3.1 Create `__tests__/e2e/web/responsive.spec.ts`
- [ ] 6.3.2 Test phone portrait viewport (390x844)
- [ ] 6.3.3 Test phone landscape viewport (844x390)
- [ ] 6.3.4 Test tablet viewport (1640x2360)
- [ ] 6.3.5 Test rotation transitions
- [ ] 6.3.6 Test adaptive HUD modes (minimal, compact, full)

### 6.4 Update Playwright Tests
- [ ] 6.4.1 Update base URL to Expo web server (http://localhost:8081)
- [ ] 6.4.2 Update selectors if needed
- [ ] 6.4.3 Test gameplay flow on web
- [ ] 6.4.4 Test navigation on web
- [ ] 6.4.5 Run Playwright tests - verify all pass

### 6.5 Create Device-Specific Maestro Tests
- [ ] 6.5.1 Create `__tests__/e2e/mobile/pixel-8a.yaml` (portrait/landscape)
- [ ] 6.5.2 Create `__tests__/e2e/mobile/pixel-fold-folded.yaml`
- [ ] 6.5.3 Create `__tests__/e2e/mobile/pixel-fold-unfolded.yaml`
- [ ] 6.5.4 Create `__tests__/e2e/mobile/pixel-tablet.yaml`
- [ ] 6.5.5 Create `__tests__/e2e/mobile/iphone-17.yaml` (portrait/landscape)
- [ ] 6.5.6 Create `__tests__/e2e/mobile/ipad.yaml`
- [ ] 6.5.7 Create `__tests__/e2e/mobile/rotation-test.yaml`
- [ ] 6.5.8 Create `__tests__/e2e/mobile/fold-test.yaml`

### 6.6 Update Maestro Tests
- [ ] 6.6.1 Update app ID to `com.ironfrontier.app`
- [ ] 6.6.2 Update screen selectors for new UI structure
- [ ] 6.6.3 Test gameplay flow on all devices
- [ ] 6.6.4 Test navigation on all devices
- [ ] 6.6.5 Test orientation changes
- [ ] 6.6.6 Test fold/unfold transitions on Pixel Fold
- [ ] 6.6.7 Run Maestro tests on all devices - verify all pass

### 6.7 Validation
- [ ] 6.7.1 All 203 unit tests pass with Jest
- [ ] 6.7.2 Coverage meets targets (>80%)
- [ ] 6.7.3 Playwright tests pass on all viewports
- [ ] 6.7.4 Maestro tests pass on Pixel 8A (portrait and landscape)
- [ ] 6.7.5 Maestro tests pass on Pixel Fold (folded and unfolded)
- [ ] 6.7.6 Maestro tests pass on Pixel Tablet
- [ ] 6.7.7 Maestro tests pass on iPhone 17 (portrait and landscape)
- [ ] 6.7.8 Maestro tests pass on iPad
- [ ] 6.7.9 Rotation tests pass
- [ ] 6.7.10 Fold/unfold tests pass

---

## Phase 7: Update CI/CD (2-3 days)

### 7.1 Create GitHub Actions Workflow
- [ ] 7.1.1 Create `.github/workflows/ci.yml`
- [ ] 7.1.2 Pin all actions to exact SHAs with version comments
- [ ] 7.1.3 Add lint-and-typecheck job
- [ ] 7.1.4 Add test job with coverage upload
- [ ] 7.1.5 Add build-web job
- [ ] 7.1.6 Add e2e-web job with Playwright
- [ ] 7.1.7 Add build-mobile job with EAS Build
- [ ] 7.1.8 Add deploy-web job for GitHub Pages
- [ ] 7.1.9 Add release-android job for debug APKs
- [ ] 7.1.10 Add release-please job

### 7.2 Configure GitHub Secrets
- [ ] 7.2.1 Add `EXPO_TOKEN` secret
- [ ] 7.2.2 Configure GitHub Pages permissions
- [ ] 7.2.3 Test secrets are accessible in workflow

### 7.3 Setup GitHub Pages
- [ ] 7.3.1 Enable GitHub Pages in repository settings
- [ ] 7.3.2 Configure source to GitHub Actions
- [ ] 7.3.3 Test deployment to GitHub Pages

### 7.4 Setup release-please
- [ ] 7.4.1 Create `.release-please-manifest.json`
- [ ] 7.4.2 Create `release-please-config.json`
- [ ] 7.4.3 Configure release-please for node package
- [ ] 7.4.4 Test release-please creates PR

### 7.5 Test CI Pipeline
- [ ] 7.5.1 Push to test branch
- [ ] 7.5.2 Verify lint-and-typecheck job runs
- [ ] 7.5.3 Verify test job runs and uploads coverage
- [ ] 7.5.4 Verify build-web job creates artifact
- [ ] 7.5.5 Verify e2e-web job runs Playwright tests
- [ ] 7.5.6 Fix any CI failures

### 7.6 Test Deployment
- [ ] 7.6.1 Merge to main branch
- [ ] 7.6.2 Verify web deploys to GitHub Pages
- [ ] 7.6.3 Verify Android APKs build successfully
- [ ] 7.6.4 Verify release-please creates release with APKs
- [ ] 7.6.5 Test deployed web app works correctly

### 7.7 Validation
- [ ] 7.7.1 CI pipeline runs successfully on push
- [ ] 7.7.2 All jobs complete without errors
- [ ] 7.7.3 Tests run in CI
- [ ] 7.7.4 Web deploys to GitHub Pages automatically
- [ ] 7.7.5 Android APKs attach to releases
- [ ] 7.7.6 Deployed web app is accessible and functional

---

## Phase 8: Cleanup and Documentation (1-2 days)

### 8.1 Remove Old Monorepo Structure
- [ ] 8.1.1 Create Git tag `v0.1-monorepo` before deletion
- [ ] 8.1.2 Push tag to remote
- [ ] 8.1.3 Delete `apps/` directory
- [ ] 8.1.4 Delete `packages/` directory
- [ ] 8.1.5 Delete `pnpm-workspace.yaml`
- [ ] 8.1.6 Delete workspace-related configs
- [ ] 8.1.7 Commit deletion with clear message

### 8.2 Update Documentation
- [ ] 8.2.1 Update `README.md` with new project structure
- [ ] 8.2.2 Update `AGENTS.md` with Expo-specific instructions
- [ ] 8.2.3 Update `docs/DEVELOPMENT_GUIDE.md` for single Expo app
- [ ] 8.2.4 Update `docs/ARCHITECTURE_V2.md` if needed
- [ ] 8.2.5 Remove references to monorepo structure
- [ ] 8.2.6 Add deployment instructions (GitHub Pages, APKs)

### 8.3 Create Migration Guide
- [ ] 8.3.1 Create `docs/MIGRATION_GUIDE.md`
- [ ] 8.3.2 Document all breaking changes
- [ ] 8.3.3 Provide upgrade instructions for developers
- [ ] 8.3.4 Document new commands and workflows
- [ ] 8.3.5 Document rollback procedure

### 8.4 Final Validation
- [ ] 8.4.1 Fresh clone of repository
- [ ] 8.4.2 Run `npm install` - succeeds
- [ ] 8.4.3 Run `expo start` - launches successfully
- [ ] 8.4.4 Run `npm test` - all tests pass
- [ ] 8.4.5 Run `npm run typecheck` - no errors
- [ ] 8.4.6 Build web: `npx expo export:web` - succeeds
- [ ] 8.4.7 Build Android: `eas build --platform android --profile preview` - succeeds
- [ ] 8.4.8 Test on all supported devices - works correctly

### 8.5 Validation
- [ ] 8.5.1 Old monorepo structure removed
- [ ] 8.5.2 Git tag `v0.1-monorepo` exists
- [ ] 8.5.3 Documentation updated and accurate
- [ ] 8.5.4 Migration guide complete
- [ ] 8.5.5 Fresh clone works correctly
- [ ] 8.5.6 All commands work as documented

---

## Success Criteria

The migration is complete when:

- [ ] ✅ All 203 tests pass with Jest
- [ ] ✅ Web, iOS, and Android builds succeed via EAS
- [ ] ✅ Single command (`expo start`) launches all platforms
- [ ] ✅ 60fps maintained on all platforms
- [ ] ✅ Bundle size ≤ 10 MB for web
- [ ] ✅ App size < 50 MB for native
- [ ] ✅ CI/CD pipeline runs successfully
- [ ] ✅ Web deploys to GitHub Pages automatically
- [ ] ✅ Android APKs attach to releases via release-please
- [ ] ✅ No monorepo structure (single package.json)
- [ ] ✅ All game features work identically across platforms
- [ ] ✅ Responsive design works on all supported devices
- [ ] ✅ Orientation changes work smoothly
- [ ] ✅ Foldable transitions work correctly
- [ ] ✅ Documentation updated and complete

---

## Notes

- Tasks marked with `[ ]` are not started
- Tasks marked with `[x]` are completed
- Tasks marked with `[-]` are in progress
- Tasks marked with `[~]` are queued
- Optional tasks are marked with `*` after the checkbox: `[ ]*`
