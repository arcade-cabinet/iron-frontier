# Iron Frontier

## A Cross-Platform Steampunk Frontier RPG

Expo 55 + React Three Fiber: Web + Android + iOS

![Status: Alpha v0.2](https://img.shields.io/badge/status-alpha%20v0.2-orange)
![Platform: Cross-Platform](https://img.shields.io/badge/platform-web%20%2B%20android%20%2B%20ios-blue)
![Framework: Expo%2055](https://img.shields.io/badge/framework-expo%2055-blue)

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Expo dev server
pnpm dev

# Start web
pnpm web

# Start Android
pnpm android

# Start iOS
pnpm ios
```

## Testing

```bash
# Unit tests (Jest)
pnpm test

# Web E2E (Playwright)
pnpm test:e2e

# Mobile E2E (Maestro)
pnpm test:maestro
```

---

## What is Iron Frontier?

Iron Frontier is a first-person open world RPG set in a steampunk American frontier (circa 1887). Players explore 14 hand-crafted towns connected by authored open world terrain, meet quirky NPCs, collect items, and complete quests. All geometry is procedurally constructed from Three.js primitives and canvas textures -- zero GLB models in the game scene.

### Core Features

- **First-Person 3D** - React Three Fiber for cross-platform 3D rendering
- **Authored Open World** - 14 hand-crafted towns with deterministic layout
- **Procedural Geometry** - All visuals from Three.js primitives + canvas textures (zero GLBs)
- **Cross-Platform** - Web, Android, and iOS from a single Expo app
- **Persistent Progress** - SQLite-backed save system

### Theme & Setting

- Late 1800s American frontier
- Steam-powered technology
- Brass, copper, and iron aesthetics
- Western frontier towns and railyards

---

## Project Structure

```
iron-frontier/
├── app/                     # Expo Router pages
│   ├── (tabs)/             # Tab navigation
│   │   ├── index.tsx       # Game entry point
│   │   └── _layout.tsx     # Tab layout
│   ├── index.tsx           # Root index
│   └── _layout.tsx         # Root layout
├── components/             # React Native + R3F components
│   ├── ui/                 # React Native Reusables base components
│   ├── game/               # Game UI (HUD, dialogue, inventory, shops)
│   ├── scene/              # R3F scene (Camera, Lighting, Sky, Terrain)
│   └── entities/           # R3F entities (NPCs, projectiles, pickups)
├── engine/                 # Procedural rendering engine (pure Three.js)
│   ├── archetypes/         # Building archetypes (Saloon, Inn, etc.)
│   ├── renderers/          # Terrain, vegetation, sky, weapon renderers
│   ├── materials/          # Canvas texture factories
│   └── spatial/            # Spatial hashing, chunk management
├── src/game/               # Game logic (engine-agnostic)
│   ├── data/               # Schemas, authored content
│   │   ├── schemas/        # Zod schemas
│   │   ├── worlds/         # World map definitions
│   │   ├── locations/      # 14 town definitions
│   │   ├── npcs/           # NPC dialogues and data
│   │   ├── quests/         # Quest chain definitions
│   │   ├── items/          # Item and world item data
│   │   ├── enemies/        # Enemy type definitions
│   │   └── shops/          # Shop inventory data
│   ├── store/              # Zustand store
│   │   ├── createGameStore.ts
│   │   └── slices/         # 12 slices (core, player, combat, etc.)
│   └── systems/            # Game systems (combat, encounter, zone, etc.)
├── input/                  # Universal FPS input system
├── ecs/                    # Miniplex ECS (dynamic entities only)
├── config/game/            # JSON config (all tuning values)
├── assets/                 # Fonts, sounds, textures (NO GLB models)
├── tests/                  # Test suites
├── docs/                   # Documentation
├── memory-bank/            # AI context files
└── .maestro/               # Maestro mobile E2E test flows
```

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | Expo | SDK 55 |
| **Runtime** | React Native | 0.83 |
| **3D Engine** | React Three Fiber + drei | 9.x / 10.x |
| **State** | Zustand | 5.x |
| **ECS** | Miniplex | 2.x |
| **Persistence** | expo-sqlite | 16.x |
| **Styling** | NativeWind + Tailwind CSS | 4.x / 3.x |
| **Schemas** | Zod | 4.x |
| **Routing** | Expo Router | 5.x |
| **AI/Behavior** | Yuka | 0.7 |
| **Audio** | Tone.js | 15.x |
| **Lint/Format** | Biome | 2.4 |
| **Testing** | Jest + Playwright + Maestro | |
| **Package Manager** | pnpm | 10.20 |

---

## Development Commands

```bash
# Development
pnpm dev              # Start Expo dev server
pnpm web              # Start web
pnpm android          # Start Android
pnpm ios              # Start iOS

# Build
pnpm build            # Export web build
pnpm build:android    # Build Android APK (EAS)
pnpm build:ios        # Build iOS app (EAS)

# Quality
pnpm typecheck        # TypeScript check
pnpm lint             # Biome lint + format check
pnpm lint:fix         # Auto-fix lint issues
pnpm check            # Full check (lint + format, write fixes)
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | Quick reference for Claude |
| [docs/GAME_SPEC.md](./docs/GAME_SPEC.md) | Single source of truth for game design |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design |
| [docs/GAME_DESIGN.md](./docs/GAME_DESIGN.md) | Gameplay systems |
| [docs/BRANDING.md](./docs/BRANDING.md) | Visual identity and style guide |

---

## Current Status (v0.2)

### Completed

- [x] Expo 55 + React Three Fiber setup
- [x] First-person 3D scene with R3F
- [x] Procedural geometry engine (zero GLBs)
- [x] Zustand store with 12 slices
- [x] Miniplex ECS for dynamic entities
- [x] Zod schemas for all game data
- [x] 14 authored town definitions
- [x] Universal FPS input system
- [x] Real-time combat system
- [x] Quest and dialogue systems
- [x] Shop and equipment systems
- [x] SQLite persistence layer
- [x] Mobile-first responsive UI
- [x] CI/CD with GitHub Actions

### In Progress

- [ ] Content generation pipeline (Meshy 3D)
- [ ] Audio system (Tone.js)
- [ ] Full E2E test coverage

---

## Target Devices

| Platform | Targets |
|----------|---------|
| **Web** | Chrome, Firefox, Safari (WebGPU/WebGL) |
| **Mobile** | Android 10+, iOS 16+ |
| **Viewport** | 375px - 1920px responsive |
| **Performance** | 60fps target (55fps mobile min) |

---

## For AI Agents

Read [CLAUDE.md](./CLAUDE.md) for project rules, tech stack, and architecture.

Read [memory-bank/](./memory-bank/) for current context and progress tracking.

---

## License

Private project - not for distribution.
