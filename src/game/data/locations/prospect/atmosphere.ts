export const prospectAtmosphere = {
    dangerLevel: 1, // Safe farming community
    wealthLevel: 3, // Modest but hopeful
    populationDensity: 'sparse', // ~80 souls
    lawLevel: 'frontier', // Self-governing community

    sound: {
      base: 'prairie_breeze',
      accents: ['rooster_crow', 'cattle_low', 'church_bell', 'dog_bark', 'cart_creak'],
    },

    lighting: {
      lanternPositions: [
        { x: 56, y: 3, z: 56 },  // Town hall entrance
        { x: 72, y: 3, z: 56 },  // General store porch
        { x: 40, y: 3, z: 56 },  // Boarding house entrance
        { x: 60, y: 3, z: 44 },  // Near the well
        { x: 40, y: 3, z: 32 },  // Church entrance
      ],
      litWindows: ['town_hall', 'general_store', 'boarding_house', 'church'],
      campfires: [],
      peakActivity: 'morning',
    },

    weather: {
      dominant: 'clear',
      variability: 'mild',
      particleEffect: 'none',
    },
  };
