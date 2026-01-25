# System Patterns

## Architecture: Monorepo with DRY Shared Package

The project uses a pnpm monorepo with platform-specific apps sharing common code:

```
iron-frontier/
├── apps/
│   ├── web/          # Platform-specific: Babylon.js, sql.js
│   ├── mobile/       # Platform-specific: Filament, expo-sqlite
│   └── docs/         # Documentation site
└── packages/
    └── shared/       # DRY: Schemas, data, types, generation
```

### Key Principle: Shared Everything Possible

- **Schemas**: All Zod schemas in `packages/shared/`
- **Data**: Items, NPCs, quests, dialogues in `packages/shared/`
- **Types**: All TypeScript types exported from `packages/shared/`
- **Generation**: Procedural generators in `packages/shared/`
- **Platform-specific**: Only rendering and persistence differ

## 3D Rendering

### Web: Reactylon Pattern

React + Babylon.js integration using declarative components:

```tsx
// CORRECT - use options prop
<box name="myBox" options={{ width: 1, height: 2 }} position={pos}>
  <standardMaterial name="mat" diffuseColor={color} />
</box>
```

### Mobile: React Native Filament

Native 3D rendering via Google Filament wrapper:

```tsx
<FilamentRenderer modelPath="assets/models/character.glb" />
```

## State Management

### Zustand as Single Source of Truth

- Runtime state in Zustand store
- Platform-specific store extensions
- Shared types for cross-platform compatibility

```typescript
// Shared types
interface BaseGameState {
  phase: GamePhase;
  playerStats: PlayerStats;
  inventory: InventoryItem[];
  activeQuests: ActiveQuest[];
}

// Web extends with platform-specific
interface WebGameState extends BaseGameState {
  sceneManager: HexSceneManager | null;
}
```

### SQLite Persistence

- **Web**: sql.js (WASM) + IndexedDB for binary storage
- **Mobile**: expo-sqlite (native)
- Both use same schema structure

## Procedural Generation

### Daggerfall-Style Seeded Generation

All content generation is deterministic from seed:

```typescript
// Seed hierarchy
worldSeed → regionSeed → locationSeed → contentSeed

// Same seed = identical output
const npcs = generateNPCs(locationSeed, locationId);
```

### Template System

Content generated from template pools:
- 30+ NPC archetypes
- 20+ quest templates
- 28 encounter templates
- 60+ dialogue snippets
- 7 name origin pools

## UI Patterns

### Responsive Breakpoints

```css
xs: 0-479px    /* Mobile portrait */
sm: 480px+     /* Mobile landscape */
md: 768px+     /* Tablet */
lg: 1024px+    /* Desktop */
```

### Touch-First Design

- Minimum touch targets: 44px (iOS HIG)
- Mobile: 56px touch targets, icon-only
- Tablet+: 44px targets, labels visible

### Panel System

Single active panel at a time:

```typescript
type PanelType =
  | 'character'
  | 'inventory'
  | 'quests'
  | 'menu'
  | 'shop'
  | null;

// Only one panel open
activePanel: PanelType;
```

## Data Patterns

### Zod Schema Conventions

```typescript
// Optional arrays with empty default
tags: z.array(z.string()).optional().default([])

// Required objects with function default
rewards: z.object({...}).default(() => ({
  xp: 0,
  gold: 0,
  items: [],
}))
```

### Import Patterns

```typescript
// From shared package
import { ItemSchema, type Item } from '@iron-frontier/shared/data/schemas/item';
import { getItem } from '@iron-frontier/shared/data/items';
```

## CI/CD Patterns

### GitHub Actions

- All actions pinned to exact SHAs (not version tags)
- Parallel jobs where possible
- Artifacts for build outputs
- Conditional E2E tests (PRs only)

### Monorepo Commands

```bash
pnpm dev              # Web dev server
pnpm test             # All tests
pnpm typecheck        # TypeScript check all packages
pnpm build            # Production build
```
