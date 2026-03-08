---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
description: Add a new game system following docs > tests > code workflow
---

Add or redesign the game system: $ARGUMENTS

## Process (STRICT ORDER -- do not skip steps)

### Step 1: Check the game design
Read `docs/GAME_DESIGN.md` for the canonical design of this system.
Then read `docs/GAME_SPEC.md` and find the section for this system.
- If the spec section exists, read it carefully -- it defines what you build.
- If it doesn't exist, STOP and write the spec section FIRST using the `@spec-writer` agent.

### Step 2: Check existing implementation
Search for existing files related to this system:
```
src/game/systems/*
src/game/store/slices/*
src/game/data/schemas/*
src/game/data/generation/templates/*
config/game/*
```
Understand what already exists before creating anything new.

### Step 3: Write tests
Create or update `src/game/systems/<name>.test.ts`:
- Each test references a GAME_SPEC.md section number
- Test the formulas and rules from the spec
- Test edge cases
- Test with different seeded random inputs for determinism
- Test integration with Zustand store slices

### Step 4: Write implementation
Create or update `src/game/systems/<name>.ts`:
- Pure function system: `(world, dt, ...context) => void`
- Config from `config/game/*.json`
- Randomness via `seededRandom` from `src/game/data/generation/seededRandom.ts`
- Data validated with Zod schemas from `src/game/data/schemas/`
- No GLB imports -- procedural geometry only
- No file over 300 lines

### Step 5: Wire it up
- Connect to Zustand store slice in `src/game/store/slices/`
- Add to game loop if needed
- Connect to UI if needed (HUD, menus, overlays)
- Update GAME_SPEC.md Implementation Status section

### Step 6: Verify
```bash
pnpm test
pnpm typecheck
pnpm lint
```
