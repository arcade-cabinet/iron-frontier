export const junction_cityAtmosphere = {
    dangerLevel: 2, // Pinkertons keep order - violently if needed
    wealthLevel: 7, // Company money flows, but not to workers
    populationDensity: 'crowded',
    lawLevel: 'strict', // IVRC law, not real law

    sound: {
      base: 'industrial_hum',
      accents: [
        'train_whistle',
        'steam_hiss',
        'blacksmith_hammer',
        'cart_creak',
        'saloon_chatter',
      ],
    },

    lighting: {
      lanternPositions: [
        { x: 100, y: 4, z: 68 },   // Grand Station platform
        { x: 100, y: 3, z: 32 },   // IVRC HQ entrance
        { x: 72, y: 3, z: 32 },    // Bank entrance
        { x: 128, y: 3, z: 32 },   // Hotel entrance
        { x: 48, y: 3, z: 40 },    // Pinkerton office
        { x: 80, y: 3, z: 104 },   // Saloon porch
        { x: 100, y: 4, z: 140 },  // South entrance lantern
        { x: 176, y: 6, z: 68 },   // Water tower light
      ],
      litWindows: [
        'grand_station',
        'ivrc_headquarters',
        'ironclad_hotel',
        'company_bank',
        'brake_house_saloon',
        'pinkerton_office',
      ],
      campfires: [
        { x: 168, y: 0, z: 88 },  // Yard workers' fire
      ],
      peakActivity: 'morning',
    },

    weather: {
      dominant: 'overcast',
      variability: 'moderate',
      particleEffect: 'ash',
    },
  };
