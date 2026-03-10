import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

const progressTrackVariants = cva("h-3 w-full overflow-hidden rounded-full bg-muted", {
  variants: {
    variant: {
      default: "",
      health: "",
      xp: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Returns the fill color class based on variant and current value.
 * For `health`, transitions green -> yellow -> red based on percentage.
 */
function getFillColor(variant: string | null | undefined, value: number): string {
  switch (variant) {
    case "health": {
      if (value > 60) return "bg-frontier-sage";
      if (value > 30) return "bg-frontier-whiskey";
      return "bg-frontier-blood";
    }
    case "xp":
      return "bg-frontier-sky";
    default:
      return "bg-primary";
  }
}

type ProgressProps = React.ComponentProps<typeof View> &
  VariantProps<typeof progressTrackVariants> & {
    /** Progress value from 0 to 100 */
    value?: number;
  };

function Progress({ className, variant = "default", value = 0, ...props }: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const animatedWidth = useSharedValue(clampedValue);

  React.useEffect(() => {
    animatedWidth.value = withTiming(clampedValue, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedValue, animatedWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  const fillColor = getFillColor(variant, clampedValue);

  return (
    <View
      className={cn(progressTrackVariants({ variant }), className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
      {...props}
    >
      <Animated.View className={cn("h-full rounded-full", fillColor)} style={animatedStyle} />
    </View>
  );
}

export { Progress, progressTrackVariants };
export type { ProgressProps };
