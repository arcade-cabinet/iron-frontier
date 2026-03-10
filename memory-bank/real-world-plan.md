# Real-World Action Plan

## Decisions

- Switch entirely to `pnpm` and ignore `package-lock.json`/`npm-shrinkwrap.json`. The repo now has a clean lockfile and dependency tree.
- Replace the old `@iron-frontier/content-gen` CLI with `@agentic-dev-library/meshy-content-generator`, keeping pipelines and task definitions inside `assets/content/…`.
- Introduce `scripts/content-gen-run.ts` so we can execute the new runner with top-level `tsx` and direct imports from the agentic package’s source.
- Upgrade the runner: poll final SSE responses, fetch results again to capture `result` payloads, iterate over array outputs, and guard downloads against empty URLs.
- Capture Meshy hero outputs and eight retextured variants (brass patina, dusty canvas, midnight coat, etc.) so the look-dev scene always references a real character.

## Current Workstream

1. Document all Meshy decisions in `memory-bank/activeContext.md` and update `memory-bank/progress.md` with the latest run.
2. Continue generating missing assets by creating manifest/pipeline pairs under `assets/content/{characters|props|npcs}/…`.
3. Reuse `scripts/content-gen-run.ts` as the canonical bridge between our repo and the agentic library; iterate the stream timeout via `MESHY_STREAM_TIMEOUT_MS` if tasks stall.
4. Keep the look-dev lab idle until the hero pipeline and corresponding Babylon scene elements are confirmed to match the new assets.

## Next Moves (Real-World)

- Run the hero pipeline end-to-end (already done), then collect any additional Meshy outputs the gameplay team requests (props, bosses, NPCs).
- Update game UI/scene assets to reference the freshly generated GLBs and ensure the Babylon terrain/lighting settings honor the new materials.
- Use Playwright + Maestro to validate the new pipeline integration points once the UI references are refreshed.
