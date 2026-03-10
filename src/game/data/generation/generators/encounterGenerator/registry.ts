/**
 * Encounter Template Registry - Template storage and query functions
 */

import type { EncounterTemplate } from '../../../schemas/generation';

// Template registries
let ENCOUNTER_TEMPLATES: EncounterTemplate[] = [];
let ENEMY_TEMPLATES_INITIALIZED = false;

/**
 * Initialize encounter templates
 */
export function initEncounterTemplates(templates: EncounterTemplate[]): void {
  ENCOUNTER_TEMPLATES = templates;
}

/**
 * Mark enemy templates as initialized (they are loaded via module import)
 */
export function initEnemyTemplates(): void {
  ENEMY_TEMPLATES_INITIALIZED = true;
}

/**
 * Check if enemy templates are initialized
 */
export function areEnemyTemplatesInitialized(): boolean {
  return ENEMY_TEMPLATES_INITIALIZED;
}

/**
 * Get encounter templates registry (for use in core generation)
 */
export function getEncounterTemplatesRegistry(): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES;
}

/**
 * Get encounter template by ID
 */
export function getEncounterTemplate(id: string): EncounterTemplate | undefined {
  return ENCOUNTER_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get encounters valid for a biome
 */
export function getEncountersForBiome(biome: string): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(
    (t) => t.validBiomes.length === 0 || t.validBiomes.includes(biome)
  );
}

/**
 * Get encounters within a difficulty range
 */
export function getEncountersForDifficulty(minDiff: number, maxDiff: number): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(
    (t) => t.difficultyRange[0] <= maxDiff && t.difficultyRange[1] >= minDiff
  );
}

/**
 * Get encounters valid for a location type
 */
export function getEncountersForLocation(locationType: string): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(
    (t) => t.validLocationTypes.length === 0 || t.validLocationTypes.includes(locationType)
  );
}

/**
 * Get encounters valid for time of day
 */
export function getEncountersForTime(timeOfDay: string): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(
    (t) => t.validTimeOfDay.length === 0 || t.validTimeOfDay.includes(timeOfDay)
  );
}
