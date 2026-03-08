# Iron Frontier Engine Pivot Design

**Date:** 2026-03-08
**Status:** Approved — implementation in progress

## Summary

Complete pivot from Ionic Angular + Capacitor + Babylon.js isometric RPG to first-person open world Old West punk RPG built on Expo 55 + React Three Fiber + React Native Reusables.

## What We're Keeping

All pure TypeScript game logic ports directly — it has zero framework coupling:

| Layer | Files | Status |
|-------|-------|--------|
| Zustand store (12 slices) | `src/game/store/slices/` | Direct port (remove Capacitor refs) |
| Zod schemas | `src/game/data/schemas/` | Direct port |
| 14 town definitions | `src/game/data/locations/` | Direct port |
| Quest chains | `src/game/data/quests/` | Direct port |
| NPC dialogues | `src/game/data/npcs/` | Direct port |
| Enemy definitions | `src/game/data/enemies/` | Direct port |
| Item/shop data | `src/game/data/items/`, `shops/` | Direct port |
| Seeded RNG | `src/game/data/generation/seededRandom.ts` | Direct port |
| Name/NPC generators | `src/game/data/generation/generators/` | Direct port |
| Combat calculations | `src/game/data/schemas/combat.ts` | Adapt to real-time FPS |
| Game systems | `src/game/systems/` | Adapt (turn-based → real-time) |
| Hex grid system | `src/game/hex/` | Keep for world map reference |
| Tone.js audio | `src/app/game/services/audio/` | Direct port |

## What We're Porting (Not Deleting)

The Angular UI components contain real game logic and layout patterns. These are saved in `legacy/angular-ui/` and will be ported to React Native Reusables:

| Angular Component | React Native Port | Key Logic to Preserve |
|-------------------|-------------------|----------------------|
| `game-hud.component` | `components/game/GameHUD.tsx` | Health/XP bars, location name, active quest, survival stats |
| `dialogue-box.component` | `components/game/DialogueBox.tsx` | Typewriter effect, expression colors, choice selection, NPC portraits |
| `inventory-panel.component` | `components/game/InventoryPanel.tsx` | Grid layout, item categories, equipment slots, drag logic |
| `combat-panel.component` | `components/game/CombatOverlay.tsx` | Target reticle, damage numbers, weapon switch (adapted for FPS) |
| `shop-panel.component` | `components/game/ShopPanel.tsx` | Buy/sell flow, price display, inventory comparison |
| `quest-log.component` | `components/game/QuestLog.tsx` | Quest list, stage tracking, objective progress |
| `world-map.component` | `components/game/WorldMap.tsx` | Region map, town markers, route display |
| `travel-panel.component` | `components/game/TravelPanel.tsx` | Route selection, travel progress, encounter warnings |
| `character-panel.component` | `components/game/CharacterPanel.tsx` | Stats, equipment, faction reputation |
| `menu-panel.component` | `components/game/MainMenu.tsx` | Save/load, settings, quit |
| `action-bar.component` | — | Replaced by FPS virtual controls |
| `notification-feed.component` | `components/game/NotificationFeed.tsx` | Toast-style game notifications |
| `game-over-screen.component` | `components/game/GameOverScreen.tsx` | Death screen, respawn options |
| `pipe-puzzle.component` | `components/game/PipePuzzle.tsx` | Minigame logic (pipe rotation, flow check) |
| `title-screen.component` | `app/index.tsx` | Main menu, new game, continue |
| `game.page` | `app/game/index.tsx` | Canvas + HUD composition, system wiring |

**Port strategy:** Extract pure logic from each Angular component, rewrite template as React Native + NativeWind, connect to existing Zustand store via hooks.

## What's New

### 1. Procedural Geometry Engine (Zero GLBs)

All geometry built from Three.js primitives (`BoxGeometry`, `SphereGeometry`, `CylinderGeometry`, etc.) with `CanvasTexture`-based materials.

#### Building Archetypes

Parameterized renderer functions for each building type:

```
engine/archetypes/
├── Saloon.ts          # Swinging doors, bar, bottles, piano
├── Inn.ts             # Rooms, beds, check-in desk
├── SheriffOffice.ts   # Jail cells, wanted board, gun rack
├── GeneralStore.ts    # Shelves, counter, goods display
├── Blacksmith.ts      # Forge, anvil, weapon rack
├── Bank.ts            # Vault door, teller windows, safe
├── Church.ts          # Steeple, pews, bell
├── DoctorOffice.ts    # Exam table, medicine cabinet
├── Livery.ts          # Horse stalls, hay, tack
├── TelegraphOffice.ts # Desk, telegraph machine, wire
├── MiningOffice.ts    # Maps, mining equipment, scales
├── Undertaker.ts      # Coffins, embalming table
├── Newspaper.ts       # Printing press, desks
└── Barber.ts          # Chair, mirror, razor
```

