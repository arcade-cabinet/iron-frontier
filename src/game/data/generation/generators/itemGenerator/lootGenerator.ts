/**
 * Loot and Shop Generator - Loot table rolling and shop inventory generation
 */

import type { GenerationContext } from '../../../schemas/generation';
import { SeededRandom } from '../../seededRandom';
import { getShopTemplate } from '../../templates/shopTemplates';
import { generateArmor } from './armorGenerator.ts';
import { generateConsumable } from './consumableGenerator.ts';
import {
  getItemTemplatesRegistry,
  getLootTablesRegistry,
  randomIntInRange,
  rollRarity,
} from './registry.ts';
import type { GeneratedItem, ShopInventoryItem } from './schemas.ts';
import { generateWeapon } from './weaponGenerator.ts';

/**
 * Generate loot from a loot table
 */
export function generateLoot(
  rng: SeededRandom,
  lootTableId: string,
  level: number,
  _context?: GenerationContext
): GeneratedItem[] {
  const table = getLootTablesRegistry().find((t) => t.id === lootTableId);
  if (!table) {
    console.warn(`Loot table not found: ${lootTableId}`);
    return [];
  }

  const results: GeneratedItem[] = [];

  for (let roll = 0; roll < table.rolls; roll++) {
    // Check empty chance
    if (rng.bool(table.emptyChance)) {
      continue;
    }

    // Filter entries by level
    const validEntries = table.entries.filter((entry) => {
      const [minLevel, maxLevel] = entry.levelRange;
      return level >= minLevel && level <= maxLevel;
    });

    if (validEntries.length === 0) {
      continue;
    }

    // Weighted pick
    const weights = validEntries.map((e) => e.weight);
    const entry = rng.weightedPick(validEntries, weights);

    // Generate item(s)
    const quantity = randomIntInRange(rng, entry.quantityRange);

    for (let i = 0; i < quantity; i++) {
      if (entry.isTemplate) {
        // Generate from template
        const template = getItemTemplatesRegistry().find(
          (t) => t.id === entry.templateOrItemId
        );
        if (template) {
          let generated: GeneratedItem;
          switch (template.itemType) {
            case 'weapon':
              generated = generateWeapon(rng, level, entry.tags);
              break;
            case 'armor':
              generated = generateArmor(rng, level, entry.tags);
              break;
            case 'consumable':
              generated = generateConsumable(rng, entry.tags);
              break;
            default:
              continue;
          }
          results.push(generated);
        }
      } else {
        // This is a direct item reference - would need to look up from item library
        // For now, skip direct references as they should use the existing item system
        console.warn(`Direct item reference in loot table: ${entry.templateOrItemId}`);
      }
    }
  }

  return results;
}

/**
 * Generate shop inventory based on shop type and level
 */
export function generateShopInventory(
  rng: SeededRandom,
  shopType: string,
  level: number,
  _context?: GenerationContext
): ShopInventoryItem[] {
  const shopTemplate = getShopTemplate(shopType);
  if (!shopTemplate) {
    console.warn(`Shop template not found: ${shopType}`);
    return [];
  }

  const inventory: ShopInventoryItem[] = [];

  for (const pool of shopTemplate.itemPools) {
    const count = randomIntInRange(rng, pool.countRange);

    for (let i = 0; i < count; i++) {
      // Roll rarity based on pool weights
      const rarity = rollRarity(rng, pool.rarityWeights);

      // Determine item type from tags
      let generated: GeneratedItem | null = null;

      if (pool.tags.some((t) => ['weapon', 'pistol', 'revolver', 'rifle', 'shotgun'].includes(t))) {
        generated = generateWeapon(rng, level, pool.tags, { forceRarity: rarity });
      } else if (pool.tags.some((t) => ['armor', 'clothing', 'apparel'].includes(t))) {
        generated = generateArmor(rng, level, pool.tags, { forceRarity: rarity });
      } else if (
        pool.tags.some((t) =>
          ['consumable', 'food', 'drink', 'medicine', 'tonic', 'healing'].includes(t)
        )
      ) {
        generated = generateConsumable(rng, pool.tags, { forceRarity: rarity });
      }

      if (generated) {
        const buyPrice = Math.round(generated.item.value * shopTemplate.buyMultiplier);
        const sellPrice = Math.round(generated.item.value * shopTemplate.sellMultiplier);

        inventory.push({
          item: generated.item,
          quantity: 1,
          buyPrice,
          sellPrice,
          generated,
        });
      }
    }
  }

  return inventory;
}
