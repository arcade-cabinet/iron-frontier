---
name: docs-first-pipeline
description: The mandatory workflow for all Iron Frontier development. Docs define the game. Tests verify the docs. Code implements the docs. The game design document is the canonical reference.
---

# Docs-First Development Pipeline

## The Rule

```
GAME_DESIGN.md  ->  GAME_SPEC.md  ->  *.test.ts  ->  *.ts  ->  wire to store/loop  ->  update spec status
```

**Nothing is implemented without a spec section. Nothing is specced without tests. Nothing is tested without implementation. Nothing is implemented without being wired up.**

## Canonical Reference

`docs/GAME_DESIGN.md` is the **master design document** -- the vision for all game systems. When writing spec sections or implementing systems, this document is THE authority on how the game works.

Key design facts every agent must know:
- **Steampunk Frontier RPG.** Isometric perspective, diorama presentation, Old West meets steam technology.
- **14 Authored Towns.** Coppertown, Dusty Springs, Junction City, Rattlesnake Canyon, Freeminer Hollow, Signal Rock, Thornwood Station, Copper Mine, Old Works, Prospect, Desert Waystation, Sunset Ranch, and more.
- **Procedural Geometry Engine.** ZERO GLBs in the game scene. All buildings, NPCs, props, terrain, and vegetation are built from Babylon.js/Three.js primitives + canvas texture factories.
- **Chibi NPCs.** Assembled from primitives (sphere head, box torso, cylinder limbs). Rigid body animation at joints.
- **Building Archetypes.** Saloon, Sheriff Office, General Store, Blacksmith, Bank, Train Station, Church, Doctor's Office -- all procedural primitives.
- **Quest Chains.** Multi-step narrative quests with branching dialogue, authored per-town.
- **NPC Archetypes.** Sheriff, Doc, Blacksmith, Saloon Owner, Prospector, Outlaw, Traveling Merchant, etc.
- **Real-Time Combat.** Gunslinger mechanics -- revolvers, rifles, melee. Stamina and ammo management.
- **Hex-Based Overworld.** Travel between towns on hex grid with terrain costs and random encounters.
- **Seeded Determinism.** `seededRandom(seed, ...extra)` everywhere. Zero Math.random().
- **Zustand + Miniplex ECS.** Static state in Zustand store slices, dynamic entities in Miniplex.
- **Zod Schemas.** All data structures validated with Zod from `src/game/data/schemas/`.
- **Mobile-First.** 375px minimum, 44px touch targets, Ionic Angular + Capacitor.
- **Canvas Texture Factories.** Procedural textures for wood, brick, metal, dirt, signs, NPC faces.
- **Diorama Presentation.** Tilt-shift DOF, warm amber lighting, hard shadows, distance fog.

## When the User Gives You a Concept

1. **Check the game design.** Does this concept already exist? Is it consistent with the design pillars?
2. **Translate to spec.** Open GAME_SPEC.md, find or create the section. Write precise, implementable specs with formulas, data models, config schemas, and integration points.
3. **Do NOT write code.** The concept is documented. Implementation comes later.

## When You're Implementing a Spec Section

1. **Read the game design.** Understand the broader context.
2. **Read the spec section.** Understand exactly what it defines.
3. **Write tests first.** Each test references the spec section number.
4. **Write implementation.** Pure function, config from JSON, seededRandom for randomness, Zod-validated data.
5. **Wire it up.** Connect to Zustand store, add to game loop, connect to UI.
6. **Update spec status.** Mark as implemented with file path and test count.

## When You're Fixing a Bug

1. **Find the spec section.** What does the spec say should happen?
2. **Check the game design.** Is the spec correct per the master design?
3. **Write a failing test.** Reproduce the bug as a test case.
4. **Fix the code.** Make the test pass.
5. **If the spec was wrong, fix the spec too.**

## Anti-Patterns (things that cause spot-welding)

- Writing code without checking the spec AND the game design
- Creating a system without a test file
- Hardcoding tuning values instead of using config JSON
- Using Math.random() instead of seededRandom
- Making files over 300 lines instead of decomposing
- Implementing a feature across multiple sessions without updating the spec
- Assuming a system works because code exists (it might not be wired up)
- Importing GLB models in game code (all geometry must be procedural)
- Ignoring Zod schemas (all game data must be validated)
- Building features inconsistent with the 14-town authored world structure
- Using raw WebGL/WebGPU instead of Babylon.js abstractions
- Creating new Vector3 instances in render loops (reuse module-scope temps)
