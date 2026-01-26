# AGENTS.md - Iron Frontier Development Guide

## Deep Context (Memory Bank)

> **AI AGENTS**: Before starting work, read these files in `memory-bank/`:
>
> - `memory-bank/activeContext.md` (Current focus & recent changes)
> - `memory-bank/projectbrief.md` (Core goals)
> - `memory-bank/systemPatterns.md` (Architecture & decisions)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Expo dev server
pnpm expo:start

# Start web
pnpm expo:web

# Start iOS
pnpm expo:ios

# Start Android
pnpm expo:android

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## Project Overview

**Iron Frontier** is a cross-platform isometric RPG set in a Steampunk American Frontier (late 1800s).

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Expo SDK 54 + React Native 0.81 |
| **Web** | React 19 + React Native Web |
| **3D Rendering** | React Three Fiber (web) + expo-gl (native) |
| **State** | Zustand |
| **Persistence** | sql.js (web) + expo-sqlite (native) |
| **Styling** | NativeWind (Tailwind CSS v4) |
| **Routing** | Expo Router |

## Unified Expo Structure

```
iron-frontier/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx           # Tab layout
│   │   ├── index.tsx             # Game screen
│   │   ├── inventory.tsx         # Inventory screen
│   │   └── settings.tsx          # Settings screen
│   └── _layout.tsx               # Root layout
│
├── src/                          # All source code
│   ├── components/               # React components
│   │   ├── ui/                   # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Progress.tsx
│   │   └── game/                 # Game-specific components
│   │       ├── GameCanvas.web.tsx    # R3F canvas (web)
│   │       ├── GameCanvas.native.tsx # expo-gl canvas (native)
│   │       ├── hud/              # HUD components
│   │       │   ├── AdaptiveHUD.tsx
│   │       │   ├── MinimalHUD.tsx
│   │       │   ├── CompactHUD.tsx
│   │       │   └── FullHUD.tsx
│   │       ├── ui/               # Game UI panels
│   │       │   ├── ActionBar.tsx
│   │       │   ├── DialogueBox.tsx
│   │       │   ├── InventoryPanel.tsx
│   │       │   ├── CombatPanel.tsx
│   │       │   ├── QuestPanel.tsx
│   │       │   ├── ShopPanel.tsx
│   │       │   └── SettingsPanel.tsx
│   │       └── scenes/           # 3D scenes
│   │           ├── OverworldScene.tsx
│   │           └── CombatScene.tsx
│   ├── store/                    # Zustand store
│   │   ├── createGameStore.ts    # Store factory
│   │   ├── gameStateSlice.ts     # Game state slice
│   │   ├── defaults.ts           # Default values
│   │   └── types.ts              # Store types
│   ├── lib/                      # Utilities
│   │   ├── database.ts           # Platform-agnostic DB
│   │   ├── database.web.ts       # sql.js implementation
│   │   ├── database.native.ts    # expo-sqlite implementation
│   │   ├── assets.ts             # Asset loading
│   │   └── utils.ts              # Helpers
│   ├── game/                     # Game systems
│   └── types/                    # TypeScript types
│
├── assets/                       # Static assets
│   ├── models/                   # 3D models (Git LFS)
│   ├── textures/                 # Textures (Git LFS)
│   └── fonts/                    # Fonts
│
├── __tests__/                    # Jest tests
│   ├── setup.ts                  # Test setup
│   └── components/               # Component tests
│
├── .maestro/                     # Mobile E2E tests
├── docs/                         # Documentation
└── memory-bank/                  # AI context files
```

## Critical Files

| File | Purpose |
|------|---------|
| `app/(tabs)/index.tsx` | Main game screen |
| `src/store/createGameStore.ts` | Zustand store factory |
| `src/lib/database.ts` | Platform-agnostic database interface |
| `src/components/game/GameCanvas.web.tsx` | Web 3D rendering (R3F) |
| `src/components/game/GameCanvas.native.tsx` | Native 3D rendering (expo-gl) |
| `src/components/game/hud/AdaptiveHUD.tsx` | Responsive HUD |
| `app.json` | Expo configuration |
| `metro.config.ts` | Metro bundler config |
| `tailwind.config.ts` | Tailwind/NativeWind config |

