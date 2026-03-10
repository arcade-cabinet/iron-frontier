import * as React from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { Text } from "@/components/ui";
import type { PipeCell } from "@/src/game/puzzles/pipe-fitter/types";

import {
  AMBER,
  AMBER_DIM,
  AMBER_GLOW,
  CELL_BG,
  CELL_BORDER,
  CELL_FIXED_BG,
  CELL_FIXED_BORDER,
  FLOW_AMBER,
  INACTIVE_PIPE,
  MONO_FONT,
  SOLVED_GREEN,
  TILE_SIZE,
} from "./constants.ts";
import { getPipeSegments } from "./pipeSegments.ts";

export function PipeTile({
  cell,
  onPress,
  solved,
}: {
  cell: PipeCell;
  onPress: (cell: PipeCell) => void;
  solved: boolean;
}) {
  const scale = useSharedValue(1);

  const handlePress = React.useCallback(() => {
    if (cell.fixed || cell.locked || solved) return;
    scale.value = withSpring(1, { damping: 8, stiffness: 300 });
    scale.value = 0.9;
    onPress(cell);
  }, [cell, solved, onPress, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const segments = React.useMemo(
    () => getPipeSegments(cell.type, cell.rotation),
    [cell.type, cell.rotation],
  );

  const isSource = cell.type === "source";
  const isSink = cell.type === "sink";
  const isInteractable = !cell.fixed && !cell.locked && !solved;

  let pipeColor = INACTIVE_PIPE;
  if (cell.active) {
    pipeColor = solved ? SOLVED_GREEN : FLOW_AMBER;
  }
  if (isSource) pipeColor = cell.active ? (solved ? SOLVED_GREEN : FLOW_AMBER) : AMBER;
  if (isSink) pipeColor = cell.active && solved ? SOLVED_GREEN : AMBER_DIM;

  return (
    <Pressable onPress={handlePress} disabled={!isInteractable}>
      <Animated.View
        style={[
          {
            width: TILE_SIZE,
            height: TILE_SIZE,
            borderWidth: 1,
            borderColor: cell.fixed || cell.locked ? CELL_FIXED_BORDER : CELL_BORDER,
            borderRadius: 2,
            backgroundColor: cell.fixed || cell.locked ? CELL_FIXED_BG : CELL_BG,
            overflow: "hidden",
          },
          animatedStyle,
        ]}
      >
        {segments.map((seg, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: seg.x,
              top: seg.y,
              width: seg.width,
              height: seg.height,
              backgroundColor: pipeColor,
              borderRadius: 1,
            }}
          />
        ))}

        {isSource || isSink ? (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 8,
                fontWeight: "700",
                fontFamily: MONO_FONT,
                color: isSource ? AMBER : AMBER_DIM,
                textShadowColor: AMBER_GLOW,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 4,
              }}
            >
              {isSource ? "IN" : "OUT"}
            </Text>
          </View>
        ) : null}

        {cell.locked && !cell.fixed ? (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: AMBER_DIM,
                fontFamily: MONO_FONT,
              }}
            >
              X
            </Text>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}
