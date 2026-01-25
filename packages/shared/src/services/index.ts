/**
 * Game Services - Platform-agnostic business logic for game systems
 */

export {
  // Travel functions
  canTravel,
  executeTravel,
  formatTravelTime,
  // Display helpers
  getDangerDescription,
  getMethodDescription,
  getReachableLocations,
  getTravelCost,
  // Types
  type TravelCost,
  type TravelGameState,
  type TravelResult,
} from './TravelService';
