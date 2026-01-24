# Iron Frontier

**A Mobile-First Steampunk Frontier RPG**

Built with React, Babylon.js (via Reactylon), Zustand, and Tailwind CSS.

![Status: Alpha](https://img.shields.io/badge/status-alpha-orange)
![Platform: Mobile-First](https://img.shields.io/badge/platform-mobile--first-blue)

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type check
pnpm run tscgo --noEmit

# Build for production
pnpm build
```

---

## What is Iron Frontier?

Iron Frontier is an isometric RPG set in a steampunk American frontier (circa 1887). Players explore procedurally generated sectors, meet quirky NPCs, collect items, and complete quests.

### Core Features
- **Isometric 3D** - Babylon.js rendering with FF7-era atmosphere
- **Procedural Generation** - Deterministic sectors, NPCs, items
- **Mobile-First** - Touch controls, responsive UI, PWA-ready
- **Persistent Progress** - Auto-save via localStorage

### Theme & Setting
- Late 1800s American frontier
- Steam-powered technology
- Brass, copper, and iron aesthetics
- Western frontier towns and railyards

---

## Documentation

| Document | Description |
|----------|-------------|
| [AGENTS.md](./AGENTS.md) | Quick reference for AI agents |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design and data flow |
| [docs/BRANDING.md](./docs/BRANDING.md) | Visual identity and style guide |
| [docs/GAME_DESIGN.md](./docs/GAME_DESIGN.md) | Gameplay systems and mechanics |
| [docs/UI_COMPONENTS.md](./docs/UI_COMPONENTS.md) | UI component specifications |
| [docs/DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) | How to develop and extend |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Development priorities |

---

## Project Structure

```
src/
├── game/
│   ├── Game.tsx              # Main game component
│   ├── components/
│   │   └── GameScene.tsx     # Babylon.js 3D scene
│   ├── screens/
│   │   └── TitleScreen.tsx   # Splash + main menu
│   ├── ui/                   # UI components (HUD, panels)
│   ├── store/
│   │   └── gameStore.ts      # Zustand state management
│   └── lib/
│       ├── procgen.ts        # Procedural generation
│       └── prng.ts           # Seeded random numbers
├── components/ui/            # shadcn/ui components
└── App.tsx                   # Entry point
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite | Build tool |
| TypeScript | Type safety |
| Babylon.js | 3D rendering |
| Reactylon | Declarative Babylon.js |
| Zustand | State management |
| Tailwind CSS 4 | Styling |
| shadcn/ui | UI components |
| Framer Motion | Animations |

---

## Current Status

**Alpha v0.2** - Core infrastructure complete with comprehensive testing.

### Working
- Project scaffolding (Vite + React 19 + TypeScript)
- Babylon.js 3D scene rendering via Reactylon
- Procedural sector generation (deterministic)
- Title screen with splash animation
- Complete game store with all actions
- All UI components (HUD, panels, dialogs)
- TypeScript compiles with zero errors
- Comprehensive test suite (150+ tests)
- Pure TypeScript/TSX (no JavaScript files)

### Test Coverage
```bash
pnpm test                    # Run all tests
pnpm vitest run              # Run once, no watch
```

| Test Suite | Tests |
|------------|-------|
| Game Store | 39 |
| UI Panels | 42 |
| Visual Interactions | 25 |
| Quest Log | 15+ |
| Game Flow | 20+ |
| Title Screen | 20+ |

### Ready for Next Phase
- Content creation (quests, items, NPCs)
- Mobile device testing
- Performance optimization

See [docs/ROADMAP.md](./docs/ROADMAP.md) for detailed status.

---

## For AI Agents

Read [AGENTS.md](./AGENTS.md) for:
- Quick start commands
- Critical files to understand
- Common patterns (Reactylon mesh syntax)
- State management approach
- Styling guidelines

Key commands:
```bash
pnpm run tscgo --noEmit  # Check TypeScript
pnpm dev                  # Dev server (usually already running)
```

---

## Target Devices

- **Primary**: Mobile phones (Pixel 8A, OnePlus Open unfolded)
- **Viewport**: 360px - 800px width
- **Performance**: 60fps target, graceful 30fps degradation

---

## License

Private project - not for distribution.
