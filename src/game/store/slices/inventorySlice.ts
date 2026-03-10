/**
 * Inventory Slice - Inventory and equipment state
 *
 * Manages player inventory, equipment slots, and related actions.
 *
 * @module game/store/slices/inventorySlice
 */

import type { StateCreator } from 'zustand';
import type { EquipmentSlot, EquipmentState, InventoryItem, Notification } from '../types';
import type { ItemEffect } from '../../data/schemas/item';
import { calculateEquipmentBonuses, resolveEquipmentSlot } from './equipmentHelpers';
import { scopedRNG, rngTick } from '../../lib/prng';

// ============================================================================
// TYPES
// ============================================================================

export interface InventoryDataAccess {
  getItem: (itemId: string) => any;
}

export interface InventoryState {
  inventory: InventoryItem[];
  maxInventorySlots: number;
  maxCarryWeight: number;
  equipment: EquipmentState;
}

export interface InventoryActions {
  addItem: (item: InventoryItem) => void;
  addItemById: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  removeItemByInstanceId: (instanceId: string, quantity?: number) => void;
  useItem: (instanceId: string) => void;
  dropItem: (instanceId: string) => void;
  getItemCount: (itemId: string) => number;
  getTotalWeight: () => number;
  equipItem: (inventoryItemId: string, slot?: EquipmentSlot) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  getEquippedItem: (slot: EquipmentSlot) => InventoryItem | null;
  getEquipmentBonuses: () => { damage: number; defense: number; accuracy: number };
  resetInventory: () => void;
}

export interface InventorySliceDeps {
  addNotification: (type: Notification['type'], message: string) => void;
  heal: (amount: number) => void;
  takeDamage: (amount: number) => void;
  updatePlayerStats: (stats: any) => void;
  playerStats: any;
  playerPosition: any;
  worldItems: Record<string, any>;
}

export type InventorySlice = InventoryState & InventoryActions;

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_EQUIPMENT: EquipmentState = {
  weapon: null, offhand: null, head: null, body: null, accessory: null,
};

