/**
 * Combat store barrel export.
 *
 * @module combat/store
 */

export type {
  CombatStoreState,
  CombatStoreActions,
  CombatStore,
  CombatDataAccess,
} from './types';

export { createCombatSlice } from './actions';

export {
  selectCombatPhase,
  selectIsCombatActive,
  selectCurrentRound,
  selectSelectedAction,
  selectSelectedTarget,
  selectAllCombatants,
  selectTurnOrder,
  selectCanFlee,
  selectIsBossFight,
  selectLatestLogEntry,
  selectPlayerHPPercentage,
  selectEnemyHPPercentages,
} from './selectors';
