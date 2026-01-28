# @iron-frontier/content-gen

Deprecated. Use `@agentic-dev-library/meshy-content-generator` with per-asset pipelines in
`assets/content/**/` and shared task definitions in `assets/content/tasks/definitions`.

Meshy-driven asset generation pipeline for Iron Frontier.

## Architecture

```text
src/
├── api/                     # Meshy API client
│   └── meshy-client.ts      # HTTP client with streaming support
├── cli.ts                   # CLI entry point
├── pipelines/
│   ├── definitions/         # Pipeline orchestration JSONs
│   │   ├── character.pipeline.json
│   │   └── prop.pipeline.json
│   └── pipeline-executor.ts # Executes pipelines from JSON definitions
├── tasks/
│   ├── definitions/         # Individual task type JSONs
│   │   ├── text-to-image.json
│   │   ├── multi-image-to-3d.json
│   │   ├── rigging.json
│   │   └── animation.json
│   └── registry.ts          # Animation ID mappings
└── types/
    └── manifest.ts          # Zod schemas for asset manifests
```

## CLI Usage

```bash
# From repo root
pnpm --dir packages/content-gen generate <asset-dir> [--pipeline <name>] [--step <step-id>]

# Examples
pnpm --dir packages/content-gen generate assets/content/characters/iron-frontier-hero
pnpm --dir packages/content-gen generate assets/content/characters/iron-frontier-hero --step concept
pnpm --dir packages/content-gen generate assets/content/props/steam-rifle --pipeline prop

# Resume a step if a stream times out
MESHY_STREAM_TIMEOUT_MS=1200000 pnpm --dir packages/content-gen exec tsx src/cli.ts resume assets/content/characters/iron-frontier-hero --step model --task <task-id>
```

## Manifest-driven Pipelines

Each asset directory contains a `manifest.json` that declares:
- metadata (id, name, type, description)
- task configs (prompt, pose, polycount, texture prompt, etc.)
- pipeline state (task IDs, outputs, artifacts)

The executor reads `manifest.json`, resolves the pipeline (character or prop), and executes steps in order.

## Prompt Strategy

**Concept prompts** (text-to-image):
- Focus on silhouette, outfit shape, and prop loadout
- Specify pose mode (A/T) for rigging
- Keep to one character or one prop per manifest

**Texture prompts** (multi-image-to-3d):
- Dial in leather/brass/cloth/metal material cues
- Call out steampunk patina, weathering, and dust

## Meshy API Endpoints

| Task Type | API Version | Endpoint |
|-----------|-------------|----------|
| text-to-image | v1 | /v1/text-to-image |
| multi-image-to-3d | v1 | /v1/image-to-3d |
| rigging | v1 | /v1/rigging |
| animation | v1 | /v1/animations |

## Seeds

Seeds ensure reproducible generation:
- Auto-generated using `seedrandom` if not in manifest
- Stored as unsigned 32-bit integer (Meshy requirement)
- Same seed + same prompt = same output
