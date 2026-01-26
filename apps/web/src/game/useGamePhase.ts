/**
 * useGamePhase - Hook for managing game phase state and transitions
 *
 * Provides access to the current game phase from the store,
 * handles phase transitions, and provides loading states.
 */

import { useCallback, useEffect, useState } from 'react';
import { useGameStore, type GamePhase } from './store/webGameStore';

/**
 * Phase metadata for transition handling
 */
interface PhaseMetadata {
  /** Whether the phase requires 3D scene rendering */
  requires3D: boolean;
  /** Whether the phase allows UI overlays */
  allowsOverlay: boolean;
  /** Whether this phase can be interrupted by other phases */
  interruptible: boolean;
  /** Phases that can transition to this phase */
  validTransitionsFrom: GamePhase[];
}

const PHASE_METADATA: Record<GamePhase, PhaseMetadata> = {
  title: {
    requires3D: false,
    allowsOverlay: false,
    interruptible: false,
    validTransitionsFrom: ['game_over', 'loading'],
  },
  loading: {
    requires3D: false,
    allowsOverlay: false,
    interruptible: false,
    validTransitionsFrom: ['title'],
  },
  playing: {
    requires3D: true,
    allowsOverlay: true,
    interruptible: true,
    validTransitionsFrom: ['title', 'loading', 'paused', 'dialogue', 'inventory', 'combat', 'puzzle'],
  },
  paused: {
    requires3D: true,
    allowsOverlay: true,
    interruptible: true,
    validTransitionsFrom: ['playing'],
  },
  dialogue: {
    requires3D: true,
    allowsOverlay: true,
    interruptible: true,
    validTransitionsFrom: ['playing'],
  },
  inventory: {
    requires3D: true,
    allowsOverlay: true,
    interruptible: true,
    validTransitionsFrom: ['playing', 'paused'],
  },
  combat: {
    requires3D: true,
    allowsOverlay: true,
    interruptible: false,
    validTransitionsFrom: ['playing'],
  },
  puzzle: {
    requires3D: true,
    allowsOverlay: true,
    interruptible: false,
    validTransitionsFrom: ['playing'],
  },
  game_over: {
    requires3D: false,
    allowsOverlay: false,
    interruptible: false,
    validTransitionsFrom: ['combat', 'playing'],
  },
};

export interface UseGamePhaseResult {
  /** Current game phase */
  phase: GamePhase;
  /** Previous game phase (for transitions) */
  previousPhase: GamePhase | null;
  /** Whether the phase requires 3D rendering */
  requires3D: boolean;
  /** Whether UI overlay is allowed in current phase */
  allowsOverlay: boolean;
  /** Whether currently transitioning between phases */
  isTransitioning: boolean;
  /** Whether the game is in a "playing" state (playing, dialogue, paused) */
  isInGame: boolean;
  /** Whether the game is in combat mode */
  isInCombat: boolean;
  /** Whether the 3D scene should be rendered */
  shouldRender3D: boolean;
  /** Set phase with optional transition callback */
  setPhase: (newPhase: GamePhase, onTransitionComplete?: () => void) => void;
  /** Reset to title screen */
  resetToTitle: () => void;
}

/**
 * Hook to get and manage game phase from the store
 */
export function useGamePhase(): UseGamePhaseResult {
  const phase = useGameStore((state) => state.phase);
  const setStorePhase = useGameStore((state) => state.setPhase);
  const resetGame = useGameStore((state) => state.resetGame);

  const [previousPhase, setPreviousPhase] = useState<GamePhase | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Track phase changes
  useEffect(() => {
    setPreviousPhase((prev) => {
      if (prev !== phase) {
        return prev;
      }
      return prev;
    });
  }, [phase]);

  const metadata = PHASE_METADATA[phase];

  const setPhase = useCallback(
    (newPhase: GamePhase, onTransitionComplete?: () => void) => {
      setPreviousPhase(phase);
      setIsTransitioning(true);

      // Perform the transition
      setStorePhase(newPhase);

      // Short delay for transition animation
      setTimeout(() => {
        setIsTransitioning(false);
        onTransitionComplete?.();
      }, 100);
    },
    [phase, setStorePhase]
  );

  const resetToTitle = useCallback(() => {
    resetGame();
    setStorePhase('title');
    setPreviousPhase(null);
  }, [resetGame, setStorePhase]);

  // Determine if we're in a game state
  const isInGame = phase === 'playing' || phase === 'dialogue' || phase === 'paused' || phase === 'inventory' || phase === 'combat' || phase === 'puzzle';
  const isInCombat = phase === 'combat';

  // Determine if 3D scene should render
  const shouldRender3D = metadata.requires3D && !isTransitioning;

  return {
    phase,
    previousPhase,
    requires3D: metadata.requires3D,
    allowsOverlay: metadata.allowsOverlay,
    isTransitioning,
    isInGame,
    isInCombat,
    shouldRender3D,
    setPhase,
    resetToTitle,
  };
}

/**
 * Hook to check if a specific phase is active
 */
export function useIsPhase(...phases: GamePhase[]): boolean {
  const phase = useGameStore((state) => state.phase);
  return phases.includes(phase);
}

/**
 * Hook to get loading state based on phase and world initialization
 */
export function useGameLoading(): {
  isLoading: boolean;
  loadingMessage: string;
} {
  const phase = useGameStore((state) => state.phase);
  const loadedWorld = useGameStore((state) => state.loadedWorld);
  const currentLocationId = useGameStore((state) => state.currentLocationId);

  if (phase === 'loading') {
    return { isLoading: true, loadingMessage: 'Loading game...' };
  }

  if (phase === 'playing' && !loadedWorld) {
    return { isLoading: true, loadingMessage: 'Loading world...' };
  }

  if (phase === 'playing' && !currentLocationId) {
    return { isLoading: true, loadingMessage: 'Entering location...' };
  }

  return { isLoading: false, loadingMessage: '' };
}

export default useGamePhase;
