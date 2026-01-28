# Active Context

## Current Focus

**Golden Path Port (Ionic Angular + Capacitor + Electron)** — Return focus to core migration path. Look‑dev and content‑gen are paused until the main character pipeline is corrected. Mobile-first remains the baseline experience.

## Source of Truth

- Vision baseline (authoritative): `memory-bank/vision-baseline.md`
- Migration plan: `memory-bank/migration-plan.md`

## Mobile-First Priority

- Mobile is the premium experience (phone + tablet + foldable). Web/desktop adapt from that baseline.
- Portrait + landscape phone must remain playable; foldable transitions must not break interaction.
- Haptics and gyro input are first-class where available.

## Look‑Dev Lab Scene (Paused)

A dedicated Babylon look‑dev route exists to evaluate visual identity and environment materials. This is **paused** until a proper main character asset is available via content‑gen.

**Scene elements in lab:**
- Babylon Dynamic Terrain extension: `src/engine/extensions/babylon.dynamicTerrain_modular.ts`
- Atmosphere add‑on, HDRI skybox, PBR terrain (AmbientCG) in `src/app/lookdev/`
- Western town assembled from `incoming/Main File V1_1.glb`, optimized to `assets/models/western/western-town-optimized.glb`
- Set dressing (water tower, well, cart, fence, barrels) + prop scatter (cactus/rocks)
- Placeholder hero: `assets/models/characters/man_adventurer.gltf` (temporary)

**Scripts used:**
- `scripts/blender/inspect_assets.py` — headless inspection
- `scripts/blender/optimize_western_town.py` — splits/optimizes western town and retextures with AmbientCG
- `scripts/generate_western_parts_manifest.mjs` — part manifest generator (if needed)

## Content‑Gen (Meshy) — Work Completed, Now Paused

Imported Meshy pipeline from Neo‑Tokyo and adapted:
- New package: `packages/content-gen` (renamed to @iron-frontier/content-gen)
- CLI supports `generate` and `resume` (for timeout recovery), with `MESHY_STREAM_TIMEOUT_MS`
- Pipelines now download artifacts (concept images, model, rigged model)
- Character manifest created: `assets/content/characters/iron-frontier-hero/manifest.json`
- Meshy tasks completed for hero (concept/model/rigging/animations) and artifacts downloaded:
  - `concept_0.png`, `concept_1.png`, `concept_2.png`
  - `model.glb`, `rigged.glb`
  - `animations/*.glb`

**Status:** paused until content‑gen is corrected (main character is required for look‑dev).

## Golden Path (Next)

1) Resume migration to single Ionic Angular app (root `src/`).
2) Re‑establish parity across UI/HUD/game systems.
3) Port tests (unit + Playwright + Maestro) aligned to parity.
4) Reintegrate content‑gen once main character pipeline is fixed.

## Recent History

### Session 2026‑01‑28 (Look‑Dev + Meshy)
- Created `/lookdev` route and Babylon lab scene.
- Optimized western town assets and added AmbientCG textures.
- Added Meshy content‑gen pipeline, hero manifest, and generated hero outputs.
- Added CLI resume support for long Meshy jobs.

### Session 2026‑01‑28 (AI/Physics + Playwright)
- Integrated Yuka agents and Rapier physics scaffolding into the hex scene manager.
- Expanded Playwright E2E coverage (inventory/shop/combat) and stabilized selectors.
- Playwright now runs single‑worker for reliability across all viewport projects.
- Cleaned Angular template warnings and allowed audio CommonJS deps in build.

### Session 2026‑01‑27 (PR Feedback Fixes)
- Fixed Babylon resize/event listener leaks, pathfinding validation, and ARIA attributes across UI.

## Current Branch

`release/v0.1-candidate` (PR #1 open against `main`).
