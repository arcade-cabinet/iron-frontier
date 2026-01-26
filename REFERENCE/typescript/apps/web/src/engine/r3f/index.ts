/**
 * R3F Engine Module - Iron Frontier
 *
 * React Three Fiber rendering infrastructure.
 * This module provides the core 3D rendering canvas and configuration types.
 *
 * Usage:
 * ```tsx
 * import { R3FCanvas, DEFAULT_SCENE_CONFIG } from '@/engine/r3f';
 *
 * function Game() {
 *   return (
 *     <R3FCanvas
 *       sceneConfig={{ shadows: true }}
 *       onReady={(state) => console.log('R3F ready', state)}
 *     >
 *       <MyScene />
 *     </R3FCanvas>
 *   );
 * }
 * ```
 */

// Main canvas component
export { R3FCanvas, default } from './R3FCanvas';

// Type definitions
export type {
  // Renderer types
  RendererType,
  RendererCapabilities,
  RendererInfo,
  // Scene configuration
  SceneConfig,
  // Camera configuration
  CameraType,
  CameraConfigBase,
  PerspectiveCameraConfig,
  OrthographicCameraConfig,
  CameraConfig,
  // Lighting configuration
  DirectionalLightConfig,
  AmbientLightConfig,
  HemisphereLightConfig,
  PointLightConfig,
  LightConfig,
  // Performance configuration
  PerformanceConfig,
  // Canvas props
  R3FCanvasProps,
  // Frame loop types
  FrameState,
  FrameCallback,
  // Object refs
  Object3DRef,
} from './types';

// Default configurations
export {
  DEFAULT_SCENE_CONFIG,
  DEFAULT_CAMERA_CONFIG,
  DEFAULT_LIGHTING,
  DEFAULT_PERFORMANCE_CONFIG,
  // Helper functions
  vector3ToTuple,
  color3ToHex,
} from './types';

// Camera and player controls
export * from './camera';

// Atmosphere system (sky, lighting, effects)
export * from './atmosphere';
