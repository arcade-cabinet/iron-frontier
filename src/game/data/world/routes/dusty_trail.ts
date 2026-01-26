/**
 * Dusty Trail - Route 1: Frontier's Edge to Iron Gulch
 *
 * The first route players traverse after leaving the tutorial town.
 * A relatively safe journey through plains transitioning to rocky desert.
 * Introduces basic combat encounters and resource management concepts.
 *
 * Travel Time: 15 game-minutes (~7.5 real minutes)
 * Difficulty: Tutorial/Easy
 */

import type { Route } from '../routeSchema';

export const DustyTrail: Route = {
  id: 'dusty_trail',
  name: 'Dusty Trail',
  description:
    'A well-worn path connecting the frontier outpost to the mining settlement of Iron Gulch. The trail winds through open plains before entering rockier terrain near the gulch.',
  fromTown: 'frontiers_edge',
  toTown: 'iron_gulch',
  terrain: 'plains',
  secondaryTerrain: 'desert',
  length: 15, // game-minutes
  condition: 'clear',
  dangerLevel: 2,
  bidirectional: true,
  passable: true,
  encounterFrequency: 0.8, // Slightly lower for tutorial route

  encounters: [
    // Coyote Pack - 40% weight (Easy)
    {
      id: 'dusty_trail_coyote_pack',
      name: 'Coyote Pack',
      type: 'wildlife',
      weight: 40,
      description:
        'A pack of mangy coyotes emerges from the brush, circling your position with hungry eyes.',
      enemies: [
        { enemyId: 'desert_wolf', count: 2, levelScale: 0.8 },
        { enemyId: 'desert_wolf', count: 1, levelScale: 0.7 },
      ],
      conditions: {
        timeOfDay: ['morning', 'afternoon', 'evening'],
      },
      rewards: {
        xp: 25,
        gold: 0,
        items: [{ itemId: 'wolf_pelt', quantity: 1, chance: 0.3 }],
      },
      tags: ['wildlife', 'easy', 'tutorial'],
    },

    // Lone Bandit - 30% weight (Easy, Tutorial Combat)
    {
      id: 'dusty_trail_lone_bandit',
      name: 'Lone Bandit',
      type: 'combat',
      weight: 30,
      description:
        'A desperate man steps onto the trail ahead, rusty pistol raised with shaking hands. "Your gold or your life, stranger!"',
      enemies: [{ enemyId: 'bandit_thug', count: 1, levelScale: 0.9 }],
      rewards: {
        xp: 20,
        gold: 8,
        items: [
          { itemId: 'bandages', quantity: 1, chance: 0.5 },
          { itemId: 'worn_revolver', quantity: 1, chance: 0.1 },
        ],
      },
      tags: ['bandit', 'easy', 'tutorial', 'human'],
    },

    // Snake Nest - 20% weight (Easy, avoidable)
    {
      id: 'dusty_trail_snake_nest',
      name: 'Snake Nest',
      type: 'wildlife',
      weight: 20,
      description:
        'You nearly step on a nest of rattlesnakes sunning themselves on the rocks. Their rattles fill the air with warning.',
      enemies: [{ enemyId: 'rattlesnake', count: 3, levelScale: 1.0 }],
      conditions: {
        timeOfDay: ['morning', 'afternoon'],
      },
      rewards: {
        xp: 15,
        gold: 0,
        items: [{ itemId: 'snake_venom', quantity: 1, chance: 0.4 }],
      },
      tags: ['wildlife', 'easy', 'avoidable', 'poison'],
    },

    // Night Coyotes - More aggressive at night
    {
      id: 'dusty_trail_night_coyotes',
      name: 'Prowling Coyotes',
      type: 'wildlife',
      weight: 25,
      description:
        'Glowing eyes surround you in the darkness. The coyotes are bolder at night.',
      enemies: [
        { enemyId: 'desert_wolf', count: 3, levelScale: 0.9 },
        { enemyId: 'desert_wolf', count: 1, levelScale: 1.0 },
      ],
      conditions: {
        timeOfDay: ['night'],
      },
      rewards: {
        xp: 35,
        gold: 0,
        items: [{ itemId: 'wolf_pelt', quantity: 2, chance: 0.25 }],
      },
      tags: ['wildlife', 'easy', 'night'],
    },
  ],

  events: [
    // Abandoned Wagon (50% through route)
    {
      id: 'dusty_trail_abandoned_wagon',
      name: 'Abandoned Wagon',
      description:
        'An overturned wagon lies beside the trail, its contents scattered across the dirt. Fresh tracks lead away into the brush, but there is no sign of the driver. A torn journal page flutters in the wind.',
      triggerType: 'distance',
      triggerValue: 0.5, // 50% through route
      repeatable: false,
      effects: [
        { type: 'set_flag', target: 'found_prospector_wagon' },
        { type: 'give_item', target: 'prospector_journal_page', value: 1 },
        { type: 'give_item', target: 'bandages', value: 2 },
        { type: 'give_item', target: 'canned_beans', value: 3 },
      ],
      tags: ['lore', 'loot', 'story', 'prospector_mystery'],
    },

    // Campsite Remains (75% through route)
    {
      id: 'dusty_trail_campsite_remains',
      name: 'Old Campsite',
      description:
        'The remains of a campfire mark where previous travelers rested. The ashes are cold, but the site is sheltered from the wind. You might find some useful supplies left behind.',
      triggerType: 'distance',
      triggerValue: 0.75, // 75% through route
      repeatable: true,
      effects: [
        { type: 'give_item', target: 'firewood', value: 2 },
        { type: 'give_item', target: 'water_canteen', value: 1 },
      ],
      tags: ['rest', 'loot', 'campsite'],
    },

    // First Time Tutorial Message
    {
      id: 'dusty_trail_tutorial_provisions',
      name: 'Trail Wisdom',
      description:
        'As you walk, you notice your provisions depleting. The old-timers always said: "A wise traveler stocks up before leaving town." You should manage your supplies carefully on longer journeys.',
      triggerType: 'first_visit',
      repeatable: false,
      effects: [{ type: 'set_flag', target: 'tutorial_provisions_shown' }],
      tags: ['tutorial', 'tips'],
    },

    // Random Traveler (10% chance)
    {
      id: 'dusty_trail_traveling_merchant',
      name: 'Traveling Peddler',
      description:
        'A hunched figure approaches with a mule laden with goods. "Supplies, friend? Fair prices for weary travelers!"',
      triggerType: 'random',
      triggerValue: 0.1, // 10% chance
      repeatable: true,
      dialogueTreeId: 'traveling_peddler_basic',
      effects: [],
      tags: ['merchant', 'random'],
    },
  ],

  landmarks: [
    // Old Windmill
    {
      id: 'dusty_trail_old_windmill',
      name: 'Old Windmill',
      type: 'ruins',
      description:
        'A decrepit windmill stands against the sky, its blades long since broken. Local legend says a prospector used it as a landmark before the gold rush.',
      position: 0.25,
      startDiscovered: true,
      canRest: false,
      restQuality: 0.5,
      resources: [],
      containers: [
        {
          id: 'windmill_chest',
          lootTableId: 'common_supplies',
          locked: false,
        },
      ],
      npcIds: [],
      questIds: [],
      lore: 'Built by the Harmon family in 1847, abandoned after the well ran dry.',
      tags: ['historic', 'ruins'],
    },

    // Dried Riverbed
    {
      id: 'dusty_trail_dried_riverbed',
      name: 'Dried Riverbed',
      type: 'crossroads',
      description:
        'A wide, cracked riverbed cuts across the trail. In spring, they say the water runs swift and cold. Now it is just dust and memories.',
      position: 0.4,
      startDiscovered: true,
      canRest: true,
      restQuality: 0.7,
      resources: [{ type: 'water', quantity: 1, respawnHours: 48 }], // Dig for water
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'The Iron Creek used to flow here before the mining operations upstream diverted the water.',
      tags: ['nature', 'water'],
    },

    // Rock Formation (The Sentinel)
    {
      id: 'dusty_trail_sentinel_rock',
      name: 'The Sentinel',
      type: 'monument',
      description:
        'A towering rock formation shaped vaguely like a cloaked figure watching over the trail. Travelers have carved their initials into its base for decades.',
      position: 0.65,
      startDiscovered: true,
      canRest: true,
      restQuality: 0.8,
      resources: [],
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'Native peoples called this place "The Watcher." They said it protects travelers who show respect.',
      tags: ['nature', 'historic', 'scenic'],
    },

    // View of Iron Gulch
    {
      id: 'dusty_trail_gulch_overlook',
      name: 'Gulch Overlook',
      type: 'overlook',
      description:
        'From this rise, you can see Iron Gulch spread out in the valley below. Smoke rises from the smelters, and the distant clang of pickaxes carries on the wind.',
      position: 0.9,
      startDiscovered: false,
      canRest: false,
      restQuality: 1.0,
      resources: [],
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'First glimpse of civilization for many hopeful prospectors. Some turned back here, daunted by the industrial sprawl.',
      tags: ['scenic', 'destination'],
    },
  ],

  travelMethods: [
    { method: 'walk', available: true, speedModifier: 1, cost: 0 },
    { method: 'horse', available: true, speedModifier: 1.5, cost: 0 },
    { method: 'stagecoach', available: true, speedModifier: 2, cost: 5 },
  ],

  weatherPatterns: [
    { type: 'clear', probability: 0.6 },
    { type: 'sandstorm', probability: 0.1 },
    { type: 'fog', probability: 0.1, seasonRestriction: ['fall', 'winter'] },
  ],

  waypoints: [
    { x: 0, z: 0 }, // Frontier's Edge
    { x: 50, z: 25 },
    { x: 100, z: 30 }, // Windmill
    { x: 160, z: 45 }, // Riverbed
    { x: 220, z: 60 }, // Sentinel
    { x: 280, z: 80 }, // Overlook
    { x: 320, z: 100 }, // Iron Gulch
  ],

  lore: 'The Dusty Trail has connected the frontier settlements since before the gold rush. Once a Native American trade route, it now sees miners, merchants, and drifters seeking fortune in Iron Gulch. Despite its proximity to civilization, the trail is not without danger - desperate men and hungry predators still claim the unwary.',

  tags: ['tutorial', 'main_route', 'act1'],
};
