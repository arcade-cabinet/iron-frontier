export type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';

export type TimeEventType = 'tick' | 'hourChanged' | 'phaseChanged' | 'dayChanged';

export interface TimeEventPayload {
  hour: number;
  minute: number;
  day: number;
  phase: TimePhase;
  previousPhase?: TimePhase;
}

export type TimeEventCallback = (event: TimeEventPayload) => void;

export interface GameClockConfig {
  msPerGameMinute: number;
  tickInterval: number;
  phaseBoundaries: {
    dawn: [number, number];
    day: [number, number];
    dusk: [number, number];
    night: [number, number];
  };
}

export interface GameClockState {
  hour: number;
  minute: number;
  day: number;
  isPaused: boolean;
  totalMinutes: number;
}

export const DEFAULT_CLOCK_CONFIG: GameClockConfig = {
  msPerGameMinute: 4000,
  tickInterval: 1000,
  phaseBoundaries: {
    dawn: [5, 7],
    day: [7, 18],
    dusk: [18, 20],
    night: [20, 5],
  },
};

export const DEFAULT_CLOCK_STATE: GameClockState = {
  hour: 10,
  minute: 0,
  day: 1,
  isPaused: true,
  totalMinutes: 10 * 60,
};
