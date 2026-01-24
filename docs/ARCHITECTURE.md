# Iron Frontier - Modern Diorama Architecture

## Core Philosophy

**No tiles. No isometric constraints. Pure 3D diorama with layered terrain overlays.**

Think Warcraft 3's fluid terrain meets Red Dead Redemption's western aesthetic, rendered as a tabletop diorama you can rotate and explore.

---

## Layer System (Bottom to Top)

```text
┌─────────────────────────────────────────────────────────────┐
│  LAYER 7: SKY DOME / HORIZON                                │
│  - Procedural sky with time-of-day                          │
│  - Distant mountains/mesas (parallax billboards)            │
│  - Weather particles (dust, tumbleweeds)                    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 6: ATMOSPHERE / FOG                                  │
│  - Distance fog for depth                                   │
│  - Heat shimmer effect (desert)                             │
│  - Dust clouds                                              │
├─────────────────────────────────────────────────────────────┤
│  LAYER 5: CHARACTERS & PROPS                                │
│  - Player character (procedural gunslinger)                 │
│  - NPCs with AI behaviors                                   │
│  - Interactive props (barrels, crates, signs)               │
│  - Collectible items with glow effects                      │
├─────────────────────────────────────────────────────────────┤
│  LAYER 4: STRUCTURES                                        │
│  - Buildings (saloon, sheriff, general store)               │
│  - Fences, hitching posts, water towers                     │
│  - Train station elements                                   │
│  - Mine entrances                                           │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: VEGETATION                                        │
│  - Cacti, tumbleweeds, dead trees                           │
│  - Grass patches (instanced)                                │
│  - Bushes, rocks                                            │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: SURFACE OVERLAYS                                  │
│  - Roads (dirt paths, wooden boardwalks)                    │
│  - Railroad tracks                                          │
│  - Water (puddles, streams, troughs)                        │
│  - Shadow decals                                            │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1: TERRAIN BASE                                      │
│  - Height-mapped ground plane                               │
│  - Biome-based texturing (desert, grassland, rocky)         │
│  - Procedural blend between biomes                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Biome System

### Biome Types

```typescript
type BiomeType = 
  | 'desert'      // Sandy, cacti, mesas
  | 'grassland'   // Prairie grass, wildflowers
  | 'badlands'    // Rocky, canyons, red earth
  | 'riverside'   // Near water, greener
  | 'town'        // Developed area, buildings
  | 'railyard'    // Industrial, tracks, coal
  | 'mine'        // Rocky, cave entrances, ore veins
```

### Biome Blending

- Use noise-based weight maps for smooth transitions
- Each point on terrain samples multiple biomes
- Blend textures based on weights
- Vegetation density varies by biome

---

## Coordinate System

### World Space (Continuous)

```typescript
interface WorldPosition {
  x: number;  // East-West (meters)
  z: number;  // North-South (meters)
  y: number;  // Elevation (computed from heightmap)
}
```

### Chunk System (for streaming)

```typescript
interface ChunkCoord {
  cx: number;  // Chunk X index
  cz: number;  // Chunk Z index
}

const CHUNK_SIZE = 64;  // 64x64 meters per chunk
const VIEW_DISTANCE = 3; // Load 3 chunks in each direction
```

### No Grid Snapping

- Characters move freely on continuous coordinates
- Pathfinding uses NavMesh, not grid
- Buildings placed at any position/rotation

---

## Terrain Generation

### Heightmap

```typescript
interface TerrainConfig {
  // Base terrain shape
  baseHeight: number;
  maxElevation: number;
  
  // Noise layers
  continentalScale: number;   // Large features (mesas, valleys)
  erosionScale: number;       // Medium features (hills, gullies)
  detailScale: number;        // Small features (bumps, rocks)
  
  // Biome influence
  moistureNoise: NoiseConfig;
  temperatureNoise: NoiseConfig;
}
```

### Surface Overlays (Decal System)

```typescript
interface SurfaceOverlay {
  id: string;
  type: 'road' | 'track' | 'water' | 'boardwalk' | 'shadow';
  
  // Spline-based path OR polygon
  path?: Vector3[];      // For roads/tracks
  polygon?: Vector3[];   // For areas
  
  width: number;
  material: string;
  
  // Blend settings
  fadeEdges: boolean;
  priority: number;      // Higher = rendered on top
}
```

---

## Structure System

### Building Definition

```typescript
interface Structure {
  id: string;
  type: StructureType;
  
  // Placement
  position: WorldPosition;
  rotation: number;        // Y-axis rotation in radians
  scale: number;
  
  // Footprint for NavMesh carving
  footprint: Vector2[];
  
