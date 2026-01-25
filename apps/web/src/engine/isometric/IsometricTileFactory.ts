/**
 * IsometricTileFactory.ts - Creates textured isometric tile instances
 *
 * Manages PBR materials for terrain types and creates tile mesh instances.
 * Uses instancing for performance when rendering large maps.
 */

import {
  Color3,
  type Mesh,
  PBRMaterial,
  type Scene,
  Texture,
  Vector3,
} from '@babylonjs/core';

import { createTileMeshTemplate } from './IsometricTileGeometry';
import {
  DEFAULT_ISOMETRIC_LAYOUT,
  type IsometricLayout,
  TerrainType,
} from './IsometricTypes';

// ============================================================================
// TERRAIN TEXTURE CONFIGURATION
// ============================================================================

export interface TerrainTextureConfig {
  id: string;
  name: string;
  diffuse: string;
  normal?: string;
  roughness?: string;
  uvScale: number;
  roughnessValue: number;
  tintColor?: Color3;
}

/**
 * PBR texture configurations for each terrain type.
 * Uses textures from /public/assets/textures/terrain/
 */
export const TERRAIN_TEXTURE_CONFIGS: Record<TerrainType, TerrainTextureConfig> = {
  [TerrainType.Grass]: {
    id: 'grass',
    name: 'Western Grass',
    diffuse: '/assets/textures/terrain/grass003_color.jpg',
    normal: '/assets/textures/terrain/grass003_normal.jpg',
    roughness: '/assets/textures/terrain/grass003_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.8,
    tintColor: new Color3(0.75, 0.7, 0.45), // Yellowed western grass
  },
  [TerrainType.GrassDry]: {
    id: 'grass_dry',
    name: 'Dry Grass',
    diffuse: '/assets/textures/terrain/grass003_color.jpg',
    normal: '/assets/textures/terrain/grass003_normal.jpg',
    roughness: '/assets/textures/terrain/grass003_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.9,
    tintColor: new Color3(0.8, 0.7, 0.4), // More yellow/brown
  },
  [TerrainType.Sand]: {
    id: 'sand',
    name: 'Desert Sand',
    diffuse: '/assets/textures/terrain/ground044_color.jpg',
    normal: '/assets/textures/terrain/ground044_normal.jpg',
    roughness: '/assets/textures/terrain/ground044_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.9,
    tintColor: new Color3(0.95, 0.85, 0.7),
  },
  [TerrainType.SandDunes]: {
    id: 'sand_dunes',
    name: 'Sand Dunes',
    diffuse: '/assets/textures/terrain/ground044_color.jpg',
    normal: '/assets/textures/terrain/ground044_normal.jpg',
    roughness: '/assets/textures/terrain/ground044_roughness.jpg',
    uvScale: 3,
    roughnessValue: 0.85,
    tintColor: new Color3(0.9, 0.8, 0.6),
  },
  [TerrainType.Dirt]: {
    id: 'dirt',
    name: 'Packed Dirt',
    diffuse: '/assets/textures/terrain/ground043_color.jpg',
    normal: '/assets/textures/terrain/ground043_normal.jpg',
    roughness: '/assets/textures/terrain/ground043_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.85,
    tintColor: new Color3(0.75, 0.55, 0.35),
  },
  [TerrainType.DirtPath]: {
    id: 'dirt_path',
    name: 'Dirt Path',
    diffuse: '/assets/textures/terrain/ground043_color.jpg',
    normal: '/assets/textures/terrain/ground043_normal.jpg',
    roughness: '/assets/textures/terrain/ground043_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.75,
    tintColor: new Color3(0.65, 0.5, 0.3),
  },
  [TerrainType.Stone]: {
    id: 'stone',
    name: 'Rocky Ground',
    diffuse: '/assets/textures/terrain/rock018_color.jpg',
    normal: '/assets/textures/terrain/rock018_normal.jpg',
    roughness: '/assets/textures/terrain/rock018_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.7,
    tintColor: new Color3(0.65, 0.6, 0.55),
  },
  [TerrainType.StoneRough]: {
    id: 'stone_rough',
    name: 'Rough Stone',
    diffuse: '/assets/textures/terrain/rock018_color.jpg',
    normal: '/assets/textures/terrain/rock018_normal.jpg',
    roughness: '/assets/textures/terrain/rock018_roughness.jpg',
    uvScale: 3,
    roughnessValue: 0.8,
    tintColor: new Color3(0.55, 0.5, 0.45),
  },
  [TerrainType.Water]: {
    id: 'water',
    name: 'Water',
    diffuse: '/assets/textures/terrain/ground044_color.jpg', // Placeholder
    uvScale: 4,
    roughnessValue: 0.1,
    tintColor: new Color3(0.25, 0.45, 0.65),
  },
  [TerrainType.WaterShallow]: {
    id: 'water_shallow',
    name: 'Shallow Water',
    diffuse: '/assets/textures/terrain/ground044_color.jpg', // Placeholder
    uvScale: 3,
    roughnessValue: 0.2,
    tintColor: new Color3(0.35, 0.55, 0.6),
  },
  [TerrainType.Mesa]: {
    id: 'mesa',
    name: 'Mesa',
    diffuse: '/assets/textures/terrain/clay002_color.jpg',
    normal: '/assets/textures/terrain/clay002_normal.jpg',
    roughness: '/assets/textures/terrain/clay002_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.9,
    tintColor: new Color3(0.85, 0.6, 0.45),
  },
  [TerrainType.Badlands]: {
    id: 'badlands',
    name: 'Badlands',
    diffuse: '/assets/textures/terrain/ground088_color.jpg',
    normal: '/assets/textures/terrain/ground088_normal.jpg',
    roughness: '/assets/textures/terrain/ground088_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.9,
    tintColor: new Color3(0.7, 0.5, 0.35),
  },
  [TerrainType.Clay]: {
    id: 'clay',
    name: 'Cracked Clay',
    diffuse: '/assets/textures/terrain/clay002_color.jpg',
    normal: '/assets/textures/terrain/clay002_normal.jpg',
    roughness: '/assets/textures/terrain/clay002_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.95,
    tintColor: new Color3(0.8, 0.55, 0.4),
  },
};

