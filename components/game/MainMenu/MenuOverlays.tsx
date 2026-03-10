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
import { COLORS } from "./constants.ts";

export function FilmGrainOverlay() {
  const grainOpacity = useSharedValue(0.03);

  React.useEffect(() => {
    grainOpacity.value = withRepeat(
      withSequence(
        withTiming(0.07, { duration: 150, easing: Easing.linear }),
        withTiming(0.02, { duration: 200, easing: Easing.linear }),
        withTiming(0.05, { duration: 100, easing: Easing.linear }),
        withTiming(0.03, { duration: 180, easing: Easing.linear }),
      ),
      -1,
      false,
    );
  }, [grainOpacity]);

  const grainStyle = useAnimatedStyle(() => ({
    opacity: grainOpacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.dust,
        },
        grainStyle,
      ]}
    />
  );
}

export function VignetteEdge({ position }: { position: "top" | "bottom" | "left" | "right" }) {
  const isVertical = position === "top" || position === "bottom";
  const size = isVertical ? 60 : 40;

  const positionStyle = {
    top: position === "top" ? 0 : position === "bottom" ? undefined : 0,
    bottom: position === "bottom" ? 0 : position === "top" ? undefined : 0,
    left: position === "left" ? 0 : position === "right" ? undefined : 0,
    right: position === "right" ? 0 : position === "left" ? undefined : 0,
    width: isVertical ? ("100%" as const) : size,
    height: isVertical ? size : ("100%" as const),
  };

  // Use a solid dark overlay that fades from edge - simulated with layered Views
  const opacity = position === "top" || position === "bottom" ? 0.5 : 0.3;

  return (
    <View
      pointerEvents="none"
      style={[{ position: "absolute", backgroundColor: COLORS.night, opacity }, positionStyle]}
    />
  );
}

export function WesternSeparator() {
  return (
    <View className="flex-row items-center gap-2 py-2">
      <View style={{ flex: 1, height: 1, backgroundColor: COLORS.burntSienna, opacity: 0.4 }} />
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: COLORS.amber,
          opacity: 0.5,
        }}
      />
      <View style={{ flex: 1, height: 1, backgroundColor: COLORS.burntSienna, opacity: 0.4 }} />
    </View>
  );
}
