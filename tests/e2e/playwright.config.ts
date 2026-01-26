import { defineConfig, devices } from '@playwright/test';

/**
 * Iron Frontier - Playwright E2E Test Configuration
 * Tests the Unity WebGL build in browser environments
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './specs',

  // Run tests sequentially for game state consistency
  fullyParallel: false,
  workers: 1,

  // Fail fast in CI, allow local debugging
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],

  // Shared settings for all projects
  use: {
    baseURL: process.env.WEBGL_URL || 'http://localhost:8080',

    // Capture trace, screenshot, and video on failure
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Longer timeouts for Unity WebGL loading
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },

  // Global timeout for each test
  timeout: 180000, // 3 minutes per test for game loading and interactions

  // Test output directory
  outputDir: 'test-results',

  // Browser projects
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: [
            '--enable-webgl',
            '--enable-webgl2',
            '--ignore-gpu-blocklist',
            '--disable-gpu-vsync',
            '--use-gl=angle',
            '--use-angle=swiftshader',
          ],
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          firefoxUserPrefs: {
            'webgl.force-enabled': true,
            'webgl.disabled': false,
            'webgl.enable-webgl2': true,
          },
        },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile viewports for responsive testing
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        launchOptions: {
          args: ['--enable-webgl', '--enable-webgl2'],
        },
      },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro 11'] },
    },
  ],

  // Start local server for WebGL build
  webServer: {
    command: 'npx serve ../../Builds/WebGL -l 8080 -s --no-clipboard',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes to start server
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // Expect settings
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },
});
