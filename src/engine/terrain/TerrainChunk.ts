// Terrain Chunk - Babylon.js mesh for a single terrain chunk
import { 
  Scene,
  Mesh,
  VertexData,
  StandardMaterial,
  Color3,
  Vector3,
  DynamicTexture,
} from '@babylonjs/core';
import { 
  CHUNK_SIZE, 
  ChunkCoord, 
  BiomeType, 
  BIOME_CONFIGS,
  chunkKey 
} from '../types';
import { HeightmapGenerator, HeightmapResult } from './HeightmapGenerator';

const HEIGHTMAP_RESOLUTION = 65;

export class TerrainChunk {
  public readonly coord: ChunkCoord;
  public readonly mesh: Mesh;
  public readonly material: StandardMaterial;
  
  private heightmap: HeightmapResult;
  private disposed = false;

  constructor(
    scene: Scene,
    coord: ChunkCoord,
    generator: HeightmapGenerator
  ) {
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
        const hL = x > 0 ? this.heightmap.heights[z * resolution + (x - 1)] : this.heightmap.heights[idx];
        const hR = x < resolution - 1 ? this.heightmap.heights[z * resolution + (x + 1)] : this.heightmap.heights[idx];
        const hD = z > 0 ? this.heightmap.heights[(z - 1) * resolution + x] : this.heightmap.heights[idx];
        const hU = z < resolution - 1 ? this.heightmap.heights[(z + 1) * resolution + x] : this.heightmap.heights[idx];
        
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
    
    // Create a blended color texture based on biome weights
    const textureSize = 256;
    const texture = new DynamicTexture(
      `terrain_tex_${chunkKey(this.coord)}`,
      textureSize,
      scene,
      false
    );
    
    const ctx = texture.getContext() as CanvasRenderingContext2D;
    const imageData = ctx.createImageData(textureSize, textureSize);
    
    const resolution = HEIGHTMAP_RESOLUTION;
    
    for (let y = 0; y < textureSize; y++) {
      for (let x = 0; x < textureSize; x++) {
        // Map texture coords to heightmap coords
        const hx = Math.floor((x / textureSize) * (resolution - 1));
        const hz = Math.floor((y / textureSize) * (resolution - 1));
        const hidx = hz * resolution + hx;
        
        // Blend biome colors based on weights
        let r = 0, g = 0, b = 0;
        
        for (const [biomeType, weights] of this.heightmap.biomeWeights) {
          const weight = weights[hidx];
          if (weight > 0.01) {
            const config = BIOME_CONFIGS[biomeType];
            r += config.groundColor.r * weight;
            g += config.groundColor.g * weight;
            b += config.groundColor.b * weight;
          }
        }
        
        // Add some noise for texture variation
        const noise = (Math.random() - 0.5) * 0.1;
        r = Math.max(0, Math.min(1, r + noise));
        g = Math.max(0, Math.min(1, g + noise));
        b = Math.max(0, Math.min(1, b + noise));
        
        const pixelIdx = (y * textureSize + x) * 4;
        imageData.data[pixelIdx + 0] = Math.floor(r * 255);
        imageData.data[pixelIdx + 1] = Math.floor(g * 255);
        imageData.data[pixelIdx + 2] = Math.floor(b * 255);
        imageData.data[pixelIdx + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    texture.update();
    
    mat.diffuseTexture = texture;
    mat.specularColor = new Color3(0.1, 0.1, 0.1);
    
    return mat;
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
    
    this.material.dispose();
    this.mesh.dispose();
  }
}
