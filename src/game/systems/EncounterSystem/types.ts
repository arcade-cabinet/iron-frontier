export interface EncounterZone {
  /** Zone identifier */
  id: string;
  /** Base encounter rate (0-1, chance per distance check) */
  baseRate: number;
  /** Minimum meters traveled before encounter can trigger */
  minDistance: number;
  /** Available encounter IDs in this zone */
  encounterPool: string[];
  /** Time-based rate modifiers */
  timeModifiers: {
    dawn: number;
    day: number;
    dusk: number;
    night: number;
  };
  /** Terrain type affects encounter rate */
  terrain: 'grass' | 'desert' | 'mountain' | 'road' | 'forest' | 'town';
  /**
   * @deprecated Use minDistance instead. Kept for backwards compatibility.
   */
  minSteps?: number;
}

export interface EncounterTrigger {
  /** Encounter ID from the pool */
  encounterId: string;
  /** Zone where encounter occurred */
  zoneId: string;
  /** Terrain type */
  terrain: string;
  /** Time of day when triggered */
  timeOfDay: string;
}

export interface EncounterState {
  /** Meters traveled since last encounter */
  distanceSinceEncounter: number;
  /** Current zone (null if in safe area) */
  currentZone: EncounterZone | null;
  /** Repel distance remaining (meters) */
  repelDistance: number;
  /** Is encounter system active */
  enabled: boolean;
  /** Distance to nearest town boundary (meters); 0 = unknown */
  distanceToTown: number;
}

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export type EncounterCallback = (trigger: EncounterTrigger) => void;

/** Meters between each encounter-chance check */
export const DISTANCE_CHECK_INTERVAL = 10;

/** No encounters within this distance of town boundaries */
export const TOWN_SAFE_RADIUS = 50;

/** Terrain-based rate modifiers */
export const TERRAIN_MODIFIERS: Record<string, number> = {
  grass: 1.0,
  desert: 0.7,
  mountain: 0.5,
  road: 0.2,
  forest: 1.2,
  town: 0,
};
