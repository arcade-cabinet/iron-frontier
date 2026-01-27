/**
 * Shop System - Iron Frontier
 *
 * Defines merchant inventories and pricing for shops in the game.
 */

import { z } from 'zod';
import { getItem } from '../items/index';
import type { BaseItem } from '../schemas/item';

// ============================================================================
// SHOP SCHEMAS
// ============================================================================

export const ShopItemSchema = z.object({
  itemId: z.string(),
  /** Stock quantity (-1 = infinite) */
  stock: z.number().int().optional(),
  /** Price modifier (1.0 = base price, 1.2 = 20% markup) */
  priceModifier: z.number().min(0).optional(),
  /** Minimum reputation to purchase */
  minReputation: z.number().int().optional(),
  /** Is this item hidden until unlocked? */
  hidden: z.boolean().optional(),
});
export type ShopItem = z.infer<typeof ShopItemSchema>;

export const ShopDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  /** NPC who runs this shop */
  ownerId: z.string(),
  /** Items for sale */
  inventory: z.array(ShopItemSchema),
  /** Buy price modifier (how much shop pays for items) */
  buyModifier: z.number().min(0).max(1).optional(),
  /** Can player sell items here? */
  canSell: z.boolean().optional(),
  /** Item types accepted for sale */
  acceptedTypes: z.array(z.string()).optional(),
  /** Tags for filtering */
  tags: z.array(z.string()).optional(),
});
export type ShopDefinition = z.infer<typeof ShopDefinitionSchema>;

// ============================================================================
// SHOP DEFINITIONS
// ============================================================================

export const DocChenShop: ShopDefinition = {
  id: 'doc_chen_shop',
  name: "Doc Chen's Medicine",
  description: 'Medical supplies and remedies, both western and traditional.',
  ownerId: 'doc_chen',
  inventory: [
    // Basic medical supplies
    { itemId: 'bandages', stock: 10, priceModifier: 1.0 },
    { itemId: 'laudanum', stock: 5, priceModifier: 1.2 },
    { itemId: 'medical_kit', stock: 3, priceModifier: 1.1 },

    // Consumables
    { itemId: 'herbal_remedy', stock: 8, priceModifier: 1.0 },
    { itemId: 'antivenom', stock: 3, priceModifier: 1.3 },

    // Special items (reputation locked)
    { itemId: 'stimulant', stock: 2, priceModifier: 1.5, minReputation: 10 },
  ],
  buyModifier: 0.4, // Doc pays less - he's not running a pawn shop
  canSell: true,
  acceptedTypes: ['consumable', 'junk'],
  tags: ['medical', 'dusty_springs'],
};

export const GeneralStoreShop: ShopDefinition = {
  id: 'general_store',
  name: 'Dusty Springs General Store',
  description: 'Everything a frontier traveler needs.',
  ownerId: 'shop_keeper', // Generic NPC
  inventory: [
    // Consumables
    { itemId: 'trail_biscuits', stock: 20, priceModifier: 1.0 },
    { itemId: 'dried_jerky', stock: 15, priceModifier: 1.0 },
    { itemId: 'coffee_beans', stock: 10, priceModifier: 1.1 },
    { itemId: 'water_canteen', stock: 5, priceModifier: 1.0 },
    { itemId: 'whiskey', stock: 10, priceModifier: 1.2 },

    // Supplies
    { itemId: 'oil_can', stock: 8, priceModifier: 1.0 },
    { itemId: 'rope', stock: 5, priceModifier: 1.0 },
    { itemId: 'lantern', stock: 3, priceModifier: 1.1 },

    // Ammo
    { itemId: 'revolver_ammo', stock: 50, priceModifier: 1.0 },
    { itemId: 'rifle_ammo', stock: 30, priceModifier: 1.0 },
    { itemId: 'shotgun_shells', stock: 20, priceModifier: 1.1 },

    // Basic weapons
    { itemId: 'hunting_knife', stock: 3, priceModifier: 1.0 },
  ],
  buyModifier: 0.5,
  canSell: true,
  acceptedTypes: ['weapon', 'armor', 'consumable', 'junk'],
  tags: ['general', 'dusty_springs'],
};

export const BlacksmithShop: ShopDefinition = {
  id: 'blacksmith_shop',
  name: 'Iron Valley Smithy',
  description: 'Quality metalwork and repairs.',
  ownerId: 'blacksmith',
  inventory: [
    // Weapons
    { itemId: 'hunting_knife', stock: 5, priceModifier: 0.9 },
    { itemId: 'bowie_knife', stock: 2, priceModifier: 1.0 },
    { itemId: 'pickaxe', stock: 5, priceModifier: 1.0 },
    { itemId: 'machete', stock: 3, priceModifier: 1.0 },

    // Supplies
    { itemId: 'scrap_metal', stock: 20, priceModifier: 0.8 },
    { itemId: 'oil_can', stock: 10, priceModifier: 0.9 },

    // Premium items
    { itemId: 'reinforced_knife', stock: 1, priceModifier: 1.2, minReputation: 5 },
  ],
  buyModifier: 0.6, // Blacksmith pays more for metal items
  canSell: true,
  acceptedTypes: ['weapon', 'junk'],
  tags: ['weapons', 'tools'],
};

