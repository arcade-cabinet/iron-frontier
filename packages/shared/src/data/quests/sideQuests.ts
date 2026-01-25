/**
 * Iron Frontier - Side Quest Definitions
 *
 * Optional side quests that enrich the world and provide
 * additional content, rewards, and character development.
 *
 * Side quests are organized by town:
 * - Frontier's Edge: 2 quests (SQ1, SQ2)
 * - Iron Gulch: 7 quests (SQ3, SQ4, SQ5, SQ10, SQ11, SQ13, SQ14)
 * - Mesa Point: 3 quests (SQ6, SQ7, SQ12)
 * - Coldwater: 2 quests (SQ8, SQ9)
 * - Salvation: 1 quest (SQ15)
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
// FRONTIER'S EDGE SIDE QUESTS
// ============================================================================

/**
 * SQ1: "Old Timer's Tales"
 *
 * A simple lore quest where the player talks to Old Timer Gus
 * multiple times to learn about the history of the frontier.
 */
export const SQ1_OldTimersTales: Quest = {
  id: 'sq1_old_timers_tales',
  title: "Old Timer's Tales",
  description:
    'Old Timer Gus has been on this frontier for decades. He has stories to tell, if you have time to listen.',
  type: 'side',
  giverNpcId: NPC_IDS.OLD_TIMER_GUS,
  startLocationId: TOWN_IDS.FRONTIERS_EDGE,
  recommendedLevel: 1,
  tags: ['side', 'lore', 'dialogue', 'simple'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq1_stranger_arrives'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_first_tale',
      title: 'The First Tale',
      description: 'Listen to Old Timer Gus tell his first story.',
      onStartText:
        'Old Timer Gus sits on his favorite bench, watching the world go by. He seems pleased to have company.',
      onCompleteText:
        "Gus tells you about the founding of Frontier's Edge - how it was just a waystation before the railroad came. 'Come back tomorrow,' he says. 'I got more tales.'",
      objectives: [
        {
          id: 'obj_talk_gus_1',
          description: 'Listen to Old Timer Gus tell a story',
          type: 'talk',
          target: NPC_IDS.OLD_TIMER_GUS,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.FRONTIERS_EDGE,
            markerLabel: "Old Timer's Bench",
          },
        },
      ],
      stageRewards: {
        xp: 10,
        gold: 0,
        items: [],
        reputation: { [FACTION_IDS.TOWNSFOLK]: 5 },
      },
    },
    {
      id: 'stage_second_tale',
      title: 'The Second Tale',
      description: 'Return to hear another of Gus\'s stories.',
      onStartText: 'Gus seems happy to see you return.',
      onCompleteText:
        "This time Gus tells you about the old mining days - before the big companies came. 'Men could make their fortune with just a pan and some luck,' he sighs.",
      objectives: [
        {
          id: 'obj_talk_gus_2',
          description: 'Listen to another story',
          type: 'talk',
          target: NPC_IDS.OLD_TIMER_GUS,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 10,
        gold: 0,
        items: [],
        reputation: { [FACTION_IDS.TOWNSFOLK]: 5 },
      },
    },
    {
      id: 'stage_third_tale',
      title: 'The Final Tale',
      description: 'Hear the last of Gus\'s stories.',
      onStartText: 'Gus has one more story to share.',
      onCompleteText:
        "Gus tells you about a place called Salvation - a town founded by a preacher with grand ideas. 'Strange things happening out that way,' he mutters. 'Strange things.' He hands you a small token. 'For listening to an old man ramble.'",
      objectives: [
        {
          id: 'obj_talk_gus_3',
          description: 'Listen to the final story',
          type: 'talk',
          target: NPC_IDS.OLD_TIMER_GUS,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 15,
        gold: 5,
        items: [{ itemId: 'lucky_charm', quantity: 1 }],
        reputation: { [FACTION_IDS.TOWNSFOLK]: 10 },
      },
    },
  ],

  rewards: {
    xp: 50,
    gold: 5,
    items: [{ itemId: 'lucky_charm', quantity: 1 }],
    reputation: { [FACTION_IDS.TOWNSFOLK]: 20 },
    unlocksQuests: [],
  },
};

/**
 * SQ2: "Sheriff's Bounty"
 *
 * Hunt down a specific bandit on Dusty Trail for the Sheriff.
 */
