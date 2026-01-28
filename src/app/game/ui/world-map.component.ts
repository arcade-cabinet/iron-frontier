import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  type Connection,
  type LocationRef,
  getConnectionsFrom,
  type World,
} from '@/data/schemas/world';
import { FrontierTerritory } from '@/data/worlds/frontier_territory';
import { getTravelInfo, type LoadedWorld } from '@/data/worlds';
import { GameStoreService } from '../services/game-store.service';

interface TooltipState {
  x: number;
  y: number;
  location: LocationRef;
  travelInfo?: {
    travelTime: number;
    danger: string;
    method: string;
  } | null;
}

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.scss'],
})
export class WorldMapComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  readonly mapWidth = 800;
  readonly mapHeight = 600;
  readonly padding = 40;
  readonly biomeColors: Record<string, string> = {
    desert: '#d4a574',
    badlands: '#b87333',
    grassland: '#8fbc8f',
    scrubland: '#c2b280',
    mountain: '#708090',
    riverside: '#5f9ea0',
    salt_flat: '#e8e4c9',
  };

  readonly dangerColors: Record<string, string> = {
    safe: '#22c55e',
    low: '#84cc16',
    moderate: '#eab308',
    high: '#f97316',
    extreme: '#ef4444',
  };

  tooltip: TooltipState | null = null;
  selectedLocationId: string | null = null;

  constructor(readonly gameStore: GameStoreService) {}

  get world(): World {
    const loaded = this.gameStore.getState().loadedWorld as LoadedWorld | null;
    if (loaded?.world) return loaded.world as World;
    if (loaded && (loaded as any).locations) return loaded as any as World;
    return FrontierTerritory;
  }

  get currentLocationId(): string | null {
    return this.gameStore.getState().currentLocationId;
  }

  get discoveredIds(): Set<string> {
    return new Set(this.gameStore.getState().discoveredLocationIds);
  }

  get currentConnections(): Connection[] {
    if (!this.currentLocationId) return [];
    return getConnectionsFrom(this.world, this.currentLocationId);
  }

  get currentLocationName(): string {
    const loc = this.currentLocationId ? this.getLocationById(this.currentLocationId) : null;
    return loc?.name ?? 'Unknown';
  }

  get currentLocationType(): string {
    const loc = this.currentLocationId ? this.getLocationById(this.currentLocationId) : null;
    return loc?.type ?? 'unknown';
  }

  scaleX(wx: number): number {
    return this.padding + (wx / this.world.dimensions.width) * (this.mapWidth - 2 * this.padding);
  }

  scaleY(wy: number): number {
    return this.padding + (wy / this.world.dimensions.height) * (this.mapHeight - 2 * this.padding);
  }

  getLocationById(id: string): LocationRef | undefined {
    return this.world.locations.find((loc) => loc.id === id);
  }

  getLocationX(id: string): number {
    const loc = this.getLocationById(id);
    return loc ? this.scaleX(loc.coord.wx) : 0;
  }

  getLocationY(id: string): number {
    const loc = this.getLocationById(id);
    return loc ? this.scaleY(loc.coord.wy) : 0;
  }

  connectionTarget(conn: Connection): string {
    if (!this.currentLocationId) return conn.to;
    return conn.to === this.currentLocationId && conn.bidirectional ? conn.from : conn.to;
  }

  isReachable(locationId: string): boolean {
    if (!this.currentLocationId) return false;
    return this.currentConnections.some((conn) => this.connectionTarget(conn) === locationId);
  }

  selectLocation(loc: LocationRef): void {
    this.selectedLocationId = loc.id;
  }

  handleTravel(): void {
    if (!this.selectedLocationId || this.selectedLocationId === this.currentLocationId) return;
    if (!this.isReachable(this.selectedLocationId)) return;
    this.gameStore.actions().travelTo(this.selectedLocationId);
    this.close.emit();
  }

  handleLocationHover(event: MouseEvent, loc: LocationRef): void {
    const loaded = this.gameStore.getState().loadedWorld as LoadedWorld | null;
    const travelInfo =
      this.currentLocationId && loaded ? getTravelInfo(loaded, this.currentLocationId, loc.id) : null;
    this.tooltip = {
      x: event.clientX,
      y: event.clientY,
      location: loc,
      travelInfo,
    };
  }

  clearTooltip(): void {
    this.tooltip = null;
  }

  closeMap(): void {
    this.close.emit();
  }

  get selectedLocation(): LocationRef | null {
    if (!this.selectedLocationId) return null;
    return this.world.locations.find((loc) => loc.id === this.selectedLocationId) ?? null;
  }

  get travelInfo() {
    if (!this.selectedLocationId || !this.currentLocationId) return null;
    const loaded = this.gameStore.getState().loadedWorld as LoadedWorld | null;
    return loaded ? getTravelInfo(loaded, this.currentLocationId, this.selectedLocationId) : null;
  }
}
