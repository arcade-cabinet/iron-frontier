import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

import { GameStoreService } from '../services/game-store.service';
import type { Notification } from '@/store';

@Component({
  selector: 'app-notification-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-feed.component.html',
  styleUrls: ['./notification-feed.component.scss'],
  animations: [
    trigger('toast', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px) scale(0.9)' }),
        animate(
          '200ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '180ms ease-in',
          style({ opacity: 0, transform: 'translateX(100px) scale(0.9)' })
        ),
      ]),
    ]),
  ],
})
export class NotificationFeedComponent {
  constructor(readonly gameStore: GameStoreService) {}

  getBgClass(type: Notification['type']): string {
    return {
      item: 'bg-amber-900/90 border-amber-600/50',
      xp: 'bg-purple-900/90 border-purple-600/50',
      quest: 'bg-yellow-900/90 border-yellow-600/50',
      level: 'bg-green-900/90 border-green-600/50',
      info: 'bg-slate-800/90 border-slate-600/50',
      warning: 'bg-red-900/90 border-red-600/50',
    }[type];
  }

  remove(notificationId: string): void {
    this.gameStore.actions().removeNotification(notificationId);
  }
}
