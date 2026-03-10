/**
 * Rendering Camera Types
 *
 * Camera configuration and defaults.
 */

import type { Vector3Tuple } from './primitives.ts';

// ============================================================================
// CAMERA CONFIGURATION
// ============================================================================

/**
 * Camera projection type
 */
export type CameraProjection = 'perspective' | 'orthographic';

/**
 * Camera configuration
 */
export interface CameraConfig {
  /** World position of the camera */
  position: Vector3Tuple;
  /** Point the camera is looking at */
  target: Vector3Tuple;
  /** Up vector (usually [0, 1, 0]) */
  up?: Vector3Tuple;
  /** Field of view in degrees (for perspective cameras) */
  fov?: number;
  /** Orthographic size (for orthographic cameras) */
  orthoSize?: number;
  /** Projection type */
  projection?: CameraProjection;
  /** Near clipping plane */
  near?: number;
  /** Far clipping plane */
  far?: number;
}

/**
 * Default camera configuration
 */
export const DEFAULT_CAMERA_CONFIG: Readonly<CameraConfig> = {
  position: [0, 10, -10],
  target: [0, 0, 0],
  up: [0, 1, 0],
  fov: 60,
  projection: 'perspective',
  near: 0.1,
  far: 1000,
} as const;
