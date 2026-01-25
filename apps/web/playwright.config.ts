import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests/e2e',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [['html', { open: 'never' }]],

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    timeout: 120000, // 120 seconds global timeout
    expect: {
        timeout: 30000, // 30s expect timeout
    },
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:8080',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',

        // Record video on failure
        video: 'retain-on-failure',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Action timeout
        actionTimeout: 30000,
        navigationTimeout: 60000,
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:8080',
        reuseExistingServer: true,
        timeout: 120 * 1000, // 2 minutes for initial build
    },
});
