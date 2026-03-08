/**
 * E2E Tests: Character Creation and New Game Flow
 *
 * Tests for verifying the character creation flow works correctly,
 * so that players can create new characters without issues.
 *
 * Requirements covered:
 * - 2.1: Clicking "New Game" shows character creation screen
 * - 2.2: Valid name (1-20 characters) is accepted
 * - 2.3: Empty name validation prevents progression
 * - 2.4: Name exceeding 20 characters is truncated or rejected
 * - 2.5: Completing character creation transitions to playing phase
 * - 2.6: Initial player stats are set correctly (100 HP, 50 gold, level 1)
 */

import { expect, test } from '@playwright/test';
import {
    MAX_NAME_LENGTH,
    MOCK_PLAYER_STATS,
    TEST_PLAYER_NAME
} from '../fixtures';
import {
    captureScreenshot,
    startNewGame,
    TIMEOUTS,
    waitForHarness
} from '../helpers';

test.describe('Character Creation and New Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all storage to ensure clean state
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
      // Clear IndexedDB if available
      if (typeof indexedDB !== 'undefined') {
        indexedDB.databases?.().then((dbs) => {
          dbs.forEach((db) => {
            if (db.name) indexedDB.deleteDatabase(db.name);
          });
        });
      }
    });
  });

  test.describe('Requirement 2.1: Character creation screen appearance', () => {
    test('clicking "New Game" / "Begin Adventure" shows character creation screen', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure (shown when no save data exists)
      const beginButton = page.getByRole('button', { name: /begin adventure|new game/i });
      await beginButton.click();

      // Character creation screen should appear with name input
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await expect(nameInput).toBeVisible();

      // Start button should be present
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeVisible();

      // Back button should be present
      const backButton = page.getByRole('button', { name: /back/i });
      await expect(backButton).toBeVisible();
    });

    test('character creation screen has proper layout and elements', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Verify all expected elements are present
      await expect(page.getByPlaceholder(/enter your name/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /^start$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /back/i })).toBeVisible();
    });

    test('clicking "New Game" when save exists also shows character creation', async ({ page }) => {
      await page.goto('/?e2e=1');
      await waitForHarness(page);

      // Set up save data
      await page.evaluate((playerName) => {
        window.__IRON_FRONTIER_TEST__?.setState({
          initialized: true,
          playerName: playerName,
        });
      }, TEST_PLAYER_NAME);

      // Go back to title screen
      await page.evaluate(() => {
        window.__IRON_FRONTIER_TEST__?.setPhase('title');
      });

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click New Game (shown when save data exists)
      const newGameButton = page.getByRole('button', { name: /^new game$/i });
      await newGameButton.click();

      // Character creation screen should appear
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await expect(nameInput).toBeVisible();
    });
  });

  test.describe('Requirement 2.2: Valid name acceptance (1-20 characters)', () => {
    test('accepts minimum length name (1 character)', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter minimum length name
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill('A');

      // Start button should be enabled
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeEnabled();
    });

    test('accepts maximum length name (20 characters)', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter maximum length name (20 characters)
      const maxLengthName = 'A'.repeat(MAX_NAME_LENGTH);
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill(maxLengthName);

      // Start button should be enabled
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeEnabled();
    });

    test('accepts typical name length', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter typical name
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill(TEST_PLAYER_NAME);

      // Start button should be enabled
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeEnabled();
    });

    test('accepts alphanumeric names', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter alphanumeric name
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill('Outlaw123');

      // Start button should be enabled
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeEnabled();
    });

    test('accepts names with spaces', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter name with space
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill('John Doe');

      // Start button should be enabled
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeEnabled();
    });
  });

  test.describe('Requirement 2.3: Empty name validation prevents progression', () => {
    test('Start button is disabled with empty name', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Name input should be empty by default
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await expect(nameInput).toHaveValue('');

      // Start button should be disabled
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeDisabled();
    });

    test('Start button becomes disabled when name is cleared', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter a name first
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill(TEST_PLAYER_NAME);

      // Start button should be enabled
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeEnabled();

      // Clear the name
      await nameInput.clear();

      // Start button should be disabled again
      await expect(startButton).toBeDisabled();
    });

    test('whitespace-only name is treated as empty', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter whitespace-only name
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill('   ');

      // Start button should be disabled (whitespace-only should be treated as empty)
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeDisabled();
    });
  });

  test.describe('Requirement 2.4: Name exceeding 20 characters is truncated or rejected', () => {
    test('name input truncates or limits to 20 characters', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Try to enter a name longer than 20 characters
      const longName = 'A'.repeat(30);
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill(longName);

      // Get the actual value in the input
      const actualValue = await nameInput.inputValue();

      // The input should either truncate to 20 characters or reject the extra characters
      expect(actualValue.length).toBeLessThanOrEqual(MAX_NAME_LENGTH);
    });

    test('Start button remains enabled with truncated long name', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Try to enter a name longer than 20 characters
      const longName = 'A'.repeat(25);
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill(longName);

      // Start button should still be enabled (truncated name is valid)
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeEnabled();
    });
  });

  test.describe('Requirement 2.5: Character creation transitions to playing phase', () => {
    test('completing character creation transitions to playing phase', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter name
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill(TEST_PLAYER_NAME);

      // Click Start
      const startButton = page.getByRole('button', { name: /^start$/i });
      await startButton.click();

      // Wait for harness to be available
      await waitForHarness(page);

      // Wait for loading to complete
      await page.getByText('Loading Iron Frontier...').waitFor({ state: 'hidden', timeout: TIMEOUTS.loading });

      // Verify phase changed to playing
      const phase = await page.evaluate(() => {
        const state = window.__IRON_FRONTIER_TEST__?.getState() as { phase?: string } | undefined;
        return state?.phase;
      });
      expect(phase).toBe('playing');
    });

    test('game canvas is visible after starting new game', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter name and start
      await page.getByPlaceholder(/enter your name/i).fill(TEST_PLAYER_NAME);
      await page.getByRole('button', { name: /^start$/i }).click();

      // Wait for harness
      await waitForHarness(page);

      // Wait for loading to complete
      await page.getByText('Loading Iron Frontier...').waitFor({ state: 'hidden', timeout: TIMEOUTS.loading });

      // Canvas should be visible
      await expect(page.locator('canvas')).toBeVisible();
    });

    test('player name is stored correctly after starting game', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter name and start
      const customName = 'CustomOutlaw';
      await page.getByPlaceholder(/enter your name/i).fill(customName);
      await page.getByRole('button', { name: /^start$/i }).click();

      // Wait for harness
      await waitForHarness(page);

      // Wait for loading to complete
      await page.getByText('Loading Iron Frontier...').waitFor({ state: 'hidden', timeout: TIMEOUTS.loading });

      // Verify player name is stored
      const playerName = await page.evaluate(() => {
        const state = window.__IRON_FRONTIER_TEST__?.getState() as { playerName?: string } | undefined;
        return state?.playerName;
      });
      expect(playerName).toBe(customName);
    });
  });

  test.describe('Requirement 2.6: Initial player stats are set correctly', () => {
    test('initial health is 100', async ({ page }) => {
      // Use the startNewGame helper
      await startNewGame(page, TEST_PLAYER_NAME);

      // Verify initial health
      const health = await page.evaluate(() => {
        const state = window.__IRON_FRONTIER_TEST__?.getState() as { playerStats?: { health?: number } } | undefined;
        return state?.playerStats?.health;
      });
      expect(health).toBe(MOCK_PLAYER_STATS.health);
    });

    test('initial max health is 100', async ({ page }) => {
      await startNewGame(page, TEST_PLAYER_NAME);

      // Verify initial max health
      const maxHealth = await page.evaluate(() => {
        const state = window.__IRON_FRONTIER_TEST__?.getState() as { playerStats?: { maxHealth?: number } } | undefined;
        return state?.playerStats?.maxHealth;
      });
      expect(maxHealth).toBe(MOCK_PLAYER_STATS.maxHealth);
    });

    test('initial gold is 50', async ({ page }) => {
      await startNewGame(page, TEST_PLAYER_NAME);

      // Verify initial gold
      const gold = await page.evaluate(() => {
        const state = window.__IRON_FRONTIER_TEST__?.getState() as { playerStats?: { gold?: number } } | undefined;
        return state?.playerStats?.gold;
      });
      expect(gold).toBe(MOCK_PLAYER_STATS.gold);
    });

    test('initial level is 1', async ({ page }) => {
      await startNewGame(page, TEST_PLAYER_NAME);

      // Verify initial level
      const level = await page.evaluate(() => {
        const state = window.__IRON_FRONTIER_TEST__?.getState() as { playerStats?: { level?: number } } | undefined;
        return state?.playerStats?.level;
      });
      expect(level).toBe(MOCK_PLAYER_STATS.level);
    });

    test('all initial player stats are correct', async ({ page }) => {
      await startNewGame(page, TEST_PLAYER_NAME);

      // Verify all initial stats
      const playerStats = await page.evaluate(() => {
        const state = window.__IRON_FRONTIER_TEST__?.getState() as { playerStats?: object } | undefined;
        return state?.playerStats;
      });

      expect(playerStats).toBeDefined();
      expect(playerStats).toMatchObject({
        health: MOCK_PLAYER_STATS.health,
        maxHealth: MOCK_PLAYER_STATS.maxHealth,
        gold: MOCK_PLAYER_STATS.gold,
        level: MOCK_PLAYER_STATS.level,
      });
    });

    test('initial stamina is 100', async ({ page }) => {
      await startNewGame(page, TEST_PLAYER_NAME);

      // Verify initial stamina
      const stamina = await page.evaluate(() => {
        const state = window.__IRON_FRONTIER_TEST__?.getState() as { playerStats?: { stamina?: number } } | undefined;
        return state?.playerStats?.stamina;
      });
      expect(stamina).toBe(MOCK_PLAYER_STATS.stamina);
    });

    test('initial XP is 0', async ({ page }) => {
      await startNewGame(page, TEST_PLAYER_NAME);

      // Verify initial XP
      const xp = await page.evaluate(() => {
        const state = window.__IRON_FRONTIER_TEST__?.getState() as { playerStats?: { xp?: number } } | undefined;
        return state?.playerStats?.xp;
      });
      expect(xp).toBe(MOCK_PLAYER_STATS.xp);
    });
  });

  test.describe('Character Creation Edge Cases', () => {
    test('can go back and re-enter character creation', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter a name
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill('FirstName');

      // Go back
      await page.getByRole('button', { name: /back/i }).click();

      // Should be back at main menu
      await expect(
        page.getByRole('button', { name: /begin adventure|new game/i })
      ).toBeVisible();

      // Enter character creation again
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Name input should be visible again (may or may not retain previous value)
      await expect(nameInput).toBeVisible();
    });

    test('special characters in name are handled', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter name with special characters
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill("O'Brien-Smith");

      // Start button should be enabled (special characters allowed)
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeEnabled();
    });

    test('unicode characters in name are handled', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Enter name with unicode characters
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill('José García');

      // Start button should be enabled
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeEnabled();
    });
  });

  test.describe('Error Handling', () => {
    test('screenshot can be captured during character creation', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure|new game/i }).click();

      // Capture screenshot
      const screenshotPath = await captureScreenshot(page, 'character-creation-screen');

      // Verify screenshot was created
      expect(screenshotPath).toContain('character-creation-screen');
      expect(screenshotPath).toContain('.png');
    });
  });
});
