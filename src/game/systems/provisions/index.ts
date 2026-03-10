export type {
  TerrainType,
  ProvisionStatus,
  HuntingResult,
  ForagingResult,
  ProvisionsConfig,
  ProvisionsState,
} from './types';

export {
  DEFAULT_PROVISIONS_CONFIG,
  DEFAULT_PROVISIONS_STATE,
  STATUS_THRESHOLDS,
  FORAGING_YIELDS,
  FORAGING_ITEMS,
} from './config';

export { ProvisionsSystem } from './ProvisionsSystem';

export {
  createProvisionsSystem,
  calculateTravelConsumption,
  hasEnoughProvisions,
  getProvisionStatus,
} from './utils';
