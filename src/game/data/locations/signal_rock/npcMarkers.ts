export const signal_rockNpcMarkers = [
    // Lookout guard on the wooden platform
    {
      role: 'outlaw_lookout',
      position: { x: 44, y: 8, z: 24 },
      facing: 180,
      activity: 'guarding',
      assignedTo: 'lookout_platform',
      tags: ['outlaw', 'lookout', 'elevated'],
    },
    // Fire tender near the signal fire pit
    {
      role: 'fire_tender',
      position: { x: 40, y: 8, z: 20 },
      facing: 0,
      activity: 'working',
      assignedTo: 'signal_fire_pit',
      tags: ['outlaw', 'signal'],
    },
    // Camp guard patrolling the hidden camp area
    {
      role: 'outlaw_guard',
      position: { x: 24, y: 0, z: 32 },
      facing: 90,
      activity: 'patrolling',
      assignedTo: 'hidden_camp',
      waypoints: [
        { x: 24, y: 0, z: 32 },
        { x: 32, y: 0, z: 40 },
        { x: 24, y: 0, z: 48 },
        { x: 16, y: 0, z: 40 },
      ],
      tags: ['outlaw', 'patrol'],
    },
  ];
