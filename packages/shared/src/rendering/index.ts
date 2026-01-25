/**
 * Rendering Abstraction Layer
 *
 * Platform-agnostic rendering abstractions for Iron Frontier.
 * Allows game logic to work with both Babylon.js (web) and Filament/WebGPU (mobile).
 *
 * Architecture:
 * - Types: Core data types (Transform, MeshConfig, etc.)
 * - Interfaces: Contracts for renderers (IScene, ISceneManager)
 * - SceneManagerBase: Abstract base class for implementations
 * - Adapters: Interface stubs for Babylon and Filament
 * - Hooks: React integration hooks
 *
 * Usage:
 *
 * 1. In your app (web or mobile), create the appropriate scene manager:
 *    ```typescript
 *    // Web (apps/web)
 *    import { BabylonSceneManager } from './engine/rendering/BabylonSceneManager';
 *    const manager = new BabylonSceneManager();
 *
 *    // Mobile (apps/mobile)
 *    import { FilamentSceneManager } from './engine/rendering/FilamentSceneManager';
 *    const manager = new FilamentSceneManager();
 *    ```
 *
 * 2. Wrap your app with the context provider:
 *    ```typescript
 *    <SceneManagerProvider manager={manager}>
 *      <Game />
 *    </SceneManagerProvider>
 *    ```
 *
 * 3. Use hooks in your components:
 *    ```typescript
 *    const mesh = useMesh('player', {
 *      modelPath: 'assets/models/player.glb',
 *      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }
 *    });
 *    ```
 */

// ============================================================================
// Types
// ============================================================================

export type {
  Vector3Tuple,
  Vector4Tuple,
  ColorRGB,
  ColorRGBA,
  Transform,
  PartialTransform,
  MaterialConfig,
  AnimationConfig,
  MeshConfig,
  CameraProjection,
  CameraConfig,
  LightType,
  LightConfigBase,
  DirectionalLightConfig,
  PointLightConfig,
  SpotLightConfig,
  AmbientLightConfig,
  HemisphereLightConfig,
  LightConfig,
  EnvironmentConfig,
  SceneConfig,
  QualityPreset,
  RenderQuality,
  PickResult,
  Ray,
  SceneEventType,
  SceneEvent,
  SceneEventHandler,
} from './types';

export {
  IDENTITY_TRANSFORM,
  createTransform,
  DEFAULT_CAMERA_CONFIG,
  QUALITY_PRESETS,
} from './types';

// ============================================================================
// Interfaces
// ============================================================================

export type {
  IMeshHandle,
  ILightHandle,
  ICameraHandle,
  IScene,
  ISceneManager,
  ISceneManagerFactory,
} from './interfaces';

// ============================================================================
// Base Implementation
// ============================================================================

export {
  SceneManagerBase,
  syncEntitiesToScene,
  createTransformGetter,
  type EntityWithTransform,
  type EntityWithRenderable,
} from './SceneManagerBase';

// ============================================================================
// Adapters
// ============================================================================

export {
  // Babylon (web)
  type BabylonAdapterOptions,
  type IBabylonSceneManagerFactory,
  type IBabylonSceneManager,
  DEFAULT_BABYLON_OPTIONS,
  isBabylonAdapterOptions,
  isBabylonAvailable,
  BABYLON_ADAPTER_TOKEN,
  // Filament (mobile)
  type FilamentAdapterOptions,
  type IFilamentSceneManagerFactory,
  type IFilamentSceneManager,
  DEFAULT_FILAMENT_OPTIONS,
  isFilamentAdapterOptions,
  isFilamentAvailable,
  isWebGPUAvailable,
  FILAMENT_ADAPTER_TOKEN,
} from './adapters';

// ============================================================================
// React Hooks
// ============================================================================

export {
  // Context
  SceneManagerContext,
  type SceneManagerContextValue,
  // Core hooks
  useSceneManager,
  useSceneManagerSafe,
  useScene,
  useSceneSafe,
  useSceneManagerReady,
  useSceneManagerError,
  // Mesh hooks
  useMesh,
  useMeshTransformSync,
  useEntityMeshMapping,
  // Utility hooks
  usePreloadModels,
  useEntitySync,
  useRenderLoop,
  useScenePicking,
} from './hooks';
