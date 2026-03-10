import type { Vec3 } from '../../data/schemas/spatial';
import { getNPCActivityAt } from '../../data/generation/templates/scheduleTemplates';
import type { LocationMarkerIndex } from './locationIndex';
import { closestPosition } from './locationIndex';
import type { NPCInstanceData, ResolvedScheduleTarget } from './types';
import { INDOOR_ACTIVITIES, UNAVAILABLE_ACTIVITIES } from './types';

/**
 * Resolves the current schedule target for an NPC at a given game hour.
 */
export function resolveScheduleTarget(
  npc: NPCInstanceData,
  gameHour: number,
  index: LocationMarkerIndex,
): ResolvedScheduleTarget {
  const entry = getNPCActivityAt(npc.schedule, gameHour);

  if (!entry) {
    return {
      position: npc.homePosition,
      isIndoors: true,
      isAvailable: true,
      activity: 'idle',
    };
  }

  const { activity, locationMarker, dialogueOverride } = entry;
  const position = resolveLocationMarker(locationMarker, npc, index);
  const isIndoors = INDOOR_ACTIVITIES.has(activity);
  const isAvailable = !UNAVAILABLE_ACTIVITIES.has(activity);

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

function resolveLocationMarker(
  marker: string,
  npc: NPCInstanceData,
  index: LocationMarkerIndex,
): Vec3 {
  const key = marker.replace(/^\{\{|\}\}$/g, '').toLowerCase();

  if (npc.positionOverrides?.[key]) {
    return npc.positionOverrides[key];
  }

  switch (key) {
    case 'home':
    case 'bunkhouse':
    case 'homestead':
      return npc.homePosition;

    case 'town_center':
      return index.townCenter;

    case 'outskirts':
      return closestPosition(npc.homePosition, index.outskirts) ?? index.townCenter;
  }

  if (npc.assignedTo) {
    const assignmentMarkers = index.byAssignment.get(npc.assignedTo);
    if (assignmentMarkers && assignmentMarkers.length > 0) {
      const matchesWork = ['workplace', 'work', npc.assignedTo.toLowerCase()].includes(key);
      if (matchesWork || isMarkerKeyMatch(key, npc.assignedTo)) {
        return assignmentMarkers[0].position;
      }
    }
  }

  for (const [assignmentId, markers] of index.byAssignment) {
    if (isMarkerKeyMatch(key, assignmentId)) {
      return markers[0].position;
    }
  }

  const roleMarkers = index.byRole.get(key);
  if (roleMarkers && roleMarkers.length > 0) {
    return roleMarkers[0].position;
  }

  const tagMarkers = index.byTag.get(key);
  if (tagMarkers && tagMarkers.length > 0) {
    return tagMarkers[0].position;
  }

  for (const [assignmentId, markers] of index.byAssignment) {
    if (assignmentId.includes(key) || key.includes(assignmentId)) {
      return markers[0].position;
    }
  }

  return npc.homePosition;
}

function resolvePatrolWaypoints(
  marker: string,
  npc: NPCInstanceData,
  index: LocationMarkerIndex,
): Vec3[] {
  const key = marker.replace(/^\{\{|\}\}$/g, '').toLowerCase();

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

  const roleMarkers = index.byRole.get(npc.role);
  if (roleMarkers) {
    for (const m of roleMarkers) {
      if (m.waypoints && m.waypoints.length > 0) {
        return m.waypoints;
      }
    }
  }

  if (key === 'town_center' || key === 'main_street') {
    const mainRoad = index.roadPositions.get('main_street')
      ?? index.roadPositions.get('road_type:main_street');
    if (mainRoad && mainRoad.length >= 2) {
      return mainRoad;
    }
  }

  const center = resolveLocationMarker(marker, npc, index);
  const r = 6;
  return [
    { x: center.x + r, y: center.y, z: center.z },
    { x: center.x, y: center.y, z: center.z + r },
    { x: center.x - r, y: center.y, z: center.z },
    { x: center.x, y: center.y, z: center.z - r },
  ];
}

function isMarkerKeyMatch(key: string, assignmentId: string): boolean {
  const normalized = assignmentId.toLowerCase().replace(/[_\- ]/g, '');
  const normalizedKey = key.replace(/[_\- ]/g, '');

  if (normalized === normalizedKey) return true;
  if (normalized.includes(normalizedKey)) return true;

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
