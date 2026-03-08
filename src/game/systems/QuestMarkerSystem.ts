/**
 * QuestMarkerSystem.ts - 3D spatial quest marker resolution
 *
 * Resolves active quest objectives to 3D world positions at runtime.
 * Positions are derived from the entity/building/zone systems rather than
 * hardcoded coordinates, so markers track moving NPCs and dynamic entities.
 *
 * The compass HUD component consumes the output of getActiveQuestMarkers()
 * to render directional indicators in first-person view.
 *
 * @module systems/QuestMarkerSystem
 */

import type { Objective, Quest } from '../data/schemas/quest';
import type { GameState, NPC, Structure, WorldPosition } from '../store/types';
import { TOWN_POSITIONS } from './ZoneSystem';

// ============================================================================
// TYPES
// ============================================================================

/**
 * A resolved quest marker with a 3D world position.
 * Consumed by the compass HUD and minimap systems.
 */
export interface QuestMarker {
  /** Quest this marker belongs to */
  questId: string;
  /** Objective this marker represents */
  objectiveId: string;
  /** The type of target entity */
  targetType: 'npc' | 'building' | 'location' | 'marker' | 'unknown';
  /** The ID of the target entity (NPC ID, building ID, location ID, etc.) */
  targetId: string;
  /** Human-readable label for the marker */
  label: string;
  /** Resolved 3D world position, or null if the target cannot be found */
  worldPosition: WorldPosition | null;
  /** Distance from player to marker in world units, or null if unresolvable */
  distance: number | null;
  /** Completion radius for proximity objectives */
  completionRadius: number;
  /** Whether this objective is already complete */
  isComplete: boolean;
}

// ============================================================================
// POSITION RESOLVERS
// ============================================================================

/**
 * Resolve an NPC's current 3D position from the game state.
 */
function resolveNPCPosition(npcId: string, state: GameState): WorldPosition | null {
  const npc: NPC | undefined = state.npcs[npcId];
  if (npc) return npc.position;
  return null;
}

/**
 * Resolve a building/structure's position from the game state.
 */
function resolveBuildingPosition(buildingId: string, state: GameState): WorldPosition | null {
  const structure: Structure | undefined = state.structures[buildingId];
  if (structure) return structure.position;
  return null;
}

/**
 * Resolve a location's center position from TOWN_POSITIONS.
 */
function resolveLocationPosition(locationId: string): WorldPosition | null {
  const town = TOWN_POSITIONS[locationId];
  if (town) {
    return { x: town.x, y: 0, z: town.z };
  }
  return null;
}

/**
 * Resolve a marker target to a 3D world position.
 */
function resolveMarkerTarget(
  objective: Objective,
  state: GameState,
): { position: WorldPosition | null; targetType: QuestMarker['targetType']; targetId: string } {
  const marker = objective.markerTarget;

  if (!marker) {
    // Fall back to objective target for legacy objectives without markerTarget
    return inferMarkerFromObjective(objective, state);
  }

  switch (marker.type) {
    case 'npc':
      return {
        position: resolveNPCPosition(marker.npcId, state),
        targetType: 'npc',
        targetId: marker.npcId,
      };

    case 'building':
      return {
        position: resolveBuildingPosition(marker.buildingId, state),
        targetType: 'building',
        targetId: marker.buildingId,
      };

    case 'location':
      return {
        position: resolveLocationPosition(marker.locationId),
        targetType: 'location',
        targetId: marker.locationId,
      };

    case 'marker':
      // Try building first, then location
      return {
        position:
          resolveBuildingPosition(marker.markerId, state) ??
          resolveLocationPosition(marker.locationId ?? marker.markerId),
        targetType: 'marker',
        targetId: marker.markerId,
      };

    default:
      return { position: null, targetType: 'unknown', targetId: objective.target };
  }
}

/**
 * Infer marker position from objective type and target when no explicit
 * markerTarget is set. This handles legacy quest data.
 */
