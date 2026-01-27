# Active Context

## Current Focus

**v0.1 Release Candidate** - Monorepo restructuring complete. PR #1 feedback addressed with critical memory leaks fixed and accessibility improved. Ready for merge and deployment.

## Upcoming Migration Plan (Ionic Angular + Capacitor + Electron)

Goal: single unified app (no `apps/` split), fully ported from React/Expo to Angular + Ionic + Capacitor, with Electron support from day one. App id stays `com.arcade-cabinet.iron-frontier`.

### Phase 0: Planning & Audit

- Inventory current Expo/React app surface area (routes, UI panels, HUD, store, game flow).
- Identify shared logic that must remain in `packages/shared/` (schemas, data, generators, store types).
- Decide keep/remove any legacy mono-repo docs (likely remove `apps/`).

### Phase 1: Scaffold & Platform Wiring

- Initialize Ionic Angular app at repo root (single app).
- Enable Angular zoneless change detection configuration.
- Add Capacitor (web, ios, android) and configure `appId`/`appName`.
- Add Electron platform (`@capacitor-community/electron`) at the start.
- Update scripts for `ionic serve`, `ionic cap sync`, `ionic cap add`, Electron run/build.

### Phase 2: Babylon.js Integration

- Create Babylon.js canvas and engine bootstrap in Angular (interop-friendly).
- Replace Reactylon pattern with direct Babylon scene management.
- Verify WebGPU/WebGL fallback and lifecycle disposal.

### Phase 3: State, UI, and HUD Port

- Port Zustand store (or evaluate Angular-friendly wrapper while keeping core types).
- Rebuild HUD and panels using Ionic components with existing steampunk styling.
- Port navigation/menus to Angular router + Ionic navigation patterns.

### Phase 4: Game Systems & Data

- Connect shared data, schemas, generators from `packages/shared/`.
- Port combat, dialogue, travel screens and their UI logic.
- Ensure persistence layer works in web + native (SQLite/IndexedDB or Capacitor storage).

### Phase 5: Cleanup & CI

- Remove Expo/React-specific files and configs.
- Remove unused dependencies and update build/test pipelines.
- Add Ionic/Capacitor build steps for web/android/ios/electron.

### Phase 6: Verification

- Validate web, Android, iOS, Electron builds.
- Ensure performance targets and touch targets remain compliant.

## Recent History

### Session 2026-01-27: PR Feedback Fixes

Fixed critical issues from CodeRabbit PR #1 review:

1. **Memory Leak Fixes**
   - `SceneManager.ts`: Store and remove resize event listener in dispose()
   - `BabylonEngine.ts`: Store and remove resize listener, dispose shadow generator
   - `TerrainChunk.ts`: Force dispose textures with material.dispose(true)
   - `InputController.ts`: Store and remove all DOM event listeners (touch, mouse, keyboard)

2. **Pathfinding Improvements**
   - `pathfinding.ts`: Validate start tile is walkable before running A* algorithm

3. **Accessibility Enhancements**
   - Added aria-hidden="true" to 41 decorative SVG icons across 7 UI components
   - Prevents screen readers from announcing redundant icon information
   - Affected files: ActionBar, DialogueBox, GameHUD, InventoryPanel, MenuPanel, NotificationFeed, QuestLog

### Session 2026-01-24: Monorepo Restructuring

### Monorepo Restructuring Complete

The project has been restructured into a pnpm monorepo with DRY architecture:

```
iron-frontier/
├── apps/
│   ├── web/          # Vite + React + Babylon.js
│   ├── mobile/       # Expo + React Native + Filament
│   └── docs/         # Astro + Starlight
├── packages/
│   └── shared/       # All shared code (schemas, data, types)
```

### Key Changes Made

1. **Data Consolidation**
   - All schemas moved to `packages/shared/src/data/schemas/`
   - All game data (items, NPCs, quests) moved to `packages/shared/src/data/`
   - Removed duplicate data from `apps/web/src/data/`

2. **GitHub Actions Updated**
   - All actions pinned to exact SHAs (not version tags)
   - `ci.yml` - Lint, test, build, E2E, docs deploy
   - `mobile.yml` - Android APK build, Maestro E2E

3. **Zod v4 Migration**
   - Fixed `.default({})` patterns to use full defaults
   - Updated optional array defaults: `.optional().default([])`
   - All schemas validate correctly

4. **PR Review Processing**
   - Processed 100+ AI review comments from Gemini and CodeRabbit
   - Resolved outdated comments (old `src/` paths)
   - Resolved intentional design choices (singlefile, tsconfig)
   - Fixed AGENTS.md `tscgo` → `pnpm typecheck`

5. **Responsive UI**
   - All panels responsive across breakpoints
   - Touch targets 44-56px minimum
   - Labels hidden on mobile, visible on tablet+

### Build & Test Status

- **Build**: Passes (7.7 MB single-file output)
- **Tests**: 203/203 pass
- **TypeScript**: No errors
- **Lint**: Clean (Biome)

## Active Decisions

| Decision | Rationale |
|----------|-----------|
| Monorepo with pnpm | Share code between web and mobile |
| Babylon.js for web | WebGPU support, declarative via Reactylon |
| Filament for mobile | Native 3D performance on Android/iOS |
| sql.js for web | Full SQLite in browser via WASM |
| expo-sqlite for mobile | Native SQLite performance |
| Zod for schemas | Runtime validation, TypeScript inference |
| Single-file build | Offline PWA, easy deployment |

## Current Branch

`release/v0.1-candidate` - PR #1 open against `main`

## Next Steps

1. **Merge PR #1** - All review comments resolved
2. **Connect Render.com** - Deploy web app via blueprint
3. **Audio System** - Add western ambient music and SFX
4. **Mobile Testing** - Test on physical Android device

## Key Files to Watch

| File | Purpose |
|------|---------|
| `packages/shared/src/data/schemas/*.ts` | All Zod schemas |
| `apps/web/src/game/store/webGameStore.ts` | Web game state |
| `apps/web/src/engine/hex/HexSceneManager.ts` | 3D rendering |
| `.github/workflows/*.yml` | CI/CD pipelines |
