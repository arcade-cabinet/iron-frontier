export const thornwood_stationAssemblages = [
    // Train Station - Main building with platform
    {
      assemblageId: 'asm_train_station_01',
      instanceId: 'station',
      anchor: { q: 12, r: 8 },
      rotation: 0,
      tags: ['railroad', 'ivrc', 'central'],
      importance: 5,
    },

    // Station Master's House - Small residence
    {
      assemblageId: 'asm_house_01',
      instanceId: 'station_master_house',
      anchor: { q: 8, r: 6 },
      rotation: 0,
      tags: ['residential', 'staff'],
      importance: 3,
    },

    // Waystation Inn - Traveler lodging
    {
      assemblageId: 'asm_waystation_01',
      instanceId: 'waystation_inn',
      anchor: { q: 16, r: 12 },
      rotation: 0,
      slotTypeOverride: 'hotel',
      tags: ['lodging', 'travelers', 'commerce'],
      importance: 4,
    },

    // Stable - Horse care for travelers
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'stable',
      anchor: { q: 6, r: 12 },
      rotation: 0,
      tags: ['mounts', 'travelers'],
      importance: 3,
    },

    // Telegraph Post - Communication
    {
      assemblageId: 'asm_telegraph_01',
      instanceId: 'telegraph',
      anchor: { q: 18, r: 6 },
      rotation: 0,
      tags: ['communication', 'ivrc'],
      importance: 4,
    },

    // Small Store - Travel supplies (using general store)
    {
      assemblageId: 'asm_general_store_01',
      instanceId: 'travel_store',
      anchor: { q: 20, r: 12 },
      rotation: 5,
      tags: ['commerce', 'supplies', 'travelers'],
      importance: 3,
    },
  ];
