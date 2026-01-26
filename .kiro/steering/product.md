# Product Overview

Iron Frontier is a cross-platform isometric RPG set in a Steampunk American Frontier (late 1800s Wild West meets industrial steam technology).

## Core Identity

- **Genre**: Procedurally-generated RPG with Daggerfall-style content generation
- **Aesthetic**: Steampunk Frontier - brass, gears, steam engines, gunslingers
- **Presentation**: 3D diorama with tilt-shift effect (not grid-based tiles)
- **Platforms**: Web (Babylon.js) + Mobile (React Native Filament)
- **Target**: Touch-first mobile experience, 60fps on mid-range devices

## Key Features

- Procedural world generation from seeds (deterministic)
- Turn-based combat system
- NPC dialogue trees and quest system
- Inventory, equipment, and character progression
- SQLite persistence (sql.js on web, expo-sqlite on mobile)

## Design Principles

1. **Touch-First**: Minimum 44px touch targets, thumb-optimized controls
2. **Short Sessions**: "One more minute" gameplay loop (30s-5m bursts)
3. **DRY Architecture**: All game logic, schemas, and data shared across platforms
4. **Performance**: 60fps target, dynamic LOD, instanced rendering
5. **Offline-Ready**: PWA-capable, works without internet

## Current Status

v0.1 Release Candidate - 203 tests passing, monorepo complete, responsive UI implemented
