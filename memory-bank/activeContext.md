# Active Context

## Current Focus

**Daggerfall-Style Procedural Generation System** - Comprehensive procedural content generation infrastructure has been implemented. Currently integrating with game store and adding missing components (items, enemies, tests).

## Recent History (Session 2026-01-24)

### Spatial Data System Completion

1. **Building Rendering Fixed**
   - Added `buildingToLoaderType()` function to `HexGridRenderer.ts`
   - Buildings now render using Kenney Hexagon Kit tiles

2. **World Schema Created** (`/src/data/schemas/world.ts`)
   - `WorldSchema` with regions, locations, connections
   - Region biomes, danger levels, travel methods
   - Utility functions for spatial queries

3. **Assemblage Library Expanded** (28 assemblages)
   - Taverns: Saloon, SmallTavern
   - Commerce: GeneralStore, Gunsmith, Bank
   - Civic: SheriffOffice, Church, TrainStation
   - Residential: Cabin, House, Mansion
   - Infrastructure: Well, Stable
   - Industrial: MineEntrance
   - Camps: Campfire, TentCamp, BanditCamp
   - Farms: SmallFarm, CattleRanch
   - Ruins: AbandonedCabin, GhostTown
   - Natural: Oasis, RockFormation, CanyonPass
   - Outposts: Waystation, TelegraphPost

4. **Locations Created** (5 hand-crafted)
   - `test_town.ts` - Dusty Springs (starter town)
   - `copper_mine.ts` - Mining operation
   - `desert_waystation.ts` - Rest stop with oasis
   - `sunset_ranch.ts` - Cattle ranch
   - `rattlesnake_canyon.ts` - Bandit hideout (combat)

5. **World Definition** (`/src/data/worlds/frontier_territory.ts`)
   - 5 regions (Central Plains, Western Desert, Badlands, Mountains, Southern Scrub)
   - 14 locations connected by roads, trails, railroad
   - Starting location: Dusty Springs

6. **WorldLoader Created** (`/src/data/worlds/WorldLoader.ts`)
   - Resolves `locationDataId` references to full Location data
   - Bridges World definitions to LocationLoader
   - Validates world references

7. **Data Index Consolidated** (`/src/data/index.ts`)
   - Exports all schemas, assemblages, locations, worlds
   - Clean API for game code to access data

### Build & Test Status
- **Build**: Passes (7.33s, 7,005 kB)
- **Tests**: 73/73 pass (GL context errors are expected in Node)

## Active Decisions

- **Decoupled Data**: Spatial data is pure JSON schemas (Zod validated), no behavior
- **ECS Ready**: Data designed for loading into ECS components
- **Two-Tier Generation**: Hand-crafted locations via `locationDataId`, procedural via seed

## Session 2026-01-24 (Later) - Procedural Generation System

### Completed

1. **Core Generation Infrastructure** (15,000+ lines)
   - `seededRandom.ts` - Mulberry32 PRNG with SeededRandom class
   - `generation.ts` schema - 20+ Zod schemas for templates

2. **Generator Modules**
   - `nameGenerator.ts` - Multi-origin cultural names
   - `npcGenerator.ts` - NPC creation from templates
   - `questGenerator.ts` - Multi-stage quest generation
   - `encounterGenerator.ts` - Combat encounter composition
   - `dialogueGenerator.ts` - Dialogue tree assembly
   - `worldGenerator.ts` - Master orchestrator

3. **Template Libraries**
   - 30+ NPC archetypes
   - 15+ quest templates
   - 25 building templates, 15 location templates
   - 28 encounter templates
   - 20 schedule templates
   - 13 faction templates with reputation

4. **Content Pools**
   - 7 name origin pools
   - 6 place name pools
   - 60+ dialogue snippets
   - 90+ rumor/lore entries

### Session 2026-01-24 (Latest) - Generation System Completion

**Commit**: `ecd83e2` - feat: complete Daggerfall-style procedural generation system

1. **Item Generator** (`itemGenerator.ts` - 1,297 lines) - COMPLETE
   - Weapon, armor, consumable generation from templates
   - Procedural loot tables with weighted drops
   - Shop inventory generation with price modifiers
   - Material/quality/style pool systems

