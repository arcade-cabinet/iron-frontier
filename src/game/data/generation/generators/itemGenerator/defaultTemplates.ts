/**
 * Default Item Templates - Built-in weapon, armor, and consumable templates
 */

import type { ItemTemplate } from './schemas.ts';

/**
 * Get default item templates for the generation system
 */
export function getDefaultItemTemplates(): ItemTemplate[] {
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

/**
 * Get default weapon template fallback
 */
export function getDefaultWeaponTemplate(): ItemTemplate {
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

/**
 * Get default armor template fallback
 */
export function getDefaultArmorTemplate(): ItemTemplate {
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

/**
 * Get default consumable template fallback
 */
export function getDefaultConsumableTemplate(): ItemTemplate {
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
