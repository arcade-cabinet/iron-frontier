# Tech Stack

## Monorepo Structure

pnpm workspace with platform-specific apps sharing common code:

```
apps/web/       # React 19 + Vite + Babylon.js 8 (WebGPU)
apps/mobile/    # Expo SDK 54 + React Native + Filament
apps/docs/      # Astro 5 + Starlight
packages/shared/  # Zod schemas, game data, procedural generators
```

## Core Technologies

### Web (`apps/web/`)
- **Framework**: React 19, Vite 7
- **3D Engine**: Babylon.js 8 (WebGPU via Reactylon pattern)
- **State**: Zustand
- **Persistence**: sql.js (WASM) + IndexedDB
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Testing**: Vitest, Playwright

### Mobile (`apps/mobile/`)
- **Framework**: Expo SDK 54, React Native 0.81
- **3D Engine**: React Native Filament
- **State**: Zustand
- **Persistence**: expo-sqlite
- **Styling**: NativeWind
- **Testing**: Maestro

### Shared (`packages/shared/`)
- **Schemas**: Zod v4 (validation)
- **Generation**: Simplex noise, Alea PRNG
- **Build**: tsup

## Common Commands

```bash
# Development
pnpm dev              # Start web dev server (port 8080)
pnpm dev:mobile       # Start Expo dev server

# Testing
pnpm test             # Run all 203 tests
pnpm test:web         # Web tests only
pnpm test:e2e         # Playwright E2E tests
pnpm test:coverage    # Coverage report

# Type Checking
pnpm typecheck        # Check all packages

# Building
pnpm build            # Production web build (7.7 MB single file)
pnpm build:android    # Android debug APK
pnpm build:ios        # iOS build via EAS

# Code Quality
pnpm lint             # Biome linting
pnpm lint:fix         # Auto-fix issues
pnpm format           # Format code

# Documentation
pnpm docs:dev         # Start docs dev server
pnpm docs:build       # Build docs site

# Utilities
pnpm clean            # Clean all build artifacts
pnpm compile:tiles    # Compile tile assets
```

## Environment Requirements

- **Node.js**: 22.11.0+
- **Package Manager**: pnpm 10.20.0+
- **Ports**: 8080 (web), 8081 (mobile)

## Build Outputs

- **Web**: Single HTML file with inlined assets
- **Mobile**: Debug APK (Android), IPA via EAS (iOS)
- **Docs**: Static site for GitHub Pages

## Key Dependencies

- **Zod v4**: Schema validation (all platforms)
- **Zustand**: State management (all platforms)
- **Tailwind CSS v4**: Styling (web)
- **Framer Motion**: Animations (web)
- **Three.js**: 3D math utilities (shared)

## CI/CD

GitHub Actions workflows:
- `ci.yml`: Lint, typecheck, test, build, E2E
- `mobile.yml`: Android APK build, Maestro E2E

All actions pinned to exact SHAs for reproducibility.