2. **Game Store Integration** (`gameStoreIntegration.ts` - 748 lines) - COMPLETE
   - Type converters for NPCs, quests, dialogues
   - Population functions for locations
   - Generation triggers and world initialization
   - ProceduralWorldState management

3. **Enemy Templates** (`enemyTemplates.ts` - 1,246 lines) - COMPLETE
   - 26 enemy types: bandits, wildlife, IVRC, Copperhead Gang, automatons
   - Level-scaled stats with configurable multipliers
   - Behavior/combat tags for AI hints
   - Faction associations and XP modifiers

4. **Unit Tests** (`generation.test.ts` - 1,699 lines) - COMPLETE
   - 103 comprehensive tests covering:
     - SeededRandom (32 tests)
     - Name Generation (13 tests)
     - NPC Generation (8 tests)
     - Quest Generation (6 tests)
     - Encounter Generation (8 tests)
     - Dialogue Generation (6 tests)
     - World Generation (10 tests)
     - Edge Cases (20 tests)

### Build & Test Status
- **Build**: Passes (7.95s, 7,352 kB)
- **Tests**: 176/176 pass

### Schema Updates Made
- `DialogueEffectTypeSchema` (renamed from EffectType to avoid conflict with item schema)
- `BuffTypeSchema` expanded: damage_resist, poison_resist, heat_resist, cold_resist
- `ArmorStatsSchema` added resistances property
- `DialogueNodeSchema` added conditions property
- Re-exported types from npcs/items indexes for external use

## Session 2026-01-24 (Latest) - Procedural Generation Integration

**Integration of procedural generation system with existing town/location infrastructure - COMPLETE**

### Files Created

1. **`/src/data/generation/ProceduralLocationManager.ts`** (600+ lines)
   - Central orchestrator for procedural content generation
   - Singleton pattern with in-memory cache (keyed by locationId)
   - Key functions:
     - `initialize(worldSeed)` - Initialize with world seed
     - `generateLocationContent(resolvedLocation)` - Generate NPCs, items, dialogue, shops, quests
     - `getOrGenerateNPCs(locationId)` - Lazy NPC access
     - `getOrGenerateItems(locationId)` - Lazy item access
     - `getOrGenerateDialogue(npcId, locationId)` - Lazy dialogue access
     - `getOrGenerateShop(npcId, locationId)` - Lazy shop access
   - Deterministic generation: same seed + locationId = identical content

### Files Modified

1. **`/src/data/npcs/index.ts`**
   - `getNPCsByLocation()` now returns both hand-crafted AND procedural NPCs
   - Checks `ProceduralLocationManager.hasGeneratedContent()` before merging
   - Added exports for `ProceduralNPC` type

2. **`/src/data/items/worldItems.ts`**
   - `getWorldItemsForLocation()` now returns both hand-crafted AND procedural items
   - Checks `ProceduralLocationManager.hasGeneratedContent()` before merging

3. **`/src/game/store/gameStore.ts`**
   - `initWorld()` now calls `ProceduralLocationManager.initialize(worldSeed)`
   - Generates content for starting location if procedural
   - `travelTo()` generates content for procedural destinations on-demand

4. **`/src/test/generation.test.ts`** (2000+ lines now)
   - Added 27 new integration tests covering:
     - ProceduralLocationManager initialization (4 tests)
     - generateLocationContent (9 tests)
     - Deterministic generation (3 tests)
     - getOrGenerateNPCs/Items/Dialogue (5 tests)
     - Unified NPC lookup (3 tests)
     - Unified item lookup (3 tests)

### Key Fixes Made

1. **Location Type Alignment**
   - `inferLocationType()` now returns types matching NPC template `validLocationTypes`
   - Types: 'town', 'city', 'mine', 'ranch', 'outpost', 'camp', 'ruin'
   - Previously: 'frontier_town', 'mining_town', etc. (no template matches)

2. **Item Pool Alignment**
   - Added pools for 'town', 'city', 'mine', 'ranch', 'outpost', 'camp', 'ruin'
   - Location-specific loot distribution

### Build & Test Status
- **Build**: Passes (8.27s, 7,652 kB)
- **Tests**: 203/203 pass

## Session 2026-01-24 (Continued) - World Map, Travel, CI/CD

### Completed

