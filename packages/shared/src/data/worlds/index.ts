/**
 * World Library - All world definitions and loading utilities
 */

// World definitions
export { FrontierTerritory } from './frontier_territory';

// World loader utilities
export {
  loadWorld,
  getLocationData,
  validateWorldReferences,
  getTravelInfo,
  type LoadedWorld,
  type ResolvedLocation,
} from './WorldLoader';

// ============================================================================
// WORLD REGISTRY
// ============================================================================

import { FrontierTerritory } from './frontier_territory';
import type { World } from '../schemas/world';

/** All worlds indexed by ID */
export const WORLDS_BY_ID = new Map<string, World>([
  ['frontier_territory', FrontierTerritory],
]);

/** Get a world by ID */
export function getWorldById(id: string): World | undefined {
  return WORLDS_BY_ID.get(id);
}

/** Get all world IDs */
export function getAllWorldIds(): string[] {
  return Array.from(WORLDS_BY_ID.keys());
}
