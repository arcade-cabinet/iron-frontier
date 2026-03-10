import * as React from "react";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Text } from "@/components/ui";
import { COLORS } from "./constants.ts";

export function MenuButton({
  label,
  onPress,
  variant = "default",
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "default" | "danger" | "ghost";
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = React.useCallback(() => {
    scale.value = withTiming(0.97, { duration: 100 });
    glowOpacity.value = withTiming(1, { duration: 100 });
  }, [scale, glowOpacity]);

  const handlePressOut = React.useCallback(() => {
    scale.value = withTiming(1, { duration: 150 });
    glowOpacity.value = withTiming(0, { duration: 200 });
  }, [scale, glowOpacity]);

  const borderColor =
    variant === "primary"
      ? COLORS.amber
      : variant === "danger"
        ? "#8B0000"
        : variant === "ghost"
          ? "transparent"
          : COLORS.burntSienna;

  const textColor =
    variant === "primary"
      ? COLORS.amber
      : variant === "danger"
        ? "#cc4444"
        : variant === "ghost"
          ? COLORS.dust
          : COLORS.dust;

  return (
    <Animated.View style={animatedContainerStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          {
            borderWidth: variant === "ghost" ? 0 : 1,
            borderColor,
            borderRadius: 4,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            opacity: disabled ? 0.4 : 1,
            overflow: "hidden",
          },
          variant === "primary" && {
            borderWidth: 2,
            borderStyle: "solid",
          },
        ]}
      >
        {/* Amber glow backdrop on press */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: COLORS.amberGlow,
              borderRadius: 3,
            },
            animatedGlowStyle,
          ]}
        />
        <Text
          style={{
            color: textColor,
            fontSize: 14,
            fontWeight: "600",
            fontFamily: "Cinzel",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
