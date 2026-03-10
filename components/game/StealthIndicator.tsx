/**
 * StealthIndicator — Fallout-style detection state display.
 *
 * Center of screen, below the compass bar. Shows bracketed detection text:
 *   [HIDDEN] / [CAUTION] / [DANGER]
 *
 * Animates smoothly between states using react-native-reanimated.
 * Only visible when there are nearby hostiles (nearestHostileDistance > 0).
 *
 * Reads detection level from the Zustand game store (stealthState).
 * Falls back to an optional prop for manual override.
 *
 * @module components/game/StealthIndicator
 */

import * as React from "react";
import { Platform, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { useResponsive } from "@/hooks/useResponsive";

// ============================================================================
// CONSTANTS
// ============================================================================

const HUD_AMBER = "#D4A855";
const HUD_RED = "#CC4444";
const HUD_YELLOW = "#D4A017";

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

// ============================================================================
// TYPES
// ============================================================================

export type DetectionLevel = "hidden" | "caution" | "danger";

export interface StealthIndicatorProps {
  /** Manual override for detection state. If omitted, reads from store. */
  detectionLevel?: DetectionLevel | null;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert a numeric detection level (0-100) to a named state.
 *
 *   0-29  = hidden
 *   30-79 = caution
 *   80+   = danger
 */
function numericToDetectionLevel(value: number): DetectionLevel {
  if (value >= 80) return "danger";
  if (value >= 30) return "caution";
  return "hidden";
}

// ============================================================================
// STYLE MAP
// ============================================================================

const DETECTION_STYLES: Record<DetectionLevel, { label: string; color: string; pulse: boolean }> = {
  hidden: { label: "HIDDEN", color: HUD_AMBER, pulse: false },
  caution: { label: "CAUTION", color: HUD_YELLOW, pulse: true },
  danger: { label: "DANGER", color: HUD_RED, pulse: true },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StealthIndicator({ detectionLevel: detectionLevelProp }: StealthIndicatorProps) {
  const { isPhone } = useResponsive();

  // Read stealth state from the store
  const { storeDetection, nearestHostileDistance } = useGameStoreShallow((s) => ({
    storeDetection: s.stealthState.detectionLevel,
    nearestHostileDistance: s.stealthState.nearestHostileDistance,
  }));

  // Determine the active detection level: prop override > store
  const detectionLevel =
    detectionLevelProp ??
    // Only show indicator when there are nearby hostiles (or detection is still decaying)
    (nearestHostileDistance > 0 || storeDetection > 1
      ? numericToDetectionLevel(storeDetection)
      : null);

  // Pulse animation for caution/danger
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (!detectionLevel) return;
    const style = DETECTION_STYLES[detectionLevel];

    if (style.pulse) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 600, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    } else {
      pulseOpacity.value = withTiming(0.8, { duration: 200 });
    }
  }, [detectionLevel, pulseOpacity]);

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (!detectionLevel) return null;

  const style = DETECTION_STYLES[detectionLevel];
  const fontSize = isPhone ? 11 : 13;

  return (
    <View
      style={{
        position: "absolute",
        top: isPhone ? 44 : 50,
        left: 0,
        right: 0,
        alignItems: "center",
      }}
      pointerEvents="none"
    >
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(300)}>
        <Animated.View style={animatedTextStyle}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                color: style.color,
                fontSize,
                fontWeight: "700",
                fontFamily: MONO_FONT,
                letterSpacing: 2,
              }}
            >
              {"[  "}
            </Text>
            <Text
              style={{
                color: style.color,
                fontSize,
                fontWeight: "700",
                fontFamily: MONO_FONT,
                letterSpacing: 3,
              }}
            >
              {style.label}
            </Text>
            <Text
              style={{
                color: style.color,
                fontSize,
                fontWeight: "700",
                fontFamily: MONO_FONT,
                letterSpacing: 2,
              }}
            >
              {"  ]"}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
