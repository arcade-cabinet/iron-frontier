import type {
  GameClockConfig,
  GameClockState,
  TimeEventCallback,
  TimeEventPayload,
  TimeEventType,
  TimePhase,
} from './types';
import { DEFAULT_CLOCK_CONFIG, DEFAULT_CLOCK_STATE } from './types';

export class GameClock {
  private config: GameClockConfig;
  private state: GameClockState;
  private tickerId: ReturnType<typeof setInterval> | null = null;
  private lastTickTime: number = 0;
  private listeners: Map<TimeEventType, Set<TimeEventCallback>> = new Map();
  private accumulatedMs: number = 0;

  constructor(
    config: Partial<GameClockConfig> = {},
    initialState: Partial<GameClockState> = {}
  ) {
    this.config = { ...DEFAULT_CLOCK_CONFIG, ...config };
    this.state = { ...DEFAULT_CLOCK_STATE, ...initialState };
  }

  getHour(): number {
    return this.state.hour;
  }

  getMinute(): number {
    return this.state.minute;
  }

  getDay(): number {
    return this.state.day;
  }

  getPhase(): TimePhase {
    return this.calculatePhase(this.state.hour);
  }

  getTotalMinutes(): number {
    return this.state.totalMinutes;
  }

  getTotalHours(): number {
    return this.state.totalMinutes / 60;
  }

  isPaused(): boolean {
    return this.state.isPaused;
  }

  getFormattedTime(): string {
    const hour = this.state.hour.toString().padStart(2, '0');
    const minute = this.state.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }

  getFormattedDateTime(): string {
    return `Day ${this.state.day}, ${this.getFormattedTime()}`;
  }

  isNight(): boolean {
    return this.getPhase() === 'night';
  }

  isDay(): boolean {
    return !this.isNight();
  }

  getAmbientLight(): number {
    const hour = this.state.hour + this.state.minute / 60;
    const { phaseBoundaries } = this.config;

    if (hour >= phaseBoundaries.night[0] || hour < phaseBoundaries.dawn[0]) {
      return 0.2;
    }
    if (hour >= phaseBoundaries.dawn[0] && hour < phaseBoundaries.dawn[1]) {
      const progress = (hour - phaseBoundaries.dawn[0]) / (phaseBoundaries.dawn[1] - phaseBoundaries.dawn[0]);
      return 0.2 + progress * 0.6;
    }
    if (hour >= phaseBoundaries.day[0] && hour < phaseBoundaries.dusk[0]) {
      return 1.0;
    }
    if (hour >= phaseBoundaries.dusk[0] && hour < phaseBoundaries.dusk[1]) {
      const progress = (hour - phaseBoundaries.dusk[0]) / (phaseBoundaries.dusk[1] - phaseBoundaries.dusk[0]);
      return 1.0 - progress * 0.6;
    }
    const progress = (hour - phaseBoundaries.dusk[1]) / (phaseBoundaries.night[0] - phaseBoundaries.dusk[1]);
    return 0.4 - progress * 0.2;
  }

  start(): void {
    if (this.tickerId !== null) return;
    this.state.isPaused = false;
    this.lastTickTime = Date.now();
    this.accumulatedMs = 0;
    this.tickerId = setInterval(() => {
      this.tick();
    }, this.config.tickInterval);
  }

  pause(): void {
    if (this.tickerId === null) return;
    clearInterval(this.tickerId);
    this.tickerId = null;
    this.state.isPaused = true;
  }

  resume(): void {
    if (!this.state.isPaused) return;
    this.start();
  }

