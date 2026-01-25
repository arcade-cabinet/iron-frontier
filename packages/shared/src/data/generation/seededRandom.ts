/**
 * Seeded Random Number Generator
 *
 * Mulberry32 PRNG - fast, deterministic, good distribution.
 * Critical for procedural generation: same seed = same results.
 */

/**
 * Create a seeded random number generator
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0; // Ensure unsigned 32-bit

  return function mulberry32(): number {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Seeded random utilities
 */
export class SeededRandom {
  private rng: () => number;
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
    this.rng = createSeededRandom(seed);
  }

  /** Get the seed */
  getSeed(): number {
    return this.seed;
  }

  /** Random float 0-1 */
  random(): number {
    return this.rng();
  }

  /** Random integer in range [min, max] inclusive */
  int(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min + 1)) + min;
  }

  /** Random float in range [min, max] */
  float(min: number, max: number): number {
    return this.rng() * (max - min) + min;
  }

  /** Random boolean with given probability */
  bool(probability = 0.5): boolean {
    return this.rng() < probability;
  }

  /** Pick random element from array */
  pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return array[Math.floor(this.rng() * array.length)];
  }

  /** Pick N unique random elements from array */
  pickN<T>(array: readonly T[], n: number): T[] {
    if (n > array.length) {
      throw new Error(`Cannot pick ${n} unique elements from array of length ${array.length}`);
    }
    const copy = [...array];
    const result: T[] = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(this.rng() * copy.length);
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  }

  /** Pick random element using weighted probabilities */
  weightedPick<T>(items: readonly T[], weights: readonly number[]): T {
    if (items.length !== weights.length) {
      throw new Error('Items and weights must have same length');
    }
    if (items.length === 0) {
      throw new Error('Cannot pick from empty array');
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = this.rng() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }

  /** Shuffle array in place */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /** Generate a sub-seed for deterministic child generators */
  subSeed(identifier: string): number {
    // Simple hash combine
    let hash = this.seed;
    for (let i = 0; i < identifier.length; i++) {
      hash = ((hash << 5) - hash + identifier.charCodeAt(i)) | 0;
    }
    return hash >>> 0;
  }

  /** Create a child random with deterministic sub-seed */
  child(identifier: string): SeededRandom {
    return new SeededRandom(this.subSeed(identifier));
  }

  /** Roll dice notation (e.g., "2d6+3") */
  roll(notation: string): number {
    const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!match) {
      throw new Error(`Invalid dice notation: ${notation}`);
    }

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;

    let total = modifier;
    for (let i = 0; i < count; i++) {
      total += this.int(1, sides);
    }
    return total;
  }

  /** Generate UUID-like string (deterministic) */
  uuid(): string {
    const hex = () => Math.floor(this.rng() * 16).toString(16);
    return (
      Array(8).fill(0).map(hex).join('') + '-' +
      Array(4).fill(0).map(hex).join('') + '-' +
      '4' + Array(3).fill(0).map(hex).join('') + '-' +
      ['8', '9', 'a', 'b'][this.int(0, 3)] + Array(3).fill(0).map(hex).join('') + '-' +
      Array(12).fill(0).map(hex).join('')
    );
  }
}

/**
 * Hash a string to a number (for converting string IDs to seeds)
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/**
 * Combine multiple seeds into one
 */
export function combineSeeds(...seeds: number[]): number {
  let combined = 0;
  for (const seed of seeds) {
    combined = ((combined << 5) - combined + seed) | 0;
  }
  return combined >>> 0;
}
