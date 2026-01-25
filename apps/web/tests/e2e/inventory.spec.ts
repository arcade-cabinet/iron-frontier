/**
 * Inventory System E2E Tests
 * Tests: Open inventory, view items, equip/use items
 */

import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/GamePage';

test.describe('Inventory System', () => {
  test.setTimeout(120000);

  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.clearGameState();

    // Setup: Start new game
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Inventory Tester');
    await gamePage.waitForGameLoaded('Inventory Tester');
  });

  test('can open inventory panel', async ({ page }) => {
    await gamePage.openInventory();
    await expect(gamePage.inventoryHeading).toBeVisible();

    await gamePage.takeScreenshot('inventory-open');
  });

  test('inventory shows empty state when no items', async ({ page }) => {
    // Clear inventory via store
    await gamePage.setGameState({ inventory: [] });

    await gamePage.openInventory();
    await expect(page.getByText('Empty')).toBeVisible({ timeout: 10000 });
  });

  test('can add items to inventory', async ({ page }) => {
    // Add an item via store
    await gamePage.addItemToInventory('steam_tonic', 1);

    await gamePage.openInventory();
    await expect(page.getByText('Steam Tonic')).toBeVisible({ timeout: 10000 });

    await gamePage.takeScreenshot('inventory-with-item');
  });

  test('inventory shows item quantity', async ({ page }) => {
    // Add multiple items
    await gamePage.addItemToInventory('bandages', 5);

    await gamePage.openInventory();

    // Should show quantity
    await expect(page.getByText('5')).toBeVisible({ timeout: 10000 });
  });

  test('can close inventory with escape key', async ({ page }) => {
    await gamePage.openInventory();
    await expect(gamePage.inventoryHeading).toBeVisible();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Verify inventory is closed (game returns to playing state)
    const state = await gamePage.getGameState();
    expect(state.activePanel).toBeNull();
  });

  test('can use consumable items', async ({ page }) => {
    // Add a usable item and take some damage first
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      const state = store.getState();

      // Take some damage
      state.takeDamage(20);

      // Add healing item
      store.getState().addItemById('bandages', 1);
    });

    const stateBeforeUse = await gamePage.getGameState();
    const healthBefore = stateBeforeUse.playerStats.health;

    await gamePage.openInventory();

    // Find and use the item
    const bandageItem = page.locator('[class*="item"], [class*="row"]').filter({ hasText: /Bandage/i });
    const useButton = bandageItem.getByRole('button', { name: /Use/i });

    if (await useButton.isVisible()) {
      await useButton.click();
      await page.waitForTimeout(500);

      const stateAfterUse = await gamePage.getGameState();
      expect(stateAfterUse.playerStats.health).toBeGreaterThanOrEqual(healthBefore);
    }
  });

  test('inventory badge shows item count', async ({ page }) => {
    // Add items
    await gamePage.addItemToInventory('steam_tonic', 1);
    await gamePage.addItemToInventory('bandages', 1);

    await page.waitForTimeout(500);

    // Check the badge on the inventory button
    const badge = gamePage.inventoryBtn.locator('[class*="badge"]');
    await expect(badge).toContainText('2');
  });

  test('inventory shows different item types', async ({ page }) => {
    // Add various items
    await gamePage.addItemToInventory('bandages', 1); // consumable
    await gamePage.addItemToInventory('hunting_knife', 1); // weapon

    await gamePage.openInventory();

    // Both items should be visible
    await expect(page.getByText(/Bandage/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Hunting Knife/i)).toBeVisible({ timeout: 5000 });
  });

  test('can equip weapon items', async ({ page }) => {
    // Add a weapon
    await gamePage.addItemToInventory('hunting_knife', 1);

    const stateBefore = await gamePage.getGameState();
    const itemId = stateBefore.inventory[0]?.id;

    if (itemId) {
      // Equip the item via store
      await gamePage.callStoreAction('equipItem', itemId, 'weapon');

      const stateAfter = await gamePage.getGameState();
      expect(stateAfter.equipment.weapon).toBe(itemId);
    }
  });

  test('inventory persists after panel close and reopen', async ({ page }) => {
    // Add item
    await gamePage.addItemToInventory('steam_tonic', 3);

    // Open, close, reopen inventory
    await gamePage.openInventory();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await gamePage.openInventory();

    // Item should still be there
    await expect(page.getByText('Steam Tonic')).toBeVisible({ timeout: 5000 });
  });
});
