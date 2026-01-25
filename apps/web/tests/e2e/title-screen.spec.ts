/**
 * Title Screen E2E Tests
 * Tests: Game loads, title appears, New Game button works
 */

import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/GamePage';

test.describe('Title Screen', () => {
  test.setTimeout(120000);

  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.clearGameState();
  });

  test('game loads and displays title screen', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Iron Frontier/i, { timeout: 30000 });

    // Verify title text is visible
    await gamePage.waitForTitleScreen();
    await expect(gamePage.titleText).toBeVisible();

    await gamePage.takeScreenshot('title-screen-loaded');
  });

  test('title screen shows Begin Adventure button', async () => {
    await gamePage.waitForTitleScreen();
    await expect(gamePage.beginAdventureBtn).toBeVisible({ timeout: 30000 });
  });

  test('clicking Begin Adventure shows name input', async () => {
    await gamePage.waitForTitleScreen();
    await gamePage.beginAdventureBtn.click();

    // Name input should appear
    await expect(gamePage.nameInput).toBeVisible({ timeout: 30000 });
    await expect(gamePage.nameInput).toBeFocused();

    await gamePage.takeScreenshot('name-input-visible');
  });

  test('title screen respects saved game state', async ({ page }) => {
    // Start a new game first
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Persistence Test');
    await gamePage.waitForGameLoaded('Persistence Test');

    // Wait for auto-save
    await page.waitForTimeout(3000);

    // Reload and check if we skip title
    await gamePage.reloadPage();

    // Should go directly to game (skip title)
    await expect(page.getByText('Persistence Test')).toBeVisible({ timeout: 60000 });
  });
});
