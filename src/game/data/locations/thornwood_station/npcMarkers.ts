export const thornwood_stationNpcMarkers = [
    // Station master at the platform
    {
      role: 'station_master',
      position: { x: 48, y: 0, z: 36 },
      facing: 180,
      activity: 'working',
      assignedTo: 'station',
      tags: ['ivrc', 'railroad', 'service'],
    },
    // Telegraph operator
    {
      role: 'telegraph_operator',
      position: { x: 72, y: 0, z: 24 },
      facing: 270,
      activity: 'working',
      assignedTo: 'telegraph',
      tags: ['ivrc', 'communication'],
    },
    // Innkeeper at the waystation inn
    {
      role: 'innkeeper',
      position: { x: 64, y: 0, z: 48 },
      facing: 0,
      activity: 'working',
      assignedTo: 'waystation_inn',
      tags: ['service', 'lodging'],
    },
    // Shopkeeper at the travel store
    {
      role: 'shopkeeper',
      position: { x: 80, y: 0, z: 48 },
      facing: 270,
      activity: 'working',
      assignedTo: 'travel_store',
      tags: ['commerce', 'supplies'],
    },
    // Stable hand
    {
      role: 'stable_hand',
      position: { x: 24, y: 0, z: 48 },
      facing: 90,
      activity: 'working',
      assignedTo: 'stable',
      tags: ['mounts', 'service'],
    },
    // Railroad maintenance worker near water tower
    {
      role: 'maintenance_worker',
      position: { x: 44, y: 0, z: 40 },
      facing: 0,
      activity: 'patrolling',
      waypoints: [
        { x: 40, y: 0, z: 40 },
        { x: 48, y: 0, z: 36 },
        { x: 56, y: 0, z: 36 },
        { x: 48, y: 0, z: 44 },
      ],
      tags: ['worker', 'railroad'],
    },
  ];
