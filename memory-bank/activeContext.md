# Active Context

## Current Focus

**System Integration and Playtest Readiness** — The Expo 55 + React Three Fiber migration is complete. The 3D scene renders terrain, buildings, routes, and vegetation. A Fallout-style HUD is implemented as React Native overlays. Combat, dialogue, travel, and survival systems exist but need wiring into a cohesive gameplay loop.

## Current Branch

`feature/comprehensive-modularization-and-ddl`

## Source of Truth

- Memory bank files in `memory-bank/`
- `CLAUDE.md` at repo root for dev commands and project structure

## Architecture Summary

- **Expo 55** with Expo Router for navigation (`app/` directory)
- **React Three Fiber** (R3F) Canvas for 3D rendering (`components/scene/`)
- **React Native** overlays for HUD panels (`components/game/`)
- **NativeWind** (Tailwind CSS for React Native) for styling
- **Zustand** store with modular slices (`src/game/store/slices/`)

## What Works

- Dev server runs on web (`pnpm dev` / `expo start --web`)
- 3D scene renders: terrain, sky, day/night cycle, lighting, vegetation, buildings, prop clusters
- FPS camera with mouse/touch look
- Fallout-style HUD: player vitals, compass bar, ammo display, crosshair, quest notifications
- Game panels: inventory, shop, character, quest log, dialogue, travel, world map
- Zustand store with 12 slices (core, player, combat, dialogue, inventory, quest, shop, travel, puzzle, settings, UI, plus survival)
- Town definitions with buildings, NPCs, shops, and schedules (12 locations defined)
- NPC entities with schedule-based movement
- Combat system with weapon view and damage feedback
- Travel system with transitions between locations
- Encounter system and zone boundaries
- DDL layer for data definitions
- ECS via Miniplex (archetypes, components, systems)
- Playwright E2E tests organized by category

## What Needs Wiring

- Systems (combat, dialogue, quest, travel, survival) need integration into a unified game loop
- Audio via Tone.js is scaffolded but not producing sound in-game
- Save/load persistence (expo-sqlite adapter exists, not yet connected end-to-end)
- NPC AI behavior (Yuka agents scaffolded but not driving in-scene entities)
- Full playtest loop from new game through quest completion

## Recent History

### Comprehensive Modularization (Current Branch)

- Migrated from Ionic Angular + Capacitor + Babylon.js to Expo 55 + React Three Fiber + NativeWind
- Deleted all Babylon.js code and Angular infrastructure
- Implemented Fallout-style HUD with React Native components over R3F Canvas
- Recalibrated combat system for R3F rendering
- Defined 12 town/location data files with buildings, NPCs, and shops
- Performed content scrub and data consistency pass
- Added building interior system
- Added NPC schedule resolver and movement system
- Added travel manager with location transitions
- Modularized Zustand store into 12 typed slices
- Added DDL schema layer for data definitions
- Reorganized E2E tests into categorical directories (core, persistence, quality, spatial, systems, ui, validation)
