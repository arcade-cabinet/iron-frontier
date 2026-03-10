/**
 * Encounter Templates - Procedural combat encounters
 */

export { LoneBandit, BanditAmbush, GangRaid, StagecoachRobbery, BanditCampAssault, WantedOutlaw } from './bandit.ts';
export { CoyotePack, RattlesnakeNest, BearEncounter, Stampede, ScorpionSwarm } from './wildlife.ts';
export { RailroadThugs, MineGuards, CattleRustlers, ClaimJumpers, CorruptDeputies, MercenaryGroup, CopperheadPatrolEncounter, CopperheadRaid, RemnantAwakeningEncounter, JuggernautEncounter } from './faction.ts';
export { AutomatonMalfunction, SteamWagonBandits, DynamiteAmbush, DuelChallenge, CaveCreatures, DesertSurvival, StormDanger, QuicksandTrap } from './special.ts';

export {
  ENCOUNTER_TEMPLATES,
  getEncountersByFaction,
  getEncountersByTag,
  getEncountersForBiome,
  getEncountersForDifficulty,
  getEncountersMatching,
  getEncounterTemplate,
  getRandomEncounterTemplate,
} from './helpers.ts';
