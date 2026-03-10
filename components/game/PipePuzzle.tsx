/**
 * PipePuzzle - Pipe-fitting minigame UI for lockpicking and hacking.
 *
 * Renders a grid of rotatable pipe tiles in Fallout-style amber HUD.
 * The player taps tiles to rotate them 90 degrees clockwise, trying to
 * connect the source to the sink. Used for lockpicking containers/doors
 * and hacking terminals.
 *
 * Features:
 * - Reads puzzle state from puzzleSlice via gameStore
 * - Fallout amber (#D4A855) visual styling
 * - Lock difficulty display
 * - Force Lock option (costs multiple lockpicks)
 * - Lockpick count display
 * - Failure consumes a lockpick
 */

import * as React from "react";
import { Platform, Pressable, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
} from "react-native-reanimated";

import { Button, Text } from "@/components/ui";
import { PipeLogic } from "@/src/game/puzzles/pipe-fitter";
import type { Direction, PipeCell, PipeType } from "@/src/game/puzzles/pipe-fitter/types";
import { LOCK_DIFFICULTY } from "@/src/game/puzzles/pipe-fitter/types";
import { gameStore } from "@/src/game/store/webGameStore";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Size of each tile in pixels */
const TILE_SIZE = 52;

/** Visual pipe widths */
const PIPE_WIDTH = 8;
const HALF_TILE = TILE_SIZE / 2;

/** Fallout HUD colors */
const AMBER = "#D4A855";
const AMBER_DIM = "#8B7335";
const AMBER_GLOW = "rgba(212, 168, 85, 0.4)";
const AMBER_BG = "rgba(212, 168, 85, 0.08)";
const TERMINAL_BG = "rgba(10, 8, 5, 0.95)";
const TERMINAL_BORDER = "rgba(212, 168, 85, 0.3)";
const CELL_BG = "rgba(212, 168, 85, 0.04)";
const CELL_BORDER = "rgba(212, 168, 85, 0.15)";
const CELL_FIXED_BG = "rgba(212, 168, 85, 0.12)";
const CELL_FIXED_BORDER = "rgba(212, 168, 85, 0.25)";
const SOLVED_GREEN = "#4ADE80";
const FLOW_AMBER = "#E8C460";
const INACTIVE_PIPE = "rgba(212, 168, 85, 0.25)";

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

// ---------------------------------------------------------------------------
// Pipe rendering helpers
// ---------------------------------------------------------------------------

/**
 * Returns the pipe segments to draw for a given cell.
 * Each segment is a rectangle positioned relative to the tile center.
 */
function getPipeSegments(
  type: PipeType,
  rotation: Direction,
): { x: number; y: number; width: number; height: number }[] {
  const connections = PipeLogic.getConnections(type, rotation);
  const segments: { x: number; y: number; width: number; height: number }[] = [];

  // Center node for connected pipes
  const hasAny = connections.some(Boolean);
  if (hasAny && type !== "empty") {
    segments.push({
      x: HALF_TILE - PIPE_WIDTH / 2,
      y: HALF_TILE - PIPE_WIDTH / 2,
      width: PIPE_WIDTH,
      height: PIPE_WIDTH,
    });
  }

  // North
  if (connections[0]) {
    segments.push({
      x: HALF_TILE - PIPE_WIDTH / 2,
      y: 0,
      width: PIPE_WIDTH,
      height: HALF_TILE,
    });
  }
  // East
  if (connections[1]) {
    segments.push({
      x: HALF_TILE,
      y: HALF_TILE - PIPE_WIDTH / 2,
      width: HALF_TILE,
      height: PIPE_WIDTH,
    });
  }
  // South
  if (connections[2]) {
    segments.push({
      x: HALF_TILE - PIPE_WIDTH / 2,
      y: HALF_TILE,
      width: PIPE_WIDTH,
      height: HALF_TILE,
    });
  }
  // West
  if (connections[3]) {
    segments.push({
      x: 0,
      y: HALF_TILE - PIPE_WIDTH / 2,
      width: HALF_TILE,
      height: PIPE_WIDTH,
    });
  }

  return segments;
}

// ---------------------------------------------------------------------------
// Pipe Tile Component
// ---------------------------------------------------------------------------

