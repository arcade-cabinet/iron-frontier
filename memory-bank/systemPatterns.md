# System Patterns

## Architecture: Single Ionic Angular App

The project is migrating to a single Ionic Angular app at repo root with Capacitor targets for web, Android, iOS, and Electron:

```
iron-frontier/
├── src/              # Ionic Angular app
├── android/          # Capacitor Android project
├── ios/              # Capacitor iOS project
├── electron/         # Capacitor Electron project
├── packages/         # Shared assets/data (migration target)
└── memory-bank/      # AI context files
```

### Key Principle: Shared Everything Possible

- **Schemas/Data/Types**: keep consolidated and reusable across platforms.
- **Rendering**: Babylon.js for web and Electron, aligned with Capacitor web runtime.
- **Persistence**: unified via Capacitor storage/SQLite where possible.

### Non-Negotiables

- No WET `apps/` split; root `src/` is the only app source.
- Electron uses `@capacitor-community/electron` (remove any legacy wrapper).

## 3D Rendering

### Babylon.js (Direct Engine)

Angular manages a Babylon.js engine instance directly (no Reactylon).

```ts
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
engine.runRenderLoop(() => scene.render());
```

## State Management

### Zustand (Migration Target)

- Preserve existing store types and logic while porting to Angular.
- Wrap store access in Angular services for DI-friendly usage.

### Persistence

- **Web/Electron**: IndexedDB/Capacitor storage.
- **Mobile**: Capacitor SQLite plugins (native).

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

Single active panel at a time, implemented as Ionic overlays or in-game HUD panels.

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
