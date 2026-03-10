export const signal_rockAtmosphere = {
    dangerLevel: 4,
    wealthLevel: 2,
    populationDensity: 'sparse',
    lawLevel: 'lawless',

    sound: {
      base: 'mountain_wind',
      accents: ['raven_call', 'coyote_howl'],
    },

    lighting: {
      lanternPositions: [],
      litWindows: [],
      campfires: [
        { x: 48, y: 0, z: 48 },   // Base camp fire
        { x: 40, y: 8, z: 20 },    // Signal fire (when lit)
      ],
      peakActivity: 'night',
    },

    weather: {
      dominant: 'windy',
      variability: 'moderate',
      particleEffect: 'dust_light',
    },
  };
