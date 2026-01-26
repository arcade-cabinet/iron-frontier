/**
 * Tests for the Faction Reputation System
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
  // Faction data
  IVRC_FACTION,
  COPPERHEADS_FACTION,
  FREEMINERS_FACTION,
  LAW_FACTION,
  TOWNSFOLK_FACTION,
  ALL_FACTIONS,
  FACTIONS_BY_ID,
  // Functions
  getFaction,
  getAllFactionIds,
  getFactionTierEffects,
  getFactionAction,
  calculateActionReputationChanges,
  applyFactionDecay,
  createInitialFactionState,
  canPerformAction,
  performFactionAction,
  isHostileWithFaction,
  getShopPriceModifier,
  getQuestAvailability,
  getActivePerks,
  hasPerk,
  // Utilities
  getReputationTier,
  calculateReputationChange,
  REPUTATION_TIER_BOUNDARIES,
} from '../index';

describe('Faction System', () => {
  describe('Faction Definitions', () => {
    test('all five factions are defined', () => {
      expect(ALL_FACTIONS).toHaveLength(5);
      expect(FACTIONS_BY_ID['ivrc']).toBeDefined();
      expect(FACTIONS_BY_ID['copperheads']).toBeDefined();
      expect(FACTIONS_BY_ID['freeminers']).toBeDefined();
      expect(FACTIONS_BY_ID['law']).toBeDefined();
      expect(FACTIONS_BY_ID['townsfolk']).toBeDefined();
    });

    test('each faction has required properties', () => {
      for (const faction of ALL_FACTIONS) {
        expect(faction.id).toBeDefined();
        expect(faction.name).toBeDefined();
        expect(faction.fullName).toBeDefined();
        expect(faction.description).toBeDefined();
        expect(faction.lore).toBeDefined();
        expect(faction.tierEffects).toHaveLength(7);
        expect(faction.actions.length).toBeGreaterThan(20);
      }
    });

    test('IVRC faction has correct structure', () => {
      expect(IVRC_FACTION.id).toBe('ivrc');
      expect(IVRC_FACTION.name).toBe('IVRC');
      expect(IVRC_FACTION.type).toBe('corporation');
      expect(IVRC_FACTION.defaultReputation).toBe(0);
    });

    test('Copperheads faction starts hostile', () => {
      expect(COPPERHEADS_FACTION.defaultReputation).toBe(-10);
    });

    test('Freeminers faction starts slightly friendly', () => {
      expect(FREEMINERS_FACTION.defaultReputation).toBe(5);
    });
  });

  describe('Reputation Tiers', () => {
    test('getReputationTier returns correct tier for reputation values', () => {
      expect(getReputationTier(-100)).toBe('hated');
      expect(getReputationTier(-75)).toBe('hated');
      expect(getReputationTier(-60)).toBe('hostile');
      expect(getReputationTier(-31)).toBe('hostile');
      expect(getReputationTier(-30)).toBe('unfriendly');
      expect(getReputationTier(-11)).toBe('unfriendly');
      expect(getReputationTier(-10)).toBe('neutral');
      expect(getReputationTier(0)).toBe('neutral');
      expect(getReputationTier(10)).toBe('neutral');
      expect(getReputationTier(11)).toBe('friendly');
      expect(getReputationTier(30)).toBe('friendly');
      expect(getReputationTier(31)).toBe('honored');
      expect(getReputationTier(60)).toBe('honored');
      expect(getReputationTier(61)).toBe('revered');
      expect(getReputationTier(100)).toBe('revered');
    });

    test('tier boundaries are consistent', () => {
      expect(REPUTATION_TIER_BOUNDARIES.hated.min).toBe(-100);
      expect(REPUTATION_TIER_BOUNDARIES.revered.max).toBe(100);
    });
  });

  describe('Faction Tier Effects', () => {
    test('getFactionTierEffects returns correct effects', () => {
      const hatedEffects = getFactionTierEffects('ivrc', -100);
      expect(hatedEffects?.tier).toBe('hated');
      expect(hatedEffects?.attackOnSight).toBe(true);
      expect(hatedEffects?.canTrade).toBe(false);
      expect(hatedEffects?.priceModifier).toBe(2.0);

      const reveredEffects = getFactionTierEffects('ivrc', 100);
      expect(reveredEffects?.tier).toBe('revered');
      expect(reveredEffects?.attackOnSight).toBe(false);
      expect(reveredEffects?.priceModifier).toBeLessThan(1.0);
    });

    test('hostile tier effects include attack on sight', () => {
      const copperheadHated = getFactionTierEffects('copperheads', -100);
      expect(copperheadHated?.attackOnSight).toBe(true);

      const lawHated = getFactionTierEffects('law', -100);
      expect(lawHated?.attackOnSight).toBe(true);
    });
  });

  describe('Faction Actions', () => {
    test('each faction has 20+ actions', () => {
      for (const faction of ALL_FACTIONS) {
        expect(faction.actions.length).toBeGreaterThanOrEqual(20);
      }
    });

    test('getFactionAction returns correct action', () => {
      const action = getFactionAction('ivrc', 'ivrc_quest_main');
      expect(action).toBeDefined();
      expect(action?.name).toBe('Complete IVRC main storyline quest');
      expect(action?.reputationDelta).toBeGreaterThan(0);
      expect(action?.oneTime).toBe(true);
    });

    test('actions have correct categories', () => {
      const categories = new Set(['quest', 'combat', 'trade', 'dialogue', 'crime', 'assistance', 'betrayal', 'donation', 'discovery', 'sabotage']);
      for (const faction of ALL_FACTIONS) {
        for (const action of faction.actions) {
          expect(categories.has(action.category)).toBe(true);
        }
      }
    });
  });

  describe('Faction Relationships', () => {
    test('IVRC and Copperheads are hostile', () => {
      const ivrcRel = IVRC_FACTION.relationships.find(r => r.factionId === 'copperheads');
      expect(ivrcRel?.relationship).toBe('hostile');
      expect(ivrcRel?.rippleMultiplier).toBeLessThan(0);
    });

    test('Copperheads and Freeminers are friendly', () => {
      const copperheadRel = COPPERHEADS_FACTION.relationships.find(r => r.factionId === 'freeminers');
      expect(copperheadRel?.relationship).toBe('friendly');
      expect(copperheadRel?.rippleMultiplier).toBeGreaterThan(0);
    });

    test('Law and IVRC are allied', () => {
      const lawRel = LAW_FACTION.relationships.find(r => r.factionId === 'ivrc');
      expect(lawRel?.relationship).toBe('friendly');
    });
  });

  describe('Reputation Changes', () => {
    test('calculateReputationChange clamps to valid range', () => {
      const change = calculateReputationChange(50, 80);
      expect(change).toBeLessThanOrEqual(20); // Can't go above 100
    });

    test('calculateActionReputationChanges includes ripple effects', () => {
      const changes = calculateActionReputationChanges('ivrc', 'ivrc_quest_main', {
        ivrc: 0,
        copperheads: 0,
        law: 0,
      });

      expect(changes['ivrc']).toBeGreaterThan(0);
      // Copperheads should have negative ripple
      expect(changes['copperheads']).toBeLessThan(0);
      // Law should have positive ripple (allied)
      expect(changes['law']).toBeGreaterThan(0);
    });
  });

  describe('State Management', () => {
    let initialState: ReturnType<typeof createInitialFactionState>;

    beforeEach(() => {
      initialState = createInitialFactionState();
    });

    test('createInitialFactionState creates standings for all factions', () => {
      expect(Object.keys(initialState.standings)).toHaveLength(5);
      expect(initialState.standings['ivrc']).toBeDefined();
      expect(initialState.standings['copperheads']).toBeDefined();
    });

    test('initial standings use default reputation', () => {
      expect(initialState.standings['ivrc'].reputation).toBe(IVRC_FACTION.defaultReputation);
      expect(initialState.standings['copperheads'].reputation).toBe(COPPERHEADS_FACTION.defaultReputation);
      expect(initialState.standings['freeminers'].reputation).toBe(FREEMINERS_FACTION.defaultReputation);
    });

    test('canPerformAction returns true for new actions', () => {
      const result = canPerformAction('ivrc', 'ivrc_quest_delivery', initialState.standings['ivrc'], 0);
      expect(result.canPerform).toBe(true);
    });

    test('canPerformAction respects one-time actions', () => {
      // Simulate completing the action
      const modifiedStanding = {
        ...initialState.standings['ivrc'],
        completedActionIds: ['ivrc_quest_main'],
      };

      const result = canPerformAction('ivrc', 'ivrc_quest_main', modifiedStanding, 0);
      expect(result.canPerform).toBe(false);
      expect(result.reason).toContain('once');
    });

    test('canPerformAction respects cooldowns', () => {
      // Simulate cooldown
      const modifiedStanding = {
        ...initialState.standings['ivrc'],
        actionCooldowns: { 'ivrc_large_purchase': 100 },
      };

      const result = canPerformAction('ivrc', 'ivrc_large_purchase', modifiedStanding, 50);
      expect(result.canPerform).toBe(false);
      expect(result.reason).toContain('cooldown');
    });

    test('performFactionAction updates state correctly', () => {
      const result = performFactionAction('ivrc', 'ivrc_quest_delivery', initialState, 0);

      expect(result.success).toBe(true);
      expect(result.changes['ivrc']).toBeGreaterThan(0);
      expect(result.newState.standings['ivrc'].reputation).toBeGreaterThan(initialState.standings['ivrc'].reputation);
    });
  });

  describe('Reputation Decay', () => {
    test('applyFactionDecay moves reputation toward neutral', () => {
      const standings = {
        ivrc: {
          factionId: 'ivrc',
          reputation: 50,
          currentTier: 'honored' as const,
          completedActionIds: [],
          actionCooldowns: {},
          lastDecayHour: 0,
          peakReputation: 50,
          lowestReputation: 0,
        },
      };

      const decayed = applyFactionDecay(standings, 48); // 2 days
      expect(decayed['ivrc'].reputation).toBeLessThan(50);
    });

    test('decay stops at threshold', () => {
      const standings = {
        ivrc: {
          factionId: 'ivrc',
          reputation: 3, // Below threshold
          currentTier: 'neutral' as const,
          completedActionIds: [],
          actionCooldowns: {},
          lastDecayHour: 0,
          peakReputation: 10,
          lowestReputation: 0,
        },
      };

      const decayed = applyFactionDecay(standings, 240); // 10 days
      // Should not decay below threshold
      expect(decayed['ivrc'].reputation).toBe(3);
    });
  });

  describe('Query Functions', () => {
    test('isHostileWithFaction returns correct values', () => {
      expect(isHostileWithFaction('ivrc', -100)).toBe(true);
      expect(isHostileWithFaction('ivrc', 0)).toBe(false);
      expect(isHostileWithFaction('copperheads', -80)).toBe(true);
    });

    test('getShopPriceModifier returns correct values', () => {
      expect(getShopPriceModifier('ivrc', -100)).toBe(2.0);
      expect(getShopPriceModifier('ivrc', 0)).toBeGreaterThan(1.0);
      expect(getShopPriceModifier('ivrc', 100)).toBeLessThan(1.0);
    });

    test('getQuestAvailability returns correct values', () => {
      expect(getQuestAvailability('ivrc', -100)).toBe(0);
      expect(getQuestAvailability('ivrc', 100)).toBe(1.0);
    });

    test('getActivePerks returns perks for high reputation', () => {
      const perks = getActivePerks('ivrc', 100);
      expect(perks.length).toBeGreaterThan(0);
      expect(perks).toContain('ivrc_company_protection');
    });

    test('hasPerk checks across all factions', () => {
      const standings = {
        ivrc: {
          factionId: 'ivrc',
          reputation: 100,
          currentTier: 'revered' as const,
          completedActionIds: [],
          actionCooldowns: {},
          lastDecayHour: 0,
          peakReputation: 100,
          lowestReputation: 0,
        },
      };

      expect(hasPerk('ivrc_company_protection', standings)).toBe(true);
      expect(hasPerk('nonexistent_perk', standings)).toBe(false);
    });
  });

  describe('Faction Lookup', () => {
    test('getFaction returns correct faction', () => {
      const faction = getFaction('ivrc');
      expect(faction?.id).toBe('ivrc');
      expect(faction?.name).toBe('IVRC');
    });

    test('getAllFactionIds returns all faction IDs', () => {
      const ids = getAllFactionIds();
      expect(ids).toHaveLength(5);
      expect(ids).toContain('ivrc');
      expect(ids).toContain('copperheads');
      expect(ids).toContain('freeminers');
      expect(ids).toContain('law');
      expect(ids).toContain('townsfolk');
    });
  });
});
