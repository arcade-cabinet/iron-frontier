export const dusty_springsNpcMarkers = [
    // Sheriff Marcus Cole - on the office porch watching Main Street
    {
      role: 'sheriff',
      position: { x: 64, y: 0, z: 74 },
      facing: 180,
      activity: 'guarding',
      assignedTo: 'sheriff_office',
      tags: ['law', 'quest_giver', 'sheriff_cole'],
    },
    // Bartender at The Rusty Spur
    {
      role: 'bartender',
      position: { x: 80, y: 0, z: 70 },
      facing: 180,
      activity: 'working',
      assignedTo: 'rusty_spur_saloon',
      tags: ['service', 'rumors', 'social'],
    },
    // Shopkeeper at Holt's Mercantile
    {
      role: 'shopkeeper',
      position: { x: 96, y: 0, z: 70 },
      facing: 180,
      activity: 'working',
      assignedTo: 'holts_mercantile',
      tags: ['commerce', 'holt_family'],
    },
    // Doc Chen Wei - in his office
    {
      role: 'doctor',
      position: { x: 104, y: 0, z: 70 },
      facing: 180,
      activity: 'working',
      assignedTo: 'doc_chen_office',
      tags: ['medical', 'quest_giver', 'doc_chen'],
    },
    // Father Miguel - at church entrance, greeting parishioners
    {
      role: 'priest',
      position: { x: 40, y: 0, z: 102 },
      facing: 0,
      activity: 'standing',
      assignedTo: 'st_michaels_church',
      tags: ['religious', 'quest_giver', 'father_miguel'],
    },
    // Old Murphy - patrolling around the livery
    {
      role: 'stable_hand',
      position: { x: 24, y: 0, z: 80 },
      facing: 90,
      activity: 'patrolling',
      assignedTo: 'murphys_livery',
      waypoints: [
        { x: 24, y: 0, z: 80 },
        { x: 28, y: 0, z: 84 },
        { x: 24, y: 0, z: 88 },
        { x: 20, y: 0, z: 84 },
      ],
      tags: ['mounts', 'service', 'murphy'],
    },
    // Innkeeper at the Dusty Rose
    {
      role: 'innkeeper',
      position: { x: 72, y: 0, z: 70 },
      facing: 180,
      activity: 'working',
      assignedTo: 'dusty_rose_hotel',
      tags: ['service', 'rest'],
    },
    // Blacksmith at the forge
    {
      role: 'blacksmith',
      position: { x: 40, y: 0, z: 70 },
      facing: 0,
      activity: 'working',
      assignedTo: 'blacksmith',
      tags: ['crafting', 'repair'],
    },
    // Gunsmith at the weapons shop
    {
      role: 'gunsmith',
      position: { x: 56, y: 0, z: 70 },
      facing: 180,
      activity: 'working',
      assignedTo: 'gunsmith',
      tags: ['weapons', 'commerce'],
    },
    // Townsfolk patrolling near the well (town gossip)
    {
      role: 'townsfolk',
      position: { x: 80, y: 0, z: 56 },
      facing: 90,
      activity: 'patrolling',
      waypoints: [
        { x: 80, y: 0, z: 56 },
        { x: 84, y: 0, z: 60 },
        { x: 80, y: 0, z: 64 },
        { x: 76, y: 0, z: 60 },
      ],
      tags: ['civilian', 'gossip'],
    },
  ];
