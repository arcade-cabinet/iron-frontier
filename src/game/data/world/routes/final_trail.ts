/**
 * Final Trail - Route 5: Mesa Point/Coldwater to Salvation
 *
 * The ultimate route leading to the endgame town of Salvation.
 * Can be accessed from either Mesa Point or Coldwater.
 * Features the hardest encounters, corrupted enemies, and narrative climax setup.
 *
 * Travel Time: 30 game-minutes (~15 real minutes)
 * Difficulty: Hard to Very Hard
 */

import type { Route } from '../routeSchema';

export const FinalTrail: Route = {
  id: 'final_trail',
  name: 'The Final Trail',
  description:
    'The road to Salvation is paved with danger. This treacherous path crosses every terrain the frontier has to offer - desert, badlands, mountains, and something worse. Strange mechanical creatures roam the wastelands, and the wildlife has been twisted by forces unknown. Only the brave or the desperate travel this road.',
  fromTown: 'mesa_point', // Can also be reached from Coldwater via branch
  toTown: 'salvation',
  terrain: 'badlands',
  secondaryTerrain: 'mountains',
  length: 30, // game-minutes
  condition: 'dangerous',
  dangerLevel: 8,
  bidirectional: true,
  passable: true,
  encounterFrequency: 1.5, // High encounter rate

  unlockCondition: {
    type: 'flag',
    target: 'act3_unlocked',
  },

  encounters: [
    // Elite Bandits - 30% weight (Hard)
    {
      id: 'final_trail_elite_bandits',
      name: 'Desperado Gang',
      type: 'ambush',
      weight: 30,
      description:
        'These are not common road thugs - they are hardened killers, veterans of a dozen battles. Their leader wears the star of a murdered lawman, and their eyes hold nothing but murder.',
      enemies: [
        { enemyId: 'desperado_gunslinger', count: 2, levelScale: 1.1 },
        { enemyId: 'desperado_sharpshooter', count: 1, levelScale: 1.0 },
        { enemyId: 'desperado_leader', count: 1, levelScale: 1.2 },
      ],
      conditions: {
        minLevel: 5,
      },
      rewards: {
        xp: 150,
        gold: 80,
        items: [
          { itemId: 'elite_revolver', quantity: 1, chance: 0.2 },
          { itemId: 'rifle_ammo', quantity: 20, chance: 0.8 },
          { itemId: 'superior_bandages', quantity: 2, chance: 0.5 },
          { itemId: 'lawman_star', quantity: 1, chance: 0.1 },
        ],
      },
      tags: ['bandit', 'hard', 'elite', 'human'],
    },

    // Corrupted Wildlife - 25% weight (Hard)
    {
      id: 'final_trail_corrupted_wildlife',
      name: 'Twisted Beasts',
      type: 'wildlife',
      weight: 25,
      description:
        'The animals here are wrong. Their eyes glow with an unnatural light, their movements are jerky and mechanical, and their cries sound like grinding gears. Something has corrupted them.',
      enemies: [
        { enemyId: 'corrupted_wolf', count: 3, levelScale: 1.1 },
        { enemyId: 'corrupted_bear', count: 1, levelScale: 1.0 },
      ],
      conditions: {
        minLevel: 5,
      },
      rewards: {
        xp: 120,
        gold: 0,
        items: [
          { itemId: 'corrupted_pelt', quantity: 2, chance: 0.4 },
          { itemId: 'strange_gland', quantity: 1, chance: 0.3 },
          { itemId: 'mysterious_ore', quantity: 1, chance: 0.2 },
        ],
      },
      tags: ['wildlife', 'hard', 'corrupted', 'supernatural'],
    },

    // Mechanical Horrors - 20% weight (Hard, steampunk enemies)
    {
      id: 'final_trail_mechanical_horrors',
      name: 'Rogue Automatons',
      type: 'combat',
      weight: 20,
      description:
        'Metal creatures emerge from the twisted landscape - impossible machines of brass and iron, their gears grinding and steam hissing. They move with deadly purpose, red lights blazing where eyes should be.',
      enemies: [
        { enemyId: 'remnant_sentry', count: 2, levelScale: 1.1 },
        { enemyId: 'remnant_scout', count: 2, levelScale: 1.0 },
      ],
      conditions: {
        minLevel: 5,
      },
      rewards: {
        xp: 130,
        gold: 25,
        items: [
          { itemId: 'scrap_metal', quantity: 5, chance: 0.7 },
          { itemId: 'automaton_core', quantity: 1, chance: 0.15 },
          { itemId: 'oil_can', quantity: 2, chance: 0.5 },
          { itemId: 'strange_blueprint', quantity: 1, chance: 0.1 },
        ],
      },
      tags: ['automaton', 'hard', 'steampunk', 'remnant'],
    },

    // Environmental Hazards - 20% weight (Various)
    {
      id: 'final_trail_hazards',
      name: 'Deadly Terrain',
      type: 'event',
      weight: 20,
      description:
        'The land itself seems to fight against you. Sudden chasms open, poison gas seeps from fissures, and the ground trembles with underground activity.',
      enemies: [], // No combat - environmental
      rewards: {
        xp: 20,
        gold: 0,
        items: [],
      },
      tags: ['environmental', 'no_combat', 'damage', 'fatigue'],
    },

    // Juggernaut Automaton - Rare, very dangerous
    {
      id: 'final_trail_juggernaut',
      name: 'Mechanical Titan',
      type: 'combat',
      weight: 10,
      description:
        'The ground shakes with each step. A massive war machine lumbers into view, bristling with weapons and armored in plates of blackened steel. This is not some relic - it is a weapon of war, and it has found a target.',
      enemies: [
        { enemyId: 'remnant_juggernaut', count: 1, levelScale: 1.0 },
        { enemyId: 'remnant_sentry', count: 2, levelScale: 1.0 },
      ],
      conditions: {
        minLevel: 6,
      },
      rewards: {
        xp: 200,
        gold: 50,
        items: [
          { itemId: 'automaton_core', quantity: 2, chance: 0.5 },
          { itemId: 'rare_blueprint', quantity: 1, chance: 0.25 },
          { itemId: 'juggernaut_plating', quantity: 1, chance: 0.3 },
        ],
      },
      tags: ['automaton', 'very_hard', 'mini_boss', 'rare'],
    },

    // Cultist Patrol
    {
      id: 'final_trail_cultists',
      name: 'Salvation Cultists',
      type: 'combat',
      weight: 15,
      description:
        'Robed figures block the path, their faces hidden beneath cowls. "Turn back, sinner," their leader intones. "Salvation is not for the likes of you." Their hands reach for hidden weapons.',
      enemies: [
        { enemyId: 'cultist_acolyte', count: 3, levelScale: 1.0 },
        { enemyId: 'cultist_zealot', count: 1, levelScale: 1.1 },
      ],
      conditions: {
        minLevel: 5,
      },
      rewards: {
        xp: 100,
        gold: 30,
        items: [
          { itemId: 'cultist_robe', quantity: 1, chance: 0.3 },
          { itemId: 'salvation_pamphlet', quantity: 1, chance: 0.5 },
          { itemId: 'strange_elixir', quantity: 1, chance: 0.2 },
        ],
      },
      tags: ['human', 'hard', 'cultist', 'salvation'],
    },

    // Night Horror - Very Hard
    {
      id: 'final_trail_night_horror',
      name: 'The Thing in the Dark',
      type: 'ambush',
      weight: 15,
      description:
        'Something massive moves in the darkness. You catch glimpses of metal and flesh fused together, of too many eyes and too many limbs. Whatever it was, it is neither machine nor animal now.',
      enemies: [
        { enemyId: 'fusion_horror', count: 1, levelScale: 1.2 },
      ],
      conditions: {
        timeOfDay: ['night'],
        minLevel: 6,
      },
      rewards: {
        xp: 180,
        gold: 0,
        items: [
          { itemId: 'horror_trophy', quantity: 1, chance: 0.5 },
          { itemId: 'corrupted_core', quantity: 1, chance: 0.4 },
        ],
      },
      tags: ['supernatural', 'very_hard', 'boss', 'night', 'horror'],
    },
  ],

  events: [
    // Point of No Return Warning (10% distance)
    {
      id: 'final_trail_warning',
      name: 'Point of No Return',
      description:
        'A weathered signpost stands at a crossroads. One arrow points back the way you came, labeled with familiar town names. The other points forward into darkness, bearing only a single word: "SALVATION." Below it, someone has carved: "TURN BACK. THERE IS NOTHING BUT DEATH AHEAD." You sense that continuing will change everything.',
      triggerType: 'distance',
      triggerValue: 0.1,
      repeatable: false,
      effects: [
        { type: 'set_flag', target: 'passed_point_of_no_return' },
      ],
      tags: ['warning', 'checkpoint', 'save_prompt'],
    },

    // Ally Meetup (50% distance, conditional)
    {
      id: 'final_trail_ally_meetup',
      name: 'Unexpected Ally',
      description:
        'A familiar figure emerges from cover - an ally you helped during your journey. "Heard you were headed to Salvation. You will need backup. Mind if I tag along?"',
      triggerType: 'flag',
      flagName: 'recruited_companion',
      repeatable: false,
      dialogueTreeId: 'ally_reunion_final_trail',
      effects: [
        { type: 'set_flag', target: 'ally_joined_final_push' },
      ],
      tags: ['ally', 'companion', 'narrative'],
    },

    // Final Camp (80% distance)
    {
      id: 'final_trail_last_camp',
      name: 'The Last Camp',
      description:
        'A sheltered alcove offers a final chance to rest before the final stretch to Salvation. The church spire is visible on the horizon, and an unnatural light glows from within the town. This may be your last peaceful moment.',
      triggerType: 'distance',
      triggerValue: 0.8,
      repeatable: true,
      effects: [
        { type: 'set_flag', target: 'visited_last_camp' },
      ],
      tags: ['rest', 'checkpoint', 'last_chance'],
    },

    // Dying Cultist - Exposition
    {
      id: 'final_trail_dying_cultist',
      name: 'The Apostate',
      description:
        'A robed figure lies bleeding against a rock, cast out from Salvation. "I saw what they are building," he rasps. "The Preacher... he found something in the old mines. Something that should have stayed buried. The machines, the corruption... it all comes from that thing." He presses a key into your hand before the light leaves his eyes.',
      triggerType: 'distance',
      triggerValue: 0.3,
      repeatable: false,
      effects: [
        { type: 'set_flag', target: 'learned_salvation_truth' },
        { type: 'give_item', target: 'old_mine_key', value: 1 },
      ],
      tags: ['lore', 'exposition', 'quest', 'key_item'],
    },

    // Mechanical Graveyard
    {
      id: 'final_trail_mech_graveyard',
      name: 'The Machine Graveyard',
      description:
        'You come upon a field of destroyed automatons - hundreds of them, torn apart and scattered across the blasted landscape. Some are ancient, rusted hulks. Others look freshly destroyed. Whatever killed them, it was powerful beyond measure.',
      triggerType: 'distance',
      triggerValue: 0.55,
      repeatable: false,
      effects: [
        { type: 'set_flag', target: 'visited_machine_graveyard' },
      ],
      tags: ['lore', 'atmospheric', 'mystery'],
    },

    // Vision of the Past
    {
      id: 'final_trail_vision',
      name: 'Echoes of Catastrophe',
      description:
        'The air shimmers, and for a moment you see the land as it once was - green and fertile, with a thriving settlement where Salvation now stands. Then fire rains from the sky. Machines march. People scream. The vision fades, leaving you shaken.',
      triggerType: 'random',
      triggerValue: 0.2,
      repeatable: false,
      effects: [
        { type: 'set_flag', target: 'saw_apocalypse_vision' },
      ],
      tags: ['supernatural', 'lore', 'revelation'],
    },

    // Coldwater Junction (alternate entrance)
    {
      id: 'final_trail_coldwater_junction',
      name: 'Coldwater Junction',
      description:
        'A path branches off toward Coldwater. Travelers from both Mesa Point and Coldwater converge here before the final approach to Salvation.',
      triggerType: 'distance',
      triggerValue: 0.15,
      repeatable: true,
      effects: [
        { type: 'set_flag', target: 'visited_coldwater_junction' },
      ],
      tags: ['junction', 'navigation'],
    },
  ],

  landmarks: [
    // Warning Signs
    {
      id: 'final_trail_signpost',
      name: 'The Last Signpost',
      type: 'crossroads',
      description:
        'A weathered signpost marking the point of no return. Travelers have left tokens and prayers here - some for luck, others as memorials to those who did not return.',
      position: 0.1,
      startDiscovered: true,
      canRest: true,
      restQuality: 0.8,
      resources: [],
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'The signpost has stood for decades. Hundreds of names are carved into its base, some crossed out, others with dates of death.',
      tags: ['checkpoint', 'memorial'],
    },

    // Mechanical Debris Field
    {
      id: 'final_trail_debris_field',
      name: 'The Scattered Remains',
      type: 'wreckage',
      description:
        'A vast field of mechanical debris - gears, pistons, shattered armor plating, and things less identifiable. Some of it is clearly automaton. Some of it looks disturbingly organic.',
      position: 0.35,
      startDiscovered: false,
      canRest: false,
      restQuality: 0.3,
      resources: [
        { type: 'ore', quantity: 8, respawnHours: 168 },
      ],
      containers: [
        {
          id: 'debris_cache',
          lootTableId: 'automaton_rare',
          locked: false,
        },
      ],
      npcIds: [],
      questIds: [],
      lore: 'Some great battle was fought here long ago. Or perhaps not so long ago - some of the wreckage still sparks with residual power.',
      tags: ['scavenge', 'automaton', 'battlefield'],
    },

    // Machine Graveyard
    {
      id: 'final_trail_machine_graveyard',
      name: 'Machine Graveyard',
      type: 'grave',
      description:
        'Row upon row of destroyed automatons, arranged with unnerving precision. Someone - or something - has been collecting the fallen machines and bringing them here.',
      position: 0.55,
      startDiscovered: false,
      canRest: false,
      restQuality: 0.2,
      resources: [],
      containers: [
        {
          id: 'graveyard_core_pile',
          lootTableId: 'automaton_cores',
          locked: false,
        },
      ],
      npcIds: [],
      questIds: ['machine_graveyard_mystery'],
      lore: 'The machines are arranged in concentric circles around a central depression. At the center lies a single human skeleton, its hands clasped as if in prayer.',
      tags: ['mystery', 'eerie', 'important'],
    },

    // The Last Camp
    {
      id: 'final_trail_last_camp_landmark',
      name: 'Final Rest',
      type: 'camp',
      description:
        'A natural alcove offering shelter from the elements. Previous travelers have left supplies here, knowing they may not return. A tradition of hope in hopeless times.',
      position: 0.8,
      startDiscovered: false,
      canRest: true,
      restQuality: 1.5, // Excellent rest before final push
      resources: [
        { type: 'water', quantity: 5, respawnHours: 0 },
        { type: 'food', quantity: 5, respawnHours: 72 },
      ],
      containers: [
        {
          id: 'camp_supply_cache',
          lootTableId: 'survival_supplies',
          locked: false,
        },
        {
          id: 'camp_weapon_cache',
          lootTableId: 'quality_weapons',
          locked: true,
          lockDifficulty: 40,
        },
      ],
      npcIds: [],
      questIds: [],
      lore: 'Names are carved into the rock walls - travelers who passed through. Some are recent. Many have no return date.',
      tags: ['camp', 'rest', 'last_chance', 'tradition'],
    },

    // Church Spire View
    {
      id: 'final_trail_salvation_view',
      name: 'First Sight of Salvation',
      type: 'overlook',
      description:
        'From this ridge, you see Salvation for the first time. The town clusters around a massive church, its spire reaching impossibly high. An unnatural light pulses from within, and even from this distance you can hear the grinding of vast machinery.',
      position: 0.9,
      startDiscovered: false,
      canRest: false,
      restQuality: 0.5,
      resources: [],
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'The church was built on the site of an ancient mine. What the early settlers found in those depths changed everything - and sealed the fate of all who came after.',
      tags: ['scenic', 'destination', 'revelation', 'important'],
    },

    // Coldwater Junction
    {
      id: 'final_trail_coldwater_junction_landmark',
      name: 'Coldwater Junction',
      type: 'crossroads',
      description:
        'A trail marker where the paths from Mesa Point and Coldwater converge. Both routes are equally dangerous from this point.',
      position: 0.15,
      startDiscovered: true,
      canRest: true,
      restQuality: 0.9,
      resources: [],
      containers: [],
      npcIds: [],
      questIds: [],
      lore: 'Travelers from both towns meet here to share information about conditions ahead. Some pool their resources for safety.',
      tags: ['junction', 'social'],
    },
  ],

  travelMethods: [
    { method: 'walk', available: true, speedModifier: 0.7, cost: 0 }, // Very difficult terrain
    { method: 'horse', available: true, speedModifier: 1.0, cost: 0 }, // Horses are spooked
    { method: 'stagecoach', available: false, speedModifier: 1, cost: 0 }, // Impossible
  ],

  weatherPatterns: [
    { type: 'clear', probability: 0.2 },
    { type: 'sandstorm', probability: 0.2 },
    { type: 'fog', probability: 0.2 },
    { type: 'storm', probability: 0.3 },
  ],

  waypoints: [
    { x: 650, z: 350 }, // Mesa Point
    { x: 680, z: 400 }, // Junction
    { x: 720, z: 450 }, // Signpost
    { x: 770, z: 510 }, // Dying Cultist area
    { x: 830, z: 560 }, // Debris Field
    { x: 880, z: 600 }, // Ally meetup
    { x: 930, z: 650 }, // Machine Graveyard
    { x: 970, z: 710 }, // Last Camp
    { x: 1000, z: 760 }, // Salvation View
    { x: 1020, z: 800 }, // Salvation
  ],

  lore: 'The Final Trail leads to Salvation - but salvation from what? The town was founded by a mysterious preacher who claimed to have found evidence of divine intervention in the old mines. Now the town glows with unholy light, its citizens speak of transcendence through machinery, and none who enter ever seem to leave. This road is a one-way journey into the heart of the frontier\'s darkest secret.',

  tags: ['endgame', 'final_act', 'boss_route', 'act3', 'point_of_no_return'],
};
