import type { GameClockState } from './types';
import { DEFAULT_CLOCK_CONFIG } from './types';
import { GameClock } from './GameClock';

export function createGameClock(
  initialState?: Partial<GameClockState>
): GameClock {
  return new GameClock(undefined, initialState);
}

export function realMsToGameMinutes(realMs: number): number {
  return realMs / DEFAULT_CLOCK_CONFIG.msPerGameMinute;
}

export function gameMinutesToRealMs(gameMinutes: number): number {
  return gameMinutes * DEFAULT_CLOCK_CONFIG.msPerGameMinute;
}

export function realMsToGameHours(realMs: number): number {
  return realMsToGameMinutes(realMs) / 60;
}
