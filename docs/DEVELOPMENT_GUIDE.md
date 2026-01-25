# Iron Frontier - Development Guide

## Environment Setup

### Prerequisites
- Node.js 22.11.0 (see `.nvmrc`)
- pnpm 10.20.0+

### Installation
```bash
# Clone and install
pnpm install

# Start development server (web)
pnpm dev

# Type checking
pnpm typecheck

# Run tests
pnpm test

# Build for production
pnpm build
```

### Monorepo Commands
```bash
# Web app only
pnpm --filter @iron-frontier/web dev
pnpm --filter @iron-frontier/web test

# Mobile app
pnpm --filter @iron-frontier/mobile start
pnpm --filter @iron-frontier/mobile android
pnpm --filter @iron-frontier/mobile ios

# Shared package
pnpm --filter @iron-frontier/shared build

# Documentation
pnpm --filter @iron-frontier/docs dev
pnpm --filter @iron-frontier/docs build
```

---

## Project Structure

```
iron-frontier/
├── apps/
│   ├── web/                     # Vite + React + Babylon.js (WebGPU)
│   │   ├── src/
│   │   │   ├── game/            # Game-specific code
│   │   │   │   ├── Game.tsx     # Main game component
│   │   │   │   ├── components/  # 3D scene components
│   │   │   │   ├── screens/     # Full-screen views
│   │   │   │   ├── ui/          # UI components (ActionBar, GameHUD, etc.)
│   │   │   │   └── store/       # Zustand state management
│   │   │   ├── engine/          # Babylon.js rendering engine
│   │   │   └── components/ui/   # shadcn/ui components
│   │   └── public/assets/       # 3D models, textures
│   ├── mobile/                  # Expo + React Native + Filament
│   │   ├── src/
│   │   └── app.json
│   └── docs/                    # Astro + Starlight documentation
├── packages/
│   └── shared/                  # DRY schemas, data, types
│       ├── src/
│       │   ├── data/            # Items, NPCs, quests, dialogue
│       │   ├── schemas/         # Zod validation schemas
│       │   ├── generation/      # Procedural generators
│       │   └── types/           # TypeScript type definitions
│       └── package.json
├── .github/workflows/           # CI/CD pipelines
└── memory-bank/                 # AI agent context files
```

---

## Key Technologies

### Cross-Platform Architecture

| Layer | Web | Mobile |
|-------|-----|--------|
| **Framework** | React 19 | React Native 0.81 |
| **3D Engine** | Babylon.js 8 (WebGPU) | React Native Filament |
| **State** | Zustand | Zustand |
| **Persistence** | sql.js + IndexedDB | expo-sqlite |
| **Styling** | Tailwind CSS v4 | NativeWind |
| **Build** | Vite 7 | Expo SDK 54 |

### Shared Package (`@iron-frontier/shared`)

All game data and validation schemas live in the shared package:

```typescript
// Import from shared package
import { ItemSchema, type Item } from '@iron-frontier/shared/data/schemas/item';
import { getItem } from '@iron-frontier/shared/data/items';
import { generateNPC } from '@iron-frontier/shared/generation/npc-generator';
```

### Babylon.js via Reactylon (Web)
Reactylon provides declarative JSX for Babylon.js:

```tsx
// Instead of imperative Babylon.js:
const box = MeshBuilder.CreateBox("box", { width: 1 }, scene);
box.position = new Vector3(0, 1, 0);

// Use declarative JSX:
<box name="box" options={{ width: 1 }} position={new Vector3(0, 1, 0)} />
```

**Important**: Mesh parameters go in `options` prop, not as direct props.

### Zustand State Management
Lightweight state with SQLite persistence:

```tsx
// Platform-specific store extensions
interface BaseGameState {
  phase: GamePhase;
  playerStats: PlayerStats;
  inventory: InventoryItem[];
}

// Web extends with Babylon.js specifics
interface WebGameState extends BaseGameState {
  sceneManager: HexSceneManager | null;
}
```

### Zod v4 Schemas

All data validated with Zod:

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

---

## Common Development Tasks

### Adding a New UI Component

1. **Create the component file**:
```tsx
// src/game/ui/NewPanel.tsx
import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function NewPanel() {
  const { newPanelOpen, toggleNewPanel } = useGameStore();
  
  return (
    <Sheet open={newPanelOpen} onOpenChange={toggleNewPanel}>
      <SheetContent side="bottom" className="h-[70vh] bg-amber-950 border-amber-700">
        <SheetHeader>
          <SheetTitle className="text-amber-100">Panel Title</SheetTitle>
        </SheetHeader>
        {/* Content */}
      </SheetContent>
    </Sheet>
  );
}
```

