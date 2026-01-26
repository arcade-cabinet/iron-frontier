/**
 * Mountain Road - Route 3: Iron Gulch to Coldwater
 *
 * A scenic but challenging route through mountain passes and pine forests.
 * Leads to the ranching community of Coldwater.
 * Features wildlife encounters, an abandoned mine, and beautiful vistas.
 *
 * Travel Time: 25 game-minutes (~12.5 real minutes)
 * Difficulty: Medium
 */

import type { Route } from '../routeSchema';

export const MountainRoad: Route = {
  id: 'mountain_road',
  name: 'Mountain Road',
  description:
    'A winding road through the Iron Mountains, climbing through pine forests before descending into the green valleys of Coldwater. The air grows thin and cold, but the views are breathtaking. Wildlife rules these peaks.',
  fromTown: 'iron_gulch',
  toTown: 'coldwater',
  terrain: 'mountains',
  secondaryTerrain: 'forest',
  length: 25, // game-minutes
  condition: 'clear',
  dangerLevel: 5,
  bidirectional: true,
  passable: true,
  encounterFrequency: 1.0,

  encounters: [
    // Wolf Pack - 35% weight (Medium)
    {
      id: 'mountain_road_wolf_pack',
      name: 'Mountain Wolf Pack',
      type: 'wildlife',
      weight: 35,
      description:
        'A chorus of howls echoes through the pines. Grey shapes move between the trees - a pack of mountain wolves has found your scent.',
      enemies: [
        { enemyId: 'mountain_wolf', count: 3, levelScale: 1.0 },
        { enemyId: 'mountain_wolf', count: 1, levelScale: 1.1 }, // Alpha
      ],
      conditions: {
        timeOfDay: ['morning', 'evening', 'night'],
      },
      rewards: {
        xp: 55,
        gold: 0,
        items: [
          { itemId: 'wolf_pelt', quantity: 2, chance: 0.4 },
          { itemId: 'wolf_fang', quantity: 1, chance: 0.3 },
        ],
      },
      tags: ['wildlife', 'medium', 'pack'],
    },

    // Grizzly Bear - 20% weight (Hard, single powerful enemy)
    {
      id: 'mountain_road_bear',
      name: 'Grizzly Bear',
      type: 'wildlife',
      weight: 20,
      description:
        'A massive grizzly bear rises on its hind legs, towering above you. It has been surprised - and it is not happy. The beast lets out a thunderous roar that shakes your bones.',
      enemies: [{ enemyId: 'grizzly_bear', count: 1, levelScale: 1.0 }],
      conditions: {
        timeOfDay: ['morning', 'afternoon', 'evening'],
        minLevel: 3,
      },
      rewards: {
        xp: 80,
        gold: 0,
        items: [
          { itemId: 'bear_pelt', quantity: 1, chance: 0.5 },
          { itemId: 'bear_claw', quantity: 2, chance: 0.4 },
          { itemId: 'bear_meat', quantity: 3, chance: 0.6 },
        ],
      },
      tags: ['wildlife', 'hard', 'boss', 'single'],
    },

    // Mountain Bandits - 25% weight (Medium, better equipped)
    {
      id: 'mountain_road_bandits',
      name: 'Mountain Bandits',
      type: 'combat',
      weight: 25,
      description:
        'A fallen tree blocks the road - too convenient to be natural. Armed men emerge from the tree line, their clothing patched with animal furs.',
      enemies: [
        { enemyId: 'bandit_gunman', count: 2, levelScale: 1.0 },
        { enemyId: 'bandit_thug', count: 1, levelScale: 1.0 },
        { enemyId: 'mountain_bandit_leader', count: 1, levelScale: 1.0 },
      ],
      conditions: {
        minLevel: 2,
      },
      rewards: {
        xp: 70,
        gold: 35,
        items: [
          { itemId: 'revolver_ammo', quantity: 12, chance: 0.7 },
          { itemId: 'warm_coat', quantity: 1, chance: 0.2 },
          { itemId: 'hunting_rifle', quantity: 1, chance: 0.1 },
        ],
      },
      tags: ['bandit', 'medium', 'human', 'mountain'],
    },

    // Rockslide - 15% weight (Environmental hazard)
    {
      id: 'mountain_road_rockslide',
      name: 'Rockslide',
      type: 'event',
      weight: 15,
      description:
        'The rumble of falling rock fills the air. Boulders tumble down the mountainside toward you! You must move quickly or be crushed.',
      enemies: [], // No combat - handled as event
      rewards: {
        xp: 15,
        gold: 0,
        items: [],
      },
      tags: ['environmental', 'no_combat', 'damage'],
    },

    // Mountain Lion - Rare but deadly
    {
      id: 'mountain_road_mountain_lion',
      name: 'Mountain Lion Ambush',
      type: 'ambush',
      weight: 15,
      description:
        'A tawny blur launches from an overhead ledge. The mountain lion has been stalking you, and now it strikes!',
      enemies: [{ enemyId: 'mountain_lion', count: 1, levelScale: 1.1 }],
      conditions: {
        minLevel: 2,
      },
      rewards: {
        xp: 40,
        gold: 0,
        items: [
          { itemId: 'lion_pelt', quantity: 1, chance: 0.4 },
          { itemId: 'lion_fang', quantity: 1, chance: 0.3 },
        ],
      },
      tags: ['wildlife', 'medium', 'ambush', 'single'],
    },

    // Night Wolves - More aggressive at night
    {
      id: 'mountain_road_night_wolves',
      name: 'Nighttime Hunters',
      type: 'wildlife',
      weight: 30,
      description:
        'Glowing eyes ring your campfire. The wolves are hunting, and tonight you are the prey. Their howls coordinate the pack for the attack.',
      enemies: [
        { enemyId: 'mountain_wolf', count: 4, levelScale: 1.0 },
        { enemyId: 'dire_wolf', count: 1, levelScale: 1.0 }, // Alpha
      ],
      conditions: {
        timeOfDay: ['night'],
        minLevel: 3,
      },
      rewards: {
        xp: 75,
        gold: 0,
        items: [
          { itemId: 'wolf_pelt', quantity: 3, chance: 0.35 },
          { itemId: 'dire_wolf_pelt', quantity: 1, chance: 0.25 },
        ],
      },
      tags: ['wildlife', 'medium', 'night', 'pack'],
    },

    // Mother Bear with Cubs - Very dangerous
    {
      id: 'mountain_road_bear_family',
      name: 'Bear Mother',
      type: 'wildlife',
      weight: 10,
      description:
        'Two bear cubs tumble across the path ahead. Cute - until their mother emerges from the brush, massive and enraged at the threat to her young.',
      enemies: [
        { enemyId: 'grizzly_bear', count: 1, levelScale: 1.2 }, // Enraged mother
      ],
      conditions: {
        timeOfDay: ['morning', 'afternoon'],
        minLevel: 4,
        excludeIfFlag: 'winter_season', // Bears hibernate
      },
      rewards: {
        xp: 100,
        gold: 0,
        items: [
          { itemId: 'bear_pelt', quantity: 1, chance: 0.6 },
          { itemId: 'bear_claw', quantity: 3, chance: 0.5 },
        ],
      },
      tags: ['wildlife', 'hard', 'single', 'rare'],
    },
  ],

  events: [
    // Abandoned Mine Entrance (40% distance)
    {
      id: 'mountain_road_mine_entrance',
      name: 'The Old Ironside Mine',
      description:
        'A weathered sign marks the entrance to the Ironside Mine - one of the first claims in the territory. The shaft descends into darkness, but you can hear the echo of dripping water... and something else. Glittering ore veins are visible even from the entrance.',
      triggerType: 'distance',
      triggerValue: 0.4,
      repeatable: false,
      effects: [
        { type: 'set_flag', target: 'discovered_ironside_mine' },
        { type: 'discovery', target: 'ironside_mine_dungeon' },
      ],
      tags: ['dungeon', 'discovery', 'mine', 'lore'],
    },

    // Mountain Overlook (70% distance)
    {
      id: 'mountain_road_overlook',
      name: 'Eagle\'s Rest Overlook',
      description:
        'The trail opens onto a breathtaking vista. To the east, you can see the smoke of Iron Gulch rising from the valley floor. To the west, the green pastures of Coldwater spread like a quilt beneath snow-capped peaks. For a moment, the hardships of the frontier feel very far away.',
      triggerType: 'distance',
      triggerValue: 0.7,
      repeatable: true,
      effects: [
        { type: 'set_flag', target: 'visited_eagles_rest' },
      ],
      tags: ['scenic', 'lore', 'rest'],
    },

    // Injured Traveler
    {
      id: 'mountain_road_injured_traveler',
      name: 'Injured Traveler',
      description:
        'A man sits against a tree, clutching his leg. His horse lies dead nearby, victim of the rockslide. "Please," he gasps, "I cannot make it to Coldwater alone."',
      triggerType: 'random',
      triggerValue: 0.2,
      repeatable: false,
      dialogueTreeId: 'injured_traveler_mountain',
      effects: [{ type: 'set_flag', target: 'met_injured_traveler' }],
      tags: ['npc', 'choice', 'reputation'],
    },

    // Hermit Cabin Discovery
    {
      id: 'mountain_road_hermit_cabin',
      name: 'The Hermit\'s Cabin',
      description:
        'Smoke rises from a small cabin nestled in a clearing. An old man sits on the porch, whittling. He watches you approach with wary but not unfriendly eyes.',
      triggerType: 'distance',
      triggerValue: 0.55,
      repeatable: true,
      dialogueTreeId: 'old_hermit_tom',
      effects: [{ type: 'set_flag', target: 'met_hermit_tom' }],
      tags: ['npc', 'rest', 'trade', 'lore'],
    },

    // Waterfall Rest Stop
    {
      id: 'mountain_road_waterfall',
      name: 'Crystal Falls',
      description:
        'A magnificent waterfall cascades down the cliff face, creating a rainbow in its mist. The pool at its base is crystal clear and ice cold. A perfect place to rest and refill your canteen.',
      triggerType: 'distance',
      triggerValue: 0.5,
      repeatable: true,
      effects: [
        { type: 'give_item', target: 'fresh_water', value: 5 },
      ],
      tags: ['water', 'rest', 'scenic'],
    },

    // Strange Tracks
    {
      id: 'mountain_road_strange_tracks',
      name: 'Strange Tracks',
      description:
        'Unusual tracks cross the path - too large for any animal you know. Whatever made them walked on two legs but was barefoot, and its stride was impossibly long.',
      triggerType: 'random',
      triggerValue: 0.15,
      repeatable: false,
      effects: [{ type: 'set_flag', target: 'seen_strange_tracks' }],
      tags: ['mystery', 'lore', 'supernatural'],
    },
  ],

  landmarks: [
    // Mine Entrance
    {
      id: 'mountain_road_ironside_mine',
      name: 'Ironside Mine',
      type: 'mine_entrance',
      description:
        'The abandoned Ironside Mine, once the richest claim in the territory. Strange noises echo from its depths, and locals say it is haunted by the ghosts of miners who died in the collapse of \'73.',
      position: 0.4,
      startDiscovered: false,
      canRest: false,
      restQuality: 0.4,
      resources: [
        { type: 'ore', quantity: 10, respawnHours: 168 },
      ],
      containers: [
        {
          id: 'mine_office_safe',
          lootTableId: 'valuable_ore',
          locked: true,
          lockDifficulty: 50,
        },
      ],
      npcIds: [],
      questIds: ['ironside_mine_mystery'],
      lore: 'Twenty-three men died when the main shaft collapsed. Their bodies were never recovered. Some say you can still hear them tapping on the walls, trying to find a way out.',
      tags: ['dungeon_entrance', 'haunted', 'mine'],
    },

    // Waterfall
    {
      id: 'mountain_road_crystal_falls',
      name: 'Crystal Falls',
      type: 'spring',
      description:
        'A stunning waterfall fed by snowmelt from the peaks above. The pool at its base is frigid but pure, and the spray catches the light in a permanent rainbow.',
      position: 0.5,
      startDiscovered: true,
      canRest: true,
      restQuality: 1.3,
      resources: [
        { type: 'water', quantity: 20, respawnHours: 0 }, // Unlimited
      ],
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'The Natives considered this place sacred. They would come here for spiritual cleansing before important journeys.',
      tags: ['water', 'rest', 'scenic', 'sacred'],
    },

    // Hermit Cabin
    {
      id: 'mountain_road_hermit_cabin',
      name: 'Tom\'s Cabin',
      type: 'camp',
      description:
        'A small but well-maintained cabin where Old Tom the Hermit has lived for thirty years. He trades in pelts and medicinal herbs, and knows more about these mountains than any living man.',
      position: 0.55,
      startDiscovered: false,
      canRest: true,
      restQuality: 1.2,
      resources: [
        { type: 'herbs', quantity: 3, respawnHours: 48 },
      ],
      containers: [],
      npcIds: ['hermit_tom'],
      questIds: ['hermits_request'],
      lore: 'Tom came to the mountains after the war, seeking solitude. He has outlived three wives and two generations of townsfolk.',
      tags: ['npc', 'trade', 'shelter'],
    },

    // Mountain Overlook
    {
      id: 'mountain_road_eagles_rest',
      name: 'Eagle\'s Rest',
      type: 'overlook',
      description:
        'The highest point on the mountain road, offering views of both Iron Gulch and Coldwater valleys. Eagles nest in the nearby crags, hence the name.',
      position: 0.7,
      startDiscovered: false,
      canRest: true,
      restQuality: 1.0,
      resources: [],
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'Surveyor James MacReady mapped the entire territory from this spot in 1851. His cairn of stones still marks the exact location.',
      tags: ['scenic', 'historic'],
    },

    // Pine Forest Campsite
    {
      id: 'mountain_road_pine_camp',
      name: 'Pinewood Camp',
      type: 'camp',
      description:
        'A clearing in the pines where travelers have camped for generations. Fire-blackened stones mark the central hearth, and the surrounding trees provide shelter from wind.',
      position: 0.85,
      startDiscovered: true,
      canRest: true,
      restQuality: 1.1,
      resources: [
        { type: 'wood', quantity: 10, respawnHours: 24 },
      ],
      containers: [
        {
          id: 'camp_cache',
          lootTableId: 'common_supplies',
          locked: false,
        },
      ],
      npcIds: [],
      questIds: [],
      lore: 'Carved into one of the ancient pines are the initials of hundreds of travelers, some dating back to before the territory was even named.',
      tags: ['camp', 'rest', 'historic'],
    },
  ],

  travelMethods: [
    { method: 'walk', available: true, speedModifier: 0.8, cost: 0 }, // Slower due to elevation
    { method: 'horse', available: true, speedModifier: 1.2, cost: 0 },
    { method: 'stagecoach', available: false, speedModifier: 1, cost: 0 }, // Road too narrow
  ],

  weatherPatterns: [
    { type: 'clear', probability: 0.4 },
    { type: 'rain', probability: 0.2 },
    { type: 'fog', probability: 0.15 },
    { type: 'storm', probability: 0.1 },
    { type: 'snow', probability: 0.15, seasonRestriction: ['fall', 'winter'] },
  ],

  waypoints: [
    { x: 320, z: 100 }, // Iron Gulch
    { x: 290, z: 130 },
    { x: 260, z: 170 }, // Beginning ascent
    { x: 240, z: 220 }, // Mine entrance
    { x: 220, z: 260 }, // Waterfall
    { x: 210, z: 300 }, // Hermit cabin
    { x: 200, z: 340 }, // Overlook
    { x: 180, z: 380 }, // Pine camp
    { x: 150, z: 420 }, // Coldwater
  ],

  lore: 'The Mountain Road was carved by prospectors seeking a shortcut to the rich valleys beyond the Iron Range. Many died in avalanches and bear attacks before the route was properly marked. Today it serves as the main artery between the mining communities and the ranching settlements, though wise travelers still respect the dangers of the high country.',

  tags: ['main_route', 'scenic', 'wildlife', 'act2'],
};
