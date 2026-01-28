import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback?: string) => {
    const index = args.indexOf(name);
    if (index === -1) return fallback;
    return args[index + 1] ?? fallback;
  };

  const pipelineName = getArg("--pipeline", "iron-frontier-hero") ?? "iron-frontier-hero";
  const assetDir = getArg("--asset", "assets/content/characters/iron-frontier-hero") ?? "";
  const pipelinesDir =
    getArg("--pipelines", "assets/content/characters/iron-frontier-hero") ?? "";
  const tasksDir = getArg("--tasks", "assets/content/tasks/definitions") ?? "";
  const step = getArg("--step");

  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) {
    throw new Error("MESHY_API_KEY is required in environment or .env.");
  }

  const streamTimeoutMs = Number(process.env.MESHY_STREAM_TIMEOUT_MS ?? "1800000");

  const agenticRoot = path.resolve(
    __dirname,
    "../../../agentic-dev-library/meshy-content-generator/src",
  );
  const { loadJsonDefinitions } = await import(
    pathToFileURL(path.join(agenticRoot, "core/definitions.ts")).href,
  );
  const { PipelineRunner } = await import(
    pathToFileURL(path.join(agenticRoot, "core/runner.ts")).href,
  );
  const { loadAnimationIds } = await import(
    pathToFileURL(path.join(agenticRoot, "lookups/animation-ids.ts")).href,
  );
  const { MeshyClient } = await import(
    pathToFileURL(path.join(agenticRoot, "meshy/meshy-client.ts")).href,
  );

  const definitions = await loadJsonDefinitions({
    pipelinesDir: path.resolve(__dirname, "..", pipelinesDir),
    tasksDir: path.resolve(__dirname, "..", tasksDir),
  });

  const client = new MeshyClient({
    apiKey,
    streamTimeoutMs: Number.isFinite(streamTimeoutMs) ? streamTimeoutMs : 1_800_000,
  });

  const runner = new PipelineRunner({
    definitions,
    client,
    lookups: {
      ANIMATION_IDS: loadAnimationIds(),
    },
  });

  await runner.run({
    pipelineName,
    assetDir: path.resolve(__dirname, "..", assetDir),
    step,
  });
}

void main();
