# Iron Frontier - Monorepo to Expo Migration

**Date:** January 27, 2025
**Migration Type:** Monorepo → Single Expo Application
**Target:** Expo SDK 54 with pnpm

## Summary

Successfully migrated Iron Frontier from a pnpm workspace monorepo to a unified Expo application that supports both web and Android platforms with Babylon.js React Native for cross-platform 3D rendering.

## Changes Made

### 1. **New Structure Created**
- Created `app/` directory with Expo Router structure
- Created `src/` directory containing all game code (previously split across apps/web and packages/shared)
- Created `assets/` directory for all static resources
- Added `components/` and `constants/` for Expo-specific code

### 2. **Configuration Files**
- **app.json**: Expo application configuration
- **eas.json**: EAS Build profiles for Android/iOS
- **tsconfig.json**: Unified TypeScript configuration with path aliases (@/ and ~/)
- **tailwind.config.js**: NativeWind configuration
- **global.css**: Tailwind CSS styles with dark mode support
- **package.json**: Replaced workspace config with single-app dependencies

### 3. **Dependency Updates**
- Added `@babylonjs/react-native` for cross-platform 3D
- Added `expo-router` for navigation
- Added `nativewind` for styling
- Added `miniplex` for ECS
- Removed workspace-specific dependencies
- Kept `packageManager: "pnpm@10.20.0"`

### 4. **Import Path Updates**
- Changed `@iron-frontier/shared/*` → `@/*` (aliased to src/)
- Changed `@iron-frontier/assets/*` → `~/*` (aliased to root)
- Removed Next.js specific components (src/components/next/)
- Removed shadcn/ui components (web-only, require radix-ui)

### 5. **Removed**
- `apps/` directory (web, mobile, docs)
- `packages/` directory (shared)
- `pnpm-workspace.yaml`
- Monorepo-specific scripts

### 6. **Documentation Updates**
- Updated README.md with new structure and commands
- Updated project structure diagrams
- Updated tech stack table
- Updated development commands

## File Structure

```
iron-frontier/
├── app/                    # Expo Router
│   ├── (tabs)/
│   │   ├── index.tsx      # Game entry → <Game />
│   │   └── _layout.tsx
│   ├── index.tsx
│   └── _layout.tsx
├── src/                   # All game code (flattened)
│   ├── data/              # From packages/shared/src/data
│   ├── game/              # From apps/web/src/game
│   ├── engine/            # From apps/web/src/engine
│   ├── generation/        # From packages/shared/src/generation
│   └── ...
├── assets/                # All assets (merged)
├── components/            # Expo template components
├── constants/             # App constants
├── docs/                  # Development docs (kept)
├── memory-bank/           # AI context (kept)
├── app.json
├── eas.json
├── tsconfig.json
├── tailwind.config.js
├── global.css
└── package.json
```

## New Commands

```bash
# Development
pnpm start              # Expo dev server
pnpm web                # Web platform
pnpm android            # Android platform
pnpm ios                # iOS platform

# Build
pnpm build:web          # Export web build
pnpm build:android      # Build Android APK (EAS)

# Quality
pnpm typecheck          # TypeScript checking
pnpm lint               # Biome linting
pnpm lint:fix           # Auto-fix issues
```

## Known Issues

1. **TypeScript Warnings**: ~180 warnings for unused variables (existing code, not migration-related)
2. **Peer Dependencies**: 
   - @expo/metro-runtime version mismatch (non-blocking)
   - tailwindcss v4 vs v3 peer dependency warning (non-blocking)
3. **Tests**: Test suite needs adaptation for new structure (not migrated yet)

## Benefits

1. **Simplified Structure**: No monorepo complexity, single app
2. **Unified Dependencies**: Single package.json and lock file
3. **Cross-Platform 3D**: Babylon.js React Native works on web and native
4. **Easier Deployment**: Single build target
5. **Better DX**: Expo's tooling and fast refresh

## Next Steps

1. Test web build: `pnpm build:web`
2. Test Android build: `pnpm build:android`
3. Adapt test suite for new structure
4. Update CI/CD workflows for new structure
5. Verify game functionality on both platforms

## Migration Success Criteria

- [x] Structure migrated
- [x] Dependencies installed (1463 packages)
- [x] TypeScript compiles (with warnings)
- [x] Configuration files created
- [x] Documentation updated
- [ ] Tests passing (needs adaptation)
- [ ] Web build successful
- [ ] Android build successful
