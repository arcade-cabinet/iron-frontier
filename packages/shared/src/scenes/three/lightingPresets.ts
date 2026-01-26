/**
 * Three.js Lighting Presets
 *
 * Western-themed lighting configurations for different times of day
 * and interior/exterior scenes.
 *
 * These are pure data - no Three.js runtime code.
 * Apply these configs to your Three.js lights at runtime.
 *
 * Usage:
 *   import { LIGHTING_PRESETS, getLightingForHour } from '@iron-frontier/shared/scenes/three';
 *
 *   // Static preset
 *   const dayPreset = LIGHTING_PRESETS.westernDay;
 *   <ambientLight color={rgbToHex(dayPreset.ambient.color)} intensity={dayPreset.ambient.intensity} />
 *
 *   // Dynamic time-based
 *   const preset = getLightingForHour(gameHour);
 */

import {
  type LightingPreset,
  type RGBColor,
  type Vec3,
  lerpRGB,
  normalizeVec3,
} from './sceneConfig';

// ============================================================================
// WESTERN COLOR PALETTE
// ============================================================================

const COLORS = {
  // Sun colors
  warmSun: { r: 1.0, g: 0.95, b: 0.85 } as RGBColor,
  hotSun: { r: 1.0, g: 0.9, b: 0.75 } as RGBColor,
  dawnSun: { r: 1.0, g: 0.6, b: 0.4 } as RGBColor,
  duskSun: { r: 1.0, g: 0.5, b: 0.3 } as RGBColor,
  moonlight: { r: 0.6, g: 0.7, b: 0.9 } as RGBColor,

  // Ambient colors
  warmAmbient: { r: 0.5, g: 0.45, b: 0.4 } as RGBColor,
  coolAmbient: { r: 0.3, g: 0.35, b: 0.45 } as RGBColor,
  dawnAmbient: { r: 0.4, g: 0.35, b: 0.35 } as RGBColor,
  duskAmbient: { r: 0.5, g: 0.35, b: 0.3 } as RGBColor,
  nightAmbient: { r: 0.05, g: 0.05, b: 0.12 } as RGBColor,

  // Sky colors
  daySky: { r: 0.4, g: 0.6, b: 0.9 } as RGBColor,
  dawnSky: { r: 0.8, g: 0.5, b: 0.4 } as RGBColor,
  duskSky: { r: 0.9, g: 0.4, b: 0.25 } as RGBColor,
  nightSky: { r: 0.02, g: 0.02, b: 0.06 } as RGBColor,

  // Ground colors for hemisphere
  desertGround: { r: 0.4, g: 0.35, b: 0.25 } as RGBColor,
  grassGround: { r: 0.2, g: 0.3, b: 0.15 } as RGBColor,

  // Interior colors
  lampLight: { r: 1.0, g: 0.85, b: 0.6 } as RGBColor,
  candleLight: { r: 1.0, g: 0.7, b: 0.4 } as RGBColor,
  fireLight: { r: 1.0, g: 0.6, b: 0.3 } as RGBColor,

  // Fog colors
  dustFog: { r: 0.7, g: 0.6, b: 0.5 } as RGBColor,
  nightFog: { r: 0.1, g: 0.1, b: 0.15 } as RGBColor,
};

// ============================================================================
// LIGHTING PRESETS
// ============================================================================

