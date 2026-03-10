/**
 * Item Generation Registry - Template and pool registries with initialization
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
import { getDefaultItemTemplates } from './defaultTemplates.ts';
import { getDefaultLootTables } from './defaultLootTables.ts';

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
