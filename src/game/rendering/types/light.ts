/**
 * Rendering Light Types
 *
 * All light configuration types.
 */

import type { ColorRGB, Vector3Tuple } from './primitives.ts';

// ============================================================================
// LIGHT CONFIGURATION
// ============================================================================

/**
 * Light type
 */
export type LightType = 'directional' | 'point' | 'spot' | 'ambient' | 'hemisphere';

/**
 * Base light configuration
 */
export interface LightConfigBase {
  /** Light type */
  type: LightType;
  /** Light color */
  color: ColorRGB;
  /** Light intensity (0-10+) */
  intensity: number;
  /** Whether this light casts shadows */
  castShadows?: boolean;
}

/**
 * Directional light (sun-like)
 */
export interface DirectionalLightConfig extends LightConfigBase {
  type: 'directional';
  /** Direction the light is pointing */
  direction: Vector3Tuple;
}

/**
 * Point light (omni-directional)
 */
export interface PointLightConfig extends LightConfigBase {
  type: 'point';
  /** Position in world space */
  position: Vector3Tuple;
  /** Light range/radius */
  range?: number;
}

/**
 * Spot light (cone)
 */
export interface SpotLightConfig extends LightConfigBase {
  type: 'spot';
  /** Position in world space */
  position: Vector3Tuple;
  /** Direction the light is pointing */
  direction: Vector3Tuple;
  /** Inner cone angle in degrees */
  innerAngle?: number;
  /** Outer cone angle in degrees */
  outerAngle?: number;
  /** Light range */
  range?: number;
}

/**
 * Ambient light (global fill)
 */
export interface AmbientLightConfig extends LightConfigBase {
  type: 'ambient';
}

/**
 * Hemisphere light (sky/ground gradient)
 */
export interface HemisphereLightConfig extends LightConfigBase {
  type: 'hemisphere';
  /** Ground color */
  groundColor: ColorRGB;
  /** Sky direction */
  direction?: Vector3Tuple;
}

/**
 * Union of all light configurations
 */
export type LightConfig =
  | DirectionalLightConfig
  | PointLightConfig
  | SpotLightConfig
  | AmbientLightConfig
  | HemisphereLightConfig;