export const DEFAULT_INVENTORY_STATE: InventoryState = {
  inventory: [],
  maxInventorySlots: 20,
  maxCarryWeight: 50,
  equipment: DEFAULT_EQUIPMENT,
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

export const createInventorySlice = (
  dataAccess: InventoryDataAccess
): StateCreator<InventorySlice & InventorySliceDeps, [], [], InventorySlice> => {
  return (set, get) => ({
    ...DEFAULT_INVENTORY_STATE,

    addItem: (item: InventoryItem) => {
      const state = get();
      const currentWeight = state.getTotalWeight();
      const projectedWeight = currentWeight + item.weight * item.quantity;
      const itemDef = dataAccess.getItem(item.itemId);
      const canStack = itemDef?.stackable ?? true;
      const existingItem = canStack
        ? state.inventory.find((i) => i.itemId === item.itemId && i.condition === item.condition)
        : undefined;

      if (!existingItem && state.inventory.length >= state.maxInventorySlots) {
        state.addNotification('warning', 'Inventory full.');
        return;
      }

      set((s) => {
        if (existingItem) {
          return { inventory: s.inventory.map((i) => i.id === existingItem.id ? { ...i, quantity: i.quantity + item.quantity } : i) };
        }
        return { inventory: [...s.inventory, item] };
      });

      state.addNotification('item', `Added ${item.quantity}x ${item.name}`);
      if (projectedWeight > state.maxCarryWeight) {
        state.addNotification('warning', 'Over-encumbered: movement slowed.');
      }
    },

    addItemById: (itemId: string, quantity = 1) => {
      const def = dataAccess.getItem(itemId);
      if (!def) return;

      const maxStack = def.maxStack ?? 99;
      const stackable = def.stackable ?? true;
      const makeItem = (stackQty: number): InventoryItem => ({
        id: `item_${itemId}_${Date.now()}_${scopedRNG('store', 42, rngTick())}`,
        itemId: def.id, name: def.name, rarity: def.rarity, quantity: stackQty,
        description: def.description, usable: def.usable, condition: 100,
        weight: def.weight ?? 0.1, type: def.category, droppable: def.droppable ?? true,
      });

      if (!stackable) { for (let i = 0; i < quantity; i += 1) get().addItem(makeItem(1)); return; }
      let remaining = quantity;
      while (remaining > 0) { const sq = Math.min(remaining, maxStack); get().addItem(makeItem(sq)); remaining -= sq; }
    },

    removeItem: (itemId: string, quantity = 1) => {
      set((state) => {
        const idx = state.inventory.findIndex((i) => i.itemId === itemId);
        if (idx === -1) return state;
        const item = state.inventory[idx];
        if (item.quantity > quantity) {
          const inv = [...state.inventory];
          inv[idx] = { ...item, quantity: item.quantity - quantity };
          return { inventory: inv };
        }
        return { inventory: state.inventory.filter((_, i) => i !== idx) };
      });
    },

    removeItemByInstanceId: (instanceId: string, quantity = 1) => {
      set((state) => {
        const idx = state.inventory.findIndex((i) => i.id === instanceId);
        if (idx === -1) return state;
        const item = state.inventory[idx];
        if (item.quantity > quantity) {
          const inv = [...state.inventory];
          inv[idx] = { ...item, quantity: item.quantity - quantity };
          return { inventory: inv };
        }
        return { inventory: state.inventory.filter((_, i) => i !== idx) };
      });
    },

    useItem: (instanceId: string) => {
      const state = get();
      const item = state.inventory.find((i) => i.id === instanceId);
      if (!item || !item.usable) return;
      const def = dataAccess.getItem(item.itemId);
      if (!def?.effects?.length) return;

      def.effects.forEach((effect: ItemEffect) => {
        switch (effect.type) {
          case 'heal': state.heal(effect.value); break;
          case 'stamina': state.updatePlayerStats({ stamina: Math.min(state.playerStats.maxStamina, state.playerStats.stamina + effect.value) }); break;
          case 'damage': state.takeDamage(effect.value); break;
          case 'buff': state.addNotification('info', `Buff applied: ${effect.buffType ?? 'unknown'}`); break;
          default: break;
        }
      });

      set((s) => {
        if (item.quantity > 1) return { inventory: s.inventory.map((i) => i.id === instanceId ? { ...i, quantity: i.quantity - 1 } : i) };
        return { inventory: s.inventory.filter((i) => i.id !== instanceId) };
      });
      state.addNotification('info', `Used ${item.name}`);
    },

    dropItem: (instanceId: string) => {
      const state = get();
      const item = state.inventory.find((i) => i.id === instanceId);
      if (!item) return;
      if (!item.droppable) { state.addNotification('warning', "You can't drop that."); return; }
      set((s) => ({ inventory: s.inventory.filter((i) => i.id !== instanceId) }));
      state.addNotification('info', `Dropped ${item.name}`);
    },

    getItemCount: (itemId: string) =>
      get().inventory.reduce((t, i) => (i.itemId === itemId ? t + i.quantity : t), 0),

    getTotalWeight: () =>
      get().inventory.reduce((t, i) => t + i.weight * i.quantity, 0),

    equipItem: (inventoryItemId: string, slot?: EquipmentSlot) => {
      const item = get().inventory.find((i) => i.id === inventoryItemId);
      if (!item) return;
      const def = dataAccess.getItem(item.itemId);
      const targetSlot = resolveEquipmentSlot(item, def, slot);
      set((s) => ({ equipment: { ...s.equipment, [targetSlot]: inventoryItemId } }));
    },

    unequipItem: (slot: EquipmentSlot) =>
      set((s) => ({ equipment: { ...s.equipment, [slot]: null } })),

    getEquippedItem: (slot: EquipmentSlot) => {
      const id = get().equipment[slot];
      if (!id) return null;
      return get().inventory.find((i) => i.id === id) || null;
    },

    getEquipmentBonuses: () =>
      calculateEquipmentBonuses(get().equipment, get().inventory, dataAccess),

    resetInventory: () => set({ ...DEFAULT_INVENTORY_STATE }),
  });
};
