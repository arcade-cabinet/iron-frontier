# Active Context

## Current Focus

**v0.1 Release Candidate** - Monorepo restructuring complete. PR #1 open with all AI review comments (100+) resolved. Ready for merge and deployment.

## Recent History (Session 2026-01-24)

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
