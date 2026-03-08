import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';

import { getItem } from '@/data/items';
import { getItemTypeName } from '@/data/schemas/item';
import type { InventoryItem } from '@/store';
import { GameStoreService } from '../services/game-store.service';

const TYPE_ICONS: Record<string, string> = {
  weapon: 'M12 2l3 7h6l-5 4 2 7-6-4-6 4 2-7-5-4h6l3-7z',
  consumable:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  key_item:
    'M21 10h-8.35C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H13l2 2 2-2 2 2 2-2v-4zM7 15c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z',
  junk: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  currency:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z',
  armor: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
};

type FilterCategory = 'all' | 'weapon' | 'armor' | 'consumable' | 'key_item' | 'junk';

const FILTER_CATEGORIES: { id: FilterCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { id: 'weapon', label: 'Weapons', icon: TYPE_ICONS['weapon'] },
  { id: 'armor', label: 'Armor', icon: TYPE_ICONS['armor'] },
  { id: 'consumable', label: 'Supplies', icon: TYPE_ICONS['consumable'] },
  { id: 'key_item', label: 'Keys', icon: TYPE_ICONS['key_item'] },
];

@Component({
  selector: 'app-inventory-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-panel.component.html',
  styleUrls: ['./inventory-panel.component.scss'],
})
export class InventoryPanelComponent implements OnDestroy {
  readonly categories = FILTER_CATEGORIES;
  readonly typeIcons = TYPE_ICONS;

  activeFilter: FilterCategory = 'all';
  selectedItem: InventoryItem | null = null;

  private readonly unsubscribe = this.gameStore.state$.subscribe(() => {});

  constructor(readonly gameStore: GameStoreService) {}

  ngOnDestroy(): void {
    this.unsubscribe.unsubscribe();
  }

  get inventoryOpen(): boolean {
    return this.gameStore.getState().activePanel === 'inventory';
  }

  get inventory(): InventoryItem[] {
    return this.gameStore.getState().inventory;
  }

  get playerStats() {
    return this.gameStore.getState().playerStats;
  }

  get equipment() {
    return this.gameStore.getState().equipment;
  }

  get settings() {
    return this.gameStore.getState().settings;
  }

  get maxInventorySlots(): number {
    return this.gameStore.getState().maxInventorySlots;
  }

  get maxCarryWeight(): number {
    return this.gameStore.getState().maxCarryWeight;
  }

  get totalWeight(): number {
    return this.gameStore.actions().getTotalWeight();
  }

  get isOverweight(): boolean {
    return this.totalWeight > this.maxCarryWeight;
  }

  get filteredItems(): InventoryItem[] {
    if (this.activeFilter === 'all') return this.inventory;
    return this.inventory.filter((item) => item.type === this.activeFilter);
  }

  get itemCounts(): Record<string, number> {
    const counts: Record<string, number> = { all: this.inventory.length };
    this.inventory.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  }

  togglePanel(): void {
    this.gameStore.actions().togglePanel('inventory');
  }

  setFilter(category: FilterCategory): void {
    this.activeFilter = category;
  }

  selectItem(item: InventoryItem): void {
    this.selectedItem = this.selectedItem?.id === item.id ? null : item;
  }

  handleUseItem(id: string): void {
    if (this.settings.haptics && navigator.vibrate) {
      navigator.vibrate(30);
    }
    this.gameStore.actions().useItem(id);
  }

  handleDropItem(id: string): void {
    if (this.settings.haptics && navigator.vibrate) {
      navigator.vibrate(20);
    }
    this.gameStore.actions().dropItem(id);
    if (this.selectedItem?.id === id) {
      this.selectedItem = null;
    }
  }

  handleEquipItem(id: string): void {
    if (this.settings.haptics && navigator.vibrate) {
      navigator.vibrate(30);
    }
    this.gameStore.actions().equipItem(id);
  }

  isItemEquipped(id: string): boolean {
    return Object.values(this.equipment).includes(id as any);
  }

  getItemDetails(itemId: string) {
    return getItem(itemId);
  }

  getItemTypeName(type: string): string {
    return getItemTypeName(type as any);
  }

  getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950';
      case 'rare':
        return 'bg-gradient-to-r from-purple-500 to-violet-500 text-purple-950';
      case 'uncommon':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-green-950';
      default:
        return 'bg-amber-600/80 text-amber-950';
    }
  }

  getRarityBorder(rarity: string): string {
    switch (rarity) {
      case 'legendary':
        return 'border-yellow-500/60 shadow-yellow-500/20 shadow-md';
      case 'rare':
        return 'border-purple-500/60';
      case 'uncommon':
        return 'border-green-500/60';
      default:
        return 'border-amber-700/40';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'weapon':
        return 'text-red-400';
      case 'consumable':
        return 'text-green-400';
      case 'key_item':
        return 'text-yellow-400';
      case 'currency':
        return 'text-amber-400';
      case 'armor':
        return 'text-blue-400';
      default:
        return 'text-amber-500/50';
    }
  }
}
