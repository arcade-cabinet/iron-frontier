/**
 * Rendering Abstraction Layer
 *
 * Platform-agnostic rendering types and abstractions for Iron Frontier.
 * The web uses React Three Fiber (Three.js), mobile uses Three.js via expo-gl.
 *
 * Architecture:
 * - Types: Core data types (Transform, MeshConfig, etc.)
 * - Interfaces: Contracts for renderers (IScene, ISceneManager)
 * - SceneManagerBase: Abstract base class for implementations
 * - Hooks: React integration hooks
 *
 * Usage:
 *
 * 1. Web (apps/web): Use React Three Fiber directly
 *    ```tsx
 *    import { Canvas } from '@react-three/fiber';
 *    import { OrbitControls } from '@react-three/drei';
 *
 *    function Game() {
 *      return (
 *        <Canvas>
 *          <OrbitControls />
 *          <mesh>
 *            <boxGeometry />
 *            <meshStandardMaterial color="orange" />
 *          </mesh>
 *        </Canvas>
 *      );
 *    }
 *    ```
 *
 * 2. Mobile (apps/mobile): Use Three.js via expo-gl
 *    ```tsx
 *    import { ThreeCanvas } from './engine/ThreeCanvas';
 *
 *    function Game() {
 *      return <ThreeCanvas onSetup={setupScene} />;
 *    }
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
  DEFAULT_FILAMENT_OPTIONS,
  FILAMENT_ADAPTER_TOKEN,
  // Filament (mobile)
  type FilamentAdapterOptions,
  type IFilamentSceneManager,
  type IFilamentSceneManagerFactory,
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
