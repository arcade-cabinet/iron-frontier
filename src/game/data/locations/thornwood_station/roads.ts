export const thornwood_stationRoads = [
    {
      id: 'railroad_tracks',
      type: 'railroad',
      width: 3,
      surface: 'rail_bed',
      points: [
        { x: 0, y: 0, z: 36 },
        { x: 48, y: 0, z: 36 },
        { x: 100, y: 0, z: 36 },
      ],
      tags: ['railroad', 'ivrc'],
    },
    {
      id: 'station_road',
      type: 'main_street',
      width: 5,
      surface: 'packed_earth',
      points: [
        { x: 16, y: 0, z: 56 },
        { x: 48, y: 0, z: 56 },
        { x: 88, y: 0, z: 56 },
      ],
      tags: ['primary', 'east_west'],
    },
    {
      id: 'platform_path',
      type: 'side_street',
      width: 3,
      surface: 'packed_earth',
      points: [
        { x: 48, y: 0, z: 56 },
        { x: 48, y: 0, z: 40 },
      ],
      tags: ['to_platform'],
    },
  ];
