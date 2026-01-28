/**
 * Tests for the damage calculation system
 */

import { describe, expect, it } from '@jest/globals';
import {
  calculateBaseDamage,
  applyVariance,
  applyCriticalMultiplier,
  applyDefenseReduction,
  applyFatiguePenalty,
  applyTypeEffectiveness,
  calculateDamage,
  calculateHitChance,
  rollHit,
  rollCritical,
  calculateStatusEffectDamage,
  calculateHeal,
  applyStatusEffectModifiers,
  MINIMUM_DAMAGE,
  DEFAULT_VARIANCE,
  DEFAULT_CRIT_MULTIPLIER,
  DEFEND_DAMAGE_REDUCTION,
  MAX_FATIGUE_PENALTY,
} from '../damage';
import type { CombatStats, StatusEffect } from '../types';

describe('Damage Calculator', () => {
  describe('calculateBaseDamage', () => {
    it('should calculate base damage as attack - defense/2', () => {
      expect(calculateBaseDamage(20, 10)).toBe(15); // 20 - 5 = 15
    });

    it('should ensure minimum damage of 1', () => {
      expect(calculateBaseDamage(5, 20)).toBe(MINIMUM_DAMAGE);
    });

    it('should handle zero defense', () => {
      expect(calculateBaseDamage(10, 0)).toBe(10);
    });

    it('should floor the result', () => {
      expect(calculateBaseDamage(15, 5)).toBe(12); // 15 - 2.5 = 12.5 -> 12
    });
  });

  describe('applyVariance', () => {
    it('should apply no variance at 0.5 random value', () => {
      const result = applyVariance(100, DEFAULT_VARIANCE, 0.5);
      expect(result).toBe(100);
    });

    it('should increase damage at high random values', () => {
      const result = applyVariance(100, DEFAULT_VARIANCE, 1.0);
      expect(result).toBe(110); // 100 * 1.1 = 110
    });

    it('should decrease damage at low random values', () => {
      const result = applyVariance(100, DEFAULT_VARIANCE, 0.0);
      expect(result).toBe(90); // 100 * 0.9 = 90
    });

    it('should ensure minimum damage', () => {
      const result = applyVariance(1, DEFAULT_VARIANCE, 0.0);
      expect(result).toBeGreaterThanOrEqual(MINIMUM_DAMAGE);
    });
  });

  describe('applyCriticalMultiplier', () => {
    it('should not modify damage when not critical', () => {
      expect(applyCriticalMultiplier(100, false)).toBe(100);
    });

    it('should apply default critical multiplier', () => {
      expect(applyCriticalMultiplier(100, true)).toBe(150);
    });

    it('should apply custom critical multiplier', () => {
      expect(applyCriticalMultiplier(100, true, 2.0)).toBe(200);
    });

    it('should floor the result', () => {
      expect(applyCriticalMultiplier(75, true, 1.5)).toBe(112); // 75 * 1.5 = 112.5 -> 112
    });
  });

  describe('applyDefenseReduction', () => {
    it('should not modify damage when not defending', () => {
      expect(applyDefenseReduction(100, false)).toBe(100);
    });

    it('should reduce damage by 50% when defending', () => {
      expect(applyDefenseReduction(100, true)).toBe(50);
    });

    it('should ensure minimum damage when defending', () => {
      expect(applyDefenseReduction(1, true)).toBe(MINIMUM_DAMAGE);
    });
  });

  describe('applyFatiguePenalty', () => {
    it('should not modify damage at 0 fatigue', () => {
      expect(applyFatiguePenalty(100, 0)).toBe(100);
    });

    it('should reduce damage at max fatigue', () => {
      const result = applyFatiguePenalty(100, 100);
      const expected = Math.floor(100 * (1 - MAX_FATIGUE_PENALTY));
      expect(result).toBe(expected);
    });

    it('should reduce damage proportionally', () => {
      // At 50% fatigue, expect 15% penalty (half of max 30%)
      const result = applyFatiguePenalty(100, 50);
      expect(result).toBe(85);
    });

    it('should clamp fatigue to valid range', () => {
      expect(applyFatiguePenalty(100, -10)).toBe(100); // Treats as 0
      expect(applyFatiguePenalty(100, 150)).toBe(70); // Treats as 100
    });
  });

  describe('applyTypeEffectiveness', () => {
    it('should not modify damage at 1.0 effectiveness', () => {
      expect(applyTypeEffectiveness(100, 1.0)).toBe(100);
    });

    it('should increase damage for super effective', () => {
      expect(applyTypeEffectiveness(100, 2.0)).toBe(200);
    });

    it('should decrease damage for not very effective', () => {
      expect(applyTypeEffectiveness(100, 0.5)).toBe(50);
    });

    it('should ensure minimum damage', () => {
      expect(applyTypeEffectiveness(10, 0.05)).toBe(MINIMUM_DAMAGE);
    });
  });

  describe('calculateDamage (complete)', () => {
    it('should calculate damage with all modifiers', () => {
      const result = calculateDamage(
        {
          attackPower: 20,
          defenderDefense: 10,
          isDefenderDefending: false,
          isCritical: false,
        },
        0.5 // No variance
      );

      expect(result.finalDamage).toBe(15);
      expect(result.baseDamage).toBe(15);
    });

    it('should apply critical hit', () => {
      const result = calculateDamage(
        {
          attackPower: 20,
          defenderDefense: 10,
          isDefenderDefending: false,
          isCritical: true,
          critMultiplier: 2.0,
        },
        0.5
      );

      expect(result.finalDamage).toBe(30); // 15 * 2 = 30
      expect(result.critMultiplierApplied).toBe(2.0);
    });

    it('should apply defense stance', () => {
      const result = calculateDamage(
        {
          attackPower: 20,
          defenderDefense: 10,
          isDefenderDefending: true,
          isCritical: false,
        },
        0.5
      );

      expect(result.finalDamage).toBe(7); // 15 * 0.5 = 7.5 -> 7
    });

    it('should apply all modifiers together', () => {
      const result = calculateDamage(
        {
          attackPower: 100,
          defenderDefense: 20,
          isDefenderDefending: true,
          isCritical: true,
          critMultiplier: 1.5,
          fatiguePenalty: 50,
          typeEffectiveness: 1.5,
        },
        0.5
      );

      // Base: 100 - 10 = 90
      // After crit: 90 * 1.5 = 135
      // After fatigue: 135 * 0.85 = 114
      // After type: 114 * 1.5 = 171
      // After defend: 171 * 0.5 = 85
      expect(result.finalDamage).toBe(85);
    });
  });

  describe('calculateHitChance', () => {
    it('should calculate hit chance as accuracy - evasion', () => {
      expect(calculateHitChance(75, 10)).toBe(65);
    });

    it('should clamp minimum hit chance to 5%', () => {
      expect(calculateHitChance(10, 80)).toBe(5);
    });

    it('should clamp maximum hit chance to 95%', () => {
      expect(calculateHitChance(100, 0)).toBe(95);
    });

    it('should apply modifiers', () => {
      expect(calculateHitChance(50, 10, 10)).toBe(50); // 50 - 10 + 10 = 50
    });
  });

  describe('rollHit', () => {
    it('should hit when roll is below hit chance', () => {
      expect(rollHit(50, 0.3)).toBe(true); // 30 < 50
    });

    it('should miss when roll is above hit chance', () => {
      expect(rollHit(50, 0.7)).toBe(false); // 70 > 50
    });

    it('should always hit at 95% with low roll', () => {
      expect(rollHit(95, 0.01)).toBe(true);
    });

    it('should always miss at 5% with high roll', () => {
      expect(rollHit(5, 0.9)).toBe(false);
    });
  });

  describe('rollCritical', () => {
    it('should crit when roll is below crit chance', () => {
      expect(rollCritical(20, 0.1)).toBe(true); // 10 < 20
    });

    it('should not crit when roll is above crit chance', () => {
      expect(rollCritical(10, 0.5)).toBe(false); // 50 > 10
    });
  });

  describe('calculateStatusEffectDamage', () => {
    it('should calculate poison damage', () => {
      const effect: StatusEffect = { type: 'poisoned', turnsRemaining: 3, value: 5 };
      expect(calculateStatusEffectDamage(effect, 100)).toBe(5);
    });

    it('should calculate burning damage (1.5x poison)', () => {
      const effect: StatusEffect = { type: 'burning', turnsRemaining: 2, value: 10 };
      expect(calculateStatusEffectDamage(effect, 100)).toBe(15);
    });

    it('should calculate bleeding damage as % of max HP', () => {
      const effect: StatusEffect = { type: 'bleeding', turnsRemaining: 3, value: 5 };
      expect(calculateStatusEffectDamage(effect, 100)).toBe(5); // 5% of 100
    });

    it('should return 0 for non-damage effects', () => {
      const effect: StatusEffect = { type: 'buffed', turnsRemaining: 3, value: 20 };
      expect(calculateStatusEffectDamage(effect, 100)).toBe(0);
    });
  });

  describe('calculateHeal', () => {
    it('should heal up to max HP', () => {
      expect(calculateHeal(50, 100, 60)).toBe(50); // Can only heal 50 more
    });

    it('should heal full amount when below max', () => {
      expect(calculateHeal(30, 100, 20)).toBe(20);
    });

    it('should return 0 at full HP', () => {
      expect(calculateHeal(100, 100, 50)).toBe(0);
    });
  });

  describe('applyStatusEffectModifiers', () => {
    const baseStats: CombatStats = {
      hp: 100,
      maxHP: 100,
      attack: 20,
      defense: 10,
      speed: 15,
      accuracy: 75,
      evasion: 10,
      critChance: 10,
      critMultiplier: 1.5,
    };

    it('should not modify stats with no effects', () => {
      const result = applyStatusEffectModifiers(baseStats, []);
      expect(result).toEqual(baseStats);
    });

    it('should apply buff effect', () => {
      const effects: StatusEffect[] = [{ type: 'buffed', turnsRemaining: 2, value: 20 }];
      const result = applyStatusEffectModifiers(baseStats, effects);

      expect(result.attack).toBe(24); // 20 * 1.2 = 24
      expect(result.defense).toBe(12); // 10 * 1.2 = 12
    });

    it('should apply debuff effect', () => {
      const effects: StatusEffect[] = [{ type: 'debuffed', turnsRemaining: 2, value: 20 }];
      const result = applyStatusEffectModifiers(baseStats, effects);

      expect(result.attack).toBe(16); // 20 * 0.8 = 16
      expect(result.accuracy).toBe(60); // 75 * 0.8 = 60
    });

    it('should set speed to 0 when stunned', () => {
      const effects: StatusEffect[] = [{ type: 'stunned', turnsRemaining: 1, value: 0 }];
      const result = applyStatusEffectModifiers(baseStats, effects);

      expect(result.speed).toBe(0);
    });

    it('should increase defense when defending', () => {
      const effects: StatusEffect[] = [{ type: 'defending', turnsRemaining: 1, value: 50 }];
      const result = applyStatusEffectModifiers(baseStats, effects);

      expect(result.defense).toBe(15); // 10 * 1.5 = 15
    });
  });
});
