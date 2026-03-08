import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Iron Frontier E2E tests
 * 
 * Test directory structure:
 * - tests/e2e/core/       - Game initialization, phases, new game flow
 * - tests/e2e/ui/         - HUD, action bar, panels, responsive
 * - tests/e2e/systems/    - Inventory, quests, dialogue, combat, shop, travel, survival, puzzle
 * - tests/e2e/spatial/    - Collision, zones, boundaries
 * - tests/e2e/persistence/ - Save/load
 * - tests/e2e/validation/ - Procedural generation, notifications
 * - tests/e2e/quality/    - Accessibility, performance, error handling
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,
  fullyParallel: false,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:8101',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm exec ng serve --host 127.0.0.1 --port 8101 --no-open',
    url: 'http://127.0.0.1:8101',
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile portrait (< 480px) - Requirement 20.1
    {
      name: 'mobile-portrait',
      use: {
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    },
    {
      name: 'iphone-15',
      use: { ...devices['iPhone 15'] },
    },
    
    // Mobile landscape (480-767px) - Requirement 20.2
    {
      name: 'mobile-landscape',
      use: {
        viewport: { width: 667, height: 375 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'pixel-7',
      use: { ...devices['Pixel 7'] },
    },
    
    // Tablet (768-1023px) - Requirement 20.3
    {
      name: 'tablet',
      use: {
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'ipad-pro-11',
      use: { ...devices['iPad Pro 11'] },
    },
    
    // Desktop (1024px+) - Requirement 20.4
    {
      name: 'desktop-hd',
      use: {
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
      },
    },
    {
      name: 'desktop-fullhd',
      use: {
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
      },
    },
    
    // Foldable devices
    {
      name: 'folded-phone',
      use: {
        viewport: { width: 360, height: 640 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'unfolded-tablet',
      use: {
        viewport: { width: 820, height: 960 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    
    // Extreme viewports for edge case testing
    {
      name: 'narrow-mobile',
      use: {
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'ultrawide',
      use: {
        viewport: { width: 2560, height: 1080 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
      },
    },
  ],
});
