import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  reporter: 'list',
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://localhost:8100',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm exec ng serve --host 127.0.0.1 --port 8100 --no-open',
    url: 'http://localhost:8100',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
