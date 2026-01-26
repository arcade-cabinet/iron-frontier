/**
 * R3F Engine Types - Iron Frontier
 *
 * Common type definitions for React Three Fiber components.
 * These types are designed to be renderer-agnostic where possible,
 * aligning with shared types from @iron-frontier/shared.
 */

import type { ColorRepresentation, Object3D, Vector3 as ThreeVector3 } from 'three';
import type { RootState } from '@react-three/fiber';

// ============================================================================
// RENDERER CAPABILITIES
// ============================================================================

export type RendererType = 'webgl' | 'webgpu';

export interface RendererCapabilities {
  type: RendererType;
  maxTextureSize: number;
  maxAnisotropy: number;
  supportsFloatTextures: boolean;
  supportsCompressedTextures: boolean;
  supportsInstancing: boolean;
  supportsShadowMaps: boolean;
}

export interface RendererInfo {
  renderer: RendererType;
  vendor: string;
  version: string;
  capabilities: RendererCapabilities;
}

// ============================================================================
// SCENE CONFIGURATION
// ============================================================================

export interface SceneConfig {
  /**
   * Enable shadows for the scene
   * @default true
   */
  shadows: boolean;

  /**
   * Shadow map type
   * @default 'soft'
   */
  shadowType: 'basic' | 'soft' | 'vsm';

  /**
   * Shadow map resolution
   * @default 2048
   */
  shadowMapSize: number;

  /**
   * Enable tone mapping
   * @default true
   */
  toneMapping: boolean;

  /**
   * Tone mapping exposure value
   * @default 1.0
   */
  exposure: number;

  /**
   * Background color or null for transparent
   */
  background: ColorRepresentation | null;

  /**
   * Environment map intensity
   * @default 1.0
   */
  environmentIntensity: number;

  /**
   * Enable fog
   * @default false
   */
  fog: boolean;

  /**
   * Fog configuration (if enabled)
   */
  fogConfig?: {
    color: ColorRepresentation;
    near: number;
    far: number;
  };

  /**
   * Enable antialiasing
   * @default true
   */
  antialias: boolean;

  /**
   * Pixel ratio (1.0 = native, higher = supersampling)
   * @default 'auto' uses device pixel ratio clamped to 2
   */
  pixelRatio: number | 'auto';
}

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  shadows: true,
  shadowType: 'soft',
  shadowMapSize: 2048,
  toneMapping: true,
  exposure: 1.0,
  background: '#87CEEB', // Sky blue
  environmentIntensity: 1.0,
  fog: false,
  antialias: true,
  pixelRatio: 'auto',
};

// ============================================================================
// CAMERA CONFIGURATION
// ============================================================================

export type CameraType = 'perspective' | 'orthographic';

export interface CameraConfigBase {
  type: CameraType;
  near: number;
  far: number;
  position: [number, number, number];
  lookAt: [number, number, number];
}

export interface PerspectiveCameraConfig extends CameraConfigBase {
  type: 'perspective';
  fov: number;
}

export interface OrthographicCameraConfig extends CameraConfigBase {
  type: 'orthographic';
  zoom: number;
}

export type CameraConfig = PerspectiveCameraConfig | OrthographicCameraConfig;

export const DEFAULT_CAMERA_CONFIG: PerspectiveCameraConfig = {
  type: 'perspective',
  fov: 50,
  near: 0.1,
  far: 1000,
  position: [0, 50, 100],
  lookAt: [0, 0, 0],
};

// ============================================================================
// LIGHTING CONFIGURATION
// ============================================================================

export interface DirectionalLightConfig {
  type: 'directional';
  color: ColorRepresentation;
  intensity: number;
  position: [number, number, number];
  castShadow: boolean;
  shadowBias?: number;
  shadowNormalBias?: number;
}

export interface AmbientLightConfig {
  type: 'ambient';
  color: ColorRepresentation;
  intensity: number;
}

export interface HemisphereLightConfig {
  type: 'hemisphere';
  skyColor: ColorRepresentation;
  groundColor: ColorRepresentation;
  intensity: number;
}

