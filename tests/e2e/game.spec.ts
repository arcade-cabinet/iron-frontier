import { test, expect } from '@playwright/test';

async function startNewGame(page: any) {
  await page.goto('/');
  await page.getByRole('button', { name: /begin adventure/i }).waitFor();
  await page.getByRole('button', { name: /begin adventure/i }).click();
  await page.getByPlaceholder('Enter your name, stranger...').fill('Ada');
  await page.getByRole('button', { name: /begin adventure/i }).click();
  await expect(page.locator('canvas')).toBeVisible();
}

test('loads game shell', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Iron Frontier/i);
  await expect(page.getByText('Iron Frontier')).toBeVisible();
});

test('opens inventory panel', async ({ page }) => {
  await startNewGame(page);
  await page.getByRole('button', { name: 'Inventory' }).click();
  await expect(page.locator('[data-testid="inventory-panel"]')).toBeVisible();
});

test('opens world map and starts travel', async ({ page }) => {
  await startNewGame(page);
  await page.getByRole('button', { name: 'World Map' }).click();
  await expect(page.locator('[data-testid="world-map"]')).toBeVisible();
  await page.getByText('Sunset Ranch', { exact: false }).first().click();
  await page.getByRole('button', { name: /travel here/i }).click();
  await expect(page.locator('[data-testid="travel-panel"]')).toBeVisible();
});
