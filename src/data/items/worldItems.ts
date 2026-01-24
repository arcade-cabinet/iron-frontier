/**
 * World Item Spawns - Iron Frontier
 *
 * Defines items that can be found in the world at specific locations.
 * These are collectible items placed at hex coordinates within locations.
 */

import type { WorldItem } from '../../engine/types';
import type { HexCoord } from '../../engine/hex/HexTypes';

export interface WorldItemSpawn {
  id: string;
  itemId: string;
  coord: HexCoord;
  quantity: number;
}

/**
 * World item spawns organized by location
 */
export const WORLD_ITEMS_BY_LOCATION: Record<string, WorldItemSpawn[]> = {
  // Dusty Springs - Starter Town
  dusty_springs: [
    // Near the sheriff's office - some basic supplies
    { id: 'ds_bandages_1', itemId: 'bandages', coord: { q: 15, r: 17 }, quantity: 2 },
    { id: 'ds_whiskey_1', itemId: 'whiskey', coord: { q: 17, r: 19 }, quantity: 1 },

    // Near Doc Chen's office - medical supplies
    { id: 'ds_laudanum_1', itemId: 'laudanum', coord: { q: 25, r: 17 }, quantity: 1 },
    { id: 'ds_bandages_2', itemId: 'bandages', coord: { q: 27, r: 19 }, quantity: 1 },

    // Near the church - some hidden items
    { id: 'ds_biscuits_1', itemId: 'trail_biscuits', coord: { q: 11, r: 25 }, quantity: 3 },

    // By the well/center of town
    { id: 'ds_canteen_1', itemId: 'water_canteen', coord: { q: 20, r: 20 }, quantity: 1 },

    // Hidden loot near Mayor's mansion
    { id: 'ds_gold_nugget_1', itemId: 'gold_nugget', coord: { q: 30, r: 25 }, quantity: 1 },

    // Random scrap near buildings
    { id: 'ds_scrap_1', itemId: 'scrap_metal', coord: { q: 14, r: 22 }, quantity: 2 },
    { id: 'ds_oil_1', itemId: 'oil_can', coord: { q: 22, r: 16 }, quantity: 1 },

    // Ammo stash
    { id: 'ds_revolver_ammo_1', itemId: 'revolver_ammo', coord: { q: 18, r: 16 }, quantity: 6 },
  ],

  // Rattlesnake Canyon - Outlaw hideout
  rattlesnake_canyon: [
    // Outlaw camp loot
    { id: 'rc_whiskey_1', itemId: 'whiskey', coord: { q: 5, r: 5 }, quantity: 2 },
    { id: 'rc_rifle_ammo_1', itemId: 'rifle_ammo', coord: { q: 6, r: 4 }, quantity: 8 },
    { id: 'rc_bandages_1', itemId: 'bandages', coord: { q: 4, r: 6 }, quantity: 3 },
    { id: 'rc_jerky_1', itemId: 'dried_jerky', coord: { q: 7, r: 5 }, quantity: 2 },

    // Hidden stash
    { id: 'rc_dynamite_1', itemId: 'dynamite', coord: { q: 10, r: 8 }, quantity: 1 },
    { id: 'rc_gold_nugget_1', itemId: 'gold_nugget', coord: { q: 12, r: 10 }, quantity: 2 },
  ],

  // Freeminer Hollow - Mining camp
  freeminer_hollow: [
    // Mining supplies
    { id: 'fh_oil_1', itemId: 'oil_can', coord: { q: 3, r: 3 }, quantity: 2 },
    { id: 'fh_scrap_1', itemId: 'scrap_metal', coord: { q: 5, r: 4 }, quantity: 3 },
    { id: 'fh_dynamite_1', itemId: 'dynamite', coord: { q: 4, r: 2 }, quantity: 2 },

    // Worker supplies
    { id: 'fh_jerky_1', itemId: 'dried_jerky', coord: { q: 6, r: 5 }, quantity: 2 },
    { id: 'fh_coffee_1', itemId: 'coffee_beans', coord: { q: 7, r: 4 }, quantity: 1 },
    { id: 'fh_bandages_1', itemId: 'bandages', coord: { q: 5, r: 6 }, quantity: 2 },

    // Hidden ore cache
    { id: 'fh_gold_nugget_1', itemId: 'gold_nugget', coord: { q: 10, r: 8 }, quantity: 3 },
    { id: 'fh_silver_1', itemId: 'silver_ore', coord: { q: 11, r: 7 }, quantity: 2 },
  ],

  // Iron Valley Junction - Railroad hub
  iron_valley_junction: [
    // Railroad supplies
    { id: 'ivj_oil_1', itemId: 'oil_can', coord: { q: 8, r: 8 }, quantity: 2 },
    { id: 'ivj_scrap_1', itemId: 'scrap_metal', coord: { q: 10, r: 9 }, quantity: 4 },

    // Station supplies
    { id: 'ivj_canteen_1', itemId: 'water_canteen', coord: { q: 12, r: 10 }, quantity: 1 },
    { id: 'ivj_biscuits_1', itemId: 'trail_biscuits', coord: { q: 11, r: 11 }, quantity: 2 },

    // Hidden IVRC scrip
    { id: 'ivj_scrip_1', itemId: 'ivrc_scrip', coord: { q: 15, r: 12 }, quantity: 25 },
  ],

  // Copper Ridge - Mining town under IVRC control
  copper_ridge: [
    // Company store leavings
    { id: 'cr_whiskey_1', itemId: 'whiskey', coord: { q: 6, r: 6 }, quantity: 1 },
    { id: 'cr_laudanum_1', itemId: 'laudanum', coord: { q: 7, r: 5 }, quantity: 1 },

    // Mine entrance
    { id: 'cr_dynamite_1', itemId: 'dynamite', coord: { q: 4, r: 8 }, quantity: 1 },
    { id: 'cr_oil_1', itemId: 'oil_can', coord: { q: 5, r: 7 }, quantity: 2 },

    // Worker housing area
    { id: 'cr_coffee_1', itemId: 'coffee_beans', coord: { q: 8, r: 9 }, quantity: 1 },
    { id: 'cr_jerky_1', itemId: 'dried_jerky', coord: { q: 9, r: 8 }, quantity: 2 },
  ],
};

