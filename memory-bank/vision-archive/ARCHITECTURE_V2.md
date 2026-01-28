# Iron Frontier - Architecture V2: Seamless Western RPG

## Vision

A polished 3-hour steampunk western RPG with:
- **Seamless overworld** - Pokemon-style, walk in/out of towns
- **Authored content** - Designed world, not procedural roguelike
- **Turn-based combat** - Separate combat screen (FF/Pokemon style)
- **Survival mechanics** - Day/night, fatigue, provisions, camping
- **React UI everywhere** - Same components web + mobile

## Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     SHARED (packages/shared)                │
│  Game Logic • Schemas • State • Content Data                │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│      WEB (apps/web)     │         │   MOBILE (apps/mobile)  │
│                         │         │                         │
│  React UI Layer         │         │  React Native UI        │
│  (menus, combat, HUD)   │         │  (same components)      │
│          │              │         │          │              │
│  Reactylon              │         │  Filament               │
│          │              │         │          │              │
│  Babylon.js             │         │  Native GPU             │
│          │              │         │                         │
│  WebGPU                 │         │                         │
└─────────────────────────┘         └─────────────────────────┘
```

## World Structure (Authored, Not Procedural)

```
                    ┌─────────────────┐
                    │ FRONTIER'S EDGE │  Starting town
                    │ (Tutorial area) │  - Learn mechanics
                    └────────┬────────┘  - Meet first NPCs
                             │
                      Dusty Trail (Route 1)
                      - 15 min walk
                      - Tutorial encounters
                      - Abandoned wagon event
                             │
                    ┌────────┴────────┐
                    │   IRON GULCH    │  Mining town - Act 1
                    │   (Main hub)    │  - Main quest hub
                    └───────┬─┬───────┘  - Mining conspiracy
                           /   \
            Desert Pass   /     \   Mountain Road
            (Route 2)    /       \  (Route 3)
            - 20 min    /         \ - 25 min
            - Bandits  /           \- Wildlife
                      /             \
         ┌───────────┴─┐         ┌──┴───────────┐
         │ MESA POINT  │         │  COLDWATER   │  Act 2 towns
         │ (Outlaw den)│         │ (Ranch town) │
         └──────┬──────┘         └──────┬───────┘
                 \                     /
                  \   Badlands Trail  /
                   \   (Route 4)     /
                    \   - 30 min    /
                     \  - Final prep/
                      \           /
                    ┌──┴─────────┴──┐
                    │   SALVATION   │  Endgame town
                    │  (Final act)  │  - Climax
                    └───────────────┘
