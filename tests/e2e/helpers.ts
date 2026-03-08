import type { Page } from '@playwright/test';

/**
 * Game phases supported by the test harness
 */
export type GamePhase =
  | 'title'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'dialogue'
  | 'inventory'
  | 'travel'
  | 'combat'
  | 'game_over'
  | 'puzzle';

/**
 * Panel types that can be opened in the game
 */
export type PanelType = 'inventory' | 'quests' | 'settings' | 'menu' | 'character';

/**
 * Panel test IDs mapping for locating panels in the DOM
 */
export const PANEL_TEST_IDS: Record<string, string> = {
  inventory: 'inventory-panel',
  quests: 'quest-log-panel',
  character: 'character-panel',
  menu: 'menu-panel',
  settings: 'settings-panel',
  shop: 'shop-panel',
  combat: 'combat-panel',
  dialogue: 'dialogue-box',
  puzzle: 'pipe-puzzle',
  'game-over': 'game-over-screen',
  'world-map': 'world-map',
};

/**
 * Default timeouts for various operations
 */
export const TIMEOUTS = {
  harness: 90_000,
  phase: 10_000,
  panel: 5_000,
  action: 2_000,
  loading: 60_000,
  performance: 500,
} as const;

/**
 * Retry configuration for error recovery
 */
export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 500,
  backoffMultiplier: 2,
};

/**
 * Wait for the test harness to be available on the page
 * @param page - Playwright page object
 * @param timeout - Optional timeout in milliseconds
 */
export async function waitForHarness(page: Page, timeout: number = TIMEOUTS.harness): Promise<void> {
  await page.waitForFunction(() => window.__IRON_FRONTIER_TEST__ !== undefined, { timeout });
}

/**
 * Ensure the game is on the title screen
 * @param page - Playwright page object
 */
export async function ensureTitleScreen(page: Page): Promise<void> {
  await waitForHarness(page);
  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.setPhase('title'));
}

/**
 * Start a new game with the given player name
 * @param page - Playwright page object
 * @param name - Player name (default: 'Ada')
 */
export async function startNewGame(page: Page, name: string = 'Ada'): Promise<void> {
  await page.goto('/?e2e=1');
  await ensureTitleScreen(page);
  const newGameButton = page.getByRole('button', { name: /begin adventure|new game/i });
  await newGameButton.waitFor();
  await newGameButton.click();
  await page.getByPlaceholder('Enter your name, stranger...').fill(name);
  await page.getByRole('button', { name: /^Start$/ }).click();
  await page.waitForFunction(() => window.__IRON_FRONTIER_TEST__ !== undefined);
  await page.locator('canvas').waitFor();
  await page.getByText('Loading Iron Frontier...').waitFor({ state: 'hidden', timeout: TIMEOUTS.loading });
}

/**
 * Call a method on the test harness
 * @param page - Playwright page object
 * @param method - Method name to call
 * @param args - Arguments to pass to the method
 */
export async function callHarness<T extends keyof NonNullable<typeof window.__IRON_FRONTIER_TEST__>>(
  page: Page,
  method: T,
  ...args: NonNullable<typeof window.__IRON_FRONTIER_TEST__>[T] extends (...p: infer P) => any ? P : never
): Promise<void> {
  await waitForHarness(page);
  await page.evaluate(
    ([methodName, methodArgs]) => {
      const harness = window.__IRON_FRONTIER_TEST__ as any;
      harness?.[methodName]?.(...(methodArgs as any[]));
    },
    [method, args]
  );
}

/**
 * Get a value from the test harness by calling a method
 * @param page - Playwright page object
 * @param method - Method name to call
 * @param args - Arguments to pass to the method
 * @returns The return value from the harness method
 */
export async function callHarnessWithReturn<
  T extends keyof NonNullable<typeof window.__IRON_FRONTIER_TEST__>,
  R = NonNullable<typeof window.__IRON_FRONTIER_TEST__>[T] extends (...p: any[]) => infer Ret ? Ret : never
>(
  page: Page,
  method: T,
  ...args: NonNullable<typeof window.__IRON_FRONTIER_TEST__>[T] extends (...p: infer P) => any ? P : never
): Promise<R> {
  await waitForHarness(page);
  return page.evaluate(
    ([methodName, methodArgs]) => {
      const harness = window.__IRON_FRONTIER_TEST__ as any;
      return harness?.[methodName]?.(...(methodArgs as any[]));
    },
    [method, args]
  ) as Promise<R>;
}

/**
 * Wait for the game to transition to a specific phase
 * @param page - Playwright page object
 * @param phase - Target game phase to wait for
 * @param timeout - Optional timeout in milliseconds (default: 10000)
 * @throws Error if the phase is not reached within the timeout
 * 
 * Requirements: 22.1, 22.3 - Error handling and state recovery
 */
