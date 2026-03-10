/**
 * Weapon Generator - Procedural weapon generation
 */

import { substituteTemplate } from '../../../schemas/generation';
import type { ItemRarity, WeaponItem, WeaponType } from '../../../schemas/item';
import { SeededRandom } from '../../seededRandom';
import {
  calculateItemValue,
  getItemTemplatesRegistry,
  getMaterialForItem,
  getQualityForRarity,
  getStyleForItem,
  getDefaultWeaponTemplate,
  randomInRange,
  randomIntInRange,
  rollRarity,
  scaleStatByLevel,
} from './helpers.ts';
import { WEAPON_PREFIXES, WEAPON_SUFFIXES } from './pools.ts';
import type { GeneratedItem, ItemTemplate } from './schemas.ts';

/**
 * Generate a weapon from template or default
 */
export function generateWeapon(
  rng: SeededRandom,
  level: number,
  _tags: string[] = [],
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
    template = getItemTemplatesRegistry().find(
      (t) => t.id === options.templateId && t.itemType === 'weapon'
    );
  }
  if (!template && options.weaponType) {
    template = getItemTemplatesRegistry().find((t) => t.weaponType === options.weaponType);
  }
  if (!template) {
    // Pick random weapon template
    const weaponTemplates = getItemTemplatesRegistry().filter((t) => t.itemType === 'weapon');
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
  const prefixes = WEAPON_PREFIXES[weaponType] ?? WEAPON_PREFIXES['revolver'];
  const prefix = itemRng.pick(prefixes);
  const suffix = itemRng.pick(WEAPON_SUFFIXES);

  const qualityAdj = quality.adjective ? `${quality.adjective} ` : '';
  const materialName = material.id !== 'iron' && material.id !== 'steel' ? `${material.name} ` : '';
  const name = `${qualityAdj}${materialName}${prefix}${suffix ? ` ${suffix}` : ''}`.trim();

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
