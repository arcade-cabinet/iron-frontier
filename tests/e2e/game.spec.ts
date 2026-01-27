import { test, expect } from '@playwright/test';

test('loads game shell', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Iron Frontier/i);
  await expect(page.getByText('Iron Frontier')).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
});
