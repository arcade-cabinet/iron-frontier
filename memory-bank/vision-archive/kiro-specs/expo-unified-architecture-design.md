# Expo Unified Architecture Migration - Design Document

## Overview

This design document provides a detailed implementation plan for migrating Iron Frontier from a pnpm workspace monorepo to a single unified Expo application. The migration will consolidate `apps/web/` and `apps/mobile/` into one Expo project that targets web, iOS, and Android platforms.

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Expo Application                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Web      │  │     iOS      │  │   Android    │     │
│  │  (Metro)     │  │   (Native)   │  │   (Native)   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│         ┌──────────────────▼──────────────────┐             │
│         │   Platform-Specific Layer           │             │
│         │  - GameCanvas.web.tsx (R3F)         │             │
│         │  - GameCanvas.native.tsx (expo-gl)  │             │
│         │  - UI Components (.web/.native)     │             │
│         └──────────────────┬──────────────────┘             │
│                            │                                 │
│         ┌──────────────────▼──────────────────┐             │
│         │      Shared Application Layer        │             │
│         │  - Game Logic (src/game/)           │             │
│         │  - Zustand Store (src/store/)       │             │
│         │  - Scene Components                  │             │
│         │  - Data & Schemas (src/data/)       │             │
│         └─────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Principles (from ARCHITECTURE_V2.md)

**CRITICAL**: The current architecture is **authored content**, NOT procedural:
- **Seamless overworld**: Pokemon-style, walk in/out of towns
- **6 authored towns**: Frontier's Edge, Iron Gulch, Mesa Point, Coldwater, Salvation
- **5 authored routes**: Connecting towns with specific encounters and events
- **Turn-based combat**: Separate combat screen (FF/Pokemon style)
- **Survival mechanics**: Day/night, fatigue, provisions, camping
- **3-hour playthrough**: Complete game experience

**Migration Note**: While the current codebase has procedural generation code, the V2 architecture document specifies authored content. We should preserve both systems during migration, but prioritize the authored content structure.

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Routing** | Expo Router 5.0.6 | File-based routing for all platforms |
| **Bundler** | Metro | Universal bundler (web + native) |
| **3D Web** | React Three Fiber 9.1.2 | Declarative Three.js for web |
| **3D Native** | expo-gl + expo-three | Three.js rendering on iOS/Android |
| **Styling** | NativeWind 4.1.23 | Tailwind CSS for React Native |
| **State** | Zustand 5.0.10 | Global state management |
| **Persistence** | expo-sqlite (native), sql.js (web) | SQLite databases |
| **Testing** | Jest 29.7.0 | Unit tests |
| **E2E** | Playwright (web), Maestro (mobile) | End-to-end tests |
| **Build** | EAS Build | Multi-platform CI/CD |

### Branding Requirements (from BRANDING.md)

**Color Palette** (Steampunk Frontier):
- **Primary**: Brass/Amber family (amber-300 to amber-700)
- **Backgrounds**: Stone/Earth tones (stone-900, stone-950, amber-950)
- **Accents**: Copper (orange-600), Gold (yellow-500)
- **Text**: Amber-100 (primary), Amber-200 (body), Stone-400 (subtle)

**Typography**:
- **Display**: Playfair Display (serif with character)
- **Body**: Merriweather (readable serif)
- **UI**: Inter (clean sans-serif)

**Visual Identity**:
- Rotating gear motif (signature element)
- Gradient titles: `from-amber-300 via-amber-500 to-amber-700`
- Metallic/brass texture feel
- Warm, dusty frontier atmosphere

**Touch Targets**: Minimum 44x44px (iOS HIG compliance)


## Directory Structure

### Target Structure (Post-Migration)

```
iron-frontier/
├── app/                           # Expo Router (file-based routing)
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Game screen (main)
│   │   ├── inventory.tsx         # Inventory screen
│   │   └── settings.tsx          # Settings screen
│   ├── _layout.tsx               # Root layout (providers, fonts)
│   ├── +html.tsx                 # Custom HTML for web
│   └── +not-found.tsx            # 404 page
│
├── components/                    # Reusable UI components
│   ├── game/                     # Game-specific components
│   │   ├── GameCanvas.web.tsx    # R3F Canvas wrapper (web)
│   │   ├── GameCanvas.native.tsx # expo-gl wrapper (native)
│   │   ├── scenes/               # Shared scene components
│   │   │   ├── OverworldScene.tsx
│   │   │   ├── CombatScene.tsx
│   │   │   └── TravelScene.tsx
│   │   └── hud/                  # HUD components
│   │       ├── ActionBar.tsx
│   │       ├── DialogueBox.tsx
│   │       └── StatusDisplay.tsx
│   └── ui/                       # Base UI components
│       ├── Button.tsx            # Platform-agnostic button
│       ├── Button.web.tsx        # Web-specific overrides
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── ...
│
├── src/                          # Core application code
│   ├── game/                     # Game logic (from packages/shared)
│   │   ├── data/                 # Game data
│   │   │   ├── schemas/          # Zod schemas
│   │   │   │   ├── item.ts
│   │   │   │   ├── npc.ts
│   │   │   │   ├── quest.ts
│   │   │   │   ├── combat.ts
│   │   │   │   └── dialogue.ts
│   │   │   ├── items/            # Item definitions
│   │   │   ├── npcs/             # NPC definitions
│   │   │   ├── quests/           # Quest definitions
│   │   │   └── dialogues/        # Dialogue trees
│   │   ├── generation/           # Procedural generators
│   │   │   ├── generators/
│   │   │   │   ├── nameGenerator.ts
│   │   │   │   ├── npcGenerator.ts
│   │   │   │   ├── questGenerator.ts
│   │   │   │   ├── itemGenerator.ts
│   │   │   │   └── worldGenerator.ts
│   │   │   ├── templates/        # Generation templates
│   │   │   └── pools/            # Name/content pools
│   │   └── systems/              # Game systems
│   │       ├── combat.ts
│   │       ├── dialogue.ts
│   │       ├── inventory.ts
│   │       └── travel.ts
│   │
│   ├── store/                    # Zustand state management
│   │   ├── gameStore.ts          # Unified game store
│   │   ├── slices/               # Store slices
│   │   │   ├── playerSlice.ts
│   │   │   ├── worldSlice.ts
│   │   │   ├── combatSlice.ts
│   │   │   └── uiSlice.ts
│   │   └── types.ts              # Store types
│   │
│   ├── lib/                      # Utilities and helpers
│   │   ├── prng.ts               # Seeded random number generator
│   │   ├── hex.ts                # Hex grid utilities
│   │   ├── database.ts           # SQLite wrapper
│   │   ├── database.web.ts       # sql.js implementation
│   │   ├── database.native.ts    # expo-sqlite implementation
│   │   └── utils.ts              # General utilities
│   │
│   └── types/                    # TypeScript types
│       ├── game.ts
│       ├── world.ts
│       └── ui.ts
│
├── assets/                       # Static assets (Git LFS)
│   ├── models/                   # 3D models
│   │   ├── characters/
│   │   ├── buildings/
│   │   └── terrain/
│   ├── textures/                 # Texture files
│   ├── fonts/                    # Custom fonts
│   └── images/                   # UI images
│
├── __tests__/                    # Test files
│   ├── unit/                     # Unit tests (Jest)
│   │   ├── game/
│   │   │   ├── store.test.ts
│   │   │   ├── generators.test.ts
│   │   │   └── systems.test.ts
│   │   └── components/
│   │       └── GameCanvas.test.tsx
│   ├── e2e/                      # E2E tests
│   │   ├── web/                  # Playwright
│   │   │   ├── gameplay.spec.ts
│   │   │   └── navigation.spec.ts
│   │   └── mobile/               # Maestro
│   │       ├── gameplay.yaml
│   │       └── navigation.yaml
│   └── setup.ts                  # Test configuration
│
├── .github/                      # CI/CD
│   └── workflows/
│       ├── ci.yml                # Main CI pipeline
│       └── deploy.yml            # Deployment workflow
│
├── app.json                      # Expo configuration
├── metro.config.js               # Metro bundler config
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript config
├── jest.config.js                # Jest configuration
├── eas.json                      # EAS Build config
├── package.json                  # Dependencies
└── README.md                     # Documentation
```


