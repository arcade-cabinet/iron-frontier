export type {
  RestDuration,
  CampActivity,
  FireState,
  CampEncounterType,
  CampEncounter,
  CampingResult,
  CampingConfig,
  CampingState,
} from './types';

export {
  DEFAULT_CAMPING_CONFIG,
  DEFAULT_CAMPING_STATE,
  ENCOUNTER_DESCRIPTIONS,
} from './config';

export { CampingSystem } from './CampingSystem';

export {
  createCampingSystem,
  calculateRestRecovery,
  getRestDurationLabel,
  getRecommendedRestDuration,
} from './utils';
