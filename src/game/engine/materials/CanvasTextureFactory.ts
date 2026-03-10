// CanvasTextureFactory — Procedural painterly materials via Canvas API
// Seeded PRNG (alea) ensures deterministic output — no scopedRNG('render', 42, rngTick()).

import {
  CanvasTexture,
  MeshStandardMaterial,
  type MeshStandardMaterialParameters,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three';

import { globalTextureCache } from './TextureCache';
import {
  cacheKey,
  makeCanvas,
  makePRNG,
  mixColors,
  shiftColor,
  type PRNG,
} from './canvasUtils';
import { scopedRNG, rngTick } from '../../lib/prng';

// --- Internal helpers ---

function materialFromCanvas(
  canvas: OffscreenCanvas,
  extras?: MeshStandardMaterialParameters,
): MeshStandardMaterial {
  const texture = new CanvasTexture(canvas as unknown as HTMLCanvasElement);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;

  return new MeshStandardMaterial({ map: texture, ...extras });
}

function cached(
  kind: string,
  params: Record<string, unknown>,
  factory: () => MeshStandardMaterial,
): MeshStandardMaterial {
  const key = cacheKey(kind, params);
  const hit = globalTextureCache.get(key);
  if (hit) return hit;
  const mat = factory();
  globalTextureCache.set(key, mat);
  return mat;
}

// ---------------------------------------------------------------------------
// Wood
// ---------------------------------------------------------------------------

export function createWoodTexture(
  baseColor: string,
  grainColor: string,
  width = 256,
  height = 256,
): MeshStandardMaterial {
  const params = { baseColor, grainColor, width, height };
  return cached('wood', params, () => {
    const rng = makePRNG(`wood-${baseColor}-${grainColor}-${width}-${height}`);
    const { canvas, ctx } = makeCanvas(width, height);

    // Fill base
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    // Parallel wavy grain lines
    ctx.strokeStyle = grainColor;
    const lineCount = 12 + Math.floor(rng() * 8);
    for (let i = 0; i < lineCount; i++) {
      ctx.lineWidth = 0.8 + rng() * 1.6;
      ctx.globalAlpha = 0.25 + rng() * 0.35;
      ctx.beginPath();
      const yBase = (i / lineCount) * height;
      ctx.moveTo(0, yBase);
      for (let x = 0; x < width; x += 8) {
        const wave = Math.sin((x + rng() * 30) * 0.04) * (3 + rng() * 5);
        ctx.lineTo(x, yBase + wave + (rng() - 0.5) * 2);
      }
      ctx.stroke();
    }

    // Knot spots
    ctx.globalAlpha = 1;
    const knots = Math.floor(rng() * 3);
    for (let k = 0; k < knots; k++) {
      const kx = rng() * width;
      const ky = rng() * height;
      const kr = 3 + rng() * 6;
      ctx.fillStyle = shiftColor(grainColor, -30);
      ctx.beginPath();
      ctx.ellipse(kx, ky, kr, kr * (0.6 + rng() * 0.4), rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    return materialFromCanvas(canvas, { roughness: 0.75, metalness: 0.0 });
  });
}

// ---------------------------------------------------------------------------
// Stone
// ---------------------------------------------------------------------------

export function createStoneTexture(
  baseColor: string,
  mortarColor = '#8B8378',
): MeshStandardMaterial {
  const params = { baseColor, mortarColor };
  return cached('stone', params, () => {
    const rng = makePRNG(`stone-${baseColor}-${mortarColor}`);
    const { canvas, ctx } = makeCanvas(256, 256);

    // Mortar background
    ctx.fillStyle = mortarColor;
    ctx.fillRect(0, 0, 256, 256);

    // Irregular stone blocks
    const cols = 4 + Math.floor(rng() * 3);
    const rows = 5 + Math.floor(rng() * 4);
    const cw = 256 / cols;
    const rh = 256 / rows;
    const mortarWidth = 3;

    for (let r = 0; r < rows; r++) {
      const rowShift = r % 2 === 0 ? 0 : cw * 0.4;
      for (let c = 0; c < cols + 1; c++) {
        const x = c * cw + rowShift + (rng() - 0.5) * 6;
        const y = r * rh + (rng() - 0.5) * 4;
        const w = cw - mortarWidth + (rng() - 0.5) * 4;
        const h = rh - mortarWidth + (rng() - 0.5) * 3;
        ctx.fillStyle = shiftColor(baseColor, (rng() - 0.5) * 30);
        ctx.fillRect(x, y, w, h);

        // Subtle surface noise
        paintNoiseSpeckles(ctx, rng, x, y, w, h, baseColor, 8);
      }
    }

    return materialFromCanvas(canvas, { roughness: 0.9, metalness: 0.0 });
  });
}

// ---------------------------------------------------------------------------
// Metal
// ---------------------------------------------------------------------------

export function createMetalTexture(
  baseColor: string,
  patinaColor?: string,
): MeshStandardMaterial {
  const patina = patinaColor ?? shiftColor(baseColor, -40);
  const params = { baseColor, patinaColor: patina };
  return cached('metal', params, () => {
    const rng = makePRNG(`metal-${baseColor}-${patina}`);
    const { canvas, ctx } = makeCanvas(256, 256);

    // Base metallic fill
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 256);

    // Fine horizontal scratch lines
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 60; i++) {
      ctx.strokeStyle = shiftColor(baseColor, (rng() - 0.5) * 50);
      ctx.lineWidth = 0.5 + rng() * 0.8;
      const y = rng() * 256;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y + (rng() - 0.5) * 4);
      ctx.stroke();
    }

    // Patina blotches
    ctx.globalAlpha = 0.35;
    const spots = 4 + Math.floor(rng() * 6);
    for (let s = 0; s < spots; s++) {
      ctx.fillStyle = mixColors(patina, baseColor, rng() * 0.5);
      ctx.beginPath();
      ctx.arc(rng() * 256, rng() * 256, 8 + rng() * 18, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    return materialFromCanvas(canvas, { roughness: 0.35, metalness: 0.7 });
  });
}

// ---------------------------------------------------------------------------
// Fabric
// ---------------------------------------------------------------------------

export function createFabricTexture(
  baseColor: string,
  pattern: 'plain' | 'plaid' | 'stripe' = 'plain',
): MeshStandardMaterial {
  const params = { baseColor, pattern };
  return cached('fabric', params, () => {
    const rng = makePRNG(`fabric-${baseColor}-${pattern}`);
    const { canvas, ctx } = makeCanvas(256, 256);

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 256);

    // Weave texture (tiny alternating dots)
    ctx.globalAlpha = 0.08;
    for (let y = 0; y < 256; y += 2) {
      for (let x = 0; x < 256; x += 2) {
        if ((x + y) % 4 === 0) {
          ctx.fillStyle = shiftColor(baseColor, 20);
          ctx.fillRect(x, y, 1, 1);
        } else {
          ctx.fillStyle = shiftColor(baseColor, -15);
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    ctx.globalAlpha = 1;

    if (pattern === 'stripe') {
      const stripeColor = shiftColor(baseColor, -50);
      ctx.globalAlpha = 0.3;
      for (let x = 0; x < 256; x += 32 + Math.floor(rng() * 12)) {
        ctx.fillStyle = stripeColor;
        ctx.fillRect(x, 0, 6 + rng() * 4, 256);
      }
    } else if (pattern === 'plaid') {
      const lineColor = shiftColor(baseColor, -40);
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 4;
      for (let x = 0; x < 256; x += 28 + Math.floor(rng() * 10)) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke();
      }
      for (let y = 0; y < 256; y += 28 + Math.floor(rng() * 10)) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
    return materialFromCanvas(canvas, { roughness: 0.85, metalness: 0.0 });
  });
}

// ---------------------------------------------------------------------------
// Sand
// ---------------------------------------------------------------------------

export function createSandTexture(
  baseColor = '#D2B48C',
): MeshStandardMaterial {
  const params = { baseColor };
  return cached('sand', params, () => {
    const rng = makePRNG(`sand-${baseColor}`);
    const { canvas, ctx } = makeCanvas(256, 256);

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 256);

    // Grain noise
    for (let i = 0; i < 3000; i++) {
      const x = rng() * 256;
      const y = rng() * 256;
      ctx.fillStyle = shiftColor(baseColor, (rng() - 0.5) * 25);
      ctx.globalAlpha = 0.3 + rng() * 0.3;
      ctx.fillRect(x, y, 1 + rng(), 1 + rng());
    }

    // Occasional pebbles
    ctx.globalAlpha = 0.6;
    const pebbles = 5 + Math.floor(rng() * 8);
    for (let p = 0; p < pebbles; p++) {
      ctx.fillStyle = shiftColor(baseColor, -30 - rng() * 20);
      ctx.beginPath();
      ctx.ellipse(
        rng() * 256, rng() * 256,
        1.5 + rng() * 2.5, 1 + rng() * 2,
        rng() * Math.PI, 0, Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    return materialFromCanvas(canvas, { roughness: 0.95, metalness: 0.0 });
  });
}

/** Scatter tiny color-shifted specks over a rectangular region. */
function paintNoiseSpeckles(
  ctx: OffscreenCanvasRenderingContext2D, rng: PRNG,
  x: number, y: number, w: number, h: number, color: string, count: number,
): void {
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = shiftColor(color, (rng() - 0.5) * 40);
    ctx.fillRect(x + rng() * w, y + rng() * h, 1 + rng() * 2, 1 + rng() * 2);
  }
  ctx.globalAlpha = 1;
}
