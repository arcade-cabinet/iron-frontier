import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { getItem } from '@/data/items';
import { getRarityColor } from '@/data/schemas/item';
import {
  calculateBuyPrice,
  calculateSellPrice,
  canSellItemToShop,
  getAvailableShopItems,
  getShopById,
  type ShopDefinition,
  type ShopItem,
} from '@/data/shops';
import type { InventoryItem } from '@/store';
import { GameStoreService } from '../services/game-store.service';

@Component({
  selector: 'app-shop-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-panel.component.html',
  styleUrls: ['./shop-panel.component.scss'],
})
export class ShopPanelComponent {
  activeTab: 'buy' | 'sell' = 'buy';

  constructor(readonly gameStore: GameStoreService) {}

  get shopState() {
    return this.gameStore.getState().shopState;
  }

  get shop(): ShopDefinition | null {
    const shopId = this.shopState?.shopId;
    return shopId ? getShopById(shopId) ?? null : null;
  }

  get availableItems(): ShopItem[] {
    if (!this.shop) return [];
    return getAvailableShopItems(this.shop, this.playerStats.reputation);
  }

  get playerStats() {
    return this.gameStore.getState().playerStats;
  }

  get inventory(): InventoryItem[] {
    return this.gameStore.getState().inventory;
  }

  get rarityBadgeClass() {
    return (rarity: string) => {
      const styles: Record<string, string> = {
        legendary: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
        rare: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
        uncommon: 'bg-green-500/20 text-green-400 border-green-500/40',
        common: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      };
      return styles[rarity] ?? styles['common'];
    };
  }

  getRarityColor(itemId: string): string {
    const def = getItem(itemId);
    return def ? getRarityColor(def.rarity) : '#fbbf24';
  }

  getItemDef(itemId: string) {
    return getItem(itemId);
  }

  calculateBuyPrice(shopItem: ShopItem): number {
    if (!this.shop) return 0;
    return calculateBuyPrice(this.shop, shopItem);
  }

  calculateSellPrice(item: InventoryItem): number {
    if (!this.shop) return 0;
    const def = getItem(item.itemId);
    if (!def) return 0;
    return calculateSellPrice(this.shop, def);
  }

  canSellItem(item: InventoryItem): boolean {
    if (!this.shop) return false;
    const def = getItem(item.itemId);
    if (!def) return false;
    return canSellItemToShop(this.shop, item.type) && def.sellable;
  }

  canAfford(shopItem: ShopItem): boolean {
    return this.playerStats.gold >= this.calculateBuyPrice(shopItem);
  }

  buyItem(itemId: string): void {
    this.gameStore.actions().buyItem(itemId);
  }

  sellItem(inventoryId: string): void {
    this.gameStore.actions().sellItem(inventoryId);
  }

  closeShop(): void {
    this.gameStore.actions().closeShop();
  }
}
