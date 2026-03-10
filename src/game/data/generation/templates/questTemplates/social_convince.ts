/**
 * Social Quest Templates - Convince NPC
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const SOCIAL_CONVINCE_TEMPLATES: QuestTemplate[] = [
  {
    id: 'convince_settler',
    name: 'Persuade the Settler',
    archetype: 'convince_npc',
    questType: 'side',
    titleTemplates: ['Talk Some Sense', 'Convince {{target}}', 'Diplomatic Mission'],
    descriptionTemplates: [
      '{{giver}} needs you to convince {{target}} to see reason.',
      "{{target}} won't listen to {{giver}}. Maybe they'll listen to you.",
      'A little diplomacy could prevent a lot of trouble.',
    ],
    stages: [
      {
        titleTemplate: 'Find {{target}}',
        descriptionTemplate: 'Locate {{target}} and talk to them.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Find and speak with {{target}}',
            targetType: 'npc',
            targetTags: ['settler', 'townsperson'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Convince {{target}}',
        descriptionTemplate: 'Use your words to persuade them.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Convince {{target}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Consider their perspective. What do they want?',
          },
        ],
        onCompleteTextTemplate: '{{target}} has been convinced.',
      },
    ],
    rewards: {
      xpRange: [25, 45],
      goldRange: [15, 30],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        townfolk: [5, 10],
      },
    },
    levelRange: [1, 4],
    giverRoles: ['mayor', 'sheriff', 'preacher'],
    giverFactions: ['townfolk', 'law'],
    validLocationTypes: ['town'],
    tags: ['social', 'diplomacy', 'peaceful'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'convince_recruit',
    name: 'Recruitment',
    archetype: 'convince_npc',
    questType: 'side',
    titleTemplates: ['Win Over {{target}}', 'Recruitment Drive', 'Bring {{target}} Aboard'],
    descriptionTemplates: [
      '{{giver}} wants {{target}} to join the cause. Convince them.',
      '{{target}} has skills we need. Persuade them to work with us.',
      'Talk to {{target}} and bring them to our side.',
    ],
    stages: [
      {
        titleTemplate: 'Meet {{target}}',
        descriptionTemplate: 'Find {{target}} and begin your pitch.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Meet {{target}}',
            targetType: 'npc',
            targetTags: ['recruit'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Prove Your Worth',
        descriptionTemplate: 'Complete a task to earn their trust.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Do a favor for {{target}}',
            targetType: 'any',
            targetTags: ['favor', 'task'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Seal the Deal',
        descriptionTemplate: "Finalize {{target}}'s commitment.",
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: "Get {{target}}'s agreement",
            targetType: 'npc',
            targetTags: ['recruit'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: '"Alright, you\'ve convinced me. I\'m in."',
      },
    ],
    rewards: {
      xpRange: [40, 70],
      goldRange: [20, 40],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {},
    },
    levelRange: [2, 5],
    giverRoles: ['leader', 'recruiter', 'foreman'],
    giverFactions: ['freeminers', 'ivrc', 'law'],
    validLocationTypes: ['town'],
    tags: ['social', 'recruitment'],
    repeatable: true,
    cooldownHours: 48,
  },
];
