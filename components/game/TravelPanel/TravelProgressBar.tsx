/**
 * Animated progress bar showing travel completion with danger-level coloring.
 */

import * as React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import type { DangerLevel } from "@/src/game/data/schemas/world";

import { DANGER_COLORS } from "./travelConstants.ts";

export function TravelProgressBar({
  progress,
  fromName,
  toName,
  dangerLevel,
}: {
  progress: number;
  fromName: string;
  toName: string;
  dangerLevel: DangerLevel;
}) {
  const animatedWidth = useSharedValue(0);
  const dangerColor = DANGER_COLORS[dangerLevel] ?? DANGER_COLORS.moderate;

  React.useEffect(() => {
    animatedWidth.value = withTiming(Math.min(progress, 100), {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  const markerStyle = useAnimatedStyle(() => ({
    left: `${Math.min(animatedWidth.value, 97)}%`,
  }));

  return (
    <View className="gap-2">
      {/* Progress track */}
      <View className="relative h-5 overflow-hidden rounded-full border border-amber-700/50 bg-amber-950/70">
        {/* Tick marks background */}
        <View
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.15,
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <View
              key={`tick-${i}`}
              style={{
                position: "absolute",
                left: `${(i + 1) * 10}%`,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
              }}
            />
          ))}
        </View>

        {/* Fill */}
        <Animated.View
          className="h-full rounded-full"
          style={[fillStyle, { backgroundColor: dangerColor, opacity: 0.7 }]}
        />

        {/* Percentage centered on bar */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text className="font-mono text-[10px] text-amber-200 font-medium">
            {Math.round(progress)}%
          </Text>
        </View>

        {/* Marker dot */}
        <Animated.View
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-amber-700 shadow-lg"
          style={[markerStyle, { backgroundColor: dangerColor }]}
        />
      </View>

      {/* Labels */}
      <View className="flex-row items-center justify-between">
        <Text className="max-w-[35%] text-xs text-amber-500" numberOfLines={1}>
          {fromName}
        </Text>
        <Text className="max-w-[35%] text-right text-xs text-amber-500" numberOfLines={1}>
          {toName}
        </Text>
      </View>
    </View>
  );
}
