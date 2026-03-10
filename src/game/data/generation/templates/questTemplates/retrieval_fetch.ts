/**
 * Retrieval Quest Templates - Fetch Item
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const RETRIEVAL_FETCH_TEMPLATES: QuestTemplate[] = [
  {
    id: 'fetch_medicine',
    name: 'Medicine Run',
    archetype: 'fetch_item',
    questType: 'side',
    titleTemplates: [
      'Urgent: Medicine Needed',
      'Medical Supplies for {{location}}',
      "Fetch Dr. {{giver}}'s Order",
    ],
    descriptionTemplates: [
      '{{giver}} desperately needs medical supplies from {{destination}}.',
      "Someone's sick and needs medicine. Pick it up from {{destination}}.",
      'The doctor is out of supplies. Get more from the trading post.',
    ],
    stages: [
      {
        titleTemplate: 'Get the Medicine',
        descriptionTemplate: 'Travel to {{destination}} and acquire the supplies.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Acquire medical supplies',
            targetType: 'item',
            targetTags: ['medicine', 'medical'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'The general store or trading post should have what you need.',
          },
        ],
      },
      {
        titleTemplate: 'Deliver the Medicine',
        descriptionTemplate: 'Bring the supplies back to {{giver}}.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Give supplies to {{giver}}',
            targetType: 'npc',
            targetTags: ['doctor'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The medicine arrived in time.',
      },
    ],
    rewards: {
      xpRange: [20, 35],
      goldRange: [15, 30],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        townfolk: [5, 12],
      },
    },
    levelRange: [1, 3],
    giverRoles: ['doctor', 'apothecary'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town'],
    tags: ['fetch', 'urgent', 'helpful'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'fetch_parts',
    name: 'Machine Parts',
    archetype: 'fetch_item',
    questType: 'side',
    titleTemplates: ['Parts Needed', 'Steam Engine Repair', 'Mechanical Components Wanted'],
    descriptionTemplates: [
      '{{giver}} needs specific parts to fix a machine. Can you find them?',
      'The steam engine is down. We need replacement parts from {{destination}}.',
      'Without these parts, the whole operation stops.',
    ],
    stages: [
      {
        titleTemplate: 'Find the Parts',
        descriptionTemplate: 'Search for the mechanical components.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Find mechanical parts',
            targetType: 'item',
            targetTags: ['parts', 'mechanical', 'steam'],
            countRange: [2, 4],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Deliver the Parts',
        descriptionTemplate: 'Return the parts to {{giver}}.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Give parts to {{giver}}',
            targetType: 'npc',
            targetTags: ['engineer', 'blacksmith'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The machine can be repaired now.',
      },
    ],
    rewards: {
      xpRange: [25, 45],
      goldRange: [20, 40],
      itemTags: [],
      itemChance: 0.15,
      reputationImpact: {
        freeminers: [3, 8],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['blacksmith', 'engineer', 'foreman'],
    giverFactions: ['freeminers', 'ivrc'],
    validLocationTypes: ['town', 'mine'],
    tags: ['fetch', 'industrial', 'steampunk'],
    repeatable: true,
    cooldownHours: 36,
  },
  {
    id: 'fetch_heirloom',
    name: 'Lost Heirloom',
    archetype: 'fetch_item',
    questType: 'side',
    titleTemplates: ['Find the {{item}}', 'Family Heirloom', 'Recover the {{item}}'],
    descriptionTemplates: [
      '{{giver}} lost a precious family {{item}} at {{destination}}. Retrieve it.',
      'A valuable {{item}} was left behind at {{destination}}. It has sentimental value.',
      "{{giver}}'s {{item}} is somewhere in {{destination}}. Find it and return it.",
    ],
    stages: [
      {
        titleTemplate: 'Search for the {{item}}',
        descriptionTemplate: 'Look for the {{item}} at {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['building', 'ruins', 'wilderness'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Find the {{item}}',
            targetType: 'item',
            targetTags: ['heirloom', 'valuable'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Return the {{item}}',
        descriptionTemplate: 'Bring it back to {{giver}}.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Return the {{item}} to {{giver}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: '"My {{item}}! I thought I\'d lost it forever. Thank you!"',
      },
    ],
    rewards: {
      xpRange: [25, 45],
      goldRange: [15, 35],
      itemTags: [],
      itemChance: 0.15,
      reputationImpact: {
        townfolk: [5, 12],
      },
    },
    levelRange: [1, 4],
    giverRoles: ['townsperson', 'elder', 'widow'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town'],
    tags: ['fetch', 'personal', 'helpful'],
    repeatable: true,
    cooldownHours: 24,
  },
];
