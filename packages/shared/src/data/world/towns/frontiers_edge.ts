/**
 * Frontier's Edge - Starting Town
 *
 * A small frontier outpost that serves as the tutorial area.
 * The player arrives here and learns the basic mechanics before
 * heading to Iron Gulch.
 *
 * Theme: Tutorial/starter, small frontier outpost
 * Act: Prologue
 */

import type { DialogueTree, NPCDefinition } from '../../schemas/npc';
import type { Quest } from '../../schemas/quest';
import type { ShopDefinition } from '../../shops/index';
import type { Town } from '../townSchema';

// ============================================================================
// NPCs
// ============================================================================

export const SheriffJake: NPCDefinition = {
  id: 'sheriff_jake',
  name: 'Jake Harmon',
  title: 'Sheriff',
  role: 'sheriff',
  faction: 'neutral',
  locationId: 'frontiers_edge',
  spawnCoord: { q: 8, r: 12 },
  personality: {
    aggression: 0.3,
    friendliness: 0.7,
    curiosity: 0.4,
    greed: 0.1,
    honesty: 0.8,
    lawfulness: 0.9,
  },
  description:
    'A younger sheriff with an earnest face and a well-maintained badge. He takes his duties seriously despite the quiet nature of this outpost.',
  portraitId: 'sheriff_jake',
  dialogueTreeIds: ['sheriff_jake_main'],
  primaryDialogueId: 'sheriff_jake_main',
  essential: true,
  questGiver: true,
  questIds: ['first_steps', 'missing_prospector'],
  backstory:
    "Jake took the sheriff position after his father retired. He's eager to prove himself but hasn't faced any real challenges yet. The Missing Prospector case is his first serious investigation.",
  relationships: [
    { npcId: 'martha_hawkins', type: 'ally', notes: 'Regular customer, trusted friend' },
    { npcId: 'old_timer_gus', type: 'ally', notes: 'Respects his wisdom' },
  ],
  tags: ['authority', 'tutorial', 'quest_giver'],
};

export const MarthaHawkins: NPCDefinition = {
  id: 'martha_hawkins',
  name: 'Martha Hawkins',
  title: '',
  role: 'merchant',
  faction: 'neutral',
  locationId: 'frontiers_edge',
  spawnCoord: { q: 12, r: 8 },
  personality: {
    aggression: 0.1,
    friendliness: 0.8,
    curiosity: 0.5,
    greed: 0.4,
    honesty: 0.7,
    lawfulness: 0.7,
  },
  description:
    'A practical woman in her forties with calloused hands and a warm smile. She runs the only store in town with quiet efficiency.',
  portraitId: 'martha_hawkins',
  dialogueTreeIds: ['martha_hawkins_main'],
  primaryDialogueId: 'martha_hawkins_main',
  essential: true,
  questGiver: false,
  questIds: [],
  shopId: 'frontiers_edge_general',
  backstory:
    "Martha came west with her husband twenty years ago. After he died in a mining accident, she took over the store and never looked back. She's the heart of this small community.",
  relationships: [
    { npcId: 'sheriff_jake', type: 'ally', notes: 'Motherly affection for the young sheriff' },
    { npcId: 'old_timer_gus', type: 'ally', notes: 'Old friends, share supplies' },
  ],
  tags: ['merchant', 'tutorial', 'shop'],
};

export const OldTimerGus: NPCDefinition = {
  id: 'old_timer_gus',
  name: 'Augustus "Gus" Wheeler',
  title: 'Old Timer',
  role: 'prospector',
  faction: 'neutral',
  locationId: 'frontiers_edge',
  spawnCoord: { q: 6, r: 16 },
  personality: {
    aggression: 0.2,
    friendliness: 0.6,
    curiosity: 0.3,
    greed: 0.2,
    honesty: 0.8,
    lawfulness: 0.5,
  },
  description:
    "A grizzled old prospector with a silver beard and eyes that have seen decades of frontier life. He sits on the inn's porch most days, watching the world go by.",
  portraitId: 'old_timer_gus',
  dialogueTreeIds: ['old_timer_gus_main'],
  primaryDialogueId: 'old_timer_gus_main',
  essential: false,
  questGiver: false,
  questIds: [],
  backstory:
    "Gus struck it rich once, lost it all gambling, and has been scraping by ever since. He knows every trail, mine, and hideout in the territory. He's the one who tells the player about Iron Gulch.",
  relationships: [
    { npcId: 'martha_hawkins', type: 'ally', notes: 'She gives him credit at the store' },
    { npcId: 'sheriff_jake', type: 'ally', notes: 'Tells him old war stories' },
  ],
  tags: ['lore', 'hints', 'tutorial', 'prospector'],
};

