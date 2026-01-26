/**
 * AI Types - Type definitions for the YukaJS-based AI system
 */

/**
 * AI Entity States
 */
export type AIState = 'idle' | 'wander' | 'patrol' | 'seek' | 'flee' | 'follow' | 'interact' | 'alert';

/**
 * NPC Behavior configuration
 */
export interface NPCBehaviorConfig {
  /** Default state when no other state is active */
  defaultState: AIState;
  /** Maximum movement speed (units per second) */
  maxSpeed: number;
  /** Maximum steering force */
  maxForce: number;
  /** How close to get before arriving */
  arrivalTolerance: number;
  /** Wander behavior parameters */
  wander?: {
    radius: number;
    distance: number;
    jitter: number;
  };
  /** Patrol behavior parameters */
  patrol?: {
    /** Waypoints to patrol (in world coordinates) */
    waypoints: Array<{ x: number; y: number; z: number }>;
    /** Whether to loop the patrol path */
    loop: boolean;
    /** Wait time at each waypoint (seconds) */
    waitTime: number;
  };
  /** Detection range for seeing the player */
  detectionRange: number;
  /** Field of view (radians) */
  fieldOfView: number;
}

/**
 * Default NPC behavior configuration
 */
export const DEFAULT_NPC_BEHAVIOR: NPCBehaviorConfig = {
  defaultState: 'idle',
  maxSpeed: 2,
  maxForce: 5,
  arrivalTolerance: 0.5,
  wander: {
    radius: 1,
    distance: 4,
    jitter: 0.05,
  },
  detectionRange: 10,
  fieldOfView: Math.PI * 0.5, // 90 degrees
};

/**
 * AI Entity data stored in the entity manager
 */
export interface AIEntityData {
  /** Unique entity ID */
  id: string;
  /** Current AI state */
  state: AIState;
  /** Target entity ID (for seek/follow states) */
  targetId?: string;
  /** Target position (for seek/patrol states) */
  targetPosition?: { x: number; y: number; z: number };
  /** Behavior configuration */
  behavior: NPCBehaviorConfig;
  /** Current patrol waypoint index */
  patrolIndex?: number;
  /** Time remaining at current waypoint */
  waitTimer?: number;
  /** Whether the entity can currently see the player */
  canSeePlayer: boolean;
  /** Last known player position */
  lastKnownPlayerPosition?: { x: number; y: number; z: number };
}

/**
 * AI Update result returned to the game
 */
export interface AIUpdateResult {
  /** Entity ID */
  id: string;
  /** New position */
  position: { x: number; y: number; z: number };
  /** Facing direction (normalized) */
  direction: { x: number; z: number };
  /** Current state */
  state: AIState;
  /** Whether the entity wants to interact */
  wantsToInteract: boolean;
}

/**
 * AI System configuration
 */
export interface AISystemConfig {
  /** Maximum number of AI entities to update per frame */
  maxUpdatesPerFrame: number;
  /** Fixed timestep for AI simulation (seconds) */
  fixedTimestep: number;
  /** Enable debug visualization */
  debug: boolean;
}

/**
 * Default AI system configuration
 */
export const DEFAULT_AI_CONFIG: AISystemConfig = {
  maxUpdatesPerFrame: 50,
  fixedTimestep: 1 / 30, // 30 AI updates per second
  debug: false,
};
