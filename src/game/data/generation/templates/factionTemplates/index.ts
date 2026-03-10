/**
 * Faction Templates - Faction reaction system
 */

export { lawEnforcementTemplate, townCouncilTemplate } from './law.ts';
export { railroadCompanyTemplate, miningConsortiumTemplate, cattleBaronsTemplate, merchantsGuildTemplate } from './business.ts';
export { desperadosTemplate, gangRedCanyonTemplate, gangIronRidersTemplate } from './outlaws.ts';
export { prospectorsUnionTemplate, nativeTribesTemplate, driftersTemplate, automatonCollectiveTemplate } from './other.ts';

export {
  calculateReputationRipple,
  FACTION_TEMPLATES,
  getAllFactionIds,
  getAlliedFactions,
  getFactionRelation,
  getFactionTemplate,
  getHostileFactions,
  getReputationTier,
  isPlayerHostileToFaction,
  REPUTATION_TIERS,
} from './helpers.ts';
