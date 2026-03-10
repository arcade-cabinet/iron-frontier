# Project Brief

Iron Frontier is a **cross-platform 3D open-world RPG** set in a Steampunk American Frontier. It combines the atmospheric charm of classic Fallout-style RPGs with modern procedural generation, first-person exploration, and intuitive touch controls.

## Core Pillars

1. **Steampunk Frontier Aesthetic**: A unique blend of the Wild West and industrial steam technology (brass, gears, steam).
2. **First-Person Open World**: The player explores a vast 3D landscape from a first-person perspective, immersed in the frontier environment.
3. **Touch-First Design**: Controls are designed for thumbs, not mouse cursors. Virtual joystick movement and FPS touch aiming.
4. **"One More Minute" Loop**: Gameplay is designed for short bursts (30s to 5m) with frequent rewards and clear objectives.
5. **Cross-Platform Architecture**: Single Expo codebase targeting web, Android, and iOS with React Three Fiber for 3D.

## Goals

- Create a visually distinct mobile 3D RPG that feels "premium" and "hand-crafted" despite procedural elements.
- Ensure 60fps performance on mobile devices.
- Implement robust persistence (expo-sqlite) for complex world state.
- Share game logic, schemas, and data across all platforms via a single codebase.

## Current Status

- **Branch**: `feature/comprehensive-modularization-and-ddl`
- **Stack**: Expo 55 + React Three Fiber + NativeWind + Zustand
- **State**: 3D scene renders, HUD implemented, game systems exist but need integration into a playable loop
