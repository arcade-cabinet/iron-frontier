# CLAUDE.md - Iron Frontier

> **IMPORTANT**: Upon starting a new session, read `memory-bank/activeContext.md` and `memory-bank/projectbrief.md` to understand the current project state.

## Monorepo Structure

```
iron-frontier/
├── apps/
│   ├── web/          # Vite + React + Babylon.js (WebGPU)
│   ├── mobile/       # Expo + React Native + Filament
│   └── docs/         # Astro + Starlight documentation
├── packages/
│   └── shared/       # Shared schemas, data, types (Zod)
└── memory-bank/      # AI agent context files
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Web development
pnpm dev              # Start web dev server (port 8080)
pnpm build            # Build web app
pnpm test             # Run Vitest tests (203 tests)

# Mobile development
pnpm dev:mobile       # Start Expo dev server
pnpm build:android    # Build Android APK
pnpm build:ios        # Build iOS app

# Documentation
pnpm docs:dev         # Start docs dev server
pnpm docs:build       # Build docs site

# Quality
pnpm typecheck        # TypeScript check all packages
pnpm lint             # Biome linting
pnpm lint:fix         # Auto-fix lint issues
```

## Code Style

- **React**: Functional components, hooks, strong typing
- **State**: Zustand for global state, minimal `useState`
- **3D Web**: Babylon.js via Reactylon pattern (declarative)
- **3D Mobile**: React Native Filament
- **Styling**: Tailwind CSS v4
- **Schemas**: Zod for runtime validation
- **Naming**: `PascalCase` components, `camelCase` functions

## Memory Bank

Context files in `memory-bank/` for AI agent continuity:

| File | Purpose |
|------|---------|
| `activeContext.md` | Current focus, recent changes |
| `projectbrief.md` | Core project goals |
| `systemPatterns.md` | Architecture decisions |
| `techContext.md` | Tech stack and constraints |
| `productContext.md` | Product vision and UX |
| `progress.md` | Completed and planned work |

## Key Packages

| Package | Path | Purpose |
|---------|------|---------|
| `@iron-frontier/shared` | `packages/shared/` | Schemas, data, types |
| `@iron-frontier/web` | `apps/web/` | Web game client |
| `@iron-frontier/mobile` | `apps/mobile/` | Mobile game client |
| `@iron-frontier/docs` | `apps/docs/` | Documentation site |
