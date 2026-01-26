/**
 * Three.js Scene Configuration Exports
 *
 * DRY Architecture: These are pure configuration/data types that work on
 * both web (Three.js/R3F) and mobile (React Native Filament) without
 * bundling any runtime 3D engine code.
 *
 * Usage:
 *   import {
 *     LIGHTING_PRESETS,
 *     CAMERA_PRESETS,
 *     BIOME_CONFIGS,
 *     QUALITY_PRESETS,
 *   } from '@iron-frontier/shared/scenes/three';
 *
 *   // In your Three.js/R3F component
 *   const lighting = getLightingForHour(gameHour);
 *   <ambientLight color={rgbToHex(lighting.ambient.color)} />
 */

// Scene configuration types and utilities
export {
  // Color utilities
  type RGBColor,
  hexToRGB,
  rgbToHex,
  lerpRGB,
  // Vector utilities
  type Vec3,
  normalizeVec3,
  // Lighting types
  type AmbientLightConfig,
  type DirectionalLightConfig,
  type PointLightConfig,
  type SpotLightConfig,
  type HemisphereLightConfig,
  type LightingPreset,
  type FogConfig,
  // Camera types
  type PerspectiveCameraConfig,
  type OrbitControlsConfig,
  type FollowCameraConfig,
  type CameraPreset,
  // Quality types
  type QualityLevel,
  type ShadowQualityConfig,
  type TextureQualityConfig,
  type RenderQualityConfig,
  type PostProcessingConfig,
  type QualityPreset,
  type SceneConfig,
  // Quality presets and utilities
  QUALITY_PRESETS,
  getQualityPreset,
  getRecommendedQuality,
} from './sceneConfig';

// Lighting presets and utilities
export {
  LIGHTING_PRESETS,
  getLightingForHour,
  getSunDirectionForHour,
  createLampLight,
  createCandleLight,
  createFireLight,
} from './lightingPresets';

// Camera presets and utilities
export {
  CAMERA_PRESETS,
  CAMERA_PATHS,
  type CameraKeyframe,
  type CameraPath,
  interpolateKeyframes,
  getCameraAtTime,
  calculateFollowPosition,
  clampPolarAngle,
  clampDistance,
} from './cameraPresets';

// Terrain configuration
export {
  type BiomeType,
  type TerrainTextureConfig,
  type NoiseConfig,
  type VegetationItem,
  type VegetationConfig,
  type EncounterConfig,
  type BiomeConfig,
  type SplatmapWeights,
  BIOME_CONFIGS,
  getTerrainNoiseConfig,
  blendNoiseConfigs,
  getValidVegetationItems,
  getVegetationDensity,
  selectVegetationItem,
  getEncounterRate,
  getWeatherProbabilities,
  calculateSplatmapWeights,
} from './terrainConfig';
