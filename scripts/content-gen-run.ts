import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MeshyApiError extends Error {
  statusCode: number;
  isRateLimit: boolean;
  isAuthError: boolean;

  constructor(message: string, statusCode: number, isRateLimit = false, isAuthError = false) {
    super(message);
    this.statusCode = statusCode;
    this.isRateLimit = isRateLimit;
    this.isAuthError = isAuthError;
    this.name = "MeshyApiError";
  }
}

class RateLimitError extends MeshyApiError {
  constructor(message: string) {
    super(message, 429, true, false);
    this.name = "RateLimitError";
  }
}

class AuthenticationError extends MeshyApiError {
  constructor(message: string) {
    super(message, 401, false, true);
    this.name = "AuthenticationError";
  }
}

class InsufficientCreditsError extends MeshyApiError {
  constructor(message: string) {
    super(message, 402, false, false);
    this.name = "InsufficientCreditsError";
  }
}

class MeshyClient {
  private apiKey: string;
  private baseUrl: string;
  private streamTimeoutMs: number;
  private maxRetries: number;
  private retryDelayMs: number;

  constructor(config: { apiKey: string; baseUrl?: string; streamTimeoutMs?: number; maxRetries?: number; retryDelayMs?: number }) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? "https://api.meshy.ai/openapi").replace(/\/$/, "");
    this.streamTimeoutMs = config.streamTimeoutMs ?? 600_000;
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelayMs = config.retryDelayMs ?? 1_000;
  }

  async post(path: string, body?: unknown): Promise<any> {
    return this.request("POST", path, body);
  }

  async streamUntilComplete(path: string): Promise<any> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "text/event-stream",
      },
      signal: AbortSignal.timeout(this.streamTimeoutMs),
    });
    await this.ensureOk(response);
    if (!response.body) {
      throw new MeshyApiError("Streaming response did not include a body", 500);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalResult: any = null;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim().startsWith("data:")) continue;
          const payload = line.replace(/^data:\s*/, "");
          try {
            const parsed = JSON.parse(payload);
            finalResult = parsed;
            if (["SUCCEEDED", "FAILED", "CANCELED"].includes(parsed.status)) {
              await reader.cancel();
              return parsed;
            }
          } catch {
            // ignore non-JSON payloads
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    if (finalResult) return finalResult;
    throw new MeshyApiError("No data received from stream", 500);
  }

  private async request(method: string, path: string, body?: unknown): Promise<any> {
    let lastError: unknown = null;
    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt += 1) {
      try {
        const url = this.buildUrl(path);
        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: body ? JSON.stringify(body) : null,
        });
        await this.ensureOk(response);
        if (response.status === 204) {
          return undefined;
        }
        return await response.json();
      } catch (error) {
        lastError = error;
        if (error instanceof RateLimitError && attempt <= this.maxRetries) {
          await this.delay(this.retryDelayMs * attempt);
          continue;
        }
        break;
      }
    }
    throw lastError ?? new MeshyApiError("Unknown Meshy error", 500);
  }

  private buildUrl(pathValue: string): string {
    const url = new URL(`${this.baseUrl}${pathValue.startsWith("/") ? "" : "/"}${pathValue}`);
    return url.toString();
  }

  private async ensureOk(response: Response): Promise<void> {
    if (response.ok) return;
    let message = response.statusText;
    try {
      const payload = await response.json();
      if (payload.message) message = payload.message;
    } catch {
      // ignore
    }
    if (response.status === 401) throw new AuthenticationError(message);
    if (response.status === 402) throw new InsufficientCreditsError(message);
    if (response.status === 429) throw new RateLimitError(message);
    throw new MeshyApiError(message, response.status);
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

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

  const { loadJsonDefinitions, PipelineRunner } = await import(
    "@agentic-dev-library/meshy-content-generator"
  );

  const definitions = await loadJsonDefinitions({
    pipelinesDir: path.resolve(__dirname, "..", pipelinesDir),
    tasksDir: path.resolve(__dirname, "..", tasksDir),
  });

  const client = new MeshyClient({
    apiKey,
    streamTimeoutMs: Number.isFinite(streamTimeoutMs) ? streamTimeoutMs : 1_800_000,
  });

  const animationLibraryPath = path.resolve(
    __dirname,
    "../node_modules/@agentic-dev-library/meshy-content-generator/lookups/animation-library.json",
  );
  const animationLibrary = JSON.parse(fs.readFileSync(animationLibraryPath, "utf-8"));

  const runner = new PipelineRunner({
    definitions,
    client,
    lookups: {
      ANIMATION_IDS: animationLibrary.byPath ?? {},
    },
  });

  await runner.run({
    pipelineName,
    assetDir: path.resolve(__dirname, "..", assetDir),
    step,
  });
}

void main();
