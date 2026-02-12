import { DatabaseManager } from '../DatabaseManager';
import type { InventoryItem } from '@/store';

async function benchmark(): Promise<void> {
  const dbManager = new DatabaseManager();
  await dbManager.init();

  const items: InventoryItem[] = Array.from({ length: 1000 }, (_, i) => ({
    id: `item-${i}`,
    itemId: `base-item-${i}`,
    name: `Item ${i}`,
    rarity: 'common',
    quantity: 1,
    usable: true,
    description: `Description for item ${i}`,
    condition: 100,
    weight: 0.1,
    type: 'misc',
    droppable: true,
  }));

  console.log('Starting benchmark with 1000 items...');
  const start = performance.now();
  await dbManager.saveInventory(items);
  const end = performance.now();
  console.log(`Baseline saveInventory took ${(end - start).toFixed(2)}ms`);
}

export { benchmark };
