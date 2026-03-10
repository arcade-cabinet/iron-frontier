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

// Registry, helpers, and initialization
export {
  calculateItemValue,
  getItemTemplate,
  getItemTemplatesByType,
  getLootTable,
  getLootTablesByTag,
  initItemGeneration,
  scaleStatByLevel,
  getMaterialForItem,
  getMaterialPoolRegistry,
  getQualityForRarity,
  getQualityPoolRegistry,
  getStyleForItem,
  getStylePoolRegistry,
  getItemTemplatesRegistry,
  getLootTablesRegistry,
  randomInRange,
  randomIntInRange,
  rollRarity,
} from './registry.ts';

// Default template accessors
export {
  getDefaultWeaponTemplate,
  getDefaultArmorTemplate,
  getDefaultConsumableTemplate,
  getDefaultItemTemplates,
} from './defaultTemplates.ts';

// Default loot tables
export { getDefaultLootTables } from './defaultLootTables.ts';

// Generators
export { generateWeapon } from './weaponGenerator.ts';
export { generateArmor } from './armorGenerator.ts';
export { generateConsumable } from './consumableGenerator.ts';
export { generateLoot, generateShopInventory } from './lootGenerator.ts';
