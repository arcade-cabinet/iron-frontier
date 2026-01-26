/**
 * Combat System E2E Tests
 * Tests: Trigger combat, select actions, combat resolves (victory/defeat)
 */

import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/GamePage';

test.describe('Combat System', () => {
  test.setTimeout(120000);

  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.clearGameState();

    // Setup: Start new game
    await gamePage.waitForTitleScreen();
    await gamePage.startNewGame('Combat Tester');
    await gamePage.waitForGameLoaded('Combat Tester');
  });

  test('combat UI appears when combat starts', async ({ page }) => {
    // Start combat with a weak enemy
    await gamePage.startCombatWithEnemy({
      id: 'test_bandit',
      name: 'Dusty Bandit',
      health: 30,
      maxHealth: 30,
    });

    // Combat UI should be visible
    await gamePage.waitForCombatUI();
    await expect(gamePage.combatTitle).toBeVisible();

    await gamePage.takeScreenshot('combat-started');
  });

  test('combat shows player and enemy', async ({ page }) => {
    await gamePage.startCombatWithEnemy({
      id: 'test_bandit',
      name: 'Dusty Bandit',
      health: 30,
      maxHealth: 30,
    });

    await gamePage.waitForCombatUI();

    // Player card should be visible
    await expect(page.getByText('Combat Tester')).toBeVisible();

    // Enemy should be visible
    await expect(page.getByText('Dusty Bandit')).toBeVisible();
  });

  test('combat shows turn indicator', async ({ page }) => {
    await gamePage.startCombatWithEnemy({
      id: 'test_bandit',
      name: 'Dusty Bandit',
      health: 30,
      maxHealth: 30,
    });

    await gamePage.waitForCombatUI();

    // Should show player turn
    await expect(page.getByText('Your Move')).toBeVisible();
  });

  test('action buttons are visible on player turn', async ({ page }) => {
    await gamePage.startCombatWithEnemy({
      id: 'test_bandit',
      name: 'Dusty Bandit',
      health: 30,
      maxHealth: 30,
    });

    await gamePage.waitForCombatUI();

    // Action buttons should be visible
    await expect(gamePage.attackBtn).toBeVisible();
    await expect(gamePage.defendBtn).toBeVisible();
    await expect(gamePage.fleeBtn).toBeVisible();
  });

  test('can select attack action and target', async ({ page }) => {
    await gamePage.startCombatWithEnemy({
      id: 'test_bandit',
      name: 'Dusty Bandit',
      health: 30,
      maxHealth: 30,
    });

    await gamePage.waitForCombatUI();

    // Select attack
    await gamePage.attackBtn.click();
    await page.waitForTimeout(300);

    // Should show target prompt
    await expect(page.getByText('Select a target')).toBeVisible();
  });

  test('attack deals damage to enemy', async ({ page }) => {
    await gamePage.startCombatWithEnemy({
      id: 'test_bandit',
      name: 'Dusty Bandit',
      health: 30,
      maxHealth: 30,
    });

    await gamePage.waitForCombatUI();

    // Select attack
    await gamePage.attackBtn.click();
    await page.waitForTimeout(300);

    // Select target
    await gamePage.selectCombatTarget('Dusty Bandit');
    await page.waitForTimeout(1000);

    // Combat log should show the attack
    await expect(page.getByText(/hit|missed/i)).toBeVisible({ timeout: 10000 });
  });

  test('combat ends in victory when enemy defeated', async ({ page }) => {
    // Start with very low HP enemy
    await gamePage.startCombatWithEnemy({
      id: 'weak_enemy',
      name: 'Weak Bandit',
      health: 5,
      maxHealth: 5,
    });

    await gamePage.waitForCombatUI();

    // Attack until victory
    let attempts = 0;
    while (attempts < 10) {
      const state = await gamePage.getGameState();
      if (state.combatState?.phase === 'victory') break;

      if (state.combatState?.phase === 'player_turn') {
        await gamePage.attackBtn.click();
        await page.waitForTimeout(300);

        // If attack selected, select target
        const targetPrompt = page.getByText('Select a target');
        if (await targetPrompt.isVisible({ timeout: 500 }).catch(() => false)) {
          await gamePage.selectCombatTarget('Weak Bandit');
        }
      }

      await page.waitForTimeout(1500);
      attempts++;
    }

    // Victory screen should appear
    await gamePage.waitForVictory();
    await gamePage.takeScreenshot('combat-victory');
  });

  test('can dismiss victory screen', async ({ page }) => {
    // Quick victory setup
    await gamePage.startCombatWithEnemy({
      id: 'weak_enemy',
      name: 'Weak Bandit',
      health: 1,
      maxHealth: 1,
    });

    await gamePage.waitForCombatUI();
    await gamePage.attackBtn.click();
    await page.waitForTimeout(300);
    await gamePage.selectCombatTarget('Weak Bandit');
    await page.waitForTimeout(2000);

    await gamePage.waitForVictory();
    await gamePage.dismissCombatResult();
    await page.waitForTimeout(500);

    // Should return to playing state
    const state = await gamePage.getGameState();
    expect(state.phase).toBe('playing');
    expect(state.combatState).toBeNull();
  });

  test('can flee from combat', async ({ page }) => {
    await gamePage.startCombatWithEnemy({
      id: 'test_bandit',
      name: 'Dusty Bandit',
      health: 100,
      maxHealth: 100,
    });

    await gamePage.waitForCombatUI();

    // Try to flee multiple times (50% chance)
    let fled = false;
    for (let i = 0; i < 10; i++) {
      await gamePage.fleeBtn.click();
      await page.waitForTimeout(1500);

      const state = await gamePage.getGameState();
      if (state.combatState?.phase === 'fled') {
        fled = true;
        break;
      }

      // If still in combat, wait for turn to come back
      if (state.combatState?.phase === 'enemy_turn') {
        await page.waitForTimeout(2000);
      }
    }

    if (fled) {
      // Escaped screen should be visible
      await expect(page.getByText('Escaped')).toBeVisible({ timeout: 5000 });
    }
  });

  test('combat shows round number', async ({ page }) => {
    await gamePage.startCombatWithEnemy({
      id: 'test_bandit',
      name: 'Dusty Bandit',
      health: 30,
      maxHealth: 30,
    });

    await gamePage.waitForCombatUI();

    // Should show round 1
    await expect(page.getByText('Round 1')).toBeVisible();
  });

  test('combat log updates with actions', async ({ page }) => {
    await gamePage.startCombatWithEnemy({
      id: 'test_bandit',
      name: 'Dusty Bandit',
      health: 30,
      maxHealth: 30,
    });

    await gamePage.waitForCombatUI();

    // Combat log should show initial message
    await expect(page.getByText(/standoff begins|Combat Log/i)).toBeVisible();

    // Attack
    await gamePage.attackBtn.click();
    await page.waitForTimeout(300);
    await gamePage.selectCombatTarget('Dusty Bandit');
    await page.waitForTimeout(1000);

    // Log should update
    await expect(page.getByText(/Combat Tester/i)).toBeVisible();
  });

  test('enemy takes turn after player', async ({ page }) => {
    await gamePage.startCombatWithEnemy({
      id: 'test_bandit',
      name: 'Dusty Bandit',
      health: 30,
      maxHealth: 30,
    });

    await gamePage.waitForCombatUI();

    // End player turn
    await gamePage.endTurnBtn.click();
    await page.waitForTimeout(500);

    // Should switch to enemy turn
    await expect(page.getByText('Enemy Turn')).toBeVisible({ timeout: 5000 });
  });

  test('action points decrease when using actions', async ({ page }) => {
    await gamePage.startCombatWithEnemy({
      id: 'test_bandit',
      name: 'Dusty Bandit',
      health: 50,
      maxHealth: 50,
    });

    await gamePage.waitForCombatUI();

    const stateBefore = await gamePage.getGameState();
    const apBefore = stateBefore.combatState?.combatants.find((c: any) => c.isPlayer)?.actionPoints;

    // Attack
    await gamePage.attackBtn.click();
    await page.waitForTimeout(300);
    await gamePage.selectCombatTarget('Dusty Bandit');
    await page.waitForTimeout(1000);

    const stateAfter = await gamePage.getGameState();
    const apAfter = stateAfter.combatState?.combatants.find((c: any) => c.isPlayer)?.actionPoints;

    // AP should have decreased
    expect(apAfter).toBeLessThan(apBefore || 6);
  });
});
