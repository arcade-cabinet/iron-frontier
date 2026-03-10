# Iron Frontier - Game Specification

> **Single Source of Truth** for game design and implementation status.
> Every game system must have a section here before code is written.

## Status Legend

| Tag | Meaning |
|-----|---------|
| `[WIRED]` | Fully implemented, tested, and connected to the game loop |
| `[IN PROGRESS]` | Partially implemented -- code exists but not fully wired or missing UI |
| `[PLANNED]` | Specced but no implementation yet |

---

## Table of Contents

1. [Core Game Loop](#1-core-game-loop)
2. [Player / Character](#2-player--character)
3. [Input System](#3-input-system)
4. [Inventory System](#4-inventory-system)
5. [Shop System](#5-shop-system)
6. [Quest System](#6-quest-system)
7. [Combat System](#7-combat-system)
8. [Encounter System](#8-encounter-system)
9. [Loot System](#9-loot-system)
10. [Dialogue System](#10-dialogue-system)
11. [Travel System](#11-travel-system)
12. [NPC Movement & Schedules](#12-npc-movement--schedules)
13. [Stealth System](#13-stealth-system)
14. [Survival Systems](#14-survival-systems)
15. [Day/Night Cycle](#15-daynight-cycle)
16. [Save/Load System](#16-saveload-system)
17. [Audio System](#17-audio-system)
18. [Terrain & Open World](#18-terrain--open-world)
19. [Procedural Buildings](#19-procedural-buildings)
20. [Building Interiors](#20-building-interiors)
21. [World Map & Locations](#21-world-map--locations)
22. [Procedural Generation](#22-procedural-generation)
23. [Faction Reputation](#23-faction-reputation)
24. [Crafting System](#24-crafting-system)
25. [Weather System](#25-weather-system)
26. [Puzzle Minigames](#26-puzzle-minigames)
27. [Vehicles & Mounts](#27-vehicles--mounts)
28. [Companion System](#28-companion-system)
29. [Multiplayer](#29-multiplayer)

---

## 1. Core Game Loop [WIRED]

The core game loop runs via `GameOrchestrator` at ~10 Hz, managing all system ticks.

### Description

The player explores 14 hand-crafted towns connected by authored routes through desert, canyon, and mountain terrain. The loop is: **Explore > Collect > Talk > Fight > Improve > Unlock > Repeat.**

### Files

- `src/game/GameOrchestrator.ts` -- central lifecycle manager, runs game loop
- `app/game/index.tsx` -- game screen (Canvas + HUD)
- `app/index.tsx` -- main menu / title screen

### Acceptance Criteria

- [x] GameOrchestrator runs tick loop at ~10 Hz
- [x] Game phases: `title > loading > playing > paused > dialogue > combat > game_over`
- [x] Title -> New Game / Continue / Load -> gameplay flow
- [x] Game over -> respawn / load / title flow
- [x] All systems tick from orchestrator (survival, encounters, NPC movement)
- [x] Store slices manage all persistent state

---

## 2. Player / Character [WIRED]

### Description

The player is a first-person gunslinger with conjurable appearance. Stats include HP, level, XP, faction reputation. Character appearance is procedurally generated from seeds.

### Files

- `src/game/store/slices/playerSlice.ts` -- HP, stats, level, XP, faction reputation
- `src/game/store/slices/coreSlice.ts` -- game phase, world seed, current location, time
- `src/game/data/schemas/npc.ts` -- CharacterAppearance schema
- `engine/physics/PlayerController.ts` -- first-person movement and physics
- `components/game/PlayerVitals.tsx` -- HP/stamina HUD display
- `components/game/CharacterPanel.tsx` -- stats and equipment UI

### Acceptance Criteria

- [x] Player has HP, maxHP, level, XP, faction reputation
- [x] XP scales at 1.5x per level
- [x] Player position tracked in 3D world space
- [x] First-person camera with physics-based movement
- [x] Player vitals displayed in Fallout-style HUD
- [x] Character panel shows stats and equipment
- [x] Player spawns at correct world position (2120, 0, 1798)

---

## 3. Input System [WIRED]

### Description

Universal FPS input system with pluggable providers. Game code reads an `InputFrame` per tick -- never raw events.

### Files

- `src/game/input/InputManager.ts` -- singleton manager
- `src/game/input/InputFrame.ts` -- per-tick input snapshot
- `src/game/input/InputActions.ts` -- action enum definitions
- `src/game/input/providers/KeyboardMouseProvider.ts` -- desktop: WASD + mouse look
- `src/game/input/providers/TouchProvider.ts` -- mobile: joystick + look zone + buttons
- `src/game/input/providers/GamepadProvider.ts` -- controller support
- `src/game/input/providers/GyroProvider.ts` -- mobile tilt aiming
- `src/game/input/providers/XRControllerProvider.ts` -- VR/AR controllers
- `src/game/input/providers/AIProvider.ts` -- autoplay/testing governor

### Acceptance Criteria

- [x] InputManager aggregates all providers into single InputFrame
- [x] KeyboardMouseProvider handles WASD movement + mouse look
- [x] TouchProvider handles virtual joystick + look zone
- [x] GamepadProvider handles controller input
- [x] GyroProvider handles tilt aiming
- [x] XRControllerProvider handles VR/AR input
- [x] AIProvider enables automated testing
- [x] Game code reads InputFrame, never raw events

---

## 4. Inventory System [WIRED]

### Description

Grid-based inventory with item categories, stacking, use/drop actions, and currency tracking.

### Files

- `src/game/store/slices/inventorySlice.ts` -- items, equipment, currency
- `src/game/data/items/index.ts` -- item catalog
- `src/game/data/items/worldItems.ts` -- world-placed items per location
- `src/game/data/schemas/item.ts` -- Zod item schemas
- `components/game/InventoryPanel.tsx` -- inventory UI
- `config/game/items.json` -- item definitions

### Acceptance Criteria

- [x] Add/remove/stack items in inventory
- [x] Use consumables (bandages, tonics)
- [x] Drop items from inventory
- [x] Track currency (gold)
- [x] Item rarity tiers: common, uncommon, rare, legendary
- [x] World items populate on location arrival
- [x] Inventory panel UI with categories and filters

---

## 5. Shop System [WIRED]

### Description

Buy/sell interface at general stores and specialized shops. Each town has authored shop inventories.

### Files

- `src/game/store/slices/shopSlice.ts` -- shop UI state, transaction history
- `src/game/data/schemas/item.ts` -- item pricing schemas
- `components/game/ShopPanel.tsx` -- buy/sell UI
- `config/game/shops.json` -- shop inventories per town

### Acceptance Criteria

- [x] Open shop panel at merchant NPCs
- [x] Buy items with gold
- [x] Sell items for gold
- [x] Shop inventories vary by town
- [x] Transaction history tracked

---

## 6. Quest System [WIRED]

### Description

Multi-step quest chains with objectives, NPC interactions, and rewards. 4 authored quests: main_the_inheritance, main_the_reclamation, side_missing_cattle, side_docs_dilemma.

### Files

- `src/game/store/slices/questSlice.ts` -- active/completed quests, objectives, rewards
- `src/game/data/quests/index.ts` -- quest chain definitions
- `src/game/systems/DialogueQuestBridge.ts` -- dialogue-to-quest wiring
- `src/game/systems/QuestEvents.ts` -- quest event handlers
- `src/game/systems/QuestMarkerSystem.ts` -- 3D spatial quest tracking
- `src/game/systems/QuestWiring.ts` -- quest completion wiring
- `components/game/QuestLog.tsx` -- quest log UI
- `config/game/quests.json` -- quest definitions

### Acceptance Criteria

- [x] Accept quests from NPC dialogue
- [x] Multi-step objectives with tracking
- [x] Quest completion with XP/gold/item rewards
- [x] Quest log UI with active/completed tabs
- [x] DialogueQuestBridge connects dialogue choices to quest progression
- [x] 3D quest markers show objective locations in world
- [x] Quest NPC IDs match actual NPC IDs (verified: sheriff_cole, not npc_sheriff_cole)

---

## 7. Combat System [WIRED]

### Description

Dual-mode combat: real-time FPS (R3F useFrame) and turn-based engine. 5 skill actions: Quick Draw, Aimed Shot, Overwatch, First Aid, Intimidate. 7 procedural weapon models.

### Files

- `src/game/systems/combat/engine.ts` -- turn-based combat engine
- `src/game/systems/combat/ai.ts` -- enemy AI decision-making
- `src/game/systems/combat/damage.ts` -- damage calculation with distance falloff
- `src/game/systems/combat/store.ts` -- combat state management
- `src/game/systems/combat/types.ts` -- combat type definitions
- `src/game/store/slices/combatSlice.ts` -- active combat state, turn order, targeting
- `src/game/data/schemas/combat.ts` -- combat Zod schemas
- `components/scene/CombatSystem.tsx` -- R3F real-time FPS combat
- `components/scene/WeaponView.tsx` -- first-person weapon model
- `src/game/engine/renderers/WeaponViewModel.ts` -- procedural weapon construction
- `src/game/engine/renderers/weapons/` -- Revolver, Rifle, Shotgun, Dynamite, Lasso, Pickaxe, Lantern
- `config/game/weapons.json` -- weapon stats, ranges, damage
- `config/game/enemies.json` -- enemy types, HP, behavior

### Acceptance Criteria

- [x] Real-time FPS combat via R3F useFrame loop
- [x] Turn-based engine with initiative and turn order
- [x] 5 skill actions with unique effects
- [x] Damage calculation with weapon stats and distance falloff
- [x] Enemy AI selects actions based on situation
- [x] 7 procedural weapon models (Revolver, Rifle, Shotgun, Dynamite, Lasso, Pickaxe, Lantern)
- [x] Weapon view model renders in first person
- [x] Combat values balanced for real-time 3D FPS gameplay
- [x] AmmoDisplay shows current weapon ammo in HUD

---

## 8. Encounter System [WIRED]

### Description

`encounterBridge.ts` converts procedural encounters to combat. Travel encounter probability formula uses biome-specific tables. 40+ encounter templates organized by biome.

### Files

- `src/game/systems/EncounterSystem.ts` -- random encounter logic
- `src/game/data/generation/generators/encounterGenerator.ts` -- procedural encounter generation
- `src/game/data/generation/templates/encounterTemplates.ts` -- 40+ biome-organized encounter templates
- `config/game/encounters.json` -- encounter tables, probabilities
- `config/game/difficulty.json` -- difficulty multipliers

### Acceptance Criteria

- [x] Encounters trigger during travel based on probability formula
- [x] Biome-specific encounter tables (desert, canyon, mountain, plains)
- [x] encounterBridge converts procedural encounters to combat format
- [x] Travel resolver wired to encounter system
- [x] Difficulty scaling affects encounter parameters
- [x] 40+ encounter templates across biome zones

---

## 9. Loot System [WIRED]

### Description

14 loot tables covering all enemy types. Drop rates structured as common/uncommon/rare/guaranteed tiers. Loot rolls on enemy defeat.

### Files

- `src/game/data/loot/lootTables.ts` -- 14 loot tables (bandit, copperhead, ivrc, wildlife, automaton, etc.)
- `src/game/systems/combat/engine.ts` -- loot roll on victory

### Acceptance Criteria

- [x] 14 loot tables: bandit, copperhead, ivrc, wildlife, automaton, and more
- [x] Drop rate tiers: common, uncommon, rare, guaranteed
- [x] Loot rolls automatically on enemy defeat
- [x] Items added to player inventory from loot drops
- [x] Per-enemy-type loot table selection

---

## 10. Dialogue System [WIRED]

### Description

Rich dialogue trees with branching choices, NPC personality, quest hooks, and typewriter text effect. 3 authored dialogue trees (~190 nodes): mayor_holt, father_miguel, samuel_ironpick. Plus procedural dialogue from templates.

### Files

- `src/game/store/slices/dialogueSlice.ts` -- active dialogue, NPC speaker, choice history
- `src/game/data/npcs/dialogues/` -- 3 rich hand-crafted dialogue trees
- `src/game/data/npcs/index.ts` -- NPC roster data
- `src/game/data/generation/generators/dialogueGenerator.ts` -- procedural dialogue
- `src/game/data/generation/templates/dialogueTreeTemplates.ts` -- dialogue templates
- `src/game/data/generation/pools/dialogueSnippets.ts` -- dialogue snippet pools
- `src/game/systems/DialogueQuestBridge.ts` -- dialogue-to-quest wiring
- `components/game/DialogueBox.tsx` -- FF7-style dialogue UI with typewriter effect
- `config/game/dialogues.json` -- dialogue tree definitions

### Acceptance Criteria

- [x] Branching dialogue with player choices
- [x] Typewriter text effect in dialogue box
- [x] NPC personality affects dialogue content
- [x] Quest acceptance and progression via dialogue
- [x] 3 rich hand-crafted dialogue trees (~190 nodes total)
- [x] Procedural dialogue generation for non-authored NPCs
- [x] First-meeting vs return dialogue variations
- [x] Dialogue choice history tracked in store

---

## 11. Travel System [WIRED]

### Description

Route-based travel between 14 towns. Survival costs (fatigue, provisions) proportional to distance. Encounters can trigger during travel. Proportional cancel costs on abort.

### Files

- `src/game/store/slices/travelSlice.ts` -- current route, travel progress, encounters
- `src/game/systems/TravelManager.ts` -- travel logic and state management
- `src/game/services/TravelService.ts` -- travel service layer
- `components/game/TravelPanel.tsx` -- route progress and encounter UI
- `components/game/WorldMap.tsx` -- region navigation map

### Acceptance Criteria

- [x] Select destination from world map
- [x] Travel progress tracked with time/distance
- [x] Survival costs (fatigue, provisions) applied proportional to distance
- [x] Random encounters can trigger during travel
- [x] Proportional cancel costs on travel abort
- [x] World items populate on arrival at new location
- [x] NPCs repopulated via `populateNPCsForLocation()` on arrival
- [x] Travel panel shows route progress and status

---

## 12. NPC Movement & Schedules [WIRED]

### Description

Schedule-based NPC movement with lerp interpolation and idle wander. Role-specific schedule templates. NPC positions update in real-time based on time of day.

### Files

- `src/game/systems/NPCMovementSystem.ts` -- 3D movement with lerp interpolation
- `src/game/systems/NPCScheduleResolver.ts` -- schedule resolution based on time
- `src/game/data/generation/templates/scheduleTemplates.ts` -- role-specific schedule templates
- `src/game/data/generation/templates/npcTemplates.ts` -- 66 NPC archetypes
- `src/game/engine/ai/YukaAgentManager.ts` -- Yuka behavior tree AI
- `components/entities/NPCEntity.tsx` -- NPC 3D entity rendering
- `config/game/npcs.json` -- NPC template definitions

### Acceptance Criteria

- [x] NPCs follow daily schedules based on time of day
- [x] Smooth lerp interpolation for movement transitions
- [x] Idle wander behavior when not on schedule
- [x] Role-specific schedule templates (sheriff, merchant, barkeep, etc.)
- [x] 66 NPC archetypes with distinct behaviors
- [x] Yuka behavior tree AI for complex decision-making
- [x] NPC entities render as procedural chibi characters

---

## 13. Stealth System [WIRED]

### Description

Detection meter 0-100 with modifier-based calculation. States: hidden, suspicious, detected. Modifiers: crouching (-40), night (-20), sprinting (+30), movement speed factor. C key toggles crouch.

### Files

- `src/game/systems/StealthSystem.ts` -- detection calculation and state machine
- `src/game/store/slices/stealthSlice.ts` -- stealth state (detection level, stance)
- `components/game/StealthIndicator.tsx` -- detection meter HUD element
- `components/scene/StealthDetector.tsx` -- 3D detection zone rendering

### Acceptance Criteria

- [x] Detection meter tracks value 0-100
- [x] Three states: hidden (0-30), suspicious (30-70), detected (70-100)
- [x] Crouching modifier: -40 to detection
- [x] Night modifier: -20 to detection
- [x] Sprinting modifier: +30 to detection
- [x] Movement speed scales detection rate
- [x] C key toggles crouch stance
- [x] StealthIndicator shows detection level in HUD
- [x] Distance-based detection from enemies/NPCs

---

## 14. Survival Systems [WIRED]

### Description

Three interconnected survival systems: fatigue, provisions (food/water), and camping. Survival ticks at ~1 Hz. Starvation/dehydration cause damage over time.

### Files

- `src/game/systems/survivalStore.ts` -- survival state management
- `src/game/systems/fatigue.ts` -- fatigue accumulation and effects
- `src/game/systems/provisions.ts` -- food/water consumption and depletion
- `src/game/systems/camping.ts` -- rest/camp system for recovery
- `config/game/survival.json` -- fatigue, provisions, camping tuning values

### Acceptance Criteria

- [x] Fatigue increases over time, reduces effectiveness
- [x] Provisions (food/water) deplete during travel and over time
- [x] Starvation/dehydration deal damage when provisions empty
- [x] Camping restores fatigue and allows crafting/cooking
- [x] Survival tick runs at ~1 Hz
- [x] `loadSurvivalState()` calls `syncSystems()` after hydration
- [x] Survival values balanced for 3D open-world pacing

---

## 15. Day/Night Cycle [WIRED]

### Description

GameClock runs on its own setInterval, synced to store via `tickClock()`. Day/night affects lighting, NPC schedules, and stealth modifiers.

### Files

- `src/game/systems/time.ts` -- GameClock with day/hour/minute tracking
- `components/scene/DayNightCycle.tsx` -- R3F lighting transitions
- `components/scene/Lighting.tsx` -- sun, fill light, ambient, hemisphere
- `components/scene/Sky.tsx` -- procedural sky dome
- `config/game/time.json` -- day/night cycle, time multipliers

### Acceptance Criteria

- [x] GameClock advances time with configurable speed
- [x] `setTime()` recalculates `totalMinutes` from day/hour/minute
- [x] `tickClock()` does NOT call `syncSystems()` (prevents state overwrite)
- [x] Day/night lighting transitions via DayNightCycle component
- [x] Sun intensity: 2.5, fill light: 0.8, ambient: 1.0, hemisphere: 0.8
- [x] Sky dome updates with time of day
- [x] NPC schedules respond to time changes
- [x] Night provides stealth bonus (-20 detection)

---

## 16. Save/Load System [WIRED]

### Description

Autosave at 5-minute intervals and on key events. Manual save slots. Full state persistence including NPC/item repopulation on load.

### Files

- `src/game/systems/SaveSystem.ts` -- save/load logic
- `src/game/store/saveManager.ts` -- save slot management
- `src/game/store/StorageAdapter.ts` -- persistence adapter (AsyncStorage/localStorage)
- `src/game/store/createGameStore.ts` -- store factory with hydration

### Acceptance Criteria

- [x] Autosave every 5 minutes
- [x] Autosave on key events (quest completion, location change)
- [x] Manual save slots
- [x] Full state serialization/deserialization
- [x] NPC repopulation via `populateNPCsForLocation()` on load
- [x] Item repopulation on load
- [x] `hydrateFromSave` restarts clock timer (prevents clock freeze)
- [x] `resetGame` performs comprehensive state reset (prevents state bleed)

---

## 17. Audio System [WIRED]

### Description

Tone.js generative music with combat SFX, ambient zones, and UI sounds. AudioProvider owns audio lifecycle (not GameOrchestrator). GameAudioBridge connects game events to audio triggers.

### Files

- `src/game/services/AudioService.ts` -- audio service interface
- `src/game/services/audio/GameAudioBridge.ts` -- game event to audio trigger bridge
- `src/game/services/audio/MusicManager.ts` -- generative western music
- `src/game/services/audio/SoundManager.ts` -- sound effect playback
- `src/game/services/audio/AmbienceManager.ts` -- ambient zone audio
- `src/game/services/audio/SFXCatalog.ts` -- sound effect definitions
- `components/game/AudioProvider.tsx` -- audio lifecycle owner

### Acceptance Criteria

- [x] Tone.js generative western music
- [x] Combat sound effects
- [x] Ambient zone audio (town, desert, mine)
- [x] UI interaction sounds
- [x] AudioProvider manages lifecycle independently
- [x] GameAudioBridge connects store events to audio triggers
- [x] Volume controls in settings (music, SFX, master)
- [x] Audio responds to game state (combat, travel, exploration)

---

## 18. Terrain & Open World [WIRED]

### Description

Heightmap-based terrain with chunk streaming. PBR materials from AmbientCG. Desert biome with canyons and mesas. Spatial hashing for entity culling.

### Files

- `src/game/engine/terrain/HeightmapGenerator.ts` -- procedural heightmap generation
- `src/game/engine/world/ChunkManager.ts` -- chunk-based terrain loading
- `src/game/engine/world/RouteRenderer.ts` -- road/path rendering between towns
- `src/game/engine/world/TownPlacer.ts` -- town position placement
- `src/game/engine/world/WorldConfig.ts` -- world configuration constants
- `src/game/engine/materials/index.ts` -- PBR material factory
- `src/game/engine/materials/CanvasTextureFactory.ts` -- canvas-based textures
- `src/game/engine/materials/TextureCache.ts` -- texture caching
- `src/game/systems/SpatialHash.ts` -- spatial indexing for entity culling
- `components/scene/OpenWorld.tsx` -- R3F open world renderer
- `components/scene/Terrain.tsx` -- terrain mesh component

### Acceptance Criteria

- [x] Heightmap terrain generation with noise layers
- [x] Chunk-based loading (only render nearby chunks)
- [x] PBR ground materials from AmbientCG
- [x] Route rendering between towns
- [x] Town placement in world space
- [x] Spatial hashing for entity culling
- [x] Canvas texture factory for procedural textures
- [x] Texture caching prevents regeneration per frame

---

## 19. Procedural Buildings [WIRED]

### Description

Parameterized building archetypes construct geometry from Three.js primitives with PBR materials. Zero GLB models. 15 building archetypes with canvas-painted textures.

### Files

- `src/game/engine/archetypes/BuildingBase.ts` -- base building class with roof/wall/door
- `src/game/engine/archetypes/Saloon.ts` -- saloon archetype (wood_siding PBR)
- `src/game/engine/archetypes/Inn.ts` -- inn archetype (wood_siding PBR)
- `src/game/engine/archetypes/Bank.ts` -- bank archetype (stone_rough PBR)
- `src/game/engine/archetypes/SheriffOffice.ts` -- sheriff office (stone_rough PBR)
- `src/game/engine/archetypes/Church.ts` -- church archetype (clay_adobe PBR)
- `src/game/engine/archetypes/GeneralStore.ts` -- general store (wood_planks PBR)
- `src/game/engine/archetypes/Blacksmith.ts` -- blacksmith (wood_aged PBR)
- `src/game/engine/archetypes/Barber.ts` -- barber shop
- `src/game/engine/archetypes/DoctorOffice.ts` -- doctor's office
- `src/game/engine/archetypes/Livery.ts` -- livery stable
- `src/game/engine/archetypes/MiningOffice.ts` -- mining office
- `src/game/engine/archetypes/Newspaper.ts` -- newspaper office
- `src/game/engine/archetypes/TelegraphOffice.ts` -- telegraph office
- `src/game/engine/archetypes/Undertaker.ts` -- undertaker building

### Acceptance Criteria

- [x] BuildingBase provides shared wall/roof/door construction
- [x] 15 building archetype renderers
- [x] PBR materials from AmbientCG (wood_siding, stone_rough, clay_adobe, wood_planks, wood_aged)
- [x] Peaked/shed roofs use BoxGeometry (0.12 thick), not PlaneGeometry
- [x] Canvas-painted signs and details per archetype
- [x] Zero GLB models -- all geometry from primitives
- [x] Static building geometry has frozen world matrices
- [ ] 14 additional building types still use fallback boxes (cabin, house, mansion, well, water_tower, station)

---

## 20. Building Interiors [WIRED]

### Description

InteriorManager handles door animations, interior lighting, and NPC placement slots synced with InteriorGenerator metadata. 7 building types have `.interior.ts` files with authored interior layouts.

### Files

- `src/game/systems/InteriorManager.ts` -- door animations, NPC slot management
- `src/game/engine/archetypes/Saloon.interior.ts` -- saloon interior (bar, tables, piano)
- `src/game/engine/archetypes/Saloon.furniture.ts` -- saloon furniture pieces
- `src/game/engine/archetypes/Church.interior.ts` -- church interior (pews, altar)
- `src/game/engine/archetypes/Blacksmith.interior.ts` -- blacksmith interior (forge, anvil)
- `src/game/engine/archetypes/Barber.interior.ts` -- barber interior
- `src/game/engine/archetypes/MiningOffice.interior.ts` -- mining office interior
- `src/game/engine/archetypes/Newspaper.interior.ts` -- newspaper office interior
- `src/game/engine/archetypes/BuildingBase.composite.ts` -- composite exterior + interior

### Acceptance Criteria

- [x] InteriorManager controls door open/close animations
- [x] NPC placement slots synced with InteriorGenerator metadata
- [x] 7 building types have authored interior layouts
- [x] Interior lighting separate from exterior
- [x] Furniture and prop placement within interiors
- [x] Composite rendering combines exterior shell with interior detail

---

## 21. World Map & Locations [WIRED]

### Description

14 hand-crafted towns with exact building placement, NPC rosters, shop inventories, and quest hooks. World is deterministic -- not procedurally generated. Towns connected by authored routes.

### Files

- `src/game/data/worlds/frontier_territory.ts` -- world map and region layout
- `src/game/data/worlds/worldMap.ts` -- world map data
- `src/game/data/worlds/WorldLoader.ts` -- world data loading
- `src/game/data/locations/` -- 14 town definitions:
  - `coppertown.ts`, `junction_city.ts`, `rattlesnake_canyon.ts`
  - `copper_mine.ts`, `desert_waystation.ts`, `dusty_springs.ts`
  - `freeminer_hollow.ts`, `old_works.ts`, `prospect.ts`
  - `signal_rock.ts`, `sunset_ranch.ts`, `thornwood_station.ts`
  - `test_town.ts`
- `components/game/WorldMap.tsx` -- world map UI

### Acceptance Criteria

- [x] 14 town definitions with buildings, NPCs, connections
- [x] World map shows all towns and routes
- [x] Each town has authored NPC rosters
- [x] Each town has authored shop inventories
- [x] Each town has quest hooks
- [x] Routes between towns are authored paths
- [x] 3D environment data for all locations (NPC markers, roads, atmosphere)
- [x] Town boundary system detects entry/exit

---

## 22. Procedural Generation [WIRED]

### Description

Daggerfall-style seeded deterministic generation via ProceduralLocationManager. 66 NPC archetypes, 31 enemy templates, biome encounter zones. Used for visual variation and non-authored content -- world layout itself is hand-crafted.

### Files

- `src/game/data/generation/ProceduralLocationManager.ts` -- central procedural manager
- `src/game/data/generation/seededRandom.ts` -- `scopedRNG(scope, worldSeed, ...extra)`
- `src/game/data/generation/generators/npcGenerator.ts` -- NPC generation
- `src/game/data/generation/generators/encounterGenerator.ts` -- encounter generation
- `src/game/data/generation/generators/itemGenerator.ts` -- item generation
- `src/game/data/generation/generators/questGenerator.ts` -- quest generation
- `src/game/data/generation/generators/dialogueGenerator.ts` -- dialogue generation
- `src/game/data/generation/generators/nameGenerator.ts` -- name generation
- `src/game/data/generation/generators/worldGenerator.ts` -- world generation
- `src/game/data/generation/templates/npcTemplates.ts` -- 66 NPC archetypes
- `src/game/data/generation/templates/enemyTemplates.ts` -- 31 enemy templates
- `src/game/data/generation/templates/encounterTemplates.ts` -- encounter templates
- `src/game/data/generation/templates/factionTemplates.ts` -- faction templates
- `src/game/data/generation/templates/locationTemplates.ts` -- location templates
- `src/game/data/generation/templates/shopTemplates.ts` -- shop templates
- `src/game/data/generation/templates/questTemplates.ts` -- quest templates
- `src/game/data/generation/templates/scheduleTemplates.ts` -- schedule templates
- `src/game/data/generation/pools/namePools.ts` -- name pools
- `src/game/data/generation/pools/dialogueSnippets.ts` -- dialogue snippets
- `src/game/data/generation/pools/rumorsAndLore.ts` -- rumors and lore
- `src/game/data/generation/integration/gameStoreIntegration.ts` -- store integration

### Acceptance Criteria

- [x] ProceduralLocationManager generates content deterministically from seed
- [x] `scopedRNG()` used for all randomness (never Math.random)
- [x] 66 NPC archetypes with distinct roles and appearances
- [x] 31 enemy templates (4 new: GrizzlyBear, Scorpion, Vulture, BanditLeader)
- [x] Biome-organized encounter zones
- [x] `populateNPCsForLocation()` handles hand-crafted + procedural NPCs
- [x] `proceduralNPCToStoreNPC()` generates deterministic CharacterAppearance from seed
- [x] Procedural content integrates with game store

---

## 23. Faction Reputation [IN PROGRESS]

### Description

Faction reputation system tracks player standing with major frontier factions. System exists in player slice but lacks a dedicated UI panel.

### Files

- `src/game/store/slices/playerSlice.ts` -- faction reputation values
- `config/game/factions.json` -- faction reputation thresholds
- `src/game/data/generation/templates/factionTemplates.ts` -- faction templates

### Acceptance Criteria

- [x] Faction reputation values tracked per faction
- [x] Reputation thresholds defined in config
- [x] Faction templates define faction identities
- [ ] Dedicated faction reputation UI panel
- [ ] Reputation affects NPC dialogue and shop prices
- [ ] Faction-specific quests gated by reputation level

---

## 24. Crafting System [IN PROGRESS]

### Description

Building archetypes exist for crafting locations (Blacksmith). No crafting UI or recipe system implemented yet.

### Files

- `src/game/engine/archetypes/Blacksmith.ts` -- blacksmith building (potential crafting location)
- `src/game/engine/archetypes/Blacksmith.interior.ts` -- blacksmith interior with forge and anvil

### Acceptance Criteria

- [x] Blacksmith building archetype renders forge and anvil
- [ ] Crafting recipe definitions
- [ ] Crafting UI panel
- [ ] Material consumption and item creation
- [ ] Crafting skill progression

---

## 25. Weather System [IN PROGRESS]

### Description

Day/night cycle fully works with lighting transitions. No dynamic weather events (dust storms, rain, fog) implemented yet.

### Files

- `components/scene/DayNightCycle.tsx` -- day/night transitions (working)
- `components/scene/Sky.tsx` -- sky dome (working)

### Acceptance Criteria

- [x] Day/night cycle with lighting changes
- [x] Sky dome transitions with time
- [ ] Dust storm weather event
- [ ] Rain/thunder weather event
- [ ] Fog weather event
- [ ] Weather affects visibility and combat
- [ ] Weather affects NPC behavior

---

## 26. Puzzle Minigames [WIRED]

### Description

Pipe-fitter puzzle minigame with grid-based pipe connections. Integrated with puzzle store slice.

### Files

- `src/game/puzzles/pipe-fitter/generator.ts` -- puzzle generation
- `src/game/puzzles/pipe-fitter/logic.ts` -- puzzle solving logic
- `src/game/puzzles/pipe-fitter/types.ts` -- puzzle type definitions
- `src/game/store/slices/puzzleSlice.ts` -- active puzzle state
- `components/game/PipePuzzle.tsx` -- puzzle UI

### Acceptance Criteria

- [x] Pipe-fitter puzzle generates solvable grids
- [x] Player rotates pipe segments to connect flow
- [x] Puzzle completion detected and rewarded
- [x] Puzzle state managed via puzzleSlice

---

## 27. Vehicles & Mounts [PLANNED]

### Description

Horse riding and wagon/cart travel for faster overland movement. Would integrate with travel system.

### Acceptance Criteria

- [ ] Horse mount with riding controls
- [ ] Mount speed bonus to travel
- [ ] Wagon/cart for cargo transport
- [ ] Mount stamina system
- [ ] Stable building for mount management

---

## 28. Companion System [PLANNED]

### Description

Recruitable NPC companions who travel and fight alongside the player.

### Acceptance Criteria

- [ ] Recruit NPCs as companions via dialogue
- [ ] Companion follows player in world
- [ ] Companion participates in combat
- [ ] Companion has own inventory and stats
- [ ] Companion relationship/loyalty system

---

## 29. Multiplayer [PLANNED]

### Description

Cooperative or competitive multiplayer gameplay.

### Acceptance Criteria

- [ ] Network protocol design
- [ ] State synchronization
- [ ] Player lobbies
- [ ] Cooperative quest completion
- [ ] PvP combat rules

---

## Appendix A: Store Slices Reference

| Slice | File | Responsibility | Status |
|-------|------|---------------|--------|
| `coreSlice` | `src/game/store/slices/coreSlice.ts` | Game phase, world seed, current location, time | [WIRED] |
| `playerSlice` | `src/game/store/slices/playerSlice.ts` | HP, stats, level, XP, faction reputation | [WIRED] |
| `combatSlice` | `src/game/store/slices/combatSlice.ts` | Active combat state, turn order, targeting | [WIRED] |
| `dialogueSlice` | `src/game/store/slices/dialogueSlice.ts` | Active dialogue, NPC speaker, choice history | [WIRED] |
| `inventorySlice` | `src/game/store/slices/inventorySlice.ts` | Items, equipment, currency | [WIRED] |
| `questSlice` | `src/game/store/slices/questSlice.ts` | Active/completed quests, objectives, rewards | [WIRED] |
| `shopSlice` | `src/game/store/slices/shopSlice.ts` | Shop UI state, transaction history | [WIRED] |
| `travelSlice` | `src/game/store/slices/travelSlice.ts` | Current route, travel progress, encounters | [WIRED] |
| `puzzleSlice` | `src/game/store/slices/puzzleSlice.ts` | Active puzzle state (pipe-fitter minigame) | [WIRED] |
| `settingsSlice` | `src/game/store/slices/settingsSlice.ts` | Audio, graphics, control preferences | [WIRED] |
| `uiSlice` | `src/game/store/slices/uiSlice.ts` | Menu state, modal stack, notifications | [WIRED] |
| `stealthSlice` | `src/game/store/slices/stealthSlice.ts` | Detection level, stance, stealth state | [WIRED] |

---

## Appendix B: Config Files Reference

All tuning values live in `config/game/` -- never inline in code.

| File | Contents |
|------|----------|
| `weapons.json` | Weapon stats, ranges, damage values |
| `enemies.json` | Enemy types, HP, behavior parameters |
| `encounters.json` | Encounter tables, probabilities |
| `difficulty.json` | Difficulty multipliers |
| `factions.json` | Faction reputation thresholds |
| `npcs.json` | NPC template definitions |
| `dialogues.json` | Dialogue tree definitions |
| `quests.json` | Quest chain definitions |
| `items.json` | Item catalog (weapons, consumables, gear) |
| `shops.json` | Shop inventories per town |
| `survival.json` | Fatigue, provisions, camping values |
| `time.json` | Day/night cycle, time multipliers |

---

## Appendix C: Town Reference

14 authored towns in `src/game/data/locations/`:

| Town | File | Theme |
|------|------|-------|
| Coppertown | `coppertown.ts` | Mining settlement, starting area |
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
