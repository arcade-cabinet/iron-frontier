# CLAUDE.md -- Iron Frontier

## Mandatory Workflow: Docs > Tests > Code

**This is the single most important rule in the project.** Every agent session must follow this pipeline:

```
GAME_SPEC.md  ->  *.test.ts  ->  *.ts  ->  wire to game loop  ->  update spec status
```

1. **Nothing is implemented without a spec section.** If you want to build something, write it in `docs/GAME_SPEC.md` first.
2. **Nothing is specced without tests.** Before writing implementation code, write tests that reference the spec section.
3. **Nothing is tested without implementation.** Make the tests pass.
4. **Nothing is implemented without being wired up.** Connect to the game loop, UI, or store.

See `.claude/skills/docs-first-pipeline.md` for the full workflow.

### When the user gives you a concept or story:
1. Translate it to a spec section in `docs/GAME_SPEC.md`
2. **DO NOT write code.** Stop after the spec.

### When you're implementing a specced section:
1. Read the spec section
2. Write tests first (each test references the spec section number)
3. Write implementation
4. Wire it up
5. Update spec status

### When you're fixing a bug:
1. Find the spec section -- what should happen?
2. Write a failing test
3. Fix the code
4. If the spec was wrong, fix the spec too

---

## Project Identity

**Iron Frontier** is a first-person open world Old West punk RPG. Mobile-first native app (landscape-primary), built with Expo and React Three Fiber. The player is a mysterious gunslinger with a conjurable appearance, exploring 14 hand-crafted towns connected by authored open world terrain.

**Tagline:** *"The frontier doesn't forgive. Neither do you."*

**Perspective:** First-person with procedural weapon model. Real-time FPS combat against outlaws, wildlife, and faction enemies. Every weapon, building, NPC, and terrain feature is procedurally constructed from Three.js primitives and canvas textures -- zero GLB models.

**World:** 14 towns (Dusty Gulch, Coppertown, Junction City, Rattlesnake Canyon, etc.) connected by authored routes through desert, canyon, and mountain terrain. Each town has authored buildings, NPCs, quest chains, shops, and faction presence. The world is deterministic -- not procedurally generated.

**Architecture patterns** are fully documented in `docs/` -- game design, architecture, branding, UI components. No need to reference external codebases.

---

## Hard Rules

These are non-negotiable. The `.claude/hooks/` directory enforces several automatically.

| Rule | Enforced by | Details |
|------|-------------|---------|
| Spec before code | `spec-coverage-check.sh` | Every game system file needs a GAME_SPEC.md section |
| No file over 300 lines | `file-size-sentinel.sh` | Decompose into subpackage with index.ts barrel |
| No Math.random() | `no-math-random.sh` | Use `scopedRNG(scope, worldSeed, ...extra)` from seeded RNG utils |
| No inline tuning constants | `no-magic-numbers.sh` | Put numbers in `config/game/*.json`, load at runtime |
| Quality gate on commit | `pre-commit-quality.sh` | `lint + tsc + test` must pass before any git commit |
| No placeholders/fallbacks | manual | If a feature is missing, hard-error. Never mask incomplete work with stubs. |
| Mobile-first | manual | 375px minimum viewport, 44px touch targets |
| Named exports only | manual | Never `export default` |
| pnpm only | manual | Never npm or yarn |
| Biome only | manual | Never ESLint or Prettier |
| Zero GLBs | manual | All geometry is procedural (Three.js primitives + canvas textures) |
| Authored world | manual | No seeded random for world layout -- world is deterministic |
| Seeded RNG for variation only | manual | Texture noise, NPC appearance variety, encounter rolls |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 55 (New Architecture required) |
| Runtime | React 19, React Native 0.83 |
| 3D Engine | React Three Fiber 9 + drei 10 |
| Physics | @react-three/rapier |
| ECS | Miniplex 2.x (dynamic entities only -- NPCs, projectiles, pickups) |
| State | Zustand 5 (10+ store slices) |
| Schemas | Zod 4 (runtime validation) |
| AI/Behavior | Yuka 0.7 |
| Audio | Tone.js |
| UI Components | React Native Reusables (shadcn/ui port) |
| Styling | NativeWind 4 + Tailwind CSS 3 |
| Language | TypeScript 5.9, strict mode |
| Lint/Fmt | Biome 2.4 |
| Testing | Jest + Maestro (mobile E2E) + Playwright (web E2E) |
| Package Mgr | pnpm |

