/**
 * Combat Quest Templates - Escort
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const COMBAT_ESCORT_TEMPLATES: QuestTemplate[] = [
  {
    id: 'escort_traveler',
    name: 'Escort Traveler',
    archetype: 'escort',
    questType: 'side',
    titleTemplates: [
      'Safe Passage to {{destination}}',
      'Escort {{target}} to {{destination}}',
      'Bodyguard Duty',
    ],
    descriptionTemplates: [
      '{{target}} needs safe escort to {{destination}}. The roads are dangerous.',
      'A traveler requires protection on the journey to {{destination}}.',
      '{{giver}} will pay well if you can get {{target}} to {{destination}} safely.',
    ],
    stages: [
      {
        titleTemplate: 'Meet {{target}}',
        descriptionTemplate: 'Find {{target}} and prepare for the journey.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Meet {{target}}',
            targetType: 'npc',
            targetTags: ['traveler', 'civilian'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Escort to {{destination}}',
        descriptionTemplate: 'Protect {{target}} on the road to {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Arrive at {{destination}} with {{target}}',
            targetType: 'location',
            targetTags: ['town', 'outpost'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Stay close and watch for ambushes.',
          },
        ],
        onCompleteTextTemplate: '{{target}} arrived safely.',
      },
    ],
    rewards: {
      xpRange: [30, 55],
      goldRange: [20, 45],
      itemTags: [],
      itemChance: 0.15,
      reputationImpact: {
        townfolk: [3, 8],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['traveler', 'merchant', 'townsperson'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town', 'waystation'],
    tags: ['escort', 'protection', 'travel'],
    repeatable: true,
    cooldownHours: 24,
  },
  {
    id: 'escort_wagon',
    name: 'Guard the Wagon',
    archetype: 'escort',
    questType: 'side',
    titleTemplates: ['Wagon Guard to {{destination}}', 'Protect the Shipment', 'Supply Convoy'],
    descriptionTemplates: [
      '{{giver}} needs guards for a supply wagon heading to {{destination}}.',
      "Valuable cargo must reach {{destination}} safely. Bandits know it's coming.",
      'This shipment is worth a lot. Make sure nothing happens to it.',
    ],
    stages: [
      {
        titleTemplate: 'Guard the Wagon',
        descriptionTemplate: 'Protect the wagon on its journey to {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Travel with the wagon to {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'depot', 'mine'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Defeat any attackers',
            targetType: 'enemy',
            targetTags: ['bandit', 'raider'],
            countRange: [0, 6],
            optional: true,
          },
        ],
        onCompleteTextTemplate: 'The cargo arrived intact.',
      },
    ],
    rewards: {
      xpRange: [40, 70],
      goldRange: [30, 60],
      itemTags: ['supply'],
      itemChance: 0.25,
      reputationImpact: {},
    },
    levelRange: [2, 6],
    giverRoles: ['merchant', 'quartermaster', 'foreman'],
    giverFactions: ['ivrc', 'freeminers', 'townfolk'],
    validLocationTypes: ['town', 'depot'],
    tags: ['escort', 'wagon', 'cargo'],
    repeatable: true,
    cooldownHours: 36,
  },
];
