import type { CampEncounter, CampEncounterType, CampingConfig } from './types';
import { ENCOUNTER_DESCRIPTIONS } from './config';

export function rollEncounterType(
  config: CampingConfig,
  random: () => number
): CampEncounterType {
  const { encounterProbabilities } = config;
  const roll = random();
  let cumulative = 0;

  for (const [type, probability] of Object.entries(encounterProbabilities)) {
    if (type === 'none') continue;
    cumulative += probability;
    if (roll < cumulative) {
      return type as CampEncounterType;
    }
  }

  console.error(`[CampingSystem] Encounter probability roll fell through — probabilities may not sum to 1`);
  return 'wildlife_passive';
}

export function generateEncounter(
  type: CampEncounterType,
  random: () => number
): CampEncounter {
  const descriptions = ENCOUNTER_DESCRIPTIONS[type];
  const description =
    descriptions.length > 0
      ? descriptions[Math.floor(random() * descriptions.length)]
      : '';

  const baseEncounter: CampEncounter = {
    type,
    isCombat: false,
    description,
    wakesPlayer: false,
  };

  switch (type) {
    case 'wildlife_hostile':
      return {
        ...baseEncounter,
        isCombat: true,
        encounterId: 'camp_wildlife_attack',
        wakesPlayer: true,
      };

    case 'bandit_raid':
      return {
        ...baseEncounter,
        isCombat: true,
        encounterId: 'camp_bandit_raid',
        wakesPlayer: true,
      };

    case 'bandit_scout':
      return {
        ...baseEncounter,
        wakesPlayer: random() > 0.5,
      };

    case 'traveler_suspicious':
      return {
        ...baseEncounter,
        wakesPlayer: true,
        resourceChange: random() > 0.7 ? { gold: -Math.floor(random() * 10 + 5) } : undefined,
      };

    case 'discovery':
      return {
        ...baseEncounter,
        wakesPlayer: false,
        resourceChange: {
          gold: Math.floor(random() * 15 + 5),
        },
      };

    case 'weather_event':
      return {
        ...baseEncounter,
        wakesPlayer: true,
      };

    default:
      return baseEncounter;
  }
}
