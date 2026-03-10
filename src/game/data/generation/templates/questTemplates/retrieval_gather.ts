/**
 * Retrieval Quest Templates - Gather Materials
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const RETRIEVAL_GATHER_TEMPLATES: QuestTemplate[] = [
  {
    id: 'gather_ore',
    name: 'Ore Collection',
    archetype: 'gather_materials',
    questType: 'side',
    titleTemplates: ['Ore Needed', 'Mining Request', 'Gather {{item}}'],
    descriptionTemplates: [
      '{{giver}} needs {{item}} for operations. Gather some from {{destination}}.',
      'The blacksmith requires {{item}}. Find it near {{destination}}.',
      '{{giver}} will pay well for {{item}} from the {{destination}} deposits.',
    ],
    stages: [
      {
        titleTemplate: 'Gather {{item}}',
        descriptionTemplate: 'Collect {{item}} from {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['mine', 'quarry'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Mine {{item}}',
            targetType: 'item',
            targetTags: ['ore', 'mineral'],
            countRange: [5, 10],
            optional: false,
            hintTemplate: 'Look for exposed veins.',
          },
        ],
        onCompleteTextTemplate: "You've gathered enough.",
      },
    ],
    rewards: {
      xpRange: [20, 40],
      goldRange: [15, 35],
      itemTags: ['tool'],
      itemChance: 0.2,
      reputationImpact: {},
    },
    levelRange: [1, 3],
    giverRoles: ['blacksmith', 'merchant', 'foreman'],
    giverFactions: ['townfolk', 'freeminers'],
    validLocationTypes: ['town', 'mine'],
    tags: ['gathering', 'mining'],
    repeatable: true,
    cooldownHours: 12,
  },
  {
    id: 'gather_scrap',
    name: 'Scrap Collection',
    archetype: 'gather_materials',
    questType: 'side',
    titleTemplates: ['Scrap Hunt', 'Parts Needed', 'Salvage Run'],
    descriptionTemplates: [
      '{{giver}} needs mechanical parts. Salvage some from {{destination}}.',
      'Old machinery at {{destination}} has parts we need.',
      '{{giver}} requires components for repairs. Check the scrap at {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Salvage Parts',
        descriptionTemplate: 'Gather parts from {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['junkyard', 'ruins', 'abandoned'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Salvage parts',
            targetType: 'item',
            targetTags: ['parts', 'scrap', 'component'],
            countRange: [3, 8],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Good haul.',
      },
    ],
    rewards: {
      xpRange: [25, 45],
      goldRange: [15, 30],
      itemTags: ['parts', 'crafting'],
      itemChance: 0.3,
      reputationImpact: {},
    },
    levelRange: [1, 4],
    giverRoles: ['engineer', 'mechanic', 'inventor'],
    giverFactions: ['townfolk', 'freeminers'],
    validLocationTypes: ['town', 'depot'],
    tags: ['gathering', 'salvage', 'steampunk'],
    repeatable: true,
    cooldownHours: 18,
  },
];
