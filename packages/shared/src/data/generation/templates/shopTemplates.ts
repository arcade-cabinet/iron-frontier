/**
 * Iron Frontier - Shop Inventory Templates
 *
 * Procedural shop generation system for the Steampunk American Frontier.
 * Uses templates to define shop inventories with weighted rarity pools.
 *
 * Shop Types mapped to schema enum:
 * - general_store, gunsmith, apothecary, blacksmith, saloon, trading_post, specialty
 *
 * For shops outside the enum (stable, assay_office, traveling_merchant),
 * we use the closest fit and differentiate via tags.
 */

import type {
  GenerationContext,
  PriceModifier,
  ShopInventoryTemplate,
} from '../../schemas/generation';

// ============================================================================
// SHOP INVENTORY TEMPLATES
// ============================================================================

/**
 * General Store - Wide variety, common items
 * The frontier's one-stop shop for everyday needs.
 */
const generalStoreTemplate: ShopInventoryTemplate = {
  id: 'general_store',
  shopType: 'general_store',
  itemPools: [
    {
      tags: ['consumable', 'food'],
      countRange: [3, 6],
      rarityWeights: { common: 80, uncommon: 18, rare: 2, legendary: 0 },
    },
    {
      tags: ['tool', 'hand_tool'],
      countRange: [2, 5],
      rarityWeights: { common: 75, uncommon: 22, rare: 3, legendary: 0 },
    },
    {
      tags: ['clothing', 'apparel'],
      countRange: [3, 5],
      rarityWeights: { common: 70, uncommon: 25, rare: 5, legendary: 0 },
    },
    {
      tags: ['ammunition', 'ammo'],
      countRange: [2, 4],
      rarityWeights: { common: 85, uncommon: 13, rare: 2, legendary: 0 },
    },
    {
      tags: ['supply', 'rope', 'lantern'],
      countRange: [3, 5],
      rarityWeights: { common: 80, uncommon: 18, rare: 2, legendary: 0 },
    },
    {
      tags: ['tobacco', 'luxury'],
      countRange: [1, 2],
      rarityWeights: { common: 60, uncommon: 30, rare: 10, legendary: 0 },
    },
  ],
  restockHours: 24,
  buyMultiplier: 1.15,
  sellMultiplier: 0.45,
  tags: ['general', 'civilian', 'town'],
};

/**
 * Gunsmith - Weapons focus
 * Specializes in firearms, ammunition, and weapon parts.
 */
const gunsmithTemplate: ShopInventoryTemplate = {
  id: 'gunsmith',
  shopType: 'gunsmith',
  itemPools: [
    {
      tags: ['weapon', 'pistol', 'revolver'],
      countRange: [3, 5],
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
    },
    {
      tags: ['weapon', 'rifle'],
      countRange: [2, 4],
      rarityWeights: { common: 45, uncommon: 38, rare: 14, legendary: 3 },
    },
    {
      tags: ['weapon', 'shotgun'],
      countRange: [1, 3],
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
    },
    {
      tags: ['ammunition', 'ammo'],
      countRange: [4, 6],
      rarityWeights: { common: 70, uncommon: 25, rare: 5, legendary: 0 },
    },
    {
      tags: ['weapon_part', 'gun_parts', 'modification'],
      countRange: [2, 4],
      rarityWeights: { common: 40, uncommon: 40, rare: 15, legendary: 5 },
    },
    {
      tags: ['cleaning_kit', 'maintenance'],
      countRange: [1, 2],
      rarityWeights: { common: 80, uncommon: 18, rare: 2, legendary: 0 },
    },
  ],
  restockHours: 48,
  buyMultiplier: 1.25,
  sellMultiplier: 0.55,
  tags: ['weapons', 'combat', 'town'],
};

/**
 * Apothecary - Medical supplies
 * Frontier medicine, tonics, and healing supplies.
 */
const apothecaryTemplate: ShopInventoryTemplate = {
  id: 'apothecary',
  shopType: 'apothecary',
  itemPools: [
    {
      tags: ['medicine', 'healing'],
      countRange: [2, 4],
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    },
    {
      tags: ['tonic', 'elixir', 'potion'],
      countRange: [2, 4],
      rarityWeights: { common: 55, uncommon: 32, rare: 10, legendary: 3 },
    },
    {
      tags: ['bandage', 'medical_supply'],
      countRange: [2, 4],
      rarityWeights: { common: 75, uncommon: 22, rare: 3, legendary: 0 },
    },
    {
      tags: ['antidote', 'cure'],
      countRange: [1, 2],
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
    },
    {
      tags: ['herb', 'ingredient'],
      countRange: [1, 3],
      rarityWeights: { common: 65, uncommon: 28, rare: 6, legendary: 1 },
    },
  ],
  restockHours: 36,
  buyMultiplier: 1.3,
  sellMultiplier: 0.5,
  tags: ['medical', 'healing', 'town'],
};

