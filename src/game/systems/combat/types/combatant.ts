/**
 * Combat Combatant & Action Types
 */

import type { HexCoord } from '../../../data/schemas/spatial.ts';
import type { CombatStats, StatusEffect } from './stats.ts';

// ============================================================================
// COMBATANT
// ============================================================================

/**
 * Combatant type identifier
 */
export type CombatantType = 'player' | 'enemy' | 'ally';

/**
 * A participant in combat
 */
export interface Combatant {
  /** Unique identifier for this combatant instance */
  id: string;
  /** Reference to the definition (enemy ID, 'player', or ally ID) */
  definitionId: string;
  /** Display name */
  name: string;
  /** Type of combatant */
  type: CombatantType;
  /** Is this the player character? */
  isPlayer: boolean;
  /** Combat statistics */
  stats: CombatStats;
  /** Current active status effects */
  statusEffects: StatusEffect[];
  /** Position on combat grid (if using positional combat) */
  position: HexCoord;
  /** Currently equipped weapon ID */
  weaponId: string | null;
  /** Remaining ammo in clip (for ranged weapons) */
  ammoInClip: number;
  /** Is this combatant alive? */
  isAlive: boolean;
  /** Has this combatant acted this turn? */
  hasActedThisTurn: boolean;
  /** AI behavior type (for enemies) */
  behavior?: 'aggressive' | 'defensive' | 'ranged' | 'random' | 'support';
  /** Model ID for rendering */
  modelId?: string;
  /** XP reward when defeated (enemies only) */
  xpReward?: number;
  /** Gold reward when defeated (enemies only) */
  goldReward?: number;
  /** Loot table ID (enemies only) */
  lootTableId?: string;
}

// ============================================================================
// COMBAT ACTIONS
// ============================================================================

/**
 * Types of actions a combatant can take
 */
export type CombatActionType =
  | 'attack' // Basic attack
  | 'defend' // Defensive stance (reduce damage)
  | 'item' // Use a consumable item
  | 'flee' // Attempt to escape
  | 'skill'; // Special ability (future expansion)

/**
 * A combat action to be executed
 */
export interface CombatAction {
  /** Type of action */
  type: CombatActionType;
  /** ID of the combatant performing the action */
  actorId: string;
  /** ID of the target combatant (if applicable) */
  targetId?: string;
  /** ID of the item being used (for 'item' action) */
  itemId?: string;
  /** ID of the skill being used (for 'skill' action) */
  skillId?: string;
}
