/**
 * useGameSession - React hook for GameSession integration
 *
 * Provides the GameSession orchestrator API for coordinating
 * quest, dialogue, combat, and other game systems.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  GameSession,
  createGameSession,
  type GameDataAccess,
  type GameSessionEvent,
  type GameSessionMode,
  type GameSessionState,
} from '@iron-frontier/shared/GameSession';

// Data access imports
import { getItem } from '@iron-frontier/shared/data/items';
import { getNPCById, getDialogueTreeById } from '@iron-frontier/shared/data/npcs';
import { getQuestById } from '@iron-frontier/shared/data/quests';
import { getShopById } from '@iron-frontier/shared/data/shops';
import { getEncounterById, getEnemyById } from '@iron-frontier/shared/data/enemies';
import { getWorldById, loadWorld } from '@iron-frontier/shared/data/worlds';

/**
 * Create the data access layer for the web platform
 */
function createWebDataAccess(): GameDataAccess {
  return {
    // Quest data
    getQuestDefinition: (questId: string) => {
      const quest = getQuestById(questId);
      if (!quest) return undefined;
      return {
        id: quest.id,
        name: quest.title,
        description: quest.description,
        isMainQuest: quest.type === 'main',
        stages: quest.stages.map((stage) => ({
          objectives: stage.objectives.map((obj) => ({
            id: obj.id,
            description: obj.description,
            type: obj.type as any,
            target: obj.target,
            count: obj.count ?? 1,
            optional: obj.optional ?? false,
            hidden: obj.hidden ?? false,
          })),
        })),
        rewards: {
          xp: quest.rewards?.xp ?? 0,
          gold: quest.rewards?.gold ?? 0,
          items: quest.rewards?.items ?? [],
          reputation: quest.rewards?.reputation
            ? Object.entries(quest.rewards.reputation).map(([factionId, change]) => ({
                factionId,
                change,
              }))
            : undefined,
          unlocks: quest.rewards?.unlocksQuests,
        },
        prerequisites: quest.prerequisites?.completedQuests,
      };
    },
    checkQuestPrerequisites: (
      questId: string,
      completedQuests: string[],
      flags: Record<string, boolean>
    ) => {
      const quest = getQuestById(questId);
      if (!quest?.prerequisites?.completedQuests) return true;
      return quest.prerequisites.completedQuests.every((preReq: string) =>
        completedQuests.includes(preReq)
      );
    },

    // NPC/Dialogue data
    getNPCById: (npcId: string) => getNPCById(npcId),
    getDialogueTree: (treeId: string) => getDialogueTreeById(treeId),

    // Item data
    getItemDefinition: (itemId: string) => getItem(itemId),
    getEquipmentStats: (itemId: string) => {
      const item = getItem(itemId);
      if (!item) return undefined;
      if (item.type === 'weapon' && item.weaponStats) {
        return {
          attack: item.weaponStats.damage,
          defense: 0,
          speed: 0,
        };
      }
      if (item.type === 'armor' && item.armorStats) {
        return {
          attack: 0,
          defense: item.armorStats.defense,
          speed: -item.armorStats.movementPenalty * 10, // Convert penalty to speed reduction
        };
      }
      return undefined;
    },

    // Shop data
    getShopById: (shopId: string) => getShopById(shopId),
    getShopInventory: (shopId: string) => {
      const shop = getShopById(shopId);
      if (!shop) return [];
      return shop.inventory.map((item) => ({
        itemId: item.itemId,
        stock: item.stock ?? 99,
      }));
    },

    // Combat data
    getEncounterById: (encounterId: string) => getEncounterById(encounterId),
    getEnemyById: (enemyId: string) => getEnemyById(enemyId),

    // World data
    getTownById: (townId: string) => {
      // Towns are locations in the world
      const world = getWorldById('frontier_territory');
      if (!world) return undefined;
      const loaded = loadWorld(world);
      return loaded.locations.get(townId);
    },
    getRouteById: (routeId: string) => {
      // Routes are connections in the world - use from+to as identifier
      const world = getWorldById('frontier_territory');
      if (!world) return undefined;
      // Route ID format: "from_to" or just match by from/to
      return world.connections.find(
        (c) => `${c.from}_${c.to}` === routeId || `${c.to}_${c.from}` === routeId
      );
    },
  };
}

// Singleton session instance
let sessionInstance: GameSession | null = null;

/**
 * Hook return type
 */
