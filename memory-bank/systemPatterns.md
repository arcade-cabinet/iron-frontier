# System Patterns

## Architecture: "Reactylon"

We bridge React state and Babylon.js 3D rendering using a declarative pattern we call **Reactylon**.

- **React** handles game logic, UI, and state.
- **Babylon.js** is purely a meaningful view layer.
- **Components** like `<GameScene>` coordinate the bridge.
- **Pattern**: `<box options={{...}} />` (passing a single options object) rather than spread props, to ensure type safety and performance.

## State Management

- **Zustand**: The "Single Source of Truth" for runtime state.
  - `gameStore.ts` holds player position, inventory, quests, and UI flags.
- **SQLite (sql.js)**: The persistence layer.
  - Binary DB saved to IndexedDB (`idb-keyval`).
  - Syncs periodically from Zustand -> SQLite.
  - `DatabaseManager` handles all SQL queries.

## Design Patterns

### 1. The Diorama Layer System

The world is built in strictly defined layers for visual consistency:

- **Layer 7**: Sky/Horizon
- **Layer 5**: Characters/Props
- **Layer 4**: Structures
- **Layer 1**: Terrain Heightmap (Base)

### 2. Biome Blending

- Terrain uses noise maps to blend between biomes (e.g., Desert <-> Town).
- Vegetation and texture choices are derived from biome weights at any (x, z) coordinate.

### 3. Asset Registry

- `WesternRegistry.ts` creates a type-safe mapping of all 3D assets.
- Components reference `WesternAssets.GUNSLINGER` rather than raw strings.

### 4. Component Decoupling

- **UI Logic** is separated from **Rendering**.
- **`GunslingerModel`**: Contains its own animation logic based on props (position, velocity), but doesn't "own" the player state (the Store does).
