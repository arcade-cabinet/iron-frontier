# Product Context

## Problem Statement

Many mobile RPGs feel "soulless" — either generic gacha cash-grabs or clunky ports of PC games with poor touch controls. They lack atmosphere and tangible world-building.

## Solution

Iron Frontier aims to restore the "soul" of exploration-focused RPGs by:

1. **Focusing on Atmosphere**: Using lighting, fog, day/night cycles, and sound to create immersion.
2. **Respecting Mobile**: Designing UI and controls specifically for small touch screens.
3. **Procedural Depth**: Using seeded generation to create infinite but meaningful content (not just random noise).
4. **Single Codebase**: Expo + React Three Fiber delivers to web, Android, and iOS from one project.

## Visual Identity

- **Fallout-style HUD**: Amber/green tinted interface with serif typography, pip-boy-inspired panels
- **Steampunk Frontier**: Brass, gears, steam pipes, wooden frontier buildings, desert terrain
- **Low-poly 3D**: Stylized terrain and buildings rendered via React Three Fiber

## User Experience Timeline

- **0-30 Seconds (Hook)**:
  - Immediate drop into gameplay (no long tutorials).
  - First "wow" moment stepping into the 3D frontier world.
  - Fallout-style HUD gives familiar RPG grounding.

- **5 Minutes (Engagement)**:
  - Intuitive first-person movement (virtual joystick on mobile, WASD on web).
  - First loot drop (satisfying feedback).
  - Clear short-term objective ("Talk to the Sheriff").

- **20 Minutes (Retention)**:
  - Level up and stat increase.
  - Exploration of a new biome (visual variety).
  - Discovery of a mystery or deeper quest chain.

## Game Systems

| System | Status | Notes |
|--------|--------|-------|
| **FPS Movement** | Working | FPSCamera with mouse/touch look |
| **Combat** | Implemented | Encounter-based, needs game loop wiring |
| **Dialogue** | Implemented | Branching choices, quest integration |
| **Quests** | Implemented | Event tracking, marker system |
| **Travel** | Implemented | Fast travel between 12 locations |
| **Inventory** | Implemented | Item management, equipment |
| **Shop** | Implemented | Buy/sell with NPC merchants |
| **Survival** | Implemented | Fatigue, provisions, camping |
| **Puzzles** | Implemented | Pipe puzzle minigame |
| **Audio** | Scaffolded | Tone.js dependency, not producing sound |
| **Save/Load** | Scaffolded | Database manager exists, not connected |
| **NPC AI** | Scaffolded | Yuka dependency, schedule system, not driving behavior |

## Current Locations

12 defined locations: Coppertown, Dusty Springs, Junction City, Copper Mine, Desert Waystation, Freeminer Hollow, Old Works, Prospect, Rattlesnake Canyon, Signal Rock, Sunset Ranch, Thornwood Station.