1. **World Map UI Enhancement**
   - Added procedural location indicator (purple ✦)
   - Updated legend to show procedural marker
   - Uses `!locationDataId` check for procedural detection

2. **Travel System with Random Encounters**
   - Added `TravelState` interface to game store
   - Updated `travelTo()` with encounter generation:
     - Danger-based probability (5% safe to 70% extreme)
     - Uses seeded RNG for deterministic encounters
     - Integrates with encounterGenerator
   - Added `completeTravel()` and `cancelTravel()` actions
   - Created `TravelPanel.tsx` UI component:
     - Animated progress bar
     - Route info (method, travel time, danger)
     - Encounter panel with fight/flee options

3. **CI/CD with GitHub Actions**
   - Created `.github/workflows/ci.yml`
   - Runs on push to main/release branches and PRs
   - Steps: checkout, pnpm setup, install, type check, test, build
   - E2E tests with Playwright (PRs only)
   - Build artifact upload

4. **TypeScript Fixes**
   - Fixed DIALOGUE_TREE_TEMPLATES (Record to array conversion)
   - Fixed LocationRef mocks in tests (removed invalid properties)
   - Fixed WorldItemSpawn (removed respawns property)
   - Fixed isProcedural check in WorldMap

### Build & Test Status
- **Build**: Passes (7.67 MB)
- **Tests**: 203/203 pass
- **TypeScript**: No errors

## Session 2026-01-24 (Latest) - UI/UX Polish

### Completed - Full UI Overhaul

1. **ActionBar Streamlined**
   - Reduced from 7 to 5 buttons (Outlaw, Territory, Saddlebag, Journal, Menu)
   - Removed test "Fight" button
   - Removed Settings button (merged into Menu)
   - Western-themed labels
   - Active state highlighting

2. **GameHUD Unified Design**
   - Single compact header bar instead of two cards
   - Player avatar, name, level (Lv.X format)
   - Color-coded health (green/yellow/red)
   - Location indicator with compass icon
   - Quest tracker with pulse indicator

3. **MenuPanel + Settings Merged**
   - Tabbed interface (Game/Settings)
   - Game tab: player stats, save/load, new game
   - Settings tab: audio, controls, display

4. **InventoryPanel Improved**
   - Filter tabs (All, Weapons, Armor, Supplies, Keys) with counts
   - Responsive grid (2/3/4 columns)
   - Equipped items badge (blue checkmark)
   - Better empty state per filter type

5. **CombatPanel Polished** (`e33a475`)
   - Western amber theme with custom icons
   - Redesigned enemy cards with AP bars
   - Icon-based action buttons (attack, defend, item, flee)
   - Improved outcome screens for victory/defeat/fled

6. **ShopPanel Polished** (`97a4f50`)
   - Unified amber/western color scheme
   - Custom icons (CoinIcon, ShoppingBagIcon, TagIcon)
   - RarityBadge component for item rarity display
   - Improved item rows with icons and stock indicators
   - Infinity symbol for unlimited stock items

7. **TravelPanel Polished** (`cea1956`)
   - Unified amber color scheme with danger level styling
   - Custom progress bar with animated marker
   - Added compass and method icons
   - Polished encounter panel with fight/flee buttons

8. **CharacterPanel Polished** (`cea1956`)
   - Full amber western theme overhaul
   - Custom icons for equipment slots (gun, hat, vest, ring)
   - Gradient stat bars for health and stamina
   - Combat stat cards with color-coded values
   - Reputation status with dynamic styling

9. **GameOverScreen Polished** (`cea1956`)
   - Dramatic western death screen with animations
   - Skull icon in circular frame
   - Tombstone decoration with R.I.P. marker
   - Dust particle background effects
   - Vignette and gradient effects

10. **Cleanup**
    - Deleted deprecated SettingsPanel.tsx (merged into MenuPanel)

### Build & Test Status
- **Build**: Passes (7.70 MB)
- **Tests**: 203/203 pass
- **TypeScript**: No errors

## Next Steps

1. **Save/Load System**: Persist procedural generation state
2. **Audio System**: Add western ambient music and SFX
3. **Consolidate Procgen**: Merge with /src/game/lib/procgen.ts (low priority)
4. **Polish Remaining**: DialogueBox, QuestLog, WorldMap already good but could be refined
