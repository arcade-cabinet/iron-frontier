/**
 * EnterVRButton — Fixed-position "Enter VR" button for the game UI.
 *
 * Only renders on web when the browser supports immersive-vr sessions.
 * Uses the xrStore singleton from XRSetup to enter VR mode on press.
 *
 * Styled with frontier aesthetics (amber text, dark background).
 * Positioned bottom-right above the game canvas.
 *
 * Place this in the React Native overlay layer (outside <Canvas>).
 */

import * as React from "react";
import { Platform, Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";

export function EnterVRButton() {
  const [supported, setSupported] = React.useState(false);

  React.useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof navigator === "undefined" || !("xr" in navigator)) return;

    (navigator as { xr?: { isSessionSupported: (mode: string) => Promise<boolean> } }).xr
      ?.isSessionSupported("immersive-vr")
      .then((result) => setSupported(result))
      .catch(() => setSupported(false));
  }, []);

  if (!supported) return null;

  const handlePress = () => {
    try {
      const { xrStore } = require("@/src/game/xr/XRSetup");
      if (xrStore) {
        xrStore.enterVR();
      }
    } catch {
      // XR module not available
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        zIndex: 100,
      }}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Enter VR mode"
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: pressed ? "rgba(15, 10, 5, 0.95)" : "rgba(15, 10, 5, 0.85)",
          borderWidth: 2,
          borderColor: pressed ? "rgba(217, 119, 6, 0.8)" : "rgba(217, 119, 6, 0.5)",
        })}
      >
        <Text
          style={{
            color: "#f59e0b",
            fontSize: 14,
            fontWeight: "600",
            fontFamily: "monospace",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Enter VR
        </Text>
      </Pressable>
    </View>
  );
}
