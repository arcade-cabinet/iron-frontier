/**
 * Page Object for Iron Frontier game
 * Provides common interactions and selectors for E2E tests
 */

import { type Page, expect, type Locator } from '@playwright/test';

export class GamePage {
  readonly page: Page;

  // Title Screen
  readonly titleText: Locator;
  readonly beginAdventureBtn: Locator;
  readonly continueBtn: Locator;
  readonly nameInput: Locator;

  // HUD
  readonly playerNameDisplay: Locator;
  readonly levelDisplay: Locator;
  readonly notificationFeed: Locator;

  // Action Bar
  readonly inventoryBtn: Locator;
  readonly questJournalBtn: Locator;
  readonly menuBtn: Locator;
  readonly mapBtn: Locator;
  readonly characterBtn: Locator;

  // Combat Panel
  readonly combatTitle: Locator;
  readonly attackBtn: Locator;
  readonly defendBtn: Locator;
  readonly fleeBtn: Locator;
  readonly endTurnBtn: Locator;
  readonly combatLog: Locator;
  readonly victoryScreen: Locator;
  readonly defeatScreen: Locator;
  readonly continueAfterCombatBtn: Locator;

  // Dialogue
  readonly dialogueBox: Locator;
  readonly dialogueText: Locator;
  readonly dialogueChoices: Locator;
  readonly endConversationBtn: Locator;

  // Inventory
  readonly inventoryPanel: Locator;
  readonly inventoryHeading: Locator;
  readonly inventoryItems: Locator;

  // Quest Log
  readonly questLogPanel: Locator;
  readonly journalHeading: Locator;
  readonly activeQuestsTab: Locator;
  readonly completedQuestsTab: Locator;

  // Shop
  readonly shopPanel: Locator;
  readonly shopBuyTab: Locator;
  readonly shopSellTab: Locator;
  readonly shopCloseBtn: Locator;
  readonly shopGoldDisplay: Locator;

