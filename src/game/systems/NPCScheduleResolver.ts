/**
 * NPCScheduleResolver - Maps NPC schedule location names to 3D world positions
 *
 * Takes an NPC's schedule config (from scheduleTemplates.ts) and the current
 * game time, then resolves the location marker string to a concrete 3D world
 * position using the town's npcMarkers and road data.
 *
 * Schedule location markers use {{building_type}} syntax:
 *   - {{saloon}} resolves to the npcMarker position assigned to a saloon building
 *   - {{home}} resolves to the NPC's assigned home position
 *   - {{workplace}} resolves to the NPC's work location
 *
 * @module systems/NPCScheduleResolver
 */

import type { TimePhase } from './time';
import type { Location, NpcMarker, Vec3 } from '../data/schemas/spatial';
import type { ScheduleTemplate } from '../data/schemas/generation';
import { getNPCActivityAt } from '../data/generation/templates/scheduleTemplates';

// ============================================================================
// TYPES
// ============================================================================

/** Result of resolving a schedule for a specific time */
export interface ResolvedScheduleTarget {
  /** World-space position the NPC should move to */
  position: Vec3;
  /** Whether the NPC is indoors at this position */
  isIndoors: boolean;
  /** Whether the NPC can be interacted with */
  isAvailable: boolean;
  /** The current activity from the schedule */
  activity: string;
  /** Optional dialogue override for this time period */
  dialogueOverride?: string;
  /** For patrol activities: the full set of waypoints to cycle through */
  patrolWaypoints?: Vec3[];
}

