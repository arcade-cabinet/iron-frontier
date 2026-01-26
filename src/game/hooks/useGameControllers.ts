/**
 * useGameControllers.ts - React hook for game controller integration
 *
 * Provides easy access to all game controllers with proper lifecycle management.
 */

import type { WorldPosition } from '@/store/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    CombatController,
    getCombatController,
    type CombatControllerDataAccess,
    type CombatEvent,
} from '../controllers/CombatController';
import {
    DialogueController,
    getDialogueController,
    type DialogueControllerDataAccess,
    type DialogueEvent,
} from '../controllers/DialogueController';
import {
    GameController,
    getGameController,
    type GameControllerConfig,
    type GameEvent,
} from '../controllers/GameController';
import {
    PlayerController,
    createPlayerController,
    type PlayerMovementConfig,
} from '../controllers/PlayerController';
import { getInputManager } from '../input';
import { getEncounterSystem } from '../systems/EncounterSystem';

/**
 * Hook configuration
 */
export interface UseGameControllersConfig {
  /** Game controller config */
  gameConfig?: Partial<GameControllerConfig>;
  /** Player movement config */
  playerConfig?: Partial<PlayerMovementConfig>;
  /** Combat data access */
  combatDataAccess: CombatControllerDataAccess;
  /** Dialogue data access */
  dialogueDataAccess: DialogueControllerDataAccess;
  /** Initial player position */
  initialPosition?: WorldPosition;
}

/**
 * Hook return value
 */
export interface UseGameControllersReturn {
  // Controllers
  gameController: GameController;
  combatController: CombatController;
  playerController: PlayerController;
  dialogueController: DialogueController;

  // State
  gameMode: GameMode;
  playerPosition: WorldPosition;
  isInCombat: boolean;
  isInDialogue: boolean;
  isPaused: boolean;

  // Actions
  startNewGame: () => Promise<void>;
  enterTown: (townId: string) => Promise<void>;
  exitTown: () => Promise<void>;
  startDialogue: (npcId: string) => Promise<boolean>;
  endDialogue: () => Promise<void>;
  openMenu: () => Promise<void>;
  closeMenu: () => Promise<void>;
  quickSave: () => Promise<void>;

  // Events
  onGameEvent: (listener: (event: GameEvent) => void) => () => void;
  onCombatEvent: (listener: (event: CombatEvent) => void) => () => void;
  onDialogueEvent: (listener: (event: DialogueEvent) => void) => () => void;
}

/**
 * Main hook for game controllers
 */
