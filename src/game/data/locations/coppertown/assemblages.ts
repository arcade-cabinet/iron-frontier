export const coppertownAssemblages = [
    // -------------------------------------------------------------------------
    // THE PIT - Open copper mine (represented by mine entrance assemblage)
    // -------------------------------------------------------------------------
    {
      assemblageId: 'asm_mine_01',
      instanceId: 'the_big_dig',
      anchor: { q: 35, r: 8 },
      rotation: 0,
      tags: ['primary', 'dungeon_entrance', 'ivrc', 'dangerous'],
      importance: 5,
    },

    // -------------------------------------------------------------------------
    // COMPANY ADMINISTRATIVE AREA (Upper Tier)
    // -------------------------------------------------------------------------

    // Company Office - Mine administration
    {
      assemblageId: 'asm_bank_01', // Using bank as office (secure, important)
      instanceId: 'company_office',
      anchor: { q: 20, r: 6 },
      rotation: 2,
      slotTypeOverride: 'law_office', // Functions as authority hub
      tags: ['ivrc', 'administration', 'important'],
      importance: 5,
    },

    // Foreman's House - Nicer than workers'
    {
      assemblageId: 'asm_house_01',
      instanceId: 'foreman_house',
      anchor: { q: 14, r: 8 },
      rotation: 1,
      tags: ['ivrc', 'management', 'comfortable'],
      importance: 4,
    },

    // Guard Post - Company security checkpoint
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'guard_post',
      anchor: { q: 10, r: 14 },
      rotation: 0,
      slotTypeOverride: 'hideout', // Functions as security hub
      tags: ['ivrc', 'security', 'checkpoint'],
      importance: 4,
    },

    // -------------------------------------------------------------------------
    // INDUSTRIAL AREA (Middle Tier)
    // -------------------------------------------------------------------------

    // Processing Mill - Ore smelting
    {
      assemblageId: 'asm_mine_01',
      instanceId: 'processing_mill',
      anchor: { q: 30, r: 15 },
      rotation: 3,
      slotTypeOverride: 'smelter',
      tags: ['industrial', 'processing', 'dangerous', 'loud'],
      importance: 5,
    },

    // Tool Shed - Equipment storage
    {
      assemblageId: 'asm_stable_01', // Using stable for equipment storage
      instanceId: 'tool_shed',
      anchor: { q: 25, r: 18 },
      rotation: 2,
      slotTypeOverride: 'workshop',
      tags: ['industrial', 'equipment', 'tools'],
      importance: 3,
    },

    // Water Cistern area
    {
      assemblageId: 'asm_well_01',
      instanceId: 'water_cistern',
      anchor: { q: 18, r: 20 },
      rotation: 0,
      tags: ['infrastructure', 'water', 'essential'],
      importance: 4,
    },

    // -------------------------------------------------------------------------
    // COMMERCE AREA (Lower-Middle Tier)
    // -------------------------------------------------------------------------

    // Company Store - The only store, accepts script currency
    {
      assemblageId: 'asm_general_store_01',
      instanceId: 'company_store',
      anchor: { q: 15, r: 22 },
      rotation: 1,
      tags: ['ivrc', 'commerce', 'monopoly', 'essential'],
      importance: 5,
    },

    // Mess Hall - Company cafeteria (using saloon structure)
    {
      assemblageId: 'asm_saloon_01',
      instanceId: 'mess_hall',
      anchor: { q: 20, r: 24 },
      rotation: 2,
      slotTypeOverride: 'tavern',
      tags: ['ivrc', 'social', 'food', 'workers'],
      importance: 4,
    },

    // Infirmary - Underfunded medical (using cabin)
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'infirmary',
      anchor: { q: 12, r: 24 },
      rotation: 0,
      slotTypeOverride: 'doctor',
      tags: ['medical', 'underfunded', 'essential'],
      importance: 4,
    },

    // -------------------------------------------------------------------------
    // WORKER HOUSING (Lower Tier) - Rows of identical cabins
    // -------------------------------------------------------------------------

    // Row 1 - Western cabins
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_01',
      anchor: { q: 8, r: 28 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_02',
      anchor: { q: 11, r: 28 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_03',
      anchor: { q: 14, r: 28 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },

    // Row 2 - Central cabins
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_04',
      anchor: { q: 8, r: 31 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_05',
      anchor: { q: 11, r: 31 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_06',
      anchor: { q: 14, r: 31 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },

    // Row 3 - Eastern cabins
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_07',
      anchor: { q: 17, r: 28 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_08',
      anchor: { q: 20, r: 28 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_09',
      anchor: { q: 17, r: 31 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_10',
      anchor: { q: 20, r: 31 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },

    // -------------------------------------------------------------------------
    // SUPPORT STRUCTURES
    // -------------------------------------------------------------------------

    // Mule stable for ore carts
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'mule_stable',
      anchor: { q: 28, r: 12 },
      rotation: 1,
      tags: ['logistics', 'animals', 'ore_transport'],
      importance: 3,
    },

    // Rock formation near mine (lookout/ambush point)
    {
      assemblageId: 'asm_rocks_01',
      instanceId: 'slag_heap',
      anchor: { q: 38, r: 14 },
      rotation: 4,
      tags: ['terrain', 'waste', 'cover'],
      importance: 1,
    },

    // Abandoned cabin at edge (secret meeting spot for resistance)
    {
      assemblageId: 'asm_ruins_cabin_01',
      instanceId: 'old_assay_office',
      anchor: { q: 5, r: 18 },
      rotation: 2,
      tags: ['abandoned', 'secret', 'resistance'],
      importance: 3,
    },
  ];
