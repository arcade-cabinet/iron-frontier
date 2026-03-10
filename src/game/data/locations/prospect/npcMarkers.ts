export const prospectNpcMarkers = [
    // Mayor / community leader at the town hall (former assay office)
    {
      role: 'mayor',
      position: { x: 56, y: 0, z: 56 },
      facing: 180,
      activity: 'standing',
      assignedTo: 'town_hall',
      tags: ['civic', 'quest_giver', 'community_leader'],
    },
    // Shopkeeper inside the general store
    {
      role: 'shopkeeper',
      position: { x: 72, y: 0, z: 56 },
      facing: 180,
      activity: 'working',
      assignedTo: 'general_store',
      tags: ['commerce', 'trade'],
    },
    // Innkeeper at the boarding house
    {
      role: 'innkeeper',
      position: { x: 40, y: 0, z: 56 },
      facing: 90,
      activity: 'standing',
      assignedTo: 'boarding_house',
      tags: ['lodging', 'social', 'rumors'],
    },
    // Blacksmith working at the forge
    {
      role: 'blacksmith',
      position: { x: 88, y: 0, z: 56 },
      facing: 0,
      activity: 'working',
      assignedTo: 'blacksmith',
      tags: ['industrial', 'farm_equipment', 'service'],
    },
    // Pastor at the church
    {
      role: 'pastor',
      position: { x: 40, y: 0, z: 32 },
      facing: 180,
      activity: 'standing',
      assignedTo: 'church',
      tags: ['religious', 'healing', 'community'],
    },
    // Farmer on the north farmstead
    {
      role: 'farmer',
      position: { x: 80, y: 0, z: 24 },
      facing: 180,
      activity: 'working',
      assignedTo: 'farmstead_north',
      tags: ['agriculture', 'resident'],
    },
    // Farmer on the east farmstead, patrolling between fields
    {
      role: 'farmer',
      position: { x: 96, y: 0, z: 72 },
      facing: 270,
      activity: 'patrolling',
      assignedTo: 'farmstead_east',
      waypoints: [
        { x: 96, y: 0, z: 72 },
        { x: 96, y: 0, z: 80 },
        { x: 88, y: 0, z: 80 },
        { x: 88, y: 0, z: 72 },
      ],
      tags: ['agriculture', 'resident'],
    },
    // Farmer on the south farmstead near the grain silo
    {
      role: 'farmer',
      position: { x: 56, y: 0, z: 88 },
      facing: 0,
      activity: 'working',
      assignedTo: 'farmstead_south',
      tags: ['agriculture', 'grain', 'resident'],
    },
    // Old prospector lingering near the abandoned mine
    {
      role: 'prospector',
      position: { x: 24, y: 0, z: 24 },
      facing: 90,
      activity: 'sitting',
      assignedTo: 'abandoned_mine',
      tags: ['lore', 'history', 'storyteller'],
    },
    // Townsfolk at the well (social gathering)
    {
      role: 'townsfolk',
      position: { x: 60, y: 0, z: 44 },
      facing: 270,
      activity: 'standing',
      assignedTo: 'town_well',
      tags: ['social', 'gossip', 'community'],
    },
  ];
