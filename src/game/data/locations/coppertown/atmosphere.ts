export const coppertownAtmosphere = {
    dangerLevel: 4, // High - cave-ins, toxic fumes, company enforcers
    wealthLevel: 2, // Poor - workers paid in script, everything owned by company
    populationDensity: 'crowded', // Lots of workers crammed into small area
    lawLevel: 'strict', // Company rules enforced harshly

    sound: {
      base: 'industrial_hum',
      accents: [
        'pickaxe_clink',
        'steam_hiss',
        'cart_creak',
        'blacksmith_hammer',
      ],
    },

    lighting: {
      lanternPositions: [
        { x: 80, y: 3, z: 24 },   // Company office entrance
        { x: 60, y: 3, z: 88 },   // Company store front
        { x: 80, y: 3, z: 96 },   // Mess hall entrance
        { x: 40, y: 3, z: 56 },   // Guard post
        { x: 60, y: 4, z: 128 },  // Housing area post
        { x: 32, y: 4, z: 128 },  // Housing area west
        { x: 80, y: 4, z: 128 },  // Housing area east
      ],
      litWindows: ['company_office', 'company_store', 'mess_hall', 'guard_post'],
      campfires: [
        { x: 56, y: 0, z: 116 },  // Workers' evening gathering fire
      ],
      peakActivity: 'morning',
    },

    weather: {
      dominant: 'overcast',
      variability: 'moderate',
      particleEffect: 'ash',
    },
  };
