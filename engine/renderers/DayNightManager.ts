// DayNightManager — Central time-of-day manager for the day/night cycle.
//
// Tracks a 0-24 float clock, advances via real elapsed time * multiplier,
// computes time phase, sun/moon angles, lighting, fog, and shadow values.
// Fires onPhaseChange for game systems (NPC schedules, enemy spawning).

import timeConfig from '@/config/game/time.json';

// ============================================================================
// TYPES
// ============================================================================

export type DayNightPhase =
  | 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'evening' | 'night';

export interface LightingValues {
  ambientIntensity: number;
  ambientColor: number;
  directionalIntensity: number;
  shadowIntensity: number;
}

export interface FogValues {
  color: number;
  density: number;
  near: number;
  far: number;
}

export type PhaseChangeCallback = (newPhase: DayNightPhase, oldPhase: DayNightPhase) => void;

// ============================================================================
// PHASE RANGES — wired to config/game/time.json boundaries
// ============================================================================

const PHASE_RANGES: Record<DayNightPhase, [number, number]> = {
  dawn: [5, 7], morning: [7, 10], midday: [10, 14], afternoon: [14, 17],
  dusk: [17, 19], evening: [19, 22], night: [22, 5],
};

const ORDERED_PHASES: DayNightPhase[] = [
  'night', 'dawn', 'morning', 'midday', 'afternoon', 'dusk', 'evening',
];

// ============================================================================
// LOOKUP TABLES
// ============================================================================

const AMBIENT: Record<DayNightPhase, { i: number; c: number }> = {
  dawn:      { i: 0.35, c: 0xffaa66 }, morning: { i: 0.55, c: 0xffeedd },
  midday:    { i: 0.70, c: 0xfff5e6 }, afternoon: { i: 0.55, c: 0xffe8cc },
  dusk:      { i: 0.35, c: 0xff8844 }, evening:   { i: 0.20, c: 0x6655aa },
  night:     { i: 0.12, c: 0x222244 },
};

const DIR: Record<DayNightPhase, number> = {
  dawn: 0.6, morning: 1.1, midday: 1.5, afternoon: 1.1,
  dusk: 0.5, evening: 0.15, night: 0.08,
};

const SHADOW: Record<DayNightPhase, number> = {
  dawn: 0.4, morning: 0.7, midday: 1.0, afternoon: 0.7,
  dusk: 0.3, evening: 0.1, night: 0.05,
};

const FOG: Record<DayNightPhase, FogValues> = {
  dawn:      { color: 0xffccaa, density: 0.006,  near: 20,  far: 200 },
  morning:   { color: 0xddeeff, density: 0.002,  near: 60,  far: 400 },
  midday:    { color: 0xeeeeff, density: 0.0015, near: 80,  far: 500 },
  afternoon: { color: 0xffeedd, density: 0.002,  near: 60,  far: 400 },
  dusk:      { color: 0xff8855, density: 0.005,  near: 25,  far: 220 },
  evening:   { color: 0x443366, density: 0.003,  near: 40,  far: 300 },
  night:     { color: 0x111122, density: 0.002,  near: 30,  far: 250 },
};

// ============================================================================
// MANAGER
// ============================================================================

export class DayNightManager {
  private timeOfDay: number;
  private realSecondsPerGameMinute: number;
  private currentPhase: DayNightPhase;
  private callbacks: PhaseChangeCallback[] = [];

  constructor(initialTime?: number, realSecondsPerGameMinute?: number) {
    this.timeOfDay = initialTime ?? timeConfig.startingHour + timeConfig.startingMinute / 60;
    this.realSecondsPerGameMinute = realSecondsPerGameMinute ?? timeConfig.msPerGameMinute / 1000;
    this.currentPhase = DayNightManager.computePhase(this.timeOfDay);
  }

  /** Advance the clock by real elapsed seconds. */
  tick(deltaSeconds: number): void {
    this.timeOfDay = (this.timeOfDay + deltaSeconds / this.realSecondsPerGameMinute / 60) % 24;
    this.checkPhase();
  }

