export const prospectRoads = [
    // Main street running east-west through town center
    {
      id: 'main_street',
      type: 'main_street',
      width: 6,
      surface: 'dirt',
      points: [
        { x: 12, y: 0, z: 60 },
        { x: 40, y: 0, z: 60 },
        { x: 60, y: 0, z: 60 },
        { x: 88, y: 0, z: 60 },
        { x: 108, y: 0, z: 60 },
      ],
      tags: ['primary', 'east_west'],
    },
    // Path north from main street to the well and church
    {
      id: 'well_path',
      type: 'side_street',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 60, y: 0, z: 60 },
        { x: 60, y: 0, z: 44 },
      ],
      tags: ['north', 'to_well'],
    },
    // Path from well to church
    {
      id: 'church_path',
      type: 'side_street',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 60, y: 0, z: 44 },
        { x: 40, y: 0, z: 36 },
        { x: 40, y: 0, z: 32 },
      ],
      tags: ['to_church'],
    },
    // Trail to the abandoned mine (overgrown, narrow)
    {
      id: 'mine_trail',
      type: 'trail',
      width: 2,
      surface: 'packed_earth',
      points: [
        { x: 40, y: 0, z: 36 },
        { x: 28, y: 0, z: 32 },
        { x: 24, y: 0, z: 24 },
      ],
      tags: ['abandoned', 'overgrown', 'to_mine'],
    },
    // Farm road north to farmsteads
    {
      id: 'north_farm_road',
      type: 'trail',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 60, y: 0, z: 44 },
        { x: 60, y: 0, z: 20 },
        { x: 80, y: 0, z: 24 },
      ],
      tags: ['farm_access', 'north'],
    },
    // Farm road south to grain silo and south farmstead
    {
      id: 'south_farm_road',
      type: 'trail',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 60, y: 0, z: 60 },
        { x: 56, y: 0, z: 72 },
        { x: 56, y: 0, z: 88 },
      ],
      tags: ['farm_access', 'south', 'to_silo'],
    },
  ];
