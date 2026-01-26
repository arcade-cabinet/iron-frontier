/**
 * AIManager - YukaJS-based AI entity management
 *
 * Provides game AI capabilities using the Yuka library:
 * - Steering behaviors (wander, seek, flee, follow)
 * - State machines for NPC behavior
 * - Spatial perception (vision, hearing)
 *
 * Usage:
 * ```ts
 * const ai = new AIManager();
 * ai.addEntity('npc1', { x: 0, y: 0, z: 0 }, { defaultState: 'wander' });
 * ai.setPlayerPosition({ x: 10, y: 0, z: 5 });
 *
 * // In game loop
 * const results = ai.update(deltaTime);
 * for (const result of results) {
 *   // Update NPC mesh positions
 * }
 * ```
 */

import {
  EntityManager,
  GameEntity,
  Vehicle,
  WanderBehavior,
  SeekBehavior,
  ArriveBehavior,
  FleeBehavior,
  FollowPathBehavior,
  Path,
  Vector3,
  Time,
  StateMachine,
  State,
} from 'yuka';

import type {
  AIEntityData,
  AIState,
  AISystemConfig,
  AIUpdateResult,
  NPCBehaviorConfig,
} from './types';
import { DEFAULT_NPC_BEHAVIOR, DEFAULT_AI_CONFIG } from './types';

// ============================================================================
// NPC States
// ============================================================================

/**
 * Idle state - NPC stands still
 */
class IdleState extends State<NPCVehicle> {
  enter(npc: NPCVehicle) {
    npc.maxSpeed = 0;
    npc.steering.clear();
  }

  execute(npc: NPCVehicle) {
    // Check if player is in range
    if (npc.canSeePlayer && npc.data.behavior.defaultState !== 'idle') {
      npc.stateMachine.changeTo('alert');
    }
  }
}

/**
 * Wander state - NPC moves randomly
 */
class WanderState extends State<NPCVehicle> {
  enter(npc: NPCVehicle) {
    npc.maxSpeed = npc.data.behavior.maxSpeed * 0.5; // Slower when wandering
    npc.steering.clear();

    const wanderConfig = npc.data.behavior.wander || DEFAULT_NPC_BEHAVIOR.wander!;
    const wanderBehavior = new WanderBehavior(
      wanderConfig.radius,
      wanderConfig.distance,
      wanderConfig.jitter
    );
    npc.steering.add(wanderBehavior);
  }

  execute(npc: NPCVehicle) {
    // Check if player is in range
    if (npc.canSeePlayer) {
      npc.stateMachine.changeTo('alert');
    }
  }

  exit(npc: NPCVehicle) {
    npc.steering.clear();
  }
}

/**
 * Patrol state - NPC follows waypoints
 */
class PatrolState extends State<NPCVehicle> {
  private followBehavior: FollowPathBehavior | null = null;

  enter(npc: NPCVehicle) {
    const patrolConfig = npc.data.behavior.patrol;
    if (!patrolConfig || patrolConfig.waypoints.length === 0) {
      npc.stateMachine.changeTo('idle');
      return;
    }

    npc.maxSpeed = npc.data.behavior.maxSpeed * 0.7;
    npc.steering.clear();

    // Create path from waypoints
    const path = new Path();
    if (patrolConfig.loop) {
      path.loop = true;
    }

    for (const wp of patrolConfig.waypoints) {
      path.add(new Vector3(wp.x, wp.y, wp.z));
    }

    this.followBehavior = new FollowPathBehavior(path);
    npc.steering.add(this.followBehavior);
  }

  execute(npc: NPCVehicle) {
    // Check if player is in range
    if (npc.canSeePlayer) {
      npc.stateMachine.changeTo('alert');
    }
  }

  exit(npc: NPCVehicle) {
    npc.steering.clear();
    this.followBehavior = null;
  }
}

/**
 * Alert state - NPC noticed the player
 */
class AlertState extends State<NPCVehicle> {
  private timer = 0;

  enter(npc: NPCVehicle) {
    npc.maxSpeed = 0;
    npc.steering.clear();
    this.timer = 0;
  }

