/**
 * TravelService - Handles travel logic between world locations
 *
 * Provides utilities for checking travel feasibility, calculating costs,
 * and executing travel transitions. Works with the WorldLoader and game state.
 *
 * This is a platform-agnostic service that can be used with any game store.
 */

import type { DangerLevel } from '../data/schemas/world';
import { getTravelInfo, type LoadedWorld, type ResolvedLocation } from '../data/worlds';

// ============================================================================
// TYPES
// ============================================================================

export interface TravelCost {
  /** Travel time in game hours */
  time: number;
  /** Danger level of the route */
  danger: DangerLevel;
  /** Travel method (road, trail, wilderness, railroad, river) */
  method: string;
}

export interface TravelResult {
  success: boolean;
  message: string;
  /** The location arrived at (if successful) */
  destination?: ResolvedLocation;
  /** Random encounter triggered (future feature) */
  encounter?: unknown;
}

/**
 * Minimal interface for game state needed by TravelService
 */
export interface TravelGameState {
  loadedWorld: LoadedWorld | null;
  currentLocationId: string | null;
  updateTime: (hours: number) => void;
  travelTo: (locationId: string) => void;
}

// ============================================================================
// TRAVEL SERVICE FUNCTIONS
// ============================================================================

/**
 * Check if travel is possible between two locations
 *
 * @param fromId - Current location ID
 * @param toId - Target location ID
 * @param loadedWorld - The loaded world data
 * @returns true if travel is possible
 */
export function canTravel(fromId: string, toId: string, loadedWorld: LoadedWorld | null): boolean {
  if (!loadedWorld) {
    console.warn('[TravelService] No world loaded');
    return false;
  }

  // Check connection exists
  if (!loadedWorld.canTravelTo(fromId, toId)) {
    return false;
  }

  // Get target location
  const targetLocation = loadedWorld.getLocation(toId);
  if (!targetLocation) {
    return false;
  }

  // Check if target is accessible
  if (!targetLocation.ref.accessible) {
    return false;
  }

  return true;
}

/**
 * Get the travel cost between two locations
 *
 * @param fromId - Current location ID
 * @param toId - Target location ID
 * @param loadedWorld - The loaded world data
 * @returns Travel cost info or null if no connection
 */
export function getTravelCost(
  fromId: string,
  toId: string,
  loadedWorld: LoadedWorld | null
): TravelCost | null {
  if (!loadedWorld) {
    console.warn('[TravelService] No world loaded');
    return null;
  }

  const travelInfo = getTravelInfo(loadedWorld, fromId, toId);
  if (!travelInfo) {
    return null;
  }

  return {
    time: travelInfo.travelTime,
    danger: travelInfo.danger as DangerLevel,
    method: travelInfo.method,
  };
}

/**
 * Get all locations reachable from the current location
 *
 * @param fromId - Current location ID
 * @param loadedWorld - The loaded world data
 * @returns Array of reachable locations with travel costs
 */
export function getReachableLocations(
  fromId: string,
  loadedWorld: LoadedWorld | null
): Array<{ location: ResolvedLocation; cost: TravelCost }> {
  if (!loadedWorld) {
    return [];
  }

  const connections = loadedWorld.getConnectionsFrom(fromId);
  const reachable: Array<{ location: ResolvedLocation; cost: TravelCost }> = [];

  for (const locRef of connections) {
    const location = loadedWorld.getLocation(locRef.id);
    const cost = getTravelCost(fromId, locRef.id, loadedWorld);

    if (location && cost && location.ref.accessible) {
      reachable.push({ location, cost });
    }
  }

  return reachable;
}

/**
 * Execute travel to a new location
 *
 * This is the main travel function that handles:
 * - Validating travel is possible
 * - Updating game time
 * - Triggering location discovery
 * - Updating the current location in the store
 *
 * Future: Random encounters, resource consumption
 *
 * @param toId - Target location ID
 * @param gameState - The game state with travel-related methods
 * @returns Travel result with success status and message
 */
export function executeTravel(toId: string, gameState: TravelGameState): TravelResult {
  const { loadedWorld, currentLocationId, updateTime, travelTo } = gameState;

  if (!loadedWorld) {
    return {
      success: false,
      message: 'No world loaded',
    };
  }

  if (!currentLocationId) {
    return {
      success: false,
      message: 'No current location',
    };
  }

  // Validate travel is possible
  if (!canTravel(currentLocationId, toId, loadedWorld)) {
    const targetLocation = loadedWorld.getLocation(toId);
    return {
      success: false,
      message: `Cannot travel to ${targetLocation?.ref.name ?? toId}`,
    };
  }

  // Get travel cost
  const cost = getTravelCost(currentLocationId, toId, loadedWorld);
  if (!cost) {
    return {
      success: false,
      message: 'No route available',
    };
  }

  // Get destination
  const destination = loadedWorld.getLocation(toId);
  if (!destination) {
    return {
      success: false,
      message: 'Destination not found',
    };
  }

  // Update game time based on travel duration
  updateTime(cost.time);

  // Execute the travel (updates currentLocationId, discovers location)
  travelTo(toId);

  console.log(
    `[TravelService] Traveled to ${destination.ref.name} in ${cost.time} hours via ${cost.method}`
  );

  return {
    success: true,
    message: `Arrived at ${destination.ref.name} after ${cost.time} hours`,
    destination,
  };
}

/**
 * Get danger level description for UI display
 */
export function getDangerDescription(danger: DangerLevel): string {
  const descriptions: Record<DangerLevel, string> = {
    safe: 'Safe - Well patrolled, no threats',
    low: 'Low - Minor risk of wildlife',
    moderate: 'Moderate - Watch for bandits',
    high: 'High - Dangerous territory',
    extreme: 'Extreme - Lawless and deadly',
  };
  return descriptions[danger];
}

/**
 * Get travel method description for UI display
 */
export function getMethodDescription(method: string): string {
  const descriptions: Record<string, string> = {
    road: 'Maintained road - Fast and relatively safe',
    trail: 'Rough trail - Slower but passable',
    wilderness: 'Cross-country - Slow and risky',
    railroad: 'Train travel - Fast and very safe',
    river: 'River route - Moderate pace, follows waterways',
  };
  return descriptions[method] ?? method;
}

/**
 * Format travel time for display
 */
export function formatTravelTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours === 1) {
    return '1 hour';
  } else if (hours < 24) {
    return `${hours} hours`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return days === 1 ? '1 day' : `${days} days`;
    }
    return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
  }
}
