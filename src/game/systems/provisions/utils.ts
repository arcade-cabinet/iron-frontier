import type { ProvisionsState, ProvisionStatus } from './types';
import { DEFAULT_PROVISIONS_CONFIG, STATUS_THRESHOLDS } from './config';
import { ProvisionsSystem } from './ProvisionsSystem';

export function createProvisionsSystem(
  initialState?: Partial<ProvisionsState>
): ProvisionsSystem {
  return new ProvisionsSystem(undefined, initialState);
}

export function calculateTravelConsumption(hours: number): {
  food: number;
  water: number;
} {
  return {
    food: hours * DEFAULT_PROVISIONS_CONFIG.consumption.food,
    water: hours * DEFAULT_PROVISIONS_CONFIG.consumption.water,
  };
}

export function hasEnoughProvisions(
  food: number,
  water: number,
  travelHours: number
): boolean {
  const consumption = calculateTravelConsumption(travelHours);
  return food >= consumption.food && water >= consumption.water;
}

export function getProvisionStatus(
  current: number,
  max: number
): ProvisionStatus {
  const percentage = current / max;
  if (percentage >= STATUS_THRESHOLDS.abundant) return 'abundant';
  if (percentage >= STATUS_THRESHOLDS.adequate) return 'adequate';
  if (percentage >= STATUS_THRESHOLDS.low) return 'low';
  if (percentage >= STATUS_THRESHOLDS.critical) return 'critical';
  return 'depleted';
}
