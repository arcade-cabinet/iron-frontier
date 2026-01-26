/**
 * CollisionSystem.ts - Collision detection for Iron Frontier
 *
 * Provides collision detection for:
 * - Terrain boundaries
 * - Buildings and structures
 * - NPCs
 * - Interactive triggers
 *
 * Integrates with:
 * - PlayerController: Provides collision check callback
 * - ZoneSystem: Can use zones as collision boundaries
 * - SpatialHash: Uses for efficient spatial queries
 */

import {
  SpatialHash,
  type AABB,
  type Circle,
  aabbContainsPoint,
  aabbIntersects,
  aabbCircleIntersects,
  circleContainsPoint,
  circleIntersects,
  circleToAABB,
  aabbFromRadius,
} from './SpatialHash';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Collision layers for filtering collision checks.
 */
export type CollisionLayer = 'terrain' | 'building' | 'npc' | 'trigger';

/**
 * Collider shape - either AABB or Circle.
 */
export type ColliderShape = AABB | Circle;

/**
 * Check if a shape is a circle.
 */
export function isCircle(shape: ColliderShape): shape is Circle {
  return 'center' in shape && 'radius' in shape;
}

/**
 * Check if a shape is an AABB.
 */
export function isAABB(shape: ColliderShape): shape is AABB {
  return 'min' in shape && 'max' in shape;
}

/**
 * Collider definition for collision detection.
 */
export interface Collider {
  /** Unique collider identifier */
  id: string;

  /** Collision layer for filtering */
  layer: CollisionLayer;

  /** Collider bounds (AABB for buildings, Circle for NPCs) */
  bounds: ColliderShape;

  /** Whether collisions are enabled */
  enabled?: boolean;

  /** Whether this is a trigger (doesn't block movement) */
  isTrigger?: boolean;

  /** Optional metadata (npcId, buildingId, etc.) */
  data?: unknown;
}

/**
 * Result of a collision check.
 */
export interface CollisionResult {
  /** Whether a collision occurred */
  collided: boolean;

  /** Normal vector for slide-along-wall behavior */
  normal?: { x: number; z: number };

  /** The collider that was hit */
  collider?: Collider;

  /** Penetration depth (for resolution) */
  penetration?: number;

  /** Corrected position after collision */
  correctedPosition?: { x: number; z: number };
}

/**
 * Result of a movement collision check.
 */
export interface MovementCollisionResult {
  /** Whether movement was blocked */
  blocked: boolean;

  /** Corrected position if blocked */
  correctedPosition?: { x: number; z: number };

  /** All colliders hit during movement */
  hitColliders: Collider[];
}

/**
 * Callback for trigger enter events.
 */
export type TriggerCallback = (collider: Collider) => void;

// ============================================================================
// COLLISION SYSTEM
// ============================================================================

/**
 * CollisionSystem handles collision detection and resolution.
 *
 * @example
 * ```typescript
 * const collisionSystem = new CollisionSystem();
 *
 * // Add a building collider
 * collisionSystem.addCollider({
 *   id: 'building_1',
 *   layer: 'building',
 *   bounds: { min: { x: 10, z: 10 }, max: { x: 20, z: 20 } },
 * });
 *
 * // Check movement
 * const result = collisionSystem.checkMovement(
 *   { x: 5, z: 15 },
 *   { x: 15, z: 15 },
 *   0.5
 * );
 * ```
 */
export class CollisionSystem {
  private colliders: Map<string, Collider> = new Map();
  private spatialHash: SpatialHash<Collider>;

  // Trigger tracking
  private activeTriggers: Set<string> = new Set();
  private triggerEnterCallbacks: Set<TriggerCallback> = new Set();
  private triggerExitCallbacks: Set<TriggerCallback> = new Set();

  // Layer mask for filtering
  private defaultLayerMask: Set<CollisionLayer> = new Set(['terrain', 'building', 'npc']);

  constructor(cellSize: number = 50) {
    this.spatialHash = new SpatialHash<Collider>(cellSize);
    console.log('[CollisionSystem] Initialized');
  }

  // ============================================================================
  // COLLIDER MANAGEMENT
  // ============================================================================

  /**
   * Add a collider to the system.
   * @param collider The collider to add
   */
  addCollider(collider: Collider): void {
    if (!collider.id) {
      throw new Error('Collider must have an id');
    }

    // Set defaults
    collider.enabled = collider.enabled ?? true;
    collider.isTrigger = collider.isTrigger ?? false;

    // Remove existing collider with same ID
    if (this.colliders.has(collider.id)) {
      this.removeCollider(collider.id);
    }

    this.colliders.set(collider.id, collider);

    // Convert to AABB for spatial hash
    const aabb = this.getColliderAABB(collider);
    this.spatialHash.insert(collider, aabb);
  }

