/**
 * Combat Quest Templates - Bounty Hunts
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const COMBAT_BOUNTY_TEMPLATES: QuestTemplate[] = [
  {
    id: 'bounty_basic',
    name: 'Basic Bounty',
    archetype: 'bounty_hunt',
    questType: 'bounty',
    titleTemplates: [
      'Wanted: {{target}}',
      'Bounty on {{target}}',
      'Bring in {{target}}',
      'Dead or Alive: {{target}}',
    ],
    descriptionTemplates: [
      '{{target}} is wanted for crimes in {{region}}. Bring them in, dead or alive.',
      "The law wants {{target}}. There's a price on their head.",
      '{{giver}} needs {{target}} dealt with. Permanently.',
    ],
    stages: [
      {
        titleTemplate: 'Hunt the Outlaw',
        descriptionTemplate: 'Track down and confront {{target}}.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Kill or capture {{target}}',
            targetType: 'enemy',
            targetTags: ['outlaw', 'bandit'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Check the saloons and outlaw camps.',
          },
        ],
        onCompleteTextTemplate: '{{target}} has been dealt with.',
      },
      {
        titleTemplate: 'Claim the Bounty',
        descriptionTemplate: 'Return to {{giver}} to claim your reward.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: ['lawman', 'official'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'You collected the bounty.',
      },
    ],
    rewards: {
      xpRange: [30, 60],
      goldRange: [20, 50],
      itemTags: [],
      itemChance: 0.2,
      reputationImpact: {
        law: [5, 15],
        copperhead: [-5, -15],
      },
    },
    levelRange: [1, 5],
    giverRoles: ['sheriff', 'deputy', 'bounty_hunter'],
    giverFactions: ['law'],
    validLocationTypes: ['town', 'outpost'],
    tags: ['combat', 'bounty', 'law'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'bounty_gang_leader',
    name: 'Gang Leader Bounty',
    archetype: 'bounty_hunt',
    questType: 'bounty',
    titleTemplates: [
      'Wanted: {{target}} - Gang Leader',
      'High Bounty: {{target}}',
      "Take Down {{target}}'s Gang",
    ],
    descriptionTemplates: [
      '{{target}} leads a gang terrorizing {{region}}. The bounty is substantial.',
      'This outlaw has evaded the law for too long. It ends now.',
      '{{giver}} is offering top dollar for {{target}}.',
    ],
    stages: [
      {
        titleTemplate: 'Find the Gang',
        descriptionTemplate: "Locate {{target}}'s hideout.",
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Find the gang hideout',
            targetType: 'location',
            targetTags: ['bandit_camp', 'hideout'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Ask around. Someone knows where they hide.',
          },
        ],
      },
      {
        titleTemplate: 'Eliminate the Gang',
        descriptionTemplate: 'Clear out the gang and their leader.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Defeat gang members',
            targetType: 'enemy',
            targetTags: ['bandit', 'gang_member'],
            countRange: [3, 6],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Kill or capture {{target}}',
            targetType: 'enemy',
            targetTags: ['bandit_leader'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The gang has been destroyed.',
      },
    ],
    rewards: {
      xpRange: [60, 100],
      goldRange: [50, 100],
      itemTags: ['weapon'],
      itemChance: 0.4,
      reputationImpact: {
        law: [10, 25],
        copperhead: [-15, -30],
      },
    },
    levelRange: [3, 8],
    giverRoles: ['sheriff', 'marshal'],
    giverFactions: ['law'],
    validLocationTypes: ['town'],
    tags: ['combat', 'bounty', 'gang', 'difficult'],
    repeatable: true,
    cooldownHours: 72,
  },
  {
    id: 'bounty_desperado',
    name: 'Desperado Bounty',
    archetype: 'bounty_hunt',
    questType: 'bounty',
    titleTemplates: [
      'The {{target}} Bounty',
      'Dangerous Outlaw: {{target}}',
      'Wanted for Murder: {{target}}',
    ],
    descriptionTemplates: [
      '{{target}} is a cold-blooded killer. Find them near {{destination}} and end their reign of terror.',
      'This desperado has left a trail of bodies. Last seen heading to {{destination}}.',
      '{{giver}} warns that {{target}} is extremely dangerous. Approach with caution.',
    ],
    stages: [
      {
        titleTemplate: 'Track {{target}}',
        descriptionTemplate: "Follow {{target}}'s trail to {{destination}}.",
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Search {{destination}} for {{target}}',
            targetType: 'location',
            targetTags: ['wilderness', 'hideout'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Showdown',
        descriptionTemplate: 'Face {{target}} in a final confrontation.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Defeat {{target}}',
            targetType: 'enemy',
            targetTags: ['desperado', 'boss'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: '{{target}} will trouble no one ever again.',
      },
    ],
    rewards: {
      xpRange: [75, 125],
      goldRange: [60, 120],
      itemTags: ['weapon', 'rare'],
      itemChance: 0.5,
      reputationImpact: {
        law: [15, 30],
        townfolk: [5, 15],
      },
    },
    levelRange: [4, 9],
    giverRoles: ['sheriff', 'marshal', 'bounty_hunter'],
    giverFactions: ['law'],
    validLocationTypes: ['town'],
    tags: ['combat', 'bounty', 'boss', 'difficult'],
    repeatable: true,
    cooldownHours: 96,
  },
];
