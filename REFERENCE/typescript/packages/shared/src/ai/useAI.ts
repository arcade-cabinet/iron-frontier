/**
 * useAI - React hooks for AI integration
 *
 * Provides hooks for integrating the YukaJS AI system with React/R3F components.
 *
 * Usage:
 * ```tsx
 * function NPCManager() {
 *   const { addNPC, update, results } = useAI();
 *   const playerPos = usePlayerPosition();
 *
 *   // Add NPCs on mount
 *   useEffect(() => {
 *     addNPC('sheriff', { x: 5, y: 0, z: 3 }, { defaultState: 'patrol' });
 *     addNPC('townsfolk', { x: -3, y: 0, z: 8 }, { defaultState: 'wander' });
 *   }, []);
 *
 *   // Update AI each frame
 *   useFrame((_, delta) => {
 *     update(delta, playerPos);
 *   });
 *
 *   return results.map(r => <NPCMesh key={r.id} {...r} />);
 * }
 * ```
 */

import { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import { AIManager } from './AIManager';
import type { AIEntityData, AIState, AISystemConfig, AIUpdateResult, NPCBehaviorConfig } from './types';

/**
 * Hook for managing AI entities
 */
export function useAI(config?: Partial<AISystemConfig>) {
  const managerRef = useRef<AIManager | null>(null);
  const [results, setResults] = useState<AIUpdateResult[]>([]);

  // Create manager lazily
  if (!managerRef.current) {
    managerRef.current = new AIManager(config);
  }

  const manager = managerRef.current;

  /**
   * Add an NPC entity
   */
  const addNPC = useCallback(
    (
      id: string,
      position: { x: number; y: number; z: number },
      behavior?: Partial<NPCBehaviorConfig>
    ) => {
      manager.addEntity(id, position, behavior);
    },
    [manager]
  );

  /**
   * Remove an NPC entity
   */
  const removeNPC = useCallback(
    (id: string) => {
      manager.removeEntity(id);
    },
    [manager]
  );

  /**
   * Get entity data by ID
   */
  const getNPC = useCallback(
    (id: string): AIEntityData | undefined => {
      return manager.getEntity(id);
    },
    [manager]
  );

  /**
   * Set an NPC's target position
   */
  const setTarget = useCallback(
    (id: string, position: { x: number; y: number; z: number }) => {
      manager.setEntityTarget(id, position);
    },
    [manager]
  );

  /**
   * Change an NPC's behavior state
   */
  const setState = useCallback(
    (id: string, state: AIState) => {
      manager.setEntityState(id, state);
    },
    [manager]
  );

  /**
   * Update all NPCs - call this in useFrame
   */
  const update = useCallback(
    (deltaTime: number, playerPosition?: { x: number; y: number; z: number }) => {
      if (playerPosition) {
        manager.setPlayerPosition(playerPosition);
      }
      const newResults = manager.update(deltaTime);
      setResults(newResults);
      return newResults;
    },
    [manager]
  );

  /**
   * Clear all NPCs
   */
  const clear = useCallback(() => {
    manager.clear();
    setResults([]);
  }, [manager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      manager.clear();
    };
  }, [manager]);

  return {
    // State
    results,
    entityCount: manager.entityCount,

    // Actions
    addNPC,
    removeNPC,
    getNPC,
    setTarget,
    setState,
    update,
    clear,
  };
}

/**
 * Hook for a single AI entity
 */
export function useAIEntity(
  manager: ReturnType<typeof useAI>,
  id: string,
  initialPosition: { x: number; y: number; z: number },
  behavior?: Partial<NPCBehaviorConfig>
) {
  const initialized = useRef(false);

  // Add entity on mount
  useEffect(() => {
    if (!initialized.current) {
      manager.addNPC(id, initialPosition, behavior);
      initialized.current = true;
    }

    return () => {
      manager.removeNPC(id);
      initialized.current = false;
    };
  }, [id, initialPosition, behavior, manager]);

  // Get this entity's result from the list
  const result = useMemo(() => {
    return manager.results.find((r) => r.id === id);
  }, [manager.results, id]);

  return {
    position: result?.position ?? initialPosition,
    direction: result?.direction ?? { x: 0, z: 1 },
    state: result?.state ?? 'idle',
    wantsToInteract: result?.wantsToInteract ?? false,

    setTarget: (pos: { x: number; y: number; z: number }) => manager.setTarget(id, pos),
    setState: (state: AIState) => manager.setState(id, state),
  };
}

export default useAI;
