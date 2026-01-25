/**
 * InventoryController.ts - Player inventory management for Iron Frontier v2
 *
 * Manages:
 * - Item storage and organization
 * - Equipment slots
 * - Item usage
 * - Quick slots
 */

/**
 * Item categories
 */
export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'consumable'
  | 'provision'
  | 'material'
  | 'quest'
  | 'key'
  | 'misc';

/**
 * Equipment slots
 */
export type EquipmentSlot =
  | 'mainHand'
  | 'offHand'
  | 'head'
  | 'body'
  | 'legs'
  | 'accessory1'
  | 'accessory2';

/**
 * Inventory item
 */
export interface InventoryItem {
  itemId: string;
  name: string;
  description: string;
  category: ItemCategory;
  quantity: number;
  maxStack: number;
  value: number;
  weight: number;
  isEquippable: boolean;
  isConsumable: boolean;
  isQuestItem: boolean;
  equipSlot?: EquipmentSlot;
  effects?: ItemEffect[];
}

/**
 * Item effect
 */
export interface ItemEffect {
  type: 'heal_hp' | 'heal_stamina' | 'restore_food' | 'restore_water' |
        'buff_attack' | 'buff_defense' | 'cure_status' | 'damage';
  value: number;
  duration?: number; // In game minutes, for buffs
}

/**
 * Equipment loadout
 */
export interface Equipment {
  mainHand: string | null;
  offHand: string | null;
  head: string | null;
  body: string | null;
  legs: string | null;
  accessory1: string | null;
  accessory2: string | null;
}

/**
 * Inventory events
 */
export type InventoryEvent =
  | { type: 'item_added'; itemId: string; quantity: number; newTotal: number }
  | { type: 'item_removed'; itemId: string; quantity: number; newTotal: number }
  | { type: 'item_used'; itemId: string; effects: ItemEffect[] }
  | { type: 'item_equipped'; itemId: string; slot: EquipmentSlot; previousItemId: string | null }
  | { type: 'item_unequipped'; itemId: string; slot: EquipmentSlot }
  | { type: 'inventory_full' }
  | { type: 'quick_slot_set'; slotIndex: number; itemId: string | null };

/**
 * Controller state
 */
export interface InventoryControllerState {
  items: InventoryItem[];
  equipment: Equipment;
  quickSlots: (string | null)[];
  maxSlots: number;
  currentWeight: number;
  maxWeight: number;
  selectedCategory: ItemCategory | null;
}

type InventoryEventListener = (event: InventoryEvent) => void;

/**
 * Data access for inventory controller
 */
export interface InventoryControllerDataAccess {
  getItemDefinition: (itemId: string) => Omit<InventoryItem, 'quantity'> | undefined;
  applyItemEffects: (effects: ItemEffect[]) => void;
  getEquipmentStats: (itemId: string) => { attack?: number; defense?: number; speed?: number } | undefined;
}

export class InventoryController {
  private state: InventoryControllerState;
  private eventListeners: Set<InventoryEventListener> = new Set();
  private dataAccess: InventoryControllerDataAccess;

  constructor(dataAccess: InventoryControllerDataAccess, maxSlots: number = 30, maxWeight: number = 100) {
    this.dataAccess = dataAccess;
    this.state = {
      items: [],
      equipment: {
        mainHand: null,
        offHand: null,
        head: null,
        body: null,
        legs: null,
        accessory1: null,
        accessory2: null,
      },
      quickSlots: [null, null, null, null], // 4 quick slots
      maxSlots,
      currentWeight: 0,
      maxWeight,
      selectedCategory: null,
    };
    console.log('[InventoryController] Initialized');
  }

