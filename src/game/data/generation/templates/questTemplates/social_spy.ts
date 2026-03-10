/**
 * Social Quest Templates - Espionage
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const SOCIAL_SPY_TEMPLATES: QuestTemplate[] = [
  {
    id: 'spy_on_ivrc',
    name: 'Intelligence Gathering',
    archetype: 'spy',
    questType: 'side',
    titleTemplates: ['Spy on IVRC', 'Eyes and Ears', 'Watch and Report'],
    descriptionTemplates: [
      '{{giver}} needs intel on IVRC activities at {{destination}}. Observe and report.',
      'We need to know what IVRC is planning at {{destination}}.',
      'Keep an eye on {{destination}} and report any suspicious activity.',
    ],
    stages: [
      {
        titleTemplate: 'Infiltrate',
        descriptionTemplate: 'Get close to {{destination}} without being detected.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Reach observation point',
            targetType: 'location',
            targetTags: ['building', 'camp'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Observe and Report',
        descriptionTemplate: 'Watch IVRC activities and gather intel.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Observe operations',
            targetType: 'any',
            targetTags: ['observation', 'intel'],
            countRange: [2, 3],
            optional: false,
            hintTemplate: 'Stay hidden and take mental notes.',
          },
          {
            type: 'talk',
            descriptionTemplate: 'Report to your contact',
            targetType: 'npc',
            targetTags: ['handler', 'contact'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Good work. This information is valuable.',
      },
    ],
    rewards: {
      xpRange: [45, 80],
      goldRange: [35, 65],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        freeminers: [8, 15],
        ivrc: [-5, -10],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['rebel', 'spymaster', 'union_organizer'],
    giverFactions: ['freeminers'],
    validLocationTypes: ['town', 'hideout'],
    tags: ['investigation', 'spy', 'stealth'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'spy_gang_movements',
    name: 'Track Gang Movements',
    archetype: 'spy',
    questType: 'side',
    titleTemplates: ['Scout the Gang', 'Track Copperhead', 'Eyes on the Outlaws'],
    descriptionTemplates: [
      '{{giver}} needs information on Copperhead gang movements near {{destination}}.',
      'We need to know where the gang is operating. Scout {{destination}}.',
      "Track the outlaws but don't engage. Intel only.",
    ],
    stages: [
      {
        titleTemplate: 'Scout the Area',
        descriptionTemplate: 'Survey {{destination}} for gang activity.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Search {{destination}}',
            targetType: 'location',
            targetTags: ['wilderness', 'hideout'],
            countRange: [1, 2],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Document gang positions',
            targetType: 'any',
            targetTags: ['observation'],
            countRange: [2, 3],
            optional: false,
          },
        ],
        onCompleteTextTemplate: "You've gathered valuable intelligence.",
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [25, 50],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        law: [5, 12],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['sheriff', 'ranger', 'scout'],
    giverFactions: ['law'],
    validLocationTypes: ['town', 'outpost'],
    tags: ['investigation', 'spy', 'gang'],
    repeatable: true,
    cooldownHours: 36,
  },
];
