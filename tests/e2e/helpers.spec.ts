/**
 * Tests for the enhanced E2E test helpers
 * Validates: Requirements 22.1, 22.3 - Error handling and recovery
 */
import { expect, test } from '@playwright/test';
import {
    captureScreenshot,
    closeAllPanels,
    getCurrentPhase,
    isPanelVisible,
    measurePerformance,
    PANEL_TEST_IDS,
    startNewGame,
    TIMEOUTS,
    waitForPanel,
    waitForPhase,
    withRecovery,
    withRetry
} from './helpers';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test.describe('waitForPhase', () => {
  test('waits for playing phase after new game', async ({ page }) => {
    await startNewGame(page);
    const phase = await getCurrentPhase(page);
    expect(phase).toBe('playing');
  });

  test('waits for dialogue phase', async ({ page }) => {
    await startNewGame(page);
    await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.startDialogue('doc_chen'));
    await waitForPhase(page, 'dialogue');
    const phase = await getCurrentPhase(page);
    expect(phase).toBe('dialogue');
  });

  test('waits for combat phase', async ({ page }) => {
    await startNewGame(page);
    await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.startCombat('roadside_bandits'));
    await waitForPhase(page, 'combat');
    const phase = await getCurrentPhase(page);
    expect(phase).toBe('combat');
  });

  test('throws error on timeout with helpful message', async ({ page }) => {
    await startNewGame(page);
    // Try to wait for a phase that won't happen
    await expect(waitForPhase(page, 'game_over', 1000)).rejects.toThrow(/Timeout waiting for phase/);
  });
});

test.describe('waitForPanel', () => {
  test('waits for inventory panel', async ({ page }) => {
    await startNewGame(page);
    await page.getByRole('button', { name: 'Inventory' }).click();
    await waitForPanel(page, 'inventory');
    expect(await isPanelVisible(page, 'inventory')).toBe(true);
  });

  test('waits for character panel', async ({ page }) => {
    await startNewGame(page);
    await page.getByRole('button', { name: 'Character Stats' }).click();
    await waitForPanel(page, 'character');
    expect(await isPanelVisible(page, 'character')).toBe(true);
  });

  test('throws error on timeout with helpful message', async ({ page }) => {
    await startNewGame(page);
    // Try to wait for a panel that isn't open
    await expect(waitForPanel(page, 'shop', 1000)).rejects.toThrow(/Timeout waiting for panel/);
  });
});

test.describe('closeAllPanels', () => {
  test('closes inventory panel', async ({ page }) => {
    await startNewGame(page);
    await page.getByRole('button', { name: 'Inventory' }).click();
    await waitForPanel(page, 'inventory');
    await closeAllPanels(page);
    expect(await isPanelVisible(page, 'inventory')).toBe(false);
  });

  test('closes multiple panels', async ({ page }) => {
    await startNewGame(page);
    
    // Open dialogue
    await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.startDialogue('doc_chen'));
    await waitForPhase(page, 'dialogue');
    
    // Close all
    await closeAllPanels(page);
    
    // Should be back to playing
    const phase = await getCurrentPhase(page);
    expect(phase).toBe('playing');
  });
});

test.describe('captureScreenshot', () => {
  test('captures screenshot with sanitized name', async ({ page }) => {
    await startNewGame(page);
    const path = await captureScreenshot(page, 'Test Screenshot!@#$');
    expect(path).toMatch(/test-screenshot-\d+\.png$/);
  });
});

test.describe('measurePerformance', () => {
  test('measures action duration', async ({ page }) => {
    await startNewGame(page);
    
    const duration = await measurePerformance(page, async () => {
      await page.getByRole('button', { name: 'Inventory' }).click();
      await waitForPanel(page, 'inventory');
    });
    
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThan(5000); // Should be reasonably fast
  });
});

test.describe('withRetry', () => {
  test('succeeds on first attempt', async () => {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts++;
      return 'success';
    });
    
    expect(result).toBe('success');
    expect(attempts).toBe(1);
  });

  test('retries on failure and succeeds', async () => {
    let attempts = 0;
    const result = await withRetry(
      async () => {
        attempts++;
        if (attempts < 3) throw new Error('Not yet');
        return 'success';
      },
      { maxAttempts: 3, delayMs: 10 }
    );
    
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  test('throws after max attempts', async () => {
    let attempts = 0;
    await expect(
      withRetry(
        async () => {
          attempts++;
          throw new Error('Always fails');
        },
        { maxAttempts: 2, delayMs: 10 }
      )
    ).rejects.toThrow(/Action failed after 2 attempts/);
    
    expect(attempts).toBe(2);
  });
});

test.describe('withRecovery', () => {
  test('runs recovery on failure', async () => {
    let attempts = 0;
    let recoveryRan = false;
    
    const result = await withRecovery(
      async () => {
        attempts++;
        if (attempts < 2) throw new Error('First attempt fails');
        return 'success';
      },
      async () => {
        recoveryRan = true;
      },
      3
    );
    
    expect(result).toBe('success');
    expect(recoveryRan).toBe(true);
  });
});

test.describe('PANEL_TEST_IDS', () => {
  test('has mappings for all common panels', () => {
    expect(PANEL_TEST_IDS.inventory).toBe('inventory-panel');
    expect(PANEL_TEST_IDS.character).toBe('character-panel');
    expect(PANEL_TEST_IDS.quests).toBe('quest-log-panel');
    expect(PANEL_TEST_IDS.menu).toBe('menu-panel');
    expect(PANEL_TEST_IDS.shop).toBe('shop-panel');
    expect(PANEL_TEST_IDS.combat).toBe('combat-panel');
    expect(PANEL_TEST_IDS.dialogue).toBe('dialogue-box');
  });
});

test.describe('TIMEOUTS', () => {
  test('has reasonable default values', () => {
    expect(TIMEOUTS.harness).toBe(90_000);
    expect(TIMEOUTS.phase).toBe(10_000);
    expect(TIMEOUTS.panel).toBe(5_000);
    expect(TIMEOUTS.action).toBe(2_000);
    expect(TIMEOUTS.loading).toBe(60_000);
    expect(TIMEOUTS.performance).toBe(500);
  });
});
