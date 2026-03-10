// railroadGeometry — Railroad geometry builder with rail lines and sleepers.

import * as THREE from 'three';

import {
  RAILROAD_WIDTH,
  RAILROAD_COLOR,
  RAIL_COLOR,
  ROAD_Y_OFFSET,
} from './WorldConfig';

import type { FlattenZone } from './ChunkManager';
import { buildRoad } from './roadGeometry';

/**
 * Build a railroad between two world positions: road bed + rail lines + sleepers.
 */
export function buildRailroad(
  group: THREE.Group,
  from: [number, number, number],
  to: [number, number, number],
  seed: string,
  flattenZones: FlattenZone[],
): void {
  // Road bed
  buildRoad(group, from, to, RAILROAD_WIDTH, RAILROAD_COLOR, seed, flattenZones);

  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dz * dz);
  if (length < 1) return;

  const perpX = -dz / length;
  const perpZ = dx / length;

  // Rail lines (two parallel thin strips)
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
  const sleeperGeo = new THREE.BoxGeometry(
    RAILROAD_WIDTH * 0.8,
    0.08,
    0.2,
  );
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