2. **Add state to store** (`gameStore.ts`):
```tsx
// In state interface
newPanelOpen: boolean;

// In initial state
newPanelOpen: false,

// In actions
toggleNewPanel: () => set(s => ({ 
  newPanelOpen: !s.newPanelOpen,
  // Close other panels
  inventoryOpen: false,
  questLogOpen: false,
})),
```

3. **Import in Game.tsx**:
```tsx
import { NewPanel } from './ui/NewPanel';

// In render:
<NewPanel />
```

---

### Adding New Items

1. **Define item in `items.ts`** (create if needed):
```tsx
export const ITEMS = {
  brass_screws: {
    id: 'brass_screws',
    name: 'Brass Screws',
    description: 'Common fasteners used in steampunk machinery',
    category: 'material',
    rarity: 'common',
    stackable: true,
    maxStack: 99,
    value: 2,
  },
  // ... more items
};
```

2. **Add to procgen spawn pools** (`procgen.ts`):
```tsx
const ITEM_TYPES = {
  common: ['brass_screws', 'copper_wire', 'coal_chunk', ...],
  uncommon: ['steam_core', 'precision_gear', ...],
  // ...
};
```

---

### Adding New NPCs

1. **Add NPC names** (`procgen.ts`):
```tsx
const NPC_NAMES = {
  // Existing...
  new_role: ['Name One', 'Name Two', 'Name Three'],
};
```

2. **Add to theme NPC types**:
```tsx
const SECTOR_THEMES = {
  town: {
    // ...
    npcTypes: ['sheriff', 'merchant', 'new_role'],
  },
};
```

3. **Add dialogue patterns** (`DialogueBox.tsx`):
```tsx
const roleDialogue = {
  new_role: [
    "Dialogue line one.",
    "Dialogue line two.",
  ],
};
```

---

### Adding New Sectors

1. **Define new theme** (`procgen.ts`):
```tsx
const SECTOR_THEMES = {
  // Existing themes...
  new_theme: {
    names: ['Location One', 'Location Two'],
    descriptions: ['Description of the area'],
    groundColor: '#hexcolor',
    ambientColor: '#hexcolor',
    propWeights: { crate: 2, barrel: 3, ... },
    npcTypes: ['role1', 'role2'],
    encounterTypes: ['encounter1'],
  },
};
```

2. **Add landmark templates if needed**:
```tsx
const LANDMARK_TEMPLATES = {
  new_landmark: { width: 5, height: 4, name: 'New Landmark' },
};
```

---

### Modifying the 3D Scene

1. **Add new mesh type** (`GameScene.tsx`):
```tsx
function NewMeshComponent({ data }) {
  return (
    <transformNode name={data.id} position={new Vector3(data.x, 0, data.y)}>
      <box
        name={`${data.id}-part`}
        options={{ width: 1, height: 1, depth: 1 }}
        position={new Vector3(0, 0.5, 0)}
      >
        <standardMaterial name={`${data.id}-mat`} diffuseColor={new Color3(1, 0, 0)} />
      </box>
    </transformNode>
  );
}
```

2. **Add to SceneContent**:
```tsx
function SceneContent({ sector }) {
  return (
    <>
      {/* Existing components */}
      {sector.newData.map(item => (
        <NewMeshComponent key={item.id} data={item} />
      ))}
    </>
  );
}
```

---

## Debugging

### State Inspection
Zustand stores can be inspected in React DevTools or with:
```tsx
// In browser console
window.__ZUSTAND_STORE__ = useGameStore;

// Then:
__ZUSTAND_STORE__.getState()
```

### Babylon.js Inspector
```tsx
// Add to scene temporarily
import { Inspector } from '@babylonjs/inspector';

// In scene setup:
Inspector.Show(scene, {});
```

### Procgen Testing
```tsx
// Generate and log sector
import { generateSector } from './lib/procgen';

const sector = generateSector('test_sector', 12345);
console.log('Sector:', sector);
console.log('NPCs:', sector.npcs);
console.log('Items:', sector.items);
```

---

## Testing

### Running Tests
```bash
# Run all tests (203 tests)
pnpm test

# Run tests once (no watch)
pnpm vitest run

# Run specific workspace
pnpm --filter @iron-frontier/web test
pnpm --filter @iron-frontier/shared test

# Run E2E tests (Playwright)
pnpm --filter @iron-frontier/web test:e2e

# Run with coverage
pnpm vitest run --coverage
```

