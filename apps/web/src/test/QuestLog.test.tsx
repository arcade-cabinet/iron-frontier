/**
 * Quest Log Tests
 * Tests for quest tracking and display
 *
 * Uses the new stage-based quest system where:
 * - activeQuests are ActiveQuest objects with questId references
 * - Quest definitions are looked up from the registry
 */

import type { Quest } from '@iron-frontier/shared/data/schemas/quest';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuestLog } from '@/game/ui/QuestLog';
import { customRender } from './test-utils';

// Mock the quest registry to return controlled test data
vi.mock('@iron-frontier/shared/data/quests', () => ({
  getQuestById: (id: string): Quest | undefined => {
    const mockQuests: Record<string, Quest> = {
      test_quest_1: {
        id: 'test_quest_1',
        title: 'Find the Golden Gear',
        description: 'Search the old workshop for a rare golden gear.',
        type: 'side',
        giverNpcId: 'npc_mechanic',
        startLocationId: 'dusty_springs',
        recommendedLevel: 1,
        tags: ['test'],
        repeatable: false,
        timeLimitHours: null,
        prerequisites: {
          completedQuests: [],
          factionReputation: {},
          requiredItems: [],
        },
        stages: [
          {
            id: 'stage_1',
            title: 'Find the Workshop',
            description: 'Locate the old workshop on the outskirts of town.',
            objectives: [
              {
                id: 'obj_goto_workshop',
                description: 'Go to the workshop',
                type: 'visit',
                target: 'marker_workshop',
                count: 1,
                current: 0,
                optional: false,
                hidden: false,
              },
              {
                id: 'obj_search_shelves',
                description: 'Search the shelves',
                type: 'interact',
                target: 'shelves',
                count: 1,
                current: 0,
                optional: false,
                hidden: false,
              },
            ],
            stageRewards: { xp: 25, gold: 10, items: [], reputation: {} },
          },
        ],
        rewards: { xp: 150, gold: 75, items: [], reputation: {}, unlocksQuests: [] },
      },
      test_quest_2: {
        id: 'test_quest_2',
        title: 'Deliver the Package',
        description: 'A simple delivery job.',
        type: 'delivery',
        giverNpcId: 'npc_merchant',
        startLocationId: 'junction_city',
        recommendedLevel: 1,
        tags: ['test'],
        repeatable: false,
        timeLimitHours: null,
        prerequisites: {
          completedQuests: [],
          factionReputation: {},
          requiredItems: [],
        },
        stages: [
          {
            id: 'stage_1',
            title: 'Make the Delivery',
            description: 'Bring the package to its destination.',
            objectives: [
              {
                id: 'obj_deliver',
                description: 'Deliver the package',
                type: 'deliver',
                target: 'item_package',
                deliverTo: 'npc_recipient',
                count: 1,
                current: 0,
                optional: false,
                hidden: false,
              },
            ],
            stageRewards: { xp: 10, gold: 5, items: [], reputation: {} },
          },
        ],
        rewards: { xp: 50, gold: 25, items: [], reputation: {}, unlocksQuests: [] },
      },
      completed_quest_1: {
        id: 'completed_quest_1',
        title: 'Past Adventure',
        description: 'A quest that was completed.',
        type: 'side',
        giverNpcId: 'npc_old_timer',
        startLocationId: 'dusty_springs',
        recommendedLevel: 1,
        tags: ['test'],
        repeatable: false,
        timeLimitHours: null,
        prerequisites: { completedQuests: [], factionReputation: {}, requiredItems: [] },
        stages: [
          {
            id: 'stage_1',
            title: 'Do the Thing',
            description: 'Simple objective.',
            objectives: [
              {
                id: 'obj_1',
                description: 'Complete',
                type: 'visit',
                target: 'loc',
                count: 1,
                current: 0,
                optional: false,
                hidden: false,
              },
            ],
            stageRewards: { xp: 10, gold: 0, items: [], reputation: {} },
          },
        ],
        rewards: { xp: 25, gold: 10, items: [], reputation: {}, unlocksQuests: [] },
      },
    };
    return mockQuests[id];
  },
}));

describe('QuestLog', () => {
  describe('Panel Structure', () => {
    it('should render Journal title', () => {
      customRender(<QuestLog />, {
        initialState: {
          activePanel: 'quests',
          activeQuests: [],
          completedQuests: [],
          completedQuestIds: [],
        },
      });
      expect(screen.getByText('Journal')).toBeInTheDocument();
    });

    it('should show quest counts in tab labels', () => {
      customRender(<QuestLog />, {
        initialState: {
          activePanel: 'quests',
          activeQuests: [
            {
              questId: 'test_quest_1',
              status: 'active',
              currentStageIndex: 0,
              objectiveProgress: {},
              startedAt: Date.now(),
              completedAt: null,
              timeRemainingHours: null,
            },
            {
              questId: 'test_quest_2',
              status: 'active',
              currentStageIndex: 0,
              objectiveProgress: {},
              startedAt: Date.now(),
              completedAt: null,
              timeRemainingHours: null,
            },
          ],
          completedQuests: [],
          completedQuestIds: ['completed_quest_1'],
        },
      });

      expect(screen.getByText(/Active \(2\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Completed \(1\)/i)).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty state for active quests', () => {
      customRender(<QuestLog />, {
        initialState: {
          activePanel: 'quests',
          activeQuests: [],
          completedQuests: [],
          completedQuestIds: [],
        },
      });

      expect(screen.getByText('No active quests')).toBeInTheDocument();
    });
  });

  describe('Active Quests Display', () => {
    const questInitialState = {
      activePanel: 'quests',
      activeQuests: [
        {
          questId: 'test_quest_1',
          status: 'active',
          currentStageIndex: 0,
          objectiveProgress: {
            obj_goto_workshop: 1, // Completed
            obj_search_shelves: 0, // Not completed
          },
          startedAt: Date.now(),
          completedAt: null,
          timeRemainingHours: null,
        },
      ],
      completedQuests: [],
      completedQuestIds: [],
    };

    it('should display quest info correctly', () => {
      customRender(<QuestLog />, { initialState: questInitialState });
      expect(screen.getByText('Find the Golden Gear')).toBeInTheDocument();
      expect(
        screen.getByText('Search the old workshop for a rare golden gear.')
      ).toBeInTheDocument();
      expect(screen.getByText('Side')).toBeInTheDocument();
      expect(screen.getByText(/Go to the workshop/)).toBeInTheDocument();
      expect(screen.getByText(/Search the shelves/)).toBeInTheDocument();
    });
  });
});
