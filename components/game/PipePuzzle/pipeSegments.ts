import { PipeLogic } from "@/src/game/puzzles/pipe-fitter";
import type { Direction, PipeType } from "@/src/game/puzzles/pipe-fitter/types";

import { HALF_TILE, PIPE_WIDTH } from "./constants.ts";

/**
 * Returns the pipe segments to draw for a given cell.
 * Each segment is a rectangle positioned relative to the tile center.
 */
export function getPipeSegments(
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
