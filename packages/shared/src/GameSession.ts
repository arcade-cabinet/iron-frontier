/**
 * GameSession.ts - Main game orchestrator for Iron Frontier v2
 *
 * This is the central coordination point that:
 * - Manages all game controllers
 * - Connects quest triggers to dialogue outcomes
 * - Handles game flow (start -> play -> save -> load)
 * - Provides the complete game API for UI consumption
 */

import {
  QuestController,
  createQuestController,
  type QuestControllerDataAccess,
  type QuestEvent,
  type QuestRewards,
  type ActiveQuest,
} from './controllers/QuestController';

import {
  DialogueController,
  getDialogueController,
  type DialogueControllerDataAccess,
  type DialogueEvent,
  type DialogueAction,
  type DialogueNode,
  type DialogueCondition,
  type DialogueNPC,
} from './controllers/DialogueController';

import {
  InventoryController,
  createInventoryController,
  type InventoryControllerDataAccess,
  type InventoryEvent,
  type ItemEffect,
} from './controllers/InventoryController';

import {
  ShopController,
  createShopController,
  type ShopControllerDataAccess,
  type ShopEvent,
} from './controllers/ShopController';

import {
  CombatController,
  getCombatController,
  type CombatControllerDataAccess,
  type CombatEvent,
  type CombatRewards,
} from './controllers/CombatController';

import { GameClock, createGameClock, type TimePhase } from './systems/time';
import { FatigueSystem, createFatigueSystem } from './systems/fatigue';
import { ProvisionsSystem, createProvisionsSystem } from './systems/provisions';

// ============================================================================
// TYPES
// ============================================================================

export type GameSessionMode =
  | 'title'
  | 'loading'
  | 'overworld'
  | 'town'
  | 'dialogue'
  | 'combat'
  | 'shop'
  | 'menu'
  | 'camp'
  | 'game_over';

export interface PlayerState {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  reputation: Record<string, number>; // factionId -> reputation value
}

export interface WorldState {
  currentTownId: string | null;
  currentRouteId: string | null;
  overworldPosition: { x: number; z: number };
  discoveredTowns: string[];
  unlockedTowns: string[];
}

export interface GameSessionState {
  mode: GameSessionMode;
  player: PlayerState;
  world: WorldState;
  gameHour: number;
  gameDay: number;
  totalPlayTimeMs: number;
}

export type GameSessionEvent =
  | { type: 'mode_changed'; from: GameSessionMode; to: GameSessionMode }
  | { type: 'quest_started'; questId: string; questName: string }
  | { type: 'quest_completed'; questId: string; questName: string; rewards: QuestRewards }
  | { type: 'objective_updated'; questId: string; objectiveId: string; progress: number; total: number }
  | { type: 'level_up'; newLevel: number }
  | { type: 'gold_changed'; amount: number; newTotal: number }
  | { type: 'reputation_changed'; factionId: string; change: number; newValue: number }
  | { type: 'town_discovered'; townId: string }
  | { type: 'town_unlocked'; townId: string }
  | { type: 'time_changed'; hour: number; day: number; phase: TimePhase }
  | { type: 'combat_victory'; rewards: CombatRewards }
  | { type: 'combat_defeat' }
  | { type: 'notification'; message: string; severity: 'info' | 'warning' | 'success' | 'error' };

type GameSessionEventListener = (event: GameSessionEvent) => void;

// ============================================================================
// DATA ACCESS ADAPTERS
// ============================================================================

export interface GameDataAccess {
  // Quest data
  getQuestDefinition: (questId: string) => any;
  checkQuestPrerequisites: (questId: string, completedQuests: string[], flags: Record<string, boolean>) => boolean;

  // NPC/Dialogue data
  getNPCById: (npcId: string) => any;
  getDialogueTree: (treeId: string) => any;

  // Item data
  getItemDefinition: (itemId: string) => any;
  getEquipmentStats: (itemId: string) => { attack?: number; defense?: number; speed?: number } | undefined;

  // Shop data
  getShopById: (shopId: string) => any;
  getShopInventory: (shopId: string) => Array<{ itemId: string; stock: number }>;

  // Combat data
  getEncounterById: (encounterId: string) => any;
  getEnemyById: (enemyId: string) => any;

  // World data
  getTownById: (townId: string) => any;
  getRouteById: (routeId: string) => any;
}

// ============================================================================
// GAME SESSION
// ============================================================================

