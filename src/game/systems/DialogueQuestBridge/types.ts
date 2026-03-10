/**
 * DialogueQuestBridge types - Store interface for dialogue-quest bridge
 *
 * @module systems/DialogueQuestBridge/types
 */

import type { ActiveQuest, Quest } from '../../data/schemas/quest';

export interface BridgeStoreReader {
  activeQuests: ActiveQuest[];
  completedQuestIds: string[];
  playerStats: { level: number; gold: number; reputation: number };
  inventory: { itemId: string; quantity: number }[];
  talkedNPCIds: string[];
  dialogueState: { npcId: string; conversationFlags: Record<string, boolean> } | null;
}

/** Minimal store actions needed by the bridge. */
export interface BridgeStoreActions {
  startQuest: (questId: string) => void;
  updateObjective: (questId: string, objectiveId: string, progress: number) => void;
  addItemById: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  addGold: (amount: number) => void;
  addNotification: (type: 'item' | 'xp' | 'quest' | 'level' | 'info' | 'warning', message: string) => void;
  getQuestDefinition: (questId: string) => Quest | undefined;
  getActiveQuest: (questId: string) => ActiveQuest | undefined;
  markNPCTalked: (npcId: string) => void;
  setDialogueFlag: (flag: string, value: boolean) => void;
  updatePlayerStats: (stats: Partial<{ reputation: number }>) => void;
  openShop: (shopId: string) => void;
  discoverLocation: (locationId: string) => void;
}

export type BridgeStore = BridgeStoreReader & BridgeStoreActions;
