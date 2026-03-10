/**
 * World Map - Spatial graph of location nodes and connections
 *
 * Builds a map from FrontierTerritory data, providing a singleton
 * accessor for the world graph. Query helpers are in worldMapQueries.ts.
 */

import { FrontierTerritory } from './frontier_territory';
import {
  type WorldMap,
  type WorldMapNode,
  type WorldMapEdge,
  WORLD_CELL_SIZE,
  DANGER_NUMERIC,
  SIZE_RADIUS,
} from './worldMapTypes.ts';

// Re-export types and queries for existing consumers
export type { WorldMap, WorldMapNode, WorldMapEdge } from './worldMapTypes.ts';
export {
  getEdgesFrom,
  getEdgeDestination,
  findEdge,
  getNodePosition,
  getNodeRadius,
  findNearestTown,
  getTownAt,
  rollFastTravelEncounters,
  calculateTravelTime,
  getStartingDiscoveredIds,
} from './worldMapQueries.ts';

// ============================================================================
// BUILD WORLD MAP FROM FRONTIER TERRITORY DATA
// ============================================================================

function buildWorldMap(): WorldMap {
  const nodes = new Map<string, WorldMapNode>();
  const edges: WorldMapEdge[] = [];

  // Build nodes from location definitions
  for (const loc of FrontierTerritory.locations) {
    const worldX = loc.coord.wx * WORLD_CELL_SIZE;
    const worldZ = loc.coord.wy * WORLD_CELL_SIZE;
    const radius = SIZE_RADIUS[loc.size] ?? 150;

    nodes.set(loc.id, {
      id: loc.id,
      name: loc.name,
      worldPos: [worldX, worldZ],
      radius,
      type: loc.type,
      startDiscovered: loc.discovered,
    });
  }

  // Build edges from connections
  for (const conn of FrontierTerritory.connections) {
    const fromNode = nodes.get(conn.from);
    const toNode = nodes.get(conn.to);
    if (!fromNode || !toNode) continue;

    // Calculate straight-line distance between locations
    const dx = toNode.worldPos[0] - fromNode.worldPos[0];
    const dz = toNode.worldPos[1] - fromNode.worldPos[1];
    const distance = Math.sqrt(dx * dx + dz * dz);

    edges.push({
      fromId: conn.from,
      toId: conn.to,
      distance,
      terrainType: conn.method,
      dangerLevel: DANGER_NUMERIC[conn.danger] ?? 0.35,
      danger: conn.danger,
      travelTimeHours: conn.travelTime,
      bidirectional: conn.bidirectional,
    });
  }

  return { nodes, edges };
}

// ============================================================================
// SINGLETON
// ============================================================================

let _worldMap: WorldMap | null = null;

/** Get the global world map (lazily built from FrontierTerritory). */
export function getWorldMap(): WorldMap {
  if (!_worldMap) {
    _worldMap = buildWorldMap();
  }
  return _worldMap;
}