  // Interaction
  entrances: DoorDefinition[];
  interactPoints: InteractPoint[];
  
  // State
  condition: number;       // 0-1, affects appearance
  ownerNpcId?: string;
}
```

```typescript
type StructureType = 
  | 'saloon'
  | 'sheriff_office'
  | 'general_store'
  | 'bank'
  | 'hotel'
  | 'stable'
  | 'water_tower'
  | 'windmill'
  | 'mine_entrance'
  | 'train_station'
  | 'house_small'
  | 'house_large'
  | 'outhouse'
  | 'well';
```

---

## Character System

### Procedural Gunslinger

```typescript
interface CharacterAppearance {
  // Body
  bodyType: 'slim' | 'average' | 'stocky';
  height: number;          // 0.9 - 1.1 multiplier
  skinTone: string;        // Hex color
  
  // Face
  faceShape: number;       // Morph target blend
  hasBeard: boolean;
  beardStyle?: 'stubble' | 'full' | 'mustache' | 'goatee';
  hasScar: boolean;
  scarPosition?: 'cheek' | 'eye' | 'chin';
  
  // Clothing
  hatStyle: 'cowboy' | 'bowler' | 'flat_cap' | 'none';
  hatColor: string;
  shirtStyle: 'work' | 'fancy' | 'vest';
  shirtColor: string;
  pantsStyle: 'jeans' | 'chaps' | 'slacks';
  pantsColor: string;
  bootsStyle: 'work' | 'fancy' | 'spurs';
  
  // Accessories
  hasBandana: boolean;
  bandanaColor?: string;
  hasGunbelt: boolean;
  hasPoncho: boolean;
  ponchoColor?: string;
}

interface CharacterRig {
  // Skeleton for animation
  bones: BoneHierarchy;
  
  // Animation states
  currentAnim: AnimationState;
  animationBlend: Map<string, number>;
  
  // IK targets for procedural motion
  leftFootTarget: Vector3;
  rightFootTarget: Vector3;
  lookAtTarget: Vector3;
}
```

---

## AI System

### NPC Behavior Tree

```typescript
interface NPCBrain {
  id: string;
  
  // Personality (affects behavior weights)
  personality: {
    aggression: number;    // 0-1
    friendliness: number;  // 0-1
    curiosity: number;     // 0-1
    greed: number;         // 0-1
  };
  
  // Current state
  currentBehavior: BehaviorNode;
  blackboard: Map<string, any>;
  
  // Perception
  visibleEntities: string[];
  heardSounds: SoundEvent[];
  
  // Schedule (time-based behaviors)
  dailySchedule: ScheduleEntry[];
}

type BehaviorNode = 
  | { type: 'idle'; duration: number }
  | { type: 'patrol'; waypoints: Vector3[] }
  | { type: 'work'; workstation: string }
  | { type: 'talk'; targetNpc: string }
  | { type: 'flee'; from: Vector3 }
  | { type: 'investigate'; point: Vector3 }
  | { type: 'follow'; target: string };
```

---

## Camera System

### Diorama Camera

```typescript
interface CameraState {
  // Orbit around focus point
  focusPoint: Vector3;
  
  // Spherical coordinates
  distance: number;        // 10-50 meters
  azimuth: number;         // Horizontal angle
  elevation: number;       // Vertical angle (clamped)
  
  // Limits
  minDistance: number;
  maxDistance: number;
  minElevation: number;    // Don't go below horizon
  maxElevation: number;    // Don't go directly overhead
  
  // Smooth follow
  followTarget?: string;   // Entity ID to follow
  followLag: number;       // Smoothing factor
  
  // Cinematic
  isInCutscene: boolean;
  cutscenePath?: CameraPath;
}
```

### Horizon Anchoring

- Sky dome always rendered at infinity
- Distant terrain LODs fade to horizon color
- Mountains rendered as billboards at far distance
- Fog increases with distance for depth

---

## Persistence (SQLite via sql.js)

### Schema

```sql
-- World chunks (lazy-loaded)
CREATE TABLE chunks (
  cx INTEGER,
  cz INTEGER,
  seed INTEGER,
  generated_at INTEGER,
  data BLOB,  -- Compressed JSON
  PRIMARY KEY (cx, cz)
);

-- Player state
CREATE TABLE player (
  id TEXT PRIMARY KEY,
  name TEXT,
  appearance BLOB,
  position_x REAL,
  position_z REAL,
  rotation REAL,
  health INTEGER,
  max_health INTEGER,
  gold INTEGER,
  xp INTEGER,
  level INTEGER,
  updated_at INTEGER
);

