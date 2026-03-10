import {
  type DifficultyLevel,
  getDifficultyConfig,
  type KilledEnemyData,
} from "@/src/game/engine/combat";
import { rngTick, scopedRNG } from "@/src/game/lib/prng";

export function rollLoot(
  lootTable: KilledEnemyData["lootTable"],
  difficulty: DifficultyLevel,
): string[] {
  const diffConfig = getDifficultyConfig(difficulty);
  const lootMul = diffConfig.lootMultiplier;
  const items: string[] = [];

  for (const itemId of lootTable.always) {
    items.push(itemId);
  }

  for (const itemId of lootTable.common) {
    if (scopedRNG("combat", 42, rngTick()) < 0.6 * lootMul) {
      items.push(itemId);
    }
  }

  for (const itemId of lootTable.uncommon) {
    if (scopedRNG("combat", 42, rngTick()) < 0.25 * lootMul) {
      items.push(itemId);
    }
  }

  for (const itemId of lootTable.rare) {
    if (scopedRNG("combat", 42, rngTick()) < 0.05 * lootMul) {
      items.push(itemId);
    }
  }

  return items;
}
