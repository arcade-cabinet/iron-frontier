import type { Location } from '../../schemas/spatial.ts';

type Road = NonNullable<Location['roads']>[number];

export const oldWorksRoads: Road[] = [
  // Main entry corridor from hidden entrance to assembly hall
  {
    id: 'entry_corridor',
    type: 'main_street',
    width: 6,
    surface: 'stone',
    points: [
      { x: 120, y: 0, z: 192 },
      { x: 120, y: 0, z: 160 },
      { x: 120, y: 0, z: 136 },
    ],
    tags: ['primary', 'entry', 'corridor'],
  },
  // Assembly hall to power station (west corridor)
  {
    id: 'power_corridor',
    type: 'side_street',
    width: 4,
    surface: 'stone',
    points: [
      { x: 104, y: 0, z: 136 },
      { x: 80, y: 0, z: 136 },
      { x: 68, y: 0, z: 132 },
    ],
    tags: ['west', 'to_power'],
  },
  // Assembly hall to barracks (east corridor)
  {
    id: 'barracks_corridor',
    type: 'side_street',
    width: 4,
    surface: 'stone',
    points: [
      { x: 136, y: 0, z: 136 },
      { x: 160, y: 0, z: 136 },
      { x: 176, y: 0, z: 136 },
    ],
    tags: ['east', 'to_barracks'],
  },
  // Assembly hall to command center (north corridor)
  {
    id: 'command_corridor',
    type: 'main_street',
    width: 5,
    surface: 'stone',
    points: [
      { x: 120, y: 0, z: 124 },
      { x: 120, y: 0, z: 104 },
      { x: 120, y: 0, z: 92 },
    ],
    tags: ['north', 'to_command', 'critical_path'],
  },
  // Command center to armory (east)
  {
    id: 'armory_corridor',
    type: 'side_street',
    width: 3,
    surface: 'stone',
    points: [
      { x: 132, y: 0, z: 92 },
      { x: 152, y: 0, z: 92 },
      { x: 164, y: 0, z: 92 },
    ],
    tags: ['east', 'to_armory'],
  },
  // Command center to storage vaults (west)
  {
    id: 'vault_corridor',
    type: 'side_street',
    width: 3,
    surface: 'stone',
    points: [
      { x: 108, y: 0, z: 92 },
      { x: 88, y: 0, z: 92 },
      { x: 76, y: 0, z: 92 },
    ],
    tags: ['west', 'to_vaults'],
  },
  // Power station down to furnace
  {
    id: 'furnace_shaft',
    type: 'alley',
    width: 3,
    surface: 'stone',
    points: [
      { x: 56, y: 0, z: 128 },
      { x: 56, y: -4, z: 100 },
      { x: 52, y: -4, z: 96 },
    ],
    tags: ['down', 'to_furnace', 'dangerous'],
  },
  // Barracks to testing ground (north)
  {
    id: 'testing_corridor',
    type: 'side_street',
    width: 4,
    surface: 'stone',
    points: [
      { x: 176, y: 0, z: 124 },
      { x: 176, y: 0, z: 80 },
      { x: 176, y: 0, z: 52 },
    ],
    tags: ['north', 'to_testing'],
  },
  // Escape route through maintenance bay
  {
    id: 'escape_route',
    type: 'alley',
    width: 2,
    surface: 'stone',
    points: [
      { x: 200, y: 0, z: 52 },
      { x: 220, y: 0, z: 52 },
      { x: 220, y: 0, z: 28 },
      { x: 220, y: 0, z: 12 },
    ],
    tags: ['escape', 'one_way', 'maintenance'],
  },
];
