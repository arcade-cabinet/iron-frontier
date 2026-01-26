/**
 * Iron Frontier - Procedural Item Generator
 *
 * Comprehensive item generation system for weapons, armor, consumables, and loot.
 * Uses Zod-backed templates with {{variable}} substitution patterns.
 * Integrates with the existing item system and shop templates.
 */

import { z } from 'zod';
import { type GenerationContext, substituteTemplate } from '../../schemas/generation';
import {
  type AmmoType,
  AmmoTypeSchema,
  type ArmorItem,
  type BaseItem,
  type ConsumableItem,
  type ItemRarity,
  ItemRaritySchema,
  type WeaponItem,
  type WeaponType,
  WeaponTypeSchema,
} from '../../schemas/item';
import { SeededRandom } from '../seededRandom';
import { getShopTemplate } from '../templates/shopTemplates';

// ============================================================================
// ITEM TEMPLATE SCHEMAS
// ============================================================================

/**
 * Rarity weight configuration
 */
export const RarityWeightsSchema = z.object({
  common: z.number().min(0).default(70),
  uncommon: z.number().min(0).default(25),
  rare: z.number().min(0).default(4),
  legendary: z.number().min(0).default(1),
});
export type RarityWeights = z.infer<typeof RarityWeightsSchema>;

/**
 * Stat range for procedural variation
 */
export const StatRangeSchema = z.tuple([z.number(), z.number()]);
export type StatRange = z.infer<typeof StatRangeSchema>;

/**
 * Item template for procedural generation
 */
export const ItemTemplateSchema = z.object({
  /** Template identifier */
  id: z.string(),
  /** Human-readable name */
  name: z.string(),
  /** Item type being generated */
  itemType: z.enum(['weapon', 'armor', 'consumable', 'material', 'tool', 'key']),
  /** Rarity weights for generation */
  rarityWeights: RarityWeightsSchema.default(() => ({
    common: 70,
    uncommon: 25,
    rare: 4,
    legendary: 1,
  })),
  /** Name patterns with {{material}}, {{style}}, {{quality}} slots */
  namePatterns: z.array(z.string()).min(1),
  /** Description templates with {{variables}} */
  descriptionTemplates: z.array(z.string()).min(1),
  /** Base value range [min, max] */
  valueRange: StatRangeSchema.default([1, 100]),
  /** Weight range in pounds */
  weightRange: StatRangeSchema.default([0.1, 5.0]),
  /** Tags for filtering and categorization */
  tags: z.array(z.string()).default([]),
  /** Level range for scaling */
  levelRange: StatRangeSchema.default([1, 10]),

  // Weapon-specific
  /** Weapon type (if weapon) */
  weaponType: WeaponTypeSchema.optional(),
  /** Base damage range */
  damageRange: StatRangeSchema.optional(),
  /** Accuracy range (0-100) */
  accuracyRange: StatRangeSchema.optional(),
  /** Range (0 = melee) */
  rangeRange: StatRangeSchema.optional(),
  /** Fire rate range */
  fireRateRange: StatRangeSchema.optional(),
  /** Ammo type */
  ammoType: AmmoTypeSchema.optional(),
  /** Clip size range */
  clipSizeRange: StatRangeSchema.optional(),

  // Armor-specific
  /** Defense range */
  defenseRange: StatRangeSchema.optional(),
  /** Armor slot */
  armorSlot: z.enum(['head', 'body', 'legs', 'accessory']).optional(),
  /** Movement penalty range (0-1) */
  movementPenaltyRange: StatRangeSchema.optional(),

  // Consumable-specific
  /** Heal amount range */
  healRange: StatRangeSchema.optional(),
  /** Stamina restore range */
  staminaRange: StatRangeSchema.optional(),
  /** Buff type */
  buffType: z.string().optional(),
  /** Buff duration range (seconds) */
  buffDurationRange: StatRangeSchema.optional(),
  /** Buff strength range */
  buffStrengthRange: StatRangeSchema.optional(),

  // Materials this template can use
  allowedMaterials: z.array(z.string()).default([]),
  /** Styles this template can use */
  allowedStyles: z.array(z.string()).default([]),
});
export type ItemTemplate = z.infer<typeof ItemTemplateSchema>;

/**
 * Loot table entry
 */
