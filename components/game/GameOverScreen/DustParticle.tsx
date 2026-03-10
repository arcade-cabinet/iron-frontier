import * as React from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { rngTick, scopedRNG } from "../../../src/game/lib/prng.ts";

export function DustParticle({
  left,
  delay: _delay,
  duration,
}: {
  left: number;
  delay: number;
  duration: number;
}) {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(-400, {
      duration: duration * 1000,
      easing: Easing.linear,
    });
  }, [duration, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: 0.15 + scopedRNG("ui", 42, rngTick()) * 0.15,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: `${left}%`,
          bottom: -20,
          width: 2,
          height: 2,
          borderRadius: 1,
          backgroundColor: "#dc2626",
        },
        animatedStyle,
      ]}
    />
  );
}