export class GameSession {
  // Controllers
  public quest: QuestController;
  public dialogue: DialogueController;
  public inventory: InventoryController;
  public shop: ShopController;
  public combat: CombatController;

  // Systems
  public clock: GameClock;
  public fatigue: FatigueSystem;
  public provisions: ProvisionsSystem;

  // State
  private state: GameSessionState;
  private questFlags: Record<string, boolean> = {};
  private eventListeners: Set<GameSessionEventListener> = new Set();
  private dataAccess: GameDataAccess;

  constructor(dataAccess: GameDataAccess) {
    this.dataAccess = dataAccess;

    // Initialize state
    this.state = this.getInitialState();

    // Create controllers with data access adapters
    this.quest = createQuestController(this.createQuestDataAccess());
    this.dialogue = getDialogueController(this.createDialogueDataAccess());
    this.inventory = createInventoryController(this.createInventoryDataAccess());
    this.shop = createShopController(this.createShopDataAccess());
    this.combat = getCombatController(this.createCombatDataAccess());

    // Create systems
    this.clock = createGameClock();
    this.fatigue = createFatigueSystem();
    this.provisions = createProvisionsSystem();

    // Wire up event handlers
    this.setupEventHandlers();

    console.log('[GameSession] Initialized');
  }

  // ==========================================================================
  // PUBLIC API - Game Flow
  // ==========================================================================

  /**
   * Start a new game
   */
  public startNewGame(playerName: string): void {
    this.state = this.getInitialState();
    this.state.player.name = playerName;
    this.state.mode = 'overworld';

    // Start at Frontier's Edge
    this.state.world.currentTownId = 'frontiers_edge';
    this.state.world.discoveredTowns = ['frontiers_edge'];
    this.state.world.unlockedTowns = ['frontiers_edge'];

    // Start the clock
    this.clock.start();

    // Start tutorial quest
    this.quest.startQuest('mq1_stranger_arrives');

    this.emitEvent({ type: 'mode_changed', from: 'title', to: 'overworld' });
    console.log('[GameSession] New game started for', playerName);
  }

  /**
   * Get current game state
   */
  public getState(): GameSessionState {
    return {
      ...this.state,
      gameHour: this.clock.getState().hour,
      gameDay: this.clock.getState().day,
    };
  }

  /**
   * Get current mode
   */
  public getMode(): GameSessionMode {
    return this.state.mode;
  }

  // ==========================================================================
  // PUBLIC API - Location
  // ==========================================================================

  /**
   * Enter a town
   */
  public enterTown(townId: string): boolean {
    const town = this.dataAccess.getTownById(townId);
    if (!town) {
      console.warn(`[GameSession] Town not found: ${townId}`);
      return false;
    }

    // Check if town is unlocked
    if (!this.state.world.unlockedTowns.includes(townId)) {
      this.emitEvent({
        type: 'notification',
        message: `${town.name} is not yet accessible`,
        severity: 'warning',
      });
      return false;
    }

    const previousMode = this.state.mode;
    this.state.mode = 'town';
    this.state.world.currentTownId = townId;

    // Mark as discovered if first visit
    if (!this.state.world.discoveredTowns.includes(townId)) {
      this.state.world.discoveredTowns.push(townId);
      this.emitEvent({ type: 'town_discovered', townId });
    }

    // Update quest objectives for visiting this town
    this.quest.updateObjective('visit', townId);

    this.emitEvent({ type: 'mode_changed', from: previousMode, to: 'town' });
    console.log(`[GameSession] Entered town: ${town.name}`);
    return true;
  }

  /**
   * Exit current town to overworld
   */
  public exitTown(): void {
    const previousMode = this.state.mode;
    this.state.mode = 'overworld';
    this.state.world.currentTownId = null;

    this.emitEvent({ type: 'mode_changed', from: previousMode, to: 'overworld' });
  }

  /**
   * Start traveling on a route
   */
  public startRoute(routeId: string): boolean {
    const route = this.dataAccess.getRouteById(routeId);
    if (!route) {
      console.warn(`[GameSession] Route not found: ${routeId}`);
      return false;
    }

    this.state.world.currentRouteId = routeId;
    return true;
  }

  // ==========================================================================
  // PUBLIC API - NPC Interaction
  // ==========================================================================

