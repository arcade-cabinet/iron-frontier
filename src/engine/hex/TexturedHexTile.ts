/**
 * TexturedHexTile - Procedurally generated hex tiles with PBR textures
 *
 * Creates hex-shaped ground tiles using custom textures (e.g., from ambientCG)
 * instead of the pre-made Kenney GLB models. Allows for more visual variety
 * and authentic western terrain materials.
 */

import {
  Color3,
  Mesh,
  PBRMaterial,
  type Scene,
  Texture,
  Vector3,
  VertexData,
} from '@babylonjs/core';

// ============================================================================
// TYPES
// ============================================================================

export interface TextureSet {
  diffuse: string; // Base color texture
  normal?: string; // Normal map
  roughness?: string; // Roughness map
  ao?: string; // Ambient occlusion
  displacement?: string; // Displacement/height map
}

export interface TerrainTextureConfig {
  id: string;
  name: string;
  textures: TextureSet;
  uvScale?: number; // How many times texture repeats across tile
  roughnessValue?: number; // Fallback roughness if no roughness map
  tintColor?: Color3; // Optional color tint
}

// ============================================================================
// TERRAIN TEXTURE DEFINITIONS
// ============================================================================

/**
 * Western-themed terrain textures
 * Using paths that expect textures in /public/assets/textures/terrain/
 */
export const TERRAIN_TEXTURES: Record<string, TerrainTextureConfig> = {
  // Sandy desert terrain
  sand_western: {
    id: 'sand_western',
    name: 'Western Desert Sand',
    textures: {
      diffuse: '/assets/textures/terrain/sand_diffuse.jpg',
      normal: '/assets/textures/terrain/sand_normal.jpg',
      roughness: '/assets/textures/terrain/sand_roughness.jpg',
    },
    uvScale: 2,
    roughnessValue: 0.9,
    tintColor: new Color3(0.95, 0.85, 0.7), // Warm sand tint
  },

  // Packed dirt/earth
  dirt_packed: {
    id: 'dirt_packed',
    name: 'Packed Dirt Road',
    textures: {
      diffuse: '/assets/textures/terrain/dirt_diffuse.jpg',
      normal: '/assets/textures/terrain/dirt_normal.jpg',
      roughness: '/assets/textures/terrain/dirt_roughness.jpg',
    },
    uvScale: 2,
    roughnessValue: 0.85,
    tintColor: new Color3(0.75, 0.55, 0.35), // Brown dirt
  },

  // Dry grass
  grass_dry: {
    id: 'grass_dry',
    name: 'Dry Western Grass',
    textures: {
      diffuse: '/assets/textures/terrain/grass_dry_diffuse.jpg',
      normal: '/assets/textures/terrain/grass_dry_normal.jpg',
      roughness: '/assets/textures/terrain/grass_dry_roughness.jpg',
    },
    uvScale: 3,
    roughnessValue: 0.8,
    tintColor: new Color3(0.7, 0.65, 0.4), // Yellowed grass
  },

  // Rocky ground
  stone_ground: {
    id: 'stone_ground',
    name: 'Rocky Ground',
    textures: {
      diffuse: '/assets/textures/terrain/stone_diffuse.jpg',
      normal: '/assets/textures/terrain/stone_normal.jpg',
      roughness: '/assets/textures/terrain/stone_roughness.jpg',
    },
    uvScale: 2,
    roughnessValue: 0.7,
    tintColor: new Color3(0.6, 0.55, 0.5), // Gray stone
  },

  // Cracked clay/badlands
  clay_cracked: {
    id: 'clay_cracked',
    name: 'Cracked Clay',
    textures: {
      diffuse: '/assets/textures/terrain/clay_diffuse.jpg',
      normal: '/assets/textures/terrain/clay_normal.jpg',
      roughness: '/assets/textures/terrain/clay_roughness.jpg',
    },
    uvScale: 2,
    roughnessValue: 0.95,
    tintColor: new Color3(0.8, 0.6, 0.45), // Reddish clay
  },
};

// ============================================================================
// FALLBACK COLORS (when textures not available)
// ============================================================================

