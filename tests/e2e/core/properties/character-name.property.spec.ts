/**
 * Property-Based Test: Character Name Validation
 *
 * **Property 2: Character Name Validation**
 * **Validates: Requirements 2.2**
 *
 * For any string of 1-20 alphanumeric characters, the character creation
 * system SHALL accept the name and allow game progression.
 *
 * This test uses fast-check to generate random valid character names and
 * verifies they are accepted by the character creation system.
 */

import { expect, test } from '@playwright/test';
import fc from 'fast-check';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '../../fixtures';
import { TIMEOUTS, waitForHarness } from '../../helpers';

/**
 * Property-Based Testing Configuration
 * - numRuns: 100 iterations for thorough coverage
 * - verbose: true for detailed output on failures
 * - seed: 12345 for reproducible tests
 */
const PBT_CONFIG: fc.Parameters<unknown> = {
  numRuns: 100,
  verbose: true,
  seed: 12345,
};

/**
 * Arbitrary for generating valid alphanumeric character names
 * Generates strings of 1-20 characters using only [A-Za-z0-9]
 */
const validAlphanumericName = fc
  .array(
    fc.constantFrom(
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('')
    ),
    { minLength: MIN_NAME_LENGTH, maxLength: MAX_NAME_LENGTH }
  )
  .map((chars) => chars.join(''));

test.describe('Property 2: Character Name Validation', () => {
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

  test('valid alphanumeric names (1-20 chars) are accepted and allow game progression', async ({ page }) => {
    /**
     * **Validates: Requirements 2.2**
     *
     * Property: For any string of 1-20 alphanumeric characters,
     * the character creation system SHALL accept the name and allow game progression.
     */

    // Navigate to the game once
    await page.goto('/?e2e=1');

    // Wait for title screen
    await expect(
      page.getByRole('heading', { name: /iron frontier/i })
    ).toBeVisible({ timeout: 5000 });

    // Run property-based test with generated names
    await fc.assert(
      fc.asyncProperty(validAlphanumericName, async (generatedName) => {
        // Navigate fresh for each test iteration to ensure clean state
        await page.goto('/?e2e=1');

        // Wait for title screen
        await expect(
          page.getByRole('heading', { name: /iron frontier/i })
        ).toBeVisible({ timeout: 5000 });

        // Click Begin Adventure to enter character creation
        const beginButton = page.getByRole('button', { name: /begin adventure|new game/i });
        await beginButton.click();

        // Wait for character creation screen
        const nameInput = page.getByPlaceholder(/enter your name/i);
        await expect(nameInput).toBeVisible();

        // Enter the generated name
        await nameInput.fill(generatedName);

        // Verify the Start button is enabled (name is accepted)
        const startButton = page.getByRole('button', { name: /^start$/i });
        await expect(startButton).toBeEnabled();

        // Click Start to verify game progression
        await startButton.click();

        // Wait for harness to be available
        await waitForHarness(page);

        // Wait for loading to complete
        await page.getByText('Loading Iron Frontier...').waitFor({ state: 'hidden', timeout: TIMEOUTS.loading });

        // Verify phase changed to playing (game progression succeeded)
        const phase = await page.evaluate(() => {
          const state = window.__IRON_FRONTIER_TEST__?.getState() as { phase?: string } | undefined;
          return state?.phase;
        });

        // Property assertion: game must transition to playing phase
        expect(phase).toBe('playing');

        // Verify the player name was stored correctly
        const storedName = await page.evaluate(() => {
          const state = window.__IRON_FRONTIER_TEST__?.getState() as { playerName?: string } | undefined;
          return state?.playerName;
        });

        // Property assertion: stored name must match input (possibly trimmed)
        expect(storedName).toBe(generatedName);

        return true;
      }),
      PBT_CONFIG
    );
  });

  test('name length boundaries are respected', async ({ page }) => {
    /**
     * **Validates: Requirements 2.2**
     *
     * Property: Names at exact boundary lengths (1 and 20 characters)
     * must be accepted.
     */

    // Test minimum length (1 character)
    const minLengthNames = fc
      .array(
        fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('')),
        { minLength: 1, maxLength: 1 }
      )
      .map((chars) => chars.join(''));

    // Test maximum length (20 characters)
    const maxLengthNames = fc
      .array(
        fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('')),
        { minLength: 20, maxLength: 20 }
      )
      .map((chars) => chars.join(''));

    // Test boundary names
    const boundaryNames = fc.oneof(minLengthNames, maxLengthNames);

    await fc.assert(
      fc.asyncProperty(boundaryNames, async (generatedName) => {
        await page.goto('/?e2e=1');

        // Wait for title screen
        await expect(
          page.getByRole('heading', { name: /iron frontier/i })
        ).toBeVisible({ timeout: 5000 });

        // Click Begin Adventure
        await page.getByRole('button', { name: /begin adventure|new game/i }).click();

        // Enter the boundary-length name
        const nameInput = page.getByPlaceholder(/enter your name/i);
        await nameInput.fill(generatedName);

        // Verify Start button is enabled
        const startButton = page.getByRole('button', { name: /^start$/i });
        await expect(startButton).toBeEnabled();

        // Verify the input value length is correct
        const inputValue = await nameInput.inputValue();
        expect(inputValue.length).toBeGreaterThanOrEqual(MIN_NAME_LENGTH);
        expect(inputValue.length).toBeLessThanOrEqual(MAX_NAME_LENGTH);

        return true;
      }),
      { ...PBT_CONFIG, numRuns: 20 } // Fewer runs for boundary tests
    );
  });

  test('various alphanumeric character combinations are accepted', async ({ page }) => {
    /**
     * **Validates: Requirements 2.2**
     *
     * Property: Any combination of uppercase, lowercase, and numeric
     * characters within length bounds must be accepted.
     */

    // Generate names with specific character type distributions
    const mixedCaseNames = fc.tuple(
      fc.array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 1, maxLength: 7 }).map((c) => c.join('')),
      fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 7 }).map((c) => c.join('')),
      fc.array(fc.constantFrom(...'0123456789'.split('')), { minLength: 0, maxLength: 6 }).map((c) => c.join(''))
    ).map(([upper, lower, digits]: [string, string, string]) => {
      const combined = upper + lower + digits;
      // Shuffle the characters
      return combined.split('').sort(() => Math.random() - 0.5).join('').slice(0, MAX_NAME_LENGTH);
    }).filter(name => name.length >= MIN_NAME_LENGTH && name.length <= MAX_NAME_LENGTH);

    await fc.assert(
      fc.asyncProperty(mixedCaseNames, async (generatedName) => {
        await page.goto('/?e2e=1');

        // Wait for title screen
        await expect(
          page.getByRole('heading', { name: /iron frontier/i })
        ).toBeVisible({ timeout: 5000 });

        // Click Begin Adventure
        await page.getByRole('button', { name: /begin adventure|new game/i }).click();

        // Enter the mixed-case name
        const nameInput = page.getByPlaceholder(/enter your name/i);
        await nameInput.fill(generatedName);

        // Verify Start button is enabled (name accepted)
        const startButton = page.getByRole('button', { name: /^start$/i });
        await expect(startButton).toBeEnabled();

        return true;
      }),
      { ...PBT_CONFIG, numRuns: 30 }
    );
  });
});
