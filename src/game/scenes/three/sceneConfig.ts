/**
 * Three.js Scene Configuration Types
 *
 * DRY Architecture: Pure configuration/data types that work identically
 * on web (Three.js) and mobile (React Native Filament) without bundling
 * any runtime 3D engine code.
 *
 * Usage:
 *   // Web (apps/web with React Three Fiber)
 *   import { LIGHTING_PRESETS, CAMERA_PRESETS } from '@iron-frontier/shared/scenes/three';
 *   <ambientLight intensity={LIGHTING_PRESETS.westernDay.ambient.intensity} />
 *
 *   // Mobile (apps/mobile with Filament)
 *   import { LIGHTING_PRESETS } from '@iron-frontier/shared/scenes/three';
 *   const config = LIGHTING_PRESETS.westernDay;
 *   // Apply to Filament light
 */

// ============================================================================
// COLOR TYPES (Renderer-Agnostic)
// ============================================================================

/**
 * RGB color values normalized to 0-1 range
 * Compatible with Three.js Color and Filament color APIs
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert hex color to RGB (0-1 range)
 */
export function hexToRGB(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 1, g: 1, b: 1 };
  }
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

/**
 * Convert RGB (0-1 range) to hex string
 */
export function rgbToHex(color: RGBColor): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(1, n)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

/**
 * Lerp between two RGB colors
 */
