/** Axis-Aligned Bounding Box for collision on the x/z plane */
export interface AABB {
  min: { x: number; z: number };
  max: { x: number; z: number };
}

/** Circle collider for NPCs and point-based entities */
export interface Circle {
  center: { x: number; z: number };
  radius: number;
}

/** Internal entry for tracking items in the spatial hash */
export interface SpatialEntry<T> {
  item: T;
  bounds: AABB;
  cells: Set<string>;
}
