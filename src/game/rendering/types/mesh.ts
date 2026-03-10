/**
 * Rendering Mesh Types
 *
 * Material, animation, and mesh configuration types.
 */

import type { ColorRGBA, Transform } from './primitives.ts';

// ============================================================================
// MESH CONFIGURATION
// ============================================================================

/**
 * Material configuration for meshes
 */
export interface MaterialConfig {
  /** Base color (if not using texture) */
  baseColor?: ColorRGBA;
  /** Path to diffuse/albedo texture */
  diffuseTexture?: string;
  /** Path to normal map */
  normalTexture?: string;
  /** Metallic value 0-1 */
  metallic?: number;
  /** Roughness value 0-1 */
  roughness?: number;
  /** Whether the mesh receives shadows */
  receiveShadows?: boolean;
  /** Whether the mesh casts shadows */
  castShadows?: boolean;
  /** Opacity 0-1 */
  opacity?: number;
}

/**
 * Animation configuration for meshes
 */
export interface AnimationConfig {
  /** Name of the animation to play */
  name: string;
  /** Whether the animation should loop */
  loop?: boolean;
  /** Playback speed multiplier */
  speed?: number;
  /** Weight for blending (0-1) */
  weight?: number;
}

/**
 * Configuration for loading and placing a mesh in the scene
 */
export interface MeshConfig {
  /** Path to the .glb model file */
  modelPath: string;
  /** Initial transform */
  transform: Transform;
  /** Material overrides (optional) */
  material?: MaterialConfig;
  /** Animations to play on load (optional) */
  animations?: AnimationConfig[];
  /** Whether the mesh is visible */
  visible?: boolean;
  /** Whether the mesh is pickable/interactive */
  pickable?: boolean;
  /** Custom user data attached to the mesh */
  userData?: Record<string, unknown>;
}
