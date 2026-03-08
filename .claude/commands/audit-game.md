---
allowed-tools: Read, Bash, Glob, Grep
description: Audit the game for playability -- core loop, towns, combat, quests, code health
---

Run a full audit of Iron Frontier's current state.

## Audit Checklist

### 1. Can it start?
- Does `pnpm dev` launch without errors?
- Does the main menu render with "Begin Adventure" CTA?
- Can you start a new game and reach the first town?

### 2. Core gameplay loop
- Can the player move through the 3D world?
- Do NPCs appear in towns with distinct appearances?
- Can the player interact with NPCs (dialogue, quests)?
- Does combat work (attack, damage, defeat)?
- Do items drop and enter inventory?
- Does XP/leveling function?

### 3. Town rendering (procedural)
- Do buildings render from procedural geometry (ZERO GLBs)?
- Are building archetypes visually distinct (saloon, sheriff, store)?
- Do canvas textures generate correctly?
- Are props placed (barrels, crates, signs)?
- Do all 14 authored towns have location data?

### 4. Quest system
- Does the quest tracker show active objectives?
- Do quest objectives update on completion?
- Are rewards granted (XP, gold, items)?
- Do quest chains progress (multi-step)?

### 5. Combat
- Do encounters trigger correctly?
- Does the combat HUD show (health, ammo, stamina)?
- Do weapons deal damage with correct formulas?
- Does enemy AI respond?
- Does loot drop from defeated enemies?

### 6. World traversal
- Does open-world overworld movement work?
- Does terrain vary between regions?
- Do wilderness encounters spawn?
- Can the player travel between towns?
- Does day/night cycle progress?

### 7. Economy
- Does the shop UI work (buy/sell)?
- Are prices correct per town/merchant?
- Does gold tracking work?
- Can items be crafted/upgraded at blacksmith?

### 8. Day/night and weather
- Does time advance?
- Does lighting change with time-of-day?
- Do weather events occur?
- Does weather have gameplay impact?

### 9. Systems running
- Are all systems in `src/game/systems/` wired to the game loop?
- Are Zustand store slices connected to UI?
- Is procedural generation working (seeded, deterministic)?
- Are Zod schemas validating data correctly?

### 10. Spec coverage
- How many GAME_SPEC.md sections have matching implementations?
- How many implementations have NO spec section?
- How many spec sections have NO implementation?

### 11. Code health
- Files over 300 lines?
- Math.random() in game code?
- GLB/GLTF imports in game code?
- Inline tuning constants (should be in config JSON)?
- Tests passing? (`pnpm test`)
- TypeScript clean? (`pnpm typecheck`)
- Lint clean? (`pnpm lint`)

## Output Format

```
# Iron Frontier Audit Report -- [date]

## Summary
- Playable: YES/NO
- Core loop complete: YES/NO
- Towns rendering: YES/NO
- Combat functional: YES/NO
- Quests working: YES/NO
- Systems running: N/M
- Spec coverage: N/M sections implemented

## Critical Blockers
1. [description]

## Blocking Issues
1. [description]

## Degraded Systems
1. [description]

## Missing Systems (specced but not implemented)
1. [description]

## Code Health Issues
1. [description]
```
