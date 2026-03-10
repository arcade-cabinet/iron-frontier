/**
 * World Map Query Helpers
 *
 * Functions for querying the world map graph: edges, positions,
 * town boundaries, encounter rolls, and travel time calculations.
 */

import type { TravelMethod } from '../schemas/world.ts';
import { scopedRNG, rngTick } from '../../lib/prng.ts';
import type { WorldMapEdge, WorldMapNode } from './worldMapTypes.ts';
import { getWorldMap } from './worldMap.ts';

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
 */
export function rollFastTravelEncounters(
  distance: number,
  dangerLevel: number,
): number {
  if (dangerLevel <= 0) return 0;

  const expectedEncounters = (distance / 500) * dangerLevel * 2;
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
  const speedMap: Record<TravelMethod, number> = {
    railroad: 200,
    road: 100,
    trail: 60,
    wilderness: 35,
    river: 80,
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
