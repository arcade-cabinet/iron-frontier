import { DatabaseManager } from '../DatabaseManager';

async function benchmark() {
  const dbManager = new DatabaseManager();
  await dbManager.init();

  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: `item-${i}`,
    itemId: `base-item-${i}`,
    name: `Item ${i}`,
    rarity: 'common',
    quantity: 1,
    usable: true,
    description: `Description for item ${i}`,
  }));

  console.log('Starting benchmark with 1000 items...');
  const start = performance.now();
  dbManager.saveInventory(items);
  const end = performance.now();
  console.log(`Baseline saveInventory took ${(end - start).toFixed(2)}ms`);
  
  dbManager.dispose();
}

export { benchmark };