---

## Common Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Expo dev server
pnpm android          # Run on Android
pnpm ios              # Run on iOS
pnpm web              # Run on web
pnpm test             # Run tests (Jest)
pnpm test:e2e         # Playwright web E2E
pnpm test:maestro     # Maestro mobile E2E
pnpm lint             # Biome lint + format check
pnpm format           # Biome format (write)
pnpm check            # Full check (lint + format, write fixes)
npx tsc --noEmit      # TypeScript type check
```

---

## Architecture

### State Split: ECS vs Zustand

- **ECS (Miniplex):** Dynamic runtime entities only -- NPCs, projectiles, pickups, active enemies. Lives in memory.
- **Zustand:** All player and game state -- inventory, quests, combat, dialogue, travel, settings, UI. Persisted via storage adapter. 12 slices: core, player, combat, dialogue, inventory, quest, shop, travel, puzzle, settings, UI.
- **Rule:** If it's a dynamic entity that spawns/despawns, it belongs in ECS. Everything else belongs in Zustand store slices.

### Procedural Geometry Engine (Zero GLBs)

All visual content is constructed at runtime from Three.js primitives and canvas textures. No GLB, GLTF, or OBJ models are loaded.

- **Building archetypes** -- Parameterized renderers (Saloon, Inn, SheriffOffice, GeneralStore, etc.) that construct geometry from boxes, cylinders, and planes with canvas-painted textures.
- **Chibi-style NPCs** -- Built from primitive shapes (spheres, capsules, boxes) with canvas-painted features.
- **Weapon models** -- Procedural revolvers, rifles, shotguns from cylinders and boxes.
- **Terrain** -- Heightmap-based with canvas textures for desert, canyon, mountain biomes.
- **Vegetation** -- Instanced cacti, tumbleweeds, scrub from primitives.

### 3D Scene (R3F Declarative)

The scene uses React Three Fiber components inside an R3F `<Canvas>`. NOT imperative Three.js calls.

- `components/scene/` -- Camera, Lighting, Sky, Terrain
- `components/entities/` -- NPC meshes, projectiles, pickups
- `components/game/` -- HUD, menus, dialogue, inventory (React Native UI)
- `engine/` -- Pure Three.js procedural rendering code (no React coupling)

### Input System (Universal FPS)

```
InputManager (singleton)
  -> KeyboardMouseProvider (desktop: WASD + mouse look)
  -> TouchProvider (mobile: joystick + look zone + buttons)
  -> GamepadProvider (controller)
  -> GyroProvider (mobile tilt aiming)
  -> XRProvider (VR/AR controllers)
  -> AIProvider (autoplay/testing governor)
