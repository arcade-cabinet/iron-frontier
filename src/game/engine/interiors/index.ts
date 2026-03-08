// engine/interiors — Interior generation, door system, and lighting.

export {
  getInteriorMetadata,
  getDoorWorldPosition,
  getInteriorNPCWorldPositions,
  addInteriorLighting,
  hasInterior,
  getInteriorArchetypeIds,
  type InteriorDimensions,
  type DoorPosition,
  type InteriorNPCPosition,
  type InteriorMetadata,
} from './InteriorGenerator';

export {
  DoorSystem,
  getDoorSystem,
  resetDoorSystem,
  type DoorState,
  type DoorChangeCallback,
} from './DoorSystem';
