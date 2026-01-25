/**
 * Coldwater - Ranch Town
 *
 * A peaceful ranching community far from IVRC's direct influence.
 * The people here are honest and hardworking, but trouble has a way
 * of finding them. A respite from the conflict - but not immune to it.
 *
 * Theme: Peaceful ranching community
 * Act: 2
 */

import type { DialogueTree, NPCDefinition } from '../../schemas/npc';
import type { Quest } from '../../schemas/quest';
import type { ShopDefinition } from '../../shops/index';
import type { Town } from '../townSchema';

// ============================================================================
// NPCs
// ============================================================================

export const RancherMcGraw: NPCDefinition = {
  id: 'rancher_mcgraw',
  name: 'Walter McGraw',
  title: 'Rancher',
  role: 'rancher',
  faction: 'neutral',
  locationId: 'coldwater',
  spawnCoord: { q: 15, r: 10 },
  personality: {
    aggression: 0.3,
    friendliness: 0.7,
    curiosity: 0.3,
    greed: 0.3,
    honesty: 0.9,
    lawfulness: 0.7,
  },
  description:
    'A weathered man in his fifties with sun-leathered skin and strong hands. He built his ranch from nothing and defends it with quiet determination.',
  portraitId: 'rancher_mcgraw',
  dialogueTreeIds: ['rancher_mcgraw_main'],
  primaryDialogueId: 'rancher_mcgraw_main',
  essential: true,
  questGiver: true,
  questIds: ['cattle_rustlers'],
  backstory:
    "McGraw came west thirty years ago with nothing but a saddle and a dream. He built the Double M Ranch into the biggest operation in the valley. IVRC has been pressuring him to sell, but he'll die before he gives up his land.",
  relationships: [
    { npcId: 'vet_nell', type: 'ally', notes: 'She keeps his cattle healthy' },
    { npcId: 'the_wanderer', type: 'neutral', notes: 'Curious about the stranger' },
  ],
  tags: ['rancher', 'quest_giver', 'honest'],
};

export const VetNell: NPCDefinition = {
  id: 'vet_nell',
  name: 'Eleanor "Nell" Benson',
  title: 'Veterinarian',
  role: 'doctor',
  faction: 'neutral',
  locationId: 'coldwater',
  spawnCoord: { q: 18, r: 14 },
  personality: {
    aggression: 0.1,
    friendliness: 0.8,
    curiosity: 0.7,
    greed: 0.1,
    honesty: 0.9,
    lawfulness: 0.6,
  },
  description:
    'A kind woman in practical clothes, always with hay in her hair and dirt under her nails. She tends to animals with a gentle touch and cares for the community with equal devotion.',
  portraitId: 'vet_nell',
  dialogueTreeIds: ['vet_nell_main'],
  primaryDialogueId: 'vet_nell_main',
  essential: false,
  questGiver: false,
  questIds: [],
  shopId: 'coldwater_vet',
  backstory:
    "Nell was the first female veterinary student at an eastern college. When they wouldn't let her practice, she came west where credentials matter less than skill. Now she's the only animal doctor for fifty miles.",
  relationships: [
    { npcId: 'rancher_mcgraw', type: 'ally', notes: 'Works for him regularly' },
  ],
  tags: ['healer', 'animals', 'kind'],
};

export const TheWanderer: NPCDefinition = {
  id: 'the_wanderer',
  name: 'Unknown',
  title: 'The Wanderer',
  role: 'drifter',
  faction: 'neutral',
  locationId: 'coldwater',
  spawnCoord: { q: 12, r: 18 },
  personality: {
    aggression: 0.4,
    friendliness: 0.4,
    curiosity: 0.6,
    greed: 0.1,
    honesty: 0.6,
    lawfulness: 0.4,
  },
  description:
    'A mysterious figure who appeared in Coldwater a week ago. They speak little and watch everything. Something about their eyes suggests they have seen more than they should have.',
  portraitId: 'the_wanderer',
  dialogueTreeIds: ['the_wanderer_main'],
  primaryDialogueId: 'the_wanderer_main',
  essential: false,
  questGiver: true,
  questIds: ['wanderers_tale'],
  backstory:
    "The Wanderer is actually a survivor from IVRC's Project Remnant - a test subject who escaped when things went wrong. They're searching for others like themselves and for answers about what was done to them.",
  relationships: [],
  tags: ['mysterious', 'quest_giver', 'remnant'],
};

