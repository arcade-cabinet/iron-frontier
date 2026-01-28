# Progress

## 2026-01-28

- **Look‑Dev Lab Scene (Paused)**
  - Added `/lookdev` Babylon scene with Dynamic Terrain, Atmosphere, HDRI, PBR terrain, western town assembly, and prop scatter.
  - Optimized western town assets via Blender scripts and AmbientCG materials.
  - Placeholder hero uses `man_adventurer.gltf` until content‑gen is corrected.

- **Meshy Content‑Gen (Migrated)**
  - Switched to `@agentic-dev-library/meshy-content-generator` and added local task defs under `assets/content/tasks/definitions`.
  - Added per‑asset pipeline definition `assets/content/characters/iron-frontier-hero/iron-frontier-hero.pipeline.json`.
  - Updated hero manifest to new schema with style variants and current animation list.
  - Root scripts now run the new content‑gen CLI against per‑asset pipelines.

- **Playwright Parity Tests**
  - Stabilized quest playthrough test selectors in `tests/e2e/playthrough.spec.ts`.
  - Full Playwright suite passing across all configured viewports (54 tests).

- **AI + Physics Integration**
  - Added Yuka agent manager and Rapier physics world for the hex scene.
  - Player movement now supports Yuka path following with Rapier collision scaffolding.

- **E2E Coverage Expansion**
  - Added inventory, shop, and combat Playwright system tests.
  - Added stable test hooks (`data-testid`) for combat targets, shop buy rows/buttons, and inventory item cards.
  - Playwright config now runs single-worker for stability; suite passing across all viewports (72 tests).

- **Build Hygiene**
  - Removed optional-chain template warnings in UI panels.
  - Allowed audio CommonJS deps in Angular build config.

## 2026-01-27

- Fixed Babylon resize/memory leaks and pathfinding validation.
- Added ARIA attributes to decorative SVGs across UI.
