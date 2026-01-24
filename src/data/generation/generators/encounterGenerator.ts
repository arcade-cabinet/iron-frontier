/**
 * Encounter Generator - Procedural combat encounter generation
 *
 * Creates contextual combat encounters based on location, time, and difficulty.
 */

import { SeededRandom } from '../seededRandom';
import {
  type EncounterTemplate,
  type GenerationContext,
  substituteTemplate,
} from '../../schemas/generation';

// Template registry
let ENCOUNTER_TEMPLATES: EncounterTemplate[] = [];

/**
 * Initialize encounter templates
 */
export function initEncounterTemplates(templates: EncounterTemplate[]): void {
  ENCOUNTER_TEMPLATES = templates;
}

/**
 * Generated enemy in encounter
 */
export interface GeneratedEnemy {
  id: string;
  enemyType: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  damage: number;
  armor: number;
  tags: string[];
}

/**
 * Generated encounter data
 */
export interface GeneratedEncounter {
  id: string;
  templateId: string;
  name: string;
  description: string;
  enemies: GeneratedEnemy[];
  difficulty: number;
  xpReward: number;
  goldReward: number;
  lootTableId?: string;
  tags: string[];
  seed: number;
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
export function getEncountersForDifficulty(
  minDiff: number,
  maxDiff: number
): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(
    (t) => t.difficultyRange[0] <= maxDiff && t.difficultyRange[1] >= minDiff
  );
}

/**
 * Get encounters valid for a location type
 */
export function getEncountersForLocation(locationType: string): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(
    (t) =>
      t.validLocationTypes.length === 0 ||
      t.validLocationTypes.includes(locationType)
  );
}

/**
 * Get encounters valid for time of day
 */
export function getEncountersForTime(timeOfDay: string): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(
    (t) =>
      t.validTimeOfDay.length === 0 || t.validTimeOfDay.includes(timeOfDay)
  );
}

/**
 * Base enemy stats by type (would normally come from enemy definitions)
 */
const BASE_ENEMY_STATS: Record<string, { health: number; damage: number; armor: number }> = {
  bandit: { health: 30, damage: 8, armor: 2 },
  bandit_leader: { health: 50, damage: 12, armor: 5 },
  coyote: { health: 15, damage: 5, armor: 0 },
  rattlesnake: { health: 8, damage: 10, armor: 0 }, // Poison damage
  bear: { health: 80, damage: 15, armor: 3 },
  scorpion: { health: 5, damage: 8, armor: 1 },
  rustler: { health: 25, damage: 7, armor: 2 },
  mercenary: { health: 40, damage: 10, armor: 4 },
  automaton: { health: 60, damage: 12, armor: 8 },
  deputy_corrupt: { health: 35, damage: 9, armor: 3 },
  prospector_hostile: { health: 20, damage: 6, armor: 1 },
  default: { health: 25, damage: 8, armor: 2 },
};

/**
 * Enemy name prefixes for variety
 */
const ENEMY_PREFIXES: Record<string, string[]> = {
  bandit: ['Dusty', 'One-Eyed', 'Quick-Draw', 'Scarred', 'Mean'],
  bandit_leader: ['Boss', 'Captain', 'Chief', 'Big'],
  coyote: ['Mangy', 'Hungry', 'Wild', 'Gray'],
  bear: ['Grizzled', 'Massive', 'Angry', 'Old'],
  mercenary: ['Hired', 'Cold', 'Professional', 'Silent'],
  default: ['Hostile', 'Aggressive', 'Wild'],
};

/**
 * Generate an enemy from template data
 */
function generateEnemy(
  rng: SeededRandom,
  enemyIdOrTag: string,
  levelScale: number,
  playerLevel: number,
  index: number
): GeneratedEnemy {
  const baseStats = BASE_ENEMY_STATS[enemyIdOrTag] ?? BASE_ENEMY_STATS.default;
  const prefixes = ENEMY_PREFIXES[enemyIdOrTag] ?? ENEMY_PREFIXES.default;

  // Scale level based on player and template scale
  const level = Math.max(1, Math.round(playerLevel * levelScale));
  const levelMultiplier = 1 + (level - 1) * 0.15;

  // Generate scaled stats
  const health = Math.round(baseStats.health * levelMultiplier);
  const damage = Math.round(baseStats.damage * levelMultiplier);
  const armor = Math.round(baseStats.armor * (1 + (level - 1) * 0.1));

  // Generate name
  const prefix = rng.pick(prefixes);
  const name = `${prefix} ${enemyIdOrTag.replace(/_/g, ' ')}`;

  return {
    id: `enemy_${index}_${rng.int(0, 0xffff).toString(16)}`,
    enemyType: enemyIdOrTag,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    level,
    health,
    maxHealth: health,
    damage,
    armor,
    tags: [enemyIdOrTag],
  };
}

