# GAME_SPEC.md -- Iron Frontier

> **SINGLE SOURCE OF TRUTH for game design.**
>
> Every feature in Iron Frontier begins here. The mandatory workflow is:
>
> ```
> spec section  ->  *.test.ts  ->  *.ts  ->  wire to game loop  ->  update spec status
> ```
>
> Nothing is implemented without a spec section. Nothing is specced without tests.
> Nothing is tested without implementation. Nothing is implemented without being wired up.

---

## Status Tags

| Tag | Meaning |
|-----|---------|
| `[PLANNED]` | Concept defined, not yet detailed enough to test |
| `[SPECCED]` | Acceptance criteria written, ready for tests |
| `[TESTED]` | Tests written and failing (red phase) |
| `[IMPLEMENTED]` | Tests passing, code complete |
| `[WIRED]` | Connected to game loop, UI, or store -- feature is live |

---

## Table of Contents

1. [Core Game Loop](#1-core-game-loop)
2. [Player Character](#2-player-character)
3. [Movement & Camera](#3-movement--camera)
4. [Combat System](#4-combat-system)
5. [Weapons & Tools](#5-weapons--tools)
6. [NPC System](#6-npc-system)
7. [Dialogue System](#7-dialogue-system)
8. [Quest System](#8-quest-system)
9. [Inventory & Equipment](#9-inventory--equipment)
10. [Shopping System](#10-shopping-system)
11. [Travel & Open World](#11-travel--open-world)
12. [Day/Night Cycle](#12-daynight-cycle)
13. [Survival System](#13-survival-system)
14. [Factions & Reputation](#14-factions--reputation)
15. [Town System](#15-town-system)
16. [Building Archetypes](#16-building-archetypes)
17. [Procedural Geometry Engine](#17-procedural-geometry-engine)
18. [Enemy Types (Monster Factory)](#18-enemy-types-monster-factory)
19. [Puzzles](#19-puzzles)
20. [Audio System](#20-audio-system)
21. [UI/HUD System](#21-uihud-system)
22. [Input System](#22-input-system)
23. [Save/Load System](#23-saveload-system)
24. [Performance Budgets](#24-performance-budgets)

---

## 1. Core Game Loop

**Status:** `[PLANNED]`

### Description

The player is a mysterious gunslinger who arrives in Dusty Springs following a cryptic letter. The game loop is a continuous cycle of first-person exploration, NPC interaction, quest progression, real-time combat, survival management, and travel between 14 authored towns. There is no turn-based combat -- all encounters are real-time FPS.

### Game Loop Diagram

```
  EXPLORE (town/wilderness)
      |
      v
  INTERACT (NPCs, objects, shops)
      |
      v
  QUEST (accept, progress, complete)
      |
      v
  COMBAT (real-time FPS encounters)
      |
      v
  SURVIVE (manage fatigue, provisions)
      |
      v
  TRAVEL (route to next town, random encounters)
      |
      v
  REPEAT
```

### Game Phases

The game progresses through these phases, managed by `coreSlice.phase`:

| Phase | Description |
|-------|-------------|
| `title` | Main menu: new game, continue, settings |
| `character_creation` | Player appearance conjuring |
| `playing` | Normal first-person exploration and interaction |
| `dialogue` | Active NPC conversation (UI overlay) |
| `combat` | Real-time FPS combat encounter |
| `shopping` | Browsing a shop (UI overlay) |
| `traveling` | In-transit between towns (travel scene) |
| `puzzle` | Active puzzle minigame |
| `inventory` | Viewing inventory/equipment (UI overlay) |
| `map` | Viewing world map (UI overlay) |
| `game_over` | Player died -- respawn or load save |
| `paused` | Game paused (settings, save, quit) |

### Acceptance Criteria

- [ ] Game starts at `title` phase with main menu
- [ ] New game transitions to `character_creation`, then `playing` in Dusty Springs
- [ ] Phase transitions are atomic -- no intermediate states
- [ ] All 12 phases are reachable during normal gameplay
- [ ] `game_over` phase triggers on player health reaching 0
- [ ] Pausing freezes all game systems (time, AI, physics)

### Implementation Notes

- Phase is stored in `coreSlice.phase` (Zustand)
- Phase transitions trigger via `setPhase(phase)` action
- R3F `useFrame` hooks check phase before ticking systems
- UI components conditionally render based on current phase
- Auto-save triggers on phase transitions to `traveling`, `combat`, `puzzle`

---

## 2. Player Character

**Status:** `[PLANNED]`

### Description

The player character is a mysterious gunslinger with a conjurable appearance, experienced entirely in first-person perspective. The player has core stats (HP, stamina, XP, level), equipment slots, faction reputation, and a gold currency. The character's appearance is visible only in menus and when other players/NPCs reference them.

### Player Stats

| Stat | Default | Per Level | Purpose |
|------|---------|-----------|---------|
| `health` | 100 | +10 to maxHealth | Survival -- death at 0 |
| `maxHealth` | 100 | +10 | Health cap |
| `stamina` | 100 | +5 to maxStamina | Sprint, melee, actions |
| `maxStamina` | 100 | +5 | Stamina cap |
| `xp` | 0 | Reset on level up | Progress toward next level |
| `xpToNext` | 100 | x1.5 scaling | XP threshold for level up |
| `level` | 1 | -- | Progression gate, damage scaling |
| `gold` | 50 | -- | Primary currency |
| `reputation` | 0 | -- | Global reputation score |

### Level Progression

```
Level 1:  0 XP (start)
Level 2:  100 XP
Level 3:  150 XP (1.5x)
Level 4:  225 XP
Level 5:  337 XP
Level 6:  506 XP
Level 7:  759 XP
Level 8:  1139 XP
Level 9:  1708 XP
Level 10: 2562 XP (max level)
```

On level up:
- Full HP restore
- maxHealth += 10, maxStamina += 5
- Notification displayed
- XP counter resets, xpToNext *= 1.5

### XP Sources

| Source | XP |
|--------|-----|
| Quest stage completion | 15-100 (per stage rewards) |
| Quest completion | 60-200 (per quest rewards) |
| Enemy defeated | 10-50 (per enemy xpReward) |
| Discover new location | 25-50 |
| Talk to new NPC | 10 |

### Equipment Slots

| Slot | Type | Effect |
|------|------|--------|
| `weapon` | Weapon item | Determines combat damage/range |
| `hat` | Armor (head) | Defense, appearance |
| `duster` | Armor (body) | Defense, appearance |
| `boots` | Armor (legs) | Defense, movement penalty |
| `accessory` | Accessory | Special effects, buffs |

### Acceptance Criteria

- [ ] Default player starts with stats from `DEFAULT_PLAYER_STATS`
- [ ] `gainXP(amount)` triggers level up when xp >= xpToNext
- [ ] Level up heals to full, increases maxHealth by 10, maxStamina by 5
- [ ] xpToNext scales at 1.5x per level
- [ ] `takeDamage(amount)` reduces health, floors at 0
- [ ] Health reaching 0 transitions to `game_over` phase
- [ ] `heal(amount)` caps at maxHealth
- [ ] `addGold` / `removeGold` work correctly; removeGold returns false if insufficient
- [ ] Equipment slots accept only matching item types
- [ ] Player name defaults to "Stranger"

### Implementation Notes

- State lives in `playerSlice` (Zustand)
- Stats defined in `src/game/store/slices/playerSlice.ts`
- Type definitions in `src/game/store/types.ts`
- Character appearance schema uses `CharacterAppearance` type
- Position tracked as `WorldPosition { x, y, z }` for 3D space

---

## 3. Movement & Camera

**Status:** `[PLANNED]`

### Description

First-person movement with standard FPS controls. The player moves through towns and wilderness using WASD (desktop), virtual joystick (mobile), or gamepad. Mouse/touch controls camera look. Sprint consumes stamina. Jump for traversal. Collision prevents walking through buildings and terrain.

### Movement Parameters

All values sourced from `config/game/` JSON -- no inline constants.

| Parameter | Value | Notes |
|-----------|-------|-------|
| Walk speed | 5.0 m/s | Base movement speed |
| Sprint speed | 8.0 m/s | While sprint input held and stamina > 0 |
| Jump height | 1.5 m | Single jump, no double jump |
| Gravity | -9.81 m/s^2 | Standard earth gravity |
| Player height | 1.7 m | Camera/collider height |
| Player radius | 0.3 m | Capsule collider radius |
| Stamina drain (sprint) | 15/s | Stamina consumed while sprinting |
| Stamina regen | 10/s | Passive regeneration when not sprinting |
| Camera FOV | 75 deg | Default field of view |

### Camera Behavior

- First-person camera attached to player position + eye height offset
- Mouse/touch look with configurable sensitivity
- Pitch clamped to [-85, +85] degrees (no full vertical rotation)
- Camera bob while walking: sinusoidal Y offset, amplitude scales with speed
- No camera bob while sprinting (steadied by intent)
- Smooth transition on entering/exiting dialogue (slight zoom)

### Collision

- Player has a capsule collider (Rapier physics)
- Buildings, terrain, and props have static colliders
- Collision response: slide along surfaces, no penetration
- Staircase support: player can walk up surfaces with slope <= 45 degrees

### Acceptance Criteria

- [ ] WASD/joystick moves player in camera-relative direction
- [ ] Mouse/touch rotates camera; pitch clamped at +-85 degrees
- [ ] Sprint key/button increases speed while stamina > 0
- [ ] Sprinting drains stamina at configured rate
- [ ] Stamina regenerates when not sprinting
- [ ] Jump applies upward impulse; player returns to ground via gravity
- [ ] Player cannot walk through buildings or terrain
- [ ] Player slides along walls (no sticky collision)
- [ ] Camera bob activates during walking, disabled during sprint
- [ ] Movement stops when game phase is not `playing`

### Implementation Notes

- Physics via `@react-three/rapier` -- `RigidBody` for player, `Collider` for world
- Camera controlled via `drei` `PointerLockControls` (desktop) or custom touch provider
- Movement reads `InputFrame.move` (from InputManager) each tick
- Sprint reads `InputFrame.sprint`
- Camera bob implemented as a `useFrame` hook modifying camera Y offset
- All movement parameters loaded from config JSON at startup

---

## 4. Combat System

**Status:** `[PLANNED]`

### Description

Real-time first-person shooter combat. The player aims and fires weapons at enemies in 3D space. Hit detection uses raycasting from camera center against enemy colliders. Damage calculation considers weapon stats, distance falloff, headshot multiplier, and enemy armor. Enemies use YUKA AI behaviors (patrol, pursue, take cover, flank).

### Combat Flow

```
1. Encounter triggers (travel, zone entry, quest event)
2. Phase transitions to 'combat'
3. Enemies spawn at authored positions
4. Player fights in real-time FPS
5. Combat ends when all enemies defeated, player dies, or player flees
6. Rewards granted on victory (XP, gold, loot)
7. Phase returns to 'playing' or 'traveling'
```

### Damage Formula

```
baseDamage = weapon.damage
levelBonus = floor(attackerLevel / 2)
distanceFalloff = max(0.2, 1.0 - (distance / weapon.range))
rawDamage = (baseDamage + levelBonus) * distanceFalloff

if headshot:
  rawDamage *= 2.0

if critical (10% base chance):
  rawDamage *= 2.0

finalDamage = max(1, rawDamage - targetArmor)
```

### Hit Detection

- Raycast from camera center (screen crosshair)
- Ray length limited by weapon range
- Hit registers against enemy collider meshes
- Headshot zone: upper 25% of enemy collider height
- Spread: ray direction offset by weapon `spread` value (radians, randomized per shot)
- Shotgun: multiple rays (5-8) within spread cone

### Weapon Stats (from `config/game/weapons.json`)

| Stat | Description |
|------|-------------|
| `damage` | Base damage per hit |
| `range` | Maximum effective range (meters) |
| `accuracy` | Base hit probability (0-100) |
| `fireRate` | Shots per second |
| `reloadTime` | Seconds to reload |
| `spread` | Bullet spread in radians |
| `ammoCapacity` | Rounds per magazine/cylinder |
| `ammoType` | Ammo category (pistol, rifle, shotgun, none) |

### Enemy AI Behaviors (YUKA)

| Behavior | Description |
|----------|-------------|
| `aggressive` | Charge at player, melee or close-range fire |
| `defensive` | Maintain distance, take cover, peek-and-shoot |
| `ranged` | Stay at max range, accurate fire, retreat if approached |
| `support` | Heal/buff allies, avoid direct combat |
| `patrol` | Pre-combat: follow waypoints, investigate sounds |
| `pursue` | Chase player when detected, limited pursuit range |
| `flee` | Run away when health drops below threshold |

### Acceptance Criteria

- [ ] Raycast from camera center detects hits on enemy colliders
- [ ] Damage scales with distance (falloff to 20% at max range)
- [ ] Headshot zone (top 25% of collider) applies 2x multiplier
- [ ] Critical hit rolls at 10% chance, applies 2x multiplier
- [ ] Armor subtracts from damage, minimum 1 damage
- [ ] Weapon fire rate limits shots per second
- [ ] Ammo decrements on fire; empty clip prevents firing
- [ ] Reload takes `reloadTime` seconds; ammo refills from inventory
- [ ] Enemy death grants XP and triggers loot roll
- [ ] Player death transitions to `game_over` phase
- [ ] All enemies defeated transitions to `victory` with reward grant
- [ ] Flee attempt succeeds 50% of the time (boss encounters cannot flee)
- [ ] Combat applies fatigue to survival system

### Implementation Notes

- Combat state tracked in `combatSlice` (Zustand)
- Existing turn-based combat in `combatSlice.ts` will be adapted to real-time
- Raycasting via Three.js `Raycaster` in `useFrame` hook
- Enemy AI via YUKA `Vehicle` entities with `SteeringBehavior`
- Weapon stats loaded from `config/game/weapons.json`
- Damage formula in `src/game/data/schemas/combat.ts` (adapt `calculateDamage`)
- Enemy definitions in `src/game/data/enemies/`
- Encounter definitions use `CombatEncounterSchema`
- Loot rolls use `LootTableSchema` from item schemas

---

## 5. Weapons & Tools

**Status:** `[PLANNED]`

### Description

The player carries weapons and tools, each rendered as a procedural FPS view model at the bottom of the screen. Weapons deal damage; tools serve exploration and utility purposes. The active weapon/tool can be switched via number keys, scroll wheel, or touch buttons.

### Weapon/Tool Catalog

| ID | Name | Type | Damage | Range | Fire Rate | Ammo | Notes |
|----|------|------|--------|-------|-----------|------|-------|
| `revolver` | Colt Peacemaker | revolver | 15 | 30m | 1.5/s | 6 | Starting weapon |
| `hunting_rifle` | Hunting Rifle | rifle | 30 | 120m | 0.5/s | 5 | Long range, slow |
| `repeater` | Repeating Rifle | rifle | 22 | 90m | 1.0/s | 12 | Balanced |
| `shotgun` | Shotgun | shotgun | 35 | 12m | 0.6/s | 5 | Devastating close range |
| `shotgun_coach` | Coach Gun | shotgun | 40 | 15m | 0.5/s | 2 | Double barrel |
| `dynamite` | Dynamite | explosive | 50 | 20m | 0.3/s | 1 | Area damage, consumable |
| `pickaxe` | Pickaxe | melee | 16 | 0m | 0.8/s | -- | Mining tool, context weapon |
| `hunting_knife` | Hunting Knife | knife | 8 | 0m | 2.0/s | -- | Fast melee |
| `lantern` | Lantern | tool | -- | -- | -- | -- | Light source at night |
| `lasso` | Lasso | tool | -- | 15m | -- | -- | Restrain targets |
| `fists` | Fists | melee | 5 | 0m | 2.5/s | -- | Always available |

### View Model Rendering

Each weapon/tool is procedurally built from Three.js primitives and rendered in a separate layer fixed to the camera:

| Weapon | Geometry |
|--------|----------|
| Revolver | Cylinder (barrel) + box (grip) + small cylinder (chamber) + trigger arc |
| Rifle | Long cylinder (barrel) + box (stock) + optional cylinder (scope) |
| Shotgun | Double cylinder (barrels) + box (stock) + cylinder (pump) |
| Dynamite | Cylinder (stick) + cone (fuse tip) + particle (spark) |
| Pickaxe | Cylinder (handle) + flat box (head) |
| Lantern | Wire frame (thin cylinders) + glowing sphere + chain |
| Lasso | Torus (loop) + cylinder (rope coil) |
| Fists | Two sphere-capped cylinders |

### View Model Animations

| Animation | Trigger | Description |
|-----------|---------|-------------|
| Idle sway | Always | Gentle sine wave, linked to camera movement |
| Fire recoil | On fire | Kick-back + spring return |
| Reload | On reload | Weapon-specific (revolver: cylinder swing, rifle: bolt pull) |
| Switch | On weapon change | Lower current, raise new (0.3s each) |
| Sprint tuck | While sprinting | Weapon lowers and tilts to side |

### Context-Dependent Tool Selection

- Pickaxe auto-equips near ore veins or mineable surfaces
- Lantern auto-equips at night or in dark interiors (caves, mines)
- Player can manually override any auto-selection

### Acceptance Criteria

- [ ] All 11 weapons/tools render as procedural view models
- [ ] View model is fixed to camera, rendered in separate Three.js layer
- [ ] Idle sway animation tracks camera movement velocity
- [ ] Fire recoil plays on shoot; weapon returns to idle
- [ ] Reload animation plays for `reloadTime` duration
- [ ] Weapon switch animation: lower (0.3s) + raise (0.3s)
- [ ] Sprint tuck animation activates during sprint
- [ ] Number keys 1-8 switch weapons; scroll wheel cycles
- [ ] Dynamite is consumable (removed from inventory on throw)
- [ ] Pickaxe auto-equips near ore; lantern auto-equips in dark
- [ ] Fists are always available regardless of inventory

### Implementation Notes

- View models in `engine/renderers/WeaponViewModel.ts`
- Rendered in a separate `drei` layer (`<Layer>`) not affected by world lighting
- Animations via `useFrame` spring interpolation (not keyframe)
- Weapon stats loaded from `config/game/weapons.json`
- Currently equipped weapon tracked in `inventorySlice.equipment.weapon`
- Tool context detection checks nearby ECS entities and time-of-day

---

## 6. NPC System

**Status:** `[PLANNED]`

### Description

NPCs are chibi-style characters built from Three.js primitives. Each NPC has a role (lawman, merchant, outlaw, etc.), faction membership, personality traits, daily schedule, and dialogue trees. NPCs are authored per-town -- they are not procedurally generated at runtime.

### NPC Roles

| Role | Function | Shops | Quest Giver |
|------|----------|-------|-------------|
| `sheriff` | Law enforcement, bounties | No | Yes |
| `deputy` | Assists sheriff | No | Occasionally |
| `mayor` | Town authority | No | Yes |
| `merchant` | General goods trade | Yes | Occasionally |
| `bartender` | Saloon keeper, rumors | Yes (drinks) | Yes |
| `banker` | Money services | Yes (loans) | Occasionally |
| `blacksmith` | Weapons, repairs | Yes | Occasionally |
| `doctor` | Healing, medicine | Yes | Yes |
| `preacher` | Spiritual guidance | No | Occasionally |
| `undertaker` | Death services | No | Occasionally |
| `rancher` | Cattle, livestock | Yes | Yes |
| `miner` | Mining labor | No | Occasionally |
| `prospector` | Claim holder | No | Yes |
| `outlaw` | Criminal activity | No (black market) | Yes |
| `gang_leader` | Outlaw boss | No | Yes |
| `bounty_hunter` | Hunt targets | No | Yes |
| `drifter` | Wanderer | No | Occasionally |
| `gambler` | Card games | No | Occasionally |
| `townsfolk` | Ambient population | No | Rarely |

### NPC Visual Construction (Chibi Style)

Built from primitive shapes with canvas-painted features:

- **Head:** Oversized sphere (~40% of body height), canvas-painted face (eyes, mouth, expression)
- **Body:** Rounded box, canvas-painted clothing (vest, shirt, apron, badge, holster)
- **Arms/Legs:** Small cylinders with simple bend animations
- **Accessories:** Hat (cylinder/cone combo), gun holster (small box), bag (box), badge (disk)
- **Scale:** ~1.2m tall (chibi proportions in 1.7m player world)

### Personality Traits

Each NPC has 6 personality axes (0.0 - 1.0), defined per `NPCPersonalitySchema`:

| Trait | Low | High |
|-------|-----|------|
| `aggression` | Pacifist | Violent |
| `friendliness` | Cold | Warm |
| `curiosity` | Incurious | Nosy |
| `greed` | Generous | Avaricious |
| `honesty` | Deceitful | Truthful |
| `lawfulness` | Outlaw | Law-abiding |

Personality affects: dialogue entry points, available choices, shop prices, quest availability.

### Daily Schedules

NPCs follow time-based schedules that place them at specific markers in their town:

| Time | Activity | Location |
|------|----------|----------|
| 00:00-06:00 | Sleep | Residence bed marker |
| 06:00-07:00 | Wake/eat | Residence or saloon |
| 07:00-12:00 | Work | Workplace (shop, office, mine) |
| 12:00-13:00 | Lunch | Saloon or home |
| 13:00-18:00 | Work | Workplace |
| 18:00-20:00 | Socialize | Saloon |
| 20:00-22:00 | Evening | Residence or church |
| 22:00-00:00 | Sleep | Residence |

Schedule templates vary by role (e.g., bartenders work evenings, sheriffs patrol).

### Acceptance Criteria

- [ ] NPCs render as chibi primitives with canvas-painted features
- [ ] Each NPC has a defined role, faction, personality, and location
- [ ] NPCs follow daily schedules, moving between markers by time-of-day
- [ ] NPCs face the player when within interaction range
- [ ] Interaction trigger: player within 3m + interact input
- [ ] NPC data loaded from authored town definitions (not procedural)
- [ ] Essential NPCs (quest-critical) cannot die
- [ ] NPC appearance varies by role (hat style, clothing color, accessories)
- [ ] Hostile faction NPCs attack on sight when reputation is low enough

### Implementation Notes

- NPC definitions use `NPCDefinitionSchema` from `src/game/data/schemas/npc.ts`
- NPCs are ECS entities (Miniplex) -- dynamic, spawned per-town on zone entry
- Appearance generated by `CharacterGenerator.ts` using role + faction + seeded RNG
- Schedule templates from `ScheduleTemplateSchema` in generation schemas
- AI navigation via YUKA `Vehicle` with waypoint following
- Town NPC rosters defined inline in location files (e.g., `dusty_springs.ts`)
- Canvas textures cached per NPC archetype (role + faction) to avoid per-frame regeneration

---

## 7. Dialogue System

**Status:** `[PLANNED]`

### Description

Tree-based dialogue with branching choices. When the player interacts with an NPC, the dialogue UI overlays the game view. NPC text appears with a typewriter effect. The NPC's expression changes based on dialogue node tags. Player choices are gated by conditions (reputation, quest state, items). Choices can trigger effects (start quest, give item, change reputation).

### Dialogue Structure

```
DialogueTree
  ├── entryPoints[] (condition-gated starting nodes)
  └── nodes[]
        ├── id
        ├── text (NPC spoken text)
        ├── expression (angry, happy, suspicious, neutral)
        ├── choices[]
        │     ├── text (player choice text)
        │     ├── conditions[] (reputation, quest, item gates)
        │     ├── effects[] (start quest, give item, change rep)
        │     └── nextNodeId (null = end conversation)
        ├── nextNodeId (auto-advance for monologues)
        └── onEnterEffects[] (triggered when node is shown)
```

### Entry Point Resolution

When dialogue starts, the system evaluates entry points in priority order:

1. Check quest-specific entry points (e.g., "return with item")
2. Check reputation-gated entries (e.g., hostile greeting if reputation < -50)
3. Check time-of-day entries (e.g., "bar's closed" at night for non-bartender)
4. Check first-meeting vs return-visit entries
5. Fall back to default greeting

### Condition Types

| Condition | Description |
|-----------|-------------|
| `quest_active` | Player has quest in progress |
| `quest_complete` | Player has completed quest |
| `quest_not_started` | Player hasn't started quest |
| `has_item` | Player has specific item |
| `lacks_item` | Player doesn't have item |
| `reputation_gte` | Faction reputation >= threshold |
| `reputation_lte` | Faction reputation <= threshold |
| `gold_gte` | Player gold >= amount |
| `talked_to` | Has spoken to specific NPC before |
| `not_talked_to` | Hasn't spoken to specific NPC |
| `time_of_day` | Current time period matches |
| `flag_set` | Custom flag is set |
| `flag_not_set` | Custom flag is not set |
| `first_meeting` | First conversation with this NPC |
| `return_visit` | Not the first conversation |

### Effect Types

| Effect | Description |
|--------|-------------|
| `start_quest` | Begin a quest |
| `complete_quest` | Mark quest complete |
| `advance_quest` | Update quest objective |
| `give_item` | Add item to player inventory |
| `take_item` | Remove item from player |
| `give_gold` | Award gold |
| `take_gold` | Charge gold |
| `change_reputation` | Modify faction reputation |
| `set_flag` | Set a conversation/world flag |
| `clear_flag` | Clear a flag |
| `unlock_location` | Reveal a location on the map |
| `change_npc_state` | Modify NPC disposition |
| `trigger_event` | Trigger a world event |
| `open_shop` | Open the NPC's shop interface |

### Typewriter Effect

- NPC text appears character by character
- Speed: 30 characters per second (configurable)
- Player can tap/click to instantly reveal all text
- After text fully revealed, choices appear
- `choiceDelay` on node can add dramatic pause before choices

### Expression System

NPC portrait/face expression changes based on `expression` field on dialogue nodes:

| Expression | Visual Change |
|------------|--------------|
| `neutral` | Default face texture |
| `happy` | Upturned mouth, bright eyes |
| `angry` | Furrowed brows, frown |
| `suspicious` | Narrowed eyes, slight frown |
| `sad` | Downturned mouth, drooping eyes |
| `surprised` | Wide eyes, open mouth |
| `scared` | Wide eyes, trembling jaw line |

### Acceptance Criteria

- [ ] Dialogue opens when player interacts with NPC in range
- [ ] Entry point selected based on conditions (priority order)
- [ ] NPC text displays with typewriter effect at 30 chars/sec
- [ ] Tap/click skips typewriter to full text
- [ ] Choices appear after text is fully revealed (respecting `choiceDelay`)
- [ ] Choices hidden if their conditions are not met
- [ ] Selecting a choice triggers its effects (quest, item, reputation, etc.)
- [ ] Selecting a choice navigates to `nextNodeId` (null ends dialogue)
- [ ] NPC expression changes per node's `expression` field
- [ ] Dialogue history is tracked (visited nodes stored in `dialogueSlice`)
- [ ] Phase transitions to `dialogue` on open, back to `playing` on close
- [ ] `onEnterEffects` fire when a node is first displayed
- [ ] All dialogue trees pass integrity validation (no dangling references)

### Implementation Notes

- Dialogue schemas in `src/game/data/schemas/npc.ts`
- Runtime state in `dialogueSlice` (Zustand)
- Dialogue trees loaded from `src/game/data/npcs/` per NPC
- Condition checking via `getDialogueEntryNode()` and `getAvailableChoices()`
- Integrity validation via `validateDialogueTreeIntegrity()`
- UI component: `components/game/DialogueBox.tsx`
- Typewriter effect via `useEffect` interval with character counter

---

## 8. Quest System

**Status:** `[PLANNED]`

### Description

Multi-stage quest chains with tracked objectives. The game has 3 main quest lines plus side quests. Each quest has ordered stages, each stage has one or more objectives that can be completed in any order. Rewards are granted per-stage and on quest completion. Quests are data-driven -- defined in `src/game/data/quests/`.

### Quest Types

| Type | Description | Example |
|------|-------------|---------|
| `main` | Core storyline, drives narrative | "The Inheritance" |
| `side` | Optional, enriches world | "Missing Cattle", "Doc's Dilemma" |
| `faction` | Builds faction reputation | Faction-specific chains |
| `bounty` | Kill specific target | Posted at sheriff offices |
| `delivery` | Transport item between locations | NPC-to-NPC delivery |
| `exploration` | Discover locations | Mapmaker quests |

### Objective Types

| Type | Player Action | Target |
|------|--------------|--------|
| `kill` | Defeat enemies | Enemy ID or type |
| `collect` | Gather items | Item ID |
| `talk` | Speak to NPC | NPC ID |
| `visit` | Reach location | Location or marker ID |
| `interact` | Use/activate object | Interactable ID |
| `deliver` | Bring item to NPC/place | Item ID + `deliverTo` NPC ID |

### Quest Lifecycle

```
available -> active -> completed
                   \-> failed
                   \-> abandoned
```

1. Quest becomes `available` when prerequisites are met
2. Player accepts quest (via dialogue or auto-trigger) -> `active`
3. Player completes objectives within current stage
4. When all required objectives in stage complete, stage advances
5. When final stage completes, quest moves to `completed`
6. Rewards granted per-stage and on completion
7. Completed quests can unlock new quests via `rewards.unlocksQuests`

### Current Quest Content

**Main Quest: "The Inheritance"** (`main_the_inheritance`)
- 4 stages: Arrival -> Investigation -> Sheriff -> Freeminers
- Starts in Dusty Springs, leads to Freeminer's Hollow
- Introduces IVRC conspiracy and player's parent's legacy
- Unlocks: "The Reclamation" (Act 2)

**Side Quest: "Missing Cattle"** (`side_missing_cattle`)
- 3 stages: Investigate -> Confront Rustlers -> Report
- Starts at Sunset Ranch with Silas Blackwood
- Involves Copperhead Gang, combat encounters
- Rewards: 75 XP, 75 gold, Blackwood Rifle

**Side Quest: "Doc's Dilemma"** (`side_docs_dilemma`)
- 3 stages: Get List -> Acquire Supplies (choice) -> Deliver
- Starts in Dusty Springs with Doc Chen Wei
- Player chooses: Junction City (safe, expensive) or Coppertown (cheap, risky)
- Rewards: 60 XP, 40 gold, 3 Healing Tonics

### Acceptance Criteria

- [ ] Quests become available when `prerequisites` are met (quests, level, items, reputation)
- [ ] Active quest tracks objective progress per-stage
- [ ] Objectives complete when `current >= count`
- [ ] Stage auto-advances when all required (non-optional) objectives complete
- [ ] `onStartText` displays when stage begins
- [ ] `onCompleteText` displays when stage completes
- [ ] Stage rewards granted on stage completion (XP, gold, items, reputation)
- [ ] Quest completion grants final rewards and unlocks next quests
- [ ] Optional objectives can be skipped without blocking progress
- [ ] Hidden objectives (`hidden: true`) only appear after discovery trigger
- [ ] Map markers display for objectives that have `mapMarker` data
- [ ] Quest log UI shows active quests with current stage and objectives
- [ ] `isStageComplete()` and `isQuestComplete()` utilities work correctly

### Implementation Notes

- Quest schemas in `src/game/data/schemas/quest.ts`
- Quest definitions in `src/game/data/quests/index.ts`
- Runtime state in `questSlice` (Zustand) using `ActiveQuestSchema`
- Utility functions: `isStageComplete()`, `isQuestComplete()`, `createActiveQuest()`
- Lookup functions: `getQuestById()`, `getQuestsAtLocation()`, `getQuestsByNPC()`
- Prerequisites checked via `arePrerequisitesMet()`
- Quest UI: `components/game/QuestLog.tsx`

---

## 9. Inventory & Equipment

**Status:** `[PLANNED]`

### Description

Grid-based inventory with limited slots. Items are categorized (weapons, armor, consumables, key items, junk, currency). Equipment slots determine the player's combat effectiveness and appearance. Items can be used, equipped, dropped, and sold.

### Item Categories

| Category | Stackable | Usable | Droppable | Sellable | Notes |
|----------|-----------|--------|-----------|----------|-------|
| `weapon` | No | No (equip) | Yes | Yes | Fills weapon equipment slot |
| `armor` | No | No (equip) | Yes | Yes | Fills head/body/legs slot |
| `consumable` | Yes (99) | Yes | Yes | Yes | Heals, buffs, provisions |
| `key_item` | No | Varies | No | No | Quest-critical items |
| `junk` | Yes (99) | No | Yes | Yes | Sell for gold |
| `currency` | Yes (99) | No | No | No | Alternate currencies |

### Item Rarity

| Rarity | Color | Drop Rate | Sell Multiplier |
|--------|-------|-----------|-----------------|
| Common | `#95A5A6` (gray) | 55% | 1.0x |
| Uncommon | `#27AE60` (green) | 30% | 2.0x |
| Rare | `#9B59B6` (purple) | 12% | 5.0x |
| Legendary | `#FFD700` (gold) | 3% | 10.0x |

### Inventory Constraints

- Maximum 20 inventory slots (configurable)
- Stackable items share a slot up to `maxStack` (default 99)
- Non-stackable items (weapons, armor, key items) take one slot each
- Inventory full: cannot pick up new items (notification)

### Equipment System

Equipping an item:
1. Item must match the equipment slot type
2. If slot occupied, currently equipped item returns to inventory
3. If inventory full and slot occupied, equip fails (notification)
4. Equipment stats apply immediately (defense, weapon damage)

### Acceptance Criteria

- [ ] Inventory holds up to 20 slots
- [ ] Stackable items merge into existing stacks
- [ ] Non-stackable items occupy individual slots
- [ ] Cannot pick up items when inventory is full
- [ ] Equipping an item removes it from inventory and fills the slot
- [ ] Unequipping returns item to inventory (fails if inventory full)
- [ ] Using a consumable applies its effects and decrements quantity
- [ ] Key items cannot be dropped or sold
- [ ] Item rarity affects display color
- [ ] `condition` field tracks weapon/armor degradation (0-100)
- [ ] Loot tables roll items with weighted rarity probabilities

### Implementation Notes

- Item schemas in `src/game/data/schemas/item.ts`
- Runtime state in `inventorySlice` (Zustand)
- Equipment state tracks slot -> instance ID mapping
- Item definitions loaded from `src/game/data/items/`
- Loot tables use `LootTableSchema` with weighted rolls
- Inventory UI: `components/game/InventoryPanel.tsx`
- Type guards: `isWeapon()`, `isArmor()`, `isConsumable()`, `isKeyItem()`

---

## 10. Shopping System

**Status:** `[PLANNED]`

### Description

Buy and sell items at town shops. Each shop has a per-town inventory determined by shop type (general store, gunsmith, apothecary, etc.). Prices are influenced by the player's faction reputation with the shop's faction. Shops restock over time.

### Shop Types

| Type | Sells | Buys |
|------|-------|------|
| `general_store` | Consumables, provisions, junk | Everything |
| `gunsmith` | Weapons, ammo | Weapons, ammo |
| `apothecary` | Medicine, tonics, antidotes | Consumables |
| `blacksmith` | Melee weapons, tools, repairs | Weapons, armor |
| `saloon` | Drinks, food, rumors | Nothing |
| `trading_post` | Mixed goods, rare items | Everything |
| `specialty` | Unique per-town items | Related items |

### Pricing Formula

```
buyPrice  = item.value * shop.buyMultiplier * reputationModifier
sellPrice = item.value * shop.sellMultiplier * reputationModifier

reputationModifier:
  hostile (rep < -50):  1.5x buy, 0.3x sell
  unfriendly (-50..0):  1.2x buy, 0.4x sell
  neutral (0..25):      1.0x buy, 0.5x sell
  friendly (25..75):    0.9x buy, 0.6x sell
  allied (75+):         0.8x buy, 0.7x sell
```

### Shop Inventory

- Each shop has a base item pool defined by `ShopInventoryTemplateSchema`
- Items roll with rarity weights (common 70%, uncommon 25%, rare 4%, legendary 1%)
- Shops restock every 24 game-hours
- Some items are always in stock (ammo, basic provisions)
- Rare/legendary items may not reappear after purchase

### Acceptance Criteria

- [ ] Shop UI opens when player selects "Shop" in NPC dialogue
- [ ] Shop displays available items with buy prices
- [ ] Player inventory displayed alongside for sell options
- [ ] Buy deducts gold, adds item to inventory (fails if inventory full or insufficient gold)
- [ ] Sell adds gold, removes item from inventory
- [ ] Prices modified by faction reputation
- [ ] Key items cannot be sold
- [ ] Shop inventory restocks after 24 game-hours
- [ ] Per-town inventories: Dusty Springs general store differs from Coppertown's
- [ ] Phase transitions to `shopping` on open, back to `dialogue` or `playing` on close

### Implementation Notes

- Shop templates from `ShopInventoryTemplateSchema` in generation schemas
- Runtime state in `shopSlice` (Zustand)
- Faction reputation pulled from `playerSlice.playerStats.reputation` (per faction)
- Shop data per-town in `src/game/data/shops/`
- Price modifiers from `FactionReactionTemplateSchema`
- Shop UI: `components/game/ShopPanel.tsx`

---

## 11. Travel & Open World

**Status:** `[PLANNED]`

### Description

14 authored towns connected by open terrain. The player travels between towns via authored routes through desert, canyon, and mountain biomes. Travel is not instant -- the player physically moves through open-world terrain (or a travel scene plays). Random encounters trigger based on route danger level, distance, and time of day.

### World Map

13 authored locations (plus Test Town for development) connected by routes:

| Location | Type | Region | Danger | Level |
|----------|------|--------|--------|-------|
| Dusty Springs | town | Central Plains | safe | 1 |
| Junction City | city | Central Plains | low | 2 |
| Coppertown | town | Iron Hills | moderate | 3 |
| Copper Mine | mine | Iron Hills | high | 4 |
| Rattlesnake Canyon | hideout | Badlands | extreme | 5 |
| Signal Rock | outpost | High Desert | moderate | 3 |
| Desert Waystation | waystation | High Desert | low | 2 |
| Sunset Ranch | ranch | Green Valley | low | 2 |
| Prospect | town | Gold Country | moderate | 3 |
| Freeminer Hollow | camp | Iron Mountains | moderate | 3 |
| Old Works | ruins | Deep Mountain | high | 5 |
| Thornwood Station | outpost | Forest Edge | moderate | 3 |
| Dusty Gulch | town | Starting Area | safe | 1 |

### Travel Routes

Routes are authored paths with:
- Travel method: `road`, `trail`, `wilderness`, `railroad`
- Travel time in game-hours
- Danger level affecting encounter frequency
- Bidirectional by default (some one-way paths exist)

### Random Encounters During Travel

Encounter triggering based on `EncounterSystem.ts`:
- Step-based trigger: chance per movement step in encounter zone
- Base rate modified by route danger level
- Time-of-day modifiers (night = more dangerous)
- Minimum steps between encounters (prevents spam)
- Repel items reduce encounter rate

### Acceptance Criteria

- [ ] World map displays all discovered locations with connections
- [ ] Player can select a destination and begin travel
- [ ] Travel takes game-time proportional to route distance
- [ ] Travel scene shows terrain appropriate to route biome
- [ ] Random encounters trigger based on danger level and step count
- [ ] Encounters interrupt travel; victory resumes, defeat/flee returns to origin
- [ ] Provisions consumed during travel (see Survival System)
- [ ] Fatigue accumulates during travel
- [ ] New locations discovered when visited for first time
- [ ] Railroad travel is faster and safer than trail/wilderness
- [ ] Phase transitions to `traveling` during travel, `combat` on encounter
- [ ] Travel auto-saves on departure

### Implementation Notes

- World structure in `src/game/data/worlds/frontier_territory.ts`
- Location definitions in `src/game/data/locations/`
- Route connections use `ConnectionSchema` from world schemas
- Travel state in `travelSlice` (Zustand)
- Encounter system in `src/game/systems/EncounterSystem.ts`
- Terrain rendering via chunk-based heightmap (`engine/renderers/`)
- Open world terrain: only render 3x3 chunk grid around player
- World map UI: `components/game/WorldMap.tsx`

---

## 12. Day/Night Cycle

**Status:** `[PLANNED]`

### Description

24-hour game time cycle with visual transitions. Time affects sky color, lighting, NPC schedules, encounter rates, and certain quest availability. Time passes during gameplay and travel. The player can rest to skip time.

### Time Periods

| Period | Hours | Sky | Light |
|--------|-------|-----|-------|
| Dawn | 05:00-07:00 | Pink/orange gradient | Warm directional, rising |
| Morning | 07:00-11:00 | Light blue | Bright directional |
| Noon | 11:00-14:00 | Pale blue, harsh | Maximum brightness, short shadows |
| Afternoon | 14:00-17:00 | Blue | Bright directional, lengthening shadows |
| Dusk | 17:00-19:00 | Orange/purple gradient | Warm, low angle |
| Evening | 19:00-21:00 | Deep purple/dark blue | Dim ambient, street lamps activate |
| Night | 21:00-05:00 | Dark blue/black, stars | Moonlight ambient, point lights from buildings |

### Time Flow

- 1 real second = `config/game/time.json` game minutes (default: 1 real sec = 2 game min)
- Full day/night cycle: ~12 real minutes
- Time pauses during: dialogue, inventory, map, puzzle, paused
- Time continues during: playing, combat, traveling

### Lighting Changes

- **Sun:** Directional light orbiting scene, color temperature shifts warm->cool->warm
- **Moon:** Dimmer directional light, blue-white, active during night
- **Ambient:** Color temperature shifts throughout day
- **Point lights:** Town lamps, building windows, campfires activate at dusk
- **Player lantern:** Point light on camera, player-activated or auto in dark areas

### NPC Schedule Effects

- NPCs change location based on time period (see Section 6)
- Shops close at night (20:00-07:00)
- Saloons peak activity at evening (18:00-22:00)
- Some NPCs only available at specific times

### Acceptance Criteria

- [ ] Time advances continuously during active gameplay
- [ ] Sky gradient interpolates between period colors smoothly
- [ ] Sun directional light orbits scene matching time of day
- [ ] Shadows rotate and lengthen/shorten with sun position
- [ ] Point lights (lamps, windows) activate at dusk, deactivate at dawn
- [ ] NPC positions update when time period changes
- [ ] Encounter rates increase at night (per `timeModifiers` in encounter zones)
- [ ] Time pauses during UI overlay phases (dialogue, inventory, map)
- [ ] Player can check current time via HUD
- [ ] Rest/sleep advances time to next morning (see Survival System)

### Implementation Notes

- Time system in `src/game/systems/time.ts`
- Time stored in `coreSlice` as game-hour float (0.0 - 24.0)
- Time config in `config/game/time.json`
- Sky rendering via R3F shader or `drei` `<Sky>` component with time-driven parameters
- Sun/moon as directional lights with position calculated from time
- Point light activation via time check in building archetype renderers
- NPC schedule lookup in `ScheduleTemplateSchema`

---

## 13. Survival System

**Status:** `[PLANNED]`

### Description

Three survival mechanics add tension to exploration and travel: fatigue (need for rest), provisions (food/water consumption during travel), and camping (rest in the wilderness). These create resource management decisions without being punishing -- the frontier is tough but fair.

### Fatigue

| Mechanic | Value | Notes |
|----------|-------|-------|
| Max fatigue | 100 | 0 = rested, 100 = exhausted |
| Passive drain | 1/game-hour | Natural fatigue accumulation |
| Sprint drain | 2/game-hour (extra) | On top of passive |
| Combat fatigue | +10-20 per encounter | Based on encounter intensity |
| Travel fatigue | +5/game-hour traveled | Accumulates during travel |
| Rest at inn | Sets to 0 | Costs gold, advances time to morning |
| Camp rest | Sets to 25 | Free, advances time 6 hours |
| Exhaustion penalty | Fatigue > 80 | -20% move speed, -10% accuracy |

### Provisions

| Mechanic | Value | Notes |
|----------|-------|-------|
| Food capacity | 10 units | Carried food supply |
| Water capacity | 10 units | Carried water supply |
| Travel consumption | 1 food + 1 water per 4 game-hours | During travel between towns |
| No food penalty | -5 HP per game-hour | Starvation damage |
| No water penalty | -10 HP per game-hour | Dehydration damage (faster) |
| Purchase at shops | General stores sell provisions | Varies by town |
| Springs/wells | Refill water for free | At water source markers |

### Camping

- Player can camp in wilderness to rest (reduces fatigue to 25)
- Camping advances time by 6 game-hours
- Random encounter possible during camp (lower chance than travel)
- Campfire provides warmth and light (point light)
- Camp uses 1 food + 1 water

### Acceptance Criteria

- [ ] Fatigue increases passively over time during gameplay
- [ ] Sprint increases fatigue drain rate
- [ ] Combat adds fatigue based on encounter intensity
- [ ] Travel adds fatigue proportional to travel duration
- [ ] Fatigue > 80 applies movement and accuracy penalties
- [ ] Resting at an inn resets fatigue to 0, advances to morning, costs gold
- [ ] Camping reduces fatigue to 25, advances time 6 hours
- [ ] Provisions deplete during travel (1 food + 1 water per 4 game-hours)
- [ ] No food: -5 HP per game-hour
- [ ] No water: -10 HP per game-hour
- [ ] Water refills at spring/well markers for free
- [ ] Provisions purchasable at general stores
- [ ] Survival stats displayed on HUD

### Implementation Notes

- Fatigue system in `src/game/systems/fatigue.ts`
- Provisions system in `src/game/systems/provisions.ts`
- Camping system in `src/game/systems/camping.ts`
- Survival state in `src/game/systems/survivalStore.ts` or dedicated slice
- Config values in `config/game/survival.json`
- HUD display: fatigue bar, food/water icons with counts

---

## 14. Factions & Reputation

**Status:** `[PLANNED]`

### Description

5 factions control different aspects of the frontier. The player's actions affect their standing with each faction. Reputation gates quests, dialogue options, shop prices, and NPC hostility.

### Factions

| Faction | ID | Theme | Territory |
|---------|----|-------|-----------|
| Lawmen | `law` | Order, justice, authority | Towns with sheriff offices |
| Copperhead Gang | `copperhead` | Crime, robbery, freedom | Rattlesnake Canyon, wilderness |
| Iron Valley Railroad Company (IVRC) | `ivrc` | Corporate power, progress | Junction City, railroad towns |
| Freeminer Coalition | `freeminer` | Independence, labor rights | Freeminer Hollow, mines |
| Rancher Alliance | `ranch` | Tradition, land ownership | Sunset Ranch, grasslands |

### Reputation Scale

| Range | Tier | Effects |
|-------|------|---------|
| -100 to -50 | Hostile | NPCs attack on sight, shops refuse service |
| -50 to -1 | Unfriendly | Higher prices, limited dialogue, some quests locked |
| 0 to 24 | Neutral | Default state, no modifiers |
| 25 to 74 | Friendly | Better prices, new dialogue options, faction quests |
| 75 to 100 | Allied | Best prices, exclusive quests, faction safe houses |

### Reputation Changes

| Action | Effect |
|--------|--------|
| Complete faction quest | +15 to +50 with quest faction |
| Kill faction member | -25 to -50 with their faction |
| Help faction enemy | -10 to -25 with opposing faction |
| Donate gold to faction | +5 per 50 gold |
| Complete bounty (law) | +10 law, -5 copperhead |
| Rob a shop | -20 law, +5 copperhead |

### Faction Relations

Factions have inter-faction relationships that cause reputation spillover:

| Action affects | Law | Copperhead | IVRC | Freeminer | Ranch |
|---------------|-----|------------|------|-----------|-------|
| +Law | -- | -0.3x | +0.2x | 0 | +0.1x |
| +Copperhead | -0.3x | -- | -0.2x | 0 | -0.1x |
| +IVRC | +0.1x | -0.1x | -- | -0.3x | -0.1x |
| +Freeminer | 0 | 0 | -0.3x | -- | +0.1x |
| +Ranch | +0.1x | -0.1x | -0.1x | +0.1x | -- |

### Acceptance Criteria

- [ ] 5 factions tracked independently in player state
- [ ] Reputation changes from quest rewards, kills, dialogue choices
- [ ] Reputation spillover applies based on faction relations matrix
- [ ] Hostile faction NPCs attack player on sight
- [ ] Shop prices modified by faction reputation tier
- [ ] Certain dialogue choices locked/unlocked by reputation
- [ ] Faction quests require minimum reputation to accept
- [ ] Reputation displayed in character panel per-faction
- [ ] Reputation can go negative (minimum -100) and positive (maximum 100)

### Implementation Notes

- Reputation stored per-faction in `playerSlice.playerStats` (or dedicated map)
- Faction config in `config/game/factions.json`
- Reputation thresholds from `FactionReactionTemplateSchema`
- Spillover calculated when any faction reputation changes
- Dialogue conditions check `reputation_gte` / `reputation_lte`
- Shop price modifiers applied in shopping system calculations
- NPC hostility checked via ECS system on player proximity

---

## 15. Town System

**Status:** `[PLANNED]`

### Description

14 hand-crafted towns, each with unique buildings, NPCs, shops, quest hooks, and faction presence. Towns are authored as Location objects with exact building placement, slot assignments, markers, and zones. They are not procedurally generated.

### Town Registry

| Town | ID | Type | Size | Theme | Starting Faction |
|------|----|------|------|-------|-----------------|
| Dusty Springs | `dusty_springs` | town | medium | Frontier optimism vs corporate corruption | Neutral (IVRC encroaching) |
| Junction City | `junction_city` | city | large | Railroad hub, commerce center | IVRC stronghold |
| Coppertown | `coppertown` | town | medium | Mining settlement, company town | IVRC controlled |
| Copper Mine | `copper_mine` | mine | small | Active mining operation | IVRC/Freeminer contested |
| Rattlesnake Canyon | `rattlesnake_canyon` | hideout | small | Outlaw stronghold | Copperhead Gang |
| Signal Rock | `signal_rock` | outpost | small | Telegraph relay, high desert | Neutral |
| Desert Waystation | `desert_waystation` | waystation | tiny | Remote rest stop | Neutral |
| Sunset Ranch | `sunset_ranch` | ranch | medium | Cattle ranch, pastoral | Rancher Alliance |
| Prospect | `prospect` | town | medium | Gold rush boom town | Freeminer/Neutral |
| Freeminer Hollow | `freeminer_hollow` | camp | small | Independent miners' settlement | Freeminer Coalition |
| Old Works | `old_works` | ruins | medium | Abandoned factory/dungeon | Hostile (Remnant) |
| Thornwood Station | `thornwood_station` | outpost | small | Forest edge outpost | Neutral |
| Test Town | `test_town` | town | small | Development/testing only | -- |

### Town Data Structure

Each town is a `Location` object (from `LocationSchema`) containing:

- **Assemblages:** References to building templates placed at specific coordinates
- **Slots:** Functional areas (tavern, law_office, general_store, etc.)
- **Markers:** Named points for NPC spawning, interaction, and quest events
- **Zones:** Areas for loot, NPC wandering, combat, and decoration
- **Entry points:** Where the player arrives from different routes
- **Atmosphere:** Danger level, wealth level, population density, lawfulness

### Key Town: Dusty Springs (Starting Town)

The player's first location. Contains:
- Rusty Spur Saloon (tavern, social hub)
- Sheriff's Office (law_office, quest giver)
- General Store (general_store, provisions)
- Doc's Clinic (doctor, healing)
- Church (church, sanctuary)
- Train Station (train_station, travel)
- Burned Building (quest_location, main quest marker)
- Several residences and ambient buildings

Key NPCs: Sheriff Marcus Cole, Mayor Josephine Holt, Doc Chen Wei, Father Miguel

### Acceptance Criteria

- [ ] All 13 authored towns (+ test town) load from location data files
- [ ] Each town has at minimum: 1 entry point, 1 tavern/social slot, 1 shop
- [ ] Town assemblages resolve to renderable building geometry
- [ ] NPCs spawn at authored markers within their town
- [ ] Shops populate based on town's slot types
- [ ] Town atmosphere values affect encounter rates, prices, NPC behavior
- [ ] Player spawn position is correct per entry point used
- [ ] Town transitions clear previous town entities and spawn new ones
- [ ] Test town is excluded from release builds (development only)
- [ ] `LOCATIONS_BY_ID` map contains all towns for lookup

### Implementation Notes

- Location definitions in `src/game/data/locations/` (one file per town)
- Location schema in `src/game/data/schemas/spatial.ts`
- Registry in `src/game/data/locations/index.ts` with `LOCATIONS_BY_ID`
- Assemblage library in `src/game/data/assemblages/`
- Building rendering by archetype in `engine/archetypes/`
- NPC spawning via ECS entity creation on zone entry
- Lookup helpers: `getLocationById()`, `getLocationsByType()`, `getLocationsByTag()`

---

## 16. Building Archetypes

**Status:** `[PLANNED]`

### Description

14 building archetypes define the visual and functional templates for town structures. Each archetype is a parameterized renderer that constructs geometry from Three.js primitives with canvas-painted textures. Buildings have customization slots driven by town definition data (sign text, color palette, interior items, NPC positions).

### Building Archetype Catalog

| Archetype | File | Key Features |
|-----------|------|-------------|
| Saloon | `engine/archetypes/Saloon.ts` | Swinging doors, bar counter, bottles, piano stage |
| Inn/Hotel | `engine/archetypes/Inn.ts` | Rooms with beds, check-in desk, balcony |
| Sheriff Office | `engine/archetypes/SheriffOffice.ts` | Jail cells, wanted board, gun rack, desk |
| General Store | `engine/archetypes/GeneralStore.ts` | Shelves, counter, goods display, sign |
| Blacksmith | `engine/archetypes/Blacksmith.ts` | Forge (glowing), anvil, weapon rack, bellows |
| Bank | `engine/archetypes/Bank.ts` | Vault door, teller windows, safe, bars |
| Church | `engine/archetypes/Church.ts` | Steeple, pews, bell, cross, stained glass |
| Doctor Office | `engine/archetypes/DoctorOffice.ts` | Exam table, medicine cabinet, bed |
| Livery/Stable | `engine/archetypes/Livery.ts` | Stalls, hay bales, tack wall, trough |
| Telegraph Office | `engine/archetypes/TelegraphOffice.ts` | Desk, telegraph machine, wire spool |
| Mining Office | `engine/archetypes/MiningOffice.ts` | Maps on walls, scales, equipment storage |
| Undertaker | `engine/archetypes/Undertaker.ts` | Coffins, embalming table, dark interior |
| Newspaper | `engine/archetypes/Newspaper.ts` | Printing press, ink, paper stacks, desks |
| Barber | `engine/archetypes/Barber.ts` | Barber chair, mirror, razor, striped pole |

### Archetype API

Each archetype exports a function:

```typescript
function createBuilding(params: BuildingParams): THREE.Group
```

Where `BuildingParams` includes:
- `signText: string` -- text painted on the sign
- `palette: ColorPalette` -- wood, trim, roof, accent colors
- `seed: number` -- for deterministic variation
- `scale: number` -- size multiplier
- `interiorDetail: 'low' | 'medium' | 'high'` -- LOD for interior props
- `markers: Marker[]` -- NPC spawn/interaction points

### Construction Pattern

All buildings follow the same construction pattern:
1. **Foundation:** Box geometry, stone/dirt texture
2. **Walls:** Box geometries with canvas-painted wood plank texture
3. **Roof:** Box or triangular prism, shingle texture
4. **Windows:** Cutout planes with glass material (slight transparency)
5. **Door:** Animated box geometry (swinging for saloon, sliding for barn)
6. **Sign:** Plane with dynamically generated canvas text
7. **Interior:** Props placed at marker positions (if player is inside)
8. **Porch/Awning:** Extended box geometry with posts (cylinders)

### Acceptance Criteria

- [ ] All 14 archetypes produce renderable Three.js Groups
- [ ] Buildings accept parameterized input (sign text, palette, seed)
- [ ] Canvas textures are cached per archetype+palette (not regenerated per frame)
- [ ] World matrices frozen on static geometry (performance optimization)
- [ ] Interior props only render when player is inside (LOD)
- [ ] Building geometry uses <= 50 draw calls total per town
- [ ] Each building has correct collider geometry for player collision
- [ ] Markers are correctly positioned for NPC spawning

### Implementation Notes

- Archetype renderers in `engine/archetypes/`
- Material factory in `engine/materials/` for canvas texture generation
- Buildings rendered as R3F `<group>` components wrapping imperative Three.js geometry
- Static geometry: `matrixAutoUpdate = false`, `updateMatrix()` once
- Colliders generated from bounding boxes of wall/floor geometry
- Interior detail level adjustable per performance budget

---

## 17. Procedural Geometry Engine

**Status:** `[PLANNED]`

### Description

All visual content is constructed at runtime from Three.js primitives and canvas textures. Zero GLB, GLTF, or OBJ models are loaded. This enables instant scene construction, tiny bundle size, and full control over every visual element.

### Geometry Primitives Used

| Primitive | Three.js Class | Used For |
|-----------|---------------|----------|
| Box | `BoxGeometry` | Walls, floors, crates, furniture, body parts |
| Sphere | `SphereGeometry` | NPC heads, lamp globes, boulders |
| Cylinder | `CylinderGeometry` | Barrels, posts, limbs, gun barrels, tree trunks |
| Cone | `ConeGeometry` | Roofs, hats, fuse tips, tree tops |
| Plane | `PlaneGeometry` | Signs, windows, terrain chunks, canvas displays |
| Torus | `TorusGeometry` | Lasso loop, rings, gears |
| Capsule | `CapsuleGeometry` | Player collider, NPC bodies |

### Material System

- **Canvas textures:** 2D Canvas API generates textures for wood grain, stone, cloth, skin
- **Material factory:** `engine/materials/` provides cached material creators per surface type
- **Texture cache:** Each unique material key (type + palette + seed) is created once and reused
- **No external textures:** All texture data generated procedurally via Canvas API

### Instanced Rendering

Repeated elements use `drei` `<Instances>` for single-draw-call rendering:

| Element | Instance Count | Notes |
|---------|---------------|-------|
| Cacti | 50-200 per chunk | Seeded placement, 3-4 variants |
| Rocks | 30-100 per chunk | Size/rotation variation |
| Fence posts | 10-50 per town | Along roads and property lines |
| Tumbleweeds | 5-20 per chunk | Animated rolling |
| Scrub brush | 20-80 per chunk | Flat planes with alpha |
| Street lamps | 5-15 per town | With point light at night |

### Terrain System

- Heightmap generated per chunk via Canvas API (Perlin/simplex noise)
- Applied to `PlaneGeometry` with vertex displacement
- Biome determines color palette and feature density:
  - Desert: sand color, cacti, rocks
  - Canyon: red/orange, mesas, cliff walls
  - Mountain: gray stone, sparse vegetation, snow caps
  - Grassland: green, scattered trees, fences

### Acceptance Criteria

- [ ] Zero external 3D model files loaded (no GLB/GLTF/OBJ)
- [ ] All geometry constructed from Three.js primitive classes
- [ ] Canvas textures generate procedurally (wood, stone, cloth, etc.)
- [ ] Material cache prevents duplicate texture generation
- [ ] Instanced meshes used for repeated elements (cacti, rocks, posts)
- [ ] Terrain chunks load/unload based on player proximity (3x3 grid)
- [ ] World matrices frozen on static geometry
- [ ] Total draw calls per scene < 100
- [ ] Memory usage < 100 MB total
- [ ] Scene construction time < 1 second per town

### Implementation Notes

- Material factory in `engine/materials/`
- Building archetypes in `engine/archetypes/`
- Terrain renderer in `engine/renderers/`
- Vegetation instancing via `drei` `<Instances>` and `<Instance>`
- Spatial hashing in `src/game/systems/SpatialHash.ts` for entity culling
- Chunk management in `engine/spatial/`
- Seeded RNG (`scopedRNG`) for all procedural variation
- Canvas texture size: 256x256 default, 512x512 for detailed surfaces

---

## 18. Enemy Types (Monster Factory)

**Status:** `[PLANNED]`

### Description

10 enemy types ranging from human outlaws to supernatural creatures. All enemies use the chibi humanoid base from the NPC system, extended with type-specific visual features and AI behaviors. The "monster factory" pattern assembles body parts from primitives with per-type configuration.

### Enemy Catalog

| Type | Visual Treatment | HP | Damage | Behavior | Region |
|------|-----------------|-----|--------|----------|--------|
| **Outlaw** | Chibi + black duster, bandana, dual pistols | 30-60 | 10-18 | Aggressive, take cover | Everywhere |
| **Coyote** | Four-legged chibi, pointed ears, teeth | 20-30 | 8-12 | Pack pursuit, flanking | Desert, grassland |
| **Rattlesnake** | Segmented cylinders, diamond pattern, rattle | 10-15 | 15-20 (poison) | Ambush, flee when hurt | Desert, canyon |
| **Scorpion** | Flat sphere body, pincer cones, segmented tail | 25-35 | 12-18 | Defensive, tail strike | Desert, cave |
| **Bandit Boss** | Oversized chibi (1.5x), scars, trophy belt | 80-120 | 20-30 | Aggressive + support minions | Quest encounters |
| **Mine Crawler** | Spider dome body, 6 cylinder legs, headlamp | 35-50 | 14-22 | Ambush from ceiling, swarm | Mines, caves |
| **Dust Devil** | Swirling cone, transparent particles, core | 40-60 | 10-15 (area) | Ranged, teleport, area denial | Desert, badlands |
| **Clockwork Automaton** | Brass boxes + cylinders, visible gears, steam | 60-100 | 18-25 | Defensive, slow, armored | Old Works, ruins |
| **Wendigo** | Elongated chibi, antler cones, hollow eyes, frost | 50-80 | 20-30 | Aggressive, frost slow | Mountains, night |
| **Rail Wraith** | Transparent chibi, lantern sphere, chains | 40-70 | 15-25 | Ranged, phase through walls | Railroad, night |

### Monster Factory Pattern

```typescript
function createEnemy(type: EnemyType, seed: number): THREE.Group {
  // 1. Create base body (chibi humanoid or type-specific base)
  const body = createBaseBody(type);

  // 2. Apply type-specific modifications
  applyTypeFeatures(body, type, seed);

  // 3. Apply canvas textures
  applyTextures(body, type, seed);

  // 4. Attach particle effects (if any)
  attachParticles(body, type);

  // 5. Set up animation controllers
  setupAnimations(body, type);

  return body;
}
```

### Enemy Factions

| Faction | Enemy Types | Region Control |
|---------|-------------|---------------|
| Copperhead Gang | Outlaw, Bandit Boss | Rattlesnake Canyon, wilderness |
| IVRC Guards | Outlaw (uniformed) | IVRC-controlled towns |
| Wildlife | Coyote, Rattlesnake, Scorpion | All wilderness |
| Remnant | Clockwork Automaton | Old Works, ruins |
| Raiders | Outlaw (generic) | Random encounters |

### Acceptance Criteria

- [ ] All 10 enemy types render as distinct procedural meshes
- [ ] Enemies use the chibi base with type-specific modifications
- [ ] Each enemy type has unique AI behavior (YUKA steering)
- [ ] Enemy stats loaded from `config/game/enemies.json`
- [ ] Enemies drop loot on death (based on loot table)
- [ ] Enemies grant XP on defeat
- [ ] Boss enemies are visually larger (1.5x scale)
- [ ] Night-only enemies (Wendigo, Rail Wraith) only spawn at night
- [ ] Wildlife enemies are non-hostile until provoked (except predators)
- [ ] Enemy colliders match visual mesh for accurate hit detection

### Implementation Notes

- Enemy definitions in `src/game/data/enemies/` using `EnemyDefinitionSchema`
- Enemy rendering in `engine/renderers/` using monster factory pattern
- AI behaviors via YUKA `Vehicle` + `SteeringBehavior`
- Enemy stats in `config/game/enemies.json`
- Encounter tables in `config/game/encounters.json`
- Enemies are ECS entities (Miniplex) spawned on encounter trigger
- Loot tables use `LootTableSchema` from item schemas

---

## 19. Puzzles

**Status:** `[PLANNED]`

### Description

Pipe-fitter minigame used for lockpicking, safe-cracking, and machinery repair. A grid-based puzzle where the player rotates pipe segments to connect an input to an output. Successfully completing the puzzle unlocks doors, safes, or repairs machinery as a quest objective.

### Puzzle Mechanics

- **Grid:** 4x4 to 6x6 grid of pipe segments
- **Pipe types:** Straight, elbow (90-degree), T-junction, cross, empty
- **Goal:** Rotate pipes to create a connected path from source to target
- **Interaction:** Tap/click a pipe segment to rotate it 90 degrees clockwise
- **Validation:** Path checked after each rotation; flow animation on success
- **Difficulty:** Grid size increases, more pipe types, time pressure (optional)

### Puzzle Contexts

| Context | Location | Reward |
|---------|----------|--------|
| Lockpicking | Locked doors, chests | Access to area or loot |
| Safe cracking | Bank vaults, hidden safes | Gold, rare items |
| Machinery repair | Mines, workshops | Quest objective completion |
| Steam valve alignment | Industrial areas | Access, quest objective |

### Difficulty Levels

| Level | Grid | Pipe Types | Time Limit |
|-------|------|------------|------------|
| Easy | 4x4 | Straight, elbow | None |
| Medium | 5x5 | + T-junction | 120 seconds |
| Hard | 6x6 | + Cross, blocked | 90 seconds |

### Acceptance Criteria

- [ ] Puzzle grid renders with correct pipe segment types
- [ ] Tapping/clicking a segment rotates it 90 degrees clockwise
- [ ] Path validation runs after each rotation
- [ ] Flow animation plays from source to target on valid connection
- [ ] Success triggers reward (unlock door, grant item, advance quest)
- [ ] Failure (timeout) allows retry or skip (with penalty)
- [ ] Phase transitions to `puzzle` on start, back to `playing` on complete/exit
- [ ] 3 difficulty levels with increasing grid size and complexity
- [ ] Puzzle state tracked in `puzzleSlice` (Zustand)

### Implementation Notes

- Puzzle logic in `src/game/puzzles/` (pipe-fitter minigame)
- Runtime state in `puzzleSlice` (Zustand)
- Puzzle rendering as 2D overlay (React Native) or 3D in-world panel
- Grid state: array of `PipeSegment` objects with `type` and `rotation`
- Path finding: BFS from source to target checking port connections
- Pipe textures: canvas-generated pipe graphics
- Puzzle UI: `components/game/PipePuzzle.tsx`

---

## 20. Audio System

**Status:** `[PLANNED]`

### Description

Procedural audio via Tone.js. No pre-recorded music or sound effects -- all audio is synthesized at runtime. The system generates context-appropriate music (town, wilderness, combat), ambient soundscapes (wind, saloon chatter, mine echoes), and sound effects (gunshots, footsteps, UI clicks).

### Audio Layers

| Layer | Description | Volume Default |
|-------|-------------|----------------|
| Music | Procedural background music | 0.5 |
| Ambience | Environmental soundscape | 0.6 |
| SFX | Sound effects | 0.8 |
| UI | Interface sounds | 0.7 |

### Music Themes

| Context | Style | Instruments (synth) |
|---------|-------|-------------------|
| Town (day) | Relaxed western | Acoustic guitar (pluck), harmonica (sine wave) |
| Town (night) | Moody, sparse | Piano (filtered), soft strings (pad) |
| Wilderness | Open, lonesome | Whistle (sine), distant guitar |
| Combat | Tense, driving | Drums (noise bursts), bass (square), stabs (saw) |
| Boss fight | Intense, dramatic | All combat + choir (filtered noise) |
| Saloon | Honky-tonk | Piano (bright), bass, light drums |
| Mine | Eerie, industrial | Metallic hits, dripping, low drones |

### Ambient Sounds

| Environment | Sounds |
|-------------|--------|
| Desert | Wind (filtered noise), distant coyote howl |
| Town | Distant chatter (modulated noise), horse hooves, doors |
| Saloon | Crowd murmur, piano, glass clinks |
| Mine | Dripping water, pickaxe echoes, creaking |
| Night | Crickets (high sine), owl hoot, wind |
| Canyon | Wind whistle, echo effect on all sounds |

### Sound Effects

| Event | Sound Design |
|-------|-------------|
| Gunshot (revolver) | Short noise burst + sine decay |
| Gunshot (rifle) | Longer noise burst + lower pitch |
| Gunshot (shotgun) | Wide noise burst + heavy bass |
| Footstep (dirt) | Short filtered noise, randomized pitch |
| Footstep (wood) | Sharper attack, higher resonance |
| Item pickup | Rising arpeggio (3 notes) |
| Level up | Fanfare (ascending major chord) |
| Damage taken | Low thud + brief distortion |
| UI click | Short sine blip |
| Door open | Creak (filtered noise sweep) |

### Acceptance Criteria

- [ ] Music changes based on game context (town, wilderness, combat)
- [ ] Music transitions smoothly (crossfade over 2 seconds)
- [ ] Ambient sounds match current environment
- [ ] SFX play on game events (shooting, footsteps, pickups)
- [ ] All audio generated via Tone.js (no audio files loaded)
- [ ] Volume levels configurable per layer in settings
- [ ] Audio respects device mute/silent mode
- [ ] Music pauses during pause phase
- [ ] Performance: audio processing < 5% CPU

### Implementation Notes

- Audio system ported from `src/app/game/services/audio/`
- Tone.js for all synthesis and scheduling
- Audio manager singleton with context-aware layer control
- Music generation: probabilistic note sequences within scale
- Ambience: layered noise generators with envelope control
- SFX: one-shot synth triggers mapped to game events
- Settings stored in `settingsSlice` (musicVolume, sfxVolume, etc.)
- Audio context initialized on first user interaction (browser requirement)

---

## 21. UI/HUD System

**Status:** `[PLANNED]`

### Description

Mobile-first HUD and menu system built with React Native Reusables (shadcn/ui port) and NativeWind. All UI elements are sized for 44px minimum touch targets. The HUD overlays the 3D scene without obscuring critical gameplay view. Menus are modal overlays.

### HUD Elements (Always Visible During `playing`)

| Element | Position | Content |
|---------|----------|---------|
| Health bar | Top-left | Current/max HP, red when low |
| XP bar | Below health | Current XP / XP to next level |
| Minimap | Top-right | Local area, NPC dots, quest markers |
| Active quest | Below minimap | Current quest name + objective |
| Survival stats | Left edge | Fatigue, food, water icons with counts |
| Ammo counter | Bottom-right | Current ammo / magazine size |
| Crosshair | Screen center | Dot reticle (expands during fire) |
| Notification feed | Top-center | Toast-style notifications (XP, items, events) |
| Compass | Top-center | Cardinal directions + quest marker bearing |
| Time display | Top-right (below minimap) | Current game time, day/night icon |

### Modal Overlays

| Overlay | Trigger | Content |
|---------|---------|---------|
| Inventory | Backpack button / I key | Grid inventory + equipment slots |
| Quest log | Quest button / J key | Active/completed quests with details |
| World map | Map button / M key | Region map with towns and routes |
| Character panel | Character button / C key | Stats, equipment, faction reputation |
| Settings | Pause menu | Audio, graphics, controls, save/load |
| Dialogue | NPC interaction | NPC text, portrait, choices |
| Shop | Shop dialogue option | Buy/sell interface |
| Puzzle | Puzzle trigger | Pipe-fitter minigame |

### Mobile Virtual Controls

| Control | Position | Size | Function |
|---------|----------|------|----------|
| Move joystick | Bottom-left | 120px diameter | WASD movement |
| Look zone | Right half of screen | Full area | Camera rotation |
| Fire button | Bottom-right | 64px | Shoot/use weapon |
| Interact button | Center-right | 56px | NPC talk, pickup, use |
| Jump button | Above fire | 48px | Jump |
| Reload button | Above jump | 44px | Reload weapon |
| Weapon slots | Bottom-center | 4x 44px | Quick weapon switch |
| Menu button | Top-right corner | 44px | Pause/menu |

### Design Principles

- **Mobile-first:** 375px minimum viewport width, thumb-reachable controls
- **44px touch targets:** No interactive element smaller than 44x44px
- **No horizontal scroll:** Everything fits within viewport
- **Text minimum 14px:** Body text readable without zooming
- **Reduced motion:** Respect `prefers-reduced-motion` system setting
- **Contrast:** UI elements have sufficient contrast against 3D scene (dark backgrounds with opacity)

### Acceptance Criteria

- [ ] HUD renders all elements without obscuring gameplay view
- [ ] Health bar turns red when HP < 25%
- [ ] Minimap shows player position, nearby NPCs, quest markers
- [ ] Active quest display updates on quest progression
- [ ] Notifications appear and auto-dismiss after 3 seconds
- [ ] All modal overlays open/close without lag
- [ ] Mobile virtual controls respond to touch without delay
- [ ] All touch targets >= 44px
- [ ] Virtual joystick appears on touch, disappears on release
- [ ] UI renders correctly at 375px width (iPhone SE)
- [ ] Settings persist across sessions via `settingsSlice`
- [ ] Compass points toward active quest objective

### Implementation Notes

- UI components in `components/game/` using React Native Reusables
- Styling via NativeWind 4 + Tailwind CSS
- Base components in `components/ui/` (Button, Card, Dialog, etc.)
- HUD is a React Native layer above the R3F Canvas
- Virtual controls use `react-native-gesture-handler` for touch
- Minimap: simplified 2D rendering of nearby area (canvas or SVG)
- Notification system in `uiSlice` with auto-dismiss timer
- Modal state managed by `uiSlice.modalStack`

---

## 22. Input System

**Status:** `[PLANNED]`

### Description

Universal FPS input system that normalizes all input sources into a single `InputFrame` per tick. The game code never reads raw events -- it reads the InputFrame. Supports keyboard/mouse, touch (virtual joystick), gamepad, gyro (tilt aiming), XR controllers, and AI autoplay.

### InputFrame

```typescript
interface InputFrame {
  move: { x: number; z: number };       // -1..1 strafe/forward
  look: { yaw: number; pitch: number }; // delta radians
  fire: boolean;                         // Primary fire
  aim: boolean;                          // ADS / zoom
  reload: boolean;                       // Reload weapon
  interact: boolean;                     // Talk, pickup, use
  jump: boolean;                         // Jump
  sprint: boolean;                       // Sprint (held)
  inventory: boolean;                    // Toggle inventory
  map: boolean;                          // Toggle map
  menu: boolean;                         // Toggle pause menu
  weaponSlot: number | null;             // 1-8 weapon selection, null = no change
  weaponScroll: number;                  // -1, 0, +1 for scroll wheel
}
```

### Input Providers

| Provider | Platform | Input Mapping |
|----------|----------|--------------|
| `KeyboardMouseProvider` | Desktop | WASD + mouse look + click |
| `TouchProvider` | Mobile | Virtual joystick + look zone + buttons |
| `GamepadProvider` | Any | Dual sticks + triggers + buttons |
| `GyroProvider` | Mobile | Device tilt for fine aiming |
| `XRProvider` | VR/AR | Controller tracking + buttons |
| `AIProvider` | Testing | Programmatic input for autoplay/testing |

### InputManager

Singleton that:
1. Polls all active providers each frame
2. Merges inputs (last-write wins, except additive for look)
3. Produces a single `InputFrame`
4. Game systems read `InputFrame` from `InputManager.getFrame()`

### Key Bindings (Desktop Default)

| Action | Key | Alt |
|--------|-----|-----|
| Forward | W | Up Arrow |
| Backward | S | Down Arrow |
| Strafe Left | A | Left Arrow |
| Strafe Right | D | Right Arrow |
| Fire | Left Mouse | -- |
| Aim | Right Mouse | -- |
| Reload | R | -- |
| Interact | E / F | -- |
| Jump | Space | -- |
| Sprint | Left Shift | -- |
| Inventory | I / Tab | -- |
| Map | M | -- |
| Menu | Escape | -- |
| Weapon 1-8 | 1-8 | -- |
| Cycle weapon | Scroll Wheel | -- |

### Acceptance Criteria

- [ ] InputManager produces one InputFrame per tick
- [ ] KeyboardMouseProvider correctly maps all default bindings
- [ ] TouchProvider: joystick produces movement, look zone produces camera rotation
- [ ] GamepadProvider: left stick = move, right stick = look, triggers = fire/aim
- [ ] Multiple providers can be active simultaneously (keyboard + gamepad)
- [ ] InputFrame values are normalized (-1 to 1 for axes, boolean for buttons)
- [ ] Game code NEVER reads raw events -- only InputFrame
- [ ] GyroProvider supplements touch look with tilt-based fine aiming
- [ ] AIProvider can drive the game for testing/demo purposes
- [ ] Key bindings are remappable via settings

### Implementation Notes

- InputManager in `input/InputManager.ts`
- Input actions defined in `input/InputActions.ts`
- Providers in `input/providers/` (one file per provider)
- InputFrame interface defined alongside InputManager
- React hook: `useInputFrame()` returns current frame
- R3F integration: `useFrame` reads `InputManager.getFrame()` each tick
- Settings for sensitivity, invert Y, dead zones in `settingsSlice`

---

## 23. Save/Load System

**Status:** `[PLANNED]`

### Description

Persistent game state saved via expo-sqlite (native) or idb-keyval (web). Auto-save triggers on zone transitions and at regular intervals. Manual save available at any time. Multiple save slots allow branching play.

### Save Data Contents

The save file captures the complete game state from all Zustand slices:

| Slice | Data Saved |
|-------|-----------|
| `coreSlice` | Phase, current location, world seed, game time |
| `playerSlice` | Name, stats, position, rotation, appearance |
| `inventorySlice` | All items, equipment state |
| `questSlice` | Active/completed quests, objective progress |
| `combatSlice` | Not saved (combat resets on load) |
| `dialogueSlice` | Not saved (dialogue resets on load) |
| `shopSlice` | Transaction history (for restock timing) |
| `travelSlice` | Not saved (travel resets on load) |
| `puzzleSlice` | Not saved (puzzle resets on load) |
| `settingsSlice` | All settings (separate from save slots) |
| `uiSlice` | Not saved (UI state resets on load) |
| `survivalState` | Fatigue, provisions |

### Save Slots

| Slot | Type | Trigger |
|------|------|---------|
| Auto-save | Automatic | Zone transition, combat start, every 5 min |
| Slot 1-3 | Manual | Player-initiated from pause menu |

### Auto-Save Triggers

- Entering a new town/location
- Starting a combat encounter
- Completing a quest stage
- Every 5 real-time minutes during `playing` phase
- Before starting travel between towns

### Acceptance Criteria

- [ ] Save captures all persistent state from Zustand slices
- [ ] Load restores game to exact saved state
- [ ] Auto-save triggers on zone transition, combat start, quest completion
- [ ] Periodic auto-save every 5 minutes during gameplay
- [ ] 3 manual save slots + 1 auto-save slot
- [ ] Save slot displays: location name, level, play time, timestamp
- [ ] Load from title screen (continue) or pause menu
- [ ] Saving shows brief notification ("Game saved")
- [ ] Save data persists across app restarts
- [ ] Web saves use idb-keyval, native saves use expo-sqlite
- [ ] Corrupted save data is detected and reported (not silently loaded)
- [ ] Settings saved separately from game slots (persist across all saves)

### Implementation Notes

- Save/load logic in `src/game/systems/SaveSystem.ts`
- Storage adapter in `src/game/store/persistStorage.ts`
- Native persistence via `expo-sqlite`
- Web persistence via `idb-keyval`
- Zustand middleware for persistence: `persist()` or custom adapter
- Save data serialized as JSON
- Save metadata (slot info) stored separately for quick access
- Version field in save data for future migration support

---

## 24. Performance Budgets

**Status:** `[PLANNED]`

### Description

Hard performance targets ensure the game runs smoothly on mobile devices (primary target) and desktops. Every system is designed within these constraints. Violations are bugs.

### Target Metrics

| Metric | Mobile Target | Desktop Target | Hard Limit |
|--------|--------------|----------------|------------|
| FPS | >= 55 | >= 60 | Never below 30 |
| Time to Interactive | < 3s | < 2s | < 5s |
| Memory | < 100 MB | < 200 MB | < 150 MB mobile |
| Draw calls | < 100 | < 150 | < 200 |
| Triangle count | < 50k | < 100k | < 200k |
| Texture memory | < 30 MB | < 60 MB | < 50 MB mobile |
| Bundle size (JS) | < 2 MB gzipped | < 3 MB gzipped | < 5 MB gzipped |
| Audio CPU | < 5% | < 3% | < 8% |

### Optimization Strategies

| Strategy | Implementation | Impact |
|----------|---------------|--------|
| Zero GLBs | All geometry from primitives | No model loading time, tiny bundle |
| Instanced meshes | `drei <Instances>` for cacti, rocks, posts | 1 draw call per instance group |
| Frozen matrices | `matrixAutoUpdate = false` on static geometry | Skip matrix recalc each frame |
| Canvas texture cache | Per-archetype cache, not per-frame | No texture regeneration |
| Spatial hashing | `SpatialHash.ts` for entity culling | Only update/render nearby entities |
| Chunk loading | 3x3 terrain grid around player | Only render visible terrain |
| Interior LOD | Interior props only when player inside | Skip rendering hidden geometry |
| Code splitting | Expo Router lazy routes | Smaller initial bundle |
| Selective Three.js imports | Import specific modules, not barrel | Reduce bundle size |
| ECS for dynamics only | Miniplex only for spawned entities | Minimal ECS overhead |

### Monitoring

Performance metrics should be tracked in development builds:

- FPS counter (ms per frame)
- Draw call count (`renderer.info.render.calls`)
- Triangle count (`renderer.info.render.triangles`)
- Texture memory (`renderer.info.memory.textures`)
- Geometry count (`renderer.info.memory.geometries`)
- Active ECS entity count
- Zustand store update frequency

### Acceptance Criteria

- [ ] Mobile FPS >= 55 on mid-range device (iPhone 12 / Pixel 6 equivalent)
- [ ] Desktop FPS >= 60
- [ ] Time to interactive < 3 seconds on mobile
- [ ] Total memory < 100 MB on mobile
- [ ] Draw calls < 100 per frame in any scene
- [ ] No GLB/GLTF/OBJ files in the bundle
- [ ] Instanced rendering used for all repeated geometry
- [ ] Static geometry has frozen world matrices
- [ ] Terrain chunks load/unload without frame drop
- [ ] Audio processing < 5% CPU
- [ ] Bundle size < 2 MB gzipped
- [ ] Performance regression tests catch FPS drops

### Implementation Notes

- Performance budgets enforced by playtest-governor agent
- Development overlay shows live metrics (toggle via debug setting)
- `drei` `<Stats>` component for FPS/draw call monitoring
- Memory profiling via `renderer.info.memory`
- Performance test suite measures frame time under load
- Optimization checklist in CLAUDE.md anti-patterns section
- File size limit: 300 lines per file (enforced by `file-size-sentinel.sh`)

---

## Appendix A: Config File Index

All tuning values live in `config/game/` JSON files. No inline constants in game code.

| File | Contents | Spec Sections |
|------|----------|--------------|
| `weapons.json` | Weapon stats (damage, range, fire rate, etc.) | 4, 5 |
| `enemies.json` | Enemy type definitions (HP, damage, behavior) | 4, 18 |
| `encounters.json` | Encounter tables (enemy groups, danger zones) | 4, 11, 18 |
| `difficulty.json` | Difficulty multipliers | 4, 18 |
| `factions.json` | Faction reputation thresholds and relations | 14 |
| `npcs.json` | NPC template definitions | 6 |
| `dialogues.json` | Dialogue tree data | 7 |
| `quests.json` | Quest chain definitions | 8 |
| `items.json` | Item catalog (weapons, consumables, gear) | 9 |
| `shops.json` | Shop inventories per town | 10 |
| `survival.json` | Fatigue, provisions, camping values | 13 |
| `time.json` | Day/night cycle, time multipliers | 12 |

---

## Appendix B: Zustand Store Slice Index

| Slice | File | Spec Sections |
|-------|------|--------------|
| `coreSlice` | `src/game/store/slices/coreSlice.ts` | 1, 12 |
| `playerSlice` | `src/game/store/slices/playerSlice.ts` | 2, 14 |
| `combatSlice` | `src/game/store/slices/combatSlice.ts` | 4 |
| `dialogueSlice` | `src/game/store/slices/dialogueSlice.ts` | 7 |
| `inventorySlice` | `src/game/store/slices/inventorySlice.ts` | 9 |
| `questSlice` | `src/game/store/slices/questSlice.ts` | 8 |
| `shopSlice` | `src/game/store/slices/shopSlice.ts` | 10 |
| `travelSlice` | `src/game/store/slices/travelSlice.ts` | 11 |
| `puzzleSlice` | `src/game/store/slices/puzzleSlice.ts` | 19 |
| `settingsSlice` | `src/game/store/slices/settingsSlice.ts` | 20, 22 |
| `uiSlice` | `src/game/store/slices/uiSlice.ts` | 21 |

---

## Appendix C: Schema Index

| Schema | File | Spec Sections |
|--------|------|--------------|
| `CombatEncounterSchema` | `src/game/data/schemas/combat.ts` | 4 |
| `EnemyDefinitionSchema` | `src/game/data/schemas/combat.ts` | 18 |
| `NPCDefinitionSchema` | `src/game/data/schemas/npc.ts` | 6 |
| `DialogueTreeSchema` | `src/game/data/schemas/npc.ts` | 7 |
| `QuestSchema` | `src/game/data/schemas/quest.ts` | 8 |
| `BaseItemSchema` | `src/game/data/schemas/item.ts` | 9 |
| `WeaponStatsSchema` | `src/game/data/schemas/item.ts` | 5 |
| `LootTableSchema` | `src/game/data/schemas/item.ts` | 4, 18 |
| `LocationSchema` | `src/game/data/schemas/spatial.ts` | 15, 16 |
| `AssemblageSchema` | `src/game/data/schemas/spatial.ts` | 16 |
| `WorldSchema` | `src/game/data/schemas/spatial.ts` | 11 |
| `RegionSchema` | `src/game/data/schemas/spatial.ts` | 11 |
| `NPCTemplateSchema` | `src/game/data/schemas/generation.ts` | 6 |
| `ScheduleTemplateSchema` | `src/game/data/schemas/generation.ts` | 6, 12 |
| `ShopInventoryTemplateSchema` | `src/game/data/schemas/generation.ts` | 10 |
| `EncounterTemplateSchema` | `src/game/data/schemas/generation.ts` | 11, 18 |
| `FactionReactionTemplateSchema` | `src/game/data/schemas/generation.ts` | 14 |

---

## Appendix D: Workflow Reference

### Adding a New Feature

```
1. Write spec section in this file (status: [SPECCED])
2. Write failing tests referencing the spec section number
3. Implement until tests pass (status: [TESTED] -> [IMPLEMENTED])
4. Wire to game loop, UI, or store (status: [WIRED])
5. Update this spec with any deviations
```

### Fixing a Bug

```
1. Find the spec section -- what SHOULD happen?
2. Write a failing test reproducing the bug
3. Fix the code
4. If the spec was wrong, fix the spec too
```

### Test File Convention

```typescript
// combat.test.ts
describe('Combat System (Spec 4)', () => {
  it('should calculate damage with distance falloff', () => {
    // ...
  });
});
```

Every test description references its spec section number.