-- Inventory
CREATE TABLE inventory (
  id TEXT PRIMARY KEY,
  player_id TEXT,
  item_type TEXT,
  quantity INTEGER,
  slot INTEGER,
  metadata BLOB,
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- NPCs (persistent state changes)
CREATE TABLE npcs (
  id TEXT PRIMARY KEY,
  chunk_cx INTEGER,
  chunk_cz INTEGER,
  type TEXT,
  name TEXT,
  position_x REAL,
  position_z REAL,
  rotation REAL,
  disposition INTEGER,  -- Relationship to player
  is_alive BOOLEAN,
  metadata BLOB
);

-- Quests
CREATE TABLE quests (
  id TEXT PRIMARY KEY,
  player_id TEXT,
  quest_type TEXT,
  status TEXT,  -- 'active', 'completed', 'failed'
  progress BLOB,
  started_at INTEGER,
  completed_at INTEGER,
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- World state changes
CREATE TABLE world_changes (
  id TEXT PRIMARY KEY,
  chunk_cx INTEGER,
  chunk_cz INTEGER,
  change_type TEXT,
  target_id TEXT,
  data BLOB,
  created_at INTEGER
);
```

---

## Zustand State Structure

```typescript
interface GameState {
  // Core
  phase: 'title' | 'loading' | 'playing' | 'paused' | 'dialogue' | 'inventory';
  
  // World
  world: {
    seed: number;
    time: number;           // 0-24 hours
    weather: WeatherState;
    loadedChunks: Map<string, ChunkData>;
    activeEntities: Map<string, Entity>;
  };
  
  // Player
  player: {
    id: string;
    name: string;
    appearance: CharacterAppearance;
    position: WorldPosition;
    rotation: number;
    velocity: Vector3;
    stats: PlayerStats;
    inventory: InventoryState;
    equipment: EquipmentState;
    quests: QuestState[];
  };
  
  // Camera
  camera: CameraState;
  
  // UI
  ui: {
    hudVisible: boolean;
    activePanel: PanelType | null;
    dialogueState: DialogueState | null;
    notifications: Notification[];
  };
  
  // Settings
  settings: GameSettings;
  
  // Database handle
  db: SqlJsDatabase | null;
}
```

---

## Rendering Pipeline

### Babylon.js Setup

```text
// Main render passes
1. Shadow map generation (sun)
2. Terrain base pass
3. Surface overlay pass (decals)
4. Vegetation instancing pass
5. Structure pass
6. Character pass
7. Particle systems
8. Post-processing (bloom, color grading, vignette)
9. UI overlay
```

### Performance Targets

- 60fps on mid-range mobile
- Dynamic LOD for terrain chunks
- Instanced rendering for vegetation
- Shader-based terrain blending
- Occlusion culling for structures

---

## Implementation Phases

### Phase 1: Terrain Foundation

1. Heightmap terrain with biome blending
2. Decal system for overlays
3. Basic camera controls
4. SQLite integration

### Phase 2: Structures & Props

1. Building prefabs
2. Prop placement system
3. NavMesh generation
4. Collision system

### Phase 3: Characters

1. Procedural gunslinger generator
2. Animation system
3. Basic AI behaviors
4. Player controls

### Phase 4: World Generation

1. Chunk streaming
2. Biome distribution
3. Structure placement rules
4. Road/path generation

### Phase 5: Gameplay

1. Interaction system
2. Inventory & items
3. Quest framework
4. Dialogue system

---

## File Structure (New)

```text
src/
├── engine/
│   ├── terrain/
│   │   ├── TerrainChunk.ts
│   │   ├── BiomeBlender.ts
│   │   ├── HeightmapGenerator.ts
│   │   └── DecalSystem.ts
│   ├── rendering/
│   │   ├── SceneManager.ts
│   │   ├── CameraController.ts
│   │   ├── SkyDome.ts
│   │   └── PostProcessing.ts
│   ├── entities/
│   │   ├── Entity.ts
│   │   ├── Character.ts
│   │   ├── Structure.ts
│   │   └── Prop.ts
│   ├── ai/
│   │   ├── BehaviorTree.ts
│   │   ├── NavMesh.ts
│   │   └── Perception.ts
│   └── physics/
│       ├── CollisionSystem.ts
│       └── MovementController.ts
├── generation/
│   ├── WorldGenerator.ts
│   ├── ChunkGenerator.ts
│   ├── StructurePlacer.ts
│   ├── RoadGenerator.ts
│   └── CharacterGenerator.ts
├── data/
│   ├── Database.ts
│   ├── schemas/
│   └── migrations/
├── game/
│   ├── Game.tsx
│   ├── store/
│   │   └── gameStore.ts
│   ├── ui/
│   └── screens/
└── types/
    └── index.ts
```