function PipeTile({
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

  // Determine pipe color — Fallout amber palette
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
        {/* Pipe segments */}
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

        {/* Source/Sink label */}
        {(isSource || isSink) && (
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
        )}

        {/* Lock icon for locked cells */}
        {cell.locked && !cell.fixed && (
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
        )}
      </Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function PipePuzzle() {
  const activePuzzle = gameStore((s) => s.activePuzzle);
  const phase = gameStore((s) => s.phase);
  const updatePuzzle = gameStore((s) => s.updatePuzzle);
  const closePuzzle = gameStore((s) => s.closePuzzle);
  const forceLockAction = gameStore((s) => s.forceLock);
  const abandonPuzzle = gameStore((s) => s.abandonPuzzle);
  const lockpickCount = gameStore((s) => s.getItemCount("lockpick"));

  const [moveCount, setMoveCount] = React.useState(0);
  const [startTime] = React.useState(Date.now());
  const [elapsed, setElapsed] = React.useState(0);

  const isVisible = phase === "puzzle" && activePuzzle != null;

  // Reset move count when a new puzzle starts
  React.useEffect(() => {
    if (isVisible) {
      setMoveCount(0);
    }
  }, [isVisible]);

  // Timer
  React.useEffect(() => {
    if (!isVisible || activePuzzle?.solved) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible, activePuzzle?.solved, startTime]);

  const handleCellPress = React.useCallback(
    (cell: PipeCell) => {
      if (!activePuzzle || activePuzzle.solved || cell.fixed || cell.locked) return;

      const newCell = PipeLogic.rotateCell(cell);
      const newGrid = activePuzzle.grid.map((row) => [...row]);
      newGrid[newCell.y][newCell.x] = newCell;

      updatePuzzle(newGrid);
      setMoveCount((c) => c + 1);
    },
    [activePuzzle, updatePuzzle],
  );

  const handleSuccess = React.useCallback(() => {
    if (!activePuzzle) return;
    closePuzzle(true);
  }, [activePuzzle, closePuzzle]);

  const handleAbandon = React.useCallback(() => {
    if (!activePuzzle) return;
    if (activePuzzle.solved) {
      closePuzzle(true);
    } else {
      abandonPuzzle();
    }
  }, [activePuzzle, closePuzzle, abandonPuzzle]);

  const handleForceLock = React.useCallback(() => {
    forceLockAction();
  }, [forceLockAction]);

  // Format elapsed time
  const formattedTime = React.useMemo(() => {
    const totalSec = Math.floor(elapsed / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [elapsed]);

  if (!isVisible || !activePuzzle) return null;

  const context = activePuzzle.context;
  const isLockpick = context != null;
  const difficulty = context ? LOCK_DIFFICULTY[context.lockLevel] : null;
  const forceCost = difficulty?.forceLockCost ?? 0;
  const canForce = isLockpick && lockpickCount >= forceCost;
  const gridWidth = activePuzzle.width * TILE_SIZE + (activePuzzle.width - 1) * 2;

  const title = isLockpick && context ? context.targetName : "Pipe Repair";
  const subtitle =
    difficulty && context ? `[${difficulty.label}] Lock Level ${context.lockLevel}` : null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      pointerEvents="box-none"
    >
      <Pressable
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.55)",
        }}
        onPress={handleAbandon}
      />
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
        pointerEvents="box-none"
      >
        <Animated.View entering={ZoomIn.duration(300).delay(100)} pointerEvents="auto">
          {/* Terminal frame */}
          <View
            style={{
              backgroundColor: TERMINAL_BG,
              borderWidth: 1,
              borderColor: TERMINAL_BORDER,
              borderRadius: 4,
              paddingVertical: 16,
              paddingHorizontal: 20,
              maxWidth: 500,
              // Scanline-like shadow
              shadowColor: AMBER,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: TERMINAL_BORDER,
                paddingBottom: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: AMBER,
                    fontSize: 16,
                    fontWeight: "700",
                    fontFamily: MONO_FONT,
                    textShadowColor: AMBER_GLOW,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 6,
                  }}
                >
                  {title}
                </Text>
                {subtitle && (
                  <Text
                    style={{
                      color: AMBER_DIM,
                      fontSize: 11,
                      fontFamily: MONO_FONT,
                      marginTop: 2,
                    }}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>
              <Pressable onPress={handleAbandon}>
                <Text
                  style={{
                    color: AMBER_DIM,
                    fontSize: 12,
                    fontFamily: MONO_FONT,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  {activePuzzle.solved ? "[DONE]" : "[ESC]"}
                </Text>
              </Pressable>
            </View>

            {/* Status bar */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  backgroundColor: activePuzzle.solved ? "rgba(74, 222, 128, 0.15)" : AMBER_BG,
                  borderWidth: 1,
                  borderColor: activePuzzle.solved ? "rgba(74, 222, 128, 0.4)" : TERMINAL_BORDER,
                  borderRadius: 2,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    color: activePuzzle.solved ? SOLVED_GREEN : AMBER,
                    fontSize: 10,
                    fontWeight: "700",
                    fontFamily: MONO_FONT,
                  }}
                >
                  {activePuzzle.solved ? "UNLOCKED" : "LOCKED"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <Text
                  style={{
                    color: AMBER_DIM,
                    fontSize: 10,
                    fontFamily: MONO_FONT,
                  }}
                >
                  MOVES:{moveCount}
                </Text>
                <Text
                  style={{
                    color: AMBER_DIM,
                    fontSize: 10,
                    fontFamily: MONO_FONT,
                  }}
                >
                  TIME:{formattedTime}
                </Text>
                {isLockpick && (
                  <Text
                    style={{
                      color: lockpickCount > 0 ? AMBER_DIM : "#EF4444",
                      fontSize: 10,
                      fontFamily: MONO_FONT,
                    }}
                  >
                    PICKS:{lockpickCount}
                  </Text>
                )}
              </View>
            </View>

            {/* Puzzle grid */}
            <View style={{ alignItems: "center", marginBottom: 12 }}>
              <View style={{ width: gridWidth }}>
                {activePuzzle.grid.map((row, rowIdx) => (
                  <View key={rowIdx} style={{ flexDirection: "row", gap: 2 }}>
                    {row.map((cell, colIdx) => (
                      <PipeTile
                        key={`${rowIdx}-${colIdx}`}
                        cell={cell}
                        onPress={handleCellPress}
                        solved={activePuzzle.solved}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>

            {/* Solved celebration */}
            {activePuzzle.solved && (
              <Animated.View entering={FadeIn.duration(400)}>
                <View
                  style={{
                    backgroundColor: "rgba(74, 222, 128, 0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(74, 222, 128, 0.3)",
                    borderRadius: 2,
                    padding: 10,
                    marginBottom: 8,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: SOLVED_GREEN,
                      fontSize: 12,
                      fontWeight: "700",
                      fontFamily: MONO_FONT,
                      textAlign: "center",
                    }}
                  >
                    {isLockpick ? "LOCK MECHANISM BYPASSED" : "PIPE SYSTEM CONNECTED"}
                  </Text>
                </View>
                <Pressable onPress={handleSuccess}>
                  <View
                    style={{
                      backgroundColor: "rgba(74, 222, 128, 0.15)",
                      borderWidth: 1,
                      borderColor: "rgba(74, 222, 128, 0.4)",
                      borderRadius: 2,
                      paddingVertical: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: SOLVED_GREEN,
                        fontSize: 13,
                        fontWeight: "700",
                        fontFamily: MONO_FONT,
                      }}
                    >
                      {isLockpick ? "[OPEN]" : "[DONE]"}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            )}

            {/* Bottom actions (when not solved) */}
            {!activePuzzle.solved && (
              <View style={{ gap: 8 }}>
                {/* Instructions */}
                <Text
                  style={{
                    color: AMBER_DIM,
                    fontSize: 10,
                    fontFamily: MONO_FONT,
                    textAlign: "center",
                  }}
                >
                  TAP PIPES TO ROTATE. CONNECT [IN] TO [OUT].
                </Text>

                {/* Action buttons for lockpicking */}
                {isLockpick && (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    {/* Force Lock button */}
                    <Pressable onPress={handleForceLock} disabled={!canForce} style={{ flex: 1 }}>
                      <View
                        style={{
                          backgroundColor: canForce ? AMBER_BG : "rgba(100, 80, 50, 0.1)",
                          borderWidth: 1,
                          borderColor: canForce ? TERMINAL_BORDER : "rgba(100, 80, 50, 0.15)",
                          borderRadius: 2,
                          paddingVertical: 8,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: canForce ? AMBER : "rgba(139, 115, 53, 0.4)",
                            fontSize: 11,
                            fontWeight: "600",
                            fontFamily: MONO_FONT,
                          }}
                        >
                          FORCE [{forceCost} PICKS]
                        </Text>
                      </View>
                    </Pressable>

                    {/* Give Up button */}
                    <Pressable onPress={handleAbandon} style={{ flex: 1 }}>
                      <View
                        style={{
                          backgroundColor: "rgba(239, 68, 68, 0.08)",
                          borderWidth: 1,
                          borderColor: "rgba(239, 68, 68, 0.25)",
                          borderRadius: 2,
                          paddingVertical: 8,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#EF4444",
                            fontSize: 11,
                            fontWeight: "600",
                            fontFamily: MONO_FONT,
                          }}
                        >
                          GIVE UP [-1 PICK]
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