## Platform-Specific Rendering Strategy

### 3D Canvas Abstraction

The key to cross-platform 3D rendering is separating the Canvas wrapper (platform-specific) from scene components (platform-agnostic).

#### Web Canvas (React Three Fiber)

```tsx
// components/game/GameCanvas.web.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { ReactNode } from 'react';

interface GameCanvasProps {
  children: ReactNode;
  cameraPosition?: [number, number, number];
}

export function GameCanvas({ children, cameraPosition = [0, 10, 10] }: GameCanvasProps) {
  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%' }}
    >
      <PerspectiveCamera makeDefault position={cameraPosition} />
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} />
      {children}
    </Canvas>
  );
}
```

#### Native Canvas (expo-gl)

```tsx
// components/game/GameCanvas.native.tsx
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { useEffect, useRef, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface GameCanvasProps {
  children: ReactNode;
  cameraPosition?: [number, number, number];
}

export function GameCanvas({ children, cameraPosition = [0, 10, 10] }: GameCanvasProps) {
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<Renderer>();

  const onContextCreate = async (gl: WebGLRenderingContext) => {
    // Setup renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    rendererRef.current = renderer;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(...cameraPosition);
    cameraRef.current = camera;

    // Render loop
    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  return (
    <View style={styles.container}>
      <GLView style={styles.canvas} onContextCreate={onContextCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  canvas: { flex: 1 },
});
```

### Shared Scene Components

Scene components are written in a platform-agnostic way using JSX that works with both R3F and manual Three.js:

```tsx
// components/game/scenes/OverworldScene.tsx
import { useGameStore } from '@/src/store/gameStore';
import { HexGrid } from './HexGrid';
import { PlayerCharacter } from './PlayerCharacter';
import { NPCCharacter } from './NPCCharacter';

export function OverworldScene() {
  const { currentLocation, npcs } = useGameStore();

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Environment */}
      <HexGrid location={currentLocation} />

      {/* Characters */}
      <PlayerCharacter />
      {npcs.map((npc) => (
        <NPCCharacter key={npc.id} npc={npc} />
      ))}
    </>
  );
}
```

**Note**: For native, we'll need to manually instantiate Three.js objects from these JSX components. This can be done with a custom reconciler or by converting JSX to imperative Three.js calls.


## State Management Design

### Unified Zustand Store

Merge `webGameStore.ts` and `mobileGameStore.ts` into a single store with platform-specific initialization:

```tsx
// src/store/gameStore.ts
import { create } from 'zustand';
import { Platform } from 'react-native';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GamePhase, PlayerStats, Item, Quest, NPC } from '@/src/types/game';

interface GameState {
  // Core game state
  phase: GamePhase;
  playerStats: PlayerStats;
  inventory: Item[];
  activeQuests: Quest[];
  currentLocationId: string;
  
  // UI state
  activePanel: PanelType | null;
  isLoading: boolean;
  
  // Platform-specific state
  renderMode?: 'webgl' | 'webgpu'; // web only
  deviceInfo?: DeviceInfo;         // native only
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  startQuest: (quest: Quest) => void;
  completeQuest: (questId: string) => void;
  setActivePanel: (panel: PanelType | null) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      phase: 'title',
      playerStats: {
        health: 100,
        maxHealth: 100,
        level: 1,
        experience: 0,
      },
      inventory: [],
      activeQuests: [],
      currentLocationId: 'starting-town',
      activePanel: null,
      isLoading: false,
      
      // Platform-specific initialization
      ...(Platform.OS === 'web' ? {
        renderMode: 'webgpu',
      } : {
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      }),
      
      // Actions
      setPhase: (phase) => set({ phase }),
      
      addItem: (item) => set((state) => ({
        inventory: [...state.inventory, item],
      })),
      
      removeItem: (itemId) => set((state) => ({
        inventory: state.inventory.filter((item) => item.id !== itemId),
      })),
      
      startQuest: (quest) => set((state) => ({
        activeQuests: [...state.activeQuests, quest],
      })),
      
      completeQuest: (questId) => set((state) => ({
        activeQuests: state.activeQuests.filter((q) => q.id !== questId),
      })),
      
      setActivePanel: (panel) => set({ activePanel: panel }),
    }),
    {
      name: 'iron-frontier-storage',
      storage: createJSONStorage(() => 
        Platform.OS === 'web' ? localStorage : AsyncStorage
      ),
    }
  )
);
```

### Store Slices (Optional)

For better organization, split the store into slices:

```tsx
// src/store/slices/playerSlice.ts
export interface PlayerSlice {
  playerStats: PlayerStats;
  inventory: Item[];
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  updateStats: (stats: Partial<PlayerStats>) => void;
}

export const createPlayerSlice = (set, get) => ({
  playerStats: { health: 100, maxHealth: 100, level: 1, experience: 0 },
  inventory: [],
  
  addItem: (item) => set((state) => ({
    inventory: [...state.inventory, item],
  })),
  
  removeItem: (itemId) => set((state) => ({
    inventory: state.inventory.filter((item) => item.id !== itemId),
  })),
  
  updateStats: (stats) => set((state) => ({
    playerStats: { ...state.playerStats, ...stats },
  })),
});
```


