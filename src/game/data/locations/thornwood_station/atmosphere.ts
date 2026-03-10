export const thornwood_stationAtmosphere = {
    dangerLevel: 1,
    wealthLevel: 4,
    populationDensity: 'sparse',
    lawLevel: 'frontier',

    sound: {
      base: 'prairie_breeze',
      accents: ['train_whistle', 'horse_whinny', 'cart_creak'],
    },

    lighting: {
      lanternPositions: [
        { x: 48, y: 3, z: 36 },   // Station platform
        { x: 64, y: 3, z: 48 },   // Inn porch
        { x: 80, y: 3, z: 48 },   // Store entrance
      ],
      litWindows: ['station', 'waystation_inn', 'travel_store'],
      campfires: [],
      peakActivity: 'afternoon',
    },

    weather: {
      dominant: 'clear',
      variability: 'mild',
      particleEffect: 'dust_light',
    },
  };
