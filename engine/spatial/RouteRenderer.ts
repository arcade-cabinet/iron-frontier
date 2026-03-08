// RouteRenderer — Road/trail/railroad geometry between towns.
import Alea from 'alea';
import * as THREE from 'three';
import { createDirtTexture } from '@/src/game/engine/materials';
import type { Connection } from '@/src/game/data/schemas/world';

export interface RouteSegment {
  connectionId: string;
  from: string;
  to: string;
  method: string;
  group: THREE.Group;
}

export interface RouteEndpoints {
  from: [number, number, number];
  to: [number, number, number];
}

const ROAD_WIDTH = 4, TRAIL_WIDTH = 2, RAILROAD_WIDTH = 3, ROAD_Y_OFFSET = 0.15;
const ROAD_COLOR = '#8B7355', TRAIL_COLOR = '#A09070', RAILROAD_COLOR = '#6B5B4B';
const RAIL_COLOR = '#4A4A4A', FENCE_POST_SPACING = 12;
const FENCE_POST_HEIGHT = 1.2, FENCE_POST_RADIUS = 0.06;

/**
 * Build a renderable route segment between two world positions.
 */
export function buildRoute(
  connection: Connection,
  endpoints: RouteEndpoints,
  seed: string,
): RouteSegment {
  const group = new THREE.Group();
  group.name = `route_${connection.from}_${connection.to}`;

  const { from, to } = endpoints;

  switch (connection.method) {
    case 'railroad':
      buildRailroad(group, from, to, seed);
      break;
    case 'road':
      buildRoad(group, from, to, ROAD_WIDTH, ROAD_COLOR, seed);
      addFencePosts(group, from, to, seed);
      break;
    case 'trail':
      buildRoad(group, from, to, TRAIL_WIDTH, TRAIL_COLOR, seed);
      break;
    case 'wilderness':
      // Wilderness routes are barely visible — thin faded trail
      buildRoad(group, from, to, TRAIL_WIDTH * 0.6, TRAIL_COLOR, seed);
      break;
    default:
      buildRoad(group, from, to, ROAD_WIDTH, ROAD_COLOR, seed);
      break;
  }

  return {
    connectionId: `${connection.from}-${connection.to}`,
    from: connection.from,
    to: connection.to,
    method: connection.method,
    group,
  };
}

/**
 * Build all routes for a world given a position resolver.
 */
export function buildAllRoutes(
  connections: Connection[],
  getPosition: (locationId: string) => [number, number, number] | null,
  seed: string,
): RouteSegment[] {
  const segments: RouteSegment[] = [];
  const built = new Set<string>();

  for (const conn of connections) {
    // Avoid duplicates for bidirectional connections
    const key = [conn.from, conn.to].sort().join('|');
    if (built.has(key)) continue;

    const fromPos = getPosition(conn.from);
    const toPos = getPosition(conn.to);
    if (!fromPos || !toPos) continue;

    segments.push(
      buildRoute(conn, { from: fromPos, to: toPos }, seed),
    );
    built.add(key);
  }

  return segments;
}

function buildRoad(
  group: THREE.Group,
  from: [number, number, number],
  to: [number, number, number],
  width: number,
  color: string,
  seed: string,
): void {
  const rng = Alea(seed + from[0] + to[0]) as unknown as () => number;

  // Direction vector
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

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Quadratic bezier: from -> mid -> to
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
  geometry.setAttribute(
    'uv',
    new THREE.Float32BufferAttribute(uvs, 2),
  );
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

function buildRailroad(
  group: THREE.Group,
  from: [number, number, number],
  to: [number, number, number],
  seed: string,
): void {
  // Road bed
  buildRoad(group, from, to, RAILROAD_WIDTH, RAILROAD_COLOR, seed);

  // Rail lines (two parallel thin strips)
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dz * dz);
  if (length < 1) return;

  const dirX = dx / length;
  const dirZ = dz / length;
  const perpX = -dirZ;
  const perpZ = dirX;

  const railOffset = 0.6;
  const railGeo = new THREE.BoxGeometry(0.08, 0.1, length);
  const railMat = new THREE.MeshStandardMaterial({
    color: RAIL_COLOR,
    roughness: 0.4,
    metalness: 0.7,
  });

  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(railGeo, railMat);
    const cx = (from[0] + to[0]) / 2 + perpX * railOffset * side;
    const cz = (from[2] + to[2]) / 2 + perpZ * railOffset * side;
    rail.position.set(cx, ROAD_Y_OFFSET + 0.1, cz);
    rail.rotation.y = Math.atan2(dx, dz);
    rail.castShadow = true;
    group.add(rail);
  }

  // Sleepers (cross ties)
  const sleeperSpacing = 2;
  const sleeperCount = Math.floor(length / sleeperSpacing);
  const sleeperGeo = new THREE.BoxGeometry(RAILROAD_WIDTH * 0.8, 0.08, 0.2);
  const sleeperMat = new THREE.MeshStandardMaterial({
    color: '#5C4033',
    roughness: 0.9,
  });

  for (let i = 0; i < sleeperCount; i++) {
    const t = (i + 0.5) / sleeperCount;
    const sx = from[0] + dx * t;
    const sz = from[2] + dz * t;

    const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
    sleeper.position.set(sx, ROAD_Y_OFFSET + 0.04, sz);
    sleeper.rotation.y = Math.atan2(dx, dz) + Math.PI / 2;
    sleeper.receiveShadow = true;
    group.add(sleeper);
  }
}

function addFencePosts(
  group: THREE.Group,
  from: [number, number, number],
  to: [number, number, number],
  seed: string,
): void {
  const rng = Alea(seed + 'fence' + from[0]) as unknown as () => number;

  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dz * dz);
  if (length < FENCE_POST_SPACING * 2) return;

  const dirX = dx / length;
  const dirZ = dz / length;
  const perpX = -dirZ;
  const perpZ = dirX;

  const postGeo = new THREE.CylinderGeometry(
    FENCE_POST_RADIUS,
    FENCE_POST_RADIUS * 1.2,
    FENCE_POST_HEIGHT,
    6,
  );
  const postMat = new THREE.MeshStandardMaterial({
    color: '#7B6B5B',
    roughness: 0.95,
  });

  const postCount = Math.floor(length / FENCE_POST_SPACING);
  const offset = ROAD_WIDTH * 0.8;

  // Only place fence posts on one side (deterministic per-route)
  const side = rng() > 0.5 ? 1 : -1;

  for (let i = 1; i < postCount; i++) {
    const t = i / postCount;
    const px = from[0] + dx * t + perpX * offset * side;
    const pz = from[2] + dz * t + perpZ * offset * side;

    // Small random jitter for natural look
    const jx = (rng() - 0.5) * 0.3;
    const jz = (rng() - 0.5) * 0.3;

    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(px + jx, FENCE_POST_HEIGHT / 2, pz + jz);
    // Slight random tilt
    post.rotation.x = (rng() - 0.5) * 0.05;
    post.rotation.z = (rng() - 0.5) * 0.05;
    post.castShadow = true;
    group.add(post);
  }
}
