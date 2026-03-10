export type {
  InteractionType,
  Vec3,
  InteractableEntity,
  InteractionTarget,
  InteractionAction,
  InteractionResult,
} from './types';

export { processInteraction, DEFAULT_RANGES } from './processInteraction';

export {
  createNPCInteractable,
  createBuildingInteractable,
  createLockpickInteractable,
  createItemInteractable,
} from './factories';
