export const dusty_springsAssemblages = [
    // -------------------------------------------------------------------------
    // MAIN STREET - Commercial District (east-west, centered at r=18-19)
    // Buildings placed with 4-5m gaps for alleys
    // -------------------------------------------------------------------------

    // The Rusty Spur Saloon - Social hub, rumor mill
    // Two-story building, front porch faces south onto Main Street
    {
      assemblageId: 'asm_saloon_01',
      instanceId: 'rusty_spur_saloon',
      anchor: { q: 20, r: 18 },
      rotation: 0,
      tags: ['main_street', 'social_hub', 'the_rusty_spur'],
      importance: 5,
    },

    // Holt's Mercantile - General Store (owned by mayor's family)
    // East of the saloon, across a 4m alley
    {
      assemblageId: 'asm_general_store_01',
      instanceId: 'holts_mercantile',
      anchor: { q: 24, r: 18 },
      rotation: 0,
      tags: ['main_street', 'commerce', 'holt_family'],
      importance: 4,
    },

    // Sheriff's Office - West of the saloon
    // Marcus Cole's domain - understaffed and underfunded
    {
      assemblageId: 'asm_sheriff_01',
      instanceId: 'sheriff_office',
      anchor: { q: 16, r: 18 },
      rotation: 0,
      tags: ['main_street', 'law', 'sheriff_cole'],
      importance: 5,
    },

    // Town Well - Central gathering spot in the square
    // Visible from the saloon porch, gossip flows freely here
    {
      assemblageId: 'asm_well_01',
      instanceId: 'town_well',
      anchor: { q: 20, r: 14 },
      rotation: 0,
      tags: ['town_center', 'gathering'],
      importance: 3,
    },

    // Gunsmith - West of sheriff's office
    {
      assemblageId: 'asm_gunsmith_01',
      instanceId: 'gunsmith',
      anchor: { q: 14, r: 18 },
      rotation: 0,
      tags: ['main_street', 'weapons'],
      importance: 3,
    },

    // -------------------------------------------------------------------------
    // CIVIC / RELIGIOUS - South and west of Main Street
    // -------------------------------------------------------------------------

    // St. Michael's Church - Father Miguel's sanctuary
    // Set back from Main Street on Church Road, faces north
    {
      assemblageId: 'asm_church_01',
      instanceId: 'st_michaels_church',
      anchor: { q: 10, r: 26 },
      rotation: 0,
      tags: ['religious', 'sanctuary', 'father_miguel'],
      importance: 4,
    },

    // Train Depot - Northeast of town center
    // The iron umbilical cord tying Dusty Springs to IVRC
    {
      assemblageId: 'asm_train_station_01',
      instanceId: 'train_depot',
      anchor: { q: 32, r: 12 },
      rotation: 0,
      tags: ['transport', 'ivrc', 'railroad'],
      importance: 5,
    },

    // Telegraph Office - Near the depot along Depot Road
    {
      assemblageId: 'asm_telegraph_01',
      instanceId: 'telegraph_office',
      anchor: { q: 30, r: 16 },
      rotation: 0,
      tags: ['communication', 'ivrc'],
      importance: 3,
    },

    // -------------------------------------------------------------------------
    // LIVERY & SERVICES - West edge of town
    // -------------------------------------------------------------------------

    // Murphy's Livery - First building from the west
    // Old Murphy knows every horse and most secrets in town
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'murphys_livery',
      anchor: { q: 6, r: 20 },
      rotation: 0,
      tags: ['mounts', 'town_edge', 'murphy'],
      importance: 4,
    },

    // -------------------------------------------------------------------------
    // RESIDENTIAL - Various homes around town
    // -------------------------------------------------------------------------

    // Mayor Josephine Holt's residence - on a rise southeast of town
    {
      assemblageId: 'asm_mansion_01',
      instanceId: 'holt_mansion',
      anchor: { q: 28, r: 24 },
      rotation: 2,
      tags: ['residential', 'wealthy', 'holt_family', 'mayor'],
      importance: 5,
    },

    // Modest homes - Working families
    {
      assemblageId: 'asm_house_01',
      instanceId: 'house_miller',
      anchor: { q: 14, r: 26 },
      rotation: 1,
      tags: ['residential', 'civilian'],
    },
    {
      assemblageId: 'asm_house_01',
      instanceId: 'house_oconnor',
      anchor: { q: 18, r: 28 },
      rotation: 4,
      tags: ['residential', 'civilian'],
    },

    // Cabins - Simpler dwellings at town edges
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_north',
      anchor: { q: 12, r: 8 },
      rotation: 3,
      tags: ['residential', 'poor', 'edge'],
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_west',
      anchor: { q: 6, r: 14 },
      rotation: 0,
      tags: ['residential', 'poor', 'edge'],
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_south',
      anchor: { q: 22, r: 32 },
      rotation: 5,
      tags: ['residential', 'poor', 'edge'],
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_southeast',
      anchor: { q: 30, r: 30 },
      rotation: 2,
      tags: ['residential', 'poor', 'edge'],
    },
  ];
