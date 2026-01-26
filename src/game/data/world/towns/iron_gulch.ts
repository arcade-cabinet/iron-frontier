/**
 * Iron Gulch - Main Hub / Mining Town
 *
 * The industrial heart of the territory. A bustling mining town where
 * the main quest unfolds. IVRC runs the major operations, but tension
 * with independent miners and saboteurs creates constant conflict.
 *
 * Theme: Industrial mining town
 * Act: 1
 */

import type { DialogueTree, NPCDefinition } from '../../schemas/npc';
import type { Quest } from '../../schemas/quest';
import type { ShopDefinition } from '../../shops/index';
import type { Town } from '../townSchema';

// ============================================================================
// NPCs
// ============================================================================

export const ForemanBurke: NPCDefinition = {
  id: 'foreman_burke',
  name: 'Harold Burke',
  title: 'Foreman',
  role: 'miner',
  faction: 'ivrc',
  locationId: 'iron_gulch',
  spawnCoord: { q: 20, r: 15 },
  personality: {
    aggression: 0.5,
    friendliness: 0.3,
    curiosity: 0.2,
    greed: 0.6,
    honesty: 0.4,
    lawfulness: 0.6,
  },
  description:
    'A heavyset man with coal-dust permanently embedded in his skin. His eyes are hard, and his hands are harder. He runs the main IVRC mine with an iron fist.',
  portraitId: 'foreman_burke',
  dialogueTreeIds: ['foreman_burke_main'],
  primaryDialogueId: 'foreman_burke_main',
  essential: true,
  questGiver: true,
  questIds: ['deep_trouble'],
  backstory:
    "Burke started as a miner thirty years ago and clawed his way up. He's loyal to IVRC because they made him what he is, but lately the sabotage has been making him look bad. He's desperate to find the culprit.",
  relationships: [
    { npcId: 'engineer_clara', type: 'neutral', notes: 'Respects her skills, suspicious of her sympathies' },
    { npcId: 'silas_crane', type: 'rival', notes: 'Suspects him but has no proof' },
    { npcId: 'doc_holloway', type: 'ally', notes: 'Old drinking buddies' },
  ],
  tags: ['authority', 'ivrc', 'quest_giver', 'main_quest'],
};

export const EngineerClara: NPCDefinition = {
  id: 'engineer_clara',
  name: 'Clara Whitmore',
  title: 'Engineer',
  role: 'blacksmith',
  faction: 'neutral',
  locationId: 'iron_gulch',
  spawnCoord: { q: 18, r: 22 },
  personality: {
    aggression: 0.2,
    friendliness: 0.6,
    curiosity: 0.9,
    greed: 0.2,
    honesty: 0.8,
    lawfulness: 0.5,
  },
  description:
    'A young woman in work-stained overalls with intelligent eyes behind wire-rimmed spectacles. Grease streaks her face, and tools hang from her belt. She designed half the machinery in the mines.',
  portraitId: 'engineer_clara',
  dialogueTreeIds: ['engineer_clara_main'],
  primaryDialogueId: 'engineer_clara_main',
  essential: true,
  questGiver: true,
  questIds: ['engineers_request'],
  backstory:
    "Clara studied engineering back East and came west to prove herself in a man's world. She secretly sympathizes with the independent miners and has been feeding them safety information. She could be a valuable ally.",
  relationships: [
    { npcId: 'foreman_burke', type: 'neutral', notes: 'Works for him, but disagrees with his methods' },
    { npcId: 'silas_crane', type: 'ally', notes: 'Knows he is not the saboteur, covering for him' },
  ],
  tags: ['ally_potential', 'engineering', 'information'],
};

export const SilasCrane: NPCDefinition = {
  id: 'silas_crane',
  name: 'Silas Crane',
  title: '',
  role: 'miner',
  faction: 'freeminer',
  locationId: 'iron_gulch',
  spawnCoord: { q: 25, r: 18 },
  personality: {
    aggression: 0.4,
    friendliness: 0.4,
    curiosity: 0.3,
    greed: 0.3,
    honesty: 0.6,
    lawfulness: 0.3,
  },
  description:
    'A wiry man with nervous eyes that dart around constantly. He works in the IVRC mines but his heart belongs to the Freeminers. Everyone suspects him of being the saboteur, but is he?',
  portraitId: 'silas_crane',
  dialogueTreeIds: ['silas_crane_main'],
  primaryDialogueId: 'silas_crane_main',
  essential: true,
  questGiver: false,
  questIds: [],
  backstory:
    "Silas is a Freeminer sympathizer working undercover in the IVRC mines. He's been passing information to the independent miners, but he's NOT the saboteur. The real saboteur is using him as a scapegoat. The player must decide whether to expose him or help him.",
  relationships: [
    { npcId: 'foreman_burke', type: 'enemy', notes: 'Burke suspects him and wants him caught' },
    { npcId: 'engineer_clara', type: 'ally', notes: 'She protects him when she can' },
  ],
  tags: ['suspect', 'freeminer', 'morally_grey'],
};

export const DocHolloway: NPCDefinition = {
  id: 'doc_holloway',
  name: 'Eugene Holloway',
  title: 'Doc',
  role: 'doctor',
  faction: 'neutral',
  locationId: 'iron_gulch',
  spawnCoord: { q: 15, r: 20 },
  personality: {
    aggression: 0.1,
    friendliness: 0.7,
    curiosity: 0.5,
    greed: 0.4,
    honesty: 0.7,
    lawfulness: 0.6,
  },
  description:
    'A tired-looking man in a stained white coat. His hands are steady despite the ever-present smell of whiskey on his breath. He patches up miners after every shift.',
  portraitId: 'doc_holloway',
  dialogueTreeIds: ['doc_holloway_main'],
  primaryDialogueId: 'doc_holloway_main',
  essential: false,
  questGiver: false,
  questIds: [],
  shopId: 'iron_gulch_apothecary',
  backstory:
    "Holloway was a promising surgeon back East until a scandal drove him west. He numbs his guilt with drink but still does good work. He sees all the mining injuries and knows the truth about IVRC's safety record.",
  relationships: [
    { npcId: 'foreman_burke', type: 'ally', notes: 'Drinking buddies, but Holloway knows too much' },
  ],
  tags: ['healer', 'information', 'flawed'],
};

export const BartenderMolly: NPCDefinition = {
  id: 'bartender_molly',
  name: 'Molly Sullivan',
  title: '',
  role: 'bartender',
  faction: 'neutral',
  locationId: 'iron_gulch',
  spawnCoord: { q: 22, r: 25 },
  personality: {
    aggression: 0.3,
    friendliness: 0.6,
    curiosity: 0.7,
    greed: 0.4,
    honesty: 0.5,
    lawfulness: 0.4,
  },
  description:
    'A red-haired woman with a quick wit and a quicker temper. She runs the saloon with efficiency and knows every secret in town - for a price.',
  portraitId: 'bartender_molly',
  dialogueTreeIds: ['bartender_molly_main'],
  primaryDialogueId: 'bartender_molly_main',
  essential: false,
  questGiver: true,
  questIds: ['saloon_brawl'],
  shopId: 'iron_gulch_saloon',
  backstory:
    "Molly came west after her husband was killed in the war. She bought the saloon with his pension and has been running it ever since. She hears everything and sells information to anyone who pays.",
  relationships: [],
  tags: ['information', 'rumors', 'shop'],
};

// ============================================================================
// DIALOGUES
// ============================================================================

