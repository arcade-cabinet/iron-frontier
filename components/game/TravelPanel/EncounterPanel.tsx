/**
 * Encounter interruption panel with dramatic reveal and fight/flee actions.
 */

import * as React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import type { TravelState } from "@/src/game/store/types";

export function EncounterPanel({
  travel,
  onFight,
  onFlee,
}: {
  travel: TravelState;
  onFight: () => void;
  onFlee: () => void;
}) {
  const pulseOpacity = useSharedValue(0.5);

  React.useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="rounded-lg border-2 border-red-700/60 bg-red-950/50 overflow-hidden"
    >
      {/* Pulsing danger strip at top */}
      <Animated.View className="h-1 bg-red-500" style={pulseStyle} />

      <View className="p-4">
        {/* Encounter header with silhouette */}
        <View className="mb-3 items-center">
          <View className="mb-2 h-16 w-16 items-center justify-center rounded-full border-2 border-red-700/50 bg-red-900/40">
            <Text style={{ fontSize: 32 }}>{"\u{1F480}"}</Text>
          </View>
          <Text className="text-lg font-bold text-red-300 font-heading text-center">
            Road Ambush!
          </Text>
          <Text className="text-sm text-red-400/80 text-center mt-0.5">
            Hostiles have blocked the {travel.method}!
          </Text>
        </View>

        {/* Enemy silhouette description */}
        <View className="rounded-lg border border-red-800/40 bg-red-950/40 p-3 mb-4">
          <Text className="text-xs text-red-400/60 font-body uppercase tracking-wider mb-1">
            Threat Assessment
          </Text>
          <Text className="text-sm text-amber-200/80 font-body leading-5">
            Dark shapes block the path ahead. You've been waylaid by enemies and must decide quickly
            -- fight your way through or attempt to flee back the way you came.
          </Text>
        </View>

        {/* Action buttons with urgency styling */}
        <View className="flex-row gap-3">
          {/* Fight button - RED urgency */}
          <Pressable
            className="min-h-[52px] flex-1 items-center justify-center gap-1 rounded-lg bg-red-800 border border-red-600/50 px-3 py-3"
            onPress={onFight}
            accessibilityRole="button"
            accessibilityLabel="Fight the encounter"
          >
            <Text style={{ fontSize: 20 }}>{"\u{2694}"}</Text>
            <Text className="text-sm font-bold text-red-100 font-heading uppercase tracking-wider">
              Fight
            </Text>
          </Pressable>

          {/* Flee button - AMBER retreat */}
          <Pressable
            className="min-h-[52px] flex-1 items-center justify-center gap-1 rounded-lg border-2 border-amber-600/50 bg-amber-900/40 px-3 py-3"
            onPress={onFlee}
            accessibilityRole="button"
            accessibilityLabel="Flee from the encounter"
          >
            <Text style={{ fontSize: 20 }}>{"\u{1F3C3}"}</Text>
            <Text className="text-sm font-bold text-amber-200 font-heading uppercase tracking-wider">
              Flee
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
