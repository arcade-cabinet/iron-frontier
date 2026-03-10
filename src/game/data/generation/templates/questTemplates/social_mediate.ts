/**
 * Social Quest Templates - Mediation
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const SOCIAL_MEDIATE_TEMPLATES: QuestTemplate[] = [
  {
    id: 'mediate_dispute',
    name: 'Settle the Dispute',
    archetype: 'mediate',
    questType: 'side',
    titleTemplates: ['Peace Talks', 'Mediate the Conflict', 'Settle This'],
    descriptionTemplates: [
      'Two parties are at odds. {{giver}} needs someone to mediate.',
      'This dispute could turn violent. Help find a peaceful resolution.',
      'Neither side will back down. Maybe an outsider can help.',
    ],
    stages: [
      {
        titleTemplate: 'Hear Both Sides',
        descriptionTemplate: 'Talk to both parties.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Speak with the first party',
            targetType: 'npc',
            targetTags: ['disputant'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Speak with the second party',
            targetType: 'npc',
            targetTags: ['disputant'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Broker Peace',
        descriptionTemplate: 'Find a compromise.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Propose a resolution',
            targetType: 'any',
            targetTags: ['negotiation'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The dispute has been resolved.',
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [20, 40],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        townfolk: [8, 15],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['mayor', 'preacher', 'sheriff'],
    giverFactions: ['townfolk', 'law'],
    validLocationTypes: ['town'],
    tags: ['social', 'mediation', 'peaceful'],
    repeatable: true,
    cooldownHours: 72,
  },
  {
    id: 'mediate_labor',
    name: 'Labor Dispute',
    archetype: 'mediate',
    questType: 'side',
    titleTemplates: ['Worker Talks', 'Labor Negotiation', 'Strike Mediation'],
    descriptionTemplates: [
      'Workers and management are at an impasse. Help negotiate.',
      'A strike is brewing. Find a compromise before it gets ugly.',
      '{{giver}} needs someone neutral to mediate labor disputes.',
    ],
    stages: [
      {
        titleTemplate: 'Meet Both Sides',
        descriptionTemplate: "Understand each party's concerns.",
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Speak with workers',
            targetType: 'npc',
            targetTags: ['worker', 'miner'],
            countRange: [1, 2],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Speak with management',
            targetType: 'npc',
            targetTags: ['foreman', 'manager'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Negotiate Terms',
        descriptionTemplate: 'Hammer out an agreement.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Finalize the agreement',
            targetType: 'any',
            targetTags: ['contract', 'agreement'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Both sides have reached an agreement.',
      },
    ],
    rewards: {
      xpRange: [45, 75],
      goldRange: [30, 55],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        freeminers: [5, 12],
        ivrc: [3, 8],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['mayor', 'official', 'neutral_party'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town', 'mine'],
    tags: ['social', 'mediation', 'labor'],
    repeatable: true,
    cooldownHours: 96,
  },
];
