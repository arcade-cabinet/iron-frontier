/**
 * Test Town - Roads
 *
 * Defined with proper widths for 3D navigation.
 */

export const testTownRoads = [
  {
    id: 'main_street',
    type: 'main_street',
    width: 7,
    surface: 'packed_earth',
    points: [
      { x: 0, y: 0, z: 44 },
      { x: 48, y: 0, z: 44 },
      { x: 96, y: 0, z: 44 },
    ],
    tags: ['primary', 'east_west'],
  },
  {
    id: 'well_path',
    type: 'side_street',
    width: 3,
    surface: 'dirt',
    points: [
      { x: 48, y: 0, z: 44 },
      { x: 48, y: 0, z: 28 },
    ],
    tags: ['secondary', 'to_well'],
  },
];