  /**
   * Remove a collider from the system.
   * @param id The collider ID to remove
   */
  removeCollider(id: string): void {
    const collider = this.colliders.get(id);
    if (collider) {
      this.spatialHash.remove(collider);
      this.colliders.delete(id);
      this.activeTriggers.delete(id);
    }
  }

  /**
   * Update a collider's position.
   * @param id The collider ID
   * @param bounds New bounds for the collider
   */
  updateCollider(id: string, bounds: ColliderShape): void {
    const collider = this.colliders.get(id);
    if (collider) {
      collider.bounds = bounds;
      const aabb = this.getColliderAABB(collider);
      this.spatialHash.update(collider, aabb);
    }
  }

  /**
   * Enable or disable a collider.
   * @param id The collider ID
   * @param enabled Whether the collider is enabled
   */
  setColliderEnabled(id: string, enabled: boolean): void {
    const collider = this.colliders.get(id);
    if (collider) {
      collider.enabled = enabled;
    }
  }

  /**
   * Get a collider by ID.
   * @param id The collider ID
   */
  getCollider(id: string): Collider | undefined {
    return this.colliders.get(id);
  }

  /**
   * Get all colliders.
   */
  getAllColliders(): Collider[] {
    return Array.from(this.colliders.values());
  }

  /**
   * Get the AABB for a collider (converts circles to AABB for spatial hash).
   */
  private getColliderAABB(collider: Collider): AABB {
    if (isCircle(collider.bounds)) {
      return circleToAABB(collider.bounds);
    }
    return collider.bounds;
  }

  // ============================================================================
  // COLLISION DETECTION
  // ============================================================================

  /**
   * Check if movement from one position to another is blocked.
   * @param from Starting position
   * @param to Target position
   * @param radius Player collision radius
   * @param layers Optional collision layers to check (defaults to terrain, building, npc)
   */
  checkMovement(
    from: { x: number; z: number },
    to: { x: number; z: number },
    radius: number,
    layers?: CollisionLayer[]
  ): CollisionResult {
    const layerSet = layers ? new Set(layers) : this.defaultLayerMask;

    // Create a swept AABB for the movement
    const sweptBounds: AABB = {
      min: {
        x: Math.min(from.x, to.x) - radius,
        z: Math.min(from.z, to.z) - radius,
      },
      max: {
        x: Math.max(from.x, to.x) + radius,
        z: Math.max(from.z, to.z) + radius,
      },
    };

    // Query spatial hash for candidates
    const candidates = this.spatialHash.query(sweptBounds);

    // Check each candidate
    for (const collider of candidates) {
      // Skip disabled colliders
      if (!collider.enabled) continue;

      // Skip layers not in mask
      if (!layerSet.has(collider.layer)) continue;

      // Skip triggers (they don't block movement)
      if (collider.isTrigger) continue;

      // Check collision at target position
      const playerCircle: Circle = { center: to, radius };

      if (this.checkShapeCollision(playerCircle, collider.bounds)) {
        // Calculate collision normal for slide
        const normal = this.calculateCollisionNormal(from, to, collider.bounds);
        const correctedPosition = this.calculateCorrectedPosition(from, to, collider.bounds, radius);

        return {
          collided: true,
          normal,
          collider,
          correctedPosition,
        };
      }
    }

    return { collided: false };
  }

  /**
   * Check if two shapes collide.
   */
  private checkShapeCollision(a: ColliderShape, b: ColliderShape): boolean {
    if (isCircle(a) && isCircle(b)) {
      return circleIntersects(a, b);
    }
    if (isCircle(a) && isAABB(b)) {
      return aabbCircleIntersects(b, a);
    }
    if (isAABB(a) && isCircle(b)) {
      return aabbCircleIntersects(a, b);
    }
    if (isAABB(a) && isAABB(b)) {
      return aabbIntersects(a, b);
    }
    return false;
  }

  /**
   * Calculate collision normal for slide-along-wall behavior.
   */
  private calculateCollisionNormal(
    from: { x: number; z: number },
    to: { x: number; z: number },
    collider: ColliderShape
  ): { x: number; z: number } {
    // Get the center of the collider
    let colliderCenter: { x: number; z: number };
    if (isCircle(collider)) {
      colliderCenter = collider.center;
    } else {
      colliderCenter = {
        x: (collider.min.x + collider.max.x) / 2,
        z: (collider.min.z + collider.max.z) / 2,
      };
    }

    // Calculate direction from collider to target position
    const dx = to.x - colliderCenter.x;
    const dz = to.z - colliderCenter.z;
    const length = Math.sqrt(dx * dx + dz * dz);

    if (length < 0.001) {
      return { x: 1, z: 0 }; // Default normal
    }

    return { x: dx / length, z: dz / length };
  }

