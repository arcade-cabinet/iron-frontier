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

import { Canvas } from "@react-three/fiber";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Platform, View } from "react-native";
import { AmmoDisplay } from "@/components/game/AmmoDisplay";
import { AudioProvider } from "@/components/game/AudioProvider";
import { CharacterPanel } from "@/components/game/CharacterPanel";
import { CompassBar } from "@/components/game/CompassBar";
import { Crosshair } from "@/components/game/Crosshair";
import { DamageFlash } from "@/components/game/DamageFlash";
import { DamageIndicator } from "@/components/game/DamageIndicator";
import { DialogueBox } from "@/components/game/DialogueBox";
import { GameOverScreen } from "@/components/game/GameOverScreen";
import { InteractionPrompt } from "@/components/game/InteractionPrompt";
import { InventoryPanel } from "@/components/game/InventoryPanel";
import { LoadingScreen, type LoadingStage } from "@/components/game/LoadingScreen";
import { LocationEntry } from "@/components/game/LocationEntry";
import { LowHealthVignette } from "@/components/game/LowHealthVignette";
import { MainMenu } from "@/components/game/MainMenu";
import { NotificationFeed } from "@/components/game/NotificationFeed";
import { PipePuzzle } from "@/components/game/PipePuzzle";
import { PlayerVitals } from "@/components/game/PlayerVitals";
import { QuestLog } from "@/components/game/QuestLog";
import { QuestNotification } from "@/components/game/QuestNotification";
import { QuestObjectiveToast } from "@/components/game/QuestObjectiveToast";
import { ShopPanel } from "@/components/game/ShopPanel";
import { StealthIndicator } from "@/components/game/StealthIndicator";
import { SurvivalWarning } from "@/components/game/SurvivalWarning";
import { TouchOverlay } from "@/components/game/TouchOverlay";
import { TravelPanel } from "@/components/game/TravelPanel";
import { TravelTransition } from "@/components/game/TravelTransition";
import { TutorialHints } from "@/components/game/TutorialHints";
import { WorldMap } from "@/components/game/WorldMap";
import { GameScene } from "@/components/scene";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { usePlatform } from "@/hooks/usePlatform";
import { FrontierTerritory } from "@/src/game/data/worlds/frontier_territory";
import { getDoorSystem } from "@/src/game/engine/interiors/DoorSystem";
import { gameOrchestrator } from "@/src/game/GameOrchestrator";
import { hasTouchCapability, initializeInput } from "@/src/game/input/InputInitializer";
import { InputManager } from "@/src/game/input/InputManager";
import type { GamePhase, PanelType } from "@/src/game/store/types";
import {
  type InteractableEntity,
  type InteractionAction,
  type InteractionTarget,
  processInteraction,
} from "@/src/game/systems/InteractionSystem";
import { getInteriorManager } from "@/src/game/systems/InteriorManager";

// ============================================================================
// XR CONTROLLER REGISTRATION (web only)
// ============================================================================

