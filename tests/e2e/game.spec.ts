import { test, expect } from '@playwright/test';

async function startNewGame(page: any) {
  await page.goto('/?e2e=1');
  await page.getByRole('button', { name: /begin adventure/i }).waitFor();
  await page.getByRole('button', { name: /begin adventure/i }).click();
  await page.getByPlaceholder('Enter your name, stranger...').fill('Ada');
  await page.getByRole('button', { name: /begin adventure/i }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForFunction(() => window.__IRON_FRONTIER_TEST__ !== undefined);
}

test('loads game shell', async ({ page }) => {
  await page.goto('/?e2e=1');
  await expect(page).toHaveTitle(/Iron Frontier/i);
  await expect(page.getByText(/iron frontier/i)).toBeVisible();
});

test('opens character panel', async ({ page }) => {
  await startNewGame(page);
  await page.getByRole('button', { name: 'Character Stats' }).click();
  await expect(page.locator('[data-testid="character-panel"]')).toBeVisible();
});

test('opens inventory panel', async ({ page }) => {
  await startNewGame(page);
  await page.getByRole('button', { name: 'Inventory' }).click();
  await expect(page.locator('[data-testid="inventory-panel"]')).toBeVisible();
});

test('opens quest journal', async ({ page }) => {
  await startNewGame(page);
  await page.getByRole('button', { name: 'Quest Journal' }).click();
  await expect(page.locator('[data-testid="quest-log-panel"]')).toBeVisible();
});

test('opens game menu', async ({ page }) => {
  await startNewGame(page);
  await page.getByRole('button', { name: 'Game Menu' }).click();
  await expect(page.locator('[data-testid="menu-panel"]')).toBeVisible();
});

test('opens world map and starts travel', async ({ page }) => {
  await startNewGame(page);
  await page.getByRole('button', { name: 'World Map' }).click();
  const worldMap = page.locator('[data-testid="world-map"]');
  await expect(worldMap).toBeVisible();
  await worldMap.getByRole('button', { name: 'Sunset Ranch' }).first().click();
  await expect(page.locator('[data-testid="travel-panel"]')).toBeVisible();
});

test('opens dialogue, shop, puzzle, combat, and game over screens', async ({ page }) => {
  await startNewGame(page);

  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.startDialogue('doc_chen'));
  await expect(page.locator('[data-testid="dialogue-box"]')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.openShop('general_store'));
  await expect(page.locator('[data-testid="shop-panel"]')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).first().click();

  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.startPuzzle(4, 4));
  await expect(page.locator('[data-testid="pipe-puzzle"]')).toBeVisible();
  await page.getByRole('button', { name: /cancel/i }).click();

  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.startCombat('test_encounter'));
  await expect(page.locator('[data-testid="combat-panel"]')).toBeVisible();
  await page.getByRole('button', { name: /^End$/ }).click();

  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.setPhase('game_over'));
  await expect(page.locator('[data-testid="game-over-screen"]')).toBeVisible();
});
