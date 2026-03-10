/**
 * PlayerVitals — Fallout-style health/stamina/provisions display.
 *
 * Bottom-LEFT corner. Shows:
 *   - HP: segmented bracket-frame bar (flashes red on damage)
 *   - Stamina: smaller bar below HP
 *   - Food/Water: two small vertical fill indicators
 *
 * All rendered in amber monochrome. Numbers only shown on press (keep it minimal).
 *
 * @module components/game/PlayerVitals
 */

import * as React from "react";
import { Platform, Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { useResponsive } from "@/hooks/useResponsive";
import { DEFAULT_PROVISIONS_CONFIG } from "@/src/game/systems/provisions";

// ============================================================================
// CONSTANTS
// ============================================================================

const HUD_AMBER = "#D4A855";
const HUD_AMBER_DIM = "#C4963F";
const HUD_TEXT = "#E8D5A8";
const HUD_BG = "rgba(20, 15, 10, 0.6)";
const HUD_RED = "#CC4444";

const HP_SEGMENTS = 10;
const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

// ============================================================================
// SEGMENTED BAR
// ============================================================================

interface SegmentedBarProps {
  /** Value 0-100 */
  value: number;
  /** Max value for computing percentage */
  maxValue: number;
  /** Number of segments */
  segments: number;
  /** Bar height */
  height: number;
  /** Bar color (fill) */
  color: string;
  /** Total width */
  width: number;
  /** Whether the bar is flashing (damage) */
  flash?: boolean;
}

const SegmentedBar = React.memo(function SegmentedBar({
  value,
  maxValue,
  segments,
  height,
  color,
  width,
}: SegmentedBarProps) {
  const pct = maxValue > 0 ? value / maxValue : 0;
  const filledSegments = Math.ceil(pct * segments);
  const segmentWidth = (width - (segments - 1) * 2 - 4) / segments; // 2px gap, 2px bracket

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: height + 4,
        width,
      }}
    >
      {/* Left bracket */}
      <View
        style={{
          width: 2,
          height: height + 4,
          backgroundColor: color,
          opacity: 0.7,
          borderTopLeftRadius: 1,
          borderBottomLeftRadius: 1,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
          paddingHorizontal: 1,
          flex: 1,
        }}
      >
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filledSegments;
          const isPartial = i === filledSegments - 1 && pct < 1;

          return (
            <View
              key={i}
              style={{
                flex: 1,
                height,
                backgroundColor: isFilled ? color : `${color}20`,
                borderRadius: 1,
                opacity: isFilled ? (isPartial ? 0.7 : 0.9) : 0.3,
              }}
            />
          );
        })}
      </View>
      {/* Right bracket */}
      <View
        style={{
          width: 2,
          height: height + 4,
          backgroundColor: color,
          opacity: 0.7,
          borderTopRightRadius: 1,
          borderBottomRightRadius: 1,
        }}
      />
    </View>
  );
});

// ============================================================================
// VERTICAL FILL INDICATOR
// ============================================================================

interface VerticalFillProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  height: number;
}

const VerticalFill = React.memo(function VerticalFill({
  label,
  value,
  maxValue,
  color,
  height,
}: VerticalFillProps) {
  const pct = maxValue > 0 ? Math.min(1, value / maxValue) : 0;
  const fillHeight = Math.round(pct * height);

  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <View
        style={{
          width: 8,
          height,
          borderRadius: 2,
          borderWidth: 1,
          borderColor: `${color}66`,
          backgroundColor: `${color}15`,
          justifyContent: "flex-end",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: "100%",
            height: fillHeight,
            backgroundColor: color,
            opacity: 0.8,
            borderRadius: 1,
          }}
        />
      </View>
      <Text
        style={{
          color: `${color}AA`,
          fontSize: 7,
          fontFamily: MONO_FONT,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </View>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PlayerVitals() {
  const insets = useSafeAreaInsets();
  const { isPhone } = useResponsive();
  const [showNumbers, setShowNumbers] = React.useState(false);

  const { health, maxHealth, stamina, maxStamina } = useGameStoreShallow((s) => ({
    health: s.playerStats.health,
    maxHealth: s.playerStats.maxHealth,
    stamina: s.playerStats.stamina,
    maxStamina: s.playerStats.maxStamina,
  }));

  // Damage flash animation
  const flashOpacity = useSharedValue(0);
  const prevHealthRef = React.useRef(health);

  React.useEffect(() => {
    if (health < prevHealthRef.current) {
      // Took damage -- flash red
      flashOpacity.value = withSequence(
        withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) }),
      );
    }
    prevHealthRef.current = health;
  }, [health, flashOpacity]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const barWidth = isPhone ? 110 : 140;
  const barHeight = isPhone ? 6 : 8;
  const smallBarHeight = isPhone ? 4 : 5;

  // Determine HP bar color based on health percentage
  const hpPct = maxHealth > 0 ? health / maxHealth : 0;
  const hpColor = hpPct <= 0.25 ? HUD_RED : hpPct <= 0.5 ? HUD_AMBER_DIM : HUD_AMBER;

  return (
    <Pressable
      onPress={() => setShowNumbers((prev) => !prev)}
      style={{
        position: "absolute",
        bottom: Math.max(insets.bottom, 8) + 8,
        left: Math.max(insets.left, 8) + 8,
      }}
    >
      <View style={{ gap: isPhone ? 3 : 4 }}>
        {/* HP bar — minimal, thin */}
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{
                color: HUD_AMBER,
                fontSize: isPhone ? 9 : 10,
                fontWeight: "700",
                fontFamily: MONO_FONT,
                width: 20,
              }}
            >
              HP
            </Text>
            <SegmentedBar
              value={health}
              maxValue={maxHealth}
              segments={HP_SEGMENTS}
              height={barHeight}
              color={hpColor}
              width={barWidth}
            />
            {showNumbers && (
              <Text
                style={{
                  color: hpColor,
                  fontSize: isPhone ? 9 : 10,
                  fontFamily: MONO_FONT,
                  fontWeight: "600",
                }}
              >
                {health}/{maxHealth}
              </Text>
            )}
          </View>

          {/* Red flash overlay on HP bar */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: HUD_RED,
                borderRadius: 2,
              },
              flashStyle,
            ]}
            pointerEvents="none"
          />
        </View>

        {/* Stamina bar — smaller, below HP */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            style={{
              color: HUD_AMBER_DIM,
              fontSize: isPhone ? 8 : 9,
              fontWeight: "600",
              fontFamily: MONO_FONT,
              width: 20,
            }}
          >
            ST
          </Text>
          <SegmentedBar
            value={stamina}
            maxValue={maxStamina}
            segments={HP_SEGMENTS}
            height={smallBarHeight}
            color={HUD_AMBER_DIM}
            width={barWidth}
          />
          {showNumbers && (
            <Text
              style={{
                color: HUD_AMBER_DIM,
                fontSize: isPhone ? 8 : 9,
                fontFamily: MONO_FONT,
              }}
            >
              {stamina}/{maxStamina}
            </Text>
          )}
        </View>

        {/* Food/water indicators removed — SurvivalWarning handles
            low-provision alerts. Tap HP bar to see numeric values. */}
      </View>
    </Pressable>
  );
}
