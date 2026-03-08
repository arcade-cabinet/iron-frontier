/**
 * GameScreen — Main game page that composes the 3D world with React Native overlays.
 *
 * On mount: starts all game subsystems via GameOrchestrator.
 * On unmount: tears down all subscriptions and timers.
 *
 * The UI layer renders different panels based on the current game phase
 * and active panel state from the Zustand store.
 *
 * Interaction system: processes proximity/facing checks each tick to show
 * InteractionPrompt and dispatch talk/shop/enter/pickup actions.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber/native';
import { BackHandler, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';

import { usePlatform } from '@/hooks/usePlatform';

import { GameScene } from '@/components/scene';
import { GameHUD } from '@/components/game/GameHUD';
import { DialogueBox } from '@/components/game/DialogueBox';
import { InteractionPrompt } from '@/components/game/InteractionPrompt';
import { InventoryPanel } from '@/components/game/InventoryPanel';
import { ShopPanel } from '@/components/game/ShopPanel';
import { QuestLog } from '@/components/game/QuestLog';
import { WorldMap } from '@/components/game/WorldMap';
import { MainMenu } from '@/components/game/MainMenu';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { Crosshair } from '@/components/game/Crosshair';
import { DamageFlash } from '@/components/game/DamageFlash';
import { NotificationFeed } from '@/components/game/NotificationFeed';
import { TravelPanel } from '@/components/game/TravelPanel';
import { TravelTransition } from '@/components/game/TravelTransition';
import { PipePuzzle } from '@/components/game/PipePuzzle';
import { TouchOverlay } from '@/components/game/TouchOverlay';
import { EnterVRButton } from '@/components/game/EnterVRButton';

import { gameOrchestrator } from '@/src/game/GameOrchestrator';
import { useGameStoreShallow } from '@/hooks/useGameStore';
import type { GamePhase, PanelType } from '@/src/game/store/types';
import {
  processInteraction,
  type InteractableEntity,
  type InteractionAction,
  type InteractionTarget,
} from '@/src/game/systems/InteractionSystem';
import { getInteriorManager } from '@/src/game/systems/InteriorManager';
import { InputManager } from '@/src/game/input/InputManager';
import { initializeInput, hasTouchCapability } from '@/src/game/input/InputInitializer';

// ============================================================================
// XR CONTROLLER REGISTRATION (web only)
// ============================================================================

// Register XR controller provider on web when xrStore is available.
// This runs at module load time so the provider is ready before the first frame.
if (Platform.OS === 'web') {
  try {
    const { xrStore } = require('@/src/game/xr/XRSetup');
    if (xrStore) {
      const { XRControllerProvider } = require('@/src/game/input/providers/XRControllerProvider');
      const inputManager = InputManager.getInstance();
      // Only register if not already present (handles hot-reload)
      if (!inputManager.getProvider('xr-controller')) {
        const xrProvider = new XRControllerProvider(xrStore);
        inputManager.registerProvider(xrProvider);
      }
    }
  } catch {
    // @react-three/xr not installed or XRSetup not available — XR disabled
  }
}

// ============================================================================
// KEYBOARD BINDINGS (web only)
// ============================================================================

/**
 * Map keyboard keys to panel toggles and actions.
 */
const KEY_BINDINGS: Record<string, { panel?: PanelType; action?: string }> = {
  i: { panel: 'inventory' },
  I: { panel: 'inventory' },
  j: { panel: 'quests' },
  J: { panel: 'quests' },
  m: { action: 'worldmap' },
  M: { action: 'worldmap' },
  Escape: { action: 'menu' },
  c: { panel: 'character' },
  C: { panel: 'character' },
};

// ============================================================================
// INTERACTION HANDLING HOOK
// ============================================================================

/**
 * Executes an interaction action by dispatching to the game store.
 * Handles dialogue-to-shop escalation for merchant NPCs.
 */
