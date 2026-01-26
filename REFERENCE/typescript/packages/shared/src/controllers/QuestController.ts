/**
 * QuestController.ts - Quest management for Iron Frontier v2
 *
 * Manages:
 * - Active quest tracking
 * - Objective progress
 * - Quest completion and rewards
 * - Quest log display
 */

/**
 * Quest status
 */
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';

/**
 * Objective status
 */
export type ObjectiveStatus = 'incomplete' | 'complete' | 'failed';

/**
 * Quest objective
 */
export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'talk' | 'visit' | 'interact' | 'deliver';
  target: string;
  count: number;
  current: number;
  optional: boolean;
  hidden: boolean;
  status: ObjectiveStatus;
}

/**
 * Active quest
 */
export interface ActiveQuest {
  questId: string;
  name: string;
  description: string;
  currentStage: number;
  objectives: QuestObjective[];
  status: QuestStatus;
  startTime: number;
  completionTime?: number;
  isMainQuest: boolean;
}

/**
 * Quest rewards
 */
export interface QuestRewards {
  xp: number;
  gold: number;
  items: Array<{ itemId: string; quantity: number }>;
  reputation?: Array<{ factionId: string; change: number }>;
  unlocks?: string[]; // Quest IDs, areas, etc.
}

/**
 * Quest events
 */
export type QuestEvent =
  | { type: 'quest_started'; questId: string; name: string }
  | { type: 'quest_updated'; questId: string; objectiveId: string; progress: number; total: number }
  | { type: 'objective_complete'; questId: string; objectiveId: string; description: string }
  | { type: 'stage_complete'; questId: string; stage: number }
  | { type: 'quest_complete'; questId: string; name: string; rewards: QuestRewards }
  | { type: 'quest_failed'; questId: string; name: string; reason: string }
  | { type: 'quest_available'; questId: string; name: string };

/**
 * Controller state
 */
export interface QuestControllerState {
  activeQuests: ActiveQuest[];
  completedQuests: string[];
  failedQuests: string[];
  trackedQuestId: string | null; // Currently tracked quest for HUD
}

type QuestEventListener = (event: QuestEvent) => void;

/**
 * Data access for quest controller
 */
export interface QuestControllerDataAccess {
  getQuestDefinition: (questId: string) => {
    id: string;
    name: string;
    description: string;
    isMainQuest: boolean;
    stages: Array<{
      objectives: Array<Omit<QuestObjective, 'current' | 'status'>>;
    }>;
    rewards: QuestRewards;
    prerequisites?: string[];
  } | undefined;
  checkPrerequisites: (questId: string) => boolean;
  grantRewards: (rewards: QuestRewards) => void;
  setQuestFlag: (flag: string, value: boolean) => void;
}

export class QuestController {
  private state: QuestControllerState = {
    activeQuests: [],
    completedQuests: [],
    failedQuests: [],
    trackedQuestId: null,
  };

  private eventListeners: Set<QuestEventListener> = new Set();
  private dataAccess: QuestControllerDataAccess;

  constructor(dataAccess: QuestControllerDataAccess) {
    this.dataAccess = dataAccess;
    console.log('[QuestController] Initialized');
  }

  /**
   * Start a quest
   */
  public startQuest(questId: string): boolean {
    // Check not already active
    if (this.state.activeQuests.some((q) => q.questId === questId)) {
      console.warn(`[QuestController] Quest already active: ${questId}`);
      return false;
    }

    // Check not already completed
    if (this.state.completedQuests.includes(questId)) {
      console.warn(`[QuestController] Quest already completed: ${questId}`);
      return false;
    }

    // Get definition
    const definition = this.dataAccess.getQuestDefinition(questId);
    if (!definition) {
      console.error(`[QuestController] Quest not found: ${questId}`);
      return false;
    }

    // Check prerequisites
    if (!this.dataAccess.checkPrerequisites(questId)) {
      console.warn(`[QuestController] Prerequisites not met: ${questId}`);
      return false;
    }

    // Initialize quest
    const activeQuest: ActiveQuest = {
      questId,
      name: definition.name,
      description: definition.description,
      currentStage: 0,
      objectives: definition.stages[0].objectives.map((obj) => ({
        ...obj,
        current: 0,
        status: 'incomplete' as ObjectiveStatus,
      })),
      status: 'active',
      startTime: Date.now(),
      isMainQuest: definition.isMainQuest,
    };

    this.state.activeQuests.push(activeQuest);

    // Auto-track main quests
    if (definition.isMainQuest && !this.state.trackedQuestId) {
      this.state.trackedQuestId = questId;
    }

    this.emitEvent({ type: 'quest_started', questId, name: definition.name });
    console.log(`[QuestController] Started quest: ${definition.name}`);

    return true;
  }

  /**
   * Update objective progress
   */
  public updateObjective(
    objectiveType: QuestObjective['type'],
    target: string,
    amount: number = 1
  ): void {
    for (const quest of this.state.activeQuests) {
      if (quest.status !== 'active') continue;

      for (const objective of quest.objectives) {
        if (
          objective.type === objectiveType &&
          objective.target === target &&
          objective.status === 'incomplete'
        ) {
          const previous = objective.current;
          objective.current = Math.min(objective.count, objective.current + amount);

          if (objective.current !== previous) {
            this.emitEvent({
              type: 'quest_updated',
              questId: quest.questId,
              objectiveId: objective.id,
              progress: objective.current,
              total: objective.count,
            });

            // Check if objective complete
            if (objective.current >= objective.count) {
              objective.status = 'complete';
              this.emitEvent({
                type: 'objective_complete',
                questId: quest.questId,
                objectiveId: objective.id,
                description: objective.description,
              });

              // Check stage completion
              this.checkStageCompletion(quest);
            }
          }
        }
      }
    }
  }