```

Game code reads an `InputFrame` per tick. Never reads raw events.

### Systems are Pure Functions

```typescript
(world: World, deltaTime: number, ...context: unknown[]) => void
```

Config from `config/game/*.json`. Randomness from `scopedRNG`. No side effects beyond ECS mutations and store updates.

### World is Authored, Not Generated

- 14 towns with exact building placement, NPC rosters, shop inventories, quest hooks
- Town files in `src/game/data/locations/` define complete town data
- World map in `src/game/data/worlds/frontier_territory.ts` defines region layout and connections
- Routes between towns are authored paths, not procedural
- Seeded RNG used only for visual variation (texture noise, NPC appearance shuffling, encounter rolls)

---

## Project Structure

```
iron-frontier/
├── CLAUDE.md                         # This file -- governs all agent behavior
├── .claude/                          # Agent infrastructure
│   ├── settings.json                 # Hook configuration
│   ├── hooks/                        # Automatic quality gates
│   │   ├── pre-commit-quality.sh     # Blocks commit without lint+tsc+test
│   │   ├── spec-coverage-check.sh    # Warns: system file without spec section
│   │   ├── no-magic-numbers.sh       # Warns: inline const UPPER = number
│   │   ├── file-size-sentinel.sh     # Warns: file over 300 lines
│   │   └── no-math-random.sh         # Warns: Math.random() in game code
│   ├── agents/                       # Specialized agent roles
│   │   ├── spec-writer.md            # ONLY writes GAME_SPEC.md -- no code
│   │   ├── system-designer.md        # Designs game systems (docs > tests > code)
│   │   ├── scene-builder.md          # Builds R3F 3D scene + procedural engine
│   │   ├── ui-builder.md             # Builds HUD, mobile-first, brand-aligned
│   │   └── playtest-governor.md      # Validates game is playable end-to-end
│   ├── commands/                     # Slash commands
│   │   ├── add-system.md             # /add-system: docs > tests > code workflow
│   │   ├── spec-idea.md              # /spec-idea: concept -> spec (no code)
│   │   └── audit-game.md             # /audit-game: full playability audit
│   └── skills/                       # Repeatable pipelines
│       └── docs-first-pipeline.md    # The mandatory workflow
├── docs/                             # Game design and architecture
│   ├── GAME_SPEC.md                  # SINGLE SOURCE OF TRUTH for game design
│   ├── GAME_DESIGN.md                # Game design document (legacy)
│   ├── ARCHITECTURE.md               # System architecture
│   ├── BRANDING.md                   # Visual identity and style guide
│   ├── UI_COMPONENTS.md              # UI component reference
│   └── plans/                        # Design documents
├── config/                           # JSON config (all tuning values here)
│   └── game/                         # Game balance data
│       ├── weapons.json              # Weapon stats, ranges, damage
│       ├── enemies.json              # Enemy types, HP, behavior
│       ├── encounters.json           # Encounter tables, probabilities
│       ├── difficulty.json           # Difficulty multipliers
│       ├── factions.json             # Faction reputation thresholds
│       ├── npcs.json                 # NPC template definitions
│       ├── dialogues.json            # Dialogue trees
│       ├── quests.json               # Quest chain definitions
│       ├── items.json                # Item catalog (weapons, consumables, gear)
│       ├── shops.json                # Shop inventories per town
│       ├── survival.json             # Fatigue, provisions, camping
│       └── time.json                 # Day/night cycle, time multipliers
├── app/                              # Expo Router screens
│   ├── _layout.tsx                   # Root layout
│   ├── index.tsx                     # Main menu
│   └── game/
│       └── index.tsx                 # Game screen (Canvas + HUD)
├── components/                       # React Native + R3F components
│   ├── ui/                           # React Native Reusables base components
│   ├── game/                         # Game UI (HUD, dialogue, inventory, shops)
│   ├── scene/                        # R3F scene (Camera, Lighting, Sky, Terrain)
│   └── entities/                     # R3F entities (NPCs, projectiles, pickups)
├── engine/                           # Procedural rendering engine (pure Three.js)
│   ├── archetypes/                   # Building archetypes (Saloon, Inn, etc.)
│   ├── renderers/                    # Terrain, vegetation, sky, weapon renderers
│   ├── materials/                    # Canvas texture factories
│   └── spatial/                      # Spatial hashing, chunk management
├── src/game/                         # Game logic (engine-agnostic, existing code)
│   ├── data/                         # Schemas, authored content
│   │   ├── schemas/                  # Zod schemas (combat, npc, quest, world, etc.)
│   │   ├── worlds/                   # World map (frontier_territory.ts)
│   │   ├── locations/                # 14 town definitions (exact buildings, NPCs)
│   │   ├── towns/                    # Town rendering data
│   │   ├── npcs/                     # NPC dialogues and data
│   │   ├── quests/                   # Quest chain definitions
│   │   ├── items/                    # Item and world item data
│   │   ├── enemies/                  # Enemy type definitions
│   │   ├── shops/                    # Shop inventory data
│   │   ├── assemblages/              # ECS entity templates
│   │   └── generation/               # Name generators, template pools
│   ├── store/                        # Zustand store
│   │   ├── createGameStore.ts        # Store factory
│   │   ├── slices/                   # 12 slices (core, player, combat, etc.)
│   │   ├── defaults.ts              # Default state values
│   │   ├── persistStorage.ts        # Persistence adapter
│   │   └── types.ts                 # Store type definitions
│   ├── systems/                      # Game systems
│   │   ├── combat/                   # Combat engine (damage, AI, store)
│   │   ├── EncounterSystem.ts        # Random encounter logic
│   │   ├── ZoneSystem.ts             # Zone transitions
│   │   ├── SpatialHash.ts            # Spatial indexing
│   │   ├── SaveSystem.ts             # Save/load
│   │   ├── CollisionSystem.ts        # Collision detection
│   │   ├── time.ts                   # Day/night cycle
│   │   ├── fatigue.ts                # Fatigue system
│   │   ├── provisions.ts             # Food/water survival
│   │   ├── camping.ts                # Rest/camp system
│   │   └── survivalStore.ts          # Survival state
│   ├── generation/                   # Procedural content
│   │   └── CharacterGenerator.ts     # NPC appearance generation
│   ├── engine/                       # Game engine subsystems
│   │   ├── ai/                       # Yuka NPC AI
│   │   ├── rendering/                # Rendering adapters
│   │   ├── terrain/                  # Terrain generation
│   │   ├── hex/                      # Hex grid system
│   │   ├── physics/                  # Physics integration
│   │   └── assets/                   # Asset management
│   ├── rendering/                    # Scene manager and adapters
│   ├── services/                     # Game services (TravelService)
│   ├── hex/                          # Hex coordinate system
│   ├── ddl/                          # Data definition layer
│   ├── puzzles/                      # Puzzle minigames (pipe-fitter)
│   └── lib/                          # Pure utilities
├── input/                            # Universal FPS input system
│   ├── InputManager.ts
│   ├── InputActions.ts
│   └── providers/                    # Keyboard, touch, gamepad, gyro, XR, AI
├── ecs/                              # Miniplex ECS (dynamic entities only)
├── assets/                           # Fonts, sounds, textures (NO GLB models)
├── tests/                            # Test suites
│   └── e2e/                          # Playwright E2E tests
├── scripts/                          # Build and content generation scripts
├── memory-bank/                      # AI agent context files
└── .maestro/                         # Maestro mobile E2E test flows
```

---

## Agent Infrastructure

### Agents (`.claude/agents/`)

| Agent | Role | When to use |
|-------|------|-------------|
| `spec-writer` | Translates concepts to GAME_SPEC.md sections | User gives a gameplay idea |
| `system-designer` | Implements systems: spec > tests > code > wire | Building a new game system |
| `scene-builder` | Builds R3F 3D scene + procedural engine components | 3D rendering, building archetypes, terrain |
| `ui-builder` | Builds HUD and UI components (React Native Reusables) | UI work, mobile-first |
| `playtest-governor` | Validates game is playable end-to-end | After changes, before merge |

### Commands (`.claude/commands/`)

| Command | Purpose |
|---------|---------|
| `/spec-idea <concept>` | Turn a gameplay concept into a spec section (no code) |
| `/add-system <name>` | Build a system following docs > tests > code |
| `/audit-game` | Full playability audit |

### Hooks (`.claude/hooks/`)

Hooks run automatically on tool use. They cannot be bypassed. They catch:
- Commits without passing quality checks
- Game system files without spec coverage
- Inline tuning constants that should be in JSON config
- Files over 300 lines
- Math.random() in game code

---

## Key Files to Read First

When starting any work session:

1. `docs/GAME_SPEC.md` -- Single source of truth for game design
2. `src/game/data/worlds/frontier_territory.ts` -- World map and region layout
3. `src/game/data/locations/` -- 14 town definitions (buildings, NPCs, connections)
4. `src/game/data/quests/index.ts` -- Quest chain definitions
5. `src/game/store/createGameStore.ts` -- Zustand store factory
6. `src/game/store/slices/` -- 12 store slices (core, player, combat, etc.)
7. `src/game/data/schemas/` -- Zod schemas for all game data
8. `config/game/` -- JSON tuning files (weapons, difficulty, encounters, etc.)

---

## Performance Budgets

| Metric | Target |
|--------|--------|
| FPS (mobile) | >= 55 |
| FPS (desktop) | >= 60 |
| Time to interactive | < 3s |
| Memory (mobile) | < 100 MB |
| Draw calls | < 100 |

### Key Optimizations

- Zero GLB loading = instant scene construction from primitives
- Instanced meshes for repeated elements (cacti, rocks, fence posts) via drei `<Instances>`
- Spatial hashing for entity culling (`SpatialHash.ts`)
- Freeze world matrices on static building geometry
- Canvas textures cached per archetype (not regenerated per frame)
- Code splitting via Expo Router
- No barrel imports from Three.js -- import specific modules
- Chunk-based terrain loading for open world (only render nearby chunks)

---

## Testing

Test files live adjacent to source: `*.test.ts(x)`, or in `__tests__/` directories.

Write tests first. Each test references its GAME_SPEC.md section number:

```typescript
// combat.test.ts
describe('Combat System (Spec 7)', () => {
  it('should calculate damage with weapon stats and distance falloff', () => {
    // ...
  });
});
```

---

## Mobile-First Checklist

Before merging any UI change:

- [ ] Renders correctly at 375px width (iPhone SE)
- [ ] Touch targets >= 44px
- [ ] No overlap with HUD elements or virtual controls
- [ ] No horizontal scroll on mobile
- [ ] Text readable without zooming (minimum 14px body)
- [ ] Dialogs don't extend beyond viewport
- [ ] Animations respect `prefers-reduced-motion`
- [ ] FPS >= 55 on mid-range mobile
- [ ] Virtual joystick and action buttons don't obstruct gameplay view

---

## Store Slices Reference

The Zustand store is split into 12 slices in `src/game/store/slices/`:

| Slice | Responsibility |
|-------|---------------|
| `coreSlice` | Game phase, world seed, current location, time |
| `playerSlice` | HP, stats, level, XP, faction reputation |
| `combatSlice` | Active combat state, turn order, targeting |
| `dialogueSlice` | Active dialogue, NPC speaker, choice history |
| `inventorySlice` | Items, equipment, currency |
| `questSlice` | Active/completed quests, objectives, rewards |
| `shopSlice` | Shop UI state, transaction history |
| `travelSlice` | Current route, travel progress, encounters |
| `puzzleSlice` | Active puzzle state (pipe-fitter minigame) |
| `settingsSlice` | Audio, graphics, control preferences |
| `uiSlice` | Menu state, modal stack, notifications |

---

## Town Data Reference

14 authored towns in `src/game/data/locations/`:

| Town | File | Theme |
|------|------|-------|
| Dusty Gulch | `dusty_gulch.ts` | Starting town |
| Coppertown | `coppertown.ts` | Mining settlement |
| Junction City | `junction_city.ts` | Railroad hub |
| Rattlesnake Canyon | `rattlesnake_canyon.ts` | Outlaw territory |
| Copper Mine | `copper_mine.ts` | Industrial mine |
| Desert Waystation | `desert_waystation.ts` | Remote outpost |
| Dusty Springs | `dusty_springs.ts` | Oasis town |
| Freeminer Hollow | `freeminer_hollow.ts` | Independent miners |
| Old Works | `old_works.ts` | Abandoned factory |
| Prospect | `prospect.ts` | Gold rush town |
| Signal Rock | `signal_rock.ts` | Telegraph station |
| Sunset Ranch | `sunset_ranch.ts` | Cattle ranch |
| Thornwood Station | `thornwood_station.ts` | Forest outpost |
| Test Town | `test_town.ts` | Development/testing |

---

## Anti-Patterns (things that cause spot-welding)

- Writing code without checking the spec
- Creating a system without a test file
- Hardcoding tuning values instead of using `config/game/*.json`
- Using `Math.random()` instead of `scopedRNG`
- Making files over 300 lines instead of decomposing
- Loading GLB models (everything must be procedural geometry)
- Using fallback/placeholder rendering instead of hard-erroring
- Treating random generation as a substitute for authored content (towns, quests, world layout are hand-crafted)
- Implementing a feature across multiple sessions without updating the spec
- Assuming a system works because code exists (it might not be wired up)
- Rushing to fix ONE thing instead of addressing the structural problem
- Treating the codebase as the source of truth instead of the spec
- Using placeholder boxes, stub data, or fallback paths that mask missing work
- Creating a "fallback" instead of hard-erroring when a feature is incomplete
