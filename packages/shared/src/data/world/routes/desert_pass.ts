/**
 * Desert Pass - Route 2: Iron Gulch to Mesa Point
 *
 * A challenging route through harsh desert terrain and narrow canyons.
 * Leads to the outlaw settlement of Mesa Point.
 * Features bandit ambushes, environmental hazards, and hidden secrets.
 *
 * Travel Time: 20 game-minutes (~10 real minutes)
 * Difficulty: Medium
 */

import type { Route } from '../routeSchema';

export const DesertPass: Route = {
  id: 'desert_pass',
  name: 'Desert Pass',
  description:
    'A treacherous route through scorching desert and winding canyons. Bandits use the narrow passages for ambushes, and the heat claims those unprepared for the journey. Yet hidden oases and ancient ruins offer refuge for the resourceful.',
  fromTown: 'iron_gulch',
  toTown: 'mesa_point',
  terrain: 'desert',
  secondaryTerrain: 'badlands',
  length: 20, // game-minutes
  condition: 'clear',
  dangerLevel: 5,
  bidirectional: true,
  passable: true,
  encounterFrequency: 1.2, // Higher encounter rate due to bandits

  encounters: [
    // Bandit Ambush - 35% weight (Medium)
    {
      id: 'desert_pass_bandit_ambush',
      name: 'Canyon Ambush',
      type: 'ambush',
      weight: 35,
      description:
        'Rocks tumble from above as bandits emerge from hidden alcoves in the canyon walls. "Nobody passes without paying the toll!"',
      enemies: [
        { enemyId: 'bandit_gunman', count: 2, levelScale: 1.0 },
        { enemyId: 'bandit_thug', count: 2, levelScale: 1.0 },
      ],
      conditions: {
        minLevel: 2,
      },
      rewards: {
        xp: 60,
        gold: 25,
        items: [
          { itemId: 'revolver_ammo', quantity: 12, chance: 0.7 },
          { itemId: 'bandages', quantity: 2, chance: 0.5 },
          { itemId: 'whiskey', quantity: 1, chance: 0.3 },
        ],
      },
      tags: ['bandit', 'medium', 'ambush', 'human'],
    },

    // Rattlesnakes - 25% weight (Medium, poisonous)
    {
      id: 'desert_pass_rattlesnakes',
      name: 'Rattlesnake Den',
      type: 'wildlife',
      weight: 25,
      description:
        'The hissing of rattles fills the narrow passage. A colony of venomous snakes has made their home among the sun-warmed rocks.',
      enemies: [
        { enemyId: 'rattlesnake', count: 4, levelScale: 1.0 },
        { enemyId: 'rattlesnake', count: 2, levelScale: 1.1 },
      ],
      conditions: {
        timeOfDay: ['morning', 'afternoon'],
      },
      rewards: {
        xp: 35,
        gold: 0,
        items: [
          { itemId: 'snake_venom', quantity: 2, chance: 0.4 },
          { itemId: 'antivenom', quantity: 1, chance: 0.2 },
        ],
      },
      tags: ['wildlife', 'medium', 'poison'],
    },

    // Desert Scorpions - 20% weight (Medium, tough defense)
    {
      id: 'desert_pass_scorpions',
      name: 'Scorpion Swarm',
      type: 'wildlife',
      weight: 20,
      description:
        'Armored shapes scuttle across the sand as massive desert scorpions emerge from their burrows. Their chitinous shells glint in the harsh sunlight.',
      enemies: [
        { enemyId: 'desert_scorpion', count: 3, levelScale: 1.0 },
        { enemyId: 'giant_scorpion', count: 1, levelScale: 1.0 },
      ],
      rewards: {
        xp: 50,
        gold: 0,
        items: [
          { itemId: 'scorpion_chitin', quantity: 2, chance: 0.5 },
          { itemId: 'scorpion_stinger', quantity: 1, chance: 0.3 },
        ],
      },
      tags: ['wildlife', 'medium', 'armored'],
    },

    // Sandstorm Event - 15% weight (No combat, environmental)
    {
      id: 'desert_pass_sandstorm',
      name: 'Sudden Sandstorm',
      type: 'event',
      weight: 15,
      description:
        'The sky darkens as a wall of sand approaches. There is no shelter - you must push through or be buried. The storm batters you mercilessly.',
      enemies: [], // No combat - handled as event effects
      rewards: {
        xp: 10,
        gold: 0,
        items: [],
      },
      tags: ['environmental', 'no_combat', 'fatigue'],
    },

    // Night Bandits - More at night
    {
      id: 'desert_pass_night_bandits',
      name: 'Nighttime Raiders',
      type: 'ambush',
      weight: 30,
      description:
        'Shadowy figures emerge from the darkness, their faces wrapped against the cold desert night. These bandits are better equipped than common road thugs.',
      enemies: [
        { enemyId: 'bandit_gunman', count: 2, levelScale: 1.1 },
        { enemyId: 'bandit_sharpshooter', count: 1, levelScale: 1.0 },
        { enemyId: 'bandit_thug', count: 1, levelScale: 1.0 },
      ],
      conditions: {
        timeOfDay: ['night'],
        minLevel: 3,
      },
      rewards: {
        xp: 85,
        gold: 40,
        items: [
          { itemId: 'hunting_rifle', quantity: 1, chance: 0.15 },
          { itemId: 'rifle_ammo', quantity: 10, chance: 0.6 },
        ],
      },
      tags: ['bandit', 'medium', 'night', 'ambush'],
    },

    // Lone Sharpshooter - Rare, dangerous
    {
      id: 'desert_pass_sniper',
      name: 'Canyon Sniper',
      type: 'ambush',
      weight: 10,
      description:
        'A shot rings out, kicking up dust at your feet. High on the canyon rim, a lone figure chambers another round.',
      enemies: [{ enemyId: 'bandit_sharpshooter', count: 1, levelScale: 1.2 }],
      conditions: {
        minLevel: 3,
      },
      rewards: {
        xp: 45,
        gold: 20,
        items: [
          { itemId: 'hunting_rifle', quantity: 1, chance: 0.25 },
          { itemId: 'rifle_ammo', quantity: 15, chance: 0.8 },
        ],
      },
      tags: ['bandit', 'medium', 'sniper', 'rare'],
    },
  ],

  events: [
    // Hidden Oasis (30% chance at 45% distance)
    {
      id: 'desert_pass_hidden_oasis',
      name: 'Hidden Oasis',
      description:
        'Following a narrow side canyon, you discover an unexpected paradise - a spring-fed pool surrounded by date palms. The water is cool and clear, and ripe dates hang within reach.',
      triggerType: 'distance',
      triggerValue: 0.45,
      repeatable: true,
      effects: [
        { type: 'give_item', target: 'fresh_water', value: 5 },
        { type: 'give_item', target: 'dates', value: 3 },
        { type: 'set_flag', target: 'discovered_desert_oasis' },
      ],
      tags: ['rest', 'provisions', 'discovery', 'water'],
    },

    // Ancient Ruins (60% distance, optional dungeon)
    {
      id: 'desert_pass_ancient_ruins',
      name: 'Forgotten Ruins',
      description:
        'Weathered stone structures emerge from the sand - remnants of a civilization that predates the frontier. Strange symbols are carved into the walls, and the entrance to an underground chamber yawns before you.',
      triggerType: 'distance',
      triggerValue: 0.6,
      repeatable: false,
      effects: [
        { type: 'set_flag', target: 'discovered_desert_ruins' },
        { type: 'discovery', target: 'desert_ruins_dungeon' },
      ],
      tags: ['dungeon', 'lore', 'discovery', 'ancient'],
    },

    // Dying Prospector (Random 15% chance)
    {
      id: 'desert_pass_dying_prospector',
      name: 'Dying Prospector',
      description:
        'A man lies against a boulder, his lips cracked and skin burned. He weakly raises a hand. "Water... please... I know... where the gold is..."',
      triggerType: 'random',
      triggerValue: 0.15,
      repeatable: false,
      dialogueTreeId: 'dying_prospector_desert',
      effects: [{ type: 'set_flag', target: 'met_dying_prospector' }],
      tags: ['npc', 'choice', 'prospector_mystery'],
    },

    // Bandit Warning (25% distance)
    {
      id: 'desert_pass_bandit_warning',
      name: 'Grim Warning',
      description:
        'Three bodies hang from a makeshift gallows beside the trail. A sign reads: "TOLL EVADERS." The Mesa Point outlaws mark their territory with blood.',
      triggerType: 'distance',
      triggerValue: 0.25,
      repeatable: false,
      effects: [{ type: 'set_flag', target: 'seen_bandit_warning' }],
      tags: ['lore', 'warning', 'dark'],
    },

    // Stagecoach Robbery in Progress
    {
      id: 'desert_pass_stagecoach_robbery',
      name: 'Robbery in Progress',
      description:
        'Gunshots echo through the canyon ahead. Rounding a bend, you see a stagecoach surrounded by masked bandits. The passengers cower as the outlaws demand valuables.',
      triggerType: 'random',
      triggerValue: 0.2,
      repeatable: true,
      combatEncounterId: 'stagecoach_rescue',
      effects: [{ type: 'set_flag', target: 'witnessed_robbery' }],
      tags: ['combat', 'choice', 'reputation'],
    },
  ],

  landmarks: [
    // Canyon Entrance
    {
      id: 'desert_pass_canyon_entrance',
      name: 'Red Canyon Entrance',
      type: 'crossroads',
      description:
        'Towering red rock walls mark the entrance to the canyon system. The temperature drops noticeably as you enter the shadowed passage.',
      position: 0.2,
      startDiscovered: true,
      canRest: true,
      restQuality: 0.8,
      resources: [],
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'The Natives called this place "Red Door" - the gateway between the green lands and the desert beyond.',
      tags: ['nature', 'scenic', 'transition'],
    },

    // The Oasis
    {
      id: 'desert_pass_oasis',
      name: 'Palm Spring Oasis',
      type: 'oasis',
      description:
        'A miracle in the desert - a spring-fed pool surrounded by palm trees. The water tastes of minerals but is blessedly cool.',
      position: 0.45,
      startDiscovered: false,
      canRest: true,
      restQuality: 1.5, // Excellent rest spot
      resources: [
        { type: 'water', quantity: 10, respawnHours: 24 },
        { type: 'food', quantity: 5, respawnHours: 72 }, // Dates
      ],
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'Travelers have used this oasis for centuries. Petroglyphs on nearby rocks show it was sacred to the ancient peoples.',
      tags: ['water', 'rest', 'sacred'],
    },

    // Ancient Ruins
    {
      id: 'desert_pass_ruins',
      name: 'Ancestral Ruins',
      type: 'ruins',
      description:
        'Crumbling stone walls and worn carvings hint at a sophisticated civilization long vanished. The entrance to a partially buried structure leads underground.',
      position: 0.6,
      startDiscovered: false,
      canRest: false,
      restQuality: 0.5,
      resources: [],
      containers: [
        {
          id: 'ruins_urn_1',
          lootTableId: 'ancient_artifacts',
          locked: false,
        },
        {
          id: 'ruins_chest',
          lootTableId: 'rare_supplies',
          locked: true,
          lockDifficulty: 40,
        },
      ],
      npcIds: [],
      questIds: ['explore_desert_ruins'],
      lore: 'Some say these ruins predate even the Natives. Strange machinery has been found in the lower chambers - technology that should not exist.',
      tags: ['dungeon_entrance', 'ancient', 'mystery'],
    },

    // Mesa in Distance
    {
      id: 'desert_pass_mesa_view',
      name: 'Mesa Point Vista',
      type: 'overlook',
      description:
        'The great mesa rises from the desert floor like a fortress. At its base, you can make out the ramshackle buildings of Mesa Point - the outlaw settlement that answers to no law.',
      position: 0.85,
      startDiscovered: false,
      canRest: false,
      restQuality: 1.0,
      resources: [],
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'Mesa Point was founded by deserters from both sides of the War. They carved out a place where a man\'s past did not matter - only his gun hand.',
      tags: ['scenic', 'destination', 'outlaw'],
    },

    // Abandoned Mine Shaft
    {
      id: 'desert_pass_mine_shaft',
      name: 'Abandoned Mine Shaft',
      type: 'mine_entrance',
      description:
        'A boarded-up mine entrance, marked with faded warning signs. The boards look recently disturbed.',
      position: 0.35,
      startDiscovered: false,
      canRest: false,
      restQuality: 0.3,
      resources: [{ type: 'ore', quantity: 5, respawnHours: 168 }], // Weekly respawn
      containers: [
        {
          id: 'mine_cache',
          lootTableId: 'mining_supplies',
          locked: false,
        },
      ],
      npcIds: [],
      questIds: [],
      lore: 'Played out decades ago, they said. But fresh tracks in the dust suggest someone has been using it for... something.',
      tags: ['mine', 'suspicious', 'hidden'],
    },
  ],

  travelMethods: [
    { method: 'walk', available: true, speedModifier: 1, cost: 0 },
    { method: 'horse', available: true, speedModifier: 1.3, cost: 0 }, // Slower due to terrain
    { method: 'stagecoach', available: false, speedModifier: 1, cost: 0 }, // Too dangerous
  ],

  weatherPatterns: [
    { type: 'clear', probability: 0.5 },
    { type: 'sandstorm', probability: 0.25 },
    { type: 'fog', probability: 0.05, seasonRestriction: ['winter'] },
  ],

  waypoints: [
    { x: 320, z: 100 }, // Iron Gulch
    { x: 380, z: 130 },
    { x: 420, z: 160 }, // Canyon Entrance
    { x: 460, z: 200 }, // Mine Shaft
    { x: 500, z: 230 }, // Oasis
    { x: 550, z: 270 }, // Ruins
    { x: 600, z: 310 }, // Mesa View
    { x: 650, z: 350 }, // Mesa Point
  ],

  lore: 'The Desert Pass was once avoided by all but the most desperate. Then the outlaws came, establishing Mesa Point as a haven for those running from the law. Now the pass sees regular traffic - smugglers, bounty hunters, and fools seeking fortune in the lawless settlement beyond. The ancient ruins along the way hint at darker secrets buried beneath the sands.',

  tags: ['main_route', 'dangerous', 'outlaw_territory', 'act2'],
};