  toggle(): void {
    if (this.state.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  advanceTime(minutes: number, emitEvents = true): void {
    if (minutes <= 0) return;

    const previousPhase = this.getPhase();
    const previousHour = this.state.hour;
    const previousDay = this.state.day;

    this.state.totalMinutes += minutes;

    let totalMinutes = this.state.hour * 60 + this.state.minute + minutes;
    const daysToAdd = Math.floor(totalMinutes / (24 * 60));
    totalMinutes = totalMinutes % (24 * 60);

    this.state.day += daysToAdd;
    this.state.hour = Math.floor(totalMinutes / 60);
    this.state.minute = totalMinutes % 60;

    if (!emitEvents) return;

    const newPhase = this.getPhase();
    const eventPayload = this.createEventPayload();

    this.emit('tick', eventPayload);

    if (this.state.hour !== previousHour) {
      this.emit('hourChanged', eventPayload);
    }

    if (newPhase !== previousPhase) {
      this.emit('phaseChanged', { ...eventPayload, previousPhase });
    }

    if (this.state.day !== previousDay) {
      this.emit('dayChanged', eventPayload);
    }
  }

  advanceHours(hours: number, emitEvents = true): void {
    this.advanceTime(hours * 60, emitEvents);
  }

  setTime(hour: number, minute = 0): void {
    const previousPhase = this.getPhase();

    this.state.hour = Math.max(0, Math.min(23, Math.floor(hour)));
    this.state.minute = Math.max(0, Math.min(59, Math.floor(minute)));

    this.state.totalMinutes =
      (this.state.day - 1) * 24 * 60 +
      this.state.hour * 60 +
      this.state.minute;

    const newPhase = this.getPhase();
    if (newPhase !== previousPhase) {
      this.emit('phaseChanged', {
        ...this.createEventPayload(),
        previousPhase,
      });
    }
  }

  advanceToHour(targetHour: number): void {
    const currentHour = this.state.hour + this.state.minute / 60;
    let hoursToAdvance: number;

    if (targetHour > currentHour) {
      hoursToAdvance = targetHour - currentHour;
    } else {
      hoursToAdvance = 24 - currentHour + targetHour;
    }

    this.advanceHours(hoursToAdvance);
  }

  on(event: TimeEventType, callback: TimeEventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: TimeEventType, callback: TimeEventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  removeAllListeners(event?: TimeEventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  getState(): GameClockState {
    return { ...this.state };
  }

  loadState(state: Partial<GameClockState>): void {
    this.state = { ...this.state, ...state };
  }

  reset(): void {
    this.pause();
    this.state = { ...DEFAULT_CLOCK_STATE };
    this.accumulatedMs = 0;
  }

  dispose(): void {
    this.pause();
    this.removeAllListeners();
  }

  private tick(): void {
    const now = Date.now();
    const deltaMs = now - this.lastTickTime;
    this.lastTickTime = now;

    this.accumulatedMs += deltaMs;

    const gameMinutes = Math.floor(this.accumulatedMs / this.config.msPerGameMinute);

    if (gameMinutes > 0) {
      this.accumulatedMs -= gameMinutes * this.config.msPerGameMinute;
      this.advanceTime(gameMinutes);
    } else {
      this.emit('tick', this.createEventPayload());
    }
  }

  private calculatePhase(hour: number): TimePhase {
    const { phaseBoundaries } = this.config;

    if (hour >= phaseBoundaries.night[0] || hour < phaseBoundaries.night[1]) {
      return 'night';
    }
    if (hour >= phaseBoundaries.dawn[0] && hour < phaseBoundaries.dawn[1]) {
      return 'dawn';
    }
    if (hour >= phaseBoundaries.day[0] && hour < phaseBoundaries.day[1]) {
      return 'day';
    }
    if (hour >= phaseBoundaries.dusk[0] && hour < phaseBoundaries.dusk[1]) {
      return 'dusk';
    }

    return 'day';
  }

  private createEventPayload(): TimeEventPayload {
    return {
      hour: this.state.hour,
      minute: this.state.minute,
      day: this.state.day,
      phase: this.getPhase(),
    };
  }

  private emit(event: TimeEventType, payload: TimeEventPayload): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in time event listener (${event}):`, error);
        }
      });
    }
  }
}