Each archetype has **customization slots** (sign text, color palette, interior items, NPC positions) driven by the town definition data.

#### Chibi-Style NPCs

Built from primitive shapes with canvas-painted features:
- **Head:** Sphere (oversized, ~40% of body height) with canvas-painted face (eyes, mouth, hat)
- **Body:** Rounded box with canvas-painted clothing (vest, shirt, apron, badge)
- **Arms/Legs:** Small cylinders with simple bend animations
- **Accessories:** Hat (cylinder/cone), gun holster (small box), bag (box)

NPC appearance is driven by the existing `CharacterGenerator.ts` and archetype data — lawman, outlaw, merchant, rancher, miner, bartender, doctor, etc.

#### Chibi-Style Enemies — The Monster Factory

Enemies use the same chibi humanoid base but with **exaggerated, menacing features**:

| Enemy Type | Visual Treatment |
|-----------|-----------------|
| **Outlaws** | Same chibi base but with black duster, bandana mask, dual pistols |
| **Wildlife — Coyote** | Four-legged chibi with pointed ears, sharp teeth, glowing eyes |
| **Wildlife — Rattlesnake** | Segmented cylinders, diamond-pattern canvas texture, rattle tail |
| **Wildlife — Scorpion** | Flattened sphere body, pincer arms (curved cones), segmented tail |
| **Bandit Boss** | Oversized chibi (1.5x), scarred face texture, trophy belt |
| **Mine Crawlers** | Spider-like: dome body, 6 cylinder legs, headlamp eye |
| **Dust Devil** | Swirling cone of transparent particles, glowing core |
| **Clockwork Automaton** | Brass-colored boxes + cylinders, visible gears (rotating cylinders), steam puffs |
| **Wendigo** | Elongated chibi, antler cones on head, hollow eye sockets, frost particles |
| **Rail Wraith** | Ghostly transparent chibi, lantern (glowing sphere), chains (thin cylinders) |

The "monster factory" pattern: a base function that assembles body parts from primitives, with per-enemy-type configuration for proportions, textures, particle effects, and animation behaviors.

### 2. FPS Weapon/Tool View Models

Classic FPS view model: weapon visible at bottom-center of screen, procedurally built from primitives.

```
engine/renderers/WeaponViewModel.ts
├── Revolver     # Cylinder (barrel) + box (grip) + small cylinder (chamber) + trigger
├── Rifle        # Long cylinder (barrel) + box (stock) + scope (small cylinder)
├── Shotgun      # Double cylinder (barrels) + box (stock) + pump (cylinder)
├── Dynamite     # Cylinder (stick) + cone (fuse) + particle (spark)
├── Pickaxe      # Cylinder (handle) + flat box (head) — for mining
├── Lantern      # Wire frame (thin cylinders) + glowing sphere + chain
├── Lasso        # Torus (loop) + cylinder (rope coil)
└── Fists        # Two sphere-capped cylinders
```

**Mechanics:**
- Weapon sways with movement (linked to InputFrame velocity)
- Recoil animation on fire (kick-back + return spring)
- Reload animation (revolver: cylinder swing-out, rifle: bolt pull)
- Context-dependent: weapon switches based on situation (pickaxe near ore, lantern at night)
- View model rendered in a separate Three.js layer (fixed to camera, not affected by world lighting)

### 3. First-Person Combat (Real-Time)

Adapts existing combat calculations from turn-based to real-time:

- **Hit detection:** Raycast from camera center, checked against enemy colliders
- **Damage:** Uses existing `calculateDamage()` from `combat.ts` schema, modified for distance falloff
- **Enemy AI:** YUKA behaviors — patrol, pursue, take cover, flank
- **Weapon stats:** From `config/game/weapons.json` — damage, range, fire rate, reload time, spread
- **Player health/armor:** From existing `playerSlice` Zustand store

### 4. Universal FPS Input System

```typescript
interface InputFrame {
  move: { x: number; z: number };    // -1..1 strafe/forward
  look: { yaw: number; pitch: number }; // delta radians
  fire: boolean;
  aim: boolean;
  reload: boolean;
  interact: boolean;
  jump: boolean;
  sprint: boolean;
  inventory: boolean;
  map: boolean;
  menu: boolean;
}
```

