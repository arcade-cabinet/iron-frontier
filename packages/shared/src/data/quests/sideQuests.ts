/**
 * Iron Frontier - Side Quest Definitions
 *
 * Optional side quests that enrich the world and provide
 * additional content, rewards, and character development.
 *
 * Side quests are organized by town:
 * - Frontier's Edge: 2 quests (SQ1, SQ2)
 * - Iron Gulch: 3 quests (SQ3, SQ4, SQ5)
 * - Mesa Point: 2 quests (SQ6, SQ7)
 * - Coldwater: 2 quests (SQ8, SQ9)
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
  // Mesa Point
  SQ6_TheInformantsPrice,
  SQ7_BountyHuntersMark,
  // Coldwater
  SQ8_CattleRustlers,
  SQ9_TheWanderersTale,
];

export const SIDE_QUESTS_BY_ID: Record<string, Quest> = Object.fromEntries(
  SIDE_QUESTS.map((q) => [q.id, q])
);

export const SIDE_QUESTS_BY_LOCATION: Record<string, Quest[]> = {
  [TOWN_IDS.FRONTIERS_EDGE]: [SQ1_OldTimersTales, SQ2_SheriffsBounty],
  [TOWN_IDS.IRON_GULCH]: [SQ3_SaloonBrawl, SQ4_DocsDilemma, SQ5_TheInformant],
  [TOWN_IDS.MESA_POINT]: [SQ6_TheInformantsPrice, SQ7_BountyHuntersMark],
  [TOWN_IDS.COLDWATER]: [SQ8_CattleRustlers, SQ9_TheWanderersTale],
};
