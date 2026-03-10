/**
 * Rendering Scene Types
 *
 * Scene configuration, environment, quality, picking, and events.
 */

import type { ColorRGB, ColorRGBA, Vector3Tuple } from './primitives.ts';
import type { CameraConfig } from './camera.ts';
import type { LightConfig } from './light.ts';

// ============================================================================
// SCENE CONFIGURATION
// ============================================================================

/**
 * Environment/skybox configuration
 */
export interface EnvironmentConfig {
  /** Path to skybox texture or HDR environment map */
  skyboxPath?: string;
  /** Solid background color (if no skybox) */
  backgroundColor?: ColorRGBA;
  /** Ambient intensity */
  ambientIntensity?: number;
  /** Fog configuration */
  fog?: {
    enabled: boolean;
    color: ColorRGB;
    density?: number;
    near?: number;
    far?: number;
  };
}

/**
 * Initial scene configuration
 */
export interface SceneConfig {
  /** Scene identifier */
  id?: string;
  /** Initial camera configuration */
  camera?: CameraConfig;
  /** Environment settings */
  environment?: EnvironmentConfig;
  /** Initial lights */
  lights?: Array<{ id: string; config: LightConfig }>;
}

// ============================================================================
// RENDER QUALITY SETTINGS
// ============================================================================

/**
 * Render quality preset
 */
export type QualityPreset = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Detailed render quality configuration
 */
export interface RenderQuality {
  /** Shadow map resolution */
  shadowMapSize?: number;
  /** Enable anti-aliasing */
  antialiasing?: boolean;
  /** Texture anisotropic filtering level */
  anisotropy?: number;
  /** Enable bloom post-process */
  bloom?: boolean;
  /** Enable ambient occlusion */
  ambientOcclusion?: boolean;
  /** Maximum bone count for skinned meshes */
  maxBones?: number;
  /** LOD bias (negative = higher quality) */
  lodBias?: number;
}

/**
 * Quality presets
 */
export const QUALITY_PRESETS: Record<QualityPreset, RenderQuality> = {
  low: {
    shadowMapSize: 512,
    antialiasing: false,
    anisotropy: 1,
    bloom: false,
    ambientOcclusion: false,
    maxBones: 32,
    lodBias: 1,
  },
  medium: {
    shadowMapSize: 1024,
    antialiasing: true,
    anisotropy: 4,
    bloom: false,
    ambientOcclusion: false,
    maxBones: 64,
    lodBias: 0,
  },
  high: {
    shadowMapSize: 2048,
    antialiasing: true,
    anisotropy: 8,
    bloom: true,
    ambientOcclusion: true,
    maxBones: 128,
    lodBias: -0.5,
  },
  ultra: {
    shadowMapSize: 4096,
    antialiasing: true,
    anisotropy: 16,
    bloom: true,
    ambientOcclusion: true,
    maxBones: 256,
    lodBias: -1,
  },
} as const;

// ============================================================================
// PICKING / RAYCASTING
// ============================================================================

/**
 * Result of a raycast/pick operation
 */
export interface PickResult {
  /** Whether something was hit */
  hit: boolean;
  /** ID of the mesh that was hit (if any) */
  meshId?: string;
  /** World position of the hit point */
  position?: Vector3Tuple;
  /** Surface normal at the hit point */
  normal?: Vector3Tuple;
  /** Distance from the ray origin */
  distance?: number;
  /** User data attached to the mesh */
  userData?: Record<string, unknown>;
}

/**
 * Ray definition for raycasting
 */
export interface Ray {
  /** Ray origin */
  origin: Vector3Tuple;
  /** Ray direction (normalized) */
  direction: Vector3Tuple;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Scene event types
 */
export type SceneEventType =
  | 'meshAdded'
  | 'meshRemoved'
  | 'meshUpdated'
  | 'lightAdded'
  | 'lightRemoved'
  | 'cameraUpdated'
  | 'pointerDown'
  | 'pointerUp'
  | 'pointerMove';

/**
 * Scene event data
 */
export interface SceneEvent {
  type: SceneEventType;
  meshId?: string;
  lightId?: string;
  position?: Vector3Tuple;
  pickResult?: PickResult;
}

/**
 * Scene event handler
 */
export type SceneEventHandler = (event: SceneEvent) => void;
