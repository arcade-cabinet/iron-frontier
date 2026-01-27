// Terrain Chunk - Babylon.js mesh for a single terrain chunk
import { Color3, Mesh, type Scene, StandardMaterial, Texture, VertexData } from '@babylonjs/core';
import { TerrainTextures } from '@iron-frontier/assets';
import { BIOME_CONFIGS, type BiomeType, CHUNK_SIZE, type ChunkCoord, chunkKey } from '../types';
import type { HeightmapGenerator, HeightmapResult } from './HeightmapGenerator';

const HEIGHTMAP_RESOLUTION = 65;

export class TerrainChunk {
  public readonly coord: ChunkCoord;
  public readonly mesh: Mesh;
  public readonly material: StandardMaterial;

  private heightmap: HeightmapResult;
  private disposed = false;

  constructor(scene: Scene, coord: ChunkCoord, generator: HeightmapGenerator) {
    this.coord = coord;

    // Generate heightmap data
    this.heightmap = generator.generate(coord);

    // Create mesh
    this.mesh = this.createMesh(scene);
    this.mesh.name = `terrain_${chunkKey(coord)}`;

    // Create material with biome blending
    this.material = this.createMaterial(scene);
    this.mesh.material = this.material;

    // Position in world
    this.mesh.position.x = coord.cx * CHUNK_SIZE;
    this.mesh.position.z = coord.cz * CHUNK_SIZE;

    // Enable shadows
    this.mesh.receiveShadows = true;
  }

  private createMesh(scene: Scene): Mesh {
    const mesh = new Mesh(`terrain_chunk`, scene);

    const resolution = HEIGHTMAP_RESOLUTION;
    const vertexCount = resolution * resolution;
    const indexCount = (resolution - 1) * (resolution - 1) * 6;

    // Create vertex data
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices = new Uint32Array(indexCount);

    const cellSize = CHUNK_SIZE / (resolution - 1);

    // Fill positions and UVs
    for (let z = 0; z < resolution; z++) {
      for (let x = 0; x < resolution; x++) {
        const idx = z * resolution + x;
        const height = this.heightmap.heights[idx];

        positions[idx * 3 + 0] = x * cellSize;
        positions[idx * 3 + 1] = height;
        positions[idx * 3 + 2] = z * cellSize;

        uvs[idx * 2 + 0] = x / (resolution - 1);
        uvs[idx * 2 + 1] = z / (resolution - 1);
      }
    }

    // Calculate normals
    for (let z = 0; z < resolution; z++) {
      for (let x = 0; x < resolution; x++) {
        const idx = z * resolution + x;

        // Sample neighboring heights for normal calculation
        const hL =
          x > 0 ? this.heightmap.heights[z * resolution + (x - 1)] : this.heightmap.heights[idx];
        const hR =
          x < resolution - 1
            ? this.heightmap.heights[z * resolution + (x + 1)]
            : this.heightmap.heights[idx];
        const hD =
          z > 0 ? this.heightmap.heights[(z - 1) * resolution + x] : this.heightmap.heights[idx];
        const hU =
          z < resolution - 1
            ? this.heightmap.heights[(z + 1) * resolution + x]
            : this.heightmap.heights[idx];

        // Calculate normal from height differences
        const nx = hL - hR;
        const nz = hD - hU;
        const ny = 2 * cellSize;

        // Normalize
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        normals[idx * 3 + 0] = nx / len;
        normals[idx * 3 + 1] = ny / len;
        normals[idx * 3 + 2] = nz / len;
      }
    }

    // Fill indices (two triangles per quad)
    let indexIdx = 0;
    for (let z = 0; z < resolution - 1; z++) {
      for (let x = 0; x < resolution - 1; x++) {
        const topLeft = z * resolution + x;
        const topRight = topLeft + 1;
        const bottomLeft = (z + 1) * resolution + x;
        const bottomRight = bottomLeft + 1;

        // Triangle 1
        indices[indexIdx++] = topLeft;
        indices[indexIdx++] = bottomLeft;
        indices[indexIdx++] = topRight;

        // Triangle 2
        indices[indexIdx++] = topRight;
        indices[indexIdx++] = bottomLeft;
        indices[indexIdx++] = bottomRight;
      }
    }

    // Apply vertex data
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.normals = normals;
    vertexData.uvs = uvs;
    vertexData.indices = indices;
    vertexData.applyToMesh(mesh);

    return mesh;
  }

