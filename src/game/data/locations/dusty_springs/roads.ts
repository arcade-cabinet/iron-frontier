export const dusty_springsRoads = [
    {
      id: 'main_street',
      type: 'main_street',
      width: 7,
      surface: 'packed_earth',
      points: [
        { x: 0, y: 0, z: 76 },
        { x: 80, y: 0, z: 76 },
        { x: 160, y: 0, z: 76 },
      ],
      tags: ['primary', 'east_west'],
    },
    {
      id: 'town_square_road',
      type: 'side_street',
      width: 4,
      surface: 'packed_earth',
      points: [
        { x: 80, y: 0, z: 76 },
        { x: 80, y: 0, z: 40 },
      ],
      tags: ['secondary', 'to_well', 'to_water_tower'],
    },
    {
      id: 'church_road',
      type: 'side_street',
      width: 3.5,
      surface: 'dirt',
      points: [
        { x: 40, y: 0, z: 76 },
        { x: 40, y: 0, z: 104 },
      ],
      tags: ['secondary', 'to_church'],
    },
    {
      id: 'depot_road',
      type: 'side_street',
      width: 4,
      surface: 'packed_earth',
      points: [
        { x: 120, y: 0, z: 76 },
        { x: 124, y: 0, z: 48 },
      ],
      tags: ['secondary', 'to_depot'],
    },
    {
      id: 'mansion_road',
      type: 'side_street',
      width: 3.5,
      surface: 'dirt',
      points: [
        { x: 112, y: 0, z: 76 },
        { x: 112, y: 0, z: 96 },
      ],
      tags: ['secondary', 'to_mansion'],
    },
    {
      id: 'railroad',
      type: 'railroad',
      width: 3,
      surface: 'rail_bed',
      points: [
        { x: 104, y: 0, z: 48 },
        { x: 128, y: 0, z: 48 },
        { x: 160, y: 0, z: 48 },
      ],
      tags: ['railroad', 'ivrc'],
    },
  ];
