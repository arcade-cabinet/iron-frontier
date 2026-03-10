/**
 * Enemy Library - Iron Frontier
 *
 * Defines all enemy types and combat encounters in the game.
 */

import type { CombatEncounter, EnemyDefinition } from '../schemas/combat.ts';
import { scopedRNG, rngTick } from '../../lib/prng.ts';

// Re-export all enemy definitions
export { BanditThug, BanditGunman, BanditSharpshooter, BanditLeader } from './bandits.ts';
export { CopperheadEnforcer, CopperheadGunslinger, CopperheadDynamiter } from './copperhead.ts';
export { IVRCGuard, IVRCMarksman, IVRCCaptain } from './ivrc.ts';
export { DesertWolf, Rattlesnake, MountainLion, GrizzlyBear, Scorpion, Vulture } from './wildlife.ts';
export { RemnantSentry, RemnantScout, RemnantJuggernaut } from './remnant.ts';
export { RoadsideBandits, WolfPack, CopperheadPatrol, IVRCCheckpoint, RemnantAwakening, JuggernautBoss } from './encounters.ts';

import { BanditThug, BanditGunman, BanditSharpshooter, BanditLeader } from './bandits.ts';
import { CopperheadEnforcer, CopperheadGunslinger, CopperheadDynamiter } from './copperhead.ts';
import { IVRCGuard, IVRCMarksman, IVRCCaptain } from './ivrc.ts';
import { DesertWolf, Rattlesnake, MountainLion, GrizzlyBear, Scorpion, Vulture } from './wildlife.ts';
import { RemnantSentry, RemnantScout, RemnantJuggernaut } from './remnant.ts';
import { RoadsideBandits, WolfPack, CopperheadPatrol, IVRCCheckpoint, RemnantAwakening, JuggernautBoss } from './encounters.ts';

export const ALL_ENEMIES: EnemyDefinition[] = [
  BanditThug, BanditGunman, BanditSharpshooter,
  CopperheadEnforcer, CopperheadGunslinger, CopperheadDynamiter,
  IVRCGuard, IVRCMarksman, IVRCCaptain,
  DesertWolf, Rattlesnake, MountainLion, GrizzlyBear, Scorpion, Vulture,
  BanditLeader,
  RemnantSentry, RemnantScout, RemnantJuggernaut,
];

export const ENEMIES_BY_ID: Record<string, EnemyDefinition> = Object.fromEntries(
  ALL_ENEMIES.map((e) => [e.id, e])
);

export const ALL_ENCOUNTERS: CombatEncounter[] = [
  RoadsideBandits, WolfPack, CopperheadPatrol,
  IVRCCheckpoint, RemnantAwakening, JuggernautBoss,
];

export const ENCOUNTERS_BY_ID: Record<string, CombatEncounter> = Object.fromEntries(
  ALL_ENCOUNTERS.map((e) => [e.id, e])
);

export function getEnemyById(id: string): EnemyDefinition | undefined {
  return ENEMIES_BY_ID[id];
}

export function getEncounterById(id: string): CombatEncounter | undefined {
  return ENCOUNTERS_BY_ID[id];
}

export function getEnemiesByFaction(faction: string): EnemyDefinition[] {
  return ALL_ENEMIES.filter((e) => e.faction === faction);
}

export function getEnemiesByTag(tag: string): EnemyDefinition[] {
  return ALL_ENEMIES.filter((e) => e.tags.includes(tag));
}

export function getEncountersByTag(tag: string): CombatEncounter[] {
  return ALL_ENCOUNTERS.filter((e) => e.tags.includes(tag));
}

/**
 * Register a dynamically generated encounter so it can be looked up by ID.
 */
export function registerEncounter(encounter: CombatEncounter): void {
  ENCOUNTERS_BY_ID[encounter.id] = encounter;
}

export function getRandomEncounter(
  playerLevel: number,
  tags?: string[]
): CombatEncounter | undefined {
  let candidates = ALL_ENCOUNTERS.filter((e) => e.minLevel <= playerLevel && !e.isBoss);

  if (tags && tags.length > 0) {
    candidates = candidates.filter((e) => tags.some((tag) => e.tags.includes(tag)));
  }

  if (candidates.length === 0) return undefined;

  return candidates[Math.floor(scopedRNG('data', 42, rngTick()) * candidates.length)];
}