export async function waitForPhase(
  page: Page,
  phase: GamePhase,
  timeout: number = TIMEOUTS.phase
): Promise<void> {
  await waitForHarness(page);
  
  try {
    await page.waitForFunction(
      (targetPhase) => {
        const harness = window.__IRON_FRONTIER_TEST__;
        if (!harness) return false;
        const state = harness.getState() as { phase?: string } | undefined;
        return state?.phase === targetPhase;
      },
      phase,
      { timeout }
    );
  } catch (error) {
    // Get current phase for better error message
    const currentPhase = await page.evaluate(() => {
      const harness = window.__IRON_FRONTIER_TEST__;
      if (!harness) return 'unknown (harness not available)';
      const state = harness.getState() as { phase?: string } | undefined;
      return state?.phase ?? 'unknown';
    });
    
    throw new Error(
      `Timeout waiting for phase '${phase}'. Current phase: '${currentPhase}'. ` +
      `Waited ${timeout}ms.`
    );
  }
}

/**
 * Wait for a specific panel to become visible
 * @param page - Playwright page object
 * @param panelId - Panel identifier (e.g., 'inventory', 'character', 'shop')
 * @param timeout - Optional timeout in milliseconds (default: 5000)
 * @throws Error if the panel is not visible within the timeout
 * 
 * Requirements: 22.1, 22.3 - Error handling and state recovery
 */
export async function waitForPanel(
  page: Page,
  panelId: string,
  timeout: number = TIMEOUTS.panel
): Promise<void> {
  const testId = PANEL_TEST_IDS[panelId] ?? panelId;
  const locator = page.locator(`[data-testid="${testId}"]`);
  
  try {
    await locator.waitFor({ state: 'visible', timeout });
  } catch (error) {
    // Check if the panel exists but is hidden
    const exists = await locator.count() > 0;
    const isVisible = exists && await locator.isVisible();
    
    throw new Error(
      `Timeout waiting for panel '${panelId}' (testId: ${testId}). ` +
      `Panel exists: ${exists}, visible: ${isVisible}. ` +
      `Waited ${timeout}ms.`
    );
  }
}

/**
 * Wait for a panel to be hidden/closed
 * @param page - Playwright page object
 * @param panelId - Panel identifier
 * @param timeout - Optional timeout in milliseconds
 */
export async function waitForPanelHidden(
  page: Page,
  panelId: string,
  timeout: number = TIMEOUTS.panel
): Promise<void> {
  const testId = PANEL_TEST_IDS[panelId] ?? panelId;
  const locator = page.locator(`[data-testid="${testId}"]`);
  
  await locator.waitFor({ state: 'hidden', timeout });
}

/**
 * Close all open panels by resetting activePanel and phase state
 * This resets the UI state to the main gameplay view
 * @param page - Playwright page object
 * 
 * Requirements: 22.1, 22.3 - Error handling and state recovery
 */
export async function closeAllPanels(page: Page): Promise<void> {
  await waitForHarness(page);
  
  // First, try to close any modal panels by clicking close buttons
  // This handles shop, combat end, puzzle cancel, etc.
  const closeButtons = page.getByRole('button', { name: /^close$|^cancel$|^back$|^end$/i });
  const closeButtonCount = await closeButtons.count();
  
  for (let i = 0; i < closeButtonCount; i++) {
    try {
      const button = closeButtons.nth(i);
      if (await button.isVisible()) {
        await button.click({ timeout: TIMEOUTS.action });
        // Small delay to allow UI to update
        await page.waitForTimeout(100);
      }
    } catch {
      // Button may have been removed after previous close, continue
    }
  }
  
  // Reset activePanel to null and phase to playing via setState
  // This handles inventory, character, quests, menu panels which are controlled by activePanel
  await page.evaluate(() => {
    const harness = window.__IRON_FRONTIER_TEST__;
    if (harness) {
      const state = harness.getState() as { phase?: string; activePanel?: string | null } | undefined;
      
      // Close any active panel
      if (state?.activePanel !== null) {
        harness.setState({ activePanel: null });
      }
      
      // Reset phase to playing if in a modal phase (paused, dialogue, etc.)
      // but not if in title or game_over
      if (state?.phase && !['title', 'playing', 'game_over'].includes(state.phase)) {
        harness.setPhase('playing');
      }
    }
  });
  
  // Wait for UI to update
  await page.waitForTimeout(200);
}

/**
 * Capture a screenshot with a descriptive name
 * Screenshots are saved to the test-results directory
 * @param page - Playwright page object
 * @param name - Descriptive name for the screenshot (will be sanitized)
 * @returns Path to the saved screenshot
 * 
 * Requirements: 22.1 - Error handling (capture state on failure)
 */
export async function captureScreenshot(page: Page, name: string): Promise<string> {
  // Sanitize the name for use as a filename
  const sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const timestamp = Date.now();
  const filename = `${sanitizedName}-${timestamp}.png`;
  const path = `test-results/screenshots/${filename}`;
  
  await page.screenshot({ path, fullPage: true });
  
  return path;
}

/**
 * Capture the current game state for debugging
 * @param page - Playwright page object
 * @returns The current game state object
 */
