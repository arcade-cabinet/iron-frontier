/**
 * ProvisionsSystem Unit Tests
 *
 * @module systems/__tests__/provisions
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  ProvisionsSystem,
  createProvisionsSystem,
  calculateTravelConsumption,
  hasEnoughProvisions,
  getProvisionStatus,
  DEFAULT_PROVISIONS_CONFIG,
  DEFAULT_PROVISIONS_STATE,
  type TerrainType,
  type ProvisionStatus,
} from '../provisions';

describe('ProvisionsSystem', () => {
  let provisions: ProvisionsSystem;

  beforeEach(() => {
    provisions = new ProvisionsSystem();
  });

  describe('initialization', () => {
    it('should create with default state', () => {
      expect(provisions.getFood()).toBe(DEFAULT_PROVISIONS_STATE.food);
      expect(provisions.getWater()).toBe(DEFAULT_PROVISIONS_STATE.water);
    });

    it('should create with custom initial state', () => {
      const custom = new ProvisionsSystem(undefined, { food: 50, water: 30 });
      expect(custom.getFood()).toBe(50);
      expect(custom.getWater()).toBe(30);
    });

    it('should create with custom config', () => {
      const custom = new ProvisionsSystem({
        maxFood: 200,
        maxWater: 150,
      });
      custom.refillAll();
      expect(custom.getFood()).toBe(200);
      expect(custom.getWater()).toBe(150);
    });
  });

  describe('provision queries', () => {
    it('should return food and water amounts', () => {
      provisions.addFood(25);
      expect(provisions.getFood()).toBe(100); // 75 + 25
    });

    it('should return percentages', () => {
      const fresh = new ProvisionsSystem(undefined, { food: 50, water: 25 });
      expect(fresh.getFoodPercentage()).toBe(0.5);
      expect(fresh.getWaterPercentage()).toBe(0.25);
    });

    it('should check has food/water', () => {
      const fresh = new ProvisionsSystem(undefined, { food: 10, water: 0 });
      expect(fresh.hasFood()).toBe(true);
      expect(fresh.hasWater()).toBe(false);
    });

    it('should estimate duration', () => {
      const fresh = new ProvisionsSystem(undefined, { food: 40, water: 60 });
      // 40 food / 4 per hour = 10 hours
      expect(fresh.estimateFoodDuration()).toBe(10);
      // 60 water / 6 per hour = 10 hours
      expect(fresh.estimateWaterDuration()).toBe(10);
    });

    it('should return 0 duration when depleted', () => {
      const empty = new ProvisionsSystem(undefined, { food: 0, water: 0 });
      expect(empty.estimateFoodDuration()).toBe(0);
      expect(empty.estimateWaterDuration()).toBe(0);
    });
  });

  describe('provision status', () => {
    it('should return abundant above 75%', () => {
      const fresh = new ProvisionsSystem(undefined, { food: 80, water: 90 });
      expect(fresh.getFoodStatus()).toBe('abundant');
      expect(fresh.getWaterStatus()).toBe('abundant');
    });

    it('should return adequate at 50-75%', () => {
      const fresh = new ProvisionsSystem(undefined, { food: 60, water: 55 });
      expect(fresh.getFoodStatus()).toBe('adequate');
      expect(fresh.getWaterStatus()).toBe('adequate');
    });

    it('should return low at 25-50%', () => {
      const fresh = new ProvisionsSystem(undefined, { food: 30, water: 40 });
      expect(fresh.getFoodStatus()).toBe('low');
      expect(fresh.getWaterStatus()).toBe('low');
    });

    it('should return critical at 10-25%', () => {
      const fresh = new ProvisionsSystem(undefined, { food: 15, water: 20 });
      expect(fresh.getFoodStatus()).toBe('critical');
      expect(fresh.getWaterStatus()).toBe('critical');
    });

    it('should return depleted below 10%', () => {
      const fresh = new ProvisionsSystem(undefined, { food: 5, water: 0 });
      expect(fresh.getFoodStatus()).toBe('depleted');
      expect(fresh.getWaterStatus()).toBe('depleted');
    });

    it('should return overall status as worst', () => {
      const fresh = new ProvisionsSystem(undefined, { food: 80, water: 20 });
      expect(fresh.getOverallStatus()).toBe('critical');
    });

    it('should return description based on status', () => {
      provisions.refillAll();
      expect(provisions.getDescription()).toContain('Well-stocked');

      const low = new ProvisionsSystem(undefined, { food: 30, water: 30 });
      expect(low.getDescription()).toContain('running low');

      const empty = new ProvisionsSystem(undefined, { food: 0, water: 0 });
      expect(empty.getDescription()).toContain('starving');
    });
  });

  describe('fatigue multiplier', () => {
    it('should return 1.0 with full provisions', () => {
      expect(provisions.getFatigueMultiplier()).toBe(1.0);
    });

    it('should return 2.0 without food', () => {
      const noFood = new ProvisionsSystem(undefined, { food: 0, water: 50 });
      expect(noFood.getFatigueMultiplier()).toBe(2.0);
    });

    it('should return 3.0 without water', () => {
      const noWater = new ProvisionsSystem(undefined, { food: 50, water: 0 });
      expect(noWater.getFatigueMultiplier()).toBe(3.0);
    });

    it('should return 6.0 without both', () => {
      const empty = new ProvisionsSystem(undefined, { food: 0, water: 0 });
      expect(empty.getFatigueMultiplier()).toBe(6.0);
    });
  });

  describe('dehydration damage', () => {
    it('should return 0 with water', () => {
      expect(provisions.getDehydrationDamage()).toBe(0);
    });

    it('should return damage without water', () => {
      const dehydrated = new ProvisionsSystem(undefined, { food: 50, water: 0 });
      expect(dehydrated.getDehydrationDamage()).toBe(5);
    });
  });

  describe('consumption', () => {
    it('should consume for travel', () => {
      provisions.refillAll();
      const result = provisions.consumeForTravel(2);

      expect(result.foodConsumed).toBe(8); // 4 per hour * 2
      expect(result.waterConsumed).toBe(12); // 6 per hour * 2
      expect(result.ranOutOfFood).toBe(false);
      expect(result.ranOutOfWater).toBe(false);

      expect(provisions.getFood()).toBe(92);
      expect(provisions.getWater()).toBe(88);
    });

    it('should detect running out', () => {
      const low = new ProvisionsSystem(undefined, { food: 5, water: 5 });
      const result = low.consumeForTravel(2);

      expect(result.ranOutOfFood).toBe(true);
      expect(result.ranOutOfWater).toBe(true);
      expect(low.getFood()).toBe(0);
      expect(low.getWater()).toBe(0);
    });

    it('should track hours since last consumption', () => {
      const empty = new ProvisionsSystem(undefined, { food: 0, water: 0 });
      empty.consumeForTravel(3);

      expect(empty.getHoursSinceFood()).toBe(3);
      expect(empty.getHoursSinceWater()).toBe(3);

      empty.addFood(10);
      empty.consumeForTravel(1);
      expect(empty.getHoursSinceFood()).toBe(0); // Reset because we have food
    });

    it('should consume less while camping', () => {
      provisions.refillAll();
      const result = provisions.consumeForCamping(4);

      // Half rate: 2 food + 3 water per hour
      expect(result.foodConsumed).toBe(8);
      expect(result.waterConsumed).toBe(12);
    });
  });

  describe('adding provisions', () => {
    it('should add food', () => {
      const low = new ProvisionsSystem(undefined, { food: 50, water: 50 });
      low.addFood(30);
      expect(low.getFood()).toBe(80);
    });

    it('should add water', () => {
      const low = new ProvisionsSystem(undefined, { food: 50, water: 50 });
      low.addWater(30);
      expect(low.getWater()).toBe(80);
    });

    it('should add both', () => {
      const low = new ProvisionsSystem(undefined, { food: 50, water: 50 });
      low.addProvisions(20, 30);
      expect(low.getFood()).toBe(70);
      expect(low.getWater()).toBe(80);
    });

    it('should clamp to max', () => {
      provisions.refillAll();
      provisions.addFood(50);
      expect(provisions.getFood()).toBe(100);
    });

    it('should refill all', () => {
      const low = new ProvisionsSystem(undefined, { food: 10, water: 10 });
      low.refillAll();
      expect(low.getFood()).toBe(100);
      expect(low.getWater()).toBe(100);
    });

    it('should reset hours since consumption when adding', () => {
      const empty = new ProvisionsSystem(undefined, {
        food: 0,
        water: 0,
        hoursSinceFood: 5,
        hoursSinceWater: 3,
      });

      empty.addFood(10);
      expect(empty.getHoursSinceFood()).toBe(0);
      expect(empty.getHoursSinceWater()).toBe(3); // Only food reset

      empty.addWater(10);
      expect(empty.getHoursSinceWater()).toBe(0);
    });
  });

  describe('hunting', () => {
    it('should return failure with no gains', () => {
      // Use controlled RNG that returns > success chance
      const result = provisions.attemptHunt(0, () => 0.8);

      expect(result.success).toBe(false);
      expect(result.foodGained).toBe(0);
      expect(result.waterGained).toBe(0);
      expect(result.fatigueCost).toBe(15);
      expect(result.timeSpent).toBe(2);
    });

    it('should return success with food', () => {
      // Use controlled RNG that always succeeds
      const result = provisions.attemptHunt(0, () => 0.2);

      expect(result.success).toBe(true);
      expect(result.foodGained).toBeGreaterThan(0);
      expect(result.fatigueCost).toBe(15);
      expect(result.timeSpent).toBe(2);
    });

    it('should apply skill modifier', () => {
      // With 0.4 skill modifier, 0.6 + 0.4 = 1.0 (always succeed)
      const result = provisions.attemptHunt(0.4, () => 0.9);
      expect(result.success).toBe(true);
    });

    it('should add provisions on success', () => {
      const low = new ProvisionsSystem(undefined, { food: 20, water: 20 });
      low.attemptHunt(0, () => 0.1); // Force success

      expect(low.getFood()).toBeGreaterThan(20);
    });
  });

  describe('foraging', () => {
    it('should fail in low-chance terrain', () => {
      // Desert has 5% chance
      const result = provisions.attemptForage('desert', () => 0.5);
      expect(result.success).toBe(false);
    });

    it('should succeed in high-chance terrain', () => {
      // Riverside has 60% chance
      const result = provisions.attemptForage('riverside', () => 0.3);
      expect(result.success).toBe(true);
    });

    it('should never succeed in town', () => {
      const result = provisions.attemptForage('town', () => 0);
      expect(result.success).toBe(false);
    });

    it('should return found items on success', () => {
      const result = provisions.attemptForage('forest', () => 0.1);
      expect(result.success).toBe(true);
      expect(result.foundItems.length).toBeGreaterThan(0);
    });

    it('should add provisions on success', () => {
      const low = new ProvisionsSystem(undefined, { food: 20, water: 20 });
      low.attemptForage('riverside', () => 0.1);

      // Riverside gives good yields
      expect(low.getFood()).toBeGreaterThanOrEqual(20);
      expect(low.getWater()).toBeGreaterThan(20);
    });

    it('should return foraging chance for terrain', () => {
      expect(provisions.getForagingChance('desert')).toBe(0.05);
      expect(provisions.getForagingChance('forest')).toBe(0.5);
      expect(provisions.getForagingChance('riverside')).toBe(0.6);
      expect(provisions.getForagingChance('town')).toBe(0);
    });
  });

  describe('serialization', () => {
    it('should get state for saving', () => {
      provisions.addFood(10);
      const state = provisions.getState();

      expect(state.food).toBe(85);
      expect(state.water).toBe(75);
    });

    it('should load state', () => {
      provisions.loadState({ food: 30, water: 40 });
      expect(provisions.getFood()).toBe(30);
      expect(provisions.getWater()).toBe(40);
    });

    it('should reset to defaults', () => {
      provisions.consumeForTravel(10);
      provisions.reset();

      expect(provisions.getFood()).toBe(DEFAULT_PROVISIONS_STATE.food);
      expect(provisions.getWater()).toBe(DEFAULT_PROVISIONS_STATE.water);
    });
  });
});

describe('utility functions', () => {
  describe('createProvisionsSystem', () => {
    it('should create with defaults', () => {
      const provisions = createProvisionsSystem();
      expect(provisions.getFood()).toBe(DEFAULT_PROVISIONS_STATE.food);
    });

    it('should create with initial state', () => {
      const provisions = createProvisionsSystem({ food: 50, water: 30 });
      expect(provisions.getFood()).toBe(50);
      expect(provisions.getWater()).toBe(30);
    });
  });

  describe('calculateTravelConsumption', () => {
    it('should calculate consumption for travel', () => {
      const result = calculateTravelConsumption(3);
      expect(result.food).toBe(12); // 4 * 3
      expect(result.water).toBe(18); // 6 * 3
    });
  });

  describe('hasEnoughProvisions', () => {
    it('should return true when sufficient', () => {
      expect(hasEnoughProvisions(50, 50, 5)).toBe(true);
    });

    it('should return false when insufficient', () => {
      expect(hasEnoughProvisions(10, 10, 5)).toBe(false);
    });
  });

  describe('getProvisionStatus', () => {
    it('should return correct status', () => {
      expect(getProvisionStatus(80, 100)).toBe('abundant');
      expect(getProvisionStatus(60, 100)).toBe('adequate');
      expect(getProvisionStatus(30, 100)).toBe('low');
      expect(getProvisionStatus(15, 100)).toBe('critical');
      expect(getProvisionStatus(5, 100)).toBe('depleted');
    });
  });
});

describe('terrain types', () => {
  const terrains: TerrainType[] = [
    'desert',
    'plains',
    'grassland',
    'forest',
    'mountains',
    'badlands',
    'riverside',
    'town',
  ];

  it('should have foraging chances for all terrains', () => {
    const provisions = new ProvisionsSystem();
    for (const terrain of terrains) {
      expect(provisions.getForagingChance(terrain)).toBeDefined();
    }
  });

  it('should have highest chance at riverside', () => {
    const provisions = new ProvisionsSystem();
    const riverside = provisions.getForagingChance('riverside');

    for (const terrain of terrains) {
      if (terrain !== 'riverside') {
        expect(provisions.getForagingChance(terrain)).toBeLessThanOrEqual(riverside);
      }
    }
  });

  it('should have zero chance in town', () => {
    const provisions = new ProvisionsSystem();
    expect(provisions.getForagingChance('town')).toBe(0);
  });
});
