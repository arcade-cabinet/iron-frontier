// Deterministic Pseudo-Random Number Generator - Mulberry32

export class PRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state += 0x6d2b79f5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  chance(prob: number): boolean {
    return this.next() < prob;
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length)];
  }

  shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  fork(): PRNG {
    return new PRNG(this.nextInt(0, 2147483647));
  }
}

export class SimplexNoise {
  private perm: number[];

  constructor(prng: PRNG) {
    const base = Array.from({ length: 256 }, (_, i) => i);
    this.perm = [...prng.shuffle(base), ...prng.shuffle([...base])];
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return (h & 1 ? -u : u) + (h & 2 ? -2 * v : 2 * v);
  }

  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const A = this.perm[X] + Y;
    const B = this.perm[X + 1] + Y;
    return (
      this.lerp(
        this.lerp(this.grad(this.perm[A], x, y), this.grad(this.perm[B], x - 1, y), u),
        this.lerp(
          this.grad(this.perm[A + 1], x, y - 1),
          this.grad(this.perm[B + 1], x - 1, y - 1),
          u
        ),
        v
      ) *
        0.5 +
      0.5
    );
  }

  fbm(x: number, y: number, octaves = 4): number {
    let value = 0,
      amp = 1,
      freq = 1,
      max = 0;
    for (let i = 0; i < octaves; i++) {
      value += amp * this.noise2D(x * freq, y * freq);
      max += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return value / max;
  }
}

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) || 1;
}