export const TERRAIN_FALLBACK_COLORS: Record<string, Color3> = {
  sand: new Color3(0.85, 0.75, 0.55),
  dirt: new Color3(0.55, 0.4, 0.25),
  grass: new Color3(0.45, 0.55, 0.3),
  stone: new Color3(0.5, 0.5, 0.5),
  water: new Color3(0.2, 0.4, 0.6),
};

// ============================================================================
// HEX TILE GEOMETRY
// ============================================================================

/**
 * Create hex tile vertices for a flat-topped hexagon
 * @param size - Distance from center to corner
 * @param height - Thickness of the tile
 */
function createHexGeometry(size: number, height: number = 0.1): VertexData {
  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  // Flat-topped hexagon angles (starting from right, going counter-clockwise)
  const angles = [0, 60, 120, 180, 240, 300].map((a) => (a * Math.PI) / 180);

  // Top face vertices (center + 6 corners)
  const topY = height / 2;

  // Center vertex (index 0)
  positions.push(0, topY, 0);
  normals.push(0, 1, 0);
  uvs.push(0.5, 0.5);

  // Corner vertices (indices 1-6)
  for (let i = 0; i < 6; i++) {
    const x = size * Math.cos(angles[i]);
    const z = size * Math.sin(angles[i]);
    positions.push(x, topY, z);
    normals.push(0, 1, 0);
    // UV coordinates mapped to hexagon
    uvs.push(0.5 + 0.5 * Math.cos(angles[i]), 0.5 + 0.5 * Math.sin(angles[i]));
  }

  // Top face triangles (fan from center)
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    indices.push(0, i + 1, next + 1);
  }

  // Bottom face vertices (indices 7-13)
  const bottomY = -height / 2;

  // Center vertex (index 7)
  positions.push(0, bottomY, 0);
  normals.push(0, -1, 0);
  uvs.push(0.5, 0.5);

  // Corner vertices (indices 8-13)
  for (let i = 0; i < 6; i++) {
    const x = size * Math.cos(angles[i]);
    const z = size * Math.sin(angles[i]);
    positions.push(x, bottomY, z);
    normals.push(0, -1, 0);
    uvs.push(0.5 + 0.5 * Math.cos(angles[i]), 0.5 + 0.5 * Math.sin(angles[i]));
  }

  // Bottom face triangles (fan from center, reversed winding)
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    indices.push(7, next + 8, i + 8);
  }

  // Side faces (6 rectangles, each split into 2 triangles)
  const sideStartIndex = 14;
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;

    // Top-left, top-right, bottom-right, bottom-left
    const tlX = size * Math.cos(angles[i]);
    const tlZ = size * Math.sin(angles[i]);
    const trX = size * Math.cos(angles[next]);
    const trZ = size * Math.sin(angles[next]);

    // Calculate normal for this side face
    const nx = (tlX + trX) / 2;
    const nz = (tlZ + trZ) / 2;
    const nLen = Math.sqrt(nx * nx + nz * nz);
    const normalX = nx / nLen;
    const normalZ = nz / nLen;

    const baseIdx = sideStartIndex + i * 4;

    // Four vertices per side
    positions.push(tlX, topY, tlZ); // Top-left
    positions.push(trX, topY, trZ); // Top-right
    positions.push(trX, bottomY, trZ); // Bottom-right
    positions.push(tlX, bottomY, tlZ); // Bottom-left

    // Normals pointing outward
    for (let j = 0; j < 4; j++) {
      normals.push(normalX, 0, normalZ);
    }

    // UVs for side
    uvs.push(0, 1, 1, 1, 1, 0, 0, 0);

    // Two triangles per side
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
    indices.push(baseIdx, baseIdx + 2, baseIdx + 3);
  }

  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;

  return vertexData;
}

// ============================================================================
// TEXTURED HEX TILE CLASS
// ============================================================================

