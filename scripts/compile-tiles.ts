#!/usr/bin/env npx tsx
/**
 * compile-tiles.ts - Precompile isometric tiles from PBR textures to GLTF
 *
 * Generates optimized GLTF/GLB files with embedded textures for each terrain type.
 * This eliminates runtime texture loading issues and enables Draco compression.
 *
 * Usage:
 *   pnpm compile:tiles
 *   npx tsx scripts/compile-tiles.ts
 *
 * Output: apps/web/public/assets/tiles/*.glb
 */

import { Document, NodeIO, Primitive, Accessor } from '@gltf-transform/core';
import { dedup, draco, textureCompress } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TEXTURE_DIR = join(ROOT, 'apps/web/public/assets/textures/terrain');
const OUTPUT_DIR = join(ROOT, 'apps/web/public/assets/tiles/isometric');

// ============================================================================
// TERRAIN CONFIGURATIONS
// ============================================================================

interface TerrainConfig {
  id: string;
  name: string;
  diffuse: string;
  normal?: string;
  roughness?: string;
  uvScale: number;
  roughnessValue: number;
  tintColor?: [number, number, number]; // RGB 0-1
}

const TERRAIN_CONFIGS: TerrainConfig[] = [
  {
    id: 'grass',
    name: 'Western Grass',
    diffuse: 'grass003_color.jpg',
    normal: 'grass003_normal.jpg',
    roughness: 'grass003_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.8,
    tintColor: [0.75, 0.7, 0.45],
  },
  {
    id: 'grass_dry',
    name: 'Dry Grass',
    diffuse: 'grass003_color.jpg',
    normal: 'grass003_normal.jpg',
    roughness: 'grass003_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.9,
    tintColor: [0.8, 0.7, 0.4],
  },
  {
    id: 'sand',
    name: 'Desert Sand',
    diffuse: 'ground044_color.jpg',
    normal: 'ground044_normal.jpg',
    roughness: 'ground044_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.9,
    tintColor: [0.95, 0.85, 0.7],
  },
  {
    id: 'sand_dunes',
    name: 'Sand Dunes',
    diffuse: 'ground044_color.jpg',
    normal: 'ground044_normal.jpg',
    roughness: 'ground044_roughness.jpg',
    uvScale: 3,
    roughnessValue: 0.85,
    tintColor: [0.9, 0.8, 0.6],
  },
  {
    id: 'dirt',
    name: 'Packed Dirt',
    diffuse: 'ground043_color.jpg',
    normal: 'ground043_normal.jpg',
    roughness: 'ground043_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.85,
    tintColor: [0.75, 0.55, 0.35],
  },
  {
    id: 'dirt_path',
    name: 'Dirt Path',
    diffuse: 'ground043_color.jpg',
    normal: 'ground043_normal.jpg',
    roughness: 'ground043_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.75,
    tintColor: [0.65, 0.5, 0.3],
  },
  {
    id: 'stone',
    name: 'Rocky Ground',
    diffuse: 'rock018_color.jpg',
    normal: 'rock018_normal.jpg',
    roughness: 'rock018_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.7,
    tintColor: [0.65, 0.6, 0.55],
  },
  {
    id: 'stone_rough',
    name: 'Rough Stone',
    diffuse: 'rock018_color.jpg',
    normal: 'rock018_normal.jpg',
    roughness: 'rock018_roughness.jpg',
    uvScale: 3,
    roughnessValue: 0.8,
    tintColor: [0.55, 0.5, 0.45],
  },
  {
    id: 'mesa',
    name: 'Mesa',
    diffuse: 'clay002_color.jpg',
    normal: 'clay002_normal.jpg',
    roughness: 'clay002_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.9,
    tintColor: [0.85, 0.6, 0.45],
  },
  {
    id: 'badlands',
    name: 'Badlands',
    diffuse: 'ground088_color.jpg',
    normal: 'ground088_normal.jpg',
    roughness: 'ground088_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.9,
    tintColor: [0.7, 0.5, 0.35],
  },
  {
    id: 'clay',
    name: 'Cracked Clay',
    diffuse: 'clay002_color.jpg',
    normal: 'clay002_normal.jpg',
    roughness: 'clay002_roughness.jpg',
    uvScale: 2,
    roughnessValue: 0.95,
    tintColor: [0.8, 0.55, 0.4],
  },
  {
    id: 'water',
    name: 'Water',
    diffuse: 'ground044_color.jpg', // Placeholder
    uvScale: 4,
    roughnessValue: 0.1,
    tintColor: [0.25, 0.45, 0.65],
  },
  {
    id: 'water_shallow',
    name: 'Shallow Water',
    diffuse: 'ground044_color.jpg', // Placeholder
    uvScale: 3,
    roughnessValue: 0.2,
    tintColor: [0.35, 0.55, 0.6],
  },
];

