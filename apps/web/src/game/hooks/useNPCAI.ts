/**
 * useNPCAI - React hook for integrating YukaJS AI with R3F scenes
 *
 * Manages AI entities for NPCs, updating their positions and states
 * each frame using the AIManager from @iron-frontier/shared.
 *
 * Usage:
 * ```tsx
 * function OverworldScene() {
 *   const { npcStates, isInitialized } = useNPCAI({
 *     locationId: 'frontier_edge',
 *     playerPosition: { x: 0, y: 0, z: 0 },
 *   });
 *
 *   return (
 *     <>
 *       {npcStates.map(npc => (
 *         <AINPCMarker key={npc.id} {...npc} />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { AIManager, type AIUpdateResult, type NPCBehaviorConfig } from '@iron-frontier/shared/ai';
import { getNPCsByLocation } from '@iron-frontier/shared/data/npcs';

// ============================================================================
// TYPES
// ============================================================================

export interface NPCAIState extends AIUpdateResult {
  name: string;
  isQuestGiver: boolean;
}

export interface UseNPCAIOptions {
  /** Current location ID to load NPCs from */
  locationId: string | null;
  /** Player position for AI perception */
  playerPosition: { x: number; y: number; z: number };
  /** Whether AI should be active */
  enabled?: boolean;
  /** Custom behavior configs per NPC ID */
  behaviorOverrides?: Record<string, Partial<NPCBehaviorConfig>>;
}

export interface UseNPCAIResult {
  /** Current AI states for all NPCs */
  npcStates: NPCAIState[];
  /** Whether the AI system is initialized */
  isInitialized: boolean;
  /** Set a specific NPC's target position */
  setNPCTarget: (npcId: string, position: { x: number; y: number; z: number }) => void;
  /** Change an NPC's AI state */
  setNPCState: (npcId: string, state: string) => void;
  /** Get the AIManager instance for advanced use */
  getManager: () => AIManager | null;
}

// ============================================================================
// HEX UTILITIES (for converting NPC spawn coords)
// ============================================================================

const HEX_SIZE = 1;

function hexToWorld(q: number, r: number): { x: number; y: number; z: number } {
  const x = HEX_SIZE * (3 / 2) * q;
  const z = HEX_SIZE * Math.sqrt(3) * (r + q / 2);
  return { x, y: 0, z };
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing AI-driven NPCs in R3F scenes
 */
export function useNPCAI({
  locationId,
  playerPosition,
  enabled = true,
  behaviorOverrides = {},
}: UseNPCAIOptions): UseNPCAIResult {
  const managerRef = useRef<AIManager | null>(null);
  const npcStatesRef = useRef<NPCAIState[]>([]);
  const initializedRef = useRef(false);

  // Load NPCs for location
  const locationNPCs = useMemo(() => {
    if (!locationId) return [];
    return getNPCsByLocation(locationId);
  }, [locationId]);

  // Initialize or reinitialize AIManager when location changes
  useEffect(() => {
    if (!enabled || !locationId) {
      if (managerRef.current) {
        managerRef.current.clear();
      }
      initializedRef.current = false;
      npcStatesRef.current = [];
      return;
    }

    // Create new manager
    const manager = new AIManager({
      debug: false,
      maxUpdatesPerFrame: 50,
      fixedTimestep: 1 / 30,
    });

    // Register NPCs
    for (const npc of locationNPCs) {
      if (!npc.spawnCoord) continue;

      const worldPos = hexToWorld(npc.spawnCoord.q, npc.spawnCoord.r);

      // Determine behavior based on NPC role
      const defaultBehavior = getNPCDefaultBehavior(npc.role);
      const overrides = behaviorOverrides[npc.id] || {};

      manager.addEntity(npc.id, worldPos, {
        ...defaultBehavior,
        ...overrides,
      });
    }

    managerRef.current = manager;
    initializedRef.current = true;

    console.log(`[useNPCAI] Initialized ${locationNPCs.length} NPCs for ${locationId}`);

    return () => {
      manager.clear();
    };
  }, [locationId, enabled, locationNPCs, behaviorOverrides]);

  // Update player position
  useEffect(() => {
    if (managerRef.current && enabled) {
      managerRef.current.setPlayerPosition(playerPosition);
    }
  }, [playerPosition, enabled]);

  // Update AI each frame
  useFrame((_, delta) => {
    if (!managerRef.current || !enabled || !initializedRef.current) return;

    // Update AI system
    const results = managerRef.current.update(delta);

    // Map results to include NPC metadata
    npcStatesRef.current = results.map((result) => {
      const npc = locationNPCs.find((n) => n.id === result.id);
      return {
        ...result,
        name: npc?.name || 'Unknown',
        isQuestGiver: npc?.questGiver || false,
      };
    });
  });

  // Callbacks
  const setNPCTarget = useCallback(
    (npcId: string, position: { x: number; y: number; z: number }) => {
      managerRef.current?.setEntityTarget(npcId, position);
    },
    []
  );

  const setNPCState = useCallback((npcId: string, state: string) => {
    managerRef.current?.setEntityState(npcId, state as any);
  }, []);

  const getManager = useCallback(() => managerRef.current, []);

  return {
    npcStates: npcStatesRef.current,
    isInitialized: initializedRef.current,
    setNPCTarget,
    setNPCState,
    getManager,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get default AI behavior based on NPC role
 */
function getNPCDefaultBehavior(role: string): Partial<NPCBehaviorConfig> {
  switch (role) {
    case 'sheriff':
    case 'deputy':
      return {
        defaultState: 'patrol',
        maxSpeed: 2.5,
        detectionRange: 15,
        patrol: {
          waypoints: generatePatrolWaypoints(5, 3),
          loop: true,
          waitTime: 2,
        },
      };

    case 'merchant':
    case 'bartender':
    case 'banker':
      return {
        defaultState: 'idle',
        maxSpeed: 1.5,
        detectionRange: 8,
      };

    case 'rancher':
    case 'miner':
    case 'prospector':
      return {
        defaultState: 'wander',
        maxSpeed: 2,
        detectionRange: 10,
        wander: {
          radius: 2,
          distance: 5,
          jitter: 0.1,
        },
      };

    case 'outlaw':
    case 'drifter':
      return {
        defaultState: 'wander',
        maxSpeed: 2.5,
        detectionRange: 12,
        wander: {
          radius: 3,
          distance: 8,
          jitter: 0.15,
        },
      };

    case 'gambler':
      return {
        defaultState: 'idle',
        maxSpeed: 1.5,
        detectionRange: 6,
      };

    default:
      return {
        defaultState: 'wander',
        maxSpeed: 2,
        detectionRange: 8,
        wander: {
          radius: 1.5,
          distance: 4,
          jitter: 0.08,
        },
      };
  }
}

/**
 * Generate simple patrol waypoints around origin
 */
function generatePatrolWaypoints(
  count: number,
  radius: number
): Array<{ x: number; y: number; z: number }> {
  const waypoints: Array<{ x: number; y: number; z: number }> = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    waypoints.push({
      x: Math.cos(angle) * radius,
      y: 0,
      z: Math.sin(angle) * radius,
    });
  }

  return waypoints;
}

export default useNPCAI;
