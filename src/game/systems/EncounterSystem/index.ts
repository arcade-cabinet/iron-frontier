export {
  type EncounterZone,
  type EncounterTrigger,
  type EncounterState,
  type TimeOfDay,
  type EncounterCallback,
  DISTANCE_CHECK_INTERVAL,
  TOWN_SAFE_RADIUS,
  TERRAIN_MODIFIERS,
} from './types';

export {
  EncounterSystem,
  getEncounterSystem,
} from './EncounterSystem';

export { createRouteEncounterZones } from './zones';
