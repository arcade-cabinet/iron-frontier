/**
 * Exploration Quest Templates - Explore Locations
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const EXPLORATION_EXPLORE_TEMPLATES: QuestTemplate[] = [
  {
    id: 'explore_ruins',
    name: 'Explore the Ruins',
    archetype: 'explore_location',
    questType: 'exploration',
    titleTemplates: ['The Old Ruins', 'Explore {{destination}}', 'Survey Mission'],
    descriptionTemplates: [
      "{{giver}} wants to know what's at {{destination}}.",
      "Nobody's been to {{destination}} in years. Scout it out.",
      'There might be something valuable at {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Reach {{destination}}',
        descriptionTemplate: 'Travel to the location.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Reach {{destination}}',
            targetType: 'location',
            targetTags: ['ruins', 'abandoned'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Explore the Area',
        descriptionTemplate: 'Search thoroughly.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Explore {{destination}}',
            targetType: 'any',
            targetTags: ['point_of_interest'],
            countRange: [2, 4],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Find items of interest',
            targetType: 'item',
            targetTags: ['artifact', 'salvage'],
            countRange: [1, 3],
            optional: true,
          },
        ],
        onCompleteTextTemplate: "You've thoroughly explored the area.",
      },
    ],
    rewards: {
      xpRange: [35, 65],
      goldRange: [20, 45],
      itemTags: ['artifact', 'treasure'],
      itemChance: 0.4,
      reputationImpact: {},
    },
    levelRange: [2, 6],
    giverRoles: ['prospector', 'mayor', 'scholar'],
    giverFactions: ['townfolk', 'freeminers'],
    validLocationTypes: ['town', 'outpost'],
    tags: ['exploration', 'adventure'],
    repeatable: true,
    cooldownHours: 72,
  },
  {
    id: 'explore_cave',
    name: 'Cave Exploration',
    archetype: 'explore_location',
    questType: 'exploration',
    titleTemplates: ['Into the Depths', 'Explore the Cave', 'Underground Survey'],
    descriptionTemplates: [
      "A cave was discovered near {{location}}. See what's inside.",
      '{{giver}} wants the caves at {{destination}} mapped.',
      'Rumors of treasure in the {{destination}} caves. Investigate.',
    ],
    stages: [
      {
        titleTemplate: 'Enter the Cave',
        descriptionTemplate: 'Descend into {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Enter {{destination}}',
            targetType: 'location',
            targetTags: ['cave', 'mine'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Explore the Depths',
        descriptionTemplate: 'Map the cave system.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Explore cave sections',
            targetType: 'any',
            targetTags: ['cave_section', 'landmark'],
            countRange: [3, 5],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Deal with cave creatures',
            targetType: 'enemy',
            targetTags: ['creature', 'vermin'],
            countRange: [0, 4],
            optional: true,
          },
        ],
        onCompleteTextTemplate: 'The caves have been mapped.',
      },
    ],
    rewards: {
      xpRange: [45, 80],
      goldRange: [25, 55],
      itemTags: ['mineral', 'artifact'],
      itemChance: 0.5,
      reputationImpact: {
        freeminers: [3, 8],
      },
    },
    levelRange: [3, 7],
    giverRoles: ['prospector', 'scholar', 'foreman'],
    giverFactions: ['freeminers', 'townfolk'],
    validLocationTypes: ['town', 'mine'],
    tags: ['exploration', 'dungeon', 'cave'],
    repeatable: true,
    cooldownHours: 48,
  },
];
