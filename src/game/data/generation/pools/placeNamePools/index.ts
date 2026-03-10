/**
 * Place Name Pools - Procedural place name generation
 */

export { TOWN_NAME_POOL, RANCH_NAME_POOL, OUTPOST_NAME_POOL } from './settlements.ts';
export { MINE_NAME_POOL, LANDMARK_NAME_POOL, STATION_NAME_POOL } from './features.ts';

export {
  generateConstrainedPlaceName,
  generatePlaceName,
  generatePlaceNames,
  getAvailablePoolTypes,
  getPlaceNamePool,
  PLACE_NAME_POOLS,
} from './helpers.ts';
