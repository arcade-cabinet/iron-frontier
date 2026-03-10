/**
 * InteriorGenerator — barrel export for all interior generation sub-modules.
 *
 * @module engine/interiors/InteriorGenerator
 */

// Types
export type {
  InteriorDimensions,
  DoorPosition,
  InteriorNPCPosition,
  InteriorMetadata,
} from './types.ts';

// Public API
export {
  getInteriorMetadata,
  getDoorWorldPosition,
  getInteriorNPCWorldPositions,
  addInteriorLighting,
  hasInterior,
  getInteriorArchetypeIds,
} from './api.ts';
