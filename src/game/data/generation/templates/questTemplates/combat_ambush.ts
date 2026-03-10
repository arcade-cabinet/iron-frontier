/**
 * Combat Quest Templates - Ambush
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const COMBAT_AMBUSH_TEMPLATES: QuestTemplate[] = [
  {
    id: 'ambush_raiders',
    name: 'Ambush the Raiders',
    archetype: 'ambush',
    questType: 'side',
    titleTemplates: ['Turn the Tables', 'Trap at {{destination}}', 'Counter-Ambush'],
    descriptionTemplates: [
      'Raiders have been hitting travelers near {{destination}}. Set a trap for them.',
      '{{giver}} knows when the bandits will strike next. Be ready for them.',
      'Intel says raiders will pass through {{destination}}. Ambush them first.',
    ],
    stages: [
      {
        titleTemplate: 'Set the Trap',
        descriptionTemplate: 'Position yourself at {{destination}} and wait.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to the ambush point at {{destination}}',
            targetType: 'location',
            targetTags: ['road', 'pass', 'canyon'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Set up the ambush',
            targetType: 'any',
            targetTags: ['ambush_point'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Spring the Trap',
        descriptionTemplate: 'Eliminate the raiders when they arrive.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Defeat the raiders',
            targetType: 'enemy',
            targetTags: ['raider', 'bandit'],
            countRange: [4, 7],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The ambush was a success.',
      },
    ],
    rewards: {
      xpRange: [45, 80],
      goldRange: [30, 60],
      itemTags: ['weapon', 'ammo'],
      itemChance: 0.35,
      reputationImpact: {
        law: [5, 12],
        townfolk: [3, 8],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['sheriff', 'ranger', 'scout'],
    giverFactions: ['law', 'townfolk'],
    validLocationTypes: ['town', 'outpost'],
    tags: ['combat', 'ambush', 'tactical'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'ambush_supply_line',
    name: 'Hit the Supply Line',
    archetype: 'ambush',
    questType: 'side',
    titleTemplates: ['Disrupt IVRC Supplies', 'Supply Line Sabotage', 'Strike at {{destination}}'],
    descriptionTemplates: [
      '{{giver}} wants you to ambush an IVRC supply convoy near {{destination}}.',
      'IVRC shipments pass through {{destination}} regularly. Intercept one.',
      'Hit them where it hurts - their supply line to {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Intercept the Convoy',
        descriptionTemplate: 'Wait at {{destination}} for the IVRC shipment.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Reach the ambush point',
            targetType: 'location',
            targetTags: ['road', 'pass'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Attack',
        descriptionTemplate: 'Seize the supplies and deal with the guards.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Defeat IVRC guards',
            targetType: 'enemy',
            targetTags: ['ivrc_guard', 'mercenary'],
            countRange: [3, 5],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Secure the supplies',
            targetType: 'item',
            targetTags: ['supply', 'cargo'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: "The supplies are yours. IVRC won't be happy.",
      },
    ],
    rewards: {
      xpRange: [55, 95],
      goldRange: [40, 80],
      itemTags: ['supply', 'equipment'],
      itemChance: 0.5,
      reputationImpact: {
        ivrc: [-15, -25],
        freeminers: [10, 20],
      },
    },
    levelRange: [4, 8],
    giverRoles: ['rebel', 'union_organizer', 'guerrilla'],
    giverFactions: ['freeminers'],
    validLocationTypes: ['hideout', 'camp'],
    tags: ['combat', 'ambush', 'anti-ivrc'],
    repeatable: true,
    cooldownHours: 72,
  },
];