export function useGameControllers(
  config: UseGameControllersConfig
): UseGameControllersReturn {
  const {
    gameConfig,
    playerConfig,
    combatDataAccess,
    dialogueDataAccess,
    initialPosition = { x: 0, z: 0 },
  } = config;

  // State
  const [gameMode, setGameMode] = useState<GameMode>('title');
  const [playerPosition, setPlayerPosition] = useState<WorldPosition>(initialPosition);
  const [isInCombat, setIsInCombat] = useState(false);
  const [isInDialogue, setIsInDialogue] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Controller refs
  const gameController = useRef(getGameController(gameConfig));
  const combatController = useRef(getCombatController(combatDataAccess));
  const playerController = useRef(createPlayerController(initialPosition, playerConfig));
  const dialogueController = useRef(getDialogueController(dialogueDataAccess));
  const inputManager = useRef(getInputManager());
  const encounterSystem = useRef(getEncounterSystem());

  // Previous mode for menu return
  const previousMode = useRef<GameMode>('overworld');

  // Setup controller connections
  useEffect(() => {
    const game = gameController.current;
    const player = playerController.current;
    const combat = combatController.current;
    const dialogue = dialogueController.current;
    const input = inputManager.current;
    const encounters = encounterSystem.current;

    // Connect game controller hooks
    game.setModeChangeHook((mode, context) => {
      setGameMode(mode);
      input.setContext(context);
    });

    game.setPositionChangeHook((pos) => {
      setPlayerPosition(pos);
      encounters.updatePosition(pos.x, pos.z);
    });

    game.setEncounterHook(async (trigger) => {
      const playerState = player.getState();
      return combat.startCombat(
        trigger,
        {
          hp: 100,
          maxHP: 100,
          attack: 10,
          defense: 5,
          speed: 10,
          accuracy: 85,
          evasion: 10,
          critChance: 5,
          critMultiplier: 1.5,
        },
        'Player',
        null
      );
    });

    // Connect input to player
    const unsubMovement = input.onMovement((movement) => {
      player.setMovementInput(movement);
    });

    const unsubSprint = input.onAction('sprint', (event) => {
      player.setSprintInput(event.type === 'press');
    });

    // Connect encounter system
    const unsubEncounter = encounters.onEncounter(async (trigger) => {
      await game.handleEncounter(trigger);
    });

    // Update loop
    let lastTime = performance.now();
    let animationFrame: number;

    const update = () => {
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      // Update controllers
      input.update(deltaTime);
      player.update(deltaTime);

      // Update position in game controller
      const pos = player.getPosition();
      game.updatePosition(pos);

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);

    // Combat events
    const unsubCombat = combat.onEvent((event) => {
      if (event.type === 'combat_start') {
        setIsInCombat(true);
      } else if (event.type === 'combat_end') {
        setIsInCombat(false);
        game.handleCombatEnd(event);
      }
    });

    // Dialogue events
    const unsubDialogue = dialogue.onEvent((event) => {
      if (event.type === 'dialogue_start') {
        setIsInDialogue(true);
      } else if (event.type === 'dialogue_end') {
        setIsInDialogue(false);
      }
    });

    // Initialize
    game.initialize();

    return () => {
      cancelAnimationFrame(animationFrame);
      unsubMovement();
      unsubSprint();
      unsubEncounter();
      unsubCombat();
      unsubDialogue();
    };
  }, []);

  // Actions
  const startNewGame = useCallback(async () => {
    await gameController.current.startNewGame();
  }, []);

  const enterTown = useCallback(async (townId: string) => {
    await gameController.current.enterTown(townId);
    encounterSystem.current.setCurrentZone(null); // No encounters in town
  }, []);

  const exitTown = useCallback(async () => {
    await gameController.current.exitTown();
  }, []);

  const startDialogue = useCallback(async (npcId: string) => {
    await gameController.current.startDialogue();
    return dialogueController.current.startDialogue(npcId);
  }, []);

  const endDialogue = useCallback(async () => {
    await dialogueController.current.endDialogue();
    await gameController.current.endDialogue(
      gameMode === 'town' ? 'town' : 'overworld'
    );
  }, [gameMode]);

  const openMenu = useCallback(async () => {
    previousMode.current = gameMode;
    setIsPaused(true);
    await gameController.current.openMenu();
  }, [gameMode]);

  const closeMenu = useCallback(async () => {
    setIsPaused(false);
    await gameController.current.closeMenu(previousMode.current);
  }, []);

  const quickSave = useCallback(async () => {
    await gameController.current.quickSave();
  }, []);

  // Event subscriptions
  const onGameEvent = useCallback((listener: (event: GameEvent) => void) => {
    return gameController.current.onEvent(listener);
  }, []);

  const onCombatEvent = useCallback((listener: (event: CombatEvent) => void) => {
    return combatController.current.onEvent(listener);
  }, []);

  const onDialogueEvent = useCallback((listener: (event: DialogueEvent) => void) => {
    return dialogueController.current.onEvent(listener);
  }, []);

  return {
    gameController: gameController.current,
    combatController: combatController.current,
    playerController: playerController.current,
    dialogueController: dialogueController.current,
    gameMode,
    playerPosition,
    isInCombat,
    isInDialogue,
    isPaused,
    startNewGame,
    enterTown,
    exitTown,
    startDialogue,
    endDialogue,
    openMenu,
    closeMenu,
    quickSave,
    onGameEvent,
    onCombatEvent,
    onDialogueEvent,
  };
}

/**
 * Simple hook for player position only
 */
export function usePlayerPosition(): WorldPosition {
  const [position, setPosition] = useState<WorldPosition>({ x: 0, z: 0 });

  useEffect(() => {
    const unsub = getGameController().onEvent((event) => {
      if (event.type === 'position_change') {
        setPosition(event.position);
      }
    });
    return unsub;
  }, []);

  return position;
}

/**
 * Simple hook for game mode only
 */
export function useGameMode(): GameMode {
  const [mode, setMode] = useState<GameMode>('title');

  useEffect(() => {
    const unsub = getGameController().onEvent((event) => {
      if (event.type === 'mode_change') {
        setMode(event.to);
      }
    });
    return unsub;
  }, []);

  return mode;
}
