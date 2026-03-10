/**
 * Exploration Quest Templates - Mapping
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const EXPLORATION_MAP_TEMPLATES: QuestTemplate[] = [
  {
    id: 'map_territory',
    name: 'Survey Mission',
    archetype: 'map_area',
    questType: 'exploration',
    titleTemplates: ['Map the Territory', 'Survey {{destination}}', 'Chart the Region'],
    descriptionTemplates: [
      '{{giver}} needs accurate maps of {{destination}}. Survey the area.',
      'The territory around {{destination}} is unmapped. Chart it.',
      'Create a detailed survey for {{giver}}.',
    ],
    stages: [
      {
        titleTemplate: 'Survey {{destination}}',
        descriptionTemplate: 'Visit key points and document the terrain.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Survey point 1',
            targetType: 'location',
            targetTags: ['survey_point', 'landmark'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'visit',
            descriptionTemplate: 'Survey point 2',
            targetType: 'location',
            targetTags: ['survey_point', 'landmark'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'visit',
            descriptionTemplate: 'Survey point 3',
            targetType: 'location',
            targetTags: ['survey_point', 'landmark'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Complete the survey',
            targetType: 'any',
            targetTags: ['survey'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Survey complete.',
      },
    ],
    rewards: {
      xpRange: [40, 70],
      goldRange: [25, 50],
      itemTags: ['map'],
      itemChance: 0.3,
      reputationImpact: {},
    },
    levelRange: [1, 4],
    giverRoles: ['surveyor', 'official', 'foreman'],
    giverFactions: ['ivrc', 'townfolk', 'freeminers'],
    validLocationTypes: ['town', 'depot'],
    tags: ['exploration', 'mapping'],
    repeatable: true,
    cooldownHours: 36,
  },
  {
    id: 'map_mining_claims',
    name: 'Claim Survey',
    archetype: 'map_area',
    questType: 'exploration',
    titleTemplates: ['Survey Mining Claims', 'Map the Claims', "Prospector's Survey"],
    descriptionTemplates: [
      '{{giver}} needs mining claims surveyed at {{destination}}.',
      'Document the boundaries of claims near {{destination}}.',
      'Create official maps for the {{destination}} mining district.',
    ],
    stages: [
      {
        titleTemplate: 'Survey the Claims',
        descriptionTemplate: 'Document each mining claim.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Survey claim areas',
            targetType: 'location',
            targetTags: ['mine', 'claim'],
            countRange: [2, 4],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Mark boundaries',
            targetType: 'any',
            targetTags: ['boundary', 'marker'],
            countRange: [3, 5],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Claims have been surveyed.',
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [30, 55],
      itemTags: ['map', 'document'],
      itemChance: 0.2,
      reputationImpact: {
        freeminers: [5, 12],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['surveyor', 'prospector', 'official'],
    giverFactions: ['freeminers', 'ivrc'],
    validLocationTypes: ['mine', 'town'],
    tags: ['exploration', 'mapping', 'mining'],
    repeatable: true,
    cooldownHours: 48,
  },
];
