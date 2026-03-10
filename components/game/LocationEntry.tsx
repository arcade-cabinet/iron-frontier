/**
 * LocationEntry - Full-screen location name notification overlay.
 *
 * When the player enters a new location/area, shows the location name
 * large and centered in amber text with a subtitle for the location type.
 * Fades in over 0.5s, holds for 2s, fades out over 0.5s.
 *
 * Listens to the currentLocationId in the Zustand store and triggers
 * the animation whenever it changes.
 */

import { useEffect, useRef, useState } from "react";
import { Animated, Platform, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { getLocationById } from "@/src/game/data/locations";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HUD_AMBER = "#D4A855";
const HUD_TEXT = "#E8D5A8";
const FADE_IN_MS = 500;
const HOLD_MS = 2000;
const FADE_OUT_MS = 500;

// ---------------------------------------------------------------------------
// Location type display names
// ---------------------------------------------------------------------------

const LOCATION_TYPE_LABELS: Record<string, string> = {
  dusty_springs: "Mining Town",
  frontiers_edge: "Frontier Outpost",
  iron_gulch: "Mining Camp",
  mesa_point: "Trading Post",
  coldwater: "Mountain Settlement",
  salvation: "Ghost Town",
  sunset_ranch: "Ranch",
  freeminer_hollow: "Freeminer Settlement",
  coppertown: "Company Town",
  junction_city: "Rail Junction",
  rattlesnake_canyon: "Wilderness",
  copper_mine: "Mine",
  desert_waystation: "Waystation",
};

/**
 * Format a location ID into a display name.
 * Tries the location data first, then falls back to ID formatting.
 */
function getDisplayName(locationId: string): string {
  const locData = getLocationById(locationId);
  if (locData?.name) return locData.name.toUpperCase();

  return locationId
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .toUpperCase();
}

function getSubtitle(locationId: string): string {
  return LOCATION_TYPE_LABELS[locationId] ?? "Frontier Territory";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LocationEntry() {
  const currentLocationId = useGameStoreShallow((s) => s.currentLocationId);
  const [displayLocation, setDisplayLocation] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const prevLocationRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip initial mount if there's no location
    if (!currentLocationId) return;

    // Skip if this is the same location
    if (currentLocationId === prevLocationRef.current) return;

    prevLocationRef.current = currentLocationId;
    setDisplayLocation(currentLocationId);

    // Clear any pending animation
    if (timerRef.current) clearTimeout(timerRef.current);

    // Reset and start fade sequence
    fadeAnim.setValue(0);

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: FADE_IN_MS,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => {
      // Hold, then fade out
      timerRef.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: FADE_OUT_MS,
          useNativeDriver: Platform.OS !== "web",
        }).start(() => {
          setDisplayLocation(null);
        });
      }, HOLD_MS);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentLocationId, fadeAnim]);

  if (!displayLocation) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 15,
      }}
      pointerEvents="none"
    >
      <Animated.View
        style={{
          alignItems: "center",
          opacity: fadeAnim,
        }}
      >
        {/* Location name - large */}
        <Text
          style={{
            color: HUD_AMBER,
            fontSize: 36,
            fontWeight: "700",
            fontFamily: Platform.select({
              ios: "Menlo",
              android: "monospace",
              default: "monospace",
            }),
            letterSpacing: 6,
            textAlign: "center",
            textShadowColor: "rgba(0, 0, 0, 0.8)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 6,
          }}
        >
          {getDisplayName(displayLocation)}
        </Text>

        {/* Divider line */}
        <View
          style={{
            width: 120,
            height: 1,
            backgroundColor: HUD_AMBER,
            opacity: 0.5,
            marginVertical: 8,
          }}
        />

        {/* Subtitle */}
        <Text
          style={{
            color: HUD_TEXT,
            fontSize: 14,
            fontFamily: Platform.select({
              ios: "Menlo",
              android: "monospace",
              default: "monospace",
            }),
            letterSpacing: 3,
            textAlign: "center",
            opacity: 0.8,
          }}
        >
          {getSubtitle(displayLocation)}
        </Text>
      </Animated.View>
    </View>
  );
}
