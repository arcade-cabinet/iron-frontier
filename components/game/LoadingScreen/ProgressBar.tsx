import * as React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { LoadingStage } from "./types.ts";

/** Animated progress bar that fills as stages complete */
export function ProgressBar({ stages }: { stages: LoadingStage[] }) {
  const total = stages.length;
  const done = stages.filter((s) => s.done).length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  const animatedWidth = useSharedValue(0);

  React.useEffect(() => {
    animatedWidth.value = withTiming(pct, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [pct, animatedWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View
      style={{
        width: "100%",
        maxWidth: 280,
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(92, 64, 51, 0.4)",
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={[
          {
            height: "100%",
            borderRadius: 2,
            backgroundColor: "#B5A642",
          },
          fillStyle,
        ]}
      />
    </View>
  );
}
