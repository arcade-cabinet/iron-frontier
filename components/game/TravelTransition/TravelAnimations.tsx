import * as React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import type { TravelMethod } from "@/src/game/data/schemas/world";
import { rngTick, scopedRNG } from "@/src/game/lib/prng";

export function LandscapeSilhouette({ method }: { method: TravelMethod }) {
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    const speed = method === "railroad" ? 3000 : method === "road" ? 5000 : 7000;
    translateX.value = withRepeat(
      withTiming(-200, { duration: speed, easing: Easing.linear }),
      -1,
      false,
    );
  }, [translateX, method]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shapes = React.useMemo(() => {
    const items: { left: number; width: number; height: number; opacity: number }[] = [];
    for (let i = 0; i < 12; i++) {
      items.push({
        left: i * 60 + scopedRNG("ui", 42, rngTick()) * 20,
        width: 30 + scopedRNG("ui", 42, rngTick()) * 40,
        height: 20 + scopedRNG("ui", 42, rngTick()) * 50,
        opacity: 0.15 + scopedRNG("ui", 42, rngTick()) * 0.2,
      });
    }
    return items;
  }, []);

  return (
    <View className="h-20 overflow-hidden" style={{ opacity: 0.6 }}>
      <Animated.View
        style={[
          {
            flexDirection: "row",
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 900,
            height: 80,
            alignItems: "flex-end",
          },
          animatedStyle,
        ]}
      >
        {shapes.map((shape, i) => (
          <View
            key={`mtn-${i}`}
            style={{
              position: "absolute",
              left: shape.left,
              bottom: 0,
              width: shape.width,
              height: shape.height,
              backgroundColor: "#4a3728",
              opacity: shape.opacity,
              borderTopLeftRadius: shape.width * 0.3,
              borderTopRightRadius: shape.width * 0.2,
            }}
          />
        ))}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: "#4a3728",
            opacity: 0.3,
          }}
        />
      </Animated.View>
    </View>
  );
}

export function TravelProgress({
  progress,
  fromName,
  toName,
}: {
  progress: number;
  fromName: string;
  toName: string;
}) {
  const animatedWidth = useSharedValue(0);

  React.useEffect(() => {
    animatedWidth.value = withTiming(Math.min(progress, 100), {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View className="gap-2">
      <View className="relative h-5 overflow-hidden rounded-full border border-amber-700/50 bg-amber-900/50">
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={`tick-${i}`}
            style={{
              position: "absolute",
              left: `${(i + 1) * 25}%`,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            }}
          />
        ))}

        <Animated.View className="h-full rounded-full bg-amber-500/80" style={fillStyle} />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="max-w-[35%] text-xs text-amber-500" numberOfLines={1}>
          {fromName}
        </Text>
        <Text className="font-mono text-sm font-bold text-amber-300">{Math.round(progress)}%</Text>
        <Text className="max-w-[35%] text-right text-xs text-amber-500" numberOfLines={1}>
          {toName}
        </Text>
      </View>
    </View>
  );
}

export function TravelIcon({ icon }: { icon: string }) {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ alignItems: "center" }, animatedStyle]}>
      <Text style={{ fontSize: 56 }}>{icon}</Text>
    </Animated.View>
  );
}
