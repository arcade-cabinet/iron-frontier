/**
 * Rendering Primitive Types
 *
 * Core primitive types, transforms, and utility functions
 * for the rendering abstraction layer.
 */

// ============================================================================
// CORE PRIMITIVE TYPES
// ============================================================================

/**
 * 3D vector as a tuple [x, y, z]
 */
export type Vector3Tuple = [x: number, y: number, z: number];

/**
 * 4D vector/quaternion as a tuple [x, y, z, w]
 */
export type Vector4Tuple = [x: number, y: number, z: number, w: number];

/**
 * RGB color as a tuple [r, g, b] with values 0-1
 */
export type ColorRGB = [r: number, g: number, b: number];

/**
 * RGBA color as a tuple [r, g, b, a] with values 0-1
 */
export type ColorRGBA = [r: number, g: number, b: number, a: number];

// ============================================================================
// TRANSFORM TYPES
// ============================================================================

/**
 * Complete 3D transform with position, rotation (Euler angles), and scale.
 * Rotation is in radians.
 */
export interface Transform {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
}

/**
 * Optional partial transform for updates.
 * Only provided fields will be modified.
 */
export interface PartialTransform {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}

/**
 * Default identity transform
 */
export const IDENTITY_TRANSFORM: Readonly<Transform> = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
} as const;

/**
 * Create a transform with defaults for missing values
 */
export function createTransform(partial?: PartialTransform): Transform {
  return {
    position: partial?.position ?? [0, 0, 0],
    rotation: partial?.rotation ?? [0, 0, 0],
    scale: partial?.scale ?? [1, 1, 1],
  };
}
