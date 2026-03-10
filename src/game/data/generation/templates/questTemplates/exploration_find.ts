/**
 * Exploration Quest Templates - Find Routes
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const EXPLORATION_FIND_TEMPLATES: QuestTemplate[] = [
  {
    id: 'find_shortcut',
    name: 'Find a Shortcut',
    archetype: 'find_route',
    questType: 'exploration',
    titleTemplates: ['Find a Shortcut', 'New Route to {{destination}}', 'Blaze a Trail'],
    descriptionTemplates: [
      '{{giver}} needs a faster route to {{destination}}.',
      'The main road to {{destination}} is too dangerous. Find an alternative.',
      'There must be a shortcut to {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Scout the Terrain',
        descriptionTemplate: 'Look for a viable route.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Explore potential paths',
            targetType: 'location',
            targetTags: ['wilderness', 'pass'],
            countRange: [2, 3],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Mark the best route',
            targetType: 'any',
            targetTags: ['path', 'trail'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Confirm the Route',
        descriptionTemplate: 'Travel the new route.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Follow the route to {{destination}}',
            targetType: 'location',
            targetTags: ['destination'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The new route works!',
      },
    ],
    rewards: {
      xpRange: [40, 75],
      goldRange: [30, 55],
      itemTags: [],
      itemChance: 0.15,
      reputationImpact: {
        townfolk: [5, 12],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['merchant', 'scout', 'foreman'],
    giverFactions: ['townfolk', 'ivrc', 'freeminers'],
    validLocationTypes: ['town', 'waystation'],
    tags: ['exploration', 'pathfinding'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'find_safe_passage',
    name: 'Safe Passage',
    archetype: 'find_route',
    questType: 'exploration',
    titleTemplates: ['Find Safe Passage', 'Avoid the Danger', 'Alternative Route'],
    descriptionTemplates: [
      'The usual road to {{destination}} is compromised. Find a safe alternative.',
      '{{giver}} needs a route that avoids bandit territory.',
      "Scout a path to {{destination}} that's safe for travelers.",
    ],
    stages: [
      {
        titleTemplate: 'Scout Safe Routes',
        descriptionTemplate: 'Find paths that avoid danger.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Scout potential routes',
            targetType: 'location',
            targetTags: ['wilderness', 'road'],
            countRange: [2, 4],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Assess route safety',
            targetType: 'any',
            targetTags: ['observation'],
            countRange: [2, 3],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Test the Route',
        descriptionTemplate: 'Travel the safe passage yourself.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Complete the journey to {{destination}}',
            targetType: 'location',
            targetTags: ['destination'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The safe route has been confirmed.',
      },
    ],
    rewards: {
      xpRange: [45, 80],
      goldRange: [35, 65],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        townfolk: [8, 15],
      },
    },
    levelRange: [2, 6],
    giverRoles: ['merchant', 'sheriff', 'scout'],
    giverFactions: ['townfolk', 'law'],
    validLocationTypes: ['town'],
    tags: ['exploration', 'pathfinding', 'safety'],
    repeatable: true,
    cooldownHours: 72,
  },
];
