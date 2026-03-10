/**
 * Economic Quest Templates - Investment
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const ECONOMIC_INVESTMENT_TEMPLATES: QuestTemplate[] = [
  {
    id: 'investment_prospect',
    name: 'Prospecting Investment',
    archetype: 'investment',
    questType: 'side',
    titleTemplates: ['Investment Opportunity', 'Fund the Prospect', 'Mining Venture'],
    descriptionTemplates: [
      '{{giver}} has found a promising site but needs funding.',
      'A mining claim at {{destination}} needs capital. High risk, high reward.',
      "Fund {{giver}}'s operation for a cut of the profits.",
    ],
    stages: [
      {
        titleTemplate: 'Meet the Prospector',
        descriptionTemplate: 'Learn about the opportunity.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Meet {{giver}}',
            targetType: 'npc',
            targetTags: ['prospector', 'miner'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Verify the Claim',
        descriptionTemplate: 'Check if the claim is legitimate.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Inspect the claim at {{destination}}',
            targetType: 'location',
            targetTags: ['mine', 'deposit'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Evaluate the potential',
            targetType: 'any',
            targetTags: ['ore_sample'],
            countRange: [1, 2],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Make the Investment',
        descriptionTemplate: 'Decide whether to invest.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Finalize terms',
            targetType: 'npc',
            targetTags: ['prospector'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Investment made. Now we wait.',
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [40, 100],
      itemTags: ['ore', 'mineral'],
      itemChance: 0.4,
      reputationImpact: {
        freeminers: [5, 12],
      },
    },
    levelRange: [2, 6],
    giverRoles: ['prospector', 'miner', 'investor'],
    giverFactions: ['freeminers', 'townfolk'],
    validLocationTypes: ['town', 'mine'],
    tags: ['economic', 'investment', 'mining'],
    repeatable: true,
    cooldownHours: 72,
  },
  {
    id: 'investment_business',
    name: 'Business Investment',
    archetype: 'investment',
    questType: 'side',
    titleTemplates: ['Business Opportunity', 'Back the Venture', 'Startup Funding'],
    descriptionTemplates: [
      '{{giver}} wants to start a business but needs capital.',
      'An entrepreneur needs investment for a new venture.',
      "Fund {{giver}}'s idea for a share of the profits.",
    ],
    stages: [
      {
        titleTemplate: 'Hear the Pitch',
        descriptionTemplate: 'Learn about the business opportunity.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Meet {{giver}}',
            targetType: 'npc',
            targetTags: ['entrepreneur', 'merchant'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Due Diligence',
        descriptionTemplate: 'Investigate the viability.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Research the market',
            targetType: 'npc',
            targetTags: ['merchant', 'local'],
            countRange: [1, 2],
            optional: false,
          },
          {
            type: 'visit',
            descriptionTemplate: 'Check the proposed location',
            targetType: 'location',
            targetTags: ['building', 'shop'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Invest',
        descriptionTemplate: 'Commit your funds.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Make the investment',
            targetType: 'npc',
            targetTags: ['entrepreneur'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: "You're now a business partner.",
      },
    ],
    rewards: {
      xpRange: [40, 70],
      goldRange: [50, 120],
      itemTags: ['trade_goods'],
      itemChance: 0.3,
      reputationImpact: {
        townfolk: [5, 12],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['entrepreneur', 'merchant', 'inventor'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town'],
    tags: ['economic', 'investment', 'business'],
    repeatable: true,
    cooldownHours: 96,
  },
];
