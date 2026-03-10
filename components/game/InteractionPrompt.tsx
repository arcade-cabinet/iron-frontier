/**
 * InteractionPrompt - Fallout-style contextual interaction overlay.
 *
 * Center-bottom of screen, just above crosshair area. Shows contextual text
 * like "[E] Talk to Sheriff Cole" / "[E] Open Door" / "[E] Search".
 *
 * Desktop: amber text with subtle glow, no background box (clean like Fallout 3).
 * Mobile: shows as a tappable button instead of keyboard hint.
 *
 * Fades in/out based on interaction proximity.
 *
 * @module components/game/InteractionPrompt
 */

import * as React from "react";
import { Platform, Pressable, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { usePlatform } from "@/hooks/usePlatform";
import type { InteractionTarget, InteractionType } from "@/src/game/systems/InteractionSystem";

// ============================================================================
// CONSTANTS
// ============================================================================

const HUD_AMBER = "#D4A855";
const HUD_TEXT = "#E8D5A8";
const HUD_BG = "rgba(20, 15, 10, 0.7)";

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

/** Map interaction type to a verb for the prompt text. */
const ACTION_VERBS: Record<InteractionType, string> = {
  talk: "Talk to",
  shop: "Trade with",
  enter: "Enter",
  pickup: "Pick up",
  lockpick: "Pick Lock",
};

/** Map interaction type to a key label for the prompt. */
const ACTION_KEYS: Record<InteractionType, string> = {
  talk: "E",
  shop: "E",
  enter: "E",
  pickup: "E",
  lockpick: "E",
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface InteractionPromptProps {
  /** The current interaction target, or null when nothing is in range. */
  target: InteractionTarget | null;
  /** Callback when the mobile tap button is pressed. */
  onTap?: () => void;
}

export function InteractionPrompt({ target, onTap }: InteractionPromptProps) {
  const insets = useSafeAreaInsets();
  const { isTouchDevice, isWeb } = usePlatform();

  // Subtle pulse on the key badge
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (!target) return;
    pulse.value = withRepeat(
      withSequence(withTiming(0.6, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      true,
    );
  }, [target, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  if (!target) return null;

  const verb = ACTION_VERBS[target.type];
  const keyLabel = ACTION_KEYS[target.type];
  const showMobileButton = isTouchDevice && !isWeb;

  const content = (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(300)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        // Mobile: add background for tap target; Desktop: clean/transparent
        ...(showMobileButton
          ? {
              backgroundColor: HUD_BG,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: `${HUD_AMBER}44`,
            }
          : {}),
      }}
    >
      {/* Key badge or tap icon */}
      <Animated.View style={pulseStyle}>
        <View
          style={{
            width: showMobileButton ? 32 : 24,
            height: showMobileButton ? 32 : 24,
            borderRadius: showMobileButton ? 16 : 4,
            borderWidth: 1.5,
            borderColor: HUD_AMBER,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: showMobileButton ? `${HUD_AMBER}30` : "transparent",
          }}
        >
          <Text
            style={{
              color: HUD_AMBER,
              fontSize: showMobileButton ? 14 : 11,
              fontWeight: "700",
              fontFamily: MONO_FONT,
            }}
          >
            {showMobileButton ? "\u25CF" : keyLabel}
          </Text>
        </View>
      </Animated.View>

      {/* Prompt text */}
      <Text
        style={{
          color: HUD_TEXT,
          fontSize: 13,
          fontWeight: "500",
          // Subtle text shadow for readability on desktop
          textShadowColor: "rgba(212, 168, 85, 0.3)",
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 6,
        }}
      >
        {verb}{" "}
        <Text
          style={{
            color: HUD_AMBER,
            fontWeight: "600",
          }}
        >
          {target.name}
        </Text>
      </Text>
    </Animated.View>
  );

  const containerStyle = {
    position: "absolute" as const,
    bottom: Math.max(insets.bottom, 16) + 60,
    left: 0,
    right: 0,
    alignItems: "center" as const,
    zIndex: 40,
  };

  // On mobile, wrap in Pressable for tap interaction
  if (showMobileButton && onTap) {
    return (
      <View style={containerStyle}>
        <Pressable onPress={onTap}>{content}</Pressable>
      </View>
    );
  }

  return (
    <View style={containerStyle} pointerEvents="none">
      {content}
    </View>
  );
}
