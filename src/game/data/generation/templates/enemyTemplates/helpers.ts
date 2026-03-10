/**
 * Enemy Template Helpers - Registry, lookups, and calculations
 */

import type { BehaviorTag, EnemyStats, EnemyTemplate } from './schemas.ts';
import { BanditThugTemplate, BanditGunmanTemplate, BanditSharpshooterTemplate, BanditLeaderTemplate } from './bandits.ts';
import { DesertWolfTemplate, RattlesnakeTemplate, MountainLionTemplate, GrizzlyBearTemplate, ScorpionTemplate, VultureTemplate } from './wildlife.ts';
import { IVRCGuardTemplate, IVRCMarksmanTemplate, IVRCCaptainTemplate, CopperheadGunslingerTemplate, CopperheadEnforcerTemplate, CopperheadDynamiterTemplate } from './factions.ts';
import { RemnantScoutTemplate, RemnantSentryTemplate, RemnantJuggernautTemplate } from './remnants.ts';
import { RustlerTemplate, MercenaryTemplate, CorruptDeputyTemplate, HostileProspectorTemplate, DesperadoTemplate, GhostTownDwellerTemplate, TombRaiderTemplate } from './misc.ts';

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  // Bandits
  BanditThugTemplate,
  BanditGunmanTemplate,
  BanditSharpshooterTemplate,
  BanditLeaderTemplate,

  // Wildlife
  DesertWolfTemplate,
  RattlesnakeTemplate,
  MountainLionTemplate,
  GrizzlyBearTemplate,
  ScorpionTemplate,
  VultureTemplate,

  // IVRC Faction
  IVRCGuardTemplate,
  IVRCMarksmanTemplate,
  IVRCCaptainTemplate,

  // Copperhead Gang
  CopperheadGunslingerTemplate,
  CopperheadEnforcerTemplate,
  CopperheadDynamiterTemplate,

  // Remnant Automatons
  RemnantScoutTemplate,
  RemnantSentryTemplate,
  RemnantJuggernautTemplate,

  // Miscellaneous
  RustlerTemplate,
  MercenaryTemplate,
  CorruptDeputyTemplate,
  HostileProspectorTemplate,
  DesperadoTemplate,
  GhostTownDwellerTemplate,
  TombRaiderTemplate,
];

// ============================================================================
// LOOKUP MAPS
// ============================================================================

/** Map of template ID to template for quick lookup */
const TEMPLATES_BY_ID = new Map<string, EnemyTemplate>(ENEMY_TEMPLATES.map((t) => [t.id, t]));

/** Map of faction to templates */
const TEMPLATES_BY_FACTION = new Map<string, EnemyTemplate[]>();
for (const template of ENEMY_TEMPLATES) {
  for (const faction of template.factions) {
    const existing = TEMPLATES_BY_FACTION.get(faction) || [];
    existing.push(template);
    TEMPLATES_BY_FACTION.set(faction, existing);
  }
}

/** Map of combat tag to templates */
const TEMPLATES_BY_COMBAT_TAG = new Map<string, EnemyTemplate[]>();
for (const template of ENEMY_TEMPLATES) {
  for (const tag of template.combatTags) {
    const existing = TEMPLATES_BY_COMBAT_TAG.get(tag) || [];
    existing.push(template);
    TEMPLATES_BY_COMBAT_TAG.set(tag, existing);
  }
}

// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get an enemy template by its unique ID
 */
export function getEnemyTemplate(id: string): EnemyTemplate | undefined {
  return TEMPLATES_BY_ID.get(id);
}

/**
 * Get all enemy templates for a given faction
 */
export function getEnemyTemplatesByFaction(faction: string): EnemyTemplate[] {
  return TEMPLATES_BY_FACTION.get(faction) || [];
}

/**
 * Get enemy templates by combat tag
 */
export function getEnemyTemplatesByCombatTag(tag: string): EnemyTemplate[] {
  return TEMPLATES_BY_COMBAT_TAG.get(tag) || [];
}

/**
 * Get enemy templates by behavior tag
 */
