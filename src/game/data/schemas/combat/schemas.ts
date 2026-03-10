/**
 * Combat Schema Definitions - Enemy, combatant, action, result, encounter, state
 */

import { z } from 'zod';
import { HexCoordSchema } from '../spatial.ts';

// ============================================================================
// ENEMY TYPE & FACTION
// ============================================================================

export const EnemyTypeSchema = z.enum([
  'bandit', 'gunslinger', 'brute', 'sharpshooter',
  'dynamiter', 'automaton', 'animal',
]);
export type EnemyType = z.infer<typeof EnemyTypeSchema>;

export const EnemyFactionSchema = z.enum([
  'copperhead', 'ivrc_guards', 'wildlife', 'remnant', 'raiders',
]);
export type EnemyFaction = z.infer<typeof EnemyFactionSchema>;

// ============================================================================
// ENEMY DEFINITION
// ============================================================================

export const EnemyDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: EnemyTypeSchema,
  faction: EnemyFactionSchema,
  maxHealth: z.number().int().min(1),
  actionPoints: z.number().int().min(1).max(10).default(4),
  baseDamage: z.number().int().min(0).default(5),
  armor: z.number().int().min(0).default(0),
  accuracyMod: z.number().int().min(-50).max(50).default(0),
  evasion: z.number().int().min(0).max(100).default(10),
  weaponId: z.string().optional(),
  xpReward: z.number().int().min(0).default(10),
  goldReward: z.number().int().min(0).default(0),
  lootTableId: z.string().optional(),
  behavior: z.enum(['aggressive', 'defensive', 'ranged', 'support']).default('aggressive'),
  description: z.string().optional(),
  modelId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
export type EnemyDefinition = z.infer<typeof EnemyDefinitionSchema>;

// ============================================================================
// COMBATANT (Runtime State)
// ============================================================================

export const CombatantSchema = z.object({
  definitionId: z.string(),
  name: z.string(),
  isPlayer: z.boolean(),
  health: z.number().int(),
  maxHealth: z.number().int(),
  actionPoints: z.number().int(),
  maxActionPoints: z.number().int(),
  position: HexCoordSchema,
  statusEffects: z
    .array(z.object({
      type: z.enum(['bleeding', 'stunned', 'poisoned', 'burning', 'buffed']),
      turnsRemaining: z.number().int(),
      value: z.number().int().optional(),
    }))
    .default([]),
  weaponId: z.string().optional(),
  ammoInClip: z.number().int().default(0),
  isActive: z.boolean().default(false),
  hasActed: z.boolean().default(false),
  isDead: z.boolean().default(false),
});
export type Combatant = z.infer<typeof CombatantSchema>;

// ============================================================================
// COMBAT ACTION & RESULT
// ============================================================================

export const CombatActionTypeSchema = z.enum([
  'attack', 'aimed_shot', 'move', 'reload', 'use_item',
  'defend', 'flee', 'end_turn', 'quick_draw', 'overwatch',
  'first_aid', 'intimidate',
]);
export type CombatActionType = z.infer<typeof CombatActionTypeSchema>;

export const CombatActionSchema = z.object({
  type: CombatActionTypeSchema,
  actorId: z.string(),
  targetId: z.string().optional(),
  targetHex: HexCoordSchema.optional(),
  itemId: z.string().optional(),
  apCost: z.number().int().min(0),
  timestamp: z.number(),
});
export type CombatAction = z.infer<typeof CombatActionSchema>;

export const CombatResultSchema = z.object({
  action: CombatActionSchema,
  success: z.boolean(),
  damage: z.number().int().optional(),
  isCritical: z.boolean().default(false),
  wasDodged: z.boolean().default(false),
  message: z.string(),
  targetHealthRemaining: z.number().int().optional(),
  statusEffect: z.string().optional(),
});
export type CombatResult = z.infer<typeof CombatResultSchema>;

// ============================================================================
// COMBAT ENCOUNTER & STATE
// ============================================================================

export const CombatEncounterSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  enemies: z
    .array(z.object({
      enemyId: z.string(),
      count: z.number().int().min(1).default(1),
      level: z.number().int().min(1).optional(),
    }))
    .min(1),
  minLevel: z.number().int().min(1).default(1),
  isBoss: z.boolean().default(false),
  canFlee: z.boolean().default(true),
  musicId: z.string().optional(),
  arenaId: z.string().optional(),
  rewards: z.object({
    xp: z.number().int().min(0).default(0),
    gold: z.number().int().min(0).default(0),
    items: z
      .array(z.object({
        itemId: z.string(),
        quantity: z.number().int().min(1).default(1),
        chance: z.number().min(0).max(1).default(1),
      }))
      .default([]),
  }),
  tags: z.array(z.string()).default([]),
});
export type CombatEncounter = z.infer<typeof CombatEncounterSchema>;

export const CombatStateSchema = z.object({
  encounterId: z.string(),
  phase: z.enum(['starting', 'player_turn', 'enemy_turn', 'victory', 'defeat', 'fled']),
  combatants: z.array(CombatantSchema),
  turnOrder: z.array(z.string()),
  currentTurnIndex: z.number().int().min(0),
  round: z.number().int().min(1),
  log: z.array(CombatResultSchema),
  startedAt: z.number(),
  selectedAction: CombatActionTypeSchema.optional(),
  selectedTargetId: z.string().optional(),
});
export type CombatState = z.infer<typeof CombatStateSchema>;
