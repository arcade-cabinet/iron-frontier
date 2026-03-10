/**
 * Armor Generator - Procedural armor generation
 */

import { substituteTemplate } from '../../../schemas/generation';
import type { ArmorItem, ItemRarity } from '../../../schemas/item';
import { SeededRandom } from '../../seededRandom';
import {
  calculateItemValue,
  getDefaultArmorTemplate,
  getItemTemplatesRegistry,
  getMaterialForItem,
  getQualityForRarity,
  getStyleForItem,
  randomInRange,
  randomIntInRange,
  rollRarity,
  scaleStatByLevel,
} from './helpers.ts';
import { ARMOR_PREFIXES, ARMOR_SUFFIXES } from './pools.ts';
import type { GeneratedItem, ItemTemplate } from './schemas.ts';

/**
 * Generate armor from template or default
 */
export function generateArmor(
  rng: SeededRandom,
  level: number,
  _tags: string[] = [],
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
    template = getItemTemplatesRegistry().find(
      (t) => t.id === options.templateId && t.itemType === 'armor'
    );
  }
  if (!template && options.slot) {
    template = getItemTemplatesRegistry().find((t) => t.armorSlot === options.slot);
  }
  if (!template) {
    const armorTemplates = getItemTemplatesRegistry().filter((t) => t.itemType === 'armor');
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
  const prefixes = ARMOR_PREFIXES[slot] ?? ARMOR_PREFIXES['body'];
  const prefix = itemRng.pick(prefixes);
  const suffix = itemRng.pick(ARMOR_SUFFIXES);

  const qualityAdj = quality.adjective ? `${quality.adjective} ` : '';
  const materialName =
    material.id !== 'leather' && material.id !== 'cloth' ? `${material.name} ` : '';
  const name = `${qualityAdj}${materialName}${prefix}${suffix ? ` ${suffix}` : ''}`.trim();

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