function useInteractionDispatch() {
  const {
    startDialogue,
    openShop,
    collectWorldItem,
    addNotification,
  } = useGameStoreShallow((s) => ({
    startDialogue: s.startDialogue,
    openShop: s.openShop,
    collectWorldItem: s.collectWorldItem,
    addNotification: s.addNotification,
  }));

  const interiorManager = getInteriorManager();

  const dispatch = useCallback(
    (action: InteractionAction) => {
      switch (action.type) {
        case 'talk': {
          if (action.npcId) {
            startDialogue(action.npcId);
          }
          break;
        }
        case 'shop': {
          // For merchant NPCs, start a greeting dialogue first.
          // The shop will be opened after dialogue ends if the NPC has a shopId.
          // If no dialogue tree exists, open the shop directly.
          if (action.npcId) {
            startDialogue(action.npcId);
            // If dialogue did not start (NPC has nothing to say), open shop directly.
            // We check after a microtask since startDialogue is sync.
            if (action.shopId) {
              const shopId = action.shopId;
              queueMicrotask(() => {
                // Read fresh state from the store instead of the stale closure value
                const freshDialogue =
                  require('@/src/game/store/webGameStore').gameStore.getState().dialogueState;
                if (!freshDialogue) {
                  openShop(shopId);
                }
              });
            }
          } else if (action.shopId) {
            openShop(action.shopId);
          }
          break;
        }
        case 'enter': {
          if (action.buildingId && action.archetypeId) {
            interiorManager.enterBuilding(action.buildingId, action.archetypeId);
            addNotification('info', `Entered ${action.archetypeId.replace(/_/g, ' ')}`);
          }
          break;
        }
        case 'pickup': {
          if (action.itemId) {
            collectWorldItem(action.itemId);
          }
          break;
        }
      }
    },
    [startDialogue, openShop, collectWorldItem, addNotification, interiorManager],
  );

  return dispatch;
}

// ============================================================================
// GAME SCREEN
// ============================================================================

