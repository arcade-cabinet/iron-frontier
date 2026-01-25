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

# Start web dev server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

---

## What is Iron Frontier?

Iron Frontier is an isometric RPG set in a steampunk American frontier (circa 1887). Players explore procedurally generated locations, meet quirky NPCs, collect items, and complete quests.

### Core Features

- **Isometric 3D** - Babylon.js (web) / Filament (mobile) with FF7-era atmosphere
- **Procedural Generation** - Daggerfall-style deterministic content
- **Cross-Platform** - Web and mobile from shared codebase
- **Persistent Progress** - SQLite-backed save system

### Theme & Setting

- Late 1800s American frontier
- Steam-powered technology
- Brass, copper, and iron aesthetics
- Western frontier towns and railyards

---

## Monorepo Structure

```
iron-frontier/
├── apps/
│   ├── web/          # Vite + React + Babylon.js
│   ├── mobile/       # Expo + React Native + Filament
│   └── docs/         # Astro + Starlight documentation
├── packages/
│   └── shared/       # Schemas, data, types (Zod)
├── .github/workflows/  # CI/CD pipelines
├── .maestro/         # Mobile E2E tests
└── memory-bank/      # AI agent context
```

---

## Tech Stack

| Layer | Web | Mobile |
|-------|-----|--------|
| **Framework** | React 19 + Vite | Expo SDK 54 |
| **3D Engine** | Babylon.js (WebGPU) | React Native Filament |
| **State** | Zustand | Zustand |
| **Persistence** | sql.js + IndexedDB | expo-sqlite |
| **Styling** | Tailwind CSS v4 | NativeWind |
| **Testing** | Vitest + Playwright | Maestro |

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
# Web
pnpm dev              # Dev server (port 8080)
pnpm build            # Production build
pnpm test             # Run 203 tests
pnpm test:e2e         # Playwright E2E

# Mobile
pnpm dev:mobile       # Expo dev server
pnpm build:android    # Build Android APK
pnpm build:ios        # Build iOS app

# Documentation
pnpm docs:dev         # Docs dev server
pnpm docs:build       # Build docs

# Quality
pnpm typecheck        # TypeScript check
pnpm lint             # Biome linting
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
