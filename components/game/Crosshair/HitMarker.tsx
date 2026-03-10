import { Animated, StyleSheet, View } from "react-native";
import { ARM_THICKNESS, HIT_MARKER_SIZE } from "./constants.ts";

const styles = StyleSheet.create({
  hitMarkerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hitMarkerLine: {
    opacity: 1,
  },
});

export function HitMarker({
  hitOpacity,
  hitColor,
}: {
  hitOpacity: Animated.Value;
  hitColor: string;
}) {
  return (
    <Animated.View style={[styles.hitMarkerContainer, { opacity: hitOpacity }]}>
      <View
        style={[
          styles.hitMarkerLine,
          {
            backgroundColor: hitColor,
            width: HIT_MARKER_SIZE,
            height: ARM_THICKNESS,
            transform: [{ rotate: "45deg" }],
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: -ARM_THICKNESS / 2,
            marginLeft: -HIT_MARKER_SIZE / 2,
          },
        ]}
      />
      <View
        style={[
          styles.hitMarkerLine,
          {
            backgroundColor: hitColor,
            width: HIT_MARKER_SIZE,
            height: ARM_THICKNESS,
            transform: [{ rotate: "-45deg" }],
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: -ARM_THICKNESS / 2,
            marginLeft: -HIT_MARKER_SIZE / 2,
          },
        ]}
      />
    </Animated.View>
  );
}
