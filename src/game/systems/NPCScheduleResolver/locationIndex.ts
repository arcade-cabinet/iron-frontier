import type { Location, NpcMarker, Vec3 } from '../../data/schemas/spatial';
import { UNRESOLVED_POSITION } from './types';

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

  for (const marker of location.npcMarkers) {
    if (marker.assignedTo) {
      const existing = byAssignment.get(marker.assignedTo) ?? [];
      existing.push(marker);
      byAssignment.set(marker.assignedTo, existing);
    }

    const roleMarkers = byRole.get(marker.role) ?? [];
    roleMarkers.push(marker);
    byRole.set(marker.role, roleMarkers);

    for (const tag of marker.tags) {
      const tagMarkers = byTag.get(tag) ?? [];
      tagMarkers.push(marker);
      byTag.set(tag, tagMarkers);
    }
  }

  for (const road of location.roads) {
    roadPositions.set(road.id, road.points);
    const typeKey = `road_type:${road.type}`;
    const existing = roadPositions.get(typeKey) ?? [];
    existing.push(...road.points);
    roadPositions.set(typeKey, existing);
  }

  let townCenter: Vec3;
  const townCenterMarkers = byTag.get('town_center') ?? byTag.get('civic');
  if (townCenterMarkers && townCenterMarkers.length > 0) {
    townCenter = averagePosition(townCenterMarkers.map((m) => m.position));
  } else if (location.npcMarkers.length > 0) {
    townCenter = averagePosition(location.npcMarkers.map((m) => m.position));
  } else {
    townCenter = {
      x: (location.width * 4) / 2,
      y: 0,
      z: (location.height * 4) / 2,
    };
  }

  const outskirts: Vec3[] = [];
  const outskirtsMarkers = byTag.get('outskirts') ?? [];
  for (const m of outskirtsMarkers) {
    outskirts.push(m.position);
  }
  if (outskirts.length === 0) {
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

export function averagePosition(positions: Vec3[]): Vec3 {
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

export function closestPosition(ref: Vec3, candidates: Vec3[]): Vec3 | undefined {
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

export function distanceSq(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}
