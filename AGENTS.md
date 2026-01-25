# AGENTS.md - Iron Frontier Development Guide

## Deep Context (Memory Bank)

> **AI AGENTS**: Before starting work, read these files in `memory-bank/`:
>
> - `memory-bank/activeContext.md` (Current focus & recent changes)
> - `memory-bank/projectbrief.md` (Core goals)
> - `memory-bank/systemPatterns.md` (Architecture & decisions)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start web dev server
pnpm dev

# Run tests (203 tests)
pnpm test

# Type check all packages
pnpm typecheck

# Build for production
pnpm build
```

## Project Overview

**Iron Frontier** is a cross-platform isometric RPG set in a Steampunk American Frontier (late 1800s).

### Tech Stack

| Layer | Web | Mobile |
|-------|-----|--------|
| **Framework** | React 19 + Vite | Expo SDK 54 + React Native |
| **3D Engine** | Babylon.js (WebGPU) | React Native Filament |
| **State** | Zustand | Zustand |
| **Persistence** | sql.js + IndexedDB | expo-sqlite |
| **Styling** | Tailwind CSS v4 | NativeWind |

### Shared Code

All game logic, schemas, and data live in `packages/shared/`:
- **Schemas**: Zod-validated types for items, NPCs, quests, combat, etc.
- **Data**: Item definitions, quest templates, dialogue trees
- **Generation**: Procedural content generators (Daggerfall-style)

## Monorepo Structure

```
iron-frontier/
├── apps/
│   ├── web/                      # Web game client
│   │   ├── src/
│   │   │   ├── game/
│   │   │   │   ├── Game.tsx              # Root game component
│   │   │   │   ├── components/
│   │   │   │   │   └── GameScene.tsx     # Babylon.js 3D scene
│   │   │   │   ├── screens/
│   │   │   │   │   └── TitleScreen.tsx   # Splash + menu
│   │   │   │   ├── ui/                   # UI components
│   │   │   │   │   ├── ActionBar.tsx     # Bottom navigation
│   │   │   │   │   ├── DialogueBox.tsx   # NPC dialogue
│   │   │   │   │   ├── InventoryPanel.tsx
│   │   │   │   │   ├── CombatPanel.tsx
│   │   │   │   │   ├── ShopPanel.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── store/
│   │   │   │   │   └── webGameStore.ts   # Web-specific store
│   │   │   │   └── lib/
│   │   │   │       ├── procgen.ts        # Sector generator
│   │   │   │       └── prng.ts           # Seeded RNG
│   │   │   ├── engine/                   # Babylon.js rendering
│   │   │   │   ├── hex/                  # Hex grid system
│   │   │   │   ├── rendering/            # SceneManager
│   │   │   │   └── terrain/              # Heightmap, chunks
│   │   │   └── components/ui/            # shadcn/ui
│   │   └── public/assets/                # 3D models (Git LFS)
│   │
│   ├── mobile/                   # Mobile game client
│   │   ├── app/                  # Expo Router pages
│   │   └── src/components/       # Filament renderer
│   │
│   └── docs/                     # Astro documentation site
│       └── src/content/docs/     # MDX documentation
│
├── packages/
│   └── shared/                   # Shared code (DRY)
│       └── src/
│           ├── data/
│           │   ├── schemas/      # Zod schemas
│           │   │   ├── item.ts
│           │   │   ├── npc.ts
│           │   │   ├── quest.ts
│           │   │   ├── combat.ts
│           │   │   └── ...
│           │   ├── items/        # Item definitions
│           │   ├── npcs/         # NPC definitions
│           │   ├── quests/       # Quest definitions
│           │   └── generation/   # Procedural generators
│           ├── store/            # Shared store types
│           └── index.ts          # Package exports
│
├── .github/workflows/            # CI/CD (pinned to SHAs)
├── .maestro/                     # Mobile E2E tests
└── memory-bank/                  # AI context files
```

## Critical Files

| File | Purpose |
|------|---------|
| `apps/web/src/game/Game.tsx` | Main game component, phase routing |
| `apps/web/src/game/store/webGameStore.ts` | Web-specific Zustand store |
| `packages/shared/src/store/index.ts` | Shared store types and actions |
| `packages/shared/src/data/schemas/*.ts` | All Zod schemas |
| `packages/shared/src/data/generation/*.ts` | Procedural generators |
| `apps/web/src/engine/hex/HexSceneManager.ts` | Babylon.js scene orchestration |

## Game Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SPLASH    │ --> │  MAIN MENU  │ --> │   PLAYING   │
│  (2.5 sec)  │     │ New/Continue│     │  3D + HUD   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    v                         v                         v
             ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
             │   DIALOGUE  │          │   COMBAT    │          │   TRAVEL    │
             │  NPC Talks  │          │ Turn-Based  │          │  Encounters │
             └─────────────┘          └─────────────┘          └─────────────┘
```

## State Management

**Zustand** is the single source of truth. Key concepts:

```typescript
// Game phases
type GamePhase = 'title' | 'playing' | 'dialogue' | 'combat' | 'travel' | 'game_over';

// Core state slices
interface GameState {
  phase: GamePhase;
  playerStats: PlayerStats;
  inventory: InventoryItem[];
  activeQuests: ActiveQuest[];
  currentLocationId: string;
  loadedWorld: LoadedWorld | null;
  activePanel: PanelType | null;
  // ... and more
}
```

## Procedural Generation

The game uses Daggerfall-style seeded generation:

```typescript
// All generation is deterministic from seed
const worldSeed = 12345;
const locationSeed = hashCombine(worldSeed, locationId);

// Generators in packages/shared/src/data/generation/
- nameGenerator.ts      // NPC names from cultural pools
- npcGenerator.ts       // NPCs from archetypes
- questGenerator.ts     // Multi-stage quests
- encounterGenerator.ts // Combat encounters
- dialogueGenerator.ts  // Dialogue trees
- itemGenerator.ts      // Weapons, armor, consumables
- worldGenerator.ts     // Master orchestrator
```

## Styling Guidelines

### Color Palette (Steampunk Frontier)

```css
/* Primary (brass/gold) */
amber-500 to amber-700

