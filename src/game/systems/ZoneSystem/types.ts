import type { AABB } from '../SpatialHash';

export type ZoneType = 'overworld' | 'town' | 'building' | 'route';

export interface Zone {
  id: string;
  type: ZoneType;
  name?: string;
  bounds: AABB;
  encounterZoneId?: string;
  townId?: string;
  routeId?: string;
  buildingId?: string;
  transitions: ZoneTransition[];
  encountersEnabled?: boolean;
  priority?: number;
  data?: Record<string, unknown>;
}

export interface ZoneTransition {
  targetZoneId: string;
  triggerBounds: AABB;
  spawnPosition: { x: number; z: number };
  transitionText?: string;
  oneWay?: boolean;
  conditions?: {
    requiresFlag?: string;
    requiresQuest?: string;
    requiresItem?: string;
    timeOfDay?: ('dawn' | 'day' | 'dusk' | 'night')[];
  };
}

export type ZoneChangeCallback = (newZone: Zone | null, previousZone: Zone | null) => void;

export type TransitionCallback = (transition: ZoneTransition, fromZone: Zone) => void;

export const TOWN_POSITIONS: Record<string, { x: number; z: number; radius: number }> = {
  frontiers_edge: { x: 0, z: 0, radius: 100 },
  dusty_springs: { x: 50, z: 25, radius: 80 },
  iron_gulch: { x: 100, z: 50, radius: 150 },
  mesa_point: { x: 75, z: -50, radius: 120 },
  coldwater: { x: 120, z: 80, radius: 130 },
  salvation: { x: 150, z: -100, radius: 140 },
};
