/**
 * Iron Frontier - Route Data Index
 *
 * Central export point for all route definitions.
 * Routes are the paths between towns where travel, encounters, and events occur.
 *
 * Route Summary:
 * 1. Dusty Trail     - Tutorial route, Frontier's Edge -> Iron Gulch (15 min)
 * 2. Desert Pass     - Harsh desert, Iron Gulch -> Mesa Point (20 min)
 * 3. Mountain Road   - Scenic wildlife, Iron Gulch -> Coldwater (25 min)
 * 4. Badlands Trail  - Supernatural, Mesa Point <-> Coldwater (20 min)
 * 5. Final Trail     - Endgame, Mesa Point/Coldwater -> Salvation (30 min)
 */

import type { Route } from '../routeSchema';

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

export { DustyTrail } from './dusty_trail';
export { DesertPass } from './desert_pass';
export { MountainRoad } from './mountain_road';
export { BadlandsTrail } from './badlands_trail';
export { FinalTrail } from './final_trail';

// ============================================================================
// ROUTE REGISTRY
// ============================================================================

import { DustyTrail } from './dusty_trail';
import { DesertPass } from './desert_pass';
import { MountainRoad } from './mountain_road';
import { BadlandsTrail } from './badlands_trail';
import { FinalTrail } from './final_trail';

/**
 * All routes in the game, in order of typical progression.
 */
export const ALL_ROUTES: Route[] = [
  DustyTrail,
  DesertPass,
  MountainRoad,
  BadlandsTrail,
  FinalTrail,
];

/**
 * Routes indexed by ID for quick lookup.
 */
export const ROUTES_BY_ID: Record<string, Route> = Object.fromEntries(
  ALL_ROUTES.map((route) => [route.id, route])
);

/**
 * Route IDs as a type-safe constant array.
 */
export const ALL_ROUTE_IDS = [
  'dusty_trail',
  'desert_pass',
  'mountain_road',
  'badlands_trail',
  'final_trail',
] as const;

export type RouteId = (typeof ALL_ROUTE_IDS)[number];

// ============================================================================
// ROUTE LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get a route by its unique ID.
 */
export function getRouteById(id: string): Route | undefined {
  return ROUTES_BY_ID[id];
}

/**
 * Get all routes originating from a specific town.
 */
export function getRoutesFromTown(townId: string): Route[] {
  return ALL_ROUTES.filter(
    (route) => route.fromTown === townId || (route.bidirectional && route.toTown === townId)
  );
}

/**
 * Get all routes leading to a specific town.
 */
export function getRoutesToTown(townId: string): Route[] {
  return ALL_ROUTES.filter(
    (route) => route.toTown === townId || (route.bidirectional && route.fromTown === townId)
  );
}

/**
 * Get routes connecting two specific towns.
 */
export function getRoutesBetweenTowns(townA: string, townB: string): Route[] {
  return ALL_ROUTES.filter((route) => {
    const connects =
      (route.fromTown === townA && route.toTown === townB) ||
      (route.fromTown === townB && route.toTown === townA);
    if (!connects) return false;
    // If route is one-way, check direction
    if (!route.bidirectional) {
      return route.fromTown === townA;
    }
    return true;
  });
}

/**
 * Get routes by terrain type.
 */
export function getRoutesByTerrain(terrain: Route['terrain']): Route[] {
  return ALL_ROUTES.filter(
    (route) => route.terrain === terrain || route.secondaryTerrain === terrain
  );
}

/**
 * Get routes by danger level range.
 */
export function getRoutesByDangerLevel(minDanger: number, maxDanger: number = 10): Route[] {
  return ALL_ROUTES.filter((route) => {
    const dangerLevel = route.dangerLevel ?? 3;
    return dangerLevel >= minDanger && dangerLevel <= maxDanger;
  });
}

/**
 * Get routes by tag.
 */
export function getRoutesByTag(tag: string): Route[] {
  return ALL_ROUTES.filter((route) => (route.tags ?? []).includes(tag));
}

/**
 * Get routes that are currently passable.
 */
export function getPassableRoutes(): Route[] {
  return ALL_ROUTES.filter(
    (route) => route.passable !== false && (route.condition ?? 'clear') !== 'blocked'
  );
}

/**
 * Get the total travel time across multiple routes (for path planning).
 */
export function calculatePathTravelTime(routeIds: string[]): number {
  return routeIds.reduce((total, id) => {
    const route = ROUTES_BY_ID[id];
    return total + (route?.length ?? 0);
  }, 0);
}

/**
 * Get all unique landmarks across all routes.
 */
export function getAllLandmarks(): Array<{
  routeId: string;
  landmark: NonNullable<Route['landmarks']>[number];
}> {
  return ALL_ROUTES.flatMap((route) =>
    (route.landmarks ?? []).map((landmark) => ({
      routeId: route.id,
      landmark,
    }))
  );
}

/**
 * Get all unique events across all routes.
 */
export function getAllEvents(): Array<{
  routeId: string;
  event: NonNullable<Route['events']>[number];
}> {
  return ALL_ROUTES.flatMap((route) =>
    (route.events ?? []).map((event) => ({
      routeId: route.id,
      event,
    }))
  );
}

// ============================================================================
// ROUTE STATISTICS
// ============================================================================

/**
 * Get summary statistics about all routes.
 */
export function getRouteStats() {
  return {
    totalRoutes: ALL_ROUTES.length,
    totalTravelTime: ALL_ROUTES.reduce((sum, r) => sum + r.length, 0),
    averageTravelTime: Math.round(
      ALL_ROUTES.reduce((sum, r) => sum + r.length, 0) / ALL_ROUTES.length
    ),
    averageDangerLevel:
      Math.round(
        (ALL_ROUTES.reduce((sum, r) => sum + (r.dangerLevel ?? 3), 0) / ALL_ROUTES.length) * 10
      ) / 10,
    totalEncounters: ALL_ROUTES.reduce((sum, r) => sum + (r.encounters ?? []).length, 0),
    totalEvents: ALL_ROUTES.reduce((sum, r) => sum + (r.events ?? []).length, 0),
    totalLandmarks: ALL_ROUTES.reduce((sum, r) => sum + (r.landmarks ?? []).length, 0),
    routesByTerrain: {
      desert: ALL_ROUTES.filter((r) => r.terrain === 'desert').length,
      plains: ALL_ROUTES.filter((r) => r.terrain === 'plains').length,
      mountains: ALL_ROUTES.filter((r) => r.terrain === 'mountains').length,
      badlands: ALL_ROUTES.filter((r) => r.terrain === 'badlands').length,
    },
  };
}
