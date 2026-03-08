// HitEffects — Visual feedback data for combat events.
//
// Pure data generators: no rendering, no side effects. Each function returns
// a descriptor object that React components consume to render sprites,
// particles, or overlay flashes.

// ---------------------------------------------------------------------------
// Damage number
// ---------------------------------------------------------------------------

export interface DamageNumberData {
  /** Unique id for React key. */
  id: string;
  /** World-space position where the number should appear. */
  position: { x: number; y: number; z: number };
  /** Damage value to display. */
  value: number;
  /** Optional text label to display instead of damage value (e.g. "KILL"). */
  label?: string;
  /** Whether this was a headshot/critical hit. */
  isCritical: boolean;
  /** Timestamp when created (performance.now). */
  createdAt: number;
  /** How long to display in seconds. */
  duration: number;
}

let damageNumberCounter = 0;

/**
 * Create a damage number descriptor.
 */
export function createDamageNumber(
  position: { x: number; y: number; z: number },
  value: number,
  isCritical: boolean,
  label?: string,
): DamageNumberData {
  return {
    id: `dmg-${++damageNumberCounter}`,
    position: {
      x: position.x + (Math.random() - 0.5) * 0.3,
      y: position.y + 0.5,
      z: position.z + (Math.random() - 0.5) * 0.3,
    },
    value,
    label,
    isCritical,
    createdAt: performance.now(),
    duration: label ? 2.0 : isCritical ? 1.5 : 1.0,
  };
}

// ---------------------------------------------------------------------------
// Hit marker
// ---------------------------------------------------------------------------

export interface HitMarkerData {
  /** Whether a hit landed. */
  hit: boolean;
  /** Whether it was a headshot. */
  isHeadshot: boolean;
  /** Whether the target was killed by this hit. */
  isKill: boolean;
  /** Timestamp when created. */
  createdAt: number;
  /** Duration of the hit marker flash in seconds. */
  duration: number;
}

/**
 * Create a hit marker flash descriptor.
 */
export function createHitMarker(
  hit: boolean,
  isHeadshot: boolean,
  isKill: boolean,
): HitMarkerData {
  return {
    hit,
    isHeadshot,
    isKill,
    createdAt: performance.now(),
    duration: isKill ? 0.4 : 0.15,
  };
}

// ---------------------------------------------------------------------------
// Muzzle flash
// ---------------------------------------------------------------------------

export interface MuzzleFlashData {
  /** World-space position of the flash (tip of weapon barrel). */
  position: { x: number; y: number; z: number };
  /** Flash intensity (0-1). */
  intensity: number;
  /** Duration in seconds. */
  duration: number;
  /** Timestamp when created. */
  createdAt: number;
}

/**
 * Create a muzzle flash descriptor.
 */
export function createMuzzleFlash(
  position: { x: number; y: number; z: number },
  intensity: number = 1.0,
): MuzzleFlashData {
  return {
    position: { ...position },
    intensity,
    duration: 0.05,
    createdAt: performance.now(),
  };
}

// ---------------------------------------------------------------------------
// Enemy death effect
// ---------------------------------------------------------------------------

export type DeathEffectType = 'dissolve' | 'ragdoll' | 'explode';

export interface DeathEffectData {
  /** World-space position of the dying enemy. */
  position: { x: number; y: number; z: number };
  /** Type of death effect to play. */
  effectType: DeathEffectType;
  /** Particle color (hex). */
  particleColor: string;
  /** Number of particles to spawn. */
  particleCount: number;
  /** Duration of the effect in seconds. */
  duration: number;
  /** Timestamp when created. */
  createdAt: number;
}

/**
 * Create a death effect descriptor based on enemy type.
 */
export function createDeathEffect(
  position: { x: number; y: number; z: number },
  enemyType: string,
): DeathEffectData {
  // Choose effect type and visuals based on enemy type
  let effectType: DeathEffectType = 'dissolve';
  let particleColor = '#8B4513'; // Saddle brown default
  let particleCount = 12;

  if (enemyType === 'automaton') {
    effectType = 'explode';
    particleColor = '#FFD700';
    particleCount = 24;
  } else if (enemyType === 'animal') {
    effectType = 'ragdoll';
    particleColor = '#A0522D';
    particleCount = 8;
  } else if (enemyType === 'dynamiter') {
    effectType = 'explode';
    particleColor = '#FF4500';
    particleCount = 32;
  }

  return {
    position: { ...position },
    effectType,
    particleColor,
    particleCount,
    duration: effectType === 'explode' ? 1.0 : 1.5,
    createdAt: performance.now(),
  };
}

// ---------------------------------------------------------------------------
// Impact spark (bullet hitting surface)
// ---------------------------------------------------------------------------

export interface ImpactSparkData {
  /** World-space position of impact. */
  position: { x: number; y: number; z: number };
  /** Surface normal at impact for directional sparks. */
  normal: { x: number; y: number; z: number };
  /** Spark count. */
  count: number;
  /** Timestamp when created. */
  createdAt: number;
  /** Duration in seconds. */
  duration: number;
}

/**
 * Create an impact spark descriptor for missed shots hitting geometry.
 */
export function createImpactSpark(
  position: { x: number; y: number; z: number },
  normal: { x: number; y: number; z: number },
): ImpactSparkData {
  return {
    position: { ...position },
    normal: { ...normal },
    count: 4 + Math.floor(Math.random() * 4),
    createdAt: performance.now(),
    duration: 0.3,
  };
}
