export const prospectAssemblages = [
    // Town Hall (Former Assay Office) - Using house as the civic building
    // Repurposed as community center
    {
      assemblageId: 'asm_house_01',
      instanceId: 'town_hall',
      anchor: { q: 14, r: 14 },
      rotation: 0,
      slotTypeOverride: 'meeting_point',
      tags: ['civic', 'community', 'former_assay'],
      importance: 5,
    },

    // General Store - Basic supplies for the farming community
    {
      assemblageId: 'asm_general_store_01',
      instanceId: 'general_store',
      anchor: { q: 18, r: 14 },
      rotation: 0,
      tags: ['commerce', 'essential'],
      importance: 4,
    },

    // Boarding House - Simple lodging (using small tavern)
    {
      assemblageId: 'asm_tavern_small_01',
      instanceId: 'boarding_house',
      anchor: { q: 10, r: 14 },
      rotation: 0,
      slotTypeOverride: 'hotel',
      tags: ['lodging', 'simple'],
      importance: 3,
    },

    // Blacksmith - Farm equipment focus (using workshop/gunsmith shell)
    {
      assemblageId: 'asm_gunsmith_01',
      instanceId: 'blacksmith',
      anchor: { q: 22, r: 14 },
      rotation: 0,
      slotTypeOverride: 'workshop',
      tags: ['industrial', 'farm_equipment'],
      importance: 3,
    },

    // Abandoned Mine Shaft - Reminder of the past
    {
      assemblageId: 'asm_mine_01',
      instanceId: 'abandoned_mine',
      anchor: { q: 6, r: 6 },
      rotation: 2,
      slotTypeOverride: 'ruins',
      tags: ['abandoned', 'history', 'dangerous'],
      importance: 2,
    },

    // Central Well - Town gathering spot
    {
      assemblageId: 'asm_well_01',
      instanceId: 'town_well',
      anchor: { q: 15, r: 11 },
      rotation: 0,
      tags: ['center', 'gathering', 'social'],
      importance: 4,
    },

    // Small Church - Community faith
    {
      assemblageId: 'asm_church_01',
      instanceId: 'church',
      anchor: { q: 10, r: 8 },
      rotation: 1,
      tags: ['religious', 'community', 'sanctuary'],
      importance: 3,
    },

    // Farmstead 1 - North of town
    {
      assemblageId: 'asm_farm_small_01',
      instanceId: 'farmstead_north',
      anchor: { q: 20, r: 6 },
      rotation: 0,
      tags: ['agriculture', 'residential'],
      importance: 2,
    },

    // Farmstead 2 - East of town
    {
      assemblageId: 'asm_farm_small_01',
      instanceId: 'farmstead_east',
      anchor: { q: 24, r: 18 },
      rotation: 4,
      tags: ['agriculture', 'residential'],
      importance: 2,
    },

    // Farmstead 3 - South of town
    {
      assemblageId: 'asm_farm_small_01',
      instanceId: 'farmstead_south',
      anchor: { q: 14, r: 22 },
      rotation: 2,
      tags: ['agriculture', 'residential'],
      importance: 2,
    },

    // Farmstead 4 - West side
    {
      assemblageId: 'asm_farm_small_01',
      instanceId: 'farmstead_west',
      anchor: { q: 4, r: 18 },
      rotation: 5,
      tags: ['agriculture', 'residential'],
      importance: 2,
    },

    // Residential cabins - Townsfolk homes
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_1',
      anchor: { q: 8, r: 18 },
      rotation: 1,
      tags: ['residential'],
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_2',
      anchor: { q: 20, r: 10 },
      rotation: 3,
      tags: ['residential'],
    },
  ];