  /**
   * Calculate corrected position after collision.
   */
  private calculateCorrectedPosition(
    from: { x: number; z: number },
    to: { x: number; z: number },
    collider: ColliderShape,
    playerRadius: number
  ): { x: number; z: number } {
    // Simple approach: slide along the collision surface
    const normal = this.calculateCollisionNormal(from, to, collider);

    // Calculate movement vector
    const moveX = to.x - from.x;
    const moveZ = to.z - from.z;

    // Project movement onto the plane perpendicular to the normal
    const dot = moveX * normal.x + moveZ * normal.z;

    // Remove the component of movement toward the collider
    if (dot < 0) {
      return {
        x: from.x + (moveX - normal.x * dot),
        z: from.z + (moveZ - normal.z * dot),
      };
    }

    // If moving away from collider, allow movement
    return to;
  }

  // ============================================================================
  // SPATIAL QUERIES
  // ============================================================================

  /**
   * Query all colliders near a position.
   * @param pos Center position
   * @param radius Search radius
   * @param layers Optional layer filter
   */
  queryNearby(
    pos: { x: number; z: number },
    radius: number,
    layers?: CollisionLayer[]
  ): Collider[] {
    const candidates = this.spatialHash.queryRadius(pos, radius);
    const layerSet = layers ? new Set(layers) : null;

    return candidates.filter((collider) => {
      if (!collider.enabled) return false;
      if (layerSet && !layerSet.has(collider.layer)) return false;
      return true;
    });
  }

  /**
   * Query the nearest collider to a position.
   * @param pos Center position
   * @param radius Search radius
   * @param layer Layer to search
   */
  queryNearest(
    pos: { x: number; z: number },
    radius: number,
    layer: CollisionLayer
  ): Collider | null {
    const candidates = this.queryNearby(pos, radius, [layer]);

    if (candidates.length === 0) return null;

    let nearest: Collider | null = null;
    let nearestDistSq = Infinity;

    for (const collider of candidates) {
      let center: { x: number; z: number };
      if (isCircle(collider.bounds)) {
        center = collider.bounds.center;
      } else {
        center = {
          x: (collider.bounds.min.x + collider.bounds.max.x) / 2,
          z: (collider.bounds.min.z + collider.bounds.max.z) / 2,
        };
      }

      const dx = pos.x - center.x;
      const dz = pos.z - center.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < nearestDistSq) {
        nearestDistSq = distSq;
        nearest = collider;
      }
    }

