/**
 * Types for the R3F Atmosphere System
 *
 * Shared types used across all atmosphere components.
 */

import type { Color } from 'three';

// ============================================================================
// TIME OF DAY TYPES
// ============================================================================

export type TimeOfDay =
  | 'night'
  | 'dawn'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'dusk'
  | 'evening';

export interface TimeConfig {
  /** Hour when dawn begins (default: 5) */
  dawnStart: number;
  /** Hour when day begins (default: 7) */
  dayStart: number;
  /** Hour when dusk begins (default: 18) */
  duskStart: number;
  /** Hour when night begins (default: 20) */
  nightStart: number;
}

export const DEFAULT_TIME_CONFIG: TimeConfig = {
  dawnStart: 5,
  dayStart: 7,
  duskStart: 18,
  nightStart: 20,
};

// ============================================================================
// ATMOSPHERE STATE
// ============================================================================

export interface AtmosphereState {
  /** Current game hour (0-24) */
  hour: number;
  /** Time of day category */
  timeOfDay: TimeOfDay;
  /** Sun intensity (0-1) */
  sunIntensity: number;
  /** Is it currently daytime? */
  isDay: boolean;
  /** Normalized day progress (0 at dawn, 1 at dusk) */
  dayProgress: number;
  /** Sun azimuth angle in radians */
  sunAzimuth: number;
  /** Sun inclination angle in radians (0 = horizon, PI/2 = zenith) */
  sunInclination: number;
}

// ============================================================================
// COLOR PRESETS - Western Desert Aesthetic
// ============================================================================

export interface TimeColors {
  /** Sky color at zenith */
  sky: [number, number, number];
  /** Horizon color */
  horizon: [number, number, number];
  /** Ambient light color */
  ambient: [number, number, number];
  /** Sun/directional light color */
  sun: [number, number, number];
  /** Fog color */
  fog: [number, number, number];
  /** Light intensity (0-1) */
  intensity: number;
  /** Fog density */
  fogDensity: number;
  /** Star visibility (0-1) */
  starVisibility: number;
}

export const TIME_COLOR_PRESETS: Record<TimeOfDay, TimeColors> = {
  night: {
    sky: [0.02, 0.02, 0.08],
    horizon: [0.05, 0.03, 0.1],
    ambient: [0.05, 0.05, 0.15],
    sun: [0.2, 0.2, 0.4],
    fog: [0.02, 0.02, 0.06],
    intensity: 0.05,
    fogDensity: 0.002,
    starVisibility: 1.0,
  },
  dawn: {
    sky: [0.4, 0.5, 0.7],
    horizon: [0.9, 0.5, 0.3],
    ambient: [0.5, 0.3, 0.25],
    sun: [1.0, 0.6, 0.4],
    fog: [0.7, 0.4, 0.3],
    intensity: 0.4,
    fogDensity: 0.004,
    starVisibility: 0.2,
  },
  morning: {
    sky: [0.5, 0.7, 0.95],
    horizon: [0.8, 0.75, 0.65],
    ambient: [0.7, 0.7, 0.65],
    sun: [1.0, 0.95, 0.85],
    fog: [0.6, 0.75, 0.9],
    intensity: 0.8,
    fogDensity: 0.003,
    starVisibility: 0.0,
  },
  midday: {
    sky: [0.4, 0.65, 0.95],
    horizon: [0.7, 0.8, 0.9],
    ambient: [0.8, 0.8, 0.75],
    sun: [1.0, 0.98, 0.9],
    fog: [0.7, 0.8, 0.9],
    intensity: 1.0,
    fogDensity: 0.002,
    starVisibility: 0.0,
  },
  afternoon: {
    sky: [0.45, 0.65, 0.9],
    horizon: [0.85, 0.75, 0.6],
    ambient: [0.75, 0.72, 0.68],
    sun: [1.0, 0.92, 0.8],
    fog: [0.65, 0.75, 0.85],
    intensity: 0.9,
    fogDensity: 0.003,
    starVisibility: 0.0,
  },
  dusk: {
    sky: [0.3, 0.25, 0.5],
    horizon: [0.95, 0.45, 0.25],
    ambient: [0.6, 0.4, 0.35],
    sun: [1.0, 0.5, 0.3],
    fog: [0.8, 0.5, 0.35],
    intensity: 0.5,
    fogDensity: 0.005,
    starVisibility: 0.3,
  },
  evening: {
    sky: [0.1, 0.08, 0.18],
    horizon: [0.2, 0.12, 0.25],
    ambient: [0.2, 0.15, 0.25],
    sun: [0.4, 0.3, 0.5],
    fog: [0.1, 0.08, 0.15],
    intensity: 0.15,
    fogDensity: 0.003,
    starVisibility: 0.7,
  },
};

// ============================================================================
// DUST PARTICLE CONFIG
// ============================================================================

export interface DustConfig {
  /** Number of dust particles */
  count: number;
  /** Particle size range [min, max] */
  sizeRange: [number, number];
  /** Spread radius */
  radius: number;
  /** Vertical spread */
  height: number;
  /** Base opacity */
  opacity: number;
  /** Wind speed multiplier */
  windSpeed: number;
  /** Dust color (warm desert tone) */
  color: [number, number, number];
}

export const DEFAULT_DUST_CONFIG: DustConfig = {
  count: 500,
  sizeRange: [0.02, 0.08],
  radius: 50,
  height: 15,
  opacity: 0.4,
  windSpeed: 0.5,
  color: [0.9, 0.75, 0.55],
};

// ============================================================================
// STAR FIELD CONFIG
// ============================================================================

export interface StarConfig {
  /** Number of stars */
  count: number;
  /** Star size range [min, max] */
  sizeRange: [number, number];
  /** Sky dome radius */
  radius: number;
  /** Twinkle speed */
  twinkleSpeed: number;
}

export const DEFAULT_STAR_CONFIG: StarConfig = {
  count: 1000,
  sizeRange: [0.5, 2.0],
  radius: 500,
  twinkleSpeed: 0.3,
};
