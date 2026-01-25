/**
 * Iron Frontier - Combat Schema Definitions
 *
 * Defines combat encounters, enemy types, and battle mechanics.
 * Combat is turn-based with action points, similar to Fallout 1/2.
 */

import { z } from 'zod';
import { HexCoordSchema } from './spatial';

// ============================================================================
// ENEMY TYPE
// ============================================================================

export const EnemyTypeSchema = z.enum([
  'bandit',         // Generic outlaw
  'gunslinger',     // Fast, accurate shooter
  'brute',          // High HP, melee focused
  'sharpshooter',   // Long range, high damage
  'dynamiter',      // Explosives user
  'automaton',      // Mechanical enemies (The Remnant)
  'animal',         // Wildlife (wolves, snakes, etc.)
]);
export type EnemyType = z.infer<typeof EnemyTypeSchema>;

// ============================================================================
// ENEMY FACTION
// ============================================================================

export const EnemyFactionSchema = z.enum([
  'copperhead',     // Copperhead Gang
  'ivrc_guards',    // IVRC Security
  'wildlife',       // Animals
  'remnant',        // Automatons
  'raiders',        // Generic bandits
]);
export type EnemyFaction = z.infer<typeof EnemyFactionSchema>;

// ============================================================================
// ENEMY DEFINITION
// ============================================================================

export const EnemyDefinitionSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Enemy type classification */
  type: EnemyTypeSchema,

  /** Faction allegiance */
  faction: EnemyFactionSchema,

  /** Base health points */
  maxHealth: z.number().int().min(1),

  /** Action points per turn */
  actionPoints: z.number().int().min(1).max(10).default(4),

  /** Base damage (unarmed) */
  baseDamage: z.number().int().min(0).default(5),

  /** Armor/damage reduction */
  armor: z.number().int().min(0).default(0),

  /** Accuracy modifier (-50 to +50) */
  accuracyMod: z.number().int().min(-50).max(50).default(0),

  /** Evasion chance (0-100) */
  evasion: z.number().int().min(0).max(100).default(10),

  /** Primary weapon ID (from item library) */
  weaponId: z.string().optional(),

  /** Experience reward on defeat */
  xpReward: z.number().int().min(0).default(10),

  /** Gold dropped on defeat */
  goldReward: z.number().int().min(0).default(0),

  /** Loot table ID */
  lootTableId: z.string().optional(),

  /** AI behavior type */
  behavior: z.enum(['aggressive', 'defensive', 'ranged', 'support']).default('aggressive'),

  /** Description for UI */
  description: z.string().optional(),

  /** Sprite/model ID */
  spriteId: z.string().optional(),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type EnemyDefinition = z.infer<typeof EnemyDefinitionSchema>;

// ============================================================================
// COMBATANT (Runtime State)
// ============================================================================

export const CombatantSchema = z.object({
  /** Reference to definition (enemy ID or 'player') */
  definitionId: z.string(),

  /** Display name */
  name: z.string(),

  /** Is this the player? */
  isPlayer: z.boolean(),

  /** Current health */
  health: z.number().int(),

  /** Maximum health */
  maxHealth: z.number().int(),

  /** Remaining action points this turn */
  actionPoints: z.number().int(),

  /** Max action points per turn */
  maxActionPoints: z.number().int(),

  /** Position on combat grid */
  position: HexCoordSchema,

  /** Current status effects */
  statusEffects: z.array(z.object({
    type: z.enum(['bleeding', 'stunned', 'poisoned', 'burning', 'buffed']),
    turnsRemaining: z.number().int(),
    value: z.number().int().optional(),
  })).default([]),

  /** Weapon currently equipped */
  weaponId: z.string().optional(),

  /** Ammo remaining in clip */
  ammoInClip: z.number().int().default(0),

  /** Is this combatant's turn? */
  isActive: z.boolean().default(false),

  /** Has this combatant acted this round? */
  hasActed: z.boolean().default(false),

  /** Is dead? */
  isDead: z.boolean().default(false),
});
export type Combatant = z.infer<typeof CombatantSchema>;

// ============================================================================
// COMBAT ACTION
// ============================================================================

export const CombatActionTypeSchema = z.enum([
  'attack',       // Basic attack
  'aimed_shot',   // Accurate but costly
  'move',         // Move to hex
  'reload',       // Reload weapon
  'use_item',     // Use consumable
  'defend',       // Reduce incoming damage
  'flee',         // Attempt to escape
  'end_turn',     // End turn early
]);
export type CombatActionType = z.infer<typeof CombatActionTypeSchema>;

export const CombatActionSchema = z.object({
  type: CombatActionTypeSchema,

  /** Actor performing the action */
  actorId: z.string(),

  /** Target (for attacks, moves) */
  targetId: z.string().optional(),
  targetHex: HexCoordSchema.optional(),

  /** Item being used */
  itemId: z.string().optional(),

  /** Action point cost */
  apCost: z.number().int().min(0),

  /** Timestamp */
  timestamp: z.number(),
});
export type CombatAction = z.infer<typeof CombatActionSchema>;

// ============================================================================
// COMBAT RESULT
// ============================================================================

