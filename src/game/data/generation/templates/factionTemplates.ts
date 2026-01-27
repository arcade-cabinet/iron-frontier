/**
 * Iron Frontier - Faction Reaction Templates
 *
 * Defines how each faction reacts to the player based on reputation.
 * Each faction has reputation tiers that affect:
 * - Greeting dialogue
 * - Price modifiers at shops
 * - Quest availability
 * - Hostile status
 *
 * Faction relations define how actions affecting one faction ripple to others.
 */

import type { FactionReactionTemplate } from '../../schemas/generation';

// ============================================================================
// REPUTATION TIER CONSTANTS
// ============================================================================

export const REPUTATION_TIERS = {
  HATED: { min: -100, max: -60, name: 'Hated' },
  DESPISED: { min: -59, max: -30, name: 'Despised' },
  DISLIKED: { min: -29, max: -10, name: 'Disliked' },
  NEUTRAL: { min: -9, max: 9, name: 'Neutral' },
  LIKED: { min: 10, max: 29, name: 'Liked' },
  RESPECTED: { min: 30, max: 59, name: 'Respected' },
  HONORED: { min: 60, max: 100, name: 'Honored' },
} as const;

// ============================================================================
// LAW & ORDER FACTIONS
// ============================================================================

const lawEnforcementTemplate: FactionReactionTemplate = {
  id: 'faction_template_law_enforcement',
  factionId: 'law_enforcement',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Wanted Criminal',
      greetingSnippets: [
        'greeting_law_hostile',
        'greeting_law_arrest_threat',
        'greeting_law_wanted',
      ],
      priceModifier: 1.5,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Known Troublemaker',
      greetingSnippets: [
        'greeting_law_suspicious',
        'greeting_law_warning',
        'greeting_law_watching',
      ],
      priceModifier: 1.3,
      questAvailability: 0.1,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'Person of Interest',
      greetingSnippets: ['greeting_law_cold', 'greeting_law_curt'],
      priceModifier: 1.15,
      questAvailability: 0.3,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Stranger',
      greetingSnippets: ['greeting_law_neutral', 'greeting_law_professional'],
      priceModifier: 1.0,
      questAvailability: 0.5,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Upstanding Citizen',
      greetingSnippets: ['greeting_law_friendly', 'greeting_law_respectful'],
      priceModifier: 0.95,
      questAvailability: 0.7,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Trusted Ally',
      greetingSnippets: ['greeting_law_warm', 'greeting_law_grateful', 'greeting_law_confidential'],
      priceModifier: 0.85,
      questAvailability: 0.9,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: 'Honorary Deputy',
      greetingSnippets: ['greeting_law_honored', 'greeting_law_hero', 'greeting_law_deputy'],
      priceModifier: 0.75,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    town_council: 0.7,
    railroad_company: 0.3,
    mining_consortium: 0.2,
    cattle_barons: 0.4,
    merchants_guild: 0.5,
    desperados: -0.8,
    gang_red_canyon: -0.9,
    gang_iron_riders: -0.85,
    prospectors_union: 0.1,
    native_tribes: -0.2,
    drifters: -0.1,
    automaton_collective: 0.0,
  },
  tags: ['authority', 'law', 'order'],
};

