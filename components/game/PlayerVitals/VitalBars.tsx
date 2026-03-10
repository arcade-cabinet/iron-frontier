import * as React from "react";
import { Platform, View } from "react-native";

import { Text } from "@/components/ui/Text";

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

interface SegmentedBarProps {
  value: number;
  maxValue: number;
  segments: number;
  height: number;
  color: string;
  width: number;
  flash?: boolean;
}

export const SegmentedBar = React.memo(function SegmentedBar({
  value,
  maxValue,
  segments,
  height,
  color,
  width,
}: SegmentedBarProps) {
  const pct = maxValue > 0 ? value / maxValue : 0;
  const filledSegments = Math.ceil(pct * segments);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: height + 4,
        width,
      }}
    >
      <View
        style={{
          width: 2,
          height: height + 4,
          backgroundColor: color,
          opacity: 0.7,
          borderTopLeftRadius: 1,
          borderBottomLeftRadius: 1,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
          paddingHorizontal: 1,
          flex: 1,
        }}
      >
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filledSegments;
          const isPartial = i === filledSegments - 1 && pct < 1;

          return (
            <View
              key={i}
              style={{
                flex: 1,
                height,
                backgroundColor: isFilled ? color : `${color}20`,
                borderRadius: 1,
                opacity: isFilled ? (isPartial ? 0.7 : 0.9) : 0.3,
              }}
            />
          );
        })}
      </View>
      <View
        style={{
          width: 2,
          height: height + 4,
          backgroundColor: color,
          opacity: 0.7,
          borderTopRightRadius: 1,
          borderBottomRightRadius: 1,
        }}
      />
    </View>
  );
});

interface VerticalFillProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  height: number;
}

export const VerticalFill = React.memo(function VerticalFill({
  label,
  value,
  maxValue,
  color,
  height,
}: VerticalFillProps) {
  const pct = maxValue > 0 ? Math.min(1, value / maxValue) : 0;
  const fillHeight = Math.round(pct * height);

  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <View
        style={{
          width: 8,
          height,
          borderRadius: 2,
          borderWidth: 1,
          borderColor: `${color}66`,
          backgroundColor: `${color}15`,
          justifyContent: "flex-end",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: "100%",
            height: fillHeight,
            backgroundColor: color,
            opacity: 0.8,
            borderRadius: 1,
          }}
        />
      </View>
      <Text
        style={{
          color: `${color}AA`,
          fontSize: 7,
          fontFamily: MONO_FONT,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </View>
  );
});
