import type { Vec3 } from '../../data/schemas/spatial';

/** Per-NPC movement state tracked by the system */
export interface NPCMovementState {
  /** NPC identifier */
  npcId: string;
  /** Current world position */
  currentPosition: Vec3;
  /** Target position (from schedule) */
  targetPosition: Vec3;
  /** Current facing direction in radians (around Y axis) */
  facingYaw: number;
  /** Current movement speed (m/s). 0 = stationary */
  speed: number;
  /** Whether the NPC has arrived at the target */
  arrived: boolean;
  /** Whether the NPC is currently interacting with the player */
  interactingWithPlayer: boolean;
  /** Current activity label */
  activity: string;
  /** Whether the NPC is indoors */
  isIndoors: boolean;
  /** Whether the NPC is available for interaction */
  isAvailable: boolean;
  /** Patrol waypoints (only during patrol activity) */
  patrolWaypoints?: Vec3[];
  /** Current patrol waypoint index */
  patrolIndex: number;
  /** Idle timer: seconds since arriving at target (for idle animations) */
  idleTimer: number;
  /** Dialogue override for this time period */
  dialogueOverride?: string;
  /** Previous hour used for change detection */
  _lastResolvedHour: number;
}

/** Configuration for the movement system */
export interface NPCMovementConfig {
  /** Default walking speed in meters per second */
  walkSpeed: number;
  /** Distance threshold to consider "arrived" (meters) */
  arrivalThreshold: number;
  /** Turn speed in radians per second */
  turnSpeed: number;
  /** Maximum idle wander radius (meters) */
  idleWanderRadius: number;
  /** Seconds between idle direction changes */
  idleChangePeriod: number;
  /** Speed multiplier when interacting with player (0 = stop) */
  interactionSpeedMultiplier: number;
}

/** External state the movement system reads each tick */
export interface NPCMovementContext {
  /** Current game hour (0-23.999) */
  gameHour: number;
  /** Player world position (for interaction facing) */
  playerPosition: Vec3;
  /** Frame delta time in seconds */
  deltaTime: number;
}

export const DEFAULT_MOVEMENT_CONFIG: NPCMovementConfig = {
  walkSpeed: 1.5,
  arrivalThreshold: 0.8,
  turnSpeed: 4.0,
  idleWanderRadius: 2.0,
  idleChangePeriod: 4.0,
  interactionSpeedMultiplier: 0.0,
};
