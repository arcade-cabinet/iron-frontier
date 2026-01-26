/**
 * AI Module - YukaJS-based Game AI
 *
 * Provides intelligent NPC behavior using the Yuka library:
 * - Steering behaviors (wander, seek, flee, patrol)
 * - State machines for behavior management
 * - Perception (vision, awareness)
 * - Path following
 *
 * Usage:
 * ```tsx
 * import { useAI } from '@iron-frontier/shared/ai';
 *
 * function NPCManager() {
 *   const ai = useAI();
 *
 *   useEffect(() => {
 *     ai.addNPC('sheriff', { x: 5, y: 0, z: 3 }, {
 *       defaultState: 'patrol',
 *       patrol: {
 *         waypoints: [
 *           { x: 5, y: 0, z: 3 },
 *           { x: 10, y: 0, z: 3 },
 *           { x: 10, y: 0, z: 8 },
 *           { x: 5, y: 0, z: 8 },
 *         ],
 *         loop: true,
 *         waitTime: 2,
 *       },
 *     });
 *   }, []);
 *
 *   useFrame((_, delta) => {
 *     ai.update(delta, playerPosition);
 *   });
 *
 *   return ai.results.map(npc => (
 *     <NPCMesh key={npc.id} position={npc.position} direction={npc.direction} />
 *   ));
 * }
 * ```
 */

// Core AI Manager
export { AIManager, default } from './AIManager';

// React Hooks
export { useAI, useAIEntity } from './useAI';

// Types
export type {
  AIState,
  AIEntityData,
  AIUpdateResult,
  AISystemConfig,
  NPCBehaviorConfig,
} from './types';

export { DEFAULT_NPC_BEHAVIOR, DEFAULT_AI_CONFIG } from './types';
