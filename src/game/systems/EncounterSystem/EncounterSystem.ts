import { scopedRNG, rngTick } from '../../lib/prng';
import type {
  EncounterZone,
  EncounterTrigger,
  EncounterState,
  TimeOfDay,
  EncounterCallback,
} from './types';
import {
  DISTANCE_CHECK_INTERVAL,
  TOWN_SAFE_RADIUS,
  TERRAIN_MODIFIERS,
} from './types';

export class EncounterSystem {
  private state: EncounterState = {
    distanceSinceEncounter: 0,
    currentZone: null,
    repelDistance: 0,
    enabled: true,
    distanceToTown: Infinity,
  };

  private zones: Map<string, EncounterZone> = new Map();
  private encounterCallbacks: Set<EncounterCallback> = new Set();
  private timeOfDay: TimeOfDay = 'day';

  private lastPosition: { x: number; z: number } = { x: 0, z: 0 };
  private accumulatedDistance = 0;

  constructor() {
    console.log('[EncounterSystem] Initialized (distance-based, 3D)');
  }

  public registerZone(zone: EncounterZone): void {
    if (zone.minSteps !== undefined && zone.minDistance === undefined) {
      zone = { ...zone, minDistance: zone.minSteps * DISTANCE_CHECK_INTERVAL };
    }
    this.zones.set(zone.id, zone);
  }

  public setCurrentZone(zoneId: string | null): void {
    if (zoneId === null) {
      this.state.currentZone = null;
    } else {
      this.state.currentZone = this.zones.get(zoneId) ?? null;
    }
  }

  public setTimeOfDay(time: TimeOfDay): void {
    this.timeOfDay = time;
  }

  public setDistanceToTown(meters: number): void {
    this.state.distanceToTown = meters;
  }

  public updatePosition(x: number, z: number): void {
    if (!this.state.enabled || !this.state.currentZone) {
      this.lastPosition = { x, z };
      return;
    }

    const dx = x - this.lastPosition.x;
    const dz = z - this.lastPosition.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    this.accumulatedDistance += distance;
    this.lastPosition = { x, z };

    while (this.accumulatedDistance >= DISTANCE_CHECK_INTERVAL) {
      this.accumulatedDistance -= DISTANCE_CHECK_INTERVAL;
      this.processDistanceCheck();
    }
  }

  private processDistanceCheck(): void {
    const zone = this.state.currentZone;
    if (!zone) return;

    this.state.distanceSinceEncounter += DISTANCE_CHECK_INTERVAL;

    if (this.state.distanceToTown < TOWN_SAFE_RADIUS) {
      return;
    }

    if (this.state.repelDistance > 0) {
      this.state.repelDistance -= DISTANCE_CHECK_INTERVAL;
      return;
    }

    if (this.state.distanceSinceEncounter < zone.minDistance) {
      return;
    }

    const chance = this.calculateEncounterChance(zone);

    if (scopedRNG('encounter', 42, rngTick()) < chance) {
      this.triggerEncounter(zone);
    }
  }

  private calculateEncounterChance(zone: EncounterZone): number {
    let rate = zone.baseRate;
    rate *= zone.timeModifiers[this.timeOfDay];
    rate *= TERRAIN_MODIFIERS[zone.terrain] ?? 1.0;

    const checksOverMin = Math.max(0, (this.state.distanceSinceEncounter - zone.minDistance) / DISTANCE_CHECK_INTERVAL);
    const distanceBonus = Math.min(0.1, checksOverMin * 0.002);
    rate += distanceBonus;

    return Math.min(0.25, rate);
  }

  private triggerEncounter(zone: EncounterZone): void {
    if (zone.encounterPool.length === 0) return;

    const encounterId = zone.encounterPool[Math.floor(scopedRNG('encounter', 42, rngTick()) * zone.encounterPool.length)];

    const trigger: EncounterTrigger = {
      encounterId,
      zoneId: zone.id,
      terrain: zone.terrain,
      timeOfDay: this.timeOfDay,
    };

    this.state.distanceSinceEncounter = 0;

    this.encounterCallbacks.forEach((cb) => cb(trigger));

    console.log(`[EncounterSystem] Triggered: ${encounterId} in ${zone.id} (distance-based)`);
  }

  public onEncounter(callback: EncounterCallback): () => void {
    this.encounterCallbacks.add(callback);
    return () => {
      this.encounterCallbacks.delete(callback);
    };
  }

  public applyRepel(distance: number): void {
    this.state.repelDistance = Math.max(this.state.repelDistance, distance);
    console.log(`[EncounterSystem] Repel active for ${this.state.repelDistance}m`);
  }

  /** @deprecated Renamed from getRepelSteps for clarity; kept for compat. */
  public getRepelSteps(): number {
    return this.state.repelDistance;
  }

  public getRepelDistance(): number {
    return this.state.repelDistance;
  }

  public setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.state.enabled;
  }

  public reset(): void {
    this.state.distanceSinceEncounter = 0;
    this.state.repelDistance = 0;
    this.state.distanceToTown = Infinity;
    this.accumulatedDistance = 0;
  }

  public getDebugInfo(): {
    zone: string | null;
    /** Meters traveled since last encounter */
    steps: number;
    /** Remaining repel distance in meters */
    repel: number;
    /** Current encounter chance per distance check */
    chance: number;
    /** Distance to nearest town (meters) */
    distanceToTown: number;
  } {
    return {
      zone: this.state.currentZone?.id ?? null,
      steps: this.state.distanceSinceEncounter,
      repel: this.state.repelDistance,
      chance: this.state.currentZone
        ? this.calculateEncounterChance(this.state.currentZone)
        : 0,
      distanceToTown: this.state.distanceToTown,
    };
  }
}

let encounterSystemInstance: EncounterSystem | null = null;

export function getEncounterSystem(): EncounterSystem {
  if (!encounterSystemInstance) {
    encounterSystemInstance = new EncounterSystem();
  }
  return encounterSystemInstance;
}