export const GunsmithShop: ShopDefinition = {
  id: 'gunsmith_shop',
  name: "Pete's Firearms",
  description: 'Fine firearms and ammunition.',
  ownerId: 'gunsmith',
  inventory: [
    // Revolvers
    { itemId: 'revolver', stock: 3, priceModifier: 1.0 },
    { itemId: 'navy_revolver', stock: 2, priceModifier: 1.1 },
    { itemId: 'schofield', stock: 1, priceModifier: 1.2 },

    // Rifles
    { itemId: 'hunting_rifle', stock: 2, priceModifier: 1.0 },
    { itemId: 'repeater', stock: 1, priceModifier: 1.2 },

    // Shotguns
    { itemId: 'shotgun', stock: 2, priceModifier: 1.0 },

    // Ammo
    { itemId: 'revolver_ammo', stock: 100, priceModifier: 0.9 },
    { itemId: 'rifle_ammo', stock: 80, priceModifier: 0.9 },
    { itemId: 'shotgun_shells', stock: 60, priceModifier: 0.9 },

    // Special
    { itemId: 'quickdraw_holster', stock: 1, priceModifier: 1.5, minReputation: 15 },
  ],
  buyModifier: 0.55,
  canSell: true,
  acceptedTypes: ['weapon'],
  tags: ['firearms', 'ammo'],
};

export const SaloonShop: ShopDefinition = {
  id: 'saloon_shop',
  name: 'Lucky Strike Saloon',
  description: 'Drinks, food, and rumors.',
  ownerId: 'bartender',
  inventory: [
    // Drinks
    { itemId: 'whiskey', stock: -1, priceModifier: 1.0 }, // Infinite
    { itemId: 'beer', stock: -1, priceModifier: 0.8 },
    { itemId: 'moonshine', stock: 5, priceModifier: 1.3 },

    // Food
    { itemId: 'hot_meal', stock: 10, priceModifier: 1.0 },
    { itemId: 'dried_jerky', stock: 5, priceModifier: 1.2 },

    // Special
    { itemId: 'lucky_charm', stock: 1, priceModifier: 2.0, hidden: true },
  ],
  buyModifier: 0.3, // Bartender doesn't want your junk
  canSell: false,
  acceptedTypes: [],
  tags: ['drinks', 'food', 'social'],
};

// ============================================================================
// SHOP REGISTRY
// ============================================================================

export const ALL_SHOPS: ShopDefinition[] = [
  DocChenShop,
  GeneralStoreShop,
  BlacksmithShop,
  GunsmithShop,
  SaloonShop,
];

export const SHOPS_BY_ID: Record<string, ShopDefinition> = Object.fromEntries(
  ALL_SHOPS.map((shop) => [shop.id, shop])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getShopById(id: string): ShopDefinition | undefined {
  return SHOPS_BY_ID[id];
}

export function getShopByOwner(ownerId: string): ShopDefinition | undefined {
  return ALL_SHOPS.find((shop) => shop.ownerId === ownerId);
}

export function getShopsByTag(tag: string): ShopDefinition[] {
  return ALL_SHOPS.filter((shop) => shop.tags?.includes(tag) ?? false);
}

/**
 * Calculate buy price (what player pays)
 */
export function calculateBuyPrice(_shop: ShopDefinition, item: ShopItem): number {
  const baseDef = getItem(item.itemId);
  if (!baseDef) return 0;

  return Math.ceil(baseDef.value * (item.priceModifier ?? 1.0));
}

/**
 * Calculate sell price (what shop pays player)
 */
export function calculateSellPrice(shop: ShopDefinition, itemDef: BaseItem): number {
  return Math.floor(itemDef.value * (shop.buyModifier ?? 0.5));
}

/**
 * Get available items for a shop (filtered by reputation)
 */
export function getAvailableShopItems(shop: ShopDefinition, playerReputation: number): ShopItem[] {
  return shop.inventory.filter((item) => {
    // Check reputation requirement (default -100)
    if ((item.minReputation ?? -100) > playerReputation) return false;
    // Check if hidden (default false)
    if (item.hidden === true) return false;
    // Check stock (0 = sold out, undefined/-1 = infinite)
    if (item.stock === 0) return false;
    return true;
  });
}

/**
 * Check if shop accepts an item type for selling
 */
export function canSellItemToShop(shop: ShopDefinition, itemType: string): boolean {
  if (shop.canSell === false) return false;
  const acceptedTypes = shop.acceptedTypes ?? ['weapon', 'armor', 'consumable', 'junk'];
  return acceptedTypes.includes(itemType);
}
