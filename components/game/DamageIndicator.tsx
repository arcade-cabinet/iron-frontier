/**
 * DamageIndicator — Directional damage arcs overlaid on the full screen.
 *
 * When the player takes damage from a direction, a red arc/wedge appears
 * pointing toward the source. Multiple simultaneous indicators are supported.
 * Each arc fades out over ~1 second.
 *
 * Uses an imperative API (DamageIndicator.trigger) so the combat system
 * can fire indicators without React re-renders.
 *
 * @module components/game/DamageIndicator
 */

import * as React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

// ============================================================================
// CONSTANTS
// ============================================================================

const HUD_RED = "#CC4444";
const FADE_DURATION_MS = 1000;
const MAX_INDICATORS = 4;

// ============================================================================
// TYPES
// ============================================================================

interface DamageArc {
  id: number;
  /** Angle in degrees, 0 = top/north, clockwise */
  angle: number;
  /** Intensity 0-1, affects opacity */
  intensity: number;
}

// ============================================================================
// ARC COMPONENT
// ============================================================================

interface ArcProps {
  angle: number;
  intensity: number;
  onComplete: () => void;
}

function DamageArc({ angle, intensity, onComplete }: ArcProps) {
  const opacity = useSharedValue(intensity);

  React.useEffect(() => {
    opacity.value = withTiming(
      0,
      {
        duration: FADE_DURATION_MS,
        easing: Easing.out(Easing.quad),
      },
      (finished) => {
        if (finished) {
          scheduleOnRN(() => {
            onComplete();
          });
        }
      },
    );
  }, [opacity, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // The arc is a wedge shape positioned at the edge of the screen
  // pointing inward from the damage direction.
  // We use a rotated gradient-like approach with View transforms.
  const arcSize = 120;
  const arcThickness = 30;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: "50%",
          left: "50%",
          width: arcSize,
          height: arcThickness,
          marginLeft: -arcSize / 2,
          marginTop: -arcSize * 0.8, // Place near edge
          // Rotate to point toward damage source
          transform: [
            { translateY: arcSize * 0.3 },
            { rotate: `${angle}deg` },
            { translateY: -arcSize * 0.3 },
          ],
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      {/* Gradient-like wedge using nested views */}
      <View
        style={{
          width: "100%",
          height: "100%",
          borderRadius: arcSize / 2,
          backgroundColor: HUD_RED,
          opacity: 0.6,
        }}
      />
    </Animated.View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

let _nextId = 0;
type TriggerFn = (angle: number, intensity?: number) => void;
let _triggerFn: TriggerFn | null = null;

export function DamageIndicator() {
  const [arcs, setArcs] = React.useState<DamageArc[]>([]);

  const trigger = React.useCallback((angle: number, intensity = 0.7) => {
    const id = _nextId++;
    setArcs((prev) => {
      // Limit max simultaneous indicators
      const next = [...prev, { id, angle, intensity }];
      return next.length > MAX_INDICATORS ? next.slice(-MAX_INDICATORS) : next;
    });
  }, []);

  // Register imperative trigger
  React.useEffect(() => {
    _triggerFn = trigger;
    return () => {
      _triggerFn = null;
    };
  }, [trigger]);

  const removeArc = React.useCallback((id: number) => {
    setArcs((prev) => prev.filter((a) => a.id !== id));
  }, []);

  if (arcs.length === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      pointerEvents="none"
    >
      {arcs.map((arc) => (
        <DamageArc
          key={arc.id}
          angle={arc.angle}
          intensity={arc.intensity}
          onComplete={() => removeArc(arc.id)}
        />
      ))}
    </View>
  );
}

/**
 * Imperative API: show a directional damage indicator.
 *
 * @param angle - Direction of damage in degrees (0 = top/north, clockwise)
 * @param intensity - Opacity/intensity, 0-1. Defaults to 0.7.
 */
DamageIndicator.trigger = (angle: number, intensity?: number) => {
  _triggerFn?.(angle, intensity);
};
