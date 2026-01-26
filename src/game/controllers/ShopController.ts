/**
 * ShopController.ts - Shop interaction coordination for Iron Frontier v2
 *
 * Manages:
 * - Shop inventory display
 * - Buy/sell transactions
 * - Price calculations with reputation
 * - Inventory management
 */

/**
 * Shop item for display
 */
export interface ShopItem {
  itemId: string;
  name: string;
  description: string;
  basePrice: number;
  buyPrice: number;
  sellPrice: number;
  stock: number; // -1 for unlimited
  category: string;
  canAfford: boolean;
  owned: number; // How many player owns
}

/**
 * Shop info
 */
export interface ShopInfo {
  id: string;
  name: string;
  ownerName: string;
  ownerId: string;
  description: string;
  shopType: 'general' | 'weapons' | 'supplies' | 'specialty';
  reputation: number; // Player's reputation with this shop/town
}

/**
 * Transaction result
 */
export interface TransactionResult {
  success: boolean;
  message: string;
  goldChange: number;
  itemId: string;
  quantity: number;
}

/**
 * Shop events
 */
export type ShopEvent =
  | { type: 'shop_opened'; shopId: string; shopName: string }
  | { type: 'shop_closed' }
  | { type: 'item_purchased'; itemId: string; quantity: number; totalCost: number }
  | { type: 'item_sold'; itemId: string; quantity: number; totalValue: number }
  | { type: 'transaction_failed'; reason: string };

/**
 * Controller state
 */
export interface ShopControllerState {
  isOpen: boolean;
  currentShop: ShopInfo | null;
  inventory: ShopItem[];
  playerGold: number;
  selectedCategory: string | null;
}

type ShopEventListener = (event: ShopEvent) => void;

/**
 * Data access for shop controller
 */
export interface ShopControllerDataAccess {
  getShopById: (shopId: string) => ShopInfo | undefined;
  getShopInventory: (shopId: string) => Array<{ itemId: string; stock: number }>;
  getItemInfo: (itemId: string) => { name: string; description: string; baseValue: number; category: string } | undefined;
  getPlayerGold: () => number;
  getPlayerItemCount: (itemId: string) => number;
  getPlayerReputation: (shopId: string) => number;
  addPlayerGold: (amount: number) => void;
  removePlayerGold: (amount: number) => boolean;
  addPlayerItem: (itemId: string, quantity: number) => void;
  removePlayerItem: (itemId: string, quantity: number) => boolean;
  updateShopStock: (shopId: string, itemId: string, change: number) => void;
}

export class ShopController {
  private state: ShopControllerState = {
    isOpen: false,
    currentShop: null,
    inventory: [],
    playerGold: 0,
    selectedCategory: null,
  };

  private eventListeners: Set<ShopEventListener> = new Set();
  private dataAccess: ShopControllerDataAccess;

  // Price modifiers
  private readonly BASE_MARKUP = 1.2; // 20% markup on buy prices
  private readonly BASE_MARKDOWN = 0.5; // 50% of value for sell prices
  private readonly REP_DISCOUNT_MAX = 0.15; // Max 15% discount from reputation

  constructor(dataAccess: ShopControllerDataAccess) {
    this.dataAccess = dataAccess;
    console.log('[ShopController] Initialized');
  }

  /**
   * Open a shop
   */
  public openShop(shopId: string): boolean {
    if (this.state.isOpen) {
      console.warn('[ShopController] Shop already open');
      return false;
    }

    const shop = this.dataAccess.getShopById(shopId);
    if (!shop) {
      console.error(`[ShopController] Shop not found: ${shopId}`);
      return false;
    }

    const reputation = this.dataAccess.getPlayerReputation(shopId);
    const shopInfo: ShopInfo = { ...shop, reputation };

    this.state = {
      isOpen: true,
      currentShop: shopInfo,
      inventory: this.buildInventory(shopId, reputation),
      playerGold: this.dataAccess.getPlayerGold(),
      selectedCategory: null,
    };

    this.emitEvent({ type: 'shop_opened', shopId, shopName: shop.name });
    console.log(`[ShopController] Opened shop: ${shop.name}`);

    return true;
  }