  /**
   * Check if a stage is complete and advance if so
   */
  private checkStageCompletion(quest: ActiveQuest): void {
    const requiredObjectives = quest.objectives.filter((o) => !o.optional);
    const allRequiredComplete = requiredObjectives.every((o) => o.status === 'complete');

    if (allRequiredComplete) {
      const definition = this.dataAccess.getQuestDefinition(quest.questId);
      if (!definition) return;

      this.emitEvent({
        type: 'stage_complete',
        questId: quest.questId,
        stage: quest.currentStage,
      });

      // Check if there's a next stage
      if (quest.currentStage < definition.stages.length - 1) {
        quest.currentStage++;
        quest.objectives = definition.stages[quest.currentStage].objectives.map((obj) => ({
          ...obj,
          current: 0,
          status: 'incomplete' as ObjectiveStatus,
        }));
      } else {
        // Quest complete!
        this.completeQuest(quest.questId);
      }
    }
  }

  /**
   * Complete a quest
   */
  private completeQuest(questId: string): void {
    const questIndex = this.state.activeQuests.findIndex((q) => q.questId === questId);
    if (questIndex === -1) return;

    const quest = this.state.activeQuests[questIndex];
    quest.status = 'completed';
    quest.completionTime = Date.now();

    // Get rewards
    const definition = this.dataAccess.getQuestDefinition(questId);
    if (definition) {
      this.dataAccess.grantRewards(definition.rewards);
      this.dataAccess.setQuestFlag(`quest_${questId}_complete`, true);

      this.emitEvent({
        type: 'quest_complete',
        questId,
        name: quest.name,
        rewards: definition.rewards,
      });
    }

    // Move to completed
    this.state.activeQuests.splice(questIndex, 1);
    this.state.completedQuests.push(questId);

    // Update tracked quest
    if (this.state.trackedQuestId === questId) {
      this.state.trackedQuestId = this.state.activeQuests.find((q) => q.isMainQuest)?.questId ?? null;
    }

    console.log(`[QuestController] Completed quest: ${quest.name}`);
  }

  /**
   * Fail a quest
   */
  public failQuest(questId: string, reason: string): void {
    const questIndex = this.state.activeQuests.findIndex((q) => q.questId === questId);
    if (questIndex === -1) return;

    const quest = this.state.activeQuests[questIndex];
    quest.status = 'failed';

    this.emitEvent({
      type: 'quest_failed',
      questId,
      name: quest.name,
      reason,
    });

    // Move to failed
    this.state.activeQuests.splice(questIndex, 1);
    this.state.failedQuests.push(questId);

    // Update tracked quest
    if (this.state.trackedQuestId === questId) {
      this.state.trackedQuestId = this.state.activeQuests.find((q) => q.isMainQuest)?.questId ?? null;
    }

    console.log(`[QuestController] Failed quest: ${quest.name} - ${reason}`);
  }

  /**
   * Set tracked quest
   */
  public setTrackedQuest(questId: string | null): void {
    if (questId && !this.state.activeQuests.some((q) => q.questId === questId)) {
      return;
    }
    this.state.trackedQuestId = questId;
  }

  /**
   * Get tracked quest
   */
  public getTrackedQuest(): ActiveQuest | null {
    if (!this.state.trackedQuestId) return null;
    return this.state.activeQuests.find((q) => q.questId === this.state.trackedQuestId) ?? null;
  }

  /**
   * Get all active quests
   */
  public getActiveQuests(): ActiveQuest[] {
    return [...this.state.activeQuests];
  }

  /**
   * Get main quests only
   */
  public getMainQuests(): ActiveQuest[] {
    return this.state.activeQuests.filter((q) => q.isMainQuest);
  }

  /**
   * Get side quests only
   */
  public getSideQuests(): ActiveQuest[] {
    return this.state.activeQuests.filter((q) => !q.isMainQuest);
  }

  /**
   * Get quest by ID
   */
  public getQuest(questId: string): ActiveQuest | null {
    return this.state.activeQuests.find((q) => q.questId === questId) ?? null;
  }

  /**
   * Check if quest is active
   */
  public isQuestActive(questId: string): boolean {
    return this.state.activeQuests.some((q) => q.questId === questId);
  }

  /**
   * Check if quest is completed
   */
  public isQuestCompleted(questId: string): boolean {
    return this.state.completedQuests.includes(questId);
  }

  /**
   * Get state
   */
  public getState(): QuestControllerState {
    return {
      ...this.state,
      activeQuests: [...this.state.activeQuests],
      completedQuests: [...this.state.completedQuests],
      failedQuests: [...this.state.failedQuests],
    };
  }

  /**
   * Subscribe to quest events
   */
  public onEvent(listener: QuestEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * Load from save data
   */
  public loadFromSave(data: QuestControllerState): void {
    this.state = {
      ...data,
      activeQuests: [...data.activeQuests],
      completedQuests: [...data.completedQuests],
      failedQuests: [...data.failedQuests],
    };
  }

  /**
   * Get save data
   */
  public getSaveData(): QuestControllerState {
    return this.getState();
  }

  /**
   * Emit event
   */
  private emitEvent(event: QuestEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[QuestController] Event listener error:', err);
      }
    });
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.eventListeners.clear();
    console.log('[QuestController] Disposed');
  }
}

// Factory function
export function createQuestController(dataAccess: QuestControllerDataAccess): QuestController {
  return new QuestController(dataAccess);
}
