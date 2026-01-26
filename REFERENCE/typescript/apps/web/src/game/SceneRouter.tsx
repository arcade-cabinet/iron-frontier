/**
 * SceneRouter - Routes between R3F scenes based on game state
 *
 * Handles:
 * - Scene selection based on game phase
 * - Scene transitions with Suspense boundaries
 * - Loading states during scene changes
 * - Error boundaries for scene failures
 */

import { Suspense, lazy, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useGameStore } from './store/webGameStore';
import { useGamePhase, useGameLoading } from './useGamePhase';

// Lazy load scenes to enable code splitting
const OverworldSceneR3F = lazy(() => import('./scenes/r3f/OverworldSceneR3F'));
const CombatSceneR3F = lazy(() => import('./scenes/r3f/CombatSceneR3F'));

/**
 * Scene type enumeration for routing
 */
export type SceneType = 'overworld' | 'combat' | 'none';

/**
 * Determine which scene to render based on game phase
 */
function useCurrentScene(): SceneType {
  const phase = useGameStore((state) => state.phase);
  const combatState = useGameStore((state) => state.combatState);

  return useMemo(() => {
    // Combat scene takes priority when in combat
    if (phase === 'combat' && combatState) {
      return 'combat';
    }

    // Overworld scene for gameplay phases
    if (phase === 'playing' || phase === 'dialogue' || phase === 'paused' || phase === 'puzzle') {
      return 'overworld';
    }

    return 'none';
  }, [phase, combatState]);
}

/**
 * Scene loading fallback component
 */
function SceneLoadingFallback() {
  return (
    <>
      {/* Simple loading indicator within the 3D scene */}
      <ambientLight intensity={0.3} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d97706" wireframe />
      </mesh>
    </>
  );
}

/**
 * Props for SceneRouter
 */
export interface SceneRouterProps {
  /** Optional callback when scene changes */
  onSceneChange?: (scene: SceneType) => void;
  /** Whether to enable scene transitions */
  enableTransitions?: boolean;
  /** Custom loading fallback */
  loadingFallback?: ReactNode;
}

/**
 * SceneRouter - Main component for routing between R3F scenes
 */
export function SceneRouter({
  onSceneChange,
  enableTransitions = true,
  loadingFallback,
}: SceneRouterProps) {
  const currentScene = useCurrentScene();
  const [transitionScene, setTransitionScene] = useState<SceneType>(currentScene);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isLoading } = useGameLoading();

  // Handle scene transitions
  useEffect(() => {
    if (currentScene !== transitionScene) {
      if (enableTransitions) {
        // Start transition
        setIsTransitioning(true);

        // Brief delay for transition effect
        const timer = setTimeout(() => {
          setTransitionScene(currentScene);
          setIsTransitioning(false);
          onSceneChange?.(currentScene);
        }, 100);

        return () => clearTimeout(timer);
      } else {
        // Immediate switch
        setTransitionScene(currentScene);
        onSceneChange?.(currentScene);
      }
    }
  }, [currentScene, transitionScene, enableTransitions, onSceneChange]);

  // Notify on initial scene
  useEffect(() => {
    onSceneChange?.(currentScene);
  }, []);

  // Don't render scenes during initial loading
  if (isLoading || transitionScene === 'none') {
    return loadingFallback ?? <SceneLoadingFallback />;
  }

  // Render appropriate scene with Suspense boundary
  return (
    <Suspense fallback={loadingFallback ?? <SceneLoadingFallback />}>
      {transitionScene === 'combat' ? (
        <CombatSceneR3F />
      ) : transitionScene === 'overworld' ? (
        <OverworldSceneR3F />
      ) : null}
    </Suspense>
  );
}

/**
 * Hook to get current scene type
 */
export function useSceneType(): SceneType {
  return useCurrentScene();
}

/**
 * Hook to check if a specific scene is active
 */
export function useIsScene(scene: SceneType): boolean {
  const currentScene = useCurrentScene();
  return currentScene === scene;
}

export default SceneRouter;