// ============================================================================
// ISOMETRIC TILE GEOMETRY
// ============================================================================

/**
 * Creates diamond-shaped tile geometry (isometric square viewed from above).
 * Returns vertex data for GLTF primitive.
 */
function createIsometricTileGeometry(
  size: number = 0.5,
  thickness: number = 0.02,
  uvScale: number = 1
): {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array;
} {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const halfThickness = thickness / 2;

  // Diamond corners (clockwise from north) - square rotated 45°
  const corners = [
    { x: 0, z: -size }, // North (top of diamond)
    { x: size, z: 0 }, // East (right of diamond)
    { x: 0, z: size }, // South (bottom of diamond)
    { x: -size, z: 0 }, // West (left of diamond)
  ];

  // UV coordinates map texture to diamond with scaling
  const cornerUVs = [
    { u: 0.5 * uvScale, v: 0.0 }, // North
    { u: 1.0 * uvScale, v: 0.5 * uvScale }, // East
    { u: 0.5 * uvScale, v: 1.0 * uvScale }, // South
    { u: 0.0, v: 0.5 * uvScale }, // West
  ];

  // === TOP FACE ===
  const topY = halfThickness;
  for (let i = 0; i < 4; i++) {
    positions.push(corners[i].x, topY, corners[i].z);
    normals.push(0, 1, 0);
    uvs.push(cornerUVs[i].u, cornerUVs[i].v);
  }
  indices.push(0, 1, 2, 0, 2, 3);

  // === BOTTOM FACE ===
  const bottomY = -halfThickness;
  const bottomOffset = 4;
  for (let i = 0; i < 4; i++) {
    positions.push(corners[i].x, bottomY, corners[i].z);
    normals.push(0, -1, 0);
    uvs.push(cornerUVs[i].u, cornerUVs[i].v);
  }
  indices.push(bottomOffset + 0, bottomOffset + 2, bottomOffset + 1);
  indices.push(bottomOffset + 0, bottomOffset + 3, bottomOffset + 2);

  // === SIDE FACES ===
  for (let i = 0; i < 4; i++) {
    const next = (i + 1) % 4;
    const sideOffset = 8 + i * 4;

    positions.push(
      corners[i].x, topY, corners[i].z,
      corners[next].x, topY, corners[next].z,
      corners[next].x, bottomY, corners[next].z,
      corners[i].x, bottomY, corners[i].z
    );

    // Outward normal
    const edgeX = corners[next].x - corners[i].x;
    const edgeZ = corners[next].z - corners[i].z;
    const normalX = edgeZ;
    const normalZ = -edgeX;
    const len = Math.sqrt(normalX * normalX + normalZ * normalZ);

    for (let j = 0; j < 4; j++) {
      normals.push(normalX / len, 0, normalZ / len);
      uvs.push((j % 2) * uvScale, j < 2 ? 0 : uvScale);
    }

    indices.push(sideOffset, sideOffset + 1, sideOffset + 2);
    indices.push(sideOffset, sideOffset + 2, sideOffset + 3);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  };
}

// ============================================================================
// TEXTURE PROCESSING
// ============================================================================

/**
 * Applies a tint color to a diffuse texture and returns the modified buffer.
 */
async function applyTintToTexture(
  texturePath: string,
  tint: [number, number, number]
): Promise<Buffer> {
  const image = sharp(texturePath);
  const { width, height } = await image.metadata();

  // Apply tint by multiplying with a solid color overlay
  const tintBuffer = Buffer.alloc(width! * height! * 4);
  const [r, g, b] = tint;

  // Read raw pixels
  const rawBuffer = await image
    .ensureAlpha()
    .raw()
    .toBuffer();

  // Apply tint to each pixel
  for (let i = 0; i < rawBuffer.length; i += 4) {
    tintBuffer[i] = Math.min(255, Math.round(rawBuffer[i] * r));
    tintBuffer[i + 1] = Math.min(255, Math.round(rawBuffer[i + 1] * g));
    tintBuffer[i + 2] = Math.min(255, Math.round(rawBuffer[i + 2] * b));
    tintBuffer[i + 3] = rawBuffer[i + 3];
  }

  // Convert back to JPEG
  return sharp(tintBuffer, {
    raw: { width: width!, height: height!, channels: 4 },
  })
    .jpeg({ quality: 90 })
    .toBuffer();
}

// ============================================================================
// GLTF GENERATION
// ============================================================================

/**
 * Creates a GLTF document for a single terrain tile.
 */
