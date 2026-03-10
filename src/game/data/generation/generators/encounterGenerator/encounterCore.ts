/**
 * Encounter Core - Encounter and enemy generation logic
 */

import {
  type EncounterTemplate,
  type GenerationContext,
  substituteTemplate,
} from '../../../schemas/generation';
import { SeededRandom } from '../../seededRandom';
import {
  calculateScaledStats,
  DEFAULT_ENEMY_TEMPLATE,
  type EnemyTemplate,
  getEnemyTemplate,
} from '../../templates/enemyTemplates';
import { getEncounterTemplatesRegistry } from './registry.ts';
import type { GeneratedEncounter, GeneratedEnemy } from './types.ts';

/**
 * Generate an enemy name from template name pools
 */
function generateEnemyName(rng: SeededRandom, template: EnemyTemplate): string {
  const { prefixes, titles, suffixes } = template.namePool;

  // Build name from available pools
  const parts: string[] = [];

  // Add prefix (50% chance if available)
  if (prefixes.length > 0 && rng.bool(0.5)) {
    parts.push(rng.pick(prefixes));
  }

  // Add title if available and no prefix was added (30% chance)
  if (parts.length === 0 && titles.length > 0 && rng.bool(0.3)) {
    parts.push(rng.pick(titles));
  }

  // Add base name
  parts.push(template.name);

  // Add suffix (20% chance if available)
  if (suffixes.length > 0 && rng.bool(0.2)) {
    parts.push(rng.pick(suffixes));
  }

  return parts.join(' ');
}

/**
 * Apply random stat variation to scaled stats
 */
function applyStatVariation(
  rng: SeededRandom,
  value: number,
  variationPercent: number = 0.1
): number {
  const variation = 1 + rng.float(-variationPercent, variationPercent);
  return Math.max(1, Math.round(value * variation));
}

/**
 * Generate an enemy from template data using the enemy template system
 */
function generateEnemy(
  rng: SeededRandom,
  enemyIdOrTag: string,
  levelScale: number,
  playerLevel: number,
  index: number
): GeneratedEnemy {
  // Look up the enemy template
  const template = getEnemyTemplate(enemyIdOrTag) ?? DEFAULT_ENEMY_TEMPLATE;

  // Calculate actual enemy level based on player level and scale factor
  const baseLevel = Math.max(1, Math.round(playerLevel * levelScale));
  // Clamp to template's valid level range
  const level = Math.max(template.minLevel, Math.min(template.maxLevel, baseLevel));

  // Calculate scaled stats
  const scaledStats = calculateScaledStats(template, level);

  // Apply random variation to stats (10% variance)
  const health = applyStatVariation(rng, scaledStats.health);
  const damage = applyStatVariation(rng, scaledStats.damage);
  const armor = applyStatVariation(rng, scaledStats.armor, 0.05);
  const accuracy = Math.min(100, applyStatVariation(rng, scaledStats.accuracy, 0.05));
  const evasion = Math.min(100, applyStatVariation(rng, scaledStats.evasion, 0.05));

  // Generate name
  const name = generateEnemyName(rng, template);

  // Calculate XP value
  const baseXP = Math.round((health * 0.5 + damage * 2 + armor * 1.5) * template.xpModifier);
  const levelXP = Math.round(baseXP * (1 + (level - 1) * 0.15));

  return {
    id: `enemy_${index}_${rng.int(0, 0xffff).toString(16)}`,
    enemyType: enemyIdOrTag,
    templateId: template.id,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    level,
    health,
    maxHealth: health,
    damage,
    armor,
    accuracy,
    evasion,
    behaviorTags: [...template.behaviorTags],
    combatTags: [...template.combatTags],
    xpValue: levelXP,
    lootTableId: template.lootTableId,
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
    const count = encounterRng.int(enemyDef.countRange[0], enemyDef.countRange[1]);

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
  const difficulty = Math.min(10, Math.round(totalEnemyPower / (context.playerLevel * 50)));

  // Scale rewards by difficulty and player level
  const rewardMultiplier = 1 + (context.playerLevel - 1) * 0.2;
  const xpReward = Math.round(
    encounterRng.int(template.xpRange[0], template.xpRange[1]) *
      rewardMultiplier *
      (1 + difficulty * 0.1)
  );
  const goldReward = Math.round(
    encounterRng.int(template.goldRange[0], template.goldRange[1]) * rewardMultiplier
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
  let validTemplates = [...getEncounterTemplatesRegistry()];

  // Apply filters
  if (options.biome) {
    validTemplates = validTemplates.filter(
      (t) => t.validBiomes.length === 0 || t.validBiomes.includes(options.biome!)
    );
  }

  if (options.locationType) {
    validTemplates = validTemplates.filter(
      (t) =>
        t.validLocationTypes.length === 0 || t.validLocationTypes.includes(options.locationType!)
    );
  }

  if (options.timeOfDay) {
    validTemplates = validTemplates.filter(
      (t) => t.validTimeOfDay.length === 0 || t.validTimeOfDay.includes(options.timeOfDay!)
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
