/**
 * Rendering Abstraction Types
 *
 * Platform-agnostic types for 3D rendering that can be implemented
 * by both Babylon.js (web) and Filament/WebGPU (mobile).
 *
 * Design principles:
 * - All numeric arrays use tuples for type safety
 * - No engine-specific types leak through the interface
 * - All async operations return Promises
 * - IDs are strings for maximum flexibility
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

// ============================================================================
// SCENE CONFIGURATION
// ============================================================================

/**
 * Environment/skybox configuration
 */
export interface EnvironmentConfig {
  /** Path to skybox texture or HDR environment map */
  skyboxPath?: string;
  /** Solid background color (if no skybox) */
  backgroundColor?: ColorRGBA;
  /** Ambient intensity */
  ambientIntensity?: number;
  /** Fog configuration */
  fog?: {
    enabled: boolean;
    color: ColorRGB;
    density?: number;
    near?: number;
    far?: number;
  };
}

/**
 * Initial scene configuration
 */
export interface SceneConfig {
  /** Scene identifier */
  id?: string;
  /** Initial camera configuration */
  camera?: CameraConfig;
  /** Environment settings */
  environment?: EnvironmentConfig;
  /** Initial lights */
  lights?: Array<{ id: string; config: LightConfig }>;
}

// ============================================================================
// RENDER QUALITY SETTINGS
// ============================================================================

/**
 * Render quality preset
 */
export type QualityPreset = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Detailed render quality configuration
 */
export interface RenderQuality {
  /** Shadow map resolution */
  shadowMapSize?: number;
  /** Enable anti-aliasing */
  antialiasing?: boolean;
  /** Texture anisotropic filtering level */
  anisotropy?: number;
  /** Enable bloom post-process */
  bloom?: boolean;
  /** Enable ambient occlusion */
  ambientOcclusion?: boolean;
  /** Maximum bone count for skinned meshes */
  maxBones?: number;
  /** LOD bias (negative = higher quality) */
  lodBias?: number;
}

/**
 * Quality presets
 */
export const QUALITY_PRESETS: Record<QualityPreset, RenderQuality> = {
  low: {
    shadowMapSize: 512,
    antialiasing: false,
    anisotropy: 1,
    bloom: false,
    ambientOcclusion: false,
    maxBones: 32,
    lodBias: 1,
  },
  medium: {
    shadowMapSize: 1024,
    antialiasing: true,
    anisotropy: 4,
    bloom: false,
    ambientOcclusion: false,
    maxBones: 64,
    lodBias: 0,
  },
  high: {
    shadowMapSize: 2048,
    antialiasing: true,
    anisotropy: 8,
    bloom: true,
    ambientOcclusion: true,
    maxBones: 128,
    lodBias: -0.5,
  },
  ultra: {
    shadowMapSize: 4096,
    antialiasing: true,
    anisotropy: 16,
    bloom: true,
    ambientOcclusion: true,
    maxBones: 256,
    lodBias: -1,
  },
} as const;

// ============================================================================
// PICKING / RAYCASTING
// ============================================================================

/**
 * Result of a raycast/pick operation
 */
export interface PickResult {
  /** Whether something was hit */
  hit: boolean;
  /** ID of the mesh that was hit (if any) */
  meshId?: string;
  /** World position of the hit point */
  position?: Vector3Tuple;
  /** Surface normal at the hit point */
  normal?: Vector3Tuple;
  /** Distance from the ray origin */
  distance?: number;
  /** User data attached to the mesh */
  userData?: Record<string, unknown>;
}

/**
 * Ray definition for raycasting
 */
export interface Ray {
  /** Ray origin */
  origin: Vector3Tuple;
  /** Ray direction (normalized) */
  direction: Vector3Tuple;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Scene event types
 */
export type SceneEventType =
  | 'meshAdded'
  | 'meshRemoved'
  | 'meshUpdated'
  | 'lightAdded'
  | 'lightRemoved'
  | 'cameraUpdated'
  | 'pointerDown'
  | 'pointerUp'
  | 'pointerMove';

/**
 * Scene event data
 */
export interface SceneEvent {
  type: SceneEventType;
  meshId?: string;
  lightId?: string;
  position?: Vector3Tuple;
  pickResult?: PickResult;
}

/**
 * Scene event handler
 */
export type SceneEventHandler = (event: SceneEvent) => void;
