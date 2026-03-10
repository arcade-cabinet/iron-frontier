import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import type { Subscription } from 'rxjs';

import type { LoadedWorld } from '@/data/worlds';
import type { DangerLevel, TravelMethod } from '@/data/schemas/world';
import type { TravelState } from '@/store';
import { GameStoreService } from '../services/game-store.service';

type DangerStyle = { badge: string; text: string };

type MethodInfo = { icon: 'horse' | 'train' | 'boot'; label: string; speed: string };

const DANGER_STYLES: Record<DangerLevel, DangerStyle> = {
  safe: {
    badge: 'bg-green-900/50 text-green-400 border-green-700/50',
    text: 'text-green-400',
  },
  low: {
    badge: 'bg-lime-900/50 text-lime-400 border-lime-700/50',
    text: 'text-lime-400',
  },
  moderate: {
    badge: 'bg-yellow-900/50 text-yellow-400 border-yellow-700/50',
    text: 'text-yellow-400',
  },
  high: {
    badge: 'bg-orange-900/50 text-orange-400 border-orange-700/50',
    text: 'text-orange-400',
  },
  extreme: {
    badge: 'bg-red-900/50 text-red-400 border-red-700/50',
    text: 'text-red-400',
  },
};

const METHOD_INFO: Record<TravelMethod, MethodInfo> = {
  road: { icon: 'horse', label: 'Road', speed: 'Fast' },
  trail: { icon: 'boot', label: 'Trail', speed: 'Moderate' },
  railroad: { icon: 'train', label: 'Railroad', speed: 'Very Fast' },
  wilderness: { icon: 'boot', label: 'Wilderness', speed: 'Slow' },
  river: { icon: 'horse', label: 'River', speed: 'Varies' },
};

@Component({
  selector: 'app-travel-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './travel-panel.component.html',
  styleUrls: ['./travel-panel.component.scss'],
  animations: [
    trigger('overlay', [
      transition(':enter', [style({ opacity: 0 }), animate('150ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('panel', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(20px) scale(0.9)' })),
      ]),
    ]),
    trigger('encounter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class TravelPanelComponent implements OnInit, OnDestroy {
  travel: TravelState | null = null;
  progress = 0;
  showEncounter = false;

  private subscription?: Subscription;
  private rafId?: number;
  private encounterTimer?: number;
  private revealEncounterTimer?: number;
  private completeTimer?: number;

  constructor(readonly gameStore: GameStoreService) {}

  ngOnInit(): void {
    this.subscription = this.gameStore.state$.subscribe((state) => {
      if (this.travel?.startedAt !== state.travelState?.startedAt) {
        this.resetProgress();
      }
      this.travel = state.travelState ?? null;
      if (!this.travel) {
        this.resetProgress();
        return;
      }

      if (this.travel.progress > 0) {
        this.progress = this.travel.progress;
      } else if (this.progress === 0 && !this.showEncounter) {
        this.beginTravelAnimation();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.clearTimers();
  }

  get fromName(): string {
    return this.getLocationName(this.travel?.fromLocationId);
  }

  get toName(): string {
    return this.getLocationName(this.travel?.toLocationId);
  }

  get methodInfo(): MethodInfo {
    if (!this.travel) return METHOD_INFO.trail;
    return METHOD_INFO[this.travel.method] ?? METHOD_INFO.trail;
  }

  get dangerStyle(): DangerStyle {
    const level = this.travel?.dangerLevel ?? 'moderate';
    return DANGER_STYLES[level] ?? DANGER_STYLES.moderate;
  }

  get dangerClass(): string {
    return this.dangerStyle.text;
  }

  get progressPercent(): number {
    return this.progress;
  }

  get progressMarkerLeft(): number {
    return Math.min(this.progressPercent, 97);
  }

  completeTravel(): void {
    this.gameStore.actions().completeTravel();
  }

  cancelTravel(): void {
    this.gameStore.actions().cancelTravel();
  }

  fightEncounter(): void {
    if (this.travel?.encounterId) {
      this.gameStore.actions().startCombat(this.travel.encounterId);
    }
  }

  private beginTravelAnimation(): void {
    if (!this.travel) return;

    this.clearTimers();
    this.progress = 0;
    this.showEncounter = false;

    if (this.travel.encounterId) {
      this.encounterTimer = window.setTimeout(() => {
        this.progress = 50;
        this.revealEncounterTimer = window.setTimeout(() => {
          this.showEncounter = true;
        }, 500);
      }, 1000);
      return;
    }

    const duration = Math.min(this.travel.travelTime * 200, 3000);
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      this.progress = newProgress;

      if (newProgress < 100) {
        this.rafId = window.requestAnimationFrame(animate);
      } else {
        this.completeTimer = window.setTimeout(() => this.completeTravel(), 500);
      }
    };

    this.rafId = window.requestAnimationFrame(animate);
  }

  private resetProgress(): void {
    this.clearTimers();
    this.progress = 0;
    this.showEncounter = false;
  }

  private clearTimers(): void {
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
    if (this.encounterTimer) {
      window.clearTimeout(this.encounterTimer);
      this.encounterTimer = undefined;
    }
    if (this.revealEncounterTimer) {
      window.clearTimeout(this.revealEncounterTimer);
      this.revealEncounterTimer = undefined;
    }
    if (this.completeTimer) {
      window.clearTimeout(this.completeTimer);
      this.completeTimer = undefined;
    }
  }

  private getLocationName(locationId?: string | null): string {
    if (!locationId) return 'Unknown';
    const world = this.gameStore.getState().loadedWorld as LoadedWorld | null;
    const location = world?.getLocation ? world.getLocation(locationId) : null;
    if (location?.ref?.name) return location.ref.name;
    return locationId;
  }
}
