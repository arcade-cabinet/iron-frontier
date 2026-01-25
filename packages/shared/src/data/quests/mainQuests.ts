/**
 * Iron Frontier - Main Quest Definitions
 *
 * The complete main quest arc spanning 3 acts with 10 quests.
 * Total estimated playtime: ~3 hours
 *
 * Act 1: The Saboteur (Frontier's Edge -> Iron Gulch) ~45 min
 * Act 2: The Conspiracy (Mesa Point / Coldwater) ~75 min
 * Act 3: Reckoning (Salvation) ~60 min
 */

import type { Quest } from '../schemas/quest';
import {
  FACTION_IDS,
  LOCATION_MARKERS,
  NPC_IDS,
  QUEST_ENEMY_IDS,
  QUEST_FLAGS,
  QUEST_ITEM_IDS,
  ROUTE_IDS,
  TOWN_IDS,
} from './questTypes';

// ============================================================================
// ACT 1: THE SABOTEUR
// ============================================================================

/**
 * MQ1: "A Stranger Arrives" - Tutorial Quest
 *
 * The player arrives in Frontier's Edge, learns basic mechanics,
 * and receives their first mission from the Sheriff.
 */
export const MQ1_AStrangerArrives: Quest = {
  id: 'mq1_stranger_arrives',
  title: 'A Stranger Arrives',
  description:
    "You've arrived at Frontier's Edge, a small frontier town at the edge of civilization. The Sheriff might have work for someone with your skills.",
  type: 'main',
  giverNpcId: null, // Auto-triggered on game start
  startLocationId: TOWN_IDS.FRONTIERS_EDGE,
  recommendedLevel: 1,
  tags: ['main', 'tutorial', 'act1'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: [],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_explore',
      title: 'Get Your Bearings',
      description: "Explore Frontier's Edge and familiarize yourself with the town.",
      onStartText:
        'The stagecoach has dropped you at the edge of town. Dust settles around your boots. This is Frontier\'s Edge - not much to look at, but it\'s a start.',
      onCompleteText:
        "You've gotten the lay of the land. The Sheriff's office is across the street - might be worth paying a visit.",
      objectives: [
        {
          id: 'obj_visit_saloon',
          description: 'Visit the saloon to hear local gossip',
          type: 'visit',
          target: LOCATION_MARKERS.FE_SALOON,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'The saloon is the heart of any frontier town.',
        },
        {
          id: 'obj_visit_store',
          description: 'Check out the general store',
          type: 'visit',
          target: LOCATION_MARKERS.FE_GENERAL_STORE,
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 10,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_sheriff',
      title: 'Meet the Sheriff',
      description: 'Talk to Sheriff Hank about potential work.',
      onStartText: "The Sheriff's office is a solid wooden building with iron bars on the windows.",
      onCompleteText:
        "Sheriff Hank looks you over with a weathered eye. 'We could use another gun around here. Pick up some supplies from Martha's store, on me. Then prove you can handle yourself.'",
      objectives: [
        {
          id: 'obj_talk_sheriff',
          description: 'Speak with Sheriff Hank',
          type: 'talk',
          target: NPC_IDS.SHERIFF_HANK,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.FRONTIERS_EDGE,
            markerLabel: "Sheriff's Office",
          },
        },
      ],
      stageRewards: {
        xp: 15,
        gold: 0,
        items: [],
        reputation: { [FACTION_IDS.LAW]: 5 },
      },
    },
    {
      id: 'stage_supplies',
      title: 'Gather Supplies',
      description: 'Collect supplies from the general store.',
      onStartText: "Martha's General Store has everything a traveler needs.",
      onCompleteText:
        "You're stocked up and ready. Now to show the Sheriff what you're made of.",
      objectives: [
        {
          id: 'obj_get_supplies',
          description: 'Collect supplies from Merchant Martha',
          type: 'talk',
          target: NPC_IDS.MERCHANT_MARTHA,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 10,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.STARTING_SUPPLIES, quantity: 1 }],
        reputation: {},
      },
    },
    {
      id: 'stage_combat_tutorial',
      title: 'Prove Yourself',
      description: 'Deal with the coyotes harassing travelers on the edge of town.',
      onStartText:
        "Coyotes have been getting bold lately, attacking travelers near town. Time to thin the pack.",
      onCompleteText:
        "The coyotes scatter. You've proven you can handle yourself in a fight. The Sheriff will be pleased.",
      objectives: [
        {
          id: 'obj_kill_coyotes',
          description: 'Defeat the coyotes (Tutorial Combat)',
          type: 'kill',
          target: QUEST_ENEMY_IDS.COYOTE,
          count: 3,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Check the outskirts of town near the trail.',
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_report',
      title: 'Report to the Sheriff',
      description: 'Return to Sheriff Hank and collect your reward.',
      onStartText: 'Time to report back to the Sheriff.',
      onCompleteText:
        "The Sheriff nods approvingly and hands you some coin. 'Not bad. Got a real job for you now, if you're interested. A prospector went missing out on Dusty Trail. Find out what happened to him.'",
      objectives: [
        {
          id: 'obj_report_sheriff',
          description: 'Report back to Sheriff Hank',
          type: 'talk',
          target: NPC_IDS.SHERIFF_HANK,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 15,
        gold: 20,
        items: [],
        reputation: { [FACTION_IDS.LAW]: 10 },
      },
    },
  ],

  rewards: {
    xp: 50,
    gold: 20,
    items: [{ itemId: 'revolver_basic', quantity: 1 }],
    reputation: { [FACTION_IDS.LAW]: 15, [FACTION_IDS.TOWNSFOLK]: 10 },
    unlocksQuests: ['mq2_missing_prospector'],
  },
};

/**
 * MQ2: "The Missing Prospector"
 *
 * The player investigates a missing prospector, finds clues pointing
 * toward Iron Gulch and the mining conspiracy.
 */
export const MQ2_TheMissingProspector: Quest = {
  id: 'mq2_missing_prospector',
  title: 'The Missing Prospector',
  description:
    "A prospector named Jed hasn't been seen in weeks. Sheriff Hank wants you to find out what happened to him.",
  type: 'main',
  giverNpcId: NPC_IDS.SHERIFF_HANK,
  startLocationId: TOWN_IDS.FRONTIERS_EDGE,
  recommendedLevel: 1,
  tags: ['main', 'investigation', 'act1'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq1_stranger_arrives'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_travel',
      title: 'Search Dusty Trail',
      description: "Head out on Dusty Trail where Jed was last seen.",
      onStartText:
        "Dusty Trail connects Frontier's Edge to Iron Gulch. Jed's claim was somewhere along the way.",
      onCompleteText:
        "You spot something off the trail - an abandoned wagon, half-hidden in the scrub.",
      objectives: [
        {
          id: 'obj_find_wagon',
          description: 'Find the abandoned wagon on Dusty Trail',
          type: 'visit',
          target: LOCATION_MARKERS.DT_ABANDONED_WAGON,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: ROUTE_IDS.DUSTY_TRAIL,
            markerLabel: 'Abandoned Wagon',
          },
        },
      ],
      stageRewards: {
        xp: 20,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_investigate',
      title: 'Investigate the Wagon',
      description: 'Search the abandoned wagon for clues about the prospector.',
      onStartText:
        "The wagon is damaged, its contents scattered. There are signs of a struggle.",
      onCompleteText:
        "You find Jed's journal hidden beneath a loose board. The last entry mentions strange men from Iron Gulch asking about his claim - and something about sabotage at the mine.",
      objectives: [
        {
          id: 'obj_search_wagon',
          description: 'Search the wagon for clues',
          type: 'interact',
          target: 'wagon_search',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_find_journal',
          description: "Find Jed's journal",
          type: 'collect',
          target: QUEST_ITEM_IDS.PROSPECTOR_JOURNAL,
          count: 1,
          current: 0,
          optional: false,
          hidden: true,
        },
      ],
      stageRewards: {
        xp: 30,
        gold: 5,
        items: [{ itemId: QUEST_ITEM_IDS.PROSPECTOR_JOURNAL, quantity: 1 }],
        reputation: {},
      },
    },
    {
      id: 'stage_encounter',
      title: 'Deal with Trouble',
      description: 'Someone wants to stop you from investigating.',
      onStartText: "You hear footsteps behind you. You're not alone out here.",
      onCompleteText:
        "The thugs are dealt with. They weren't common bandits - they had mining tools. Something bigger is going on in Iron Gulch.",
      objectives: [
        {
          id: 'obj_defeat_thugs',
          description: 'Defeat the mysterious attackers',
          type: 'kill',
          target: QUEST_ENEMY_IDS.SABOTEUR_THUG,
          count: 2,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 40,
        gold: 10,
        items: [],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 75,
    gold: 30,
    items: [],
    reputation: { [FACTION_IDS.LAW]: 15 },
    unlocksQuests: ['mq3_deep_trouble'],
  },
};

/**
 * MQ3: "Deep Trouble"
 *
 * The player arrives at Iron Gulch and investigates the mine sabotage,
 * meeting key NPCs and gathering evidence.
 */
export const MQ3_DeepTrouble: Quest = {
  id: 'mq3_deep_trouble',
  title: 'Deep Trouble',
  description:
    "Jed's journal mentioned sabotage at Iron Gulch. Time to find out what's really going on at the mine.",
  type: 'main',
  giverNpcId: null,
  startLocationId: TOWN_IDS.IRON_GULCH,
  recommendedLevel: 2,
  tags: ['main', 'investigation', 'act1', 'mining'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq2_missing_prospector'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_arrive',
      title: 'Arrive at Iron Gulch',
      description: 'Make your way to the mining town of Iron Gulch.',
      onStartText:
        "Iron Gulch sits in a narrow canyon, the mine entrance dominating the landscape. Smoke rises from the smelters day and night.",
      onCompleteText:
        'You\'ve arrived at Iron Gulch. The tension in the air is palpable - miners whisper and look over their shoulders.',
      objectives: [
        {
          id: 'obj_travel_gulch',
          description: 'Travel to Iron Gulch',
          type: 'visit',
          target: TOWN_IDS.IRON_GULCH,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.IRON_GULCH,
            markerLabel: 'Iron Gulch',
          },
        },
      ],
      stageRewards: {
        xp: 15,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_foreman',
      title: 'Meet Foreman Burke',
      description: 'The mine foreman might know about the sabotage.',
      onStartText:
        "Foreman Burke runs the day-to-day operations. He's a hard man, but fair by all accounts.",
      onCompleteText:
        "Burke confirms the sabotage - three collapses in the past month, all in the same section. He suspects someone on the inside, but can't prove anything. He grants you access to investigate.",
      objectives: [
        {
          id: 'obj_find_burke',
          description: 'Find Foreman Burke at the mine office',
          type: 'visit',
          target: LOCATION_MARKERS.IG_MINE_OFFICE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_talk_burke',
          description: 'Speak with Foreman Burke about the sabotage',
          type: 'talk',
          target: NPC_IDS.FOREMAN_BURKE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 20,
        gold: 0,
        items: [],
        reputation: { [FACTION_IDS.MINERS]: 10 },
      },
    },
    {
      id: 'stage_gather_evidence',
      title: 'Investigate the Mine',
      description: 'Search for evidence of sabotage inside the mine.',
      onStartText:
        "The mine is a labyrinth of tunnels and shafts. The sabotaged section has been sealed, but you might find clues elsewhere.",
      onCompleteText:
        "You find signs of deliberate weakening - support beams cut, not rotted. Someone wanted those tunnels to collapse. A piece of torn cloth caught on a nail might lead to the saboteur.",
      objectives: [
        {
          id: 'obj_enter_mine',
          description: 'Enter the mine',
          type: 'visit',
          target: LOCATION_MARKERS.IG_MINE_ENTRANCE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_find_evidence',
          description: 'Find evidence of sabotage',
          type: 'collect',
          target: QUEST_ITEM_IDS.MINE_SABOTAGE_EVIDENCE,
          count: 3,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Check near the collapsed sections.',
        },
      ],
      stageRewards: {
        xp: 35,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.MINE_SABOTAGE_EVIDENCE, quantity: 3 }],
        reputation: {},
      },
    },
    {
      id: 'stage_suspects',
      title: 'Question the Suspects',
      description:
        'Two miners have been acting suspicious - Silas and a newcomer named Vance.',
      onStartText:
        'Burke mentioned two miners who have been acting strange lately. Time to have a chat.',
      onCompleteText:
        "Silas seems nervous but genuine - he's been skimming supplies to feed his family, not sabotaging the mine. Vance, however, was nowhere to be found. Suspicious.",
      objectives: [
        {
          id: 'obj_talk_silas',
          description: 'Question Miner Silas',
          type: 'talk',
          target: NPC_IDS.MINER_SILAS,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_find_vance',
          description: 'Try to locate Vance',
          type: 'visit',
          target: LOCATION_MARKERS.IG_SALOON,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Check the saloon - miners drink there after shifts.',
        },
      ],
      stageRewards: {
        xp: 30,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 100,
    gold: 50,
    items: [],
    reputation: { [FACTION_IDS.MINERS]: 20 },
    unlocksQuests: ['mq4_engineers_secret'],
  },
};

/**
 * MQ4: "The Engineer's Secret"
 *
 * The player works with Engineer Clara, who reveals hints about
 * a larger conspiracy. Includes a trust choice that affects later events.
 */
export const MQ4_TheEngineersSecret: Quest = {
  id: 'mq4_engineers_secret',
  title: "The Engineer's Secret",
  description:
    "The mine's engineer, Clara, might know more than she's letting on. Gain her trust to learn the truth.",
  type: 'main',
  giverNpcId: NPC_IDS.FOREMAN_BURKE,
  startLocationId: TOWN_IDS.IRON_GULCH,
  recommendedLevel: 2,
  tags: ['main', 'investigation', 'act1', 'choice'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq3_deep_trouble'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_find_clara',
      title: 'Find Engineer Clara',
      description: 'Locate Clara in her workshop.',
      onStartText:
        "Clara runs the mine's machinery - steam engines, lifts, ventilation. If anyone knows the technical details of the sabotage, it's her.",
      onCompleteText:
        "Clara is hesitant at first, but when you show her the evidence, her expression changes. 'We need to talk. Somewhere private.'",
      objectives: [
        {
          id: 'obj_find_clara',
          description: "Find Clara's workshop",
          type: 'visit',
          target: LOCATION_MARKERS.IG_WORKSHOP,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_talk_clara',
          description: 'Speak with Engineer Clara',
          type: 'talk',
          target: NPC_IDS.ENGINEER_CLARA,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 20,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_help_clara',
      title: "Help Clara's Investigation",
      description: 'Clara needs help accessing sealed records.',
      onStartText:
        "Clara suspects the sabotage is connected to something bigger - maybe someone outside Iron Gulch. She needs access to the company records, but they're locked away.",
      onCompleteText:
        "The records reveal payments from an unknown source to someone in Iron Gulch. Clara's face pales. 'This goes higher than I thought.'",
      objectives: [
        {
          id: 'obj_distract_guard',
          description: 'Distract the office guard',
          type: 'talk',
          target: NPC_IDS.BARTENDER_PETE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'The bartender might help you get the guard away from his post.',
        },
        {
          id: 'obj_get_records',
          description: 'Help Clara access the company records',
          type: 'interact',
          target: 'company_records',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 35,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_trust_choice',
      title: "Clara's Revelation",
      description: 'Clara reveals what she knows. You must decide how much to trust her.',
      onStartText:
        "Clara has been investigating on her own for months. She's closer to the truth than anyone.",
      onCompleteText:
        "Clara hands you a small mechanical device. 'Take this. It might help you in the mine. The saboteur will try again soon - probably in the deep section. We need to catch them in the act.'",
      objectives: [
        {
          id: 'obj_trust_fully',
          description: 'Trust Clara completely and share all your evidence',
          type: 'talk',
          target: NPC_IDS.ENGINEER_CLARA,
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'Sharing everything might strengthen your alliance.',
        },
        {
          id: 'obj_remain_cautious',
          description: 'Remain cautious - share only partial information',
          type: 'talk',
          target: NPC_IDS.ENGINEER_CLARA,
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'You barely know her - caution might be wise.',
        },
      ],
      stageRewards: {
        xp: 40,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.CLARAS_GADGET, quantity: 1 }],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 100,
    gold: 0,
    items: [{ itemId: QUEST_ITEM_IDS.CLARAS_GADGET, quantity: 1 }],
    reputation: { [FACTION_IDS.MINERS]: 15 },
    unlocksQuests: ['mq5_confrontation'],
  },
};

/**
 * MQ5: "Confrontation" - Act 1 Climax
 *
 * The player confronts the saboteur in the mine and learns about
 * the larger conspiracy, leading to Act 2.
 */
export const MQ5_Confrontation: Quest = {
  id: 'mq5_confrontation',
  title: 'Confrontation',
  description:
    "The saboteur will strike again tonight. It's time to catch them in the act and end this.",
  type: 'main',
  giverNpcId: NPC_IDS.ENGINEER_CLARA,
  startLocationId: TOWN_IDS.IRON_GULCH,
  recommendedLevel: 3,
  tags: ['main', 'combat', 'act1', 'climax', 'boss'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq4_engineers_secret'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_prepare',
      title: 'Prepare for the Trap',
      description: 'Get ready for the confrontation.',
      onStartText:
        "Tonight is the night. You and Clara have a plan - catch the saboteur in the deep section of the mine.",
      onCompleteText:
        "You're as ready as you'll ever be. Time to head into the mine.",
      objectives: [
        {
          id: 'obj_get_supplies',
          description: 'Stock up on supplies for the confrontation',
          type: 'interact',
          target: 'general_store',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
        },
        {
          id: 'obj_meet_clara',
          description: 'Meet Clara at the mine entrance after dark',
          type: 'talk',
          target: NPC_IDS.ENGINEER_CLARA,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 15,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_trap',
      title: 'Spring the Trap',
      description: 'Catch the saboteur in the deep section of the mine.',
      onStartText:
        'The mine is eerie at night - only the distant drip of water and creak of timber. You wait in the darkness.',
      onCompleteText:
        "Movement in the shadows. It's Vance - and he's not alone. They're planting more explosives!",
      objectives: [
        {
          id: 'obj_enter_deep',
          description: 'Enter the deep section of the mine',
          type: 'visit',
          target: LOCATION_MARKERS.IG_MINE_DEEP_SECTION,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_wait',
          description: 'Wait for the saboteur to appear',
          type: 'interact',
          target: 'ambush_point',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_boss_fight',
      title: 'Defeat the Saboteur',
      description: "Confront Vance and his accomplices. This won't be easy.",
      onStartText:
        "Vance draws his weapon. 'You should have minded your own business, stranger. Now you'll be buried with the rest.'",
      onCompleteText:
        "Vance falls, clutching a letter in his hand. As he dies, he laughs. 'You think this ends here? This is bigger than Iron Gulch. Check Mesa Point... or Coldwater. Salvation awaits us all.'",
      objectives: [
        {
          id: 'obj_defeat_vance',
          description: 'Defeat Vance (Boss Fight)',
          type: 'kill',
          target: QUEST_ENEMY_IDS.MINE_BOSS_VANCE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_defeat_accomplices',
          description: 'Defeat the accomplices',
          type: 'kill',
          target: QUEST_ENEMY_IDS.SABOTEUR_THUG,
          count: 2,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 75,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_revelation',
      title: 'The Revelation',
      description: 'Search Vance for clues about the conspiracy.',
      onStartText: 'The letter in Vance\'s hand might hold answers.',
      onCompleteText:
        "The letter reveals a larger conspiracy - payments from someone called 'The Shepherd' and references to both Mesa Point and Coldwater. Whatever this is, Iron Gulch was just the beginning. The trail leads to either the outlaw town of Mesa Point or the ranching community of Coldwater.",
      objectives: [
        {
          id: 'obj_search_vance',
          description: "Search Vance's body",
          type: 'interact',
          target: 'vance_body',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_read_letter',
          description: 'Read the letter',
          type: 'collect',
          target: QUEST_ITEM_IDS.CONSPIRACY_DOCUMENTS,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 35,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.CONSPIRACY_DOCUMENTS, quantity: 1 }],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 200,
    gold: 100,
    items: [],
    reputation: { [FACTION_IDS.MINERS]: 30, [FACTION_IDS.LAW]: 20 },
    unlocksQuests: ['mq6a_honor_among_thieves', 'mq6b_ranchers_plight'],
  },
};

// ============================================================================
// ACT 2: THE CONSPIRACY
// ============================================================================

/**
 * MQ6a: "Honor Among Thieves" - Mesa Point Path
 *
 * The player infiltrates the outlaw community at Mesa Point to
 * uncover more about the conspiracy.
 */
export const MQ6A_HonorAmongThieves: Quest = {
  id: 'mq6a_honor_among_thieves',
  title: 'Honor Among Thieves',
  description:
    'The letter mentioned Mesa Point. The outlaws there might know something about this conspiracy.',
  type: 'main',
  giverNpcId: null,
  startLocationId: TOWN_IDS.MESA_POINT,
  recommendedLevel: 4,
  tags: ['main', 'infiltration', 'act2', 'outlaws', 'choice'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq5_confrontation'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_arrive_mesa',
      title: 'Enter Mesa Point',
      description: 'Make your way to the outlaw town of Mesa Point.',
      onStartText:
        'Mesa Point sits in a box canyon - one way in, one way out. Perfect for outlaws who want to see trouble coming.',
      onCompleteText:
        "The outlaws eye you warily. You'll need to earn their trust - or find another way to get information.",
      objectives: [
        {
          id: 'obj_travel_mesa',
          description: 'Travel to Mesa Point via Desert Pass',
          type: 'visit',
          target: TOWN_IDS.MESA_POINT,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.MESA_POINT,
            markerLabel: 'Mesa Point',
          },
        },
      ],
      stageRewards: {
        xp: 20,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_gain_trust',
      title: "Gain Reyna's Trust",
      description:
        "Red Eye Reyna runs Mesa Point. You'll need to prove yourself to her.",
      onStartText:
        'Reyna is a legend among outlaws - ruthless but fair. She might help if you have something to offer.',
      onCompleteText:
        "Reyna considers you. 'You've got guts, I'll give you that. But trust is earned around here. Do a job for me, and we'll talk.'",
      objectives: [
        {
          id: 'obj_find_reyna',
          description: "Find Reyna at the outlaws' hideout",
          type: 'visit',
          target: LOCATION_MARKERS.MP_HIDEOUT,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_talk_reyna',
          description: 'Speak with Red Eye Reyna',
          type: 'talk',
          target: NPC_IDS.REYNA_RED_EYE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_reynas_job',
      title: "Do Reyna's Job",
      description: "Reyna wants you to intercept a supply shipment. It's a test.",
      onStartText:
        "Reyna's test: hit a supply wagon heading through the pass. Non-lethal if possible - she's not cruel, just pragmatic.",
      onCompleteText:
        "The job is done. Reyna is impressed. 'You've got skills. Now, about that information you wanted...'",
      objectives: [
        {
          id: 'obj_intercept_wagon',
          description: 'Intercept the supply wagon on Desert Pass',
          type: 'visit',
          target: ROUTE_IDS.DESERT_PASS,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_defeat_guards',
          description: 'Deal with the guards (lethal or non-lethal)',
          type: 'kill',
          target: QUEST_ENEMY_IDS.OUTLAW_GRUNT,
          count: 3,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 50,
        gold: 40,
        items: [],
        reputation: { [FACTION_IDS.OUTLAWS]: 25 },
      },
    },
    {
      id: 'stage_choice',
      title: 'The Choice',
      description:
        'Reyna has information. But there\'s a price: betray the outlaws to the law, or work with them against the conspiracy.',
      onStartText:
        "Reyna knows about 'The Shepherd' and the conspiracy. She'll share everything - if you help her strike back against whoever is behind this. Or you could report everything to the law...",
      onCompleteText:
        "Your choice is made. Either way, you now have documents proving a connection between the conspiracy and Salvation - a town controlled by a preacher named Solomon.",
      objectives: [
        {
          id: 'obj_betray_outlaws',
          description: 'Betray the outlaws to gain evidence (lose outlaw trust)',
          type: 'talk',
          target: NPC_IDS.REYNA_RED_EYE,
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
        },
        {
          id: 'obj_join_outlaws',
          description: 'Work with the outlaws temporarily (gain outlaw trust)',
          type: 'talk',
          target: NPC_IDS.REYNA_RED_EYE,
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 60,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.CONSPIRACY_DOCUMENTS, quantity: 1 }],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 175,
    gold: 50,
    items: [{ itemId: QUEST_ITEM_IDS.OUTLAW_LEDGER, quantity: 1 }],
    reputation: {}, // Varies based on choice
    unlocksQuests: ['mq7_pieces_of_puzzle'],
  },
};

/**
 * MQ6b: "The Rancher's Plight" - Coldwater Path
 *
 * The player helps a rancher deal with rustlers and discovers
 * a connection to the conspiracy through The Wanderer.
 */
export const MQ6B_TheRanchersPlight: Quest = {
  id: 'mq6b_ranchers_plight',
  title: "The Rancher's Plight",
  description:
    'The letter also mentioned Coldwater. The ranchers there are having trouble - trouble that might be connected to the conspiracy.',
  type: 'main',
  giverNpcId: null,
  startLocationId: TOWN_IDS.COLDWATER,
  recommendedLevel: 4,
  tags: ['main', 'investigation', 'act2', 'ranching'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq5_confrontation'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_arrive_coldwater',
      title: 'Arrive at Coldwater',
      description: 'Travel to the ranching community of Coldwater.',
      onStartText:
        'Coldwater is pastoral and peaceful - or it was. The ranchers have been losing cattle and tempers are running high.',
      onCompleteText:
        "The ranchers are on edge. Rancher McGraw, the community leader, might know what's going on.",
      objectives: [
        {
          id: 'obj_travel_coldwater',
          description: 'Travel to Coldwater via Mountain Road',
          type: 'visit',
          target: TOWN_IDS.COLDWATER,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.COLDWATER,
            markerLabel: 'Coldwater',
          },
        },
      ],
      stageRewards: {
        xp: 20,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_meet_mcgraw',
      title: 'Meet Rancher McGraw',
      description: 'Find out what troubles the ranchers.',
      onStartText:
        'McGraw is a weathered man who has worked this land his whole life. He looks tired.',
      onCompleteText:
        "McGraw tells you about the rustlers - they're organized, professional, and always one step ahead. He suspects someone is feeding them information.",
      objectives: [
        {
          id: 'obj_find_mcgraw',
          description: 'Find Rancher McGraw at the ranch house',
          type: 'visit',
          target: LOCATION_MARKERS.CW_RANCH_HOUSE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_talk_mcgraw',
          description: 'Speak with Rancher McGraw',
          type: 'talk',
          target: NPC_IDS.RANCHER_MCGRAW,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 0,
        items: [],
        reputation: { [FACTION_IDS.RANCHERS]: 10 },
      },
    },
    {
      id: 'stage_track_rustlers',
      title: 'Track the Rustlers',
      description: 'Follow the trail and find where the rustlers are taking the cattle.',
      onStartText:
        'Fresh tracks lead into the badlands. The rustlers have a camp somewhere out there.',
      onCompleteText:
        "You've found the rustler camp - and they're connected to the same conspiracy. They have documents with that same symbol.",
      objectives: [
        {
          id: 'obj_search_pasture',
          description: 'Search the pasture for tracks',
          type: 'visit',
          target: LOCATION_MARKERS.CW_PASTURE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_follow_tracks',
          description: 'Follow the rustler tracks',
          type: 'visit',
          target: ROUTE_IDS.BADLANDS_TRAIL,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_defeat_rustlers',
          description: 'Defeat the rustlers',
          type: 'kill',
          target: QUEST_ENEMY_IDS.RUSTLER,
          count: 4,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 60,
        gold: 30,
        items: [{ itemId: QUEST_ITEM_IDS.RUSTLER_EVIDENCE, quantity: 1 }],
        reputation: { [FACTION_IDS.RANCHERS]: 20 },
      },
    },
    {
      id: 'stage_wanderer',
      title: 'The Wanderer Knows',
      description:
        "There's a mysterious traveler camped outside town who might know more.",
      onStartText:
        'The Wanderer has been watching the frontier for years. They see things others miss.',
      onCompleteText:
        "The Wanderer reveals more than expected - they've been tracking the conspiracy for years. 'It all leads to Salvation,' they say. 'To a man who calls himself The Shepherd. Preacher Solomon.'",
      objectives: [
        {
          id: 'obj_find_wanderer',
          description: "Find The Wanderer's camp",
          type: 'visit',
          target: LOCATION_MARKERS.CW_WANDERERS_CAMP,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_talk_wanderer',
          description: 'Speak with The Wanderer',
          type: 'talk',
          target: NPC_IDS.THE_WANDERER,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 45,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.WANDERER_TOKEN, quantity: 1 }],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 175,
    gold: 60,
    items: [],
    reputation: { [FACTION_IDS.RANCHERS]: 30 },
    unlocksQuests: ['mq7_pieces_of_puzzle'],
  },
};

/**
 * MQ7: "Pieces of the Puzzle"
 *
 * The player combines evidence from both paths (or makes do with
 * partial information) and learns the full truth about Salvation.
 */
export const MQ7_PiecesOfThePuzzle: Quest = {
  id: 'mq7_pieces_of_puzzle',
  title: 'Pieces of the Puzzle',
  description:
    'The evidence points to Salvation and Preacher Solomon. Time to put the pieces together.',
  type: 'main',
  giverNpcId: null,
  startLocationId: TOWN_IDS.IRON_GULCH,
  recommendedLevel: 5,
  tags: ['main', 'investigation', 'act2', 'revelation'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: [], // Requires MQ6a OR MQ6b - handled by game logic
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_review_evidence',
      title: 'Review the Evidence',
      description: 'Go through everything you have learned.',
      onStartText:
        'You have documents, testimony, and connections. Time to see the full picture.',
      onCompleteText:
        "The pattern is clear: Preacher Solomon has been destabilizing the frontier - sabotage, rustling, crime - all to weaken the communities. But why? The answer lies in Salvation.",
      objectives: [
        {
          id: 'obj_review_docs',
          description: 'Review all gathered evidence',
          type: 'interact',
          target: 'evidence_review',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 30,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_consult_allies',
      title: 'Consult Your Allies',
      description: 'Talk to those who have helped you along the way.',
      onStartText:
        "You've made friends and contacts across the frontier. Their insights might be valuable.",
      onCompleteText:
        "Clara, The Wanderer, even Reyna - they all agree: Solomon is dangerous, and whatever he's planning is about to happen. The final trail to Salvation awaits.",
      objectives: [
        {
          id: 'obj_talk_clara_final',
          description: 'Consult with Engineer Clara',
          type: 'talk',
          target: NPC_IDS.ENGINEER_CLARA,
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
        },
        {
          id: 'obj_talk_wanderer_final',
          description: 'Consult with The Wanderer (if available)',
          type: 'talk',
          target: NPC_IDS.THE_WANDERER,
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 40,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_prepare_journey',
      title: 'Prepare for Salvation',
      description: 'Stock up and ready yourself for the final journey.',
      onStartText:
        'The road to Salvation is long and dangerous. Make sure you are prepared.',
      onCompleteText:
        "You're as ready as you'll ever be. The final trail awaits. There's no turning back once you start.",
      objectives: [
        {
          id: 'obj_stock_supplies',
          description: 'Stock up on supplies',
          type: 'interact',
          target: 'prepare_supplies',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
        },
        {
          id: 'obj_begin_journey',
          description: 'Begin the journey to Salvation',
          type: 'visit',
          target: ROUTE_IDS.FINAL_TRAIL,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 100,
    gold: 0,
    items: [],
    reputation: {},
    unlocksQuests: ['mq8_final_trail'],
  },
};

// ============================================================================
// ACT 3: RECKONING
// ============================================================================

/**
 * MQ8: "The Final Trail"
 *
 * The journey to Salvation with point of no return warning
 * and opportunity for final preparations.
 */
export const MQ8_TheFinalTrail: Quest = {
  id: 'mq8_final_trail',
  title: 'The Final Trail',
  description:
    'The road to Salvation is treacherous. Survive the journey and reach the source of the conspiracy.',
  type: 'main',
  giverNpcId: null,
  startLocationId: ROUTE_IDS.FINAL_TRAIL,
  recommendedLevel: 5,
  tags: ['main', 'travel', 'act3', 'point_of_no_return'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq7_pieces_of_puzzle'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_warning',
      title: 'Point of No Return',
      description: 'WARNING: Once you proceed, there is no turning back.',
      onStartText:
        "This is it. Once you enter Salvation, you won't be able to leave until the matter is settled. Are you ready?",
      onCompleteText: 'You steel yourself and press forward. Whatever awaits in Salvation, you will face it.',
      objectives: [
        {
          id: 'obj_confirm_ready',
          description: 'Confirm you are ready to proceed (Point of No Return)',
          type: 'interact',
          target: 'confirm_proceed',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Make sure you have prepared before confirming.',
        },
      ],
      stageRewards: {
        xp: 10,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_journey',
      title: 'Survive the Trail',
      description: 'The final trail is the most dangerous path on the frontier.',
      onStartText:
        'The badlands stretch before you, harsh and unforgiving. Enemies lurk behind every rock.',
      onCompleteText:
        'After countless miles and battles, you see it - Salvation rises from the desert like a mirage. A church steeple dominates the skyline.',
      objectives: [
        {
          id: 'obj_survive_encounters',
          description: 'Survive the dangerous journey',
          type: 'kill',
          target: QUEST_ENEMY_IDS.CULT_FANATIC,
          count: 5,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_reach_salvation',
          description: 'Reach Salvation',
          type: 'visit',
          target: TOWN_IDS.SALVATION,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.SALVATION,
            markerLabel: 'Salvation',
          },
        },
      ],
      stageRewards: {
        xp: 75,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_allies_arrive',
      title: 'Allies Gather',
      description:
        'Your allies from across the frontier arrive to help in the final confrontation.',
      onStartText:
        "You're not alone. Those you helped along the way have come to stand with you.",
      onCompleteText:
        'With your allies at your side, you feel ready to face whatever Preacher Solomon has planned.',
      objectives: [
        {
          id: 'obj_meet_allies',
          description: 'Meet with any allies who have come to help',
          type: 'talk',
          target: NPC_IDS.ENGINEER_CLARA,
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 40,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 125,
    gold: 0,
    items: [],
    reputation: {},
    unlocksQuests: ['mq9_salvations_secret'],
  },
};

/**
 * MQ9: "Salvation's Secret"
 *
 * The player investigates Salvation and discovers the truth about
 * Preacher Solomon - is he the villain or a pawn?
 */
export const MQ9_SalvationsSecret: Quest = {
  id: 'mq9_salvations_secret',
  title: "Salvation's Secret",
  description:
    'Investigate the town of Salvation and uncover the truth about Preacher Solomon.',
  type: 'main',
  giverNpcId: null,
  startLocationId: TOWN_IDS.SALVATION,
  recommendedLevel: 6,
  tags: ['main', 'investigation', 'act3', 'revelation'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq8_final_trail'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_explore_salvation',
      title: 'Explore Salvation',
      description: 'The town seems peaceful, but something is wrong.',
      onStartText:
        "Salvation is eerily quiet. The townsfolk move with purpose but speak in hushed tones. The church looms over everything.",
      onCompleteText:
        'The people here are devoted to Solomon - fanatically so. Whatever he is preaching, they believe completely.',
      objectives: [
        {
          id: 'obj_explore_town',
          description: 'Explore the town of Salvation',
          type: 'visit',
          target: TOWN_IDS.SALVATION,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_talk_townsfolk',
          description: 'Speak with the townsfolk',
          type: 'talk',
          target: NPC_IDS.SISTER_MERCY,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 30,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_investigate_church',
      title: 'Investigate the Church',
      description: 'The church holds the answers. Find a way inside.',
      onStartText:
        'The church is heavily guarded. You\'ll need to find another way in, or confront the guards directly.',
      onCompleteText:
        "Inside the church, you find evidence of Solomon's true plan - a vault beneath the altar containing something ancient and dangerous.",
      objectives: [
        {
          id: 'obj_enter_church',
          description: 'Find a way into the church',
          type: 'visit',
          target: LOCATION_MARKERS.SV_CHURCH,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_find_vault',
          description: 'Discover the hidden vault',
          type: 'interact',
          target: 'church_vault',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 45,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_truth_revealed',
      title: 'The Truth',
      description: 'Confront what you have learned about Solomon.',
      onStartText:
        'The evidence tells a story - but is Solomon the mastermind, or is he being used by something greater?',
      onCompleteText:
        "The truth depends on what you've discovered: If you gathered full evidence, Solomon is clearly being manipulated by a darker force. If not, he appears to be the villain himself. Either way, the final confrontation awaits.",
      objectives: [
        {
          id: 'obj_analyze_evidence',
          description: 'Analyze the evidence in the vault',
          type: 'collect',
          target: QUEST_ITEM_IDS.TRUTH_REVEALED,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_confront_solomon',
          description: 'Confront Preacher Solomon',
          type: 'talk',
          target: NPC_IDS.PREACHER_SOLOMON,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 60,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.SOLOMON_KEY, quantity: 1 }],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 150,
    gold: 0,
    items: [{ itemId: QUEST_ITEM_IDS.SOLOMON_KEY, quantity: 1 }],
    reputation: {},
    unlocksQuests: ['mq10_reckoning'],
  },
};

/**
 * MQ10: "Reckoning" - Final Quest
 *
 * The finale of the game with multiple endings based on
 * player choices throughout the game.
 */
export const MQ10_Reckoning: Quest = {
  id: 'mq10_reckoning',
  title: 'Reckoning',
  description: 'The final confrontation. The fate of the frontier hangs in the balance.',
  type: 'main',
  giverNpcId: null,
  startLocationId: TOWN_IDS.SALVATION,
  recommendedLevel: 6,
  tags: ['main', 'finale', 'act3', 'boss', 'multiple_endings'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq9_salvations_secret'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_descent',
      title: 'Descend into Darkness',
      description: 'Enter the underground complex beneath the church.',
      onStartText:
        'The key unlocks a passage beneath the altar. Stone steps lead down into darkness. Your allies ready themselves.',
      onCompleteText:
        'The underground complex is ancient - far older than Salvation. Steampunk machinery hums alongside stone carvings.',
      objectives: [
        {
          id: 'obj_enter_dungeon',
          description: 'Enter the underground complex',
          type: 'visit',
          target: LOCATION_MARKERS.SV_FINAL_DUNGEON,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_clear_path',
          description: 'Fight through the fanatics',
          type: 'kill',
          target: QUEST_ENEMY_IDS.CULT_FANATIC,
          count: 6,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 50,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_final_battle',
      title: 'The Final Battle',
      description:
        'Face the true enemy and determine the fate of the frontier.',
      onStartText:
        'At the heart of the complex, you find the source of it all. This ends now.',
      onCompleteText:
        'The battle is fierce, but you prevail. The conspiracy is shattered, and the frontier can begin to heal.',
      objectives: [
        {
          id: 'obj_defeat_boss',
          description: 'Defeat the final enemy (Boss Fight)',
          type: 'kill',
          target: QUEST_ENEMY_IDS.FINAL_BOSS,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 150,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_ending',
      title: 'The Reckoning',
      description: 'Your choices determine the ending.',
      onStartText: 'With the threat ended, the future of the frontier unfolds based on your actions.',
      onCompleteText:
        'The story of Iron Frontier concludes. But the frontier stretches on forever, and there are always new trails to blaze.',
      objectives: [
        {
          id: 'obj_watch_ending',
          description: 'Witness the outcome of your journey',
          type: 'interact',
          target: 'ending_cinematic',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 100,
        gold: 200,
        items: [],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 500,
    gold: 500,
    items: [],
    reputation: {
      [FACTION_IDS.LAW]: 50,
      [FACTION_IDS.TOWNSFOLK]: 50,
      [FACTION_IDS.MINERS]: 25,
      [FACTION_IDS.RANCHERS]: 25,
    },
    unlocksQuests: [], // Game complete!
  },
};

// ============================================================================
// MAIN QUEST REGISTRY
// ============================================================================

export const MAIN_QUESTS: Quest[] = [
  // Act 1
  MQ1_AStrangerArrives,
  MQ2_TheMissingProspector,
  MQ3_DeepTrouble,
  MQ4_TheEngineersSecret,
  MQ5_Confrontation,
  // Act 2
  MQ6A_HonorAmongThieves,
  MQ6B_TheRanchersPlight,
  MQ7_PiecesOfThePuzzle,
  // Act 3
  MQ8_TheFinalTrail,
  MQ9_SalvationsSecret,
  MQ10_Reckoning,
];

export const MAIN_QUESTS_BY_ID: Record<string, Quest> = Object.fromEntries(
  MAIN_QUESTS.map((q) => [q.id, q])
);

export const MAIN_QUESTS_BY_ACT: Record<string, Quest[]> = {
  act1: [
    MQ1_AStrangerArrives,
    MQ2_TheMissingProspector,
    MQ3_DeepTrouble,
    MQ4_TheEngineersSecret,
    MQ5_Confrontation,
  ],
  act2: [MQ6A_HonorAmongThieves, MQ6B_TheRanchersPlight, MQ7_PiecesOfThePuzzle],
  act3: [MQ8_TheFinalTrail, MQ9_SalvationsSecret, MQ10_Reckoning],
};
