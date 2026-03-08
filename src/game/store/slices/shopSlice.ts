/**
 * Shop Slice - Shop state and actions
 *
 * Manages shop interactions including buying and selling items.
 *
 * @module game/store/slices/shopSlice
 */

import type { StateCreator } from 'zustand';
import type { InventoryItem, Notification, PlayerStats } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Data access interface for shop operations.
 */
export interface ShopDataAccess {
  getShopById: (shopId: string) => any;
  getItem: (itemId: string) => any;
  calculateBuyPrice: (shop: any, item: any) => number;
  calculateSellPrice: (shop: any, itemDef: any) => number;
  canSellItemToShop: (shop: any, itemType: string) => boolean;
}

/**
 * Shop state.
 */
export interface ShopState {
  /** Active shop ID and owner */
  shopState: { shopId: string; ownerId: string } | null;
}

/**
 * Shop actions.
 */
export interface ShopActions {
  /** Open a shop by ID */
  openShop: (shopId: string) => void;
  /** Close the current shop */
  closeShop: () => void;
  /** Buy an item from the shop */
  buyItem: (itemId: string) => void;
  /** Sell an inventory item to the shop */
  sellItem: (inventoryId: string) => void;
  /** Check if player can afford an item */
  canAfford: (price: number) => boolean;
  /** Reset shop state */
  resetShop: () => void;
}

/**
 * Dependencies from other slices.
 */
export interface ShopSliceDeps {
  addNotification: (type: Notification['type'], message: string) => void;
  playerStats: PlayerStats;
  inventory: InventoryItem[];
  addItemById: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  updatePlayerStats: (stats: Partial<PlayerStats>) => void;
}

/**
 * Complete shop slice type.
 */
export type ShopSlice = ShopState & ShopActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default shop state.
 */
export const DEFAULT_SHOP_STATE: ShopState = {
  shopState: null,
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the shop Zustand slice.
 *
 * @param dataAccess - Data access interface for shop data
 */
export const createShopSlice = (
  dataAccess: ShopDataAccess
): StateCreator<ShopSlice & ShopSliceDeps, [], [], ShopSlice> => {
  return (set, get) => ({
    // State
    ...DEFAULT_SHOP_STATE,

    // Actions
    openShop: (shopId: string) => {
      const shop = dataAccess.getShopById(shopId);
      set({ shopState: { shopId, ownerId: shop?.ownerId ?? 'unknown' } });
    },

    closeShop: () => set({ shopState: null }),

    buyItem: (itemId: string) => {
      const state = get();
      const { shopState, playerStats } = state;
      if (!shopState) return;

      const shop = dataAccess.getShopById(shopState.shopId);
      if (!shop) return;

      const shopItem = shop.inventory.find((item: any) => item.itemId === itemId);
      if (!shopItem) {
        state.addNotification('warning', "That item isn't available here.");
        return;
      }

      if ((shopItem.minReputation ?? -100) > playerStats.reputation) {
        state.addNotification('warning', 'Your reputation is too low.');
        return;
      }

      if (shopItem.stock === 0) {
        state.addNotification('warning', 'That item is sold out.');
        return;
      }

      const itemDef = dataAccess.getItem(itemId);
      if (!itemDef) return;

      const price = dataAccess.calculateBuyPrice(shop, shopItem);

      if (playerStats.gold < price) {
        state.addNotification('warning', "Can't afford that.");
        return;
      }

      // Transaction
      state.updatePlayerStats({ gold: playerStats.gold - price });
      state.addItemById(itemId, 1);
      state.addNotification('item', `Bought ${itemDef.name} for ${price}g`);
    },

    sellItem: (inventoryId: string) => {
      const state = get();
      const { shopState, playerStats, inventory } = state;
      if (!shopState) return;

      const shop = dataAccess.getShopById(shopState.shopId);
      if (!shop) return;

      const item = inventory.find((i) => i.id === inventoryId);
      if (!item) return;

      const itemDef = dataAccess.getItem(item.itemId);
      if (!itemDef) return;

      if (!dataAccess.canSellItemToShop(shop, item.type)) {
        state.addNotification('warning', 'This merchant will not buy that.');
        return;
      }

      if (!itemDef.sellable) {
        state.addNotification('warning', "You can't sell that.");
        return;
      }

      const price = dataAccess.calculateSellPrice(shop, itemDef);

      // Transaction
      state.removeItem(item.itemId, 1);
      state.updatePlayerStats({ gold: playerStats.gold + price });
      state.addNotification('item', `Sold ${item.name} for ${price}g`);
    },

    canAfford: (price: number) => {
      return get().playerStats.gold >= price;
    },

    resetShop: () => set({ shopState: null }),
  });
};
