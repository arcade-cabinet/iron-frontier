/**
 * Item Generation Helpers - Shared utility functions for item generation
 */

import type { ItemRarity } from '../../../schemas/item';
import { SeededRandom } from '../../seededRandom';
import {
  DEFAULT_MATERIALS,
  DEFAULT_QUALITIES,
  DEFAULT_STYLES,
} from './pools.ts';
import type {
  ItemTemplate,
  MaterialPool,
  ProceduralLootTable,
  QualityPool,
  RarityWeights,
  StatRange,
  StylePool,
} from './schemas.ts';

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
// REGISTRY ACCESSORS
// ============================================================================

export function getItemTemplatesRegistry(): ItemTemplate[] {
  return ITEM_TEMPLATES;
}

export function getLootTablesRegistry(): ProceduralLootTable[] {
  return LOOT_TABLES;
}

export function getMaterialPoolRegistry(): MaterialPool[] {
  return MATERIAL_POOL;
}

export function getQualityPoolRegistry(): QualityPool[] {
  return QUALITY_POOL;
}

export function getStylePoolRegistry(): StylePool[] {
  return STYLE_POOL;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get material appropriate for item type and rarity
 */
export function getMaterialForItem(
  rng: SeededRandom,
  _itemType: string,
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
export function getQualityForRarity(rng: SeededRandom, rarity: ItemRarity): QualityPool {
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
export function getStyleForItem(rng: SeededRandom, tags: string[]): StylePool {
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
export function rollRarity(rng: SeededRandom, weights: RarityWeights): ItemRarity {
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
export function randomInRange(rng: SeededRandom, range: StatRange): number {
  return rng.float(range[0], range[1]);
}

/**
 * Generate an integer value within a range
 */
export function randomIntInRange(rng: SeededRandom, range: StatRange): number {
  return rng.int(Math.floor(range[0]), Math.ceil(range[1]));
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

// ============================================================================
// DEFAULT TEMPLATES (imported by initItemGeneration)
// ============================================================================

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
        { templateOrItemId: 'healing_tonic_template', isTemplate: true, weight: 30, quantityRange: [1, 2], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'food_template', isTemplate: true, weight: 25, quantityRange: [1, 3], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'knife_template', isTemplate: true, weight: 10, quantityRange: [1, 1], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'revolver_template', isTemplate: true, weight: 5, quantityRange: [1, 1], levelRange: [1, 10], tags: [] },
      ],
      rolls: 2,
      emptyChance: 0.2,
      tags: ['enemy', 'common'],
    },
    {
      id: 'outlaw_loot',
      name: 'Outlaw Loot',
      entries: [
        { templateOrItemId: 'revolver_template', isTemplate: true, weight: 25, quantityRange: [1, 1], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'knife_template', isTemplate: true, weight: 20, quantityRange: [1, 1], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'healing_tonic_template', isTemplate: true, weight: 20, quantityRange: [1, 2], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'buff_elixir_template', isTemplate: true, weight: 10, quantityRange: [1, 1], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'body_armor_template', isTemplate: true, weight: 5, quantityRange: [1, 1], levelRange: [1, 10], tags: [] },
      ],
      rolls: 3,
      emptyChance: 0.1,
      tags: ['enemy', 'outlaw', 'bandit'],
    },
    {
      id: 'treasure_chest',
      name: 'Treasure Chest',
      entries: [
        { templateOrItemId: 'revolver_template', isTemplate: true, weight: 20, quantityRange: [1, 1], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'rifle_template', isTemplate: true, weight: 15, quantityRange: [1, 1], levelRange: [3, 10], tags: [] },
        { templateOrItemId: 'body_armor_template', isTemplate: true, weight: 15, quantityRange: [1, 1], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'accessory_template', isTemplate: true, weight: 20, quantityRange: [1, 1], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'buff_elixir_template', isTemplate: true, weight: 15, quantityRange: [1, 2], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'healing_tonic_template', isTemplate: true, weight: 15, quantityRange: [2, 4], levelRange: [1, 10], tags: [] },
      ],
      rolls: 4,
      emptyChance: 0,
      tags: ['treasure', 'chest', 'hidden'],
    },
    {
      id: 'mining_loot',
      name: 'Mining Area Loot',
      entries: [
        { templateOrItemId: 'healing_tonic_template', isTemplate: true, weight: 25, quantityRange: [1, 2], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'food_template', isTemplate: true, weight: 30, quantityRange: [1, 3], levelRange: [1, 10], tags: [] },
        { templateOrItemId: 'knife_template', isTemplate: true, weight: 15, quantityRange: [1, 1], levelRange: [1, 10], tags: ['mining'] },
      ],
      rolls: 2,
      emptyChance: 0.3,
      tags: ['mining', 'industrial'],
    },
  ];
}

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

export { getDefaultWeaponTemplate };

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

export { getDefaultArmorTemplate };

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

export { getDefaultConsumableTemplate };
