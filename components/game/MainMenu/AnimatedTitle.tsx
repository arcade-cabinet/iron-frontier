import * as React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { COLORS } from "./constants.ts";

export function AnimatedTitle() {
  const opacity = useSharedValue(0);
  const letterSpacing = useSharedValue(2);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    letterSpacing.value = withTiming(6, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [opacity, letterSpacing]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    letterSpacing: letterSpacing.value,
  }));

  const subtitleOpacity = useSharedValue(0);
  React.useEffect(() => {
    subtitleOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [subtitleOpacity]);

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View className="items-center gap-1">
      <Animated.Text
        style={[
          {
            fontFamily: "CinzelDecorative",
            fontSize: 28,
            fontWeight: "800",
            color: COLORS.amber,
            textAlign: "center",
            textShadowColor: "rgba(0,0,0,0.6)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          },
          titleStyle,
        ]}
      >
        IRON FRONTIER
      </Animated.Text>
      <Animated.Text
        style={[
          {
            fontFamily: "Cinzel",
            fontSize: 11,
            fontWeight: "600",
            color: COLORS.dust,
            textAlign: "center",
            letterSpacing: 4,
          },
          subtitleStyle,
        ]}
      >
        AN OLD WEST TALE
      </Animated.Text>
    </View>
  );
}
