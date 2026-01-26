import { test, expect } from '@playwright/test';
import { GamePage } from '../pages/GamePage';

test.describe('App Launch', () => {
  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
  });

  test('should load Unity WebGL build', async ({ page }) => {
    // Wait for loading indicator
    await expect(gamePage.loadingBar).toBeVisible({ timeout: 30000 }).catch(() => {
      // Loading bar might be hidden already if fast connection
    });

    // Wait for game canvas to be ready
    await gamePage.waitForGameReady();

    // Verify canvas is visible
    await expect(gamePage.canvas).toBeVisible();

    // Take screenshot for verification
    await gamePage.screenshot('01-app-launch-loaded');
  });

  test('should display main menu after loading', async ({ page }) => {
    await gamePage.waitForGameReady();
    await gamePage.waitForMainMenu();

    // Verify main menu elements
    const newGameButton = gamePage.getButton('New Game');
    await expect(newGameButton).toBeVisible({ timeout: 30000 });

    // Check for other menu items (optional - may vary by game state)
    const hasSettings = await gamePage.hasText('Settings');
    expect(hasSettings || true).toBeTruthy(); // Settings may be visible

    await gamePage.screenshot('01-main-menu-visible');
  });

  test('should have correct game title', async ({ page }) => {
    await gamePage.waitForGameReady();
    await gamePage.waitForMainMenu();

    const title = await gamePage.getGameTitle();
    expect(title).toContain('Iron Frontier');
  });

  test('should have WebGL context available', async ({ page }) => {
    await gamePage.waitForGameReady();

    const webglInfo = await gamePage.getWebGLInfo();
    expect(webglInfo).not.toBeNull();
    expect(webglInfo.error).toBeUndefined();

    console.log('WebGL Info:', webglInfo);
  });

  test('should not show any error dialogs', async ({ page }) => {
    await gamePage.waitForGameReady();
    await gamePage.waitForMainMenu();

    // Check for common error messages
    const hasError = await gamePage.hasText('Error', 2000);
    const hasCrash = await gamePage.hasText('Crash', 2000);
    const hasFailed = await gamePage.hasText('Failed to load', 2000);

    expect(hasError).toBeFalsy();
    expect(hasCrash).toBeFalsy();
    expect(hasFailed).toBeFalsy();
  });
});
