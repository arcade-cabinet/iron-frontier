/**
 * useTimeOfDay - Hook for connecting to game time system
 *
 * Provides:
 * - Current time of day (0-24 hours)
 * - Calculated sun position
 * - Time category (dawn, morning, midday, etc.)
 * - Interpolated atmosphere state for smooth transitions
 */

import { useMemo } from 'react';
import { useGameStore, type GameState } from '@/game/store/webGameStore';
import {
  type AtmosphereState,
  DEFAULT_TIME_CONFIG,
  type TimeColors,
  type TimeConfig,
  TIME_COLOR_PRESETS,
  type TimeOfDay,
} from './types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate the time of day category from hour
 */
function getTimeOfDayCategory(hour: number, config: TimeConfig): TimeOfDay {
  const { dawnStart, dayStart, duskStart, nightStart } = config;

  if (hour < dawnStart) return 'night';
  if (hour < dayStart) return 'dawn';
  if (hour < 12) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < duskStart) return 'afternoon';
  if (hour < nightStart) return 'dusk';
  if (hour < 22) return 'evening';
  return 'night';
}

/**
 * Calculate sun position from hour
 * Returns [azimuth, inclination] in radians
 *
 * Sun rises at 6am (east), peaks at noon, sets at 6pm (west)
 * Inclination: 0 = horizon, PI/2 = directly overhead
 */
function calculateSunPosition(hour: number): [number, number] {
  // Normalize hour for sun angle calculation
  // 6am = sunrise (0 deg), 12pm = noon (90 deg/overhead), 6pm = sunset (180 deg)
  const normalizedHour = ((hour - 6 + 24) % 24);

  // Azimuth: east (0) at sunrise, south (PI/2) at noon, west (PI) at sunset
  // Full rotation over 24 hours
  const azimuth = (normalizedHour / 24) * Math.PI * 2;

  // Inclination based on time of day
  // Sine wave that peaks at noon
  // Negative values mean sun is below horizon (night)
  const dayProgress = (hour - 6) / 12; // 0 at 6am, 1 at 6pm
  const inclination = Math.sin(Math.max(0, Math.min(1, dayProgress)) * Math.PI) * (Math.PI / 2.5);

  return [azimuth, Math.max(-0.3, inclination)];
}

/**
 * Get transition progress between time periods for smooth interpolation
 */
function getTransitionProgress(
  hour: number,
  config: TimeConfig
): { current: TimeOfDay; next: TimeOfDay; t: number } {
  const { dawnStart, dayStart, duskStart, nightStart } = config;

  if (hour < dawnStart) {
    return { current: 'night', next: 'night', t: 0 };
  } else if (hour < dayStart) {
    const t = (hour - dawnStart) / (dayStart - dawnStart);
    return { current: 'dawn', next: 'morning', t };
  } else if (hour < 12) {
    const t = (hour - dayStart) / (12 - dayStart);
    return { current: 'morning', next: 'midday', t };
  } else if (hour < 14) {
    const t = (hour - 12) / 2;
    return { current: 'midday', next: 'afternoon', t };
  } else if (hour < duskStart) {
    const t = (hour - 14) / (duskStart - 14);
    return { current: 'afternoon', next: 'dusk', t };
  } else if (hour < nightStart) {
    const t = (hour - duskStart) / (nightStart - duskStart);
    return { current: 'dusk', next: 'evening', t };
  } else if (hour < 22) {
    const t = (hour - nightStart) / (22 - nightStart);
    return { current: 'evening', next: 'night', t };
  } else {
    return { current: 'night', next: 'night', t: 0 };
  }
}

/**
 * Linear interpolation for numbers
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Linear interpolation for color tuples
 */
function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/**
 * Interpolate between two time color presets
 */
function interpolateColors(from: TimeColors, to: TimeColors, t: number): TimeColors {
  return {
    sky: lerpColor(from.sky, to.sky, t),
    horizon: lerpColor(from.horizon, to.horizon, t),
    ambient: lerpColor(from.ambient, to.ambient, t),
    sun: lerpColor(from.sun, to.sun, t),
    fog: lerpColor(from.fog, to.fog, t),
    intensity: lerp(from.intensity, to.intensity, t),
    fogDensity: lerp(from.fogDensity, to.fogDensity, t),
    starVisibility: lerp(from.starVisibility, to.starVisibility, t),
  };
}

