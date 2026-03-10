/**
 * Encounter Generator - Barrel export for procedural encounter generation
 */

// Types
export { type GeneratedEncounter, type GeneratedEnemy } from './types.ts';

// Registry
export {
  areEnemyTemplatesInitialized,
  getEncounterTemplate,
  getEncountersForBiome,
  getEncountersForDifficulty,
  getEncountersForLocation,
  getEncountersForTime,
  getEncounterTemplatesRegistry,
  initEncounterTemplates,
  initEnemyTemplates,
} from './registry.ts';

// Core generation
export {
  generateEncounter,
  generateRandomEncounter,
  shouldTriggerEncounter,
} from './encounterCore.ts';
