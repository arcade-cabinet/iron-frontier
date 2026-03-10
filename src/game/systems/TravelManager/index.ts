/**
 * TravelManager — barrel export for all travel management sub-modules.
 *
 * @module systems/TravelManager
 */

// Types
export type {
  TravelRoute,
  EncounterCheckpoint,
  TravelTickResult,
  TravelManagerState,
  ProceduralEncounterResolver,
} from './types.ts';

// Class + singleton
export { TravelManager, getTravelManager } from './TravelManagerClass.ts';

// Utility functions
export { dangerDescription, methodDescription } from './utilities.ts';
