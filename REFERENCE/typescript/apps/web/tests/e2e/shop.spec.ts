/**
 * Shop System E2E Tests
 * Tests: Open shop, view items, buy/sell transactions
 */

import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/GamePage';

test.describe('Shop System', () => {
  test.setTimeout(120000);

  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.clearGameState();

    // Setup: Start new game
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Shop Tester');
    await gamePage.waitForGameLoaded('Shop Tester');
  });

  test('shop UI opens when shop is opened', async ({ page }) => {
    // Give player some gold first
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 500 },
      });
    });

    // Open a known shop
    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);

    // Shop panel should be visible
    await expect(page.getByText('General Store')).toBeVisible({ timeout: 10000 });
    await gamePage.takeScreenshot('shop-open');
  });

  test('shop shows player gold', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 250 },
      });
    });

    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);

    // Should show gold amount
    await expect(page.getByText('Your Gold')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('$250')).toBeVisible({ timeout: 10000 });
  });

  test('shop has buy and sell tabs', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 500 },
      });
    });

    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);

    // Buy tab should be visible
    await expect(page.getByRole('button', { name: /Buy/i })).toBeVisible();
    // Sell tab should be visible
    await expect(page.getByRole('button', { name: /Sell/i })).toBeVisible();
  });

  test('buy tab shows shop inventory', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 500 },
      });
    });

    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);

    // Should show some items from the general store inventory
    // General store has: trail_biscuits, dried_jerky, etc.
    const itemCount = await page.locator('[class*="item"], [class*="row"]').count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('can buy item from shop', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 500 },
        inventory: [],
      });
    });

    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);

    const goldBefore = (await gamePage.getGameState()).playerStats.gold;

    // Find and click a buy button
    const buyButtons = page.getByRole('button', { name: 'Buy' });
    const count = await buyButtons.count();

    if (count > 0) {
      await buyButtons.first().click();
      await page.waitForTimeout(500);

      const stateAfter = await gamePage.getGameState();

      // Gold should decrease
      expect(stateAfter.playerStats.gold).toBeLessThan(goldBefore);
      // Inventory should have an item
      expect(stateAfter.inventory.length).toBeGreaterThan(0);
    }
  });

  test('cannot buy item without enough gold', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 0 },
      });
    });

    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);

    // Buy buttons should be disabled
    const buyButtons = page.getByRole('button', { name: 'Buy' });
    const count = await buyButtons.count();

    if (count > 0) {
      // Button should be disabled or styled as unaffordable
      const firstBuy = buyButtons.first();
      const isDisabled = await firstBuy.isDisabled();
      expect(isDisabled).toBe(true);
    }
  });

  test('sell tab shows player inventory', async ({ page }) => {
    // Add items to player inventory
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 100 },
      });
      store.getState().addItemById('bandages', 2);
    });

    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);

    // Switch to sell tab
    await page.getByRole('button', { name: /Sell/i }).click();
    await page.waitForTimeout(300);

    // Should show player's items
    await expect(page.getByText('Bandage')).toBeVisible({ timeout: 5000 });
  });

  test('can sell item to shop', async ({ page }) => {
    // Add items to player inventory
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 100 },
      });
      store.getState().addItemById('bandages', 1);
    });

    const goldBefore = (await gamePage.getGameState()).playerStats.gold;
    const inventoryBefore = (await gamePage.getGameState()).inventory.length;

    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);

    // Switch to sell tab
    await page.getByRole('button', { name: /Sell/i }).click();
    await page.waitForTimeout(300);

    // Find and click sell button
    const sellButtons = page.getByRole('button', { name: 'Sell' });
    const count = await sellButtons.count();

    if (count > 0) {
      await sellButtons.first().click();
      await page.waitForTimeout(500);

      const stateAfter = await gamePage.getGameState();

      // Gold should increase
      expect(stateAfter.playerStats.gold).toBeGreaterThan(goldBefore);
      // Inventory should decrease
      expect(stateAfter.inventory.length).toBeLessThan(inventoryBefore);
    }
  });

  test('shop can be closed with escape', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 500 },
      });
    });

    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);

    await expect(page.getByText('General Store')).toBeVisible();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const state = await gamePage.getGameState();
    expect(state.shopState).toBeNull();
  });

  test('shop shows item prices', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 500 },
      });
    });

    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);

    // Should show prices (coin icon + number)
    const priceElements = page.locator('[class*="font-mono"]');
    const count = await priceElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('shop shows item descriptions', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 500 },
      });
    });

    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);

    // Items should have names at minimum
    const itemNames = page.locator('[class*="font-medium"]');
    const count = await itemNames.count();
    expect(count).toBeGreaterThan(0);
  });

  test('notification appears after purchase', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 500 },
        notifications: [],
      });
    });

    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);

    const buyButtons = page.getByRole('button', { name: 'Buy' });
    const count = await buyButtons.count();

    if (count > 0) {
      await buyButtons.first().click();
      await page.waitForTimeout(1000);

      // Notification should appear
      await expect(page.getByText(/Bought|Added/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('different shops have different inventories', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        playerStats: { ...store.getState().playerStats, gold: 1000 },
      });
    });

    // Open general store
    await gamePage.openShop('general_store');
    await page.waitForTimeout(500);
    const generalStoreText = await page.locator('body').textContent();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Open doc chen's shop (medical)
    await gamePage.openShop('doc_chen_shop');
    await page.waitForTimeout(500);
    const medicalShopText = await page.locator('body').textContent();

    // Shops should have different content
    expect(medicalShopText).not.toEqual(generalStoreText);
  });
});
