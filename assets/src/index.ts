/**
 * @iron-frontier/assets
 *
 * Shared 3D models, textures, and audio assets for Iron Frontier.
 * This package provides type-safe asset paths that work across platforms.
 *
 * Usage:
 * - Web: Assets are served from /assets/ via Vite publicDir
 * - Mobile: Assets are bundled via expo-asset and use require()
 */

// Export all asset path constants
export * from './paths';

// Export all texture utilities
export * from './textures';

// Export types
export type {
  AssetFormat,
  AssetManifest,
  AssetPath,
  AudioAsset,
  AudioCategory,
  ModelAsset,
  ModelCategory,
  TextureAsset,
  TextureCategory,
  TextureSet,
} from './types';
