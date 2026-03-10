/**
 * Social Quest Templates - Find Person
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const SOCIAL_FIND_TEMPLATES: QuestTemplate[] = [
  {
    id: 'find_missing_person',
    name: 'Missing Person',
    archetype: 'find_person',
    questType: 'side',
    titleTemplates: ['Find {{target}}', 'Missing: {{target}}', 'Search for the Lost'],
    descriptionTemplates: [
      '{{target}} went missing days ago. {{giver}} is worried sick.',
      'No one has seen {{target}} since they headed to {{destination}}.',
      'Help find {{target}}. They could be in danger.',
    ],
    stages: [
      {
        titleTemplate: 'Search for {{target}}',
        descriptionTemplate: "Investigate {{target}}'s disappearance.",
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Search {{destination}}',
            targetType: 'location',
            targetTags: ['wilderness', 'ruins'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Talk to people who last saw {{target}}.',
          },
        ],
      },
      {
        titleTemplate: 'Find {{target}}',
        descriptionTemplate: 'Locate the missing person.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Find {{target}}',
            targetType: 'npc',
            targetTags: ['missing', 'victim'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'You found {{target}}!',
      },
    ],
    rewards: {
      xpRange: [30, 55],
      goldRange: [20, 40],
      itemTags: [],
      itemChance: 0.15,
      reputationImpact: {
        townfolk: [8, 15],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['townsperson', 'family_member', 'sheriff'],
    giverFactions: ['townfolk', 'law'],
    validLocationTypes: ['town'],
    tags: ['investigation', 'rescue', 'missing_person'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'find_debtor',
    name: 'Track the Debtor',
    archetype: 'find_person',
    questType: 'side',
    titleTemplates: ['Find the Debtor', 'Hunt Down {{target}}', '{{target}} Owes Money'],
    descriptionTemplates: [
      '{{target}} owes money and skipped town. Track them to {{destination}}.',
      'A debtor named {{target}} fled toward {{destination}}.',
      '{{target}} ran off without paying. Find them.',
    ],
    stages: [
      {
        titleTemplate: 'Track {{target}}',
        descriptionTemplate: "Follow {{target}}'s trail.",
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Search {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'hideout'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Ask locals about {{target}}',
            targetType: 'npc',
            targetTags: ['local', 'informant'],
            countRange: [1, 2],
            optional: true,
          },
        ],
      },
      {
        titleTemplate: 'Confront {{target}}',
        descriptionTemplate: 'Find {{target}} and settle the debt.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Confront {{target}}',
            targetType: 'npc',
            targetTags: ['debtor'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: '{{target}} pays up.',
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [35, 70],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {},
    },
    levelRange: [2, 5],
    giverRoles: ['banker', 'merchant', 'loan_shark'],
    giverFactions: ['ivrc', 'townfolk'],
    validLocationTypes: ['town'],
    tags: ['investigation', 'tracking', 'debt'],
    repeatable: true,
    cooldownHours: 48,
  },
];
