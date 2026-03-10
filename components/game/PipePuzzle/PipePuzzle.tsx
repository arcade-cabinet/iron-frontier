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
import { Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";

import { PipeLogic } from "@/src/game/puzzles/pipe-fitter";
import type { PipeCell } from "@/src/game/puzzles/pipe-fitter/types";
import { LOCK_DIFFICULTY } from "@/src/game/puzzles/pipe-fitter/types";
import { gameStore } from "@/src/game/store/webGameStore";

import { AMBER, TERMINAL_BG, TERMINAL_BORDER, TILE_SIZE } from "./constants.ts";
import { PipeTile } from "./PipeTile.tsx";
import { PuzzleBottomActions, PuzzleSolvedBanner } from "./PuzzleActions.tsx";
import { PuzzleHeader, PuzzleStatusBar } from "./PuzzleHeader.tsx";

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

  React.useEffect(() => {
    if (isVisible) {
      setMoveCount(0);
    }
  }, [isVisible]);

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
          <View
            style={{
              backgroundColor: TERMINAL_BG,
              borderWidth: 1,
              borderColor: TERMINAL_BORDER,
              borderRadius: 4,
              paddingVertical: 16,
              paddingHorizontal: 20,
              maxWidth: 500,
              shadowColor: AMBER,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
            }}
          >
            <PuzzleHeader
              title={title}
              subtitle={subtitle}
              solved={activePuzzle.solved}
              onClose={handleAbandon}
            />

            <PuzzleStatusBar
              solved={activePuzzle.solved}
              moveCount={moveCount}
              formattedTime={formattedTime}
              isLockpick={isLockpick}
              lockpickCount={lockpickCount}
            />

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

            {activePuzzle.solved ? (
              <PuzzleSolvedBanner isLockpick={isLockpick} onSuccess={handleSuccess} />
            ) : null}

            {!activePuzzle.solved ? (
              <PuzzleBottomActions
                isLockpick={isLockpick}
                canForce={canForce}
                forceCost={forceCost}
                onForceLock={handleForceLock}
                onAbandon={handleAbandon}
              />
            ) : null}
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
