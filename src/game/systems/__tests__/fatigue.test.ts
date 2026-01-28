/**
 * fatigue.test.ts - Tests for FatigueSystem
 */

import {
    DEFAULT_FATIGUE_CONFIG,
    DEFAULT_FATIGUE_STATE,
    FATIGUE_EFFECTS,
    FatigueSystem,
    calculateRestRecovery,
    calculateTravelFatigue,
    createFatigueSystem,
    getFatigueLevel
} from '../fatigue';

describe('FatigueSystem', () => {
  let fatigue: FatigueSystem;

  beforeEach(() => {
    fatigue = new FatigueSystem();
  });

  describe('initialization', () => {
    it('should create with default config', () => {
      expect(fatigue).toBeDefined();
      expect(fatigue.getCurrent()).toBe(DEFAULT_FATIGUE_STATE.current);
    });

    it('should create with custom initial state', () => {
      const customFatigue = new FatigueSystem(undefined, { current: 50 });
      expect(customFatigue.getCurrent()).toBe(50);
    });

    it('should start at rested level', () => {
      expect(fatigue.getLevel()).toBe('rested');
    });

    it('should be able to act initially', () => {
      expect(fatigue.canAct()).toBe(true);
    });

    it('should not be vulnerable initially', () => {
      expect(fatigue.isVulnerable()).toBe(false);
    });
  });

  describe('fatigue queries', () => {
    it('should get current fatigue', () => {
      expect(fatigue.getCurrent()).toBe(0);
    });

    it('should get max fatigue', () => {
      expect(fatigue.getMax()).toBe(DEFAULT_FATIGUE_CONFIG.maxFatigue);
    });

    it('should get fatigue percentage', () => {
      fatigue.setFatigue(50);
      expect(fatigue.getPercentage()).toBe(0.5);
    });

    it('should get fatigue level', () => {
      expect(fatigue.getLevel()).toBe('rested');

      fatigue.setFatigue(30);
      expect(fatigue.getLevel()).toBe('tired');

      fatigue.setFatigue(60);
      expect(fatigue.getLevel()).toBe('weary');

      fatigue.setFatigue(80);
      expect(fatigue.getLevel()).toBe('exhausted');

      fatigue.setFatigue(100);
      expect(fatigue.getLevel()).toBe('collapsed');
    });

    it('should get effects for current level', () => {
      const effects = fatigue.getEffects();
      expect(effects).toEqual(FATIGUE_EFFECTS.rested);
    });

    it('should get description', () => {
      const description = fatigue.getDescription();
      expect(description).toContain('well-rested');
    });
  });

  describe('fatigue levels', () => {
    it('should be rested at 0-24 fatigue', () => {
      fatigue.setFatigue(0);
      expect(fatigue.getLevel()).toBe('rested');

      fatigue.setFatigue(24);
      expect(fatigue.getLevel()).toBe('rested');
    });

    it('should be tired at 25-49 fatigue', () => {
      fatigue.setFatigue(25);
      expect(fatigue.getLevel()).toBe('tired');

      fatigue.setFatigue(49);
      expect(fatigue.getLevel()).toBe('tired');
    });

    it('should be weary at 50-74 fatigue', () => {
      fatigue.setFatigue(50);
      expect(fatigue.getLevel()).toBe('weary');

      fatigue.setFatigue(74);
      expect(fatigue.getLevel()).toBe('weary');
    });

    it('should be exhausted at 75-99 fatigue', () => {
      fatigue.setFatigue(75);
      expect(fatigue.getLevel()).toBe('exhausted');

      fatigue.setFatigue(99);
      expect(fatigue.getLevel()).toBe('exhausted');
    });

    it('should be collapsed at 100 fatigue', () => {
      fatigue.setFatigue(100);
      expect(fatigue.getLevel()).toBe('collapsed');
    });
  });

  describe('fatigue effects', () => {
    it('should have no penalties when rested', () => {
      const effects = fatigue.getEffects();
      expect(effects.accuracyModifier).toBe(1.0);
      expect(effects.damageModifier).toBe(1.0);
      expect(effects.speedModifier).toBe(1.0);
      expect(effects.stumbleChance).toBe(0);
      expect(effects.canAct).toBe(true);
      expect(effects.isVulnerable).toBe(false);
    });

    it('should have minor penalties when tired', () => {
      fatigue.setFatigue(30);
      const effects = fatigue.getEffects();
      expect(effects.accuracyModifier).toBe(0.95);
      expect(effects.damageModifier).toBe(0.95);
      expect(effects.canAct).toBe(true);
    });

    it('should have speed reduction when weary', () => {
      fatigue.setFatigue(60);
      const effects = fatigue.getEffects();
      expect(effects.speedModifier).toBe(0.8);
      expect(effects.stumbleChance).toBe(0.05);
    });

    it('should have significant penalties when exhausted', () => {
      fatigue.setFatigue(80);
      const effects = fatigue.getEffects();
      expect(effects.accuracyModifier).toBe(0.7);
      expect(effects.damageModifier).toBe(0.75);
      expect(effects.speedModifier).toBe(0.6);
      expect(effects.stumbleChance).toBe(0.15);
    });

    it('should be unable to act when collapsed', () => {
      fatigue.setFatigue(100);
      const effects = fatigue.getEffects();
      expect(effects.canAct).toBe(false);
      expect(effects.isVulnerable).toBe(true);
      expect(effects.stumbleChance).toBe(1.0);
    });
  });

  describe('travel fatigue', () => {
    it('should apply travel fatigue', () => {
      fatigue.applyTravelFatigue(2);
      expect(fatigue.getCurrent()).toBe(16); // 2 hours * 8 per hour
    });

    it('should apply night penalty', () => {
      fatigue.applyTravelFatigue(2, true);
      expect(fatigue.getCurrent()).toBe(26); // (2 * 8) + (2 * 5)
    });

    it('should not apply night penalty during day', () => {
      fatigue.applyTravelFatigue(2, false);
      expect(fatigue.getCurrent()).toBe(16);
    });

    it('should accumulate over multiple travels', () => {
      fatigue.applyTravelFatigue(1);
      fatigue.applyTravelFatigue(1);
      expect(fatigue.getCurrent()).toBe(16);
    });
  });

  describe('combat fatigue', () => {
    it('should apply combat fatigue', () => {
      fatigue.applyCombatFatigue();
      expect(fatigue.getCurrent()).toBe(15);
    });

    it('should apply combat fatigue with intensity', () => {
      fatigue.applyCombatFatigue(2);
      expect(fatigue.getCurrent()).toBe(30);
    });

    it('should apply fractional intensity', () => {
      fatigue.applyCombatFatigue(0.5);
      expect(fatigue.getCurrent()).toBe(7.5);
    });
  });

  describe('idle fatigue', () => {
    it('should apply idle fatigue', () => {
      fatigue.applyIdleFatigue(2);
      expect(fatigue.getCurrent()).toBe(4); // 2 hours * 2 per hour
    });

    it('should apply night penalty when idle at night', () => {
      fatigue.applyIdleFatigue(2, true);
      expect(fatigue.getCurrent()).toBe(14); // (2 * 2) + (2 * 5)
    });

    it('should apply night fatigue only', () => {
      fatigue.applyNightFatigue(2);
      expect(fatigue.getCurrent()).toBe(10); // 2 * 5
    });
  });

  describe('rest recovery', () => {
    it('should apply inn rest', () => {
      fatigue.setFatigue(50);
      fatigue.applyInnRest(2);
      expect(fatigue.getCurrent()).toBe(0); // 50 - (2 * 25)
    });

    it('should apply camp rest', () => {
      fatigue.setFatigue(50);
      fatigue.applyCampRest(2);
      expect(fatigue.getCurrent()).toBe(20); // 50 - (2 * 15)
    });

    it('should apply item rest', () => {
      fatigue.setFatigue(50);
      fatigue.applyItemRest();
      expect(fatigue.getCurrent()).toBe(30); // 50 - 20
    });

    it('should apply item rest with multiplier', () => {
      fatigue.setFatigue(50);
      fatigue.applyItemRest(2);
      expect(fatigue.getCurrent()).toBe(10); // 50 - (20 * 2)
    });

    it('should not go below zero', () => {
      fatigue.setFatigue(10);
      fatigue.applyInnRest(2);
      expect(fatigue.getCurrent()).toBe(0);
    });
  });

  describe('direct fatigue modification', () => {
    it('should add fatigue', () => {
      fatigue.addFatigue(25);
      expect(fatigue.getCurrent()).toBe(25);
    });

    it('should remove fatigue', () => {
      fatigue.setFatigue(50);
      fatigue.removeFatigue(20);
      expect(fatigue.getCurrent()).toBe(30);
    });

    it('should set fatigue to specific value', () => {
      fatigue.setFatigue(75);
      expect(fatigue.getCurrent()).toBe(75);
    });

    it('should clamp fatigue to max', () => {
      fatigue.addFatigue(150);
      expect(fatigue.getCurrent()).toBe(100);
    });

    it('should clamp fatigue to zero', () => {
      fatigue.setFatigue(50);
      fatigue.removeFatigue(100);
      expect(fatigue.getCurrent()).toBe(0);
    });

    it('should clamp set value to range', () => {
      fatigue.setFatigue(150);
      expect(fatigue.getCurrent()).toBe(100);

      fatigue.setFatigue(-10);
      expect(fatigue.getCurrent()).toBe(0);
    });

    it('should fully rest', () => {
      fatigue.setFatigue(75);
      fatigue.fullRest();
      expect(fatigue.getCurrent()).toBe(0);
    });
  });

  describe('stumble mechanics', () => {
    it('should not stumble when rested', () => {
      const stumbled = fatigue.checkStumble();
      expect(stumbled).toBe(false);
    });

    it('should have stumble chance when weary', () => {
      fatigue.setFatigue(60);
      // Run multiple times to test probability
      let stumbleCount = 0;
      for (let i = 0; i < 100; i++) {
        if (fatigue.checkStumble()) {
          stumbleCount++;
        }
      }
      // Should stumble approximately 5% of the time
      expect(stumbleCount).toBeGreaterThan(0);
      expect(stumbleCount).toBeLessThan(20);
    });

    it('should always stumble when collapsed', () => {
      fatigue.setFatigue(100);
      const stumbled = fatigue.checkStumble();
      expect(stumbled).toBe(true);
    });

    it('should set pending stumble flag', () => {
      fatigue.setFatigue(100);
      fatigue.checkStumble();
      expect(fatigue.consumePendingStumble()).toBe(true);
    });

    it('should clear pending stumble flag', () => {
      fatigue.setFatigue(100);
      fatigue.checkStumble();
      fatigue.consumePendingStumble();
      expect(fatigue.consumePendingStumble()).toBe(false);
    });
  });

  describe('action checks', () => {
    it('should be able to act when not collapsed', () => {
      fatigue.setFatigue(75);
      expect(fatigue.canAct()).toBe(true);
    });

    it('should not be able to act when collapsed', () => {
      fatigue.setFatigue(100);
      expect(fatigue.canAct()).toBe(false);
    });

    it('should not be vulnerable when not collapsed', () => {
      fatigue.setFatigue(75);
      expect(fatigue.isVulnerable()).toBe(false);
    });

    it('should be vulnerable when collapsed', () => {
      fatigue.setFatigue(100);
      expect(fatigue.isVulnerable()).toBe(true);
    });
  });

  describe('serialization', () => {
    it('should get state', () => {
      fatigue.setFatigue(50);
      const state = fatigue.getState();

      expect(state).toHaveProperty('current', 50);
      expect(state).toHaveProperty('lastUpdateTime');
      expect(state).toHaveProperty('pendingStumble');
    });

    it('should load state', () => {
      const newState = {
        current: 75,
        lastUpdateTime: 1000,
        pendingStumble: true,
      };

      fatigue.loadState(newState);

      expect(fatigue.getCurrent()).toBe(75);
      expect(fatigue.consumePendingStumble()).toBe(true);
    });

    it('should reset to default state', () => {
      fatigue.setFatigue(75);
      fatigue.reset();

      expect(fatigue.getCurrent()).toBe(DEFAULT_FATIGUE_STATE.current);
    });
  });

  describe('edge cases', () => {
    it('should handle zero hour travel', () => {
      fatigue.applyTravelFatigue(0);
      expect(fatigue.getCurrent()).toBe(0);
    });

    it('should handle zero hour rest', () => {
      fatigue.setFatigue(50);
      fatigue.applyInnRest(0);
      expect(fatigue.getCurrent()).toBe(50);
    });

    it('should handle negative intensity', () => {
      fatigue.applyCombatFatigue(-1);
      expect(fatigue.getCurrent()).toBe(-15);
    });

    it('should handle very large fatigue values', () => {
      fatigue.addFatigue(1000);
      expect(fatigue.getCurrent()).toBe(100);
    });

    it('should handle fractional fatigue', () => {
      fatigue.addFatigue(10.5);
      expect(fatigue.getCurrent()).toBe(10.5);
    });
  });
});

