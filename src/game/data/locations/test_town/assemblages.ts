/**
 * Test Town - Assemblage Placements
 *
 * Buildings placed in world-space along a main street running east-west.
 * Main street centerline at z=44m. Buildings face the street (doors
 * toward the road). Minimum 4m gaps between structures for alleys.
 */

export const testTownAssemblages = [
  // Central saloon - the heart of any frontier town
  // 10m wide x 8m deep, front door faces south toward main street
  {
    assemblageId: 'asm_saloon_01',
    instanceId: 'saloon_main',
    anchor: { q: 12, r: 10 },
    rotation: 0,
    tags: ['central', 'social_hub'],
    importance: 5,
  },

  // Sheriff office - west of saloon across a 4m alley
  // 8m wide x 6m deep, front door faces south toward main street
  {
    assemblageId: 'asm_sheriff_01',
    instanceId: 'sheriff_office',
    anchor: { q: 8, r: 10 },
    rotation: 0,
    tags: ['law'],
    importance: 5,
  },

  // General store - east of saloon across a 4m alley
  // 8m wide x 7m deep, front door faces south toward main street
  {
    assemblageId: 'asm_general_store_01',
    instanceId: 'general_store',
    anchor: { q: 16, r: 10 },
    rotation: 0,
    tags: ['commerce'],
    importance: 4,
  },

  // Town well - in the open square north of main street
  // Visible from the saloon porch, a natural gathering spot
  {
    assemblageId: 'asm_well_01',
    instanceId: 'town_well',
    anchor: { q: 12, r: 7 },
    rotation: 0,
    tags: ['center'],
  },

  // Church on the south side of town, set back from the street
  // Faces north toward the main road
  {
    assemblageId: 'asm_church_01',
    instanceId: 'church',
    anchor: { q: 6, r: 14 },
    rotation: 2,
    tags: ['religious'],
  },

  // Residential - scattered cabins around the town edges
  // Cabin north: up the slope behind the well
  {
    assemblageId: 'asm_cabin_01',
    instanceId: 'cabin_north',
    anchor: { q: 8, r: 5 },
    rotation: 1,
  },
  // Cabin south: southeast of the general store
  {
    assemblageId: 'asm_cabin_01',
    instanceId: 'cabin_south',
    anchor: { q: 16, r: 16 },
    rotation: 4,
  },
  // House east: northeast corner, near the water tower
  {
    assemblageId: 'asm_house_01',
    instanceId: 'house_east',
    anchor: { q: 18, r: 6 },
    rotation: 3,
  },

  // Livery stable at the western edge of town
  // First building travelers see when arriving from the west road
  {
    assemblageId: 'asm_stable_01',
    instanceId: 'livery',
    anchor: { q: 4, r: 10 },
    rotation: 0,
    tags: ['mounts', 'edge'],
  },
];