export const LIGHTING_PRESETS: Record<string, LightingPreset> = {
  /**
   * Western Day - Harsh desert sunlight
   * Use for: General overworld gameplay, noon scenes
   */
  westernDay: {
    name: 'Western Day',
    description: 'Harsh desert sunlight with warm amber tones',
    ambient: {
      color: COLORS.warmAmbient,
      intensity: 0.5,
    },
    directional: {
      color: COLORS.warmSun,
      intensity: 1.2,
      direction: normalizeVec3({ x: -0.5, y: -1, z: -0.3 }),
      castShadow: true,
    },
    hemisphere: {
      skyColor: COLORS.daySky,
      groundColor: COLORS.desertGround,
      intensity: 0.4,
    },
    fog: {
      color: COLORS.dustFog,
      near: 50,
      far: 500,
    },
    skyColor: COLORS.daySky,
  },

  /**
   * Dawn - Early morning golden hour
   * Use for: Morning scenes, new day starts
   */
  dawn: {
    name: 'Dawn',
    description: 'Early morning golden light with pink sky',
    ambient: {
      color: COLORS.dawnAmbient,
      intensity: 0.4,
    },
    directional: {
      color: COLORS.dawnSun,
      intensity: 0.7,
      direction: normalizeVec3({ x: 1, y: -0.3, z: -0.5 }),
      castShadow: true,
    },
    hemisphere: {
      skyColor: COLORS.dawnSky,
      groundColor: COLORS.desertGround,
      intensity: 0.35,
    },
    fog: {
      color: { r: 0.6, g: 0.5, b: 0.45 },
      near: 30,
      far: 400,
    },
    skyColor: COLORS.dawnSky,
  },

  /**
   * Dusk - Sunset orange and purple sky
   * Use for: Evening scenes, dramatic moments
   */
  dusk: {
    name: 'Dusk',
    description: 'Sunset with deep orange sun and purple sky',
    ambient: {
      color: COLORS.duskAmbient,
      intensity: 0.45,
    },
    directional: {
      color: COLORS.duskSun,
      intensity: 0.8,
      direction: normalizeVec3({ x: -1, y: -0.2, z: -0.5 }),
      castShadow: true,
    },
    hemisphere: {
      skyColor: COLORS.duskSky,
      groundColor: COLORS.desertGround,
      intensity: 0.3,
    },
    fog: {
      color: { r: 0.5, g: 0.35, b: 0.3 },
      near: 40,
      far: 350,
    },
    skyColor: COLORS.duskSky,
  },

  /**
   * Night - Moonlit desert
   * Use for: Nighttime gameplay, stealth sections
   */
  night: {
    name: 'Night',
    description: 'Cool moonlight with starry sky',
    ambient: {
      color: COLORS.nightAmbient,
      intensity: 0.15,
    },
    directional: {
      color: COLORS.moonlight,
      intensity: 0.25,
      direction: normalizeVec3({ x: 0.3, y: -1, z: 0.2 }),
      castShadow: true,
    },
    hemisphere: {
      skyColor: COLORS.nightSky,
      groundColor: { r: 0.05, g: 0.05, b: 0.08 },
      intensity: 0.1,
    },
    fog: {
      color: COLORS.nightFog,
      near: 20,
      far: 200,
    },
    skyColor: COLORS.nightSky,
  },

  /**
   * Interior Saloon - Warm lamp light
   * Use for: Taverns, shops, indoor scenes
   */
  interiorSaloon: {
    name: 'Interior Saloon',
    description: 'Warm lamp light with dim ambient',
    ambient: {
      color: { r: 0.15, g: 0.12, b: 0.1 },
      intensity: 0.3,
    },
    directional: {
      color: COLORS.lampLight,
      intensity: 0.6,
      direction: normalizeVec3({ x: 0, y: -1, z: 0 }),
      castShadow: true,
    },
    hemisphere: {
      skyColor: { r: 0.2, g: 0.18, b: 0.15 },
      groundColor: { r: 0.1, g: 0.08, b: 0.06 },
      intensity: 0.2,
    },
    skyColor: { r: 0.1, g: 0.08, b: 0.06 },
  },

  /**
   * Interior Mine - Dark with lamp spots
   * Use for: Mines, caves, dungeons
   */
  interiorMine: {
    name: 'Interior Mine',
    description: 'Very dark with occasional lamp light',
    ambient: {
      color: { r: 0.03, g: 0.03, b: 0.05 },
      intensity: 0.2,
    },
    directional: {
      color: COLORS.lampLight,
      intensity: 0.3,
      direction: normalizeVec3({ x: 0, y: -1, z: 0 }),
      castShadow: true,
    },
    hemisphere: {
      skyColor: { r: 0.05, g: 0.05, b: 0.07 },
      groundColor: { r: 0.02, g: 0.02, b: 0.03 },
      intensity: 0.1,
    },
    skyColor: { r: 0.02, g: 0.02, b: 0.03 },
  },

  /**
   * Campfire - Warm firelight at night
   * Use for: Camp scenes, rest areas
   */
  campfire: {
    name: 'Campfire',
    description: 'Warm firelight against dark night',
    ambient: {
      color: COLORS.nightAmbient,
      intensity: 0.1,
    },
    directional: {
      color: COLORS.moonlight,
      intensity: 0.15,
      direction: normalizeVec3({ x: 0.3, y: -1, z: 0.2 }),
      castShadow: true,
    },
    hemisphere: {
      skyColor: COLORS.nightSky,
      groundColor: { r: 0.1, g: 0.06, b: 0.03 },
      intensity: 0.15,
    },
    fog: {
      color: { r: 0.08, g: 0.06, b: 0.05 },
      near: 10,
      far: 100,
    },
    skyColor: COLORS.nightSky,
  },

  /**
   * Dust Storm - Low visibility, orange tint
   * Use for: Weather events, dramatic scenes
   */
  dustStorm: {
    name: 'Dust Storm',
    description: 'Low visibility with orange dust',
    ambient: {
      color: { r: 0.5, g: 0.4, b: 0.3 },
      intensity: 0.7,
    },
    directional: {
      color: { r: 0.8, g: 0.6, b: 0.4 },
      intensity: 0.4,
      direction: normalizeVec3({ x: -0.5, y: -0.5, z: -0.3 }),
      castShadow: false,
    },
    hemisphere: {
      skyColor: { r: 0.6, g: 0.5, b: 0.35 },
      groundColor: COLORS.desertGround,
      intensity: 0.5,
    },
    fog: {
      color: { r: 0.6, g: 0.5, b: 0.35 },
      near: 5,
      far: 80,
    },
    skyColor: { r: 0.6, g: 0.5, b: 0.35 },
  },
};