export const ForemanBurkeDialogue: DialogueTree = {
  id: 'foreman_burke_main',
  name: 'Foreman Burke - Main Conversation',
  description: 'Primary dialogue for the IVRC mine foreman',
  tags: ['iron_gulch', 'authority', 'ivrc', 'quest_giver'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'deep_trouble_active',
      conditions: [{ type: 'quest_active', target: 'deep_trouble' }],
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
      text: "*Looks you up and down* Another drifter looking for work? Or another troublemaker come to stir the pot? Speak up, I ain't got all day. The mine runs on a schedule.",
      expression: 'suspicious',
      choices: [
        {
          text: "I'm looking for work.",
          nextNodeId: 'work_response',
        },
        {
          text: "I heard there's been trouble at the mines.",
          nextNodeId: 'trouble_response',
        },
        {
          text: 'Just passing through.',
          nextNodeId: 'passing_through',
        },
      ],
    },
    {
      id: 'work_response',
      text: "Work? Ha! I've got more work than workers, thanks to the 'accidents' we've been having. But I need reliable people, not folks who'll run at the first sign of trouble. You got experience underground?",
      choices: [
        {
          text: 'Some. What kind of accidents?',
          nextNodeId: 'accident_details',
        },
        {
          text: 'I can handle myself.',
          nextNodeId: 'prove_yourself',
        },
      ],
    },
    {
      id: 'accident_details',
      text: "*Scowls* Sabotage, more like. Someone's been tampering with equipment. Support beams cut, ventilation blocked, charges set to blow wrong. Already lost six men this month. IVRC's breathing down my neck to find the bastard responsible.",
      expression: 'angry',
      choices: [
        {
          text: 'Sounds like you need help.',
          nextNodeId: 'help_offer',
        },
        {
          text: 'Any suspects?',
          nextNodeId: 'suspects_info',
        },
      ],
    },
    {
      id: 'help_offer',
      text: "*Studies you carefully* Maybe I do. Maybe you're the help I need. Someone who ain't connected to anyone in town, who can ask questions without raising suspicion. You interested in making real money?",
      choices: [
        {
          text: "I'm interested. What's the job?",
          nextNodeId: 'deep_trouble_intro',
        },
        {
          text: 'How much money are we talking?',
          nextNodeId: 'money_talk',
        },
      ],
    },
    {
      id: 'deep_trouble_intro',
      text: "Find the saboteur. Someone in this town is trying to shut down the mine, and I need to know who. Start with the workers, the saloon, anywhere people talk. You find proof, you bring it to me. I'll make it worth your while.",
      choices: [
        {
          text: "I'll do it.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'deep_trouble' }],
        },
        {
          text: 'Let me think about it.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'money_talk',
      text: "Fifty dollars upfront, another hundred when you find the saboteur. Plus whatever IVRC sees fit to add as a bonus. That's more than most miners see in a month. Take it or leave it.",
      choices: [
        {
          text: "Deal. Tell me about the sabotage.",
          nextNodeId: 'deep_trouble_intro',
        },
        {
          text: "I'll think about it.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'suspects_info',
      text: "*Lowers his voice* There's a worker named Silas Crane. Quiet type, keeps to himself. Some say he's got ties to the Freeminers up in the mountains. But I can't prove nothing yet. Maybe you can get closer to him than I can.",
      choices: [
        {
          text: "I'll look into him.",
          nextNodeId: 'deep_trouble_intro',
        },
        {
          text: 'Anyone else suspicious?',
          nextNodeId: 'other_suspects',
        },
      ],
    },
    {
      id: 'other_suspects',
      text: "Half the town, if I'm honest. The Copperhead Gang's been hitting our shipments. The Freeminers hate us on principle. Even some of our own workers got grievances. That's why I need someone from outside to sort this out.",
      choices: [
        {
          text: "I'll find your saboteur.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'deep_trouble' }],
        },
      ],
    },
    {
      id: 'prove_yourself',
      text: "Handle yourself? Words are cheap. Tell you what - help me find the saboteur that's been wrecking my mine, and I'll believe you can handle anything. What do you say?",
      choices: [
        {
          text: 'Tell me more.',
          nextNodeId: 'accident_details',
        },
        {
          text: 'Not interested.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'trouble_response',
      text: "*Narrows his eyes* Who told you that? Never mind - everyone knows. Yeah, we've got trouble. Someone's sabotaging the mine. You got any useful information, or are you just gossiping like the rest of this town?",
      choices: [
        {
          text: 'Maybe I can help.',
          nextNodeId: 'help_offer',
        },
        {
          text: 'Just curious.',
          nextNodeId: 'just_curious',
        },
      ],
    },
    {
      id: 'just_curious',
      text: "Curiosity killed the cat. And in a mining town, it'll kill you too. Mind your own business unless you're willing to put skin in the game.",
      choices: [
        {
          text: 'Fine. I want in.',
          nextNodeId: 'help_offer',
        },
        {
          text: 'Message received.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'passing_through',
      text: "Then pass through quick. Iron Gulch ain't no place for sightseeing. Either you work, or you drink at the saloon and move on. We don't need gawkers.",
      choices: [
        {
          text: 'Actually, I might be interested in work.',
          nextNodeId: 'work_response',
        },
        {
          text: "I'll be on my way.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'deep_trouble_active',
      text: "Well? You got anything for me? Find the saboteur yet?",
      choices: [
        {
          text: "I'm still investigating.",
          nextNodeId: 'investigate_update',
        },
        {
          text: 'I have some leads.',
          nextNodeId: 'leads_discussion',
        },
      ],
    },
    {
      id: 'investigate_update',
      text: "Then get back to it. Time's wasting, and so is IVRC's patience. And mine. Don't make me regret trusting you.",
      choices: [
        {
          text: "I won't let you down.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'leads_discussion',
      text: "Good. What've you got?",
      choices: [
        {
          text: 'Silas Crane seems suspicious.',
          nextNodeId: 'silas_lead',
        },
        {
          text: "I need to confirm before I say anything.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'silas_lead',
      text: "*Nods grimly* That's what I thought. Bring me proof, and I'll have him strung up by morning. IVRC justice is swift.",
      choices: [
        {
          text: "I'll get the proof.",
          nextNodeId: null,
        },
        {
          text: 'Maybe we should be sure first.',
          nextNodeId: 'be_sure',
        },
      ],
    },
    {
      id: 'be_sure',
      text: "Sure? Men are dying! Fine, be thorough, but be quick about it. If Crane is the saboteur, every day we wait is another day someone might die.",
      choices: [
        {
          text: 'Understood.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "What do you want? I'm a busy man.",
      choices: [
        {
          text: 'Any work available?',
          nextNodeId: 'work_response',
        },
        {
          text: 'Nothing. Wrong person.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const EngineerClaraDialogue: DialogueTree = {
  id: 'engineer_clara_main',
  name: 'Engineer Clara - Main Conversation',
  description: 'Primary dialogue for Clara Whitmore, the mining engineer',
  tags: ['iron_gulch', 'ally_potential', 'information'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'deep_trouble_active',
      conditions: [{ type: 'quest_active', target: 'deep_trouble' }],
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
      text: "*Looks up from a complex schematic* Oh! A new face. Sorry, I get lost in my work. Name's Clara Whitmore, I'm the chief - well, only - engineer for the IVRC operations here. Can I help you with something?",
      expression: 'curious',
      choices: [
        {
          text: "Impressive work. What are you designing?",
          nextNodeId: 'work_explanation',
        },
        {
          text: "I'm investigating the mine sabotage.",
          nextNodeId: 'sabotage_reaction',
          conditions: [{ type: 'quest_active', target: 'deep_trouble' }],
        },
        {
          text: "Just looking around.",
          nextNodeId: 'looking_around',
        },
      ],
    },
    {
      id: 'work_explanation',
      text: "*Brightens* These are improvements to the ventilation system. The current design is... adequate, but with some modifications, we could reduce the risk of gas buildup by sixty percent. Fewer accidents, more lives saved.",
      choices: [
        {
          text: 'Why hasn\'t IVRC implemented these?',
          nextNodeId: 'ivrc_criticism',
        },
        {
          text: 'Sounds like important work.',
          nextNodeId: 'important_work',
        },
      ],
    },
    {
      id: 'ivrc_criticism',
      text: "*Her face hardens briefly* Because it costs money. And to IVRC, a miner's life is worth less than the copper he digs. I've proposed these changes three times. Each time, 'insufficient budget allocation.' Meanwhile, they're building a new mansion for Cornelius Thorne.",
      choices: [
        {
          text: 'That sounds frustrating.',
          nextNodeId: 'frustration_response',
        },
        {
          text: 'Why do you stay?',
          nextNodeId: 'why_stay',
        },
      ],
    },
    {
      id: 'frustration_response',
      text: "*Sighs* It is. But I stay because I can still make small differences. Little improvements that don't need approval. And because... *lowers voice* not everyone who works here agrees with how things are run.",
      choices: [
        {
          text: 'What do you mean?',
          nextNodeId: 'hint_at_resistance',
        },
      ],
    },
    {
      id: 'hint_at_resistance',
      text: "*Glances around nervously* I mean that change is coming, one way or another. Some people are working to make things better from within. And some... well, some have given up on working within the system.",
      onEnterEffects: [{ type: 'set_flag', target: 'clara_hinted_resistance' }],
      choices: [
        {
          text: 'Are you talking about the saboteur?',
          nextNodeId: 'saboteur_denial',
        },
        {
          text: 'I think I understand.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
    {
      id: 'saboteur_denial',
      text: "*Stiffens* I don't know anything about that. I'm just an engineer. I design machines, not... schemes. If you're looking for the saboteur, look elsewhere.",
      expression: 'worried',
      choices: [
        {
          text: 'I believe you.',
          nextNodeId: 'belief_response',
        },
        {
          text: "I'll be watching.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: -5 }],
        },
      ],
    },
    {
      id: 'belief_response',
      text: "*Relaxes slightly* Thank you. And... if you're genuinely trying to help people, not just IVRC, come talk to me again sometime. I might have some information that could be... useful.",
      onEnterEffects: [{ type: 'set_flag', target: 'clara_trusts_player' }],
      choices: [
        {
          text: "I'll do that.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },
    {
      id: 'important_work',
      text: "*Smiles* Thank you. It's rare that anyone around here appreciates the engineering. Most people just see machines - they don't see the thousands of decisions that keep those machines running safely.",
      choices: [
        {
          text: 'Do you enjoy your work here?',
          nextNodeId: 'enjoy_work',
        },
        {
          text: 'I should let you get back to it.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'enjoy_work',
      text: "Enjoy? That's a strong word. I believe in what I do. Making mines safer, more efficient. But the people I work for... *pauses* Let's just say my loyalties are complicated.",
      choices: [
        {
          text: 'Sounds like there is more to that story.',
          nextNodeId: 'hint_at_resistance',
        },
      ],
    },
    {
      id: 'why_stay',
      text: "Because someone has to try. If I left, who would fight for better safety standards? Who would design systems that actually protect workers? I'd rather be here making small changes than somewhere else making none.",
      choices: [
        {
          text: 'That takes courage.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
    {
      id: 'sabotage_reaction',
      text: "*Her eyes widen slightly* The sabotage? I... know about it, of course. Everyone does. Why are you asking me?",
      expression: 'nervous',
      choices: [
        {
          text: 'Burke hired me to investigate.',
          nextNodeId: 'burke_hired',
        },
        {
          text: "I'm just gathering information.",
          nextNodeId: 'gathering_info',
        },
      ],
    },
    {
      id: 'burke_hired',
      text: "*Sighs* Of course he did. Burke sees sabotage behind every accident, even when it's just poor maintenance or corner-cutting. Though... some of the recent incidents are concerning. Equipment that should be fine, failing in very specific ways.",
      choices: [
        {
          text: 'What do you mean?',
          nextNodeId: 'technical_details',
        },
        {
          text: 'Do you know who is responsible?',
          nextNodeId: 'who_responsible',
        },
      ],
    },
    {
      id: 'technical_details',
      text: "Support beams cut at stress points that only an engineer would know. Ventilation blocked in exactly the ways needed to create gas pockets. Whoever's doing this knows mining operations intimately. They're not just angry - they're calculated.",
      choices: [
        {
          text: 'Someone with technical knowledge.',
          nextNodeId: 'engineer_suspect',
        },
        {
          text: 'Any suspects?',
          nextNodeId: 'who_responsible',
        },
      ],
    },
    {
      id: 'engineer_suspect',
      text: "*Looks uncomfortable* Yes, someone with engineering knowledge. Which, before you ask, points at me. But I'm not the saboteur. I'm trying to save lives, not take them. Look elsewhere.",
      choices: [
        {
          text: 'Then who?',
          nextNodeId: 'who_responsible',
        },
        {
          text: 'I believe you.',
          nextNodeId: 'belief_response',
        },
      ],
    },
    {
      id: 'who_responsible',
      text: "*Long pause* Burke thinks it's Silas Crane. I know Silas - he's not capable of this. He's a Freeminer sympathizer, yes, but not a killer. The real saboteur is still out there, using Silas as a scapegoat.",
      choices: [
        {
          text: 'Who is the real saboteur?',
          nextNodeId: 'real_saboteur',
        },
        {
          text: 'How do you know Silas is innocent?',
          nextNodeId: 'silas_innocent',
        },
      ],
    },
    {
      id: 'real_saboteur',
      text: "*Hesitates* I have my suspicions, but no proof. There's a man - goes by 'The Engineer.' Not a real name. He's been seen in Copperhead territory. Ex-IVRC, they say, with a grudge. But I can't prove anything.",
      onEnterEffects: [{ type: 'set_flag', target: 'heard_about_the_engineer' }],
      choices: [
        {
          text: 'That gives me somewhere to start.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'silas_innocent',
      text: "Because I've worked with him for two years. He's gentle, careful. He passes information to the Freeminers, yes - about safety violations, not sabotage. He's trying to expose IVRC's crimes, not commit his own.",
      choices: [
        {
          text: 'Then who is framing him?',
          nextNodeId: 'real_saboteur',
        },
      ],
    },
    {
      id: 'gathering_info',
      text: "Information? About the sabotage? Well, I can tell you this much - whoever's doing it knows what they're doing. These aren't random accidents. They're targeted attacks on critical systems.",
      choices: [
        {
          text: 'Go on.',
          nextNodeId: 'technical_details',
        },
      ],
    },
    {
      id: 'looking_around',
      text: "Looking around a mine workshop? That's... an unusual hobby. Well, you're welcome to look, but don't touch anything. Some of this equipment is delicate.",
      choices: [
        {
          text: 'Actually, I wanted to ask about the sabotage.',
          nextNodeId: 'sabotage_reaction',
        },
        {
          text: "I'll just go.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'deep_trouble_active',
      text: "Still investigating? *Lowers voice* If you want to find the truth, don't just listen to Burke. Talk to the workers, the ones who actually go into the mines. They know things management doesn't.",
      choices: [
        {
          text: 'Who should I talk to?',
          nextNodeId: 'talk_to_whom',
        },
        {
          text: 'What about Silas Crane?',
          nextNodeId: 'silas_innocent',
        },
      ],
    },
    {
      id: 'talk_to_whom',
      text: "The miners drink at the saloon after shift. That's where you'll hear the real stories. And if you want to understand the sabotage, ask them about 'The Engineer.' But be careful - that name makes people nervous.",
      choices: [
        {
          text: 'Thanks for the tip.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "*Looks up from her work* Oh, you again. Need something?",
      choices: [
        {
          text: 'Tell me more about the mine operations.',
          nextNodeId: 'work_explanation',
        },
        {
          text: 'Just checking in.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const SilasCraneDialogue: DialogueTree = {
  id: 'silas_crane_main',
  name: 'Silas Crane - Main Conversation',
  description: 'Primary dialogue for Silas Crane, the suspected saboteur',
  tags: ['iron_gulch', 'suspect', 'freeminer'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'deep_trouble_active',
      conditions: [{ type: 'quest_active', target: 'deep_trouble' }],
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
      text: "*Jumps slightly* What? Who are you? I... I'm just on my break. Not doing anything wrong.",
      expression: 'nervous',
      choices: [
        {
          text: 'Relax. I just wanted to talk.',
          nextNodeId: 'calm_down',
        },
        {
          text: "You seem nervous. Something to hide?",
          nextNodeId: 'accusation',
        },
      ],
    },
    {
      id: 'calm_down',
      text: "*Eyes darting* Talk? People don't just talk to Silas Crane. They want information, or they want to accuse me of something. So which is it?",
      choices: [
        {
          text: "I'm new in town. Just meeting people.",
          nextNodeId: 'new_in_town',
        },
        {
          text: "Fine. What do you know about the sabotage?",
          nextNodeId: 'sabotage_direct',
        },
      ],
    },
    {
      id: 'new_in_town',
      text: "*Relaxes slightly* New? That's... rare. Most folks who come to Iron Gulch already have opinions about everyone. Including me. The 'Freeminer spy,' they call me. The 'troublemaker.'",
      choices: [
        {
          text: 'Are you a Freeminer spy?',
          nextNodeId: 'spy_question',
        },
        {
          text: 'People can be quick to judge.',
          nextNodeId: 'sympathy_response',
        },
      ],
    },
    {
      id: 'spy_question',
      text: "*Long pause* I believe in what the Freeminers stand for. Fair wages, safe conditions, independence from IVRC. Does that make me a spy? Maybe. But I'm not a saboteur. I'm not a killer.",
      expression: 'earnest',
      choices: [
        {
          text: 'I believe you.',
          nextNodeId: 'belief_grateful',
        },
        {
          text: 'That sounds like what a saboteur would say.',
          nextNodeId: 'accused_reaction',
        },
      ],
    },
    {
      id: 'belief_grateful',
      text: "*Surprised* You... believe me? That's more than anyone else in this town. Even Clara has to pretend she thinks I might be guilty, just to protect herself.",
      choices: [
        {
          text: 'Who is really behind the sabotage?',
          nextNodeId: 'real_culprit',
        },
        {
          text: 'How can I help you?',
          nextNodeId: 'help_offer_silas',
        },
      ],
    },
    {
      id: 'real_culprit',
      text: "*Looks around fearfully* There's a man. They call him 'The Engineer.' Used to work for IVRC until they betrayed him - took his designs, fired him, destroyed his reputation. Now he wants revenge. He's using me as cover.",
      choices: [
        {
          text: 'Where can I find him?',
          nextNodeId: 'engineer_location',
        },
        {
          text: 'How do you know this?',
          nextNodeId: 'how_know',
        },
      ],
    },
    {
      id: 'engineer_location',
      text: "He moves around, but he's got connections to the Copperheads. They give him shelter, he gives them inside information about IVRC shipments. If you want to find him, you'll need to go to Mesa Point. But be careful - they don't welcome strangers.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_engineer_location' }],
      choices: [
        {
          text: "I'll find him.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'how_know',
      text: "Because I've seen his work. The sabotage - it's precise, calculated. Only someone who really understands mining engineering could do it. And I've heard the miners talk about him, late at night in the saloon when they think no one's listening.",
      choices: [
        {
          text: 'Where can I find him?',
          nextNodeId: 'engineer_location',
        },
      ],
    },
    {
      id: 'help_offer_silas',
      text: "*Eyes water* Help? You'd do that? Then... clear my name. Find the real saboteur. And if you can, expose what IVRC is doing to the miners. The unsafe conditions, the debt traps. That's why I feed information to the Freeminers. Not to hurt anyone - to save them.",
      choices: [
        {
          text: "I'll do what I can.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', target: 'freeminers', value: 15 }],
        },
      ],
    },
    {
      id: 'sympathy_response',
      text: "*Nods slowly* You're... not what I expected. Most strangers come here already convinced I'm guilty. The foreman has been spreading rumors for months. Making me the scapegoat for every problem in the mines.",
      choices: [
        {
          text: 'Why does he suspect you?',
          nextNodeId: 'why_suspected',
        },
      ],
    },
    {
      id: 'why_suspected',
      text: "Because I question things. Ask why the safety equipment is never maintained. Why workers who complain disappear. Burke needs someone to blame, and I'm convenient. A known Freeminer sympathizer makes the perfect scapegoat.",
      choices: [
        {
          text: 'If not you, then who?',
          nextNodeId: 'real_culprit',
        },
      ],
    },
    {
      id: 'accusation',
      text: "*Backs away* No! I don't... I haven't done anything! Everyone thinks I'm guilty, but I'm not! The sabotage, it's not me! I swear on my mother's grave!",
      expression: 'afraid',
      choices: [
        {
          text: 'Calm down. I want to hear your side.',
          nextNodeId: 'hear_side',
        },
        {
          text: "That's exactly what a guilty man would say.",
          nextNodeId: 'accused_reaction',
        },
      ],
    },
    {
      id: 'hear_side',
      text: "*Breathing heavily* My side? Nobody's asked for that before. *Calms slightly* I'm not the saboteur. Yes, I sympathize with the Freeminers. Yes, I've passed them information about safety violations. But killing people? Never.",
      choices: [
        {
          text: 'Then who is the saboteur?',
          nextNodeId: 'real_culprit',
        },
      ],
    },
    {
      id: 'accused_reaction',
      text: "*Panics* Please! You have to believe me! If Burke thinks I'm guilty, he'll have me executed without a trial. IVRC justice doesn't care about evidence. Please, give me a chance to prove my innocence!",
      choices: [
        {
          text: "Fine. Convince me.",
          nextNodeId: 'hear_side',
        },
        {
          text: "I'll be watching you.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: -10 }],
        },
      ],
    },
    {
      id: 'sabotage_direct',
      text: "*Pales* The sabotage? I knew it. You're working for Burke, aren't you? Here to pin it on me. Well I won't confess to something I didn't do!",
      choices: [
        {
          text: "I'm looking for the truth, not a scapegoat.",
          nextNodeId: 'hear_side',
        },
        {
          text: 'Burke seems pretty sure about you.',
          nextNodeId: 'accused_reaction',
        },
      ],
    },
    {
      id: 'deep_trouble_active',
      text: "*Sees you and tenses* You're still investigating. Have you found the real saboteur yet? Or are you still building a case against me?",
      choices: [
        {
          text: "I believe you're innocent.",
          nextNodeId: 'innocent_update',
        },
        {
          text: 'The evidence is complicated.',
          nextNodeId: 'complicated_response',
        },
      ],
    },
    {
      id: 'innocent_update',
      text: "*Relief floods his face* Thank you. 'The Engineer' is the one you need to find. Check the Copperhead hideout at Mesa Point. And hurry - Burke is getting impatient. He might decide to arrest me regardless.",
      choices: [
        {
          text: "I'll work quickly.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'complicated_response',
      text: "*Despair in his eyes* Complicated. That's what they always say before they condemn an innocent man. Please, I'm begging you - find the real culprit before it's too late.",
      choices: [
        {
          text: "I'll find the truth.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "*Nervously* You again. What do you want?",
      choices: [
        {
          text: 'Tell me more about your situation.',
          nextNodeId: 'hear_side',
        },
        {
          text: 'Nothing. Wrong person.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const DocHollowayDialogue: DialogueTree = {
  id: 'doc_holloway_main',
  name: 'Doc Holloway - Main Conversation',
  description: 'Primary dialogue for the town doctor',
  tags: ['iron_gulch', 'healer', 'information'],

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
      text: "*Looks up from a whiskey glass* Patient? *Squints* No, you don't look injured. Just lost, maybe. Pull up a chair if you want. Or buy something from the cabinet. Either way, Doc Holloway is at your service.",
      expression: 'tired',
      choices: [
        {
          text: "I need medical supplies.",
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'iron_gulch_apothecary' }],
        },
        {
          text: 'You see a lot of injuries here?',
          nextNodeId: 'injuries_talk',
        },
        {
          text: "You look like you could use a doctor yourself.",
          nextNodeId: 'personal_talk',
        },
      ],
    },
    {
      id: 'injuries_talk',
      text: "*Laughs bitterly* A lot? Every shift I patch up broken bones, crush injuries, burns. Mining's dangerous work, made more dangerous by people who don't care about safety. Men go in healthy and come out coughing up blood.",
      choices: [
        {
          text: "You're talking about IVRC.",
          nextNodeId: 'ivrc_criticism',
        },
        {
          text: 'Is that why you drink?',
          nextNodeId: 'personal_talk',
        },
      ],
    },
    {
      id: 'ivrc_criticism',
      text: "*Drains his glass* You didn't hear it from me. I depend on them for my practice. But yes, half the injuries I see could be prevented with proper equipment and training. They just don't want to spend the money.",
      choices: [
        {
          text: 'Someone should do something about that.',
          nextNodeId: 'do_something',
        },
        {
          text: 'Thanks for being honest.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'do_something',
      text: "Ha! And who would that be? The law works for IVRC. The workers are too scared to speak up. And people like me... *pours another drink* we just patch up the damage and try not to think too hard about it.",
      choices: [
        {
          text: 'Maybe things will change.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'personal_talk',
      text: "*Shrugs* This? Just medicine for the soul. Helps me forget the faces of the men I couldn't save. *Pauses* I used to be good, you know. Really good. Back East, I was going to be somebody. Then I made a mistake.",
      choices: [
        {
          text: 'What kind of mistake?',
          nextNodeId: 'backstory',
        },
        {
          text: "Everyone has a past.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'backstory',
      text: "Lost a patient. Rich man's daughter. Wasn't my fault, really - the surgery was risky from the start. But her father had connections. Destroyed my reputation, got my license revoked. So here I am, patching up miners in a frontier town. Life has a sense of humor.",
      choices: [
        {
          text: "At least you're still helping people.",
          nextNodeId: 'still_helping',
        },
        {
          text: 'That sounds rough.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'still_helping',
      text: "*Actually smiles* Yeah. Yeah, I suppose I am. These miners, they don't care about my past. They just need someone who can set a bone and stitch a wound. Maybe that's enough.",
      choices: [
        {
          text: "It's more than most people do.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "*Raises his glass* Back again. Need patching up, or supplies?",
      choices: [
        {
          text: 'Show me your supplies.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'iron_gulch_apothecary' }],
        },
        {
          text: 'Just stopping by.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const BartenderMollyDialogue: DialogueTree = {
  id: 'bartender_molly_main',
  name: 'Bartender Molly - Main Conversation',
  description: 'Primary dialogue for Molly Sullivan at the saloon',
  tags: ['iron_gulch', 'information', 'rumors'],

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
      text: "*Wipes down the bar* Fresh meat in Iron Gulch! Welcome to the Lucky Strike, stranger. Whiskey, beer, or information? I serve all three, but only one's on the house.",
      expression: 'friendly',
      choices: [
        {
          text: "I'll take a drink.",
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'iron_gulch_saloon' }],
        },
        {
          text: 'Information sounds valuable.',
          nextNodeId: 'information_price',
        },
        {
          text: "What's the talk of the town?",
          nextNodeId: 'town_gossip',
        },
      ],
    },
    {
      id: 'information_price',
      text: "*Grins* Smart. Information IS valuable. Depends what you want to know. Local gossip is free with a drink. Deeper secrets cost more. What're you looking for?",
      choices: [
        {
          text: 'Tell me about the mine sabotage.',
          nextNodeId: 'sabotage_info',
        },
        {
          text: 'Who are the important people in town?',
          nextNodeId: 'important_people',
        },
        {
          text: 'Just the local gossip for now.',
          nextNodeId: 'town_gossip',
        },
      ],
    },
    {
      id: 'sabotage_info',
      text: "*Leans in* That'll cost you. Ten dollars, and I'll tell you what the miners say when they think no one's listening. Deal?",
      choices: [
        {
          text: 'Deal. [Pay 10 dollars]',
          nextNodeId: 'sabotage_details',
          conditions: [{ type: 'gold_gte', value: 10 }],
          effects: [{ type: 'take_gold', value: 10 }],
        },
        {
          text: "Too rich for my blood.",
          nextNodeId: 'too_expensive',
        },
      ],
    },
    {
      id: 'sabotage_details',
      text: "*Pockets the money* Word is, the saboteur isn't a miner at all. Some call him 'The Engineer' - used to work for IVRC before they screwed him over. Now he's got a vendetta. Works with the Copperheads, they say. And poor Silas Crane is taking the blame.",
      onEnterEffects: [{ type: 'set_flag', target: 'molly_told_about_engineer' }],
      choices: [
        {
          text: 'Where can I find this Engineer?',
          nextNodeId: 'engineer_hint',
        },
        {
          text: 'Interesting. Thanks.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'engineer_hint',
      text: "That's where it gets tricky. He moves around. But the Copperheads protect him - he's useful to them. If you want to find him, you'll need to cozy up to the gang. Mesa Point's their territory. Good luck getting in.",
      choices: [
        {
          text: "I'll figure it out.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'important_people',
      text: "In Iron Gulch? Burke runs the mine - answers to IVRC. Doc Holloway patches everyone up. Clara's the engineer - smart woman, quiet sympathies. And then there's the visitors - railroad men, Pinkerton agents, sometimes even Copperhead scouts pretending to be merchants.",
      choices: [
        {
          text: 'Tell me more about Clara.',
          nextNodeId: 'clara_info',
        },
        {
          text: 'What about the Copperheads?',
          nextNodeId: 'copperhead_info',
        },
      ],
    },
    {
      id: 'clara_info',
      text: "Whitmore? She's different from the other IVRC folks. Actually cares about the workers. *Lowers voice* Some say she feeds information to the Freeminers. But don't tell anyone I said that.",
      choices: [
        {
          text: "Your secret's safe.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'copperhead_info',
      text: "The Copperheads? They're outlaws, sure, but not everyone thinks they're villains. They hit IVRC hard, rob their trains, steal their payroll. Some folks see them as heroes fighting the real bad guys. Dangerous either way.",
      choices: [
        {
          text: 'How do I contact them?',
          nextNodeId: 'copperhead_contact',
        },
        {
          text: "I'll steer clear.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'copperhead_contact',
      text: "*Laughs* You don't contact the Copperheads. They contact you. Or you show up at Mesa Point and hope they don't shoot you on sight. Either way, it's your funeral.",
      choices: [
        {
          text: 'Good to know.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'town_gossip',
      text: "Let's see... Burke's on edge about the sabotage. Doc's drinking more than usual. Clara's been working late every night. And a stranger from back East arrived on the last train - asking questions about old IVRC projects. Interesting times.",
      choices: [
        {
          text: 'A stranger asking questions?',
          nextNodeId: 'stranger_info',
        },
        {
          text: 'Thanks for the update.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'stranger_info',
      text: "Didn't catch a name. Well-dressed, educated. Asked about something called 'Project Remnant' - old IVRC research, I think. Nobody here knew anything, or at least pretended not to. He left a couple days ago, headed toward the mountains.",
      onEnterEffects: [{ type: 'set_flag', target: 'heard_about_project_remnant' }],
      choices: [
        {
          text: 'Project Remnant? What is that?',
          nextNodeId: 'project_remnant',
        },
        {
          text: 'Interesting.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'project_remnant',
      text: "*Shrugs* Before my time. Something IVRC was working on years ago, before they focused on mining. Rumor says it was some kind of automaton research. Building machines that think. Sounds like fairy tales to me, but who knows?",
      choices: [
        {
          text: 'That does sound strange.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'too_expensive',
      text: "*Shrugs* Your call. Come back when you've got coin, and I'll have stories. Otherwise, enjoy your drink.",
      choices: [
        {
          text: "I'll think about it.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "Back again! Ready for that drink? Or looking for more information?",
      choices: [
        {
          text: "I'll have a drink.",
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'iron_gulch_saloon' }],
        },
        {
          text: 'What\'s the latest gossip?',
          nextNodeId: 'town_gossip',
        },
      ],
    },
  ],
};

// ============================================================================
// SHOPS
// ============================================================================

export const IronGulchMiningSupply: ShopDefinition = {
  id: 'iron_gulch_mining_supply',
  name: 'Iron Valley Mining Supply',
  description: 'IVRC-owned supply depot. Mining tools, explosives, and equipment for company workers.',
  ownerId: 'mining_supply_clerk',
  inventory: [
    // Mining equipment - core business
    { itemId: 'pickaxe', stock: 15, priceModifier: 1.0 },
    { itemId: 'lantern', stock: 12, priceModifier: 1.0 },
    { itemId: 'rope', stock: 15, priceModifier: 1.0 },
    { itemId: 'oil_can', stock: 20, priceModifier: 0.9 },
    { itemId: 'scrap_metal', stock: 10, priceModifier: 0.95 },

    // Explosives - key mining supplies
    { itemId: 'dynamite', stock: 25, priceModifier: 1.15 },

    // Mechanical parts for repairs
    { itemId: 'mechanical_parts', stock: 8, priceModifier: 1.1 },
    { itemId: 'copper_wire', stock: 10, priceModifier: 1.1 },
    { itemId: 'steam_valve', stock: 4, priceModifier: 1.2 },

    // Basic supplies
    { itemId: 'water_canteen', stock: 10, priceModifier: 1.1 },
    { itemId: 'trail_biscuits', stock: 20, priceModifier: 1.05 },
    { itemId: 'dried_jerky', stock: 15, priceModifier: 1.05 },
    { itemId: 'bandages', stock: 10, priceModifier: 1.1 },

    // Ammo
    { itemId: 'revolver_ammo', stock: 60, priceModifier: 1.0 },
    { itemId: 'rifle_ammo', stock: 50, priceModifier: 1.0 },
    { itemId: 'shotgun_shells', stock: 40, priceModifier: 1.0 },
  ],
  buyModifier: 0.5,
  canSell: true,
  acceptedTypes: ['weapon', 'junk'],
  tags: ['mining', 'iron_gulch', 'ivrc'],
};

export const IronGulchCompanyStore: ShopDefinition = {
  id: 'iron_gulch_company_store',
  name: 'IVRC Company Store',
  description:
    'The official IVRC general store. Overpriced goods with IVRC branding. Workers pay with company script.',
  ownerId: 'company_store_clerk',
  inventory: [
    // Food & provisions - OVERPRICED (1.3-1.5x modifier)
    { itemId: 'trail_biscuits', stock: 30, priceModifier: 1.4 },
    { itemId: 'dried_jerky', stock: 25, priceModifier: 1.4 },
    { itemId: 'beans', stock: 20, priceModifier: 1.35 },
    { itemId: 'coffee_beans', stock: 15, priceModifier: 1.45 },
    { itemId: 'water_canteen', stock: 12, priceModifier: 1.3 },
    { itemId: 'hot_meal', stock: 10, priceModifier: 1.5 },

    // Medical - OVERPRICED
    { itemId: 'bandages', stock: 20, priceModifier: 1.35 },
    { itemId: 'herbal_remedy', stock: 10, priceModifier: 1.4 },
    { itemId: 'laudanum', stock: 5, priceModifier: 1.5 },

    // Equipment - OVERPRICED
    { itemId: 'lantern', stock: 8, priceModifier: 1.35 },
    { itemId: 'rope', stock: 10, priceModifier: 1.3 },
    { itemId: 'oil_can', stock: 15, priceModifier: 1.25 },

    // IVRC-branded clothing and gear
    { itemId: 'leather_vest', stock: 5, priceModifier: 1.4 },

    // Ammo - standard markup
    { itemId: 'revolver_ammo', stock: 80, priceModifier: 1.2 },
    { itemId: 'rifle_ammo', stock: 60, priceModifier: 1.2 },
    { itemId: 'shotgun_shells', stock: 40, priceModifier: 1.2 },

    // Special: IVRC Executive Suit - requires reputation
    { itemId: 'ivrc_executive_suit', stock: 1, priceModifier: 1.0, minReputation: 30 },
  ],
  buyModifier: 0.35, // Pays poorly for goods
  canSell: true,
  acceptedTypes: ['weapon', 'armor', 'consumable', 'junk'],
  tags: ['general', 'iron_gulch', 'ivrc', 'company_store', 'overpriced'],
};

export const IronGulchSaloon: ShopDefinition = {
  id: 'iron_gulch_saloon',
  name: 'Lucky Strike Saloon',
  description: 'The social center of Iron Gulch. Drinks, food, and rumors. Miners gather after shift.',
  ownerId: 'bartender_molly',
  inventory: [
    // Drinks
    { itemId: 'whiskey', stock: -1, priceModifier: 1.0 },
    { itemId: 'beer', stock: -1, priceModifier: 0.85 },
    { itemId: 'moonshine', stock: 15, priceModifier: 1.25 },
    { itemId: 'coffee', stock: -1, priceModifier: 0.75 },

    // Food
    { itemId: 'hot_meal', stock: -1, priceModifier: 1.0 },
    { itemId: 'dried_jerky', stock: 15, priceModifier: 1.05 },
    { itemId: 'trail_biscuits', stock: 20, priceModifier: 1.05 },

    // Entertainment
    { itemId: 'playing_cards', stock: 5, priceModifier: 1.0 },
    { itemId: 'tobacco_pouch', stock: 10, priceModifier: 1.0 },
  ],
  buyModifier: 0.3,
  canSell: false,
  acceptedTypes: [],
  tags: ['saloon', 'drinks', 'food', 'iron_gulch'],
};

export const IronGulchApothecary: ShopDefinition = {
  id: 'iron_gulch_apothecary',
  name: "Doc Holloway's Medicine",
  description: 'Medical supplies and treatments for mining injuries. Doc knows his trade.',
  ownerId: 'doc_holloway',
  inventory: [
    // Basic medical
    { itemId: 'bandages', stock: 25, priceModifier: 1.0 },
    { itemId: 'herbal_remedy', stock: 15, priceModifier: 1.0 },

    // Advanced medical
    { itemId: 'medical_kit', stock: 6, priceModifier: 1.0 },
    { itemId: 'laudanum', stock: 12, priceModifier: 1.1 },
    { itemId: 'antivenom', stock: 8, priceModifier: 1.15 },

    // Potions
    { itemId: 'health_potion', stock: 8, priceModifier: 1.0 },
    { itemId: 'health_potion_greater', stock: 3, priceModifier: 1.1 },
    { itemId: 'antidote', stock: 5, priceModifier: 1.0 },

    // Special items - requires trust
    { itemId: 'stimulant', stock: 5, priceModifier: 1.3, minReputation: 10 },

    // Snake oil for the gullible
    { itemId: 'snake_oil', stock: 3, priceModifier: 0.8 },
  ],
  buyModifier: 0.4,
  canSell: true,
  acceptedTypes: ['consumable'],
  tags: ['medical', 'iron_gulch'],
};

export const IronGulchBlackMarket: ShopDefinition = {
  id: 'iron_gulch_black_market',
  name: 'The Back Room',
  description:
    'Hidden black market operating behind the mining supply store. Contraband and resistance supplies.',
  ownerId: 'black_market_dealer',
  inventory: [
    // Weapons - discounted stolen goods
    { itemId: 'revolver', stock: 2, priceModifier: 0.75, hidden: true },
    { itemId: 'navy_revolver', stock: 1, priceModifier: 0.8, hidden: true },
    { itemId: 'hunting_rifle', stock: 2, priceModifier: 0.8, hidden: true },
    { itemId: 'shotgun', stock: 1, priceModifier: 0.75, hidden: true },
    { itemId: 'bowie_knife', stock: 3, priceModifier: 0.7, hidden: true },

    // Explosives - cheaper than company store
    { itemId: 'dynamite', stock: 20, priceModifier: 0.8, hidden: true },

    // Ammo - discount
    { itemId: 'revolver_ammo', stock: 100, priceModifier: 0.65, hidden: true },
    { itemId: 'rifle_ammo', stock: 80, priceModifier: 0.65, hidden: true },
    { itemId: 'shotgun_shells', stock: 60, priceModifier: 0.65, hidden: true },

    // Contraband medical
    { itemId: 'stimulant', stock: 8, priceModifier: 0.9, hidden: true },
    { itemId: 'laudanum', stock: 10, priceModifier: 0.85, hidden: true },

    // Freeminer supplies - requires reputation
    { itemId: 'freeminers_harness', stock: 1, priceModifier: 0.9, minReputation: 15, hidden: true },

    // Stolen company goods
    { itemId: 'ivrc_pass', stock: 1, priceModifier: 2.5, minReputation: 25, hidden: true },
  ],
  buyModifier: 0.65, // Pays well for contraband
  canSell: true,
  acceptedTypes: ['weapon', 'armor', 'consumable', 'junk', 'key_item'],
  tags: ['black_market', 'iron_gulch', 'hidden', 'resistance'],
};

// ============================================================================
// QUESTS
// ============================================================================

export const DeepTroubleQuest: Quest = {
  id: 'deep_trouble',
  title: 'Deep Trouble',
  description:
    "Someone is sabotaging the IVRC mines in Iron Gulch. Foreman Burke wants you to find the culprit before more men die.",
  type: 'main',
  giverNpcId: 'foreman_burke',
  startLocationId: 'iron_gulch',
  recommendedLevel: 2,
  tags: ['main', 'investigation', 'sabotage', 'ivrc'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['missing_prospector'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_investigate',
      title: 'Investigate the Sabotage',
      description: "Gather information about the mine sabotage. Talk to workers, examine evidence.",
      onStartText:
        "Burke wants the saboteur found. Start by talking to people around town - the workers, the engineer, anyone who might know something.",
      onCompleteText:
        "You've gathered enough information to know that Silas Crane is being framed. The real saboteur is someone called 'The Engineer.'",
      objectives: [
        {
          id: 'obj_talk_clara',
          description: 'Speak with Engineer Clara Whitmore',
          type: 'talk',
          target: 'engineer_clara',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_talk_silas',
          description: 'Question Silas Crane',
          type: 'talk',
          target: 'silas_crane',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_gather_rumors',
          description: 'Gather rumors at the saloon',
          type: 'talk',
          target: 'bartender_molly',
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
      id: 'stage_decision',
      title: 'Make a Choice',
      description:
        "You know Silas is innocent and 'The Engineer' is the real saboteur. Do you tell Burke the truth, or sacrifice Silas to collect the reward?",
      onStartText:
        "The evidence points to 'The Engineer,' not Silas. But Burke wants someone to blame. What will you do?",
      onCompleteText:
        "You've made your choice. The consequences will follow.",
      objectives: [
        {
          id: 'obj_report_burke',
          description: 'Report to Foreman Burke',
          type: 'talk',
          target: 'foreman_burke',
          count: 1,
          current: 0,
          optional: false,
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
  ],

  rewards: {
    xp: 150,
    gold: 100,
    items: [],
    reputation: {},
    unlocksQuests: ['honor_among_thieves'],
  },
};

export const EngineersRequestQuest: Quest = {
  id: 'engineers_request',
  title: "The Engineer's Request",
  description:
    "Clara Whitmore needs help retrieving stolen safety documents from the Copperhead Gang.",
  type: 'side',
  giverNpcId: 'engineer_clara',
  startLocationId: 'iron_gulch',
  recommendedLevel: 2,
  tags: ['side', 'stealth', 'documents'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: [],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_accept',
      title: 'Accept Clara\'s Request',
      description: "Clara needs someone she can trust to retrieve important documents.",
      onStartText:
        "Clara has been secretly documenting IVRC's safety violations. The documents were stolen by someone working with the Copperheads.",
      onCompleteText:
        "You've agreed to help Clara retrieve the documents.",
      objectives: [
        {
          id: 'obj_talk_clara',
          description: 'Learn about the stolen documents',
          type: 'talk',
          target: 'engineer_clara',
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
      id: 'stage_retrieve',
      title: 'Retrieve the Documents',
      description: "Travel to Mesa Point and recover the stolen safety documents.",
      onStartText:
        "The documents are somewhere in Mesa Point, the Copperhead hideout. You'll need to find a way in.",
      onCompleteText:
        "You've recovered the documents. Clara will be relieved.",
      objectives: [
        {
          id: 'obj_find_documents',
          description: 'Find the stolen documents in Mesa Point',
          type: 'collect',
          target: 'stolen_safety_documents',
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
      id: 'stage_return',
      title: 'Return to Clara',
      description: "Deliver the documents to Clara Whitmore.",
      onStartText:
        "Get the documents back to Clara safely.",
      onCompleteText:
        "Clara is grateful. These documents could expose IVRC's negligence.",
      objectives: [
        {
          id: 'obj_deliver_documents',
          description: 'Return the documents to Clara',
          type: 'deliver',
          target: 'stolen_safety_documents',
          deliverTo: 'engineer_clara',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 40,
        gold: 30,
        items: [],
        reputation: { freeminers: 15 },
      },
    },
  ],

  rewards: {
    xp: 100,
    gold: 50,
    items: [{ itemId: 'medical_kit', quantity: 2 }],
    reputation: { freeminers: 25 },
    unlocksQuests: [],
  },
};

export const SaloonBrawlQuest: Quest = {
  id: 'saloon_brawl',
  title: 'Saloon Brawl',
  description:
    "Molly needs help dealing with some troublemakers who've been causing problems at the Lucky Strike.",
  type: 'side',
  giverNpcId: 'bartender_molly',
  startLocationId: 'iron_gulch',
  recommendedLevel: 2,
  tags: ['side', 'combat', 'saloon'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: [],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_confront',
      title: 'Deal with the Troublemakers',
      description: "Some IVRC enforcers have been harassing customers. Put a stop to it.",
      onStartText:
        "Three IVRC enforcers have been bullying customers and not paying their tabs. Molly wants them gone.",
      onCompleteText:
        "The troublemakers won't be causing any more problems.",
      objectives: [
        {
          id: 'obj_defeat_enforcers',
          description: 'Drive off the IVRC enforcers',
          type: 'kill',
          target: 'ivrc_enforcer',
          count: 3,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 40,
        gold: 20,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_report',
      title: 'Report to Molly',
      description: "Let Molly know the troublemakers are gone.",
      onStartText:
        "Head back to the saloon and tell Molly the good news.",
      onCompleteText:
        "Molly is grateful. Your drinks are on the house from now on.",
      objectives: [
        {
          id: 'obj_return_molly',
          description: 'Return to Molly at the saloon',
          type: 'talk',
          target: 'bartender_molly',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 20,
        gold: 10,
        items: [],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 60,
    gold: 35,
    items: [{ itemId: 'whiskey', quantity: 3 }],
    reputation: { townfolk: 10, ivrc: -10 },
    unlocksQuests: [],
  },
};

// ============================================================================
// TOWN DEFINITION
// ============================================================================

export const IronGulchTown: Town = {
  id: 'iron_gulch',
  name: 'Iron Gulch',
  description:
    "A bustling mining town at the heart of IVRC territory. Smoke rises from the smelters, and the clang of pickaxes echoes from the mountains. It's a place of opportunity and danger, where fortunes are made and lives are lost.",
  theme: 'mining',
  position: { x: 100, z: 50 },
  size: 'medium',

  npcs: ['foreman_burke', 'engineer_clara', 'silas_crane', 'doc_holloway', 'bartender_molly'],

  shops: [
    {
      id: 'iron_gulch_mining_supply',
      name: 'Iron Valley Mining Supply',
      type: 'general_store',
      operatorNpcId: 'mining_supply_clerk',
      shopInventoryId: 'iron_gulch_mining_supply',
      hours: { open: 6, close: 18 },
      priceModifier: 1.1,
      description: 'IVRC-owned supply depot for mining equipment.',
    },
    {
      id: 'iron_gulch_saloon',
      name: 'Lucky Strike Saloon',
      type: 'saloon',
      operatorNpcId: 'bartender_molly',
      shopInventoryId: 'iron_gulch_saloon',
      hours: { open: 10, close: 2 },
      priceModifier: 1.0,
      description: 'Drinks, food, and rumors.',
    },
    {
      id: 'iron_gulch_apothecary',
      name: "Doc Holloway's Medicine",
      type: 'doctor',
      operatorNpcId: 'doc_holloway',
      shopInventoryId: 'iron_gulch_apothecary',
      hours: null,
      priceModifier: 1.0,
      description: 'Medical supplies and treatments.',
    },
  ],

  quests: ['deep_trouble', 'engineers_request', 'saloon_brawl'],

  buildings: [
    {
      id: 'mine_entrance',
      type: 'mine_office',
      name: 'IVRC Mine Entrance',
      enterable: true,
      residentNpcIds: ['foreman_burke'],
      tags: ['mine', 'ivrc', 'main_quest'],
    },
    {
      id: 'foreman_office',
      type: 'mine_office',
      name: "Foreman's Office",
      enterable: true,
      residentNpcIds: ['foreman_burke'],
      tags: ['authority', 'ivrc'],
    },
    {
      id: 'engineering_workshop',
      type: 'workshop',
      name: 'Engineering Workshop',
      enterable: true,
      residentNpcIds: ['engineer_clara'],
      tags: ['engineering', 'workshop'],
    },
    {
      id: 'saloon',
      type: 'saloon',
      name: 'Lucky Strike Saloon',
      enterable: true,
      residentNpcIds: ['bartender_molly'],
      tags: ['saloon', 'social'],
    },
    {
      id: 'doctor_office',
      type: 'doctor_office',
      name: "Doc Holloway's Office",
      enterable: true,
      residentNpcIds: ['doc_holloway'],
      tags: ['medical', 'healing'],
    },
    {
      id: 'boarding_house',
      type: 'hotel',
      name: 'Miners\' Boarding House',
      enterable: true,
      residentNpcIds: ['silas_crane'],
      tags: ['lodging', 'rest'],
    },
    {
      id: 'mining_supply',
      type: 'general_store',
      name: 'Iron Valley Mining Supply',
      enterable: true,
      residentNpcIds: [],
      tags: ['shop', 'supplies'],
    },
  ],

  startDiscovered: false,
  dangerLevel: 3,
  economyLevel: 7,
  lawLevel: 'frontier',
  controllingFaction: 'ivrc',

  lore: "Iron Gulch grew from a tent camp to a proper town in just five years, fueled by the rich copper and iron deposits in the surrounding mountains. IVRC controls the major operations, but tension with independent miners and rumors of sabotage have created an atmosphere of suspicion and fear.",

  mapIcon: 'town',

  entryPoints: [
    { id: 'dusty_trail', direction: 'west', routeId: 'dusty_trail' },
    { id: 'desert_pass', direction: 'south', routeId: 'desert_pass' },
    { id: 'mountain_road', direction: 'north', routeId: 'mountain_road' },
  ],

  tags: ['mining', 'ivrc', 'main_hub', 'act_1'],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const IRON_GULCH_NPCS: NPCDefinition[] = [
  ForemanBurke,
  EngineerClara,
  SilasCrane,
  DocHolloway,
  BartenderMolly,
];

export const IRON_GULCH_DIALOGUES: DialogueTree[] = [
  ForemanBurkeDialogue,
  EngineerClaraDialogue,
  SilasCraneDialogue,
  DocHollowayDialogue,
  BartenderMollyDialogue,
];

export const IRON_GULCH_SHOPS: ShopDefinition[] = [
  IronGulchMiningSupply,
  IronGulchCompanyStore,
  IronGulchSaloon,
  IronGulchApothecary,
  IronGulchBlackMarket,
];

export const IRON_GULCH_QUESTS: Quest[] = [
  DeepTroubleQuest,
  EngineersRequestQuest,
  SaloonBrawlQuest,
];
