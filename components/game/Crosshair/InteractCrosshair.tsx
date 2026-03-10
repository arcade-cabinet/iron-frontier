import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { COLOR_INTERACT, MONO_FONT } from "./constants.ts";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export function InteractCrosshair() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: [{ translateX: -10 }, { translateY: -8 }],
        }}
      >
        <Text
          style={{
            color: COLOR_INTERACT,
            fontSize: 14,
            fontWeight: "700",
            fontFamily: MONO_FONT,
            textShadowColor: "rgba(212, 168, 85, 0.4)",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 4,
          }}
        >
          [E]
        </Text>
      </View>
    </View>
  );
}
