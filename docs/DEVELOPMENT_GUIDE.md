# Iron Frontier - Development Guide

## Environment Setup

### Prerequisites
- Node.js 18+
- pnpm (preferred) or npm

### Installation
```bash
# Clone and install
pnpm install

# Start development server
pnpm dev

# Type checking
pnpm run tscgo --noEmit

# Build for production
pnpm build
```

### Environment Variables (Optional)
```env
# For future AI content integration
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your-key
AI_MODEL=gpt-4
```

---

## Project Structure

```
src/
├── game/                    # Game-specific code
│   ├── Game.tsx            # Main game component
│   ├── components/         # 3D scene components
│   │   └── GameScene.tsx   # Babylon.js scene
│   ├── screens/            # Full-screen views
│   │   └── TitleScreen.tsx # Splash + menu
│   ├── ui/                 # UI components
│   │   ├── GameHUD.tsx
│   │   ├── ActionBar.tsx
│   │   ├── DialogueBox.tsx
│   │   ├── InventoryPanel.tsx
│   │   ├── QuestLog.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── MenuPanel.tsx
│   │   └── NotificationFeed.tsx
│   ├── store/              # State management
│   │   ├── gameStore.ts    # Main Zustand store
│   │   └── saveManager.ts  # Save/load helpers
│   └── lib/                # Utilities
│       ├── procgen.ts      # Procedural generation
│       ├── prng.ts         # Random number generator
│       ├── types.ts        # TypeScript types
│       ├── items.ts        # Item definitions
│       └── quests.ts       # Quest definitions
├── components/ui/          # shadcn/ui components
├── lib/                    # General utilities
│   └── utils.ts           # Tailwind cn() helper
├── App.tsx                # App entry
├── main.tsx               # React entry
└── index.css              # Tailwind config
```

---

## Key Technologies

### React 19
- Uses latest React features
- Concurrent rendering support
- Automatic batching

### Babylon.js via Reactylon
Reactylon provides declarative JSX for Babylon.js:

```tsx
// Instead of imperative Babylon.js:
const box = MeshBuilder.CreateBox("box", { width: 1 }, scene);
box.position = new Vector3(0, 1, 0);

// Use declarative JSX:
<box name="box" options={{ width: 1 }} position={new Vector3(0, 1, 0)} />
```

**Important**: Mesh parameters go in `options` prop, not as direct props.

### Zustand
Lightweight state management with persistence:

```tsx
// Define store
const useStore = create(persist(
  (set, get) => ({
    count: 0,
    increment: () => set(s => ({ count: s.count + 1 })),
  }),
  { name: 'storage-key' }
));

// Use in components
const count = useStore(s => s.count);
const increment = useStore(s => s.increment);
```

### Tailwind CSS 4
- New configuration syntax
- CSS-native features
- Faster compilation

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
# Run all tests
pnpm test

# Run tests once (no watch)
pnpm vitest run

# Run specific test file
pnpm vitest run src/test/gameStore.test.ts

# Run with coverage
pnpm vitest run --coverage
```

### Test Structure
```
src/test/
├── setup.ts              # Test setup and global mocks
├── test-utils.tsx        # Custom render, store helpers
├── gameStore.test.ts     # Store action tests
├── UIPanels.test.tsx     # UI component tests
├── VisualInteractions.test.tsx  # Interaction tests
├── QuestLog.test.tsx     # Quest UI tests
├── GameFlow.test.tsx     # Game state flow tests
└── TitleScreen.test.tsx  # Title screen tests
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
pnpm run tscgo --noEmit
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
pnpm run tscgo --noEmit

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
