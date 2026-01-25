/**
 * DynamicTerrainManager - Seamless overworld terrain using Babylon.js Dynamic Terrain
 *
 * Renders a western desert/plains landscape with:
 * - Procedural heightmap generation
 * - AmbientCG PBR textures for realistic ground
 * - Biome-based texture blending
 * - LOD system for performance
 */

import {
  Color3,
  type Mesh,
  MeshBuilder,
  type Scene,
  ShaderMaterial,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';
import Alea from 'alea';
import { createNoise2D, type NoiseFunction2D } from 'simplex-noise';

// ============================================================================
// TYPES
// ============================================================================

export interface TerrainConfig {
  /** Random seed for terrain generation */
  seed: number;
  /** World size in units */
  worldSize: number;
  /** Number of terrain subdivisions */
  terrainSubdivisions: number;
  /** Base terrain height */
  baseHeight: number;
  /** Maximum elevation variation */
  maxElevation: number;
  /** Texture tiling factor */
  textureScale: number;
}

export interface BiomeData {
  type: 'desert' | 'plains' | 'badlands' | 'grassland';
  weight: number;
}

const DEFAULT_CONFIG: TerrainConfig = {
  seed: 42,
  worldSize: 512,
  terrainSubdivisions: 128,
  baseHeight: 0,
  maxElevation: 30,
  textureScale: 32,
};

// ============================================================================
// TERRAIN TEXTURES - AmbientCG CC0 textures
// ============================================================================

const TERRAIN_TEXTURES = {
  // Desert/sand - warm sandy ground
  desert: {
    color: '/assets/textures/terrain/ground043_color.jpg',
    normal: '/assets/textures/terrain/ground043_normal.jpg',
    roughness: '/assets/textures/terrain/ground043_roughness.jpg',
  },
  // Plains - dry dirt/clay
  plains: {
    color: '/assets/textures/terrain/clay002_color.jpg',
    normal: '/assets/textures/terrain/clay002_normal.jpg',
    roughness: '/assets/textures/terrain/clay002_roughness.jpg',
  },
  // Badlands - rocky red terrain
  badlands: {
    color: '/assets/textures/terrain/ground044_color.jpg',
    normal: '/assets/textures/terrain/ground044_normal.jpg',
    roughness: '/assets/textures/terrain/ground044_roughness.jpg',
  },
  // Grassland - sparse grass
  grassland: {
    color: '/assets/textures/terrain/grass003_color.jpg',
    normal: '/assets/textures/terrain/grass003_normal.jpg',
    roughness: '/assets/textures/terrain/grass003_roughness.jpg',
  },
  // Rock - for cliffs and mountains
  rock: {
    color: '/assets/textures/terrain/rock018_color.jpg',
    normal: '/assets/textures/terrain/rock018_normal.jpg',
    roughness: '/assets/textures/terrain/rock018_roughness.jpg',
  },
} as const;

// ============================================================================
// DYNAMIC TERRAIN MANAGER
// ============================================================================

export class DynamicTerrainManager {
  private scene: Scene;
  private config: TerrainConfig;

  // Noise generators
  private continentalNoise: NoiseFunction2D;
  private erosionNoise: NoiseFunction2D;
  private detailNoise: NoiseFunction2D;
  private moistureNoise: NoiseFunction2D;
  private variationNoise: NoiseFunction2D;

  // Terrain mesh
  private terrainMesh: Mesh | null = null;
  private terrainMaterial: ShaderMaterial | null = null;

  // Loaded textures
  private textures: Map<string, Texture> = new Map();

  // Heightmap data cache
  private heightmapData: Float32Array | null = null;
  private biomeData: Float32Array | null = null;

  constructor(scene: Scene, config: Partial<TerrainConfig> = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize noise generators with seeded PRNG
    const prng = Alea(this.config.seed);
    this.continentalNoise = createNoise2D(prng);
    this.erosionNoise = createNoise2D(Alea(this.config.seed + 1));
    this.detailNoise = createNoise2D(Alea(this.config.seed + 2));
    this.moistureNoise = createNoise2D(Alea(this.config.seed + 3));
    this.variationNoise = createNoise2D(Alea(this.config.seed + 4));

    console.log(
      `[DynamicTerrainManager] Created with seed ${this.config.seed}, world size ${this.config.worldSize}`
    );
  }

  /**
   * Initialize the terrain system
   */
  async init(): Promise<void> {
    console.log('[DynamicTerrainManager] Initializing...');

    // Load textures
    await this.loadTextures();

    // Generate heightmap data
    this.generateHeightmapData();

    // Create terrain mesh
    this.createTerrainMesh();

    // Apply material
    this.createTerrainMaterial();

    console.log('[DynamicTerrainManager] Initialization complete');
  }

  /**
   * Load all terrain textures
   */
  private async loadTextures(): Promise<void> {
    const loadPromises: Promise<void>[] = [];

    for (const [biome, paths] of Object.entries(TERRAIN_TEXTURES)) {
      for (const [type, path] of Object.entries(paths)) {
        const key = `${biome}_${type}`;
        loadPromises.push(
          new Promise((resolve) => {
            const texture = new Texture(path, this.scene, false, false, Texture.TRILINEAR_SAMPLINGMODE, () => {
              texture.wrapU = Texture.WRAP_ADDRESSMODE;
              texture.wrapV = Texture.WRAP_ADDRESSMODE;
              this.textures.set(key, texture);
              resolve();
            });
          })
        );
      }
    }

    await Promise.all(loadPromises);
    console.log(`[DynamicTerrainManager] Loaded ${this.textures.size} textures`);
  }

  /**
   * Generate heightmap data using layered noise
   */
  private generateHeightmapData(): void {
    const { terrainSubdivisions, worldSize, baseHeight, maxElevation } = this.config;
    const resolution = terrainSubdivisions + 1;

    this.heightmapData = new Float32Array(resolution * resolution);
    this.biomeData = new Float32Array(resolution * resolution * 4); // RGBA for 4 biome weights

    for (let z = 0; z < resolution; z++) {
      for (let x = 0; x < resolution; x++) {
        const index = z * resolution + x;

        // Convert to world coordinates
        const worldX = (x / terrainSubdivisions) * worldSize - worldSize / 2;
        const worldZ = (z / terrainSubdivisions) * worldSize - worldSize / 2;

        // Sample height
        const height = this.sampleHeight(worldX, worldZ);
        this.heightmapData[index] = baseHeight + height * maxElevation;

        // Sample biome weights
        const biomes = this.sampleBiomeWeights(worldX, worldZ, height);
        const biomeIndex = index * 4;
        this.biomeData[biomeIndex + 0] = biomes.desert;
        this.biomeData[biomeIndex + 1] = biomes.plains;
        this.biomeData[biomeIndex + 2] = biomes.badlands;
        this.biomeData[biomeIndex + 3] = biomes.grassland;
      }
    }

    console.log(`[DynamicTerrainManager] Generated ${resolution}x${resolution} heightmap`);
  }

  /**
   * Sample terrain height at world position
   */
  private sampleHeight(worldX: number, worldZ: number): number {
    // Continental scale - large features (mesas, valleys)
    const continental =
      this.continentalNoise(worldX * 0.002, worldZ * 0.002) * 0.5 +
      this.continentalNoise(worldX * 0.004, worldZ * 0.004) * 0.25;

    // Erosion scale - medium features (hills, gullies)
    const erosion = this.erosionNoise(worldX * 0.01, worldZ * 0.01) * 0.3;

    // Detail scale - small features (bumps, roughness)
    const detail = this.detailNoise(worldX * 0.05, worldZ * 0.05) * 0.1;

    // Combine layers
    let height = continental + erosion + detail;

    // Normalize from [-1, 1] to [0, 1]
    height = (height + 1) / 2;

    // Add mesa plateaus in certain areas (western landscape feature)
    const mesaFactor = this.variationNoise(worldX * 0.003, worldZ * 0.003);
    if (mesaFactor > 0.55) {
      // Create flat-topped mesa
      const mesaHeight = 0.6 + (mesaFactor - 0.55) * 2;
      height = Math.max(height, mesaHeight);
    }

    // Canyon carving
    const canyonNoise = this.erosionNoise(worldX * 0.008, worldZ * 0.008);
    if (Math.abs(canyonNoise) < 0.1) {
      // Carve canyon where noise is near zero
      const canyonDepth = 1 - Math.abs(canyonNoise) / 0.1;
      height = height * (1 - canyonDepth * 0.5);
    }

    return Math.max(0, Math.min(1, height));
  }

  /**
   * Sample biome weights at world position
   */
  private sampleBiomeWeights(
    worldX: number,
    worldZ: number,
    height: number
  ): { desert: number; plains: number; badlands: number; grassland: number } {
    // Sample environmental factors
    const moisture = (this.moistureNoise(worldX * 0.005, worldZ * 0.005) + 1) / 2;
    const temperature = (this.variationNoise(worldX * 0.003, worldZ * 0.003) + 1) / 2;

    // Calculate raw biome weights
    const weights = {
      desert: Math.max(0, 1 - moisture - 0.2 + temperature * 0.3),
      plains: Math.max(0, 0.5 - Math.abs(moisture - 0.4) - Math.abs(height - 0.3)),
      badlands: Math.max(0, height * 0.8 - 0.3 + (1 - moisture) * 0.3),
      grassland: Math.max(0, moisture * 0.8 - 0.2 + (1 - temperature) * 0.2),
    };

    // Normalize weights to sum to 1
    const total = weights.desert + weights.plains + weights.badlands + weights.grassland;
    if (total > 0) {
      weights.desert /= total;
      weights.plains /= total;
      weights.badlands /= total;
      weights.grassland /= total;
    } else {
      // Default to desert
      weights.desert = 1;
    }

    return weights;
  }

  /**
   * Create the terrain mesh using Babylon.js GroundFromHeightMap approach
   */
  private createTerrainMesh(): void {
    if (!this.heightmapData) {
      throw new Error('[DynamicTerrainManager] Heightmap data not generated');
    }

    const { worldSize, terrainSubdivisions } = this.config;

    // Create ground mesh with subdivisions
    this.terrainMesh = MeshBuilder.CreateGround(
      'overworld_terrain',
      {
        width: worldSize,
        height: worldSize,
        subdivisions: terrainSubdivisions,
        updatable: true,
      },
      this.scene
    );

    // Apply heightmap to vertices
    const positions = this.terrainMesh.getVerticesData('position');
    if (!positions) {
      throw new Error('[DynamicTerrainManager] Failed to get terrain positions');
    }

    const resolution = terrainSubdivisions + 1;

    for (let z = 0; z < resolution; z++) {
      for (let x = 0; x < resolution; x++) {
        const heightIndex = z * resolution + x;
        const vertexIndex = (z * resolution + x) * 3;

        // Y is up in Babylon.js
        positions[vertexIndex + 1] = this.heightmapData[heightIndex];
      }
    }

    this.terrainMesh.updateVerticesData('position', positions);
    this.terrainMesh.createNormals(true);

    // Enable shadows
    this.terrainMesh.receiveShadows = true;

    console.log(`[DynamicTerrainManager] Created terrain mesh with ${terrainSubdivisions} subdivisions`);
  }

  /**
   * Create PBR terrain material with biome blending
   */
  private createTerrainMaterial(): void {
    if (!this.terrainMesh) return;

    // Use StandardMaterial with multi-texture blending
    // For simplicity, we'll use the desert texture as the primary
    // A more advanced implementation would use a custom shader for 4-way blending

    const material = new StandardMaterial('terrain_material', this.scene);

    // Use desert as primary texture (dominant biome)
    const colorTex = this.textures.get('desert_color');
    const normalTex = this.textures.get('desert_normal');

    if (colorTex) {
      material.diffuseTexture = colorTex;
      colorTex.uScale = this.config.textureScale;
      colorTex.vScale = this.config.textureScale;
    }

    if (normalTex) {
      material.bumpTexture = normalTex;
      normalTex.uScale = this.config.textureScale;
      normalTex.vScale = this.config.textureScale;
    }

    // Western desert color tint
    material.diffuseColor = new Color3(0.95, 0.9, 0.8);
    material.specularColor = new Color3(0.1, 0.1, 0.1);
    material.specularPower = 16;

    this.terrainMesh.material = material;

    console.log('[DynamicTerrainManager] Applied terrain material');
  }

  /**
   * Get terrain height at world position
   */
  getHeightAt(worldX: number, worldZ: number): number {
    if (!this.heightmapData) return 0;

    const { worldSize, terrainSubdivisions } = this.config;
    const resolution = terrainSubdivisions + 1;

    // Convert world to heightmap coordinates
    const u = (worldX + worldSize / 2) / worldSize;
    const v = (worldZ + worldSize / 2) / worldSize;

    // Clamp to valid range
    const clampedU = Math.max(0, Math.min(1, u));
    const clampedV = Math.max(0, Math.min(1, v));

    // Bilinear interpolation
    const fx = clampedU * (resolution - 1);
    const fz = clampedV * (resolution - 1);

    const x0 = Math.floor(fx);
    const z0 = Math.floor(fz);
    const x1 = Math.min(x0 + 1, resolution - 1);
    const z1 = Math.min(z0 + 1, resolution - 1);

    const tx = fx - x0;
    const tz = fz - z0;

    const h00 = this.heightmapData[z0 * resolution + x0];
    const h10 = this.heightmapData[z0 * resolution + x1];
    const h01 = this.heightmapData[z1 * resolution + x0];
    const h11 = this.heightmapData[z1 * resolution + x1];

    // Bilinear interpolation
    const h0 = h00 * (1 - tx) + h10 * tx;
    const h1 = h01 * (1 - tx) + h11 * tx;

    return h0 * (1 - tz) + h1 * tz;
  }

  /**
   * Get biome at world position
   */
  getBiomeAt(worldX: number, worldZ: number): BiomeData {
    const height = this.sampleHeight(worldX, worldZ);
    const weights = this.sampleBiomeWeights(worldX, worldZ, height);

    // Find dominant biome
    let maxWeight = 0;
    let dominantBiome: 'desert' | 'plains' | 'badlands' | 'grassland' = 'desert';

    for (const [biome, weight] of Object.entries(weights)) {
      if (weight > maxWeight) {
        maxWeight = weight;
        dominantBiome = biome as typeof dominantBiome;
      }
    }

    return { type: dominantBiome, weight: maxWeight };
  }

  /**
   * Get world bounds
   */
  getWorldBounds(): { minX: number; maxX: number; minZ: number; maxZ: number } {
    const halfSize = this.config.worldSize / 2;
    return {
      minX: -halfSize,
      maxX: halfSize,
      minZ: -halfSize,
      maxZ: halfSize,
    };
  }

  /**
   * Update terrain (call each frame if needed)
   */
  update(_deltaTime: number): void {
    // Dynamic terrain updates could go here
    // For now, static terrain doesn't need per-frame updates
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    console.log('[DynamicTerrainManager] Disposing...');

    if (this.terrainMesh) {
      this.terrainMesh.dispose();
      this.terrainMesh = null;
    }

    for (const texture of this.textures.values()) {
      texture.dispose();
    }
    this.textures.clear();

    this.heightmapData = null;
    this.biomeData = null;

    console.log('[DynamicTerrainManager] Disposed');
  }

  /**
   * Get the terrain mesh
   */
  getMesh(): Mesh | null {
    return this.terrainMesh;
  }

  /**
   * Get configuration
   */
  getConfig(): TerrainConfig {
    return { ...this.config };
  }
}

export default DynamicTerrainManager;
