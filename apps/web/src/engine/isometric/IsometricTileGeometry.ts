/**
 * IsometricTileGeometry.ts - Diamond tile mesh generation
 *
 * Creates the geometry for isometric tiles with proper UV mapping
 * for PBR textures. Tiles are diamond-shaped (squares rotated 45°).
 */

import { Mesh, type Scene, VertexData } from '@babylonjs/core';

/**
 * Creates geometry for a single isometric tile (diamond on XZ plane).
 *
 * The tile is a square rotated 45 degrees, viewed from above.
 * UV coordinates map the full texture to the diamond shape.
 *
 * @param size - Distance from center to corner
 * @param thickness - Vertical depth of the tile (for slight 3D effect)
 * @returns VertexData ready to apply to a mesh
 */
export function createIsometricTileGeometry(
  size: number = 0.5,
  thickness: number = 0.02
): VertexData {
  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const halfThickness = thickness / 2;

  // Diamond corners (clockwise from north) - square rotated 45°
  // In world space: North is -Z, East is +X
  const corners = [
    { x: 0, z: -size }, // North (top of diamond)
    { x: size, z: 0 }, // East (right of diamond)
    { x: 0, z: size }, // South (bottom of diamond)
    { x: -size, z: 0 }, // West (left of diamond)
  ];

  // UV coordinates map texture to diamond
  // The texture is a square, we map its corners to the diamond edges
  const cornerUVs = [
    { u: 0.5, v: 0.0 }, // North -> top center of texture
    { u: 1.0, v: 0.5 }, // East -> right center
    { u: 0.5, v: 1.0 }, // South -> bottom center
    { u: 0.0, v: 0.5 }, // West -> left center
  ];

  // === TOP FACE (main visible surface) ===
  const topY = halfThickness;

  for (let i = 0; i < 4; i++) {
    positions.push(corners[i].x, topY, corners[i].z);
    normals.push(0, 1, 0);
    uvs.push(cornerUVs[i].u, cornerUVs[i].v);
  }

  // Two triangles for the top face
  indices.push(0, 1, 2); // N -> E -> S
  indices.push(0, 2, 3); // N -> S -> W

  // === BOTTOM FACE (usually not visible) ===
  const bottomY = -halfThickness;
  const bottomOffset = 4;

  for (let i = 0; i < 4; i++) {
    positions.push(corners[i].x, bottomY, corners[i].z);
    normals.push(0, -1, 0);
    uvs.push(cornerUVs[i].u, cornerUVs[i].v);
  }

  // Reversed winding for bottom face
  indices.push(bottomOffset + 0, bottomOffset + 2, bottomOffset + 1);
  indices.push(bottomOffset + 0, bottomOffset + 3, bottomOffset + 2);

  // === SIDE FACES (4 thin edges for depth) ===
  for (let i = 0; i < 4; i++) {
    const next = (i + 1) % 4;
    const sideOffset = 8 + i * 4;

    // Four vertices per side
    positions.push(
      corners[i].x,
      topY,
      corners[i].z, // Top left
      corners[next].x,
      topY,
      corners[next].z, // Top right
      corners[next].x,
      bottomY,
      corners[next].z, // Bottom right
      corners[i].x,
      bottomY,
      corners[i].z // Bottom left
    );

    // Calculate outward normal for this edge
    const edgeX = corners[next].x - corners[i].x;
    const edgeZ = corners[next].z - corners[i].z;
    const normalX = edgeZ; // Perpendicular to edge
    const normalZ = -edgeX;
    const len = Math.sqrt(normalX * normalX + normalZ * normalZ);

    for (let j = 0; j < 4; j++) {
      normals.push(normalX / len, 0, normalZ / len);
      // Simple UV for side (stretch texture across)
      uvs.push(j % 2, j < 2 ? 0 : 1);
    }

    // Two triangles per side
    indices.push(sideOffset, sideOffset + 1, sideOffset + 2);
    indices.push(sideOffset, sideOffset + 2, sideOffset + 3);
  }

  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;

  return vertexData;
}

/**
 * Creates a simplified tile (top face only) for better performance.
 * Use this for distant tiles or when rendering many tiles.
 */
export function createSimpleTileGeometry(size: number = 0.5): VertexData {
  const corners = [
    { x: 0, z: -size },
    { x: size, z: 0 },
    { x: 0, z: size },
    { x: -size, z: 0 },
  ];

  const positions = corners.flatMap((c) => [c.x, 0, c.z]);
  const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
  const uvs = [0.5, 0, 1, 0.5, 0.5, 1, 0, 0.5];
  const indices = [0, 1, 2, 0, 2, 3];

  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;

  return vertexData;
}

/**
 * Creates a tile mesh template for instancing.
 */
export function createTileMeshTemplate(
  scene: Scene,
  size: number = 0.5,
  name: string = 'isometric_tile_template'
): Mesh {
  const geometry = createIsometricTileGeometry(size);
  const mesh = new Mesh(name, scene);
  geometry.applyToMesh(mesh);

  mesh.isVisible = false;
  mesh.setEnabled(false);

  return mesh;
}

/**
 * Creates a simple tile mesh template (for LOD/performance).
 */
export function createSimpleTileMeshTemplate(
  scene: Scene,
  size: number = 0.5,
  name: string = 'simple_tile_template'
): Mesh {
  const geometry = createSimpleTileGeometry(size);
  const mesh = new Mesh(name, scene);
  geometry.applyToMesh(mesh);

  mesh.isVisible = false;
  mesh.setEnabled(false);

  return mesh;
}
