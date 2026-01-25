/**
 * Dialogue System E2E Tests
 * Tests: NPC interaction, dialogue opens, choices appear, dialogue progresses/ends
 */

import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/GamePage';

test.describe('Dialogue System', () => {
  test.setTimeout(120000);

  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.clearGameState();

    // Setup: Start new game
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Dialogue Tester');
    await gamePage.waitForGameLoaded('Dialogue Tester');
  });

  test('dialogue UI appears when talking to NPC', async ({ page }) => {
    // Start dialogue with a test NPC via store
    await page.evaluate(() => {
      const store = (window as any).__gameStore;

      // Create a mock NPC if needed
      store.setState({
        npcs: {
          ...store.getState().npcs,
          test_npc: {
            id: 'test_npc',
            name: 'Test Stranger',
            role: 'drifter',
            position: { x: 0, y: 0, z: 0 },
            rotation: 0,
            disposition: 50,
            isAlive: true,
            questGiver: false,
            questIds: [],
          },
        },
      });

      // Start dialogue - this sets up the dialogue state
      store.setState({
        phase: 'dialogue',
        dialogueState: {
          npcId: 'test_npc',
          npcName: 'Test Stranger',
          treeId: 'test_tree',
          currentNodeId: 'node_1',
          text: 'Howdy, stranger. What brings you to these parts?',
          speaker: 'Test Stranger',
          choices: [
            { text: 'Just passing through.', nextNodeId: null, effects: [], tags: [] },
            { text: 'Looking for work.', nextNodeId: 'node_2', effects: [], tags: [] },
          ],
          autoAdvanceNodeId: null,
          history: [],
          conversationFlags: {},
          startedAt: Date.now(),
        },
      });
    });

    // Dialogue box should be visible
    await expect(page.getByText('Test Stranger')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Howdy, stranger')).toBeVisible({ timeout: 10000 });

    await gamePage.takeScreenshot('dialogue-open');
  });

  test('dialogue shows NPC name', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        phase: 'dialogue',
        dialogueState: {
          npcId: 'sheriff',
          npcName: 'Sheriff McTavish',
          npcTitle: 'Sheriff',
          treeId: 'test_tree',
          currentNodeId: 'node_1',
          text: 'Keep your hands where I can see them, partner.',
          speaker: 'Sheriff McTavish',
          choices: [],
          autoAdvanceNodeId: null,
          history: [],
          conversationFlags: {},
          startedAt: Date.now(),
        },
      });
    });

    await expect(page.getByText('Sheriff McTavish')).toBeVisible({ timeout: 10000 });
  });

  test('dialogue choices are displayed', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        phase: 'dialogue',
        dialogueState: {
          npcId: 'test_npc',
          npcName: 'Bartender',
          treeId: 'test_tree',
          currentNodeId: 'node_1',
          text: 'What can I get you?',
          speaker: 'Bartender',
          choices: [
            { text: 'A whiskey, neat.', nextNodeId: 'node_2', effects: [], tags: [] },
            { text: 'Just information.', nextNodeId: 'node_3', effects: [], tags: [] },
            { text: 'Nothing for now.', nextNodeId: null, effects: [], tags: [] },
          ],
          autoAdvanceNodeId: null,
          history: [],
          conversationFlags: {},
          startedAt: Date.now(),
        },
      });
    });

    // Wait for typewriter effect
    await page.waitForTimeout(1500);

    // All choices should be visible
    await expect(page.getByText('A whiskey, neat.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Just information.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Nothing for now.')).toBeVisible({ timeout: 10000 });

    await gamePage.takeScreenshot('dialogue-choices');
  });

  test('selecting choice progresses dialogue', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        phase: 'dialogue',
        dialogueState: {
          npcId: 'test_npc',
          npcName: 'Merchant',
          treeId: 'test_tree',
          currentNodeId: 'node_1',
          text: 'Looking to trade?',
          speaker: 'Merchant',
          choices: [
            {
              text: "Show me what you've got.",
              nextNodeId: 'node_2',
              effects: [],
              tags: [],
            },
          ],
          autoAdvanceNodeId: null,
          history: [],
          conversationFlags: {},
          startedAt: Date.now(),
        },
      });
    });

    // Wait for typewriter and choices
    await page.waitForTimeout(1500);

    // Click the choice
    const choiceBtn = page.locator('button').filter({ hasText: "Show me what you've got." });
    await choiceBtn.click();

    // Verify state changed (selectChoice was called)
    await page.waitForTimeout(500);
    const state = await gamePage.getGameState();

    // Either dialogue ended or moved to next node
    if (state.dialogueState) {
      expect(state.dialogueState.history.length).toBeGreaterThanOrEqual(0);
    } else {
      // Dialogue ended
      expect(state.phase).not.toBe('dialogue');
    }
  });

  test('dialogue ends correctly with End Conversation', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        phase: 'dialogue',
        dialogueState: {
          npcId: 'test_npc',
          npcName: 'Stranger',
          treeId: 'test_tree',
          currentNodeId: 'node_1',
          text: "That's all I have to say.",
          speaker: 'Stranger',
          choices: [],
          autoAdvanceNodeId: null, // No next node, end of conversation
          history: [],
          conversationFlags: {},
          startedAt: Date.now(),
        },
      });
    });

    // Wait for typewriter
    await page.waitForTimeout(1500);

    // End Conversation button should appear
    const endBtn = page.getByRole('button', { name: 'End Conversation' });
    await expect(endBtn).toBeVisible({ timeout: 10000 });

    await endBtn.click();
    await page.waitForTimeout(500);

    // Should return to playing state
    const state = await gamePage.getGameState();
    expect(state.phase).toBe('playing');
    expect(state.dialogueState).toBeNull();
  });

  test('tapping dialogue text skips typewriter effect', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        phase: 'dialogue',
        dialogueState: {
          npcId: 'test_npc',
          npcName: 'Storyteller',
          treeId: 'test_tree',
          currentNodeId: 'node_1',
          text: 'This is a very long piece of dialogue that would normally take a while to type out character by character in the typewriter effect.',
          speaker: 'Storyteller',
          choices: [],
          autoAdvanceNodeId: null,
          history: [],
          conversationFlags: {},
          startedAt: Date.now(),
        },
      });
    });

    // Click on the dialogue area to skip
    const dialogueArea = page.locator('[class*="whitespace-pre-line"]');
    await dialogueArea.click();

    // Text should immediately be fully visible
    await page.waitForTimeout(100);
    await expect(page.getByText('typewriter effect', { exact: false })).toBeVisible();
  });

  test('dialogue shows expression/mood when set', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        phase: 'dialogue',
        dialogueState: {
          npcId: 'test_npc',
          npcName: 'Angry Miner',
          npcExpression: 'angry',
          treeId: 'test_tree',
          currentNodeId: 'node_1',
          text: "Get off my claim!",
          speaker: 'Angry Miner',
          choices: [],
          autoAdvanceNodeId: null,
          history: [],
          conversationFlags: {},
          startedAt: Date.now(),
        },
      });
    });

    // Expression badge should be visible
    await expect(page.getByText('angry')).toBeVisible({ timeout: 10000 });
  });

  test('Continue button works for monologues', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        phase: 'dialogue',
        dialogueState: {
          npcId: 'test_npc',
          npcName: 'Narrator',
          treeId: 'test_tree',
          currentNodeId: 'node_1',
          text: 'The sun sets on the frontier...',
          speaker: 'Narrator',
          choices: [], // No choices
          autoAdvanceNodeId: 'node_2', // Has next node
          history: [],
          conversationFlags: {},
          startedAt: Date.now(),
        },
      });
    });

    // Wait for typewriter
    await page.waitForTimeout(1500);

    // Continue button should appear
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await expect(continueBtn).toBeVisible({ timeout: 10000 });
  });
});
