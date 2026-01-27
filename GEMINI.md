# Iron Frontier Context for Gemini

## Project Overview

**Iron Frontier** is a cross-platform isometric RPG set in a Steampunk American Frontier (circa 1887). It features procedural generation, turn-based interactions, and a distinct "diorama" visual style.

*   **Type:** Monorepo (pnpm workspaces)
*   **Status:** Alpha v0.1 (Release Candidate)
*   **Platforms:** Web (React + Babylon.js) and Mobile (Expo + React Native Filament)
*   **Core Architecture:** Shared data/logic package, platform-specific UI/Rendering.

## Technical Architecture

### Tech Stack

| Component | Technology | Details |
| :--- | :--- | :--- |
| **Monorepo** | pnpm | Workspaces: `apps/web`, `apps/mobile`, `apps/docs`, `packages/shared` |
| **Web** | React 19, Vite 7 | Babylon.js 8 (WebGPU) via Reactylon pattern |
| **Mobile** | Expo SDK 54 | React Native Filament (native 3D rendering) |
| **Shared** | TypeScript | Zod v4 Schemas, Game Data, Procedural Generation Logic |
| **State** | Zustand | Persisted via `sql.js` (Web) and `expo-sqlite` (Mobile) |
| **Styling** | Tailwind CSS v4 | NativeWind (Mobile), shadcn/ui (Web) |
| **Testing** | Vitest, Playwright | Unit tests (Vitest), E2E (Playwright/Maestro) |
| **Linting** | Biome | Linting and Formatting |

### Key Directories

*   `apps/web/`: Web application source.
*   `apps/mobile/`: Mobile application source.
*   `apps/docs/`: Documentation site (Astro).
*   `packages/shared/`: **CRITICAL**. Contains all game data, schemas (Zod), and procedural generation logic. **Modify this for gameplay changes.**
*   `memory-bank/`: Context files for AI agents.
*   `.github/workflows/`: CI/CD pipelines (pinned to specific SHAs).

## Development Workflow

### Commands

Run these from the project root:

*   **Install:** `pnpm install`
*   **Dev (Web):** `pnpm dev` (Port 8080)
*   **Dev (Mobile):** `pnpm dev:mobile`
*   **Test (All):** `pnpm test` (Runs 203+ tests)
*   **Typecheck:** `pnpm typecheck` (Strict TypeScript)
*   **Lint:** `pnpm lint`
*   **Build (Web):** `pnpm build`
*   **Build (Docs):** `pnpm docs:build`

### Conventions

1.  **Strict Typing:** No `any`. Explicit types required. Zod schemas used for runtime validation.
2.  **Shared Logic:** Game logic, data, and schemas MUST reside in `packages/shared`. Platform apps only handle rendering and input.
3.  **Reactylon (Web):** Use declarative JSX for Babylon.js meshes (e.g., `<box options={{...}} />`).
4.  **State Management:** Use Zustand. Avoid frequent re-renders by selecting specific state slices.
5.  **Testing:** Add tests for new features. Use `test-utils.tsx` for component testing.
6.  **Git:** Use Conventional Commits (e.g., `feat:`, `fix:`, `chore:`).

## Current Status & Goals

*   **Current Branch:** `release/v0.1-candidate`
*   **Immediate Goal:** Merge PR #1 and deploy v0.1.
*   **Focus:** Stability, Performance (60fps), and Robustness.

## Critical Files

*   `packages/shared/src/data/schemas/*.ts`: Data definitions (Zod).
*   `apps/web/src/game/store/webGameStore.ts`: Web-specific state.
*   `apps/web/src/engine/hex/HexSceneManager.ts`: 3D rendering logic.
*   `docs/DEVELOPMENT_GUIDE.md`: Detailed developer instructions.