export async function captureGameState(page: Page): Promise<unknown> {
  await waitForHarness(page);
  
  return page.evaluate(() => {
    const harness = window.__IRON_FRONTIER_TEST__;
    if (!harness) return { error: 'Harness not available' };
    return harness.getState();
  });
}

/**
 * Measure the performance of an action
 * @param page - Playwright page object
 * @param action - Async function to measure
 * @returns Duration in milliseconds
 * 
 * Requirements: 22.3 - Performance monitoring
 */
export async function measurePerformance(
  page: Page,
  action: () => Promise<void>
): Promise<number> {
  const startTime = performance.now();
  await action();
  const endTime = performance.now();
  
  return endTime - startTime;
}

/**
 * Measure performance and assert it's within threshold
 * @param page - Playwright page object
 * @param action - Async function to measure
 * @param maxDurationMs - Maximum allowed duration in milliseconds
 * @returns Object with duration and whether it passed the threshold
 */
export async function measurePerformanceWithThreshold(
  page: Page,
  action: () => Promise<void>,
  maxDurationMs: number = TIMEOUTS.performance
): Promise<{ duration: number; passed: boolean }> {
  const duration = await measurePerformance(page, action);
  return {
    duration,
    passed: duration <= maxDurationMs,
  };
}

/**
 * Execute an action with retry logic for error recovery
 * @param action - Async function to execute
 * @param options - Retry configuration options
 * @returns The result of the action
 * @throws Error if all retry attempts fail
 * 
 * Requirements: 22.1, 22.3 - Error handling and recovery
 */
export async function withRetry<T>(
  action: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts, delayMs, backoffMultiplier } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };
  
  let lastError: Error | undefined;
  let currentDelay = delayMs;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts) {
        // Wait before retrying with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= backoffMultiplier;
      }
    }
  }
  
  throw new Error(
    `Action failed after ${maxAttempts} attempts. Last error: ${lastError?.message}`
  );
}

/**
 * Execute an action with recovery - if it fails, run recovery and retry
 * @param action - Async function to execute
 * @param recovery - Async function to run on failure before retry
 * @param maxAttempts - Maximum number of attempts (default: 3)
 * @returns The result of the action
 * @throws Error if all attempts fail
 * 
 * Requirements: 22.1, 22.3 - Error handling and recovery
 */
export async function withRecovery<T>(
  action: () => Promise<T>,
  recovery: () => Promise<void>,
  maxAttempts: number = 3
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts) {
        try {
          await recovery();
        } catch (recoveryError) {
          // Log recovery failure but continue with retry
          console.warn(`Recovery attempt ${attempt} failed:`, recoveryError);
        }
      }
    }
  }
  
  throw new Error(
    `Action failed after ${maxAttempts} attempts with recovery. Last error: ${lastError?.message}`
  );
}

/**
 * Safe navigation - go to URL with retry on failure
 * @param page - Playwright page object
 * @param url - URL to navigate to (default: '/?e2e=1')
 * @param options - Retry options
 */
export async function safeGoto(
  page: Page,
  url: string = '/?e2e=1',
  options: RetryOptions = {}
): Promise<void> {
  await withRetry(async () => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await waitForHarness(page);
  }, options);
}

/**
 * Get the current game phase
 * @param page - Playwright page object
 * @returns Current game phase or 'unknown' if not available
 */
export async function getCurrentPhase(page: Page): Promise<GamePhase | 'unknown'> {
  await waitForHarness(page);
  
  return page.evaluate(() => {
    const harness = window.__IRON_FRONTIER_TEST__;
    if (!harness) return 'unknown';
    const state = harness.getState() as { phase?: GamePhase } | undefined;
    return state?.phase ?? 'unknown';
  });
}

/**
 * Check if a panel is currently visible
 * @param page - Playwright page object
 * @param panelId - Panel identifier
 * @returns True if the panel is visible
 */
export async function isPanelVisible(page: Page, panelId: string): Promise<boolean> {
  const testId = PANEL_TEST_IDS[panelId] ?? panelId;
  const locator = page.locator(`[data-testid="${testId}"]`);
  
  const count = await locator.count();
  if (count === 0) return false;
  
  return locator.isVisible();
}

/**
 * Wait for the game to be in a stable state (not loading)
 * @param page - Playwright page object
 * @param timeout - Optional timeout in milliseconds
 */
export async function waitForStableState(
  page: Page,
  timeout: number = TIMEOUTS.loading
): Promise<void> {
  await waitForHarness(page);
  
  // Wait for loading indicator to disappear
  const loadingIndicator = page.getByText('Loading Iron Frontier...');
  await loadingIndicator.waitFor({ state: 'hidden', timeout });
  
  // Wait for phase to not be 'loading'
  await page.waitForFunction(
    () => {
      const harness = window.__IRON_FRONTIER_TEST__;
      if (!harness) return false;
      const state = harness.getState() as { phase?: string } | undefined;
      return state?.phase !== 'loading';
    },
    { timeout }
  );
}