  /**
   * Talk to an NPC
   */
  public async talkToNPC(npcId: string): Promise<boolean> {
    const npc = this.dataAccess.getNPCById(npcId);
    if (!npc) {
      console.warn(`[GameSession] NPC not found: ${npcId}`);
      return false;
    }

    // Start dialogue
    const success = await this.dialogue.startDialogue(npcId);
    if (success) {
      const previousMode = this.state.mode;
      this.state.mode = 'dialogue';
      this.emitEvent({ type: 'mode_changed', from: previousMode, to: 'dialogue' });

      // Update quest objectives for talking to this NPC
      this.quest.updateObjective('talk', npcId);
    }

    return success;
  }

  /**
   * Select a dialogue choice
   */
  public async selectDialogueChoice(choiceIndex: number): Promise<boolean> {
    return this.dialogue.selectChoice(choiceIndex);
  }

  /**
   * Advance dialogue (for non-choice nodes)
   */
  public async advanceDialogue(): Promise<boolean> {
    return this.dialogue.advance();
  }

  // ==========================================================================
  // PUBLIC API - Shop
  // ==========================================================================

  /**
   * Open a shop
   */
  public openShop(shopId: string): boolean {
    const success = this.shop.openShop(shopId);
    if (success) {
      const previousMode = this.state.mode;
      this.state.mode = 'shop';
      this.emitEvent({ type: 'mode_changed', from: previousMode, to: 'shop' });
    }
    return success;
  }

  /**
   * Close shop
   */
  public closeShop(): void {
    this.shop.closeShop();
    const previousMode = this.state.mode;
    this.state.mode = 'town';
    this.emitEvent({ type: 'mode_changed', from: previousMode, to: 'town' });
  }

  /**
   * Buy item from shop
   */
  public buyItem(itemId: string, quantity: number = 1): boolean {
    const result = this.shop.buyItem(itemId, quantity);
    return result.success;
  }

  /**
   * Sell item to shop
   */
  public sellItem(itemId: string, quantity: number = 1): boolean {
    const result = this.shop.sellItem(itemId, quantity);
    return result.success;
  }

  // ==========================================================================
  // PUBLIC API - Combat
  // ==========================================================================

  /**
   * Start combat encounter
   */
  public async startCombat(encounterId: string): Promise<boolean> {
    const encounter = this.dataAccess.getEncounterById(encounterId);
    if (!encounter) {
      console.warn(`[GameSession] Encounter not found: ${encounterId}`);
      return false;
    }

    const previousMode = this.state.mode;

    // Get player combat stats
    const player = this.state.player;
    const playerStats = {
      hp: player.hp,
      maxHP: player.maxHp,
      attack: player.attack,
      defense: player.defense,
      speed: player.speed,
      accuracy: 85,
      evasion: 10,
      critChance: 5,
      critMultiplier: 1.5,
    };

    const success = await this.combat.startCombat(
      {
        encounterId,
        zoneId: this.state.world.currentRouteId ?? 'unknown',
        terrain: 'plains',
        timeOfDay: this.clock.getPhase(),
      },
      playerStats,
      player.name,
      null
    );

    if (success) {
      this.state.mode = 'combat';
      this.emitEvent({ type: 'mode_changed', from: previousMode, to: 'combat' });
    }

    return success;
  }

  // ==========================================================================
  // PUBLIC API - Quests
  // ==========================================================================

  /**
   * Get active quests
   */
  public getActiveQuests(): ActiveQuest[] {
    return this.quest.getActiveQuests();
  }

  /**
   * Get tracked quest (for HUD display)
   */
  public getTrackedQuest(): ActiveQuest | null {
    return this.quest.getTrackedQuest();
  }

  /**
   * Set tracked quest
   */
  public setTrackedQuest(questId: string | null): void {
    this.quest.setTrackedQuest(questId);
  }

  // ==========================================================================
  // PUBLIC API - Player Stats
  // ==========================================================================

