/**
 * Dusty Springs - Transition Hub
 *
 * A larger frontier town that serves as the transition point between
 * the tutorial areas and the main story. It has more services than
 * Frontier's Edge but is not as industrial as Iron Gulch.
 *
 * This is where the main quest truly begins and players encounter
 * the existing NPCs like Sheriff Cole and Doc Chen.
 *
 * Theme: Transition hub, gateway to the territory
 * Act: Prologue -> Act 1
 */

import type { DialogueTree, NPCDefinition } from '../../schemas/npc';
import type { Quest } from '../../schemas/quest';
import type { ShopDefinition } from '../../shops/index';
import type { Town } from '../townSchema';

// ============================================================================
// NPCs (References to existing NPCs defined in /data/npcs/index.ts)
// Additional NPCs specific to this town file
// ============================================================================

export const DeputyMarshall: NPCDefinition = {
  id: 'deputy_marshall',
  name: 'Thomas Marshall',
  title: 'Deputy',
  role: 'sheriff',
  faction: 'neutral',
  locationId: 'dusty_springs',
  spawnCoord: { q: 18, r: 16 },
  personality: {
    aggression: 0.5,
    friendliness: 0.5,
    curiosity: 0.4,
    greed: 0.3,
    honesty: 0.7,
    lawfulness: 0.8,
  },
  description:
    'A young man trying hard to fill big shoes. He\'s earnest and eager to prove himself, though sometimes too quick to draw conclusions.',
  portraitId: 'deputy_marshall',
  dialogueTreeIds: ['deputy_marshall_main'],
  primaryDialogueId: 'deputy_marshall_main',
  essential: false,
  questGiver: false,
  questIds: [],
  backstory:
    "Thomas grew up idolizing Sheriff Cole and jumped at the chance to become his deputy. He's still green but learning fast. His biggest weakness is his eagerness to please.",
  relationships: [
    { npcId: 'sheriff_cole', type: 'ally', notes: 'Mentor and hero' },
  ],
  tags: ['law', 'authority', 'information'],
};

export const StablehandJim: NPCDefinition = {
  id: 'stablehand_jim',
  name: 'Jim Cooper',
  title: '',
  role: 'blacksmith',
  faction: 'neutral',
  locationId: 'dusty_springs',
  spawnCoord: { q: 22, r: 20 },
  personality: {
    aggression: 0.2,
    friendliness: 0.7,
    curiosity: 0.3,
    greed: 0.4,
    honesty: 0.7,
    lawfulness: 0.6,
  },
  description:
    'A lean young man with a ready smile and hands that know their way around horses. He runs the stables with quiet competence.',
  portraitId: 'stablehand_jim',
  dialogueTreeIds: ['stablehand_jim_main'],
  primaryDialogueId: 'stablehand_jim_main',
  essential: false,
  questGiver: false,
  questIds: [],
  shopId: 'dusty_springs_stable',
  backstory:
    "Jim was orphaned young and grew up in the stables. He knows every horse in the territory and most of their riders. He hears a lot of things people don't think stable boys notice.",
  relationships: [],
  tags: ['stables', 'information', 'horses'],
};

export const TelegraphOperatorPenny: NPCDefinition = {
  id: 'telegraph_penny',
  name: 'Penelope Wright',
  title: '',
  role: 'townsfolk',
  faction: 'ivrc',
  locationId: 'dusty_springs',
  spawnCoord: { q: 24, r: 14 },
  personality: {
    aggression: 0.1,
    friendliness: 0.6,
    curiosity: 0.7,
    greed: 0.3,
    honesty: 0.5,
    lawfulness: 0.6,
  },
  description:
    'A sharp-eyed woman in a neat dress, always with ink-stained fingers. She operates the IVRC telegraph office and knows more about everyone\'s business than she should.',
  portraitId: 'telegraph_penny',
  dialogueTreeIds: ['telegraph_penny_main'],
  primaryDialogueId: 'telegraph_penny_main',
  essential: false,
  questGiver: false,
  questIds: [],
  backstory:
    "Penny works for IVRC but her loyalties are complicated. She sees every telegram that passes through town - official and private. She's learned to keep secrets, but might share them for the right price.",
  relationships: [],
  tags: ['ivrc', 'information', 'telegraph'],
};