/* Backgrounds */
stone-900, stone-950, amber-950

/* Accents */
orange-600, yellow-500

/* Text */
amber-100 (primary), amber-300 (muted), stone-400 (subtle)
```

### Responsive Breakpoints

```css
xs: 0-479px    /* Mobile portrait - icon-only, large touch targets */
sm: 480px+     /* Mobile landscape - labels visible */
md: 768px+     /* Tablet - multi-column */
lg: 1024px+    /* Desktop - full layouts */
```

### Touch Targets

All interactive elements: `min-h-[44px]` minimum (iOS HIG)

## Common Tasks

### Adding New Items

1. Add item schema to `packages/shared/src/data/schemas/item.ts`
2. Add item definition to `packages/shared/src/data/items/`
3. Export from `packages/shared/src/data/items/index.ts`

### Adding New NPCs

1. Add NPC definition to `packages/shared/src/data/npcs/`
2. Create dialogue tree in `packages/shared/src/data/dialogues/`
3. Link via `dialogueTreeIds` in NPC definition

### Adding New Quests

1. Define quest in `packages/shared/src/data/quests/`
2. Associate with NPC via `questIds` array
3. Export from `packages/shared/src/data/quests/index.ts`

### Adding UI Panels

1. Create component in `apps/web/src/game/ui/NewPanel.tsx`
2. Add panel type to store: `activePanel: 'new_panel' | ...`
3. Render in `Game.tsx` based on `activePanel`

## Testing

```bash
pnpm test              # Run all 203 tests
pnpm test --watch      # Watch mode
pnpm test:e2e          # Playwright E2E (web)
```

Test structure mirrors source:
- `apps/web/src/test/` - Web-specific tests
- Unit tests for store, UI components, game flow

## CI/CD

GitHub Actions workflows (`.github/workflows/`):
- `ci.yml` - Lint, typecheck, test, build, E2E
- `mobile.yml` - Android APK build, Maestro E2E

All actions pinned to exact SHAs for reproducibility.

## Mobile Development

```bash
# Start Expo dev server
pnpm dev:mobile

# Build debug APK
pnpm build:android

# Run Maestro E2E tests
maestro test .maestro/
```

## Known Patterns

### Reactylon (Babylon.js)

```tsx
// CORRECT - use options prop
<box name="myBox" options={{ width: 1, height: 2 }} position={pos} />

// WRONG - will cause TypeScript errors
<box name="myBox" width={1} height={2} />
```

### Import from Shared Package

```typescript
// Import schemas
import { ItemSchema, type Item } from '@iron-frontier/shared/data/schemas/item';

// Import data
import { getItem, getAllItems } from '@iron-frontier/shared/data/items';

// Import store types
import type { GameState } from '@iron-frontier/shared/store';
```

## Current Status (v0.1-candidate)

- **203 tests passing**
- **Build succeeds** (7.7 MB single-file output)
- **PR #1 open** with all AI review comments resolved
- **Monorepo complete** with DRY architecture
- **Responsive UI** implemented across all panels
