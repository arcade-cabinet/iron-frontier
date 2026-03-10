/**
 * Rendering Types - Barrel export
 *
 * Re-exports all rendering types from domain-specific files.
 */

// Primitives & transforms
export type { ColorRGB, ColorRGBA, Vector3Tuple, Vector4Tuple } from './primitives.ts';
export type { PartialTransform, Transform } from './primitives.ts';
export { createTransform, IDENTITY_TRANSFORM } from './primitives.ts';

// Mesh types
export type { AnimationConfig, MaterialConfig, MeshConfig } from './mesh.ts';

// Camera types
export type { CameraConfig, CameraProjection } from './camera.ts';
export { DEFAULT_CAMERA_CONFIG } from './camera.ts';

// Light types
export type {
  AmbientLightConfig,
  DirectionalLightConfig,
  HemisphereLightConfig,
  LightConfig,
  LightConfigBase,
  LightType,
  PointLightConfig,
  SpotLightConfig,
} from './light.ts';

// Scene types
export type {
  EnvironmentConfig,
  PickResult,
  QualityPreset,
  Ray,
  RenderQuality,
  SceneConfig,
  SceneEvent,
  SceneEventHandler,
  SceneEventType,
} from './scene.ts';
export { QUALITY_PRESETS } from './scene.ts';