function inferMarkerFromObjective(
  objective: Objective,
  state: GameState,
): { position: WorldPosition | null; targetType: QuestMarker['targetType']; targetId: string } {
  switch (objective.type) {
    case 'talk':
    case 'deliver':
      // Target is an NPC ID
      return {
        position: resolveNPCPosition(objective.target, state),
        targetType: 'npc',
        targetId: objective.target,
      };

    case 'visit':
      // Target could be a location, building, or marker
      return {
        position:
          resolveBuildingPosition(objective.target, state) ??
          resolveLocationPosition(objective.target),
        targetType: 'location',
        targetId: objective.target,
      };

    case 'interact':
      // Target is an interactable object - try building lookup
      return {
        position: resolveBuildingPosition(objective.target, state),
        targetType: 'building',
        targetId: objective.target,
      };

    case 'kill':
    case 'collect':
    default:
      // Kill/collect objectives don't have fixed positions
      return { position: null, targetType: 'unknown', targetId: objective.target };
  }
}

// ============================================================================
// DISTANCE CALCULATION
// ============================================================================

/**
 * Calculate XZ distance between player and a world position.
 */
function distanceXZ(a: WorldPosition, b: WorldPosition): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get all active quest markers resolved to 3D world positions.
 *
 * Iterates over all active quests, finds the current stage's incomplete
 * objectives, and resolves their markerTarget (or inferred target) to
 * a 3D position in the game world.
 *
 * @param state - The current game state
 * @returns Array of QuestMarker objects, sorted by distance (nearest first)
 */
export function getActiveQuestMarkers(state: GameState): QuestMarker[] {
  const markers: QuestMarker[] = [];
  const playerPos = state.playerPosition;

  for (const aq of state.activeQuests) {
    const questDef: Quest | undefined = state.getQuestDefinition(aq.questId);
    if (!questDef) continue;

    const stage = questDef.stages[aq.currentStageIndex];
    if (!stage) continue;

    for (const obj of stage.objectives) {
      // Skip hidden objectives that haven't been revealed
      if (obj.hidden) {
        const progress = aq.objectiveProgress[obj.id] ?? 0;
        if (progress < obj.count) continue;
      }

      const progress = aq.objectiveProgress[obj.id] ?? 0;
      const isComplete = progress >= obj.count;

      const { position, targetType, targetId } = resolveMarkerTarget(obj, state);
      const distance = position ? distanceXZ(playerPos, position) : null;

      // Build label from objective description or markerTarget
      const label =
        obj.mapMarker?.markerLabel ??
        obj.hint ??
        obj.description;

      markers.push({
        questId: aq.questId,
        objectiveId: obj.id,
        targetType,
        targetId,
        label,
        worldPosition: position,
        distance,
        completionRadius: obj.completionRadius ?? 10,
        isComplete,
      });
    }
  }

  // Sort by distance, with unresolvable markers at the end
  markers.sort((a, b) => {
    if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1;
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  return markers;
}

/**
 * Check if the player is within completion radius of any visit-type
 * objectives and return the ones that should be auto-completed.
 *
 * @param state - The current game state
 * @returns Array of { questId, objectiveId } pairs to complete
 */
export function checkProximityObjectives(
  state: GameState,
): { questId: string; objectiveId: string }[] {
  const results: { questId: string; objectiveId: string }[] = [];
  const playerPos = state.playerPosition;

  for (const aq of state.activeQuests) {
    const questDef: Quest | undefined = state.getQuestDefinition(aq.questId);
    if (!questDef) continue;

    const stage = questDef.stages[aq.currentStageIndex];
    if (!stage) continue;

    for (const obj of stage.objectives) {
      // Only visit-type objectives auto-complete on proximity
      if (obj.type !== 'visit') continue;

      const progress = aq.objectiveProgress[obj.id] ?? 0;
      if (progress >= obj.count) continue; // Already complete

      const { position } = resolveMarkerTarget(obj, state);
      if (!position) continue;

      const distance = distanceXZ(playerPos, position);
      const radius = obj.completionRadius ?? 10;

      if (distance <= radius) {
        results.push({ questId: aq.questId, objectiveId: obj.id });
      }
    }
  }

  return results;
}