  /**
   * Close the current shop
   */
  public closeShop(): void {
    if (!this.state.isOpen) return;

    this.emitEvent({ type: 'shop_closed' });

    this.state = {
      isOpen: false,
      currentShop: null,
      inventory: [],
      playerGold: 0,
      selectedCategory: null,
    };

    console.log('[ShopController] Shop closed');
  }

  /**
   * Buy an item from the shop
   */
  public buyItem(itemId: string, quantity: number = 1): TransactionResult {
    if (!this.state.isOpen || !this.state.currentShop) {
      return { success: false, message: 'No shop open', goldChange: 0, itemId, quantity: 0 };
    }

    const item = this.state.inventory.find((i) => i.itemId === itemId);
    if (!item) {
      this.emitEvent({ type: 'transaction_failed', reason: 'Item not found' });
      return { success: false, message: 'Item not found', goldChange: 0, itemId, quantity: 0 };
    }

    // Check stock
    if (item.stock !== -1 && item.stock < quantity) {
      this.emitEvent({ type: 'transaction_failed', reason: 'Not enough stock' });
      return { success: false, message: 'Not enough stock', goldChange: 0, itemId, quantity: 0 };
    }

    const totalCost = item.buyPrice * quantity;

    // Check gold
    if (!this.dataAccess.removePlayerGold(totalCost)) {
      this.emitEvent({ type: 'transaction_failed', reason: 'Not enough gold' });
      return { success: false, message: 'Not enough gold', goldChange: 0, itemId, quantity: 0 };
    }

    // Add item to player
    this.dataAccess.addPlayerItem(itemId, quantity);

    // Update shop stock
    if (item.stock !== -1) {
      this.dataAccess.updateShopStock(this.state.currentShop.id, itemId, -quantity);
    }

    // Refresh state
    this.refreshInventory();

    this.emitEvent({ type: 'item_purchased', itemId, quantity, totalCost });
    console.log(`[ShopController] Purchased ${quantity}x ${item.name} for ${totalCost} gold`);

    return {
      success: true,
      message: `Purchased ${quantity}x ${item.name}`,
      goldChange: -totalCost,
      itemId,
      quantity,
    };
  }

  /**
   * Sell an item to the shop
   */
  public sellItem(itemId: string, quantity: number = 1): TransactionResult {
    if (!this.state.isOpen || !this.state.currentShop) {
      return { success: false, message: 'No shop open', goldChange: 0, itemId, quantity: 0 };
    }

    // Check player has item
    const owned = this.dataAccess.getPlayerItemCount(itemId);
    if (owned < quantity) {
      this.emitEvent({ type: 'transaction_failed', reason: 'Not enough items' });
      return { success: false, message: 'Not enough items', goldChange: 0, itemId, quantity: 0 };
    }

    // Get item info for sell price
    const itemInfo = this.dataAccess.getItemInfo(itemId);
    if (!itemInfo) {
      this.emitEvent({ type: 'transaction_failed', reason: 'Unknown item' });
      return { success: false, message: 'Unknown item', goldChange: 0, itemId, quantity: 0 };
    }

    const sellPrice = this.calculateSellPrice(itemInfo.baseValue, this.state.currentShop.reputation);
    const totalValue = sellPrice * quantity;

    // Remove item from player
    if (!this.dataAccess.removePlayerItem(itemId, quantity)) {
      this.emitEvent({ type: 'transaction_failed', reason: 'Failed to remove item' });
      return { success: false, message: 'Failed to remove item', goldChange: 0, itemId, quantity: 0 };
    }

    // Add gold to player
    this.dataAccess.addPlayerGold(totalValue);

    // Refresh state
    this.refreshInventory();

    this.emitEvent({ type: 'item_sold', itemId, quantity, totalValue });
    console.log(`[ShopController] Sold ${quantity}x ${itemInfo.name} for ${totalValue} gold`);

    return {
      success: true,
      message: `Sold ${quantity}x ${itemInfo.name}`,
      goldChange: totalValue,
      itemId,
      quantity,
    };
  }