// ============================================================================
// TILE FACTORY CLASS
// ============================================================================

export class IsometricTileFactory {
  private scene: Scene;
  private layout: IsometricLayout;
  private materialCache: Map<TerrainType, PBRMaterial> = new Map();
  private tileTemplate: Mesh | null = null;
  private tileCounter = 0;

  constructor(scene: Scene, layout: IsometricLayout = DEFAULT_ISOMETRIC_LAYOUT) {
    this.scene = scene;
    this.layout = layout;
  }

  /**
   * Initialize the factory - preload common materials.
   */
  async init(): Promise<void> {
    // Create tile mesh template
    this.tileTemplate = createTileMeshTemplate(
      this.scene,
      this.layout.tileSize,
      'isometric_tile_template'
    );

    // Pre-create materials for common terrain types
    const commonTypes = [
      TerrainType.Grass,
      TerrainType.Sand,
      TerrainType.Dirt,
      TerrainType.Stone,
    ];

    for (const terrainType of commonTypes) {
      this.getMaterial(terrainType);
    }

    console.log('[IsometricTileFactory] Initialized');
  }

  /**
   * Get or create a PBR material for a terrain type.
   */
  getMaterial(terrainType: TerrainType): PBRMaterial {
    const cached = this.materialCache.get(terrainType);
    if (cached) {
      return cached;
    }

    const config = TERRAIN_TEXTURE_CONFIGS[terrainType];
    const material = new PBRMaterial(`terrain_${config.id}`, this.scene);

    // Load textures
    try {
      const diffuseTexture = new Texture(config.diffuse, this.scene);
      diffuseTexture.uScale = config.uvScale;
      diffuseTexture.vScale = config.uvScale;
      material.albedoTexture = diffuseTexture;

      if (config.normal) {
        const normalTexture = new Texture(config.normal, this.scene);
        normalTexture.uScale = config.uvScale;
        normalTexture.vScale = config.uvScale;
        material.bumpTexture = normalTexture;
      }

      if (config.roughness) {
        const roughnessTexture = new Texture(config.roughness, this.scene);
        roughnessTexture.uScale = config.uvScale;
        roughnessTexture.vScale = config.uvScale;
        material.metallicTexture = roughnessTexture;
        material.useRoughnessFromMetallicTextureAlpha = false;
        material.useRoughnessFromMetallicTextureGreen = true;
      }

      // Apply tint color
      if (config.tintColor) {
        material.albedoColor = config.tintColor;
      }
    } catch (err) {
      console.error(
        `[IsometricTileFactory] Failed to load textures for ${config.id}:`,
        err
      );
      // Fallback to solid color
      material.albedoColor = config.tintColor || new Color3(0.5, 0.5, 0.5);
    }

    material.roughness = config.roughnessValue;
    material.metallic = 0;

    this.materialCache.set(terrainType, material);
    return material;
  }

  /**
   * Create a terrain tile at the specified world position.
   */
  createTile(
    terrainType: TerrainType,
    worldPosition: Vector3,
    rotation: number = 0
  ): Mesh {
    if (!this.tileTemplate) {
      throw new Error('[IsometricTileFactory] Factory not initialized');
    }

    const tileName = `iso_tile_${terrainType}_${this.tileCounter++}`;
    const tile = this.tileTemplate.clone(tileName, null);

    if (!tile) {
      throw new Error(`[IsometricTileFactory] Failed to clone tile template`);
    }

    tile.isVisible = true;
    tile.setEnabled(true);

    // Apply material
    tile.material = this.getMaterial(terrainType);

    // Apply transforms
    tile.position = worldPosition;
    tile.rotation = new Vector3(0, rotation, 0);

    // Enable shadows
    tile.receiveShadows = true;

    return tile;
  }

  /**
   * Dispose all cached materials and templates.
   */
  dispose(): void {
    for (const material of this.materialCache.values()) {
      material.dispose();
    }
    this.materialCache.clear();

    if (this.tileTemplate) {
      this.tileTemplate.dispose();
      this.tileTemplate = null;
    }

    console.log('[IsometricTileFactory] Disposed');
  }
}
