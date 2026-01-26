# Package Decomposition Plan

## Current State

The `@iron-frontier/shared` package is a monolith containing:

```
packages/shared/src/
├── __tests__/        # Tests
├── ai/               # YukaJS AI system (NEW)
├── controllers/      # Game controllers
├── data/             # Game data (schemas, items, NPCs, quests)
├── generation/       # Procedural generation
├── hex/              # Hex grid utilities
├── hooks/            # React hooks
├── input/            # Input handling
├── lib/              # Utility functions
├── puzzles/          # Mini-game puzzles
├── rendering/        # Rendering abstractions
├── scenes/           # Scene configurations
├── services/         # Game services
├── store/            # Zustand store
├── systems/          # Game systems (collision, zones, encounters)
└── types/            # TypeScript types
```

## Proposed New Structure

Split into focused packages following Expo/pnpm monorepo best practices:

### 1. `@iron-frontier/types`
Pure TypeScript types and interfaces. Zero runtime dependencies.

**Contents:**
- All interface definitions
- Type exports from current `types/`
- Engine-agnostic type definitions

**Dependencies:** None

### 2. `@iron-frontier/schemas`
Zod schemas for runtime validation.

**Contents:**
- `data/schemas/` - Item, NPC, Quest, Combat, Dialogue schemas
- Schema utilities and helpers

**Dependencies:**
- `zod`
- `@iron-frontier/types`

### 3. `@iron-frontier/config`
Game configuration, constants, and presets.

**Contents:**
- `scenes/three/` - Lighting, camera, terrain presets
- `data/generation/templates/` - Enemy, NPC, shop templates
- Game balance constants

**Dependencies:**
- `@iron-frontier/types`

### 4. `@iron-frontier/game-logic`
Core game systems and state management.

**Contents:**
- `ai/` - YukaJS AI system
- `controllers/` - Game controllers
- `systems/` - Collision, zones, encounters
- `store/` - Zustand state management
- `services/` - Travel, etc.
- `input/` - Input handling

**Dependencies:**
- `yuka`
- `zustand`
- `miniplex`
- `@iron-frontier/types`
- `@iron-frontier/schemas`
- `@iron-frontier/config`

### 5. `@iron-frontier/content`
Static game content (authored data).

**Contents:**
- `data/items/` - Item definitions
- `data/npcs/` - NPC definitions and dialogues
- `data/locations/` - Town and route data
- `data/shops/` - Shop inventories
- `data/worlds/` - World data

**Dependencies:**
- `@iron-frontier/types`
- `@iron-frontier/schemas`

### 6. `@iron-frontier/generation`
Procedural generation code.

**Contents:**
- `generation/` - Character, quest, world generators
- `data/generation/generators/` - All generator code
- `data/generation/pools/` - Name pools, dialogue snippets
- `hex/` - Hex grid utilities

**Dependencies:**
- `simplex-noise`
- `alea`
- `@iron-frontier/types`
- `@iron-frontier/schemas`
- `@iron-frontier/config`

## Migration Strategy

### Phase 1: Extract Types
1. Create `packages/types/`
2. Move pure type definitions
3. Update imports across codebase

### Phase 2: Extract Schemas
1. Create `packages/schemas/`
2. Move Zod schemas
3. Add dependency on types package

### Phase 3: Extract Config
1. Create `packages/config/`
2. Move presets and constants
3. Update scene configuration imports

### Phase 4: Extract Content
1. Create `packages/content/`
2. Move static game data
3. Update data access patterns

### Phase 5: Extract Generation
1. Create `packages/generation/`
2. Move procedural generators
3. Update generator dependencies

### Phase 6: Rename Shared → Game Logic
1. Rename `packages/shared/` to `packages/game-logic/`
2. Clean up remaining code
3. Update all workspace references

## Benefits

1. **Faster builds** - Only rebuild changed packages
2. **Better caching** - Metro/Metro caches by package
3. **Clearer dependencies** - Explicit dependency graph
4. **Easier maintenance** - Smaller, focused packages
5. **Better tree-shaking** - Only import what you need
6. **Team scalability** - Multiple people can own different packages

## Notes

- This is a significant refactoring effort
- Should be done incrementally to avoid breaking changes
- Each phase should include updating tests
- Consider using `tsup` for building each package
