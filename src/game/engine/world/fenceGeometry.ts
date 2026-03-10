// fenceGeometry — Fence post placement along road routes.

import Alea from 'alea';
import * as THREE from 'three';

import {
  FENCE_POST_SPACING,
  FENCE_POST_HEIGHT,
  FENCE_POST_RADIUS,
  ROAD_WIDTH,
} from './WorldConfig';

/**
 * Add fence posts along one side of a road between two world positions.
 */
export function addFencePosts(
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

  const perpX = -dz / length;
  const perpZ = dx / length;

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
    post.rotation.x = (rng() - 0.5) * 0.05;
    post.rotation.z = (rng() - 0.5) * 0.05;
    post.castShadow = true;
    group.add(post);
  }
}
