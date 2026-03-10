/**
 * LocationMarker - tappable town/location dot on the world map.
 * Includes PulseRing for current location and LocationIcon for type hints.
 */

import * as React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import type { LocationRef } from "@/src/game/data/schemas/world";
import { toRenderX, toRenderY } from "./types.ts";

// =============================================================================
// PulseRing
// =============================================================================

function PulseRing({ size }: { size: number }) {
  const opacity = useSharedValue(0.6);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size + 12,
          height: size + 12,
          borderRadius: (size + 12) / 2,
          borderWidth: 2,
          borderColor: "#dc2626",
          left: -(size + 12) / 2,
          top: -(size + 12) / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

// =============================================================================
// LocationIcon
// =============================================================================

function LocationIcon({ type, color, size }: { type: string; color: string; size: number }) {
  const s = Math.max(size, 4);

  switch (type) {
    case "town":
    case "city":
    case "village":
      return (
        <View style={{ width: s, height: s * 0.7, backgroundColor: color, borderRadius: 1 }} />
      );
    case "mine":
    case "quarry":
      return (
        <View
          style={{
            width: s,
            height: 2,
            backgroundColor: color,
            transform: [{ rotate: "-45deg" }],
          }}
        />
      );
    case "ranch":
    case "farm":
      return (
        <View style={{ width: s, height: s * 0.6, backgroundColor: color, borderRadius: 1 }} />
      );
    case "train_station":
      return (
        <View style={{ width: s, height: s * 0.5, backgroundColor: color, borderRadius: 2 }} />
      );
    case "waystation":
    case "outpost":
      return (
        <View
          style={{
            width: s * 0.7,
            height: s * 0.7,
            backgroundColor: color,
            transform: [{ rotate: "45deg" }],
          }}
        />
      );
    case "hideout":
      return (
        <View
          style={{
            width: s * 0.8,
            height: s * 0.8,
            backgroundColor: color,
            borderRadius: s * 0.4,
          }}
        />
      );
    case "ruins":
      return (
        <View style={{ flexDirection: "row", gap: 1 }}>
          <View style={{ width: s * 0.3, height: s * 0.8, backgroundColor: color }} />
          <View style={{ width: s * 0.3, height: s * 0.5, backgroundColor: color }} />
        </View>
      );
    case "landmark":
    case "wilderness":
      return (
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: s * 0.4,
            borderRightWidth: s * 0.4,
            borderBottomWidth: s * 0.7,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: color,
          }}
        />
      );
    case "camp":
      return (
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: s * 0.4,
            borderRightWidth: s * 0.4,
            borderBottomWidth: s * 0.6,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: color,
          }}
        />
      );
    default:
      return (
        <View
          style={{
            width: s * 0.6,
            height: s * 0.6,
            backgroundColor: color,
            borderRadius: s * 0.3,
          }}
        />
      );
  }
}

// =============================================================================
// LocationMarker
// =============================================================================

export function LocationMarker({
  location,
  isCurrent,
  isDiscovered,
  isConnected,
  onPress,
}: {
  location: LocationRef;
  isCurrent: boolean;
  isDiscovered: boolean;
  isConnected: boolean;
  onPress: () => void;
}) {
  const x = toRenderX(location.coord.wx);
  const y = toRenderY(location.coord.wy);
  const size = isCurrent ? 18 : 14;

  let markerColor = "#4a3728";
  if (isCurrent) markerColor = "#dc2626";
  else if (isConnected && isDiscovered) markerColor = "#059669";
  else if (!isDiscovered) markerColor = "#9ca3af";

  return (
    <Pressable
      style={{
        position: "absolute",
        left: x - 22,
        top: y - 22,
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        zIndex: isCurrent ? 20 : 10,
      }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isDiscovered ? `${location.name}, ${location.type}` : "Unknown location"}
    >
      {isCurrent && <PulseRing size={size} />}

      {isConnected && !isCurrent && isDiscovered && (
        <View
          style={{
            position: "absolute",
            width: size + 6,
            height: size + 6,
            borderRadius: (size + 6) / 2,
            borderWidth: 1.5,
            borderColor: "#059669",
            borderStyle: "dashed",
            opacity: 0.5,
          }}
        />
      )}

      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#f5f0e6",
          borderWidth: isCurrent ? 3 : 2,
          borderColor: markerColor,
          opacity: isDiscovered ? 1 : 0.5,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isDiscovered ? (
          <LocationIcon type={location.type} color={markerColor} size={size - 6} />
        ) : (
          <Text style={{ fontSize: 8, color: "#9ca3af", fontWeight: "bold" }}>?</Text>
        )}
      </View>

      <Text
        style={{
          position: "absolute",
          top: size / 2 + 14,
          width: 80,
          textAlign: "center",
          fontSize: 8,
          color: "#4a3728",
          fontWeight: isCurrent ? "bold" : "normal",
        }}
        numberOfLines={1}
      >
        {isDiscovered ? location.name : "???"}
      </Text>
    </Pressable>
  );
}
