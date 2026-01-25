/**
 * Asset type definitions for Iron Frontier
 */

/**
 * Represents a path to an asset file.
 * On web, this is a URL path (e.g., '/assets/models/characters/engineer.glb')
 * On mobile, this can be converted to a require() call for bundling
 */
export type AssetPath = string;

/**
 * A set of textures for PBR materials
 */
export interface TextureSet {
  /** Base color/diffuse texture */
  color: AssetPath;
  /** Normal map texture */
  normal: AssetPath;
  /** Roughness texture */
  roughness: AssetPath;
  /** Optional ambient occlusion texture */
  ao?: AssetPath;
  /** Optional metallic texture */
  metallic?: AssetPath;
  /** Optional displacement/height texture */
  displacement?: AssetPath;
}

/**
 * Asset categories for 3D models
 */
export type ModelCategory =
  | 'characters'
  | 'containers'
  | 'decor'
  | 'furniture'
  | 'hex-tiles'
  | 'mechanical'
  | 'nature'
  | 'props'
  | 'structures'
  | 'tools'
  | 'vehicles'
  | 'weapons';

/**
 * Asset categories for textures
 */
export type TextureCategory = 'terrain' | 'western' | 'pbr';

/**
 * Asset categories for audio
 */
export type AudioCategory = 'music' | 'sfx' | 'ambient';

/**
 * Supported asset file formats
 */
export type AssetFormat = 'glb' | 'gltf' | 'png' | 'jpg' | 'mp3' | 'wav' | 'ogg';

/**
 * Model asset metadata
 */
export interface ModelAsset {
  /** Unique identifier for the asset */
  id: string;
  /** Display name */
  name: string;
  /** Category for organization */
  category: ModelCategory;
  /** Path to the model file (relative to assets root) */
  path: AssetPath;
  /** File format */
  format: 'glb' | 'gltf';
  /** Optional description */
  description?: string;
  /** Optional dimensions in meters [width, height, depth] */
  dimensions?: [number, number, number];
  /** Whether the model has animations */
  animated?: boolean;
  /** Available animations (if any) */
  animations?: string[];
  /** Tags for filtering */
  tags?: string[];
}

/**
 * Texture asset metadata
 */
export interface TextureAsset {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Category */
  category: TextureCategory;
  /** File path relative to assets root */
  path: AssetPath;
  /** File format */
  format: 'png' | 'jpg';
  /** Texture type (for PBR workflows) */
  type?: 'color' | 'normal' | 'roughness' | 'displacement' | 'ao';
  /** Resolution in pixels */
  resolution?: [number, number];
  /** Tags for filtering */
  tags?: string[];
}

/**
 * Audio asset metadata
 */
export interface AudioAsset {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Category */
  category: AudioCategory;
  /** File path relative to assets root */
  path: AssetPath;
  /** File format */
  format: 'mp3' | 'wav' | 'ogg';
  /** Duration in seconds */
  duration?: number;
  /** Whether the audio should loop */
  loop?: boolean;
  /** Tags for filtering */
  tags?: string[];
}

/**
 * Complete asset manifest structure
 */
export interface AssetManifest {
  /** Package version */
  version: string;
  /** Last updated timestamp */
  lastUpdated: string;
  /** All 3D model assets */
  models: ModelAsset[];
  /** All texture assets */
  textures: TextureAsset[];
  /** All audio assets */
  audio: AudioAsset[];
}
