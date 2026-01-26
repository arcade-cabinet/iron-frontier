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
} from '@iron-frontier/shared/services';
