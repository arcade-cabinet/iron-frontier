/**
 * Equipment Helpers - Equipment slot logic
 *
 * Extracts equipment-related actions from inventorySlice
 * to keep each file under 300 lines.
 *
 * @module game/store/slices/equipmentHelpers
 */

import type {
  EquipmentSlot,
  EquipmentState,
  InventoryItem,
} from '../types';
import type { InventoryDataAccess } from './inventorySlice';

/**
 * Determine the target equipment slot for an item.
 */
export function resolveEquipmentSlot(
  item: InventoryItem,
  def: any,
  slot?: EquipmentSlot
): EquipmentSlot {
  if (slot) return slot;

  if (def?.weaponStats || item.type === 'weapon') {
    return 'weapon';
  }
  if (def?.armorStats) {
    switch (def.armorStats.slot) {
      case 'head':
        return 'head';
      case 'accessory':
        return 'accessory';
      case 'legs':
      case 'body':
      default:
        return 'body';
    }
  }
  return 'accessory';
}

/**
 * Calculate total equipment bonuses from all equipped items.
 */
export function calculateEquipmentBonuses(
  equipment: EquipmentState,
  inventory: InventoryItem[],
  dataAccess: InventoryDataAccess
): { damage: number; defense: number; accuracy: number } {
  const bonuses = { damage: 0, defense: 0, accuracy: 0 };

  Object.values(equipment).forEach((equippedId) => {
    if (!equippedId) return;
    const item = inventory.find((inv) => inv.id === equippedId);
    if (!item) return;
    const def = dataAccess.getItem(item.itemId);
    if (!def) return;

    if (def.weaponStats) {
      bonuses.damage += def.weaponStats.damage;
      bonuses.accuracy += def.weaponStats.accuracy;
    }
    if (def.armorStats) {
      bonuses.defense += def.armorStats.defense;
    }
  });

  return bonuses;
}