export interface PointLightConfig {
  type: 'point';
  color: ColorRepresentation;
  intensity: number;
  position: [number, number, number];
  distance: number;
  decay: number;
  castShadow: boolean;
}

export type LightConfig =
  | DirectionalLightConfig
  | AmbientLightConfig
  | HemisphereLightConfig
  | PointLightConfig;

export const DEFAULT_LIGHTING: LightConfig[] = [
  {
    type: 'hemisphere',
    skyColor: '#87CEEB',
    groundColor: '#C4A574',
    intensity: 0.6,
  },
  {
    type: 'directional',
    color: '#FFFACD',
    intensity: 1.2,
    position: [50, 100, 50],
    castShadow: true,
    shadowBias: -0.0001,
    shadowNormalBias: 0.02,
  },
];

// ============================================================================
// PERFORMANCE CONFIGURATION
// ============================================================================

export interface PerformanceConfig {
  /**
   * Target frames per second
   * @default 60
   */
  targetFps: number;

  /**
   * Enable automatic LOD switching
   * @default true
   */
  autoLod: boolean;

  /**
   * Maximum draw calls per frame before LOD reduction
   * @default 1000
   */
  maxDrawCalls: number;

  /**
   * Enable frustum culling
   * @default true
   */
  frustumCulling: boolean;

  /**
   * Enable object pooling
   * @default true
   */
  objectPooling: boolean;

  /**
   * Maximum concurrent texture loads
   * @default 4
   */
  maxConcurrentLoads: number;
}

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  targetFps: 60,
  autoLod: true,
  maxDrawCalls: 1000,
  frustumCulling: true,
  objectPooling: true,
  maxConcurrentLoads: 4,
};

// ============================================================================
// CANVAS PROPS
// ============================================================================

export interface R3FCanvasProps {
  /**
   * Scene configuration options
   */
  sceneConfig?: Partial<SceneConfig>;

  /**
   * Camera configuration
   */
  cameraConfig?: Partial<CameraConfig>;

  /**
   * Performance configuration
   */
  performanceConfig?: Partial<PerformanceConfig>;

  /**
   * Enable development mode with stats and helpers
   * @default false in production
   */
  debug?: boolean;

  /**
   * Force a specific renderer type (for testing)
   */
  forceRenderer?: RendererType;

  /**
   * Callback when canvas is ready
   */
  onReady?: (state: RootState) => void;

  /**
   * Callback when renderer info is available
   */
  onRendererInfo?: (info: RendererInfo) => void;

  /**
   * Callback on performance issues
   */
  onPerformanceWarning?: (fps: number, drawCalls: number) => void;

  /**
   * React children to render in the scene
   */
  children?: React.ReactNode;

  /**
   * CSS class for the canvas container
   */
  className?: string;

  /**
   * Style for the canvas container
   */
  style?: React.CSSProperties;
}

// ============================================================================
// FRAME LOOP TYPES
// ============================================================================

export interface FrameState {
  clock: {
    elapsedTime: number;
    delta: number;
  };
  camera: {
    position: ThreeVector3;
    quaternion: { x: number; y: number; z: number; w: number };
  };
  pointer: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export type FrameCallback = (state: FrameState, delta: number) => void;

// ============================================================================
// OBJECT REFS
// ============================================================================

export type Object3DRef = React.MutableRefObject<Object3D | null>;

// ============================================================================
// HELPER TYPES FOR SHARED/R3F INTEROP
// ============================================================================

/**
 * Convert shared Vector3Simple to Three.js tuple format
 */
export function vector3ToTuple(
  v: { x: number; y: number; z: number }
): [number, number, number] {
  return [v.x, v.y, v.z];
}

/**
 * Convert shared Color3Simple to Three.js hex color
 */
export function color3ToHex(c: { r: number; g: number; b: number }): number {
  return (
    (Math.floor(c.r * 255) << 16) |
    (Math.floor(c.g * 255) << 8) |
    Math.floor(c.b * 255)
  );
}
