/**
 * Combat Stats & Status Effect Types
 */

// ============================================================================
// STATUS EFFECTS
// ============================================================================

/**
 * Status effect types that can be applied to combatants
 */
export type StatusEffectType =
  | 'poisoned' // Damage over time
  | 'stunned' // Skip next turn
  | 'burning' // Damage over time, higher than poison
  | 'bleeding' // Damage over time, scales with movement
  | 'buffed' // Increased stats
  | 'debuffed' // Decreased stats
  | 'defending'; // Reduced incoming damage

/**
 * A status effect instance on a combatant
 */
export interface StatusEffect {
  /** Type of the effect */
  type: StatusEffectType;
  /** Remaining turns for this effect */
  turnsRemaining: number;
  /** Value/magnitude of the effect (damage per turn, stat modifier, etc.) */
  value: number;
  /** Source of the effect (for stacking rules) */
  sourceId?: string;
}

// ============================================================================
// COMBAT STATS
// ============================================================================

/**
 * Combat statistics for a combatant
 */
export interface CombatStats {
  /** Current health points */
  hp: number;
  /** Maximum health points */
  maxHP: number;
  /** Attack power (base damage modifier) */
  attack: number;
  /** Defense (damage reduction) */
  defense: number;
  /** Speed (determines turn order) */
  speed: number;
  /** Accuracy (hit chance modifier, 0-100 scale) */
  accuracy: number;
  /** Evasion (dodge chance, 0-100 scale) */
  evasion: number;
  /** Critical hit chance (0-100 scale) */
  critChance: number;
  /** Critical hit damage multiplier */
  critMultiplier: number;
}

/**
 * Default combat stats for a level 1 player
 */
export const DEFAULT_PLAYER_COMBAT_STATS: CombatStats = {
  hp: 100,
  maxHP: 100,
  attack: 10,
  defense: 5,
  speed: 10,
  accuracy: 75,
  evasion: 10,
  critChance: 10,
  critMultiplier: 1.5,
};
