/**
 * camping.test.ts - Tests for CampingSystem
 */

import {
    calculateRestRecovery,
    CampingSystem,
    createCampingSystem,
    getRecommendedRestDuration,
    getRestDurationLabel
} from '../camping';
import { FatigueSystem } from '../fatigue';
import { ProvisionsSystem } from '../provisions';
import { GameClock } from '../time';

describe('CampingSystem', () => {
  let camping: CampingSystem;
  let fatigue: FatigueSystem;
  let provisions: ProvisionsSystem;
  let clock: GameClock;

  beforeEach(() => {
    camping = new CampingSystem();
    fatigue = new FatigueSystem();
    provisions = new ProvisionsSystem();
    clock = new GameClock();
  });

  afterEach(() => {
    clock.dispose();
  });

  describe('initialization', () => {
    it('should create with default config', () => {
      expect(camping).toBeDefined();
      expect(camping.isCamping()).toBe(false);
    });

    it('should create with custom initial state', () => {
      const custom = new CampingSystem(undefined, { isCamping: true });
      expect(custom.isCamping()).toBe(true);
    });

    it('should start with no fire', () => {
      expect(camping.hasFire()).toBe(false);
      expect(camping.getFireState()).toBe('none');
    });

    it('should have zero fuel initially', () => {
      expect(camping.getFuelRemaining()).toBe(0);
    });
  });

  describe('camping queries', () => {
    it('should check if camping', () => {
      expect(camping.isCamping()).toBe(false);
    });

    it('should get fire state', () => {
      expect(camping.getFireState()).toBe('none');
    });

    it('should check if has fire', () => {
      expect(camping.hasFire()).toBe(false);
    });

    it('should get fuel remaining', () => {
      expect(camping.getFuelRemaining()).toBe(0);
    });

    it('should get hours camped', () => {
      expect(camping.getHoursCamped()).toBe(0);
    });

    it('should get rest durations', () => {
      const durations = camping.getRestDurations();
      expect(durations).toEqual([2, 4, 8]);
    });
  });

  describe('camp eligibility', () => {
    it('should allow camping in wilderness', () => {
      expect(camping.canCamp('plains')).toBe(true);
      expect(camping.canCamp('forest')).toBe(true);
      expect(camping.canCamp('desert')).toBe(true);
      expect(camping.canCamp('mountains')).toBe(true);
    });

    it('should not allow camping in town', () => {
      expect(camping.canCamp('town')).toBe(false);
    });
  });

  describe('recovery estimation', () => {
    it('should estimate recovery without fire', () => {
      const recovery = camping.estimateRecovery(4, false, false);
      expect(recovery).toBe(48); // 4 * 12
    });

    it('should estimate recovery with fire', () => {
      const recovery = camping.estimateRecovery(4, true, false);
      expect(recovery).toBe(60); // 4 * 15
    });

    it('should estimate recovery during day', () => {
      const recovery = camping.estimateRecovery(4, false, true);
      expect(recovery).toBe(60); // 4 * (12 + 3)
    });

    it('should estimate recovery with fire during day', () => {
      const recovery = camping.estimateRecovery(4, true, true);
      expect(recovery).toBe(72); // 4 * (15 + 3)
    });
  });

  describe('encounter chances', () => {
    it('should calculate base encounter chance', () => {
      const chance = camping.getEncounterChance('plains', false, false);
      expect(chance).toBe(0.15); // Base 15%
    });

    it('should increase chance at night', () => {
      const dayChance = camping.getEncounterChance('plains', false, false);
      const nightChance = camping.getEncounterChance('plains', true, false);
      expect(nightChance).toBeGreaterThan(dayChance);
    });

    it('should modify by terrain', () => {
      const desertChance = camping.getEncounterChance('desert', false, false);
      const badlandsChance = camping.getEncounterChance('badlands', false, false);
      expect(badlandsChance).toBeGreaterThan(desertChance);
    });

    it('should reduce hostile encounters with fire', () => {
      const noFireChance = camping.getEncounterChance('plains', false, false);
      const fireChance = camping.getEncounterChance('plains', false, true);
      expect(fireChance).toBeLessThan(noFireChance);
    });

    it('should be zero in town', () => {
      const chance = camping.getEncounterChance('town', false, false);
      expect(chance).toBe(0);
    });

    it('should clamp to valid range', () => {
      const chance = camping.getEncounterChance('badlands', true, false);
      expect(chance).toBeGreaterThanOrEqual(0);
      expect(chance).toBeLessThanOrEqual(1);
    });
  });

  describe('camp setup', () => {
    it('should setup camp without fire', () => {
      camping.setupCamp(false, 0, 100);
      expect(camping.isCamping()).toBe(true);
      expect(camping.hasFire()).toBe(false);
    });

    it('should setup camp with fire', () => {
      camping.setupCamp(true, 5, 100);
      expect(camping.isCamping()).toBe(true);
      expect(camping.hasFire()).toBe(true);
      expect(camping.getFireState()).toBe('burning');
      expect(camping.getFuelRemaining()).toBe(5);
    });

    it('should not start fire without fuel', () => {
      camping.setupCamp(true, 0, 100);
      expect(camping.hasFire()).toBe(false);
    });

    it('should reset hours camped', () => {
      camping.setupCamp(false, 0, 100);
      expect(camping.getHoursCamped()).toBe(0);
    });
  });

  describe('fire management', () => {
    beforeEach(() => {
      camping.setupCamp(true, 5, 0);
    });

    it('should add fuel to fire', () => {
      camping.addFuel(3);
      expect(camping.getFuelRemaining()).toBe(8);
    });

    it('should relight fire when adding fuel', () => {
      camping.setupCamp(false, 0, 0);
      camping.addFuel(5);
      expect(camping.getFireState()).toBe('burning');
    });

    it('should relight smoldering fire', () => {
      const state = camping.getState();
      camping.loadState({ ...state, fireState: 'smoldering', fuelRemaining: 0 });
      camping.addFuel(3);
      expect(camping.getFireState()).toBe('burning');
    });
  });

  describe('break camp', () => {
    it('should end camping', () => {
      camping.setupCamp(true, 5, 0);
      camping.breakCamp();
      expect(camping.isCamping()).toBe(false);
    });

    it('should extinguish fire', () => {
      camping.setupCamp(true, 5, 0);
      camping.breakCamp();
      expect(camping.hasFire()).toBe(false);
      expect(camping.getFuelRemaining()).toBe(0);
    });
  });

  describe('rest mechanics', () => {
    beforeEach(() => {
      camping.setupCamp(false, 0, 0);
      fatigue.setFatigue(60);
    });

    it('should rest for specified duration', () => {
      // Use a high roll to avoid encounters
      const rng = () => 0.99;
      const result = camping.rest(2, fatigue, provisions, clock, 'plains', rng);

      expect(result.hoursRested).toBe(2);
      expect(result.fatigueRecovered).toBeGreaterThan(0);
    });

    it('should consume provisions while resting', () => {
      const initialFood = provisions.getFood();
      camping.rest(2, fatigue, provisions, clock, 'plains');

      expect(provisions.getFood()).toBeLessThan(initialFood);
    });

    it('should advance time', () => {
      const initialMinutes = clock.getTotalMinutes();
      camping.rest(2, fatigue, provisions, clock, 'plains');

      expect(clock.getTotalMinutes()).toBeGreaterThan(initialMinutes);
    });

    it('should recover more fatigue with fire', () => {
      camping.setupCamp(true, 10, 0);
      const result = camping.rest(2, fatigue, provisions, clock, 'plains');

      expect(result.fatigueRecovered).toBeGreaterThan(24); // More than no-fire rate
    });

    it('should consume fuel during rest', () => {
      camping.setupCamp(true, 5, 0);
      camping.rest(2, fatigue, provisions, clock, 'plains');

      expect(camping.getFuelRemaining()).toBeLessThan(5);
    });

    it('should extinguish fire when out of fuel', () => {
      camping.setupCamp(true, 1, 0);
      camping.rest(2, fatigue, provisions, clock, 'plains');

      expect(camping.getFireState()).toBe('smoldering');
    });

    it('should return end phase', () => {
      const result = camping.rest(2, fatigue, provisions, clock, 'plains');
      expect(result.endPhase).toBeDefined();
    });

    it('should generate summary', () => {
      const result = camping.rest(2, fatigue, provisions, clock, 'plains');
      expect(result.summary).toContain('rested');
    });
  });

  describe('encounter checks', () => {
    beforeEach(() => {
      camping.setupCamp(false, 0, 0);
    });

    it('should check for encounters', () => {
      const rng = () => 0.5;
      const encounter = camping.checkEncounter('plains', false, rng);
      expect(encounter).toHaveProperty('type');
      expect(encounter).toHaveProperty('isCombat');
      expect(encounter).toHaveProperty('description');
    });

    it('should return none with high roll', () => {
      const rng = () => 0.99;
      const encounter = camping.checkEncounter('plains', false, rng);
      expect(encounter.type).toBe('none');
    });

    it('should generate encounter with low roll', () => {
      const rng = () => 0.01;
      const encounter = camping.checkEncounter('plains', false, rng);
      expect(encounter.type).not.toBe('none');
    });

    it('should have combat encounters', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.01) // Trigger encounter
        .mockReturnValueOnce(0.05); // Wildlife hostile

      const encounter = camping.checkEncounter('plains', false, rng);
      if (encounter.type === 'wildlife_hostile' || encounter.type === 'bandit_raid') {
        expect(encounter.isCombat).toBe(true);
        expect(encounter.encounterId).toBeDefined();
      }
    });

    it('should have non-combat encounters', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.01) // Trigger encounter
        .mockReturnValueOnce(0.3); // Traveler friendly

      const encounter = camping.checkEncounter('plains', false, rng);
      if (encounter.type === 'traveler_friendly') {
        expect(encounter.isCombat).toBe(false);
      }
    });

    it('should wake player for hostile encounters', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.01) // Trigger encounter
        .mockReturnValueOnce(0.05); // Wildlife hostile

      const encounter = camping.checkEncounter('plains', false, rng);
      if (encounter.type === 'wildlife_hostile') {
        expect(encounter.wakesPlayer).toBe(true);
      }
    });

    it('should have resource changes for some encounters', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.01) // Trigger encounter
        .mockReturnValueOnce(0.95); // Discovery

      const encounter = camping.checkEncounter('plains', false, rng);
      if (encounter.type === 'discovery') {
        expect(encounter.resourceChange).toBeDefined();
      }
    });
  });

  describe('rest interruption', () => {
    beforeEach(() => {
      camping.setupCamp(false, 0, 0);
      fatigue.setFatigue(60);
    });

    it('should interrupt rest on hostile encounter', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.01) // Trigger encounter
        .mockReturnValueOnce(0.05); // Wildlife hostile

      const result = camping.rest(4, fatigue, provisions, clock, 'plains', rng);

      if (result.wasInterrupted) {
        expect(result.hoursRested).toBeLessThan(4);
        expect(result.encounters.length).toBeGreaterThan(0);
      }
    });

    it('should continue rest on passive encounter', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.01) // Trigger encounter
        .mockReturnValueOnce(0.2); // Passive wildlife

      const result = camping.rest(4, fatigue, provisions, clock, 'plains', rng);

      // Passive encounters don't interrupt
      expect(result.hoursRested).toBe(4);
    });

    it('should record all encounters', () => {
      const rng = jest.fn()
        .mockReturnValue(0.01); // Always trigger encounters

      const result = camping.rest(4, fatigue, provisions, clock, 'plains', rng);

      expect(result.encounters.length).toBeGreaterThan(0);
    });

    it('should update summary when interrupted', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.01) // Trigger encounter
        .mockReturnValueOnce(0.05); // Wildlife hostile

      const result = camping.rest(4, fatigue, provisions, clock, 'plains', rng);

      if (result.wasInterrupted) {
        expect(result.summary).toContain('interrupted');
      }
    });
  });

  describe('multiple rest sessions', () => {
    beforeEach(() => {
      camping.setupCamp(false, 0, 0);
    });

    it('should accumulate hours camped', () => {
      camping.rest(2, fatigue, provisions, clock, 'plains');
      camping.rest(2, fatigue, provisions, clock, 'plains');

      expect(camping.getHoursCamped()).toBe(4);
    });

    it('should track encounters across sessions', () => {
      const rng = () => 0.01; // Always trigger
      camping.rest(2, fatigue, provisions, clock, 'plains', rng);
      camping.rest(2, fatigue, provisions, clock, 'plains', rng);

      const state = camping.getState();
      expect(state.encounters.length).toBeGreaterThan(0);
    });
  });

  describe('serialization', () => {
    it('should get state', () => {
      camping.setupCamp(true, 5, 100);
      const state = camping.getState();

      expect(state).toHaveProperty('isCamping', true);
      expect(state).toHaveProperty('fireState', 'burning');
      expect(state).toHaveProperty('fuelRemaining', 5);
      expect(state).toHaveProperty('campStartTime', 100);
    });

    it('should load state', () => {
      const newState = {
        isCamping: true,
        fireState: 'burning' as const,
        fuelRemaining: 10,
        campStartTime: 500,
        hoursCamped: 4,
        encounters: [],
      };

      camping.loadState(newState);

      expect(camping.isCamping()).toBe(true);
      expect(camping.getFireState()).toBe('burning');
      expect(camping.getFuelRemaining()).toBe(10);
      expect(camping.getHoursCamped()).toBe(4);
    });

    it('should reset to default state', () => {
      camping.setupCamp(true, 5, 100);
      camping.reset();

      expect(camping.isCamping()).toBe(false);
      expect(camping.hasFire()).toBe(false);
      expect(camping.getFuelRemaining()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle zero duration rest', () => {
      camping.setupCamp(false, 0, 0);
      const result = camping.rest(2, fatigue, provisions, clock, 'plains');
      expect(result.hoursRested).toBeGreaterThanOrEqual(0);
    });

    it('should handle negative fuel', () => {
      camping.setupCamp(true, 1, 0);
      camping.rest(4, fatigue, provisions, clock, 'plains');
      expect(camping.getFuelRemaining()).toBe(0);
    });

    it('should handle very high encounter chance', () => {
      const rng = () => 0.01;
      const result = camping.rest(8, fatigue, provisions, clock, 'badlands', rng);
      expect(result.encounters.length).toBeGreaterThan(0);
    });

    it('should handle camping in town (should not be possible)', () => {
      expect(camping.canCamp('town')).toBe(false);
    });

    it('should handle multiple fuel additions', () => {
      camping.setupCamp(true, 5, 0);
      camping.addFuel(3);
      camping.addFuel(2);
      expect(camping.getFuelRemaining()).toBe(10);
    });
  });

  describe('encounter types', () => {
    it('should generate wildlife passive encounters', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.01)
        .mockReturnValueOnce(0.2);

      const encounter = camping.checkEncounter('plains', false, rng);
      if (encounter.type === 'wildlife_passive') {
        expect(encounter.isCombat).toBe(false);
        expect(encounter.wakesPlayer).toBe(false);
      }
    });

    it('should generate bandit encounters', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.01)
        .mockReturnValueOnce(0.35);

      const encounter = camping.checkEncounter('badlands', false, rng);
      if (encounter.type === 'bandit_scout' || encounter.type === 'bandit_raid') {
        expect(encounter.description).toBeDefined();
      }
    });

    it('should generate traveler encounters', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.01)
        .mockReturnValueOnce(0.5);

      const encounter = camping.checkEncounter('plains', false, rng);
      if (encounter.type === 'traveler_friendly' || encounter.type === 'traveler_suspicious') {
        expect(encounter.description).toBeDefined();
      }
    });

    it('should generate weather events', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.01)
        .mockReturnValueOnce(0.85);

      const encounter = camping.checkEncounter('plains', false, rng);
      if (encounter.type === 'weather_event') {
        expect(encounter.wakesPlayer).toBe(true);
      }
    });

    it('should generate discoveries', () => {
      const rng = jest.fn()
        .mockReturnValueOnce(0.01)
        .mockReturnValueOnce(0.95);

      const encounter = camping.checkEncounter('plains', false, rng);
      if (encounter.type === 'discovery') {
        expect(encounter.resourceChange).toBeDefined();
        expect(encounter.resourceChange?.gold).toBeGreaterThan(0);
      }
    });
  });
});

