/**
 * Deterministic PRNG using Mulberry32.
 *
 * Returns a float in [0, 1) for the given scope string and optional
 * extra discriminators. Same inputs always produce the same output.
 *
 * Use instead of Math.random() everywhere in game code.
 *
 * @param scope - Dot-separated scope string (e.g., 'combat.damage', 'npc.movement')
 * @param seed - World seed or base seed (default 42)
 * @param extra - Additional discriminators (counter, position, ID) for per-call variation
 */
export function scopedRNG(
  scope: string,
  seed: number = 42,
  ...extra: (string | number)[]
): number {
  let h = seed ^ 0x5bd1e995;

  // Hash scope string
  for (let i = 0; i < scope.length; i++) {
    h = Math.imul(h ^ scope.charCodeAt(i), 0x5bd1e995);
  }

  // Hash extra discriminators
  for (const e of extra) {
    const s = String(e);
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 0x5bd1e995);
    }
  }

  // Mulberry32 one-shot
  let t = (h += 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Counter for generating unique-per-session discriminators */
let _rngCounter = 0;

/** Returns a monotonically incrementing counter for use as a scopedRNG discriminator */
export function rngTick(): number {
  return _rngCounter++;
}
