/**
 * NPCMovementSystem - Moves NPCs through the 3D world based on schedules
 *
 * Each game tick, this system:
 * 1. Checks if the game hour has changed (phase transition)
 * 2. Resolves each NPC's schedule target for the current time
 * 3. Moves NPCs toward their target at walking speed
 * 4. Handles arrival (idle behavior), patrol (waypoint cycling), and
 *    player interaction (stop and face player)
 *
 * NPCs do NOT teleport; they walk smoothly between positions.
 * The system reads from the GameClock and LocationMarkerIndex.
 *
 * @module systems/NPCMovementSystem
 */

import type { Vec3 } from '../data/schemas/spatial';
import type { ScheduleTemplate } from '../data/schemas/generation';
import type {
  LocationMarkerIndex,
  NPCInstanceData,
  ResolvedScheduleTarget,
} from './NPCScheduleResolver';
import { resolveScheduleTarget } from './NPCScheduleResolver';

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// CONSTANTS / DEFAULTS
// ============================================================================

export const DEFAULT_MOVEMENT_CONFIG: NPCMovementConfig = {
  walkSpeed: 1.5,
  arrivalThreshold: 0.8,
  turnSpeed: 4.0,
  idleWanderRadius: 2.0,
  idleChangePeriod: 4.0,
  interactionSpeedMultiplier: 0.0,
};

// ============================================================================
// NPC MOVEMENT SYSTEM
// ============================================================================

/**
 * Manages the runtime movement state for all NPCs in the current location.
 *
 * Usage:
 * ```typescript
 * const system = new NPCMovementSystem(locationIndex);
 * system.registerNPC(npcData);
 * // Each frame:
 * system.update({ gameHour, playerPosition, deltaTime });
 * const state = system.getState('npc_sheriff');
 * ```
 */
export class NPCMovementSystem {
  private states: Map<string, NPCMovementState> = new Map();
  private npcData: Map<string, NPCInstanceData> = new Map();
  private locationIndex: LocationMarkerIndex;
  private config: NPCMovementConfig;

  constructor(
    locationIndex: LocationMarkerIndex,
    config: Partial<NPCMovementConfig> = {},
  ) {
    this.locationIndex = locationIndex;
    this.config = { ...DEFAULT_MOVEMENT_CONFIG, ...config };
  }

  // --------------------------------------------------------------------------
  // PUBLIC API
  // --------------------------------------------------------------------------

  /**
   * Registers an NPC to be managed by the movement system.
   * Call this when an NPC is spawned in the current location.
   */
  registerNPC(npc: NPCInstanceData, initialHour: number): void {
    this.npcData.set(npc.npcId, npc);

    // Resolve initial schedule target
    const target = resolveScheduleTarget(npc, initialHour, this.locationIndex);

    const state: NPCMovementState = {
      npcId: npc.npcId,
      currentPosition: { ...target.position },
      targetPosition: { ...target.position },
      facingYaw: 0,
      speed: 0,
      arrived: true,
      interactingWithPlayer: false,
      activity: target.activity,
      isIndoors: target.isIndoors,
      isAvailable: target.isAvailable,
      patrolWaypoints: target.patrolWaypoints,
      patrolIndex: 0,
      idleTimer: 0,
      dialogueOverride: target.dialogueOverride,
      _lastResolvedHour: Math.floor(initialHour),
    };

    this.states.set(npc.npcId, state);
  }

  /**
   * Unregisters an NPC from the movement system.
   */
  unregisterNPC(npcId: string): void {
    this.states.delete(npcId);
    this.npcData.delete(npcId);
  }

  /**
   * Gets the current movement state for an NPC.
   */
  getState(npcId: string): NPCMovementState | undefined {
    return this.states.get(npcId);
  }

  /**
   * Gets all NPC states.
   */
  getAllStates(): ReadonlyMap<string, NPCMovementState> {
    return this.states;
  }

  /**
   * Marks an NPC as interacting with the player (stops movement, faces player).
   */
  startInteraction(npcId: string): void {
    const state = this.states.get(npcId);
    if (state) {
      state.interactingWithPlayer = true;
      state.speed = 0;
    }
  }

  /**
   * Marks an NPC as no longer interacting with the player.
   */
  endInteraction(npcId: string): void {
    const state = this.states.get(npcId);
    if (state) {
      state.interactingWithPlayer = false;
    }
  }

  /**
   * Main update loop. Call once per frame.
   */
  update(ctx: NPCMovementContext): void {
    const currentFloorHour = Math.floor(ctx.gameHour);

    for (const [npcId, state] of this.states) {
      const npc = this.npcData.get(npcId);
      if (!npc) continue;

      // 1. Check for schedule change (hour boundary)
      if (currentFloorHour !== state._lastResolvedHour) {
        this.resolveNewTarget(npc, state, ctx.gameHour);
        state._lastResolvedHour = currentFloorHour;
      }

      // 2. Handle player interaction (stop and face player)
      if (state.interactingWithPlayer) {
        this.facePosition(state, ctx.playerPosition, ctx.deltaTime);
        state.speed = 0;
        continue;
      }

      // 3. Handle patrol waypoints
      if (state.activity === 'patrol' && state.patrolWaypoints && state.patrolWaypoints.length > 0) {
        this.updatePatrol(state, ctx.deltaTime);
        continue;
      }

      // 4. Move toward target
      if (!state.arrived) {
        this.moveTowardTarget(state, ctx.deltaTime);
      } else {
        // 5. Idle behavior at destination
        this.updateIdle(state, ctx.deltaTime);
      }
    }
  }

