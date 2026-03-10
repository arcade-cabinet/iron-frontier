export const freeminer_hollowAtmosphere = {
    dangerLevel: 3,
    wealthLevel: 4,
    populationDensity: 'normal',
    lawLevel: 'frontier',

    sound: {
      base: 'mountain_wind',
      accents: ['pickaxe_clink', 'blacksmith_hammer', 'owl_hoot'],
    },

    lighting: {
      lanternPositions: [
        { x: 60, y: 3, z: 48 },  // Meeting hall entrance
        { x: 40, y: 3, z: 32 },  // Samuel's cabin
        { x: 80, y: 3, z: 20 },  // Mine entrance
      ],
      litWindows: ['meeting_hall', 'samuel_cabin', 'communal_kitchen'],
      campfires: [
        { x: 64, y: 0, z: 72 },  // Campfire circle
      ],
      peakActivity: 'evening',
    },

    weather: {
      dominant: 'overcast',
      variability: 'moderate',
      particleEffect: 'none',
    },
  };
