export const junction_cityRoads = [
    {
      id: 'main_street',
      type: 'main_street',
      width: 8,
      surface: 'packed_earth',
      points: [
        { x: 100, y: 0, z: 140 },
        { x: 100, y: 0, z: 68 },
        { x: 100, y: 0, z: 40 },
      ],
      tags: ['primary', 'north_south'],
    },
    {
      id: 'company_road',
      type: 'side_street',
      width: 6,
      surface: 'gravel',
      points: [
        { x: 40, y: 0, z: 40 },
        { x: 100, y: 0, z: 40 },
        { x: 168, y: 0, z: 40 },
      ],
      tags: ['company_district', 'east_west'],
    },
    {
      id: 'workers_road',
      type: 'side_street',
      width: 5,
      surface: 'dirt',
      points: [
        { x: 32, y: 0, z: 104 },
        { x: 100, y: 0, z: 104 },
        { x: 132, y: 0, z: 104 },
      ],
      tags: ['workers_district', 'east_west'],
    },
    {
      id: 'main_railroad',
      type: 'railroad',
      width: 4,
      surface: 'rail_bed',
      points: [
        { x: 0, y: 0, z: 68 },
        { x: 100, y: 0, z: 68 },
        { x: 200, y: 0, z: 68 },
      ],
      tags: ['railroad', 'main_line', 'ivrc'],
    },
    {
      id: 'siding_spur',
      type: 'railroad',
      width: 3,
      surface: 'rail_bed',
      points: [
        { x: 144, y: 0, z: 72 },
        { x: 164, y: 0, z: 72 },
      ],
      tags: ['railroad', 'siding'],
    },
  ];
