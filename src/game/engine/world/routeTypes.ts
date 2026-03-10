// routeTypes — Public types for route rendering.

import type * as THREE from 'three';

import type { FlattenZone } from './ChunkManager';

export interface RouteSegment {
  /** Unique identifier for this route ("from-to"). */
  connectionId: string;
  /** Source location id. */
  from: string;
  /** Destination location id. */
  to: string;
  /** Travel method (road, trail, railroad, wilderness). */
  method: string;
  /** Three.js Group containing all geometry for this route. */
  group: THREE.Group;
  /** Flatten zones along the route for ChunkManager. */
  flattenZones: FlattenZone[];
}

export interface RouteEndpoints {
  from: [number, number, number];
  to: [number, number, number];
}
