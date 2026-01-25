/**
 * Save/Load System E2E Tests
 * Tests: Save game, reload page, load save
 */

import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/GamePage';

test.describe('Save/Load System', () => {
  test.setTimeout(120000);

  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.clearGameState();
  });

  test('game state persists after page reload', async ({ page }) => {
    // Start new game
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Persistence Test');
    await gamePage.waitForGameLoaded('Persistence Test');

    // Wait for auto-save
    await page.waitForTimeout(3000);

    // Reload page
    await gamePage.reloadPage();

    // Should still be in game with same name
    await expect(page.getByText('Persistence Test')).toBeVisible({ timeout: 60000 });
  });

  test('player name persists after reload', async ({ page }) => {
    const uniqueName = `SaveTest_${Date.now()}`;

    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame(uniqueName);
    await gamePage.waitForGameLoaded(uniqueName);

    await page.waitForTimeout(3000);
    await gamePage.reloadPage();

    // Name should persist
    const state = await gamePage.getGameState();
    expect(state.playerName).toBe(uniqueName);
  });

  test('inventory persists after reload', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Inventory Save Test');
    await gamePage.waitForGameLoaded('Inventory Save Test');

    // Add items
    await gamePage.addItemToInventory('bandages', 5);
    await gamePage.addItemToInventory('steam_tonic', 2);

    // Wait for save
    await page.waitForTimeout(3000);

    // Reload
    await gamePage.reloadPage();
    await page.waitForTimeout(2000);

    // Check inventory
    const state = await gamePage.getGameState();
    const bandages = state.inventory.find((i: any) => i.itemId === 'bandages');
    const tonic = state.inventory.find((i: any) => i.itemId === 'steam_tonic');

    expect(bandages).toBeDefined();
    expect(tonic).toBeDefined();
  });

  test('player stats persist after reload', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Stats Save Test');
    await gamePage.waitForGameLoaded('Stats Save Test');

    // Modify stats
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.getState().gainXP(150);
      store.getState().addGold(500);
    });

    await page.waitForTimeout(3000);
    await gamePage.reloadPage();
    await page.waitForTimeout(2000);

    const state = await gamePage.getGameState();
    expect(state.playerStats.xp).toBeGreaterThan(0);
    expect(state.playerStats.gold).toBeGreaterThanOrEqual(500);
  });

  test('completed quests persist after reload', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Quest Save Test');
    await gamePage.waitForGameLoaded('Quest Save Test');

    // Start and complete a quest
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.getState().startQuest('frontier_arrival');
      store.getState().completeQuest('frontier_arrival');
    });

    await page.waitForTimeout(3000);
    await gamePage.reloadPage();
    await page.waitForTimeout(2000);

    const state = await gamePage.getGameState();
    expect(state.completedQuestIds).toContain('frontier_arrival');
  });

  test('equipment persists after reload', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Equipment Save Test');
    await gamePage.waitForGameLoaded('Equipment Save Test');

    // Add and equip a weapon
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.getState().addItemById('hunting_knife', 1);

      // Get the item ID and equip it
      const state = store.getState();
      const knife = state.inventory.find((i: any) => i.itemId === 'hunting_knife');
      if (knife) {
        store.getState().equipItem(knife.id, 'weapon');
      }
    });

    await page.waitForTimeout(3000);
    await gamePage.reloadPage();
    await page.waitForTimeout(2000);

    const state = await gamePage.getGameState();
    expect(state.equipment.weapon).not.toBeNull();
  });

  test('settings persist after reload', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Settings Save Test');
    await gamePage.waitForGameLoaded('Settings Save Test');

    // Change settings
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.getState().updateSettings({
        musicVolume: 0.5,
        sfxVolume: 0.75,
        haptics: false,
      });
    });

    await page.waitForTimeout(3000);
    await gamePage.reloadPage();
    await page.waitForTimeout(2000);

    const state = await gamePage.getGameState();
    expect(state.settings.musicVolume).toBe(0.5);
    expect(state.settings.sfxVolume).toBe(0.75);
    expect(state.settings.haptics).toBe(false);
  });

  test('new game clears previous save', async ({ page }) => {
    // First game
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('First Character');
    await gamePage.waitForGameLoaded('First Character');

    await page.waitForTimeout(3000);

    // Clear and start new game
    await gamePage.clearGameState();
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Second Character');
    await gamePage.waitForGameLoaded('Second Character');

    // Should have new character name
    const state = await gamePage.getGameState();
    expect(state.playerName).toBe('Second Character');
  });

  test('collected items stay collected after reload', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Collection Save Test');
    await gamePage.waitForGameLoaded('Collection Save Test');

    // Mark some items as collected
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({
        collectedItemIds: ['item_001', 'item_002', 'item_003'],
      });
    });

    await page.waitForTimeout(3000);
    await gamePage.reloadPage();
    await page.waitForTimeout(2000);

    const state = await gamePage.getGameState();
    expect(state.collectedItemIds).toContain('item_001');
    expect(state.collectedItemIds).toContain('item_002');
    expect(state.collectedItemIds).toContain('item_003');
  });

  test('talked NPCs persist after reload', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('NPC Save Test');
    await gamePage.waitForGameLoaded('NPC Save Test');

    // Mark NPCs as talked to
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.getState().markNPCTalked('npc_sheriff');
      store.getState().markNPCTalked('npc_bartender');
    });

    await page.waitForTimeout(3000);
    await gamePage.reloadPage();
    await page.waitForTimeout(2000);

    const state = await gamePage.getGameState();
    expect(state.talkedNPCIds).toContain('npc_sheriff');
    expect(state.talkedNPCIds).toContain('npc_bartender');
  });

  test('play time accumulates across sessions', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Playtime Test');
    await gamePage.waitForGameLoaded('Playtime Test');

    // Simulate some playtime
    await page.evaluate(() => {
      const store = (window as any).__gameStore;
      store.setState({ playTime: 3600 }); // 1 hour
    });

    await page.waitForTimeout(3000);
    await gamePage.reloadPage();
    await page.waitForTimeout(2000);

    const state = await gamePage.getGameState();
    expect(state.playTime).toBeGreaterThanOrEqual(3600);
  });

  test('manual save updates lastSaved timestamp', async ({ page }) => {
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Timestamp Test');
    await gamePage.waitForGameLoaded('Timestamp Test');

    const beforeSave = Date.now();

    await gamePage.saveGame();

    const state = await gamePage.getGameState();
    expect(state.lastSaved).toBeGreaterThanOrEqual(beforeSave);
  });
});
