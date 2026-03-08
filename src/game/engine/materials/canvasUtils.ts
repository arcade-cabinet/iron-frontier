// canvasUtils — Shared helpers for canvas-based texture painting
// Keeps individual texture files slim and consistent.

import Alea from 'alea';

/** Seeded PRNG wrapper — call the returned function for values in [0, 1). */
export type PRNG = () => number;

/** Create a deterministic PRNG from a seed string. */
export function makePRNG(seed: string): PRNG {
  return Alea(seed) as unknown as PRNG;
}

/** Create an off-screen canvas and its rendering context. */
export function makeCanvas(
  width: number,
  height: number,
): { canvas: OffscreenCanvas; ctx: OffscreenCanvasRenderingContext2D } {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

/** Parse a CSS hex color into [r, g, b] 0-255 components. */
export function hexToRGB(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/**
 * Shift a hex color's brightness by `amount` (positive = lighter, negative = darker).
 * Returns a new CSS `rgb(...)` string.
 */
export function shiftColor(hex: string, amount: number): string {
  const [r, g, b] = hexToRGB(hex);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v + amount)));
  return `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`;
}

/** Mix two hex colors with `t` blend factor (0 = color a, 1 = color b). */
export function mixColors(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRGB(a);
  const [br, bg, bb] = hexToRGB(b);
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${lerp(ar, br)},${lerp(ag, bg)},${lerp(ab, bb)})`;
}

/**
 * Build the cache key used by `TextureCache`.
 * Deterministic JSON-stable string for a given set of parameters.
 */
export function cacheKey(kind: string, params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}:${String(params[k])}`)
    .join('|');
  return `${kind}::${sorted}`;
}
