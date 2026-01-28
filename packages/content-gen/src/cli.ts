import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PipelineExecutor } from './pipelines/pipeline-executor';
import { AssetManifestSchema } from './types/manifest';

const program = new Command();

program.name('content-gen').description('Iron Frontier Meshy pipeline CLI').version('0.1.0');

const PIPELINE_BY_TYPE: Record<string, string> = {
  character: 'character',
  prop: 'prop',
  environment: 'prop',
  background: 'prop',
  tile: 'prop',
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

function loadEnv(): void {
  if (process.env.MESHY_API_KEY) return;

  const envPath = path.join(repoRoot, '.env');

  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const [key, ...rest] = line.split('=');
    if (!key) continue;
    const value = rest.join('=').trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function resolveAssetDir(inputPath: string): string {
  if (path.isAbsolute(inputPath)) return inputPath;
  const cwdCandidate = path.resolve(process.cwd(), inputPath);
  const rootCandidate = path.resolve(repoRoot, inputPath);
  const cwdManifest = path.join(cwdCandidate, 'manifest.json');
  if (fs.existsSync(cwdManifest)) return cwdCandidate;
  const rootManifest = path.join(rootCandidate, 'manifest.json');
  if (fs.existsSync(rootManifest)) return rootCandidate;
  return cwdCandidate;
}

function loadManifest(assetDir: string) {
  const manifestPath = path.join(assetDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  return AssetManifestSchema.parse(raw);
}

program
  .command('generate <assetDir>')
  .description('Run Meshy pipeline for a manifest-driven asset directory')
  .option('-p, --pipeline <name>', 'Pipeline name (character | prop)')
  .option('-s, --step <id>', 'Run a single pipeline step')
  .action(async (assetDir, options: { pipeline?: string; step?: string }) => {
    loadEnv();
    const apiKey = process.env.MESHY_API_KEY;
    if (!apiKey) {
      console.error('Missing MESHY_API_KEY. Add it to .env or your shell environment.');
      process.exit(1);
    }

    const resolvedDir = resolveAssetDir(assetDir);
    const manifest = loadManifest(resolvedDir);
    const pipelineName = options.pipeline ?? PIPELINE_BY_TYPE[manifest.type];
    const streamTimeoutMs = process.env.MESHY_STREAM_TIMEOUT_MS
      ? Number.parseInt(process.env.MESHY_STREAM_TIMEOUT_MS, 10)
      : undefined;

    if (!pipelineName) {
      console.error(`No pipeline mapped for asset type: ${manifest.type}`);
      process.exit(1);
    }

    const executor = new PipelineExecutor(apiKey, { streamTimeoutMs });
    await executor.execute(pipelineName, resolvedDir, { step: options.step });
  });

program
  .command('resume <assetDir>')
  .description('Resume a pipeline step with an existing Meshy task ID')
  .requiredOption('-s, --step <id>', 'Pipeline step id (concept | model | rigging | animations)')
  .requiredOption('-t, --task <taskId>', 'Meshy task ID to resume')
  .option('-p, --pipeline <name>', 'Pipeline name (character | prop)')
  .action(async (assetDir, options: { pipeline?: string; step: string; task: string }) => {
    loadEnv();
    const apiKey = process.env.MESHY_API_KEY;
    if (!apiKey) {
      console.error('Missing MESHY_API_KEY. Add it to .env or your shell environment.');
      process.exit(1);
    }

    const resolvedDir = resolveAssetDir(assetDir);
    const manifest = loadManifest(resolvedDir);
    const pipelineName = options.pipeline ?? PIPELINE_BY_TYPE[manifest.type];
    const streamTimeoutMs = process.env.MESHY_STREAM_TIMEOUT_MS
      ? Number.parseInt(process.env.MESHY_STREAM_TIMEOUT_MS, 10)
      : undefined;

    if (!pipelineName) {
      console.error(`No pipeline mapped for asset type: ${manifest.type}`);
      process.exit(1);
    }

    const executor = new PipelineExecutor(apiKey, { streamTimeoutMs });
    await executor.resume(pipelineName, resolvedDir, options.step, options.task);
  });

program.parse();