### Test Structure
```
apps/web/src/test/
├── setup.ts                     # Test setup and global mocks
├── test-utils.tsx               # Custom render, store helpers
├── gameStore.test.ts            # Store action tests
├── UIPanels.test.tsx            # UI component tests
├── VisualInteractions.test.tsx  # Interaction tests
├── QuestLog.test.tsx            # Quest UI tests
├── GameFlow.test.tsx            # Game state flow tests
└── TitleScreen.test.tsx         # Title screen tests

packages/shared/src/
├── data/__tests__/              # Data validation tests
├── generation/__tests__/        # Generator tests
└── schemas/__tests__/           # Schema tests

tests/                           # Playwright E2E tests
└── game.spec.ts
```

### Writing Tests

**Store Tests** (gameStore.test.ts):
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/game/store/gameStore';

describe('Feature', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({ /* initial state */ });
  });

  it('should do something', () => {
    const { someAction } = useGameStore.getState();
    someAction();
    expect(useGameStore.getState().someValue).toBe(expected);
  });
});
```

**Component Tests** (using test-utils.tsx):
```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { customRender } from './test-utils';
import { MyComponent } from '@/game/ui/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    customRender(<MyComponent />, {
      initialState: {
        // Set up store state for this test
        someValue: 'test',
      },
    });
    
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

### Test Utilities

The `test-utils.tsx` provides:

- `customRender(ui, options)` - Renders with store setup
- `resetGameStore()` - Reset store to defaults
- `setupGameStore(state)` - Set specific store state
- `createMockSector()` - Create test sector data
- `createMockNPC()` - Create test NPC data
- `createMockItem()` - Create test item data
- `getStoreState()` - Get current store state

### Mocking

Sheet/Dialog components are automatically mocked in test-utils to render without portals:

```typescript
// Sheet mock renders children directly when open
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }) => open ? <div>{children}</div> : null,
  // ...
}));
```

### Manual Testing Checklist

**Title Screen**:
- [ ] Splash screen animates correctly
- [ ] Gears rotate smoothly
- [ ] New Game flow works
- [ ] Continue shows correct player name
- [ ] About modal opens/closes

**Gameplay**:
- [ ] Tap-to-move works
- [ ] Camera follows player
- [ ] Items can be collected
- [ ] NPCs can be talked to
- [ ] Dialogue typewriter works
- [ ] HUD displays correct values

**Panels**:
- [ ] Inventory shows items
- [ ] Quest log shows quests
- [ ] Settings save correctly
- [ ] Menu actions work

**Persistence**:
- [ ] Refresh preserves state
- [ ] New game resets properly

### Type Checking
```bash
pnpm typecheck
```

Fix all TypeScript errors before committing.

---

## Performance Tips

### Avoid Re-renders
```tsx
// Use selectors to pick specific state
const playerHealth = useGameStore(s => s.player.health);

// Not:
const { player } = useGameStore(); // Re-renders on any player change
```

### Memoize Expensive Computations
```tsx
const visibleItems = useMemo(() => 
  sector.items.filter(item => !collectedItems.includes(item.id)),
  [sector.items, collectedItems]
);
```

### Dispose Babylon Resources
```tsx
useEffect(() => {
  // Create resources...
  
  return () => {
    // Dispose on unmount
    mesh.dispose();
    material.dispose();
  };
}, []);
```

---

## Git Workflow

### Branch Naming
- `feature/add-combat-system`
- `fix/inventory-overflow`
- `refactor/store-cleanup`

### Commit Messages
```
feat: add virtual joystick control option
fix: inventory panel not closing on item use
refactor: extract dialogue generation to separate module
docs: update component specifications
```

### Pre-commit Checks
```bash
# Type check
pnpm typecheck

# Build test
pnpm build
```

---

## Common Gotchas

### Reactylon Mesh Options
```tsx
// WRONG - direct props
<box width={1} height={2} />

// CORRECT - options object
<box options={{ width: 1, height: 2 }} />
```

### Zustand Persist Hydration
State might be stale on first render:
```tsx
const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  setHydrated(true);
}, []);

if (!hydrated) return <Loading />;
```

### Babylon.js Vector Mutability
Vectors are mutable - create new ones:
```tsx
// WRONG - mutates shared reference
position.x = 5;

// CORRECT - create new vector
position = new Vector3(5, position.y, position.z);
```

### CSS Safe Areas
For mobile notches:
```tsx
<div className="pb-safe">  {/* Bottom padding for home indicator */}
<div className="pt-safe">  {/* Top padding for notch */}
```
