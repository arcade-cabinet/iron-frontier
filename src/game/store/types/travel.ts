import type { DangerLevel, TravelMethod } from '../../data/schemas/world';

export interface TravelState {
  fromLocationId: string;
  toLocationId: string;
  method: TravelMethod;
  travelTime: number;
  progress: number;
  dangerLevel: DangerLevel;
  startedAt: number;
  encounterId: string | null;
}
