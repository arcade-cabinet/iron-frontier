import type { Vec3 } from '../../data/schemas/spatial';
import type {
  LocationMarkerIndex,
  NPCInstanceData,
} from '../NPCScheduleResolver';
import { resolveScheduleTarget } from '../NPCScheduleResolver';
import { scopedRNG, rngTick } from '../../lib/prng';
import type {
  NPCMovementState,
  NPCMovementConfig,
  NPCMovementContext,
} from './types';
import { DEFAULT_MOVEMENT_CONFIG } from './types';
import { distanceSqXZ, lerpAngle } from './utils';

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

  registerNPC(npc: NPCInstanceData, initialHour: number): void {
    this.npcData.set(npc.npcId, npc);

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

  unregisterNPC(npcId: string): void {
    this.states.delete(npcId);
    this.npcData.delete(npcId);
  }

  getState(npcId: string): NPCMovementState | undefined {
    return this.states.get(npcId);
  }

  getAllStates(): ReadonlyMap<string, NPCMovementState> {
    return this.states;
  }

  startInteraction(npcId: string): void {
    const state = this.states.get(npcId);
    if (state) {
      state.interactingWithPlayer = true;
      state.speed = 0;
    }
  }

  endInteraction(npcId: string): void {
    const state = this.states.get(npcId);
    if (state) {
      state.interactingWithPlayer = false;
    }
  }

  update(ctx: NPCMovementContext): void {
    const currentFloorHour = Math.floor(ctx.gameHour);

    for (const [npcId, state] of this.states) {
      const npc = this.npcData.get(npcId);
      if (!npc) continue;

      if (currentFloorHour !== state._lastResolvedHour) {
        this.resolveNewTarget(npc, state, ctx.gameHour);
        state._lastResolvedHour = currentFloorHour;
      }

      if (state.interactingWithPlayer) {
        this.facePosition(state, ctx.playerPosition, ctx.deltaTime);
        state.speed = 0;
        continue;
      }

      if (state.activity === 'patrol' && state.patrolWaypoints && state.patrolWaypoints.length > 0) {
        this.updatePatrol(state, ctx.deltaTime);
        continue;
      }

      if (!state.arrived) {
        this.moveTowardTarget(state, ctx.deltaTime);
      } else {
        this.updateIdle(state, ctx.deltaTime);
      }
    }
  }

  setLocationIndex(index: LocationMarkerIndex, currentHour: number): void {
    this.locationIndex = index;
    for (const [npcId, npc] of this.npcData) {
      const state = this.states.get(npcId);
      if (state) {
        this.resolveNewTarget(npc, state, currentHour);
      }
    }
  }

  clear(): void {
    this.states.clear();
    this.npcData.clear();
  }

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

    const distSq = distanceSqXZ(state.currentPosition, state.targetPosition);
    if (distSq > this.config.arrivalThreshold * this.config.arrivalThreshold) {
      state.arrived = false;
      state.speed = this.config.walkSpeed;
    } else {
      state.arrived = true;
      state.speed = 0;
    }
  }

  private moveTowardTarget(state: NPCMovementState, dt: number): void {
    const dx = state.targetPosition.x - state.currentPosition.x;
    const dz = state.targetPosition.z - state.currentPosition.z;
    const distSq = dx * dx + dz * dz;
    const threshold = this.config.arrivalThreshold;

    if (distSq <= threshold * threshold) {
      state.currentPosition.x = state.targetPosition.x;
      state.currentPosition.z = state.targetPosition.z;
      state.arrived = true;
      state.speed = 0;
      state.idleTimer = 0;
      return;
    }

    const dist = Math.sqrt(distSq);
    const dirX = dx / dist;
    const dirZ = dz / dist;

    const step = this.config.walkSpeed * dt;
    const clampedStep = Math.min(step, dist);
    state.currentPosition.x += dirX * clampedStep;
    state.currentPosition.z += dirZ * clampedStep;
    state.speed = this.config.walkSpeed;

    const targetYaw = Math.atan2(dirX, dirZ);
    state.facingYaw = lerpAngle(state.facingYaw, targetYaw, this.config.turnSpeed * dt);
  }

  private updatePatrol(state: NPCMovementState, dt: number): void {
    const waypoints = state.patrolWaypoints!;
    const target = waypoints[state.patrolIndex];

    const dx = target.x - state.currentPosition.x;
    const dz = target.z - state.currentPosition.z;
    const distSq = dx * dx + dz * dz;
    const threshold = this.config.arrivalThreshold;

    if (distSq <= threshold * threshold) {
      state.patrolIndex = (state.patrolIndex + 1) % waypoints.length;
      return;
    }

    const dist = Math.sqrt(distSq);
    const dirX = dx / dist;
    const dirZ = dz / dist;

    const step = this.config.walkSpeed * dt;
    const clampedStep = Math.min(step, dist);
    state.currentPosition.x += dirX * clampedStep;
    state.currentPosition.z += dirZ * clampedStep;
    state.speed = this.config.walkSpeed;

    const targetYaw = Math.atan2(dirX, dirZ);
    state.facingYaw = lerpAngle(state.facingYaw, targetYaw, this.config.turnSpeed * dt);
  }

  private updateIdle(state: NPCMovementState, dt: number): void {
    state.idleTimer += dt;

    if (state.idleTimer >= this.config.idleChangePeriod) {
      state.idleTimer = 0;

      if (scopedRNG('npc', 42, rngTick()) < 0.6) {
        const angle = scopedRNG('npc', 42, rngTick()) * Math.PI * 2;
        const dist = scopedRNG('npc', 42, rngTick()) * this.config.idleWanderRadius;
        const wanderTarget: Vec3 = {
          x: state.targetPosition.x + Math.cos(angle) * dist,
          y: state.targetPosition.y,
          z: state.targetPosition.z + Math.sin(angle) * dist,
        };

        const dx = wanderTarget.x - state.currentPosition.x;
        const dz = wanderTarget.z - state.currentPosition.z;
        const wanderDistSq = dx * dx + dz * dz;

        if (wanderDistSq > 0.25) {
          const wanderDist = Math.sqrt(wanderDistSq);
          const dirX = dx / wanderDist;
          const dirZ = dz / wanderDist;

          const wanderSpeed = this.config.walkSpeed * 0.4;
          const step = wanderSpeed * dt;
          const clampedStep = Math.min(step, wanderDist);
          state.currentPosition.x += dirX * clampedStep;
          state.currentPosition.z += dirZ * clampedStep;
          state.speed = wanderSpeed;

          const targetYaw = Math.atan2(dirX, dirZ);
          state.facingYaw = lerpAngle(state.facingYaw, targetYaw, this.config.turnSpeed * dt);
          return;
        }
      }
    }

    const dxBack = state.targetPosition.x - state.currentPosition.x;
    const dzBack = state.targetPosition.z - state.currentPosition.z;
    const backDistSq = dxBack * dxBack + dzBack * dzBack;

    if (backDistSq > 0.5 * 0.5) {
      const backDist = Math.sqrt(backDistSq);
      const dirX = dxBack / backDist;
      const dirZ = dzBack / backDist;
      const driftSpeed = this.config.walkSpeed * 0.3;
      const step = driftSpeed * dt;
      const clampedStep = Math.min(step, backDist);
      state.currentPosition.x += dirX * clampedStep;
      state.currentPosition.z += dirZ * clampedStep;
      state.speed = driftSpeed;

      const targetYaw = Math.atan2(dirX, dirZ);
      state.facingYaw = lerpAngle(state.facingYaw, targetYaw, this.config.turnSpeed * dt);
    } else {
      state.speed = 0;
    }
  }

  private facePosition(state: NPCMovementState, target: Vec3, dt: number): void {
    const dx = target.x - state.currentPosition.x;
    const dz = target.z - state.currentPosition.z;

    if (dx * dx + dz * dz < 0.01) return;

    const targetYaw = Math.atan2(dx, dz);
    state.facingYaw = lerpAngle(state.facingYaw, targetYaw, this.config.turnSpeed * dt);
  }
}
