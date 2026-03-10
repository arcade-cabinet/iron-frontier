import { aabbFromRadius } from '../SpatialHash';
import type { Zone } from './types';
import { TOWN_POSITIONS } from './types';

export function createTownZones(): Zone[] {
  const zones: Zone[] = [];

  for (const [townId, pos] of Object.entries(TOWN_POSITIONS)) {
    zones.push({
      id: `town_${townId}`,
      type: 'town',
      name: townId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      townId,
      bounds: aabbFromRadius({ x: pos.x, z: pos.z }, pos.radius),
      transitions: [],
      encountersEnabled: false,
      priority: 10,
    });
  }

  return zones;
}

export function createRouteZone(
  routeId: string,
  fromPos: { x: number; z: number },
  toPos: { x: number; z: number },
  width: number = 50,
  encounterZoneId?: string
): Zone {
  const minX = Math.min(fromPos.x, toPos.x) - width / 2;
  const maxX = Math.max(fromPos.x, toPos.x) + width / 2;
  const minZ = Math.min(fromPos.z, toPos.z) - width / 2;
  const maxZ = Math.max(fromPos.z, toPos.z) + width / 2;

  return {
    id: `route_${routeId}`,
    type: 'route',
    name: routeId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    routeId,
    bounds: {
      min: { x: minX, z: minZ },
      max: { x: maxX, z: maxZ },
    },
    transitions: [],
    encounterZoneId,
    encountersEnabled: true,
    priority: 5,
  };
}