describe('utility functions', () => {
  describe('createFatigueSystem', () => {
    it('should create system with default state', () => {
      const system = createFatigueSystem();
      expect(system.getCurrent()).toBe(0);
    });

    it('should create system with custom state', () => {
      const system = createFatigueSystem({ current: 50 });
      expect(system.getCurrent()).toBe(50);
    });
  });

  describe('calculateTravelFatigue', () => {
    it('should calculate day travel fatigue', () => {
      const fatigue = calculateTravelFatigue(2, 'day');
      expect(fatigue).toBe(16); // 2 * 8
    });

    it('should calculate night travel fatigue', () => {
      const fatigue = calculateTravelFatigue(2, 'night');
      expect(fatigue).toBe(26); // (2 * 8) + (2 * 5)
    });

    it('should handle dawn as day', () => {
      const fatigue = calculateTravelFatigue(2, 'dawn');
      expect(fatigue).toBe(16);
    });

    it('should handle dusk as day', () => {
      const fatigue = calculateTravelFatigue(2, 'dusk');
      expect(fatigue).toBe(16);
    });
  });

  describe('calculateRestRecovery', () => {
    it('should calculate inn recovery', () => {
      const recovery = calculateRestRecovery(2, true);
      expect(recovery).toBe(50); // 2 * 25
    });

    it('should calculate camp recovery', () => {
      const recovery = calculateRestRecovery(2, false);
      expect(recovery).toBe(30); // 2 * 15
    });

    it('should handle zero hours', () => {
      const recovery = calculateRestRecovery(0, true);
      expect(recovery).toBe(0);
    });

    it('should handle fractional hours', () => {
      const recovery = calculateRestRecovery(1.5, true);
      expect(recovery).toBe(37.5);
    });
  });

  describe('getFatigueLevel', () => {
    it('should return correct level for value', () => {
      expect(getFatigueLevel(0)).toBe('rested');
      expect(getFatigueLevel(30)).toBe('tired');
      expect(getFatigueLevel(60)).toBe('weary');
      expect(getFatigueLevel(80)).toBe('exhausted');
      expect(getFatigueLevel(100)).toBe('collapsed');
    });

    it('should handle boundary values', () => {
      expect(getFatigueLevel(24)).toBe('rested');
      expect(getFatigueLevel(25)).toBe('tired');
      expect(getFatigueLevel(49)).toBe('tired');
      expect(getFatigueLevel(50)).toBe('weary');
    });
  });
});
