// TownPlacer road generation — Scans tiles for road edges and auto-connects
// important buildings to produce internal road segments.

import type { Location } from '@/src/game/data/schemas/spatial.ts';

import { HEX_CELL_SIZE } from '../WorldConfig.ts';

import type { BuildingPlacement, InternalRoad } from './types.ts';
import { hexToLocal } from './hexHelpers.ts';

// ---------------------------------------------------------------------------
// Internal road generation
// ---------------------------------------------------------------------------

/**
 * Scan the location's baseTiles for tiles with road-type edges.
 * For every pair of adjacent road tiles, create a road segment
 * connecting them in world space.
 *
 * Additionally creates roads between every pair of buildings that
 * have `importance >= 3` and are within 60 metres of each other
 * (main-street connectivity).
 */
export function buildInternalRoads(
  location: Location,
  buildings: BuildingPlacement[],
  townOrigin: [number, number, number],
  centerOffsetX: number,
  centerOffsetZ: number,
): InternalRoad[] {
  const roads: InternalRoad[] = [];

  // Road tiles from baseTiles
  const roadTiles: Array<{ wx: number; wz: number }> = [];
  for (const tile of location.baseTiles) {
    const hasRoad = tile.edges?.some((e) => e === 'road' || e === 'railroad');
    if (hasRoad) {
      const [lx, lz] = hexToLocal(tile.coord.q, tile.coord.r);
      roadTiles.push({
        wx: townOrigin[0] + lx - centerOffsetX,
        wz: townOrigin[2] + lz - centerOffsetZ,
      });
    }
  }

  // Connect sequential road tiles as road segments
  for (let i = 0; i < roadTiles.length - 1; i++) {
    const a = roadTiles[i];
    const b = roadTiles[i + 1];
    const dx = b.wx - a.wx;
    const dz = b.wz - a.wz;
    const dist = Math.sqrt(dx * dx + dz * dz);
    // Only connect adjacent tiles (within ~6 hex cells)
    if (dist < HEX_CELL_SIZE * 6) {
      roads.push({
        from: [a.wx, townOrigin[1] + 0.1, a.wz],
        to: [b.wx, townOrigin[1] + 0.1, b.wz],
        width: 2,
      });
    }
  }

  // Auto-connect important buildings (main street)
  const importantBuildings = buildings.filter((b) => b.importance >= 3);
  const connected = new Set<string>();

  for (let i = 0; i < importantBuildings.length; i++) {
    for (let j = i + 1; j < importantBuildings.length; j++) {
      const a = importantBuildings[i];
      const b = importantBuildings[j];
      const key = [a.id, b.id].sort().join('|');
      if (connected.has(key)) continue;

      const dx = b.position[0] - a.position[0];
      const dz = b.position[2] - a.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Only auto-connect buildings within 60m
      if (dist < 60) {
        roads.push({
          from: [a.position[0], townOrigin[1] + 0.1, a.position[2]],
          to: [b.position[0], townOrigin[1] + 0.1, b.position[2]],
          width: 1.5,
        });
        connected.add(key);
      }
    }
  }

  return roads;
}