export class TexturedHexTileFactory {
  private scene: Scene;
  private materialCache: Map<string, PBRMaterial> = new Map();
  private hexMeshTemplate: Mesh | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Get or create the hex mesh template
   */
  private getHexTemplate(): Mesh {
    if (!this.hexMeshTemplate) {
      // Create a hex mesh that matches Kenney tile scale (size=1, scaled 2x = 2 units wide)
      const hexGeometry = createHexGeometry(1.0, 0.15);
      this.hexMeshTemplate = new Mesh('hex_template', this.scene);
      hexGeometry.applyToMesh(this.hexMeshTemplate);
      this.hexMeshTemplate.isVisible = false;
      this.hexMeshTemplate.setEnabled(false);
    }
    return this.hexMeshTemplate;
  }

  /**
   * Create or get a cached PBR material for a terrain type
   */
  getMaterial(terrainId: string): PBRMaterial {
    const cached = this.materialCache.get(terrainId);
    if (cached) {
      return cached;
    }

    const config = TERRAIN_TEXTURES[terrainId];
    const material = new PBRMaterial(`terrain_${terrainId}`, this.scene);

    if (config) {
      // Try to load textures
      try {
        material.albedoTexture = new Texture(config.textures.diffuse, this.scene);
        if (config.textures.normal) {
          material.bumpTexture = new Texture(config.textures.normal, this.scene);
        }
        if (config.textures.roughness) {
          material.metallicTexture = new Texture(config.textures.roughness, this.scene);
          material.useRoughnessFromMetallicTextureAlpha = false;
          material.useRoughnessFromMetallicTextureGreen = true;
        }

        // Apply UV scale
        if (config.uvScale && material.albedoTexture) {
          (material.albedoTexture as Texture).uScale = config.uvScale;
          (material.albedoTexture as Texture).vScale = config.uvScale;
          if (material.bumpTexture) {
            (material.bumpTexture as Texture).uScale = config.uvScale;
            (material.bumpTexture as Texture).vScale = config.uvScale;
          }
        }

        // Apply tint
        if (config.tintColor) {
          material.albedoColor = config.tintColor;
        }
      } catch (_e) {
        // Fall back to simple color
        console.warn(`[TexturedHexTile] Failed to load textures for ${terrainId}, using fallback`);
        material.albedoColor = TERRAIN_FALLBACK_COLORS[terrainId] || new Color3(0.5, 0.5, 0.5);
      }

      material.roughness = config.roughnessValue || 0.8;
      material.metallic = 0;
    } else {
      // No config - use fallback color
      material.albedoColor = TERRAIN_FALLBACK_COLORS[terrainId] || new Color3(0.5, 0.5, 0.5);
      material.roughness = 0.8;
      material.metallic = 0;
    }

    this.materialCache.set(terrainId, material);
    return material;
  }

  /**
   * Create a textured hex tile instance
   */
  createTile(
    terrainId: string,
    position: Vector3,
    rotation: number = 0,
    scale: number = 2.0 // Match Kenney tile scale
  ): Mesh {
    const template = this.getHexTemplate();
    const tileName = `textured_hex_${terrainId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create instance
    const tile = template.clone(tileName, null);
    if (!tile) {
      throw new Error(`Failed to create hex tile for ${terrainId}`);
    }

    tile.isVisible = true;
    tile.setEnabled(true);

    // Apply material
    tile.material = this.getMaterial(terrainId);

    // Apply transforms
    tile.position = position;
    tile.rotation = new Vector3(0, rotation, 0);
    tile.scaling = new Vector3(scale, scale, scale);

    // Enable shadows
    tile.receiveShadows = true;

    return tile;
  }

  /**
   * Dispose all cached materials and templates
   */
  dispose(): void {
    for (const material of this.materialCache.values()) {
      material.dispose();
    }
    this.materialCache.clear();

    if (this.hexMeshTemplate) {
      this.hexMeshTemplate.dispose();
      this.hexMeshTemplate = null;
    }
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let globalFactory: TexturedHexTileFactory | null = null;

export function getTexturedHexTileFactory(scene: Scene): TexturedHexTileFactory {
  if (!globalFactory) {
    globalFactory = new TexturedHexTileFactory(scene);
  }
  return globalFactory;
}

export function disposeTexturedHexTileFactory(): void {
  if (globalFactory) {
    globalFactory.dispose();
    globalFactory = null;
  }
}
