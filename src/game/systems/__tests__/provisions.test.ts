/**
 * provisions.test.ts - Tests for ProvisionsSystem
 */

import {
    DEFAULT_PROVISIONS_STATE,
    ProvisionsSystem,
    calculateTravelConsumption,
    createProvisionsSystem,
    getProvisionStatus,
    hasEnoughProvisions
} from '../provisions';

describe('ProvisionsSystem', () => {
  let provisions: ProvisionsSystem;

  beforeEach(() => {
    provisions = new ProvisionsSystem();
  });

  describe('initialization', () => {
    it('should create with default config', () => {
      expect(provisions).toBeDefined();
      expect(provisions.getFood()).toBe(DEFAULT_PROVISIONS_STATE.food);
      expect(provisions.getWater()).toBe(DEFAULT_PROVISIONS_STATE.water);
    });

    it('should create with custom initial state', () => {
      const custom = new ProvisionsSystem(undefined, { food: 50, water: 30 });
      expect(custom.getFood()).toBe(50);
      expect(custom.getWater()).toBe(30);
    });

    it('should start with adequate provisions', () => {
      expect(provisions.getFoodStatus()).toBe('abundant');
      expect(provisions.getWaterStatus()).toBe('abundant');
    });
  });

  describe('provision queries', () => {
    it('should get current food', () => {
      expect(provisions.getFood()).toBe(75);
    });

    it('should get current water', () => {
      expect(provisions.getWater()).toBe(75);
    });

    it('should get food percentage', () => {
      expect(provisions.getFoodPercentage()).toBe(0.75);
    });

    it('should get water percentage', () => {
      expect(provisions.getWaterPercentage()).toBe(0.75);
    });

    it('should check if has food', () => {
      expect(provisions.hasFood()).toBe(true);
    });

    it('should check if has water', () => {
      expect(provisions.hasWater()).toBe(true);
    });

    it('should check if has no food', () => {
      provisions.loadState({ food: 0 });
      expect(provisions.hasFood()).toBe(false);
    });

    it('should check if has no water', () => {
      provisions.loadState({ water: 0 });
      expect(provisions.hasWater()).toBe(false);
    });
  });

  describe('provision status', () => {
    it('should be abundant at 75%+', () => {
      provisions.loadState({ food: 80, water: 80 });
      expect(provisions.getFoodStatus()).toBe('abundant');
      expect(provisions.getWaterStatus()).toBe('abundant');
    });

    it('should be adequate at 50-75%', () => {
      provisions.loadState({ food: 60, water: 60 });
      expect(provisions.getFoodStatus()).toBe('adequate');
      expect(provisions.getWaterStatus()).toBe('adequate');
    });

    it('should be low at 25-50%', () => {
      provisions.loadState({ food: 40, water: 40 });
      expect(provisions.getFoodStatus()).toBe('low');
      expect(provisions.getWaterStatus()).toBe('low');
    });

    it('should be critical at 10-25%', () => {
      provisions.loadState({ food: 15, water: 15 });
      expect(provisions.getFoodStatus()).toBe('critical');
      expect(provisions.getWaterStatus()).toBe('critical');
    });

    it('should be depleted below 10%', () => {
      provisions.loadState({ food: 5, water: 5 });
      expect(provisions.getFoodStatus()).toBe('depleted');
      expect(provisions.getWaterStatus()).toBe('depleted');
    });

    it('should get overall status as worst of both', () => {
      provisions.loadState({ food: 80, water: 15 });
      expect(provisions.getOverallStatus()).toBe('critical');
    });

    it('should get description', () => {
      const description = provisions.getDescription();
      expect(description).toContain('Well-stocked');
    });
  });

  describe('duration estimates', () => {
    it('should estimate food duration', () => {
      const duration = provisions.estimateFoodDuration();
      // food=75, consumption.food=2 → 75/2 = 37.5 hours
      expect(duration).toBe(75 / 2);
    });

    it('should estimate water duration', () => {
      const duration = provisions.estimateWaterDuration();
      // water=75, consumption.water=2.5 → 75/2.5 = 30 hours
      expect(duration).toBe(75 / 2.5);
    });

    it('should return zero when depleted', () => {
      provisions.loadState({ food: 0, water: 0 });
      expect(provisions.estimateFoodDuration()).toBe(0);
      expect(provisions.estimateWaterDuration()).toBe(0);
    });
  });

  describe('travel consumption', () => {
    it('should consume provisions for travel', () => {
      const result = provisions.consumeForTravel(2);

      // consumption.food=2, consumption.water=2.5
      expect(result.foodConsumed).toBe(4);  // 2 * 2
      expect(result.waterConsumed).toBe(5); // 2 * 2.5
      expect(provisions.getFood()).toBe(71);  // 75 - 4
      expect(provisions.getWater()).toBe(70); // 75 - 5
    });

    it('should track hours since consumption', () => {
      provisions.consumeForTravel(2);
      expect(provisions.getHoursSinceFood()).toBe(0);
      expect(provisions.getHoursSinceWater()).toBe(0);
    });

    it('should track hours when out of food', () => {
      provisions.loadState({ food: 0 });
      provisions.consumeForTravel(2);
      expect(provisions.getHoursSinceFood()).toBe(2);
    });

    it('should track hours when out of water', () => {
      provisions.loadState({ water: 0 });
      provisions.consumeForTravel(2);
      expect(provisions.getHoursSinceWater()).toBe(2);
    });

    it('should not consume below zero', () => {
      // food=3, water=3. Travel 4h: needs food=8, water=10. Clamps to 0.
      provisions.loadState({ food: 3, water: 3 });
      provisions.consumeForTravel(4);

      expect(provisions.getFood()).toBe(0);
      expect(provisions.getWater()).toBe(0);
    });

    it('should flag when running out', () => {
      provisions.loadState({ food: 3, water: 3 });
      const result = provisions.consumeForTravel(4);

      expect(result.ranOutOfFood).toBe(true);
      expect(result.ranOutOfWater).toBe(true);
    });

    it('should not flag when still have provisions', () => {
      const result = provisions.consumeForTravel(1);

      expect(result.ranOutOfFood).toBe(false);
      expect(result.ranOutOfWater).toBe(false);
    });
  });

  describe('camping consumption', () => {
    it('should consume at half rate while camping', () => {
      const result = provisions.consumeForCamping(2);

      // camping = travel / 2: food=(2*2)/2=2, water=(2*2.5)/2=2.5
      expect(result.foodConsumed).toBe(2);
      expect(result.waterConsumed).toBe(2.5);
    });

    it('should not go below zero', () => {
      provisions.loadState({ food: 2, water: 2 });
      provisions.consumeForCamping(2);

      expect(provisions.getFood()).toBe(0);
      expect(provisions.getWater()).toBe(0);
    });
  });

  describe('adding provisions', () => {
    it('should add food', () => {
      provisions.addFood(10);
      expect(provisions.getFood()).toBe(85);
    });

    it('should add water', () => {
      provisions.addWater(10);
      expect(provisions.getWater()).toBe(85);
    });

    it('should add both provisions', () => {
      provisions.addProvisions(10, 15);
      expect(provisions.getFood()).toBe(85);
      expect(provisions.getWater()).toBe(90);
    });

    it('should clamp food to max', () => {
      provisions.addFood(50);
      expect(provisions.getFood()).toBe(100);
    });

    it('should clamp water to max', () => {
      provisions.addWater(50);
      expect(provisions.getWater()).toBe(100);
    });

    it('should reset hours since consumption', () => {
      provisions.loadState({ food: 0, hoursSinceFood: 10 });
      provisions.addFood(10);
      expect(provisions.getHoursSinceFood()).toBe(0);
    });

    it('should refill all provisions', () => {
      provisions.loadState({ food: 20, water: 30 });
      provisions.refillAll();

      expect(provisions.getFood()).toBe(100);
      expect(provisions.getWater()).toBe(100);
      expect(provisions.getHoursSinceFood()).toBe(0);
      expect(provisions.getHoursSinceWater()).toBe(0);
    });
  });

  describe('fatigue multiplier', () => {
    it('should be 1.0 with provisions', () => {
      expect(provisions.getFatigueMultiplier()).toBe(1.0);
    });

    it('should be 2.0 without food', () => {
      provisions.loadState({ food: 0 });
      expect(provisions.getFatigueMultiplier()).toBe(2.0);
    });

    it('should be 3.0 without water', () => {
      provisions.loadState({ water: 0 });
      expect(provisions.getFatigueMultiplier()).toBe(3.0);
    });

    it('should be 6.0 without both', () => {
      provisions.loadState({ food: 0, water: 0 });
      expect(provisions.getFatigueMultiplier()).toBe(6.0);
    });
  });

  describe('dehydration damage', () => {
    it('should be zero with water', () => {
      expect(provisions.getDehydrationDamage()).toBe(0);
    });

    it('should apply damage without water', () => {
      provisions.loadState({ water: 0 });
      expect(provisions.getDehydrationDamage()).toBe(5);
    });
  });

  describe('hunting', () => {
    it('should succeed with good roll', () => {
      const rng = () => 0.5; // Success
      const result = provisions.attemptHunt(0, rng);

      expect(result.success).toBe(true);
      expect(result.foodGained).toBeGreaterThan(0);
      expect(result.fatigueCost).toBe(15);
      expect(result.timeSpent).toBe(2);
    });

    it('should fail with bad roll', () => {
      const rng = () => 0.9; // Failure
      const result = provisions.attemptHunt(0, rng);

      expect(result.success).toBe(false);
      expect(result.foodGained).toBe(0);
      expect(result.waterGained).toBe(0);
    });

    it('should improve with skill modifier', () => {
      const rng = () => 0.7; // Would fail without modifier
      const result = provisions.attemptHunt(0.2, rng);

      expect(result.success).toBe(true);
    });

    it('should add food to inventory on success', () => {
      const rng = () => 0.5;
      const initialFood = provisions.getFood();
      const result = provisions.attemptHunt(0, rng);

      if (result.success) {
        expect(provisions.getFood()).toBeGreaterThan(initialFood);
      }
    });

    it('should sometimes find water', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.5) // Hunt success
        .mockReturnValueOnce(0.5) // Food amount (0-1 range)
        .mockReturnValueOnce(0.2) // Water found
        .mockReturnValueOnce(0.5); // Water amount (0-1 range)

      const result = provisions.attemptHunt(0, rng);

      expect(result.waterGained).toBeGreaterThan(0);
    });

    it('should not exceed max provisions', () => {
      provisions.loadState({ food: 95, water: 95 });
      const rng = () => 0.5;
      provisions.attemptHunt(0, rng);

      expect(provisions.getFood()).toBeLessThanOrEqual(100);
      expect(provisions.getWater()).toBeLessThanOrEqual(100);
    });
  });

  describe('foraging', () => {
    it('should succeed in forest', () => {
      const rng = () => 0.3; // Within 50% chance
      const result = provisions.attemptForage('forest', rng);

      expect(result.success).toBe(true);
      expect(result.foodFound).toBeGreaterThan(0);
      expect(result.foundItems.length).toBeGreaterThan(0);
    });

    it('should fail in desert', () => {
      const rng = () => 0.9; // Outside 5% chance
      const result = provisions.attemptForage('desert', rng);

      expect(result.success).toBe(false);
      expect(result.foodFound).toBe(0);
    });

    it('should be impossible in town', () => {
      const rng = () => 0.1;
      const result = provisions.attemptForage('town', rng);

      expect(result.success).toBe(false);
    });

    it('should find more in riverside', () => {
      const rng = () => 0.3;
      const result = provisions.attemptForage('riverside', rng);

      expect(result.success).toBe(true);
      expect(result.waterFound).toBeGreaterThan(0);
    });

    it('should add provisions to inventory', () => {
      const rng = () => 0.3;
      const initialFood = provisions.getFood();
      const result = provisions.attemptForage('forest', rng);

      if (result.success) {
        expect(provisions.getFood()).toBeGreaterThan(initialFood);
      }
    });

    it('should take time', () => {
      const rng = () => 0.3;
      const result = provisions.attemptForage('forest', rng);

      if (result.success) {
        expect(result.timeSpent).toBe(1);
      } else {
        expect(result.timeSpent).toBe(0.5);
      }
    });

    it('should list found items', () => {
      const rng = () => 0.3;
      const result = provisions.attemptForage('forest', rng);

      if (result.success) {
        expect(result.foundItems.length).toBeGreaterThan(0);
        expect(typeof result.foundItems[0]).toBe('string');
      }
    });
  });

  describe('foraging chances by terrain', () => {
    it('should get foraging chance', () => {
      expect(provisions.getForagingChance('desert')).toBe(0.05);
      expect(provisions.getForagingChance('plains')).toBe(0.25);
      expect(provisions.getForagingChance('grassland')).toBe(0.35);
      expect(provisions.getForagingChance('forest')).toBe(0.50);
      expect(provisions.getForagingChance('mountains')).toBe(0.15);
      expect(provisions.getForagingChance('badlands')).toBe(0.10);
      expect(provisions.getForagingChance('riverside')).toBe(0.60);
      expect(provisions.getForagingChance('town')).toBe(0);
    });
  });

  describe('serialization', () => {
    it('should get state', () => {
      const state = provisions.getState();

      expect(state).toHaveProperty('food');
      expect(state).toHaveProperty('water');
      expect(state).toHaveProperty('hoursSinceFood');
      expect(state).toHaveProperty('hoursSinceWater');
    });

    it('should load state', () => {
      const newState = {
        food: 50,
        water: 30,
        hoursSinceFood: 5,
        hoursSinceWater: 3,
      };

      provisions.loadState(newState);

      expect(provisions.getFood()).toBe(50);
      expect(provisions.getWater()).toBe(30);
      expect(provisions.getHoursSinceFood()).toBe(5);
      expect(provisions.getHoursSinceWater()).toBe(3);
    });

    it('should reset to default state', () => {
      provisions.loadState({ food: 20, water: 30 });
      provisions.reset();

      expect(provisions.getFood()).toBe(DEFAULT_PROVISIONS_STATE.food);
      expect(provisions.getWater()).toBe(DEFAULT_PROVISIONS_STATE.water);
    });
  });

  describe('edge cases', () => {
    it('should handle zero hour travel', () => {
      const result = provisions.consumeForTravel(0);
      expect(result.foodConsumed).toBe(0);
      expect(result.waterConsumed).toBe(0);
    });

    it('should handle negative provisions', () => {
      provisions.loadState({ food: -10, water: -10 });
      expect(provisions.hasFood()).toBe(false);
      expect(provisions.hasWater()).toBe(false);
    });

    it('should handle very large additions', () => {
      provisions.addFood(1000);
      expect(provisions.getFood()).toBe(100);
    });

    it('should handle fractional consumption', () => {
      // 0.5 hours: food=0.5*2=1, water=0.5*2.5=1.25
      provisions.consumeForTravel(0.5);
      expect(provisions.getFood()).toBe(74);    // 75 - 1
      expect(provisions.getWater()).toBe(73.75); // 75 - 1.25
    });

    it('should handle skill modifier above 1', () => {
      const rng = () => 0.9;
      const result = provisions.attemptHunt(0.5, rng);
      // Should succeed with 60% + 50% = 110% (clamped to 100%)
      expect(result.success).toBe(true);
    });
  });
});

