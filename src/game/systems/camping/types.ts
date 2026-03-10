import type { TerrainType } from '../provisions';
import type { TimePhase } from '../time';

export type RestDuration = 2 | 4 | 8;

export type CampActivity = 'rest' | 'hunt' | 'forage' | 'keep_watch' | 'break_camp';

export type FireState = 'none' | 'smoldering' | 'burning' | 'blazing';

export type CampEncounterType =
  | 'none'
  | 'wildlife_passive'
  | 'wildlife_hostile'
  | 'bandit_scout'
  | 'bandit_raid'
  | 'traveler_friendly'
  | 'traveler_suspicious'
  | 'weather_event'
  | 'discovery';

export interface CampEncounter {
  type: CampEncounterType;
  isCombat: boolean;
  encounterId?: string;
  description: string;
  wakesPlayer: boolean;
  resourceChange?: {
    food?: number;
    water?: number;
    gold?: number;
  };
}

export interface CampingResult {
  hoursRested: number;
  fatigueRecovered: number;
  foodConsumed: number;
  waterConsumed: number;
  wasInterrupted: boolean;
  encounters: CampEncounter[];
  endPhase: TimePhase;
  summary: string;
}

export interface CampingConfig {
  restDurations: RestDuration[];

  recoveryRates: {
    noFire: number;
    withFire: number;
    dayBonus: number;
  };

  fire: {
    safetyBonus: number;
    visibilityIncrease: number;
    fuelPerHour: number;
  };

  encounterChances: {
    base: number;
    nightMultiplier: number;
    terrainModifiers: Record<TerrainType, number>;
  };

  encounterProbabilities: Record<CampEncounterType, number>;
}

export interface CampingState {
  isCamping: boolean;
  fireState: FireState;
  fuelRemaining: number;
  campStartTime: number;
  hoursCamped: number;
  encounters: CampEncounter[];
}
