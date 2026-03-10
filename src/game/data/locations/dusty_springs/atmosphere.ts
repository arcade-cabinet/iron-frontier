export const dusty_springsAtmosphere = {
    dangerLevel: 1, // Safe in town, mostly
    wealthLevel: 4, // Modest prosperity
    populationDensity: 'sparse', // ~200 souls
    lawLevel: 'frontier', // Sheriff Cole does his best

    sound: {
      base: 'town_bustle',
      accents: [
        'horse_whinny',
        'blacksmith_hammer',
        'piano_distant',
        'dog_bark',
        'cart_creak',
        'rooster_crow',
      ],
    },

    lighting: {
      lanternPositions: [
        { x: 80, y: 3, z: 72 },   // Saloon porch
        { x: 64, y: 3, z: 74 },   // Sheriff porch
        { x: 96, y: 3, z: 72 },   // Mercantile porch
        { x: 72, y: 3, z: 72 },   // Hotel porch
        { x: 80, y: 2, z: 56 },   // Well area post
        { x: 80, y: 8, z: 40 },   // Water tower lantern
        { x: 5, y: 2, z: 76 },    // West entrance signpost
        { x: 140, y: 2, z: 76 },  // East signpost
        { x: 40, y: 3, z: 102 },  // Church entrance
      ],
      litWindows: [
        'rusty_spur_saloon',
        'sheriff_office',
        'holts_mercantile',
        'dusty_rose_hotel',
        'holt_mansion',
      ],
      campfires: [],
      peakActivity: 'afternoon',
    },

    weather: {
      dominant: 'clear',
      variability: 'mild',
      particleEffect: 'dust_light',
    },
  };