const townCouncilTemplate: FactionReactionTemplate = {
  id: 'faction_template_town_council',
  factionId: 'town_council',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Persona Non Grata',
      greetingSnippets: ['greeting_council_banned', 'greeting_council_exile'],
      priceModifier: 1.5,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Undesirable Element',
      greetingSnippets: ['greeting_council_dismissive', 'greeting_council_condescending'],
      priceModifier: 1.3,
      questAvailability: 0.1,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'Troublesome Vagrant',
      greetingSnippets: ['greeting_council_cold', 'greeting_council_suspicious'],
      priceModifier: 1.15,
      questAvailability: 0.25,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Common Folk',
      greetingSnippets: ['greeting_council_neutral', 'greeting_council_bureaucratic'],
      priceModifier: 1.0,
      questAvailability: 0.5,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Concerned Citizen',
      greetingSnippets: ['greeting_council_polite', 'greeting_council_receptive'],
      priceModifier: 0.95,
      questAvailability: 0.65,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Valued Contributor',
      greetingSnippets: [
        'greeting_council_warm',
        'greeting_council_appreciative',
        'greeting_council_insider',
      ],
      priceModifier: 0.85,
      questAvailability: 0.85,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: 'Pillar of the Community',
      greetingSnippets: [
        'greeting_council_honored',
        'greeting_council_distinguished',
        'greeting_council_confidant',
      ],
      priceModifier: 0.7,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    law_enforcement: 0.7,
    railroad_company: 0.5,
    mining_consortium: 0.4,
    cattle_barons: 0.6,
    merchants_guild: 0.8,
    desperados: -0.7,
    gang_red_canyon: -0.8,
    gang_iron_riders: -0.75,
    prospectors_union: 0.0,
    native_tribes: -0.3,
    drifters: -0.2,
    automaton_collective: 0.1,
  },
  tags: ['authority', 'politics', 'civic'],
};

// ============================================================================
// BUSINESS FACTIONS
// ============================================================================

const railroadCompanyTemplate: FactionReactionTemplate = {
  id: 'faction_template_railroad_company',
  factionId: 'railroad_company',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Corporate Enemy',
      greetingSnippets: [
        'greeting_railroad_enemy',
        'greeting_railroad_banned',
        'greeting_railroad_threat',
      ],
      priceModifier: 1.5,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Saboteur Suspect',
      greetingSnippets: ['greeting_railroad_suspicious', 'greeting_railroad_hostile'],
      priceModifier: 1.35,
      questAvailability: 0.1,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'Unreliable Element',
      greetingSnippets: ['greeting_railroad_dismissive', 'greeting_railroad_cold'],
      priceModifier: 1.2,
      questAvailability: 0.3,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Potential Customer',
      greetingSnippets: ['greeting_railroad_neutral', 'greeting_railroad_business'],
      priceModifier: 1.0,
      questAvailability: 0.5,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Valued Customer',
      greetingSnippets: ['greeting_railroad_friendly', 'greeting_railroad_welcoming'],
      priceModifier: 0.9,
      questAvailability: 0.7,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Company Associate',
      greetingSnippets: [
        'greeting_railroad_warm',
        'greeting_railroad_partner',
        'greeting_railroad_confidential',
      ],
      priceModifier: 0.8,
      questAvailability: 0.9,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: 'Corporate Ally',
      greetingSnippets: [
        'greeting_railroad_honored',
        'greeting_railroad_executive',
        'greeting_railroad_elite',
      ],
      priceModifier: 0.7,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    law_enforcement: 0.3,
    town_council: 0.5,
    mining_consortium: 0.6,
    cattle_barons: 0.4,
    merchants_guild: 0.5,
    desperados: -0.6,
    gang_red_canyon: -0.7,
    gang_iron_riders: -0.9,
    prospectors_union: -0.5,
    native_tribes: -0.6,
    drifters: -0.1,
    automaton_collective: 0.4,
  },
  tags: ['business', 'corporate', 'industry'],
};

