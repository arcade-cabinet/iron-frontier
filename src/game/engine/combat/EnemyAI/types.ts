import type { Vehicle } from 'yuka';

export type AIState =
  | 'idle'
  | 'patrol'
  | 'alert'
  | 'pursue'
  | 'attack'
  | 'flee'
  | 'dead';

export type AIActionType = 'none' | 'move' | 'attack_melee' | 'attack_ranged' | 'flee';

export interface AIAction {
  type: AIActionType;
  targetPosition?: { x: number; y: number; z: number };
  attackDirection?: { x: number; y: number; z: number };
  damage?: number;
}

export interface EnemyAIState {
  state: AIState;
  enemyId: string;
  level: number;
  position: { x: number; y: number; z: number };
  health: number;
  maxHealth: number;
  stateTimer: number;
  attackCooldown: number;
  alertTimer: number;
  lastKnownPlayerPos: { x: number; y: number; z: number } | null;
  patrolWaypoints: Array<{ x: number; y: number; z: number }>;
  patrolIndex: number;
  seed: string;
  vehicle: Vehicle;
  reactionTimer: number;
  hasReacted: boolean;
  alertness: number;
}

export const DETECTION_RADIUS = 30;
export const ALERT_RADIUS = 50;
export const MELEE_RANGE = 2.5;
export const FLEE_THRESHOLD = 0.2;
export const ALERT_DURATION = 5.0;
export const PURSUE_TIMEOUT = 8.0;