async function createTileGLTF(config: TerrainConfig): Promise<Document> {
  const doc = new Document();

  // Create buffer
  const buffer = doc.createBuffer();

  // Create geometry
  const geometry = createIsometricTileGeometry(0.5, 0.02, config.uvScale);

  // Create accessors
  const positionAccessor = doc
    .createAccessor()
    .setType(Accessor.Type.VEC3)
    .setArray(geometry.positions)
    .setBuffer(buffer);

  const normalAccessor = doc
    .createAccessor()
    .setType(Accessor.Type.VEC3)
    .setArray(geometry.normals)
    .setBuffer(buffer);

  const uvAccessor = doc
    .createAccessor()
    .setType(Accessor.Type.VEC2)
    .setArray(geometry.uvs)
    .setBuffer(buffer);

  const indexAccessor = doc
    .createAccessor()
    .setType(Accessor.Type.SCALAR)
    .setArray(geometry.indices)
    .setBuffer(buffer);

  // Create primitive
  const primitive = doc
    .createPrimitive()
    .setMode(Primitive.Mode.TRIANGLES)
    .setIndices(indexAccessor)
    .setAttribute('POSITION', positionAccessor)
    .setAttribute('NORMAL', normalAccessor)
    .setAttribute('TEXCOORD_0', uvAccessor);

  // Create mesh
  const mesh = doc.createMesh(config.name).addPrimitive(primitive);

  // Create node
  const node = doc.createNode(config.id).setMesh(mesh);

  // Create scene
  const scene = doc.createScene(config.name).addChild(node);
  doc.getRoot().setDefaultScene(scene);

  // Create material with PBR
  const material = doc
    .createMaterial(config.name)
    .setRoughnessFactor(config.roughnessValue)
    .setMetallicFactor(0);

  // Load and embed textures
  const diffusePath = join(TEXTURE_DIR, config.diffuse);
  if (existsSync(diffusePath)) {
    let diffuseBuffer: Buffer;

    if (config.tintColor) {
      diffuseBuffer = await applyTintToTexture(diffusePath, config.tintColor);
    } else {
      diffuseBuffer = readFileSync(diffusePath);
    }

    const diffuseTexture = doc
      .createTexture(config.id + '_diffuse')
      .setMimeType('image/jpeg')
      .setImage(new Uint8Array(diffuseBuffer));

    material.setBaseColorTexture(diffuseTexture);
  }

  if (config.normal) {
    const normalPath = join(TEXTURE_DIR, config.normal);
    if (existsSync(normalPath)) {
      const normalBuffer = readFileSync(normalPath);
      const normalTexture = doc
        .createTexture(config.id + '_normal')
        .setMimeType('image/jpeg')
        .setImage(new Uint8Array(normalBuffer));

      material.setNormalTexture(normalTexture);
    }
  }

  if (config.roughness) {
    const roughnessPath = join(TEXTURE_DIR, config.roughness);
    if (existsSync(roughnessPath)) {
      const roughnessBuffer = readFileSync(roughnessPath);
      // GLTF uses metallic-roughness texture (R=unused, G=roughness, B=unused)
      // We need to pack roughness into the green channel
      const roughnessTexture = doc
        .createTexture(config.id + '_roughness')
        .setMimeType('image/jpeg')
        .setImage(new Uint8Array(roughnessBuffer));

      material.setMetallicRoughnessTexture(roughnessTexture);
    }
  }

  primitive.setMaterial(material);

  return doc;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🏗️  Isometric Tile Compiler');
  console.log('==========================\n');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Initialize IO with Draco
  const io = new NodeIO()
    .registerExtensions([])
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });

  const results: { id: string; success: boolean; error?: string }[] = [];

  for (const config of TERRAIN_CONFIGS) {
    const outputPath = join(OUTPUT_DIR, `${config.id}.glb`);
    console.log(`📦 Compiling: ${config.name} (${config.id})`);

    try {
      const doc = await createTileGLTF(config);

      // Optimize
      await doc.transform(
        dedup(),
        draco(),
      );

      // Write GLB
      await io.write(outputPath, doc);

      const stats = readFileSync(outputPath);
      console.log(`   ✅ ${outputPath} (${(stats.length / 1024).toFixed(1)} KB)\n`);
      results.push({ id: config.id, success: true });
    } catch (error) {
      console.error(`   ❌ Failed: ${error}\n`);
      results.push({
        id: config.id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Summary
  console.log('\n📊 Summary');
  console.log('==========');
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed tiles:');
    results
      .filter((r) => !r.success)
      .forEach((r) => console.log(`  - ${r.id}: ${r.error}`));
    process.exit(1);
  }

  console.log(`\n🎉 All tiles compiled to: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