  private createMaterial(scene: Scene): StandardMaterial {
    const mat = new StandardMaterial(`terrain_mat_${chunkKey(this.coord)}`, scene);

    // Determine dominant biome for this chunk to select texture
    const dominantBiome = this.getDominantBiome();

    // Map biome to AmbientCG texture set
    const textureSet = this.getTextureForBiome(dominantBiome);

    // Load PBR textures from AmbientCG
    const diffuseTexture = new Texture(textureSet.color, scene);
    diffuseTexture.uScale = 8; // Tile texture across chunk
    diffuseTexture.vScale = 8;

    mat.diffuseTexture = diffuseTexture;

    // Load normal map for surface detail
    const bumpTexture = new Texture(textureSet.normal, scene);
    bumpTexture.uScale = 8;
    bumpTexture.vScale = 8;
    mat.bumpTexture = bumpTexture;
    mat.invertNormalMapX = true;
    mat.invertNormalMapY = true;

    // Add subtle biome color tint for variation
    const biomeConfig = BIOME_CONFIGS[dominantBiome];
    mat.diffuseColor = new Color3(
      0.8 + biomeConfig.groundColor.r * 0.2,
      0.8 + biomeConfig.groundColor.g * 0.2,
      0.8 + biomeConfig.groundColor.b * 0.2
    );

    mat.specularColor = new Color3(0.1, 0.08, 0.06); // Subtle warm specular
    mat.specularPower = 32;
    mat.backFaceCulling = true;

    return mat;
  }

  /**
   * Determine the dominant biome in this chunk based on average weights
   */
  private getDominantBiome(): BiomeType {
    const resolution = HEIGHTMAP_RESOLUTION;
    const totals: Record<BiomeType, number> = {
      desert: 0,
      grassland: 0,
      badlands: 0,
      riverside: 0,
      town: 0,
      railyard: 0,
      mine: 0,
    };

    // Sum weights across all vertices
    for (const [biomeType, weights] of this.heightmap.biomeWeights) {
      for (let i = 0; i < weights.length; i++) {
        totals[biomeType] += weights[i];
      }
    }

    // Find dominant
    let dominant: BiomeType = 'desert';
    let maxWeight = 0;
    for (const [biome, total] of Object.entries(totals)) {
      if (total > maxWeight) {
        maxWeight = total;
        dominant = biome as BiomeType;
      }
    }

    return dominant;
  }

  /**
   * Map biome type to AmbientCG texture set
   */
  private getTextureForBiome(biome: BiomeType): {
    color: string;
    normal: string;
    roughness: string;
  } {
    switch (biome) {
      case 'desert':
        return TerrainTextures.DESERT;
      case 'grassland':
        return TerrainTextures.GRASSLAND;
      case 'badlands':
        return TerrainTextures.BADLANDS;
      case 'riverside':
        return TerrainTextures.RIVERSIDE;
      case 'mine':
        return TerrainTextures.ROCK;
      case 'town':
      case 'railyard':
      default:
        return TerrainTextures.DESERT; // Default fallback
    }
  }

  getHeightAt(localX: number, localZ: number): number {
    // localX, localZ are 0 to CHUNK_SIZE
    const resolution = HEIGHTMAP_RESOLUTION;
    const cellSize = CHUNK_SIZE / (resolution - 1);

    // Find grid cell
    const gx = localX / cellSize;
    const gz = localZ / cellSize;

    const x0 = Math.floor(gx);
    const z0 = Math.floor(gz);
    const x1 = Math.min(x0 + 1, resolution - 1);
    const z1 = Math.min(z0 + 1, resolution - 1);

    // Bilinear interpolation
    const fx = gx - x0;
    const fz = gz - z0;

    const h00 = this.heightmap.heights[z0 * resolution + x0];
    const h10 = this.heightmap.heights[z0 * resolution + x1];
    const h01 = this.heightmap.heights[z1 * resolution + x0];
    const h11 = this.heightmap.heights[z1 * resolution + x1];

    const h0 = h00 * (1 - fx) + h10 * fx;
    const h1 = h01 * (1 - fx) + h11 * fx;

    return h0 * (1 - fz) + h1 * fz;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    // Dispose material with textures (forceDisposeTextures=true)
    this.material.dispose(true);
    this.mesh.dispose();
  }
}