export const CombatResultSchema = z.object({
  /** Action that was performed */
  action: CombatActionSchema,

  /** Did the action succeed? */
  success: z.boolean(),

  /** Damage dealt (if attack) */
  damage: z.number().int().optional(),

  /** Was it a critical hit? */
  isCritical: z.boolean().default(false),

  /** Was it dodged? */
  wasDodged: z.boolean().default(false),

  /** Message to display */
  message: z.string(),

  /** Target's remaining health (if applicable) */
  targetHealthRemaining: z.number().int().optional(),

  /** Status effect applied */
  statusEffect: z.string().optional(),
});
export type CombatResult = z.infer<typeof CombatResultSchema>;

// ============================================================================
// COMBAT ENCOUNTER (Pre-configured battle)
// ============================================================================

export const CombatEncounterSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Description */
  description: z.string().optional(),

  /** Enemies in this encounter */
  enemies: z.array(z.object({
    enemyId: z.string(),
    count: z.number().int().min(1).default(1),
    level: z.number().int().min(1).optional(), // Level scaling
  })).min(1),

  /** Required player level (minimum) */
  minLevel: z.number().int().min(1).default(1),

  /** Is this a boss fight? */
  isBoss: z.boolean().default(false),

  /** Can player flee? */
  canFlee: z.boolean().default(true),

  /** Music track ID */
  musicId: z.string().optional(),

  /** Background/arena ID */
  arenaId: z.string().optional(),

  /** Rewards for winning */
  rewards: z.object({
    xp: z.number().int().min(0).default(0),
    gold: z.number().int().min(0).default(0),
    items: z.array(z.object({
      itemId: z.string(),
      quantity: z.number().int().min(1).default(1),
      chance: z.number().min(0).max(1).default(1),
    })).default([]),
  }),

  /** Tags for triggering */
  tags: z.array(z.string()).default([]),
});
export type CombatEncounter = z.infer<typeof CombatEncounterSchema>;

// ============================================================================
// COMBAT STATE (Runtime)
// ============================================================================

export const CombatStateSchema = z.object({
  /** Encounter being fought */
  encounterId: z.string(),

  /** Current phase */
  phase: z.enum(['starting', 'player_turn', 'enemy_turn', 'victory', 'defeat', 'fled']),

  /** All combatants */
  combatants: z.array(CombatantSchema),

  /** Turn order (combatant IDs) */
  turnOrder: z.array(z.string()),

  /** Current turn index */
  currentTurnIndex: z.number().int().min(0),

  /** Round number */
  round: z.number().int().min(1),

  /** Combat log */
  log: z.array(CombatResultSchema),

  /** When combat started */
  startedAt: z.number(),

  /** Selected action (for UI) */
  selectedAction: CombatActionTypeSchema.optional(),

  /** Selected target (for UI) */
  selectedTargetId: z.string().optional(),
});
export type CombatState = z.infer<typeof CombatStateSchema>;

// ============================================================================
// ACTION POINT COSTS
// ============================================================================

export const AP_COSTS: Record<CombatActionType, number> = {
  attack: 2,
  aimed_shot: 4,
  move: 1,
  reload: 2,
  use_item: 2,
  defend: 2,
  flee: 3,
  end_turn: 0,
};

// ============================================================================
// COMBAT FORMULAS
// ============================================================================

/**
 * Calculate hit chance
 */
export function calculateHitChance(
  attackerAccuracy: number,
  defenderEvasion: number,
  range: number,
  isAimedShot: boolean = false
): number {
  // Base hit chance from weapon accuracy
  let hitChance = attackerAccuracy;

  // Aimed shot bonus
  if (isAimedShot) {
    hitChance += 25;
  }

  // Range penalty (beyond optimal range)
  const rangePenalty = Math.max(0, (range - 3) * 5);
  hitChance -= rangePenalty;

  // Defender evasion
  hitChance -= defenderEvasion;

  // Clamp to valid range
  return Math.max(5, Math.min(95, hitChance));
}

/**
 * Calculate damage
 */
export function calculateDamage(
  baseDamage: number,
  attackerLevel: number,
  defenderArmor: number,
  isCritical: boolean = false
): number {
  // Base damage with level scaling
  let damage = baseDamage + Math.floor(attackerLevel / 2);

  // Critical hit doubles damage
  if (isCritical) {
    damage *= 2;
  }

  // Armor reduction
  damage = Math.max(1, damage - defenderArmor);

  return damage;
}

/**
 * Roll for critical hit (10% base chance)
 */
export function rollCritical(): boolean {
  return Math.random() < 0.1;
}

/**
 * Roll hit/miss based on hit chance
 */
export function rollHit(hitChance: number): boolean {
  return Math.random() * 100 < hitChance;
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateEnemyDefinition(data: unknown): EnemyDefinition {
  return EnemyDefinitionSchema.parse(data);
}

export function validateCombatEncounter(data: unknown): CombatEncounter {
  return CombatEncounterSchema.parse(data);
}

export function validateCombatState(data: unknown): CombatState {
  return CombatStateSchema.parse(data);
}

export const COMBAT_SCHEMA_VERSION = '1.0.0';
