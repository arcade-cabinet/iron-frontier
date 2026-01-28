import { test, expect } from '@playwright/test';
import { callHarness, startNewGame } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('inventory consumables can be used', async ({ page }) => {
  await startNewGame(page, 'Ada');
  await callHarness(page, 'setState', {
    inventory: [],
    equipment: { weapon: null, offhand: null, head: null, body: null, accessory: null },
  });
  await callHarness(page, 'addItem', 'bandages', 1);

  await page.getByRole('button', { name: 'Inventory' }).click();
  const inventoryPanel = page.locator('[data-testid="inventory-panel"]');
  await expect(inventoryPanel).toBeVisible();

  const itemButtons = inventoryPanel.locator('[data-testid="inventory-item"]');
  await expect(itemButtons).toHaveCount(1);
  await itemButtons.first().click();
  await inventoryPanel.getByRole('button', { name: /^Use$/ }).click();

  await expect(itemButtons).toHaveCount(0);
});

test('shop purchases add items to inventory', async ({ page }) => {
  await startNewGame(page, 'Ada');
  await callHarness(page, 'setState', {
    inventory: [],
    equipment: { weapon: null, offhand: null, head: null, body: null, accessory: null },
  });
  await callHarness(page, 'addGold', 500);
  await callHarness(page, 'openShop', 'general_store');

  const shopPanel = page.locator('[data-testid="shop-panel"]');
  await expect(shopPanel).toBeVisible();

  const buyButton = shopPanel.locator('[data-testid="shop-buy-button"]').first();
  await expect(buyButton).toBeVisible();
  await buyButton.click();

  await page.getByRole('button', { name: 'Close' }).first().click();
  await page.getByRole('button', { name: 'Inventory' }).click();

  const inventoryPanel = page.locator('[data-testid="inventory-panel"]');
  await expect(inventoryPanel.locator('button').filter({ hasText: 'Qty:' }).first()).toBeVisible();
});

test('combat action generates log output', async ({ page }) => {
  await startNewGame(page, 'Ada');
  await callHarness(page, 'startCombat', 'roadside_bandits');

  const combatPanel = page.locator('[data-testid="combat-panel"]');
  await expect(combatPanel).toBeVisible();

  await combatPanel.getByRole('button', { name: 'Attack' }).click();
  await combatPanel.locator('[data-testid="combat-enemy"]').first().click();

  await expect(combatPanel.getByText(/missed|hit|hits|defensive/i)).toBeVisible();
});
