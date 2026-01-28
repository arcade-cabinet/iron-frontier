import type { Page } from '@playwright/test';

export async function waitForHarness(page: Page) {
  await page.waitForFunction(() => window.__IRON_FRONTIER_TEST__ !== undefined, { timeout: 90_000 });
}

export async function ensureTitleScreen(page: Page) {
  await waitForHarness(page);
  await page.evaluate(() => window.__IRON_FRONTIER_TEST__?.setPhase('title'));
}

export async function startNewGame(page: Page, name: string = 'Ada') {
  await page.goto('/?e2e=1');
  await ensureTitleScreen(page);
  const newGameButton = page.getByRole('button', { name: /begin adventure|new game/i });
  await newGameButton.waitFor();
  await newGameButton.click();
  await page.getByPlaceholder('Enter your name, stranger...').fill(name);
  await page.getByRole('button', { name: /^Start$/ }).click();
  await page.waitForFunction(() => window.__IRON_FRONTIER_TEST__ !== undefined);
  await page.locator('canvas').waitFor();
  await page.getByText('Loading Iron Frontier...').waitFor({ state: 'hidden', timeout: 60_000 });
}

export async function callHarness<T extends keyof NonNullable<typeof window.__IRON_FRONTIER_TEST__>>(
  page: Page,
  method: T,
  ...args: NonNullable<typeof window.__IRON_FRONTIER_TEST__>[T] extends (...p: infer P) => any ? P : never
) {
  await waitForHarness(page);
  await page.evaluate(
    ([methodName, methodArgs]) => {
      const harness = window.__IRON_FRONTIER_TEST__ as any;
      harness?.[methodName]?.(...(methodArgs as any[]));
    },
    [method, args]
  );
}