const miningConsortiumTemplate: FactionReactionTemplate = {
  id: 'faction_template_mining_consortium',
  factionId: 'mining_consortium',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Strike Agitator',
      greetingSnippets: [
        'greeting_mining_enemy',
        'greeting_mining_banned',
        'greeting_mining_threat',
      ],
      priceModifier: 1.5,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Union Sympathizer',
      greetingSnippets: ['greeting_mining_suspicious', 'greeting_mining_warning'],
      priceModifier: 1.3,
      questAvailability: 0.1,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'Unwelcome Visitor',
      greetingSnippets: ['greeting_mining_cold', 'greeting_mining_dismissive'],
      priceModifier: 1.15,
      questAvailability: 0.3,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Drifter',
      greetingSnippets: ['greeting_mining_neutral', 'greeting_mining_business'],
      priceModifier: 1.0,
      questAvailability: 0.5,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Reliable Worker',
      greetingSnippets: ['greeting_mining_friendly', 'greeting_mining_respectful'],
      priceModifier: 0.9,
      questAvailability: 0.7,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Trusted Contractor',
      greetingSnippets: [
        'greeting_mining_warm',
        'greeting_mining_partner',
        'greeting_mining_insider',
      ],
      priceModifier: 0.8,
      questAvailability: 0.9,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: 'Company Man',
      greetingSnippets: [
        'greeting_mining_honored',
        'greeting_mining_elite',
        'greeting_mining_family',
      ],
      priceModifier: 0.7,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    law_enforcement: 0.2,
    town_council: 0.4,
    railroad_company: 0.6,
    cattle_barons: 0.2,
    merchants_guild: 0.5,
    desperados: -0.4,
    gang_red_canyon: -0.5,
    gang_iron_riders: -0.6,
    prospectors_union: -0.8,
    native_tribes: -0.5,
    drifters: 0.1,
    automaton_collective: 0.5,
  },
  tags: ['business', 'mining', 'industry'],
};

const cattleBaronsTemplate: FactionReactionTemplate = {
  id: 'faction_template_cattle_barons',
  factionId: 'cattle_barons',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Cattle Rustler',
      greetingSnippets: [
        'greeting_cattle_enemy',
        'greeting_cattle_thief',
        'greeting_cattle_threat',
      ],
      priceModifier: 1.5,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Range Pest',
      greetingSnippets: ['greeting_cattle_hostile', 'greeting_cattle_suspicious'],
      priceModifier: 1.3,
      questAvailability: 0.1,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'Trespasser',
      greetingSnippets: ['greeting_cattle_cold', 'greeting_cattle_dismissive'],
      priceModifier: 1.15,
      questAvailability: 0.3,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Passing Stranger',
      greetingSnippets: ['greeting_cattle_neutral', 'greeting_cattle_business'],
      priceModifier: 1.0,
      questAvailability: 0.5,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Trail Hand',
      greetingSnippets: ['greeting_cattle_friendly', 'greeting_cattle_respectful'],
      priceModifier: 0.9,
      questAvailability: 0.7,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Ranch Foreman',
      greetingSnippets: [
        'greeting_cattle_warm',
        'greeting_cattle_partner',
        'greeting_cattle_trusted',
      ],
      priceModifier: 0.8,
      questAvailability: 0.9,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: "Cattle Baron's Kin",
      greetingSnippets: [
        'greeting_cattle_honored',
        'greeting_cattle_family',
        'greeting_cattle_elite',
      ],
      priceModifier: 0.7,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    law_enforcement: 0.4,
    town_council: 0.6,
    railroad_company: 0.4,
    mining_consortium: 0.2,
    merchants_guild: 0.6,
    desperados: -0.6,
    gang_red_canyon: -0.7,
    gang_iron_riders: -0.5,
    prospectors_union: -0.2,
    native_tribes: -0.4,
    drifters: -0.1,
    automaton_collective: 0.2,
  },
  tags: ['business', 'ranching', 'land'],
};

