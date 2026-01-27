# Iron Frontier

**A Cross-Platform Steampunk Frontier RPG**

Single Expo App: Web + Android

![Status: Alpha v0.1](https://img.shields.io/badge/status-alpha%20v0.1-orange)
![Platform: Cross-Platform](https://img.shields.io/badge/platform-web%20%2B%20android-blue)
![Framework: Expo SDK 54](https://img.shields.io/badge/expo-SDK%2054-blue)

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Web development
pnpm web

# Android development
pnpm android

# Build for production
pnpm build:web
pnpm build:android
```

---

## What is Iron Frontier?

Iron Frontier is an isometric RPG set in a steampunk American frontier (circa 1887). Players explore procedurally generated locations, meet quirky NPCs, collect items, and complete quests.

### Core Features

- **Isometric 3D** - Babylon.js React Native for cross-platform 3D
- **Procedural Generation** - Daggerfall-style deterministic content
- **Cross-Platform** - Web and Android from single Expo app
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
├── src/                    # Game source code
│   ├── data/               # Game data & schemas (Zod)
│   │   ├── schemas/        # Type definitions
│   │   ├── items/          # Item definitions
│   │   ├── npcs/           # NPC definitions
│   │   ├── quests/         # Quest definitions
│   │   └── generation/     # Procedural generators
│   ├── game/               # Game logic
│   │   ├── components/     # Game components
│   │   ├── screens/        # Game screens
│   │   ├── ui/             # UI panels
│   │   └── store/          # Zustand state management
│   ├── engine/             # 3D rendering engine
│   │   ├── hex/            # Hex grid system
│   │   ├── rendering/      # Scene management
│   │   └── terrain/        # Terrain generation
│   ├── hooks/              # React hooks
│   ├── lib/                # Utilities
│   └── types/              # TypeScript types
├── assets/                 # Static assets
│   ├── models/             # 3D models (GLTF/GLB)
│   ├── textures/           # Textures
│   ├── images/             # UI images
│   └── fonts/              # Fonts
├── components/             # Shared React Native components
├── constants/              # App constants
├── docs/                   # Documentation
├── memory-bank/            # AI context files
└── .github/workflows/      # CI/CD pipelines
```

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | Expo | SDK 54 |
| **Runtime** | React Native | 0.81.5 |
| **3D Engine** | Babylon.js React Native | 1.9.0 |
| **State** | Zustand | 5.0.10 |
| **Persistence** | expo-sqlite / sql.js | 16.0.10 / 1.13.0 |
| **Styling** | Tailwind CSS v4 + NativeWind | 4.1.18 / 4.2.1 |
| **Schemas** | Zod | 4.3.6 |
| **Routing** | Expo Router | 6.0.22 |
| **Package Manager** | pnpm | 10.20.0 |

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
# Development
pnpm start            # Start Expo dev server
pnpm web              # Start web
pnpm android          # Start Android
pnpm ios              # Start iOS

# Build
pnpm build:web        # Export web build
pnpm build:android    # Build Android APK

# Quality
pnpm typecheck        # TypeScript check
pnpm lint             # Biome linting
pnpm lint:fix         # Auto-fix lint issues
```

---

## Current Status (v0.1-candidate)

### Completed

- [x] Monorepo architecture (pnpm workspaces)
- [x] Shared package with Zod schemas
- [x] Web app with Babylon.js rendering
- [x] Mobile app with Expo + Filament
- [x] Procedural generation system (15,000+ lines)
- [x] Turn-based combat system
- [x] Shop and equipment systems
- [x] Responsive UI (mobile-first)
- [x] SQLite persistence layer
- [x] CI/CD with GitHub Actions
- [x] 203 tests passing
- [x] Documentation site (Astro)

### In Progress

- [ ] PR #1 review and merge
- [ ] Render.com deployment
- [ ] Audio system

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
