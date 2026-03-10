export const junction_cityNpcMarkers = [
    // Pinkerton agent patrolling the company district
    {
      role: 'pinkerton_agent',
      position: { x: 48, y: 0, z: 40 },
      facing: 90,
      activity: 'patrolling',
      assignedTo: 'pinkerton_office',
      waypoints: [
        { x: 48, y: 0, z: 40 },
        { x: 100, y: 0, z: 40 },
        { x: 100, y: 0, z: 32 },
        { x: 48, y: 0, z: 32 },
      ],
      tags: ['ivrc', 'security', 'hostile'],
    },
    // Station master at Grand Station
    {
      role: 'station_master',
      position: { x: 100, y: 0, z: 68 },
      facing: 180,
      activity: 'working',
      assignedTo: 'grand_station',
      tags: ['ivrc', 'railroad', 'service'],
    },
    // Telegraph operator
    {
      role: 'telegraph_operator',
      position: { x: 80, y: 0, z: 64 },
      facing: 0,
      activity: 'working',
      assignedTo: 'telegraph_office',
      tags: ['ivrc', 'communication'],
    },
    // Bank teller
    {
      role: 'banker',
      position: { x: 72, y: 0, z: 32 },
      facing: 180,
      activity: 'working',
      assignedTo: 'company_bank',
      tags: ['ivrc', 'finance'],
    },
    // Brake House Saloon bartender
    {
      role: 'bartender',
      position: { x: 80, y: 0, z: 104 },
      facing: 0,
      activity: 'working',
      assignedTo: 'brake_house_saloon',
      tags: ['workers', 'social', 'rumors', 'copperhead_sympathy'],
    },
    // Company store clerk
    {
      role: 'shopkeeper',
      position: { x: 152, y: 0, z: 40 },
      facing: 180,
      activity: 'working',
      assignedTo: 'company_store',
      tags: ['ivrc', 'commerce'],
    },
    // Yard worker patrolling the railyard
    {
      role: 'yard_worker',
      position: { x: 168, y: 0, z: 72 },
      facing: 270,
      activity: 'patrolling',
      assignedTo: 'roundhouse',
      waypoints: [
        { x: 152, y: 0, z: 68 },
        { x: 168, y: 0, z: 68 },
        { x: 176, y: 0, z: 76 },
        { x: 168, y: 0, z: 80 },
        { x: 152, y: 0, z: 76 },
      ],
      tags: ['ivrc', 'worker', 'industrial'],
    },
    // Coal worker at the coal yard
    {
      role: 'coal_worker',
      position: { x: 28, y: 0, z: 68 },
      facing: 90,
      activity: 'working',
      assignedTo: 'coal_yard',
      tags: ['worker', 'industrial'],
    },
  ];
