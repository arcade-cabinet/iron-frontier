/**
 * Default Loot Tables - Built-in loot table definitions
 */

import type { ProceduralLootTable } from './schemas.ts';

/**
 * Get default loot tables for the generation system
 */
export function getDefaultLootTables(): ProceduralLootTable[] {
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