  /**
   * Updates the location index (e.g., when entering a new location).
   * Re-resolves all NPC targets.
   */
  setLocationIndex(index: LocationMarkerIndex, currentHour: number): void {
    this.locationIndex = index;
    for (const [npcId, npc] of this.npcData) {
      const state = this.states.get(npcId);
      if (state) {
        this.resolveNewTarget(npc, state, currentHour);
      }
    }
  }

  /**
   * Clears all NPCs. Call when leaving a location.
   */
  clear(): void {
    this.states.clear();
    this.npcData.clear();
  }

  // --------------------------------------------------------------------------
  // PRIVATE METHODS
  // --------------------------------------------------------------------------

  /**
   * Resolves a new schedule target and updates NPC movement state.
   */
  private resolveNewTarget(
    npc: NPCInstanceData,
    state: NPCMovementState,
    gameHour: number,
  ): void {
    const target = resolveScheduleTarget(npc, gameHour, this.locationIndex);

    state.targetPosition = { ...target.position };
    state.activity = target.activity;
    state.isIndoors = target.isIndoors;
    state.isAvailable = target.isAvailable;
    state.dialogueOverride = target.dialogueOverride;
    state.patrolWaypoints = target.patrolWaypoints;
    state.patrolIndex = 0;
    state.idleTimer = 0;

    // Check if we need to move
    const distSq = distanceSqXZ(state.currentPosition, state.targetPosition);
    if (distSq > this.config.arrivalThreshold * this.config.arrivalThreshold) {
      state.arrived = false;
      state.speed = this.config.walkSpeed;
    } else {
      state.arrived = true;
      state.speed = 0;
    }
  }

  /**
   * Moves the NPC toward the current target position.
   */
  private moveTowardTarget(state: NPCMovementState, dt: number): void {
    const dx = state.targetPosition.x - state.currentPosition.x;
    const dz = state.targetPosition.z - state.currentPosition.z;
    const distSq = dx * dx + dz * dz;
    const threshold = this.config.arrivalThreshold;

    if (distSq <= threshold * threshold) {
      // Arrived
      state.currentPosition.x = state.targetPosition.x;
      state.currentPosition.z = state.targetPosition.z;
      state.arrived = true;
      state.speed = 0;
      state.idleTimer = 0;
      return;
    }

    // Normalize direction
    const dist = Math.sqrt(distSq);
    const dirX = dx / dist;
    const dirZ = dz / dist;

    // Move
    const step = this.config.walkSpeed * dt;
    const clampedStep = Math.min(step, dist);
    state.currentPosition.x += dirX * clampedStep;
    state.currentPosition.z += dirZ * clampedStep;
    state.speed = this.config.walkSpeed;

    // Face movement direction
    const targetYaw = Math.atan2(dirX, dirZ);
    state.facingYaw = lerpAngle(state.facingYaw, targetYaw, this.config.turnSpeed * dt);
  }

  /**
   * Updates patrol behavior: cycles through waypoints.
   */
  private updatePatrol(state: NPCMovementState, dt: number): void {
    const waypoints = state.patrolWaypoints!;
    const target = waypoints[state.patrolIndex];

    const dx = target.x - state.currentPosition.x;
    const dz = target.z - state.currentPosition.z;
    const distSq = dx * dx + dz * dz;
    const threshold = this.config.arrivalThreshold;

    if (distSq <= threshold * threshold) {
      // Arrived at waypoint, advance to next
      state.patrolIndex = (state.patrolIndex + 1) % waypoints.length;
      return;
    }

    // Move toward current waypoint
    const dist = Math.sqrt(distSq);
    const dirX = dx / dist;
    const dirZ = dz / dist;

    const step = this.config.walkSpeed * dt;
    const clampedStep = Math.min(step, dist);
    state.currentPosition.x += dirX * clampedStep;
    state.currentPosition.z += dirZ * clampedStep;
    state.speed = this.config.walkSpeed;

    // Face movement direction
    const targetYaw = Math.atan2(dirX, dirZ);
    state.facingYaw = lerpAngle(state.facingYaw, targetYaw, this.config.turnSpeed * dt);
  }

  /**
   * Updates idle behavior: small random movements at the destination.
   */
  private updateIdle(state: NPCMovementState, dt: number): void {
    state.speed = 0;
    state.idleTimer += dt;
  }

  /**
   * Smoothly rotates the NPC to face a position.
   */
  private facePosition(state: NPCMovementState, target: Vec3, dt: number): void {
    const dx = target.x - state.currentPosition.x;
    const dz = target.z - state.currentPosition.z;

    if (dx * dx + dz * dz < 0.01) return;

    const targetYaw = Math.atan2(dx, dz);
    state.facingYaw = lerpAngle(state.facingYaw, targetYaw, this.config.turnSpeed * dt);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Squared distance on the XZ plane (ignoring Y).
 */
function distanceSqXZ(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

/**
 * Linearly interpolates between two angles (in radians), handling wrapping.
 */
function lerpAngle(from: number, to: number, t: number): number {
  let diff = to - from;

  // Normalize to [-PI, PI]
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  const clamped = Math.min(Math.max(t, 0), 1);
  return from + diff * clamped;
}
