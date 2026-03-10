export const freeminer_hollowAssemblages = [
    // ========================================
    // MAIN SHAFT - Community-owned mine entrance
    // ========================================
    {
      assemblageId: 'asm_mine_01',
      instanceId: 'main_shaft',
      anchor: { q: 20, r: 5 },
      rotation: 0,
      tags: ['primary', 'industrial', 'community_owned'],
      importance: 5,
    },

    // ========================================
    // MEETING HALL - Democratic decision center
    // ========================================
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'meeting_hall',
      anchor: { q: 15, r: 12 },
      rotation: 0,
      slotTypeOverride: 'meeting_point',
      tags: ['civic', 'important', 'democracy'],
      importance: 5,
    },

    // ========================================
    // SAMUEL'S CABIN - Old Samuel Ironpick's home
    // ========================================
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'samuel_cabin',
      anchor: { q: 10, r: 8 },
      rotation: 1,
      tags: ['residence', 'leader', 'quest_giver'],
      importance: 4,
    },

    // ========================================
    // COMMUNAL KITCHEN - Shared meals
    // ========================================
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'communal_kitchen',
      anchor: { q: 18, r: 14 },
      rotation: 2,
      slotTypeOverride: 'tavern',
      tags: ['social', 'food', 'community'],
      importance: 3,
    },

    // ========================================
    // BUNKHOUSES - Worker housing (4 total)
    // ========================================
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'bunkhouse_1',
      anchor: { q: 8, r: 14 },
      rotation: 0,
      tags: ['residence', 'workers'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'bunkhouse_2',
      anchor: { q: 12, r: 16 },
      rotation: 5,
      tags: ['residence', 'workers'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'bunkhouse_3',
      anchor: { q: 22, r: 16 },
      rotation: 1,
      tags: ['residence', 'workers'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'bunkhouse_4',
      anchor: { q: 26, r: 14 },
      rotation: 2,
      tags: ['residence', 'workers', 'families'],
      importance: 2,
    },

    // ========================================
    // TOOL CACHE - Shared equipment storage
    // ========================================
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'tool_cache',
      anchor: { q: 25, r: 8 },
      rotation: 3,
      slotTypeOverride: 'workshop',
      tags: ['industrial', 'tools', 'shared'],
      importance: 3,
    },

    // ========================================
    // LOOKOUT POST - Watching for IVRC
    // ========================================
    {
      assemblageId: 'asm_rocks_01',
      instanceId: 'lookout_post',
      anchor: { q: 5, r: 5 },
      rotation: 0,
      slotTypeOverride: 'landmark',
      tags: ['defensive', 'lookout', 'guard'],
      importance: 4,
    },

    // ========================================
    // CAMPFIRE CIRCLE - Social gathering
    // ========================================
    {
      assemblageId: 'asm_campfire_01',
      instanceId: 'campfire_circle',
      anchor: { q: 16, r: 18 },
      rotation: 0,
      tags: ['social', 'gathering', 'stories'],
      importance: 3,
    },

    // ========================================
    // ORE PROCESSING - Small scale smelting
    // ========================================
    {
      assemblageId: 'asm_tent_camp_01',
      instanceId: 'ore_processing',
      anchor: { q: 24, r: 10 },
      rotation: 4,
      slotTypeOverride: 'smelter',
      tags: ['industrial', 'processing'],
      importance: 3,
    },

    // ========================================
    // SECONDARY LOOKOUT - Canyon rim watch
    // ========================================
    {
      assemblageId: 'asm_campfire_01',
      instanceId: 'rim_watch',
      anchor: { q: 28, r: 4 },
      rotation: 1,
      tags: ['defensive', 'lookout'],
      importance: 2,
    },
  ];
