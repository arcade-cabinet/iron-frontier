/**
 * SurvivalWarning — On-demand fatigue/hunger/thirst warning.
 *
 * Only appears when survival stats are in warning territory:
 *   - Fatigue >= 50 (weary or worse)
 *   - Food < 30%
 *   - Water < 30%
 *
 * Shows a compact icon + label in the bottom-right, fading in/out
 * based on threshold state. Replaces the always-visible provisions
 * and fatigue displays from the old HUD.
 *
 * @module components/game/SurvivalWarning
 */

import * as React from "react";
import { Platform, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { useAutoHide } from "@/hooks/useAutoHide";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { useResponsive } from "@/hooks/useResponsive";
import { DEFAULT_PROVISIONS_CONFIG } from "@/src/game/systems/provisions";

// ============================================================================
// CONSTANTS
// ============================================================================

const HUD_AMBER = "#D4A855";
const HUD_RED = "#CC4444";
const HUD_BLUE = "#6BA3C4";
const FATIGUE_WARNING_THRESHOLD = 50; // weary
const PROVISION_WARNING_PCT = 0.3; // 30%

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SurvivalWarning() {
  const insets = useSafeAreaInsets();
  const { isPhone } = useResponsive();

  const { fatigueCurrent, food, water } = useGameStoreShallow((s) => ({
    fatigueCurrent: s.fatigueState.current,
    food: s.provisionsState.food,
    water: s.provisionsState.water,
  }));

  const foodPct = food / DEFAULT_PROVISIONS_CONFIG.maxFood;
  const waterPct = water / DEFAULT_PROVISIONS_CONFIG.maxWater;

  const isFatigueWarning = fatigueCurrent >= FATIGUE_WARNING_THRESHOLD;
  const isFoodWarning = foodPct < PROVISION_WARNING_PCT;
  const isWaterWarning = waterPct < PROVISION_WARNING_PCT;
  const hasAnyWarning = isFatigueWarning || isFoodWarning || isWaterWarning;

  const opacity = useAutoHide({
    visible: hasAnyWarning,
    displayMs: 0, // Stay visible as long as condition is true
    fadeInMs: 400,
    fadeOutMs: 600,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!hasAnyWarning) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: Math.max(insets.bottom, 8) + 8,
          right: Math.max(insets.right, 8) + 8,
          alignItems: "flex-end",
          gap: 4,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      {isFatigueWarning && (
        <WarningBadge
          label={fatigueCurrent >= 75 ? "EXHAUSTED" : "FATIGUED"}
          color={fatigueCurrent >= 75 ? HUD_RED : HUD_AMBER}
          isPhone={isPhone}
        />
      )}
      {isFoodWarning && (
        <WarningBadge
          label="HUNGRY"
          color={foodPct < 0.1 ? HUD_RED : HUD_AMBER}
          isPhone={isPhone}
        />
      )}
      {isWaterWarning && (
        <WarningBadge
          label="THIRSTY"
          color={waterPct < 0.1 ? HUD_RED : HUD_BLUE}
          isPhone={isPhone}
        />
      )}
    </Animated.View>
  );
}

// ============================================================================
// WARNING BADGE
// ============================================================================

interface WarningBadgeProps {
  label: string;
  color: string;
  isPhone: boolean;
}

const WarningBadge = React.memo(function WarningBadge({
  label,
  color,
  isPhone,
}: WarningBadgeProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: isPhone ? 6 : 8,
        paddingVertical: isPhone ? 3 : 4,
        backgroundColor: "rgba(20, 15, 10, 0.7)",
        borderRadius: 3,
        borderLeftWidth: 2,
        borderLeftColor: color,
      }}
    >
      <Text
        style={{
          color,
          fontSize: isPhone ? 8 : 9,
          fontWeight: "700",
          fontFamily: MONO_FONT,
          letterSpacing: 1,
        }}
      >
        {label}
      </Text>
    </View>
  );
});
