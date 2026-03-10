// CanvasTextureFactory (organic / specialty materials)
//
// Split from the main factory to stay under 300 lines per file.
// Contains: skin, dirt, glass, leather, rust.

import {
  CanvasTexture,
  DoubleSide,
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
} from './canvasUtils';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

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
// Skin
// ---------------------------------------------------------------------------

export function createSkinTexture(tone: string): MeshStandardMaterial {
  const params = { tone };
  return cached('skin', params, () => {
    const rng = makePRNG(`skin-${tone}`);
    const { canvas, ctx } = makeCanvas(256, 256);

    // Smooth base with subtle warm variation
    ctx.fillStyle = tone;
    ctx.fillRect(0, 0, 256, 256);

    // Soft warmth blotches (sub-surface scattering hint)
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 20; i++) {
      const cx = rng() * 256;
      const cy = rng() * 256;
      const r = 20 + rng() * 40;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const warm = mixColors(tone, '#FFB8A0', 0.3 + rng() * 0.2);
      grad.addColorStop(0, warm);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }

    // Very fine pore noise
    ctx.globalAlpha = 0.04;
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = shiftColor(tone, (rng() - 0.5) * 12);
      ctx.fillRect(rng() * 256, rng() * 256, 1, 1);
    }

    ctx.globalAlpha = 1;
    return materialFromCanvas(canvas, { roughness: 0.65, metalness: 0.0 });
  });
}

// ---------------------------------------------------------------------------
// Dirt
// ---------------------------------------------------------------------------

export function createDirtTexture(baseColor = '#6B4423'): MeshStandardMaterial {
  const params = { baseColor };
  return cached('dirt', params, () => {
    const rng = makePRNG(`dirt-${baseColor}`);
    const { canvas, ctx } = makeCanvas(256, 256);

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 256);

    // Packed-earth variation (broad blotches)
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = shiftColor(baseColor, (rng() - 0.5) * 35);
      ctx.beginPath();
      ctx.arc(rng() * 256, rng() * 256, 10 + rng() * 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fine grain
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 2500; i++) {
      ctx.fillStyle = shiftColor(baseColor, (rng() - 0.5) * 20);
      ctx.fillRect(rng() * 256, rng() * 256, 1 + rng(), 1 + rng());
    }

    // Small stones
    ctx.globalAlpha = 0.5;
    const stones = 6 + Math.floor(rng() * 6);
    for (let s = 0; s < stones; s++) {
      ctx.fillStyle = shiftColor(baseColor, -25 - rng() * 25);
      ctx.beginPath();
      ctx.ellipse(
        rng() * 256, rng() * 256,
        2 + rng() * 3, 1.5 + rng() * 2.5,
        rng() * Math.PI, 0, Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    return materialFromCanvas(canvas, { roughness: 0.95, metalness: 0.0 });
  });
}

// ---------------------------------------------------------------------------
// Glass
// ---------------------------------------------------------------------------

export function createGlassTexture(
  tintColor = '#C8E8F0',
): MeshStandardMaterial {
  const params = { tintColor };
  return cached('glass', params, () => {
    const rng = makePRNG(`glass-${tintColor}`);
    const { canvas, ctx } = makeCanvas(128, 128);

    // Faint tinted fill
    ctx.fillStyle = tintColor;
    ctx.globalAlpha = 0.15;
    ctx.fillRect(0, 0, 128, 128);

    // Subtle distortion lines (wavy streaks)
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = shiftColor(tintColor, 40);
    for (let i = 0; i < 8; i++) {
      ctx.lineWidth = 0.5 + rng() * 1;
      ctx.beginPath();
      const yBase = rng() * 128;
      ctx.moveTo(0, yBase);
      for (let x = 0; x < 128; x += 6) {
        ctx.lineTo(x, yBase + Math.sin(x * 0.1 + rng() * 4) * 3);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    return materialFromCanvas(canvas, {
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.35,
      side: DoubleSide,
    });
  });
}

// ---------------------------------------------------------------------------
// Leather
// ---------------------------------------------------------------------------

export function createLeatherTexture(
  baseColor: string,
): MeshStandardMaterial {
  const params = { baseColor };
  return cached('leather', params, () => {
    const rng = makePRNG(`leather-${baseColor}`);
    const { canvas, ctx } = makeCanvas(256, 256);

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 256);

    // Grain pattern — small irregular ovals
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = shiftColor(baseColor, (rng() - 0.5) * 20);
      ctx.beginPath();
      ctx.ellipse(
        rng() * 256, rng() * 256,
        1 + rng() * 2, 0.8 + rng() * 1.5,
        rng() * Math.PI, 0, Math.PI * 2,
      );
      ctx.fill();
    }

    // Crease lines
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = shiftColor(baseColor, -35);
    for (let i = 0; i < 12; i++) {
      ctx.lineWidth = 0.4 + rng() * 0.6;
      ctx.beginPath();
      const x0 = rng() * 256;
      const y0 = rng() * 256;
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(
        x0 + (rng() - 0.5) * 60, y0 + (rng() - 0.5) * 60,
        x0 + (rng() - 0.5) * 80, y0 + (rng() - 0.5) * 80,
        x0 + (rng() - 0.5) * 100, y0 + (rng() - 0.5) * 100,
      );
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    return materialFromCanvas(canvas, { roughness: 0.6, metalness: 0.05 });
  });
}

// ---------------------------------------------------------------------------
// Rust
// ---------------------------------------------------------------------------

export function createRustTexture(
  baseColor: string,
): MeshStandardMaterial {
  const params = { baseColor };
  return cached('rust', params, () => {
    const rng = makePRNG(`rust-${baseColor}`);
    const { canvas, ctx } = makeCanvas(256, 256);

    // Oxidized metal base
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 256);

    // Orange / brown rust splotches
    const rustColors = ['#B7410E', '#8B4513', '#CD853F', '#A0522D'];
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 25; i++) {
      const rc = rustColors[Math.floor(rng() * rustColors.length)];
      ctx.fillStyle = rc;
      ctx.beginPath();
      ctx.arc(rng() * 256, rng() * 256, 5 + rng() * 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pitting / tiny holes
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = shiftColor(baseColor, -40 - rng() * 30);
      ctx.beginPath();
      ctx.arc(rng() * 256, rng() * 256, 0.5 + rng() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scratches through rust exposing dark metal beneath
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = shiftColor(baseColor, -60);
    for (let i = 0; i < 8; i++) {
      ctx.lineWidth = 0.3 + rng() * 0.7;
      ctx.beginPath();
      const sx = rng() * 256;
      const sy = rng() * 256;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (rng() - 0.5) * 80, sy + (rng() - 0.5) * 20);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    return materialFromCanvas(canvas, { roughness: 0.85, metalness: 0.3 });
  });
}
