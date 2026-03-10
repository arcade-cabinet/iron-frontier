/**
 * Combat Quest Templates - Clear Area
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const COMBAT_CLEAR_TEMPLATES: QuestTemplate[] = [
  {
    id: 'clear_bandits',
    name: 'Clear Bandits',
    archetype: 'clear_area',
    questType: 'side',
    titleTemplates: [
      'Bandit Problem at {{destination}}',
      'Clear the Road to {{destination}}',
      'Drive Out the Outlaws',
    ],
    descriptionTemplates: [
      'Bandits have been ambushing travelers near {{destination}}. Clear them out.',
      '{{giver}} is worried about bandit activity. Help make the area safe.',
      'The road to {{destination}} is too dangerous. Deal with the bandits.',
    ],
    stages: [
      {
        titleTemplate: 'Hunt the Bandits',
        descriptionTemplate: 'Travel to {{destination}} and eliminate the bandits.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Eliminate bandits near {{destination}}',
            targetType: 'enemy',
            targetTags: ['bandit'],
            countRange: [3, 6],
            optional: false,
            hintTemplate: 'They usually ambush near the crossroads.',
          },
        ],
        onCompleteTextTemplate: 'The bandits have been dealt with.',
      },
    ],
    rewards: {
      xpRange: [25, 50],
      goldRange: [15, 35],
      itemTags: [],
      itemChance: 0.2,
      reputationImpact: {
        townfolk: [3, 8],
      },
    },
    levelRange: [1, 5],
    giverRoles: ['sheriff', 'mayor', 'shopkeeper', 'rancher'],
    giverFactions: ['townfolk', 'law'],
    validLocationTypes: ['town', 'ranch', 'outpost'],
    tags: ['combat', 'safety'],
    repeatable: true,
    cooldownHours: 24,
  },
  {
    id: 'clear_wildlife',
    name: 'Wildlife Control',
    archetype: 'clear_area',
    questType: 'side',
    titleTemplates: ['Predator Problem', 'Dangerous Wildlife', 'Animal Attacks Near {{location}}'],
    descriptionTemplates: [
      'Wild animals have been attacking livestock and people. Hunt them down.',
      '{{giver}} lost cattle to predators. Help deal with the problem.',
      "The wildlife's gotten bold and dangerous. Thin the herd.",
    ],
    stages: [
      {
        titleTemplate: 'Hunt the Predators',
        descriptionTemplate: 'Track and eliminate the dangerous wildlife.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Kill dangerous animals',
            targetType: 'enemy',
            targetTags: ['wildlife', 'predator'],
            countRange: [3, 5],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The predators have been dealt with.',
      },
    ],
    rewards: {
      xpRange: [15, 30],
      goldRange: [10, 25],
      itemTags: ['hide', 'crafting'],
      itemChance: 0.4,
      reputationImpact: {
        ranch: [3, 8],
      },
    },
    levelRange: [1, 4],
    giverRoles: ['rancher', 'farmer', 'hunter'],
    giverFactions: ['ranch', 'townfolk'],
    validLocationTypes: ['ranch', 'farm', 'town'],
    tags: ['hunting', 'wildlife'],
    repeatable: true,
    cooldownHours: 24,
  },
  {
    id: 'clear_mine',
    name: 'Clear the Mine',
    archetype: 'clear_area',
    questType: 'side',
    titleTemplates: ['Reclaim the Mine', 'Clear {{destination}}', 'Dangerous Infestation'],
    descriptionTemplates: [
      'Creatures have overrun the {{destination}} mine. Clear them out so work can resume.',
      "{{giver}} can't get workers back in until the mine is safe.",
      'Something dangerous moved into {{destination}}. Deal with it.',
    ],
    stages: [
      {
        titleTemplate: 'Enter the Mine',
        descriptionTemplate: 'Descend into {{destination}} and clear the threat.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Enter {{destination}}',
            targetType: 'location',
            targetTags: ['mine', 'cave'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Eliminate the creatures',
            targetType: 'enemy',
            targetTags: ['creature', 'vermin'],
            countRange: [4, 8],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The mine is clear. Workers can return.',
      },
    ],
    rewards: {
      xpRange: [35, 65],
      goldRange: [25, 50],
      itemTags: ['ore', 'mineral'],
      itemChance: 0.3,
      reputationImpact: {
        freeminers: [5, 12],
      },
    },
    levelRange: [2, 6],
    giverRoles: ['foreman', 'miner', 'prospector'],
    giverFactions: ['freeminers', 'ivrc'],
    validLocationTypes: ['mine', 'town'],
    tags: ['combat', 'dungeon', 'mining'],
    repeatable: true,
    cooldownHours: 48,
  },
];
