/**
 * Test Town - NPC Markers
 *
 * Where NPCs stand, work, and patrol within the town.
 */

export const testTownNpcMarkers = [
  // Bartender behind the saloon bar
  {
    role: 'bartender',
    position: { x: 48, y: 0, z: 38 },
    facing: 180, // Facing south toward customers
    activity: 'working',
    assignedTo: 'saloon_main',
    tags: ['service', 'social', 'rumors'],
  },
  // Sheriff standing on the office porch, watching the street
  {
    role: 'sheriff',
    position: { x: 32, y: 0, z: 42 },
    facing: 180, // Facing south toward main street
    activity: 'guarding',
    assignedTo: 'sheriff_office',
    tags: ['law', 'quest_giver'],
  },
  // Shopkeeper behind the general store counter
  {
    role: 'shopkeeper',
    position: { x: 64, y: 0, z: 38 },
    facing: 180, // Facing south toward customers
    activity: 'working',
    assignedTo: 'general_store',
    tags: ['commerce', 'trade'],
  },
  // Stable hand patrolling around the livery
  {
    role: 'stable_hand',
    position: { x: 16, y: 0, z: 40 },
    facing: 90, // Facing east
    activity: 'patrolling',
    assignedTo: 'livery',
    waypoints: [
      { x: 16, y: 0, z: 40 },
      { x: 20, y: 0, z: 44 },
      { x: 16, y: 0, z: 48 },
      { x: 12, y: 0, z: 44 },
    ],
    tags: ['mounts', 'service'],
  },
  // Priest near the church entrance
  {
    role: 'priest',
    position: { x: 24, y: 0, z: 56 },
    facing: 0, // Facing north toward the street
    activity: 'standing',
    assignedTo: 'church',
    tags: ['religious', 'healing'],
  },
];