const merchantsGuildTemplate: FactionReactionTemplate = {
  id: 'faction_template_merchants_guild',
  factionId: 'merchants_guild',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Notorious Thief',
      greetingSnippets: [
        'greeting_merchant_banned',
        'greeting_merchant_thief',
        'greeting_merchant_enemy',
      ],
      priceModifier: 1.5,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Bad Risk',
      greetingSnippets: ['greeting_merchant_suspicious', 'greeting_merchant_wary'],
      priceModifier: 1.4,
      questAvailability: 0.1,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'Poor Customer',
      greetingSnippets: ['greeting_merchant_cold', 'greeting_merchant_reluctant'],
      priceModifier: 1.2,
      questAvailability: 0.3,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Customer',
      greetingSnippets: ['greeting_merchant_neutral', 'greeting_merchant_business'],
      priceModifier: 1.0,
      questAvailability: 0.5,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Regular Customer',
      greetingSnippets: ['greeting_merchant_friendly', 'greeting_merchant_welcoming'],
      priceModifier: 0.9,
      questAvailability: 0.7,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Preferred Customer',
      greetingSnippets: [
        'greeting_merchant_warm',
        'greeting_merchant_valued',
        'greeting_merchant_deal',
      ],
      priceModifier: 0.8,
      questAvailability: 0.9,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: 'Guild Partner',
      greetingSnippets: [
        'greeting_merchant_honored',
        'greeting_merchant_partner',
        'greeting_merchant_exclusive',
      ],
      priceModifier: 0.7,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    law_enforcement: 0.5,
    town_council: 0.8,
    railroad_company: 0.5,
    mining_consortium: 0.5,
    cattle_barons: 0.6,
    desperados: -0.7,
    gang_red_canyon: -0.8,
    gang_iron_riders: -0.7,
    prospectors_union: 0.3,
    native_tribes: 0.1,
    drifters: 0.2,
    automaton_collective: 0.3,
  },
  tags: ['business', 'trade', 'commerce'],
};

// ============================================================================
// OUTLAW FACTIONS
// ============================================================================

const desperadosTemplate: FactionReactionTemplate = {
  id: 'faction_template_desperados',
  factionId: 'desperados',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Marked for Death',
      greetingSnippets: [
        'greeting_outlaw_enemy',
        'greeting_outlaw_traitor',
        'greeting_outlaw_death',
      ],
      priceModifier: 1.5,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Snitch',
      greetingSnippets: ['greeting_outlaw_suspicious', 'greeting_outlaw_unwelcome'],
      priceModifier: 1.3,
      questAvailability: 0.1,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'Law-Lover',
      greetingSnippets: ['greeting_outlaw_cold', 'greeting_outlaw_dismissive'],
      priceModifier: 1.15,
      questAvailability: 0.25,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Unknown Quantity',
      greetingSnippets: ['greeting_outlaw_neutral', 'greeting_outlaw_testing'],
      priceModifier: 1.0,
      questAvailability: 0.5,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Fellow Renegade',
      greetingSnippets: ['greeting_outlaw_friendly', 'greeting_outlaw_respect'],
      priceModifier: 0.9,
      questAvailability: 0.7,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Trusted Outlaw',
      greetingSnippets: [
        'greeting_outlaw_warm',
        'greeting_outlaw_brother',
        'greeting_outlaw_welcome',
      ],
      priceModifier: 0.8,
      questAvailability: 0.9,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: 'Legendary Desperado',
      greetingSnippets: [
        'greeting_outlaw_honored',
        'greeting_outlaw_legend',
        'greeting_outlaw_boss',
      ],
      priceModifier: 0.7,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    law_enforcement: -0.8,
    town_council: -0.7,
    railroad_company: -0.6,
    mining_consortium: -0.4,
    cattle_barons: -0.6,
    merchants_guild: -0.7,
    gang_red_canyon: 0.5,
    gang_iron_riders: 0.4,
    prospectors_union: 0.2,
    native_tribes: 0.1,
    drifters: 0.4,
    automaton_collective: -0.1,
  },
  tags: ['outlaw', 'criminal', 'renegade'],
};