```

## Content Specification

### Towns (6 total)

| Town | Theme | Key NPCs | Shops | Quests |
|------|-------|----------|-------|--------|
| Frontier's Edge | Tutorial/starter | Sheriff, Merchant, Old Timer | General Store | 2-3 tutorial |
| Iron Gulch | Mining/industrial | Mine Foreman, Engineer, Saboteur | Mining Supply, Saloon | 3-4 main quest |
| Mesa Point | Outlaw hideout | Gang Leader, Informant, Bounty Hunter | Black Market | 2-3 side |
| Coldwater | Ranching/pastoral | Rancher, Veterinarian, Wanderer | Ranch Supply, Inn | 2-3 side |
| Salvation | Endgame/religious | Preacher, Final Boss, Ally | Final Shop | 2 finale |

### Routes (5 total)

| Route | From → To | Time | Terrain | Encounters | Events |
|-------|-----------|------|---------|------------|--------|
| Dusty Trail | Frontier's Edge → Iron Gulch | 15 min | Plains/Desert | Coyotes, Bandits (easy) | Wagon, Campsite |
| Desert Pass | Iron Gulch → Mesa Point | 20 min | Desert/Canyon | Bandits, Snakes | Oasis, Ruins |
| Mountain Road | Iron Gulch → Coldwater | 25 min | Mountains | Wolves, Bears | Mine Entrance, Overlook |
| Badlands Trail | Mesa Point ↔ Coldwater | 20 min | Badlands | Mixed | Ghost Town |
| Final Trail | Both → Salvation | 30 min | All types | Hard enemies | Multiple events |

### Game Systems

| System | Description |
|--------|-------------|
| **Time** | Real clock, 1 game hour = 2 real minutes. Day/night affects encounters, shop hours, NPC locations |
| **Fatigue** | Increases with travel, combat. High fatigue = combat penalties. Rest at inns or camps |
| **Provisions** | Food/water consumed over time. Run out = fatigue increases faster. Hunt or buy supplies |
| **Combat** | Turn-based, separate screen. Attack/Defend/Item/Flee. No animation, use effects |
| **Hunting** | Mini-game when camping. Oregon Trail style. Replenishes provisions |

## Phase 1: Foundation (Parallel)

### 1A: World Data Schema
- Define Zod schemas for towns, routes, NPCs, quests
- Location: `packages/shared/src/data/world/`

### 1B: Overworld Renderer
- Babylon.js Dynamic Terrain setup
- AmbientCG terrain textures
- Day/night lighting system
- Location: `apps/web/src/engine/overworld/`

### 1C: Time & Survival Systems
- Game clock with day/night
- Fatigue system
- Provisions system
- Location: `packages/shared/src/systems/`

### 1D: Combat System Core
- Turn-based combat logic
- Damage/defense calculations
- Status effects
- Location: `packages/shared/src/systems/combat/`

## Phase 2: Content (Parallel, depends on Phase 1A)

### 2A: Town Content Generation
- Generate all 6 towns with NPCs, shops, quests
- Use AI subagents for each town
- Output: JSON data files

### 2B: Route Content Generation
- Generate all 5 routes with encounters, events
- Use AI subagents for each route
- Output: JSON data files

### 2C: Quest Chain Design
- Main quest arc (3 acts)
- Side quests per town
- Interconnected narrative

### 2D: Enemy/Item Database
- All enemy types with stats
- All items (weapons, consumables, quest items)
- Loot tables per area

## Phase 3: UI (Parallel, depends on Phase 1)

### 3A: Combat UI
- React components for combat screen
- Enemy display, action buttons, effects
- Location: `packages/ui/src/combat/`

### 3B: Dialogue UI
- Dialogue box component
- Choice system
- NPC portraits
- Location: `packages/ui/src/dialogue/`

### 3C: HUD
- Time display, fatigue, provisions
- Mini-map (optional)
- Quick actions
- Location: `packages/ui/src/hud/`

### 3D: Menus
- Inventory screen
- Party/stats screen
- Save/load
- Settings
- Location: `packages/ui/src/menus/`

## Phase 4: Integration (Sequential)

### 4A: Wire Overworld + Content
- Load town/route data into overworld
- Place town markers, route paths
- Trigger encounters

### 4B: Wire Combat + Encounters
- Encounter triggers combat screen
- Combat results affect game state
- Loot/XP rewards

### 4C: Wire UI + Game State
- All UI reads from Zustand store
- Actions dispatch to store
- Persistence (save/load)

## Phase 5: Polish (Parallel)

### 5A: Audio
- Music per area
- Combat music
- Sound effects

### 5B: Visual Effects
- Combat effects (hits, heals)
- Weather effects
- Transitions

### 5C: Mobile Port
- React Native UI adaptation
- Filament renderer setup
- Touch controls

### 5D: Testing & Balance
- Playtest full game
- Balance combat/economy
- Bug fixes

## File Structure

```
packages/
├── shared/
│   ├── src/
│   │   ├── data/
│   │   │   ├── world/           # World schemas & data
│   │   │   │   ├── schemas.ts   # Zod schemas
│   │   │   │   ├── towns/       # Town JSON files
│   │   │   │   ├── routes/      # Route JSON files
│   │   │   │   └── index.ts
│   │   │   ├── enemies/         # Enemy definitions
│   │   │   ├── items/           # Item definitions
│   │   │   └── quests/          # Quest definitions
│   │   ├── systems/
│   │   │   ├── time.ts          # Game clock
│   │   │   ├── fatigue.ts       # Fatigue system
│   │   │   ├── provisions.ts    # Food/water
│   │   │   ├── combat/          # Combat logic
│   │   │   └── index.ts
│   │   └── store/               # Zustand store
│
├── ui/
│   └── src/
│       ├── combat/              # Combat UI components
│       ├── dialogue/            # Dialogue components
│       ├── hud/                 # HUD components
│       └── menus/               # Menu screens
│
apps/
├── web/
│   └── src/
│       ├── engine/
│       │   └── overworld/       # Dynamic Terrain renderer
│       └── game/
│           └── scenes/          # Scene management
│
└── mobile/
    └── src/
        └── engine/              # Filament renderer
```

## Success Metrics

- [ ] Complete playthrough in ~3 hours
- [ ] All 6 towns explorable
- [ ] All 5 routes with encounters
- [ ] Main quest completable
- [ ] Combat feels responsive
- [ ] Day/night cycle visible
- [ ] Fatigue/provisions matter
- [ ] Runs on web (WebGPU)
- [ ] Runs on mobile (Filament)