export const LootTableEntrySchema = z.object({
  /** Template ID or item ID */
  templateOrItemId: z.string(),
  /** Is this a template (true) or direct item reference (false) */
  isTemplate: z.boolean().default(true),
  /** Weight for random selection */
  weight: z.number().min(0).default(1),
  /** Quantity range */
  quantityRange: StatRangeSchema.default([1, 1]),
  /** Level requirement range */
  levelRange: StatRangeSchema.default([1, 10]),
  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type LootTableEntry = z.infer<typeof LootTableEntrySchema>;

/**
 * Loot table for procedural drops
 */
export const ProceduralLootTableSchema = z.object({
  /** Table identifier */
  id: z.string(),
  /** Human-readable name */
  name: z.string(),
  /** Entries in this table */
  entries: z.array(LootTableEntrySchema).min(1),
  /** Number of rolls on this table */
  rolls: z.number().int().min(1).default(1),
  /** Chance for table to produce nothing (0-1) */
  emptyChance: z.number().min(0).max(1).default(0),
  /** Tags for categorization */
  tags: z.array(z.string()).default([]),
});
export type ProceduralLootTable = z.infer<typeof ProceduralLootTableSchema>;

// ============================================================================
// ITEM POOLS
// ============================================================================

/**
 * Material pool - defines materials for item generation
 */
export interface MaterialPool {
  id: string;
  name: string;
  /** Value multiplier */
  valueMultiplier: number;
  /** Stat multiplier (affects damage, defense, etc.) */
  statMultiplier: number;
  /** Minimum rarity for this material */
  minRarity: ItemRarity;
  /** Tags for filtering (e.g., 'metal', 'organic', 'precious') */
  tags: string[];
}

/**
 * Quality pool - defines quality tiers
 */
export interface QualityPool {
  id: string;
  name: string;
  /** Adjective used in names */
  adjective: string;
  /** Value multiplier */
  valueMultiplier: number;
  /** Stat multiplier */
  statMultiplier: number;
  /** Associated rarity */
  rarity: ItemRarity;
  /** Weight for random selection */
  weight: number;
}

/**
 * Style pool - defines item styles/aesthetics
 */
export interface StylePool {
  id: string;
  name: string;
  /** Description modifier */
  descriptionSuffix: string;
  /** Value multiplier */
  valueMultiplier: number;
  /** Tags */
  tags: string[];
}

// ============================================================================
// DEFAULT POOLS
// ============================================================================

export const DEFAULT_MATERIALS: MaterialPool[] = [
  {
    id: 'iron',
    name: 'Iron',
    valueMultiplier: 1.0,
    statMultiplier: 1.0,
    minRarity: 'common',
    tags: ['metal', 'basic'],
  },
  {
    id: 'steel',
    name: 'Steel',
    valueMultiplier: 1.5,
    statMultiplier: 1.2,
    minRarity: 'common',
    tags: ['metal', 'refined'],
  },
  {
    id: 'brass',
    name: 'Brass',
    valueMultiplier: 1.3,
    statMultiplier: 1.1,
    minRarity: 'uncommon',
    tags: ['metal', 'steampunk'],
  },
  {
    id: 'silver',
    name: 'Silver',
    valueMultiplier: 2.5,
    statMultiplier: 1.3,
    minRarity: 'rare',
    tags: ['metal', 'precious'],
  },
  {
    id: 'gold',
    name: 'Gold',
    valueMultiplier: 5.0,
    statMultiplier: 1.0,
    minRarity: 'rare',
    tags: ['metal', 'precious', 'decorative'],
  },
  {
    id: 'leather',
    name: 'Leather',
    valueMultiplier: 0.8,
    statMultiplier: 0.9,
    minRarity: 'common',
    tags: ['organic', 'flexible'],
  },
  {
    id: 'cloth',
    name: 'Cloth',
    valueMultiplier: 0.5,
    statMultiplier: 0.7,
    minRarity: 'common',
    tags: ['organic', 'light'],
  },
  {
    id: 'reinforced_leather',
    name: 'Reinforced Leather',
    valueMultiplier: 1.4,
    statMultiplier: 1.1,
    minRarity: 'uncommon',
    tags: ['organic', 'reinforced'],
  },
  {
    id: 'damascus_steel',
    name: 'Damascus Steel',
    valueMultiplier: 3.0,
    statMultiplier: 1.5,
    minRarity: 'rare',
    tags: ['metal', 'premium', 'exotic'],
  },
  {
    id: 'clockwork_alloy',
    name: 'Clockwork Alloy',
    valueMultiplier: 4.0,
    statMultiplier: 1.4,
    minRarity: 'legendary',
    tags: ['metal', 'steampunk', 'exotic'],
  },
];

export const DEFAULT_QUALITIES: QualityPool[] = [
  {
    id: 'rusty',
    name: 'Rusty',
    adjective: 'Rusty',
    valueMultiplier: 0.5,
    statMultiplier: 0.7,
    rarity: 'common',
    weight: 15,
  },
  {
    id: 'worn',
    name: 'Worn',
    adjective: 'Worn',
    valueMultiplier: 0.7,
    statMultiplier: 0.85,
    rarity: 'common',
    weight: 25,
  },
  {
    id: 'standard',
    name: 'Standard',
    adjective: '',
    valueMultiplier: 1.0,
    statMultiplier: 1.0,
    rarity: 'common',
    weight: 35,
  },
  {
    id: 'fine',
    name: 'Fine',
    adjective: 'Fine',
    valueMultiplier: 1.5,
    statMultiplier: 1.15,
    rarity: 'uncommon',
    weight: 18,
  },
  {
    id: 'masterwork',
    name: 'Masterwork',
    adjective: 'Masterwork',
    valueMultiplier: 2.5,
    statMultiplier: 1.3,
    rarity: 'rare',
    weight: 6,
  },
  {
    id: 'legendary',
    name: 'Legendary',
    adjective: 'Legendary',
    valueMultiplier: 5.0,
    statMultiplier: 1.5,
    rarity: 'legendary',
    weight: 1,
  },
];

export const DEFAULT_STYLES: StylePool[] = [
  {
    id: 'frontier',
    name: 'Frontier',
    descriptionSuffix: 'Made for the harsh frontier life.',
    valueMultiplier: 1.0,
    tags: ['western', 'practical'],
  },
  {
    id: 'military',
    name: 'Military',
    descriptionSuffix: 'Standard military issue.',
    valueMultiplier: 1.2,
    tags: ['military', 'regulation'],
  },
  {
    id: 'ornate',
    name: 'Ornate',
    descriptionSuffix: 'Decorated with intricate engravings.',
    valueMultiplier: 1.8,
    tags: ['decorative', 'fancy'],
  },
  {
    id: 'rugged',
    name: 'Rugged',
    descriptionSuffix: 'Built to last in the toughest conditions.',
    valueMultiplier: 1.1,
    tags: ['durable', 'practical'],
  },
  {
    id: 'elegant',
    name: 'Elegant',
    descriptionSuffix: 'A refined piece of craftsmanship.',
    valueMultiplier: 2.0,
    tags: ['fancy', 'sophisticated'],
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    descriptionSuffix: 'Enhanced with brass gears and steam mechanisms.',
    valueMultiplier: 2.5,
    tags: ['steampunk', 'mechanical'],
  },
];

// ============================================================================
// WEAPON NAME POOLS
// ============================================================================

export const WEAPON_PREFIXES: Record<string, string[]> = {
  revolver: [
    'Peacemaker',
    'Six-Shooter',
    'Colt',
    'Remington',
    'Schofield',
    'Navy',
    'Army',
    'Frontier',
    "Gunslinger's",
  ],
  rifle: [
    'Repeater',
    'Carbine',
    'Sharps',
    'Winchester',
    'Henry',
    'Lever-Action',
    'Bolt-Action',
    'Buffalo',
    "Scout's",
  ],
  shotgun: [
    'Scattergun',
    'Coach Gun',
    'Double-Barrel',
    'Pump-Action',
    'Buckshot',
    'Sawed-Off',
    'Fowling',
  ],
  knife: ['Bowie', 'Hunting', 'Skinning', 'Fighting', 'Frontier', 'Camp', "Trapper's", "Ranger's"],
  explosive: ['Dynamite', 'Blasting', 'Mining', 'Demolition'],
  melee: ['Hatchet', 'Tomahawk', 'Club', 'Pickaxe', 'Shovel', 'Crowbar', 'Hammer'],
};

export const WEAPON_SUFFIXES: string[] = [
  '', // No suffix
  'of the West',
  'of Justice',
  'of the Frontier',
  'Special',
  'Deluxe',
  'Custom',
  'Mark II',
  'Express',
];

// ============================================================================
// ARMOR NAME POOLS
// ============================================================================

export const ARMOR_PREFIXES: Record<string, string[]> = {
  head: ['Cowboy Hat', 'Stetson', 'Bandana', 'Cavalry Hat', 'Derby', "Miner's Helmet", 'Goggles'],
  body: ['Duster', 'Vest', 'Poncho', 'Jacket', 'Coat', 'Shirt', 'Overalls', 'Chaps'],
  legs: ['Trousers', 'Chaps', 'Dungarees', 'Riding Pants', 'Work Pants'],
  accessory: ['Belt', 'Holster', 'Bandolier', 'Gloves', 'Boots', 'Spurs', 'Watch', 'Charm'],
};

export const ARMOR_SUFFIXES: string[] = [
  '',
  'of Protection',
  'of the Trail',
  'of the Range',
  'Special',
  'Reinforced',
  'Padded',
];

// ============================================================================
// CONSUMABLE NAME POOLS
// ============================================================================

export const CONSUMABLE_PREFIXES: Record<string, string[]> = {
  healing: ["Dr. Thornton's", 'Snake Oil', 'Miracle', 'Patent', 'Frontier', 'Healing'],
  food: ['Trail', 'Camp', 'Frontier', 'Cowboy', 'Ranch', 'Homemade'],
  drink: ['Strong', 'Smooth', 'Aged', 'Local', 'Imported', 'Frontier'],
  buff: ['Invigorating', 'Fortifying', 'Energizing', 'Stimulating', 'Potent'],
};

export const CONSUMABLE_SUFFIXES: string[] = [
  'Tonic',
  'Elixir',
  'Remedy',
  'Medicine',
  'Potion',
  'Brew',
  'Concoction',
];

// ============================================================================
// TEMPLATE & POOL REGISTRIES
// ============================================================================

let ITEM_TEMPLATES: ItemTemplate[] = [];
let LOOT_TABLES: ProceduralLootTable[] = [];
let MATERIAL_POOL: MaterialPool[] = [...DEFAULT_MATERIALS];
let QUALITY_POOL: QualityPool[] = [...DEFAULT_QUALITIES];
let STYLE_POOL: StylePool[] = [...DEFAULT_STYLES];

/**
 * Initialize item generation system with templates and pools
 */
export function initItemGeneration(
  templates: ItemTemplate[] = [],
  lootTables: ProceduralLootTable[] = [],
  pools?: {
    materials?: MaterialPool[];
    qualities?: QualityPool[];
    styles?: StylePool[];
  }
): void {
  ITEM_TEMPLATES = [...getDefaultItemTemplates(), ...templates];
  LOOT_TABLES = [...getDefaultLootTables(), ...lootTables];

  if (pools?.materials) {
    MATERIAL_POOL = [...DEFAULT_MATERIALS, ...pools.materials];
  }
  if (pools?.qualities) {
    QUALITY_POOL = [...DEFAULT_QUALITIES, ...pools.qualities];
  }
  if (pools?.styles) {
    STYLE_POOL = [...DEFAULT_STYLES, ...pools.styles];
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get material appropriate for item type and rarity
 */
function getMaterialForItem(
  rng: SeededRandom,
  itemType: string,
  rarity: ItemRarity,
  tags: string[]
): MaterialPool {
  const rarityOrder: ItemRarity[] = ['common', 'uncommon', 'rare', 'legendary'];
  const rarityIndex = rarityOrder.indexOf(rarity);

  // Filter materials by rarity and tags
  const validMaterials = MATERIAL_POOL.filter((mat) => {
    const matRarityIndex = rarityOrder.indexOf(mat.minRarity);
    return matRarityIndex <= rarityIndex;
  });

  // Prefer materials matching item tags
  const preferredMaterials = validMaterials.filter((mat) =>
    tags.some((tag) => mat.tags.includes(tag))
  );

  if (preferredMaterials.length > 0) {
    return rng.pick(preferredMaterials);
  }

  return rng.pick(validMaterials.length > 0 ? validMaterials : MATERIAL_POOL);
}

/**
 * Select quality based on rarity with weighted randomness
 */
function getQualityForRarity(rng: SeededRandom, rarity: ItemRarity): QualityPool {
  const rarityOrder: ItemRarity[] = ['common', 'uncommon', 'rare', 'legendary'];
  const rarityIndex = rarityOrder.indexOf(rarity);

  // Filter qualities matching or below this rarity
  const validQualities = QUALITY_POOL.filter((q) => {
    const qRarityIndex = rarityOrder.indexOf(q.rarity);
    return qRarityIndex <= rarityIndex;
  });

  // Weighted pick favoring higher qualities for higher rarities
  const weights = validQualities.map((q) => {
    const qRarityIndex = rarityOrder.indexOf(q.rarity);
    // Boost weight for qualities matching the target rarity
    return q.weight * (qRarityIndex === rarityIndex ? 3 : 1);
  });

  return rng.weightedPick(validQualities, weights);
}

/**
 * Select style for item
 */
function getStyleForItem(rng: SeededRandom, tags: string[]): StylePool {
  // Prefer styles matching item tags
  const matchingStyles = STYLE_POOL.filter((style) => tags.some((tag) => style.tags.includes(tag)));

  if (matchingStyles.length > 0 && rng.bool(0.7)) {
    return rng.pick(matchingStyles);
  }

  return rng.pick(STYLE_POOL);
}

/**
 * Roll a rarity based on weights
 */
function rollRarity(rng: SeededRandom, weights: RarityWeights): ItemRarity {
  const rarities: ItemRarity[] = ['common', 'uncommon', 'rare', 'legendary'];
  const rarityWeights = [weights.common, weights.uncommon, weights.rare, weights.legendary];
  return rng.weightedPick(rarities, rarityWeights);
}

/**
 * Scale a stat value by level
 */
export function scaleStatByLevel(
  baseValue: number,
  level: number,
  scalingFactor: number = 0.15
): number {
  // Exponential scaling: value * (1 + scalingFactor)^(level-1)
  return Math.round(baseValue * (1 + scalingFactor) ** (level - 1));
}

/**
 * Calculate item value based on rarity and modifiers
 */
export function calculateItemValue(
  baseValue: number,
  rarity: ItemRarity,
  material: MaterialPool,
  quality: QualityPool,
  level: number
): number {
  const rarityMultipliers: Record<ItemRarity, number> = {
    common: 1.0,
    uncommon: 2.0,
    rare: 5.0,
    legendary: 15.0,
  };

  const scaledBase = scaleStatByLevel(baseValue, level, 0.2);
  const finalValue =
    scaledBase * rarityMultipliers[rarity] * material.valueMultiplier * quality.valueMultiplier;

  return Math.round(finalValue);
}

/**
 * Generate a random value within a range
 */
function randomInRange(rng: SeededRandom, range: StatRange): number {
  return rng.float(range[0], range[1]);
}

/**
 * Generate an integer value within a range
 */
function randomIntInRange(rng: SeededRandom, range: StatRange): number {
  return rng.int(Math.floor(range[0]), Math.ceil(range[1]));
}

// ============================================================================
// CORE GENERATORS
// ============================================================================

/**
 * Generated item result
 */
export interface GeneratedItem {
  item: BaseItem;
  templateId: string;
  material: MaterialPool;
  quality: QualityPool;
  style: StylePool;
  seed: number;
}

/**
 * Generate a weapon from template or default
 */
export function generateWeapon(
  rng: SeededRandom,
  level: number,
  tags: string[] = [],
  options: {
    weaponType?: WeaponType;
    templateId?: string;
    forceRarity?: ItemRarity;
  } = {}
): GeneratedItem {
  const itemSeed = rng.int(0, 0xffffffff);
  const itemRng = new SeededRandom(itemSeed);

  // Find appropriate template
  let template: ItemTemplate | undefined;
  if (options.templateId) {
    template = ITEM_TEMPLATES.find((t) => t.id === options.templateId && t.itemType === 'weapon');
  }
  if (!template && options.weaponType) {
    template = ITEM_TEMPLATES.find((t) => t.weaponType === options.weaponType);
  }
  if (!template) {
    // Pick random weapon template
    const weaponTemplates = ITEM_TEMPLATES.filter((t) => t.itemType === 'weapon');
    template =
      weaponTemplates.length > 0 ? itemRng.pick(weaponTemplates) : getDefaultWeaponTemplate();
  }

  // Roll rarity
  const rarity = options.forceRarity ?? rollRarity(itemRng, template.rarityWeights);

  // Get components
  const material = getMaterialForItem(itemRng, 'weapon', rarity, template.tags);
  const quality = getQualityForRarity(itemRng, rarity);
  const style = getStyleForItem(itemRng, template.tags);

  // Build name
  const weaponType = template.weaponType ?? 'revolver';
  const prefixes = WEAPON_PREFIXES[weaponType] ?? WEAPON_PREFIXES.revolver;
  const prefix = itemRng.pick(prefixes);
  const suffix = itemRng.pick(WEAPON_SUFFIXES);

  const qualityAdj = quality.adjective ? `${quality.adjective} ` : '';
  const materialName = material.id !== 'iron' && material.id !== 'steel' ? `${material.name} ` : '';
  const name = `${qualityAdj}${materialName}${prefix}${suffix ? ' ' + suffix : ''}`.trim();

  // Calculate stats with scaling
  const statMult = material.statMultiplier * quality.statMultiplier;
  const baseDamage = template.damageRange ? randomIntInRange(itemRng, template.damageRange) : 15;
  const damage = scaleStatByLevel(Math.round(baseDamage * statMult), level);

  const baseAccuracy = template.accuracyRange ? randomInRange(itemRng, template.accuracyRange) : 70;
  const accuracy = Math.min(
    100,
    Math.round(baseAccuracy * (1 + (quality.statMultiplier - 1) * 0.5))
  );

  const range = template.rangeRange ? randomIntInRange(itemRng, template.rangeRange) : 30;
  const fireRate = template.fireRateRange ? randomInRange(itemRng, template.fireRateRange) : 1.0;
  const clipSize = template.clipSizeRange ? randomIntInRange(itemRng, template.clipSizeRange) : 6;

  // Build description
  const templateVars: Record<string, string> = {
    material: material.name,
    quality: quality.name,
    style: style.name,
    weaponType: weaponType,
    damage: damage.toString(),
    accuracy: accuracy.toString(),
  };

  const descTemplate = itemRng.pick(template.descriptionTemplates);
  let description = substituteTemplate(descTemplate, templateVars);
  description = `${description} ${style.descriptionSuffix}`;

  // Calculate value
  const baseValue = template.valueRange ? randomIntInRange(itemRng, template.valueRange) : 25;
  const value = calculateItemValue(baseValue, rarity, material, quality, level);

  const item: WeaponItem = {
    id: `gen_weapon_${itemSeed.toString(16)}`,
    name,
    description,
    type: 'weapon',
    rarity,
    value,
    weight: template.weightRange ? randomInRange(itemRng, template.weightRange) : 2.5,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: weaponType,
    tags: [...template.tags, weaponType, rarity, material.id, style.id],
    effects: [],
    weaponStats: {
      weaponType,
      damage,
      range,
      accuracy,
      fireRate,
      ammoType: template.ammoType ?? 'pistol',
      clipSize,
      reloadTime: clipSize > 0 ? 2 + clipSize / 6 : 0,
    },
  };

  return {
    item,
    templateId: template.id,
    material,
    quality,
    style,
    seed: itemSeed,
  };
}

/**
 * Generate armor from template or default
 */
export function generateArmor(
  rng: SeededRandom,
  level: number,
  tags: string[] = [],
  options: {
    slot?: 'head' | 'body' | 'legs' | 'accessory';
    templateId?: string;
    forceRarity?: ItemRarity;
  } = {}
): GeneratedItem {
  const itemSeed = rng.int(0, 0xffffffff);
  const itemRng = new SeededRandom(itemSeed);

  // Find appropriate template
  let template: ItemTemplate | undefined;
  if (options.templateId) {
    template = ITEM_TEMPLATES.find((t) => t.id === options.templateId && t.itemType === 'armor');
  }
  if (!template && options.slot) {
    template = ITEM_TEMPLATES.find((t) => t.armorSlot === options.slot);
  }
  if (!template) {
    const armorTemplates = ITEM_TEMPLATES.filter((t) => t.itemType === 'armor');
    template = armorTemplates.length > 0 ? itemRng.pick(armorTemplates) : getDefaultArmorTemplate();
  }

  // Roll rarity
  const rarity = options.forceRarity ?? rollRarity(itemRng, template.rarityWeights);

  // Get components
  const material = getMaterialForItem(itemRng, 'armor', rarity, ['organic', 'flexible']);
  const quality = getQualityForRarity(itemRng, rarity);
  const style = getStyleForItem(itemRng, template.tags);

  // Build name
  const slot = template.armorSlot ?? options.slot ?? 'body';
  const prefixes = ARMOR_PREFIXES[slot] ?? ARMOR_PREFIXES.body;
  const prefix = itemRng.pick(prefixes);
  const suffix = itemRng.pick(ARMOR_SUFFIXES);

  const qualityAdj = quality.adjective ? `${quality.adjective} ` : '';
  const materialName =
    material.id !== 'leather' && material.id !== 'cloth' ? `${material.name} ` : '';
  const name = `${qualityAdj}${materialName}${prefix}${suffix ? ' ' + suffix : ''}`.trim();

  // Calculate stats
  const statMult = material.statMultiplier * quality.statMultiplier;
  const baseDefense = template.defenseRange ? randomIntInRange(itemRng, template.defenseRange) : 5;
  const defense = scaleStatByLevel(Math.round(baseDefense * statMult), level);

  const movementPenalty = template.movementPenaltyRange
    ? randomInRange(itemRng, template.movementPenaltyRange) / quality.statMultiplier
    : 0.1;

  // Build description
  const templateVars: Record<string, string> = {
    material: material.name,
    quality: quality.name,
    style: style.name,
    defense: defense.toString(),
    slot: slot,
  };

  const descTemplate = itemRng.pick(template.descriptionTemplates);
  let description = substituteTemplate(descTemplate, templateVars);
  description = `${description} ${style.descriptionSuffix}`;

  // Calculate value
  const baseValue = template.valueRange ? randomIntInRange(itemRng, template.valueRange) : 15;
  const value = calculateItemValue(baseValue, rarity, material, quality, level);

  const item: ArmorItem = {
    id: `gen_armor_${itemSeed.toString(16)}`,
    name,
    description,
    type: 'armor',
    rarity,
    value,
    weight: template.weightRange ? randomInRange(itemRng, template.weightRange) : 1.0,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: slot,
    tags: [...template.tags, slot, rarity, material.id, style.id],
    effects: [],
    armorStats: {
      defense,
      slot,
      movementPenalty: Math.max(0, Math.min(1, movementPenalty)),
    },
  };

  return {
    item,
    templateId: template.id,
    material,
    quality,
    style,
    seed: itemSeed,
  };
}

/**
 * Generate consumable from template or default
 */
export function generateConsumable(
  rng: SeededRandom,
  tags: string[] = [],
  options: {
    templateId?: string;
    forceRarity?: ItemRarity;
    consumableType?: 'healing' | 'food' | 'drink' | 'buff';
  } = {}
): GeneratedItem {
  const itemSeed = rng.int(0, 0xffffffff);
  const itemRng = new SeededRandom(itemSeed);

  // Find appropriate template
  let template: ItemTemplate | undefined;
  if (options.templateId) {
    template = ITEM_TEMPLATES.find(
      (t) => t.id === options.templateId && t.itemType === 'consumable'
    );
  }
  if (!template && options.consumableType) {
    template = ITEM_TEMPLATES.find(
      (t) => t.itemType === 'consumable' && t.tags.includes(options.consumableType!)
    );
  }
  if (!template) {
    const consumableTemplates = ITEM_TEMPLATES.filter((t) => t.itemType === 'consumable');
    template =
      consumableTemplates.length > 0
        ? itemRng.pick(consumableTemplates)
        : getDefaultConsumableTemplate();
  }

  // Roll rarity
  const rarity = options.forceRarity ?? rollRarity(itemRng, template.rarityWeights);

  // Get components (simplified for consumables)
  const quality = getQualityForRarity(itemRng, rarity);
  const style = getStyleForItem(itemRng, template.tags);
  const material = MATERIAL_POOL[0]; // Consumables don't really have materials

  // Determine consumable type from tags
  const consumableType =
    options.consumableType ??
    (template.tags.includes('healing')
      ? 'healing'
      : template.tags.includes('food')
        ? 'food'
        : template.tags.includes('drink')
          ? 'drink'
          : 'buff');

  // Build name
  const prefixes = CONSUMABLE_PREFIXES[consumableType] ?? CONSUMABLE_PREFIXES.healing;
  const prefix = itemRng.pick(prefixes);
  const suffix =
    consumableType === 'food' || consumableType === 'drink'
      ? ''
      : itemRng.pick(CONSUMABLE_SUFFIXES);

  const qualityAdj = quality.adjective && rarity !== 'common' ? `${quality.adjective} ` : '';
  const name = `${qualityAdj}${prefix}${suffix ? ' ' + suffix : ''}`.trim();

  // Calculate stats
  const statMult = quality.statMultiplier;
  const healAmount = template.healRange
    ? Math.round(randomIntInRange(itemRng, template.healRange) * statMult)
    : 20;
  const staminaAmount = template.staminaRange
    ? Math.round(randomIntInRange(itemRng, template.staminaRange) * statMult)
    : 0;
  const buffDuration = template.buffDurationRange
    ? Math.round(randomIntInRange(itemRng, template.buffDurationRange) * statMult)
    : 0;
  const buffStrength = template.buffStrengthRange
    ? Math.round(randomIntInRange(itemRng, template.buffStrengthRange) * statMult)
    : 0;

  // Build description
  const templateVars: Record<string, string> = {
    quality: quality.name,
    style: style.name,
    healAmount: healAmount.toString(),
    staminaAmount: staminaAmount.toString(),
    buffDuration: buffDuration.toString(),
    buffStrength: buffStrength.toString(),
  };

  const descTemplate = itemRng.pick(template.descriptionTemplates);
  const description = substituteTemplate(descTemplate, templateVars);

  // Calculate value
  const baseValue = template.valueRange ? randomIntInRange(itemRng, template.valueRange) : 5;
  const rarityMult: Record<ItemRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    legendary: 5,
  };
  const value = Math.round(baseValue * quality.valueMultiplier * rarityMult[rarity]);

  const item: ConsumableItem = {
    id: `gen_consumable_${itemSeed.toString(16)}`,
    name,
    description,
    type: 'consumable',
    rarity,
    value,
    weight: template.weightRange ? randomInRange(itemRng, template.weightRange) : 0.3,
    stackable: true,
    maxStack: 10,
    usable: true,
    droppable: true,
    sellable: true,
    icon: consumableType === 'drink' ? 'bottle' : consumableType === 'food' ? 'food' : 'medicine',
    tags: [...template.tags, consumableType, rarity],
    effects: healAmount > 0 ? [{ type: 'heal', value: healAmount }] : [],
    consumableStats: {
      healAmount,
      staminaAmount,
      buffType: (template.buffType as any) ?? 'none',
      buffDuration,
      buffStrength,
    },
  };

  return {
    item,
    templateId: template.id,
    material,
    quality,
    style,
    seed: itemSeed,
  };
}

/**
 * Generate loot from a loot table
 */
export function generateLoot(
  rng: SeededRandom,
  lootTableId: string,
  level: number,
  context?: GenerationContext
): GeneratedItem[] {
  const table = LOOT_TABLES.find((t) => t.id === lootTableId);
  if (!table) {
    console.warn(`Loot table not found: ${lootTableId}`);
    return [];
  }

  const results: GeneratedItem[] = [];

  for (let roll = 0; roll < table.rolls; roll++) {
    // Check empty chance
    if (rng.bool(table.emptyChance)) {
      continue;
    }

    // Filter entries by level
    const validEntries = table.entries.filter((entry) => {
      const [minLevel, maxLevel] = entry.levelRange;
      return level >= minLevel && level <= maxLevel;
    });

    if (validEntries.length === 0) {
      continue;
    }

    // Weighted pick
    const weights = validEntries.map((e) => e.weight);
    const entry = rng.weightedPick(validEntries, weights);

    // Generate item(s)
    const quantity = randomIntInRange(rng, entry.quantityRange);

    for (let i = 0; i < quantity; i++) {
      if (entry.isTemplate) {
        // Generate from template
        const template = ITEM_TEMPLATES.find((t) => t.id === entry.templateOrItemId);
        if (template) {
          let generated: GeneratedItem;
          switch (template.itemType) {
            case 'weapon':
              generated = generateWeapon(rng, level, entry.tags);
              break;
            case 'armor':
              generated = generateArmor(rng, level, entry.tags);
              break;
            case 'consumable':
              generated = generateConsumable(rng, entry.tags);
              break;
            default:
              continue;
          }
          results.push(generated);
        }
      } else {
        // This is a direct item reference - would need to look up from item library
        // For now, skip direct references as they should use the existing item system
        console.warn(`Direct item reference in loot table: ${entry.templateOrItemId}`);
      }
    }
  }

  return results;
}

/**
 * Shop inventory item with price
 */
export interface ShopInventoryItem {
  item: BaseItem;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  generated: GeneratedItem;
}

/**
 * Generate shop inventory based on shop type and level
 */
export function generateShopInventory(
  rng: SeededRandom,
  shopType: string,
  level: number,
  context?: GenerationContext
): ShopInventoryItem[] {
  const shopTemplate = getShopTemplate(shopType);
  if (!shopTemplate) {
    console.warn(`Shop template not found: ${shopType}`);
    return [];
  }

  const inventory: ShopInventoryItem[] = [];

  for (const pool of shopTemplate.itemPools) {
    const count = randomIntInRange(rng, pool.countRange);

    for (let i = 0; i < count; i++) {
      // Roll rarity based on pool weights
      const rarity = rollRarity(rng, pool.rarityWeights);

      // Determine item type from tags
      let generated: GeneratedItem | null = null;

      if (pool.tags.some((t) => ['weapon', 'pistol', 'revolver', 'rifle', 'shotgun'].includes(t))) {
        generated = generateWeapon(rng, level, pool.tags, { forceRarity: rarity });
      } else if (pool.tags.some((t) => ['armor', 'clothing', 'apparel'].includes(t))) {
        generated = generateArmor(rng, level, pool.tags, { forceRarity: rarity });
      } else if (
        pool.tags.some((t) =>
          ['consumable', 'food', 'drink', 'medicine', 'tonic', 'healing'].includes(t)
        )
      ) {
        generated = generateConsumable(rng, pool.tags, { forceRarity: rarity });
      }

      if (generated) {
        const buyPrice = Math.round(generated.item.value * shopTemplate.buyMultiplier);
        const sellPrice = Math.round(generated.item.value * shopTemplate.sellMultiplier);

        inventory.push({
          item: generated.item,
          quantity: 1,
          buyPrice,
          sellPrice,
          generated,
        });
      }
    }
  }

  return inventory;
}

// ============================================================================
// DEFAULT TEMPLATES
// ============================================================================

function getDefaultWeaponTemplate(): ItemTemplate {
  return {
    id: 'default_weapon',
    name: 'Default Weapon',
    itemType: 'weapon',
    rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    namePatterns: ['{{quality}} {{material}} {{weaponType}}'],
    descriptionTemplates: ['A {{quality}} {{material}} weapon dealing {{damage}} damage.'],
    valueRange: [10, 100],
    weightRange: [1.0, 5.0],
    tags: ['weapon'],
    levelRange: [1, 10],
    weaponType: 'revolver',
    damageRange: [10, 25],
    accuracyRange: [60, 85],
    rangeRange: [20, 50],
    fireRateRange: [0.5, 2.0],
    ammoType: 'pistol',
    clipSizeRange: [5, 8],
    allowedMaterials: ['iron', 'steel', 'brass'],
    allowedStyles: ['frontier', 'military', 'rugged'],
  };
}

function getDefaultArmorTemplate(): ItemTemplate {
  return {
    id: 'default_armor',
    name: 'Default Armor',
    itemType: 'armor',
    rarityWeights: { common: 65, uncommon: 28, rare: 6, legendary: 1 },
    namePatterns: ['{{quality}} {{material}} {{slot}}'],
    descriptionTemplates: ['{{quality}} {{material}} protection with {{defense}} defense.'],
    valueRange: [5, 75],
    weightRange: [0.5, 3.0],
    tags: ['armor'],
    levelRange: [1, 10],
    armorSlot: 'body',
    defenseRange: [3, 15],
    movementPenaltyRange: [0, 0.2],
    allowedMaterials: ['leather', 'cloth', 'reinforced_leather'],
    allowedStyles: ['frontier', 'rugged'],
  };
}

function getDefaultConsumableTemplate(): ItemTemplate {
  return {
    id: 'default_consumable',
    name: 'Default Consumable',
    itemType: 'consumable',
    rarityWeights: { common: 70, uncommon: 25, rare: 4, legendary: 1 },
    namePatterns: ['{{quality}} {{type}}'],
    descriptionTemplates: ['Restores {{healAmount}} health and {{staminaAmount}} stamina.'],
    valueRange: [1, 20],
    weightRange: [0.1, 0.5],
    tags: ['consumable', 'healing'],
    levelRange: [1, 10],
    healRange: [10, 50],
    staminaRange: [0, 30],
    allowedMaterials: [],
    allowedStyles: ['frontier'],
  };
}

function getDefaultItemTemplates(): ItemTemplate[] {
  return [
    // Weapons
    {
      id: 'revolver_template',
      name: 'Revolver Template',
      itemType: 'weapon',
      rarityWeights: { common: 55, uncommon: 32, rare: 10, legendary: 3 },
      namePatterns: ['{{quality}} {{material}} Revolver', '{{quality}} Six-Shooter'],
      descriptionTemplates: [
        'A {{material}} revolver with excellent balance. Deals {{damage}} damage at {{accuracy}}% accuracy.',
        'This trusty sidearm has seen many frontier battles.',
      ],
      valueRange: [20, 80],
      weightRange: [2.0, 3.0],
      tags: ['weapon', 'firearm', 'pistol'],
      levelRange: [1, 10],
      weaponType: 'revolver',
      damageRange: [12, 25],
      accuracyRange: [65, 85],
      rangeRange: [25, 40],
      fireRateRange: [1.2, 2.0],
      ammoType: 'pistol',
      clipSizeRange: [5, 8],
      allowedMaterials: ['iron', 'steel', 'brass', 'silver'],
      allowedStyles: ['frontier', 'military', 'ornate'],
    },
    {
      id: 'rifle_template',
      name: 'Rifle Template',
      itemType: 'weapon',
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
      namePatterns: ['{{quality}} {{material}} Rifle', '{{quality}} Repeater'],
      descriptionTemplates: [
        'A precision {{material}} rifle for long-range engagements. {{damage}} damage at {{accuracy}}% accuracy.',
        'Perfect for hunting game or defending the homestead.',
      ],
      valueRange: [40, 150],
      weightRange: [3.5, 5.0],
      tags: ['weapon', 'firearm', 'rifle', 'long_gun'],
      levelRange: [1, 10],
      weaponType: 'rifle',
      damageRange: [20, 40],
      accuracyRange: [75, 92],
      rangeRange: [80, 150],
      fireRateRange: [0.4, 1.2],
      ammoType: 'rifle',
      clipSizeRange: [5, 15],
      allowedMaterials: ['iron', 'steel', 'damascus_steel'],
      allowedStyles: ['frontier', 'military', 'elegant'],
    },
    {
      id: 'knife_template',
      name: 'Knife Template',
      itemType: 'weapon',
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
      namePatterns: ['{{quality}} {{material}} Knife', '{{quality}} Bowie Knife'],
      descriptionTemplates: [
        'A sharp {{material}} blade for close combat. {{damage}} damage.',
        'Every frontiersman needs a good knife.',
      ],
      valueRange: [5, 40],
      weightRange: [0.4, 1.2],
      tags: ['weapon', 'melee', 'blade'],
      levelRange: [1, 10],
      weaponType: 'knife',
      damageRange: [6, 18],
      accuracyRange: [80, 95],
      rangeRange: [0, 0],
      fireRateRange: [1.5, 2.5],
      ammoType: 'none',
      clipSizeRange: [0, 0],
      allowedMaterials: ['iron', 'steel', 'damascus_steel'],
      allowedStyles: ['frontier', 'rugged', 'ornate'],
    },
    // Armor
    {
      id: 'body_armor_template',
      name: 'Body Armor Template',
      itemType: 'armor',
      rarityWeights: { common: 55, uncommon: 32, rare: 10, legendary: 3 },
      namePatterns: ['{{quality}} {{material}} Vest', '{{quality}} Duster'],
      descriptionTemplates: [
        'A {{material}} vest providing {{defense}} defense against harm.',
        'Rugged protection for the frontier traveler.',
      ],
      valueRange: [15, 100],
      weightRange: [1.0, 3.0],
      tags: ['armor', 'body', 'torso'],
      levelRange: [1, 10],
      armorSlot: 'body',
      defenseRange: [5, 20],
      movementPenaltyRange: [0, 0.15],
      allowedMaterials: ['leather', 'reinforced_leather', 'cloth'],
      allowedStyles: ['frontier', 'rugged', 'elegant'],
    },
    {
      id: 'accessory_template',
      name: 'Accessory Template',
      itemType: 'armor',
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
      namePatterns: ['{{quality}} {{material}} Accessory', '{{quality}} Trinket'],
      descriptionTemplates: [
        'A {{quality}} accessory that provides subtle benefits.',
        'A lucky charm from the frontier.',
      ],
      valueRange: [10, 80],
      weightRange: [0.1, 0.5],
      tags: ['armor', 'accessory', 'trinket'],
      levelRange: [1, 10],
      armorSlot: 'accessory',
      defenseRange: [0, 5],
      movementPenaltyRange: [0, 0],
      allowedMaterials: ['leather', 'brass', 'silver', 'gold'],
      allowedStyles: ['frontier', 'ornate', 'elegant', 'steampunk'],
    },
    // Consumables
    {
      id: 'healing_tonic_template',
      name: 'Healing Tonic Template',
      itemType: 'consumable',
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
      namePatterns: ['{{quality}} Healing Tonic', '{{quality}} Medicine'],
      descriptionTemplates: [
        'A {{quality}} tonic that restores {{healAmount}} health.',
        'Frontier medicine at its finest.',
      ],
      valueRange: [3, 25],
      weightRange: [0.2, 0.4],
      tags: ['consumable', 'healing', 'medical'],
      levelRange: [1, 10],
      healRange: [15, 60],
      staminaRange: [0, 10],
      buffType: 'health_regen',
      buffDurationRange: [30, 120],
      buffStrengthRange: [1, 5],
      allowedMaterials: [],
      allowedStyles: ['frontier'],
    },
    {
      id: 'food_template',
      name: 'Food Template',
      itemType: 'consumable',
      rarityWeights: { common: 75, uncommon: 22, rare: 3, legendary: 0 },
      namePatterns: ['{{quality}} Trail Food', '{{quality}} Rations'],
      descriptionTemplates: [
        '{{quality}} food that restores {{healAmount}} health and {{staminaAmount}} stamina.',
        'Sustenance for the long trail ahead.',
      ],
      valueRange: [1, 10],
      weightRange: [0.2, 0.5],
      tags: ['consumable', 'food'],
      levelRange: [1, 10],
      healRange: [5, 25],
      staminaRange: [10, 40],
      allowedMaterials: [],
      allowedStyles: ['frontier'],
    },
    {
      id: 'buff_elixir_template',
      name: 'Buff Elixir Template',
      itemType: 'consumable',
      rarityWeights: { common: 40, uncommon: 40, rare: 15, legendary: 5 },
      namePatterns: ['{{quality}} Stimulant', '{{quality}} Elixir'],
      descriptionTemplates: [
        'A potent {{quality}} elixir providing {{buffStrength}}% boost for {{buffDuration}} seconds.',
        'Liquid courage from the frontier.',
      ],
      valueRange: [10, 50],
      weightRange: [0.2, 0.3],
      tags: ['consumable', 'buff'],
      levelRange: [1, 10],
      healRange: [0, 10],
      staminaRange: [20, 50],
      buffType: 'damage_boost',
      buffDurationRange: [60, 300],
      buffStrengthRange: [5, 25],
      allowedMaterials: [],
      allowedStyles: ['frontier', 'steampunk'],
    },
  ];
}

function getDefaultLootTables(): ProceduralLootTable[] {
  return [
    {
      id: 'common_enemy_loot',
      name: 'Common Enemy Loot',
      entries: [
        {
          templateOrItemId: 'healing_tonic_template',
          isTemplate: true,
          weight: 30,
          quantityRange: [1, 2],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'food_template',
          isTemplate: true,
          weight: 25,
          quantityRange: [1, 3],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'knife_template',
          isTemplate: true,
          weight: 10,
          quantityRange: [1, 1],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'revolver_template',
          isTemplate: true,
          weight: 5,
          quantityRange: [1, 1],
          levelRange: [1, 10],
          tags: [],
        },
      ],
      rolls: 2,
      emptyChance: 0.2,
      tags: ['enemy', 'common'],
    },
    {
      id: 'outlaw_loot',
      name: 'Outlaw Loot',
      entries: [
        {
          templateOrItemId: 'revolver_template',
          isTemplate: true,
          weight: 25,
          quantityRange: [1, 1],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'knife_template',
          isTemplate: true,
          weight: 20,
          quantityRange: [1, 1],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'healing_tonic_template',
          isTemplate: true,
          weight: 20,
          quantityRange: [1, 2],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'buff_elixir_template',
          isTemplate: true,
          weight: 10,
          quantityRange: [1, 1],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'body_armor_template',
          isTemplate: true,
          weight: 5,
          quantityRange: [1, 1],
          levelRange: [1, 10],
          tags: [],
        },
      ],
      rolls: 3,
      emptyChance: 0.1,
      tags: ['enemy', 'outlaw', 'bandit'],
    },
    {
      id: 'treasure_chest',
      name: 'Treasure Chest',
      entries: [
        {
          templateOrItemId: 'revolver_template',
          isTemplate: true,
          weight: 20,
          quantityRange: [1, 1],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'rifle_template',
          isTemplate: true,
          weight: 15,
          quantityRange: [1, 1],
          levelRange: [3, 10],
          tags: [],
        },
        {
          templateOrItemId: 'body_armor_template',
          isTemplate: true,
          weight: 15,
          quantityRange: [1, 1],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'accessory_template',
          isTemplate: true,
          weight: 20,
          quantityRange: [1, 1],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'buff_elixir_template',
          isTemplate: true,
          weight: 15,
          quantityRange: [1, 2],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'healing_tonic_template',
          isTemplate: true,
          weight: 15,
          quantityRange: [2, 4],
          levelRange: [1, 10],
          tags: [],
        },
      ],
      rolls: 4,
      emptyChance: 0,
      tags: ['treasure', 'chest', 'hidden'],
    },
    {
      id: 'mining_loot',
      name: 'Mining Area Loot',
      entries: [
        {
          templateOrItemId: 'healing_tonic_template',
          isTemplate: true,
          weight: 25,
          quantityRange: [1, 2],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'food_template',
          isTemplate: true,
          weight: 30,
          quantityRange: [1, 3],
          levelRange: [1, 10],
          tags: [],
        },
        {
          templateOrItemId: 'knife_template',
          isTemplate: true,
          weight: 15,
          quantityRange: [1, 1],
          levelRange: [1, 10],
          tags: ['mining'],
        },
      ],
      rolls: 2,
      emptyChance: 0.3,
      tags: ['mining', 'industrial'],
    },
  ];
}

// ============================================================================
// TEMPLATE/TABLE ACCESSORS
// ============================================================================
export function getItemTemplate(id: string): ItemTemplate | undefined {
  return ITEM_TEMPLATES.find((t) => t.id === id);
}

export function getItemTemplatesByType(itemType: string): ItemTemplate[] {
  return ITEM_TEMPLATES.filter((t) => t.itemType === itemType);
}

export function getLootTable(id: string): ProceduralLootTable | undefined {
  return LOOT_TABLES.find((t) => t.id === id);
}

export function getLootTablesByTag(tag: string): ProceduralLootTable[] {
  return LOOT_TABLES.filter((t) => t.tags.includes(tag));
}