// ============================================================================
// DIALOGUES
// ============================================================================

export const DeputyMarshallDialogue: DialogueTree = {
  id: 'deputy_marshall_main',
  name: 'Deputy Marshall - Main Conversation',
  description: 'Primary dialogue for the deputy',
  tags: ['dusty_springs', 'law', 'information'],

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
      text: "*Straightens his badge* Howdy, stranger. I'm Deputy Marshall. Sheriff Cole's out on business, but if you need anything law-related, I'm your man. What can I do for you?",
      expression: 'eager',
      choices: [
        {
          text: 'Where is Sheriff Cole?',
          nextNodeId: 'cole_location',
        },
        {
          text: 'Any trouble in town?',
          nextNodeId: 'trouble_update',
        },
        {
          text: 'Just looking around.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'cole_location',
      text: "Sheriff's probably at the office or making rounds. He spends a lot of time there, especially lately. Been worried about something - won't tell me what, but I can tell it's eating at him.",
      choices: [
        {
          text: 'Any idea what it is?',
          nextNodeId: 'cole_worries',
        },
        {
          text: "I'll find him. Thanks.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'cole_worries',
      text: "*Lowers voice* Between you and me? I think it's about IVRC. He's been meeting with some Freeminer types, and you know how the railroad feels about that. I just hope he's not getting in over his head.",
      choices: [
        {
          text: "I'll be careful not to mention it.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'trouble_update',
      text: "Nothing major. Some drunks at the saloon, a dispute over a horse sale. The usual. *Pauses* Though we did have a building burn down a couple weeks back. Arson, Sheriff thinks, but we never caught who did it.",
      choices: [
        {
          text: 'What building?',
          nextNodeId: 'burned_building',
        },
        {
          text: 'Thanks for the update.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'burned_building',
      text: "Old place on Copper Street. Belonged to a miner's family before they left for the mountains. Nobody was hurt, thankfully. Sheriff's real interested in finding out who did it, but the trail's cold.",
      choices: [
        {
          text: 'I might look into it.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'deputy_mentioned_fire' }],
        },
        {
          text: 'Sounds like arson is serious.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "Back again! Need something from the law?",
      choices: [
        {
          text: 'Where is the Sheriff?',
          nextNodeId: 'cole_location',
        },
        {
          text: 'Just passing through.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const StablehandJimDialogue: DialogueTree = {
  id: 'stablehand_jim_main',
  name: 'Stablehand Jim - Main Conversation',
  description: 'Primary dialogue for the stablehand',
  tags: ['dusty_springs', 'stables', 'information'],

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
      text: "*Looks up from brushing a horse* Hey there! Need a horse, stable space, or just directions? Name's Jim, I run this place.",
      expression: 'friendly',
      choices: [
        {
          text: "I need supplies for the road.",
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'dusty_springs_stable' }],
        },
        {
          text: 'You must see a lot of travelers.',
          nextNodeId: 'travelers_info',
        },
        {
          text: 'Nice horses.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'travelers_info',
      text: "*Grins* All kinds. Miners heading to Iron Gulch, ranchers from Coldwater, sometimes even fancy railroad men in their city clothes. You learn a lot listening to folks when they think the stable boy isn't paying attention.",
      choices: [
        {
          text: 'Heard anything interesting lately?',
          nextNodeId: 'interesting_gossip',
        },
        {
          text: "I'm sure you do.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'interesting_gossip',
      text: "*Glances around* Well, there was this railroad man last week - all nervous-like. Kept asking about 'old projects' and someone named Ironpick. Left in a hurry when I said I'd never heard of him. Strange fellow.",
      onEnterEffects: [{ type: 'set_flag', target: 'jim_railroad_man_info' }],
      choices: [
        {
          text: 'Ironpick? What do you know about that name?',
          nextNodeId: 'ironpick_info',
        },
        {
          text: 'Interesting. Thanks.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'ironpick_info',
      text: "Just that there used to be a family by that name. Miners, real independent types. Had a place on Copper Street before it burned down. The old-timers say they had some kind of falling out with IVRC. Don't know the details.",
      choices: [
        {
          text: 'That burned building keeps coming up.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'jim_ironpick_info' }],
        },
        {
          text: 'Thanks for the information.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "Hey, welcome back! Need anything for your horse?",
      choices: [
        {
          text: 'Show me your supplies.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'dusty_springs_stable' }],
        },
        {
          text: 'Just visiting.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const TelegraphPennyDialogue: DialogueTree = {
  id: 'telegraph_penny_main',
  name: 'Telegraph Operator Penny - Main Conversation',
  description: 'Primary dialogue for the telegraph operator',
  tags: ['dusty_springs', 'ivrc', 'information'],

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
      text: "*Looks up from the telegraph machine* Can I help you? This is the IVRC Telegraph Office. Messages to anywhere in the territory, reasonable rates.",
      expression: 'professional',
      choices: [
        {
          text: 'I need to send a message.',
          nextNodeId: 'send_message',
        },
        {
          text: 'You work for IVRC?',
          nextNodeId: 'ivrc_discussion',
        },
        {
          text: 'Just looking.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'send_message',
      text: "Standard rate is five cents a word, minimum ten words. IVRC employees get a discount. Where's it going?",
      choices: [
        {
          text: "I'll come back later.",
          nextNodeId: null,
        },
        {
          text: 'Do you read all the messages that come through?',
          nextNodeId: 'reading_messages',
        },
      ],
    },
    {
      id: 'reading_messages',
      text: "*Slight smile* Officially, I'm just an operator. I transmit and receive, that's all. But between you and me, it's hard not to notice certain things when they click through the wire. Especially when IVRC's name keeps coming up in concerning ways.",
      choices: [
        {
          text: 'What kind of concerning ways?',
          nextNodeId: 'concerning_messages',
        },
        {
          text: 'Must be an interesting job.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'concerning_messages',
      text: "*Glances at the door* Lots of encrypted traffic lately. Higher-ups in Junction City, security directives, mentions of 'containment.' Something's got the company nervous. Whatever it is, they don't want the local offices to know details.",
      onEnterEffects: [{ type: 'set_flag', target: 'penny_suspicious_traffic' }],
      choices: [
        {
          text: 'Could you get me copies of those messages?',
          nextNodeId: 'copies_request',
        },
        {
          text: 'Interesting.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'copies_request',
      text: "*Hesitates* That would be... risky. Very risky. But if you could do something for me first, maybe we could work something out. There are people who need to know what IVRC is really up to.",
      choices: [
        {
          text: 'What do you need?',
          nextNodeId: 'penny_request',
        },
        {
          text: 'Never mind.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'penny_request',
      text: "My brother works in the Iron Gulch mines. He's been trying to organize the workers for better conditions, and IVRC knows. Get him out before they 'disappear' him, and I'll get you those messages.",
      onEnterEffects: [{ type: 'set_flag', target: 'penny_brother_quest' }],
      choices: [
        {
          text: "I'll see what I can do.",
          nextNodeId: null,
        },
        {
          text: "That's too dangerous.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'ivrc_discussion',
      text: "I work for their communications division. It's a job - pays well, keeps me informed. Whether I agree with everything they do is... a separate question. But a girl has to eat.",
      choices: [
        {
          text: 'You have doubts about them?',
          nextNodeId: 'doubts_discussion',
        },
        {
          text: 'Understandable.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'doubts_discussion',
      text: "*Sighs* I see what comes through the wire. Not just business - requests for 'security personnel,' orders to 'manage' problematic workers, payments to people who shouldn't be on any payroll. IVRC isn't what it pretends to be.",
      choices: [
        {
          text: 'Sounds like you know a lot.',
          nextNodeId: 'concerning_messages',
        },
        {
          text: 'Why stay?',
          nextNodeId: 'why_stay',
        },
      ],
    },
    {
      id: 'why_stay',
      text: "Because I can do more good from the inside. Information is power. And someday, when the right person comes along, that information might change everything. Maybe that person is you.",
      choices: [
        {
          text: 'Maybe it is.',
          nextNodeId: 'concerning_messages',
        },
        {
          text: "I'm just passing through.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "Back again. Need to send a message, or something else?",
      choices: [
        {
          text: 'Any news?',
          nextNodeId: 'concerning_messages',
        },
        {
          text: 'Just checking in.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

// ============================================================================
// SHOPS
// ============================================================================

export const DustySpringsGeneralStore: ShopDefinition = {
  id: 'dusty_springs_general',
  name: 'Dusty Springs General Store',
  description: 'A well-stocked general store serving the growing town.',
  ownerId: 'shop_keeper',
  inventory: [
    { itemId: 'trail_biscuits', stock: 25, priceModifier: 1.0 },
    { itemId: 'dried_jerky', stock: 20, priceModifier: 1.0 },
    { itemId: 'coffee_beans', stock: 15, priceModifier: 1.0 },
    { itemId: 'water_canteen', stock: 8, priceModifier: 1.0 },
    { itemId: 'whiskey', stock: 15, priceModifier: 1.0 },

    { itemId: 'bandages', stock: 12, priceModifier: 1.0 },
    { itemId: 'herbal_remedy', stock: 8, priceModifier: 1.0 },

    { itemId: 'rope', stock: 6, priceModifier: 1.0 },
    { itemId: 'lantern', stock: 4, priceModifier: 1.0 },
    { itemId: 'oil_can', stock: 10, priceModifier: 1.0 },

    { itemId: 'revolver_ammo', stock: 60, priceModifier: 1.0 },
    { itemId: 'rifle_ammo', stock: 40, priceModifier: 1.0 },
    { itemId: 'shotgun_shells', stock: 30, priceModifier: 1.0 },

    { itemId: 'hunting_knife', stock: 3, priceModifier: 1.0 },
  ],
  buyModifier: 0.5,
  canSell: true,
  acceptedTypes: ['weapon', 'armor', 'consumable', 'junk'],
  tags: ['general', 'dusty_springs'],
};

export const DustySpringsStable: ShopDefinition = {
  id: 'dusty_springs_stable',
  name: 'Cooper Stables',
  description: 'Horse supplies and travel provisions.',
  ownerId: 'stablehand_jim',
  inventory: [
    { itemId: 'water_canteen', stock: 10, priceModifier: 0.95 },
    { itemId: 'trail_biscuits', stock: 15, priceModifier: 0.95 },
    { itemId: 'dried_jerky', stock: 12, priceModifier: 0.95 },
    { itemId: 'rope', stock: 8, priceModifier: 0.95 },
    { itemId: 'lantern', stock: 3, priceModifier: 1.0 },
  ],
  buyModifier: 0.4,
  canSell: true,
  acceptedTypes: ['junk'],
  tags: ['stable', 'travel', 'dusty_springs'],
};

export const DustySpringsGunsmith: ShopDefinition = {
  id: 'dusty_springs_gunsmith',
  name: "Pete's Firearms",
  description: 'Quality firearms and ammunition.',
  ownerId: 'gunsmith_pete',
  inventory: [
    { itemId: 'revolver', stock: 4, priceModifier: 1.0 },
    { itemId: 'navy_revolver', stock: 2, priceModifier: 1.0 },
    { itemId: 'hunting_rifle', stock: 3, priceModifier: 1.0 },
    { itemId: 'repeater', stock: 2, priceModifier: 1.1 },
    { itemId: 'shotgun', stock: 2, priceModifier: 1.0 },

    { itemId: 'revolver_ammo', stock: 100, priceModifier: 0.9 },
    { itemId: 'rifle_ammo', stock: 80, priceModifier: 0.9 },
    { itemId: 'shotgun_shells', stock: 60, priceModifier: 0.9 },
  ],
  buyModifier: 0.55,
  canSell: true,
  acceptedTypes: ['weapon'],
  tags: ['firearms', 'gunsmith', 'dusty_springs'],
};

// ============================================================================
// QUESTS
// ============================================================================

export const InvestigateOriginsQuest: Quest = {
  id: 'investigate_origins',
  title: 'Investigate Your Origins',
  description:
    "The mysterious letter brought you to Dusty Springs. The address leads to a burned building. Someone doesn't want you to find the truth.",
  type: 'main',
  giverNpcId: null,
  startLocationId: 'dusty_springs',
  recommendedLevel: 1,
  tags: ['main', 'mystery', 'introduction'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['missing_prospector'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_find_address',
      title: 'Find the Address',
      description: 'Locate 14 Copper Street mentioned in the mysterious letter.',
      onStartText:
        "The letter mentions an address: 14 Copper Street. Find it and discover what awaits you there.",
      onCompleteText:
        "The address leads to a burned-out building. Whatever was here has been destroyed.",
      objectives: [
        {
          id: 'obj_find_copper_street',
          description: 'Find 14 Copper Street',
          type: 'visit',
          target: 'copper_street_14',
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
      id: 'stage_investigate',
      title: 'Investigate the Ruins',
      description: 'Search the burned building for clues about who lived here and why it was destroyed.',
      onStartText:
        "The building burned recently. Search the ruins for anything that survived the fire.",
      onCompleteText:
        "You found a partial manifest mentioning the Freeminers and 'documents.' The fire was arson - someone wanted to destroy evidence.",
      objectives: [
        {
          id: 'obj_search_ruins',
          description: 'Search the burned building',
          type: 'interact',
          target: 'burned_building_search',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_find_clue',
          description: 'Find a surviving document',
          type: 'collect',
          target: 'partial_manifest',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 35,
        gold: 10,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_ask_around',
      title: 'Ask Around Town',
      description: 'Talk to the locals about the fire and the people who lived at 14 Copper Street.',
      onStartText:
        "Someone in town must know what happened here. Ask the sheriff, the merchants, anyone who might have information.",
      onCompleteText:
        "The building belonged to the Ironpick family - Freeminer leaders who fled to the mountains. IVRC was seen here before the fire.",
      objectives: [
        {
          id: 'obj_talk_sheriff',
          description: 'Ask Sheriff Cole about the fire',
          type: 'talk',
          target: 'sheriff_cole',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_gather_info',
          description: 'Gather information from townsfolk',
          type: 'talk',
          target: 'various_townsfolk',
          count: 2,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 40,
        gold: 15,
        items: [],
        reputation: { law: 10 },
      },
    },
  ],

  rewards: {
    xp: 100,
    gold: 25,
    items: [],
    reputation: { freeminers: 15 },
    unlocksQuests: ['deep_trouble'],
  },
};

// ============================================================================
// TOWN DEFINITION
// ============================================================================

export const DustySpringsTown: Town = {
  id: 'dusty_springs',
  name: 'Dusty Springs',
  description:
    "A growing frontier town that serves as the gateway to the territory's mining operations. Larger than an outpost but still rough around the edges, it's where civilization meets the wild.",
  theme: 'frontier',
  position: { x: 50, z: 25 },
  size: 'medium',

  npcs: [
    'sheriff_cole',
    'mayor_holt',
    'doc_chen',
    'father_miguel',
    'deputy_marshall',
    'stablehand_jim',
    'telegraph_penny',
  ],

  shops: [
    {
      id: 'dusty_springs_general',
      name: 'Dusty Springs General Store',
      type: 'general_store',
      operatorNpcId: 'shop_keeper',
      shopInventoryId: 'dusty_springs_general',
      hours: { open: 7, close: 20 },
      priceModifier: 1.0,
      description: 'General supplies for frontier life.',
    },
    {
      id: 'dusty_springs_stable',
      name: 'Cooper Stables',
      type: 'stable',
      operatorNpcId: 'stablehand_jim',
      shopInventoryId: 'dusty_springs_stable',
      hours: { open: 5, close: 21 },
      priceModifier: 0.95,
      description: 'Horse supplies and travel provisions.',
    },
    {
      id: 'doc_chen_shop',
      name: "Doc Chen's Medicine",
      type: 'doctor',
      operatorNpcId: 'doc_chen',
      shopInventoryId: 'doc_chen_shop',
      hours: null,
      priceModifier: 1.0,
      description: 'Medical supplies and treatments.',
    },
    {
      id: 'dusty_springs_gunsmith',
      name: "Pete's Firearms",
      type: 'gunsmith',
      operatorNpcId: 'gunsmith_pete',
      shopInventoryId: 'dusty_springs_gunsmith',
      hours: { open: 8, close: 18 },
      priceModifier: 1.0,
      description: 'Quality firearms and ammunition.',
    },
  ],

  quests: ['investigate_origins', 'investigate_disappearances', 'underground_railroad', 'sanctuary'],

  buildings: [
    {
      id: 'sheriff_office',
      type: 'sheriff_office',
      name: "Sheriff's Office",
      enterable: true,
      residentNpcIds: ['sheriff_cole', 'deputy_marshall'],
      tags: ['law', 'authority'],
    },
    {
      id: 'general_store',
      type: 'general_store',
      name: 'General Store',
      enterable: true,
      residentNpcIds: [],
      tags: ['shop', 'supplies'],
    },
    {
      id: 'doc_chen_office',
      type: 'doctor_office',
      name: "Doc Chen's Office",
      enterable: true,
      residentNpcIds: ['doc_chen'],
      tags: ['medical', 'healing'],
    },
    {
      id: 'holt_mansion',
      type: 'mansion',
      name: 'Holt Mansion',
      enterable: true,
      residentNpcIds: ['mayor_holt'],
      tags: ['authority', 'ivrc'],
    },
    {
      id: 'stables',
      type: 'stable',
      name: 'Cooper Stables',
      enterable: true,
      residentNpcIds: ['stablehand_jim'],
      tags: ['horses', 'travel'],
    },
    {
      id: 'telegraph_office',
      type: 'telegraph_office',
      name: 'IVRC Telegraph Office',
      enterable: true,
      residentNpcIds: ['telegraph_penny'],
      tags: ['ivrc', 'communication'],
    },
    {
      id: 'church',
      type: 'church',
      name: "St. Michael's Church",
      enterable: true,
      residentNpcIds: ['father_miguel'],
      tags: ['spiritual', 'sanctuary'],
    },
    {
      id: 'gunsmith',
      type: 'gunsmith',
      name: "Pete's Firearms",
      enterable: true,
      residentNpcIds: [],
      tags: ['weapons', 'shop'],
    },
    {
      id: 'saloon',
      type: 'saloon',
      name: 'Dusty Springs Saloon',
      enterable: true,
      residentNpcIds: [],
      tags: ['social', 'drinks'],
    },
    {
      id: 'burned_building',
      type: 'cabin',
      name: 'Burned Building (14 Copper Street)',
      enterable: true,
      residentNpcIds: [],
      tags: ['ruins', 'mystery', 'main_quest'],
    },
  ],

  startDiscovered: false,
  dangerLevel: 1,
  economyLevel: 6,
  lawLevel: 'frontier',

  lore: "Dusty Springs grew up around a natural spring in an otherwise dry valley. It's become the primary staging point for travelers heading to the mining towns in the mountains. IVRC has a strong presence here, but Sheriff Cole maintains an uneasy balance between company interests and local justice.",

  mapIcon: 'town',

  entryPoints: [
    { id: 'dusty_trail', direction: 'west', routeId: 'dusty_trail' },
    { id: 'iron_road', direction: 'east', routeId: 'iron_road' },
    { id: 'mountain_pass', direction: 'north', routeId: 'mountain_pass' },
  ],

  tags: ['transition', 'main_quest', 'services', 'prologue'],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const DUSTY_SPRINGS_NPCS: NPCDefinition[] = [
  DeputyMarshall,
  StablehandJim,
  TelegraphOperatorPenny,
];

export const DUSTY_SPRINGS_DIALOGUES: DialogueTree[] = [
  DeputyMarshallDialogue,
  StablehandJimDialogue,
  TelegraphPennyDialogue,
];

export const DUSTY_SPRINGS_SHOPS: ShopDefinition[] = [
  DustySpringsGeneralStore,
  DustySpringsStable,
  DustySpringsGunsmith,
];

export const DUSTY_SPRINGS_QUESTS: Quest[] = [
  InvestigateOriginsQuest,
];
