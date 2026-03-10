/**
 * E2E Smoke Test: Game Loads Without Crashing
 *
 * Lightweight pass/fail test verifying the game boots, renders a canvas,
 * shows HUD elements, and responds to basic keyboard input without errors.
 *
 * This test does NOT rely on the test harness (__IRON_FRONTIER_TEST__) so it
 * can catch crashes that happen before the harness is wired up.
 */

import { expect, test, type ConsoleMessage } from '@playwright/test';

// Use only desktop chromium for the smoke test — fast and deterministic.
test.use({
  viewport: { width: 1280, height: 720 },
});

test.describe('Smoke: Game Loads', () => {
  test('game boots, renders 3D canvas, and survives 5 seconds', async ({ page }) => {
    // -----------------------------------------------------------------------
    // 1. Collect console errors during the entire test
    // -----------------------------------------------------------------------
    const consoleErrors: string[] = [];

    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Catch uncaught page errors (unhandled exceptions, network failures, etc.)
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    // -----------------------------------------------------------------------
    // 2. Navigate to the title screen
    // -----------------------------------------------------------------------
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Wait for the page to finish initial rendering (title screen)
    // The title page renders "IRON" and "FRONTIER" as separate Text elements.
    await expect(page.getByText('IRON', { exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('FRONTIER', { exact: true })).toBeVisible();

    // -----------------------------------------------------------------------
    // 3. Start a new game to get to the game screen with the Canvas
    // -----------------------------------------------------------------------
    const newGameButton = page.getByText('New Game', { exact: true });
    await expect(newGameButton).toBeVisible({ timeout: 10_000 });
    await newGameButton.click();

    // -----------------------------------------------------------------------
    // 4. Verify a Canvas element exists (R3F 3D viewport)
    // -----------------------------------------------------------------------
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 30_000 });

    // -----------------------------------------------------------------------
    // 5. Verify HUD elements are visible
    //    The game renders PlayerVitals (HP, ST labels) and CompassBar
    //    (cardinal direction letters like N, S, E, W).
    // -----------------------------------------------------------------------
    // HP label from PlayerVitals
    await expect(page.getByText('HP')).toBeVisible({ timeout: 10_000 });
    // ST (Stamina) label from PlayerVitals
    await expect(page.getByText('ST')).toBeVisible();

    // -----------------------------------------------------------------------
    // 6. Press 'I' to open inventory panel
    // -----------------------------------------------------------------------
    await page.keyboard.press('i');

    // The InventoryPanel renders in a Modal; look for the "Inventory" heading
    // or the filter tabs ("All", "Weapons", etc.)
    await expect(page.getByText('All')).toBeVisible({ timeout: 5_000 });

    // Close inventory
    await page.keyboard.press('Escape');

    // -----------------------------------------------------------------------
    // 7. Press 'Escape' to open the main menu
    // -----------------------------------------------------------------------
    await page.keyboard.press('Escape');

    // The MainMenu renders "Resume Game" and "Menu" heading
    await expect(page.getByText('Resume Game')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Menu')).toBeVisible();

    // Close menu
    await page.keyboard.press('Escape');

    // -----------------------------------------------------------------------
    // 8. Let the game run for 5 seconds and check it doesn't crash
    // -----------------------------------------------------------------------
    await page.waitForTimeout(5_000);

    // Canvas should still be visible (game did not crash)
    await expect(canvas).toBeVisible();

    // -----------------------------------------------------------------------
    // 9. Assert no critical console errors
    //    Filter out noise: React dev warnings, WebGL extension warnings,
    //    favicon 404s, and similar benign messages.
    // -----------------------------------------------------------------------
    const criticalErrors = consoleErrors.filter((msg) => {
      const lower = msg.toLowerCase();
      // Skip common non-critical noise
      if (lower.includes('favicon')) return false;
      if (lower.includes('download the react devtools')) return false;
      if (lower.includes('webgl')) return false;
      if (lower.includes('deprecated')) return false;
      if (lower.includes('third-party cookie')) return false;
      if (lower.includes('manifest')) return false;
      if (lower.includes('service worker')) return false;
      return true;
    });

    const criticalPageErrors = pageErrors.filter((msg) => {
      const lower = msg.toLowerCase();
      if (lower.includes('resizeobserver')) return false;
      return true;
    });

    expect(
      criticalErrors,
      `Critical console errors detected:\n${criticalErrors.join('\n')}`,
    ).toHaveLength(0);

    expect(
      criticalPageErrors,
      `Uncaught page errors detected:\n${criticalPageErrors.join('\n')}`,
    ).toHaveLength(0);
  });
});
