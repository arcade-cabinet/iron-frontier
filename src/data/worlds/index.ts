/**
 * World Library - All world definitions and loading utilities
 */

// World definitions
export { FrontierTerritory } from './frontier_territory';

// World loader utilities
export {
  getLocationData,
  getTravelInfo,
  type LoadedWorld,
  loadWorld,
  type ResolvedLocation,
  validateWorldReferences,
} from './WorldLoader';

// ============================================================================
// WORLD REGISTRY
// ============================================================================

import type { World } from '../schemas/world';
import { FrontierTerritory } from './frontier_territory';

/** All worlds indexed by ID */
export const WORLDS_BY_ID = new Map<string, World>([['frontier_territory', FrontierTerritory]]);

/** Get a world by ID */
export function getWorldById(id: string): World | undefined {
  return WORLDS_BY_ID.get(id);
}

/** Get all world IDs */
export function getAllWorldIds(): string[] {
  return Array.from(WORLDS_BY_ID.keys());
}