// ============================================================================
// DIALOGUES
// ============================================================================

export const SheriffJakeMainDialogue: DialogueTree = {
  id: 'sheriff_jake_main',
  name: 'Sheriff Jake - Main Conversation',
  description: 'Primary dialogue for Sheriff Jake Harmon in Frontiers Edge',
  tags: ['frontiers_edge', 'authority', 'tutorial', 'quest_giver'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'quest_first_steps_active',
      conditions: [{ type: 'quest_active', target: 'first_steps' }],
      priority: 5,
    },
    {
      nodeId: 'quest_first_steps_complete',
      conditions: [{ type: 'quest_complete', target: 'first_steps' }],
      priority: 4,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
    // First meeting
    {
      id: 'first_meeting',
      text: "Well now, a new face in Frontier's Edge! Name's Jake Harmon, I'm the sheriff around here. Just got off the stage, did ya? Welcome to the edge of civilization, friend.",
      expression: 'friendly',
      choices: [
        {
          text: "Thanks. What's there to do around here?",
          nextNodeId: 'explain_town',
        },
        {
          text: "I'm looking for work.",
          nextNodeId: 'work_available',
        },
        {
          text: "Just passing through to Iron Gulch.",
          nextNodeId: 'iron_gulch_warning',
        },
      ],
    },
    {
      id: 'explain_town',
      text: "Not much, truth be told. We got Martha's general store for supplies, a small inn for rest, and my office if you need the law. Most folks here are just passin' through to the bigger towns. Iron Gulch is a day's ride east - that's where the real action is.",
      choices: [
        {
          text: 'Tell me about Iron Gulch.',
          nextNodeId: 'about_iron_gulch',
        },
        {
          text: 'Any trouble around here?',
          nextNodeId: 'local_trouble',
        },
        {
          text: "I'll look around. Thanks.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'first_steps' }],
        },
      ],
    },
    {
      id: 'work_available',
      text: "Work? Well, I ain't got much to offer myself, but tell you what - get yourself familiar with the town, talk to folks, and maybe check in with me later. I might have somethin' for someone who proves they can handle themselves.",
      choices: [
        {
          text: "I'll do that.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'first_steps' }],
        },
      ],
    },
    {
      id: 'iron_gulch_warning',
      text: "*Raises an eyebrow* Iron Gulch, eh? Big mining town, lots of opportunity - and lots of trouble. Word of advice: don't go signin' any contracts with IVRC without readin' the fine print. And watch yourself in the saloon. Miners play rough.",
      choices: [
        {
          text: "What's IVRC?",
          nextNodeId: 'about_ivrc',
        },
        {
          text: "Thanks for the warning. I'll be careful.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'warned_about_iron_gulch' }],
        },
      ],
    },
    {
      id: 'about_iron_gulch',
      text: "Iron Gulch is the heart of mining country. Copper, iron, even some gold if you dig deep enough. The Iron Valley Railroad Company - that's IVRC - runs most of the big operations. Good wages, but they work you hard. Real hard.",
      choices: [
        {
          text: "Sounds like there's a 'but' coming.",
          nextNodeId: 'ivrc_problems',
        },
        {
          text: "I'll check it out. Thanks.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'ivrc_problems',
      text: "*Lowers his voice* There's been talk. Accidents in the mines that shouldn't have happened. Workers who went in and didn't come out. And lately, talk of sabotage. Someone's got it in for the company, and the company's cracking down hard on anyone they suspect.",
      choices: [
        {
          text: 'Sounds dangerous.',
          nextNodeId: 'dangerous_agree',
        },
        {
          text: "That's none of my business.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'dangerous_agree',
      text: "It is. But opportunity and danger ride the same horse out here. Just... keep your wits about you. And if you hear anything about a prospector named Tom Finch, let me know. He was headed to Iron Gulch a week ago and nobody's seen him since.",
      choices: [
        {
          text: 'Tom Finch? I could look into that.',
          nextNodeId: 'missing_prospector_hook',
        },
        {
          text: "I'll keep my ears open.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'heard_about_tom_finch' }],
        },
      ],
    },
    {
      id: 'missing_prospector_hook',
      text: "*His face brightens* You would? That'd be a real help. Tom's an old friend of Gus - that's the old timer who sits by the inn. He might know more about where Tom was headed. Find out what you can, and report back to me.",
      choices: [
        {
          text: "I'll find him.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'missing_prospector' }],
        },
      ],
    },
    {
      id: 'local_trouble',
      text: "Trouble? Nah, Frontier's Edge is quiet as a church mouse. Mostly. We get the occasional drifter causing problems, but nothing serious. Now, the road to Iron Gulch - that's another story. Bandits, wildlife, the usual frontier hazards.",
      choices: [
        {
          text: 'Any bandits I should watch out for?',
          nextNodeId: 'bandit_warning',
        },
        {
          text: "I'll be careful on the road.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'bandit_warning',
      text: "Keep an eye out for anyone wearing a rattlesnake bandana. That's the mark of the Copperhead Gang. They've been hitting travelers on the main roads. Mostly just robbery, but they've gotten violent when folks resist.",
      choices: [
        {
          text: 'Good to know. Thanks.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'warned_about_copperheads' }],
        },
      ],
    },
    {
      id: 'about_ivrc',
      text: "Iron Valley Railroad Company. They own most of the mining operations in these parts, plus the railroad that hauls the ore out. Powerful folks with deep pockets. Not the kind of people you want as enemies.",
      choices: [
        {
          text: 'Are they the good guys or the bad guys?',
          nextNodeId: 'ivrc_moral',
        },
        {
          text: "I'll keep that in mind.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'ivrc_moral',
      text: "*Scratches his chin* That's... complicated. They bring jobs and money to the territory. But they also push hard to get what they want. Some say too hard. I'd say they're like most big outfits - good for some, bad for others. Depends on which side you're on.",
      choices: [
        {
          text: 'Wise words, Sheriff.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
    // Quest active states
    {
      id: 'quest_first_steps_active',
      text: "How's the tour going? Met everyone yet? Martha at the store, old Gus by the inn - they're good folks. Once you've gotten your bearings, come back and we can talk about that work I mentioned.",
      choices: [
        {
          text: "Still looking around. I'll be back.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'quest_first_steps_complete',
      text: "Good to see you again! You've been busy, I hear. Martha says you're a decent sort. That's good enough for me. Now, about that work - you heard about Tom Finch yet?",
      choices: [
        {
          text: 'The missing prospector? Tell me more.',
          nextNodeId: 'missing_prospector_hook',
        },
        {
          text: "Not yet. What's the story?",
          nextNodeId: 'tom_finch_intro',
        },
      ],
    },
    {
      id: 'tom_finch_intro',
      text: "Tom Finch is - was - a prospector. Friend of old Gus out there. He headed toward Iron Gulch about a week ago, said he'd found something big. Nobody's seen him since. Gus is worried sick.",
      choices: [
        {
          text: "I'll look for him.",
          nextNodeId: 'missing_prospector_hook',
        },
        {
          text: "That's not really my business.",
          nextNodeId: null,
        },
      ],
    },
    // Return greeting
    {
      id: 'return_greeting',
      text: "Welcome back, friend. Anything I can help you with?",
      choices: [
        {
          text: 'Any news?',
          nextNodeId: 'latest_news',
        },
        {
          text: 'Just checking in.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'latest_news',
      text: "Same old, same old. Quiet here, busy out there. If you're headed to Iron Gulch, watch yourself. I hear things are heating up at the mines.",
      choices: [
        {
          text: "Thanks for the heads up.",
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const MarthaHawkinsDialogue: DialogueTree = {
  id: 'martha_hawkins_main',
  name: 'Martha Hawkins - Main Conversation',
  description: 'Primary dialogue for Martha at the general store',
  tags: ['frontiers_edge', 'merchant', 'tutorial'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
    {
      id: 'first_meeting',
      text: "Welcome to Hawkins General Store! New in town, I see. I'm Martha. Whatever you need for the road ahead, I've probably got it. And if I don't, well, you won't find it anywhere closer than Iron Gulch.",
      expression: 'friendly',
      choices: [
        {
          text: "I'd like to see what you have.",
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'frontiers_edge_general' }],
        },
        {
          text: 'What can you tell me about this town?',
          nextNodeId: 'town_info',
        },
        {
          text: 'Just looking around for now.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'town_info',
      text: "Frontier's Edge? It's a small place, but honest. We're the last stop before the wild country. Jake keeps the peace, Gus tells his stories, and I keep everyone fed and supplied. Not much, but it's home.",
      choices: [
        {
          text: 'Sounds peaceful.',
          nextNodeId: 'peaceful_response',
        },
        {
          text: 'What about the road ahead?',
          nextNodeId: 'road_info',
        },
      ],
    },
    {
      id: 'peaceful_response',
      text: "*Smiles* It is, mostly. The excitement's all out there - in Iron Gulch and beyond. But don't let the quiet fool you. Even out here, trouble can find you if you're not careful.",
      choices: [
        {
          text: "I'll keep that in mind. Let me see your goods.",
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'frontiers_edge_general' }],
        },
      ],
    },
    {
      id: 'road_info',
      text: "The Dusty Trail to Iron Gulch is about a day's journey. Make sure you've got enough water and provisions. The desert doesn't forgive poor planning. And keep your eyes peeled - I've heard there are bandits about.",
      choices: [
        {
          text: 'I should stock up then.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'frontiers_edge_general' }],
        },
        {
          text: "Thanks for the advice.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "Back again! Need to stock up on supplies?",
      choices: [
        {
          text: 'Show me what you have.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'frontiers_edge_general' }],
        },
        {
          text: 'Just browsing.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const OldTimerGusDialogue: DialogueTree = {
  id: 'old_timer_gus_main',
  name: 'Old Timer Gus - Main Conversation',
  description: 'Primary dialogue for Gus, the lore-giving prospector',
  tags: ['frontiers_edge', 'lore', 'hints'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'missing_prospector_active',
      conditions: [{ type: 'quest_active', target: 'missing_prospector' }],
      priority: 5,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
    {
      id: 'first_meeting',
      text: "*Squints at you from under a battered hat* Hm. Another young fool headed for the mountains, I reckon. I've seen a hundred like you come through. Not all of 'em came back. Name's Gus. Used to be a prospector myself, back when my knees worked.",
      expression: 'suspicious',
      choices: [
        {
          text: "I'm not a fool. I know what I'm doing.",
          nextNodeId: 'overconfident_response',
        },
        {
          text: 'What can you tell me about this territory?',
          nextNodeId: 'territory_lore',
        },
        {
          text: 'Nice to meet you, Gus.',
          nextNodeId: 'polite_response',
        },
      ],
    },
    {
      id: 'overconfident_response',
      text: "*Chuckles* That's what they all say. Listen here, youngster - the frontier don't care how tough you think you are. It'll chew you up and spit you out regardless. Humility keeps you alive out here.",
      choices: [
        {
          text: "Point taken. What should I know?",
          nextNodeId: 'territory_lore',
        },
      ],
    },
    {
      id: 'polite_response',
      text: "*His expression softens slightly* Hm. Polite, at least. That's more than most. Sit a spell if you like. I got stories, and it's been too long since someone listened.",
      choices: [
        {
          text: "I'd like to hear them.",
          nextNodeId: 'territory_lore',
        },
        {
          text: 'Maybe later.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'territory_lore',
      text: "This here's the edge of everything - civilization behind you, wilderness ahead. Iron Gulch is the big prize everyone's after. Copper and iron mostly, but there's whispers of gold too. IVRC controls most of it now, but there's independent claims if you know where to look.",
      choices: [
        {
          text: 'Tell me about Iron Gulch.',
          nextNodeId: 'iron_gulch_lore',
        },
        {
          text: "What's IVRC?",
          nextNodeId: 'ivrc_lore',
        },
        {
          text: 'Where are these independent claims?',
          nextNodeId: 'independent_claims',
        },
      ],
    },
    {
      id: 'iron_gulch_lore',
      text: "Iron Gulch is a mining boomtown. Rough place full of rough people. The saloon serves rotgut that'll strip the lining off your stomach, and the company store charges three times what Martha does. But if you want work or adventure, that's where you'll find it.",
      choices: [
        {
          text: 'Sounds like my kind of place.',
          nextNodeId: 'adventure_warning',
        },
        {
          text: 'What about the other towns?',
          nextNodeId: 'other_towns',
        },
      ],
    },
    {
      id: 'adventure_warning',
      text: "*Laughs* Youth. Always in a hurry to get into trouble. Well, don't say old Gus didn't warn you. And if you're headed that way, keep your eyes on the road. My friend Tom went that way a week ago and hasn't come back.",
      choices: [
        {
          text: 'Tom? Tell me about him.',
          nextNodeId: 'tom_finch_info',
        },
        {
          text: "I'll be careful.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'tom_finch_info',
      text: "*His face falls* Tom Finch. Good man, better prospector. He said he found something big - wouldn't tell me what - and headed for Iron Gulch to file a claim. Should've been back by now. I got a bad feeling about it.",
      choices: [
        {
          text: 'Where exactly was he headed?',
          nextNodeId: 'tom_directions',
        },
        {
          text: "Maybe he just got delayed.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'tom_directions',
      text: "He was following the Dusty Trail, but he mentioned taking a shortcut through Coyote Canyon. Faster, but more dangerous. If something happened to him, that's where it happened. I'd look myself if these old bones could make the trip.",
      choices: [
        {
          text: "I'll keep an eye out for him.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'gus_told_about_tom' }],
        },
      ],
    },
    {
      id: 'ivrc_lore',
      text: "Iron Valley Railroad Company. Started as just a railroad outfit, but they've got their fingers in everything now. Mining, commerce, politics. Some say they're building an empire. Others say they already built it. Either way, they're the biggest power in the territory.",
      choices: [
        {
          text: 'Are they good or bad?',
          nextNodeId: 'ivrc_opinion',
        },
        {
          text: 'How do you compete with that?',
          nextNodeId: 'independent_claims',
        },
      ],
    },
    {
      id: 'ivrc_opinion',
      text: "*Spits* Depends who you ask. They bring jobs and order. But I've seen what happens to folks who get in their way. Miners worked to death, families pushed off their land. Progress, they call it. Looks like greed to me.",
      choices: [
        {
          text: "Sounds like there's resistance.",
          nextNodeId: 'resistance_info',
        },
        {
          text: "I'll form my own opinion.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'resistance_info',
      text: "There's the Freeminers up in the mountains - independent prospectors who won't sell out. And there's the Copperheads - outlaws who hit IVRC hard whenever they can. Which side you choose... well, that's up to you.",
      choices: [
        {
          text: 'Useful to know.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'independent_claims',
      text: "The Freeminers hold some territory up in the Iron Mountains. Hard to reach, harder to work, but free from IVRC control. If you want honest work outside company oversight, that's your best bet. Ask for Old Samuel Ironpick - he's their leader.",
      choices: [
        {
          text: "I'll remember that.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'heard_about_freeminers' }],
        },
      ],
    },
    {
      id: 'other_towns',
      text: "Besides Iron Gulch? There's Mesa Point - outlaw territory, avoid it if you value your wallet. Coldwater's a ranching community, peaceful folk. And way out in the badlands, there's a religious settlement called Salvation. Strange folks, but they mean well.",
      choices: [
        {
          text: 'Tell me more about Mesa Point.',
          nextNodeId: 'mesa_point_info',
        },
        {
          text: "Thanks for the overview.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'mesa_point_info',
      text: "Copperhead territory. The gang runs things there, though they call it a 'free settlement.' If you've got business with outlaws, that's where you go. Otherwise, steer clear. They don't take kindly to strangers - or lawmen.",
      choices: [
        {
          text: "I'll keep my distance.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'missing_prospector_active',
      text: "*Looks hopeful* Any news about Tom? Did you find anything on the road?",
      choices: [
        {
          text: "I'm still looking.",
          nextNodeId: 'still_searching',
        },
        {
          text: 'Where did you say he was headed?',
          nextNodeId: 'tom_directions',
        },
      ],
    },
    {
      id: 'still_searching',
      text: "*Sighs* Please, keep trying. Tom's a survivor, but everyone's luck runs out eventually. Check Coyote Canyon if you haven't already. And... thank you. For caring about an old man's friend.",
      choices: [
        {
          text: "I won't give up.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "Back again? Pull up a chair. Got more stories if you've got the time.",
      choices: [
        {
          text: 'What else can you tell me about the territory?',
          nextNodeId: 'territory_lore',
        },
        {
          text: 'Just passing through.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

// ============================================================================
// SHOPS
// ============================================================================

export const FrontiersEdgeGeneralStore: ShopDefinition = {
  id: 'frontiers_edge_general',
  name: "Hawkins General Store",
  description: "The only store in Frontier's Edge. Basic supplies for the road ahead.",
  ownerId: 'martha_hawkins',
  inventory: [
    // Basic supplies
    { itemId: 'trail_biscuits', stock: 15, priceModifier: 1.0 },
    { itemId: 'dried_jerky', stock: 10, priceModifier: 1.0 },
    { itemId: 'water_canteen', stock: 5, priceModifier: 1.0 },
    { itemId: 'coffee_beans', stock: 5, priceModifier: 1.0 },

    // Medical
    { itemId: 'bandages', stock: 8, priceModifier: 1.0 },
    { itemId: 'herbal_remedy', stock: 3, priceModifier: 1.1 },

    // Basic equipment
    { itemId: 'rope', stock: 3, priceModifier: 1.0 },
    { itemId: 'lantern', stock: 2, priceModifier: 1.0 },
    { itemId: 'oil_can', stock: 5, priceModifier: 1.0 },

    // Ammo
    { itemId: 'revolver_ammo', stock: 30, priceModifier: 1.0 },
    { itemId: 'rifle_ammo', stock: 20, priceModifier: 1.0 },

    // Basic weapons
    { itemId: 'hunting_knife', stock: 2, priceModifier: 1.0 },
  ],
  buyModifier: 0.4,
  canSell: true,
  acceptedTypes: ['weapon', 'consumable', 'junk'],
  tags: ['general', 'frontiers_edge', 'tutorial'],
};

// ============================================================================
// QUESTS
// ============================================================================

export const FirstStepsQuest: Quest = {
  id: 'first_steps',
  title: 'First Steps',
  description:
    "Get your bearings in Frontier's Edge. Talk to the locals and learn about the territory.",
  type: 'side',
  giverNpcId: 'sheriff_jake',
  startLocationId: 'frontiers_edge',
  recommendedLevel: 1,
  tags: ['tutorial', 'introduction'],
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
      title: 'Explore the Town',
      description: "Look around Frontier's Edge and talk to the residents.",
      onStartText:
        "You've arrived at Frontier's Edge. Take some time to explore and meet the locals.",
      onCompleteText: "You've gotten to know the town. Sheriff Jake might have more for you to do.",
      objectives: [
        {
          id: 'obj_talk_martha',
          description: "Visit Martha's general store",
          type: 'talk',
          target: 'martha_hawkins',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_talk_gus',
          description: 'Speak with Old Timer Gus at the inn',
          type: 'talk',
          target: 'old_timer_gus',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 20,
        gold: 5,
        items: [],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 30,
    gold: 10,
    items: [],
    reputation: {},
    unlocksQuests: ['missing_prospector'],
  },
};

export const MissingProspectorQuest: Quest = {
  id: 'missing_prospector',
  title: 'The Missing Prospector',
  description:
    "Tom Finch, a friend of Old Timer Gus, went missing on the road to Iron Gulch. Find out what happened to him.",
  type: 'side',
  giverNpcId: 'sheriff_jake',
  startLocationId: 'frontiers_edge',
  recommendedLevel: 1,
  tags: ['investigation', 'tutorial_finale'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['first_steps'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_investigate',
      title: 'Investigate the Trail',
      description: "Follow the Dusty Trail toward Iron Gulch and look for signs of Tom Finch.",
      onStartText:
        "Tom Finch was last seen heading toward Iron Gulch. Check the trail, especially Coyote Canyon.",
      onCompleteText:
        "You found Tom's trail. It leads into Coyote Canyon where there are signs of a struggle.",
      objectives: [
        {
          id: 'obj_search_trail',
          description: 'Search the Dusty Trail for clues',
          type: 'visit',
          target: 'dusty_trail_marker_1',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_find_clue',
          description: "Find Tom's belongings",
          type: 'collect',
          target: 'toms_hat',
          count: 1,
          current: 0,
          optional: false,
          hidden: true,
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
      id: 'stage_canyon',
      title: 'Search Coyote Canyon',
      description:
        'The trail leads into Coyote Canyon. Find out what happened to Tom.',
      onStartText:
        "Tom's hat was found at the entrance to Coyote Canyon. Something bad happened here.",
      onCompleteText:
        "You found Tom - wounded but alive. Bandits attacked him and left him for dead. He needs help getting back to town.",
      objectives: [
        {
          id: 'obj_find_tom',
          description: 'Locate Tom Finch in Coyote Canyon',
          type: 'talk',
          target: 'tom_finch_wounded',
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
      id: 'stage_return',
      title: 'Return to Town',
      description:
        "Get Tom back to Frontier's Edge and report to Sheriff Jake.",
      onStartText:
        'Tom is weak but can walk with help. Get him back to safety.',
      onCompleteText:
        "Tom is safe. Sheriff Jake is grateful for your help, and Old Timer Gus is overjoyed to see his friend alive.",
      objectives: [
        {
          id: 'obj_return_tom',
          description: "Escort Tom back to Frontier's Edge",
          type: 'visit',
          target: 'frontiers_edge',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_report_jake',
          description: 'Report to Sheriff Jake',
          type: 'talk',
          target: 'sheriff_jake',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 30,
        gold: 15,
        items: [],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 75,
    gold: 25,
    items: [{ itemId: 'herbal_remedy', quantity: 3 }],
    reputation: { townfolk: 15 },
    unlocksQuests: [],
  },
};

// ============================================================================
// TOWN DEFINITION
// ============================================================================

export const FrontiersEdgeTown: Town = {
  id: 'frontiers_edge',
  name: "Frontier's Edge",
  description:
    "A small frontier outpost at the edge of civilization. The last stop before the wild country begins. Quiet and peaceful, it serves as a waystation for travelers heading to the mining towns.",
  theme: 'frontier',
  position: { x: 0, z: 0 },
  size: 'small',

  npcs: ['sheriff_jake', 'martha_hawkins', 'old_timer_gus'],

  shops: [
    {
      id: 'frontiers_edge_general',
      name: "Hawkins General Store",
      type: 'general_store',
      operatorNpcId: 'martha_hawkins',
      shopInventoryId: 'frontiers_edge_general',
      hours: { open: 7, close: 20 },
      priceModifier: 1.0,
      description: 'Basic supplies for frontier travel.',
    },
  ],

  quests: ['first_steps', 'missing_prospector'],

  buildings: [
    {
      id: 'sheriff_office',
      type: 'sheriff_office',
      name: "Sheriff's Office",
      enterable: true,
      residentNpcIds: ['sheriff_jake'],
      tags: ['law', 'authority'],
    },
    {
      id: 'general_store',
      type: 'general_store',
      name: "Hawkins General Store",
      enterable: true,
      residentNpcIds: ['martha_hawkins'],
      tags: ['shop', 'supplies'],
    },
    {
      id: 'small_inn',
      type: 'hotel',
      name: "Traveler's Rest Inn",
      enterable: true,
      residentNpcIds: ['old_timer_gus'],
      tags: ['rest', 'lodging'],
    },
    {
      id: 'stables',
      type: 'stable',
      name: 'Town Stables',
      enterable: false,
      residentNpcIds: [],
      tags: ['horses', 'travel'],
    },
  ],

  startDiscovered: true,
  dangerLevel: 0,
  economyLevel: 3,
  lawLevel: 'orderly',

  lore: "Frontier's Edge was established twenty years ago as a waystation for prospectors heading into the Iron Mountains. It's never grown beyond a handful of buildings, but it serves its purpose well - a last taste of civilization before the wilderness.",

  mapIcon: 'outpost',

  entryPoints: [
    { id: 'main_road', direction: 'west' },
    { id: 'dusty_trail', direction: 'east', routeId: 'dusty_trail' },
  ],

  tags: ['starter', 'tutorial', 'safe'],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const FRONTIERS_EDGE_NPCS: NPCDefinition[] = [
  SheriffJake,
  MarthaHawkins,
  OldTimerGus,
];

export const FRONTIERS_EDGE_DIALOGUES: DialogueTree[] = [
  SheriffJakeMainDialogue,
  MarthaHawkinsDialogue,
  OldTimerGusDialogue,
];

export const FRONTIERS_EDGE_SHOPS: ShopDefinition[] = [
  FrontiersEdgeGeneralStore,
];

export const FRONTIERS_EDGE_QUESTS: Quest[] = [
  FirstStepsQuest,
  MissingProspectorQuest,
];
