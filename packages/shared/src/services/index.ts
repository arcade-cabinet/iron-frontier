/**
 * Game Services - Platform-agnostic business logic for game systems
 */

export {
  // Travel functions
  canTravel,
  getTravelCost,
  getReachableLocations,
  executeTravel,

  // Display helpers
  getDangerDescription,
  getMethodDescription,
  formatTravelTime,

  // Types
  type TravelCost,
  type TravelResult,
  type TravelGameState,
} from './TravelService';