## Styling System Design

### NativeWind Configuration

```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Steampunk color palette
        brass: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        copper: {
          500: '#b87333',
          600: '#a0522d',
          700: '#8b4513',
        },
        steam: {
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
      fontFamily: {
        'steampunk': ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
};
```

### Platform-Specific Styling

Use NativeWind's platform prefixes for platform-specific styles:

```tsx
// components/ui/Button.tsx
import { Pressable, Text } from 'react-native';

export function Button({ children, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="
        bg-brass-600 
        px-6 py-3 
        rounded-lg
        web:hover:bg-brass-700
        web:active:scale-95
        native:active:opacity-80
        min-h-[44px]
      "
    >
      <Text className="text-white font-bold text-center">
        {children}
      </Text>
    </Pressable>
  );
}
```

### Replacing shadcn/ui Components

Map shadcn/ui components to React Native equivalents:

| shadcn/ui | React Native Equivalent | Notes |
|-----------|------------------------|-------|
| `Button` | `Pressable` + `Text` | Use NativeWind for styling |
| `Card` | `View` with shadow | Platform-specific shadows |
| `Dialog` | `Modal` | Native modal component |
| `Input` | `TextInput` | Platform-specific keyboard |
| `Select` | `Picker` (native) or custom | Different on each platform |
| `Tabs` | Expo Router tabs | File-based routing |
| `Toast` | `react-native-toast-message` | Third-party library |


## Asset Management Design

### Git LFS Configuration

Keep existing `.gitattributes` for 3D models and textures:

```
# .gitattributes
*.glb filter=lfs diff=lfs merge=lfs -text
*.gltf filter=lfs diff=lfs merge=lfs -text
*.obj filter=lfs diff=lfs merge=lfs -text
*.mtl filter=lfs diff=lfs merge=lfs -text
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
*.jpeg filter=lfs diff=lfs merge=lfs -text
```

### Asset Loading Pattern

Use `expo-asset` for cross-platform asset loading:

```tsx
// src/lib/assets.ts
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';

export async function loadModel(modelPath: string): Promise<string> {
  if (Platform.OS === 'web') {
    // Web: return public URL
    return modelPath;
  } else {
    // Native: use expo-asset
    const asset = Asset.fromModule(require(`../../assets/models/${modelPath}`));
    await asset.downloadAsync();
    return asset.localUri || asset.uri;
  }
}

// Usage in component
import { useAssets } from 'expo-asset';

function GameScene() {
  const [assets] = useAssets([
    require('../assets/models/character.glb'),
    require('../assets/models/building.glb'),
  ]);

  if (!assets) {
    return <LoadingScreen />;
  }

  return <Scene modelUri={assets[0].localUri} />;
}
```

### Metro Configuration for Assets

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for 3D model file extensions
config.resolver.assetExts.push(
  'glb',
  'gltf',
  'obj',
  'mtl',
  'fbx',
  'dae'
);

// Exclude source map files from assets
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'map'
);

module.exports = config;
```


## Database Design

### Platform-Specific SQLite Implementation

Create a unified database interface with platform-specific implementations:

```tsx
// src/lib/database.ts (interface)
export interface Database {
  init(): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  close(): Promise<void>;
}

// src/lib/database.web.ts (sql.js implementation)
import initSqlJs from 'sql.js';

class WebDatabase implements Database {
  private db: any;

  async init() {
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });
    
    // Load from IndexedDB if exists
    const savedDb = localStorage.getItem('iron-frontier-db');
    if (savedDb) {
      const buffer = new Uint8Array(JSON.parse(savedDb));
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
      await this.createTables();
    }
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const results = this.db.exec(sql, params);
    return results[0]?.values || [];
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    this.db.run(sql, params);
    this.save();
  }

  private save() {
    const data = this.db.export();
    localStorage.setItem('iron-frontier-db', JSON.stringify(Array.from(data)));
  }

  async close() {
    this.db.close();
  }

  private async createTables() {
    // Create game tables
    await this.execute(`
      CREATE TABLE IF NOT EXISTS player (
        id INTEGER PRIMARY KEY,
        name TEXT,
        level INTEGER,
        experience INTEGER,
        health INTEGER,
        max_health INTEGER
      )
    `);
    // ... more tables
  }
}

export const database = new WebDatabase();

// src/lib/database.native.ts (expo-sqlite implementation)
import * as SQLite from 'expo-sqlite';

class NativeDatabase implements Database {
  private db: SQLite.SQLiteDatabase;

  async init() {
    this.db = await SQLite.openDatabaseAsync('iron-frontier.db');
    await this.createTables();
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    return await this.db.getAllAsync(sql, params);
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    await this.db.runAsync(sql, params);
  }

  async close() {
    await this.db.closeAsync();
  }

  private async createTables() {
    await this.execute(`
      CREATE TABLE IF NOT EXISTS player (
        id INTEGER PRIMARY KEY,
        name TEXT,
        level INTEGER,
        experience INTEGER,
        health INTEGER,
        max_health INTEGER
      )
    `);
    // ... more tables
  }
}

export const database = new NativeDatabase();
```

### Usage in Store

```tsx
// src/store/gameStore.ts
import { database } from '@/src/lib/database';

export const useGameStore = create<GameState>((set, get) => ({
  // ... state
  
  async loadGame() {
    await database.init();
    const player = await database.query('SELECT * FROM player WHERE id = 1');
    if (player.length > 0) {
      set({ playerStats: player[0] });
    }
  },
  
  async saveGame() {
    const { playerStats } = get();
    await database.execute(
      'INSERT OR REPLACE INTO player VALUES (?, ?, ?, ?, ?, ?)',
      [1, playerStats.name, playerStats.level, playerStats.experience, 
       playerStats.health, playerStats.maxHealth]
    );
  },
}));
```


## Testing Strategy

### Unit Tests (Jest)

```js
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
  ],
};
```

```tsx
// __tests__/setup.ts
import '@testing-library/jest-native/extend-expect';

// Mock expo modules
jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn(),
      localUri: 'mock-uri',
    })),
  },
}));

jest.mock('expo-gl', () => ({
  GLView: 'GLView',
}));
```

### Test Examples

```tsx
// __tests__/unit/game/store.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useGameStore } from '@/src/store/gameStore';