/** NPC instance data needed for schedule resolution */
export interface NPCInstanceData {
  /** Unique NPC identifier */
  npcId: string;
  /** The NPC's role (e.g., 'sheriff', 'bartender') */
  role: string;
  /** The NPC's assigned home position */
  homePosition: Vec3;
  /** The building/area this NPC is assigned to (from npcMarker.assignedTo) */
  assignedTo?: string;
  /** The NPC's schedule template */
  schedule: ScheduleTemplate;
  /** Override position mappings: location marker key -> Vec3 */
  positionOverrides?: Record<string, Vec3>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Activities that place NPCs indoors */
const INDOOR_ACTIVITIES = new Set(['sleep', 'work', 'eat', 'pray']);

/** Activities where NPCs are not available for interaction */
const UNAVAILABLE_ACTIVITIES = new Set(['sleep']);

/** Unresolved position — returned when no positions can be averaged */
const UNRESOLVED_POSITION: Vec3 = { x: 0, y: 0, z: 0 };

// ============================================================================
// LOCATION MARKER INDEX
// ============================================================================

/**
 * Pre-built index mapping location marker keys to positions within a location.
 * Built once when entering a location and reused for all NPC resolutions.
 */
export interface LocationMarkerIndex {
  /** Map of assignedTo building ID -> NpcMarker data */
  byAssignment: Map<string, NpcMarker[]>;
  /** Map of role -> NpcMarker data */
  byRole: Map<string, NpcMarker[]>;
  /** Map of tag -> NpcMarker data */
  byTag: Map<string, NpcMarker[]>;
  /** Road centerline positions by road type for patrol fallback */
  roadPositions: Map<string, Vec3[]>;
  /** Town center position (average of all markers, or explicit town_center marker) */
  townCenter: Vec3;
  /** All outskirts positions (markers with 'outskirts' tag or at map edges) */
  outskirts: Vec3[];
}

/**
 * Builds a LocationMarkerIndex from a Location definition.
 * Call this once when the player enters a location.
 */
export function buildLocationMarkerIndex(location: Location): LocationMarkerIndex {
  const byAssignment = new Map<string, NpcMarker[]>();
  const byRole = new Map<string, NpcMarker[]>();
  const byTag = new Map<string, NpcMarker[]>();
  const roadPositions = new Map<string, Vec3[]>();

  // Index npcMarkers
  for (const marker of location.npcMarkers) {
    // By assignment
    if (marker.assignedTo) {
      const existing = byAssignment.get(marker.assignedTo) ?? [];
      existing.push(marker);
      byAssignment.set(marker.assignedTo, existing);
    }

    // By role
    const roleMarkers = byRole.get(marker.role) ?? [];
    roleMarkers.push(marker);
    byRole.set(marker.role, roleMarkers);

    // By tag
    for (const tag of marker.tags) {
      const tagMarkers = byTag.get(tag) ?? [];
      tagMarkers.push(marker);
      byTag.set(tag, tagMarkers);
    }
  }

  // Index road centerlines
  for (const road of location.roads) {
    roadPositions.set(road.id, road.points);
    // Also index by type
    const typeKey = `road_type:${road.type}`;
    const existing = roadPositions.get(typeKey) ?? [];
    existing.push(...road.points);
    roadPositions.set(typeKey, existing);
  }

  // Calculate town center
  let townCenter: Vec3;
  const townCenterMarkers = byTag.get('town_center') ?? byTag.get('civic');
  if (townCenterMarkers && townCenterMarkers.length > 0) {
    townCenter = averagePosition(townCenterMarkers.map((m) => m.position));
  } else if (location.npcMarkers.length > 0) {
    townCenter = averagePosition(location.npcMarkers.map((m) => m.position));
  } else {
    // Fallback: center of map
    townCenter = {
      x: (location.width * 4) / 2,
      y: 0,
      z: (location.height * 4) / 2,
    };
  }

  // Outskirts: markers near map edges or tagged as outskirts
  const outskirts: Vec3[] = [];
  const outskirtsMarkers = byTag.get('outskirts') ?? [];
  for (const m of outskirtsMarkers) {
    outskirts.push(m.position);
  }
  if (outskirts.length === 0) {
    // Generate perimeter positions
    const hw = location.width * 2;
    const hh = location.height * 2;
    outskirts.push(
      { x: hw, y: 0, z: 4 },
      { x: hw, y: 0, z: hh * 2 - 4 },
      { x: 4, y: 0, z: hh },
      { x: hw * 2 - 4, y: 0, z: hh },
    );
  }

  return {
    byAssignment,
    byRole,
    byTag,
    roadPositions,
    townCenter,
    outskirts,
  };
}

// ============================================================================
// SCHEDULE RESOLUTION
// ============================================================================

/**
 * Resolves the current schedule target for an NPC at a given game hour.
 *
 * @param npc - NPC instance data
 * @param gameHour - Current game hour (0-23.999)
 * @param index - Pre-built location marker index
 * @returns Resolved target with position, availability, and patrol data
 */
export function resolveScheduleTarget(
  npc: NPCInstanceData,
  gameHour: number,
  index: LocationMarkerIndex,
): ResolvedScheduleTarget {
  // Get the current schedule entry for this hour
  const entry = getNPCActivityAt(npc.schedule, gameHour);

  if (!entry) {
    // No schedule entry found; NPC idles at home
    return {
      position: npc.homePosition,
      isIndoors: true,
      isAvailable: true,
      activity: 'idle',
    };
  }

  const { activity, locationMarker, dialogueOverride } = entry;

  // Resolve the location marker to a world position
  const position = resolveLocationMarker(locationMarker, npc, index);
  const isIndoors = INDOOR_ACTIVITIES.has(activity);
  const isAvailable = !UNAVAILABLE_ACTIVITIES.has(activity);

  // Handle patrol: collect waypoints
  let patrolWaypoints: Vec3[] | undefined;
  if (activity === 'patrol') {
    patrolWaypoints = resolvePatrolWaypoints(locationMarker, npc, index);
  }

  return {
    position,
    isIndoors,
    isAvailable,
    activity,
    dialogueOverride,
    patrolWaypoints,
  };
}

/**
 * Resolves all schedule transitions for an NPC over a full 24-hour cycle.
 * Useful for pre-computing schedule waypoints for path planning.
 */
export function resolveFullDaySchedule(
  npc: NPCInstanceData,
  index: LocationMarkerIndex,
): Array<{ startHour: number; endHour: number; target: ResolvedScheduleTarget }> {
  const results: Array<{
    startHour: number;
    endHour: number;
    target: ResolvedScheduleTarget;
  }> = [];

  for (const entry of npc.schedule.entries) {
    const target = resolveScheduleTarget(npc, entry.startHour, index);
    results.push({
      startHour: entry.startHour,
      endHour: entry.endHour,
      target,
    });
  }

  return results;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Resolves a {{location_marker}} string to a world-space Vec3.
 */
function resolveLocationMarker(
  marker: string,
  npc: NPCInstanceData,
  index: LocationMarkerIndex,
): Vec3 {
  // Strip {{ }} wrapper
  const key = marker.replace(/^\{\{|\}\}$/g, '').toLowerCase();

  // 1. Check NPC-specific overrides
  if (npc.positionOverrides?.[key]) {
    return npc.positionOverrides[key];
  }

  // 2. Special built-in markers
  switch (key) {
    case 'home':
    case 'bunkhouse':
    case 'homestead':
      return npc.homePosition;

    case 'town_center':
      return index.townCenter;

    case 'outskirts':
      // Pick the outskirts position closest to the NPC's home
      return closestPosition(npc.homePosition, index.outskirts) ?? index.townCenter;
  }

  // 3. Look up by NPC's assignedTo building
  //    If the marker matches the NPC's assigned building type, use that marker
  if (npc.assignedTo) {
    const assignmentMarkers = index.byAssignment.get(npc.assignedTo);
    if (assignmentMarkers && assignmentMarkers.length > 0) {
      // Check if the marker key matches the assignment or is a generic work marker
      const matchesWork = ['workplace', 'work', npc.assignedTo.toLowerCase()].includes(key);
      if (matchesWork || isMarkerKeyMatch(key, npc.assignedTo)) {
        return assignmentMarkers[0].position;
      }
    }
  }

  // 4. Look up by building type name across all markers
  //    Match marker key against building assignment names
  for (const [assignmentId, markers] of index.byAssignment) {
    if (isMarkerKeyMatch(key, assignmentId)) {
      return markers[0].position;
    }
  }

  // 5. Look up by role
  const roleMarkers = index.byRole.get(key);
  if (roleMarkers && roleMarkers.length > 0) {
    return roleMarkers[0].position;
  }

  // 6. Look up by tag
  const tagMarkers = index.byTag.get(key);
  if (tagMarkers && tagMarkers.length > 0) {
    return tagMarkers[0].position;
  }

  // 7. Try partial matching on assignment IDs
  for (const [assignmentId, markers] of index.byAssignment) {
    if (assignmentId.includes(key) || key.includes(assignmentId)) {
      return markers[0].position;
    }
  }

  // 8. Fallback: NPC's home position
  return npc.homePosition;
}

/**
 * Resolves patrol waypoints for a patrol activity.
 */
function resolvePatrolWaypoints(
  marker: string,
  npc: NPCInstanceData,
  index: LocationMarkerIndex,
): Vec3[] {
  const key = marker.replace(/^\{\{|\}\}$/g, '').toLowerCase();

  // 1. Check if any npcMarker for this NPC's assignment has waypoints
  if (npc.assignedTo) {
    const assignmentMarkers = index.byAssignment.get(npc.assignedTo);
    if (assignmentMarkers) {
      for (const m of assignmentMarkers) {
        if (m.waypoints && m.waypoints.length > 0) {
          return m.waypoints;
        }
      }
    }
  }

  // 2. Check markers matching the role for waypoints
  const roleMarkers = index.byRole.get(npc.role);
  if (roleMarkers) {
    for (const m of roleMarkers) {
      if (m.waypoints && m.waypoints.length > 0) {
        return m.waypoints;
      }
    }
  }

  // 3. Use road centerline as patrol route
  if (key === 'town_center' || key === 'main_street') {
    const mainRoad = index.roadPositions.get('main_street')
      ?? index.roadPositions.get('road_type:main_street');
    if (mainRoad && mainRoad.length >= 2) {
      return mainRoad;
    }
  }

  // 4. Generate a simple patrol box around the resolved position
  const center = resolveLocationMarker(marker, npc, index);
  const r = 6; // 6-meter patrol radius
  return [
    { x: center.x + r, y: center.y, z: center.z },
    { x: center.x, y: center.y, z: center.z + r },
    { x: center.x - r, y: center.y, z: center.z },
    { x: center.x, y: center.y, z: center.z - r },
  ];
}

/**
 * Checks if a location marker key matches a building assignment ID.
 * Handles common naming variations.
 */
function isMarkerKeyMatch(key: string, assignmentId: string): boolean {
  const normalized = assignmentId.toLowerCase().replace(/[_\- ]/g, '');
  const normalizedKey = key.replace(/[_\- ]/g, '');

  // Direct match
  if (normalized === normalizedKey) return true;

  // Key is a substring of assignment (e.g., "saloon" matches "rusty_spur_saloon")
  if (normalized.includes(normalizedKey)) return true;

  // Common aliases
  const aliases: Record<string, string[]> = {
    saloon: ['bar', 'tavern', 'pub'],
    general_store: ['store', 'shop', 'generalstore', 'mercantile'],
    sheriff_office: ['sheriffoffice', 'jail', 'lawoffice', 'sheriffs'],
    church: ['chapel', 'temple'],
    doctor: ['clinic', 'infirmary', 'hospital', 'apothecary'],
    blacksmith: ['forge', 'smithy'],
    stable: ['livery', 'barn', 'corral'],
    hotel: ['inn', 'boardinghouse', 'lodging'],
    bank: ['vault', 'treasury'],
    mine: ['mineentrance', 'shaft', 'pit', 'claim'],
    telegraph: ['telegraphoffice', 'wire'],
    workshop: ['toolshed', 'workbench'],
    camp: ['campsite', 'campfire'],
  };

  for (const [canonical, aliasList] of Object.entries(aliases)) {
    const canonNorm = canonical.replace(/[_\- ]/g, '');
    if (
      (normalizedKey === canonNorm || aliasList.includes(normalizedKey)) &&
      (normalized.includes(canonNorm) || aliasList.some((a) => normalized.includes(a)))
    ) {
      return true;
    }
    if (
      (normalized === canonNorm || aliasList.some((a) => normalized.includes(a))) &&
      (normalizedKey === canonNorm || aliasList.includes(normalizedKey))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Calculates the average position of a list of Vec3 points.
 */
function averagePosition(positions: Vec3[]): Vec3 {
  if (positions.length === 0) {
    console.error(`[NPCScheduleResolver] Could not resolve any position — returning origin`);
    return { ...UNRESOLVED_POSITION };
  }

  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  for (const p of positions) {
    sumX += p.x;
    sumY += p.y;
    sumZ += p.z;
  }
  return {
    x: sumX / positions.length,
    y: sumY / positions.length,
    z: sumZ / positions.length,
  };
}

/**
 * Returns the position closest to a reference point from a list.
 */
function closestPosition(ref: Vec3, candidates: Vec3[]): Vec3 | undefined {
  if (candidates.length === 0) return undefined;

  let best = candidates[0];
  let bestDist = distanceSq(ref, best);

  for (let i = 1; i < candidates.length; i++) {
    const d = distanceSq(ref, candidates[i]);
    if (d < bestDist) {
      bestDist = d;
      best = candidates[i];
    }
  }

  return best;
}

/**
 * Squared distance between two Vec3 points (avoids sqrt).
 */
function distanceSq(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}