/**
 * Blacksmith - Metal goods
 * Forged tools, horseshoes, and basic melee weapons.
 */
const blacksmithTemplate: ShopInventoryTemplate = {
  id: 'blacksmith',
  shopType: 'blacksmith',
  itemPools: [
    {
      tags: ['tool', 'metal_tool', 'hand_tool'],
      countRange: [3, 5],
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    },
    {
      tags: ['horseshoe', 'farrier'],
      countRange: [2, 4],
      rarityWeights: { common: 80, uncommon: 18, rare: 2, legendary: 0 },
    },
    {
      tags: ['metal_part', 'component'],
      countRange: [2, 4],
      rarityWeights: { common: 65, uncommon: 28, rare: 6, legendary: 1 },
    },
    {
      tags: ['weapon', 'melee', 'knife', 'axe'],
      countRange: [2, 4],
      rarityWeights: { common: 55, uncommon: 32, rare: 10, legendary: 3 },
    },
    {
      tags: ['chain', 'hardware'],
      countRange: [1, 3],
      rarityWeights: { common: 75, uncommon: 22, rare: 3, legendary: 0 },
    },
  ],
  restockHours: 48,
  buyMultiplier: 1.2,
  sellMultiplier: 0.5,
  tags: ['crafting', 'metal', 'town'],
};

/**
 * Saloon - Drinks and food
 * Cheap goods, alcohol, and frontier fare.
 */
const saloonTemplate: ShopInventoryTemplate = {
  id: 'saloon',
  shopType: 'saloon',
  itemPools: [
    {
      tags: ['alcohol', 'drink', 'whiskey', 'beer'],
      countRange: [3, 6],
      rarityWeights: { common: 75, uncommon: 20, rare: 4, legendary: 1 },
    },
    {
      tags: ['food', 'meal', 'snack'],
      countRange: [2, 4],
      rarityWeights: { common: 85, uncommon: 13, rare: 2, legendary: 0 },
    },
    {
      tags: ['tobacco', 'cigar', 'cigarette'],
      countRange: [1, 3],
      rarityWeights: { common: 70, uncommon: 25, rare: 5, legendary: 0 },
    },
  ],
  restockHours: 12,
  buyMultiplier: 1.1,
  sellMultiplier: 0.35,
  tags: ['food', 'drink', 'social', 'town'],
};

/**
 * Trading Post - Everything, remote premium
 * Remote location with diverse but limited stock at higher prices.
 */
const tradingPostTemplate: ShopInventoryTemplate = {
  id: 'trading_post',
  shopType: 'trading_post',
  itemPools: [
    {
      tags: ['consumable', 'food', 'supply'],
      countRange: [2, 4],
      rarityWeights: { common: 70, uncommon: 25, rare: 5, legendary: 0 },
    },
    {
      tags: ['ammunition', 'ammo'],
      countRange: [1, 3],
      rarityWeights: { common: 65, uncommon: 28, rare: 6, legendary: 1 },
    },
    {
      tags: ['tool', 'hand_tool'],
      countRange: [1, 3],
      rarityWeights: { common: 65, uncommon: 28, rare: 6, legendary: 1 },
    },
    {
      tags: ['medicine', 'healing'],
      countRange: [1, 2],
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    },
    {
      tags: ['clothing', 'apparel'],
      countRange: [1, 2],
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    },
    {
      tags: ['trade_goods', 'pelts', 'furs'],
      countRange: [2, 4],
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
    },
  ],
  restockHours: 72,
  buyMultiplier: 1.5,
  sellMultiplier: 0.6,
  tags: ['remote', 'frontier', 'trade'],
};

/**
 * Specialty Steam Shop - Steampunk tech
 * High-tech steam gadgets and automaton components.
 */