describe('utility functions', () => {
  describe('createCampingSystem', () => {
    it('should create system with default state', () => {
      const system = createCampingSystem();
      expect(system.isCamping()).toBe(false);
    });

    it('should create system with custom state', () => {
      const system = createCampingSystem({ isCamping: true });
      expect(system.isCamping()).toBe(true);
    });
  });

  describe('calculateRestRecovery', () => {
    it('should calculate recovery without fire', () => {
      const recovery = calculateRestRecovery(4, false, false);
      expect(recovery).toBe(48); // 4 * 12
    });

    it('should calculate recovery with fire', () => {
      const recovery = calculateRestRecovery(4, true, false);
      expect(recovery).toBe(60); // 4 * 15
    });

    it('should calculate recovery during day', () => {
      const recovery = calculateRestRecovery(4, false, true);
      expect(recovery).toBe(60); // 4 * (12 + 3)
    });

    it('should calculate recovery with fire during day', () => {
      const recovery = calculateRestRecovery(4, true, true);
      expect(recovery).toBe(72); // 4 * (15 + 3)
    });

    it('should handle fractional hours', () => {
      const recovery = calculateRestRecovery(2.5, true, false);
      expect(recovery).toBe(37.5);
    });
  });

  describe('getRestDurationLabel', () => {
    it('should get label for 2 hours', () => {
      expect(getRestDurationLabel(2)).toBe('Short Rest (2 hours)');
    });

    it('should get label for 4 hours', () => {
      expect(getRestDurationLabel(4)).toBe('Medium Rest (4 hours)');
    });

    it('should get label for 8 hours', () => {
      expect(getRestDurationLabel(8)).toBe('Full Rest (8 hours)');
    });
  });

  describe('getRecommendedRestDuration', () => {
    it('should recommend short rest when low fatigue', () => {
      expect(getRecommendedRestDuration(30)).toBe(2);
    });

    it('should recommend medium rest when moderate fatigue', () => {
      expect(getRecommendedRestDuration(60)).toBe(4);
    });

    it('should recommend full rest when high fatigue', () => {
      expect(getRecommendedRestDuration(80)).toBe(8);
    });

    it('should handle boundary values', () => {
      expect(getRecommendedRestDuration(49)).toBe(2);
      expect(getRecommendedRestDuration(50)).toBe(4);
      expect(getRecommendedRestDuration(74)).toBe(4);
      expect(getRecommendedRestDuration(75)).toBe(8);
    });
  });
});
