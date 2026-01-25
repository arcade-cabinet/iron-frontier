/**
 * Game Services - Re-exports from packages/shared
 *
 * Platform-specific services can be added here. Common services are
 * imported from the shared package.
 */

// Re-export shared services
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
} from '@iron-frontier/shared/services';