const specialtySteamTemplate: ShopInventoryTemplate = {
  id: 'specialty_steam',
  shopType: 'specialty',
  itemPools: [
    {
      tags: ['steam_part', 'steam_component', 'gear'],
      countRange: [2, 4],
      rarityWeights: { common: 35, uncommon: 40, rare: 18, legendary: 7 },
    },
    {
      tags: ['gadget', 'device', 'contraption'],
      countRange: [1, 3],
      rarityWeights: { common: 30, uncommon: 40, rare: 22, legendary: 8 },
    },
    {
      tags: ['automaton_part', 'mechanical', 'clockwork'],
      countRange: [1, 3],
      rarityWeights: { common: 25, uncommon: 42, rare: 25, legendary: 8 },
    },
    {
      tags: ['fuel', 'coal', 'steam_core'],
      countRange: [1, 2],
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
    },
  ],
  restockHours: 96,
  buyMultiplier: 1.6,
  sellMultiplier: 0.65,
  tags: ['steampunk', 'tech', 'specialty', 'rare'],
};

/**
 * Stable - Animal goods
 * Horse tack, feed, and animal medicine.
 * Uses 'general_store' shopType with stable-specific tags.
 */
const stableTemplate: ShopInventoryTemplate = {
  id: 'stable',
  shopType: 'general_store',
  itemPools: [
    {
      tags: ['horse_tack', 'saddle', 'bridle'],
      countRange: [2, 4],
      rarityWeights: { common: 55, uncommon: 32, rare: 10, legendary: 3 },
    },
    {
      tags: ['feed', 'hay', 'oats'],
      countRange: [2, 4],
      rarityWeights: { common: 85, uncommon: 13, rare: 2, legendary: 0 },
    },
    {
      tags: ['animal_medicine', 'veterinary'],
      countRange: [1, 2],
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    },
    {
      tags: ['horseshoe', 'farrier'],
      countRange: [1, 2],
      rarityWeights: { common: 75, uncommon: 22, rare: 3, legendary: 0 },
    },
    {
      tags: ['grooming', 'brush', 'care'],
      countRange: [1, 2],
      rarityWeights: { common: 80, uncommon: 18, rare: 2, legendary: 0 },
    },
  ],
  restockHours: 24,
  buyMultiplier: 1.15,
  sellMultiplier: 0.45,
  tags: ['stable', 'animal', 'horse', 'town'],
};

/**
 * Assay Office - Mining supplies
 * Mining tools, explosives, and ore samples.
 * Uses 'specialty' shopType with mining-specific tags.
 */
const assayOfficeTemplate: ShopInventoryTemplate = {
  id: 'assay_office',
  shopType: 'specialty',
  itemPools: [
    {
      tags: ['mining_tool', 'pickaxe', 'shovel'],
      countRange: [2, 4],
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    },
    {
      tags: ['explosive', 'dynamite', 'blasting_cap'],
      countRange: [1, 3],
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
    },
    {
      tags: ['ore_sample', 'mineral', 'specimen'],
      countRange: [1, 2],
      rarityWeights: { common: 40, uncommon: 40, rare: 15, legendary: 5 },
    },
    {
      tags: ['lantern', 'lamp', 'light'],
      countRange: [1, 2],
      rarityWeights: { common: 70, uncommon: 25, rare: 5, legendary: 0 },
    },
    {
      tags: ['scale', 'assay_equipment'],
      countRange: [1, 2],
      rarityWeights: { common: 55, uncommon: 32, rare: 10, legendary: 3 },
    },
  ],
  restockHours: 48,
  buyMultiplier: 1.25,
  sellMultiplier: 0.55,
  tags: ['mining', 'assay', 'specialty', 'industrial'],
};

/**
 * Traveling Merchant - Random selection
 * Rare wandering trader with best chance for unique items.
 * Uses 'trading_post' shopType with traveling-specific tags.
 */
const travelingMerchantTemplate: ShopInventoryTemplate = {
  id: 'traveling_merchant',
  shopType: 'trading_post',
  itemPools: [
    {
      tags: ['rare_goods', 'exotic', 'curio'],
      countRange: [1, 2],
      rarityWeights: { common: 20, uncommon: 40, rare: 28, legendary: 12 },
    },
    {
      tags: ['consumable', 'tonic', 'elixir'],
      countRange: [1, 2],
      rarityWeights: { common: 30, uncommon: 40, rare: 22, legendary: 8 },
    },
    {
      tags: ['weapon', 'unique'],
      countRange: [0, 2],
      rarityWeights: { common: 15, uncommon: 35, rare: 35, legendary: 15 },
    },
    {
      tags: ['gadget', 'device'],
      countRange: [0, 2],
      rarityWeights: { common: 25, uncommon: 38, rare: 27, legendary: 10 },
    },
    {
      tags: ['map', 'treasure_map', 'clue'],
      countRange: [0, 1],
      rarityWeights: { common: 20, uncommon: 35, rare: 30, legendary: 15 },
    },
  ],
  restockHours: 168, // Weekly restock (rare visits)
  buyMultiplier: 1.4,
  sellMultiplier: 0.7,
  tags: ['traveling', 'rare', 'wandering', 'unique'],
};