  execute(npc: NPCVehicle, deltaTime: number) {
    this.timer += deltaTime;

    // Face the player
    if (npc.lastKnownPlayerPosition) {
      const target = new Vector3(
        npc.lastKnownPlayerPosition.x,
        npc.lastKnownPlayerPosition.y,
        npc.lastKnownPlayerPosition.z
      );
      npc.lookAt(target);
    }

    // After brief pause, decide next action
    if (this.timer > 0.5) {
      // For now, return to default state
      // Could add hostile/friendly logic here
      npc.stateMachine.changeTo(npc.data.behavior.defaultState);
    }
  }
}

/**
 * Seek state - NPC moves toward a target
 */
class SeekState extends State<NPCVehicle> {
  enter(npc: NPCVehicle) {
    npc.maxSpeed = npc.data.behavior.maxSpeed;
    npc.steering.clear();

    if (npc.targetPosition) {
      const target = new Vector3(
        npc.targetPosition.x,
        npc.targetPosition.y,
        npc.targetPosition.z
      );
      const arriveBehavior = new ArriveBehavior(target, npc.data.behavior.arrivalTolerance);
      npc.steering.add(arriveBehavior);
    }
  }

  execute(npc: NPCVehicle) {
    // Check if arrived
    if (npc.targetPosition) {
      const dist = npc.position.distanceTo(
        new Vector3(npc.targetPosition.x, npc.targetPosition.y, npc.targetPosition.z)
      );
      if (dist < npc.data.behavior.arrivalTolerance) {
        npc.stateMachine.changeTo(npc.data.behavior.defaultState);
      }
    }
  }

  exit(npc: NPCVehicle) {
    npc.steering.clear();
  }
}

/**
 * Flee state - NPC runs away from player
 */
class FleeState extends State<NPCVehicle> {
  private timer = 0;

  enter(npc: NPCVehicle) {
    npc.maxSpeed = npc.data.behavior.maxSpeed * 1.2; // Run faster when fleeing
    npc.steering.clear();
    this.timer = 0;

    if (npc.lastKnownPlayerPosition) {
      const threat = new Vector3(
        npc.lastKnownPlayerPosition.x,
        npc.lastKnownPlayerPosition.y,
        npc.lastKnownPlayerPosition.z
      );
      const fleeBehavior = new FleeBehavior(threat);
      npc.steering.add(fleeBehavior);
    }
  }

  execute(npc: NPCVehicle, deltaTime: number) {
    this.timer += deltaTime;

    // Stop fleeing after some time or when far enough
    if (this.timer > 3 || !npc.canSeePlayer) {
      npc.stateMachine.changeTo(npc.data.behavior.defaultState);
    }
  }

  exit(npc: NPCVehicle) {
    npc.steering.clear();
  }
}

// ============================================================================
// NPC Vehicle
// ============================================================================

/**
 * Extended Vehicle class for NPCs
 */
class NPCVehicle extends Vehicle {
  data: AIEntityData;
  stateMachine: StateMachine<NPCVehicle>;
  canSeePlayer = false;
  lastKnownPlayerPosition: { x: number; y: number; z: number } | null = null;
  targetPosition: { x: number; y: number; z: number } | null = null;

  constructor(id: string, config: Partial<NPCBehaviorConfig> = {}) {
    super();

    const behavior = { ...DEFAULT_NPC_BEHAVIOR, ...config };

    this.data = {
      id,
      state: behavior.defaultState,
      behavior,
      canSeePlayer: false,
    };

    this.maxSpeed = behavior.maxSpeed;
    this.maxForce = behavior.maxForce;

    // Initialize state machine
    this.stateMachine = new StateMachine(this);
    this.stateMachine.add('idle', new IdleState());
    this.stateMachine.add('wander', new WanderState());
    this.stateMachine.add('patrol', new PatrolState());
    this.stateMachine.add('alert', new AlertState());
    this.stateMachine.add('seek', new SeekState());
    this.stateMachine.add('flee', new FleeState());

    // Start in default state
    this.stateMachine.changeTo(behavior.defaultState);
  }

  update(delta: number): this {
    // Update state machine
    this.stateMachine.update(delta);

    // Update data state
    this.data.state = this.stateMachine.currentState?.name as AIState || 'idle';
    this.data.canSeePlayer = this.canSeePlayer;
    if (this.lastKnownPlayerPosition) {
      this.data.lastKnownPlayerPosition = { ...this.lastKnownPlayerPosition };
    }

    return super.update(delta);
  }

