// AtmosphericEffects — Visual atmosphere configuration for the day/night cycle.
//
// Provides per-phase config for fog, heat shimmer, dust particles, fireflies,
// and the player lantern. Used by DayNightCycle.tsx to drive atmospheric rendering.

import type { DayNightPhase } from "./DayNightManager.ts";

// ============================================================================
// FOG CONFIG
// ============================================================================

export interface FogConfig {
  /** Fog color as hex */
  color: number;
  /** Exponential fog density */
  density: number;
  /** Description for debugging */
  description: string;
}

export const FOG_CONFIGS: Record<DayNightPhase, FogConfig> = {
  dawn: { color: 0xffccaa, density: 0.006, description: "Dense morning haze" },
  morning: { color: 0xddeeff, density: 0.002, description: "Light clearing haze" },
  midday: { color: 0xeeeeff, density: 0.0015, description: "Minimal clear-sky haze" },
  afternoon: { color: 0xffeedd, density: 0.002, description: "Warm dust haze" },
  dusk: { color: 0xff8855, density: 0.005, description: "Dense sunset haze" },
  evening: { color: 0x443366, density: 0.003, description: "Twilight purple mist" },
  night: { color: 0x111122, density: 0.002, description: "Thin cool night air" },
};

// ============================================================================
// HEAT SHIMMER CONFIG (midday only)
// ============================================================================

export interface HeatShimmerConfig {
  /** Whether shimmer is active */
  enabled: boolean;
  /** Displacement amplitude in world units (subtle) */
  amplitude: number;
  /** Oscillation frequency in Hz */
  frequency: number;
  /** Vertical range above ground where shimmer is visible */
  heightRange: number;
  /** Time of day range where shimmer is active [start, end] */
  activeRange: [number, number];
}

export const HEAT_SHIMMER: HeatShimmerConfig = {
  enabled: true,
  amplitude: 0.003,
  frequency: 2.5,
  heightRange: 1.5,
  activeRange: [10, 14], // midday only
};

/** Returns true if heat shimmer should be active at the given time. */
export function isHeatShimmerActive(timeOfDay: number): boolean {
  if (!HEAT_SHIMMER.enabled) return false;
  const [start, end] = HEAT_SHIMMER.activeRange;
  return timeOfDay >= start && timeOfDay <= end;
}

// ============================================================================
// DUST PARTICLES — floating motes visible in sunlight shafts
// ============================================================================

export interface DustConfig {
  /** Number of dust motes */
  count: number;
  /** Spawn radius around player */
  radius: number;
  /** Particle size */
  size: number;
  /** Base opacity (modulated by sunlight factor) */
  baseOpacity: number;
  /** Particle color as hex */
  color: number;
  /** Vertical drift speed (units/sec) */
  driftSpeed: number;
  /** Time range when visible [start, end] — daytime only */
  activeRange: [number, number];
}

export const DUST_PARTICLES: DustConfig = {
  count: 40,
  radius: 12,
  size: 0.04,
  baseOpacity: 0.3,
  color: 0xffeecc,
  driftSpeed: 0.15,
  activeRange: [6, 18],
};

/** Returns dust visibility factor (0-1) based on time of day. */
export function getDustFactor(timeOfDay: number): number {
  const [start, end] = DUST_PARTICLES.activeRange;
  if (timeOfDay < start || timeOfDay > end) return 0;
  // Fade in during first hour, fade out during last hour
  if (timeOfDay < start + 1) return timeOfDay - start;
  if (timeOfDay > end - 1) return end - timeOfDay;
  return 1;
}

// ============================================================================
// FIREFLY CONFIG — night-time particle effect near vegetation
// ============================================================================

export interface FireflyConfig {
  /** Total number of firefly instances */
  count: number;
  /** Spawn radius around player */
  radius: number;
  /** Sphere radius per firefly */
  size: number;
  /** Emissive color as hex (yellow-green bioluminescence) */
  color: number;
  /** Emissive intensity */
  emissiveIntensity: number;
  /** Height range [min, max] above ground */
  heightRange: [number, number];
  /** Random drift speed (units/sec) */
  driftSpeed: number;
  /** Sine-wave float amplitude */
  floatAmplitude: number;
  /** Sine-wave float frequency (Hz) */
  floatFrequency: number;
  /** Opacity pulse frequency per firefly (Hz) */
  pulseFrequency: number;
}

export const FIREFLY_CONFIG: FireflyConfig = {
  count: 30,
  radius: 20,
  size: 0.02,
  color: 0xccff44,
  emissiveIntensity: 2.0,
  heightRange: [0.3, 2.5],
  driftSpeed: 0.3,
  floatAmplitude: 0.15,
  floatFrequency: 0.8,
  pulseFrequency: 1.2,
};

// ============================================================================
// PLAYER LANTERN — point light attached to camera during night
// ============================================================================

export interface LanternConfig {
  /** Light color as hex (warm orange) */
  color: number;
  /** Light intensity at full night */
  intensity: number;
  /** Light range in world units */
  range: number;
  /** Light decay (physically correct = 2) */
  decay: number;
  /** Offset from camera position [x, y, z] */
  offset: [number, number, number];
  /** Flicker amplitude (random intensity variation) */
  flickerAmplitude: number;
  /** Flicker speed (Hz) */
  flickerSpeed: number;
}

export const LANTERN_CONFIG: LanternConfig = {
  color: 0xff9944,
  intensity: 1.2,
  range: 15,
  decay: 2,
  offset: [0.3, -0.1, -0.5], // Slightly right and forward of camera
  flickerAmplitude: 0.15,
  flickerSpeed: 8,
};

/** Returns lantern intensity factor (0-1) based on night factor. */
export function getLanternFactor(nightFactor: number): number {
  // Lantern activates when nightFactor > 0.5, fully on at 1.0
  if (nightFactor <= 0.5) return 0;
  return (nightFactor - 0.5) * 2;
}