// ============================================================================
// SHOP TEMPLATES COLLECTION
// ============================================================================

export const SHOP_TEMPLATES: ShopInventoryTemplate[] = [
  generalStoreTemplate,
  gunsmithTemplate,
  apothecaryTemplate,
  blacksmithTemplate,
  saloonTemplate,
  tradingPostTemplate,
  specialtySteamTemplate,
  stableTemplate,
  assayOfficeTemplate,
  travelingMerchantTemplate,
];

// ============================================================================
// PRICE MODIFIERS
// ============================================================================

/**
 * Boom Town Premium - Mining boom increases all prices
 */
const boomTownPremium: PriceModifier = {
  id: 'boom_town_premium',
  itemTags: [],
  locationTypes: ['boom_town', 'mining_town'],
  regions: [],
  multiplierRange: [1.2, 1.4],
  conditions: [{ type: 'event_active', target: 'mining_boom' }],
  tags: ['economy', 'boom'],
};

/**
 * Ghost Town Discount - Abandoned towns have desperate sellers
 */
const ghostTownDiscount: PriceModifier = {
  id: 'ghost_town_discount',
  itemTags: [],
  locationTypes: ['ghost_town', 'abandoned'],
  regions: [],
  multiplierRange: [0.5, 0.7],
  conditions: [{ type: 'population_below', value: 10 }],
  tags: ['economy', 'abandoned'],
};

/**
 * Railroad Connection Discount - Better supply lines mean lower prices
 */
const railroadConnectionDiscount: PriceModifier = {
  id: 'railroad_connection',
  itemTags: [],
  locationTypes: ['railroad_town', 'station'],
  regions: [],
  multiplierRange: [0.8, 0.9],
  conditions: [{ type: 'has_feature', target: 'railroad' }],
  tags: ['economy', 'infrastructure'],
};

/**
 * Mining Town Ore Premium - Ore and minerals cost more in mining towns
 */
const miningTownOrePremium: PriceModifier = {
  id: 'mining_town_ore_premium',
  itemTags: ['ore', 'mineral', 'gold', 'silver', 'copper'],
  locationTypes: ['mining_town', 'mining_camp'],
  regions: [],
  multiplierRange: [1.15, 1.35],
  conditions: [],
  tags: ['mining', 'commodity'],
};

/**
 * Drought Water Premium - Water and related goods spike during drought
 */
const droughtWaterPremium: PriceModifier = {
  id: 'drought_water_premium',
  itemTags: ['water', 'canteen', 'liquid', 'drink'],
  locationTypes: [],
  regions: ['desert', 'badlands', 'scrubland'],
  multiplierRange: [1.5, 2.0],
  conditions: [{ type: 'event_active', target: 'drought' }],
  tags: ['weather', 'emergency'],
};

/**
 * War Ammunition Premium - Conflict drives up ammo prices
 */
const warAmmunitionPremium: PriceModifier = {
  id: 'war_ammunition_premium',
  itemTags: ['ammunition', 'ammo', 'gunpowder', 'weapon'],
  locationTypes: [],
  regions: [],
  multiplierRange: [1.3, 1.6],
  conditions: [{ type: 'faction_tension_above', target: 'any', value: 0.7 }],
  tags: ['conflict', 'military'],
};

/**
 * Winter Supply Premium - Cold weather increases supply costs
 */
const winterSupplyPremium: PriceModifier = {
  id: 'winter_supply_premium',
  itemTags: ['food', 'fuel', 'coal', 'clothing', 'blanket'],
  locationTypes: [],
  regions: ['mountains', 'northern_territory'],
  multiplierRange: [1.2, 1.4],
  conditions: [{ type: 'season', target: 'winter' }],
  tags: ['seasonal', 'weather'],
};

/**
 * Summer Perishables Discount - Perishable goods cheaper in summer
 */
const summerPerishablesDiscount: PriceModifier = {
  id: 'summer_perishables_discount',
  itemTags: ['food', 'fruit', 'vegetable', 'perishable'],
  locationTypes: [],
  regions: [],
  multiplierRange: [0.75, 0.9],
  conditions: [{ type: 'season', target: 'summer' }],
  tags: ['seasonal', 'agriculture'],
};

