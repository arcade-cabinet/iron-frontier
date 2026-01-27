# Iron Frontier

**A Cross-Platform Steampunk Frontier RPG**

Web: React + Babylon.js | Mobile: Expo + React Native Filament

![Status: Alpha v0.1](https://img.shields.io/badge/status-alpha%20v0.1-orange)
![Platform: Cross-Platform](https://img.shields.io/badge/platform-web%20%2B%20mobile-blue)
![Tests: 203 passing](https://img.shields.io/badge/tests-203%20passing-green)

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Expo dev server
pnpm expo:start

# Start web
pnpm expo:web

# Run tests
pnpm test

# Type check
pnpm typecheck
```

---

## What is Iron Frontier?

Iron Frontier is an isometric RPG set in a steampunk American frontier (circa 1887). Players explore procedurally generated locations, meet quirky NPCs, collect items, and complete quests.

### Core Features

- **Isometric 3D** - React Three Fiber (web) / expo-gl (mobile) with FF7-era atmosphere
- **Procedural Generation** - Daggerfall-style deterministic content
- **Cross-Platform** - Unified Expo app with platform-specific rendering
- **Persistent Progress** - SQLite-backed save system

### Theme & Setting

- Late 1800s American frontier
- Steam-powered technology
- Brass, copper, and iron aesthetics
- Western frontier towns and railyards

---

## Unified Expo Structure

```
iron-frontier/
├── app/              # Expo Router pages
│   ├── (tabs)/       # Tab navigation
│   └── _layout.tsx   # Root layout
├── src/              # All source code
│   ├── components/   # React components
│   ├── game/         # Game systems
│   ├── store/        # Zustand state
│   └── lib/          # Utilities
├── assets/           # 3D models, textures (Git LFS)
├── __tests__/        # Jest tests
├── .maestro/         # Mobile E2E tests
├── docs/             # Documentation
└── memory-bank/      # AI agent context
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Expo SDK 54 + React Native 0.81 |
| **Web** | React 19 + React Native Web |
| **3D Rendering** | React Three Fiber (web) + expo-gl (native) |
| **State** | Zustand |
| **Persistence** | sql.js (web) + expo-sqlite (native) |
| **Styling** | NativeWind (Tailwind CSS v4) |
| **Routing** | Expo Router |
| **Testing** | Jest + Maestro |

---

## Documentation

| Document | Description |
|----------|-------------|
| [AGENTS.md](./AGENTS.md) | AI agent development guide |
| [CLAUDE.md](./CLAUDE.md) | Quick reference for Claude |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design |
| [docs/GAME_DESIGN.md](./docs/GAME_DESIGN.md) | Gameplay systems |
| [docs/DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) | How to develop |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Development priorities |

---

## Development Commands

```bash
# Expo
pnpm expo:start       # Start Expo dev server
pnpm expo:web         # Start web
pnpm expo:ios         # Start iOS simulator
pnpm expo:android     # Start Android emulator

# Testing
pnpm test             # Run 378 Jest tests
pnpm typecheck        # TypeScript check
pnpm lint             # Biome linting

# Quality
pnpm test:coverage    # Test coverage report
```

---

## Current Status (v0.1-expo-unified)

### Completed

- [x] Unified Expo architecture (single app)
- [x] Platform-specific rendering (R3F web, expo-gl native)
- [x] Game systems and controllers
- [x] Procedural generation system (15,000+ lines)
- [x] Turn-based combat system
- [x] Shop and equipment systems
- [x] Responsive UI (mobile-first)
- [x] SQLite persistence layer
- [x] CI/CD with GitHub Actions
- [x] 378 tests passing (100%)
- [x] TypeScript compilation clean (0 errors)
- [x] Adaptive HUD with responsive breakpoints
- [x] All game UI panels implemented

### In Progress

- [ ] Platform testing (iOS/Android)
- [ ] Final documentation review
- [ ] Merge to main

---

## For AI Agents

Read [AGENTS.md](./AGENTS.md) for:
- Monorepo structure
- Critical files
- Common patterns
- Testing commands

Read [memory-bank/](./memory-bank/) for:
- Current context
- Architecture decisions
- Progress tracking

---

## Target Devices

| Platform | Targets |
|----------|---------|
| **Web** | Chrome, Firefox, Safari (WebGPU) |
| **Mobile** | Android 10+, iOS 14+ |
| **Viewport** | 320px - 1920px responsive |
| **Performance** | 60fps target |

---

## License

Private project - not for distribution.