const gangRedCanyonTemplate: FactionReactionTemplate = {
  id: 'faction_template_gang_red_canyon',
  factionId: 'gang_red_canyon',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Blood Enemy',
      greetingSnippets: [
        'greeting_redcanyon_enemy',
        'greeting_redcanyon_kill',
        'greeting_redcanyon_revenge',
      ],
      priceModifier: 1.5,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Bounty Target',
      greetingSnippets: ['greeting_redcanyon_hostile', 'greeting_redcanyon_threat'],
      priceModifier: 1.3,
      questAvailability: 0.1,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'Outsider',
      greetingSnippets: ['greeting_redcanyon_cold', 'greeting_redcanyon_warning'],
      priceModifier: 1.15,
      questAvailability: 0.2,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Stranger',
      greetingSnippets: ['greeting_redcanyon_neutral', 'greeting_redcanyon_wary'],
      priceModifier: 1.0,
      questAvailability: 0.4,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Prospect',
      greetingSnippets: ['greeting_redcanyon_friendly', 'greeting_redcanyon_interested'],
      priceModifier: 0.9,
      questAvailability: 0.65,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Gang Member',
      greetingSnippets: [
        'greeting_redcanyon_warm',
        'greeting_redcanyon_brother',
        'greeting_redcanyon_trusted',
      ],
      priceModifier: 0.75,
      questAvailability: 0.9,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: 'Red Canyon Lieutenant',
      greetingSnippets: [
        'greeting_redcanyon_honored',
        'greeting_redcanyon_lieutenant',
        'greeting_redcanyon_family',
      ],
      priceModifier: 0.7,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    law_enforcement: -0.9,
    town_council: -0.8,
    railroad_company: -0.7,
    mining_consortium: -0.5,
    cattle_barons: -0.7,
    merchants_guild: -0.8,
    desperados: 0.5,
    gang_iron_riders: -0.3,
    prospectors_union: 0.1,
    native_tribes: 0.2,
    drifters: 0.3,
    automaton_collective: -0.2,
  },
  tags: ['outlaw', 'gang', 'violent'],
};

const gangIronRidersTemplate: FactionReactionTemplate = {
  id: 'faction_template_gang_iron_riders',
  factionId: 'gang_iron_riders',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Prey',
      greetingSnippets: [
        'greeting_ironriders_enemy',
        'greeting_ironriders_hunt',
        'greeting_ironriders_prey',
      ],
      priceModifier: 1.5,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Marked',
      greetingSnippets: ['greeting_ironriders_hostile', 'greeting_ironriders_marked'],
      priceModifier: 1.3,
      questAvailability: 0.1,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'Weak Link',
      greetingSnippets: ['greeting_ironriders_cold', 'greeting_ironriders_dismissive'],
      priceModifier: 1.15,
      questAvailability: 0.2,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Soft Skin',
      greetingSnippets: ['greeting_ironriders_neutral', 'greeting_ironriders_assessing'],
      priceModifier: 1.0,
      questAvailability: 0.4,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Iron Prospect',
      greetingSnippets: ['greeting_ironriders_friendly', 'greeting_ironriders_potential'],
      priceModifier: 0.9,
      questAvailability: 0.65,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Iron Rider',
      greetingSnippets: [
        'greeting_ironriders_warm',
        'greeting_ironriders_rider',
        'greeting_ironriders_steel',
      ],
      priceModifier: 0.75,
      questAvailability: 0.9,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: 'Iron Captain',
      greetingSnippets: [
        'greeting_ironriders_honored',
        'greeting_ironriders_captain',
        'greeting_ironriders_legend',
      ],
      priceModifier: 0.7,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    law_enforcement: -0.85,
    town_council: -0.75,
    railroad_company: -0.9,
    mining_consortium: -0.6,
    cattle_barons: -0.5,
    merchants_guild: -0.7,
    desperados: 0.4,
    gang_red_canyon: -0.3,
    prospectors_union: 0.0,
    native_tribes: 0.0,
    drifters: 0.2,
    automaton_collective: 0.3,
  },
  tags: ['outlaw', 'gang', 'steampunk', 'tech'],
};

// ============================================================================
// OTHER FACTIONS
// ============================================================================

