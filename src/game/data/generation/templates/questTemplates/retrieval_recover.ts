/**
 * Retrieval Quest Templates - Recover Lost
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const RETRIEVAL_RECOVER_TEMPLATES: QuestTemplate[] = [
  {
    id: 'recover_shipment',
    name: 'Lost Shipment',
    archetype: 'recover_lost',
    questType: 'side',
    titleTemplates: ['Find the Lost Shipment', 'Missing Cargo', "Where's the Wagon?"],
    descriptionTemplates: [
      'A shipment went missing between here and {{destination}}. Find out what happened.',
      "{{giver}}'s cargo never arrived from {{destination}}. Track it down.",
      'The supply wagon vanished near {{destination}}. Recover what you can.',
    ],
    stages: [
      {
        titleTemplate: 'Search for the Shipment',
        descriptionTemplate: 'Investigate the route to {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Search along the route',
            targetType: 'location',
            targetTags: ['road', 'wilderness'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Look for signs of a struggle or abandoned cargo.',
          },
          {
            type: 'interact',
            descriptionTemplate: 'Find the wreckage',
            targetType: 'any',
            targetTags: ['wagon', 'wreckage'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Recover the Cargo',
        descriptionTemplate: 'Salvage what remains.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Salvage the cargo',
            targetType: 'item',
            targetTags: ['cargo', 'supply'],
            countRange: [1, 3],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Deal with scavengers',
            targetType: 'enemy',
            targetTags: ['bandit', 'scavenger'],
            countRange: [0, 4],
            optional: true,
          },
        ],
        onCompleteTextTemplate: 'You recovered what was left.',
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [25, 50],
      itemTags: ['salvage'],
      itemChance: 0.4,
      reputationImpact: {},
    },
    levelRange: [2, 5],
    giverRoles: ['merchant', 'quartermaster', 'foreman'],
    giverFactions: ['townfolk', 'ivrc', 'freeminers'],
    validLocationTypes: ['town', 'depot'],
    tags: ['recovery', 'investigation', 'cargo'],
    repeatable: true,
    cooldownHours: 36,
  },
  {
    id: 'recover_artifact',
    name: 'Relic Recovery',
    archetype: 'recover_lost',
    questType: 'side',
    titleTemplates: ['The Lost {{item}}', 'Relic of the Past', 'Ancient {{item}}'],
    descriptionTemplates: [
      'An ancient {{item}} was lost in {{destination}} years ago. Find it.',
      'Legends speak of a {{item}} hidden in {{destination}}.',
      "{{giver}} believes their ancestor's {{item}} is still at {{destination}}.",
    ],
    stages: [
      {
        titleTemplate: 'Search {{destination}}',
        descriptionTemplate: 'Explore {{destination}} for the {{item}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Explore {{destination}}',
            targetType: 'location',
            targetTags: ['ruins', 'cave', 'tomb'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Search for clues',
            targetType: 'any',
            targetTags: ['inscription', 'marker'],
            countRange: [1, 2],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Claim the {{item}}',
        descriptionTemplate: 'Find and secure the {{item}}.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Retrieve the {{item}}',
            targetType: 'item',
            targetTags: ['artifact', 'relic'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Defeat guardians',
            targetType: 'enemy',
            targetTags: ['guardian', 'creature'],
            countRange: [1, 3],
            optional: true,
          },
        ],
        onCompleteTextTemplate: 'The {{item}} is yours.',
      },
    ],
    rewards: {
      xpRange: [55, 95],
      goldRange: [40, 80],
      itemTags: ['artifact', 'rare'],
      itemChance: 0.6,
      reputationImpact: {},
    },
    levelRange: [4, 8],
    giverRoles: ['scholar', 'collector', 'elder'],
    giverFactions: ['townfolk', 'freeminers'],
    validLocationTypes: ['town'],
    tags: ['recovery', 'exploration', 'artifact'],
    repeatable: true,
    cooldownHours: 72,
  },
];
