---
allowed-tools: Read, Write, Edit, Glob, Grep
description: Turn a gameplay concept or story into a spec section in GAME_SPEC.md
---

Document this gameplay concept: $ARGUMENTS

## Process

1. Read `docs/GAME_DESIGN.md` for canonical design context
2. Read `docs/GAME_SPEC.md` to understand current spec structure
3. Verify the concept is consistent with Iron Frontier's design:
   - Steampunk American Frontier setting
   - Isometric RPG with diorama presentation
   - 14 authored towns (Coppertown, Dusty Springs, Junction City, etc.)
   - Procedural geometry engine (ZERO GLBs in game scene)
   - Quest chains with branching dialogue
   - Real-time combat with gunslinger mechanics
   - NPC archetypes (Sheriff, Doc, Blacksmith, Saloon Owner, etc.)
   - Seeded determinism (seededRandom everywhere, zero Math.random())
   - Mobile-first (375px, 44px touch targets)
4. Find the right section (or create a new one) for this concept
5. Write a precise, implementable spec section:
   - Purpose (1 sentence)
   - Data model (interfaces)
   - Rules and formulas (every variable defined)
   - Config schema (reference JSON files)
   - UI behavior (mobile-first, steampunk HUD integration)
   - Integration points with other systems
6. Update the Table of Contents if adding a new section
7. Update the Implementation Status section to mark as "specced"

Use the `@spec-writer` agent for implementation.

## DO NOT write any code. Spec only.
