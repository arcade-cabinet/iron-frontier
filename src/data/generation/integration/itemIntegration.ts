import type { BaseItem, WeaponItem, ArmorItem, ConsumableItem } from '../../schemas/item';
import type { ItemTemplate } from '../generators/itemGenerator';

/**
 * Convert a static BaseItem definition to a procedural ItemTemplate
 * This allows static items to be dropped by the procedural system
 */
export function convertItemToTemplate(item: BaseItem): ItemTemplate {
  const template: ItemTemplate = {
    id: item.id,
    name: item.name,
    itemType: item.type as any, // 'weapon' | 'armor' | 'consumable' ...
    rarityWeights: {
      common: item.rarity === 'common' ? 100 : 0,
      uncommon: item.rarity === 'uncommon' ? 100 : 0,
      rare: item.rarity === 'rare' ? 100 : 0,
      legendary: item.rarity === 'legendary' ? 100 : 0,
    },
    namePatterns: [item.name], // Fixed name
    descriptionTemplates: [item.description || ''],
    valueRange: [item.value, item.value],
    weightRange: [item.weight, item.weight],
    tags: item.tags || [],
    levelRange: [1, 20], // Available at all levels
    allowedMaterials: [], // Not used for static
    allowedStyles: [],    // Not used for static
  };

  // Type specific mappings
  if (item.type === 'weapon') {
    const weapon = item as WeaponItem;
    template.weaponType = weapon.weaponStats.weaponType;
    template.damageRange = [weapon.weaponStats.damage, weapon.weaponStats.damage];
    template.accuracyRange = [weapon.weaponStats.accuracy, weapon.weaponStats.accuracy];
    template.rangeRange = [weapon.weaponStats.range, weapon.weaponStats.range];
    template.fireRateRange = [weapon.weaponStats.fireRate, weapon.weaponStats.fireRate];
    template.ammoType = weapon.weaponStats.ammoType;
    template.clipSizeRange = [weapon.weaponStats.clipSize, weapon.weaponStats.clipSize];
  } else if (item.type === 'armor') {
    const armor = item as ArmorItem;
    template.armorSlot = armor.armorStats.slot;
    template.defenseRange = [armor.armorStats.defense, armor.armorStats.defense];
    template.movementPenaltyRange = [armor.armorStats.movementPenalty, armor.armorStats.movementPenalty];
  } else if (item.type === 'consumable') {
    const cons = item as ConsumableItem;
    template.healRange = [cons.consumableStats.healAmount, cons.consumableStats.healAmount];
    template.staminaRange = [cons.consumableStats.staminaAmount, cons.consumableStats.staminaAmount];
    template.buffType = cons.consumableStats.buffType;
    template.buffDurationRange = [cons.consumableStats.buffDuration, cons.consumableStats.buffDuration];
    template.buffStrengthRange = [cons.consumableStats.buffStrength, cons.consumableStats.buffStrength];
  }

  return template;
}

export function convertItemsToTemplates(items: BaseItem[]): ItemTemplate[] {
  return items.map(convertItemToTemplate);
}
