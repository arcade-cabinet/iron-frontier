/**
 * Item Pools - Location-type-specific item spawn pools
 */

import type { WorldItemSpawn } from '../../items/worldItems';
import { SeededRandom } from '../seededRandom';

/**
 * Item pools based on location type
 * Location types match NPC template validLocationTypes
 */
const ITEM_POOLS: Record<string, { id: string; weight: number; quantity: [number, number] }[]> = {
  town: [
    { id: 'bandage', weight: 20, quantity: [1, 2] },
    { id: 'whiskey', weight: 15, quantity: [1, 1] },
    { id: 'revolver_ammo', weight: 25, quantity: [6, 12] },
    { id: 'rifle_ammo', weight: 15, quantity: [5, 10] },
    { id: 'lockpick', weight: 10, quantity: [1, 3] },
    { id: 'tobacco', weight: 10, quantity: [1, 2] },
    { id: 'gold_nugget', weight: 5, quantity: [1, 1] },
  ],
  city: [
    { id: 'bandage', weight: 15, quantity: [1, 3] },
    { id: 'whiskey', weight: 10, quantity: [1, 2] },
    { id: 'revolver_ammo', weight: 20, quantity: [6, 12] },
    { id: 'rifle_ammo', weight: 15, quantity: [5, 10] },
    { id: 'lockpick', weight: 15, quantity: [1, 3] },
    { id: 'tobacco', weight: 10, quantity: [1, 2] },
    { id: 'gold_nugget', weight: 10, quantity: [1, 2] },
    { id: 'pocket_watch', weight: 5, quantity: [1, 1] },
  ],
  mine: [
    { id: 'pickaxe', weight: 15, quantity: [1, 1] },
    { id: 'gold_nugget', weight: 25, quantity: [1, 3] },
    { id: 'dynamite', weight: 10, quantity: [1, 2] },
    { id: 'bandage', weight: 20, quantity: [1, 2] },
    { id: 'lantern_oil', weight: 15, quantity: [1, 2] },
    { id: 'rope', weight: 10, quantity: [1, 1] },
    { id: 'canteen', weight: 5, quantity: [1, 1] },
  ],
  ruin: [
    { id: 'gold_nugget', weight: 20, quantity: [1, 2] },
    { id: 'old_letter', weight: 15, quantity: [1, 1] },
    { id: 'revolver_ammo', weight: 20, quantity: [3, 8] },
    { id: 'bandage', weight: 15, quantity: [1, 3] },
    { id: 'whiskey', weight: 15, quantity: [1, 2] },
    { id: 'lockpick', weight: 10, quantity: [1, 2] },
    { id: 'mysterious_key', weight: 5, quantity: [1, 1] },
  ],
  ranch: [
    { id: 'rope', weight: 20, quantity: [1, 2] },
    { id: 'bandage', weight: 15, quantity: [1, 2] },
    { id: 'rifle_ammo', weight: 15, quantity: [5, 10] },
    { id: 'canteen', weight: 15, quantity: [1, 1] },
    { id: 'dried_meat', weight: 20, quantity: [1, 3] },
    { id: 'tobacco', weight: 10, quantity: [1, 2] },
    { id: 'horseshoe', weight: 5, quantity: [1, 1] },
  ],
  outpost: [
    { id: 'revolver_ammo', weight: 25, quantity: [6, 12] },
    { id: 'bandage', weight: 20, quantity: [1, 2] },
    { id: 'canteen', weight: 15, quantity: [1, 1] },
    { id: 'rope', weight: 15, quantity: [1, 1] },
    { id: 'lantern_oil', weight: 15, quantity: [1, 2] },
    { id: 'whiskey', weight: 10, quantity: [1, 1] },
  ],
  camp: [
    { id: 'bandage', weight: 25, quantity: [1, 2] },
    { id: 'dried_meat', weight: 20, quantity: [1, 2] },
    { id: 'canteen', weight: 20, quantity: [1, 1] },
    { id: 'revolver_ammo', weight: 15, quantity: [3, 6] },
    { id: 'tobacco', weight: 15, quantity: [1, 1] },
    { id: 'bedroll', weight: 5, quantity: [1, 1] },
  ],
};

/**
 * Generate world items for a location
 */
export function generateWorldItems(
  rng: SeededRandom,
  locationId: string,
  locationType: string,
  count: number
): WorldItemSpawn[] {
  const items: WorldItemSpawn[] = [];

  const pool = ITEM_POOLS[locationType] || ITEM_POOLS['town'];
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);

  for (let i = 0; i < count; i++) {
    // Weighted random selection
    let roll = rng.float(0, totalWeight);
    let selected = pool[0];
    for (const item of pool) {
      roll -= item.weight;
      if (roll <= 0) {
        selected = item;
        break;
      }
    }

    // Random position (sparse spread)
    const angle = rng.float(0, Math.PI * 2);
    const radius = rng.float(3, 10);
    const q = Math.round(Math.cos(angle) * radius);
    const r = Math.round(Math.sin(angle) * radius);

    const quantity = rng.int(selected.quantity[0], selected.quantity[1]);

    items.push({
      id: `proc_item_${locationId}_${i}`,
      itemId: selected.id,
      coord: { q, r },
      quantity,
    });
  }

  return items;
}
