/**
 * TownBoundarySystem - Manages transitions between town and overworld modes
 *
 * Each town has a radius (small ~100m, medium ~150m, large ~200m).
 * When the player crosses a boundary outward: transition to overworld.
 * When the player crosses a boundary inward: load that town's buildings/NPCs.
 *
 * Smooth transition: buildings fade in/out over a blend zone (50m) rather
 * than popping in with a hard cut.
 *
 * Integrates with:
 * - WorldManager for town position data
 * - EncounterSystem for distance-to-town safety radius
 * - Game store for currentLocationId and discovery
 */

import { getWorldMap, type WorldMapNode, findNearestTown, getTownAt } from '../data/worlds/worldMap';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Distance beyond town radius where buildings start fading (metres). */
const BLEND_DISTANCE = 50;

/** Minimum distance from any town for encounters to trigger (metres). */
const ENCOUNTER_SAFE_DISTANCE = 50;

// ============================================================================
// TYPES
// ============================================================================

export type TownTransitionKind = 'enter' | 'leave';

export interface TownTransition {
  kind: TownTransitionKind;
  townId: string;
  townName: string;
}

export interface BoundaryState {
  /** Current town the player is inside (null = overworld/wilderness) */
  currentTown: WorldMapNode | null;
  /** Distance to the nearest town boundary edge (metres) */
  distanceToNearestTown: number;
  /** Visibility factor for the nearest town (0 = invisible, 1 = fully visible) */
  nearestTownVisibility: number;
  /** Whether the player is in the blend zone (approaching/leaving) */
  inBlendZone: boolean;
  /** Mode: 'town' when inside a boundary, 'overworld' when outside */
  mode: 'town' | 'overworld';
}

export type BoundaryEventCallback = (transition: TownTransition) => void;

// ============================================================================
// TOWN BOUNDARY SYSTEM
// ============================================================================

export class TownBoundarySystem {
  private currentTown: WorldMapNode | null = null;
  private listeners: Set<BoundaryEventCallback> = new Set();
  private lastState: BoundaryState;

  constructor() {
    this.lastState = {
      currentTown: null,
      distanceToNearestTown: Infinity,
      nearestTownVisibility: 0,
      inBlendZone: false,
      mode: 'overworld',
    };
  }

  /**
   * Update the boundary system with the player's current world-space position.
   * Call once per frame or on player movement.
   *
   * @returns The current boundary state
   */
  update(px: number, pz: number): BoundaryState {
    const townInside = getTownAt(px, pz);
    const nearest = findNearestTown(px, pz);

    // Detect town transitions
    if (townInside && !this.currentTown) {
      // Entered a town
      this.currentTown = townInside;
      this.emit({ kind: 'enter', townId: townInside.id, townName: townInside.name });
    } else if (!townInside && this.currentTown) {
      // Left a town
      const prev = this.currentTown;
      this.currentTown = null;
      this.emit({ kind: 'leave', townId: prev.id, townName: prev.name });
    } else if (
      townInside &&
      this.currentTown &&
      townInside.id !== this.currentTown.id
    ) {
      // Switched directly between towns (edge case)
      const prev = this.currentTown;
      this.currentTown = townInside;
      this.emit({ kind: 'leave', townId: prev.id, townName: prev.name });
      this.emit({ kind: 'enter', townId: townInside.id, townName: townInside.name });
    }

    // Calculate blend zone visibility
    let distanceToNearestTown = Infinity;
    let nearestTownVisibility = 0;
    let inBlendZone = false;

    if (nearest) {
      const distToBoundary = nearest.distance - nearest.node.radius;
      distanceToNearestTown = Math.max(0, distToBoundary);

      if (distToBoundary <= 0) {
        // Inside town boundary
        nearestTownVisibility = 1;
      } else if (distToBoundary <= BLEND_DISTANCE) {
        // In blend zone: fade from 1 (at boundary) to 0 (at blend edge)
        nearestTownVisibility = 1 - distToBoundary / BLEND_DISTANCE;
        inBlendZone = true;
      } else {
        nearestTownVisibility = 0;
      }
    }

    this.lastState = {
      currentTown: this.currentTown,
      distanceToNearestTown,
      nearestTownVisibility,
      inBlendZone,
      mode: this.currentTown ? 'town' : 'overworld',
    };

    return this.lastState;
  }

  /**
   * Get the current boundary state without updating.
   */
  getState(): BoundaryState {
    return this.lastState;
  }

  /**
   * Get the distance to the nearest town for encounter suppression.
   * Returns the distance to the nearest town boundary edge (not center).
   */
  getDistanceToTown(): number {
    return this.lastState.distanceToNearestTown;
  }

  /**
   * Check whether encounters should be suppressed at the current position.
   */
  isEncounterSafe(): boolean {
    return this.lastState.distanceToNearestTown < ENCOUNTER_SAFE_DISTANCE;
  }

  /**
   * Get the ID of the town the player is currently in, or null.
   */
  getCurrentTownId(): string | null {
    return this.currentTown?.id ?? null;
  }

  /**
   * Calculate the visibility/fade factor for a specific town at a given position.
   * Used to smoothly fade town buildings in/out.
   *
   * @returns 0 = invisible, 1 = fully visible
   */
  getTownVisibility(townId: string, px: number, pz: number): number {
    const map = getWorldMap();
    const node = map.nodes.get(townId);
    if (!node) return 0;

    const dx = px - node.worldPos[0];
    const dz = pz - node.worldPos[1];
    const dist = Math.sqrt(dx * dx + dz * dz);
    const distToBoundary = dist - node.radius;

    if (distToBoundary <= 0) return 1; // Inside town
    if (distToBoundary >= BLEND_DISTANCE) return 0; // Too far
    return 1 - distToBoundary / BLEND_DISTANCE; // Blend zone
  }

  /**
   * Subscribe to town transition events.
   * @returns Unsubscribe function
   */
  onTransition(callback: BoundaryEventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Reset the system (e.g., after teleporting or loading a save).
   */
  reset(): void {
    this.currentTown = null;
    this.lastState = {
      currentTown: null,
      distanceToNearestTown: Infinity,
      nearestTownVisibility: 0,
      inBlendZone: false,
      mode: 'overworld',
    };
  }

  /**
   * Force-set the current town (for teleportation / fast-travel arrival).
   */
  setCurrentTown(townId: string | null): void {
    if (townId === null) {
      if (this.currentTown) {
        const prev = this.currentTown;
        this.currentTown = null;
        this.emit({ kind: 'leave', townId: prev.id, townName: prev.name });
      }
      return;
    }

    const map = getWorldMap();
    const node = map.nodes.get(townId);
    if (!node) return;

    if (this.currentTown?.id !== townId) {
      if (this.currentTown) {
        this.emit({ kind: 'leave', townId: this.currentTown.id, townName: this.currentTown.name });
      }
      this.currentTown = node;
      this.emit({ kind: 'enter', townId: node.id, townName: node.name });
    }
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  private emit(transition: TownTransition): void {
    for (const cb of this.listeners) {
      cb(transition);
    }
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let _instance: TownBoundarySystem | null = null;

export function getTownBoundarySystem(): TownBoundarySystem {
  if (!_instance) {
    _instance = new TownBoundarySystem();
  }
  return _instance;
}
