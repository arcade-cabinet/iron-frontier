/**
 * Badlands Trail - Route 4: Mesa Point to/from Coldwater
 *
 * A bidirectional route through the eerie badlands connecting the
 * outlaw settlement of Mesa Point with the ranching town of Coldwater.
 * Features ghost town exploration, supernatural encounters, and outlaw patrols.
 *
 * Travel Time: 20 game-minutes (~10 real minutes)
 * Difficulty: Medium-Hard
 */

import type { Route } from '../routeSchema';

export const BadlandsTrail: Route = {
  id: 'badlands_trail',
  name: 'Badlands Trail',
  description:
    'A desolate path through eroded canyons and strange rock formations. The abandoned town of Dustfall lies along the route, a grim reminder of the territory\'s violent past. Outlaws from Mesa Point patrol these lands, and travelers speak of restless spirits among the bones of the dead.',
  fromTown: 'mesa_point',
  toTown: 'coldwater',
  terrain: 'badlands',
  secondaryTerrain: 'desert',
  length: 20, // game-minutes
  condition: 'clear',
  dangerLevel: 6,
  bidirectional: true,
  passable: true,
  encounterFrequency: 1.1,

  encounters: [
    // Outlaw Patrol - 30% weight (Medium-Hard)
    {
      id: 'badlands_trail_outlaw_patrol',
      name: 'Mesa Point Patrol',
      type: 'combat',
      weight: 30,
      description:
        'Riders approach flying the black bandana of Mesa Point. "This is our territory, stranger. You got business here, or are you just looking for trouble?"',
      enemies: [
        { enemyId: 'copperhead_gunslinger', count: 2, levelScale: 1.0 },
        { enemyId: 'copperhead_enforcer', count: 1, levelScale: 1.0 },
      ],
      conditions: {
        minLevel: 3,
      },
      rewards: {
        xp: 90,
        gold: 45,
        items: [
          { itemId: 'revolver_ammo', quantity: 18, chance: 0.8 },
          { itemId: 'mesa_point_token', quantity: 1, chance: 0.3 },
          { itemId: 'whiskey', quantity: 2, chance: 0.4 },
        ],
      },
      tags: ['outlaw', 'medium', 'human', 'mesa_point'],
    },

    // Buzzards - 25% weight (Easy, drain provisions)
    {
      id: 'badlands_trail_buzzards',
      name: 'Circling Buzzards',
      type: 'wildlife',
      weight: 25,
      description:
        'A flock of enormous buzzards descends from the sky, drawn by the smell of your provisions. They are bold, hungry, and unafraid of humans.',
      enemies: [
        { enemyId: 'giant_buzzard', count: 4, levelScale: 0.9 },
        { enemyId: 'giant_buzzard', count: 2, levelScale: 1.0 },
      ],
      rewards: {
        xp: 30,
        gold: 0,
        items: [
          { itemId: 'buzzard_feather', quantity: 3, chance: 0.5 },
        ],
      },
      tags: ['wildlife', 'easy', 'provisions_drain'],
    },

    // Dust Devils - 20% weight (Environmental, fatigue)
    {
      id: 'badlands_trail_dust_devils',
      name: 'Dust Devil Storm',
      type: 'event',
      weight: 20,
      description:
        'The wind picks up suddenly, and swirling columns of dust spring up across the badlands. These dust devils batter you with grit and debris, making progress exhausting.',
      enemies: [], // No combat - environmental hazard
      rewards: {
        xp: 10,
        gold: 0,
        items: [],
      },
      tags: ['environmental', 'no_combat', 'fatigue'],
    },

    // Ghost Town Spirits - 15% weight (Hard, supernatural)
    {
      id: 'badlands_trail_spirits',
      name: 'Restless Spirits',
      type: 'combat',
      weight: 15,
      description:
        'The temperature drops. Translucent figures emerge from the ruined buildings, their faces twisted in eternal agony. The dead of Dustfall have not found peace.',
      enemies: [
        { enemyId: 'vengeful_spirit', count: 2, levelScale: 1.0 },
        { enemyId: 'lost_soul', count: 3, levelScale: 0.9 },
      ],
      conditions: {
        timeOfDay: ['evening', 'night'],
        minLevel: 4,
        requiresFlag: 'entered_ghost_town',
      },
      rewards: {
        xp: 100,
        gold: 0,
        items: [
          { itemId: 'ectoplasm', quantity: 2, chance: 0.4 },
          { itemId: 'spirit_essence', quantity: 1, chance: 0.2 },
        ],
      },
      tags: ['supernatural', 'hard', 'ghost_town', 'night'],
    },

    // Outlaw Ambush - Night only
    {
      id: 'badlands_trail_night_ambush',
      name: 'Nighttime Ambush',
      type: 'ambush',
      weight: 25,
      description:
        'Gunshots shatter the night silence. You have ridden into an outlaw ambush - they have been waiting for someone carrying valuables.',
      enemies: [
        { enemyId: 'copperhead_gunslinger', count: 2, levelScale: 1.1 },
        { enemyId: 'copperhead_dynamiter', count: 1, levelScale: 1.0 },
        { enemyId: 'copperhead_enforcer', count: 1, levelScale: 1.0 },
      ],
      conditions: {
        timeOfDay: ['night'],
        minLevel: 4,
      },
      rewards: {
        xp: 120,
        gold: 60,
        items: [
          { itemId: 'dynamite', quantity: 2, chance: 0.5 },
          { itemId: 'revolver', quantity: 1, chance: 0.2 },
        ],
      },
      tags: ['outlaw', 'hard', 'night', 'ambush'],
    },

    // Territorial Coyotes
    {
      id: 'badlands_trail_coyotes',
      name: 'Badlands Coyotes',
      type: 'wildlife',
      weight: 20,
      description:
        'Lean, scarred coyotes emerge from the rock formations. These badlands predators are tougher and meaner than their plains cousins.',
      enemies: [
        { enemyId: 'desert_wolf', count: 4, levelScale: 1.1 },
      ],
      rewards: {
        xp: 40,
        gold: 0,
        items: [
          { itemId: 'wolf_pelt', quantity: 2, chance: 0.35 },
        ],
      },
      tags: ['wildlife', 'medium'],
    },

    // Bone Scavengers (near the bone yard)
    {
      id: 'badlands_trail_scavengers',
      name: 'Bone Yard Scavengers',
      type: 'combat',
      weight: 15,
      description:
        'Figures rise from among the bones - not spirits, but living scavengers who have made the bone yard their home. Their eyes are wild, and their weapons are made from the remains of the dead.',
      enemies: [
        { enemyId: 'bone_scavenger', count: 3, levelScale: 1.0 },
        { enemyId: 'scavenger_chief', count: 1, levelScale: 1.1 },
      ],
      conditions: {
        minLevel: 3,
        requiresFlag: 'visited_bone_yard',
      },
      rewards: {
        xp: 75,
        gold: 20,
        items: [
          { itemId: 'bone_knife', quantity: 1, chance: 0.3 },
          { itemId: 'strange_amulet', quantity: 1, chance: 0.15 },
        ],
      },
      tags: ['human', 'medium', 'scavenger'],
    },
  ],

  events: [
    // Ghost Town (50% distance)
    {
      id: 'badlands_trail_ghost_town',
      name: 'The Town of Dustfall',
      description:
        'The abandoned town of Dustfall emerges from the badlands like a fever dream. Buildings lean at impossible angles, and the wind moans through empty windows. A faded sign creaks: "DUSTFALL - POP. 847." The entire population vanished in a single night, forty years ago. No one knows why.',
      triggerType: 'distance',
      triggerValue: 0.5,
      repeatable: false,
      effects: [
        { type: 'set_flag', target: 'entered_ghost_town' },
        { type: 'discovery', target: 'dustfall_ghost_town' },
      ],
      tags: ['lore', 'discovery', 'supernatural', 'dungeon'],
    },

    // Outlaw Stash (random, informant clue)
    {
      id: 'badlands_trail_outlaw_stash',
      name: 'Hidden Stash',
      description:
        'Behind a distinctive rock formation, you find what the informant described - a cache of outlaw supplies hidden beneath loose stones. Maps, ammunition, and a ledger of criminal activities.',
      triggerType: 'flag',
      flagName: 'informant_stash_location',
      repeatable: false,
      effects: [
        { type: 'set_flag', target: 'found_outlaw_stash' },
        { type: 'give_item', target: 'outlaw_ledger', value: 1 },
        { type: 'give_item', target: 'revolver_ammo', value: 30 },
        { type: 'give_item', target: 'gold_coins', value: 50 },
      ],
      tags: ['loot', 'quest', 'informant'],
    },

    // Bone Yard Discovery
    {
      id: 'badlands_trail_bone_yard',
      name: 'The Bone Yard',
      description:
        'The path winds through a field of bleached bones - animal and human alike. Skulls grin from the dust, and ribcages arc like macabre arches. Whether this was a massacre site or a natural graveyard is unclear, but the sense of death is overwhelming.',
      triggerType: 'distance',
      triggerValue: 0.35,
      repeatable: false,
      effects: [
        { type: 'set_flag', target: 'visited_bone_yard' },
      ],
      tags: ['lore', 'dark', 'atmospheric'],
    },

    // Strange Whispers
    {
      id: 'badlands_trail_whispers',
      name: 'Whispers on the Wind',
      description:
        'You could swear you hear voices on the wind - fragments of conversations, a child\'s laugh, a woman\'s scream. But when you stop to listen, there is only silence.',
      triggerType: 'random',
      triggerValue: 0.25,
      repeatable: true,
      effects: [],
      tags: ['atmospheric', 'supernatural', 'creepy'],
    },

    // Prospector Ghost
    {
      id: 'badlands_trail_prospector_ghost',
      name: 'The Lost Prospector',
      description:
        'A figure sits by a cold campfire ahead. As you approach, you realize you can see through him. The ghostly prospector looks up with hollow eyes. "Have you seen my claim? They took it from me. Killed me for it. But I cannot leave until I find it..."',
      triggerType: 'random',
      triggerValue: 0.15,
      repeatable: false,
      dialogueTreeId: 'ghost_prospector_dustfall',
      effects: [
        { type: 'set_flag', target: 'met_prospector_ghost' },
      ],
      tags: ['npc', 'supernatural', 'quest', 'prospector_mystery'],
    },

    // Coldwater Rancher Patrol
    {
      id: 'badlands_trail_rancher_patrol',
      name: 'Coldwater Patrol',
      description:
        'Armed riders approach from the Coldwater direction. They are ranchers, keeping watch for rustlers and outlaws. "You coming from Mesa Point? Keep your hands where we can see them."',
      triggerType: 'distance',
      triggerValue: 0.85,
      repeatable: true,
      dialogueTreeId: 'coldwater_patrol',
      effects: [],
      tags: ['npc', 'faction', 'coldwater'],
    },
  ],

  landmarks: [
    // Ghost Town (Dustfall)
    {
      id: 'badlands_trail_dustfall',
      name: 'Dustfall Ghost Town',
      type: 'ruins',
      description:
        'The abandoned town of Dustfall stands frozen in time. Plates still sit on tables, beds remain made, and personal belongings gather dust. Whatever happened here, it happened fast.',
      position: 0.5,
      startDiscovered: false,
      canRest: false, // Too haunted
      restQuality: 0.2,
      resources: [],
      containers: [
        {
          id: 'dustfall_general_store',
          lootTableId: 'abandoned_shop',
          locked: false,
        },
        {
          id: 'dustfall_saloon_safe',
          lootTableId: 'valuable_cache',
          locked: true,
          lockDifficulty: 60,
        },
        {
          id: 'dustfall_church_offering',
          lootTableId: 'religious_items',
          locked: false,
        },
      ],
      npcIds: [],
      questIds: ['dustfall_mystery', 'lay_spirits_rest'],
      lore: 'On October 13th, 1873, every man, woman, and child in Dustfall vanished. No bodies were ever found. The only clue was a single word scrawled in blood on the church wall: "SALVATION."',
      tags: ['dungeon_entrance', 'haunted', 'major_lore'],
    },

    // Bone Yard
    {
      id: 'badlands_trail_bone_yard_landmark',
      name: 'The Bone Yard',
      type: 'grave',
      description:
        'A vast field of bones stretching across the badlands. Some believe it was a massacre site from the territory wars. Others say the bones are far older, and far stranger, than that.',
      position: 0.35,
      startDiscovered: false,
      canRest: false,
      restQuality: 0.1,
      resources: [],
      containers: [],
      npcIds: [],
      questIds: ['bone_yard_secret'],
      lore: 'Scientists from back East came to study the bones once. They left in a hurry, refusing to discuss what they found. Their report was sealed by the territorial governor.',
      tags: ['dark', 'mystery', 'ancient'],
    },

    // Strange Rock Formations
    {
      id: 'badlands_trail_hoodoos',
      name: 'The Hoodoos',
      type: 'monument',
      description:
        'Bizarre rock formations carved by wind and time into shapes that almost look deliberate. Some resemble figures, others buildings, and one unmistakably looks like a screaming face.',
      position: 0.25,
      startDiscovered: true,
      canRest: true,
      restQuality: 0.7,
      resources: [],
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'The Natives avoided this place. They said the rocks were the petrified remains of an ancient people who angered the spirits.',
      tags: ['scenic', 'eerie', 'natural'],
    },

    // Outlaw Watchtower
    {
      id: 'badlands_trail_watchtower',
      name: 'Buzzard Tower',
      type: 'ruins',
      description:
        'A crumbling watchtower used by the Mesa Point outlaws to spot approaching travelers. A ragged black flag flies from its top, and vultures roost in its upper windows.',
      position: 0.15,
      startDiscovered: false,
      canRest: false,
      restQuality: 0.5,
      resources: [],
      containers: [
        {
          id: 'tower_supply_cache',
          lootTableId: 'outlaw_supplies',
          locked: false,
        },
      ],
      npcIds: [],
      questIds: [],
      lore: 'The outlaws built this tower from the stones of an older structure. Some say it was a Spanish mission; others claim it was something far older.',
      tags: ['outlaw', 'tactical'],
    },

    // Coldwater Valley View
    {
      id: 'badlands_trail_valley_view',
      name: 'Coldwater Valley Overlook',
      type: 'overlook',
      description:
        'The badlands end abruptly at a cliff edge, revealing the lush green valley of Coldwater below. Cattle dot the pastures, and the town\'s white church steeple gleams in the distance.',
      position: 0.9,
      startDiscovered: false,
      canRest: true,
      restQuality: 1.1,
      resources: [],
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'The contrast between the badlands and Coldwater valley could not be more stark. It is like crossing from hell into paradise.',
      tags: ['scenic', 'transition', 'destination'],
    },
  ],

  travelMethods: [
    { method: 'walk', available: true, speedModifier: 0.9, cost: 0 }, // Difficult terrain
    { method: 'horse', available: true, speedModifier: 1.2, cost: 0 },
    { method: 'stagecoach', available: false, speedModifier: 1, cost: 0 }, // Too dangerous and rough
  ],

  weatherPatterns: [
    { type: 'clear', probability: 0.35 },
    { type: 'sandstorm', probability: 0.3 },
    { type: 'fog', probability: 0.15 },
    { type: 'storm', probability: 0.1 },
  ],

  waypoints: [
    { x: 650, z: 350 }, // Mesa Point
    { x: 620, z: 380 }, // Watchtower
    { x: 580, z: 400 }, // Hoodoos
    { x: 520, z: 410 }, // Bone Yard
    { x: 450, z: 415 }, // Dustfall
    { x: 380, z: 420 }, // Midpoint
    { x: 300, z: 425 }, // Valley View
    { x: 220, z: 430 }, // Coldwater approach
    { x: 150, z: 420 }, // Coldwater
  ],

  lore: 'The Badlands Trail is cursed, they say. It passes through the territory\'s darkest places - the Bone Yard, the Hoodoos, and the ghost town of Dustfall. The Mesa Point outlaws use the trail\'s evil reputation to their advantage, knowing that superstitious travelers will pay well for safe passage. But even the outlaws avoid the trail at night, when the dead of Dustfall are said to walk.',

  tags: ['dangerous', 'supernatural', 'outlaw_territory', 'act2'],
};