/**
 * Cattle Drive Meat Discount - Surplus meat during cattle drives
 */
const cattleDriveMeatDiscount: PriceModifier = {
  id: 'cattle_drive_meat_discount',
  itemTags: ['meat', 'beef', 'jerky', 'food'],
  locationTypes: ['cattle_town', 'ranch'],
  regions: ['plains', 'grassland'],
  multiplierRange: [0.7, 0.85],
  conditions: [{ type: 'event_active', target: 'cattle_drive' }],
  tags: ['livestock', 'seasonal'],
};

/**
 * Remote Location Premium - Distance from civilization increases prices
 */
const remoteLocationPremium: PriceModifier = {
  id: 'remote_location_premium',
  itemTags: [],
  locationTypes: ['outpost', 'waystation', 'frontier_camp'],
  regions: ['badlands', 'deep_desert', 'wilderness'],
  multiplierRange: [1.25, 1.5],
  conditions: [],
  tags: ['logistics', 'frontier'],
};

/**
 * Outlaw Territory Premium - Risk premium in dangerous areas
 */
const outlawTerritoryPremium: PriceModifier = {
  id: 'outlaw_territory_premium',
  itemTags: [],
  locationTypes: [],
  regions: ['badlands', 'outlaw_territory'],
  multiplierRange: [1.15, 1.35],
  conditions: [{ type: 'danger_level_above', value: 6 }],
  tags: ['danger', 'risk'],
};

/**
 * Festival Discount - Town celebrations bring sales
 */
const festivalDiscount: PriceModifier = {
  id: 'festival_discount',
  itemTags: ['alcohol', 'food', 'clothing', 'luxury'],
  locationTypes: ['town', 'city'],
  regions: [],
  multiplierRange: [0.85, 0.95],
  conditions: [{ type: 'event_active', target: 'festival' }],
  tags: ['social', 'celebration'],
};

/**
 * Steam Tech Premium - High-tech items always cost more
 */
const steamTechPremium: PriceModifier = {
  id: 'steam_tech_premium',
  itemTags: ['steam', 'automaton', 'gadget', 'clockwork', 'mechanical'],
  locationTypes: [],
  regions: [],
  multiplierRange: [1.3, 1.5],
  conditions: [],
  tags: ['technology', 'steampunk'],
};

/**
 * Medical Emergency Premium - Disease outbreaks spike medical prices
 */
const medicalEmergencyPremium: PriceModifier = {
  id: 'medical_emergency_premium',
  itemTags: ['medicine', 'bandage', 'antidote', 'tonic', 'healing'],
  locationTypes: [],
  regions: [],
  multiplierRange: [1.5, 2.0],
  conditions: [{ type: 'event_active', target: 'disease_outbreak' }],
  tags: ['emergency', 'medical'],
};

// ============================================================================
// PRICE MODIFIERS COLLECTION
// ============================================================================

