/**
 * Quest Log Tests
 * Tests for quest tracking and display
 */
import { QuestLog } from '@/game/ui/QuestLog';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { customRender } from './test-utils';

describe('QuestLog', () => {
  describe('Panel Structure', () => {
    it('should render Journal title', () => {
      customRender(<QuestLog />, {
        initialState: {
          activePanel: 'quests',
          activeQuests: [],
          completedQuestIds: [],
        } as any,
      });
      expect(screen.getByText('Journal')).toBeInTheDocument();
    });

    it('should show quest counts in tab labels', () => {
      customRender(<QuestLog />, {
        initialState: {
          activePanel: 'quests',
          activeQuests: [
            { id: 'q1', title: 'Quest 1', description: '', giverNpcId: 'n1', giverName: 'NPC', objectives: [], status: 'active', rewards: { xp: 0, gold: 0 } },
            { id: 'q2', title: 'Quest 2', description: '', giverNpcId: 'n2', giverName: 'NPC', objectives: [], status: 'active', rewards: { xp: 0, gold: 0 } },
          ],
          completedQuestIds: ['cq1', 'cq2', 'cq3'],
        } as any,
      });

      expect(screen.getByText(/Active \(2\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Completed \(3\)/i)).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty state for active quests', () => {
      customRender(<QuestLog />, {
        initialState: {
          activePanel: 'quests',
          activeQuests: [],
          completedQuestIds: [],
        } as any,
      });

      expect(screen.getByText('No active quests')).toBeInTheDocument();
    });
  });

  describe('Active Quests Display', () => {
    const questInitialState = {
      activePanel: 'quests',
      activeQuests: [{
        id: 'test_quest',
        title: 'Find the Golden Gear',
        description: 'Search the old workshop for a rare golden gear.',
        giverNpcId: 'npc_mechanic',
        giverName: 'Old Cogsworth',
        objectives: [
          { id: 'step1', description: 'Go to the workshop', completed: true, required: 1, current: 1, type: 'go_to' },
          { id: 'step2', description: 'Search the shelves', completed: false, required: 1, current: 0, type: 'collect' },
        ],
        status: 'active',
        rewards: { xp: 150, gold: 75 },
      }],
    };

    it('should display quest info correctly', () => {
      customRender(<QuestLog />, { initialState: questInitialState as any });
      expect(screen.getByText('Find the Golden Gear')).toBeInTheDocument();
      expect(screen.getByText('Search the old workshop for a rare golden gear.')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText(/Go to the workshop/)).toBeInTheDocument();
      expect(screen.getByText(/Search the shelves/)).toBeInTheDocument();
    });
  });
});
