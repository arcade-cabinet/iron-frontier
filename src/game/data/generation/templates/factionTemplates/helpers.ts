/**
 * Faction Template Helpers
 */

import type { FactionReactionTemplate } from '../../../schemas/generation.ts';
import { lawEnforcementTemplate, townCouncilTemplate } from './law.ts';
import { railroadCompanyTemplate, miningConsortiumTemplate, cattleBaronsTemplate, merchantsGuildTemplate } from './business.ts';
import { desperadosTemplate, gangRedCanyonTemplate, gangIronRidersTemplate } from './outlaws.ts';
import { prospectorsUnionTemplate, nativeTribesTemplate, driftersTemplate, automatonCollectiveTemplate } from './other.ts';

export const REPUTATION_TIERS = {
  HATED: { min: -100, max: -60, name: 'Hated' },
  DESPISED: { min: -59, max: -30, name: 'Despised' },
  DISLIKED: { min: -29, max: -10, name: 'Disliked' },
  NEUTRAL: { min: -9, max: 9, name: 'Neutral' },
  LIKED: { min: 10, max: 29, name: 'Liked' },
  RESPECTED: { min: 30, max: 59, name: 'Respected' },
  HONORED: { min: 60, max: 100, name: 'Honored' },
} as const;

export const FACTION_TEMPLATES: FactionReactionTemplate[] = [
  // Law & Order
  lawEnforcementTemplate,
  townCouncilTemplate,
  // Business
  railroadCompanyTemplate,
  miningConsortiumTemplate,
  cattleBaronsTemplate,
  merchantsGuildTemplate,
  // Outlaws
  desperadosTemplate,
  gangRedCanyonTemplate,
  gangIronRidersTemplate,
  // Other
  prospectorsUnionTemplate,
  nativeTribesTemplate,
  driftersTemplate,
  automatonCollectiveTemplate,
];

const FACTION_TEMPLATES_BY_ID: Record<string, FactionReactionTemplate> = Object.fromEntries(
  FACTION_TEMPLATES.map((template) => [template.factionId, template])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a faction template by faction ID
 */
export function getFactionTemplate(factionId: string): FactionReactionTemplate | undefined {
  return FACTION_TEMPLATES_BY_ID[factionId];
}

/**
 * Get the reputation tier for a faction at a given reputation value
 */
export function getReputationTier(
  factionId: string,
  reputation: number
):
  | {
      tierName: string;
      greetingSnippets: string[];
      priceModifier: number;
      questAvailability: number;
      hostile: boolean;
    }
  | undefined {
  const template = FACTION_TEMPLATES_BY_ID[factionId];
  if (!template) return undefined;

  // Clamp reputation to valid range
  const clampedRep = Math.max(-100, Math.min(100, reputation));

  // Find the tier that matches the reputation
  for (const tier of template.reputationTiers) {
    if (clampedRep >= tier.minRep && clampedRep <= tier.maxRep) {
      return {
        tierName: tier.tierName,
        greetingSnippets: tier.greetingSnippets,
        priceModifier: tier.priceModifier,
        questAvailability: tier.questAvailability,
        hostile: tier.hostile,
      };
    }
  }

  return undefined;
}

/**
 * Get the relation modifier between two factions
 * Returns a value from -1 (enemies) to 1 (allies)
 * Actions that affect faction1 will affect faction2's standing with the player
 * by this multiplier
 */
export function getFactionRelation(faction1: string, faction2: string): number {
  if (faction1 === faction2) return 1; // Same faction

  const template = FACTION_TEMPLATES_BY_ID[faction1];
  if (!template) return 0;

  return template.factionRelations[faction2] ?? 0;
}

/**
 * Calculate reputation changes across all factions based on an action
 * affecting a primary faction
 *
 * @param primaryFaction - The faction directly affected by the action
 * @param reputationDelta - The change to the primary faction's reputation
 * @returns Record of faction IDs to reputation changes
 */
export function calculateReputationRipple(
  primaryFaction: string,
  reputationDelta: number
): Record<string, number> {
  const changes: Record<string, number> = {
    [primaryFaction]: reputationDelta,
  };

  const template = FACTION_TEMPLATES_BY_ID[primaryFaction];
  if (!template) return changes;

  // Calculate ripple effects based on faction relations
  for (const [otherFaction, relationModifier] of Object.entries(template.factionRelations)) {
    if (relationModifier !== 0) {
      // Related factions experience a portion of the reputation change
      // Positive relation = same direction change
      // Negative relation = opposite direction change
      const rippleAmount = Math.round(reputationDelta * relationModifier * 0.5);
      if (rippleAmount !== 0) {
        changes[otherFaction] = rippleAmount;
      }
    }
  }

  return changes;
}

/**
 * Get all factions hostile to a given faction
 */
export function getHostileFactions(factionId: string): string[] {
  const template = FACTION_TEMPLATES_BY_ID[factionId];
  if (!template) return [];

  return Object.entries(template.factionRelations)
    .filter(([, relation]) => relation <= -0.5)
    .map(([faction]) => faction);
}

/**
 * Get all factions allied with a given faction
 */
export function getAlliedFactions(factionId: string): string[] {
  const template = FACTION_TEMPLATES_BY_ID[factionId];
  if (!template) return [];

  return Object.entries(template.factionRelations)
    .filter(([, relation]) => relation >= 0.5)
    .map(([faction]) => faction);
}

/**
 * Get all faction IDs in the system
 */
export function getAllFactionIds(): string[] {
  return FACTION_TEMPLATES.map((t) => t.factionId);
}

/**
 * Check if a player with given reputation would be hostile to a faction
 */
export function isPlayerHostileToFaction(factionId: string, reputation: number): boolean {
  const tier = getReputationTier(factionId, reputation);
  return tier?.hostile ?? false;
}