Providers: KeyboardMouse, Touch (virtual joystick + look zone), Gamepad, Gyro, XR, AI.

### 5. Open World Terrain

- **Heightmap-based:** Canvas-generated heightmap per chunk, applied to `PlaneGeometry`
- **Biomes:** Desert (sand texture), Canyon (red rock), Mountain (grey stone), Grassland (green)
- **Vegetation:** Instanced cacti, tumbleweeds, scrub brush, dead trees
- **Roads:** Authored paths between towns, rendered as flattened strips on terrain
- **Chunk loading:** Only render terrain chunks near player (3x3 grid around current chunk)

### 6. Day/Night Cycle

- **Sky:** Gradient-sampled colors based on time-of-day (existing `time.ts` system)
- **Sun/Moon:** Directional light orbiting scene
- **Ambient:** Color temperature shifts (warm day → cool night)
- **Fireflies:** Night-time particle effect near water/vegetation
- **Player lantern:** Point light attached to camera, activated at night
- **NPC schedules:** Existing schedule templates drive NPC location by time

### 7. Two-Layer Rendering Architecture

```
┌─────────────────────────────────────┐
│     React Native UI Layer           │  ← NativeWind + React Native Reusables
│  (HUD, dialogue, inventory, menus)  │  ← Zustand hooks for state
│                                     │  ← Animated with react-native-reanimated
├─────────────────────────────────────┤
│     R3F Canvas Layer                │  ← Three.js WebGPU renderer
│  (3D world, NPCs, terrain, sky)     │  ← Miniplex ECS for dynamic entities
│  (weapon viewmodel, particles)      │  ← Rapier physics
│                                     │  ← YUKA AI behaviors
└─────────────────────────────────────┘
```

On XR: UI layer renders as world-space panels (VRHUDLayer pattern from will-it-blow).

## Visual Identity

**Art style:** "Desert Toy Theater" — everything looks like a handcrafted toy diorama of the Old West.

- Warm color palette: dust, rust, brass, copper, leather, gunmetal, whiskey
- Canvas textures painted with visible brush strokes (not photorealistic)
- Oversized chibi characters in a world of blocky primitive buildings
- Dramatic shadows from the harsh desert sun
- Night scenes lit by warm lamplight with long shadows
- Weather: dust storms (particle system), heat shimmer (post-process distortion)

## Implementation Order

1. **Expo Router entry points** — `app/_layout.tsx`, `app/index.tsx`, `app/game/index.tsx`
2. **R3F Canvas setup** — Basic scene with camera, lighting, sky gradient
3. **Input system** — InputManager + KeyboardMouse + Touch providers
4. **Terrain renderer** — Single chunk heightmap with desert texture
5. **Building archetypes** — Saloon first, then generalize pattern
6. **Chibi NPC renderer** — Base humanoid from primitives
7. **Weapon view model** — Revolver first
8. **Port UI components** — HUD, dialogue, inventory (from legacy/angular-ui/)
9. **Wire Zustand store** — Connect ported slices to new UI + 3D scene
10. **Combat system** — Raycast shooting, damage, enemy AI
11. **Open world** — Multi-chunk terrain, town placement, travel
12. **Day/night cycle** — Sky gradient, lighting, NPC schedules
13. **Quest system wiring** — Connect existing quest data to new UI
14. **Enemy monster factory** — Build enemy type renderers
15. **Audio integration** — Wire existing Tone.js managers to game events

## Files Removed (Angular/Ionic/Capacitor)

- Config: `angular.json`, `ionic.config.json`, `capacitor.config.ts`, `karma.conf.js`, `tsconfig.app.json`, `tsconfig.spec.json`, `.eslintrc.json`, `postcss.config.cjs`, `tailwind.config.cjs`
- Entry: `src/main.ts`, `src/index.html`, `src/polyfills.ts`, `src/global.scss`, `src/test.ts`
- Angular bootstrap: `src/app/app.component.*`, `src/app/app.module.ts`, `src/app/app-routing.module.ts`
- Angular UI: All `src/app/game/ui/*.component.*`, `src/app/game/screens/*`, `src/app/game/game.page.*`, `src/app/lookdev/*`
- Angular services: `src/app/game/services/game-store.service.ts`, `src/app/game/services/index.ts`
- Build output: `electron/`, `www/`
- Babylon: `src/engine/`, `src/game/rendering/adapters/BabylonAdapter.ts`
- Stale docs: `MIGRATION.md`, `STATUS.md`

## Files Preserved for Porting

Angular UI component source saved to `legacy/angular-ui/` for reference during React Native port.
