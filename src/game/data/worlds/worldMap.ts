/**
 * World Map - Spatial graph of location nodes and connections
 *
 * Defines all location nodes with 3D world-space positions (meters) and the
 * edges (roads/trails/wilderness) that connect them. Used by both the fast-travel
 * system and the overworld walking system.
 *
 * World-space coordinates are derived from the world grid coords (wx, wy) using
 * the WORLD_CELL_SIZE multiplier (256m per grid cell), matching the values in
 * WorldConfig and WorldManager.
 *
 * Connection edges carry distance (meters), terrain type, and danger level so
 * the travel system can calculate encounter chances and travel time.
 */

import { FrontierTerritory } from './frontier_territory';
import type { Connection, DangerLevel, TravelMethod } from '../schemas/world';
import { scopedRNG, rngTick } from '../../lib/prng';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Metres per world-grid cell. Must match WorldConfig.WORLD_CELL_SIZE. */
const WORLD_CELL_SIZE = 256;

// ============================================================================
// TYPES
// ============================================================================

export interface WorldMapNode {
  /** Location ID (matches FrontierTerritory.locations[].id) */
  id: string;
  /** Display name */
  name: string;
  /** World-space position in metres [x, z] */
  worldPos: [number, number];
  /** Town boundary radius in metres (small=100, medium=150, large=200) */
  radius: number;
  /** Location type */
  type: string;
  /** Whether the player starts knowing about this location */
  startDiscovered: boolean;
}

export interface WorldMapEdge {
  /** Source location ID */
  fromId: string;
  /** Destination location ID */
  toId: string;
  /** Straight-line distance in metres (computed from positions) */
  distance: number;
  /** Travel method determines road surface and speed */
  terrainType: TravelMethod;
  /** Danger level (0-1 scale mapped from DangerLevel enum) */
  dangerLevel: number;
  /** Danger enum for UI display */
  danger: DangerLevel;
  /** Travel time in game hours */
  travelTimeHours: number;
  /** Whether travel is available in both directions */
  bidirectional: boolean;
}

export interface WorldMap {
  nodes: Map<string, WorldMapNode>;
  edges: WorldMapEdge[];
}

// ============================================================================
// DANGER LEVEL NUMERIC MAPPING
// ============================================================================

const DANGER_NUMERIC: Record<DangerLevel, number> = {
  safe: 0,
  low: 0.15,
  moderate: 0.35,
  high: 0.6,
  extreme: 0.85,
};

// ============================================================================
// SIZE -> RADIUS MAPPING
// ============================================================================

const SIZE_RADIUS: Record<string, number> = {
  tiny: 60,
  small: 100,
  medium: 150,
  large: 200,
  huge: 300,
};

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

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Get all edges from a given location (respects bidirectionality).
 */
export function getEdgesFrom(locationId: string): WorldMapEdge[] {
  const map = getWorldMap();
  return map.edges.filter(
    (e) =>
      e.fromId === locationId ||
      (e.bidirectional && e.toId === locationId),
  );
}

/**
 * Get the destination ID for an edge when traveling from a given location.
 */
export function getEdgeDestination(edge: WorldMapEdge, fromId: string): string {
  return edge.fromId === fromId ? edge.toId : edge.fromId;
}

/**
 * Find the edge connecting two specific locations, if one exists.
 */
export function findEdge(fromId: string, toId: string): WorldMapEdge | undefined {
  const map = getWorldMap();
  return map.edges.find(
    (e) =>
      (e.fromId === fromId && e.toId === toId) ||
      (e.bidirectional && e.fromId === toId && e.toId === fromId),
  );
}

/**
 * Get the world-space position [x, z] for a location ID.
 * Returns null if the location is not found.
 */
export function getNodePosition(locationId: string): [number, number] | null {
  const map = getWorldMap();
  const node = map.nodes.get(locationId);
  return node ? node.worldPos : null;
}

/**
 * Get the town boundary radius for a location.
 */
export function getNodeRadius(locationId: string): number {
  const map = getWorldMap();
  const node = map.nodes.get(locationId);
  return node?.radius ?? 150;
}

/**
 * Find the nearest town to a world-space position.
 * Returns the node and distance, or null if no towns exist.
 */
export function findNearestTown(
  px: number,
  pz: number,
): { node: WorldMapNode; distance: number } | null {
  const map = getWorldMap();
  let nearest: WorldMapNode | null = null;
  let minDist = Infinity;

  for (const node of map.nodes.values()) {
    const dx = px - node.worldPos[0];
    const dz = pz - node.worldPos[1];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  }

  return nearest ? { node: nearest, distance: minDist } : null;
}

/**
 * Check if a position is inside any town boundary.
 * Returns the town node if inside, null if in wilderness.
 */
export function getTownAt(
  px: number,
  pz: number,
): WorldMapNode | null {
  const map = getWorldMap();
  for (const node of map.nodes.values()) {
    const dx = px - node.worldPos[0];
    const dz = pz - node.worldPos[1];
    const distSq = dx * dx + dz * dz;
    if (distSq <= node.radius * node.radius) {
      return node;
    }
  }
  return null;
}

/**
 * Calculate the number of random encounters for a fast-travel trip.
 * Based on distance and danger level.
 *
 * Short safe roads: 0 encounters
 * Long dangerous wilderness: up to 3 encounters
 */
export function rollFastTravelEncounters(
  distance: number,
  dangerLevel: number,
): number {
  if (dangerLevel <= 0) return 0;

  // Base encounter count scales with distance and danger
  // 500m at moderate danger (~0.35) => ~0.7 expected encounters
  // 1500m at high danger (~0.6) => ~3.6 expected encounters (capped at 3)
  const expectedEncounters = (distance / 500) * dangerLevel * 2;

  // Poisson-like distribution: roll for each potential encounter
  let count = 0;
  const maxEncounters = Math.min(3, Math.ceil(expectedEncounters));

  for (let i = 0; i < maxEncounters; i++) {
    const threshold = expectedEncounters / maxEncounters;
    if (scopedRNG('world', 42, rngTick()) < threshold) {
      count++;
    }
  }

  return Math.min(count, 3);
}

/**
 * Calculate approximate travel time in game hours based on distance and terrain.
 */
export function calculateTravelTime(
  distance: number,
  method: TravelMethod,
): number {
  // Walking speed varies by terrain (metres per game hour)
  const speedMap: Record<TravelMethod, number> = {
    railroad: 200, // Very fast (train)
    road: 100,     // Mounted or cart
    trail: 60,     // On foot, rough path
    wilderness: 35, // Cross-country, slow
    river: 80,     // Boat
  };

  const speed = speedMap[method] ?? 60;
  return Math.max(1, Math.round(distance / speed));
}

/**
 * Get all locations that the player starts with discovered.
 */
export function getStartingDiscoveredIds(): string[] {
  const map = getWorldMap();
  const ids: string[] = [];
  for (const node of map.nodes.values()) {
    if (node.startDiscovered) {
      ids.push(node.id);
    }
  }
  return ids;
}
