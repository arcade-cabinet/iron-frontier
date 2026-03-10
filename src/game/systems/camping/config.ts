import type { CampEncounterType, CampingConfig, CampingState } from './types';

export const DEFAULT_CAMPING_CONFIG: CampingConfig = {
  restDurations: [2, 4, 8],

  recoveryRates: {
    noFire: 12,
    withFire: 15,
    dayBonus: 3,
  },

  fire: {
    safetyBonus: 0.5,
    visibilityIncrease: 2,
    fuelPerHour: 1,
  },

  encounterChances: {
    base: 0.15,
    nightMultiplier: 1.5,
    terrainModifiers: {
      desert: 0.8,
      plains: 1.0,
      grassland: 1.0,
      forest: 1.2,
      mountains: 1.1,
      badlands: 1.3,
      riverside: 0.9,
      town: 0,
    },
  },

  encounterProbabilities: {
    none: 0,
    wildlife_passive: 0.25,
    wildlife_hostile: 0.15,
    bandit_scout: 0.15,
    bandit_raid: 0.10,
    traveler_friendly: 0.15,
    traveler_suspicious: 0.10,
    weather_event: 0.05,
    discovery: 0.05,
  },
};

export const DEFAULT_CAMPING_STATE: CampingState = {
  isCamping: false,
  fireState: 'none',
  fuelRemaining: 0,
  campStartTime: 0,
  hoursCamped: 0,
  encounters: [],
};

export const ENCOUNTER_DESCRIPTIONS: Record<CampEncounterType, string[]> = {
  none: [],
  wildlife_passive: [
    'A curious rabbit watches your camp from a distance.',
    'An owl hoots softly from a nearby tree.',
    'A family of deer passes by peacefully.',
    'You hear coyotes howling in the distance.',
  ],
  wildlife_hostile: [
    'A rattlesnake slithers into your camp!',
    'A pack of coyotes circles your camp, drawn by the smell of food.',
    'You wake to find a mountain lion prowling nearby!',
    'A angry javelina charges out of the brush!',
  ],
  bandit_scout: [
    'You spot a figure watching your camp from the shadows.',
    'The sound of hooves retreating quickly catches your attention.',
    'You find fresh boot prints around your camp perimeter.',
  ],
  bandit_raid: [
    'Armed men emerge from the darkness, demanding your valuables!',
    'You wake to find bandits rifling through your belongings!',
    'A voice calls out: "Nobody moves, nobody gets hurt!"',
  ],
  traveler_friendly: [
    'A weary traveler asks to share your fire.',
    'A prospector passes by and shares some water.',
    'A friendly trader offers to share news of the road ahead.',
  ],
  traveler_suspicious: [
    'A stranger in a long coat watches your camp from a distance.',
    'Someone approaches but turns away when they see you\'re awake.',
    'You notice someone has been going through your things...',
  ],
  weather_event: [
    'A sudden dust storm forces you to take cover.',
    'Thunder rumbles as a storm rolls in.',
    'The temperature drops sharply as night deepens.',
  ],
  discovery: [
    'You find an old trail marker pointing to a hidden spring.',
    'Digging to make camp, you uncover an old coin purse.',
    'You spot tracks leading to what might be an abandoned mine.',
  ],
};