export function lerpRGB(a: RGBColor, b: RGBColor, t: number): RGBColor {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

// ============================================================================
// VECTOR TYPES (Renderer-Agnostic)
// ============================================================================

/**
 * 3D vector for positions and directions
 * Compatible with Three.js Vector3 and Filament float3
 */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Normalize a Vec3 to unit length
 */
export function normalizeVec3(v: Vec3): Vec3 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (len === 0) return { x: 0, y: 1, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

// ============================================================================
// LIGHTING CONFIGURATION TYPES
// ============================================================================

export interface AmbientLightConfig {
  color: RGBColor;
  intensity: number;
}

export interface DirectionalLightConfig {
  color: RGBColor;
  intensity: number;
  direction: Vec3;
  castShadow: boolean;
}

export interface PointLightConfig {
  color: RGBColor;
  intensity: number;
  position: Vec3;
  distance: number;
  decay: number;
  castShadow: boolean;
}

export interface SpotLightConfig {
  color: RGBColor;
  intensity: number;
  position: Vec3;
  target: Vec3;
  angle: number;
  penumbra: number;
  distance: number;
  decay: number;
  castShadow: boolean;
}

export interface HemisphereLightConfig {
  skyColor: RGBColor;
  groundColor: RGBColor;
  intensity: number;
}

export interface LightingPreset {
  name: string;
  description: string;
  ambient: AmbientLightConfig;
  directional: DirectionalLightConfig;
  hemisphere?: HemisphereLightConfig;
  fog?: FogConfig;
  skyColor: RGBColor;
}

export interface FogConfig {
  color: RGBColor;
  near: number;
  far: number;
}

// ============================================================================
// CAMERA CONFIGURATION TYPES
// ============================================================================

export interface PerspectiveCameraConfig {
  fov: number;
  near: number;
  far: number;
}

export interface OrbitControlsConfig {
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  enableDamping: boolean;
  dampingFactor: number;
  enablePan: boolean;
  enableZoom: boolean;
}

export interface FollowCameraConfig {
  offset: Vec3;
  lookAhead: number;
  smoothTime: number;
  maxSpeed: number;
}

export interface CameraPreset {
  name: string;
  description: string;
  perspective: PerspectiveCameraConfig;
  orbit?: OrbitControlsConfig;
  follow?: FollowCameraConfig;
  defaultPosition: Vec3;
  defaultTarget: Vec3;
}

// ============================================================================
// QUALITY PRESET TYPES
// ============================================================================

export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

export interface ShadowQualityConfig {
  enabled: boolean;
  mapSize: number;
  bias: number;
  normalBias: number;
  radius: number;
}

export interface TextureQualityConfig {
  maxAnisotropy: number;
  generateMipmaps: boolean;
}

export interface RenderQualityConfig {
  pixelRatio: number;
  antialias: boolean;
  toneMapping: 'linear' | 'aces' | 'reinhard' | 'cineon';
  toneMappingExposure: number;
}

export interface PostProcessingConfig {
  enabled: boolean;
  bloom: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  ssao: boolean;
  ssaoIntensity: number;
  vignette: boolean;
  vignetteIntensity: number;
}

export interface QualityPreset {
  name: string;
  description: string;
  shadows: ShadowQualityConfig;
  textures: TextureQualityConfig;
  render: RenderQualityConfig;
  postProcessing: PostProcessingConfig;
  terrainSubdivisions: number;
  vegetationDensity: number;
  viewDistance: number;
  lodBias: number;
}

// ============================================================================
// QUALITY PRESETS
// ============================================================================

export const QUALITY_PRESETS: Record<QualityLevel, QualityPreset> = {
  low: {
    name: 'Low',
    description: 'Best performance, reduced visual quality',
    shadows: {
      enabled: false,
      mapSize: 512,
      bias: 0.0001,
      normalBias: 0.02,
      radius: 1,
    },
    textures: {
      maxAnisotropy: 1,
      generateMipmaps: true,
    },
    render: {
      pixelRatio: 0.75,
      antialias: false,
      toneMapping: 'linear',
      toneMappingExposure: 1.0,
    },
    postProcessing: {
      enabled: false,
      bloom: false,
      bloomIntensity: 0,
      bloomThreshold: 0,
      ssao: false,
      ssaoIntensity: 0,
      vignette: false,
      vignetteIntensity: 0,
    },
    terrainSubdivisions: 64,
    vegetationDensity: 0.2,
    viewDistance: 200,
    lodBias: 2.0,
  },
  medium: {
    name: 'Medium',
    description: 'Balanced performance and quality',
    shadows: {
      enabled: true,
      mapSize: 1024,
      bias: 0.0001,
      normalBias: 0.02,
      radius: 2,
    },
    textures: {
      maxAnisotropy: 4,
      generateMipmaps: true,
    },
    render: {
      pixelRatio: 1.0,
      antialias: true,
      toneMapping: 'aces',
      toneMappingExposure: 1.0,
    },
    postProcessing: {
      enabled: false,
      bloom: false,
      bloomIntensity: 0,
      bloomThreshold: 0,
      ssao: false,
      ssaoIntensity: 0,
      vignette: false,
      vignetteIntensity: 0,
    },
    terrainSubdivisions: 128,
    vegetationDensity: 0.5,
    viewDistance: 400,
    lodBias: 1.0,
  },
  high: {
    name: 'High',
    description: 'High quality with good performance',
    shadows: {
      enabled: true,
      mapSize: 2048,
      bias: 0.00005,
      normalBias: 0.01,
      radius: 3,
    },
    textures: {
      maxAnisotropy: 8,
      generateMipmaps: true,
    },
    render: {
      pixelRatio: 1.0,
      antialias: true,
      toneMapping: 'aces',
      toneMappingExposure: 1.0,
    },
    postProcessing: {
      enabled: true,
      bloom: true,
      bloomIntensity: 0.3,
      bloomThreshold: 0.8,
      ssao: false,
      ssaoIntensity: 0,
      vignette: true,
      vignetteIntensity: 0.3,
    },
    terrainSubdivisions: 256,
    vegetationDensity: 0.8,
    viewDistance: 600,
    lodBias: 0.5,
  },
  ultra: {
    name: 'Ultra',
    description: 'Maximum quality, requires powerful hardware',
    shadows: {
      enabled: true,
      mapSize: 4096,
      bias: 0.00002,
      normalBias: 0.005,
      radius: 4,
    },
    textures: {
      maxAnisotropy: 16,
      generateMipmaps: true,
    },
    render: {
      pixelRatio: 1.5,
      antialias: true,
      toneMapping: 'aces',
      toneMappingExposure: 1.0,
    },
    postProcessing: {
      enabled: true,
      bloom: true,
      bloomIntensity: 0.4,
      bloomThreshold: 0.75,
      ssao: true,
      ssaoIntensity: 0.5,
      vignette: true,
      vignetteIntensity: 0.4,
    },
    terrainSubdivisions: 512,
    vegetationDensity: 1.0,
    viewDistance: 1000,
    lodBias: 0.0,
  },
};

// ============================================================================
// SCENE CONFIGURATION
// ============================================================================

export interface SceneConfig {
  quality: QualityLevel;
  lighting: LightingPreset;
  camera: CameraPreset;
  seed: number;
  initialHour: number;
}

/**
 * Get quality preset by level
 */
export function getQualityPreset(level: QualityLevel): QualityPreset {
  return QUALITY_PRESETS[level];
}

/**
 * Detect recommended quality level based on device capabilities
 * Returns a conservative estimate - actual detection should happen at runtime
 */
export function getRecommendedQuality(isMobile: boolean, hasWebGPU: boolean): QualityLevel {
  if (isMobile) {
    return 'low';
  }
  if (hasWebGPU) {
    return 'high';
  }
  return 'medium';
}
