import * as React from "react";
import { Platform, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { HUD_AMBER, HUD_AMBER_DIM, HUD_RED, HUD_TEXT } from "./constants.ts";

interface TickProps {
  xFraction: number;
  label?: string;
  major: boolean;
  compassWidth: number;
}

export const Tick = React.memo(function Tick({ xFraction, label, major, compassWidth }: TickProps) {
  const x = compassWidth * (0.5 + xFraction);
  const height = major ? 10 : 5;

  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: 0,
        alignItems: "center",
        transform: [{ translateX: -0.5 }],
      }}
    >
      <View
        style={{
          width: 1,
          height,
          backgroundColor: major ? HUD_AMBER : HUD_AMBER_DIM,
          opacity: major ? 0.9 : 0.4,
        }}
      />
      {label && (
        <Text
          style={{
            color: HUD_AMBER,
            fontSize: major ? 10 : 8,
            fontWeight: major ? "700" : "400",
            fontFamily: Platform.select({
              ios: "Menlo",
              android: "monospace",
              default: "monospace",
            }),
            marginTop: 1,
            opacity: major ? 1 : 0.6,
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
});

interface MarkerDiamondProps {
  xFraction: number;
  compassWidth: number;
  color?: string;
  label?: string;
}

export const MarkerDiamond = React.memo(function MarkerDiamond({
  xFraction,
  compassWidth,
  color = HUD_AMBER,
  label,
}: MarkerDiamondProps) {
  const x = compassWidth * (0.5 + xFraction);

  return (
    <View
      style={{
        position: "absolute",
        left: x,
        bottom: -2,
        alignItems: "center",
        transform: [{ translateX: -4 }],
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          backgroundColor: color,
          transform: [{ rotate: "45deg" }],
          opacity: 0.9,
        }}
      />
      {label && (
        <Text
          style={{
            color: HUD_TEXT,
            fontSize: 8,
            marginTop: 4,
            textAlign: "center",
            maxWidth: 60,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </View>
  );
});

interface EnemyDotProps {
  xFraction: number;
  compassWidth: number;
}

export const EnemyDot = React.memo(function EnemyDot({ xFraction, compassWidth }: EnemyDotProps) {
  const x = compassWidth * (0.5 + xFraction);

  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: 2,
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: HUD_RED,
        transform: [{ translateX: -2.5 }],
        opacity: 0.9,
      }}
    />
  );
});
