import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  type Connection,
  type LocationRef,
  type World,
  type Region,
} from '@/data/schemas/world';
import { FrontierTerritory } from '@/data/worlds/frontier_territory';
import { GameStoreService } from '../services/game-store.service';

interface TooltipState {
  x: number;
  y: number;
  left: number;
  top: number;
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
  hoveredLocationId: string | null = null;

  constructor(readonly gameStore: GameStoreService) {}

  get world(): World {
    return FrontierTerritory;
  }

  get currentLocationId(): string {
    return this.gameStore.getState().currentLocationId ?? 'loc_dusty_springs';
  }

  get discoveredLocationIds(): string[] {
    const discovered = this.gameStore.getState().discoveredLocationIds;
    if (discovered.length > 0) return discovered;
    return this.world.locations.filter((loc) => loc.discovered).map((loc) => loc.id);
  }

  get discoveredIds(): Set<string> {
    return new Set(this.discoveredLocationIds);
  }

  get discoveredRegions(): Set<string> {
    const regionIds = new Set<string>();
    for (const locId of this.discoveredLocationIds) {
      const loc = this.world.locations.find((l) => l.id === locId);
      if (!loc) continue;
      const region = this.world.regions.find(
        (r) =>
          loc.coord.wx >= r.bounds.minX &&
          loc.coord.wx <= r.bounds.maxX &&
          loc.coord.wy >= r.bounds.minY &&
          loc.coord.wy <= r.bounds.maxY,
      );
      if (region) regionIds.add(region.id);
    }
    return regionIds;
  }

  get currentConnections(): Connection[] {
    return this.world.connections.filter(
      (c) => c.from === this.currentLocationId || (c.bidirectional && c.to === this.currentLocationId),
    );
  }

  get travelOptions(): Connection[] {
    return this.currentConnections.filter((conn) => {
      const targetId = conn.to === this.currentLocationId ? conn.from : conn.to;
      return this.isDiscovered(targetId);
    }).slice(0, 4);
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

  getLocationCoordX(id: string): number {
    const loc = this.getLocationById(id);
    return loc ? this.scaleX(loc.coord.wx) : 0;
  }

  getLocationCoordY(id: string): number {
    const loc = this.getLocationById(id);
    return loc ? this.scaleY(loc.coord.wy) : 0;
  }

  getConnectionTo(targetId: string): Connection | null {
    return (
      this.world.connections.find(
        (c) =>
          (c.from === this.currentLocationId && c.to === targetId) ||
          (c.bidirectional && c.from === targetId && c.to === this.currentLocationId),
      ) ?? null
    );
  }

  isDiscovered(locationId: string): boolean {
    return this.discoveredIds.has(locationId);
  }

  isConnected(locationId: string): boolean {
    return this.getConnectionTo(locationId) !== null;
  }

  isCurrent(locationId: string): boolean {
    return locationId === this.currentLocationId;
  }

  getIconSize(locationId: string): number {
    if (this.isCurrent(locationId)) return 24;
    if (this.hoveredLocationId === locationId) return 22;
    return 18;
  }

  getIconScale(locationId: string): number {
    return this.getIconSize(locationId) / 20;
  }

  getMarkerColor(locationId: string): string {
    if (this.isCurrent(locationId)) return '#dc2626';
    if (this.isConnected(locationId) && this.isDiscovered(locationId)) return '#059669';
    if (!this.isDiscovered(locationId)) return '#9ca3af';
    return '#4a3728';
  }

  renderRegionOpacity(region: Region): number {
    return this.discoveredRegions.has(region.id) ? 0.4 : 0.15;
  }

  renderRegionStrokeOpacity(region: Region): number {
    return this.discoveredRegions.has(region.id) ? 0.6 : 0.2;
  }

  getConnectionStyle(conn: Connection): { stroke: string; width: number; dasharray: string; opacity: number } {
    const fromDiscovered = this.isDiscovered(conn.from);
    const toDiscovered = this.isDiscovered(conn.to);
    if (!fromDiscovered && !toDiscovered) {
      return { stroke: '#4a3728', width: 0, dasharray: 'none', opacity: 0 };
    }

    let stroke = '#4a3728';
    let width = 2;
    let dasharray = 'none';

    switch (conn.method) {
      case 'road':
        stroke = '#4a3728';
        width = 3;
        dasharray = 'none';
        break;
      case 'trail':
        stroke = '#6b5344';
        width = 2;
        dasharray = '8,4';
        break;
      case 'railroad':
        stroke = '#374151';
        width = 4;
        dasharray = '2,4';
        break;
      case 'wilderness':
        stroke = '#8b7355';
        width = 1;
        dasharray = '4,8';
        break;
      case 'river':
        stroke = '#3b82f6';
        width = 2;
        dasharray = 'none';
        break;
      default:
        break;
    }

    return {
      stroke,
      width,
      dasharray,
      opacity: fromDiscovered && toDiscovered ? 1 : 0.3,
    };
  }

  isRailroad(conn: Connection): boolean {
    return conn.method === 'railroad';
  }

  handleLocationClick(location: LocationRef): void {
    const state = this.gameStore.getState();

    if (state.settings.haptics && navigator.vibrate) {
      navigator.vibrate(30);
    }

    if (location.id === this.currentLocationId) {
      this.gameStore.actions().addNotification('info', 'You are already here');
      return;
    }

    if (!this.isDiscovered(location.id)) {
      this.gameStore.actions().addNotification('warning', 'This location has not been discovered');
      return;
    }

    const connection = this.getConnectionTo(location.id);
    if (!connection) {
      this.gameStore.actions().addNotification('warning', 'No path to this location from here');
      return;
    }

    if (!location.accessible) {
      this.gameStore.actions().addNotification('warning', 'This location is not accessible');
      return;
    }

    this.gameStore.actions().travelTo(location.id);
    this.close.emit();
  }

  handleLocationHover(event: MouseEvent, location: LocationRef): void {
    const connection = this.getConnectionTo(location.id);
    const left = Math.min(event.clientX + 10, window.innerWidth - 200);
    const top = Math.max(event.clientY - 80, 10);
    this.tooltip = {
      x: event.clientX,
      y: event.clientY,
      left,
      top,
      location,
      travelInfo: connection
        ? {
            travelTime: connection.travelTime,
            danger: connection.danger,
            method: connection.method,
          }
        : null,
    };
    this.hoveredLocationId = location.id;
  }

  handleLocationLeave(): void {
    this.tooltip = null;
    this.hoveredLocationId = null;
  }

  closeMap(): void {
    this.close.emit();
  }
}
