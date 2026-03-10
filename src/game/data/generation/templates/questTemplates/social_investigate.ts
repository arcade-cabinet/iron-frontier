/**
 * Social Quest Templates - Investigation
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const SOCIAL_INVESTIGATE_TEMPLATES: QuestTemplate[] = [
  {
    id: 'investigate_crime',
    name: 'Crime Investigation',
    archetype: 'investigate',
    questType: 'side',
    titleTemplates: ['Who Done It?', 'Solve the Crime', 'Investigation: {{location}}'],
    descriptionTemplates: [
      "Something bad happened and {{giver}} wants to know who's responsible.",
      "There's been a crime. Help investigate.",
      '{{giver}} needs someone to get to the bottom of this.',
    ],
    stages: [
      {
        titleTemplate: 'Gather Evidence',
        descriptionTemplate: 'Investigate the scene and talk to witnesses.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Search for clues',
            targetType: 'any',
            targetTags: ['clue', 'evidence'],
            countRange: [2, 4],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Interview witnesses',
            targetType: 'npc',
            targetTags: ['witness'],
            countRange: [2, 3],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Confront the Culprit',
        descriptionTemplate: 'Bring the guilty party to justice.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Confront the culprit',
            targetType: 'npc',
            targetTags: ['suspect', 'culprit'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Justice has been served.',
      },
    ],
    rewards: {
      xpRange: [40, 70],
      goldRange: [30, 55],
      itemTags: [],
      itemChance: 0.2,
      reputationImpact: {
        law: [8, 15],
      },
    },
    levelRange: [2, 6],
    giverRoles: ['sheriff', 'mayor', 'victim'],
    giverFactions: ['law', 'townfolk'],
    validLocationTypes: ['town'],
    tags: ['investigation', 'crime', 'mystery'],
    repeatable: true,
    cooldownHours: 72,
  },
  {
    id: 'investigate_corruption',
    name: 'Follow the Money',
    archetype: 'investigate',
    questType: 'side',
    titleTemplates: ['Corporate Corruption', 'Follow the Money', 'Dirty Dealings'],
    descriptionTemplates: [
      '{{giver}} suspects corruption. Find evidence at {{destination}}.',
      "Someone's skimming profits. Investigate the books.",
      "There's dirty money flowing through {{destination}}. Expose it.",
    ],
    stages: [
      {
        titleTemplate: 'Find Records',
        descriptionTemplate: 'Access financial records at {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Enter {{destination}}',
            targetType: 'location',
            targetTags: ['office', 'bank'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Obtain the ledgers',
            targetType: 'item',
            targetTags: ['document', 'ledger'],
            countRange: [1, 2],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Verify the Evidence',
        descriptionTemplate: 'Confirm the corruption with witnesses.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Find corroborating testimony',
            targetType: 'npc',
            targetTags: ['witness', 'informant'],
            countRange: [1, 2],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The evidence is damning.',
      },
    ],
    rewards: {
      xpRange: [55, 95],
      goldRange: [40, 80],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        freeminers: [5, 15],
      },
    },
    levelRange: [4, 7],
    giverRoles: ['journalist', 'reformer', 'rebel'],
    giverFactions: ['freeminers', 'law'],
    validLocationTypes: ['town'],
    tags: ['investigation', 'corruption', 'political'],
    repeatable: true,
    cooldownHours: 96,
  },
];