export function getEnemyTemplatesByBehavior(behavior: BehaviorTag): EnemyTemplate[] {
  return ENEMY_TEMPLATES.filter((t) => t.behaviorTags.includes(behavior));
}

/**
 * Get enemy templates valid for a given level
 */
export function getEnemyTemplatesForLevel(level: number): EnemyTemplate[] {
  return ENEMY_TEMPLATES.filter((t) => t.minLevel <= level && t.maxLevel >= level);
}

/**
 * Get all enemy templates matching given criteria
 */
export function getEnemyTemplatesMatching(criteria: {
  faction?: string;
  combatTag?: string;
  behaviorTag?: BehaviorTag;
  minLevel?: number;
  maxLevel?: number;
}): EnemyTemplate[] {
  return ENEMY_TEMPLATES.filter((t) => {
    if (criteria.faction && !t.factions.includes(criteria.faction)) {
      return false;
    }
    if (criteria.combatTag && !t.combatTags.includes(criteria.combatTag)) {
      return false;
    }
    if (criteria.behaviorTag && !t.behaviorTags.includes(criteria.behaviorTag)) {
      return false;
    }
    if (criteria.minLevel !== undefined && t.maxLevel < criteria.minLevel) {
      return false;
    }
    if (criteria.maxLevel !== undefined && t.minLevel > criteria.maxLevel) {
      return false;
    }
    return true;
  });
}

// ============================================================================
// STAT CALCULATION HELPERS
// ============================================================================

/**
 * Calculate scaled stats for an enemy at a given level
 */
export function calculateScaledStats(template: EnemyTemplate, level: number): EnemyStats {
  const levelDelta = Math.max(0, level - 1);
  const scaling = template.scaling;

  return {
    health: Math.round(template.baseStats.health * scaling.healthPerLevel ** levelDelta),
    damage: Math.round(template.baseStats.damage * scaling.damagePerLevel ** levelDelta),
    armor: Math.round(template.baseStats.armor * scaling.armorPerLevel ** levelDelta),
    accuracy: Math.min(
      100,
      Math.round(template.baseStats.accuracy + scaling.accuracyPerLevel * levelDelta)
    ),
    evasion: Math.min(
      100,
      Math.round(template.baseStats.evasion + scaling.evasionPerLevel * levelDelta)
    ),
  };
}

/**
 * Default fallback template for unknown enemy types
 */
export const DEFAULT_ENEMY_TEMPLATE: EnemyTemplate = {
  id: 'default',
  name: 'Unknown Hostile',
  description: 'An unidentified threat.',
  baseStats: {
    health: 25,
    damage: 8,
    armor: 2,
    accuracy: 70,
    evasion: 10,
  },
  scaling: {
    healthPerLevel: 1.15,
    damagePerLevel: 1.12,
    armorPerLevel: 1.08,
    accuracyPerLevel: 2,
    evasionPerLevel: 1,
  },
  namePool: {
    prefixes: ['Hostile', 'Aggressive', 'Wild'],
    titles: [],
    suffixes: [],
  },
  lootTableId: 'generic_loot',
  behaviorTags: ['aggressive', 'melee'],
  factions: ['neutral'],
  combatTags: ['unknown'],
  xpModifier: 1.0,
  minLevel: 1,
  maxLevel: 10,
};

export {
  BanditThugTemplate,
  BanditGunmanTemplate,
  BanditSharpshooterTemplate,
  BanditLeaderTemplate,
  DesertWolfTemplate,
  RattlesnakeTemplate,
  MountainLionTemplate,
  GrizzlyBearTemplate,
  ScorpionTemplate,
  VultureTemplate,
  IVRCGuardTemplate,
  IVRCMarksmanTemplate,
  IVRCCaptainTemplate,
  CopperheadGunslingerTemplate,
  CopperheadEnforcerTemplate,
  CopperheadDynamiterTemplate,
  RemnantScoutTemplate,
  RemnantSentryTemplate,
  RemnantJuggernautTemplate,
  RustlerTemplate,
  MercenaryTemplate,
  CorruptDeputyTemplate,
  HostileProspectorTemplate,
  DesperadoTemplate,
  GhostTownDwellerTemplate,
  TombRaiderTemplate,
};
