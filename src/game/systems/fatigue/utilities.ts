import type { TimePhase } from '../time';
import type { FatigueLevel } from './types';
import type { FatigueState } from './types';
import { DEFAULT_FATIGUE_CONFIG } from './constants';
import { FatigueSystem } from './FatigueSystem';

export function createFatigueSystem(
  initialState?: Partial<FatigueState>
): FatigueSystem {
  return new FatigueSystem(undefined, initialState);
}

export function calculateTravelFatigue(
  realMinutes: number,
  phase: TimePhase
): number {
  const isNight = phase === 'night';
  let fatigue = realMinutes * DEFAULT_FATIGUE_CONFIG.rates.travel;
  if (isNight) {
    fatigue += realMinutes * DEFAULT_FATIGUE_CONFIG.rates.nightPenalty;
  }
  return fatigue;
}

export function calculateRestRecovery(
  hours: number,
  isInn: boolean
): number {
  const rate = isInn
    ? DEFAULT_FATIGUE_CONFIG.recovery.inn
    : DEFAULT_FATIGUE_CONFIG.recovery.camp;
  return hours * rate;
}

export function getFatigueLevel(fatigue: number): FatigueLevel {
  const { thresholds } = DEFAULT_FATIGUE_CONFIG;

  if (fatigue >= thresholds.collapsed) return 'collapsed';
  if (fatigue >= thresholds.exhausted) return 'exhausted';
  if (fatigue >= thresholds.weary) return 'weary';
  if (fatigue >= thresholds.tired) return 'tired';
  return 'rested';
}