// Register XR controller provider on web when xrStore is available.
// This runs at module load time so the provider is ready before the first frame.
if (Platform.OS === "web") {
  try {
    const { xrStore } = require("@/src/game/xr/XRSetup");
    if (xrStore) {
      const { XRControllerProvider } = require("@/src/game/input/providers/XRControllerProvider");
      const inputManager = InputManager.getInstance();
      // Only register if not already present (handles hot-reload)
      if (!inputManager.getProvider("xr-controller")) {
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
  i: { panel: "inventory" },
  I: { panel: "inventory" },
  j: { panel: "quests" },
  J: { panel: "quests" },
  m: { action: "worldmap" },
  M: { action: "worldmap" },
  Escape: { action: "menu" },
  c: { panel: "character" },
  C: { panel: "character" },
};

// ============================================================================
// INTERACTION HANDLING HOOK
// ============================================================================

/**
 * Executes an interaction action by dispatching to the game store.
 * Handles dialogue-to-shop escalation for merchant NPCs.
 */
function useInteractionDispatch() {
  const { startDialogue, openShop, collectWorldItem, addNotification } = useGameStoreShallow(
    (s) => ({
      startDialogue: s.startDialogue,
      openShop: s.openShop,
      collectWorldItem: s.collectWorldItem,
      addNotification: s.addNotification,
    }),
  );

  const interiorManager = getInteriorManager();

  const dispatch = useCallback(
    (action: InteractionAction) => {
      switch (action.type) {
        case "talk": {
          if (action.npcId) {
            startDialogue(action.npcId);
          }
          break;
        }
        case "shop": {
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
                const freshDialogue = require("@/src/game/store/webGameStore").gameStore.getState()
                  .dialogueState;
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
        case "enter": {
          if (action.buildingId && action.archetypeId) {
            // Open the door with animation before entering
            const doorSys = getDoorSystem();
            doorSys.openDoor(action.buildingId);
            interiorManager.enterBuilding(action.buildingId, action.archetypeId);
            addNotification("info", `Entered ${action.archetypeId.replace(/_/g, " ")}`);
          }
          break;
        }
        case "pickup": {
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
    travelTo: s.travelTo,
  }));

  // --- Loading screen state ---
  // Track individual loading stages. The loading screen stays visible until
  // all stages are done, preventing the ugly brown-terrain flash.
  const [loadingStages, setLoadingStages] = useState({
    storeReady: false,
    systemsStarted: false,
    sceneRendered: false,
  });

  const markStage = useCallback((stage: keyof typeof loadingStages) => {
    setLoadingStages((prev) => ({ ...prev, [stage]: true }));
  }, []);

  const allReady =
    loadingStages.storeReady && loadingStages.systemsStarted && loadingStages.sceneRendered;

  const stages: LoadingStage[] = [
    { key: "store", label: "Preparing the frontier...", done: loadingStages.storeReady },
    { key: "systems", label: "Starting subsystems...", done: loadingStages.systemsStarted },
    { key: "scene", label: "Rendering the world...", done: loadingStages.sceneRendered },
  ];

  // Mark store as ready when game state is initialized and in playing phase
  useEffect(() => {
    if (phase === "playing" && !loadingStages.storeReady) {
      markStage("storeReady");
    }
  }, [phase, loadingStages.storeReady, markStage]);

  // Scene ready callback (fired from SceneReadyDetector inside GameScene)
  const handleSceneReady = useCallback(() => {
    markStage("sceneRendered");
  }, [markStage]);

  // --- Interaction system state ---
  const [interactionTarget, setInteractionTarget] = useState<InteractionTarget | null>(null);
  const interactableEntitiesRef = useRef<InteractableEntity[]>([]);
  const dispatchInteraction = useInteractionDispatch();

  // --- Callback from EntitySpawner: receives NPC interactable entities ---
  const handleInteractablesChange = useCallback((entities: InteractableEntity[]) => {
    interactableEntitiesRef.current = entities;
  }, []);

  // --- World map toggle (not a panel type, separate state) ---
  const [worldMapOpen, setWorldMapOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // --- Touch detection state ---
  // Evaluated once then re-checked on fold/unfold via ResizeObserver
  // (foldable phones like Samsung Galaxy Z Fold, OnePlus Open).
  const [touchActive, setTouchActive] = useState(() => hasTouchCapability());

  // --- Navigate back to title screen when phase changes to 'title' ---
  // This handles "Quit to Title" from the pause menu and game over screen.
  useEffect(() => {
    if (phase === "title") {
      gameOrchestrator.teardown();
      router.replace("/");
    }
  }, [phase, router]);

  // --- Start systems and input on mount, teardown on unmount ---
  useEffect(() => {
    gameOrchestrator.startSystems();
    markStage("systemsStarted");
    const cleanupInput = initializeInput();
    return () => {
      cleanupInput();
      gameOrchestrator.teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Re-detect touch on fold/unfold (foldable phones) ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateTouch = () => {
      setTouchActive(hasTouchCapability());
    };
    if (typeof ResizeObserver === "undefined") return;
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
      phase === "playing" && !dialogueState && !shopState && !combatState && !travelState;

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
      const storeState =
        (gameOrchestrator as any)._getStoreState?.() ??
        require("@/src/game/store/webGameStore").gameStore.getState();
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
      const entity = interactableEntitiesRef.current.find((e) => e.npcId === prevNpcId && e.shopId);
      if (entity?.shopId) {
        // Small delay so the dialogue close animation plays
        const timerId = setTimeout(() => {
          const storeState = require("@/src/game/store/webGameStore").gameStore.getState();
          // Only open shop if we're back in playing phase
          if (storeState.phase === "playing") {
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
    if (Platform.OS !== "web") return;

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore input when typing in a text field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const binding = KEY_BINDINGS[e.key];
      if (!binding) return;

      e.preventDefault();

      // Disable panel/map toggling during travel, combat, dialogue
      const canToggleUI = phase === "playing" || phase === "paused";

      if (binding.panel && canToggleUI) {
        togglePanel(binding.panel);
      } else if (binding.action === "worldmap" && canToggleUI) {
        setWorldMapOpen((prev) => !prev);
      } else if (binding.action === "menu") {
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, activePanel, worldMapOpen, togglePanel, closePanel]);

  // --- Android back button ---
  useEffect(() => {
    if (Platform.OS === "web") return;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
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

  // --- Callbacks ---
  const handleCloseInventory = useCallback(() => {
    closePanel();
  }, [closePanel]);

  const handleCloseQuestLog = useCallback(() => {
    closePanel();
  }, [closePanel]);

  const handleCloseCharacter = useCallback(() => {
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

  // --- Directional damage callback (routes to DamageIndicator overlay) ---
  // Converts a 3D attack direction vector to a screen-space angle (degrees, 0 = top, clockwise).
  const handlePlayerDamageDirectional = useCallback(
    (damage: number, direction: { x: number; y: number; z: number }) => {
      // Get player rotation (yaw) from store to compute camera-relative angle
      const storeState = require("@/src/game/store/webGameStore").gameStore.getState();
      const playerYaw = storeState.playerRotation ?? 0;

      // Angle of attack direction in world XZ plane (atan2 gives angle from +Z axis)
      const worldAngle = Math.atan2(direction.x, direction.z);

      // Make camera-relative: subtract player yaw
      const relativeAngle = worldAngle - playerYaw;

      // Convert to degrees, 0 = top/north, clockwise
      const degrees = ((relativeAngle * 180) / Math.PI + 360) % 360;

      // Scale intensity based on damage (10 dmg = 0.5 intensity, 30+ = 1.0)
      const intensity = Math.min(1, Math.max(0.3, damage / 30));

      DamageIndicator.trigger(degrees, intensity);
    },
    [],
  );

  // --- Determine what to show ---
  const isExploring =
    phase === "playing" && !dialogueState && !shopState && !combatState && !travelState;
  const isDialogue = phase === "dialogue" || !!dialogueState;
  const isShopping = !!shopState;
  const isTraveling = phase === "travel" || !!travelState;
  const isGameOver = phase === "game_over";
  const isPuzzle = phase === "puzzle" || !!activePuzzle;
  const shouldPauseTime =
    !!activePanel || menuOpen || worldMapOpen || isDialogue || isShopping || isGameOver;

  return (
    <AudioProvider>
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
              onPlayerDamageDirectional={handlePlayerDamageDirectional}
              onInteractablesChange={handleInteractablesChange}
              onSceneReady={handleSceneReady}
              world={FrontierTerritory}
            />
          </Canvas>
        </View>

        {/* Top layer: React Native HUD overlay */}
        <View className="absolute inset-0" pointerEvents="box-none">
          {/* ============================================================ */}
          {/* ALWAYS VISIBLE — immersive feedback layers                   */}
          {/* ============================================================ */}

          {/* Directional damage indicators (full-screen arcs) */}
          <DamageIndicator />

          {/* Red damage flash overlay (scales with damage intensity) */}
          <DamageFlash />

          {/* Low-health vignette: screen edges redden as HP drops */}
          <LowHealthVignette />

          {/* Notification toast feed (item pickups, XP gains, etc.) */}
          <NotificationFeed />

          {/* Quest notification toasts (upper-right, slide-in) */}
          <QuestNotification />

          {/* Location entry notification (centered, large text, fades) */}
          <LocationEntry />

          {/* Tutorial hints (bottom-center, timed sequence for new players) */}
          {isExploring && <TutorialHints />}

          {/* ============================================================ */}
          {/* MINIMAL DEFAULT HUD — always visible while exploring         */}
          {/* ============================================================ */}

          {/* Crosshair: subtle center dot/bracket (always visible) */}
          {isExploring && !menuOpen && !worldMapOpen && !activePanel && (
            <Crosshair visible isTargetingInteractable={!!interactionTarget} />
          )}

          {/* Compass bar: thin strip at top-center */}
          {isExploring && !menuOpen && !worldMapOpen && !activePanel && <CompassBar />}

          {/* HP bar only (bottom-left, thin, minimal — no name/level/XP) */}
          {isExploring && !menuOpen && !worldMapOpen && !activePanel && <PlayerVitals />}

          {/* Quest objective: typewriter text, bottom-center, auto-fades */}
          {isExploring && !menuOpen && !worldMapOpen && !activePanel && <QuestObjectiveToast />}

          {/* ============================================================ */}
          {/* SHOW ON DEMAND — fade in when relevant, fade out after       */}
          {/* ============================================================ */}

          {/* Ammo display: only visible when weapon is equipped (AmmoDisplay
            already returns null when no weapon is equipped) */}
          {isExploring && !menuOpen && !worldMapOpen && !activePanel && <AmmoDisplay />}

          {/* Location name handled by LocationEntry (always-visible layer above).
            Shows full-screen centered text on area transitions. */}

          {/* Survival warnings: fatigue/hunger/thirst only when in warning state */}
          {isExploring && !menuOpen && !worldMapOpen && !activePanel && <SurvivalWarning />}

          {/* Stealth detection indicator: only when near hostiles */}
          {isExploring && !menuOpen && !worldMapOpen && !activePanel && <StealthIndicator />}

          {/* Interaction prompt (center-bottom, Fallout-style amber glow text) */}
          {isExploring && !menuOpen && !worldMapOpen && !activePanel && (
            <InteractionPrompt target={interactionTarget} />
          )}

          {/* Touch overlay — virtual joystick + action buttons for mobile/tablet */}
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
          <InventoryPanel visible={activePanel === "inventory"} onClose={handleCloseInventory} />

          {/* Character Panel (C key) */}
          <CharacterPanel visible={activePanel === "character"} onClose={handleCloseCharacter} />

          {/* Quest Log (J key) */}
          <QuestLog open={activePanel === "quests"} onClose={handleCloseQuestLog} />

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

          {/* NOTE: EnterVRButton and MAP button removed from default HUD.
            VR entry is available from the pause menu (MainMenu).
            World map is accessed via M key or from the pause menu. */}
        </View>

        {/* --- LOADING SCREEN OVERLAY --- */}
        {/* Sits above everything (zIndex 999). Fades out and unmounts once
          all loading stages report ready. */}
        <LoadingScreen stages={stages} allReady={allReady} />
      </View>
    </AudioProvider>
  );
}