export const InnkeeperRose: NPCDefinition = {
  id: 'innkeeper_rose',
  name: 'Rose Calloway',
  title: 'Innkeeper',
  role: 'bartender',
  faction: 'neutral',
  locationId: 'coldwater',
  spawnCoord: { q: 20, r: 12 },
  personality: {
    aggression: 0.1,
    friendliness: 0.9,
    curiosity: 0.5,
    greed: 0.2,
    honesty: 0.8,
    lawfulness: 0.7,
  },
  description:
    'A plump, cheerful woman with rosy cheeks and a ready laugh. Her inn is the heart of the community, where everyone gathers to share news and enjoy her famous cooking.',
  portraitId: 'innkeeper_rose',
  dialogueTreeIds: ['innkeeper_rose_main'],
  primaryDialogueId: 'innkeeper_rose_main',
  essential: false,
  questGiver: false,
  questIds: [],
  shopId: 'coldwater_inn',
  backstory:
    "Rose and her late husband built the Coldwater Inn twenty years ago. When he passed, she kept it running on sheer stubbornness and good cooking. She treats every guest like family.",
  relationships: [],
  tags: ['innkeeper', 'friendly', 'rest'],
};

// ============================================================================
// DIALOGUES
// ============================================================================

export const RancherMcGrawDialogue: DialogueTree = {
  id: 'rancher_mcgraw_main',
  name: 'Rancher McGraw - Main Conversation',
  description: 'Primary dialogue for the ranch owner',
  tags: ['coldwater', 'rancher', 'quest_giver'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'quest_active',
      conditions: [{ type: 'quest_active', target: 'cattle_rustlers' }],
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
      text: "*Tips his hat* Afternoon, stranger. Don't get many visitors out here in Coldwater. You lost, or just looking for a quiet place to rest?",
      expression: 'friendly',
      choices: [
        {
          text: 'Just passing through, looking for honest work.',
          nextNodeId: 'work_response',
        },
        {
          text: 'What is this place?',
          nextNodeId: 'place_explanation',
        },
        {
          text: "Heard there was trouble out this way.",
          nextNodeId: 'trouble_inquiry',
        },
      ],
    },
    {
      id: 'work_response',
      text: "*Eyes brighten* Honest work? Mister, I've got plenty of that. I'm Walter McGraw, own the Double M Ranch. Been losing cattle lately - rustlers, I reckon. Could use someone handy with a gun and willing to ride.",
      choices: [
        {
          text: 'Rustlers? Tell me more.',
          nextNodeId: 'rustler_details',
        },
        {
          text: "What's the pay?",
          nextNodeId: 'pay_discussion',
        },
      ],
    },
    {
      id: 'rustler_details',
      text: "Started a few weeks back. Cattle disappearing from the south pasture, tracks heading toward the badlands. Could be Copperheads, could be independents, could be IVRC trying to pressure me into selling. I need someone to find out who and put a stop to it.",
      choices: [
        {
          text: "I'll help you.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'cattle_rustlers' }],
        },
        {
          text: 'Why would IVRC want your ranch?',
          nextNodeId: 'ivrc_pressure',
        },
      ],
    },
    {
      id: 'pay_discussion',
      text: "Fair wages for fair work. Fifty dollars to find the rustlers and another fifty to stop 'em. Plus whatever you recover from what they've stolen. That's more than most ranch hands make in a month.",
      choices: [
        {
          text: "I'm in.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'cattle_rustlers' }],
        },
        {
          text: 'Let me think about it.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'ivrc_pressure',
      text: "*Scowls* The railroad wants to run a line through my valley. Says it'll bring progress. What it'll bring is noise, smoke, and the end of everything I've built. They've made offers, then threats. Now my cattle are disappearing. Coincidence? I don't think so.",
      choices: [
        {
          text: "That's not right. I'll help you.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'cattle_rustlers' }],
        },
        {
          text: 'Can you prove IVRC is behind it?',
          nextNodeId: 'no_proof',
        },
      ],
    },
    {
      id: 'no_proof',
      text: "Proof? *Sighs* No. That's the problem. Could be anyone. But my gut tells me the railroad's involved. Find the rustlers, and maybe we'll get the proof we need.",
      choices: [
        {
          text: "I'll find the truth.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'cattle_rustlers' }],
        },
      ],
    },
    {
      id: 'place_explanation',
      text: "This is Coldwater, the best little ranching community you'll find anywhere. Named for the creek that runs through - cold as ice even in summer. We're far enough from the mines and the railroad that life moves at a gentler pace here.",
      choices: [
        {
          text: 'Sounds peaceful.',
          nextNodeId: 'peaceful_response',
        },
        {
          text: 'Is it always this quiet?',
          nextNodeId: 'trouble_inquiry',
        },
      ],
    },
    {
      id: 'peaceful_response',
      text: "It was. *His face darkens* Lately there's been trouble. Rustlers hitting the ranches, strangers passing through. And IVRC keeps sending men to talk about 'opportunities.' I don't like the feeling in my gut.",
      choices: [
        {
          text: 'Can I help?',
          nextNodeId: 'work_response',
        },
        {
          text: "I hope things settle down for you.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'trouble_inquiry',
      text: "*Nods grimly* You heard right. Been losing cattle, maybe twenty head in the last month. Someone's rustling, but we can't catch 'em. You look capable - interested in earning some money and doing some good?",
      choices: [
        {
          text: 'Tell me about the rustling.',
          nextNodeId: 'rustler_details',
        },
        {
          text: 'Maybe later.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'quest_active',
      text: "Any luck tracking those rustlers? The boys are getting nervous - another couple head went missing last night.",
      choices: [
        {
          text: 'Still working on it.',
          nextNodeId: 'working_on_it',
        },
        {
          text: 'Where were the cattle taken from?',
          nextNodeId: 'cattle_location',
        },
      ],
    },
    {
      id: 'working_on_it',
      text: "Keep at it. The trail's probably cold by now, but check the south pasture near the creek. That's where the last ones were taken. And be careful - whoever's doing this knows what they're about.",
      choices: [
        {
          text: "I'll find them.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'cattle_location',
      text: "South pasture, near where the creek bends. We found tracks leading into the hills toward the badlands. There's an old line shack out that way - abandoned now, but it'd make a good hiding spot.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_line_shack' }],
      choices: [
        {
          text: "I'll check it out.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "Afternoon! What brings you to the Double M today?",
      choices: [
        {
          text: 'Any work available?',
          nextNodeId: 'work_response',
        },
        {
          text: 'Just passing through.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const VetNellDialogue: DialogueTree = {
  id: 'vet_nell_main',
  name: 'Vet Nell - Main Conversation',
  description: 'Primary dialogue for the veterinarian',
  tags: ['coldwater', 'healer', 'animals'],

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
      text: "*Looks up from examining a calf* Oh! Didn't hear you come in. I'm Nell - the town vet, for what it's worth out here. You need something for your horse, or just looking around?",
      expression: 'friendly',
      choices: [
        {
          text: "I'm looking for supplies.",
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'coldwater_vet' }],
        },
        {
          text: 'You treat animals? Out here?',
          nextNodeId: 'vet_explanation',
        },
        {
          text: "What's wrong with the calf?",
          nextNodeId: 'calf_discussion',
        },
      ],
    },
    {
      id: 'vet_explanation',
      text: "*Laughs* Animals are animals, whether in Boston or the frontier. Horses, cattle, dogs - they all get sick, they all get hurt, and they all need someone who knows what they're doing. I'm that someone.",
      choices: [
        {
          text: 'How did you end up here?',
          nextNodeId: 'backstory',
        },
        {
          text: 'You seem good at it.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
    {
      id: 'backstory',
      text: "I studied veterinary medicine back East. *Her smile fades* They let me learn, but they wouldn't let me practice. 'Unladylike,' they said. So I came west, where people care more about results than propriety. Now I'm the only animal doctor for fifty miles.",
      choices: [
        {
          text: 'Their loss, our gain.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: "That's a shame.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'calf_discussion',
      text: "*Sighs* Fever, probably from drinking bad water. Nothing I can't fix, but it worries me. The creek's been running strange lately - murky when it should be clear. Something's not right upstream.",
      choices: [
        {
          text: 'What could cause that?',
          nextNodeId: 'creek_mystery',
        },
        {
          text: 'I hope the calf recovers.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'creek_mystery',
      text: "Mining runoff, maybe. Or someone dumping waste. The creek runs down from the mountains - same mountains where IVRC has their operations. I've been meaning to ride up and check, but I can't leave my patients.",
      choices: [
        {
          text: 'I could look into it.',
          nextNodeId: 'investigate_offer',
        },
        {
          text: "Hopefully it clears up.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'investigate_offer',
      text: "*Brightens* You would? That'd be a real help. Follow the creek upstream for about two miles - that's where the water starts getting bad. Find the source, and maybe we can fix it before more animals get sick.",
      onEnterEffects: [{ type: 'set_flag', target: 'nell_creek_investigation' }],
      choices: [
        {
          text: "I'll see what I can find.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "*Wipes hands on apron* Back again! Need supplies, or just visiting?",
      choices: [
        {
          text: 'Show me what you have.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'coldwater_vet' }],
        },
        {
          text: 'Just checking in.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const TheWandererDialogue: DialogueTree = {
  id: 'the_wanderer_main',
  name: 'The Wanderer - Main Conversation',
  description: 'Primary dialogue for the mysterious stranger',
  tags: ['coldwater', 'mysterious', 'remnant'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'quest_active',
      conditions: [{ type: 'quest_active', target: 'wanderers_tale' }],
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
      text: "*Looks at you with unsettlingly calm eyes* You have questions. Everyone does when they look at me. But the real question is: are you ready for the answers?",
      expression: 'mysterious',
      choices: [
        {
          text: 'Who are you?',
          nextNodeId: 'identity_question',
        },
        {
          text: "What do you mean, 'ready'?",
          nextNodeId: 'ready_explanation',
        },
        {
          text: "I'm just passing through.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'identity_question',
      text: "*Pauses* I am... a survivor. Of things that should have killed me. Of experiments that made me something... other. I wander because I search for answers. And for others like me.",
      choices: [
        {
          text: 'Others like you? What does that mean?',
          nextNodeId: 'others_explanation',
        },
        {
          text: 'What kind of experiments?',
          nextNodeId: 'experiments_reveal',
        },
      ],
    },
    {
      id: 'ready_explanation',
      text: "The truth is dangerous. It destroyed my old life and may yet destroy what remains. But some truths need to be known. Some secrets are too terrible to stay buried.",
      choices: [
        {
          text: 'Tell me.',
          nextNodeId: 'experiments_reveal',
        },
        {
          text: "Maybe I'm not ready after all.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'others_explanation',
      text: "IVRC conducted experiments years ago. Project Remnant, they called it. They took people - workers, drifters, those no one would miss - and changed us. Made us... better. Faster. Stronger. But the process was unstable. Most died. A few survived. I'm one of them.",
      onEnterEffects: [{ type: 'set_flag', target: 'wanderer_revealed_remnant' }],
      choices: [
        {
          text: 'My God. Where are the others?',
          nextNodeId: 'others_location',
        },
        {
          text: "Why are you telling me this?",
          nextNodeId: 'why_tell',
        },
      ],
    },
    {
      id: 'experiments_reveal',
      text: "*Their voice drops* IVRC wasn't always just a mining company. Before the copper boom, they experimented with... enhancements. Mechanical implants, chemical treatments, things I still don't fully understand. They turned people into weapons. Then they buried the evidence when things went wrong.",
      choices: [
        {
          text: 'Where did this happen?',
          nextNodeId: 'location_reveal',
        },
        {
          text: "Why are you telling me this?",
          nextNodeId: 'why_tell',
        },
      ],
    },
    {
      id: 'location_reveal',
      text: "There's a facility beneath the Iron Gulch mines. Sealed off now, but the entrance is there. I've searched for it, but I... I can't go back. The memories are too strong. Perhaps you could find it. Find the truth.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_remnant_facility' }],
      choices: [
        {
          text: "I'll look for it.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'wanderers_tale' }],
        },
        {
          text: 'This is too dangerous.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'why_tell',
      text: "Because you're searching for something too. I can see it in your eyes. You received a letter, didn't you? The gear symbol. That symbol belongs to those who fought IVRC. Perhaps our paths lead to the same destination.",
      choices: [
        {
          text: 'How do you know about my letter?',
          nextNodeId: 'letter_knowledge',
        },
        {
          text: 'Maybe they do.',
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'wanderers_tale' }],
        },
      ],
    },
    {
      id: 'letter_knowledge',
      text: "*Slight smile* I know many things. Some from observation, some from... sources I'd rather not name. But the gear symbol was used by the Freeminers, those who opposed IVRC. Perhaps the person who sent it wanted you to finish what they started.",
      choices: [
        {
          text: 'Will you help me?',
          nextNodeId: 'help_offer',
        },
        {
          text: 'I need to think about this.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'help_offer',
      text: "I'll tell you what I know. In exchange, if you find the facility... look for records. Evidence of what was done. The truth could destroy IVRC - but it could also save others who were... changed, like me.",
      choices: [
        {
          text: "I'll find the truth.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'wanderers_tale' }],
        },
      ],
    },
    {
      id: 'others_location',
      text: "Scattered. Hiding. Some went mad from the changes. Others serve IVRC, whether by choice or control. A few, like me, wander. We're drawn to the old sites, looking for answers. Looking for a cure - or an end.",
      choices: [
        {
          text: 'Is there a cure?',
          nextNodeId: 'cure_question',
        },
        {
          text: 'What do you want from me?',
          nextNodeId: 'help_offer',
        },
      ],
    },
    {
      id: 'cure_question',
      text: "*Shakes head* Unknown. The scientists who made us are dead or disappeared. The records were destroyed - or hidden. If there's a cure, it's buried with the rest of IVRC's secrets.",
      choices: [
        {
          text: 'Then let me help you find them.',
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'wanderers_tale' }],
        },
        {
          text: "I'm sorry.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'quest_active',
      text: "*Looks at you intently* Have you found the facility? The entrance should be in the old mine shafts beneath Iron Gulch.",
      choices: [
        {
          text: 'Not yet. Remind me where to look.',
          nextNodeId: 'location_reminder',
        },
        {
          text: 'Still searching.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'location_reminder',
      text: "The drainage tunnels beneath the main mine shaft. There's a sealed door with the IVRC logo - old style, before they changed it. That's where they hid the evidence. Find it, and you'll find the truth.",
      choices: [
        {
          text: "I'll keep looking.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "*Nods in recognition* You return. Still seeking?",
      choices: [
        {
          text: 'Yes. Tell me more about Project Remnant.',
          nextNodeId: 'experiments_reveal',
        },
        {
          text: 'Just passing through.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const InnkeeperRoseDialogue: DialogueTree = {
  id: 'innkeeper_rose_main',
  name: 'Innkeeper Rose - Main Conversation',
  description: 'Primary dialogue for the innkeeper',
  tags: ['coldwater', 'innkeeper', 'rest'],

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
      text: "*Beams at you* Well hello there, traveler! Welcome to the Coldwater Inn! You look like you could use a good meal and a soft bed. Lucky for you, we've got both!",
      expression: 'friendly',
      choices: [
        {
          text: "I'd like a room.",
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'coldwater_inn' }],
        },
        {
          text: 'What can you tell me about this town?',
          nextNodeId: 'town_info',
        },
        {
          text: 'Just looking around.',
          nextNodeId: 'looking_around',
        },
      ],
    },
    {
      id: 'town_info',
      text: "Coldwater? Sweetest little town you'll find anywhere! Good people, honest work, and the best water in the territory - cold and clear, straight from the mountains. We don't have much, but we have each other.",
      choices: [
        {
          text: 'Sounds idyllic.',
          nextNodeId: 'idyllic_response',
        },
        {
          text: "Any trouble I should know about?",
          nextNodeId: 'trouble_info',
        },
      ],
    },
    {
      id: 'idyllic_response',
      text: "*Sighs contentedly* It is. Or it was. Lately there's been some trouble - cattle going missing, strangers passing through. Nothing like the big cities, thank the Lord, but still... times are changing.",
      choices: [
        {
          text: "I hope things settle down.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'trouble_info',
      text: "*Lowers voice* McGraw's been losing cattle to rustlers. And there's a strange fellow who arrived last week - calls himself the Wanderer. Doesn't talk much, just watches. Gives me the willies, if I'm honest.",
      choices: [
        {
          text: "I'll keep my eyes open.",
          nextNodeId: null,
        },
        {
          text: 'Thanks for the warning.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'looking_around',
      text: "Of course, take your time! But when you're ready for a hot meal or a comfortable bed, you know where to find me. We serve the best stew this side of the mountains!",
      choices: [
        {
          text: 'Maybe later.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "*Waves warmly* Welcome back, dear! Room for the night? Or just stopping in for a bite?",
      choices: [
        {
          text: 'Show me what you have.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'coldwater_inn' }],
        },
        {
          text: 'Just visiting.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

// ============================================================================
// SHOPS
// ============================================================================

export const ColdwaterRanchSupply: ShopDefinition = {
  id: 'coldwater_ranch_supply',
  name: 'McGraw Ranch Supply',
  description: 'Provisions, tools, and ranching equipment.',
  ownerId: 'ranch_hand',
  inventory: [
    { itemId: 'trail_biscuits', stock: 25, priceModifier: 0.9 },
    { itemId: 'dried_jerky', stock: 20, priceModifier: 0.9 },
    { itemId: 'coffee_beans', stock: 15, priceModifier: 0.9 },
    { itemId: 'water_canteen', stock: 10, priceModifier: 0.9 },

    { itemId: 'rope', stock: 8, priceModifier: 0.9 },
    { itemId: 'lantern', stock: 5, priceModifier: 0.95 },
    { itemId: 'oil_can', stock: 10, priceModifier: 0.9 },

    { itemId: 'hunting_rifle', stock: 2, priceModifier: 0.95 },
    { itemId: 'rifle_ammo', stock: 50, priceModifier: 0.9 },
  ],
  buyModifier: 0.55,
  canSell: true,
  acceptedTypes: ['weapon', 'consumable', 'junk'],
  tags: ['ranch', 'supplies', 'coldwater'],
};

export const ColdwaterInn: ShopDefinition = {
  id: 'coldwater_inn',
  name: 'Coldwater Inn',
  description: 'The best rest and meals in the territory.',
  ownerId: 'innkeeper_rose',
  inventory: [
    { itemId: 'hot_meal', stock: -1, priceModifier: 0.8 },
    { itemId: 'coffee', stock: -1, priceModifier: 0.7 },
    { itemId: 'beer', stock: -1, priceModifier: 0.9 },
    { itemId: 'whiskey', stock: 10, priceModifier: 1.0 },
    { itemId: 'trail_biscuits', stock: 10, priceModifier: 0.9 },
  ],
  buyModifier: 0.3,
  canSell: false,
  acceptedTypes: [],
  tags: ['inn', 'food', 'rest', 'coldwater'],
};

export const ColdwaterVet: ShopDefinition = {
  id: 'coldwater_vet',
  name: "Nell's Veterinary Supplies",
  description: 'Animal medicines and general healing supplies.',
  ownerId: 'vet_nell',
  inventory: [
    { itemId: 'bandages', stock: 15, priceModifier: 0.9 },
    { itemId: 'herbal_remedy', stock: 12, priceModifier: 0.85 },
    { itemId: 'antivenom', stock: 8, priceModifier: 0.9 },
    { itemId: 'medical_kit', stock: 3, priceModifier: 0.95 },
  ],
  buyModifier: 0.45,
  canSell: true,
  acceptedTypes: ['consumable'],
  tags: ['medical', 'veterinary', 'coldwater'],
};

// ============================================================================
// QUESTS
// ============================================================================

export const CattleRustlersQuest: Quest = {
  id: 'cattle_rustlers',
  title: 'Cattle Rustlers',
  description:
    "Someone's been stealing cattle from the Double M Ranch. Track down the rustlers and put a stop to it.",
  type: 'side',
  giverNpcId: 'rancher_mcgraw',
  startLocationId: 'coldwater',
  recommendedLevel: 3,
  tags: ['side', 'investigation', 'combat'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: [],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_investigate',
      title: 'Track the Rustlers',
      description: 'Find evidence of the rustlers in the south pasture.',
      onStartText:
        "McGraw's cattle have been disappearing from the south pasture. Check for tracks and evidence.",
      onCompleteText:
        'The tracks lead toward an old line shack in the hills. The rustlers must be hiding there.',
      objectives: [
        {
          id: 'obj_find_tracks',
          description: 'Find rustler tracks in the south pasture',
          type: 'visit',
          target: 'south_pasture_marker',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_follow_trail',
          description: 'Follow the trail to the rustler hideout',
          type: 'visit',
          target: 'line_shack_marker',
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
      id: 'stage_confront',
      title: 'Confront the Rustlers',
      description: 'Deal with the rustlers at the line shack.',
      onStartText:
        "You've found the hideout. The rustlers are inside with the stolen cattle. Time to put a stop to this.",
      onCompleteText:
        'The rustlers are dealt with. They had IVRC branding irons - proof that the railroad was behind this.',
      objectives: [
        {
          id: 'obj_defeat_rustlers',
          description: 'Defeat the rustlers',
          type: 'kill',
          target: 'rustler',
          count: 4,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_find_evidence',
          description: 'Find evidence of who hired them',
          type: 'collect',
          target: 'ivrc_branding_irons',
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
        reputation: {},
      },
    },
    {
      id: 'stage_report',
      title: 'Report to McGraw',
      description: 'Return to McGraw with the evidence.',
      onStartText:
        "You have proof that IVRC was behind the rustling. McGraw needs to see this.",
      onCompleteText:
        "McGraw is furious but grateful. He pays you well and vows to fight IVRC's pressure with everything he has.",
      objectives: [
        {
          id: 'obj_report_mcgraw',
          description: 'Deliver the evidence to McGraw',
          type: 'deliver',
          target: 'ivrc_branding_irons',
          deliverTo: 'rancher_mcgraw',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 40,
        gold: 50,
        items: [],
        reputation: { townfolk: 20 },
      },
    },
  ],

  rewards: {
    xp: 120,
    gold: 100,
    items: [{ itemId: 'hunting_rifle', quantity: 1 }],
    reputation: { townfolk: 25, ivrc: -20 },
    unlocksQuests: [],
  },
};

export const WanderersTaleQuest: Quest = {
  id: 'wanderers_tale',
  title: "The Wanderer's Tale",
  description:
    "The mysterious Wanderer knows secrets about IVRC's past - and about Project Remnant. Find the hidden facility and uncover the truth.",
  type: 'main',
  giverNpcId: 'the_wanderer',
  startLocationId: 'coldwater',
  recommendedLevel: 4,
  tags: ['main', 'mystery', 'remnant'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['deep_trouble'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_learn',
      title: "Learn the Wanderer's Story",
      description: 'Speak with the Wanderer and learn about Project Remnant.',
      onStartText:
        'The Wanderer claims to know secrets about IVRC. Listen to their story.',
      onCompleteText:
        "The Wanderer was a test subject in IVRC's experiments. There's a hidden facility beneath Iron Gulch.",
      objectives: [
        {
          id: 'obj_talk_wanderer',
          description: 'Learn about Project Remnant',
          type: 'talk',
          target: 'the_wanderer',
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
      id: 'stage_find_entrance',
      title: 'Find the Facility',
      description: 'Locate the entrance to the hidden Project Remnant facility.',
      onStartText:
        "The entrance is somewhere in the old mine tunnels beneath Iron Gulch. Find the sealed door with the old IVRC logo.",
      onCompleteText:
        "You've found the entrance. The seal has been broken before - someone else has been here recently.",
      objectives: [
        {
          id: 'obj_find_door',
          description: 'Find the sealed facility entrance',
          type: 'visit',
          target: 'remnant_entrance',
          count: 1,
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
      id: 'stage_explore',
      title: 'Explore the Facility',
      description: 'Search the facility for evidence of what happened here.',
      onStartText:
        "The facility is dark and abandoned - but not empty. Something still moves in the shadows.",
      onCompleteText:
        "You've found records of the experiments and evidence of survivors. The Wanderer's story was true.",
      objectives: [
        {
          id: 'obj_find_records',
          description: 'Find Project Remnant research records',
          type: 'collect',
          target: 'remnant_research_files',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_survive_encounter',
          description: 'Survive the facility',
          type: 'kill',
          target: 'remnant_guardian',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 75,
        gold: 50,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_return',
      title: 'Return to the Wanderer',
      description: 'Share what you found with the Wanderer.',
      onStartText:
        "Return to the Wanderer with the evidence you found.",
      onCompleteText:
        "The Wanderer is grateful - and horrified. The truth about Project Remnant could change everything.",
      objectives: [
        {
          id: 'obj_report_wanderer',
          description: 'Share the records with the Wanderer',
          type: 'deliver',
          target: 'remnant_research_files',
          deliverTo: 'the_wanderer',
          count: 1,
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
  ],

  rewards: {
    xp: 200,
    gold: 100,
    items: [],
    reputation: {},
    unlocksQuests: ['reckoning'],
  },
};

// ============================================================================
// TOWN DEFINITION
// ============================================================================

export const ColdwaterTown: Town = {
  id: 'coldwater',
  name: 'Coldwater',
  description:
    "A peaceful ranching community nestled in a green valley. The creek that gives the town its name runs cold and clear from the mountains. Life moves slowly here, but lately, trouble has been finding its way in.",
  theme: 'ranching',
  position: { x: 120, z: 80 },
  size: 'small',

  npcs: ['rancher_mcgraw', 'vet_nell', 'the_wanderer', 'innkeeper_rose'],

  shops: [
    {
      id: 'coldwater_ranch_supply',
      name: 'McGraw Ranch Supply',
      type: 'general_store',
      operatorNpcId: 'ranch_hand',
      shopInventoryId: 'coldwater_ranch_supply',
      hours: { open: 6, close: 18 },
      priceModifier: 0.9,
      description: 'Ranch provisions and equipment.',
    },
    {
      id: 'coldwater_inn',
      name: 'Coldwater Inn',
      type: 'saloon',
      operatorNpcId: 'innkeeper_rose',
      shopInventoryId: 'coldwater_inn',
      hours: { open: 6, close: 22 },
      priceModifier: 0.8,
      description: 'The best rest and meals in the territory.',
    },
    {
      id: 'coldwater_vet',
      name: "Nell's Veterinary Supplies",
      type: 'doctor',
      operatorNpcId: 'vet_nell',
      shopInventoryId: 'coldwater_vet',
      hours: { open: 7, close: 19 },
      priceModifier: 0.9,
      description: 'Animal and general healing supplies.',
    },
  ],

  quests: ['cattle_rustlers', 'wanderers_tale'],

  buildings: [
    {
      id: 'ranch_house',
      type: 'house',
      name: 'McGraw Ranch House',
      enterable: true,
      residentNpcIds: ['rancher_mcgraw'],
      tags: ['ranch', 'residence'],
    },
    {
      id: 'barn',
      type: 'stable',
      name: 'McGraw Barn',
      enterable: false,
      residentNpcIds: [],
      tags: ['ranch', 'animals'],
    },
    {
      id: 'inn',
      type: 'hotel',
      name: 'Coldwater Inn',
      enterable: true,
      residentNpcIds: ['innkeeper_rose', 'the_wanderer'],
      tags: ['rest', 'social'],
    },
    {
      id: 'water_tower',
      type: 'water_tower',
      name: 'Water Tower',
      enterable: false,
      residentNpcIds: [],
      tags: ['infrastructure'],
    },
    {
      id: 'chapel',
      type: 'church',
      name: 'Coldwater Chapel',
      enterable: true,
      residentNpcIds: [],
      tags: ['spiritual', 'community'],
    },
    {
      id: 'vet_office',
      type: 'doctor_office',
      name: "Nell's Office",
      enterable: true,
      residentNpcIds: ['vet_nell'],
      tags: ['medical', 'animals'],
    },
  ],

  startDiscovered: false,
  dangerLevel: 1,
  economyLevel: 5,
  lawLevel: 'orderly',

  lore: "Coldwater was founded by homesteaders seeking good land and clean water. They found both in abundance. The valley has remained peaceful for decades, but as IVRC's influence grows, even this quiet community feels the pressure of 'progress.'",

  mapIcon: 'village',

  entryPoints: [
    { id: 'mountain_road', direction: 'south', routeId: 'mountain_road' },
    { id: 'badlands_trail', direction: 'west', routeId: 'badlands_trail' },
  ],

  tags: ['peaceful', 'ranching', 'rest', 'act_2'],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const COLDWATER_NPCS: NPCDefinition[] = [
  RancherMcGraw,
  VetNell,
  TheWanderer,
  InnkeeperRose,
];

export const COLDWATER_DIALOGUES: DialogueTree[] = [
  RancherMcGrawDialogue,
  VetNellDialogue,
  TheWandererDialogue,
  InnkeeperRoseDialogue,
];

export const COLDWATER_SHOPS: ShopDefinition[] = [
  ColdwaterRanchSupply,
  ColdwaterInn,
  ColdwaterVet,
];

export const COLDWATER_QUESTS: Quest[] = [
  CattleRustlersQuest,
  WanderersTaleQuest,
];