// ============================================================================
// TIME-BASED LIGHTING
// ============================================================================

interface TimeOfDayConfig {
  hour: number;
  preset: keyof typeof LIGHTING_PRESETS;
}

/**
 * Time thresholds for lighting transitions
 */
const TIME_THRESHOLDS: TimeOfDayConfig[] = [
  { hour: 0, preset: 'night' },
  { hour: 5, preset: 'night' },
  { hour: 6, preset: 'dawn' },
  { hour: 8, preset: 'westernDay' },
  { hour: 17, preset: 'westernDay' },
  { hour: 19, preset: 'dusk' },
  { hour: 21, preset: 'night' },
  { hour: 24, preset: 'night' },
];

/**
 * Get interpolated lighting for a specific hour
 *
 * @param hour - Game hour (0-24)
 * @returns Interpolated lighting preset
 */
export function getLightingForHour(hour: number): LightingPreset {
  // Normalize hour to 0-24 range
  const normalizedHour = ((hour % 24) + 24) % 24;

  // Find current and next threshold
  let currentIdx = 0;
  for (let i = 0; i < TIME_THRESHOLDS.length - 1; i++) {
    if (normalizedHour >= TIME_THRESHOLDS[i].hour && normalizedHour < TIME_THRESHOLDS[i + 1].hour) {
      currentIdx = i;
      break;
    }
  }

  const current = TIME_THRESHOLDS[currentIdx];
  const next = TIME_THRESHOLDS[currentIdx + 1];
  const currentPreset = LIGHTING_PRESETS[current.preset];
  const nextPreset = LIGHTING_PRESETS[next.preset];

  // Calculate interpolation factor
  const duration = next.hour - current.hour;
  const elapsed = normalizedHour - current.hour;
  const t = duration > 0 ? elapsed / duration : 0;

  // Smooth step for more natural transitions
  const smoothT = t * t * (3 - 2 * t);

  return interpolateLightingPresets(currentPreset, nextPreset, smoothT);
}