  /**
   * Add item to inventory
   */
  public addItem(itemId: string, quantity: number = 1): boolean {
    const definition = this.dataAccess.getItemDefinition(itemId);
    if (!definition) {
      console.error(`[InventoryController] Unknown item: ${itemId}`);
      return false;
    }

    // Check weight
    const additionalWeight = definition.weight * quantity;
    if (this.state.currentWeight + additionalWeight > this.state.maxWeight) {
      this.emitEvent({ type: 'inventory_full' });
      return false;
    }

    // Find existing stack
    const existingItem = this.state.items.find((i) => i.itemId === itemId);

    if (existingItem) {
      // Add to existing stack
      const canAdd = Math.min(quantity, existingItem.maxStack - existingItem.quantity);
      if (canAdd <= 0) {
        // Need new stack
        if (this.state.items.length >= this.state.maxSlots) {
          this.emitEvent({ type: 'inventory_full' });
          return false;
        }
        this.state.items.push({ ...definition, quantity });
      } else {
        existingItem.quantity += canAdd;
        // If couldn't add all, create new stack for remainder
        const remainder = quantity - canAdd;
        if (remainder > 0) {
          if (this.state.items.length >= this.state.maxSlots) {
            // Partial add
            this.state.currentWeight += definition.weight * canAdd;
            this.emitEvent({ type: 'item_added', itemId, quantity: canAdd, newTotal: existingItem.quantity });
            return true;
          }
          this.state.items.push({ ...definition, quantity: remainder });
        }
      }
    } else {
      // New item
      if (this.state.items.length >= this.state.maxSlots) {
        this.emitEvent({ type: 'inventory_full' });
        return false;
      }
      this.state.items.push({ ...definition, quantity });
    }

    this.state.currentWeight += additionalWeight;
    const newTotal = this.getItemCount(itemId);
    this.emitEvent({ type: 'item_added', itemId, quantity, newTotal });

    return true;
  }

  /**
   * Remove item from inventory
   */
  public removeItem(itemId: string, quantity: number = 1): boolean {
    const itemIndex = this.state.items.findIndex((i) => i.itemId === itemId);
    if (itemIndex === -1) return false;

    const item = this.state.items[itemIndex];
    if (item.quantity < quantity) return false;

    item.quantity -= quantity;
    this.state.currentWeight -= item.weight * quantity;

    if (item.quantity <= 0) {
      this.state.items.splice(itemIndex, 1);
      // Clear from quick slots if removed
      this.state.quickSlots = this.state.quickSlots.map((slot) =>
        slot === itemId ? null : slot
      );
    }

    const newTotal = this.getItemCount(itemId);
    this.emitEvent({ type: 'item_removed', itemId, quantity, newTotal });

    return true;
  }

  /**
   * Use a consumable item
   */
  public useItem(itemId: string): boolean {
    const item = this.state.items.find((i) => i.itemId === itemId);
    if (!item) {
      console.warn(`[InventoryController] Item not found: ${itemId}`);
      return false;
    }

    if (!item.isConsumable) {
      console.warn(`[InventoryController] Item not consumable: ${itemId}`);
      return false;
    }

    // Apply effects
    if (item.effects && item.effects.length > 0) {
      this.dataAccess.applyItemEffects(item.effects);
      this.emitEvent({ type: 'item_used', itemId, effects: item.effects });
    }

    // Remove one from stack
    this.removeItem(itemId, 1);

    return true;
  }

  /**
   * Equip an item
   */
  public equipItem(itemId: string): boolean {
    const item = this.state.items.find((i) => i.itemId === itemId);
    if (!item || !item.isEquippable || !item.equipSlot) {
      return false;
    }

    const slot = item.equipSlot;
    const previousItemId = this.state.equipment[slot];

    // Equip new item
    this.state.equipment[slot] = itemId;

    this.emitEvent({ type: 'item_equipped', itemId, slot, previousItemId });
    console.log(`[InventoryController] Equipped ${item.name} to ${slot}`);

    return true;
  }

  /**
   * Unequip an item from a slot
   */
  public unequipSlot(slot: EquipmentSlot): boolean {
    const itemId = this.state.equipment[slot];
    if (!itemId) return false;

    this.state.equipment[slot] = null;
    this.emitEvent({ type: 'item_unequipped', itemId, slot });

    return true;
  }