export const PRICE_MODIFIERS: PriceModifier[] = [
  boomTownPremium,
  ghostTownDiscount,
  railroadConnectionDiscount,
  miningTownOrePremium,
  droughtWaterPremium,
  warAmmunitionPremium,
  winterSupplyPremium,
  summerPerishablesDiscount,
  cattleDriveMeatDiscount,
  remoteLocationPremium,
  outlawTerritoryPremium,
  festivalDiscount,
  steamTechPremium,
  medicalEmergencyPremium,
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a shop template by shop type or ID
 */
export function getShopTemplate(shopTypeOrId: string): ShopInventoryTemplate | undefined {
  return SHOP_TEMPLATES.find(
    (template) => template.id === shopTypeOrId || template.shopType === shopTypeOrId
  );
}

/**
 * Get all shop templates matching given tags
 */
export function getShopTemplatesByTags(tags: string[]): ShopInventoryTemplate[] {
  return SHOP_TEMPLATES.filter((template) => tags.some((tag) => template.tags.includes(tag)));
}

/**
 * Context for price calculation
 */
export interface PriceCalculationContext {
  /** Location type (town, outpost, etc.) */
  locationType?: string;
  /** Region ID */
  region?: string;
  /** Active world events */
  activeEvents?: string[];
  /** Current season */
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  /** Faction tensions (faction ID -> tension level 0-1) */
  factionTensions?: Record<string, number>;
  /** Population of the location */
  population?: number;
  /** Danger level (1-10) */
  dangerLevel?: number;
  /** Location features (e.g., 'railroad', 'river') */
  features?: string[];
}

/**
 * Check if a condition is met given the context
 */
function checkCondition(
  condition: { type?: string; target?: string; value?: number },
  context: PriceCalculationContext
): boolean {
  switch (condition.type ?? '') {
    case 'event_active':
      return context.activeEvents?.includes(condition.target ?? '') ?? false;

    case 'season':
      return context.season === condition.target;

    case 'population_below':
      return (context.population ?? 100) < (condition.value ?? 0);

    case 'danger_level_above':
      return (context.dangerLevel ?? 1) > (condition.value ?? 0);

    case 'faction_tension_above':
      if (condition.target === 'any') {
        return Object.values(context.factionTensions ?? {}).some(
          (tension) => tension > (condition.value ?? 0)
        );
      }
      return (context.factionTensions?.[condition.target ?? ''] ?? 0) > (condition.value ?? 0);

    case 'has_feature':
      return context.features?.includes(condition.target ?? '') ?? false;

    default:
      return true;
  }
}

/**
 * Check if a modifier applies to the given item and context
 */
function modifierApplies(
  modifier: PriceModifier,
  itemTags: string[],
  context: PriceCalculationContext
): boolean {
  // Check if item tags match (empty array = applies to all)
  const itemTagsMatch =
    modifier.itemTags.length === 0 || modifier.itemTags.some((tag) => itemTags.includes(tag));

  // Check if location type matches (empty array = applies to all)
  const locationTypeMatch =
    modifier.locationTypes.length === 0 ||
    (context.locationType !== undefined && modifier.locationTypes.includes(context.locationType));

  // Check if region matches (empty array = applies to all)
  const regionMatch =
    modifier.regions.length === 0 ||
    (context.region !== undefined && modifier.regions.includes(context.region));

  // Check all conditions
  const conditionsMet = modifier.conditions.every((condition) =>
    checkCondition(condition, context)
  );

  return itemTagsMatch && locationTypeMatch && regionMatch && conditionsMet;
}

/**
 * Calculate the final price for an item given its base price, tags, and context
 *
 * @param basePrice - The base price of the item
 * @param itemTags - Tags associated with the item
 * @param context - The context for price calculation
 * @returns The calculated final price
 */
export function calculatePrice(
  basePrice: number,
  itemTags: string[],
  context: PriceCalculationContext
): number {
  let finalMultiplier = 1.0;

  for (const modifier of PRICE_MODIFIERS) {
    if (modifierApplies(modifier, itemTags, context)) {
      // Use the midpoint of the multiplier range for deterministic pricing
      // For true variance, pass a SeededRandom and use random within range
      const midpoint = (modifier.multiplierRange[0] + modifier.multiplierRange[1]) / 2;
      finalMultiplier *= midpoint;
    }
  }

  // Round to nearest whole number (frontier doesn't deal in fractions)
  return Math.round(basePrice * finalMultiplier);
}

/**
 * Calculate price with variance using a random multiplier within modifier ranges
 *
 * @param basePrice - The base price of the item
 * @param itemTags - Tags associated with the item
 * @param context - The context for price calculation
 * @param random - Random function returning 0-1 for variance
 * @returns The calculated final price with variance
 */
export function calculatePriceWithVariance(
  basePrice: number,
  itemTags: string[],
  context: PriceCalculationContext,
  random: () => number
): number {
  let finalMultiplier = 1.0;

  for (const modifier of PRICE_MODIFIERS) {
    if (modifierApplies(modifier, itemTags, context)) {
      const [min, max] = modifier.multiplierRange;
      const variance = random() * (max - min) + min;
      finalMultiplier *= variance;
    }
  }

  return Math.round(basePrice * finalMultiplier);
}

/**
 * Get all applicable modifiers for given item tags and context
 * Useful for displaying price breakdown to player
 */
export function getApplicableModifiers(
  itemTags: string[],
  context: PriceCalculationContext
): PriceModifier[] {
  return PRICE_MODIFIERS.filter((modifier) => modifierApplies(modifier, itemTags, context));
}

/**
 * Create a GenerationContext compatible price context from game state
 */
export function createPriceContextFromGeneration(
  genContext: GenerationContext
): PriceCalculationContext {
  return {
    region: genContext.regionId,
    activeEvents: genContext.activeEvents,
    factionTensions: genContext.factionTensions,
  };
}
