# Progress

## Current Branch: feature/comprehensive-modularization-and-ddl

### Completed

- **Framework Migration**
  - Removed Ionic Angular, Capacitor, and Babylon.js entirely
  - Migrated to Expo 55 with Expo Router for navigation
  - Adopted React Three Fiber (R3F v9) + Three.js v0.175 for 3D rendering
  - Adopted NativeWind v4 (Tailwind CSS for React Native) for styling
  - Dev server runs on web via `expo start --web`

- **3D Scene (R3F)**
  - `GameScene.tsx` — root scene composition
  - `Terrain.tsx` — procedural terrain with simplex noise
  - `Sky.tsx` — atmospheric sky rendering
  - `DayNightCycle.tsx` — time-of-day lighting transitions
  - `Lighting.tsx` — scene lighting setup
  - `VegetationField.tsx` — procedural vegetation scattering
  - `PropCluster.tsx` — world prop placement
  - `OpenWorld.tsx` — open world composition with buildings and routes
  - `FPSCamera.tsx` — first-person camera with mouse/touch look
  - `WeaponView.tsx` — first-person weapon rendering
  - `CombatSystem.tsx` — 3D combat interactions
  - `EntitySpawner.tsx` — NPC/enemy entity spawning
  - `InteractionDetector.tsx` — proximity-based interaction triggers
  - `PhysicsProvider.tsx` — physics context wrapper
  - `Fireflies.tsx` — ambient particle effects
  - `WorldItems.tsx` — lootable world items

- **HUD and UI (React Native Overlays)**
  - `GameHUD.tsx` — main HUD container (Fallout-style)
  - `PlayerVitals.tsx` — HP/AP/stamina bars
  - `CompassBar.tsx` — directional compass with quest markers
  - `AmmoDisplay.tsx` — weapon ammo counter
  - `Crosshair.tsx` — aiming reticle
  - `DamageFlash.tsx` / `DamageIndicator.tsx` — damage feedback
  - `StealthIndicator.tsx` — stealth detection meter
  - `DialogueBox.tsx` — NPC dialogue with branching choices
  - `InventoryPanel.tsx` — item management
  - `ShopPanel.tsx` — buy/sell interface
  - `CharacterPanel.tsx` — stats and skills
  - `QuestLog.tsx` / `QuestNotification.tsx` — quest tracking
  - `TravelPanel.tsx` / `TravelTransition.tsx` — fast travel UI
  - `WorldMap.tsx` — map overview
  - `MainMenu.tsx` — title screen
  - `GameOverScreen.tsx` — death/game-over screen
  - `TouchOverlay.tsx` — mobile touch controls
  - `NotificationFeed.tsx` — in-game notifications
  - `PipePuzzle.tsx` — minigame puzzle
  - `InteractionPrompt.tsx` — contextual action prompts

- **Game Systems**
  - Combat system with encounter types, damage calculation, weapon handling
  - Dialogue system with quest bridge integration
  - Quest system with event tracking and marker placement
  - Travel system with location transitions and boundary detection
  - Survival systems: fatigue, provisions, camping
  - NPC schedule resolver and movement system
  - Interior manager for building entry/exit
  - Zone system for area boundaries
  - Spatial hash for proximity queries
  - Collision system
  - Save system (scaffolded)

- **State Management**
  - Zustand v5 store with 12 modular slices:
    `core`, `player`, `combat`, `dialogue`, `inventory`, `quest`, `shop`, `travel`, `puzzle`, `settings`, `ui`, plus `survivalStore`
  - Database manager and storage adapter for persistence (scaffolded)

- **Data Layer**
  - Zod v4 schemas for all game entities (combat, items, NPCs, quests, spatial, world, generation)
  - 12 location definitions (Coppertown, Dusty Springs, Junction City, etc.)
  - Town definition for Dusty Gulch with building/NPC/shop data
  - NPC dialogue data files
  - Enemy and item data registries
  - DDL schema layer for data definition loading

- **ECS (Miniplex)**
  - Component definitions, archetypes, world setup
  - ECS systems directory

- **Content Pipeline**
  - Meshy content-gen integration for 3D asset generation
  - Hero character pipeline with variants
  - NPC and prop content definitions under `assets/content/`

- **Testing**
  - Playwright E2E tests reorganized into: `core/`, `persistence/`, `quality/`, `spatial/`, `systems/`, `ui/`, `validation/`
  - Jest unit tests with jest-expo preset
  - Property-based tests with fast-check

- **Combat Recalibration**
  - Rebalanced damage, accuracy, and encounter scaling for R3F rendering context

### Not Yet Done

- **System Integration**: Combat, dialogue, quest, travel, and survival systems exist independently but are not wired into a unified game loop
- **Audio**: Tone.js is a dependency and AudioProvider exists, but no in-game sound is playing
- **Save/Load**: expo-sqlite adapter and DatabaseManager exist but end-to-end persistence is not connected
- **NPC AI**: Yuka is a dependency and basic scaffolding exists, but agents do not drive in-scene entity behavior
- **Full Playtest**: No complete new-game-to-quest-completion loop has been verified
- **Mobile Build**: Expo native builds (Android/iOS) have not been tested
- **Performance Profiling**: No frame budget verification on target devices

## Earlier History (Pre-Migration)

### 2026-01-28
- Ionic Angular + Babylon.js era: look-dev lab scene, Meshy content-gen pipeline, Playwright E2E suite (72 tests), Yuka/Rapier integration scaffolding

### 2026-01-27
- Fixed Babylon resize/memory leaks and pathfinding validation
- Added ARIA attributes to decorative SVGs