export default function GameScreen() {
  const router = useRouter();
  const { isMobileWeb, hasFinePointer, isWeb } = usePlatform();

  // --- Store selectors (shallow for perf) ---
  const {
    phase,
    activePanel,
    dialogueState,
    shopState,
    combatState,
    travelState,
    activePuzzle,
    togglePanel,
    closePanel,
    openPanel,
    travelTo,
  } = useGameStoreShallow((s) => ({
    phase: s.phase,
    activePanel: s.activePanel,
    dialogueState: s.dialogueState,
    shopState: s.shopState,
    combatState: s.combatState,
    travelState: s.travelState,
    activePuzzle: s.activePuzzle,
    togglePanel: s.togglePanel,
    closePanel: s.closePanel,
    openPanel: s.openPanel,
    travelTo: s.travelTo,
  }));

  // --- Interaction system state ---
  const [interactionTarget, setInteractionTarget] = useState<InteractionTarget | null>(null);
  const interactableEntitiesRef = useRef<InteractableEntity[]>([]);
  const dispatchInteraction = useInteractionDispatch();

  // --- World map toggle (not a panel type, separate state) ---
  const [worldMapOpen, setWorldMapOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // --- Touch detection state ---
  // Evaluated once then re-checked on fold/unfold via ResizeObserver
  // (foldable phones like Samsung Galaxy Z Fold, OnePlus Open).
  const [touchActive, setTouchActive] = useState(() => hasTouchCapability());

  // --- Start systems and input on mount, teardown on unmount ---
  useEffect(() => {
    gameOrchestrator.startSystems();
    const cleanupInput = initializeInput();
    return () => {
      cleanupInput();
      gameOrchestrator.teardown();
    };
  }, []);

  // --- Re-detect touch on fold/unfold (foldable phones) ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateTouch = () => {
      setTouchActive(hasTouchCapability());
    };
    if (typeof ResizeObserver === 'undefined') return;
    const obs = new ResizeObserver(updateTouch);
    obs.observe(document.documentElement);
    return () => obs.disconnect();
  }, []);

  // --- Interaction system tick (runs during exploring phase only) ---
  // Reads player position and forward from store, runs processInteraction,
  // and dispatches actions when the interact key is pressed.
  const prevDialogueNpcRef = useRef<string | null>(null);
  const prevDialogueActiveRef = useRef(false);

  useEffect(() => {
    const isExploringPhase =
      phase === 'playing' && !dialogueState && !shopState && !combatState && !travelState;

    if (!isExploringPhase) {
      setInteractionTarget(null);
      return;
    }

    // Poll at ~20Hz for interaction scanning
    const intervalId = setInterval(() => {
      const inputManager = InputManager.getInstance();
      const inputFrame = inputManager.getFrame();

      // TODO: Read actual player position/forward from the 3D scene.
      // For now we read from the store's playerPosition and playerRotation.
      const storeState = (gameOrchestrator as any)._getStoreState?.() ??
        require('@/src/game/store/webGameStore').gameStore.getState();
      const playerPos = storeState.playerPosition ?? { x: 0, y: 0, z: 0 };
      const rotation = storeState.playerRotation ?? 0;
      const playerForward = {
        x: Math.sin(rotation),
        y: 0,
        z: Math.cos(rotation),
      };

      const result = processInteraction(
        playerPos,
        playerForward,
        interactableEntitiesRef.current,
        inputFrame,
      );

      setInteractionTarget(result.target);

      if (result.action) {
        dispatchInteraction(result.action);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [phase, dialogueState, shopState, combatState, travelState, dispatchInteraction]);

  // --- Dialogue-end: auto-open shop for merchant NPCs ---
  useEffect(() => {
    const wasActive = prevDialogueActiveRef.current;
    const isActive = !!dialogueState;
    const prevNpcId = prevDialogueNpcRef.current;

    if (wasActive && !isActive && prevNpcId) {
      // Dialogue just ended — check if this NPC is a merchant with a shopId
      const entity = interactableEntitiesRef.current.find(
        (e) => e.npcId === prevNpcId && e.shopId,
      );
      if (entity?.shopId) {
        // Small delay so the dialogue close animation plays
        const timerId = setTimeout(() => {
          const storeState =
            require('@/src/game/store/webGameStore').gameStore.getState();
          // Only open shop if we're back in playing phase
          if (storeState.phase === 'playing') {
            storeState.openShop(entity.shopId!);
          }
        }, 300);
        // Cleanup if component unmounts during timeout
        return () => clearTimeout(timerId);
      }
    }

    prevDialogueActiveRef.current = isActive;
    prevDialogueNpcRef.current = dialogueState?.npcId ?? null;
  }, [dialogueState]);

  // --- Keyboard input (web) ---
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore input when typing in a text field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const binding = KEY_BINDINGS[e.key];
      if (!binding) return;

      e.preventDefault();

      // Disable panel/map toggling during travel, combat, dialogue
      const canToggleUI = phase === 'playing' || phase === 'paused';

      if (binding.panel && canToggleUI) {
        togglePanel(binding.panel);
      } else if (binding.action === 'worldmap' && canToggleUI) {
        setWorldMapOpen((prev) => !prev);
      } else if (binding.action === 'menu') {
        // Escape: close any open panel/map first, then toggle menu
        if (activePanel) {
          closePanel();
        } else if (worldMapOpen) {
          setWorldMapOpen(false);
        } else {
          setMenuOpen((prev) => !prev);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, activePanel, worldMapOpen, togglePanel, closePanel]);

  // --- Android back button ---
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activePanel) {
        closePanel();
        return true;
      }
      if (worldMapOpen) {
        setWorldMapOpen(false);
        return true;
      }
      if (menuOpen) {
        setMenuOpen(false);
        return true;
      }
      // Open menu on back press if nothing is open
      setMenuOpen(true);
      return true;
    });

    return () => subscription.remove();
  }, [activePanel, worldMapOpen, menuOpen, closePanel]);

  // --- Navigate back to title on game over restart ---
  const handleReturnToTitle = useCallback(() => {
    gameOrchestrator.teardown();
    router.replace('/');
  }, [router]);

  // --- Callbacks ---
  const handleCloseInventory = useCallback(() => {
    closePanel();
  }, [closePanel]);

  const handleCloseQuestLog = useCallback(() => {
    closePanel();
  }, [closePanel]);

  const handleCloseWorldMap = useCallback(() => {
    setWorldMapOpen(false);
  }, []);

  const handleTravelTo = useCallback(
    (locationId: string) => {
      setWorldMapOpen(false);
      travelTo(locationId);
    },
    [travelTo],
  );

  // --- Player damage callback (routes to DamageFlash overlay) ---
  const handlePlayerDamage = useCallback((damage: number) => {
    DamageFlash.trigger(damage);
  }, []);

  // --- Determine what to show ---
  const isExploring = phase === 'playing' && !dialogueState && !shopState && !combatState && !travelState;
  const isDialogue = phase === 'dialogue' || !!dialogueState;
  const isShopping = !!shopState;
  const isTraveling = phase === 'travel' || !!travelState;
  const isGameOver = phase === 'game_over';
  const isPuzzle = phase === 'puzzle' || !!activePuzzle;
  const shouldPauseTime = !!activePanel || menuOpen || worldMapOpen || isDialogue || isShopping || isGameOver;

  return (
    <View className="flex-1 bg-frontier-night">
      {/* Bottom layer: R3F 3D world */}
      <View className="absolute inset-0">
        <Canvas
          gl={{ antialias: isWeb && hasFinePointer && !isMobileWeb }}
          onCreated={(state) => {
            // Clamp pixel ratio to 2x to prevent expensive 3x mobile rendering
            const maxDpr = 2;
            const currentDpr = state.gl.getPixelRatio();
            if (currentDpr > maxDpr) {
              state.gl.setPixelRatio(maxDpr);
            }
          }}
          frameloop="always"
          camera={{ fov: 75, near: 0.1, far: 1000 }}
          shadows
        >
          <GameScene
            initialTime={10}
            paused={shouldPauseTime}
            onPlayerDamage={handlePlayerDamage}
          />
        </Canvas>
      </View>

      {/* Top layer: React Native HUD overlay */}
      <View className="absolute inset-0" pointerEvents="box-none">

        {/* --- ALWAYS VISIBLE --- */}

        {/* Notification toast feed */}
        <NotificationFeed />

        {/* --- EXPLORING PHASE --- */}

        {/* HUD: health, quest, time, provisions */}
        {isExploring && !menuOpen && !worldMapOpen && !activePanel && (
          <GameHUD />
        )}

        {/* Red damage flash overlay (scales with damage intensity) */}
        <DamageFlash />

        {/* Crosshair */}
        {isExploring && !menuOpen && !worldMapOpen && !activePanel && (
          <Crosshair visible />
        )}

        {/* Interaction prompt (bottom-center, shows when near an interactable) */}
        {isExploring && !menuOpen && !worldMapOpen && !activePanel && (
          <InteractionPrompt target={interactionTarget} />
        )}

        {/* Touch overlay — virtual joystick + action buttons for mobile/tablet.
            Mounted above HUD so buttons appear on top of other overlays.
            Only rendered when touch input is available and actively exploring. */}
        {isExploring && touchActive && !menuOpen && !worldMapOpen && !activePanel && (
          <TouchOverlay interactionNearby={!!interactionTarget} />
        )}

        {/* --- DIALOGUE PHASE --- */}

        {isDialogue && <DialogueBox />}

        {/* --- SHOP PHASE --- */}

        {isShopping && <ShopPanel />}

        {/* --- TRAVEL PHASE --- */}

        {/* TravelTransition: full-screen overlay for non-encounter travel */}
        <TravelTransition />

        {/* TravelPanel: encounter interruption during travel */}
        {isTraveling && <TravelPanel />}

        {/* --- PUZZLE PHASE --- */}

        {isPuzzle && <PipePuzzle />}

        {/* --- TOGGLED PANELS --- */}

        {/* Inventory Panel (I key) */}
        <InventoryPanel
          visible={activePanel === 'inventory'}
          onClose={handleCloseInventory}
        />

        {/* Quest Log (J key) */}
        <QuestLog
          open={activePanel === 'quests'}
          onClose={handleCloseQuestLog}
        />

        {/* World Map (M key) */}
        <WorldMap
          isOpen={worldMapOpen}
          onClose={handleCloseWorldMap}
          onTravelTo={handleTravelTo}
        />

        {/* Main Menu (Escape key) */}
        {menuOpen && <MainMenu onClose={() => setMenuOpen(false)} />}

        {/* --- GAME OVER --- */}

        {isGameOver && <GameOverScreen />}

        {/* --- VR ENTRY POINT --- */}

        {/* Enter VR button — only visible on web with WebXR support.
            Positioned bottom-right, frontier-styled. */}
        <EnterVRButton />
      </View>
    </View>
  );
}