export interface UseGameSessionReturn {
  session: GameSession | null;
  state: GameSessionState | null;
  mode: GameSessionMode;
  isReady: boolean;

  // Game flow actions
  startNewGame: (playerName: string) => void;
  enterTown: (townId: string) => boolean;
  exitTown: () => void;
  talkToNPC: (npcId: string) => Promise<boolean>;
  selectDialogueChoice: (index: number) => Promise<boolean>;
  advanceDialogue: () => Promise<boolean>;
  openShop: (shopId: string) => boolean;
  closeShop: () => void;
  startCombat: (encounterId: string) => Promise<boolean>;

  // Event subscription
  onEvent: (listener: (event: GameSessionEvent) => void) => () => void;
}

/**
 * React hook for GameSession integration
 */
export function useGameSession(): UseGameSessionReturn {
  const [isReady, setIsReady] = useState(false);
  const [state, setState] = useState<GameSessionState | null>(null);
  const [mode, setMode] = useState<GameSessionMode>('title');
  const sessionRef = useRef<GameSession | null>(null);

  // Initialize session once
  useEffect(() => {
    if (!sessionInstance) {
      const dataAccess = createWebDataAccess();
      sessionInstance = createGameSession(dataAccess);
      console.log('[useGameSession] Created GameSession instance');
    }

    sessionRef.current = sessionInstance;

    // Subscribe to events
    const unsubscribe = sessionInstance.onEvent((event) => {
      if (event.type === 'mode_changed') {
        setMode(event.to);
        setState(sessionInstance!.getState());
      } else {
        // Update state on any event
        setState(sessionInstance!.getState());
      }
    });

    // Initial state
    setState(sessionInstance.getState());
    setMode(sessionInstance.getMode());
    setIsReady(true);

    return () => {
      unsubscribe();
    };
  }, []);

  // Actions
  const startNewGame = useCallback((playerName: string) => {
    if (sessionRef.current) {
      sessionRef.current.startNewGame(playerName);
      setState(sessionRef.current.getState());
      setMode(sessionRef.current.getMode());
    }
  }, []);

  const enterTown = useCallback((townId: string): boolean => {
    if (!sessionRef.current) return false;
    const result = sessionRef.current.enterTown(townId);
    setState(sessionRef.current.getState());
    return result;
  }, []);

  const exitTown = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.exitTown();
      setState(sessionRef.current.getState());
    }
  }, []);

  const talkToNPC = useCallback(async (npcId: string): Promise<boolean> => {
    if (!sessionRef.current) return false;
    const result = await sessionRef.current.talkToNPC(npcId);
    setState(sessionRef.current.getState());
    return result;
  }, []);

  const selectDialogueChoice = useCallback(async (index: number): Promise<boolean> => {
    if (!sessionRef.current) return false;
    const result = await sessionRef.current.selectDialogueChoice(index);
    setState(sessionRef.current.getState());
    return result;
  }, []);

  const advanceDialogue = useCallback(async (): Promise<boolean> => {
    if (!sessionRef.current) return false;
    const result = await sessionRef.current.advanceDialogue();
    setState(sessionRef.current.getState());
    return result;
  }, []);

  const openShop = useCallback((shopId: string): boolean => {
    if (!sessionRef.current) return false;
    const result = sessionRef.current.openShop(shopId);
    setState(sessionRef.current.getState());
    return result;
  }, []);

  const closeShop = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.closeShop();
      setState(sessionRef.current.getState());
    }
  }, []);

  const startCombat = useCallback(async (encounterId: string): Promise<boolean> => {
    if (!sessionRef.current) return false;
    const result = await sessionRef.current.startCombat(encounterId);
    setState(sessionRef.current.getState());
    return result;
  }, []);

  const onEvent = useCallback(
    (listener: (event: GameSessionEvent) => void): (() => void) => {
      if (!sessionRef.current) return () => {};
      return sessionRef.current.onEvent(listener);
    },
    []
  );

  return {
    session: sessionRef.current,
    state,
    mode,
    isReady,
    startNewGame,
    enterTown,
    exitTown,
    talkToNPC,
    selectDialogueChoice,
    advanceDialogue,
    openShop,
    closeShop,
    startCombat,
    onEvent,
  };
}

/**
 * Get the singleton GameSession instance (for non-React contexts)
 */
export function getGameSessionInstance(): GameSession | null {
  return sessionInstance;
}