    return nearest;
  }

  /**
   * Query all colliders that contain a point.
   * @param pos The point to check
   * @param layers Optional layer filter
   */
  queryPoint(pos: { x: number; z: number }, layers?: CollisionLayer[]): Collider[] {
    const candidates = this.spatialHash.queryPoint(pos);
    const layerSet = layers ? new Set(layers) : null;

    return candidates.filter((collider) => {
      if (!collider.enabled) return false;
      if (layerSet && !layerSet.has(collider.layer)) return false;

      // Verify the point is actually inside the shape
      if (isCircle(collider.bounds)) {
        return circleContainsPoint(collider.bounds, pos);
      }
      return aabbContainsPoint(collider.bounds, pos);
    });
  }

  // ============================================================================
  // TRIGGER HANDLING
  // ============================================================================

  /**
   * Update trigger state for a position.
   * @param pos Current position
   * @param radius Check radius
   */
  updateTriggers(pos: { x: number; z: number }, radius: number): void {
    const currentTriggers = new Set<string>();

    // Find all triggers we're currently touching
    const candidates = this.spatialHash.queryRadius(pos, radius);

    for (const collider of candidates) {
      if (!collider.enabled || !collider.isTrigger) continue;

      const playerCircle: Circle = { center: pos, radius };
      if (this.checkShapeCollision(playerCircle, collider.bounds)) {
        currentTriggers.add(collider.id);
      }
    }

    // Check for trigger enters
    for (const id of currentTriggers) {
      if (!this.activeTriggers.has(id)) {
        const collider = this.colliders.get(id);
        if (collider) {
          for (const callback of this.triggerEnterCallbacks) {
            callback(collider);
          }
        }
      }
    }

    // Check for trigger exits
    for (const id of this.activeTriggers) {
      if (!currentTriggers.has(id)) {
        const collider = this.colliders.get(id);
        if (collider) {
          for (const callback of this.triggerExitCallbacks) {
            callback(collider);
          }
        }
      }
    }

    this.activeTriggers = currentTriggers;
  }

  /**
   * Subscribe to trigger enter events.
   * @param callback The callback to invoke
   * @returns Unsubscribe function
   */
  onTriggerEnter(callback: TriggerCallback): () => void {
    this.triggerEnterCallbacks.add(callback);
    return () => {
      this.triggerEnterCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to trigger exit events.
   * @param callback The callback to invoke
   * @returns Unsubscribe function
   */
  onTriggerExit(callback: TriggerCallback): () => void {
    this.triggerExitCallbacks.add(callback);
    return () => {
      this.triggerExitCallbacks.delete(callback);
    };
  }

  // ============================================================================
  // PLAYER CONTROLLER INTEGRATION
  // ============================================================================

  /**
   * Create a collision check callback for PlayerController.
   * @param playerRadius The player's collision radius
   * @param layers Optional collision layers
   */
  createCollisionCallback(
    playerRadius: number,
    layers?: CollisionLayer[]
  ): (from: { x: number; z: number }, to: { x: number; z: number }) => {
    blocked: boolean;
    correctedPosition?: { x: number; z: number };
  } {
    return (from, to) => {
      const result = this.checkMovement(from, to, playerRadius, layers);
      return {
        blocked: result.collided,
        correctedPosition: result.correctedPosition,
      };
    };
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Clear all colliders.
   */
  clear(): void {
    this.colliders.clear();
    this.spatialHash.clear();
    this.activeTriggers.clear();
    console.log('[CollisionSystem] Cleared');
  }

  /**
   * Dispose of the collision system.
   */
  dispose(): void {
    this.clear();
    this.triggerEnterCallbacks.clear();
    this.triggerExitCallbacks.clear();
    console.log('[CollisionSystem] Disposed');
  }

  // ============================================================================
  // DEBUG
  // ============================================================================

  /**
   * Get debug information about the collision system.
   */
  getDebugInfo(): {
    colliderCount: number;
    activeTriggers: number;
    collidersByLayer: Record<CollisionLayer, number>;
    spatialHashInfo: ReturnType<SpatialHash<Collider>['getDebugInfo']>;
  } {
    const collidersByLayer: Record<CollisionLayer, number> = {
      terrain: 0,
      building: 0,
      npc: 0,
      trigger: 0,
    };

    for (const collider of this.colliders.values()) {
      collidersByLayer[collider.layer]++;
    }

    return {
      colliderCount: this.colliders.size,
      activeTriggers: this.activeTriggers.size,
      collidersByLayer,
      spatialHashInfo: this.spatialHash.getDebugInfo(),
    };
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let collisionSystemInstance: CollisionSystem | null = null;

/**
 * Get the singleton CollisionSystem instance.
 */
export function getCollisionSystem(): CollisionSystem {
  if (!collisionSystemInstance) {
    collisionSystemInstance = new CollisionSystem();
  }
  return collisionSystemInstance;
}

/**
 * Reset the singleton instance (for testing).
 */
export function resetCollisionSystem(): void {
  if (collisionSystemInstance) {
    collisionSystemInstance.dispose();
    collisionSystemInstance = null;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a building collider.
 * @param id Unique identifier
 * @param bounds AABB bounds
 * @param data Optional metadata (buildingId, etc.)
 */
export function createBuildingCollider(
  id: string,
  bounds: AABB,
  data?: unknown
): Collider {
  return {
    id,
    layer: 'building',
    bounds,
    enabled: true,
    isTrigger: false,
    data,
  };
}

/**
 * Create an NPC collider.
 * @param id Unique identifier
 * @param center Position
 * @param radius Collision radius
 * @param data Optional metadata (npcId, etc.)
 */
export function createNPCCollider(
  id: string,
  center: { x: number; z: number },
  radius: number,
  data?: unknown
): Collider {
  return {
    id,
    layer: 'npc',
    bounds: { center, radius },
    enabled: true,
    isTrigger: false,
    data,
  };
}

/**
 * Create a trigger collider.
 * @param id Unique identifier
 * @param bounds AABB or Circle bounds
 * @param data Optional metadata (triggerId, eventId, etc.)
 */
export function createTriggerCollider(
  id: string,
  bounds: ColliderShape,
  data?: unknown
): Collider {
  return {
    id,
    layer: 'trigger',
    bounds,
    enabled: true,
    isTrigger: true,
    data,
  };
}

/**
 * Create a terrain boundary collider.
 * @param id Unique identifier
 * @param bounds AABB bounds
 */
export function createTerrainCollider(id: string, bounds: AABB): Collider {
  return {
    id,
    layer: 'terrain',
    bounds,
    enabled: true,
    isTrigger: false,
  };
}
