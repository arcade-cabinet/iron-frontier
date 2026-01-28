import { test, expect } from '@playwright/test';
import { ensureTitleScreen, startNewGame } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('loads game shell', async ({ page }) => {
  await page.goto('/?e2e=1');
  await ensureTitleScreen(page);
  await expect(page).toHaveTitle(/Iron Frontier/i);
  await expect(page.getByRole('heading', { name: /iron frontier/i })).toBeVisible();
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
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('[data-testid="menu-panel"]')).toBeVisible();
});

test('opens world map', async ({ page }) => {
  await startNewGame(page);
  await page.getByRole('button', { name: 'World Map' }).click();
  const worldMap = page.locator('[data-testid="world-map"]');
  await expect(worldMap).toBeVisible();
  await expect(worldMap.getByText(/Current Location/i)).toBeVisible();
});

test('opens dialogue, shop, puzzle, combat, and game over screens', async ({ page }) => {
  await startNewGame(page);

  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.startDialogue('doc_chen'));
  await expect(page.locator('[data-testid="dialogue-box"]')).toBeVisible();
  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.setPhase('playing'));
  await expect(page.locator('[data-testid="dialogue-box"]')).toBeHidden();

  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.openShop('general_store'));
  await expect(page.locator('[data-testid="shop-panel"]')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).first().click();

  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.startPuzzle(4, 4));
  await expect(page.locator('[data-testid="pipe-puzzle"]')).toBeVisible();
  await page.getByRole('button', { name: /cancel/i }).click();

  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.startCombat('roadside_bandits'));
  await expect(page.locator('[data-testid="combat-panel"]')).toBeVisible();
  await page.getByRole('button', { name: /^End$/ }).click();

  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.setPhase('game_over'));
  await expect(page.locator('[data-testid="game-over-screen"]')).toBeVisible();
});