  /**
   * Add XP and handle level up
   */
  public addXP(amount: number): void {
    const player = this.state.player;
    player.xp += amount;

    while (player.xp >= player.xpToNextLevel) {
      player.xp -= player.xpToNextLevel;
      player.level++;
      player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);

      // Stat increases on level up
      player.maxHp += 10;
      player.hp = player.maxHp; // Full heal on level up
      player.attack += 2;
      player.defense += 1;

      this.emitEvent({ type: 'level_up', newLevel: player.level });
    }
  }

  /**
   * Add gold
   */
  public addGold(amount: number): void {
    this.state.player.gold += amount;
    this.emitEvent({
      type: 'gold_changed',
      amount,
      newTotal: this.state.player.gold,
    });
  }

  /**
   * Modify reputation with a faction
   */
  public modifyReputation(factionId: string, change: number): void {
    const current = this.state.player.reputation[factionId] ?? 50;
    const newValue = Math.max(0, Math.min(100, current + change));
    this.state.player.reputation[factionId] = newValue;

    this.emitEvent({
      type: 'reputation_changed',
      factionId,
      change,
      newValue,
    });
  }

  // ==========================================================================
  // PUBLIC API - Events
  // ==========================================================================

  /**
   * Subscribe to game events
   */
  public onEvent(listener: GameSessionEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  // ==========================================================================
  // PUBLIC API - Save/Load
  // ==========================================================================

  /**
   * Get save data
   */
  public getSaveData(): any {
    return {
      version: 1,
      timestamp: Date.now(),
      state: this.state,
      questFlags: this.questFlags,
      clock: this.clock.getState(),
      fatigue: this.fatigue.getState(),
      provisions: this.provisions.getState(),
      quest: this.quest.getSaveData(),
      inventory: this.inventory.getSaveData(),
    };
  }

  /**
   * Load save data
   */
  public loadSaveData(data: any): void {
    this.state = data.state;
    this.questFlags = data.questFlags;
    this.clock.loadState(data.clock);
    this.fatigue.loadState(data.fatigue);
    this.provisions.loadState(data.provisions);
    this.quest.loadFromSave(data.quest);
    this.inventory.loadFromSave(data.inventory);

    console.log('[GameSession] Loaded save data');
  }

  // ==========================================================================
  // PRIVATE - Initial State
  // ==========================================================================

  private getInitialState(): GameSessionState {
    return {
      mode: 'title',
      player: {
        name: 'Stranger',
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        gold: 50,
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 5,
        speed: 10,
        reputation: {
          law: 50,
          outlaws: 50,
          miners: 50,
          ranchers: 50,
          townsfolk: 50,
          church: 50,
        },
      },
      world: {
        currentTownId: null,
        currentRouteId: null,
        overworldPosition: { x: 0, z: 0 },
        discoveredTowns: [],
        unlockedTowns: [],
      },
      gameHour: 8, // Start at 8 AM
      gameDay: 1,
      totalPlayTimeMs: 0,
    };
  }

  // ==========================================================================
  // PRIVATE - Data Access Adapters
  // ==========================================================================

  private createQuestDataAccess(): QuestControllerDataAccess {
    return {
      getQuestDefinition: (questId) => this.dataAccess.getQuestDefinition(questId),
      checkPrerequisites: (questId) =>
        this.dataAccess.checkQuestPrerequisites(
          questId,
          this.quest.getState().completedQuests,
          this.questFlags
        ),
      grantRewards: (rewards) => {
        if (rewards.xp) this.addXP(rewards.xp);
        if (rewards.gold) this.addGold(rewards.gold);
        for (const item of rewards.items) {
          this.inventory.addItem(item.itemId, item.quantity);
        }
        if (rewards.reputation) {
          for (const rep of rewards.reputation) {
            this.modifyReputation(rep.factionId, rep.change);
          }
        }
      },
      setQuestFlag: (flag, value) => {
        this.questFlags[flag] = value;
      },
    };
  }

  private createDialogueDataAccess(): DialogueControllerDataAccess {
    return {
      getDialogueTree: (npcId: string): Map<string, DialogueNode> | undefined => {
        const tree = this.dataAccess.getDialogueTree(npcId);
        if (!tree) return undefined;
        // Convert raw dialogue tree to Map format if needed
        if (tree instanceof Map) return tree;
        // If it's an object/array, convert to Map
        const nodeMap = new Map<string, DialogueNode>();
        if (Array.isArray(tree)) {
          for (const node of tree) {
            nodeMap.set(node.id, node);
          }
        } else if (typeof tree === 'object') {
          for (const [id, node] of Object.entries(tree)) {
            nodeMap.set(id, node as DialogueNode);
          }
        }
        return nodeMap;
      },
      getEntryNodeId: (npcId: string): string | undefined => {
        const npc = this.dataAccess.getNPCById(npcId);
        return npc?.entryNodeId ?? 'start';
      },
      checkCondition: (condition: DialogueCondition): boolean => {
        return this.checkDialogueCondition(condition);
      },
      executeAction: async (action: DialogueAction): Promise<void> => {
        await this.executeDialogueAction(action);
      },
      getNPCInfo: (npcId: string): DialogueNPC | undefined => {
        const npc = this.dataAccess.getNPCById(npcId);
        if (!npc) return undefined;
        return {
          id: npc.id,
          name: npc.name,
          title: npc.title,
          portraitId: npc.portraitId,
        };
      },
    };
  }

  private createInventoryDataAccess(): InventoryControllerDataAccess {
    return {
      getItemDefinition: (itemId) => this.dataAccess.getItemDefinition(itemId),
      applyItemEffects: (effects) => this.applyItemEffects(effects),
      getEquipmentStats: (itemId) => this.dataAccess.getEquipmentStats(itemId),
    };
  }

  private createShopDataAccess(): ShopControllerDataAccess {
    return {
      getShopById: (shopId) => this.dataAccess.getShopById(shopId),
      getShopInventory: (shopId) => this.dataAccess.getShopInventory(shopId),
      getItemInfo: (itemId) => {
        const def = this.dataAccess.getItemDefinition(itemId);
        if (!def) return undefined;
        return {
          name: def.name,
          description: def.description,
          baseValue: def.value,
          category: def.category,
        };
      },
      getPlayerGold: () => this.state.player.gold,
      getPlayerItemCount: (itemId) => this.inventory.getItemCount(itemId),
      getPlayerReputation: (shopId) => {
        const shop = this.dataAccess.getShopById(shopId);
        if (!shop) return 50;
        // Use town's faction reputation
        return this.state.player.reputation.townsfolk ?? 50;
      },
      addPlayerGold: (amount) => this.addGold(amount),
      removePlayerGold: (amount) => {
        if (this.state.player.gold >= amount) {
          this.state.player.gold -= amount;
          return true;
        }
        return false;
      },
      addPlayerItem: (itemId, quantity) => this.inventory.addItem(itemId, quantity),
      removePlayerItem: (itemId, quantity) => this.inventory.removeItem(itemId, quantity),
      updateShopStock: () => {
        // Shop stock updates could be handled here
      },
    };
  }

  private createCombatDataAccess(): CombatControllerDataAccess {
    return {
      getEncounterById: (id) => this.dataAccess.getEncounterById(id),
      getEnemyById: (id) => this.dataAccess.getEnemyById(id),
    };
  }

  // ==========================================================================
  // PRIVATE - Event Handlers
  // ==========================================================================

  private setupEventHandlers(): void {
    // Quest events
    this.quest.onEvent((event) => this.handleQuestEvent(event));

    // Dialogue events
    this.dialogue.onEvent((event) => this.handleDialogueEvent(event));

    // Combat events
    this.combat.onEvent((event) => this.handleCombatEvent(event));

    // Shop events
    this.shop.onEvent((event) => this.handleShopEvent(event));

    // Inventory events
    this.inventory.onEvent((event) => this.handleInventoryEvent(event));

    // Time events
    this.clock.on('phaseChanged', (payload) => {
      this.emitEvent({
        type: 'time_changed',
        hour: payload.hour,
        day: this.clock.getState().day,
        phase: payload.phase,
      });
    });
  }

  private handleQuestEvent(event: QuestEvent): void {
    switch (event.type) {
      case 'quest_started':
        this.emitEvent({
          type: 'quest_started',
          questId: event.questId,
          questName: event.name,
        });
        break;

      case 'quest_complete':
        this.emitEvent({
          type: 'quest_completed',
          questId: event.questId,
          questName: event.name,
          rewards: event.rewards,
        });
        break;

      case 'quest_updated':
        this.emitEvent({
          type: 'objective_updated',
          questId: event.questId,
          objectiveId: event.objectiveId,
          progress: event.progress,
          total: event.total,
        });
        break;
    }
  }

  private handleDialogueEvent(event: DialogueEvent): void {
    if (event.type === 'dialogue_end') {
      // Return to previous mode
      const previousMode = this.state.mode;
      this.state.mode = this.state.world.currentTownId ? 'town' : 'overworld';
      this.emitEvent({ type: 'mode_changed', from: previousMode, to: this.state.mode });
    }
  }

  private handleCombatEvent(event: CombatEvent): void {
    if (event.type === 'combat_end') {
      const previousMode = this.state.mode;

      if (event.outcome === 'victory' && event.rewards) {
        this.emitEvent({ type: 'combat_victory', rewards: event.rewards });
      } else if (event.outcome === 'defeat') {
        this.emitEvent({ type: 'combat_defeat' });
        this.state.mode = 'game_over';
        this.emitEvent({ type: 'mode_changed', from: previousMode, to: 'game_over' });
        return;
      }

      // Return to previous mode
      this.state.mode = this.state.world.currentRouteId ? 'overworld' : 'town';
      this.emitEvent({ type: 'mode_changed', from: previousMode, to: this.state.mode });
    }
  }

  private handleShopEvent(event: ShopEvent): void {
    // Could track shop transactions for achievements, etc.
  }

  private handleInventoryEvent(event: InventoryEvent): void {
    // Could track item pickups for quests
    if (event.type === 'item_added') {
      this.quest.updateObjective('collect', event.itemId, event.quantity);
    }
  }

  // ==========================================================================
  // PRIVATE - Dialogue Helpers
  // ==========================================================================

  private checkDialogueCondition(condition: DialogueCondition): boolean {
    switch (condition.type) {
      case 'quest_flag':
        if (!condition.flag) return true;
        return this.questFlags[condition.flag] === true;
      case 'has_item':
        if (!condition.itemId) return true;
        return this.inventory.hasItem(condition.itemId, condition.amount ?? 1);
      case 'has_gold':
        const goldNeeded = condition.amount ?? 0;
        return this.state.player.gold >= goldNeeded;
      case 'reputation':
        // Uses flag field for faction ID
        const factionId = condition.flag ?? 'townsfolk';
        const repValue = this.state.player.reputation[factionId] ?? 50;
        const targetValue = condition.amount ?? 50;
        switch (condition.comparison) {
          case 'gte':
            return repValue >= targetValue;
          case 'lte':
            return repValue <= targetValue;
          case 'eq':
            return repValue === targetValue;
          default:
            return repValue >= targetValue;
        }
      case 'stat':
        // Could check player stats here
        return true;
      default:
        return true;
    }
  }

  private async executeDialogueAction(action: DialogueAction): Promise<void> {
    switch (action.type) {
      case 'start_quest':
        if (action.questId) {
          this.quest.startQuest(action.questId);
        }
        break;
      case 'advance_quest':
        // Update quest objective based on dialogue
        if (action.questId) {
          this.quest.updateObjective('talk', action.questId);
        }
        break;
      case 'give_item':
        if (action.itemId) {
          this.inventory.addItem(action.itemId, action.quantity ?? 1);
        }
        break;
      case 'take_item':
        if (action.itemId) {
          this.inventory.removeItem(action.itemId, action.quantity ?? 1);
        }
        break;
      case 'give_gold':
        if (action.amount) {
          this.addGold(action.amount);
        }
        break;
      case 'take_gold':
        if (action.amount) {
          this.state.player.gold = Math.max(0, this.state.player.gold - action.amount);
        }
        break;
      case 'change_reputation':
        // Uses flag field for faction ID and value for change amount
        if (action.flag && typeof action.value === 'number') {
          this.modifyReputation(action.flag, action.value);
        }
        break;
      case 'set_quest_flag':
        if (action.flag) {
          this.questFlags[action.flag] = action.value === true || action.value === 1;
        }
        break;
      case 'trigger_combat':
        if (action.encounterId) {
          await this.startCombat(action.encounterId);
        }
        break;
      case 'open_shop':
        if (action.shopId) {
          this.openShop(action.shopId);
        }
        break;
      case 'heal_party':
        // Fully heal the player
        this.state.player.hp = this.state.player.maxHp;
        this.fatigue.fullRest();
        break;
    }
  }

  private applyItemEffects(effects: ItemEffect[]): void {
    for (const effect of effects) {
      switch (effect.type) {
        case 'heal_hp':
          this.state.player.hp = Math.min(
            this.state.player.maxHp,
            this.state.player.hp + effect.value
          );
          break;
        case 'heal_stamina':
          this.fatigue.removeFatigue(effect.value);
          break;
        case 'restore_food':
          this.provisions.addFood(effect.value);
          break;
        case 'restore_water':
          this.provisions.addWater(effect.value);
          break;
        // Buffs would need a buff system
      }
    }
  }

  // ==========================================================================
  // PRIVATE - Event Emission
  // ==========================================================================

  private emitEvent(event: GameSessionEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[GameSession] Event listener error:', err);
      }
    });
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  public dispose(): void {
    this.clock.pause();
    this.quest.dispose();
    this.dialogue.dispose();
    this.inventory.dispose();
    this.shop.dispose();
    this.combat.dispose();
    this.eventListeners.clear();
    console.log('[GameSession] Disposed');
  }
}

// Factory function
export function createGameSession(dataAccess: GameDataAccess): GameSession {
  return new GameSession(dataAccess);
}