/**
 * Get world items for a specific location
 */
export function getWorldItemsForLocation(locationId: string): WorldItemSpawn[] {
  return WORLD_ITEMS_BY_LOCATION[locationId] ?? [];
}

/**
 * Convert WorldItemSpawn to WorldItem (with position)
 */
export function worldItemSpawnToWorldItem(spawn: WorldItemSpawn, elevation: number = 0): WorldItem {
  return {
    id: spawn.id,
    itemId: spawn.itemId,
    position: {
      // These will be converted from hex coords in the scene manager
      x: spawn.coord.q,
      y: elevation,
      z: spawn.coord.r,
    },
    quantity: spawn.quantity,
  };
}

/**
 * Get the item name for a world item (for display)
 */
export function getWorldItemName(itemId: string): string {
  // Import would create circular dependency, so we use a lookup
  const itemNames: Record<string, string> = {
    bandages: 'Bandages',
    whiskey: 'Whiskey',
    laudanum: 'Laudanum',
    trail_biscuits: 'Trail Biscuits',
    water_canteen: 'Water Canteen',
    gold_nugget: 'Gold Nugget',
    scrap_metal: 'Scrap Metal',
    oil_can: 'Oil Can',
    revolver_ammo: 'Revolver Ammo',
    rifle_ammo: 'Rifle Ammo',
    shotgun_shells: 'Shotgun Shells',
    dynamite: 'Dynamite',
    dried_jerky: 'Dried Jerky',
    coffee_beans: 'Coffee Beans',
    silver_ore: 'Silver Ore',
    ivrc_scrip: 'IVRC Scrip',
  };
  return itemNames[itemId] ?? itemId;
}
