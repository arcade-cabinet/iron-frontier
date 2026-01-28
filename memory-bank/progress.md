# Progress

## 2026-01-28

- **Look‑Dev Lab Scene (Paused)**
  - Added `/lookdev` Babylon scene with Dynamic Terrain, Atmosphere, HDRI, PBR terrain, western town assembly, and prop scatter.
  - Optimized western town assets via Blender scripts and AmbientCG materials.
  - Placeholder hero uses `man_adventurer.gltf` until content‑gen is corrected.

- **Meshy Content‑Gen (Paused)**
  - Imported and simplified Meshy pipeline into `packages/content-gen`.
  - Added CLI `generate` + `resume` flow with adjustable stream timeout.
  - Created hero manifest and generated concept/model/rigged/animation assets.
  - Artifacts stored in `assets/content/characters/iron-frontier-hero/`.

- **Playwright Parity Tests**
  - Stabilized quest playthrough test selectors in `tests/e2e/playthrough.spec.ts`.
  - Full Playwright suite passing across all configured viewports (54 tests).

## 2026-01-27

- Fixed Babylon resize/memory leaks and pathfinding validation.
- Added ARIA attributes to decorative SVGs across UI.
