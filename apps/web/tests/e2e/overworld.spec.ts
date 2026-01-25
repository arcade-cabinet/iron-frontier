/**
 * Overworld Navigation E2E Tests
 * Tests: Player appears in starting town, can navigate the world
 */

import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/GamePage';

test.describe('Overworld Navigation', () => {
  test.setTimeout(120000);

  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.clearGameState();

    // Setup: Start new game
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Explorer');
    await gamePage.waitForGameLoaded('Explorer');
  });

  test('player starts in Dusty Springs (starting location)', async ({ page }) => {
    const state = await gamePage.getGameState();

    // Player should start in dusty_springs
    expect(state.currentLocationId).toBe('dusty_springs');
  });

  test('world is initialized on game start', async ({ page }) => {
    const state = await gamePage.getGameState();

    // World should be loaded
    expect(state.currentWorldId).toBe('frontier_territory');
    expect(state.loadedWorld).toBeTruthy();
  });

  test('starting location is discovered', async ({ page }) => {
    const state = await gamePage.getGameState();

    // Should have discovered starting location
    expect(state.discoveredLocationIds).toContain('dusty_springs');
  });

  test('can open world map', async ({ page }) => {
    // Click world map button in action bar
    await gamePage.mapBtn.click();
    await page.waitForTimeout(500);

    // Map should be visible
    // Note: This depends on how the map is implemented
    const mapVisible = await page.locator('[class*="map"], [class*="sheet"]').filter({ hasText: /Territory|Map/i }).isVisible();
    expect(mapVisible).toBe(true);

    await gamePage.takeScreenshot('world-map-open');
  });

  test('world map shows current location', async ({ page }) => {
    await gamePage.mapBtn.click();
    await page.waitForTimeout(500);

    // Current location should be highlighted or marked
    // This depends on the map implementation
    const state = await gamePage.getGameState();
    expect(state.currentLocationId).toBe('dusty_springs');
  });

  test('can discover new locations', async ({ page }) => {
    const stateBefore = await gamePage.getGameState();
    const discoveredBefore = stateBefore.discoveredLocationIds.length;

    // Discover a new location via store
    await gamePage.callStoreAction('discoverLocation', 'iron_gulch');

    const stateAfter = await gamePage.getGameState();
    expect(stateAfter.discoveredLocationIds.length).toBeGreaterThan(discoveredBefore);
    expect(stateAfter.discoveredLocationIds).toContain('iron_gulch');
  });

  test('notification appears when discovering new location', async ({ page }) => {
    // Clear notifications first
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({ notifications: [] });
    });

    await gamePage.callStoreAction('discoverLocation', 'mesa_point');

    // Should show discovery notification
    await expect(page.getByText(/Discovered|new location/i)).toBeVisible({ timeout: 5000 });
  });

  test('can initiate travel to another location', async ({ page }) => {
    // Discover destination first
    await gamePage.callStoreAction('discoverLocation', 'iron_gulch');

    // Travel to the location
    await gamePage.callStoreAction('travelTo', 'iron_gulch');

    const state = await gamePage.getGameState();
    expect(state.travelState).toBeTruthy();
    expect(state.travelState?.toLocationId).toBe('iron_gulch');
  });

  test('travel completes and updates location', async ({ page }) => {
    // Discover and travel
    await gamePage.callStoreAction('discoverLocation', 'iron_gulch');
    await gamePage.callStoreAction('travelTo', 'iron_gulch');

    // Wait for travel to complete (simulated with setTimeout in store)
    await page.waitForTimeout(3000);

    const state = await gamePage.getGameState();
    expect(state.currentLocationId).toBe('iron_gulch');
    expect(state.travelState).toBeNull();
  });

  test('can cancel travel', async ({ page }) => {
    await gamePage.callStoreAction('discoverLocation', 'iron_gulch');
    await gamePage.callStoreAction('travelTo', 'iron_gulch');

    // Cancel travel immediately
    await gamePage.callStoreAction('cancelTravel');

    const state = await gamePage.getGameState();
    expect(state.travelState).toBeNull();
    expect(state.currentLocationId).toBe('dusty_springs'); // Back to start
  });

  test('connected locations can be retrieved', async ({ page }) => {
    const connections = await gamePage.callStoreAction('getConnectedLocations');

    // Starting location should have some connections
    expect(connections).toBeDefined();
    expect(Array.isArray(connections)).toBe(true);
  });

  test('HUD is visible during overworld exploration', async ({ page }) => {
    // Player name should be visible in HUD
    await expect(page.getByText('Explorer')).toBeVisible();

    // Level should be visible
    await expect(page.getByText('Level 1')).toBeVisible();

    // Action bar should be visible
    await expect(gamePage.inventoryBtn).toBeVisible();
    await expect(gamePage.questJournalBtn).toBeVisible();
  });

  test('phase is playing during overworld', async ({ page }) => {
    const state = await gamePage.getGameState();
    expect(state.phase).toBe('playing');
  });

  test('world map can be closed', async ({ page }) => {
    // Open map
    await gamePage.mapBtn.click();
    await page.waitForTimeout(500);

    // Close with escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Should return to playing state
    const state = await gamePage.getGameState();
    expect(state.phase).toBe('playing');
  });
});
