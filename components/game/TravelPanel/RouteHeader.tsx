/**
 * Route visualization components: origin -> destination with travel info.
 */

import * as React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import type { TravelMethod } from "@/src/game/data/schemas/world";

import { METHOD_INFO } from "./travelConstants.ts";

export function TravelBobIcon({ iconChar }: { iconChar: string }) {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ alignItems: "center" }, animatedStyle]}>
      <Text style={{ fontSize: 48 }}>{iconChar}</Text>
    </Animated.View>
  );
}

export function RouteHeader({
  fromName,
  toName,
  travelTime,
  method,
}: {
  fromName: string;
  toName: string;
  travelTime: number;
  method: TravelMethod;
}) {
  const methodInfo = METHOD_INFO[method] ?? METHOD_INFO.trail;

  return (
    <View className="flex-row items-center gap-2 py-1">
      {/* Origin */}
      <View className="flex-1 items-center">
        <View className="w-2.5 h-2.5 rounded-full bg-amber-400 mb-1" />
        <Text className="text-xs text-amber-300 font-body text-center" numberOfLines={1}>
          {fromName}
        </Text>
      </View>

      {/* Route line with travel info */}
      <View className="flex-2 items-center gap-1">
        <View className="flex-row items-center gap-1">
          <View className="h-[1px] w-6 bg-amber-600/50" />
          <Text style={{ fontSize: 14 }}>{methodInfo.iconChar}</Text>
          <View className="h-[1px] w-6 bg-amber-600/50" />
        </View>
        <Text className="text-[10px] text-amber-500/70 font-mono">
          ~{travelTime}h ({methodInfo.speed})
        </Text>
      </View>

      {/* Destination */}
      <View className="flex-1 items-center">
        <View
          className="w-2.5 h-2.5 rounded-sm bg-amber-500 mb-1"
          style={{ transform: [{ rotate: "45deg" }] }}
        />
        <Text className="text-xs text-amber-300 font-body text-center" numberOfLines={1}>
          {toName}
        </Text>
      </View>
    </View>
  );
}
