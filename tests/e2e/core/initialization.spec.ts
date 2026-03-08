/**
 * E2E Tests: Game Initialization and Title Screen
 *
 * Tests for verifying the game initializes correctly and displays the title screen.
 *
 * Requirements covered:
 * - 1.1: Title screen displays within 5 seconds
 * - 1.2: Game title "Iron Frontier" is visible
 * - 1.3: "New Game" and "Continue" buttons are present and accessible
 * - 1.4: "Continue" button is disabled or hidden when no save data exists
 * - 1.5: "Continue" button is enabled and functional when save data exists
 * - 1.6: Error state capture and failure reporting on load failure
 */

import { expect, test } from '@playwright/test';
import { PERFORMANCE_THRESHOLDS, TEST_PLAYER_NAME } from '../fixtures';
import {
    captureGameState,
    captureScreenshot,
    TIMEOUTS,
    waitForHarness
} from '../helpers';

test.describe('Game Initialization and Title Screen', () => {
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

  test.describe('Requirement 1.1: Title screen loads within 5 seconds', () => {
    test('title screen displays within 5 seconds', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/?e2e=1');

      // Wait for the title screen to be visible (after splash)
      // The splash screen shows for 2.5 seconds, then main menu appears
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      const loadTime = Date.now() - startTime;

      // Verify load time is within acceptable range
      expect(loadTime).toBeLessThan(5000);
    });

    test('splash screen appears first then transitions to main menu', async ({ page }) => {
      await page.goto('/?e2e=1');

      // The splash screen should show "Loading Steam..." text
      const splashText = page.getByText('Loading Steam...');

      // Splash should be visible initially (may be very brief)
      // Then the main menu should appear
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // After splash, the "Loading Steam..." text should be hidden
      await expect(splashText).toBeHidden({ timeout: 3000 });
    });
  });

  test.describe('Requirement 1.2: Game title visibility', () => {
    test('game title "Iron Frontier" is visible on title screen', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for splash to complete
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Verify the title text content
      const titleHeading = page.getByRole('heading', { name: /iron frontier/i });
      await expect(titleHeading).toContainText('IRON FRONTIER');
    });

    test('subtitle "Tales of the Steam Frontier" is visible', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for splash to complete
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Verify subtitle is present
      await expect(
        page.getByText('Tales of the Steam Frontier')
      ).toBeVisible();
    });

    test('page title contains "Iron Frontier"', async ({ page }) => {
      await page.goto('/?e2e=1');
      await expect(page).toHaveTitle(/Iron Frontier/i);
    });
  });

  test.describe('Requirement 1.3: New Game and Continue buttons presence', () => {
    test('New Game / Begin Adventure button is present and accessible', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for splash to complete
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Without save data, button should say "Begin Adventure"
      const newGameButton = page.getByRole('button', { name: /begin adventure|new game/i });
      await expect(newGameButton).toBeVisible();
      await expect(newGameButton).toBeEnabled();
    });

    test('buttons have proper accessibility attributes', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for splash to complete
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Verify button is accessible via role
      const newGameButton = page.getByRole('button', { name: /begin adventure|new game/i });
      await expect(newGameButton).toBeVisible();

      // Verify button type attribute
      await expect(newGameButton).toHaveAttribute('type', 'button');
    });
  });

  test.describe('Requirement 1.4: Continue button disabled without save data', () => {
    test('Continue button is not visible when no save data exists', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for splash to complete
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Continue button should not be visible without save data
      const continueButton = page.getByRole('button', { name: /continue as/i });
      await expect(continueButton).toBeHidden();
    });

    test('only Begin Adventure button is shown without save data', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for splash to complete
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Should show "Begin Adventure" (not "New Game")
      const beginButton = page.getByRole('button', { name: /begin adventure/i });
      await expect(beginButton).toBeVisible();

      // "New Game" text should not be visible (it only shows when save data exists)
      const newGameButton = page.getByRole('button', { name: /^new game$/i });
      await expect(newGameButton).toBeHidden();
    });
  });

  test.describe('Requirement 1.5: Continue button enabled with save data', () => {
    test('Continue button is visible and enabled when save data exists', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for harness to be available
      await waitForHarness(page);

      // Set up save data by setting initialized flag and player name via setState
      await page.evaluate((playerName) => {
        window.__IRON_FRONTIER_TEST__?.setState({
          initialized: true,
          playerName: playerName,
        });
      }, TEST_PLAYER_NAME);

      // Go back to title screen to see the continue button
      await page.evaluate(() => {
        window.__IRON_FRONTIER_TEST__?.setPhase('title');
      });

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Continue button should now be visible with player name
      const continueButton = page.getByRole('button', { name: new RegExp(`continue as ${TEST_PLAYER_NAME}`, 'i') });
      await expect(continueButton).toBeVisible();
      await expect(continueButton).toBeEnabled();
    });

    test('Continue button shows saved player name', async ({ page }) => {
      await page.goto('/?e2e=1');
      await waitForHarness(page);

      // Set up save data with a specific name
      const customName = 'OutlawJoe';
      await page.evaluate((name) => {
        window.__IRON_FRONTIER_TEST__?.setState({
          initialized: true,
          playerName: name,
        });
      }, customName);

      // Go back to title screen
      await page.evaluate(() => {
        window.__IRON_FRONTIER_TEST__?.setPhase('title');
      });

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Verify the continue button shows the correct player name
      const continueButton = page.getByRole('button', { name: new RegExp(`continue as ${customName}`, 'i') });
      await expect(continueButton).toBeVisible();
    });

    test('Continue button transitions to playing phase', async ({ page }) => {
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

      // Click continue button
      const continueButton = page.getByRole('button', { name: /continue as/i });
      await continueButton.click();

      // Verify phase changed to playing
      const phase = await page.evaluate(() => {
        const state = window.__IRON_FRONTIER_TEST__?.getState() as { phase?: string } | undefined;
        return state?.phase;
      });
      expect(phase).toBe('playing');
    });

    test('New Game button shows when save data exists', async ({ page }) => {
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

      // When save data exists, should show "New Game" instead of "Begin Adventure"
      const newGameButton = page.getByRole('button', { name: /^new game$/i });
      await expect(newGameButton).toBeVisible();
    });
  });

  test.describe('Requirement 1.6: Error state capture and failure reporting', () => {
    test('test harness is available for error capture', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for harness to be available
      await waitForHarness(page, TIMEOUTS.harness);

      // Verify harness is accessible
      const harnessAvailable = await page.evaluate(() => {
        return typeof window.__IRON_FRONTIER_TEST__ !== 'undefined';
      });
      expect(harnessAvailable).toBe(true);
    });

    test('game state can be captured for debugging', async ({ page }) => {
      await page.goto('/?e2e=1');
      await waitForHarness(page);

      // Capture game state
      const gameState = await captureGameState(page);

      // Verify state is captured and has expected structure
      expect(gameState).toBeDefined();
      expect(typeof gameState).toBe('object');
    });

    test('screenshot can be captured on failure', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for title screen
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Capture screenshot (simulating failure capture)
      const screenshotPath = await captureScreenshot(page, 'initialization-test');

      // Verify screenshot was created
      expect(screenshotPath).toContain('initialization-test');
      expect(screenshotPath).toContain('.png');
    });

    test('handles navigation errors gracefully', async ({ page }) => {
      // Test that the page handles errors without crashing
      await page.goto('/?e2e=1');

      // Wait for harness
      await waitForHarness(page);

      // Try to get state even if something goes wrong
      const state = await page.evaluate(() => {
        try {
          return window.__IRON_FRONTIER_TEST__?.getState();
        } catch {
          return { error: 'Failed to get state' };
        }
      });

      // Should return something (either state or error object)
      expect(state).toBeDefined();
    });
  });

  test.describe('Title Screen UI Elements', () => {
    test('About button is visible and functional', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for splash to complete
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // About button should be visible
      const aboutButton = page.getByRole('button', { name: /about/i });
      await expect(aboutButton).toBeVisible();

      // Click about button
      await aboutButton.click();

      // About modal should appear
      await expect(
        page.getByRole('heading', { name: /about iron frontier/i })
      ).toBeVisible();

      // Close button should be present
      const closeButton = page.getByRole('button', { name: /close/i });
      await expect(closeButton).toBeVisible();

      // Close the modal
      await closeButton.click();

      // Modal should be hidden
      await expect(
        page.getByRole('heading', { name: /about iron frontier/i })
      ).toBeHidden();
    });

    test('flavor text is displayed', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for splash to complete
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Verify flavor text is present
      await expect(
        page.getByText(/The year is 1887/i)
      ).toBeVisible();
    });
  });

  test.describe('Character Name Input', () => {
    test('clicking New Game/Begin Adventure shows name input', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for splash to complete
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      const beginButton = page.getByRole('button', { name: /begin adventure/i });
      await beginButton.click();

      // Name input should appear
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await expect(nameInput).toBeVisible();
    });

    test('Back button returns to main menu', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for splash to complete
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      const beginButton = page.getByRole('button', { name: /begin adventure/i });
      await beginButton.click();

      // Name input should appear
      await expect(
        page.getByPlaceholder(/enter your name/i)
      ).toBeVisible();

      // Click Back button
      const backButton = page.getByRole('button', { name: /back/i });
      await backButton.click();

      // Should return to main menu - Begin Adventure should be visible again
      await expect(beginButton).toBeVisible();
    });

    test('Start button is disabled with empty name', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for splash to complete
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure/i }).click();

      // Start button should be disabled
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeDisabled();
    });

    test('Start button is enabled with valid name', async ({ page }) => {
      await page.goto('/?e2e=1');

      // Wait for splash to complete
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: 5000 });

      // Click Begin Adventure
      await page.getByRole('button', { name: /begin adventure/i }).click();

      // Enter a name
      const nameInput = page.getByPlaceholder(/enter your name/i);
      await nameInput.fill(TEST_PLAYER_NAME);

      // Start button should be enabled
      const startButton = page.getByRole('button', { name: /^start$/i });
      await expect(startButton).toBeEnabled();
    });
  });

  test.describe('Performance', () => {
    test('initial load completes within performance threshold', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/?e2e=1');

      // Wait for title screen to be fully loaded
      await expect(
        page.getByRole('heading', { name: /iron frontier/i })
      ).toBeVisible({ timeout: PERFORMANCE_THRESHOLDS.initialLoad });

      const loadTime = Date.now() - startTime;

      // Should load within the performance threshold (10 seconds)
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.initialLoad);
    });
  });
});
