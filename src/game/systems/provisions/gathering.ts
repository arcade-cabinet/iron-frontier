import type { ForagingResult, HuntingResult, TerrainType } from './types';
import type { ProvisionsConfig } from './types';
import { FORAGING_ITEMS, FORAGING_YIELDS } from './config';

export function executeHunt(
  config: ProvisionsConfig,
  skillModifier: number,
  rng: () => number
): HuntingResult & { apply: boolean } {
  const { hunting } = config;

  const successChance = Math.min(1, hunting.baseChance + skillModifier);
  const success = rng() < successChance;

  if (!success) {
    return {
      apply: false,
      success: false,
      foodGained: 0,
      waterGained: 0,
      fatigueCost: hunting.fatigueCost,
      timeSpent: hunting.duration,
      description: 'The hunt was unsuccessful. No game was found.',
    };
  }

  const foodGained = Math.floor(
    hunting.foodYield[0] + rng() * (hunting.foodYield[1] - hunting.foodYield[0])
  );

  let waterGained = 0;
  let description = `You caught game and gained ${foodGained} food.`;

  if (rng() < hunting.waterChance) {
    waterGained = Math.floor(
      hunting.waterYield[0] + rng() * (hunting.waterYield[1] - hunting.waterYield[0])
    );
    description += ` You also found ${waterGained} water.`;
  }

  return {
    apply: true,
    success: true,
    foodGained,
    waterGained,
    fatigueCost: hunting.fatigueCost,
    timeSpent: hunting.duration,
    description,
  };
}

export function executeForage(
  config: ProvisionsConfig,
  terrain: TerrainType,
  rng: () => number
): ForagingResult & { apply: boolean } {
  const chance = config.foragingChances[terrain];

  if (chance <= 0 || rng() >= chance) {
    return {
      apply: false,
      success: false,
      foodFound: 0,
      waterFound: 0,
      timeSpent: 0.5,
      foundItems: [],
    };
  }

  const yields = FORAGING_YIELDS[terrain];
  const items = FORAGING_ITEMS[terrain];

  const foodFound = Math.floor(
    yields.food[0] + rng() * (yields.food[1] - yields.food[0])
  );
  const waterFound = Math.floor(
    yields.water[0] + rng() * (yields.water[1] - yields.water[0])
  );

  const numItems = Math.min(items.length, 1 + Math.floor(rng() * 2));
  const foundItems: string[] = [];
  const itemsCopy = [...items];
  for (let i = 0; i < numItems && itemsCopy.length > 0; i++) {
    const idx = Math.floor(rng() * itemsCopy.length);
    foundItems.push(itemsCopy.splice(idx, 1)[0]);
  }

  return {
    apply: true,
    success: true,
    foodFound,
    waterFound,
    timeSpent: 1,
    foundItems,
  };
}
