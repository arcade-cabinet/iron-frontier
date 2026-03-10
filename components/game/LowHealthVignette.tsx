/**
 * LowHealthVignette — Screen-edge reddening when player health is low.
 *
 * Renders a translucent red border/vignette that pulses at low health.
 * Intensity scales inversely with health percentage:
 *   - Above 50%: invisible
 *   - 25-50%: subtle red edges
 *   - Below 25%: strong pulsing red vignette
 *
 * This replaces the need for an always-visible HP number; the player
 * *feels* their health state through the screen.
 *
 * @module components/game/LowHealthVignette
 */

import * as React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useGameStoreShallow } from "@/hooks/useGameStore";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Health % below which the vignette appears. */
const THRESHOLD_PCT = 0.5;
/** Health % at which the vignette reaches max intensity. */
const CRITICAL_PCT = 0.25;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LowHealthVignette() {
  const { health, maxHealth } = useGameStoreShallow((s) => ({
    health: s.playerStats.health,
    maxHealth: s.playerStats.maxHealth,
  }));

  const hpPct = maxHealth > 0 ? health / maxHealth : 1;
  const pulseOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (hpPct >= THRESHOLD_PCT) {
      // Above threshold — hide
      pulseOpacity.value = withTiming(0, { duration: 400 });
    } else if (hpPct <= CRITICAL_PCT) {
      // Critical — strong pulsing
      const baseOpacity = 0.25 + (1 - hpPct / CRITICAL_PCT) * 0.2;
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(baseOpacity, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(baseOpacity * 0.4, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    } else {
      // Low but not critical — subtle static edge
      const intensity = (THRESHOLD_PCT - hpPct) / (THRESHOLD_PCT - CRITICAL_PCT);
      const targetOpacity = 0.08 + intensity * 0.12;
      pulseOpacity.value = withTiming(targetOpacity, { duration: 600 });
    }
  }, [hpPct, pulseOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return <Animated.View style={[styles.vignette, animatedStyle]} pointerEvents="none" />;
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  vignette: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Red border/vignette using a thick, soft shadow-like border
    borderWidth: 40,
    borderColor: "rgba(180, 20, 20, 0.6)",
    borderRadius: 0,
    // The border fades inward; on web we can use box-shadow for a softer look
    // but borderWidth with opacity gives a reasonable approximation on RN
  },
});