  /**
   * Set selected category filter
   */
  public setCategory(category: string | null): void {
    this.state.selectedCategory = category;
  }

  /**
   * Get filtered inventory
   */
  public getFilteredInventory(): ShopItem[] {
    if (!this.state.selectedCategory) {
      return this.state.inventory;
    }
    return this.state.inventory.filter((item) => item.category === this.state.selectedCategory);
  }

  /**
   * Get available categories
   */
  public getCategories(): string[] {
    const categories = new Set(this.state.inventory.map((item) => item.category));
    return Array.from(categories).sort();
  }

  /**
   * Get current state
   */
  public getState(): ShopControllerState {
    return { ...this.state };
  }

  /**
   * Check if shop is open
   */
  public isOpen(): boolean {
    return this.state.isOpen;
  }

  /**
   * Subscribe to shop events
   */
  public onEvent(listener: ShopEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * Build shop inventory with calculated prices
   */
  private buildInventory(shopId: string, reputation: number): ShopItem[] {
    const rawInventory = this.dataAccess.getShopInventory(shopId);
    const playerGold = this.dataAccess.getPlayerGold();

    return rawInventory
      .map((entry) => {
        const itemInfo = this.dataAccess.getItemInfo(entry.itemId);
        if (!itemInfo) return null;

        const buyPrice = this.calculateBuyPrice(itemInfo.baseValue, reputation);
        const sellPrice = this.calculateSellPrice(itemInfo.baseValue, reputation);

        return {
          itemId: entry.itemId,
          name: itemInfo.name,
          description: itemInfo.description,
          basePrice: itemInfo.baseValue,
          buyPrice,
          sellPrice,
          stock: entry.stock,
          category: itemInfo.category,
          canAfford: playerGold >= buyPrice,
          owned: this.dataAccess.getPlayerItemCount(entry.itemId),
        };
      })
      .filter((item): item is ShopItem => item !== null);
  }

  /**
   * Calculate buy price with reputation modifier
   */
  private calculateBuyPrice(baseValue: number, reputation: number): number {
    // Reputation 0-100, higher = better prices
    const repDiscount = (reputation / 100) * this.REP_DISCOUNT_MAX;
    const markup = this.BASE_MARKUP - repDiscount;
    return Math.round(baseValue * markup);
  }

  /**
   * Calculate sell price with reputation modifier
   */
  private calculateSellPrice(baseValue: number, reputation: number): number {
    // Reputation 0-100, higher = better prices
    const repBonus = (reputation / 100) * (this.REP_DISCOUNT_MAX / 2);
    const markdown = this.BASE_MARKDOWN + repBonus;
    return Math.round(baseValue * markdown);
  }

  /**
   * Refresh inventory after transaction
   */
  private refreshInventory(): void {
    if (!this.state.currentShop) return;

    this.state.playerGold = this.dataAccess.getPlayerGold();
    this.state.inventory = this.buildInventory(
      this.state.currentShop.id,
      this.state.currentShop.reputation
    );
  }

  /**
   * Emit shop event
   */
  private emitEvent(event: ShopEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[ShopController] Event listener error:', err);
      }
    });
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.eventListeners.clear();
    this.state = {
      isOpen: false,
      currentShop: null,
      inventory: [],
      playerGold: 0,
      selectedCategory: null,
    };
    console.log('[ShopController] Disposed');
  }
}

// Factory function
export function createShopController(dataAccess: ShopControllerDataAccess): ShopController {
  return new ShopController(dataAccess);
}
