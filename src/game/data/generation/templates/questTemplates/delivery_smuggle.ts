/**
 * Delivery Quest Templates - Smuggling
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const DELIVERY_SMUGGLE_TEMPLATES: QuestTemplate[] = [
  {
    id: 'smuggle_contraband',
    name: 'Contraband Run',
    archetype: 'smuggle',
    questType: 'delivery',
    titleTemplates: ['Under the Radar', 'Contraband to {{destination}}', 'Off the Books'],
    descriptionTemplates: [
      "{{giver}} needs banned goods smuggled into {{destination}}. Don't get caught.",
      'These items are prohibited by IVRC. Get them to {{target}} quietly.',
      'Slip this contraband past the checkpoints to {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Avoid Detection',
        descriptionTemplate: 'Smuggle the goods to {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Reach {{destination}} undetected',
            targetType: 'location',
            targetTags: ['town', 'mine', 'camp'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Avoid main roads and patrol routes.',
          },
          {
            type: 'deliver',
            descriptionTemplate: 'Hand off the goods to {{target}}',
            targetType: 'npc',
            targetTags: ['contact', 'fence'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Clean delivery.',
      },
    ],
    rewards: {
      xpRange: [40, 75],
      goldRange: [50, 100],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        law: [-5, -12],
        freeminers: [5, 12],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['smuggler', 'fixer', 'rebel'],
    giverFactions: ['freeminers', 'copperhead'],
    validLocationTypes: ['town', 'hideout'],
    tags: ['delivery', 'smuggling', 'criminal'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'smuggle_weapons',
    name: 'Weapons Smuggling',
    archetype: 'smuggle',
    questType: 'delivery',
    titleTemplates: ['Arms Delivery', 'Weapons to {{destination}}', 'Hot Iron'],
    descriptionTemplates: [
      "{{giver}} needs weapons delivered to {{destination}}. IVRC can't know.",
      'The resistance needs arms. Get them to {{target}} at {{destination}}.',
      'Smuggle these weapons past IVRC checkpoints to {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Smuggle the Weapons',
        descriptionTemplate: 'Get the weapons to {{destination}} secretly.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Reach {{destination}}',
            targetType: 'location',
            targetTags: ['hideout', 'camp', 'mine'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'deliver',
            descriptionTemplate: 'Deliver weapons to {{target}}',
            targetType: 'npc',
            targetTags: ['rebel', 'contact'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The resistance is better armed now.',
      },
    ],
    rewards: {
      xpRange: [55, 95],
      goldRange: [60, 120],
      itemTags: ['weapon'],
      itemChance: 0.3,
      reputationImpact: {
        ivrc: [-10, -20],
        freeminers: [10, 20],
        law: [-8, -15],
      },
    },
    levelRange: [4, 7],
    giverRoles: ['rebel', 'guerrilla', 'fixer'],
    giverFactions: ['freeminers'],
    validLocationTypes: ['hideout', 'camp'],
    tags: ['smuggling', 'weapons', 'resistance'],
    repeatable: true,
    cooldownHours: 72,
  },
];
