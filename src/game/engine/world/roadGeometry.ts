// roadGeometry — Road strip geometry builders for routes and internal town roads.

import Alea from 'alea';
import * as THREE from 'three';

import { createDirtTexture } from '@/src/game/engine/materials';

import {
  ROAD_Y_OFFSET,
  ROAD_COLOR,
} from './WorldConfig';

import type { FlattenZone } from './ChunkManager';

/**
 * Build a quadratic bezier road strip between two world positions.
 * Appends flatten zones along the route.
 */
export function buildRoad(
  group: THREE.Group,
  from: [number, number, number],
  to: [number, number, number],
  width: number,
  color: string,
  seed: string,
  flattenZones: FlattenZone[],
): void {
  const rng = Alea(seed + from[0] + to[0]) as unknown as () => number;

  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dz * dz);
  if (length < 1) return;

  // Midpoint with slight random offset for natural curve
  const midX = (from[0] + to[0]) / 2 + (rng() - 0.5) * length * 0.08;
  const midZ = (from[2] + to[2]) / 2 + (rng() - 0.5) * length * 0.08;

  // Build a strip using quadratic bezier segments
  const segments = Math.max(8, Math.floor(length / 10));
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  // Generate flatten zones along the route (every 30 units)
  const flattenInterval = 30;
  const flattenCount = Math.max(2, Math.floor(length / flattenInterval));

  for (let f = 0; f <= flattenCount; f++) {
    const t = f / flattenCount;
    const oneMinusT = 1 - t;
    const fx =
      oneMinusT * oneMinusT * from[0] +
      2 * oneMinusT * t * midX +
      t * t * to[0];
    const fz =
      oneMinusT * oneMinusT * from[2] +
      2 * oneMinusT * t * midZ +
      t * t * to[2];
    flattenZones.push({
      wx: fx,
      wz: fz,
      radius: width * 1.5,
      targetY: ROAD_Y_OFFSET * 0.5,
    });
  }

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const oneMinusT = 1 - t;
    const px =
      oneMinusT * oneMinusT * from[0] +
      2 * oneMinusT * t * midX +
      t * t * to[0];
    const pz =
      oneMinusT * oneMinusT * from[2] +
      2 * oneMinusT * t * midZ +
      t * t * to[2];

    // Perpendicular direction for width
    const tangentX =
      2 * oneMinusT * (midX - from[0]) + 2 * t * (to[0] - midX);
    const tangentZ =
      2 * oneMinusT * (midZ - from[2]) + 2 * t * (to[2] - midZ);
    const tangentLen = Math.sqrt(tangentX * tangentX + tangentZ * tangentZ);
    const nx = -tangentZ / tangentLen;
    const nz = tangentX / tangentLen;

    const halfW = width / 2;

    // Left vertex
    positions.push(px + nx * halfW, ROAD_Y_OFFSET, pz + nz * halfW);
    uvs.push(0, t * (length / width));

    // Right vertex
    positions.push(px - nx * halfW, ROAD_Y_OFFSET, pz - nz * halfW);
    uvs.push(1, t * (length / width));

    // Indices (two triangles per quad)
    if (i < segments) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = createDirtTexture(color);
  material.transparent = true;
  material.opacity = 0.85;
  material.depthWrite = false;

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'road_surface';
  mesh.receiveShadow = true;
  mesh.renderOrder = 1;

  group.add(mesh);
}

/**
 * Build a simple flat road strip mesh between two points.
 * Used for internal town roads (from TownPlacer's internalRoads output).
 */
export function buildInternalRoadMesh(
  from: [number, number, number],
  to: [number, number, number],
  width: number,
): THREE.Mesh {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dz * dz);
  if (length < 0.5) {
    return new THREE.Mesh(
      new THREE.PlaneGeometry(0.1, 0.1),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
  }

  const dirX = dx / length;
  const dirZ = dz / length;
  const perpX = -dirZ;
  const perpZ = dirX;

  const halfW = width / 2;

  // Four corners of the road strip
  const positions = new Float32Array([
    from[0] + perpX * halfW, from[1], from[2] + perpZ * halfW,
    from[0] - perpX * halfW, from[1], from[2] - perpZ * halfW,
    to[0] + perpX * halfW, to[1], to[2] + perpZ * halfW,
    to[0] - perpX * halfW, to[1], to[2] - perpZ * halfW,
  ]);
  const uvArray = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
  const indexArray = [0, 1, 2, 1, 3, 2];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
  geo.setIndex(indexArray);
  geo.computeVertexNormals();

  const mat = createDirtTexture(ROAD_COLOR);
  mat.transparent = true;
  mat.opacity = 0.7;
  mat.depthWrite = false;

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'internal_road';
  mesh.receiveShadow = true;
  mesh.renderOrder = 1;

  return mesh;
}
