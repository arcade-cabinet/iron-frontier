export const freeminer_hollowNpcMarkers = [
    // Old Samuel Ironpick - at his cabin, the community leader
    {
      role: 'community_leader',
      position: { x: 40, y: 0, z: 32 },
      facing: 90,
      activity: 'standing',
      assignedTo: 'samuel_cabin',
      tags: ['quest_giver', 'leader', 'resistance'],
    },
    // Lookout guard on the western rocks
    {
      role: 'lookout',
      position: { x: 20, y: 4, z: 20 },
      facing: 180,
      activity: 'guarding',
      assignedTo: 'lookout_post',
      tags: ['defensive', 'guard'],
    },
    // Cook at the communal kitchen
    {
      role: 'cook',
      position: { x: 72, y: 0, z: 56 },
      facing: 270,
      activity: 'working',
      assignedTo: 'communal_kitchen',
      tags: ['food', 'community'],
    },
    // Miner patrolling between shaft and processing
    {
      role: 'miner',
      position: { x: 80, y: 0, z: 20 },
      facing: 0,
      activity: 'patrolling',
      assignedTo: 'main_shaft',
      waypoints: [
        { x: 80, y: 0, z: 20 },
        { x: 96, y: 0, z: 40 },
        { x: 80, y: 0, z: 40 },
      ],
      tags: ['worker', 'industrial'],
    },
    // Storyteller near the campfire circle
    {
      role: 'storyteller',
      position: { x: 64, y: 0, z: 72 },
      facing: 0,
      activity: 'sitting',
      assignedTo: 'campfire_circle',
      tags: ['social', 'lore'],
    },
  ];
