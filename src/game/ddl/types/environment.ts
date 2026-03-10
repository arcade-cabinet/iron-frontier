/**
 * DDL Environment Types - Lighting, post-processing, weather, audio, terrain
 */

import type { BiomeType, EnvironmentMode, Position3D, TimeOfDay, WeatherType } from './core.ts';

// ============================================================================
// LIGHTING
// ============================================================================

/**
 * Point light configuration.
 */
export interface PointLightDDL {
  name: string;
  position: Position3D;
  color: string;
  intensity: number;
  range: number;
  castsShadows?: boolean;
}

/**
 * Player torch configuration (for caves).
 */
export interface PlayerTorchDDL {
  enabled: boolean;
  color?: string;
  intensity?: number;
  range?: number;
}

/**
 * Lighting configuration for a level.
 */
export interface LightingDDL {
  /** Lighting mode */
  mode: EnvironmentMode;
  /** Time of day preset */
  timeOfDay?: TimeOfDay;
  /** Sun/ambient intensity override (0-1) */
  ambientIntensity?: number;
  /** Sun color override */
  sunColor?: string;
  /** Fog density override */
  fogDensity?: number;
  /** Fog color override */
  fogColor?: string;
  /** Additional overrides */
  overrides?: {
    pointLights?: PointLightDDL[];
    playerTorch?: PlayerTorchDDL;
  };
}

// ============================================================================
// POST-PROCESSING
// ============================================================================

/**
 * Post-processing configuration.
 */
export interface PostProcessingDDL {
  /** Mode determines preset */
  mode: EnvironmentMode;
  /** Bloom intensity */
  bloom?: number;
  /** Vignette intensity */
  vignette?: number;
  /** Color grading LUT */
  colorGradingLUT?: string;
  /** Depth of field settings */
  depthOfField?: {
    focalLength: number;
    aperture: number;
  };
}

// ============================================================================
// WEATHER
// ============================================================================

/**
 * Weather configuration.
 */
export interface WeatherDDL {
  /** Weather type */
  type: WeatherType;
  /** Intensity (0-1) */
  intensity: number;
  /** Wind direction in degrees */
  windDirection?: number;
  /** Wind speed */
  windSpeed?: number;
  /** Particle effects */
  particles?: {
    type: 'dust' | 'rain' | 'snow' | 'leaves';
    density: number;
  };
}

// ============================================================================
// AUDIO
// ============================================================================

/**
 * Audio configuration for a level.
 */
export interface AudioDDL {
  /** Background music track ID */
  musicTrack?: string;
  /** Ambient sound loops */
  ambientSounds?: Array<{
    soundId: string;
    volume: number;
    loop: boolean;
  }>;
  /** Reverb preset */
  reverbPreset?: 'outdoor' | 'indoor' | 'cave' | 'large_hall';
}

// ============================================================================
// TERRAIN
// ============================================================================

/**
 * Terrain generation configuration.
 */
export interface TerrainDDL {
  /** Primary biome */
  biome: BiomeType;
  /** Map dimensions in hex tiles */
  dimensions: {
    width: number;
    height: number;
  };
  /** Elevation range */
  elevation?: {
    min: number;
    max: number;
  };
  /** Feature density modifiers */
  features?: {
    trees?: number;
    rocks?: number;
    water?: number;
    structures?: number;
  };
  /** Seed offset for procedural generation */
  seedOffset?: number;
}

// ============================================================================
// STRUCTURES
// ============================================================================

/**
 * Structure placement.
 */
export interface StructureDDL {
  /** Structure type ID */
  type: string;
  /** Position */
  position: Position3D;
  /** Rotation in degrees */
  rotation?: number;
  /** Scale */
  scale?: number;
  /** Owner NPC ID */
  ownerId?: string;
  /** Interior location ID (if enterable) */
  interiorId?: string;
}