/**
 * Generate an encounter from a template
 */
export function generateEncounter(
  rng: SeededRandom,
  template: EncounterTemplate,
  context: GenerationContext
): GeneratedEncounter {
  const encounterSeed = rng.int(0, 0xffffffff);
  const encounterRng = new SeededRandom(encounterSeed);

  // Generate enemies
  const enemies: GeneratedEnemy[] = [];
  let enemyIndex = 0;

  for (const enemyDef of template.enemies) {
    const count = encounterRng.int(
      enemyDef.countRange[0],
      enemyDef.countRange[1]
    );

    for (let i = 0; i < count; i++) {
      const enemy = generateEnemy(
        encounterRng,
        enemyDef.enemyIdOrTag,
        enemyDef.levelScale,
        context.playerLevel,
        enemyIndex++
      );
      enemies.push(enemy);
    }
  }

  // Calculate actual difficulty based on enemies
  const totalEnemyPower = enemies.reduce(
    (sum, e) => sum + e.health + e.damage * 3 + e.armor * 2,
    0
  );
  const difficulty = Math.min(
    10,
    Math.round(totalEnemyPower / (context.playerLevel * 50))
  );

  // Scale rewards by difficulty and player level
  const rewardMultiplier = 1 + (context.playerLevel - 1) * 0.2;
  const xpReward = Math.round(
    encounterRng.int(template.xpRange[0], template.xpRange[1]) *
      rewardMultiplier *
      (1 + difficulty * 0.1)
  );
  const goldReward = Math.round(
    encounterRng.int(template.goldRange[0], template.goldRange[1]) *
      rewardMultiplier
  );

  // Build description variables
  const variables: Record<string, string> = {
    enemyCount: enemies.length.toString(),
    difficulty: difficulty.toString(),
    location: context.locationId ?? 'the area',
    region: context.regionId ?? 'these parts',
  };

  const description = substituteTemplate(template.descriptionTemplate, variables);

  return {
    id: `enc_${encounterSeed.toString(16)}`,
    templateId: template.id,
    name: template.name,
    description,
    enemies,
    difficulty,
    xpReward,
    goldReward,
    lootTableId: template.lootTableId,
    tags: [...template.tags],
    seed: encounterSeed,
  };
}

/**
 * Generate a random encounter appropriate for the context
 */
export function generateRandomEncounter(
  rng: SeededRandom,
  context: GenerationContext,
  options: {
    biome?: string;
    locationType?: string;
    timeOfDay?: string;
    minDifficulty?: number;
    maxDifficulty?: number;
  } = {}
): GeneratedEncounter | null {
  let validTemplates = [...ENCOUNTER_TEMPLATES];

  // Apply filters
  if (options.biome) {
    validTemplates = validTemplates.filter(
      (t) => t.validBiomes.length === 0 || t.validBiomes.includes(options.biome!)
    );
  }

  if (options.locationType) {
    validTemplates = validTemplates.filter(
      (t) =>
        t.validLocationTypes.length === 0 ||
        t.validLocationTypes.includes(options.locationType!)
    );
  }

  if (options.timeOfDay) {
    validTemplates = validTemplates.filter(
      (t) =>
        t.validTimeOfDay.length === 0 ||
        t.validTimeOfDay.includes(options.timeOfDay!)
    );
  }

  const minDiff = options.minDifficulty ?? 1;
  const maxDiff = options.maxDifficulty ?? 10;
  validTemplates = validTemplates.filter(
    (t) => t.difficultyRange[0] <= maxDiff && t.difficultyRange[1] >= minDiff
  );

  if (validTemplates.length === 0) {
    return null;
  }

  const template = rng.pick(validTemplates);
  return generateEncounter(rng, template, context);
}

/**
 * Check if an encounter should trigger based on context
 */
export function shouldTriggerEncounter(
  rng: SeededRandom,
  context: GenerationContext,
  baseChance: number = 0.15
): boolean {
  // Modify chance based on context
  let chance = baseChance;

  // Time of day affects encounter rate
  if (context.gameHour < 6 || context.gameHour > 20) {
    chance *= 1.5; // More dangerous at night
  }

  // Faction tensions affect encounter rate
  for (const tension of Object.values(context.factionTensions)) {
    if (tension > 0.5) {
      chance *= 1 + (tension - 0.5);
    }
  }

  // Active events can affect rate
  if (context.activeEvents.includes('gang_war')) {
    chance *= 2;
  }
  if (context.activeEvents.includes('law_crackdown')) {
    chance *= 0.5;
  }

  return rng.bool(Math.min(chance, 0.8));
}