  /**
   * Set a quick slot
   */
  public setQuickSlot(slotIndex: number, itemId: string | null): boolean {
    if (slotIndex < 0 || slotIndex >= this.state.quickSlots.length) {
      return false;
    }

    // If setting an item, verify it exists and is consumable
    if (itemId) {
      const item = this.state.items.find((i) => i.itemId === itemId);
      if (!item || !item.isConsumable) {
        return false;
      }
    }

    this.state.quickSlots[slotIndex] = itemId;
    this.emitEvent({ type: 'quick_slot_set', slotIndex, itemId });

    return true;
  }

  /**
   * Use item from quick slot
   */
  public useQuickSlot(slotIndex: number): boolean {
    const itemId = this.state.quickSlots[slotIndex];
    if (!itemId) return false;
    return this.useItem(itemId);
  }

  /**
   * Get item count
   */
  public getItemCount(itemId: string): number {
    return this.state.items
      .filter((i) => i.itemId === itemId)
      .reduce((sum, i) => sum + i.quantity, 0);
  }

  /**
   * Check if player has item
   */
  public hasItem(itemId: string, quantity: number = 1): boolean {
    return this.getItemCount(itemId) >= quantity;
  }

  /**
   * Get items by category
   */
  public getItemsByCategory(category: ItemCategory): InventoryItem[] {
    return this.state.items.filter((i) => i.category === category);
  }

  /**
   * Set category filter
   */
  public setCategory(category: ItemCategory | null): void {
    this.state.selectedCategory = category;
  }

  /**
   * Get filtered items
   */
  public getFilteredItems(): InventoryItem[] {
    if (!this.state.selectedCategory) {
      return this.state.items;
    }
    return this.getItemsByCategory(this.state.selectedCategory);
  }

  /**
   * Get equipment stats total
   */
  public getEquipmentStats(): { attack: number; defense: number; speed: number } {
    let attack = 0;
    let defense = 0;
    let speed = 0;

    for (const itemId of Object.values(this.state.equipment)) {
      if (itemId) {
        const stats = this.dataAccess.getEquipmentStats(itemId);
        if (stats) {
          attack += stats.attack ?? 0;
          defense += stats.defense ?? 0;
          speed += stats.speed ?? 0;
        }
      }
    }

    return { attack, defense, speed };
  }

  /**
   * Get current state
   */
  public getState(): InventoryControllerState {
    return {
      ...this.state,
      items: [...this.state.items],
      equipment: { ...this.state.equipment },
      quickSlots: [...this.state.quickSlots],
    };
  }

  /**
   * Get weight info
   */
  public getWeightInfo(): { current: number; max: number; percent: number } {
    return {
      current: this.state.currentWeight,
      max: this.state.maxWeight,
      percent: (this.state.currentWeight / this.state.maxWeight) * 100,
    };
  }

  /**
   * Subscribe to inventory events
   */
  public onEvent(listener: InventoryEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * Load inventory from save data
   */
  public loadFromSave(data: {
    items: Array<{ itemId: string; quantity: number }>;
    equipment: Equipment;
    quickSlots: (string | null)[];
  }): void {
    this.state.items = [];
    this.state.currentWeight = 0;

    for (const { itemId, quantity } of data.items) {
      this.addItem(itemId, quantity);
    }

    this.state.equipment = { ...data.equipment };
    this.state.quickSlots = [...data.quickSlots];
  }

  /**
   * Get save data
   */
  public getSaveData(): {
    items: Array<{ itemId: string; quantity: number }>;
    equipment: Equipment;
    quickSlots: (string | null)[];
  } {
    return {
      items: this.state.items.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
      equipment: { ...this.state.equipment },
      quickSlots: [...this.state.quickSlots],
    };
  }

  /**
   * Emit event
   */
  private emitEvent(event: InventoryEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[InventoryController] Event listener error:', err);
      }
    });
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.eventListeners.clear();
    console.log('[InventoryController] Disposed');
  }
}

// Factory function
export function createInventoryController(
  dataAccess: InventoryControllerDataAccess,
  maxSlots?: number,
  maxWeight?: number
): InventoryController {
  return new InventoryController(dataAccess, maxSlots, maxWeight);
}
