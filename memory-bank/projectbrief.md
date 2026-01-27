# Project Brief

Iron Frontier is a **cross-platform isometric RPG** set in a Steampunk American Frontier. It combines the atmospheric charm of classic PS1-era RPGs (like Final Fantasy VII) with modern procedural generation and intuitive touch controls.

## Core Pillars

1. **Steampunk Frontier Aesthetic**: A unique blend of the Wild West and industrial steam technology (brass, gears, steam).
2. **Diorama Presentation**: The world renders as a tangible, tilt-shift tabletop diorama, distinct from grid-based tile games.
3. **Touch-First Design**: Controls are designed for thumbs, not mouse cursors. "Tap to move" and "virtual joystick" options.
4. **"One More Minute" Loop**: Gameplay is designed for short bursts (30s to 5m) with frequent rewards and clear objectives.
5. **Cross-Platform Architecture**: Single shared codebase with platform-optimized 3D engines.

## Goals

- Create a visually distinct mobile RPG that feels "premium" and "hand-crafted" despite procedural elements.
- Ensure 60fps performance on mobile devices.
- Implement a robust persistence layer (SQLite) for complex world state.
- Share game logic, schemas, and data across web and native mobile platforms.

## Current Status: v0.1 Release Candidate

- **Migration in progress** to a single Ionic Angular + Capacitor app (web/android/ios/electron)
- **Babylon.js 8** used directly in Angular (no Reactylon)
- **Shared**: Zod v4 schemas and procedural generation preserved for port
