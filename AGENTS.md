# AGENTS.md - Iron Frontier Development Guide

## Deep Context (Memory Bank)
>
> **AI AGENTS**: Before starting work, you **MUST** read the following files in `memory-bank/` to understand the project state:
>
> - `memory-bank/activeContext.md` (Current focus & recent changes)
> - `memory-bank/projectbrief.md` (Core goals)
> - `memory-bank/systemPatterns.md` (Architecture & decisions)

## Quick Start for Agents

```bash
# Install dependencies
pnpm install

# Start dev server (already running in sandbox)
pnpm dev

# Type check
pnpm typecheck
```

## Project Overview

**Iron Frontier** is a mobile-first isometric RPG set in a Steampunk American Frontier (late 1800s). Built with:

- **React 19** + **Vite** + **TypeScript**
- **Babylon.js** via **Reactylon** (declarative 3D)
- **Zustand** for state management
- **Tailwind CSS 4** + **shadcn/ui** components
- **Framer Motion** for UI animations

## Critical Files to Understand

| File | Purpose |
|------|---------|
| `src/game/Game.tsx` | Main game component, routes between title/gameplay |
| `src/game/store/gameStore.ts` | **Central state** - player, inventory, quests, UI |
| `src/game/lib/procgen.ts` | Procedural sector generation |
| `src/game/lib/prng.ts` | Deterministic random number generator |
| `src/game/components/GameScene.tsx` | Babylon.js 3D scene |
| `src/game/screens/TitleScreen.tsx` | Splash + main menu |
| `src/game/ui/*.tsx` | All UI components (HUD, dialogs, panels) |

## Architecture

```text
src/
├── game/
│   ├── Game.tsx              # Root game component
│   ├── components/
│   │   └── GameScene.tsx     # Babylon.js scene with Reactylon
│   ├── screens/
│   │   └── TitleScreen.tsx   # Splash + Menu flow
│   ├── ui/                   # UI components
│   │   ├── GameHUD.tsx       # Top stats bar
│   │   ├── ActionBar.tsx     # Bottom navigation
│   │   ├── DialogueBox.tsx   # NPC dialogue (FF7-style)
│   │   ├── InventoryPanel.tsx
│   │   ├── QuestLog.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── MenuPanel.tsx
│   │   └── NotificationFeed.tsx
│   ├── store/
│   │   └── gameStore.ts      # Zustand store (persisted)
│   └── lib/
│       ├── procgen.ts        # Sector generator
│       ├── prng.ts           # Seeded RNG
│       ├── types.ts          # Type definitions
│       ├── items.ts          # Item database
│       └── quests.ts         # Quest definitions
├── components/ui/            # shadcn/ui components
├── lib/utils.ts              # Tailwind utilities
└── App.tsx                   # Entry point
```text

## Game Flow

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SPLASH    │ --> │  MAIN MENU  │ --> │   GAMEPLAY  │
│  (2.5 sec)  │     │  New/Continue│     │  3D + HUD   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           │                    v
                           │            ┌─────────────┐
                           └----------->│   PANELS    │
                                        │ Inv/Quest/  │
                                        │ Settings    │
                                        └─────────────┘
```

## State Management (Zustand)

The `gameStore.ts` is the **single source of truth**. Key state slices:

```typescript
interface GameState {
  // Game phase
  gamePhase: 'title' | 'playing' | 'paused';
  
  // World
  currentSector: SectorData | null;
  currentSectorId: string;
  
  // Player
  player: PlayerState;        // name, level, xp, health, gold, position
  inventory: InventoryItem[];
  
  // Progress
  activeQuests: Quest[];
  completedQuests: string[];
  collectedItems: string[];   // IDs of picked up items
  talkedNPCs: string[];       // IDs of NPCs spoken to
  
  // UI toggles
  dialogueOpen: boolean;
  inventoryOpen: boolean;
  questLogOpen: boolean;
  settingsOpen: boolean;
  menuOpen: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // Settings
  settings: GameSettings;
}
```

## Reactylon (Babylon.js) Patterns

**CRITICAL**: Reactylon uses `options` prop for mesh creation:

```tsx
// CORRECT
<box name="myBox" options={{ width: 1, height: 2, depth: 1 }} position={new Vector3(0, 1, 0)} />

// WRONG - will cause TypeScript errors
<box name="myBox" width={1} height={2} depth={1} />
```

Common mesh patterns:

```tsx
// Box
<box name="box" options={{ width, height, depth }} position={pos}>
  <standardMaterial name="mat" diffuseColor={color} />
</box>

// Sphere
<sphere name="sphere" options={{ diameter: 1 }} position={pos} />

// Cylinder
<cylinder name="cyl" options={{ diameter: 1, height: 2 }} position={pos} />

// Ground
<ground name="ground" options={{ width: 100, height: 100 }} />

// Torus
<torus name="ring" options={{ diameter: 1, thickness: 0.1 }} />
```

## Procedural Generation

`procgen.ts` generates deterministic sectors:

```typescript
const sector = generateSector('sector_id', 12345); // ID + seed

// SectorData includes:
// - grid: GridCell[][] (walkable tiles)
// - props: PropPlacement[] (decorative objects)
// - npcs: NPCSpawn[] (characters)
// - items: ItemSpawn[] (collectibles)
// - landmarks: LandmarkAnchor[] (buildings)
// - playerSpawn: { x, y }
// - exits: SectorExit[]
```

## Styling Guidelines

### Color Palette (Steampunk Frontier)

- **Primary**: amber-500 to amber-700 (brass/gold)
- **Background**: stone-900, stone-950, amber-950
- **Accent**: orange-600, yellow-500
- **Text**: amber-100 (light), amber-300 (muted), stone-400 (subtle)

### Component Patterns

```tsx
// Card with game styling
<Card className="bg-amber-950/90 border-amber-700/50 backdrop-blur-sm">

// Button with game styling
<Button className="bg-amber-700 hover:bg-amber-600 text-white">

// Text hierarchy
<h1 className="text-amber-100 font-bold">  // Primary
<p className="text-amber-300">              // Secondary
<span className="text-stone-400">          // Muted
```

## Common Tasks

### Adding a New UI Panel

1. Create component in `src/game/ui/NewPanel.tsx`
2. Add state toggle to `gameStore.ts`: `newPanelOpen: boolean`
3. Add toggle action: `toggleNewPanel: () => void`
4. Import and render in `Game.tsx`

### Adding New Items

1. Edit `src/game/lib/items.ts` to add item definitions
2. Update `ITEM_TYPES` in `procgen.ts` for spawning

### Adding New NPCs

1. Add NPC type to `NPC_NAMES` in `procgen.ts`
2. Add to theme's `npcTypes` array
3. Add dialogue patterns to `DialogueBox.tsx`

### Adding New Quests

1. Define quest in `src/game/lib/quests.ts`
2. Associate with NPC's `questGiver` flag
3. Handle quest acceptance in `DialogueBox.tsx`

## Known Issues / TODOs

- [ ] Many UI components have type mismatches with store
- [ ] Virtual joystick not implemented
- [ ] Sector transitions not implemented
- [ ] Combat/encounters not implemented
- [ ] Sound system not implemented
- [ ] PWA manifest not added

## Testing Commands

```bash
# Type check
pnpm typecheck

# Build
pnpm run build

# Preview production build
pnpm run preview
```

## Mobile Considerations

- All touch targets minimum 44x44px
- Use `pb-safe` for bottom elements (safe area)
- Support haptic feedback via `navigator.vibrate()`
- Test on viewport widths 360px - 800px
- Respect `settings.reducedMotion` for animations
