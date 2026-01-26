# Iron Frontier Context for Gemini

## Project Overview

**Iron Frontier** is a cross-platform isometric RPG set in a Steampunk American Frontier (circa 1887). It features procedural generation, turn-based interactions, and a distinct "diorama" visual style.

*   **Type:** Unified Expo Application
*   **Status:** Alpha v0.1 (Expo Migration Complete)
*   **Platforms:** Web, iOS, and Android (single codebase)
*   **Core Architecture:** Platform-specific rendering with shared game logic

## Technical Architecture

### Tech Stack

| Component | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Expo SDK 54 | React Native 0.81 |
| **Web** | React 19 | React Native Web |
| **3D (Web)** | React Three Fiber | Declarative Three.js |
| **3D (Native)** | expo-gl | Three.js with WebGL |
| **State** | Zustand | Persisted via sql.js (web) and expo-sqlite (native) |
| **Styling** | NativeWind | Tailwind CSS v4 |
| **Routing** | Expo Router | File-based routing |
| **Testing** | Jest | jest-expo preset |
| **E2E** | Maestro | Mobile E2E tests |
| **Linting** | Biome | Linting and Formatting |

### Key Directories

*   `app/`: Expo Router pages (file-based routing)
*   `components/`: React components (UI + Game)
*   `src/`: Game logic (store, lib, game systems)
*   `assets/`: 3D models, textures (Git LFS)
*   `__tests__/`: Jest tests
*   `.maestro/`: Mobile E2E tests
*   `memory-bank/`: Context files for AI agents
*   `docs/`: Documentation

## Development Workflow

### Commands

Run these from the project root:

*   **Install:** `pnpm install`
*   **Dev (Expo):** `pnpm expo:start`
*   **Dev (Web):** `pnpm expo:web`
*   **Dev (iOS):** `pnpm expo:ios`
*   **Dev (Android):** `pnpm expo:android`
*   **Test:** `pnpm test`
*   **Typecheck:** `pnpm typecheck`
*   **Lint:** `pnpm lint`
*   **Export (Web):** `pnpm expo:export:web`

### Conventions

1.  **Strict Typing:** No `any`. Explicit types required.
2.  **Platform-Specific Code:** Use `.web.tsx` and `.native.tsx` extensions
3.  **State Management:** Use Zustand. Avoid frequent re-renders.
4.  **Styling:** Use NativeWind (Tailwind CSS v4)
5.  **Touch Targets:** Minimum 44px for all interactive elements
6.  **Testing:** Add tests for new features
7.  **Git:** Use Conventional Commits (e.g., `feat:`, `fix:`, `chore:`)

## Current Status & Goals

*   **Current Branch:** `feature/expo-unified-architecture`
*   **Immediate Goal:** Complete migration testing and merge
*   **Focus:** Stability, Performance (60fps), Cross-platform compatibility

## Critical Files

*   `app/(tabs)/index.tsx`: Main game screen
*   `src/store/createGameStore.ts`: Zustand store factory
*   `src/lib/database.ts`: Platform-agnostic database interface
*   `components/game/GameCanvas.web.tsx`: Web 3D rendering
*   `components/game/GameCanvas.native.tsx`: Native 3D rendering
*   `components/game/hud/AdaptiveHUD.tsx`: Responsive HUD
*   `docs/ARCHITECTURE_V2.md`: New architecture documentation

## Migration Notes

This project was migrated from a pnpm workspace monorepo (`apps/web/`, `apps/mobile/`, `packages/shared/`) to a unified Expo application. Platform-specific code now uses `.web.tsx` and `.native.tsx` extensions instead of separate app directories.
