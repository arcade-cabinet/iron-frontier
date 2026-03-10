/**
 * Encounter Template Helpers
 */

import type { EncounterTemplate } from '../../../schemas/generation.ts';
import { scopedRNG, rngTick } from '../../../../lib/prng.ts';
import { LoneBandit, BanditAmbush, GangRaid, StagecoachRobbery, BanditCampAssault, WantedOutlaw } from './bandit.ts';
import { CoyotePack, RattlesnakeNest, BearEncounter, Stampede, ScorpionSwarm } from './wildlife.ts';
import { RailroadThugs, MineGuards, CattleRustlers, ClaimJumpers, CorruptDeputies, MercenaryGroup, CopperheadPatrolEncounter, CopperheadRaid, RemnantAwakeningEncounter, JuggernautEncounter } from './faction.ts';
import { AutomatonMalfunction, SteamWagonBandits, DynamiteAmbush, DuelChallenge, CaveCreatures, DesertSurvival, StormDanger, QuicksandTrap } from './special.ts';

export const ENCOUNTER_TEMPLATES: EncounterTemplate[] = [
  // Bandit Encounters
  LoneBandit,
  BanditAmbush,
  GangRaid,
  StagecoachRobbery,
  BanditCampAssault,
  WantedOutlaw,

  // Wildlife Encounters
  CoyotePack,
  RattlesnakeNest,
  BearEncounter,
  Stampede,
  ScorpionSwarm,

  // Faction Encounters
  RailroadThugs,
  MineGuards,
  CattleRustlers,
  ClaimJumpers,
  CorruptDeputies,
  MercenaryGroup,

  // Special Encounters
  AutomatonMalfunction,
  SteamWagonBandits,
  DynamiteAmbush,
  DuelChallenge,

  // Environmental Encounters
  CaveCreatures,
  DesertSurvival,
  StormDanger,
  QuicksandTrap,

  // Copperhead Gang
  CopperheadPatrolEncounter,
  CopperheadRaid,

  // Remnant
  RemnantAwakeningEncounter,
  JuggernautEncounter,
];

const TEMPLATES_BY_ID: Map<string, EncounterTemplate> = new Map(
  ENCOUNTER_TEMPLATES.map((t) => [t.id, t])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get an encounter template by its unique ID
 */
export function getEncounterTemplate(id: string): EncounterTemplate | undefined {
  return TEMPLATES_BY_ID.get(id);
}

/**
 * Get all encounter templates valid for a specific biome
 */
export function getEncountersForBiome(biome: string): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(
    (t) => t.validBiomes.length === 0 || t.validBiomes.includes(biome)
  );
}

/**
 * Get all encounter templates within a difficulty range
 */
export function getEncountersForDifficulty(minDiff: number, maxDiff: number): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(
    (t) => t.difficultyRange[0] <= maxDiff && t.difficultyRange[1] >= minDiff
  );
}

/**
 * Get encounter templates matching all specified criteria
 */
export function getEncountersMatching(criteria: {
  biome?: string;
  locationType?: string;
  timeOfDay?: string;
  minDifficulty?: number;
  maxDifficulty?: number;
  factionTag?: string;
  tags?: string[];
}): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter((t) => {
    // Check biome
    if (criteria.biome && t.validBiomes.length > 0) {
      if (!t.validBiomes.includes(criteria.biome)) return false;
    }

    // Check location type
    if (criteria.locationType && t.validLocationTypes.length > 0) {
      if (!t.validLocationTypes.includes(criteria.locationType)) return false;
    }

    // Check time of day
    if (criteria.timeOfDay && t.validTimeOfDay.length > 0) {
      if (!t.validTimeOfDay.includes(criteria.timeOfDay)) return false;
    }

    // Check difficulty range
    if (criteria.minDifficulty !== undefined) {
      if (t.difficultyRange[1] < criteria.minDifficulty) return false;
    }
    if (criteria.maxDifficulty !== undefined) {
      if (t.difficultyRange[0] > criteria.maxDifficulty) return false;
    }

    // Check faction
    if (criteria.factionTag && t.factionTags.length > 0) {
      if (!t.factionTags.includes(criteria.factionTag)) return false;
    }

    // Check tags (must match ALL specified tags)
    if (criteria.tags && criteria.tags.length > 0) {
      if (!criteria.tags.every((tag) => t.tags.includes(tag))) return false;
    }

    return true;
  });
}

/**
 * Get encounter templates by tag
 */
export function getEncountersByTag(tag: string): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter((t) => t.tags.includes(tag));
}

/**
 * Get encounter templates by faction
 */
export function getEncountersByFaction(faction: string): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter((t) => t.factionTags.includes(faction));
}

/**
 * Get a random encounter template matching criteria
 */
export function getRandomEncounterTemplate(criteria: {
  biome?: string;
  locationType?: string;
  timeOfDay?: string;
  minDifficulty?: number;
  maxDifficulty?: number;
  factionTag?: string;
  tags?: string[];
}): EncounterTemplate | undefined {
  const matches = getEncountersMatching(criteria);
  if (matches.length === 0) return undefined;
  return matches[Math.floor(scopedRNG('encounter', 42, rngTick()) * matches.length)];
}