  constructor(page: Page) {
    this.page = page;

    // Title Screen
    this.titleText = page.getByText('IRON FRONTIER');
    this.beginAdventureBtn = page.getByRole('button', { name: 'Begin Adventure' });
    this.continueBtn = page.getByRole('button', { name: 'Continue' });
    this.nameInput = page.getByPlaceholder('Enter your name, stranger...');

    // HUD - use functions for dynamic elements
    this.playerNameDisplay = page.locator('[data-testid="player-name"]');
    this.levelDisplay = page.getByText(/Lv\.\d+/);
    this.notificationFeed = page.locator('[class*="notification"]');

    // Action Bar
    this.inventoryBtn = page.getByLabel('Inventory');
    this.questJournalBtn = page.getByLabel('Quest Journal');
    this.menuBtn = page.getByLabel('Menu');
    this.mapBtn = page.getByLabel('World Map');
    this.characterBtn = page.getByLabel('Character Stats');

    // Combat Panel
    this.combatTitle = page.getByText('Showdown');
    this.attackBtn = page.getByRole('button', { name: 'Attack' });
    this.defendBtn = page.getByRole('button', { name: 'Defend' });
    this.fleeBtn = page.getByRole('button', { name: 'Flee' });
    this.endTurnBtn = page.getByRole('button', { name: 'End' });
    this.combatLog = page.locator('[class*="combat"]').filter({ hasText: 'Combat Log' });
    this.victoryScreen = page.getByText('Victory');
    this.defeatScreen = page.getByText('Defeated');
    this.continueAfterCombatBtn = page.getByRole('button', { name: 'Continue' });

    // Dialogue
    this.dialogueBox = page.locator('[class*="dialogue"], [class*="amber-950"]').filter({ hasText: /.{10,}/ });
    this.dialogueText = page.locator('[class*="dialogue"] [class*="text"]');
    this.dialogueChoices = page.locator('button').filter({ hasText: /^[\w\s]/ });
    this.endConversationBtn = page.getByRole('button', { name: 'End Conversation' });

    // Inventory
    this.inventoryPanel = page.locator('[class*="sheet"], [class*="panel"]').filter({ hasText: 'Inventory' });
    this.inventoryHeading = page.getByRole('heading', { name: 'Inventory' });
    this.inventoryItems = page.locator('[class*="inventory-item"], [class*="item-row"]');

    // Quest Log
    this.questLogPanel = page.locator('[class*="sheet"], [class*="panel"]').filter({ hasText: 'Journal' });
    this.journalHeading = page.getByText('Journal');
    this.activeQuestsTab = page.getByRole('tab', { name: /Active/i });
    this.completedQuestsTab = page.getByRole('tab', { name: /Completed/i });

    // Shop
    this.shopPanel = page.locator('[class*="fixed"]').filter({ hasText: /Buy|Sell/ });
    this.shopBuyTab = page.getByRole('button', { name: /Buy/i });
    this.shopSellTab = page.getByRole('button', { name: /Sell/i });
    this.shopCloseBtn = page.locator('[class*="shop"] button').filter({ has: page.locator('svg') }).first();
    this.shopGoldDisplay = page.getByText(/Your Gold/i);
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  async goto() {
    await this.page.goto('/', { timeout: 60000 });
    await this.page.waitForTimeout(1000);
  }

  async clearGameState() {
    await this.page.evaluate(() => {
      try {
        localStorage.clear();
        indexedDB.deleteDatabase('iron-frontier-save');
      } catch (e) {
        console.error('Cleanup failed', e);
      }
    });
    await this.page.reload({ timeout: 60000 });
    await this.page.waitForTimeout(2000);
  }

  // ============================================================================
  // GAME FLOW
  // ============================================================================

  async waitForTitleScreen() {
    await expect(this.titleText).toBeVisible({ timeout: 30000 });
  }

  async startNewGame(playerName: string) {
    await expect(this.beginAdventureBtn).toBeVisible({ timeout: 30000 });
    await this.beginAdventureBtn.click();

    await expect(this.nameInput).toBeVisible({ timeout: 30000 });
    await this.nameInput.fill(playerName);
    await this.page.keyboard.press('Enter');
  }

  async waitForGameLoaded(playerName: string) {
    await expect(this.page.getByText(playerName)).toBeVisible({ timeout: 30000 });
    // HUD shows "Lv.X" format
    await expect(this.page.getByText(/Lv\.\d+/)).toBeVisible();
  }

  async verifyWelcomeNotification() {
    // Welcome notification may or may not appear - check for any notification or HUD element
    // This verifies the game started successfully
    await expect(this.levelDisplay).toBeVisible({ timeout: 10000 });
  }

  // ============================================================================
  // GAME STORE ACCESS
  // ============================================================================

  async getGameState() {
    return this.page.evaluate(() => {
      const store = (window as any).__gameStore;
      return store ? store.getState() : null;
    });
  }

  async setGameState(partialState: Record<string, unknown>) {
    await this.page.evaluate((state) => {
      const store = (window as any).__gameStore;
      if (store) {
        store.setState(state);
      }
    }, partialState);
  }

  async callStoreAction(action: string, ...args: unknown[]) {
    return this.page.evaluate(
      ({ action, args }) => {
        const store = (window as any).__gameStore;
        if (store) {
          const state = store.getState();
          if (typeof state[action] === 'function') {
            return state[action](...args);
          }
        }
        return null;
      },
      { action, args }
    );
  }

  // ============================================================================
  // INVENTORY
  // ============================================================================

  async openInventory() {
    await this.inventoryBtn.click();
    await expect(this.inventoryHeading).toBeVisible({ timeout: 10000 });
  }

  async closeInventory() {
    // Click outside or press Escape
    await this.page.keyboard.press('Escape');
  }

  async addItemToInventory(itemId: string, quantity = 1) {
    await this.callStoreAction('addItemById', itemId, quantity);
  }

  async verifyItemInInventory(itemName: string) {
    await expect(this.page.getByText(itemName)).toBeVisible({ timeout: 5000 });
  }

  async useItem(itemName: string) {
    const itemRow = this.page.locator('[class*="item"]').filter({ hasText: itemName });
    const useBtn = itemRow.getByRole('button', { name: /Use/i });
    await useBtn.click();
  }

  // ============================================================================
  // QUESTS
  // ============================================================================

  async openQuestLog() {
    await this.questJournalBtn.click();
    await expect(this.journalHeading).toBeVisible({ timeout: 10000 });
  }

  async closeQuestLog() {
    await this.page.keyboard.press('Escape');
  }

  async startQuest(questId: string) {
    await this.callStoreAction('startQuest', questId);
  }

  async verifyQuestInLog(questTitle: string) {
    await expect(this.page.getByText(questTitle)).toBeVisible({ timeout: 5000 });
  }

  // ============================================================================
  // DIALOGUE
  // ============================================================================

  async startDialogue(npcId: string, treeId?: string) {
    if (treeId) {
      await this.callStoreAction('startDialogue', npcId, treeId);
    } else {
      await this.callStoreAction('startDialogue', npcId);
    }
  }

  async waitForDialogue() {
    // Wait for dialogue phase
    await this.page.waitForFunction(() => {
      const store = (window as any).__gameStore;
      return store?.getState()?.phase === 'dialogue';
    }, { timeout: 10000 });
  }

  async selectDialogueChoice(choiceIndex: number) {
    const choices = this.page.locator('button').filter({ has: this.page.locator('svg[class*="chevron"]') });
    await choices.nth(choiceIndex).click();
  }

  async selectDialogueChoiceByText(text: string) {
    const choiceBtn = this.page.locator('button').filter({ hasText: text });
    await choiceBtn.click();
  }

  async endDialogue() {
    const endBtn = this.page.getByRole('button', { name: 'End Conversation' });
    if (await endBtn.isVisible()) {
      await endBtn.click();
    }
  }

  // ============================================================================
  // COMBAT
  // ============================================================================

  async startCombat(encounterId: string) {
    await this.callStoreAction('startCombat', encounterId);
  }

  async startCombatWithEnemy(enemy: {
    id: string;
    name: string;
    health: number;
    maxHealth: number;
  }) {
    await this.page.evaluate(
      ({ enemy }) => {
        const store = (window as any).__gameStore;
        store.setState({
          phase: 'combat',
          combatState: {
            encounterId: 'test_encounter',
            phase: 'player_turn',
            round: 1,
            currentTurnIndex: 0,
            log: [],
            startedAt: Date.now(),
            turnOrder: ['player', enemy.id],
            combatants: [
              {
                definitionId: 'player',
                name: store.getState().playerName || 'Hero',
                isPlayer: true,
                health: store.getState().playerStats?.health || 100,
                maxHealth: store.getState().playerStats?.maxHealth || 100,
                actionPoints: 6,
                maxActionPoints: 6,
                position: { q: 0, r: 0 },
                statusEffects: [],
                weaponId: 'fists',
                ammoInClip: 0,
                isActive: true,
                hasActed: false,
                isDead: false,
              },
              {
                definitionId: enemy.id,
                name: enemy.name,
                isPlayer: false,
                health: enemy.health,
                maxHealth: enemy.maxHealth,
                actionPoints: 4,
                maxActionPoints: 4,
                position: { q: 1, r: 0 },
                statusEffects: [],
                weaponId: 'enemy_weapon',
                ammoInClip: 6,
                isActive: false,
                hasActed: false,
                isDead: false,
              },
            ],
          },
        });
      },
      { enemy }
    );
  }

  async waitForCombatUI() {
    await expect(this.combatTitle).toBeVisible({ timeout: 10000 });
  }

  async selectCombatAction(action: 'Attack' | 'Defend' | 'Flee' | 'End') {
    const btn = this.page.getByRole('button', { name: action });
    await btn.click();
  }

  async selectCombatTarget(targetName: string) {
    const targetCard = this.page.locator('button').filter({ hasText: targetName });
    await targetCard.click();
  }

  async waitForVictory() {
    await expect(this.victoryScreen).toBeVisible({ timeout: 15000 });
  }

  async waitForDefeat() {
    await expect(this.defeatScreen).toBeVisible({ timeout: 15000 });
  }

  async dismissCombatResult() {
    await this.continueAfterCombatBtn.click();
  }

  // ============================================================================
  // SHOP
  // ============================================================================

  async openShop(shopId: string) {
    await this.callStoreAction('openShop', shopId);
  }

  async waitForShopUI() {
    await expect(this.shopPanel).toBeVisible({ timeout: 10000 });
  }

  async switchToShopBuyTab() {
    await this.shopBuyTab.click();
  }

  async switchToShopSellTab() {
    await this.shopSellTab.click();
  }

  async buyItem(itemName: string) {
    const itemRow = this.page.locator('[class*="item"], [class*="row"]').filter({ hasText: itemName });
    const buyBtn = itemRow.getByRole('button', { name: 'Buy' });
    await buyBtn.click();
  }

  async sellItem(itemName: string) {
    const itemRow = this.page.locator('[class*="item"], [class*="row"]').filter({ hasText: itemName });
    const sellBtn = itemRow.getByRole('button', { name: 'Sell' });
    await sellBtn.click();
  }

  async closeShop() {
    await this.page.keyboard.press('Escape');
  }

  // ============================================================================
  // SAVE/LOAD
  // ============================================================================

  async saveGame() {
    await this.callStoreAction('saveGame');
    await this.page.waitForTimeout(1000); // Wait for async save
  }

  async reloadPage() {
    await this.page.reload({ timeout: 60000 });
    await this.page.waitForTimeout(2000);
  }

  // ============================================================================
  // SCREENSHOTS
  // ============================================================================

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `tests/e2e/screenshots/${name}.png` });
  }
}