## Game Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SPLASH    │ --> │  MAIN MENU  │ --> │   PLAYING   │
│  (2.5 sec)  │     │ New/Continue│     │  3D + HUD   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    v                         v                         v
             ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
             │   DIALOGUE  │          │   COMBAT    │          │   TRAVEL    │
             │  NPC Talks  │          │ Turn-Based  │          │  Encounters │
             └─────────────┘          └─────────────┘          └─────────────┘
```

## State Management

**Zustand** is the single source of truth:

```typescript
// Game phases
type GamePhase = 'title' | 'playing' | 'dialogue' | 'combat' | 'travel' | 'game_over';

// Core state
interface GameState {
  phase: GamePhase;
  playerStats: PlayerStats;
  inventory: InventoryItem[];
  activeQuests: ActiveQuest[];
  currentLocationId: string;
  activePanel: PanelType | null;
  // ... and more
}
```

## Styling Guidelines

### Color Palette (Steampunk Frontier)

```css
/* Primary (brass/gold) */
amber-500 to amber-700

/* Backgrounds */
stone-900, stone-950, amber-950

/* Accents */
orange-600, yellow-500

/* Text */
amber-100 (primary), amber-300 (muted), stone-400 (subtle)
```

### Responsive Breakpoints

```css
xs: 0-479px    /* Mobile portrait - icon-only, large touch targets */
sm: 480px+     /* Mobile landscape - labels visible */
md: 768px+     /* Tablet - multi-column */
lg: 1024px+    /* Desktop - full layouts */
```

### Touch Targets

All interactive elements: `min-h-[44px]` minimum (iOS HIG)

## Platform-Specific Code

Use `.web.tsx` and `.native.tsx` extensions for platform-specific implementations:

```typescript
// src/components/game/GameCanvas.web.tsx - React Three Fiber
import { Canvas } from '@react-three/fiber';

// src/components/game/GameCanvas.native.tsx - expo-gl
import { GLView } from 'expo-gl';
```

## Testing

```bash
pnpm test              # Run Jest tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

Test structure:
- `__tests__/setup.ts` - Jest configuration
- `__tests__/components/` - Component tests

## Mobile E2E Testing

```bash
# Run Maestro tests
maestro test .maestro/

# Specific test
maestro test .maestro/basic-gameplay.yaml
```

## Common Tasks

### Adding New UI Components

1. Create component in `src/components/ui/` or `src/components/game/ui/`
2. Use NativeWind for styling
3. Ensure 44px minimum touch targets
4. Add tests in `__tests__/components/`

### Adding New Screens

1. Create file in `app/` directory
2. Use Expo Router conventions
3. Import and use game components

### Platform-Specific Features

1. Create `.web.tsx` and `.native.tsx` versions
2. Export common interface from base file
3. Metro will automatically select correct version

## Known Patterns

### React Three Fiber (Web)

```tsx
import { Canvas } from '@react-three/fiber';

<Canvas>
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="orange" />
  </mesh>
</Canvas>
```

### expo-gl (Native)

```tsx
import { GLView } from 'expo-gl';
import * as THREE from 'three';

<GLView onContextCreate={onContextCreate} />
```

## Current Status (Expo Unified Architecture)

- **Expo SDK 54** with React Native 0.81
- **Platform-specific rendering** (R3F web, expo-gl native)
- **Unified codebase** with single Expo app
- **Adaptive HUD** with responsive breakpoints
- **All game UI panels** implemented
- **Jest testing** configured
- **Maestro E2E** tests ready

## Migration Notes

This project was migrated from a pnpm workspace monorepo to a unified Expo application. The old structure with `apps/web/`, `apps/mobile/`, and `packages/shared/` has been consolidated into a single Expo app with platform-specific code using `.web.tsx` and `.native.tsx` extensions.
