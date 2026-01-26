/**
 * Combat Scene Types - Shared types for the R3F combat system
 */

import type { Combatant, CombatPhase, CombatResult, CombatState } from '@iron-frontier/shared/store';

// ============================================================================
// POSITION TYPES
// ============================================================================

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface CombatPositions {
  /** Player position (left side of arena) */
  player: Position3D;
  /** Companion positions (behind player) */
  companions: Position3D[];
  /** Enemy positions (right side, up to 4) */
  enemies: Position3D[];
}

// ============================================================================
// VISUAL EFFECT TYPES
// ============================================================================

export interface DamageNumber {
  id: string;
  value: number;
  position: Position3D;
  isCritical: boolean;
  isMiss: boolean;
  createdAt: number;
}

export interface HitEffect {
  id: string;
  position: Position3D;
  type: 'hit' | 'critical' | 'miss' | 'heal';
  createdAt: number;
}

export interface StatusIndicator {
  type: 'bleeding' | 'stunned' | 'poisoned' | 'burning' | 'buffed';
  turnsRemaining: number;
}

// ============================================================================
// ANIMATION TYPES
// ============================================================================

export type CombatantAnimation =
  | 'idle'
  | 'attack'
  | 'hit'
  | 'defend'
  | 'death'
  | 'victory'
  | 'dodge';

export interface AnimationState {
  current: CombatantAnimation;
  startedAt: number;
  duration: number;
}

// ============================================================================
// CAMERA TYPES
// ============================================================================

export interface CameraShake {
  intensity: number;
  duration: number;
  startedAt: number;
}

export type CameraMode = 'overview' | 'focus_attacker' | 'focus_target' | 'victory' | 'defeat';

// ============================================================================
// ARENA TYPES
// ============================================================================

export type ArenaType =
  | 'desert'
  | 'canyon'
  | 'town'
  | 'mine'
  | 'forest'
  | 'boss';

export interface ArenaConfig {
  type: ArenaType;
  groundColor: string;
  ambientColor: string;
  fogColor: string;
  fogDensity: number;
  propDensity: number;
}

// ============================================================================
// COMBATANT VISUAL TYPES
// ============================================================================

export interface CombatantVisual {
  combatant: Combatant;
  position: Position3D;
  animation: AnimationState;
  isSelected: boolean;
  isTargeted: boolean;
}

// ============================================================================
// COMBAT SCENE PROPS
// ============================================================================

export interface CombatSceneProps {
  /** Combat state from game store */
  combatState: CombatState;
  /** Arena type based on encounter location */
  arenaType?: ArenaType;
  /** Callback when an enemy is clicked */
  onSelectTarget?: (targetId: string) => void;
  /** Callback when combat animation completes */
  onAnimationComplete?: () => void;
}

export interface CombatArenaProps {
  type: ArenaType;
  width?: number;
  depth?: number;
}

export interface CombatantMeshProps {
  combatant: Combatant;
  position: Position3D;
  isSelected: boolean;
  isTargeted: boolean;
  animation: CombatantAnimation;
  onClick?: () => void;
}

export interface CombatCameraProps {
  mode: CameraMode;
  focusPosition?: Position3D;
  shake?: CameraShake;
}

export interface CombatEffectsProps {
  damageNumbers: DamageNumber[];
  hitEffects: HitEffect[];
  lastResult?: CombatResult;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ARENA_CONFIG: Record<ArenaType, ArenaConfig> = {
  desert: {
    type: 'desert',
    groundColor: '#8b7355',
    ambientColor: '#ffd89b',
    fogColor: '#c9b896',
    fogDensity: 0.015,
    propDensity: 0.3,
  },
  canyon: {
    type: 'canyon',
    groundColor: '#a0522d',
    ambientColor: '#ff8c69',
    fogColor: '#d2691e',
    fogDensity: 0.02,
    propDensity: 0.4,
  },
  town: {
    type: 'town',
    groundColor: '#a08060',
    ambientColor: '#ffe4c4',
    fogColor: '#d2b48c',
    fogDensity: 0.01,
    propDensity: 0.2,
  },
  mine: {
    type: 'mine',
    groundColor: '#4a4a4a',
    ambientColor: '#808080',
    fogColor: '#2f2f2f',
    fogDensity: 0.03,
    propDensity: 0.5,
  },
  forest: {
    type: 'forest',
    groundColor: '#556b2f',
    ambientColor: '#98fb98',
    fogColor: '#228b22',
    fogDensity: 0.025,
    propDensity: 0.6,
  },
  boss: {
    type: 'boss',
    groundColor: '#2f1f1f',
    ambientColor: '#ff4500',
    fogColor: '#1a0a0a',
    fogDensity: 0.02,
    propDensity: 0.1,
  },
};

export const COMBAT_POSITIONS: CombatPositions = {
  player: { x: -5, y: 0, z: 0 },
  companions: [
    { x: -7, y: 0, z: -2 },
    { x: -7, y: 0, z: 2 },
  ],
  enemies: [
    { x: 5, y: 0, z: -3 },
    { x: 5, y: 0, z: -1 },
    { x: 5, y: 0, z: 1 },
    { x: 5, y: 0, z: 3 },
  ],
};

export const ANIMATION_DURATIONS: Record<CombatantAnimation, number> = {
  idle: 0,
  attack: 600,
  hit: 400,
  defend: 500,
  death: 1000,
  victory: 1500,
  dodge: 400,
};
