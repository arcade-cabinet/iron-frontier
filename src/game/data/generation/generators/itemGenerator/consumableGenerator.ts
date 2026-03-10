/**
 * Consumable Generator - Procedural consumable item generation
 */

import { substituteTemplate } from '../../../schemas/generation';
import type { ConsumableItem, ItemRarity } from '../../../schemas/item';
import { SeededRandom } from '../../seededRandom';
import {
  getDefaultConsumableTemplate,
  getItemTemplatesRegistry,
  getMaterialPoolRegistry,
  getQualityForRarity,
  getStyleForItem,
  randomInRange,
  randomIntInRange,
  rollRarity,
} from './helpers.ts';
import { CONSUMABLE_PREFIXES, CONSUMABLE_SUFFIXES } from './pools.ts';
import type { GeneratedItem, ItemTemplate } from './schemas.ts';

/**
 * Generate consumable from template or default
 */
export function generateConsumable(
  rng: SeededRandom,
  _tags: string[] = [],
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
    template = getItemTemplatesRegistry().find(
      (t) => t.id === options.templateId && t.itemType === 'consumable'
    );
  }
  if (!template && options.consumableType) {
    template = getItemTemplatesRegistry().find(
      (t) => t.itemType === 'consumable' && t.tags.includes(options.consumableType!)
    );
  }
  if (!template) {
    const consumableTemplates = getItemTemplatesRegistry().filter(
      (t) => t.itemType === 'consumable'
    );
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
  const material = getMaterialPoolRegistry()[0]; // Consumables don't really have materials

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
  const prefixes = CONSUMABLE_PREFIXES[consumableType] ?? CONSUMABLE_PREFIXES['healing'];
  const prefix = itemRng.pick(prefixes);
  const suffix =
    consumableType === 'food' || consumableType === 'drink'
      ? ''
      : itemRng.pick(CONSUMABLE_SUFFIXES);

  const qualityAdj = quality.adjective && rarity !== 'common' ? `${quality.adjective} ` : '';
  const name = `${qualityAdj}${prefix}${suffix ? ` ${suffix}` : ''}`.trim();

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