export const SQ2_SheriffsBounty: Quest = {
  id: 'sq2_sheriffs_bounty',
  title: "Sheriff's Bounty",
  description:
    "A notorious bandit named 'Two-Fingers McGee' has been robbing travelers on Dusty Trail. The Sheriff wants him brought to justice.",
  type: 'bounty',
  giverNpcId: NPC_IDS.SHERIFF_HANK,
  startLocationId: TOWN_IDS.FRONTIERS_EDGE,
  recommendedLevel: 2,
  tags: ['side', 'bounty', 'combat'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq1_stranger_arrives'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_accept_bounty',
      title: 'Accept the Bounty',
      description: 'Take the bounty poster from the Sheriff.',
      onStartText:
        "The Sheriff has a wanted poster on his desk. 'Two-Fingers McGee. Armed and dangerous. Forty dollars reward, dead or alive.'",
      onCompleteText:
        "You take the poster. McGee was last seen on Dusty Trail, near the old campsite.",
      objectives: [
        {
          id: 'obj_get_poster',
          description: 'Take the bounty poster',
          type: 'collect',
          target: QUEST_ITEM_IDS.BOUNTY_POSTER,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 10,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.BOUNTY_POSTER, quantity: 1 }],
        reputation: {},
      },
    },
    {
      id: 'stage_track_mcgee',
      title: 'Track McGee',
      description: 'Find Two-Fingers McGee on Dusty Trail.',
      onStartText:
        "McGee likes to ambush travelers near the old campsite. He's got a gang of three or four.",
      onCompleteText:
        "You spot McGee's camp. He's there with two of his boys, counting stolen goods.",
      objectives: [
        {
          id: 'obj_find_camp',
          description: "Find McGee's camp on Dusty Trail",
          type: 'visit',
          target: LOCATION_MARKERS.DT_CAMPSITE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: ROUTE_IDS.DUSTY_TRAIL,
            markerLabel: 'Bandit Camp',
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
      id: 'stage_defeat_mcgee',
      title: 'Bring McGee to Justice',
      description: 'Defeat Two-Fingers McGee and his gang.',
      onStartText: "McGee reaches for his gun. 'You picked the wrong camp to stumble into, stranger.'",
      onCompleteText:
        'McGee and his gang are finished. You collect proof of the deed to bring back to the Sheriff.',
      objectives: [
        {
          id: 'obj_defeat_mcgee',
          description: 'Defeat Two-Fingers McGee',
          type: 'kill',
          target: QUEST_ENEMY_IDS.BANDIT,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_defeat_gang',
          description: 'Defeat the gang members',
          type: 'kill',
          target: QUEST_ENEMY_IDS.BANDIT,
          count: 2,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 35,
        gold: 15,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_collect_reward',
      title: 'Collect the Reward',
      description: 'Return to Sheriff Hank to collect your bounty.',
      onStartText: 'Time to collect what you are owed.',
      onCompleteText:
        "The Sheriff nods with satisfaction. 'Good work. The trail will be safer now.' He hands over the reward.",
      objectives: [
        {
          id: 'obj_report_sheriff',
          description: 'Report to Sheriff Hank',
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
        gold: 40,
        items: [],
        reputation: { [FACTION_IDS.LAW]: 15 },
      },
    },
  ],

  rewards: {
    xp: 75,
    gold: 40,
    items: [],
    reputation: { [FACTION_IDS.LAW]: 25 },
    unlocksQuests: [],
  },
};

// ============================================================================
// IRON GULCH SIDE QUESTS
// ============================================================================

/**
 * SQ3: "Saloon Brawl"
 *
 * A bar fight breaks out and the player must handle it non-lethally.
 */
export const SQ3_SaloonBrawl: Quest = {
  id: 'sq3_saloon_brawl',
  title: 'Saloon Brawl',
  description:
    "Tensions are running high at the Iron Gulch Saloon. The bartender needs help before things get out of hand.",
  type: 'side',
  giverNpcId: NPC_IDS.BARTENDER_PETE,
  startLocationId: TOWN_IDS.IRON_GULCH,
  recommendedLevel: 2,
  tags: ['side', 'combat', 'non-lethal', 'reputation'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq3_deep_trouble'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_trouble_brewing',
      title: 'Trouble Brewing',
      description: 'Pete the bartender needs your help.',
      onStartText:
        "The saloon is tense. Two groups of miners are eyeing each other across the room. Pete looks worried.",
      onCompleteText:
        "'Things are about to pop,' Pete whispers. 'I need someone who can handle themselves without killing anyone. These are good men - just stressed.'",
      objectives: [
        {
          id: 'obj_talk_pete',
          description: 'Speak with Bartender Pete',
          type: 'talk',
          target: NPC_IDS.BARTENDER_PETE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.IRON_GULCH,
            markerLabel: 'Saloon',
          },
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
      id: 'stage_brawl',
      title: 'Handle the Brawl',
      description: 'Break up the fight without killing anyone.',
      onStartText:
        "A chair flies across the room. The brawl has begun! Remember - fists only, no guns.",
      onCompleteText:
        'The miners groan on the floor, nursing bruises but alive. Pete looks relieved.',
      objectives: [
        {
          id: 'obj_defeat_brawlers',
          description: 'Subdue the brawlers (non-lethal)',
          type: 'kill',
          target: QUEST_ENEMY_IDS.BAR_BRAWLER,
          count: 4,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Use fists - no weapons!',
        },
      ],
      stageRewards: {
        xp: 30,
        gold: 0,
        items: [],
        reputation: { [FACTION_IDS.MINERS]: 10 },
      },
    },
    {
      id: 'stage_aftermath',
      title: 'Drinks on the House',
      description: 'Collect your reward from Pete.',
      onStartText: 'Pete is grateful for your help.',
      onCompleteText:
        "'You saved me a lot of trouble,' Pete says, sliding you a drink and some coins. 'Come back anytime - drinks are on the house.'",
      objectives: [
        {
          id: 'obj_talk_pete_end',
          description: 'Speak with Pete',
          type: 'talk',
          target: NPC_IDS.BARTENDER_PETE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 15,
        gold: 20,
        items: [{ itemId: 'whiskey', quantity: 2 }],
        reputation: { [FACTION_IDS.MINERS]: 10, [FACTION_IDS.TOWNSFOLK]: 5 },
      },
    },
  ],

  rewards: {
    xp: 60,
    gold: 20,
    items: [{ itemId: 'whiskey', quantity: 2 }],
    reputation: { [FACTION_IDS.MINERS]: 20, [FACTION_IDS.TOWNSFOLK]: 10 },
    unlocksQuests: [],
  },
};

/**
 * SQ4: "Doc's Dilemma"
 *
 * Gather medical supplies from a dangerous area for the town doctor.
 */
export const SQ4_DocsDilemma: Quest = {
  id: 'sq4_docs_dilemma',
  title: "Doc's Dilemma",
  description:
    "Doc Morrison is running low on medical supplies. The nearest cache is in a dangerous part of the mine that's been sealed off.",
  type: 'side',
  giverNpcId: NPC_IDS.DOC_MORRISON,
  startLocationId: TOWN_IDS.IRON_GULCH,
  recommendedLevel: 3,
  tags: ['side', 'exploration', 'medical'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq3_deep_trouble'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_meet_doc',
      title: 'Meet the Doctor',
      description: "Visit Doc Morrison's office.",
      onStartText:
        "Doc Morrison's office is small but clean. The shelves are nearly empty.",
      onCompleteText:
        "'The mine collapse trapped a supply wagon,' Doc explains. 'Medical supplies worth their weight in gold. If you can retrieve them, I can save lives.'",
      objectives: [
        {
          id: 'obj_visit_doc',
          description: "Visit Doc Morrison's office",
          type: 'visit',
          target: LOCATION_MARKERS.IG_DOC_OFFICE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_talk_doc',
          description: 'Speak with Doc Morrison',
          type: 'talk',
          target: NPC_IDS.DOC_MORRISON,
          count: 1,
          current: 0,
          optional: false,
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
      id: 'stage_retrieve_supplies',
      title: 'Retrieve Supplies',
      description: 'Enter the sealed section of the mine and find the supplies.',
      onStartText:
        'The sealed section is unstable. Watch your step and watch for wildlife that might have moved in.',
      onCompleteText:
        'You find the supply wagon, partially crushed but with plenty of usable medicine.',
      objectives: [
        {
          id: 'obj_enter_sealed',
          description: 'Enter the sealed mine section',
          type: 'visit',
          target: LOCATION_MARKERS.IG_MINE_DEEP_SECTION,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_defeat_creatures',
          description: 'Clear out any creatures',
          type: 'kill',
          target: QUEST_ENEMY_IDS.RATTLESNAKE,
          count: 3,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_get_supplies',
          description: 'Retrieve the medical supplies',
          type: 'collect',
          target: QUEST_ITEM_IDS.MEDICAL_SUPPLIES,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 40,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.MEDICAL_SUPPLIES, quantity: 1 }],
        reputation: {},
      },
    },
    {
      id: 'stage_return_supplies',
      title: 'Return to Doc',
      description: 'Bring the supplies back to Doc Morrison.',
      onStartText: 'The Doc will be relieved to have these supplies.',
      onCompleteText:
        "Doc Morrison's eyes light up. 'You have saved lives today, stranger. Here - take some healing supplies, and know that my door is always open to you.'",
      objectives: [
        {
          id: 'obj_deliver_supplies',
          description: 'Deliver supplies to Doc Morrison',
          type: 'deliver',
          target: QUEST_ITEM_IDS.MEDICAL_SUPPLIES,
          deliverTo: NPC_IDS.DOC_MORRISON,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 20,
        gold: 25,
        items: [
          { itemId: 'medical_kit', quantity: 2 },
          { itemId: 'antivenom', quantity: 3 },
        ],
        reputation: { [FACTION_IDS.TOWNSFOLK]: 15 },
      },
    },
  ],

  rewards: {
    xp: 80,
    gold: 25,
    items: [
      { itemId: 'medical_kit', quantity: 2 },
      { itemId: 'antivenom', quantity: 3 },
    ],
    reputation: { [FACTION_IDS.TOWNSFOLK]: 25, [FACTION_IDS.MINERS]: 10 },
    unlocksQuests: [],
  },
};

/**
 * SQ5: "The Informant"
 *
 * Find the informant who has been feeding information to the saboteur.
 */
export const SQ5_TheInformant: Quest = {
  id: 'sq5_the_informant',
  title: 'The Informant',
  description:
    'Someone in Iron Gulch was feeding information to the saboteur. Find out who and why.',
  type: 'side',
  giverNpcId: NPC_IDS.FOREMAN_BURKE,
  startLocationId: TOWN_IDS.IRON_GULCH,
  recommendedLevel: 3,
  tags: ['side', 'investigation', 'evidence'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq5_confrontation'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_assignment',
      title: 'Unfinished Business',
      description: 'Foreman Burke suspects there was someone helping the saboteur.',
      onStartText:
        "Burke pulls you aside. 'Vance didn't work alone. Someone was giving him shift schedules and patrol routes. Find them.'",
      onCompleteText:
        'Burke gives you a list of suspects - people who had access to the information Vance needed.',
      objectives: [
        {
          id: 'obj_talk_burke',
          description: 'Speak with Foreman Burke',
          type: 'talk',
          target: NPC_IDS.FOREMAN_BURKE,
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
      id: 'stage_investigate',
      title: 'Follow the Trail',
      description: 'Investigate the suspects and gather evidence.',
      onStartText:
        'Three people had the access: the office clerk, the night watchman, and the supply manager.',
      onCompleteText:
        "The evidence points to 'Rat' - a small-time criminal who works as an errand boy. He's been paid in company scrip that doesn't match his wages.",
      objectives: [
        {
          id: 'obj_search_office',
          description: 'Search the mine office for evidence',
          type: 'interact',
          target: 'office_search',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_question_workers',
          description: 'Question the suspects',
          type: 'talk',
          target: NPC_IDS.MINER_SILAS,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_find_rat',
          description: 'Find evidence of the real informant',
          type: 'collect',
          target: 'informant_evidence',
          count: 3,
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
      id: 'stage_confront',
      title: 'Confront the Informant',
      description: 'Find Rat and get the truth out of him.',
      onStartText:
        'Rat hangs around the saloon most nights. Time to have a chat.',
      onCompleteText:
        "Rat breaks down quickly. He was desperate for money - his family is starving. He didn't know people would get hurt. You decide his fate: turn him in or let him go with a warning.",
      objectives: [
        {
          id: 'obj_find_informant',
          description: 'Find the informant at the saloon',
          type: 'visit',
          target: LOCATION_MARKERS.IG_SALOON,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_confront_rat',
          description: 'Confront Rat',
          type: 'talk',
          target: NPC_IDS.INFORMANT_RAT,
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
      id: 'stage_report',
      title: 'Report to Burke',
      description: 'Tell the Foreman what you found.',
      onStartText: 'Burke will want to know the truth.',
      onCompleteText:
        "Burke accepts your report. 'The mine can move forward now. Here's your payment - you've earned it.'",
      objectives: [
        {
          id: 'obj_report_burke',
          description: 'Report your findings to Foreman Burke',
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
        gold: 50,
        items: [],
        reputation: { [FACTION_IDS.MINERS]: 15 },
      },
    },
  ],

  rewards: {
    xp: 100,
    gold: 50,
    items: [],
    reputation: { [FACTION_IDS.MINERS]: 25 },
    unlocksQuests: [],
  },
};

// ============================================================================
// MESA POINT SIDE QUESTS
// ============================================================================

/**
 * SQ6: "The Informant's Price"
 *
 * Whisper has valuable information but wants something in return.
 * Involves a moral choice.
 */
export const SQ6_TheInformantsPrice: Quest = {
  id: 'sq6_informants_price',
  title: "The Informant's Price",
  description:
    "Whisper, Mesa Point's information broker, knows things that could help your investigation. But information has a price.",
  type: 'side',
  giverNpcId: NPC_IDS.WHISPER,
  startLocationId: TOWN_IDS.MESA_POINT,
  recommendedLevel: 4,
  tags: ['side', 'moral_choice', 'information'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq6a_honor_among_thieves'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_find_whisper',
      title: 'Find Whisper',
      description: "Locate Whisper's den in Mesa Point.",
      onStartText:
        "Whisper deals in secrets. They say they know everything that happens on the frontier - for the right price.",
      onCompleteText:
        "Whisper's den is hidden in a back alley. A figure in shadows greets you. 'I know what you seek. But first, you do something for me.'",
      objectives: [
        {
          id: 'obj_find_den',
          description: "Find Whisper's den",
          type: 'visit',
          target: LOCATION_MARKERS.MP_WHISPERS_DEN,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_talk_whisper',
          description: 'Speak with Whisper',
          type: 'talk',
          target: NPC_IDS.WHISPER,
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
      id: 'stage_price',
      title: "Whisper's Price",
      description: 'Whisper wants you to deliver a message - or silence a rival.',
      onStartText:
        "Whisper's price: deliver a 'message' to a rival information broker. The message could be a warning... or something more permanent.",
      onCompleteText:
        "You've completed Whisper's task - either peacefully or violently. Whisper is satisfied.",
      objectives: [
        {
          id: 'obj_deliver_warning',
          description: 'Deliver a warning to the rival (peaceful)',
          type: 'talk',
          target: 'rival_broker',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'The non-violent approach.',
        },
        {
          id: 'obj_silence_rival',
          description: 'Silence the rival permanently (violent)',
          type: 'kill',
          target: 'rival_broker',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'The violent approach - Whisper prefers this.',
        },
      ],
      stageRewards: {
        xp: 40,
        gold: 0,
        items: [],
        reputation: {}, // Varies by choice
      },
    },
    {
      id: 'stage_information',
      title: 'Collect Your Payment',
      description: 'Whisper delivers the promised information.',
      onStartText: 'With the task complete, Whisper upholds their end of the bargain.',
      onCompleteText:
        "Whisper reveals critical information about the conspiracy - names, dates, and locations. 'Use it well,' they whisper. 'And remember - I know everything.'",
      objectives: [
        {
          id: 'obj_collect_info',
          description: 'Receive the information from Whisper',
          type: 'collect',
          target: QUEST_ITEM_IDS.WHISPERS_INFO,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.WHISPERS_INFO, quantity: 1 }],
        reputation: { [FACTION_IDS.OUTLAWS]: 10 },
      },
    },
  ],

  rewards: {
    xp: 80,
    gold: 0,
    items: [{ itemId: QUEST_ITEM_IDS.WHISPERS_INFO, quantity: 1 }],
    reputation: { [FACTION_IDS.OUTLAWS]: 15 },
    unlocksQuests: [],
  },
};

/**
 * SQ7: "Bounty Hunter's Mark"
 *
 * Help or hinder Bounty Hunter Cole, affecting Act 3 ally availability.
 */
export const SQ7_BountyHuntersMark: Quest = {
  id: 'sq7_bounty_hunters_mark',
  title: "Bounty Hunter's Mark",
  description:
    "Bounty Hunter Cole is tracking a mark in Mesa Point. Help him catch the target, or help the target escape.",
  type: 'side',
  giverNpcId: NPC_IDS.BOUNTY_HUNTER_COLE,
  startLocationId: TOWN_IDS.MESA_POINT,
  recommendedLevel: 4,
  tags: ['side', 'choice', 'ally_recruitment', 'combat'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq6a_honor_among_thieves'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_meet_cole',
      title: 'Meet Bounty Hunter Cole',
      description: 'Cole is looking for someone who can handle themselves.',
      onStartText:
        "Cole is a weathered hunter with cold eyes. He's tracked his mark to Mesa Point but needs help flushing them out.",
      onCompleteText:
        "'The mark is a woman named Sarah,' Cole explains. 'Wanted for theft back East. She's hiding with the outlaws here.'",
      objectives: [
        {
          id: 'obj_talk_cole',
          description: 'Speak with Bounty Hunter Cole',
          type: 'talk',
          target: NPC_IDS.BOUNTY_HUNTER_COLE,
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
      id: 'stage_choice',
      title: 'The Hunt',
      description:
        'Help Cole capture Sarah, or help her escape. Your choice affects your standing with both parties.',
      onStartText:
        "Sarah stole to feed her family. Cole doesn't care about reasons - only the bounty. What do you do?",
      onCompleteText:
        'Your choice is made. The consequences will follow you.',
      objectives: [
        {
          id: 'obj_help_cole',
          description: 'Help Cole capture Sarah (gain Cole as ally)',
          type: 'kill',
          target: QUEST_ENEMY_IDS.OUTLAW_GRUNT,
          count: 2,
          current: 0,
          optional: true,
          hidden: false,
        },
        {
          id: 'obj_help_sarah',
          description: 'Help Sarah escape (gain outlaw reputation)',
          type: 'talk',
          target: 'sarah_target',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 50,
        gold: 0,
        items: [],
        reputation: {}, // Varies by choice
      },
    },
    {
      id: 'stage_aftermath',
      title: 'Consequences',
      description: 'Deal with the aftermath of your choice.',
      onStartText: 'Every choice has consequences.',
      onCompleteText:
        'If you helped Cole, he offers to stand with you when things get tough. If you helped Sarah, the outlaws respect you more.',
      objectives: [
        {
          id: 'obj_resolve',
          description: 'Resolve the situation',
          type: 'talk',
          target: NPC_IDS.BOUNTY_HUNTER_COLE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 20,
        gold: 35,
        items: [],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 85,
    gold: 35,
    items: [],
    reputation: {}, // Varies based on choice - either LAW or OUTLAWS
    unlocksQuests: [],
  },
};

// ============================================================================
// COLDWATER SIDE QUESTS
// ============================================================================

/**
 * SQ8: "Cattle Rustlers"
 *
 * Track and stop rustlers with a combat encounter.
 */
export const SQ8_CattleRustlers: Quest = {
  id: 'sq8_cattle_rustlers',
  title: 'Cattle Rustlers',
  description:
    "Even with the main rustler operation shut down, smaller bands are still causing trouble. Help the ranchers stop them.",
  type: 'side',
  giverNpcId: NPC_IDS.RANCHER_MCGRAW,
  startLocationId: TOWN_IDS.COLDWATER,
  recommendedLevel: 4,
  tags: ['side', 'combat', 'tracking'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq6b_ranchers_plight'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_report',
      title: 'More Trouble',
      description: 'McGraw reports another rustler sighting.',
      onStartText:
        "McGraw looks frustrated. 'Thought we had them beat, but there's another band hitting the ranches north of town.'",
      onCompleteText:
        'McGraw marks the location on your map. Time to deal with these varmints once and for all.',
      objectives: [
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
        xp: 10,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_track',
      title: 'Track the Rustlers',
      description: 'Follow the trail to the rustler camp.',
      onStartText:
        'Fresh tracks lead through the brush. The rustlers are getting bolder.',
      onCompleteText:
        "You've found their camp - a makeshift corral hidden in a box canyon.",
      objectives: [
        {
          id: 'obj_follow_tracks',
          description: 'Track the rustlers',
          type: 'visit',
          target: ROUTE_IDS.BADLANDS_TRAIL,
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
      id: 'stage_fight',
      title: 'End the Rustling',
      description: 'Defeat the rustlers and free the cattle.',
      onStartText:
        "There are five of them, armed but not expecting trouble. Time to teach them a lesson.",
      onCompleteText:
        'The rustlers are finished. The cattle can be returned to their rightful owners.',
      objectives: [
        {
          id: 'obj_defeat_rustlers',
          description: 'Defeat the rustlers',
          type: 'kill',
          target: QUEST_ENEMY_IDS.RUSTLER,
          count: 5,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_free_cattle',
          description: 'Free the stolen cattle',
          type: 'interact',
          target: 'cattle_pen',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 50,
        gold: 25,
        items: [],
        reputation: { [FACTION_IDS.RANCHERS]: 15 },
      },
    },
    {
      id: 'stage_reward',
      title: 'Rancher\'s Thanks',
      description: 'Return to McGraw for your reward.',
      onStartText: 'McGraw will be relieved to hear the news.',
      onCompleteText:
        "'You've done right by us,' McGraw says, pressing supplies into your hands. 'The ranches are safe because of you.'",
      objectives: [
        {
          id: 'obj_report_mcgraw',
          description: 'Report to Rancher McGraw',
          type: 'talk',
          target: NPC_IDS.RANCHER_MCGRAW,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 15,
        gold: 40,
        items: [
          { itemId: 'dried_jerky', quantity: 10 },
          { itemId: 'water_canteen', quantity: 2 },
        ],
        reputation: { [FACTION_IDS.RANCHERS]: 20 },
      },
    },
  ],

  rewards: {
    xp: 95,
    gold: 40,
    items: [
      { itemId: 'dried_jerky', quantity: 10 },
      { itemId: 'water_canteen', quantity: 2 },
    ],
    reputation: { [FACTION_IDS.RANCHERS]: 35 },
    unlocksQuests: [],
  },
};

/**
 * SQ9: "The Wanderer's Tale"
 *
 * Multiple conversations with The Wanderer unlock backstory and hints.
 */
export const SQ9_TheWanderersTale: Quest = {
  id: 'sq9_wanderers_tale',
  title: "The Wanderer's Tale",
  description:
    'The mysterious Wanderer has stories to tell - stories that hint at something greater.',
  type: 'side',
  giverNpcId: NPC_IDS.THE_WANDERER,
  startLocationId: TOWN_IDS.COLDWATER,
  recommendedLevel: 4,
  tags: ['side', 'lore', 'dialogue', 'sequel_hook'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq6b_ranchers_plight'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_first_meeting',
      title: 'First Meeting',
      description: 'Have a longer conversation with The Wanderer.',
      onStartText:
        "The Wanderer's camp is simple but well-maintained. They seem more willing to talk now that you've proven yourself.",
      onCompleteText:
        "The Wanderer speaks of travels across the frontier - places you've never heard of, dangers beyond imagination. 'There are things in this world older than any of us understand,' they say.",
      objectives: [
        {
          id: 'obj_talk_wanderer_1',
          description: 'Speak with The Wanderer',
          type: 'talk',
          target: NPC_IDS.THE_WANDERER,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.COLDWATER,
            markerLabel: "Wanderer's Camp",
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
      id: 'stage_second_meeting',
      title: 'The Past',
      description: 'Learn about The Wanderer\'s past.',
      onStartText:
        'The Wanderer seems reflective today.',
      onCompleteText:
        "The Wanderer reveals they were once part of something - a group that sought to protect the frontier from 'the darkness between the cracks.' They failed, and now wander alone.",
      objectives: [
        {
          id: 'obj_talk_wanderer_2',
          description: 'Have another conversation with The Wanderer',
          type: 'talk',
          target: NPC_IDS.THE_WANDERER,
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
      id: 'stage_final_meeting',
      title: 'The Future',
      description: 'The Wanderer shares a final revelation.',
      onStartText:
        'The Wanderer looks at you with something like hope.',
      onCompleteText:
        "'Whatever happens in Salvation,' The Wanderer says, 'it's just the beginning. There are other threats, other conspiracies. The frontier needs people like you.' They hand you a unique item - a token from their past. 'When the time comes, you'll know what to do with it.'",
      objectives: [
        {
          id: 'obj_talk_wanderer_3',
          description: 'Have a final conversation with The Wanderer',
          type: 'talk',
          target: NPC_IDS.THE_WANDERER,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 30,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.WANDERER_TOKEN, quantity: 1 }],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 100,
    gold: 0,
    items: [{ itemId: QUEST_ITEM_IDS.WANDERER_TOKEN, quantity: 1 }],
    reputation: {},
    unlocksQuests: [], // Potential sequel hook
  },
};

// ============================================================================
// NEW IRON GULCH SIDE QUESTS
// ============================================================================

/**
 * SQ10: "The Gambler's Debt"
 *
 * Help Lucky Lou win back his stolen winnings from a cheating card shark.
 * Set in the Iron Gulch saloon poker room.
 */
export const SQ10_GamblersDebt: Quest = {
  id: 'sq10_gamblers_debt',
  title: "The Gambler's Debt",
  description:
    "Lucky Lou claims a card shark named 'Cardshark Charlie' cheated him out of a week's wages. He needs help proving the cheat and getting his money back.",
  type: 'side',
  giverNpcId: NPC_IDS.LUCKY_LOU,
  startLocationId: TOWN_IDS.IRON_GULCH,
  recommendedLevel: 2,
  tags: ['side', 'investigation', 'confrontation', 'gambling'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq3_deep_trouble'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_meet_lou',
      title: 'A Desperate Gambler',
      description: 'Meet Lucky Lou at the Iron Gulch Saloon.',
      onStartText:
        "A scruffy man waves you over from a corner table. He looks desperate, nursing a watered-down whiskey.",
      onCompleteText:
        "'They call me Lucky Lou, but luck's run out,' he says bitterly. 'Cardshark Charlie took me for everything I had. I know he cheated - I just can't prove it. Help me, and I'll split whatever we recover.'",
      objectives: [
        {
          id: 'obj_talk_lou',
          description: 'Speak with Lucky Lou',
          type: 'talk',
          target: NPC_IDS.LUCKY_LOU,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.IRON_GULCH,
            markerLabel: 'Lucky Lou',
          },
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
      id: 'stage_find_evidence',
      title: 'Catching a Cheat',
      description: 'Find evidence of Charlie cheating at cards.',
      onStartText:
        "Charlie runs a game every night in the back room. Watch him play and look for proof of cheating.",
      onCompleteText:
        "You spot it - marked cards hidden in his sleeve. You've got enough to confront him now.",
      objectives: [
        {
          id: 'obj_visit_poker_room',
          description: 'Visit the poker room during a game',
          type: 'visit',
          target: LOCATION_MARKERS.IG_POKER_ROOM,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.IRON_GULCH,
            markerLabel: 'Poker Room',
          },
        },
        {
          id: 'obj_find_marked_cards',
          description: 'Find evidence of cheating',
          type: 'collect',
          target: QUEST_ITEM_IDS.CHEATING_EVIDENCE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Watch his hands carefully.',
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.CHEATING_EVIDENCE, quantity: 1 }],
        reputation: {},
      },
    },
    {
      id: 'stage_confront_charlie',
      title: 'The Showdown',
      description: 'Confront Cardshark Charlie with the evidence.',
      onStartText:
        "Time to show Charlie his game is up. He won't go quietly - card sharks rarely do.",
      onCompleteText:
        "Charlie's thugs lie groaning on the floor. Charlie himself throws down the stolen winnings. 'Take it! Just leave me be!' He won't be cheating honest folk anymore.",
      objectives: [
        {
          id: 'obj_confront_charlie',
          description: 'Confront Cardshark Charlie',
          type: 'talk',
          target: NPC_IDS.CARDSHARK_CHARLIE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_defeat_thugs',
          description: "Defeat Charlie's thugs",
          type: 'kill',
          target: QUEST_ENEMY_IDS.CARDSHARK_THUG,
          count: 2,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_recover_winnings',
          description: 'Recover the stolen winnings',
          type: 'collect',
          target: QUEST_ITEM_IDS.STOLEN_WINNINGS,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 35,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.STOLEN_WINNINGS, quantity: 1 }],
        reputation: { [FACTION_IDS.TOWNSFOLK]: 10 },
      },
    },
    {
      id: 'stage_return_to_lou',
      title: 'Splitting the Pot',
      description: "Return to Lucky Lou with his winnings.",
      onStartText: 'Lou will be relieved to have his money back.',
      onCompleteText:
        "Lou's eyes light up when he sees the money. 'You did it! Fair's fair - here's your cut.' He hands you a generous share. 'Maybe my luck is changing after all.'",
      objectives: [
        {
          id: 'obj_return_winnings',
          description: 'Return the winnings to Lucky Lou',
          type: 'deliver',
          target: QUEST_ITEM_IDS.STOLEN_WINNINGS,
          deliverTo: NPC_IDS.LUCKY_LOU,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 15,
        gold: 50,
        items: [{ itemId: 'lucky_dice', quantity: 1 }],
        reputation: { [FACTION_IDS.TOWNSFOLK]: 10, [FACTION_IDS.MINERS]: 5 },
      },
    },
  ],

  rewards: {
    xp: 85,
    gold: 50,
    items: [{ itemId: 'lucky_dice', quantity: 1 }],
    reputation: { [FACTION_IDS.TOWNSFOLK]: 20, [FACTION_IDS.MINERS]: 10 },
    unlocksQuests: [],
  },
};

/**
 * SQ11: "Cogsworth's Contraption"
 *
 * Find rare parts for Professor Cogsworth's steam-powered invention.
 * Exploration quest with a unique gadget reward.
 */
export const SQ11_CogsworthsContraption: Quest = {
  id: 'sq11_cogsworths_contraption',
  title: "Cogsworth's Contraption",
  description:
    "Professor Cogsworth, a brilliant but eccentric inventor, needs rare parts to complete his revolutionary steam-powered gadget. Find them, and he'll share his creation with you.",
  type: 'side',
  giverNpcId: NPC_IDS.PROFESSOR_COGSWORTH,
  startLocationId: TOWN_IDS.IRON_GULCH,
  recommendedLevel: 3,
  tags: ['side', 'exploration', 'collection', 'unique_reward'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq3_deep_trouble'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_meet_cogsworth',
      title: 'The Mad Inventor',
      description: "Visit Professor Cogsworth's workshop.",
      onStartText:
        "Rumors speak of a strange inventor working in a cluttered workshop at the edge of town. His experiments are the talk of Iron Gulch.",
      onCompleteText:
        "'Eureka! A volunteer!' Cogsworth exclaims, goggles askew. 'I'm so close to completing my Steam-Powered Personal Protection Device! But I need three rare components. Find them, and the prototype is yours!'",
      objectives: [
        {
          id: 'obj_visit_lab',
          description: "Visit Cogsworth's workshop",
          type: 'visit',
          target: LOCATION_MARKERS.IG_COGSWORTH_LAB,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.IRON_GULCH,
            markerLabel: "Cogsworth's Lab",
          },
        },
        {
          id: 'obj_talk_cogsworth',
          description: 'Speak with Professor Cogsworth',
          type: 'talk',
          target: NPC_IDS.PROFESSOR_COGSWORTH,
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
      id: 'stage_find_valve',
      title: 'The Steam Valve',
      description: 'Find a precision steam valve from the abandoned mining equipment.',
      onStartText:
        "'The valve I need was in a shipment to the old mining equipment storage. Should still be there!'",
      onCompleteText:
        'You find the valve among rusted machinery. It looks intact - Cogsworth will be pleased.',
      objectives: [
        {
          id: 'obj_search_storage',
          description: 'Search the old mining equipment storage',
          type: 'visit',
          target: LOCATION_MARKERS.IG_MINE_DEEP_SECTION,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_find_valve',
          description: 'Find the precision steam valve',
          type: 'collect',
          target: QUEST_ITEM_IDS.STEAM_VALVE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 20,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.STEAM_VALVE, quantity: 1 }],
        reputation: {},
      },
    },
    {
      id: 'stage_find_gauge',
      title: 'The Pressure Gauge',
      description: 'Acquire a pressure gauge from the general store shipment.',
      onStartText:
        "'The pressure gauge was ordered months ago! The merchant should have it by now.'",
      onCompleteText:
        "The merchant reluctantly parts with the gauge - he'd hoped to sell it for triple the price.",
      objectives: [
        {
          id: 'obj_buy_gauge',
          description: 'Purchase the pressure gauge from the merchant',
          type: 'talk',
          target: NPC_IDS.MERCHANT_MARTHA,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'May require some negotiation or payment.',
        },
        {
          id: 'obj_collect_gauge',
          description: 'Obtain the pressure gauge',
          type: 'collect',
          target: QUEST_ITEM_IDS.PRESSURE_GAUGE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 15,
        gold: -10,
        items: [{ itemId: QUEST_ITEM_IDS.PRESSURE_GAUGE, quantity: 1 }],
        reputation: {},
      },
    },
    {
      id: 'stage_find_coil',
      title: 'The Copper Coil',
      description: 'Salvage copper coil from bandits who stole a supply wagon.',
      onStartText:
        "'The copper coil was on a supply wagon that went missing on Dusty Trail. Bandits, no doubt!'",
      onCompleteText:
        'The bandits put up a fight, but you recover the precious copper coil from the stolen goods.',
      objectives: [
        {
          id: 'obj_track_bandits',
          description: 'Track the bandits on Dusty Trail',
          type: 'visit',
          target: LOCATION_MARKERS.DT_CAMPSITE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: ROUTE_IDS.DUSTY_TRAIL,
            markerLabel: 'Bandit Camp',
          },
        },
        {
          id: 'obj_defeat_bandits',
          description: 'Defeat the bandits',
          type: 'kill',
          target: QUEST_ENEMY_IDS.BANDIT,
          count: 3,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_recover_coil',
          description: 'Recover the copper coil',
          type: 'collect',
          target: QUEST_ITEM_IDS.COPPER_COIL,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 30,
        gold: 15,
        items: [{ itemId: QUEST_ITEM_IDS.COPPER_COIL, quantity: 1 }],
        reputation: { [FACTION_IDS.LAW]: 10 },
      },
    },
    {
      id: 'stage_complete_device',
      title: 'The Prototype',
      description: 'Return to Cogsworth with all the parts.',
      onStartText: 'You have all three components. Time to see what Cogsworth can create.',
      onCompleteText:
        "'MAGNIFICENT!' Cogsworth assembles the parts with practiced precision. Steam hisses, gears turn, and he presents you with a remarkable brass device. 'The Steam-Shield Projector! It creates a temporary protective barrier. Use it wisely!'",
      objectives: [
        {
          id: 'obj_deliver_parts',
          description: 'Deliver all parts to Professor Cogsworth',
          type: 'talk',
          target: NPC_IDS.PROFESSOR_COGSWORTH,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.COGSWORTH_GADGET, quantity: 1 }],
        reputation: { [FACTION_IDS.TOWNSFOLK]: 15 },
      },
    },
  ],

  rewards: {
    xp: 105,
    gold: 5,
    items: [{ itemId: QUEST_ITEM_IDS.COGSWORTH_GADGET, quantity: 1 }],
    reputation: { [FACTION_IDS.TOWNSFOLK]: 20, [FACTION_IDS.LAW]: 10 },
    unlocksQuests: [],
  },
};

// ============================================================================
// NEW MESA POINT SIDE QUESTS
// ============================================================================

/**
 * SQ12: "Belle's Bounty"
 *
 * Work with Black Belle to capture a notorious outlaw.
 * Moral choice quest: bring in dead or alive.
 */
export const SQ12_BellesBounty: Quest = {
  id: 'sq12_belles_bounty',
  title: "Belle's Bounty",
  description:
    "Black Belle, a legendary bounty hunter, has tracked the notorious 'Dynamite' Doyle to Mesa Point. She needs a partner for the takedown - and you get to choose how it ends.",
  type: 'bounty',
  giverNpcId: NPC_IDS.BLACK_BELLE,
  startLocationId: TOWN_IDS.MESA_POINT,
  recommendedLevel: 4,
  tags: ['side', 'bounty', 'moral_choice', 'combat', 'partner'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq6a_honor_among_thieves'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_meet_belle',
      title: 'The Legendary Hunter',
      description: 'Meet Black Belle at the Mesa Point hideout.',
      onStartText:
        "Word is a famous bounty hunter is in town, looking for capable help. She has a reputation for getting her mark - always.",
      onCompleteText:
        "Black Belle's eyes are sharp as a hawk's. 'Dynamite Doyle. Killed twelve people, robbed six banks. Five hundred dollar bounty - dead or alive. I'm offering fifty-fifty if you help me bring him in. Interested?'",
      objectives: [
        {
          id: 'obj_find_belle',
          description: 'Find Black Belle',
          type: 'visit',
          target: LOCATION_MARKERS.MP_HIDEOUT,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.MESA_POINT,
            markerLabel: 'Black Belle',
          },
        },
        {
          id: 'obj_talk_belle',
          description: 'Speak with Black Belle',
          type: 'talk',
          target: NPC_IDS.BLACK_BELLE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 15,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.BELLE_BOUNTY_POSTER, quantity: 1 }],
        reputation: {},
      },
    },
    {
      id: 'stage_track_doyle',
      title: 'Tracking Dynamite',
      description: "Track Doyle's gang to their hideout.",
      onStartText:
        "'Doyle's been using an old mine shaft as a hideout,' Belle explains. 'We hit them at dawn. Follow my lead.'",
      onCompleteText:
        "You and Belle find Doyle's camp. Three guards outside, Doyle within. 'Remember,' Belle whispers, 'dead or alive. Your choice when the moment comes.'",
      objectives: [
        {
          id: 'obj_scout_camp',
          description: "Scout Doyle's hideout",
          type: 'visit',
          target: ROUTE_IDS.DESERT_PASS,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: ROUTE_IDS.DESERT_PASS,
            markerLabel: "Doyle's Hideout",
          },
        },
        {
          id: 'obj_defeat_guards',
          description: 'Eliminate the guards',
          type: 'kill',
          target: QUEST_ENEMY_IDS.OUTLAW_GRUNT,
          count: 3,
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
      id: 'stage_confront_doyle',
      title: 'Dead or Alive',
      description: 'Confront Dynamite Doyle. Your choice: capture him alive or put him down.',
      onStartText:
        "Doyle is cornered, but dangerous. He's reaching for his gun. This is the moment of truth.",
      onCompleteText:
        'The deed is done. Doyle is either in chains or in the dirt. Belle nods approvingly either way.',
      objectives: [
        {
          id: 'obj_capture_alive',
          description: 'Capture Doyle alive (spare him)',
          type: 'talk',
          target: QUEST_ENEMY_IDS.NOTORIOUS_OUTLAW_DOYLE,
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'Talk him down - harder, but more honorable. Better reputation with Law.',
        },
        {
          id: 'obj_kill_doyle',
          description: 'Kill Dynamite Doyle',
          type: 'kill',
          target: QUEST_ENEMY_IDS.NOTORIOUS_OUTLAW_DOYLE,
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'The easy way. Same bounty, less hassle. Belle prefers this.',
        },
      ],
      stageRewards: {
        xp: 50,
        gold: 0,
        items: [],
        reputation: {}, // Varies by choice
      },
    },
    {
      id: 'stage_collect_bounty',
      title: 'Collect the Bounty',
      description: 'Return to Mesa Point to collect the bounty reward.',
      onStartText: "Time to cash in. Belle knows where to collect.",
      onCompleteText:
        "Belle counts out your share. 'Not bad, partner. Maybe we'll ride together again someday.' She tips her hat and disappears into the desert.",
      objectives: [
        {
          id: 'obj_report_complete',
          description: 'Report the bounty completion',
          type: 'talk',
          target: NPC_IDS.BLACK_BELLE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 250,
        items: [],
        reputation: { [FACTION_IDS.LAW]: 20 },
      },
    },
  ],

  rewards: {
    xp: 120,
    gold: 250,
    items: [],
    reputation: { [FACTION_IDS.LAW]: 25 },
    unlocksQuests: [],
  },
};

// ============================================================================
// NEW COLDWATER SIDE QUESTS
// ============================================================================

/**
 * SQ13: "The Widow's Locket"
 *
 * Find a grieving widow's stolen locket.
 * Investigation leads to unexpected family secrets.
 */
export const SQ13_WidowsLocket: Quest = {
  id: 'sq13_widows_locket',
  title: "The Widow's Locket",
  description:
    "Widow Margaret's most precious possession - a locket containing her late husband's portrait - has been stolen. Help her recover it and uncover the truth behind the theft.",
  type: 'side',
  giverNpcId: NPC_IDS.WIDOW_MARGARET,
  startLocationId: TOWN_IDS.IRON_GULCH,
  recommendedLevel: 3,
  tags: ['side', 'investigation', 'lore', 'family_secrets'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['mq3_deep_trouble'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_meet_widow',
      title: 'A Grieving Heart',
      description: "Visit Widow Margaret's cottage.",
      onStartText:
        "An elderly woman has been asking around town for help. She looks fragile but determined.",
      onCompleteText:
        "'That locket is all I have left of my Thomas,' Margaret weeps. 'Someone broke in while I was at market. Please, I'll give you everything I have - just bring it back.'",
      objectives: [
        {
          id: 'obj_visit_cottage',
          description: "Visit the Widow's cottage",
          type: 'visit',
          target: LOCATION_MARKERS.IG_WIDOWS_COTTAGE,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.IRON_GULCH,
            markerLabel: "Widow's Cottage",
          },
        },
        {
          id: 'obj_talk_margaret',
          description: 'Speak with Widow Margaret',
          type: 'talk',
          target: NPC_IDS.WIDOW_MARGARET,
          count: 1,
          current: 0,
          optional: false,
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
      id: 'stage_investigate',
      title: 'Following the Trail',
      description: 'Investigate the break-in and question witnesses.',
      onStartText:
        "The cottage shows signs of a hurried search. Someone was looking for something specific.",
      onCompleteText:
        "A neighbor saw a young man fleeing the scene - a man matching the description of Thomas's estranged nephew, William. He was last seen heading toward Mesa Point.",
      objectives: [
        {
          id: 'obj_search_cottage',
          description: 'Search the cottage for clues',
          type: 'interact',
          target: 'cottage_search',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_question_neighbors',
          description: 'Question the neighbors',
          type: 'talk',
          target: NPC_IDS.MINER_SILAS,
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
      id: 'stage_find_thief',
      title: 'The Prodigal Nephew',
      description: 'Track down William in Mesa Point.',
      onStartText:
        "William fled to Mesa Point - probably hoping to sell the locket to the black market.",
      onCompleteText:
        "You find William, looking haunted and desperate. 'I didn't want to steal it,' he admits. 'But there's something inside - a letter. My uncle left half his fortune to me, but Aunt Margaret hid the proof. I just wanted what's rightfully mine.'",
      objectives: [
        {
          id: 'obj_travel_mesa',
          description: 'Travel to Mesa Point',
          type: 'visit',
          target: TOWN_IDS.MESA_POINT,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_find_william',
          description: 'Find William at the black market',
          type: 'visit',
          target: LOCATION_MARKERS.MP_BLACK_MARKET,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_talk_william',
          description: 'Confront William',
          type: 'talk',
          target: 'william_nephew',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 0,
        items: [
          { itemId: QUEST_ITEM_IDS.WIDOWS_LOCKET, quantity: 1 },
          { itemId: QUEST_ITEM_IDS.FAMILY_LETTER, quantity: 1 },
        ],
        reputation: {},
      },
    },
    {
      id: 'stage_return_locket',
      title: 'Family Truths',
      description: 'Return to Widow Margaret with the locket and the truth.',
      onStartText:
        "You have the locket and know the full story. Margaret deserves to hear it.",
      onCompleteText:
        "Margaret reads the letter with trembling hands. Tears flow freely. 'Thomas... he never forgot William. I was so jealous, I hid the truth.' She presses some gold into your hands. 'Tell William... tell him I'm sorry. He can have what's rightfully his.'",
      objectives: [
        {
          id: 'obj_return_locket',
          description: 'Return the locket to Widow Margaret',
          type: 'deliver',
          target: QUEST_ITEM_IDS.WIDOWS_LOCKET,
          deliverTo: NPC_IDS.WIDOW_MARGARET,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_show_letter',
          description: 'Show her the hidden letter',
          type: 'deliver',
          target: QUEST_ITEM_IDS.FAMILY_LETTER,
          deliverTo: NPC_IDS.WIDOW_MARGARET,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 40,
        items: [{ itemId: 'family_heirloom_ring', quantity: 1 }],
        reputation: { [FACTION_IDS.TOWNSFOLK]: 20 },
      },
    },
  ],

  rewards: {
    xp: 80,
    gold: 40,
    items: [{ itemId: 'family_heirloom_ring', quantity: 1 }],
    reputation: { [FACTION_IDS.TOWNSFOLK]: 25 },
    unlocksQuests: [],
  },
};

/**
 * SQ14: "Mine Shaft Rescue"
 *
 * Save trapped miners before air runs out.
 * Timed quest with multiple approach options.
 */
export const SQ14_MineShaftRescue: Quest = {
  id: 'sq14_mine_shaft_rescue',
  title: 'Mine Shaft Rescue',
  description:
    "A cave-in has trapped five miners in a collapsed shaft. Air is running out. You have hours, not days, to save them - and multiple ways to attempt the rescue.",
  type: 'side',
  giverNpcId: NPC_IDS.MINE_FOREMAN_JENKINS,
  startLocationId: TOWN_IDS.IRON_GULCH,
  recommendedLevel: 4,
  tags: ['side', 'timed', 'rescue', 'multiple_approaches', 'urgent'],
  repeatable: false,
  timeLimitHours: 4,

  prerequisites: {
    completedQuests: ['mq3_deep_trouble'],
    factionReputation: { [FACTION_IDS.MINERS]: 10 },
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_emergency',
      title: 'The Cave-In',
      description: 'Respond to the emergency at the mine.',
      onStartText:
        "Alarm bells ring through Iron Gulch. Something has gone terribly wrong at the mine.",
      onCompleteText:
        "'Five men are trapped!' Foreman Jenkins shouts over the chaos. 'The main shaft collapsed. They've got maybe four hours of air. We need to get them out!' He shows you a map with three possible approaches.",
      objectives: [
        {
          id: 'obj_reach_mine',
          description: 'Reach the mine emergency site',
          type: 'visit',
          target: LOCATION_MARKERS.IG_COLLAPSED_SHAFT,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.IRON_GULCH,
            markerLabel: 'Collapsed Shaft',
          },
        },
        {
          id: 'obj_talk_jenkins',
          description: 'Speak with Foreman Jenkins',
          type: 'talk',
          target: NPC_IDS.MINE_FOREMAN_JENKINS,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 15,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.MINE_SHAFT_KEY, quantity: 1 }],
        reputation: {},
      },
    },
    {
      id: 'stage_choose_approach',
      title: 'The Rescue',
      description: 'Choose your approach: dig through debris, find an alternate route, or use explosives.',
      onStartText:
        "'We can dig through the main collapse - slow but safe. There might be an old ventilation shaft - faster but dangerous. Or we could blast through - fastest but risky.' Time is running out.",
      onCompleteText:
        'Your approach works! You break through to the trapped miners. They are exhausted but alive.',
      objectives: [
        {
          id: 'obj_dig_through',
          description: 'Dig through the main collapse (slow, safe)',
          type: 'interact',
          target: 'dig_collapse',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'Takes longest but no risk. Gather rescue supplies first.',
        },
        {
          id: 'obj_ventilation_route',
          description: 'Navigate the old ventilation shaft (medium, risky)',
          type: 'visit',
          target: LOCATION_MARKERS.IG_MINE_DEEP_SECTION,
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'Faster but requires defeating creatures in the old tunnels.',
        },
        {
          id: 'obj_use_explosives',
          description: 'Use controlled explosives (fast, dangerous)',
          type: 'interact',
          target: 'blast_collapse',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'Fastest but requires finding the right blast points. One wrong move could kill everyone.',
        },
        {
          id: 'obj_defeat_creatures',
          description: 'Clear creatures from ventilation shaft (if using that route)',
          type: 'kill',
          target: QUEST_ENEMY_IDS.RATTLESNAKE,
          count: 4,
          current: 0,
          optional: true,
          hidden: true,
        },
      ],
      stageRewards: {
        xp: 50,
        gold: 0,
        items: [],
        reputation: { [FACTION_IDS.MINERS]: 20 },
      },
    },
    {
      id: 'stage_rescue_miners',
      title: 'Getting Out',
      description: 'Help the trapped miners escape to safety.',
      onStartText:
        "The miners are weak but mobile. You need to guide them out safely.",
      onCompleteText:
        "Fresh air has never tasted so sweet. The miners emerge to cheers from the crowd. 'You saved our lives,' their leader says. 'We won't forget this.'",
      objectives: [
        {
          id: 'obj_collect_supplies',
          description: 'Gather rescue supplies',
          type: 'collect',
          target: QUEST_ITEM_IDS.RESCUE_SUPPLIES,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_escort_miners',
          description: 'Lead the miners to safety',
          type: 'visit',
          target: LOCATION_MARKERS.IG_MINE_ENTRANCE,
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
        reputation: { [FACTION_IDS.MINERS]: 15, [FACTION_IDS.TOWNSFOLK]: 10 },
      },
    },
    {
      id: 'stage_hero_welcome',
      title: "A Hero's Welcome",
      description: 'Receive thanks from the community.',
      onStartText: 'Word of your heroism spreads quickly through Iron Gulch.',
      onCompleteText:
        "Foreman Jenkins shakes your hand firmly. 'The company is putting up a reward for the rescuer. You've earned every cent - and the eternal gratitude of five families.' The miners' union also presents you with a special pickaxe - a symbol of honorary membership.",
      objectives: [
        {
          id: 'obj_receive_thanks',
          description: 'Speak with Foreman Jenkins',
          type: 'talk',
          target: NPC_IDS.MINE_FOREMAN_JENKINS,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 30,
        gold: 100,
        items: [{ itemId: 'honorary_miners_pick', quantity: 1 }],
        reputation: { [FACTION_IDS.MINERS]: 25, [FACTION_IDS.TOWNSFOLK]: 15 },
      },
    },
  ],

  rewards: {
    xp: 130,
    gold: 100,
    items: [{ itemId: 'honorary_miners_pick', quantity: 1 }],
    reputation: { [FACTION_IDS.MINERS]: 50, [FACTION_IDS.TOWNSFOLK]: 25 },
    unlocksQuests: [],
  },
};

// ============================================================================
// NEW SALVATION SIDE QUESTS
// ============================================================================

/**
 * SQ15: "The Preacher's Past"
 *
 * Discover Father Miguel's secret past that an IVRC agent is using as blackmail.
 * Protect or expose? Moral choice with faction implications.
 */
export const SQ15_PreachersPast: Quest = {
  id: 'sq15_preachers_past',
  title: "The Preacher's Past",
  description:
    "Father Miguel, the kind-hearted priest of Salvation, is being blackmailed by an IVRC agent over secrets from his past. Discover the truth and choose whether to protect him or expose him.",
  type: 'side',
  giverNpcId: NPC_IDS.FATHER_MIGUEL,
  startLocationId: TOWN_IDS.SALVATION,
  recommendedLevel: 5,
  tags: ['side', 'investigation', 'moral_choice', 'faction', 'blackmail'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: [],
    factionReputation: {},
    requiredItems: [],
    minLevel: 5,
  },

  stages: [
    {
      id: 'stage_troubled_priest',
      title: 'A Troubled Soul',
      description: 'Notice something is wrong with Father Miguel.',
      onStartText:
        "Father Miguel's sermons have become distracted, his hands tremble, and he looks over his shoulder constantly.",
      onCompleteText:
        "'Please,' Miguel whispers, pulling you aside, 'I need help. Someone from my past has found me. They want... they want me to betray everything I've built here. I can't tell you everything, but I can't face this alone.'",
      objectives: [
        {
          id: 'obj_visit_church',
          description: 'Visit the church in Salvation',
          type: 'visit',
          target: LOCATION_MARKERS.SV_CHURCH,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.SALVATION,
            markerLabel: 'Salvation Church',
          },
        },
        {
          id: 'obj_talk_miguel',
          description: 'Speak with Father Miguel',
          type: 'talk',
          target: NPC_IDS.FATHER_MIGUEL,
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
      id: 'stage_investigate_blackmailer',
      title: 'The Shadow',
      description: 'Investigate the person blackmailing Father Miguel.',
      onStartText:
        "'He calls himself Shaw. Wears an IVRC badge. He has proof of who I used to be... before I found redemption.'",
      onCompleteText:
        "You find Agent Shaw's camp outside town. Among his belongings: a file on Miguel revealing he was once 'Miguel the Merciless,' an outlaw who killed three men before disappearing fifteen years ago. Shaw wants Miguel to spy on the church from within.",
      objectives: [
        {
          id: 'obj_find_shaw_camp',
          description: "Find Agent Shaw's camp",
          type: 'visit',
          target: LOCATION_MARKERS.SV_IVRC_CAMP,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: TOWN_IDS.SALVATION,
            markerLabel: 'IVRC Camp',
          },
        },
        {
          id: 'obj_find_evidence',
          description: 'Find the blackmail evidence',
          type: 'collect',
          target: QUEST_ITEM_IDS.BLACKMAIL_LETTER,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 30,
        gold: 0,
        items: [{ itemId: QUEST_ITEM_IDS.BLACKMAIL_LETTER, quantity: 1 }],
        reputation: {},
      },
    },
    {
      id: 'stage_confront_shaw',
      title: 'Confrontation',
      description: 'Confront Agent Shaw about the blackmail.',
      onStartText:
        "Shaw is a cold-eyed IVRC operative. He won't give up his leverage easily.",
      onCompleteText:
        "'The old man killed people,' Shaw sneers. 'Justice doesn't have an expiration date. But you want to play hero? Fine. Take me down if you can.' Shaw and his thugs draw their weapons.",
      objectives: [
        {
          id: 'obj_confront_shaw',
          description: 'Confront Agent Shaw',
          type: 'talk',
          target: NPC_IDS.IVRC_AGENT_SHAW,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_defeat_shaw',
          description: "Defeat Shaw's men",
          type: 'kill',
          target: QUEST_ENEMY_IDS.IVRC_THUG,
          count: 3,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 40,
        gold: 25,
        items: [{ itemId: QUEST_ITEM_IDS.MIGUELS_CONFESSION, quantity: 1 }],
        reputation: {},
      },
    },
    {
      id: 'stage_choice',
      title: 'Judgment',
      description: "Decide Father Miguel's fate: protect his secret or expose the truth.",
      onStartText:
        "Shaw is defeated, but you now hold the truth in your hands. Miguel's confession, his past crimes, everything. What do you do with it?",
      onCompleteText:
        'Your choice is made. The consequences will ripple through Salvation for years to come.',
      objectives: [
        {
          id: 'obj_protect_miguel',
          description: 'Destroy the evidence and protect Father Miguel',
          type: 'interact',
          target: 'destroy_evidence',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'He has spent 15 years atoning. Let the past die. Gains Church reputation.',
        },
        {
          id: 'obj_expose_miguel',
          description: 'Expose Father Miguel to the congregation',
          type: 'talk',
          target: NPC_IDS.PREACHER_SOLOMON,
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'The truth must come out, regardless of the cost. Gains Law reputation.',
        },
      ],
      stageRewards: {
        xp: 35,
        gold: 0,
        items: [],
        reputation: {}, // Varies by choice
      },
    },
    {
      id: 'stage_aftermath',
      title: 'The Aftermath',
      description: 'See the results of your choice.',
      onStartText: 'Time to face the consequences of your decision.',
      onCompleteText:
        "If you protected Miguel: 'You've given me a second chance at a second chance,' Miguel says with tears in his eyes. 'I will spend the rest of my days making this right.' If you exposed him: Miguel is led away, but nods at you with strange peace. 'Perhaps this was always meant to be. Thank you for the truth.'",
      objectives: [
        {
          id: 'obj_speak_miguel_final',
          description: 'Speak with Father Miguel one last time',
          type: 'talk',
          target: NPC_IDS.FATHER_MIGUEL,
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 30,
        gold: 50,
        items: [{ itemId: 'rosary_of_redemption', quantity: 1 }],
        reputation: { [FACTION_IDS.CHURCH]: 15 },
      },
    },
  ],

  rewards: {
    xp: 150,
    gold: 75,
    items: [{ itemId: 'rosary_of_redemption', quantity: 1 }],
    reputation: { [FACTION_IDS.CHURCH]: 20 },
    unlocksQuests: [],
  },
};

// ============================================================================
// SIDE QUEST REGISTRY
// ============================================================================

export const SIDE_QUESTS: Quest[] = [
  // Frontier's Edge
  SQ1_OldTimersTales,
  SQ2_SheriffsBounty,
  // Iron Gulch
  SQ3_SaloonBrawl,
  SQ4_DocsDilemma,
  SQ5_TheInformant,
  SQ10_GamblersDebt,
  SQ11_CogsworthsContraption,
  SQ13_WidowsLocket,
  SQ14_MineShaftRescue,
  // Mesa Point
  SQ6_TheInformantsPrice,
  SQ7_BountyHuntersMark,
  SQ12_BellesBounty,
  // Coldwater
  SQ8_CattleRustlers,
  SQ9_TheWanderersTale,
  // Salvation
  SQ15_PreachersPast,
];

export const SIDE_QUESTS_BY_ID: Record<string, Quest> = Object.fromEntries(
  SIDE_QUESTS.map((q) => [q.id, q])
);

export const SIDE_QUESTS_BY_LOCATION: Record<string, Quest[]> = {
  [TOWN_IDS.FRONTIERS_EDGE]: [SQ1_OldTimersTales, SQ2_SheriffsBounty],
  [TOWN_IDS.IRON_GULCH]: [
    SQ3_SaloonBrawl,
    SQ4_DocsDilemma,
    SQ5_TheInformant,
    SQ10_GamblersDebt,
    SQ11_CogsworthsContraption,
    SQ13_WidowsLocket,
    SQ14_MineShaftRescue,
  ],
  [TOWN_IDS.MESA_POINT]: [SQ6_TheInformantsPrice, SQ7_BountyHuntersMark, SQ12_BellesBounty],
  [TOWN_IDS.COLDWATER]: [SQ8_CattleRustlers, SQ9_TheWanderersTale],
  [TOWN_IDS.SALVATION]: [SQ15_PreachersPast],
};
