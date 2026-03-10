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
import { SegmentedBar } from "./VitalBars";

const HUD_AMBER = "#D4A855";
const HUD_AMBER_DIM = "#C4963F";
const HUD_RED = "#CC4444";
const HP_SEGMENTS = 10;
const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

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

  const flashOpacity = useSharedValue(0);
  const prevHealthRef = React.useRef(health);

  React.useEffect(() => {
    if (health < prevHealthRef.current) {
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
      </View>
    </Pressable>
  );
}
