import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { getItem } from '@/data/items';
import { getRarityColor } from '@/data/schemas/item';
import type { EquipmentSlot } from '@/store';
import { GameStoreService } from '../services/game-store.service';

const EQUIPMENT_SLOTS: { slot: EquipmentSlot; label: string; icon: string }[] = [
  { slot: 'head', label: 'Hat', icon: 'M12 2l4 4h-8l4-4zm-6 6h12v2H6z' },
  { slot: 'body', label: 'Vest', icon: 'M6 2h12l-2 8v12H8V10L6 2z' },
  { slot: 'weapon', label: 'Weapon', icon: 'M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6' },
  { slot: 'offhand', label: 'Offhand', icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' },
  { slot: 'accessory', label: 'Trinket', icon: 'M12 8a6 6 0 100 12 6 6 0 000-12z' },
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

  get itemBonuses() {
    return this.gameStore.actions().getEquipmentBonuses();
  }

  getEquippedItem(slot: EquipmentSlot) {
    return this.gameStore.actions().getEquippedItem(slot);
  }

  unequip(slot: EquipmentSlot): void {
    this.gameStore.actions().unequipItem(slot);
  }

  getItemName(itemId?: string | null): string {
    if (!itemId) return 'Empty';
    return getItem(itemId)?.name ?? 'Unknown';
  }

  getRarityColor(rarity?: string): string {
    return getRarityColor(rarity ?? 'common');
  }
}
