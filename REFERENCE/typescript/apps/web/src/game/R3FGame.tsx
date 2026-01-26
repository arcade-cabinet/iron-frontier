/**
 * R3FGame - Main game component using React Three Fiber
 *
 * This is the primary game component using Three.js via React Three Fiber.
 * It provides:
 * - R3F Canvas with appropriate settings
 * - Scene routing based on game phase
 * - React DOM UI overlay (HUD, panels, menus)
 * - Audio initialization
 * - Keyboard shortcuts
 */

import { Canvas } from '@react-three/fiber';
import { useEffect, useState, useCallback, Suspense } from 'react';

import { TitleScreen } from './screens/TitleScreen';
import { SceneRouter } from './SceneRouter';
import { GameOverlay, LoadingOverlay, ErrorOverlay } from './GameOverlay';
import { useGameStore } from './store/webGameStore';
import { useGamePhase, useGameLoading } from './useGamePhase';
import { audioService } from './services/AudioService';

/**
 * R3F Canvas configuration
 */
const CANVAS_CONFIG = {
  // WebGL settings
  gl: {
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance' as const,
    stencil: false,
    depth: true,
  },
  // Shadow settings
  shadows: true,
  // Default camera (will be overridden by scenes)
  camera: {
    fov: 45,
    near: 0.1,
    far: 1000,
    position: [0, 15, 25] as [number, number, number],
  },
  // Performance
  dpr: [1, 2] as [number, number],
  // Event handling
  events: undefined,
  // Flat renderer (no tone mapping)
  flat: false,
};

/**
 * 3D Scene wrapper with error boundary
 */
function SceneContainer() {
  const [error, setError] = useState<string | null>(null);
  const { isLoading, loadingMessage } = useGameLoading();
  const { phase, shouldRender3D } = useGamePhase();
  const { loadedWorld, currentLocationId, initWorld } = useGameStore();

  // Initialize world on first play
  useEffect(() => {
    if (phase === 'playing' && !loadedWorld) {
      console.log('[R3FGame] Initializing world: frontier_territory');
      initWorld('frontier_territory');
    }
  }, [phase, loadedWorld, initWorld]);

  // Show loading state
  if (isLoading) {
    return <LoadingOverlay message={loadingMessage} />;
  }

  // Show error state
  if (error) {
    return (
      <ErrorOverlay
        error={error}
        onRetry={() => {
          setError(null);
          window.location.reload();
        }}
      />
    );
  }

  // Don't render 3D scene if phase doesn't require it
  if (!shouldRender3D) {
    return null;
  }

  return (
    <Canvas {...CANVAS_CONFIG}>
      <SceneRouter
        onSceneChange={(scene) => {
          console.log('[R3FGame] Scene changed to:', scene);
        }}
      />
    </Canvas>
  );
}

/**
 * R3FGame - Main React Three Fiber game component
 */
export function R3FGame() {
  const { phase, isInGame } = useGamePhase();
  const { time, weather, updateTime } = useGameStore();
  const [initialized, setInitialized] = useState(false);

  // Initialize audio system
  useEffect(() => {
    audioService.initialize();
    setInitialized(true);
  }, []);

  // Time Cycle - advance time while playing
  useEffect(() => {
    if (phase !== 'playing') return;

    const timer = setInterval(() => {
      updateTime(0.1); // Advance 0.1 hours every second -> 1 hour every 10 seconds
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, updateTime]);

  // Show title screen before entering game
  if (phase === 'title') {
    return (
      <div className="fixed inset-0 bg-stone-950">
        <TitleScreen />
      </div>
    );
  }

  // Main game view with R3F
  return (
    <div className="relative w-full h-full min-h-screen bg-stone-950 overflow-hidden">
      {/* R3F Canvas */}
      <div className="absolute inset-0">
        <SceneContainer />
      </div>

      {/* UI Overlay - rendered on top of 3D canvas */}
      <GameOverlay showHUD={isInGame} showActionBar={isInGame && phase === 'playing'} />
    </div>
  );
}

export default R3FGame;
