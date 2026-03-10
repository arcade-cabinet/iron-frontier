// routeBuilder — High-level route construction from Connection data.

import * as THREE from 'three';

import type { Connection } from '@/src/game/data/schemas/world';

import {
  ROAD_WIDTH,
  TRAIL_WIDTH,
  ROAD_COLOR,
  TRAIL_COLOR,
} from './WorldConfig';

import type { FlattenZone } from './ChunkManager';
import type { RouteSegment, RouteEndpoints } from './routeTypes';
import { buildRoad } from './roadGeometry';
import { buildRailroad } from './railroadGeometry';
import { addFencePosts } from './fenceGeometry';

/**
 * Build a renderable route segment between two world positions.
 * Returns geometry AND flatten zones for the terrain underneath.
 */
export function buildRoute(
  connection: Connection,
  endpoints: RouteEndpoints,
  seed: string,
): RouteSegment {
  const group = new THREE.Group();
  group.name = `route_${connection.from}_${connection.to}`;

  const { from, to } = endpoints;
  const flattenZones: FlattenZone[] = [];

  switch (connection.method) {
    case 'railroad':
      buildRailroad(group, from, to, seed, flattenZones);
      break;
    case 'road':
      buildRoad(group, from, to, ROAD_WIDTH, ROAD_COLOR, seed, flattenZones);
      addFencePosts(group, from, to, seed);
      break;
    case 'trail':
      buildRoad(group, from, to, TRAIL_WIDTH, TRAIL_COLOR, seed, flattenZones);
      break;
    case 'wilderness':
      // Wilderness routes are barely visible — thin faded trail
      buildRoad(
        group,
        from,
        to,
        TRAIL_WIDTH * 0.6,
        TRAIL_COLOR,
        seed,
        flattenZones,
      );
      break;
    default:
      buildRoad(group, from, to, ROAD_WIDTH, ROAD_COLOR, seed, flattenZones);
      break;
  }

  return {
    connectionId: `${connection.from}-${connection.to}`,
    from: connection.from,
    to: connection.to,
    method: connection.method,
    group,
    flattenZones,
  };
}

/**
 * Build all route segments for a world given a position resolver.
 * Returns route segments AND a combined list of flatten zones.
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

    segments.push(buildRoute(conn, { from: fromPos, to: toPos }, seed));
    built.add(key);
  }

  return segments;
}

/**
 * Collect all flatten zones from a list of route segments.
 */
export function collectRouteFlattenZones(
  routes: RouteSegment[],
): FlattenZone[] {
  const zones: FlattenZone[] = [];
  for (const route of routes) {
    for (const zone of route.flattenZones) {
      zones.push(zone);
    }
  }
  return zones;
}