describe('utility functions', () => {
  describe('createProvisionsSystem', () => {
    it('should create system with default state', () => {
      const system = createProvisionsSystem();
      expect(system.getFood()).toBe(75);
      expect(system.getWater()).toBe(75);
    });

    it('should create system with custom state', () => {
      const system = createProvisionsSystem({ food: 50, water: 30 });
      expect(system.getFood()).toBe(50);
      expect(system.getWater()).toBe(30);
    });
  });

  describe('calculateTravelConsumption', () => {
    it('should calculate consumption for hours', () => {
      // food=2/hr, water=2.5/hr
      const consumption = calculateTravelConsumption(2);
      expect(consumption.food).toBe(4);   // 2 * 2
      expect(consumption.water).toBe(5);  // 2 * 2.5
    });

    it('should handle zero hours', () => {
      const consumption = calculateTravelConsumption(0);
      expect(consumption.food).toBe(0);
      expect(consumption.water).toBe(0);
    });

    it('should handle fractional hours', () => {
      const consumption = calculateTravelConsumption(1.5);
      expect(consumption.food).toBe(3);    // 1.5 * 2
      expect(consumption.water).toBe(3.75); // 1.5 * 2.5
    });
  });

  describe('hasEnoughProvisions', () => {
    // 5 hours needs: food=5*2=10, water=5*2.5=12.5
    it('should return true when sufficient', () => {
      expect(hasEnoughProvisions(50, 50, 5)).toBe(true);
    });

    it('should return false when food insufficient', () => {
      // food=5 < 10 needed
      expect(hasEnoughProvisions(5, 50, 5)).toBe(false);
    });

    it('should return false when water insufficient', () => {
      // water=5 < 12.5 needed
      expect(hasEnoughProvisions(50, 5, 5)).toBe(false);
    });

    it('should return false when both insufficient', () => {
      expect(hasEnoughProvisions(5, 5, 5)).toBe(false);
    });

    it('should handle exact amounts', () => {
      // Exactly food=10, water=12.5 for 5 hours
      expect(hasEnoughProvisions(10, 12.5, 5)).toBe(true);
    });
  });

  describe('getProvisionStatus', () => {
    it('should return abundant at 75%+', () => {
      expect(getProvisionStatus(80, 100)).toBe('abundant');
    });

    it('should return adequate at 50-75%', () => {
      expect(getProvisionStatus(60, 100)).toBe('adequate');
    });

    it('should return low at 25-50%', () => {
      expect(getProvisionStatus(40, 100)).toBe('low');
    });

    it('should return critical at 10-25%', () => {
      expect(getProvisionStatus(15, 100)).toBe('critical');
    });

    it('should return depleted below 10%', () => {
      expect(getProvisionStatus(5, 100)).toBe('depleted');
    });

    it('should handle boundary values', () => {
      expect(getProvisionStatus(75, 100)).toBe('abundant');
      expect(getProvisionStatus(50, 100)).toBe('adequate');
      expect(getProvisionStatus(25, 100)).toBe('low');
      expect(getProvisionStatus(10, 100)).toBe('critical');
    });
  });
});
