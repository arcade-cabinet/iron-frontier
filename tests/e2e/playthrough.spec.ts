import { test, expect } from '@playwright/test';
import { callHarness, startNewGame } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('main quest playthrough completes and appears in journal', async ({ page }) => {
  await startNewGame(page, 'Ada');
  await callHarness(page, 'startQuest', 'main_the_inheritance');

  await page.getByRole('button', { name: 'Quest Journal' }).click();
  const questLog = page.getByTestId('quest-log-panel');
  await expect(questLog.getByText('The Inheritance', { exact: true })).toBeVisible();
  await expect(
    questLog.getByText('Explore Dusty Springs and get your bearings', { exact: true })
  ).toBeVisible();

  await callHarness(page, 'updateObjective', 'main_the_inheritance', 'obj_explore_town', 1);
  await callHarness(page, 'updateObjective', 'main_the_inheritance', 'obj_find_address', 1);
  await expect(
    questLog.getByText('Search the burned building for clues', { exact: true })
  ).toBeVisible();

  await callHarness(page, 'updateObjective', 'main_the_inheritance', 'obj_search_ruins', 1);
  await callHarness(page, 'updateObjective', 'main_the_inheritance', 'obj_find_manifest', 1);
  await expect(
    questLog.getByText("Find Sheriff Cole at the Sheriff's Office", { exact: true })
  ).toBeVisible();

  await callHarness(page, 'updateObjective', 'main_the_inheritance', 'obj_find_sheriff', 1);
  await callHarness(page, 'updateObjective', 'main_the_inheritance', 'obj_talk_sheriff', 1);
  await expect(
    questLog.getByText("Travel to Freeminer's Hollow", { exact: true })
  ).toBeVisible();

  await callHarness(page, 'updateObjective', 'main_the_inheritance', 'obj_travel_hollow', 1);
  await callHarness(page, 'updateObjective', 'main_the_inheritance', 'obj_find_samuel', 1);

  await questLog.getByRole('button', { name: /Completed/i }).click();
  await expect(questLog.getByText('The Inheritance', { exact: true })).toBeVisible();
});

test('travel and survival HUD respond to state changes', async ({ page }) => {
  await startNewGame(page, 'Ada');

  await callHarness(page, 'setTime', 22, 30);
  await expect(page.getByText('10:30 PM')).toBeVisible();

  await callHarness(page, 'fastTravel', 'junction_city');
  await expect(page.getByText(/Iron Gulch/i)).toBeVisible();
  await expect(
    page.getByText(/Tired|Weary|Exhausted|Collapsed/i)
  ).toBeVisible();
});
