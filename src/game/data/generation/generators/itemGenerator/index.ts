/**
 * Item Generator - Barrel export for procedural item generation system
 */

// Schemas and types
export {
  type GeneratedItem,
  type ItemTemplate,
  ItemTemplateSchema,
  type LootTableEntry,
  LootTableEntrySchema,
  type MaterialPool,
  type ProceduralLootTable,
  ProceduralLootTableSchema,
  type QualityPool,
  type RarityWeights,
  RarityWeightsSchema,
  type ShopInventoryItem,
  type StatRange,
  StatRangeSchema,
  type StylePool,
} from './schemas.ts';

// Pools and name data
export {
  ARMOR_PREFIXES,
  ARMOR_SUFFIXES,
  CONSUMABLE_PREFIXES,
  CONSUMABLE_SUFFIXES,
  DEFAULT_MATERIALS,
  DEFAULT_QUALITIES,
  DEFAULT_STYLES,
  WEAPON_PREFIXES,
  WEAPON_SUFFIXES,
} from './pools.ts';

// Helpers and initialization
export {
  calculateItemValue,
  getItemTemplate,
  getItemTemplatesByType,
  getLootTable,
  getLootTablesByTag,
  initItemGeneration,
  scaleStatByLevel,
} from './helpers.ts';

// Generators
export { generateWeapon } from './weaponGenerator.ts';
export { generateArmor } from './armorGenerator.ts';
export { generateConsumable } from './consumableGenerator.ts';
export { generateLoot, generateShopInventory } from './lootGenerator.ts';
