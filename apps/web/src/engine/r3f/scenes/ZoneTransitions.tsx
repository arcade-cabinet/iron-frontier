/**
 * ZoneTransitions.tsx - Handle zone entry/exit with visual effects
 *
 * Features:
 * - Detect when player enters town bounds
 * - Trigger scene transitions with fade effects
 * - Support for different transition types (fade, wipe, dissolve)
 * - Uses R3F postprocessing for visual effects
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

import { getZoneSystem, type Zone, type ZoneTransition } from '@iron-frontier/shared/systems';
import { useGameStore } from '../../../game/store/webGameStore';

// ============================================================================
// TYPES
// ============================================================================

export interface ZoneTransitionsProps {
  /** Whether a transition is currently in progress */
  isTransitioning: boolean;
  /** Called when transition starts */
  onTransitionStart?: () => void;
  /** Called when transition completes */
  onTransitionEnd?: () => void;
  /** Called when entering a new zone */
  onZoneEnter?: (zone: Zone) => void;
  /** Transition duration in seconds */
  transitionDuration?: number;
}

export type TransitionType = 'fade' | 'wipe' | 'dissolve' | 'iris';

interface TransitionState {
  active: boolean;
  type: TransitionType;
  progress: number;
  direction: 'in' | 'out';
  targetZone: Zone | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Default transition duration */
const DEFAULT_TRANSITION_DURATION = 0.8;

/** Fade color (black for dramatic effect) */
const FADE_COLOR = new THREE.Color(0x000000);

/** Sepia tint for Western feel */
const SEPIA_TINT = new THREE.Color(0x2a1f1a);

// ============================================================================
// TRANSITION OVERLAY COMPONENT
// ============================================================================

interface TransitionOverlayProps {
  progress: number;
  type: TransitionType;
  direction: 'in' | 'out';
  targetZoneName?: string;
}

function TransitionOverlay({ progress, type, direction, targetZoneName }: TransitionOverlayProps) {
  // Calculate actual opacity based on direction
  // 'out' = fade to black (0 -> 1)
  // 'in' = fade from black (1 -> 0)
  const effectiveProgress = direction === 'out' ? progress : 1 - progress;

  return (
    <Html
      fullscreen
      style={{
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Fade effect */}
        {type === 'fade' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: `rgba(0, 0, 0, ${effectiveProgress})`,
              transition: 'none',
            }}
          />
        )}

        {/* Wipe effect (horizontal) */}
        {type === 'wipe' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: direction === 'out' ? 0 : `${(1 - effectiveProgress) * 100}%`,
              width: `${effectiveProgress * 100}%`,
              height: '100%',
              backgroundColor: 'black',
              transition: 'none',
            }}
          />
        )}

        {/* Iris effect (circular) */}
        {type === 'iris' && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${(1 - effectiveProgress) * 200}vmax`,
              height: `${(1 - effectiveProgress) * 200}vmax`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              boxShadow: `0 0 0 100vmax black`,
              transition: 'none',
            }}
          />
        )}

        {/* Dissolve effect (noise pattern) */}
        {type === 'dissolve' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              opacity: effectiveProgress,
              // Could add noise texture via CSS filter
              filter: `contrast(${1 + effectiveProgress * 0.5})`,
              transition: 'none',
            }}
          />
        )}

        {/* Zone name display during mid-transition */}
        {targetZoneName && effectiveProgress > 0.5 && (
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              color: '#f5e6d3',
              fontFamily: 'serif',
              fontSize: '32px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              opacity: Math.min(1, (effectiveProgress - 0.5) * 4),
              textAlign: 'center',
            }}
          >
            {targetZoneName}
          </div>
        )}
      </div>
    </Html>
  );
}

// ============================================================================
// MAIN ZONE TRANSITIONS COMPONENT
// ============================================================================

export function ZoneTransitions({
  isTransitioning,
  onTransitionStart,
  onTransitionEnd,
  onZoneEnter,
  transitionDuration = DEFAULT_TRANSITION_DURATION,
}: ZoneTransitionsProps) {
  // Transition state
  const [transition, setTransition] = useState<TransitionState>({
    active: false,
    type: 'fade',
    progress: 0,
    direction: 'out',
    targetZone: null,
  });

  // Refs for animation
  const transitionStartTime = useRef<number>(0);
  const pendingZone = useRef<Zone | null>(null);

  // Game store
  const setPhase = useGameStore((s) => s.setPhase);

  // Start a transition
  const startTransition = useCallback(
    (zone: Zone, type: TransitionType = 'fade') => {
      if (transition.active) return;

      pendingZone.current = zone;
      transitionStartTime.current = performance.now();

      setTransition({
        active: true,
        type,
        progress: 0,
        direction: 'out',
        targetZone: zone,
      });

      onTransitionStart?.();
    },
    [transition.active, onTransitionStart]
  );

  // Listen for zone transition triggers
  useEffect(() => {
    const zoneSystem = getZoneSystem();

    const unsubscribe = zoneSystem.onZoneChange((newZone, prevZone) => {
      // Only trigger transition when entering a town from outside
      if (newZone?.type === 'town' && prevZone?.type !== 'town') {
        startTransition(newZone, 'fade');
      }
      // Could also trigger when leaving towns, entering dungeons, etc.
    });

    return () => {
      unsubscribe();
    };
  }, [startTransition]);

  // Animation loop for transitions
  useFrame(() => {
    if (!transition.active) return;

    const elapsed = (performance.now() - transitionStartTime.current) / 1000;
    const totalDuration = transitionDuration * 2; // out + in

    if (elapsed < transitionDuration) {
      // Fading out phase
      const progress = Math.min(1, elapsed / transitionDuration);
      setTransition((prev) => ({
        ...prev,
        progress,
        direction: 'out',
      }));
    } else if (elapsed < totalDuration) {
      // Fading in phase
      const progress = Math.min(1, (elapsed - transitionDuration) / transitionDuration);

      // At the midpoint, trigger zone enter callback
      if (transition.direction === 'out' && pendingZone.current) {
        onZoneEnter?.(pendingZone.current);
      }

      setTransition((prev) => ({
        ...prev,
        progress,
        direction: 'in',
      }));
    } else {
      // Transition complete
      setTransition({
        active: false,
        type: 'fade',
        progress: 0,
        direction: 'out',
        targetZone: null,
      });
      pendingZone.current = null;
      onTransitionEnd?.();
    }
  });

  // Render transition overlay when active
  if (!transition.active) return null;

  return (
    <TransitionOverlay
      progress={transition.progress}
      type={transition.type}
      direction={transition.direction}
      targetZoneName={transition.targetZone?.name}
    />
  );
}

// ============================================================================
// TRANSITION TRIGGER HOOK
// ============================================================================

/**
 * Hook to manually trigger zone transitions
 */
export function useZoneTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const triggerTransition = useCallback(
    (type: TransitionType = 'fade', duration: number = DEFAULT_TRANSITION_DURATION) => {
      return new Promise<void>((resolve) => {
        setIsTransitioning(true);

        // Simple timeout-based transition for manual triggers
        setTimeout(() => {
          setIsTransitioning(false);
          resolve();
        }, duration * 2000);
      });
    },
    []
  );

  return {
    isTransitioning,
    triggerTransition,
  };
}

export default ZoneTransitions;