describe('GameStore', () => {
  beforeEach(() => {
    useGameStore.setState({
      phase: 'title',
      inventory: [],
    });
  });

  it('should add item to inventory', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.addItem({
        id: 'sword-1',
        name: 'Iron Sword',
        type: 'weapon',
      });
    });

    expect(result.current.inventory).toHaveLength(1);
    expect(result.current.inventory[0].name).toBe('Iron Sword');
  });

  it('should remove item from inventory', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.addItem({ id: 'sword-1', name: 'Iron Sword', type: 'weapon' });
      result.current.removeItem('sword-1');
    });

    expect(result.current.inventory).toHaveLength(0);
  });
});
```

### E2E Tests (Playwright for Web)

```ts
// __tests__/e2e/web/gameplay.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Gameplay Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
  });

  test('should start new game', async ({ page }) => {
    // Wait for title screen
    await expect(page.locator('text=Iron Frontier')).toBeVisible();
    
    // Click new game
    await page.click('text=New Game');
    
    // Should transition to playing phase
    await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
  });

  test('should open inventory', async ({ page }) => {
    await page.click('text=New Game');
    await page.click('[data-testid="inventory-button"]');
    
    await expect(page.locator('[data-testid="inventory-panel"]')).toBeVisible();
  });
});
```

### E2E Tests (Maestro for Mobile)

```yaml
# __tests__/e2e/mobile/gameplay.yaml
appId: com.ironfrontier.app
---
- launchApp
- assertVisible: "Iron Frontier"
- tapOn: "New Game"
- assertVisible:
    id: "game-canvas"
- tapOn:
    id: "inventory-button"
- assertVisible:
    id: "inventory-panel"
