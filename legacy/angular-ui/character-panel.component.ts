import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { getItem } from '@/data/items';
import { getRarityColor } from '@/data/schemas/item';
import type { EquipmentSlot } from '@/store';
import { GameStoreService } from '../services/game-store.service';

const EQUIPMENT_SLOTS: { slot: EquipmentSlot; label: string; icon: string }[] = [
  { slot: 'weapon', label: 'Main Weapon', icon: 'gun' },
  { slot: 'offhand', label: 'Sidearm', icon: 'sword' },
  { slot: 'head', label: 'Hat', icon: 'hat' },
  { slot: 'body', label: 'Vest', icon: 'vest' },
  { slot: 'accessory', label: 'Accessory', icon: 'ring' },
];

@Component({
  selector: 'app-character-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-panel.component.html',
  styleUrls: ['./character-panel.component.scss'],
})
export class CharacterPanelComponent {
  readonly slots = EQUIPMENT_SLOTS;

  constructor(readonly gameStore: GameStoreService) {}

  get isOpen(): boolean {
    return this.gameStore.getState().activePanel === 'character';
  }

  close(): void {
    this.gameStore.actions().togglePanel('character');
  }

  get bonuses() {
    return this.gameStore.actions().getEquipmentBonuses();
  }

  getEquippedItem(slot: EquipmentSlot) {
    return this.gameStore.actions().getEquippedItem(slot);
  }

  unequip(slot: EquipmentSlot): void {
    this.gameStore.actions().unequipItem(slot);
  }

  getItemDef(itemId?: string | null) {
    if (!itemId) return null;
    return getItem(itemId) ?? null;
  }

  getRarityColor(rarity?: string): string {
    return getRarityColor(rarity ?? 'common');
  }

  getReputationStatus(rep: number): { label: string; color: string; bg: string } {
    if (rep >= 50) return { label: 'Respected', color: 'text-green-400', bg: 'bg-green-900/30' };
    if (rep >= 20) return { label: 'Known', color: 'text-lime-400', bg: 'bg-lime-900/30' };
    if (rep >= 0) return { label: 'Neutral', color: 'text-amber-400', bg: 'bg-amber-900/30' };
    if (rep >= -20) return { label: 'Suspicious', color: 'text-orange-400', bg: 'bg-orange-900/30' };
    return { label: 'Notorious', color: 'text-red-400', bg: 'bg-red-900/30' };
  }

  getXpPercent(state: any): number {
    return state.playerStats.xpToNext > 0
      ? (state.playerStats.xp / state.playerStats.xpToNext) * 100
      : 0;
  }
}