/**
 * Interpolate between two lighting presets
 */
function interpolateLightingPresets(
  a: LightingPreset,
  b: LightingPreset,
  t: number
): LightingPreset {
  const lerp = (x: number, y: number, t: number) => x + (y - x) * t;

  return {
    name: t < 0.5 ? a.name : b.name,
    description: t < 0.5 ? a.description : b.description,
    ambient: {
      color: lerpRGB(a.ambient.color, b.ambient.color, t),
      intensity: lerp(a.ambient.intensity, b.ambient.intensity, t),
    },
    directional: {
      color: lerpRGB(a.directional.color, b.directional.color, t),
      intensity: lerp(a.directional.intensity, b.directional.intensity, t),
      direction: {
        x: lerp(a.directional.direction.x, b.directional.direction.x, t),
        y: lerp(a.directional.direction.y, b.directional.direction.y, t),
        z: lerp(a.directional.direction.z, b.directional.direction.z, t),
      },
      castShadow: a.directional.castShadow || b.directional.castShadow,
    },
    hemisphere:
      a.hemisphere && b.hemisphere
        ? {
            skyColor: lerpRGB(a.hemisphere.skyColor, b.hemisphere.skyColor, t),
            groundColor: lerpRGB(a.hemisphere.groundColor, b.hemisphere.groundColor, t),
            intensity: lerp(a.hemisphere.intensity, b.hemisphere.intensity, t),
          }
        : a.hemisphere || b.hemisphere,
    fog:
      a.fog && b.fog
        ? {
            color: lerpRGB(a.fog.color, b.fog.color, t),
            near: lerp(a.fog.near, b.fog.near, t),
            far: lerp(a.fog.far, b.fog.far, t),
          }
        : a.fog || b.fog,
    skyColor: lerpRGB(a.skyColor, b.skyColor, t),
  };
}

/**
 * Calculate sun direction based on hour
 * Sun rises in east (+X), sets in west (-X)
 *
 * @param hour - Game hour (0-24)
 * @returns Normalized sun direction vector
 */
export function getSunDirectionForHour(hour: number): Vec3 {
  const normalizedHour = ((hour % 24) + 24) % 24;

  // Sun path: 6am = east horizon, noon = overhead, 6pm = west horizon
  const angle = ((normalizedHour - 6) / 12) * Math.PI;

  const x = Math.cos(angle);
  const y = -Math.abs(Math.sin(angle)) - 0.2; // Always pointing down
  const z = -0.3;

  return normalizeVec3({ x, y, z });
}

// ============================================================================
// POINT LIGHT HELPERS (for interiors)
// ============================================================================

/**
 * Create lamp light configuration
 */
export function createLampLight(position: Vec3, intensity = 1.0) {
  return {
    color: COLORS.lampLight,
    intensity: intensity * 2.0,
    position,
    distance: 15,
    decay: 2,
    castShadow: true,
  };
}

/**
 * Create candle light configuration
 */
export function createCandleLight(position: Vec3, intensity = 1.0) {
  return {
    color: COLORS.candleLight,
    intensity: intensity * 0.8,
    position,
    distance: 8,
    decay: 2,
    castShadow: false,
  };
}

/**
 * Create fire/campfire light configuration
 */
export function createFireLight(position: Vec3, intensity = 1.0) {
  return {
    color: COLORS.fireLight,
    intensity: intensity * 3.0,
    position,
    distance: 20,
    decay: 2,
    castShadow: true,
  };
}