// ============================================================================
// HOOK INTERFACE
// ============================================================================

export interface UseTimeOfDayOptions {
  /** Override game time with manual hour (0-24) */
  manualHour?: number;
  /** Time configuration */
  config?: Partial<TimeConfig>;
}

export interface UseTimeOfDayResult {
  /** Current hour (0-24) */
  hour: number;
  /** Time of day category */
  timeOfDay: TimeOfDay;
  /** Full atmosphere state */
  state: AtmosphereState;
  /** Interpolated colors for current time */
  colors: TimeColors;
  /** Is it currently daytime (sun above horizon)? */
  isDay: boolean;
  /** Day progress (0 at dawn, 1 at dusk) */
  dayProgress: number;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook to get current time of day from game store
 *
 * @example
 * ```tsx
 * function SkyComponent() {
 *   const { hour, timeOfDay, colors, state } = useTimeOfDay();
 *
 *   return (
 *     <Sky
 *       sunPosition={[
 *         Math.cos(state.sunAzimuth) * 100,
 *         Math.sin(state.sunInclination) * 100,
 *         Math.sin(state.sunAzimuth) * 100
 *       ]}
 *     />
 *   );
 * }
 * ```
 */
export function useTimeOfDay(options: UseTimeOfDayOptions = {}): UseTimeOfDayResult {
  const { manualHour, config: configOverrides } = options;

  // Get time from game store
  const gameTime = useGameStore((state: GameState) => state.time);

  // Merge config
  const config: TimeConfig = {
    ...DEFAULT_TIME_CONFIG,
    ...configOverrides,
  };

  // Use manual hour if provided, otherwise use game time
  const hour = manualHour ?? gameTime.hour;

  // Calculate all derived values
  const result = useMemo(() => {
    const normalizedHour = ((hour % 24) + 24) % 24;
    const timeOfDay = getTimeOfDayCategory(normalizedHour, config);
    const [sunAzimuth, sunInclination] = calculateSunPosition(normalizedHour);
    const { current, next, t } = getTransitionProgress(normalizedHour, config);

    // Interpolate colors for smooth transitions
    const colors = interpolateColors(
      TIME_COLOR_PRESETS[current],
      TIME_COLOR_PRESETS[next],
      t
    );

    // Calculate day progress (0 at dawn, 1 at dusk)
    let dayProgress = 0;
    const { dawnStart, dayStart, duskStart } = config;

    if (normalizedHour >= dayStart && normalizedHour < duskStart) {
      dayProgress = (normalizedHour - dayStart) / (duskStart - dayStart);
    } else if (normalizedHour >= dawnStart && normalizedHour < dayStart) {
      dayProgress = 0;
    } else if (normalizedHour >= duskStart) {
      dayProgress = 1;
    }

    const isDay = sunInclination > 0;

    const state: AtmosphereState = {
      hour: normalizedHour,
      timeOfDay,
      sunIntensity: colors.intensity,
      isDay,
      dayProgress,
      sunAzimuth,
      sunInclination,
    };

    return {
      hour: normalizedHour,
      timeOfDay,
      state,
      colors,
      isDay,
      dayProgress,
    };
  }, [hour, config]);

  return result;
}

/**
 * Calculate sun position as a Vector3-compatible array
 * Useful for drei's Sky component
 */
export function useSunPosition(distance: number = 100): [number, number, number] {
  const { state } = useTimeOfDay();

  return useMemo(() => {
    const { sunAzimuth, sunInclination } = state;

    // Convert spherical to cartesian coordinates
    // Y is up in Three.js
    const x = Math.cos(sunAzimuth) * Math.cos(sunInclination) * distance;
    const y = Math.sin(sunInclination) * distance;
    const z = Math.sin(sunAzimuth) * Math.cos(sunInclination) * distance;

    return [x, y, z];
  }, [state.sunAzimuth, state.sunInclination, distance]);
}

export default useTimeOfDay;
