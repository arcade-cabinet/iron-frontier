/**
 * LocationToast — Brief location name display when entering a new area.
 *
 * Fades in when `currentLocationId` changes, displays for 3 seconds,
 * then fades out. Positioned top-center below the compass bar.
 *
 * @module components/game/LocationToast
 */

import * as React from "react";
import { Platform, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { useShowOnChange } from "@/hooks/useAutoHide";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { useResponsive } from "@/hooks/useResponsive";

// ============================================================================
// CONSTANTS
// ============================================================================

const HUD_AMBER = "#D4A855";
const HUD_TEXT = "#E8D5A8";

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LocationToast() {
  const insets = useSafeAreaInsets();
  const { isPhone } = useResponsive();

  const { currentLocationId, loadedWorld } = useGameStoreShallow((s) => ({
    currentLocationId: s.currentLocationId,
    loadedWorld: s.loadedWorld,
  }));

  // Derive location name
  const locationName = React.useMemo(() => {
    if (!currentLocationId || !loadedWorld) return null;
    const location = loadedWorld?.locations?.get?.(currentLocationId);
    return location?.ref?.name ?? null;
  }, [currentLocationId, loadedWorld]);

  // Show briefly on location change
  const opacity = useShowOnChange(currentLocationId, {
    displayMs: 3000,
    fadeInMs: 400,
    fadeOutMs: 600,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!locationName) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: Math.max(insets.top, 8) + (isPhone ? 36 : 44),
          left: 0,
          right: 0,
          alignItems: "center",
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 6,
          backgroundColor: "rgba(20, 15, 10, 0.6)",
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            color: HUD_TEXT,
            fontSize: isPhone ? 12 : 14,
            fontWeight: "600",
            fontFamily: MONO_FONT,
            letterSpacing: 1,
            textTransform: "uppercase",
            textShadowColor: `${HUD_AMBER}44`,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 6,
          }}
        >
          {locationName}
        </Text>
      </View>
    </Animated.View>
  );
}
