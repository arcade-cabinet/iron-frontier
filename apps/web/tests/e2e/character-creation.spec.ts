/**
 * Character Creation E2E Tests
 * Tests: Enter name, start game, verify playing state
 */

import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/GamePage';

test.describe('Character Creation', () => {
  test.setTimeout(120000);

  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.clearGameState();
  });

  test('can enter player name and start game', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Test Gunslinger');

    // Verify game has started
    await gamePage.waitForGameLoaded('Test Gunslinger');
    await expect(page.getByText('Test Gunslinger')).toBeVisible();

    await gamePage.takeScreenshot('game-started');
  });

  test('player starts at level 1', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Level Check');

    await gamePage.waitForGameLoaded('Level Check');
    await expect(page.getByText('Level 1')).toBeVisible();
  });

  test('welcome notification appears on game start', async () => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Welcome Test');

    await gamePage.waitForGameLoaded('Welcome Test');
    await gamePage.verifyWelcomeNotification();
  });

  test('game state is correctly initialized', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('State Check');
    await gamePage.waitForGameLoaded('State Check');

    // Verify game state via store
    const state = await gamePage.getGameState();

    expect(state).toBeTruthy();
    expect(state.initialized).toBe(true);
    expect(state.phase).toBe('playing');
    expect(state.playerName).toBe('State Check');
    expect(state.playerStats.level).toBe(1);
    expect(state.playerStats.health).toBeGreaterThan(0);
  });

  test('player starts with starter inventory', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Inventory Check');
    await gamePage.waitForGameLoaded('Inventory Check');

    // Check game state for inventory
    const state = await gamePage.getGameState();
    expect(state.inventory).toBeDefined();
    expect(state.inventory.length).toBeGreaterThan(0);
  });

  test('handles empty name gracefully', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.beginAdventureBtn.click();
    await expect(gamePage.nameInput).toBeVisible({ timeout: 30000 });

    // Try to submit empty name
    await page.keyboard.press('Enter');

    // Should still be on name input (or have default name handling)
    // The behavior depends on implementation - we test current behavior
    const state = await gamePage.getGameState();

    // Either still on title or uses default name
    if (state.phase === 'title') {
      // Good - it rejected empty name
      await expect(gamePage.nameInput).toBeVisible();
    } else {
      // Uses default name - also valid
      expect(state.playerName).toBeTruthy();
    }
  });

  test('handles special characters in name', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame("Billy 'The Kid' O'Brien");
    await gamePage.waitForGameLoaded("Billy 'The Kid' O'Brien");

    // Verify the name is displayed correctly
    await expect(page.getByText("Billy 'The Kid' O'Brien")).toBeVisible();
  });
});
