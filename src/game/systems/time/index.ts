export {
  type TimePhase,
  type TimeEventType,
  type TimeEventPayload,
  type TimeEventCallback,
  type GameClockConfig,
  type GameClockState,
  DEFAULT_CLOCK_CONFIG,
  DEFAULT_CLOCK_STATE,
} from './types';

export { GameClock } from './GameClock';

export {
  createGameClock,
  realMsToGameMinutes,
  gameMinutesToRealMs,
  realMsToGameHours,
} from './utils';
