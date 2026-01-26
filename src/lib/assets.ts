/**
 * assets.ts - Platform-specific asset loading utilities
 *
 * Provides unified asset loading interface for:
 * - Web: Direct file paths or public URLs
 * - Native: expo-asset with localUri
 */

import { Asset } from 'expo-asset';
import { Platform } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface AssetDescriptor {
  uri: string;
  width?: number;
  height?: number;
  hash?: string;
  type?: string;
  name?: string;
}

// ============================================================================
// ASSET LOADING
// ============================================================================

/**
 * Load a 3D model asset
 * @param modelPath - Path to model file (relative to assets directory)
 * @returns Promise resolving to asset URI
 */
export async function loadModel(modelPath: string): Promise<string> {
  if (Platform.OS === 'web') {
    // Web: return public URL
    return `/assets/models/${modelPath}`;
  } else {
    // Native: use expo-asset
    try {
      const asset = Asset.fromModule(require(`../../assets/models/${modelPath}`));
      await asset.downloadAsync();
      return asset.localUri || asset.uri;
    } catch (error) {
      console.error(`Failed to load model: ${modelPath}`, error);
      throw error;
    }
  }
}

/**
 * Load a texture asset
 * @param texturePath - Path to texture file (relative to assets directory)
 * @returns Promise resolving to asset URI
 */
export async function loadTexture(texturePath: string): Promise<string> {
  if (Platform.OS === 'web') {
    // Web: return public URL
    return `/assets/textures/${texturePath}`;
  } else {
    // Native: use expo-asset
    try {
      const asset = Asset.fromModule(require(`../../assets/textures/${texturePath}`));
      await asset.downloadAsync();
      return asset.localUri || asset.uri;
    } catch (error) {
      console.error(`Failed to load texture: ${texturePath}`, error);
      throw error;
    }
  }
}

/**
 * Preload multiple assets
 * @param assetPaths - Array of asset paths
 * @param type - Asset type ('model' or 'texture')
 * @returns Promise resolving when all assets are loaded
 */
export async function preloadAssets(
  assetPaths: string[],
  type: 'model' | 'texture' = 'model'
): Promise<string[]> {
  const loadFn = type === 'model' ? loadModel : loadTexture;
  return Promise.all(assetPaths.map(path => loadFn(path)));
}

/**
 * Load asset from require statement (for dynamic imports)
 * @param assetModule - Asset module from require()
 * @returns Promise resolving to asset URI
 */
export async function loadAssetFromModule(assetModule: number): Promise<string> {
  if (Platform.OS === 'web') {
    // Web: asset module is already a string path
    return assetModule as unknown as string;
  } else {
    // Native: use expo-asset
    try {
      const asset = Asset.fromModule(assetModule);
      await asset.downloadAsync();
      return asset.localUri || asset.uri;
    } catch (error) {
      console.error('Failed to load asset from module', error);
      throw error;
    }
  }
}

// ============================================================================
// ASSET CACHING
// ============================================================================

const assetCache = new Map<string, string>();

/**
 * Load asset with caching
 * @param assetPath - Path to asset
 * @param type - Asset type
 * @returns Promise resolving to cached or newly loaded asset URI
 */
export async function loadAssetCached(
  assetPath: string,
  type: 'model' | 'texture' = 'model'
): Promise<string> {
  const cacheKey = `${type}:${assetPath}`;
  
  if (assetCache.has(cacheKey)) {
    return assetCache.get(cacheKey)!;
  }

  const loadFn = type === 'model' ? loadModel : loadTexture;
  const uri = await loadFn(assetPath);
  assetCache.set(cacheKey, uri);
  
  return uri;
}

/**
 * Clear asset cache
 */
export function clearAssetCache(): void {
  assetCache.clear();
}

/**
 * Get cache size
 */
export function getAssetCacheSize(): number {
  return assetCache.size;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  loadModel,
  loadTexture,
  preloadAssets,
  loadAssetFromModule,
  loadAssetCached,
  clearAssetCache,
  getAssetCacheSize,
};
