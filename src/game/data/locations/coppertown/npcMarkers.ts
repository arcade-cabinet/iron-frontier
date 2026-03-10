export const coppertownNpcMarkers = [
    // Company Foreman - in front of the company office, overseeing operations
    {
      role: 'foreman',
      position: { x: 80, y: 0, z: 24 },
      facing: 180,
      activity: 'guarding',
      assignedTo: 'company_office',
      tags: ['ivrc', 'authority', 'quest_giver'],
    },
    // Company Store clerk - behind the counter
    {
      role: 'shopkeeper',
      position: { x: 60, y: 0, z: 88 },
      facing: 180,
      activity: 'working',
      assignedTo: 'company_store',
      tags: ['ivrc', 'commerce', 'company_script'],
    },
    // Mess Hall cook - serving workers
    {
      role: 'cook',
      position: { x: 80, y: 0, z: 96 },
      facing: 180,
      activity: 'working',
      assignedTo: 'mess_hall',
      tags: ['ivrc', 'food', 'social'],
    },
    // Company doctor (underfunded infirmary)
    {
      role: 'doctor',
      position: { x: 48, y: 0, z: 96 },
      facing: 90,
      activity: 'working',
      assignedTo: 'infirmary',
      tags: ['medical', 'underfunded'],
    },
    // Guard patrolling the checkpoint between tiers
    {
      role: 'guard',
      position: { x: 40, y: 0, z: 56 },
      facing: 180,
      activity: 'patrolling',
      assignedTo: 'guard_post',
      waypoints: [
        { x: 40, y: 0, z: 56 },
        { x: 60, y: 0, z: 56 },
        { x: 60, y: 0, z: 76 },
        { x: 40, y: 0, z: 76 },
      ],
      tags: ['ivrc', 'security', 'hostile'],
    },
    // Miner working near the pit entrance
    {
      role: 'miner',
      position: { x: 140, y: 0, z: 32 },
      facing: 0,
      activity: 'working',
      assignedTo: 'the_big_dig',
      tags: ['worker', 'npc'],
    },
    // Resistance contact lurking near the abandoned assay office
    {
      role: 'resistance_contact',
      position: { x: 20, y: 0, z: 72 },
      facing: 90,
      activity: 'standing',
      assignedTo: 'old_assay_office',
      tags: ['resistance', 'secret', 'quest_giver'],
    },
    // Worker patrol in the housing area
    {
      role: 'worker',
      position: { x: 56, y: 0, z: 124 },
      facing: 0,
      activity: 'patrolling',
      waypoints: [
        { x: 32, y: 0, z: 112 },
        { x: 56, y: 0, z: 112 },
        { x: 80, y: 0, z: 112 },
        { x: 80, y: 0, z: 124 },
        { x: 32, y: 0, z: 124 },
      ],
      tags: ['worker', 'off_duty'],
    },
  ];