  /** Set time directly (0-24 float). */
  setTime(hours: number): void {
    this.timeOfDay = ((hours % 24) + 24) % 24;
    this.checkPhase();
  }

  setTimeMultiplier(v: number): void { this.realSecondsPerGameMinute = v; }
  getTimeOfDay(): number { return this.timeOfDay; }
  getPhase(): DayNightPhase { return this.currentPhase; }

  /** Sun angle in radians. 0 = horizon at 6 AM, PI/2 = zenith at noon. */
  getSunAngle(): number { return ((this.timeOfDay - 6) / 24) * Math.PI * 2; }
  getMoonAngle(): number { return this.getSunAngle() + Math.PI; }

  /** 0 during day, 1 at full night, smooth transitions. */
  getNightFactor(): number { return computeNightFactor(this.timeOfDay); }

  getLighting(): LightingValues {
    const { current, next, t } = this.interpolate();
    const ca = AMBIENT[current], cb = AMBIENT[next];
    return {
      ambientIntensity: lerp(ca.i, cb.i, t),
      ambientColor: lerpColor(ca.c, cb.c, t),
      directionalIntensity: lerp(DIR[current], DIR[next], t),
      shadowIntensity: lerp(SHADOW[current], SHADOW[next], t),
    };
  }

  getFog(): FogValues {
    const { current, next, t } = this.interpolate();
    const fa = FOG[current], fb = FOG[next];
    return {
      color: lerpColor(fa.color, fb.color, t),
      density: lerp(fa.density, fb.density, t),
      near: lerp(fa.near, fb.near, t),
      far: lerp(fa.far, fb.far, t),
    };
  }

  onPhaseChange(cb: PhaseChangeCallback): () => void {
    this.callbacks.push(cb);
    return () => { const i = this.callbacks.indexOf(cb); if (i >= 0) this.callbacks.splice(i, 1); };
  }

  removeAllCallbacks(): void { this.callbacks.length = 0; }

  static computePhase(hour: number): DayNightPhase {
    const h = ((hour % 24) + 24) % 24;
    for (const phase of ORDERED_PHASES) {
      const [s, e] = PHASE_RANGES[phase];
      if (s < e ? (h >= s && h < e) : (h >= s || h < e)) return phase;
    }
    return 'midday'; // unreachable
  }

  // --- private ---

  private checkPhase(): void {
    const p = DayNightManager.computePhase(this.timeOfDay);
    if (p !== this.currentPhase) {
      const old = this.currentPhase;
      this.currentPhase = p;
      for (const cb of this.callbacks) cb(p, old);
    }
  }

  private interpolate(): { current: DayNightPhase; next: DayNightPhase; t: number } {
    const h = this.timeOfDay;
    const cur = this.currentPhase;
    const [s, e] = PHASE_RANGES[cur];
    let t: number;
    if (s < e) { t = (h - s) / (e - s); }
    else { const span = 24 - s + e; t = (h >= s ? h - s : h + 24 - s) / span; }
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const keys = Object.keys(PHASE_RANGES) as DayNightPhase[];
    const next = keys[(keys.indexOf(cur) + 1) % keys.length];
    return { current: cur, next, t };
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }

function smoothstep(x: number): number {
  const c = x < 0 ? 0 : x > 1 ? 1 : x;
  return c * c * (3 - 2 * c);
}

function computeNightFactor(t: number): number {
  if (t >= 21 || t <= 4) return 1;
  if (t >= 7 && t <= 17) return 0;
  if (t > 4 && t < 7) return 1 - smoothstep((t - 4) / 3);
  return smoothstep((t - 17) / 4);
}

function lerpColor(a: number, b: number, t: number): number {
  const r = Math.round(lerp((a >> 16) & 0xff, (b >> 16) & 0xff, t));
  const g = Math.round(lerp((a >> 8) & 0xff, (b >> 8) & 0xff, t));
  const bv = Math.round(lerp(a & 0xff, b & 0xff, t));
  return (r << 16) | (g << 8) | bv;
}
