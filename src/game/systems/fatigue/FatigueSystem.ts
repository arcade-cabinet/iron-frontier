import { scopedRNG, rngTick } from '../../lib/prng';
import type { FatigueConfig, FatigueEffects, FatigueLevel, FatigueState } from './types';
import { DEFAULT_FATIGUE_CONFIG, DEFAULT_FATIGUE_STATE, FATIGUE_EFFECTS } from './constants';

export class FatigueSystem {
  private config: FatigueConfig;
  private state: FatigueState;

  constructor(
    config: Partial<FatigueConfig> = {},
    initialState: Partial<FatigueState> = {}
  ) {
    this.config = { ...DEFAULT_FATIGUE_CONFIG, ...config };
    this.state = { ...DEFAULT_FATIGUE_STATE, ...initialState };
  }

  getCurrent(): number {
    return this.state.current;
  }

  getMax(): number {
    return this.config.maxFatigue;
  }

  getPercentage(): number {
    return this.state.current / this.config.maxFatigue;
  }

  getLevel(): FatigueLevel {
    const { current } = this.state;
    const { thresholds } = this.config;

    if (current >= thresholds.collapsed) return 'collapsed';
    if (current >= thresholds.exhausted) return 'exhausted';
    if (current >= thresholds.weary) return 'weary';
    if (current >= thresholds.tired) return 'tired';
    return 'rested';
  }

  getEffects(): FatigueEffects {
    return FATIGUE_EFFECTS[this.getLevel()];
  }

  getDescription(): string {
    const level = this.getLevel();
    switch (level) {
      case 'rested':
        return 'You feel well-rested and ready for anything.';
      case 'tired':
        return 'You are starting to feel tired. Combat is slightly affected.';
      case 'weary':
        return 'Weariness slows your movements. You need rest soon.';
      case 'exhausted':
        return 'Exhaustion clouds your mind. Combat is severely impaired.';
      case 'collapsed':
        return 'You collapse from exhaustion and cannot continue.';
    }
  }

  checkStumble(): boolean {
    const effects = this.getEffects();
    if (effects.stumbleChance <= 0) return false;

    const shouldStumble = scopedRNG('survival', 42, rngTick()) < effects.stumbleChance;
    if (shouldStumble) {
      this.state.pendingStumble = true;
    }
    return shouldStumble;
  }

  consumePendingStumble(): boolean {
    const pending = this.state.pendingStumble;
    this.state.pendingStumble = false;
    return pending;
  }

  canAct(): boolean {
    return this.getEffects().canAct;
  }

  isVulnerable(): boolean {
    return this.getEffects().isVulnerable;
  }

  applyTravelFatigue(realMinutes: number, isNight = false): void {
    let fatigue = realMinutes * this.config.rates.travel;
    if (isNight) {
      fatigue += realMinutes * this.config.rates.nightPenalty;
    }
    this.addFatigue(fatigue);
  }

  applyCombatFatigue(realMinutes = 1): void {
    this.addFatigue(this.config.rates.combat * realMinutes);
  }

  applyIdleFatigue(realMinutes: number, isNight = false): void {
    let fatigue = realMinutes * this.config.rates.idle;
    if (isNight) {
      fatigue += realMinutes * this.config.rates.nightPenalty;
    }
    this.addFatigue(fatigue);
  }

  applyNightFatigue(realMinutes: number): void {
    this.addFatigue(realMinutes * this.config.rates.nightPenalty);
  }

  applyInnRest(hours: number): void {
    this.removeFatigue(hours * this.config.recovery.inn);
  }

  applyCampRest(hours: number): void {
    this.removeFatigue(hours * this.config.recovery.camp);
  }

  applyItemRest(multiplier = 1): void {
    this.removeFatigue(this.config.recovery.item * multiplier);
  }

  addFatigue(amount: number): void {
    this.state.current = Math.min(
      this.config.maxFatigue,
      this.state.current + amount
    );
  }

  removeFatigue(amount: number): void {
    this.state.current = Math.max(0, this.state.current - amount);
  }

  setFatigue(value: number): void {
    this.state.current = Math.max(0, Math.min(this.config.maxFatigue, value));
  }

  fullRest(): void {
    this.state.current = 0;
  }

  getState(): FatigueState {
    return { ...this.state };
  }

  loadState(state: Partial<FatigueState>): void {
    this.state = { ...this.state, ...state };
  }

  reset(): void {
    this.state = { ...DEFAULT_FATIGUE_STATE };
  }
}
