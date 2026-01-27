/**
 * Texture path constants for terrain and materials.
 *
 * These textures are sourced from AmbientCG and are PBR-ready with
 * color, normal, and roughness maps.
 */

import type { TextureSet } from './types';

// Base path for textures
const TEXTURE_BASE = 'textures';

/**
 * Terrain/Ground textures from AmbientCG
 */
export const TerrainTextures: Record<string, TextureSet> = {
  /** Desert/Sand biome - warm sandy texture */
  DESERT: {
    color: `${TEXTURE_BASE}/Ground037_1K-JPG_Color.jpg`,
    normal: `${TEXTURE_BASE}/Ground037_1K-JPG_NormalGL.jpg`,
    roughness: `${TEXTURE_BASE}/Ground037_1K-JPG_Roughness.jpg`,
  },
  /** Grassland biome - lush green texture */
  GRASSLAND: {
    color: `${TEXTURE_BASE}/Grass004_1K-JPG_Color.jpg`,
    normal: `${TEXTURE_BASE}/Grass004_1K-JPG_NormalGL.jpg`,
    roughness: `${TEXTURE_BASE}/Grass004_1K-JPG_Roughness.jpg`,
  },
  /** Badlands/Rocky biome - rough rocky texture */
  BADLANDS: {
    color: `${TEXTURE_BASE}/Ground033_1K-JPG_Color.jpg`,
    normal: `${TEXTURE_BASE}/Ground033_1K-JPG_NormalGL.jpg`,
    roughness: `${TEXTURE_BASE}/Ground033_1K-JPG_Roughness.jpg`,
  },
  /** Riverside biome - wet muddy texture */
  RIVERSIDE: {
    color: `${TEXTURE_BASE}/Ground003_1K-JPG_Color.jpg`,
    normal: `${TEXTURE_BASE}/Ground003_1K-JPG_NormalGL.jpg`,
    roughness: `${TEXTURE_BASE}/Ground003_1K-JPG_Roughness.jpg`,
  },
  /** Rock texture for cliffs/platforms */
  ROCK: {
    color: `${TEXTURE_BASE}/Rock020_1K-JPG_Color.jpg`,
    normal: `${TEXTURE_BASE}/Rock020_1K-JPG_NormalGL.jpg`,
    roughness: `${TEXTURE_BASE}/Rock020_1K-JPG_Roughness.jpg`,
  },
} as const;

/**
 * Get the full texture path with base URL prefix.
 *
 * @param relativePath - The relative path from the texture constants
 * @param baseUrl - The base URL for the platform (default: '/assets/')
 */
export function getTexturePath(relativePath: string, baseUrl = '/assets/'): string {
  return `${baseUrl}${relativePath}`;
}

/**
 * Get a complete TextureSet with full paths.
 *
 * @param textureSet - The texture set with relative paths
 * @param baseUrl - The base URL for the platform
 */
export function getTextureSetPaths(textureSet: TextureSet, baseUrl = '/assets/'): TextureSet {
  return {
    color: getTexturePath(textureSet.color, baseUrl),
    normal: getTexturePath(textureSet.normal, baseUrl),
    roughness: getTexturePath(textureSet.roughness, baseUrl),
    ao: textureSet.ao ? getTexturePath(textureSet.ao, baseUrl) : undefined,
    metallic: textureSet.metallic ? getTexturePath(textureSet.metallic, baseUrl) : undefined,
  };
}
