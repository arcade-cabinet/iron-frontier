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
  AmbientLightConfig,
  AnimationConfig,
  CameraConfig,
  CameraProjection,
  ColorRGB,
  ColorRGBA,
  DirectionalLightConfig,
  EnvironmentConfig,
  HemisphereLightConfig,
  LightConfig,
  LightConfigBase,
  LightType,
  MaterialConfig,
  MeshConfig,
  PartialTransform,
  PickResult,
  PointLightConfig,
  QualityPreset,
  Ray,
  RenderQuality,
  SceneConfig,
  SceneEvent,
  SceneEventHandler,
  SceneEventType,
  SpotLightConfig,
  Transform,
  Vector3Tuple,
  Vector4Tuple,
} from './types';

export {
  createTransform,
  DEFAULT_CAMERA_CONFIG,
  IDENTITY_TRANSFORM,
  QUALITY_PRESETS,
} from './types';

// ============================================================================
// Interfaces
// ============================================================================

export type {
  ICameraHandle,
  ILightHandle,
  IMeshHandle,
  IScene,
  ISceneManager,
  ISceneManagerFactory,
} from './interfaces';

// ============================================================================
// Base Implementation
// ============================================================================

export {
  createTransformGetter,
  type EntityWithRenderable,
  type EntityWithTransform,
  SceneManagerBase,
  syncEntitiesToScene,
} from './SceneManagerBase';

// ============================================================================
// Adapters
// ============================================================================

export {
  BABYLON_ADAPTER_TOKEN,
  // Babylon (web)
  type BabylonAdapterOptions,
  DEFAULT_BABYLON_OPTIONS,
  DEFAULT_FILAMENT_OPTIONS,
  FILAMENT_ADAPTER_TOKEN,
  // Filament (mobile)
  type FilamentAdapterOptions,
  type IBabylonSceneManager,
  type IBabylonSceneManagerFactory,
  type IFilamentSceneManager,
  type IFilamentSceneManagerFactory,
  isBabylonAdapterOptions,
  isBabylonAvailable,
  isFilamentAdapterOptions,
  isFilamentAvailable,
  isWebGPUAvailable,
} from './adapters';

// ============================================================================
// React Hooks
// ============================================================================

export {
  // Context
  SceneManagerContext,
  type SceneManagerContextValue,
  useEntityMeshMapping,
  useEntitySync,
  // Mesh hooks
  useMesh,
  useMeshTransformSync,
  // Utility hooks
  usePreloadModels,
  useRenderLoop,
  useScene,
  // Core hooks
  useSceneManager,
  useSceneManagerError,
  useSceneManagerReady,
  useSceneManagerSafe,
  useScenePicking,
  useSceneSafe,
} from './hooks';
