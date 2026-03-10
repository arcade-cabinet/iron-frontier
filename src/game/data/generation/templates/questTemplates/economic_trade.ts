/**
 * Economic Quest Templates - Trade Routes
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const ECONOMIC_TRADE_TEMPLATES: QuestTemplate[] = [
  {
    id: 'trade_route_establish',
    name: 'Establish Trade Route',
    archetype: 'trade_route',
    questType: 'side',
    titleTemplates: ['New Trade Route', 'Commerce to {{destination}}', 'Open the Markets'],
    descriptionTemplates: [
      '{{giver}} wants to establish trade with {{destination}}.',
      'Open a trade route between here and {{destination}}.',
      'Negotiate a trade agreement with merchants at {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Meet the Traders',
        descriptionTemplate: 'Contact merchants at {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Travel to {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'trading_post'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Speak with local merchants',
            targetType: 'npc',
            targetTags: ['merchant', 'trader'],
            countRange: [1, 2],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Prove Viability',
        descriptionTemplate: 'Show the trade route is profitable.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Deliver sample goods',
            targetType: 'item',
            targetTags: ['trade_goods'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Bring back return goods',
            targetType: 'item',
            targetTags: ['trade_goods'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Finalize the Route',
        descriptionTemplate: 'Complete the agreement.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Sign the agreement',
            targetType: 'npc',
            targetTags: ['merchant', 'official'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Trade route established!',
      },
    ],
    rewards: {
      xpRange: [50, 90],
      goldRange: [45, 90],
      itemTags: ['trade_goods'],
      itemChance: 0.35,
      reputationImpact: {
        townfolk: [10, 20],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['merchant', 'mayor', 'guild_master'],
    giverFactions: ['townfolk', 'ivrc'],
    validLocationTypes: ['town'],
    tags: ['economic', 'trade', 'commerce'],
    repeatable: true,
    cooldownHours: 96,
  },
  {
    id: 'trade_route_protect',
    name: 'Secure Trade Route',
    archetype: 'trade_route',
    questType: 'side',
    titleTemplates: ['Protect the Trade Route', 'Secure Commerce', 'Clear the Trading Path'],
    descriptionTemplates: [
      'The trade route to {{destination}} is threatened. Secure it.',
      'Bandits are disrupting trade. Make the route safe.',
      '{{giver}} needs the path to {{destination}} protected.',
    ],
    stages: [
      {
        titleTemplate: 'Assess Threats',
        descriptionTemplate: 'Scout the route for dangers.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Patrol the route',
            targetType: 'location',
            targetTags: ['road', 'pass'],
            countRange: [2, 3],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Eliminate Threats',
        descriptionTemplate: 'Deal with anyone threatening trade.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Defeat bandits',
            targetType: 'enemy',
            targetTags: ['bandit', 'raider'],
            countRange: [4, 8],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Confirm Security',
        descriptionTemplate: 'Report that the route is secure.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: ['merchant'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The trade route is secure.',
      },
    ],
    rewards: {
      xpRange: [55, 95],
      goldRange: [40, 80],
      itemTags: [],
      itemChance: 0.2,
      reputationImpact: {
        townfolk: [8, 15],
        law: [5, 10],
      },
    },
    levelRange: [3, 7],
    giverRoles: ['merchant', 'caravan_master', 'mayor'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town'],
    tags: ['economic', 'trade', 'combat'],
    repeatable: true,
    cooldownHours: 72,
  },
];
