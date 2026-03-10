/**
 * Retrieval Quest Templates - Steal Item
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const RETRIEVAL_STEAL_TEMPLATES: QuestTemplate[] = [
  {
    id: 'steal_documents',
    name: 'Acquire Documents',
    archetype: 'steal_item',
    questType: 'side',
    titleTemplates: ['Covert Acquisition', 'Get the {{item}}', 'Corporate Secrets'],
    descriptionTemplates: [
      '{{giver}} needs you to "acquire" {{item}} from {{destination}}. Discretion is key.',
      'Important documents are held at {{destination}}. Get them without being seen.',
      "{{giver}} wants {{item}} retrieved quietly. Don't ask why.",
    ],
    stages: [
      {
        titleTemplate: 'Infiltrate',
        descriptionTemplate: 'Get inside {{destination}} undetected.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Enter {{destination}}',
            targetType: 'location',
            targetTags: ['office', 'warehouse', 'building'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Look for a back entrance or unlocked window.',
          },
        ],
      },
      {
        titleTemplate: 'Take the {{item}}',
        descriptionTemplate: 'Find and secure the {{item}}.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Take the {{item}}',
            targetType: 'item',
            targetTags: ['document', 'evidence'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'visit',
            descriptionTemplate: 'Escape undetected',
            targetType: 'location',
            targetTags: ['outside'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'You got out clean.',
      },
    ],
    rewards: {
      xpRange: [45, 80],
      goldRange: [35, 70],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        law: [-3, -8],
      },
    },
    levelRange: [3, 7],
    giverRoles: ['fixer', 'informant', 'rebel'],
    giverFactions: ['freeminers', 'copperhead', 'neutral'],
    validLocationTypes: ['town', 'hideout'],
    tags: ['stealth', 'criminal', 'documents'],
    repeatable: true,
    cooldownHours: 72,
  },
  {
    id: 'steal_payroll',
    name: 'Payroll Heist',
    archetype: 'steal_item',
    questType: 'side',
    titleTemplates: ['The Payroll Job', 'IVRC Payroll', 'Redistribution'],
    descriptionTemplates: [
      '{{giver}} wants IVRC\'s payroll "redirected" from {{destination}}.',
      "The workers deserve that payroll more than IVRC. It's at {{destination}}.",
      'Hit the payroll at {{destination}}. For the people.',
    ],
    stages: [
      {
        titleTemplate: 'Case the Joint',
        descriptionTemplate: 'Scout {{destination}} for the payroll.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Scout {{destination}}',
            targetType: 'location',
            targetTags: ['office', 'bank', 'depot'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Grab the Payroll',
        descriptionTemplate: 'Take the money and get out.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Take the payroll',
            targetType: 'item',
            targetTags: ['money', 'payroll'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Deal with guards',
            targetType: 'enemy',
            targetTags: ['guard', 'security'],
            countRange: [0, 3],
            optional: true,
          },
        ],
        onCompleteTextTemplate: 'The payroll is yours.',
      },
    ],
    rewards: {
      xpRange: [60, 100],
      goldRange: [80, 150],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        ivrc: [-15, -25],
        freeminers: [10, 20],
        law: [-10, -18],
      },
    },
    levelRange: [4, 8],
    giverRoles: ['rebel', 'union_organizer', 'fixer'],
    giverFactions: ['freeminers'],
    validLocationTypes: ['town', 'mine'],
    tags: ['heist', 'anti-ivrc', 'criminal'],
    repeatable: true,
    cooldownHours: 96,
  },
];
