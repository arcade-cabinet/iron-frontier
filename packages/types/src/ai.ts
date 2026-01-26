/**
 * AI Types - Type definitions for the YukaJS-based AI system
 *
 * This module contains PURE TYPE DEFINITIONS for AI behaviors.
 * Runtime values and implementations are in @iron-frontier/shared/ai.
 */

// ============================================================================
// AI STATES
// ============================================================================

export type AIState =
  | 'idle'
  | 'wander'
  | 'patrol'
  | 'seek'
  | 'flee'
  | 'follow'
  | 'interact'
  | 'alert';

// ============================================================================
// BEHAVIOR CONFIGURATION
// ============================================================================

export interface WanderConfig {
  /** Wander circle radius */
  radius: number;
  /** Distance to wander circle */
  distance: number;
  /** Random jitter amount */
  jitter: number;
}

export interface PatrolConfig {
  /** Waypoints to patrol (in world coordinates) */
  waypoints: Array<{ x: number; y: number; z: number }>;
  /** Whether to loop the patrol path */
  loop: boolean;
  /** Wait time at each waypoint (seconds) */
  waitTime: number;
}

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
  wander?: WanderConfig;
  /** Patrol behavior parameters */
  patrol?: PatrolConfig;
  /** Detection range for seeing the player */
  detectionRange: number;
  /** Field of view (radians) */
  fieldOfView: number;
}

// ============================================================================
// AI ENTITY DATA
// ============================================================================

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

// ============================================================================
// AI UPDATE RESULTS
// ============================================================================

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

// ============================================================================
// AI SYSTEM CONFIGURATION
// ============================================================================

export interface AISystemConfig {
  /** Maximum number of AI entities to update per frame */
  maxUpdatesPerFrame: number;
  /** Fixed timestep for AI simulation (seconds) */
  fixedTimestep: number;
  /** Enable debug visualization */
  debug: boolean;
}

// ============================================================================
// STEERING BEHAVIOR TYPES
// ============================================================================

export type SteeringBehaviorType =
  | 'seek'
  | 'flee'
  | 'arrive'
  | 'wander'
  | 'pursuit'
  | 'evade'
  | 'follow_path'
  | 'obstacle_avoidance'
  | 'separation'
  | 'alignment'
  | 'cohesion';

export interface SteeringBehaviorConfig {
  type: SteeringBehaviorType;
  weight: number;
  active: boolean;
}

// ============================================================================
// PERCEPTION
// ============================================================================

export interface PerceptionConfig {
  /** Vision range */
  sightRange: number;
  /** Hearing range */
  hearingRange: number;
  /** Field of view (radians) */
  fieldOfView: number;
  /** Memory duration (seconds) */
  memorySpan: number;
}

export interface MemoryRecord {
  /** Entity that was perceived */
  entityId: string;
  /** Time when entity was first seen */
  firstSeenTime: number;
  /** Time when entity was last seen */
  lastSeenTime: number;
  /** Last known position */
  lastKnownPosition: { x: number; y: number; z: number };
  /** Whether currently visible */
  isVisible: boolean;
}

// ============================================================================
// GOAL-DRIVEN BEHAVIOR
// ============================================================================

export type GoalStatus = 'inactive' | 'active' | 'completed' | 'failed';

export interface Goal {
  id: string;
  type: string;
  status: GoalStatus;
  priority: number;
  subgoals?: Goal[];
}

export interface GoalEvaluatorConfig {
  /** Character bias for this goal type */
  characterBias: number;
}
