import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';

import type { LoadedWorld } from '@/data/worlds';
import { GameStoreService } from '../services/game-store.service';

@Component({
  selector: 'app-travel-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './travel-panel.component.html',
  styleUrls: ['./travel-panel.component.scss'],
})
export class TravelPanelComponent implements OnDestroy {
  private readonly intervalId = window.setInterval(() => {
    this.now = Date.now();
  }, 500);

  private now = Date.now();

  constructor(readonly gameStore: GameStoreService) {}

  ngOnDestroy(): void {
    window.clearInterval(this.intervalId);
  }

  get travel() {
    return this.gameStore.getState().travelState;
  }

  get progressPercent(): number {
    const travel = this.travel;
    if (!travel) return 0;
    if (travel.progress > 0) return travel.progress;

    const totalMs = Math.max(2000, travel.travelTime * 1000);
    const elapsed = Math.max(0, this.now - travel.startedAt);
    return Math.min(100, Math.round((elapsed / totalMs) * 100));
  }

  get fromName(): string {
    return this.getLocationName(this.travel?.fromLocationId);
  }

  get toName(): string {
    return this.getLocationName(this.travel?.toLocationId);
  }

  get dangerClass(): string {
    const level = this.travel?.dangerLevel ?? 'moderate';
    const styles: Record<string, string> = {
      safe: 'text-green-400',
      low: 'text-lime-400',
      moderate: 'text-yellow-400',
      high: 'text-orange-400',
      extreme: 'text-red-400',
    };
    return styles[level] ?? 'text-yellow-400';
  }

  completeTravel(): void {
    this.gameStore.actions().completeTravel();
  }

  cancelTravel(): void {
    this.gameStore.actions().cancelTravel();
  }

  private getLocationName(locationId?: string | null): string {
    if (!locationId) return 'Unknown';
    const world = this.gameStore.getState().loadedWorld as LoadedWorld | null;
    const location = world?.getLocation ? world.getLocation(locationId) : null;
    if (location?.name) return location.name;
    return locationId;
  }
}
