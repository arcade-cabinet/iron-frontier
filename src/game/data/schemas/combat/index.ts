/**
 * Combat Schemas - Barrel export
 */

export {
  CombatActionSchema,
  CombatActionTypeSchema,
  CombatantSchema,
  CombatEncounterSchema,
  CombatResultSchema,
  CombatStateSchema,
  EnemyDefinitionSchema,
  EnemyFactionSchema,
  EnemyTypeSchema,
} from './schemas.ts';
export type {
  CombatAction,
  CombatActionType,
  Combatant,
  CombatEncounter,
  CombatResult,
  CombatState,
  EnemyDefinition,
  EnemyFaction,
  EnemyType,
} from './schemas.ts';

export {
  AP_COSTS,
  calculateDamage,
  calculateHitChance,
  COMBAT_SCHEMA_VERSION,
  rollCritical,
  rollHit,
  validateCombatEncounter,
  validateCombatState,
  validateEnemyDefinition,
} from './formulas.ts';
