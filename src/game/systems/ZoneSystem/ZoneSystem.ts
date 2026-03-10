import { SpatialHash, aabbContainsPoint, aabbIntersects } from '../SpatialHash';
import type { EncounterSystem } from '../EncounterSystem';
import type { Zone, ZoneType, ZoneTransition, ZoneChangeCallback, TransitionCallback } from './types';
import { createTownZones, createRouteZone } from './factories';

export class ZoneSystem {
  private zones: Map<string, Zone> = new Map();
  private spatialHash: SpatialHash<Zone>;
  private currentZone: Zone | null = null;
  private zoneChangeCallbacks: Set<ZoneChangeCallback> = new Set();
  private transitionCallbacks: Set<TransitionCallback> = new Set();
  private encounterSystem: EncounterSystem | null = null;

  constructor(cellSize: number = 100) {
    this.spatialHash = new SpatialHash<Zone>(cellSize);
    console.log('[ZoneSystem] Initialized');
  }

  registerZone(zone: Zone): void {
    if (!zone.id) {
      throw new Error('Zone must have an id');
    }
    if (!zone.bounds) {
      throw new Error(`Zone ${zone.id} must have bounds`);
    }

    if (this.zones.has(zone.id)) {
      this.unregisterZone(zone.id);
    }

    this.zones.set(zone.id, zone);
    this.spatialHash.insert(zone, zone.bounds);
    console.log(`[ZoneSystem] Registered zone: ${zone.id} (${zone.type})`);
  }

  unregisterZone(zoneId: string): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      this.spatialHash.remove(zone);
      this.zones.delete(zoneId);

      if (this.currentZone?.id === zoneId) {
        this.currentZone = null;
      }

      console.log(`[ZoneSystem] Unregistered zone: ${zoneId}`);
    }
  }

  registerZones(zones: Zone[]): void {
    for (const zone of zones) {
      this.registerZone(zone);
    }
  }

  getZone(zoneId: string): Zone | undefined {
    return this.zones.get(zoneId);
  }

  getAllZones(): Zone[] {
    return Array.from(this.zones.values());
  }

  checkPlayerPosition(pos: { x: number; z: number }): Zone | null {
    const candidates = this.spatialHash.queryPoint(pos);

    if (candidates.length === 0) {
      return null;
    }

    const containingZones = candidates.filter((zone) => aabbContainsPoint(zone.bounds, pos));

    if (containingZones.length === 0) {
      return null;
    }

    containingZones.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    return containingZones[0];
  }

  updatePlayerPosition(pos: { x: number; z: number }): Zone | null {
    const newZone = this.checkPlayerPosition(pos);
    const previousZone = this.currentZone;

    if (newZone?.id !== previousZone?.id) {
      this.currentZone = newZone;

      for (const callback of this.zoneChangeCallbacks) {
        callback(newZone, previousZone);
      }

      if (this.encounterSystem && newZone?.type === 'route' && newZone.encounterZoneId) {
        this.encounterSystem.setCurrentZone(newZone.encounterZoneId);
      } else if (this.encounterSystem && newZone?.type === 'town') {
        this.encounterSystem.setCurrentZone(null);
      }

      console.log(
        `[ZoneSystem] Zone changed: ${previousZone?.id ?? 'none'} -> ${newZone?.id ?? 'none'}`
      );
    }

    return newZone;
  }

  checkTransition(pos: { x: number; z: number }): ZoneTransition | null {
    const zone = this.currentZone;
    if (!zone) return null;

    for (const transition of zone.transitions) {
      if (aabbContainsPoint(transition.triggerBounds, pos)) {
        return transition;
      }
    }

    return null;
  }

  getCurrentZone(): Zone | null {
    return this.currentZone;
  }

  setCurrentZone(zoneId: string | null): void {
    if (zoneId === null) {
      this.currentZone = null;
    } else {
      this.currentZone = this.zones.get(zoneId) ?? null;
    }
  }

  getZonesInRadius(pos: { x: number; z: number }, radius: number): Zone[] {
    return this.spatialHash.queryRadius(pos, radius);
  }

  getZonesByType(type: ZoneType): Zone[] {
    return Array.from(this.zones.values()).filter((zone) => zone.type === type);
  }

  getNearestZone(pos: { x: number; z: number }, type?: ZoneType): Zone | null {
    const zones = type ? this.getZonesByType(type) : Array.from(this.zones.values());

    if (zones.length === 0) return null;

    let nearest: Zone | null = null;
    let nearestDistSq = Infinity;

    for (const zone of zones) {
      const center = {
        x: (zone.bounds.min.x + zone.bounds.max.x) / 2,
        z: (zone.bounds.min.z + zone.bounds.max.z) / 2,
      };
      const dx = pos.x - center.x;
      const dz = pos.z - center.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < nearestDistSq) {
        nearestDistSq = distSq;
        nearest = zone;
      }
    }

    return nearest;
  }

  getZonesInBounds(bounds: import('../SpatialHash').AABB): Zone[] {
    const candidates = this.spatialHash.query(bounds);
    return candidates.filter((zone) => aabbIntersects(zone.bounds, bounds));
  }

  onZoneChange(callback: ZoneChangeCallback): () => void {
    this.zoneChangeCallbacks.add(callback);
    return () => {
      this.zoneChangeCallbacks.delete(callback);
    };
  }

  onTransition(callback: TransitionCallback): () => void {
    this.transitionCallbacks.add(callback);
    return () => {
      this.transitionCallbacks.delete(callback);
    };
  }

  setEncounterSystem(system: EncounterSystem): void {
    this.encounterSystem = system;
  }

  static createTownZones(): Zone[] {
    return createTownZones();
  }

  static createRouteZone(
    routeId: string,
    fromPos: { x: number; z: number },
    toPos: { x: number; z: number },
    width: number = 50,
    encounterZoneId?: string
  ): Zone {
    return createRouteZone(routeId, fromPos, toPos, width, encounterZoneId);
  }

  clear(): void {
    this.zones.clear();
    this.spatialHash.clear();
    this.currentZone = null;
    console.log('[ZoneSystem] Cleared all zones');
  }

  dispose(): void {
    this.clear();
    this.zoneChangeCallbacks.clear();
    this.transitionCallbacks.clear();
    this.encounterSystem = null;
    console.log('[ZoneSystem] Disposed');
  }

  getDebugInfo(): {
    zoneCount: number;
    currentZone: string | null;
    zonesByType: Record<ZoneType, number>;
    spatialHashInfo: ReturnType<SpatialHash<Zone>['getDebugInfo']>;
  } {
    const zonesByType: Record<ZoneType, number> = {
      overworld: 0,
      town: 0,
      building: 0,
      route: 0,
    };

    for (const zone of this.zones.values()) {
      zonesByType[zone.type]++;
    }

    return {
      zoneCount: this.zones.size,
      currentZone: this.currentZone?.id ?? null,
      zonesByType,
      spatialHashInfo: this.spatialHash.getDebugInfo(),
    };
  }
}
