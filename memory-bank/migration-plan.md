# Migration Plan: Single App Replatform (Ionic Angular + Capacitor + Electron)

## Objective

Deliver a single, unified app at repo root with parity-or-better gameplay, UI, and systems versus the current React/Expo implementation. Babylon.js is used directly (no Reactylon). Ionic handles UI and Capacitor handles platforms (web, Android, iOS, Electron). App id remains `com.arcade-cabinet.iron-frontier`.

## Non-Negotiables

- Single root app (no WET `apps/` split).
- Electron is first-class from day one.
- Full 1:1 (or better) port of gameplay, HUD, panels, styles, fonts, assets, and systems.
- Identify and remove placeholders/stubs; close gaps in game flow.
- Follow Ionic and Babylon.js best practices, maintain architecture/branding alignment.
- Testing is ported and aligned: unit/integration + Playwright (web) + Maestro (mobile).

## Workstreams & Deliverables

### 1) Audit & Gap Analysis
- Inventory all React/Expo screens, panels, HUD modules, flows, and services.
- Inventory game systems: combat, dialogue, travel, shops, quests, world map, save/load, audio.
- Identify gaps/stubs in current codebase and list concrete fixes.
- Define parity checklist and acceptance criteria per module.

### 2) Repo Restructure (Single App)
- Ensure root `src/` is the only app source (Ionic Angular).
- Consolidate assets under root `assets/` and ensure Angular build includes them.
- Keep `packages/shared/` for schemas, data, generators, and types.
- Remove React/Reactylon/Expo-specific apps and configs once parity is achieved.
- Remove any pre-existing Electron wrapper to avoid conflicts; use Capacitor Electron.

### 3) Platform Setup (Capacitor + Electron)
- Follow Capacitor environment setup for Android/iOS (Android Studio, Xcode).
- Configure Capacitor `appId` and `appName` in `capacitor.config.*`.
- Add platforms: `web`, `android`, `ios`, `electron` with `@capacitor-community/electron`.
- Define scripts for `ionic serve`, `ionic build`, `ionic cap sync`, platform run/build.

### 4) Rendering & Engine Integration
- Babylon.js engine bootstrapped in Angular with lifecycle-managed canvas.
- WebGPU primary, WebGL fallback; ensure deterministic scene disposal.
- Input/touch mapping matches mobile UX and existing controls.
- Rapier integrated for physics; Anime.js for UI motion.

### 5) State & Persistence
- Zustand store ported and wrapped via Angular services.
- Shared types preserved from `packages/shared/`.
- Persistence unified: web/electron via IndexedDB/Capacitor Storage; mobile via SQLite plugin.

### 6) UI + HUD Port (Parity+)
- Port all panels and HUD modules to Ionic Angular.
- Rebuild typography, icons, animation, and color system to match branding.
- Ensure responsive breakpoints and touch target rules.

### 7) Gameplay Systems (Parity+)
- Combat, travel, dialogue, quests, shops, inventory, equipment, world map.
- Remove legacy TODOs/stubs; implement missing logic and UI.

### 8) Testing Alignment
- Unit/integration tests aligned to new Angular architecture.
- Playwright E2E for web flow.
- Maestro E2E for Android/iOS flow.
- Update CI to build and test root app only.

### 9) Validation & Release
- Web + Android + iOS + Electron validation passes.
- Performance targets met (60fps mid-range mobile).
- Manual QA run with gap checklist closed.

## Initial Gap Targets (To Confirm in Audit)

- Any missing panels: Travel, Shop, World Map, Puzzle, Game Over.
- Audio system parity (music/SFX/ambience).
- Save/load reliability and offline behavior across platforms.
- Babylon.js lifecycle and resource disposal consistency.
- Full test migration (unit + Playwright + Maestro).

