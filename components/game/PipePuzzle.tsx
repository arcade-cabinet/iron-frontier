/**
 * PipePuzzle - Pipe-fitting minigame UI.
 *
 * Ported from legacy/angular-ui/pipe-puzzle.component.ts
 *
 * Renders a grid of rotatable pipe tiles. The player taps tiles to rotate
 * them 90 degrees clockwise, trying to connect the source to the sink.
 * Uses the pure logic from src/game/puzzles/pipe-fitter/.
 */

import * as React from 'react';
import { Modal, Pressable, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  ZoomIn,
} from 'react-native-reanimated';

import { Text, Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { gameStore } from '@/src/game/store/webGameStore';
import { PipeLogic } from '@/src/game/puzzles/pipe-fitter';
import type { PipeCell, PipeType, Direction } from '@/src/game/puzzles/pipe-fitter/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Size of each tile in pixels */
const TILE_SIZE = 56;

/** Visual pipe widths */
const PIPE_WIDTH = 10;
const HALF_TILE = TILE_SIZE / 2;

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
  if (hasAny && type !== 'empty') {
    // Center dot
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
    if (cell.fixed || solved) return;
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

  const isSource = cell.type === 'source';
  const isSink = cell.type === 'sink';

  // Determine pipe color
  let pipeColor = '#6b7280'; // gray-500 (inactive)
  if (cell.active) {
    pipeColor = solved ? '#22c55e' : '#3b82f6'; // green-500 when solved, blue-500 when flowing
  }
  if (isSource) pipeColor = cell.active ? '#22c55e' : '#f59e0b'; // amber source
  if (isSink) pipeColor = cell.active && solved ? '#22c55e' : '#ef4444'; // red sink

  return (
    <Pressable onPress={handlePress} disabled={cell.fixed || solved}>
      <Animated.View
        style={[
          {
            width: TILE_SIZE,
            height: TILE_SIZE,
            borderWidth: 1,
            borderColor: cell.fixed ? '#4b5563' : '#374151',
            borderRadius: 4,
            backgroundColor: cell.fixed ? '#1f2937' : '#111827',
            overflow: 'hidden',
          },
          animatedStyle,
        ]}
      >
        {/* Pipe segments */}
        {segments.map((seg, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: seg.x,
              top: seg.y,
              width: seg.width,
              height: seg.height,
              backgroundColor: pipeColor,
              borderRadius: 2,
            }}
          />
        ))}

        {/* Source/Sink label */}
        {(isSource || isSink) && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: isSource ? '#fbbf24' : '#f87171',
              }}
            >
              {isSource ? 'IN' : 'OUT'}
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

  const [moveCount, setMoveCount] = React.useState(0);
  const [startTime] = React.useState(Date.now());
  const [elapsed, setElapsed] = React.useState(0);

  const isVisible = phase === 'puzzle' && activePuzzle != null;

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
      if (!activePuzzle || activePuzzle.solved || cell.fixed) return;

      const newCell = PipeLogic.rotateCell(cell);
      const newGrid = activePuzzle.grid.map((row) => [...row]);
      newGrid[newCell.y][newCell.x] = newCell;

      updatePuzzle(newGrid);
      setMoveCount((c) => c + 1);
    },
    [activePuzzle, updatePuzzle],
  );

  const handleClose = React.useCallback(() => {
    if (!activePuzzle) return;
    closePuzzle(activePuzzle.solved);
  }, [activePuzzle, closePuzzle]);

  // Format elapsed time
  const formattedTime = React.useMemo(() => {
    const totalSec = Math.floor(elapsed / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [elapsed]);

  if (!isVisible || !activePuzzle) return null;

  const gridWidth = activePuzzle.width * TILE_SIZE + (activePuzzle.width - 1) * 2;

  return (
    <Modal transparent visible={isVisible} onRequestClose={handleClose}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        className="absolute inset-0 flex-1 items-center justify-center bg-black/70"
      >
        <Animated.View entering={ZoomIn.duration(300).delay(100)}>
          <Card className="border-frontier-leather/40">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                <Text variant="subheading">Pipe Repair</Text>
              </CardTitle>
              <Button variant="ghost" size="sm" onPress={handleClose}>
                <Text variant="small">{activePuzzle.solved ? 'Done' : 'Give Up'}</Text>
              </Button>
            </CardHeader>

            <CardContent className="items-center gap-4">
              {/* Status bar */}
              <View className="flex-row items-center gap-4">
                <Badge variant={activePuzzle.solved ? 'success' : 'info'}>
                  <Text>{activePuzzle.solved ? 'SOLVED' : 'IN PROGRESS'}</Text>
                </Badge>
                <Text variant="caption" className="text-muted-foreground">
                  Moves: {moveCount}
                </Text>
                <Text variant="caption" className="text-muted-foreground">
                  Time: {formattedTime}
                </Text>
              </View>

              {/* Puzzle grid */}
              <View
                style={{ width: gridWidth }}
                className="items-center"
              >
                {activePuzzle.grid.map((row, rowIdx) => (
                  <View key={rowIdx} className="flex-row" style={{ gap: 2 }}>
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

              {/* Solved celebration */}
              {activePuzzle.solved && (
                <Animated.View entering={FadeIn.duration(400)}>
                  <Text variant="body" className="text-center text-green-400">
                    Systems restored! The pipes are connected.
                  </Text>
                </Animated.View>
              )}

              {/* Instructions */}
              {!activePuzzle.solved && (
                <Text variant="caption" className="text-center text-muted-foreground">
                  Tap pipes to rotate them. Connect IN to OUT.
                </Text>
              )}
            </CardContent>
          </Card>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
