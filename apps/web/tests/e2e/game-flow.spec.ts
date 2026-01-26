import { expect, test } from '@playwright/test';

test.describe('Iron Frontier - Core Game Flow', () => {
  // Explicitly set timeout to 120s to handle slow CI environments
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    // Clear any existing state
    await page.goto('/', { timeout: 60000 });
    await page.waitForTimeout(1000); // Give JS a second to hydrate
    await page.evaluate(() => {
      try {
        localStorage.clear();
        indexedDB.deleteDatabase('iron-frontier-save');
      } catch (e) {
        console.error('Cleanup failed', e);
      }
    });
    await page.reload({ timeout: 60000 });
    await page.waitForTimeout(2000); // Wait for splash/title to settle
  });

  test('Title Screen -> New Game -> Persistence Loop', async ({ page }) => {
    // 1. Initial Load & Title Screen
    await expect(page).toHaveTitle(/Iron Frontier/i, { timeout: 30000 });
    await expect(page.getByText('IRON FRONTIER')).toBeVisible({ timeout: 30000 });
    await page.screenshot({ path: 'tests/e2e/screenshots/1-title-screen.png' });

    // 2. Start New Game
    const startBtn = page.getByRole('button', { name: 'Begin Adventure' });
    await expect(startBtn).toBeVisible({ timeout: 30000 });
    await startBtn.click();

    const nameInput = page.getByPlaceholder('Enter your name, stranger...');
    await expect(nameInput).toBeVisible({ timeout: 30000 });
    await nameInput.fill('E2E Gunslinger');
    await page.keyboard.press('Enter');

    // 3. Verify HUD and Initial State
    // Wait for game phase to switch (HUD appears)
    await expect(page.getByText('E2E Gunslinger')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/Lv\.\d+/)).toBeVisible();

    // Verify notifications
    await expect(page.getByText('Welcome to the frontier')).toBeVisible();
    await page.screenshot({ path: 'tests/e2e/screenshots/2-hud-initial.png' });

    // 4. Persistence Check (Reload Page)
    // Wait a bit for async DB write
    await page.waitForTimeout(3000);
    await page.reload({ timeout: 60000 });

    // Should skip title screen and go straight to game
    await expect(page.getByText('E2E Gunslinger')).toBeVisible({ timeout: 60000 });
    await expect(page.getByText(/Lv\.\d+/)).toBeVisible();
    await page.screenshot({ path: 'tests/e2e/screenshots/3-persistence-verified.png' });
  });

  test('Inventory System', async ({ page }) => {
    // Setup: Fast-forward to game
    await page.goto('/', { timeout: 60000 });

    const startBtn = page.getByRole('button', { name: 'Begin Adventure' });
    await expect(startBtn).toBeVisible({ timeout: 45000 });
    await startBtn.click();

    const nameInput = page.getByPlaceholder('Enter your name, stranger...');
    await expect(nameInput).toBeVisible({ timeout: 30000 });
    await nameInput.fill('Trader Joe');
    await page.keyboard.press('Enter');

    await expect(page.getByText('Trader Joe')).toBeVisible({ timeout: 30000 });

    // 1. Open Inventory
    const invButton = page.getByLabel('Inventory');
    await expect(invButton).toBeVisible({ timeout: 10000 });

    await invButton.click();
    await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Empty')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'tests/e2e/screenshots/4-inventory-empty.png' });
  });
});
