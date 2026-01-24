// Iron Frontier - Hex-Tile Based Western RPG
// Fallout 2-style isometric view with Kenney Hexagon Kit tiles

import { useEffect, useRef, useState, useCallback } from 'react';
import { HexSceneManager, type HexWorldPosition } from '../engine/hex';
import { TitleScreen } from './screens/TitleScreen';
import { useGameStore } from './store/gameStore';

// World/location data
import { getLocationData } from '../data/worlds/index';

// Import decoupled UI components
import { ActionBar } from './ui/ActionBar';
import { DialogueBox } from './ui/DialogueBox';
import { GameHUD } from './ui/GameHUD';
import { InventoryPanel } from './ui/InventoryPanel';
import { MenuPanel } from './ui/MenuPanel';
import { NotificationFeed } from './ui/NotificationFeed';
import { QuestLog } from './ui/QuestLog';
import { SettingsPanel } from './ui/SettingsPanel';
import { WorldMap } from './ui/WorldMap';

// ============================================================================
// GAME CANVAS - Babylon.js 3D Scene with Hex Tiles
// ============================================================================

function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneManagerRef = useRef<HexSceneManager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    worldSeed,
    playerPosition,
    setPlayerPosition,
    phase,
    loadedWorld,
    currentLocationId,
    initWorld,
  } = useGameStore();

  // Initialize world on first play
  useEffect(() => {
    if (phase === 'playing' && !loadedWorld) {
      console.log('[GameCanvas] Initializing world: frontier_territory');
      initWorld('frontier_territory');
    }
  }, [phase, loadedWorld, initWorld]);

  // Initialize scene - handle React 18 StrictMode properly
  useEffect(() => {
    if (!canvasRef.current || (phase !== 'playing' && phase !== 'dialogue' && phase !== 'paused')) return;

    // Wait for world to be loaded
    if (!loadedWorld || !currentLocationId) {
      console.log('[GameCanvas] Waiting for world to load...');
      return;
    }

    // If we already have a scene manager, don't create another
    if (sceneManagerRef.current) {
      console.log('[GameCanvas] Scene already exists, skipping');
      return;
    }

    // Track if this specific effect instance should continue
    let effectCancelled = false;

    async function initScene() {
      if (!canvasRef.current || !loadedWorld || !currentLocationId) return;

      try {
        setIsLoading(true);
        setLoadError(null);

        console.log('[GameCanvas] Creating HexSceneManager...');

        // Create hex scene manager
        const manager = new HexSceneManager(canvasRef.current, {
          seed: worldSeed,
          mapWidth: 32,
          mapHeight: 32,
          hexSize: 1,
        });

        // Get the current location data from the loaded world
        const resolvedLocation = loadedWorld.getLocation(currentLocationId);
        const locationData = resolvedLocation ? getLocationData(resolvedLocation) : null;

        // Initialize with location data (or procedural if none)
        if (locationData) {
          console.log(`[GameCanvas] Loading location: ${locationData.name}`);
          await manager.init(locationData);
        } else {
          console.log('[GameCanvas] No location data, using procedural generation');
          await manager.init();
        }

        // Check if effect was cancelled during async init
        if (effectCancelled) {
          console.log('[GameCanvas] Effect cancelled during init, disposing');
          manager.dispose();
          return;
        }

        // Store the manager
        sceneManagerRef.current = manager;

        // Handle ground clicks for movement
        manager.setGroundClickHandler((pos: HexWorldPosition) => {
          const height = manager.getHeightAt(pos.x, pos.z);
          setPlayerPosition({ x: pos.x, y: height, z: pos.z });
        });

        // Start render loop
        manager.start();
        setIsLoading(false);

        console.log('[GameCanvas] Hex scene initialized successfully');
      } catch (err) {
        console.error('[GameCanvas] Failed to initialize scene:', err);
        if (!effectCancelled) {
          setLoadError(err instanceof Error ? err.message : 'Unknown error');
          setIsLoading(false);
        }
      }
    }

    initScene();

    return () => {
      effectCancelled = true;
      // Only dispose if we actually have a manager AND the deps changed
      // In StrictMode, this cleanup runs but sceneManagerRef might be null
      // The next effect run will see sceneManagerRef.current and skip
    };
  }, [worldSeed, phase, loadedWorld, currentLocationId]);

  // Separate cleanup effect for actual unmount
  useEffect(() => {
    return () => {
      if (sceneManagerRef.current) {
        console.log('[GameCanvas] Final cleanup: disposing scene manager');
        sceneManagerRef.current.dispose();
        sceneManagerRef.current = null;
      }
    };
  }, []);

  // Track previous location to detect travel
  const prevLocationRef = useRef<string | null>(null);

  // Handle location changes (travel)
  useEffect(() => {
    // Skip if no scene manager or world
    if (!sceneManagerRef.current || !loadedWorld || !currentLocationId) return;

    // Skip initial load (handled by scene init)
    if (prevLocationRef.current === null) {
      prevLocationRef.current = currentLocationId;
      return;
    }

    // Skip if location hasn't changed
    if (prevLocationRef.current === currentLocationId) return;

    console.log(`[GameCanvas] Location changed: ${prevLocationRef.current} -> ${currentLocationId}`);
    prevLocationRef.current = currentLocationId;

    // Reload scene with new location
    const reloadLocation = async () => {
      if (!sceneManagerRef.current || !loadedWorld) return;

      setIsLoading(true);

      try {
        // Dispose and recreate scene manager for new location
        sceneManagerRef.current.dispose();

        const manager = new HexSceneManager(canvasRef.current!, {
          seed: worldSeed,
          mapWidth: 32,
          mapHeight: 32,
          hexSize: 1,
        });

        const resolvedLocation = loadedWorld.getLocation(currentLocationId);
        const locationData = resolvedLocation ? getLocationData(resolvedLocation) : null;

        if (locationData) {
          console.log(`[GameCanvas] Loading new location: ${locationData.name}`);
          await manager.init(locationData);
        } else {
          console.log('[GameCanvas] No location data for new location, using procedural');
          await manager.init();
        }

        sceneManagerRef.current = manager;

        manager.setGroundClickHandler((pos: HexWorldPosition) => {
          const height = manager.getHeightAt(pos.x, pos.z);
          setPlayerPosition({ x: pos.x, y: height, z: pos.z });
        });

        manager.start();
        setIsLoading(false);
      } catch (err) {
        console.error('[GameCanvas] Failed to reload location:', err);
        setLoadError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    reloadLocation();
  }, [currentLocationId, loadedWorld, worldSeed, setPlayerPosition]);

  // Update player position when it changes externally
  useEffect(() => {
    if (sceneManagerRef.current && (phase === 'playing' || phase === 'dialogue')) {
      sceneManagerRef.current.setPlayerPosition(playerPosition);
    }
  }, [playerPosition, phase]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        id="game-canvas"
        className="w-full h-full touch-none"
        style={{ outline: 'none' }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-950/80">
          <div className="text-center">
            <div className="text-amber-500 text-xl mb-2">Loading Iron Frontier...</div>
            <div className="text-stone-400 text-sm">Generating hex terrain</div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-950/90">
          <div className="text-center max-w-md p-4">
            <div className="text-red-500 text-xl mb-2">Failed to load game</div>
            <div className="text-stone-400 text-sm mb-4">{loadError}</div>
            <button
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN GAME COMPONENT
// ============================================================================

export function Game() {
  const { phase, travelTo } = useGameStore();
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // 'M' key opens world map
      if (e.key === 'm' || e.key === 'M') {
        if (phase === 'playing') {
          setIsWorldMapOpen(prev => !prev);
        }
      }

      // Escape closes world map
      if (e.key === 'Escape' && isWorldMapOpen) {
        setIsWorldMapOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isWorldMapOpen]);

  // Handle travel from world map
  const handleTravelTo = useCallback((locationId: string) => {
    travelTo(locationId);
    setIsWorldMapOpen(false);
  }, [travelTo]);

  // Show title screen
  if (phase === 'title') {
    return (
      <div className="fixed inset-0 bg-stone-950">
        <TitleScreen />
      </div>
    );
  }

  // Main game view
  return (
    <div className="relative w-full h-full min-h-screen bg-stone-950 overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <GameCanvas />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <GameHUD />
          <ActionBar onOpenMap={() => setIsWorldMapOpen(true)} />
          <DialogueBox />
          <NotificationFeed />
        </div>
      </div>

      {/* Modal Panels */}
      <InventoryPanel />
      <QuestLog />
      <SettingsPanel />
      <MenuPanel />

      {/* World Map */}
      <WorldMap
        isOpen={isWorldMapOpen}
        onClose={() => setIsWorldMapOpen(false)}
        onTravelTo={handleTravelTo}
      />
    </div>
  );
}

export default Game;
