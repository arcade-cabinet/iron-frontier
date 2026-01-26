# CLAUDE.md - Iron Frontier

> **IMPORTANT**: Upon starting a new session, read `memory-bank/activeContext.md` and `memory-bank/projectbrief.md` to understand the current project state.

## Unified Expo Structure

```
iron-frontier/
├── app/              # Expo Router pages
├── components/       # React components (UI + Game)
├── src/              # Game logic (store, lib, game systems)
├── assets/           # 3D models, textures (Git LFS)
├── __tests__/        # Jest tests
├── .maestro/         # Mobile E2E tests
├── docs/             # Documentation
└── memory-bank/      # AI agent context files
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Expo development
pnpm expo:start       # Start Expo dev server
pnpm expo:web         # Start web
pnpm expo:ios         # Start iOS
pnpm expo:android     # Start Android

# Export
pnpm expo:export:web  # Export web build

# Quality
pnpm test             # Run Jest tests
pnpm typecheck        # TypeScript check
pnpm lint             # Biome linting
pnpm lint:fix         # Auto-fix lint issues
```

## Code Style

- **React**: Functional components, hooks, strong typing
- **State**: Zustand for global state
- **3D Web**: React Three Fiber
- **3D Native**: expo-gl + Three.js
- **Styling**: NativeWind (Tailwind CSS v4)
- **Routing**: Expo Router
- **Platform-specific**: Use `.web.tsx` and `.native.tsx` extensions

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

## Key Technologies

- **Expo SDK 54** + React Native 0.81
- **React 19** + React Native Web
- **Zustand** for state management
- **NativeWind** for styling
- **React Three Fiber** (web) + **expo-gl** (native)
- **sql.js** (web) + **expo-sqlite** (native)

## Architecture Notes

This is a unified Expo application targeting web, iOS, and Android. Platform-specific code uses `.web.tsx` and `.native.tsx` extensions. The project was migrated from a pnpm workspace monorepo to this unified structure.
