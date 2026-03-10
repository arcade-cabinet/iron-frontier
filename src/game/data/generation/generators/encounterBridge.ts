/**
 * Encounter Bridge - Converts procedural GeneratedEncounter to CombatEncounter
 *
 * The procedural encounter generator produces rich GeneratedEncounter objects
 * with scaled enemies, but the combat system expects CombatEncounter objects
 * from the static registry. This bridge:
 * 1. Converts GeneratedEncounter -> CombatEncounter
 * 2. Registers the encounter so getEncounterById can find it
 * 3. Maps enemy template IDs to EnemyDefinition IDs (or registers dynamic enemies)
 *
 * @module data/generation/generators/encounterBridge
 */

import type { CombatEncounter, EnemyDefinition, EnemyFaction, EnemyType } from '../../schemas/combat';
import { registerEncounter, getEnemyById, ENEMIES_BY_ID } from '../../enemies';
import type { GeneratedEncounter, GeneratedEnemy } from './encounterGenerator';

/** Valid EnemyType values from the Zod schema */
const VALID_ENEMY_TYPES: Set<string> = new Set([
  'bandit', 'gunslinger', 'brute', 'sharpshooter', 'dynamiter', 'automaton', 'animal',
]);

/** Valid EnemyFaction values from the Zod schema */
const VALID_FACTIONS: Set<string> = new Set([
  'copperhead', 'ivrc_guards', 'wildlife', 'remnant', 'raiders',
]);

/**
 * Infer a valid EnemyType from the generated enemy's tags and type info.
 */
function inferEnemyType(enemy: GeneratedEnemy): EnemyType {
  // Check if enemyType directly matches a valid type
  if (VALID_ENEMY_TYPES.has(enemy.enemyType)) return enemy.enemyType as EnemyType;

  // Infer from combat/behavior tags
  const allTags = [...enemy.combatTags, ...enemy.behaviorTags];
  if (allTags.includes('automaton') || allTags.includes('mechanical')) return 'automaton';
  if (allTags.includes('animal') || allTags.includes('beast')) return 'animal';
  if (allTags.includes('sharpshooter') || allTags.includes('sniper')) return 'sharpshooter';
  if (allTags.includes('explosives') || allTags.includes('dynamite')) return 'dynamiter';
  if (allTags.includes('brute') || allTags.includes('tank')) return 'brute';
  if (allTags.includes('ranged') || allTags.includes('gunslinger')) return 'gunslinger';

  console.error(`[encounterBridge] Could not infer enemy type for "${enemy.enemyType}" with tags: ${allTags.join(', ')}`);
  return 'bandit';
}

/**
 * Infer a valid EnemyFaction from the generated enemy's tags.
 */
function inferFaction(enemy: GeneratedEnemy): EnemyFaction {
  const allTags = [...enemy.combatTags, ...enemy.behaviorTags];
  for (const tag of allTags) {
    if (VALID_FACTIONS.has(tag)) return tag as EnemyFaction;
  }
  // Check partial matches
  if (allTags.some((t) => t.includes('copperhead'))) return 'copperhead';
  if (allTags.some((t) => t.includes('ivrc'))) return 'ivrc_guards';
  if (allTags.some((t) => t.includes('remnant'))) return 'remnant';
  if (allTags.some((t) => t.includes('animal') || t.includes('wildlife'))) return 'wildlife';

  console.error(`[encounterBridge] Could not infer faction for enemy with tags: ${allTags.join(', ')}`);
  return 'raiders';
}

/**
 * Map from procedural enemy template IDs to static EnemyDefinition IDs.
 *
 * The procedural encounter templates reference enemyIdOrTag values
 * (e.g., 'bandit_gunman', 'desert_wolf') which happen to match the
 * static EnemyDefinition IDs in enemies/index.ts. When a match exists,
 * we use the static definition. When it doesn't, we create a synthetic
 * EnemyDefinition from the generated stats.
 */
function ensureEnemyDefinition(enemy: GeneratedEnemy): string {
  // Check if a static enemy definition already exists
  const existing = getEnemyById(enemy.enemyType);
  if (existing) {
    return existing.id;
  }

  // Also check by templateId
  const byTemplate = getEnemyById(enemy.templateId);
  if (byTemplate) {
    return byTemplate.id;
  }

  // Create a synthetic EnemyDefinition from the generated stats
  // and register it for the combat system to use
  const syntheticDef: EnemyDefinition = {
    id: enemy.id,
    name: enemy.name,
    type: inferEnemyType(enemy),
    faction: inferFaction(enemy),
    maxHealth: enemy.maxHealth,
    actionPoints: 4, // Default AP
    baseDamage: enemy.damage,
    armor: enemy.armor,
    accuracyMod: Math.max(-50, Math.min(50, enemy.accuracy - 70)),
    evasion: Math.max(0, Math.min(100, enemy.evasion)),
    xpReward: enemy.xpValue,
    goldReward: 0,
    behavior: enemy.behaviorTags.includes('aggressive')
      ? 'aggressive'
      : enemy.behaviorTags.includes('defensive')
        ? 'defensive'
        : 'ranged',
    description: `A level ${enemy.level} ${enemy.name}.`,
    tags: [...enemy.combatTags],
    lootTableId: enemy.lootTableId,
  };

  // Register in the global enemy lookup
  ENEMIES_BY_ID[syntheticDef.id] = syntheticDef;

  return syntheticDef.id;
}

/**
 * Convert a procedurally generated encounter into a CombatEncounter
 * that the combat system can consume, and register it in the encounter registry.
 *
 * @returns The CombatEncounter ID (same as encounter.id)
 */
export function bridgeGeneratedEncounter(encounter: GeneratedEncounter): string {
  // Group enemies by their resolved definition ID and count them
  const enemyGroups = new Map<string, { enemyId: string; count: number; level: number }>();

  for (const enemy of encounter.enemies) {
    const defId = ensureEnemyDefinition(enemy);
    const existing = enemyGroups.get(defId);
    if (existing) {
      existing.count += 1;
    } else {
      enemyGroups.set(defId, {
        enemyId: defId,
        count: 1,
        level: enemy.level,
      });
    }
  }

  const combatEncounter: CombatEncounter = {
    id: encounter.id,
    name: encounter.name,
    description: encounter.description,
    enemies: Array.from(enemyGroups.values()).map((g) => ({
      enemyId: g.enemyId,
      count: g.count,
      level: g.level,
    })),
    minLevel: 1,
    isBoss: encounter.tags.includes('boss') || encounter.tags.includes('mini_boss'),
    canFlee: !encounter.tags.includes('boss'),
    rewards: {
      xp: encounter.xpReward,
      gold: encounter.goldReward,
      items: [], // Loot tables are resolved separately
    },
    tags: [...encounter.tags, 'procedural'],
  };

  // Register so getEncounterById can find it
  registerEncounter(combatEncounter);

  return combatEncounter.id;
}
