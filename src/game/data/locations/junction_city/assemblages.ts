export const junction_cityAssemblages = [
    // ========================================================================
    // RAILROAD INFRASTRUCTURE (Central E-W corridor)
    // ========================================================================

    // Grand Station - The crown jewel of IVRC, dominates the center
    {
      assemblageId: 'asm_train_station_01',
      instanceId: 'grand_station',
      anchor: { q: 25, r: 17 },
      rotation: 0,
      tags: ['ivrc', 'landmark', 'primary'],
      importance: 5,
    },

    // Telegraph Office - Communication hub, adjacent to station
    {
      assemblageId: 'asm_telegraph_01',
      instanceId: 'telegraph_office',
      anchor: { q: 20, r: 16 },
      rotation: 0,
      tags: ['ivrc', 'communication'],
      importance: 4,
    },

    // ========================================================================
    // NORTH SIDE - COMPANY DISTRICT (The Respectable Side)
    // ========================================================================

    // IVRC Headquarters - Imposing office building, restricted access
    {
      assemblageId: 'asm_mansion_01',
      instanceId: 'ivrc_headquarters',
      anchor: { q: 25, r: 8 },
      rotation: 0,
      slotTypeOverride: 'quest_location',
      tags: ['ivrc', 'corporate', 'restricted', 'important'],
      importance: 5,
    },

    // The Ironclad Hotel - Upscale lodging for company men
    {
      assemblageId: 'asm_house_01',
      instanceId: 'ironclad_hotel',
      anchor: { q: 32, r: 8 },
      rotation: 0,
      slotTypeOverride: 'hotel',
      tags: ['ivrc', 'wealthy', 'lodging'],
      importance: 4,
    },

    // Bank - IVRC-controlled financial institution
    {
      assemblageId: 'asm_bank_01',
      instanceId: 'company_bank',
      anchor: { q: 18, r: 8 },
      rotation: 0,
      tags: ['ivrc', 'finance', 'secure'],
      importance: 4,
    },

    // Company Store - IVRC-owned, inflated prices
    {
      assemblageId: 'asm_general_store_01',
      instanceId: 'company_store',
      anchor: { q: 38, r: 10 },
      rotation: 5,
      tags: ['ivrc', 'commerce', 'overpriced'],
      importance: 3,
    },

    // Pinkerton Office - IVRC security force
    {
      assemblageId: 'asm_sheriff_01',
      instanceId: 'pinkerton_office',
      anchor: { q: 12, r: 10 },
      rotation: 1,
      slotTypeOverride: 'law_office',
      tags: ['ivrc', 'security', 'enforcement', 'hostile'],
      importance: 4,
    },

    // Manager's Residence - Company housing for executives
    {
      assemblageId: 'asm_house_01',
      instanceId: 'manager_residence_1',
      anchor: { q: 40, r: 6 },
      rotation: 0,
      tags: ['ivrc', 'residential', 'wealthy'],
      importance: 2,
    },
    {
      assemblageId: 'asm_house_01',
      instanceId: 'manager_residence_2',
      anchor: { q: 45, r: 8 },
      rotation: 5,
      tags: ['ivrc', 'residential', 'wealthy'],
      importance: 2,
    },

    // ========================================================================
    // SOUTH SIDE - WORKERS' DISTRICT (The Other Side of the Tracks)
    // ========================================================================

    // The Brake House Saloon - Worker hangout, where rumors flow
    {
      assemblageId: 'asm_saloon_01',
      instanceId: 'brake_house_saloon',
      anchor: { q: 20, r: 26 },
      rotation: 0,
      tags: ['workers', 'social', 'rumors', 'copperhead_sympathy'],
      importance: 4,
    },

    // Workers' Barracks - Cramped company housing
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'barracks_1',
      anchor: { q: 10, r: 24 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['workers', 'residential', 'cramped'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'barracks_2',
      anchor: { q: 14, r: 26 },
      rotation: 1,
      slotTypeOverride: 'residence_poor',
      tags: ['workers', 'residential', 'cramped'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'barracks_3',
      anchor: { q: 10, r: 28 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['workers', 'residential', 'cramped'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'barracks_4',
      anchor: { q: 14, r: 30 },
      rotation: 2,
      slotTypeOverride: 'residence_poor',
      tags: ['workers', 'residential', 'cramped'],
      importance: 2,
    },

    // Communal Well - Gathering spot for workers
    {
      assemblageId: 'asm_well_01',
      instanceId: 'workers_well',
      anchor: { q: 12, r: 26 },
      rotation: 0,
      tags: ['workers', 'social', 'gathering'],
      importance: 2,
    },

    // ========================================================================
    // RAILYARD (East of Grand Station)
    // ========================================================================

    // Roundhouse - Train maintenance
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'roundhouse',
      anchor: { q: 38, r: 17 },
      rotation: 0,
      slotTypeOverride: 'workshop',
      tags: ['ivrc', 'industrial', 'maintenance'],
      importance: 4,
    },

    // ========================================================================
    // WAREHOUSE DISTRICT (Southwest)
    // ========================================================================

    // Main warehouse
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'warehouse_1',
      anchor: { q: 30, r: 26 },
      rotation: 0,
      slotTypeOverride: 'hidden_cache',
      tags: ['ivrc', 'storage', 'cargo'],
      importance: 3,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'warehouse_2',
      anchor: { q: 34, r: 28 },
      rotation: 1,
      slotTypeOverride: 'hidden_cache',
      tags: ['ivrc', 'storage', 'cargo'],
      importance: 3,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'warehouse_3',
      anchor: { q: 38, r: 26 },
      rotation: 0,
      slotTypeOverride: 'hidden_cache',
      tags: ['ivrc', 'storage', 'cargo'],
      importance: 3,
    },

    // ========================================================================
    // INDUSTRIAL INFRASTRUCTURE
    // ========================================================================

    // Campfire area for yard workers
    {
      assemblageId: 'asm_campfire_01',
      instanceId: 'yard_workers_fire',
      anchor: { q: 42, r: 22 },
      rotation: 0,
      tags: ['workers', 'industrial'],
      importance: 1,
    },
  ];