```


## Configuration Files

### Expo Configuration

```json
// app.json
{
  "expo": {
    "name": "Iron Frontier",
    "slug": "iron-frontier",
    "version": "1.0.0",
    "orientation": "default",  // Support both portrait and landscape
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1c1917"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.ironfrontier.app",
      "infoPlist": {
        "UIRequiresFullScreen": false,
        "UISupportedInterfaceOrientations": [
          "UIInterfaceOrientationPortrait",
          "UIInterfaceOrientationLandscapeLeft",
          "UIInterfaceOrientationLandscapeRight"
        ],
        "UISupportedInterfaceOrientations~ipad": [
          "UIInterfaceOrientationPortrait",
          "UIInterfaceOrientationPortraitUpsideDown",
          "UIInterfaceOrientationLandscapeLeft",
          "UIInterfaceOrientationLandscapeRight"
        ]
      },
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1c1917"
      },
      "package": "com.ironfrontier.app",
      "permissions": [],
      "versionCode": 1,
      "config": {
        "resizeableActivity": true  // Support foldables and multi-window
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-asset",
        {
          "assets": ["./assets/models", "./assets/textures"]
        }
      ],
      [
        "expo-screen-orientation",
        {
          "initialOrientation": "DEFAULT"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### EAS Build Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    },
    "types": ["jest", "@testing-library/jest-native"]
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```


## CI/CD Pipeline Design

### GitHub Actions Best Practices

**CRITICAL**: Always use latest stable versions pinned to exact SHAs, NOT major version tags:

```yaml
# ❌ WRONG - Uses major version tag (can break unexpectedly)
- uses: actions/checkout@v4
- uses: actions/setup-node@v4

# ✅ CORRECT - Pinned to exact SHA with comment showing version
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
- uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0
```

**Finding Latest Stable SHAs**:
1. Go to action's GitHub releases page
2. Find latest stable release (not pre-release)
3. Copy the commit SHA from that release
4. Add comment with version for reference

**Why Pin to SHAs**:
- Prevents unexpected breaking changes
- Ensures reproducible builds
- Security: Know exactly what code is running
- Can still update intentionally by changing SHA

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          lfs: true
      
      - uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          lfs: true
      
      - uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@5c47607acb93fed5485fdbf7232e8a31425f672a # v5.0.2
        with:
          files: ./coverage/coverage-final.json

  build-web:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test]
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          lfs: true
      
      - uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web
        run: npx expo export:web
      
      - name: Upload web build
        uses: actions/upload-artifact@6f51ac03b9356f520e9adb1b1b7802705f340c2b # v4.5.0
        with:
          name: web-build
          path: dist/
          retention-days: 7

  e2e-web:
    runs-on: ubuntu-latest
    needs: build-web
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      
      - uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Download web build
        uses: actions/download-artifact@fa0a91b85d4f404e444e00e005971372dc801d16 # v4.1.8
        with:
          name: web-build
          path: dist/
      
      - name: Serve web build
        run: |
          npx serve dist -p 8081 &
          sleep 5
      
      - name: Run Playwright tests
        run: npm run test:e2e:web
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@6f51ac03b9356f520e9adb1b1b7802705f340c2b # v4.5.0
        with:
          name: playwright-results
          path: playwright-report/
          retention-days: 7

  build-mobile:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          lfs: true
      
      - uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@4479f0b3692e25169fa71a02c30d6586ec2f5601 # v8.3.1
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build iOS
        run: eas build --platform ios --profile production --non-interactive
      
      - name: Build Android
        run: eas build --platform android --profile production --non-interactive

  deploy-web:
    runs-on: ubuntu-latest
    needs: e2e-web
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: write
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      
      - name: Download web build
        uses: actions/download-artifact@fa0a91b85d4f404e444e00e005971372dc801d16 # v4.1.8
        with:
          name: web-build
          path: dist/
      
      - name: Setup Pages
        uses: actions/configure-pages@983d7736d9b0ae728b81ab479565c72886d7745b # v5.0.0
      
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa # v3.0.1
        with:
          path: dist/
      
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e # v4.0.5

  release-android:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          lfs: true
      
      - uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@4479f0b3692e25169fa71a02c30d6586ec2f5601 # v8.3.1
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Android APKs (all architectures)
        run: |
          eas build --platform android --profile preview --non-interactive
      
      - name: Upload APKs
        uses: actions/upload-artifact@6f51ac03b9356f520e9adb1b1b7802705f340c2b # v4.5.0
        with:
          name: android-apks
          path: '*.apk'
          retention-days: 30

  release-please:
    runs-on: ubuntu-latest
    needs: [deploy-web, release-android]
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: googleapis/release-please-action@7987652d64b4581673a76e33ad5e98e3dd56832f # v4.1.3
        id: release
        with:
          release-type: node
          package-name: iron-frontier
      
      - name: Download Android APKs
        if: ${{ steps.release.outputs.release_created }}
        uses: actions/download-artifact@fa0a91b85d4f404e444e00e005971372dc801d16 # v4.1.8
        with:
          name: android-apks
          path: apks/
      
      - name: Upload APKs to Release
        if: ${{ steps.release.outputs.release_created }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh release upload ${{ steps.release.outputs.tag_name }} apks/*.apk
```

### Action Version Reference

Keep this table updated when upgrading actions:

| Action | Current Version | SHA | Last Updated |
|--------|----------------|-----|--------------|
| actions/checkout | v4.2.2 | 11bd719... | 2024-01 |
| actions/setup-node | v4.1.0 | 39370e3... | 2024-01 |
| actions/upload-artifact | v4.5.0 | 6f51ac0... | 2024-01 |
| actions/download-artifact | v4.1.8 | fa0a91b... | 2024-01 |
| actions/configure-pages | v5.0.0 | 983d773... | 2024-01 |
| actions/upload-pages-artifact | v3.0.1 | 56afc60... | 2024-01 |
| actions/deploy-pages | v4.0.5 | d6db901... | 2024-01 |
| expo/expo-github-action | v8.3.1 | 4479f0b... | 2024-01 |
| codecov/codecov-action | v5.0.2 | 5c47607... | 2024-01 |
| googleapis/release-please-action | v4.1.3 | 7987652... | 2024-01 |

### Deployment Strategy

**Web**: GitHub Pages
- Static site deployment from `dist/` directory
- Automatic deployment on main branch push
- URL: `https://<username>.github.io/iron-frontier/`

**Android**: Debug APKs via release-please
- Build APKs for all major architectures (arm64-v8a, armeabi-v7a, x86_64)
- Attach to GitHub releases automatically
- Use EAS Build preview profile for debug builds
- Production app store releases handled separately when ready

**iOS**: Development builds only (no automatic releases)
- Build via EAS for testing
- App Store releases handled manually when ready


## Migration Implementation Plan

### Phase 1: Setup New Expo Project (2-3 days)

**Goal**: Create new Expo project with proper configuration

**Tasks**:
1. Create new Expo project using tabs template
   ```bash
   npx create-expo-app iron-frontier --template tabs
   cd iron-frontier
   ```

2. Install core dependencies
   ```bash
   # Core
   npx expo install expo-router expo-screen-orientation
   
   # 3D Rendering
   npx expo install three@0.176.0 @react-three/fiber @react-three/drei
   npx expo install expo-gl expo-three expo-asset expo-file-system
   
   # State & Data
   npx expo install zustand expo-sqlite @react-native-async-storage/async-storage
   npm install sql.js zod
   
   # Styling
   npx expo install nativewind tailwindcss react-native-reanimated
   
   # Testing
   npx expo install jest-expo jest @testing-library/react-native
   npm install --save-dev playwright maestro
   ```

3. Configure Metro bundler
   - Add 3D asset extensions to `metro.config.js`
   - Enable web support in `app.json`

4. Setup NativeWind
   - Create `tailwind.config.js` with Steampunk palette
   - Configure `babel.config.js` for NativeWind

5. Configure EAS Build
   - Create `eas.json` with build profiles
   - Setup development, preview, and production builds

6. Setup Git LFS
   - Copy `.gitattributes` from old project
   - Initialize Git LFS: `git lfs install`

7. Configure responsive design
   - Setup orientation handling with `expo-screen-orientation`
   - Create layout utilities for adaptive UI
   - Configure foldable support

**Validation**:
- `expo start` launches successfully
- Web, iOS simulator, and Android emulator all work
- NativeWind classes render correctly
- EAS Build configuration validates
- Orientation changes work correctly
- Foldable emulator (Pixel Fold) transitions smoothly

---

### Phase 2: Migrate Game Logic (3-4 days)

**Goal**: Move all game logic from `packages/shared/` to `src/game/`

**Tasks**:
1. Copy directory structure
   ```bash
   cp -r ../old-project/packages/shared/src/* ./src/game/
   ```

2. Update import paths
   - Replace `@iron-frontier/shared` with relative paths
   - Update all imports in copied files
   - Use find-and-replace: `@iron-frontier/shared/` → `@/src/game/`

3. Merge Zustand stores
   - Combine `webGameStore.ts` and `mobileGameStore.ts`
   - Add platform-specific initialization
   - Create store slices for organization

4. Update database imports
   - Create platform-specific database implementations
   - Update store to use new database interface

5. Fix TypeScript errors
   - Resolve any import issues
   - Update type definitions
   - Run `npm run typecheck`

**Validation**:
- All TypeScript errors resolved
- Game logic imports work correctly
- Store initializes without errors
- Database operations work on both platforms

---

### Phase 3: Migrate 3D Rendering (4-5 days)

**Goal**: Create platform-specific Canvas wrappers and migrate scenes

**Tasks**:
1. Create Canvas wrappers
   - Implement `GameCanvas.web.tsx` with R3F
   - Implement `GameCanvas.native.tsx` with expo-gl
   - Test both implementations

2. Migrate scene components
   - Copy scenes from `apps/web/src/game/scenes/r3f/`
   - Make scenes platform-agnostic (remove R3F-specific code)
   - Create shared scene components (lights, meshes, cameras)

3. Implement asset loading
   - Create asset loading utilities
   - Use `expo-asset` for cross-platform loading
   - Test 3D model loading on web and native

4. Setup camera controls
   - Implement touch controls for mobile
   - Implement mouse controls for web
   - Test camera movement on all platforms

5. Optimize rendering
   - Implement LOD (Level of Detail)
   - Add performance monitoring
   - Test 60fps target on mid-range devices

**Validation**:
- 3D scenes render on web, iOS, and Android
- Assets load correctly on all platforms
- Camera controls work smoothly
- Performance meets 60fps target

---

### Phase 4: Migrate UI Components (3-4 days)

**Goal**: Replace shadcn/ui with React Native components

**Tasks**:
1. Create base UI components
   - Button, Card, Modal, Input
   - Use NativeWind for styling
   - Create platform-specific variants where needed

2. Migrate game UI panels
   - ActionBar, DialogueBox, InventoryPanel
   - CombatPanel, ShopPanel, QuestPanel
   - Apply Steampunk styling

3. Setup navigation
   - Configure Expo Router tabs
   - Create tab layouts
   - Implement modal navigation for panels

4. Implement responsive design
   - Test on different screen sizes
   - Add breakpoint-specific styles
   - Ensure touch targets are 44px minimum

5. Add animations
   - Use `react-native-reanimated` for transitions
   - Implement panel slide-in/out animations
   - Test performance

**Validation**:
- All UI components render correctly
- Styling matches Steampunk theme
- Navigation works on all platforms
- Responsive design works on different screen sizes
- Animations are smooth (60fps)

---

### Phase 5: Migrate Assets (1-2 days)

**Goal**: Move assets from `packages/assets/` to `assets/`

**Tasks**:
1. Copy assets
   ```bash
   cp -r ../old-project/packages/assets/* ./assets/
   ```

2. Update asset references
   - Update all `require()` statements
   - Update asset paths in code
   - Test asset loading

3. Verify Git LFS
   - Ensure all large files are tracked by LFS
   - Test `git lfs ls-files`
   - Verify assets are not in regular Git

4. Optimize assets
   - Run `expo-optimize` for images
   - Check 3D model file sizes
   - Consider compression if needed

**Validation**:
- All assets load correctly
- Git LFS tracking works
- Asset file sizes are reasonable
- No assets in regular Git (only LFS pointers)

---

### Phase 6: Migrate Tests (3-4 days)

**Goal**: Convert 203 tests from Vitest to Jest and add responsive/device tests

**Tasks**:
1. Setup Jest configuration
   - Create `jest.config.js`
   - Setup test environment
   - Configure coverage

2. Convert unit tests
   - Replace Vitest imports with Jest
   - Update test syntax (describe, it, expect)
   - Fix any compatibility issues

3. Update Playwright tests (Web Responsive)
   - Test on multiple viewport sizes (phone, tablet, desktop)
   - Test portrait and landscape orientations
   - Update URLs to Expo web server
   - Update selectors if needed
   - Test E2E flows

4. Update Maestro tests (Mobile Devices)
   - Test on all supported devices:
     - **Android**: Pixel 8A, Pixel Fold (folded/unfolded), Pixel Tablet
     - **iOS**: iPhone 17, iPad
   - Test portrait and landscape orientations
   - Test fold/unfold transitions (Pixel Fold)
   - Test rotation events
   - Update app IDs and screen selectors
   - Test mobile E2E flows

5. Add responsive design tests
   - Test adaptive UI modes (minimal, compact, full)
   - Test orientation changes
   - Test foldable transitions
   - Test touch target sizes (44x44px minimum)

6. Run all tests
   - Fix failing tests
   - Achieve 100% pass rate
   - Generate coverage report

**Validation**:
- All 203 tests pass
- Coverage meets targets (>80%)
- E2E tests work on web (all viewports)
- E2E tests work on all mobile devices
- Responsive design tests pass
- Orientation and fold transitions work correctly
- CI pipeline runs tests successfully

---

### Phase 7: Update CI/CD (2-3 days)

**Goal**: Configure CI/CD for single-app build

**Tasks**:
1. Update GitHub Actions workflows
   - Create new `ci.yml` for Expo
   - Configure EAS Build integration
   - Setup web deployment

2. Configure secrets
   - Add `EXPO_TOKEN` to GitHub secrets
   - Add `VERCEL_TOKEN` for web deployment
   - Add other required secrets

3. Test CI pipeline
   - Push to test branch
   - Verify all jobs run successfully
   - Fix any issues

4. Setup deployment
   - Configure Vercel for web
   - Setup EAS Submit for app stores
   - Test deployment process

**Validation**:
- CI pipeline runs successfully
- All platforms build without errors
- Tests run in CI
- Deployment works correctly

---

### Phase 8: Cleanup and Documentation (1-2 days)

**Goal**: Remove old code and update documentation

**Tasks**:
1. Remove old monorepo structure
   ```bash
   rm -rf apps/ packages/ pnpm-workspace.yaml
   ```

2. Update documentation
   - Update README.md
   - Update AGENTS.md
   - Update development guide
   - Update architecture docs

3. Create migration guide
   - Document changes for developers
   - List breaking changes
   - Provide upgrade instructions

4. Archive old code
   - Create Git tag: `v0.1-monorepo`
   - Push tag to remote
   - Document rollback procedure

**Validation**:
- Old code removed
- Documentation updated
- Migration guide complete
- Git tag created


## Rollback Strategy

### If Migration Fails

If critical issues arise during migration, we can rollback using:

1. **Git Tag**: Revert to `v0.1-monorepo` tag
   ```bash
   git checkout v0.1-monorepo
   git checkout -b rollback-branch
   ```

2. **Preserve Old Structure**: Keep old monorepo in separate branch
   ```bash
   git checkout -b archive/monorepo-backup
   git push origin archive/monorepo-backup
   ```

3. **Incremental Migration**: If full migration is too risky, migrate incrementally:
   - Phase 1-2: Keep both structures running
   - Phase 3-4: Gradually move features
   - Phase 5-8: Complete migration when stable

### Risk Mitigation

- **Backup before each phase**: Create Git commits after each phase
- **Test thoroughly**: Run full test suite after each phase
- **Monitor performance**: Track FPS and bundle size throughout
- **User testing**: Get feedback on each platform before proceeding

## Game Systems to Preserve

### Critical Systems (from ARCHITECTURE_V2.md & GAME_DESIGN.md)

**World Structure**:
- 6 authored towns (not procedural): Frontier's Edge, Iron Gulch, Mesa Point, Coldwater, Salvation
- 5 authored routes connecting towns
- Seamless overworld (Pokemon-style)
- 24x24 grid sectors (48x48 world units)

**Game Systems**:
- **Time System**: Real clock, 1 game hour = 2 real minutes, day/night cycle
- **Fatigue System**: Increases with travel/combat, affects combat penalties
- **Provisions System**: Food/water consumed over time, affects fatigue
- **Combat System**: Turn-based, separate screen (FF/Pokemon style)
- **Hunting Mini-game**: Oregon Trail style, replenishes provisions

**Player Progression**:
- Health: 100 base + 10 per level
- Stamina: 100 base + 5 per level
- XP scaling: 1.5x per level (Level 2: 100 XP, Level 3: 150 XP, etc.)
- 4 item rarity tiers: Common (55%), Uncommon (30%), Rare (12%), Legendary (3%)

**Control Systems**:
- Primary: Tap-to-move with pathfinding
- Secondary: Virtual joystick (optional toggle)
- Camera: Two-finger pan/rotate, pinch zoom
- Touch targets: Minimum 44x44px

**Migration Priority**:
1. Preserve all authored content (towns, routes, NPCs, quests)
2. Maintain both procedural AND authored systems
3. Keep survival mechanics (time, fatigue, provisions)
4. Preserve turn-based combat system
5. Maintain touch-first controls

## Performance Targets

### Web
- **Initial Load**: < 3 seconds on 4G
- **Bundle Size**: ≤ 10 MB (gzipped)
- **FPS**: 60fps on desktop, 30fps minimum on mobile web
- **Lighthouse Score**: > 90 for Performance

### Native (iOS/Android)
- **App Size**: < 50 MB
- **Startup Time**: < 2 seconds
- **FPS**: 60fps on mid-range devices (iPhone 11, Pixel 4)
- **Memory**: < 200 MB RAM usage

## Responsive Design & Device Support

### Supported Devices

**Android** (Local Emulators Available):
- **Pixel 8A**: 6.1" phone, 1080x2400, 20:9 aspect ratio
- **Pixel Fold**: 7.6" foldable, 1840x2208 (unfolded), 1080x2092 (folded)
- **Pixel Tablet**: 10.95" tablet, 2560x1600, 16:10 aspect ratio

**iOS** (Local Emulators Available):
- **iPhone 17**: 6.1" phone, 1179x2556, 19.5:9 aspect ratio
- **iPad**: 10.9" tablet, 1640x2360, portrait/landscape

### Orientation Support

**Portrait Mode** (Phones):
```
┌─────────────────────┐
│ [Status Bar]        │
├─────────────────────┤
│ [Minimal HUD]       │  ← Compact, essential info only
├─────────────────────┤
│                     │
│                     │
│   3D Game View      │  ← Maximum space for gameplay
│   (Vertical)        │
│                     │
│                     │
├─────────────────────┤
│ [Bottom Actions]    │  ← Thumb-optimized controls
└─────────────────────┘
```

**Landscape Mode** (Phones & Tablets):
```
┌───────────────────────────────────────────┐
│ [HUD Left]  3D Game View  [Stats Right]  │
│                                           │
│             (Horizontal)                  │
│                                           │
│         [Action Bar - Bottom]             │
└───────────────────────────────────────────┘
```

### Foldable Support (Pixel Fold)

**Folded State** (Phone Mode):
- Treat as standard phone (1080x2092)
- Portrait-optimized UI
- Compact controls

**Unfolded State** (Tablet Mode):
- Expand to tablet layout (1840x2208)
- Show additional UI panels
- Multi-column layouts
- Smooth transition animation

**Fold Event Handling**:
```tsx
// src/lib/foldable.ts
import { Dimensions } from 'react-native';
import { useEffect, useState } from 'react';

export function useFoldableState() {
  const [isFolded, setIsFolded] = useState(false);
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      // Pixel Fold: folded = ~1080 width, unfolded = ~1840 width
      const folded = window.width < 1400;
      setIsFolded(folded);
    });
    
    return () => subscription?.remove();
  }, []);
  
  return isFolded;
}

// Usage in components
function GameLayout() {
  const isFolded = useFoldableState();
  
  return isFolded ? <CompactLayout /> : <ExpandedLayout />;
}
```

### Rotation Event Handling

```tsx
// src/lib/orientation.ts
import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export type Orientation = 'portrait' | 'landscape';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  
  useEffect(() => {
    const updateOrientation = ({ window }: any) => {
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    };
    
    // Initial check
    updateOrientation({ window: Dimensions.get('window') });
    
    const subscription = Dimensions.addEventListener('change', updateOrientation);
    return () => subscription?.remove();
  }, []);
  
  return orientation;
}

// Usage
function GameScreen() {
  const orientation = useOrientation();
  
  return orientation === 'portrait' ? (
    <PortraitGameLayout />
  ) : (
    <LandscapeGameLayout />
  );
}
```

### Adaptive UI Strategy

**Space-Aware Design**:
```tsx
// src/lib/layout.ts
import { Dimensions, Platform } from 'react-native';

export interface LayoutConfig {
  deviceType: 'phone' | 'tablet' | 'foldable';
  orientation: 'portrait' | 'landscape';
  availableSpace: {
    width: number;
    height: number;
    gameViewHeight: number; // Space for 3D canvas
  };
  uiMode: 'minimal' | 'compact' | 'full';
}

export function getLayoutConfig(): LayoutConfig {
  const { width, height } = Dimensions.get('window');
  const isLandscape = width > height;
  
  // Determine device type
  let deviceType: 'phone' | 'tablet' | 'foldable' = 'phone';
  if (width > 1400 || height > 1400) {
    deviceType = 'tablet';
  } else if (width > 1200 && width < 1900) {
    deviceType = 'foldable'; // Unfolded Pixel Fold
  }
  
  // Calculate available space for game view
  const statusBarHeight = Platform.OS === 'ios' ? 44 : 24;
  const hudHeight = deviceType === 'phone' && !isLandscape ? 60 : 80;
  const actionBarHeight = 80;
  const gameViewHeight = height - statusBarHeight - hudHeight - actionBarHeight;
  
  // Determine UI mode based on available space
  let uiMode: 'minimal' | 'compact' | 'full' = 'full';
  if (deviceType === 'phone' && !isLandscape) {
    uiMode = 'minimal'; // Portrait phone: hide non-essential UI
  } else if (deviceType === 'phone' && isLandscape) {
    uiMode = 'compact'; // Landscape phone: compact UI
  }
  
  return {
    deviceType,
    orientation: isLandscape ? 'landscape' : 'portrait',
    availableSpace: { width, height, gameViewHeight },
    uiMode,
  };
}
```

**UI Mode Behaviors**:

| UI Mode | HUD | Inventory | Quest Log | Map | Settings |
|---------|-----|-----------|-----------|-----|----------|
| **Minimal** (Portrait Phone) | Essential only (HP, Gold) | Modal overlay | Modal overlay | Hidden (menu) | Hidden (menu) |
| **Compact** (Landscape Phone) | Compact bar | Side panel | Side panel | Mini-map | Menu |
| **Full** (Tablet/Foldable) | Full HUD | Side panel | Side panel | Mini-map | Menu |

**Adaptive Component Example**:
```tsx
// components/game/hud/AdaptiveHUD.tsx
import { useLayoutConfig } from '@/src/lib/layout';

export function AdaptiveHUD() {
  const { uiMode } = useLayoutConfig();
  
  switch (uiMode) {
    case 'minimal':
      return <MinimalHUD />; // HP, Gold only
    case 'compact':
      return <CompactHUD />; // HP, Gold, XP, Level
    case 'full':
      return <FullHUD />; // All stats, mini-map, quick actions
  }
}

function MinimalHUD() {
  return (
    <View className="flex-row justify-between px-4 py-2 bg-amber-950/80">
      <Text className="text-amber-100">❤️ 85/100</Text>
      <Text className="text-yellow-500">💰 245</Text>
    </View>
  );
}

function CompactHUD() {
  return (
    <View className="flex-row justify-between px-4 py-2 bg-amber-950/80">
      <View className="flex-row gap-4">
        <Text className="text-amber-100">❤️ 85/100</Text>
        <Text className="text-blue-400">⚡ 60/100</Text>
      </View>
      <View className="flex-row gap-4">
        <Text className="text-amber-300">Lv.5</Text>
        <Text className="text-yellow-500">💰 245</Text>
      </View>
    </View>
  );
}

function FullHUD() {
  return (
    <View className="flex-row justify-between px-6 py-3 bg-amber-950/90">
      <View className="flex-row gap-6">
        <StatDisplay icon="❤️" value="85/100" label="Health" />
        <StatDisplay icon="⚡" value="60/100" label="Stamina" />
        <StatDisplay icon="⭐" value="450/500" label="XP" />
      </View>
      <View className="flex-row gap-6">
        <Text className="text-amber-300 text-lg">Level 5</Text>
        <Text className="text-yellow-500 text-lg">💰 245 Gold</Text>
      </View>
    </View>
  );
}
```

### Testing Strategy

**Maestro E2E Tests** (Local Emulators):
```yaml
# __tests__/e2e/mobile/responsive.yaml
appId: com.ironfrontier.app
---
# Test on Pixel 8A (phone)
- runFlow:
    env:
      DEVICE: pixel_8a
    file: gameplay-portrait.yaml

# Test on Pixel Fold (folded)
- runFlow:
    env:
      DEVICE: pixel_fold_folded
    file: gameplay-portrait.yaml

# Test on Pixel Fold (unfolded)
- runFlow:
    env:
      DEVICE: pixel_fold_unfolded
    file: gameplay-landscape.yaml

# Test on Pixel Tablet
- runFlow:
    env:
      DEVICE: pixel_tablet
    file: gameplay-tablet.yaml

# Test rotation on phone
- runFlow:
    file: rotation-test.yaml
```

**Playwright Tests** (Responsive Web):
```ts
// __tests__/e2e/web/responsive.spec.ts
import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should adapt to phone portrait', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 17
    await page.goto('http://localhost:8081');
    
    // Should show minimal HUD
    await expect(page.locator('[data-testid="minimal-hud"]')).toBeVisible();
    await expect(page.locator('[data-testid="mini-map"]')).not.toBeVisible();
  });
  
  test('should adapt to phone landscape', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('http://localhost:8081');
    
    // Should show compact HUD
    await expect(page.locator('[data-testid="compact-hud"]')).toBeVisible();
  });
  
  test('should adapt to tablet', async ({ page }) => {
    await page.setViewportSize({ width: 1640, height: 2360 }); // iPad
    await page.goto('http://localhost:8081');
    
    // Should show full HUD
    await expect(page.locator('[data-testid="full-hud"]')).toBeVisible();
    await expect(page.locator('[data-testid="mini-map"]')).toBeVisible();
  });
  
  test('should handle rotation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:8081');
    
    // Start in portrait
    await expect(page.locator('[data-testid="minimal-hud"]')).toBeVisible();
    
    // Rotate to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(500); // Wait for transition
    
    // Should switch to compact layout
    await expect(page.locator('[data-testid="compact-hud"]')).toBeVisible();
  });
});
```

### Breakpoints & Media Queries

```tsx
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '360px',      // Small phones (portrait)
      'sm': '390px',      // Standard phones (portrait)
      'md': '768px',      // Tablets (portrait) / Phones (landscape)
      'lg': '1024px',     // Tablets (landscape)
      'xl': '1280px',     // Desktop
      'fold': '1840px',   // Pixel Fold (unfolded)
    },
  },
};

// Usage in components
<View className="
  flex-col xs:gap-2 sm:gap-3 md:gap-4
  xs:p-2 sm:p-3 md:p-4 lg:p-6
">
```

### Monitoring

Use Expo's built-in performance monitoring:

```tsx
// app/_layout.tsx
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    if (__DEV__) {
      // Monitor FPS
      const fpsMonitor = setInterval(() => {
        if (Platform.OS === 'web') {
          console.log('FPS:', performance.now());
        }
      }, 1000);

      return () => clearInterval(fpsMonitor);
    }
  }, []);

  return (
    // ... layout
  );
}
```

## Security Considerations

### API Keys and Secrets

- **Never commit secrets**: Use environment variables
- **Use Expo Secrets**: Store sensitive data in EAS Secrets
- **Rotate keys regularly**: Update API keys periodically

```bash
# Set EAS secrets
eas secret:create --scope project --name API_KEY --value "your-key"
```

### Data Protection

- **Encrypt SQLite**: Use SQLCipher for sensitive data
- **Secure storage**: Use `expo-secure-store` for tokens
- **HTTPS only**: Enforce HTTPS for all network requests

### Code Obfuscation

- **Enable Hermes**: Bytecode is harder to reverse engineer
- **ProGuard (Android)**: Obfuscate Android builds
- **Strip symbols (iOS)**: Remove debug symbols from production

## Accessibility

### WCAG 2.1 AA Compliance

- **Color Contrast**: Minimum 4.5:1 for text
- **Touch Targets**: Minimum 44x44 points
- **Screen Readers**: Support VoiceOver (iOS) and TalkBack (Android)
- **Keyboard Navigation**: Full keyboard support on web

### Implementation

```tsx
// components/ui/Button.tsx
import { Pressable, Text } from 'react-native';

export function Button({ children, onPress, accessibilityLabel }) {
  return (
    <Pressable
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || children}
      className="min-h-[44px] min-w-[44px] bg-brass-600 px-6 py-3 rounded-lg"
    >
      <Text className="text-white font-bold text-center">
        {children}
      </Text>
    </Pressable>
  );
}
```

## Internationalization (Future)

While not in scope for initial migration, prepare for i18n:

```tsx
// src/lib/i18n.ts
import { Platform } from 'react-native';
import * as Localization from 'expo-localization';

export const locale = Localization.locale;

export const translations = {
  en: {
    'game.title': 'Iron Frontier',
    'game.newGame': 'New Game',
    'game.continue': 'Continue',
  },
  es: {
    'game.title': 'Frontera de Hierro',
    'game.newGame': 'Nuevo Juego',
    'game.continue': 'Continuar',
  },
};

export function t(key: string): string {
  const lang = locale.split('-')[0];
  return translations[lang]?.[key] || translations.en[key] || key;
}
```

## Success Criteria

The migration is considered successful when:

1. ✅ All 203 tests pass with Jest
2. ✅ Web, iOS, and Android builds succeed via EAS
3. ✅ Single command (`expo start`) launches all platforms
4. ✅ 60fps maintained on all platforms
5. ✅ Bundle size ≤ 10 MB for web
6. ✅ App size < 50 MB for native
7. ✅ CI/CD pipeline runs successfully
8. ✅ No monorepo structure (single package.json)
9. ✅ All game features work identically across platforms
10. ✅ Documentation updated and complete

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Setup | 2-3 days | None |
| Phase 2: Game Logic | 3-4 days | Phase 1 |
| Phase 3: 3D Rendering | 4-5 days | Phase 2 |
| Phase 4: UI Components | 3-4 days | Phase 2 |
| Phase 5: Assets | 1-2 days | Phase 3, 4 |
| Phase 6: Tests | 3-4 days | Phase 5 |
| Phase 7: CI/CD | 2-3 days | Phase 6 |
| Phase 8: Cleanup | 1-2 days | Phase 7 |

**Total Estimated Time**: 19-27 days (4-5 weeks)

**Buffer**: Add 20% for unexpected issues = 23-32 days (5-6 weeks)

## Next Steps

1. ✅ Requirements approved
2. ✅ Design document complete
3. ⏭️ Create task list (tasks.md)
4. ⏭️ Begin Phase 1 implementation