const prospectorsUnionTemplate: FactionReactionTemplate = {
  id: 'faction_template_prospectors_union',
  factionId: 'prospectors_union',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Claim Jumper',
      greetingSnippets: [
        'greeting_prospector_enemy',
        'greeting_prospector_thief',
        'greeting_prospector_jumper',
      ],
      priceModifier: 1.5,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Company Stooge',
      greetingSnippets: ['greeting_prospector_suspicious', 'greeting_prospector_stooge'],
      priceModifier: 1.3,
      questAvailability: 0.1,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'Greenhorn',
      greetingSnippets: ['greeting_prospector_cold', 'greeting_prospector_greenhorn'],
      priceModifier: 1.1,
      questAvailability: 0.3,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Wanderer',
      greetingSnippets: ['greeting_prospector_neutral', 'greeting_prospector_curious'],
      priceModifier: 1.0,
      questAvailability: 0.5,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Fellow Digger',
      greetingSnippets: ['greeting_prospector_friendly', 'greeting_prospector_digger'],
      priceModifier: 0.9,
      questAvailability: 0.7,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Union Brother',
      greetingSnippets: [
        'greeting_prospector_warm',
        'greeting_prospector_brother',
        'greeting_prospector_solidarity',
      ],
      priceModifier: 0.8,
      questAvailability: 0.9,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: 'Strike Leader',
      greetingSnippets: [
        'greeting_prospector_honored',
        'greeting_prospector_leader',
        'greeting_prospector_champion',
      ],
      priceModifier: 0.7,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    law_enforcement: 0.1,
    town_council: 0.0,
    railroad_company: -0.5,
    mining_consortium: -0.8,
    cattle_barons: -0.2,
    merchants_guild: 0.3,
    desperados: 0.2,
    gang_red_canyon: 0.1,
    gang_iron_riders: 0.0,
    native_tribes: 0.3,
    drifters: 0.4,
    automaton_collective: 0.1,
  },
  tags: ['labor', 'mining', 'union', 'independent'],
};

const nativeTribesTemplate: FactionReactionTemplate = {
  id: 'faction_template_native_tribes',
  factionId: 'native_tribes',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Enemy of the People',
      greetingSnippets: [
        'greeting_native_enemy',
        'greeting_native_invader',
        'greeting_native_hostile',
      ],
      priceModifier: 1.5,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Trespasser',
      greetingSnippets: ['greeting_native_suspicious', 'greeting_native_unwelcome'],
      priceModifier: 1.3,
      questAvailability: 0.1,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'White Eyes',
      greetingSnippets: ['greeting_native_cold', 'greeting_native_wary'],
      priceModifier: 1.15,
      questAvailability: 0.25,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Outsider',
      greetingSnippets: ['greeting_native_neutral', 'greeting_native_cautious'],
      priceModifier: 1.0,
      questAvailability: 0.5,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Friend to the People',
      greetingSnippets: ['greeting_native_friendly', 'greeting_native_respectful'],
      priceModifier: 0.9,
      questAvailability: 0.7,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Blood Brother',
      greetingSnippets: [
        'greeting_native_warm',
        'greeting_native_brother',
        'greeting_native_honored',
      ],
      priceModifier: 0.8,
      questAvailability: 0.9,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: 'Spirit Walker',
      greetingSnippets: [
        'greeting_native_revered',
        'greeting_native_spirit',
        'greeting_native_legend',
      ],
      priceModifier: 0.7,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    law_enforcement: -0.2,
    town_council: -0.3,
    railroad_company: -0.6,
    mining_consortium: -0.5,
    cattle_barons: -0.4,
    merchants_guild: 0.1,
    desperados: 0.1,
    gang_red_canyon: 0.2,
    gang_iron_riders: 0.0,
    prospectors_union: 0.3,
    drifters: 0.2,
    automaton_collective: -0.1,
  },
  tags: ['native', 'spiritual', 'territorial'],
};

