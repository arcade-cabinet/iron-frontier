import type { CampingState, RestDuration } from './types';
import { DEFAULT_CAMPING_CONFIG } from './config';
import { CampingSystem } from './CampingSystem';

export function createCampingSystem(
  initialState?: Partial<CampingState>
): CampingSystem {
  return new CampingSystem(undefined, initialState);
}

export function calculateRestRecovery(
  hours: number,
  hasFire: boolean,
  isDay: boolean
): number {
  const { recoveryRates } = DEFAULT_CAMPING_CONFIG;
  let rate = hasFire ? recoveryRates.withFire : recoveryRates.noFire;
  if (isDay) {
    rate += recoveryRates.dayBonus;
  }
  return hours * rate;
}

export function getRestDurationLabel(duration: RestDuration): string {
  switch (duration) {
    case 2:
      return 'Short Rest (2 hours)';
    case 4:
      return 'Medium Rest (4 hours)';
    case 8:
      return 'Full Rest (8 hours)';
  }
}

export function getRecommendedRestDuration(fatigue: number): RestDuration {
  if (fatigue >= 75) return 8;
  if (fatigue >= 50) return 4;
  return 2;
}