  /**
   * Set the target position for seek behavior
   */
  setTarget(position: { x: number; y: number; z: number }) {
    this.targetPosition = position;
    this.data.targetPosition = position;
  }

  /**
   * Transition to a new state
   */
  setState(state: AIState) {
    this.stateMachine.changeTo(state);
  }
}

// ============================================================================
// AI Manager
// ============================================================================

/**
 * AIManager - Central manager for all AI entities
 */
export class AIManager {
  private entityManager: EntityManager;
  private time: Time;
  private config: AISystemConfig;
  private entities: Map<string, NPCVehicle> = new Map();
  private playerPosition: Vector3 = new Vector3();
  private accumulator = 0;

  constructor(config: Partial<AISystemConfig> = {}) {
    this.config = { ...DEFAULT_AI_CONFIG, ...config };
    this.entityManager = new EntityManager();
    this.time = new Time();
  }

  /**
   * Add an AI entity
   */
  addEntity(
    id: string,
    position: { x: number; y: number; z: number },
    config: Partial<NPCBehaviorConfig> = {}
  ): void {
    if (this.entities.has(id)) {
      console.warn(`[AIManager] Entity ${id} already exists, removing old one`);
      this.removeEntity(id);
    }

    const npc = new NPCVehicle(id, config);
    npc.position.set(position.x, position.y, position.z);

    this.entities.set(id, npc);
    this.entityManager.add(npc);
  }

  /**
   * Remove an AI entity
   */
  removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      this.entityManager.remove(entity);
      this.entities.delete(id);
    }
  }

  /**
   * Get an entity by ID
   */
  getEntity(id: string): AIEntityData | undefined {
    return this.entities.get(id)?.data;
  }

  /**
   * Set the player position (for perception checks)
   */
  setPlayerPosition(position: { x: number; y: number; z: number }): void {
    this.playerPosition.set(position.x, position.y, position.z);
  }

  /**
   * Set an entity's target position
   */
  setEntityTarget(id: string, position: { x: number; y: number; z: number }): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.setTarget(position);
      entity.setState('seek');
    }
  }

  /**
   * Change an entity's state
   */
  setEntityState(id: string, state: AIState): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.setState(state);
    }
  }

  /**
   * Update all AI entities
   */
  update(deltaTime: number): AIUpdateResult[] {
    // Fixed timestep accumulator
    this.accumulator += deltaTime;

    const results: AIUpdateResult[] = [];

    while (this.accumulator >= this.config.fixedTimestep) {
      this.accumulator -= this.config.fixedTimestep;

      // Update perception for all entities
      for (const [id, npc] of this.entities) {
        this.updatePerception(npc);
      }

      // Update Yuka entity manager
      this.entityManager.update(this.config.fixedTimestep);
    }

    // Collect results
    for (const [id, npc] of this.entities) {
      results.push({
        id,
        position: {
          x: npc.position.x,
          y: npc.position.y,
          z: npc.position.z,
        },
        direction: {
          x: npc.velocity.x !== 0 || npc.velocity.z !== 0
            ? npc.velocity.x / Math.max(npc.velocity.length(), 0.001)
            : Math.sin(npc.rotation.y),
          z: npc.velocity.x !== 0 || npc.velocity.z !== 0
            ? npc.velocity.z / Math.max(npc.velocity.length(), 0.001)
            : Math.cos(npc.rotation.y),
        },
        state: npc.data.state,
        wantsToInteract: npc.data.state === 'alert' && npc.canSeePlayer,
      });
    }

    return results;
  }

  /**
   * Update perception for an entity
   */
  private updatePerception(npc: NPCVehicle): void {
    const distance = npc.position.distanceTo(this.playerPosition);
    const range = npc.data.behavior.detectionRange;

    // Simple distance-based detection
    // TODO: Add field of view check
    if (distance <= range) {
      npc.canSeePlayer = true;
      npc.lastKnownPlayerPosition = {
        x: this.playerPosition.x,
        y: this.playerPosition.y,
        z: this.playerPosition.z,
      };
    } else {
      npc.canSeePlayer = false;
    }
  }

  /**
   * Clear all entities
   */
  clear(): void {
    for (const [id, entity] of this.entities) {
      this.entityManager.remove(entity);
    }
    this.entities.clear();
  }

  /**
   * Get number of active entities
   */
  get entityCount(): number {
    return this.entities.size;
  }
}

export default AIManager;