const driftersTemplate: FactionReactionTemplate = {
  id: 'faction_template_drifters',
  factionId: 'drifters',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Pariah',
      greetingSnippets: [
        'greeting_drifter_enemy',
        'greeting_drifter_pariah',
        'greeting_drifter_avoid',
      ],
      priceModifier: 1.4,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Bad News',
      greetingSnippets: ['greeting_drifter_suspicious', 'greeting_drifter_badnews'],
      priceModifier: 1.2,
      questAvailability: 0.15,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'Hard Case',
      greetingSnippets: ['greeting_drifter_cold', 'greeting_drifter_wary'],
      priceModifier: 1.1,
      questAvailability: 0.35,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Fellow Wanderer',
      greetingSnippets: ['greeting_drifter_neutral', 'greeting_drifter_nod'],
      priceModifier: 1.0,
      questAvailability: 0.5,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Road Companion',
      greetingSnippets: ['greeting_drifter_friendly', 'greeting_drifter_companion'],
      priceModifier: 0.9,
      questAvailability: 0.7,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Trusted Traveler',
      greetingSnippets: [
        'greeting_drifter_warm',
        'greeting_drifter_trusted',
        'greeting_drifter_friend',
      ],
      priceModifier: 0.8,
      questAvailability: 0.85,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: 'King of the Road',
      greetingSnippets: [
        'greeting_drifter_honored',
        'greeting_drifter_king',
        'greeting_drifter_legend',
      ],
      priceModifier: 0.75,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    law_enforcement: -0.1,
    town_council: -0.2,
    railroad_company: -0.1,
    mining_consortium: 0.1,
    cattle_barons: -0.1,
    merchants_guild: 0.2,
    desperados: 0.4,
    gang_red_canyon: 0.3,
    gang_iron_riders: 0.2,
    prospectors_union: 0.4,
    native_tribes: 0.2,
    automaton_collective: 0.0,
  },
  tags: ['vagrant', 'nomad', 'neutral'],
};

const automatonCollectiveTemplate: FactionReactionTemplate = {
  id: 'faction_template_automaton_collective',
  factionId: 'automaton_collective',
  reputationTiers: [
    {
      minRep: -100,
      maxRep: -60,
      tierName: 'Destroyer',
      greetingSnippets: [
        'greeting_automaton_enemy',
        'greeting_automaton_threat',
        'greeting_automaton_termination',
      ],
      priceModifier: 1.5,
      questAvailability: 0,
      hostile: true,
    },
    {
      minRep: -59,
      maxRep: -30,
      tierName: 'Hostile Organic',
      greetingSnippets: ['greeting_automaton_suspicious', 'greeting_automaton_warning'],
      priceModifier: 1.3,
      questAvailability: 0.1,
      hostile: false,
    },
    {
      minRep: -29,
      maxRep: -10,
      tierName: 'Unpredictable Variable',
      greetingSnippets: ['greeting_automaton_cold', 'greeting_automaton_calculating'],
      priceModifier: 1.15,
      questAvailability: 0.3,
      hostile: false,
    },
    {
      minRep: -9,
      maxRep: 9,
      tierName: 'Organic Unit',
      greetingSnippets: ['greeting_automaton_neutral', 'greeting_automaton_query'],
      priceModifier: 1.0,
      questAvailability: 0.5,
      hostile: false,
    },
    {
      minRep: 10,
      maxRep: 29,
      tierName: 'Cooperative Entity',
      greetingSnippets: ['greeting_automaton_friendly', 'greeting_automaton_acknowledge'],
      priceModifier: 0.9,
      questAvailability: 0.7,
      hostile: false,
    },
    {
      minRep: 30,
      maxRep: 59,
      tierName: 'Trusted Symbiote',
      greetingSnippets: [
        'greeting_automaton_warm',
        'greeting_automaton_partner',
        'greeting_automaton_valued',
      ],
      priceModifier: 0.8,
      questAvailability: 0.9,
      hostile: false,
    },
    {
      minRep: 60,
      maxRep: 100,
      tierName: 'Honorary Construct',
      greetingSnippets: [
        'greeting_automaton_honored',
        'greeting_automaton_integrated',
        'greeting_automaton_prime',
      ],
      priceModifier: 0.7,
      questAvailability: 1.0,
      hostile: false,
    },
  ],
  factionRelations: {
    law_enforcement: 0.0,
    town_council: 0.1,
    railroad_company: 0.4,
    mining_consortium: 0.5,
    cattle_barons: 0.2,
    merchants_guild: 0.3,
    desperados: -0.1,
    gang_red_canyon: -0.2,
    gang_iron_riders: 0.3,
    prospectors_union: 0.1,
    native_tribes: -0.1,
    drifters: 0.0,
  },
  tags: ['mechanical', 'artificial', 'steampunk'],
};

// ============================================================================
// FACTION TEMPLATES REGISTRY
// ============================================================================

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
