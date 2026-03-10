# System Patterns

## Architecture: Expo + React Three Fiber

The project is a single Expo 55 app with React Three Fiber for 3D rendering and React Native overlays for UI/HUD:

```
iron-frontier/
├── app/              # Expo Router pages (_layout.tsx, index.tsx, game/)
├── components/
│   ├── scene/        # R3F 3D components (Terrain, Sky, FPSCamera, etc.)
│   ├── game/         # React Native HUD overlays (GameHUD, DialogueBox, etc.)
│   ├── entities/     # Entity renderers (NPCEntity, EnemyEntity)
│   └── ui/           # Reusable UI primitives (Button, Card, Dialog, etc.)
├── engine/
│   ├── renderers/    # Terrain chunks, atmospheric effects, day/night
│   ├── physics/      # Physics integration
│   └── spatial/      # Spatial data structures
├── hooks/            # React hooks (useGameStore, usePlatform, useResponsive)
├── src/game/         # Core game logic (non-rendering)
│   ├── data/         # Game content (locations, NPCs, items, schemas)
│   ├── ddl/          # Data definition layer
│   ├── ecs/          # Miniplex ECS (components, archetypes, systems)
│   ├── generation/   # Procedural generation (characters, etc.)
│   ├── store/        # Zustand store with modular slices
│   ├── systems/      # Game systems (combat, dialogue, travel, survival, etc.)
│   └── types/        # TypeScript type definitions
├── config/           # Game configuration
├── packages/         # Shared packages (retained from monorepo era)
├── tests/e2e/        # Playwright E2E tests
└── memory-bank/      # AI context files
```

### Key Principle: Rendering vs. Logic Separation

- **`components/scene/`** contains R3F components that render inside the Three.js Canvas. These are React components using Three.js primitives (`<mesh>`, `<group>`, hooks like `useFrame`, `useThree`).
- **`components/game/`** contains React Native components that render as overlays on top of the Canvas. These are standard React Native views styled with NativeWind.
- **`src/game/`** contains pure game logic with no rendering dependencies. Systems, data, and store code can be tested independently.

### Navigation

Expo Router file-based routing:
- `app/index.tsx` — Entry/main menu
- `app/game/index.tsx` — Game screen (R3F Canvas + HUD overlays)

## 3D Rendering

### React Three Fiber (R3F)

3D scene is composed declaratively with R3F components:

```tsx
<Canvas>
  <Sky />
  <DayNightCycle />
  <Lighting />
  <Terrain />
  <VegetationField />
  <OpenWorld />
  <EntitySpawner />
  <FPSCamera />
  <WeaponView />
  <CombatSystem />
</Canvas>
```

Engine-level rendering (terrain chunks, atmospheric effects) lives in `engine/renderers/`.

## State Management

### Zustand v5 with Modular Slices

Store is composed from 12 slices in `src/game/store/slices/`:

| Slice | Responsibility |
|-------|---------------|
| `coreSlice` | Game phase, time, world seed |
| `playerSlice` | Player stats, position, level |
| `combatSlice` | Active combat, enemies, turn state |
| `dialogueSlice` | Active dialogue, NPC, choices |
| `inventorySlice` | Items, equipment, weight |
| `questSlice` | Active/completed quests, objectives |
| `shopSlice` | Shop inventory, transactions |
| `travelSlice` | Current location, travel state |
| `puzzleSlice` | Puzzle state, solutions |
| `settingsSlice` | Audio, graphics, controls settings |
| `uiSlice` | Active panel, notifications, menus |
| `survivalStore` | Fatigue, provisions, camping |

Access via `useGameStore` hook or direct `gameStore` import.

### Persistence (Planned)

- **Web**: IndexedDB via `idb-keyval`
- **Mobile**: expo-sqlite
- Storage adapter pattern in `src/game/store/StorageAdapter.ts`

## ECS: Miniplex

Entity-component-system via Miniplex:
- Components defined in `src/game/ecs/components.ts`
- Archetypes in `src/game/ecs/archetypes.ts`
- Systems in `src/game/ecs/systems/`
- World in `src/game/ecs/world.ts`

## Procedural Generation

### Seeded Generation

All content generation is deterministic from seed:

```typescript
worldSeed → regionSeed → locationSeed → contentSeed
```

### Data Definitions

Content defined in `src/game/data/`:
- 12 location files (Coppertown, Dusty Springs, Junction City, etc.)
- Town definitions with buildings, NPCs, shops, and schedules
- NPC data with dialogue trees
- Item and enemy registries
- Quest definitions

## Data Patterns

### Zod v4 Schema Conventions

Schemas in `src/game/data/schemas/` define all game entities:

```typescript
import { z } from 'zod';

// Optional arrays with empty default
tags: z.array(z.string()).optional().default([])

// Required objects with function default
rewards: z.object({...}).default(() => ({
  xp: 0,
  gold: 0,
  items: [],
}))
```

### DDL Layer

Data Definition Language layer in `src/game/ddl/` for structured data loading and validation.

## UI Patterns

### HUD Architecture

The HUD is a React Native view tree layered over the R3F Canvas:

```tsx
<View style={{ flex: 1 }}>
  <Canvas>{/* 3D scene */}</Canvas>
  <GameHUD>
    <PlayerVitals />
    <CompassBar />
    <AmmoDisplay />
    <Crosshair />
    {/* Panels appear/disappear based on uiSlice state */}
    {activePanel === 'inventory' && <InventoryPanel />}
    {activePanel === 'dialogue' && <DialogueBox />}
  </GameHUD>
</View>
```

### Responsive Design

- NativeWind (Tailwind) breakpoints for responsive layouts
- `useResponsive` hook for platform-aware sizing
- `usePlatform` hook for platform detection
- Touch-first: minimum 44px touch targets

## Testing

### E2E: Playwright

Tests organized by category under `tests/e2e/`:
- `core/` — fundamental game flow
- `systems/` — combat, dialogue, quest, travel
- `ui/` — panel interactions, HUD
- `persistence/` — save/load
- `spatial/` — world/map interactions
- `quality/` — accessibility, performance
- `validation/` — data integrity

### Unit: Jest

Jest with `jest-expo` preset. Property-based testing with `fast-check`.

## CI/CD

### GitHub Actions

- All actions pinned to exact SHAs
- Parallel jobs where possible
- Conditional E2E tests (PRs only)

### Commands

```bash
pnpm dev              # Expo dev server
pnpm test             # Jest unit tests
pnpm test:e2e         # Playwright E2E
pnpm typecheck        # TypeScript check
pnpm lint             # Biome linting
pnpm build            # Expo export
```
