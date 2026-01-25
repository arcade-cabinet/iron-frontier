/**
 * Mesa Point - Outlaw Den
 *
 * A hidden settlement in the badlands controlled by the Copperhead Gang.
 * Morally grey territory where outlaws and desperate folks find refuge.
 * The player can find allies here - or make dangerous enemies.
 *
 * Theme: Hidden outlaw settlement, morally grey
 * Act: 2
 */

import type { DialogueTree, NPCDefinition } from '../../schemas/npc';
import type { Quest } from '../../schemas/quest';
import type { ShopDefinition } from '../../shops/index';
import type { Town } from '../townSchema';

// ============================================================================
// NPCs
// ============================================================================

export const RedEyeReyna: NPCDefinition = {
  id: 'red_eye_reyna',
  name: 'Reyna Vasquez',
  title: 'Red Eye',
  role: 'gang_leader',
  faction: 'copperhead',
  locationId: 'mesa_point',
  spawnCoord: { q: 15, r: 12 },
  personality: {
    aggression: 0.7,
    friendliness: 0.3,
    curiosity: 0.4,
    greed: 0.4,
    honesty: 0.5,
    lawfulness: 0.0,
  },
  description:
    'A fierce woman with a crimson scar across her left eye, hence her name. She leads the Copperheads at Mesa Point with cunning and violence in equal measure.',
  portraitId: 'red_eye_reyna',
  dialogueTreeIds: ['red_eye_reyna_main'],
  primaryDialogueId: 'red_eye_reyna_main',
  essential: true,
  questGiver: true,
  questIds: ['honor_among_thieves'],
  backstory:
    "Reyna was a farmgirl until IVRC seized her family's land. She killed two enforcers in the raid and has been an outlaw ever since. She's Diamondback's lieutenant, running day-to-day operations at Mesa Point.",
  relationships: [
    { npcId: 'whisper', type: 'ally', notes: 'Her best informant and closest confidant' },
    { npcId: 'bounty_hunter_cole', type: 'enemy', notes: 'He has a bounty on her head' },
  ],
  tags: ['authority', 'copperhead', 'quest_giver', 'outlaw'],
};

export const Whisper: NPCDefinition = {
  id: 'whisper',
  name: 'Unknown',
  title: 'Whisper',
  role: 'drifter',
  faction: 'copperhead',
  locationId: 'mesa_point',
  spawnCoord: { q: 18, r: 10 },
  personality: {
    aggression: 0.2,
    friendliness: 0.4,
    curiosity: 0.8,
    greed: 0.6,
    honesty: 0.4,
    lawfulness: 0.1,
  },
  description:
    'A slight figure wrapped in a dusty cloak, face always shadowed. Nobody knows their real name or even their gender. They deal in secrets and speak in whispers.',
  portraitId: 'whisper',
  dialogueTreeIds: ['whisper_main'],
  primaryDialogueId: 'whisper_main',
  essential: false,
  questGiver: true,
  questIds: ['informants_price'],
  backstory:
    "Whisper appeared in Mesa Point three years ago and quickly became invaluable. They know things nobody should know and sell information to anyone who pays. Their true loyalty - if any - remains a mystery.",
  relationships: [
    { npcId: 'red_eye_reyna', type: 'ally', notes: 'Works for her, but loyalty is questionable' },
  ],
  tags: ['information', 'mysterious', 'quest_giver'],
};

export const BountyHunterCole: NPCDefinition = {
  id: 'bounty_hunter_cole',
  name: 'Nathaniel Cole',
  title: 'Bounty Hunter',
  role: 'bounty_hunter',
  faction: 'neutral',
  locationId: 'mesa_point',
  spawnCoord: { q: 20, r: 15 },
  personality: {
    aggression: 0.6,
    friendliness: 0.2,
    curiosity: 0.3,
    greed: 0.7,
    honesty: 0.6,
    lawfulness: 0.5,
  },
  description:
    'A weathered man in a long duster, face hidden by the shadow of his hat. He hunts outlaws for money, not justice, and he is very good at his job.',
  portraitId: 'bounty_hunter_cole',
  dialogueTreeIds: ['bounty_hunter_cole_main'],
  primaryDialogueId: 'bounty_hunter_cole_main',
  essential: false,
  questGiver: false,
  questIds: [],
  backstory:
    "Cole used to be a US Marshal until he realized there was more money in bounty hunting. He's in Mesa Point looking for a specific target and willing to pay for information - or offer it in trade.",
  relationships: [
    { npcId: 'red_eye_reyna', type: 'enemy', notes: 'Has a bounty on her, waiting for the right moment' },
  ],
  tags: ['dangerous', 'bounty_hunter', 'neutral'],
};

export const TheFence: NPCDefinition = {
  id: 'the_fence',
  name: 'Solomon Grey',
  title: 'The Fence',
  role: 'merchant',
  faction: 'copperhead',
  locationId: 'mesa_point',
  spawnCoord: { q: 12, r: 18 },
  personality: {
    aggression: 0.1,
    friendliness: 0.5,
    curiosity: 0.4,
    greed: 0.9,
    honesty: 0.3,
    lawfulness: 0.0,
  },
  description:
    'A portly man with oily hair and an oilier smile. His fingers are covered in cheap rings, and his eyes never stop calculating the value of everything around him.',
  portraitId: 'the_fence',
  dialogueTreeIds: ['the_fence_main'],
  primaryDialogueId: 'the_fence_main',
  essential: false,
  questGiver: false,
  questIds: [],
  shopId: 'mesa_point_fence',
  backstory:
    "Solomon was a legitimate merchant until he discovered that stolen goods have better profit margins. He'll buy anything and sell anything - no questions asked.",
  relationships: [],
  tags: ['merchant', 'fence', 'black_market'],
};

// ============================================================================
// DIALOGUES
// ============================================================================

export const RedEyeReynaDialogue: DialogueTree = {
  id: 'red_eye_reyna_main',
  name: 'Red Eye Reyna - Main Conversation',
  description: 'Primary dialogue for the Copperhead leader at Mesa Point',
  tags: ['mesa_point', 'copperhead', 'authority', 'quest_giver'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'quest_active',
      conditions: [{ type: 'quest_active', target: 'honor_among_thieves' }],
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
      text: "*Her hand rests on her pistol* Well, well. A stranger in Mesa Point. You're either very brave or very stupid. Which is it?",
      expression: 'suspicious',
      choices: [
        {
          text: 'Brave enough to walk in, smart enough to come in peace.',
          nextNodeId: 'impressed_response',
        },
        {
          text: "I'm looking for the Copperheads. Business proposition.",
          nextNodeId: 'business_response',
        },
        {
          text: 'I was told you help people IVRC has wronged.',
          nextNodeId: 'sympathy_response',
        },
      ],
    },
    {
      id: 'impressed_response',
      text: "*A ghost of a smile* Smooth talker. I like that. But words don't mean much here. Actions do. I'm Reyna - they call me Red Eye. You want to stay in Mesa Point, you'll need to prove you're not an IVRC spy.",
      choices: [
        {
          text: 'How do I prove that?',
          nextNodeId: 'prove_loyalty',
        },
        {
          text: 'What makes you think I\'m a spy?',
          nextNodeId: 'spy_accusation',
        },
      ],
    },
    {
      id: 'business_response',
      text: "*Narrows her eyes* Business? The Copperheads don't do business with strangers. We rob, we fight, we survive. If you want to deal with us, you'll need to earn our trust first.",
      choices: [
        {
          text: 'How do I earn your trust?',
          nextNodeId: 'prove_loyalty',
        },
        {
          text: 'Fair enough. What do you need?',
          nextNodeId: 'prove_loyalty',
        },
      ],
    },
    {
      id: 'sympathy_response',
      text: "*Her expression softens slightly* Then you've heard right. IVRC took everything from most of us. They call us outlaws, but we're just people who refused to lie down and die. What did they take from you?",
      choices: [
        {
          text: 'They killed someone I cared about.',
          nextNodeId: 'personal_loss',
        },
        {
          text: "I'm not a victim. I'm here to fight back.",
          nextNodeId: 'fight_back',
        },
        {
          text: 'I just want to see justice done.',
          nextNodeId: 'justice_response',
        },
      ],
    },
    {
      id: 'personal_loss',
      text: "*Nods grimly* Then you understand. Every one of us has lost something to those bastards. My family's farm, my brother's life. We fight because we have nothing left to lose.",
      choices: [
        {
          text: 'Let me join you.',
          nextNodeId: 'join_offer',
        },
        {
          text: 'How can I help?',
          nextNodeId: 'prove_loyalty',
        },
      ],
    },
    {
      id: 'fight_back',
      text: "*Grins* That's what I like to hear. We can always use fighters. But you'll need to prove yourself first. Can't have just anyone knowing our secrets.",
      choices: [
        {
          text: 'Name it.',
          nextNodeId: 'prove_loyalty',
        },
      ],
    },
    {
      id: 'justice_response',
      text: "Justice? *Laughs bitterly* There's no justice out here. Just power and those who take it. But if you want to call fighting IVRC 'justice,' I won't argue. Results are what matter.",
      choices: [
        {
          text: 'Then let me help with those results.',
          nextNodeId: 'prove_loyalty',
        },
      ],
    },
    {
      id: 'spy_accusation',
      text: "Because IVRC has sent spies before. They found out the hard way what we do to traitors. *Touches her knife* You look smart enough to not make that mistake.",
      expression: 'threatening',
      choices: [
        {
          text: "I'm no spy. Let me prove it.",
          nextNodeId: 'prove_loyalty',
        },
        {
          text: "I'll be leaving then.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'prove_loyalty',
      text: "There's a job needs doing. IVRC has a payroll shipment coming through Devil's Pass in two days. We're going to hit it. Help us, and you'll have our trust. Betray us... well, you won't live to regret it.",
      choices: [
        {
          text: "I'm in.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'honor_among_thieves' }],
        },
        {
          text: 'Tell me more about the job first.',
          nextNodeId: 'job_details',
        },
      ],
    },
    {
      id: 'job_details',
      text: "Simple enough. The payroll wagon leaves Iron Gulch at dawn. It'll pass through Devil's Pass by midday. We ambush it, take the money, leave the guards alive if they're smart. This isn't about killing - it's about hitting IVRC where it hurts.",
      choices: [
        {
          text: 'Sounds fair. Count me in.',
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'honor_among_thieves' }],
        },
        {
          text: 'What happens to the money?',
          nextNodeId: 'money_use',
        },
      ],
    },
    {
      id: 'money_use',
      text: "We keep some for ourselves - outlaws need to eat. But most goes to the families IVRC has ruined. Widows, orphans, folks who lost everything to 'progress.' We're thieves, but we're not monsters.",
      choices: [
        {
          text: "Robin Hood with six-shooters. I like it.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'honor_among_thieves' }],
        },
      ],
    },
    {
      id: 'join_offer',
      text: "Join us? Slow down, stranger. We don't take just anyone. Complete the job at Devil's Pass, and we'll talk about membership. For now, you're a freelancer with potential. Don't waste it.",
      choices: [
        {
          text: "I'll prove myself.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'honor_among_thieves' }],
        },
      ],
    },
    {
      id: 'quest_active',
      text: "You ready for Devil's Pass? The wagon leaves Iron Gulch tomorrow at dawn. Be there, or we'll assume you're a coward or a traitor. Neither ends well.",
      choices: [
        {
          text: "I'll be there.",
          nextNodeId: null,
        },
        {
          text: 'Remind me of the plan.',
          nextNodeId: 'job_details',
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "Back again. What do you need?",
      choices: [
        {
          text: 'Any work available?',
          nextNodeId: 'work_check',
        },
        {
          text: 'Just checking in.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'work_check',
      text: "There's always work for someone willing to fight IVRC. Check with me later - we've got plans brewing.",
      choices: [
        {
          text: "I'll do that.",
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const WhisperDialogue: DialogueTree = {
  id: 'whisper_main',
  name: 'Whisper - Main Conversation',
  description: 'Primary dialogue for the mysterious informant',
  tags: ['mesa_point', 'information', 'mysterious'],

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
      text: "*A voice from the shadows, barely audible* Shhh. Come closer. Not too close. You're looking for something. Everyone who comes to Whisper is looking for something. Tell me... what do you seek?",
      expression: 'mysterious',
      choices: [
        {
          text: 'Information.',
          nextNodeId: 'information_response',
        },
        {
          text: 'Who are you?',
          nextNodeId: 'identity_response',
        },
        {
          text: 'How do you know I\'m looking for something?',
          nextNodeId: 'knowing_response',
        },
      ],
    },
    {
      id: 'information_response',
      text: "*A soft laugh* Information is my currency. I trade in secrets, rumors, truths that others want buried. But nothing is free. What do you offer in exchange?",
      choices: [
        {
          text: 'Money.',
          nextNodeId: 'money_offer',
        },
        {
          text: 'Information of my own.',
          nextNodeId: 'trade_offer',
        },
        {
          text: 'What kind of secrets do you have?',
          nextNodeId: 'secrets_sample',
        },
      ],
    },
    {
      id: 'money_offer',
      text: "Money... *considers* Useful, but common. Twenty dollars buys you a rumor. Fifty buys you a truth. A hundred buys you something dangerous. What can you afford?",
      choices: [
        {
          text: 'A rumor. [Pay 20 dollars]',
          nextNodeId: 'rumor_purchase',
          conditions: [{ type: 'gold_gte', value: 20 }],
          effects: [{ type: 'take_gold', value: 20 }],
        },
        {
          text: 'A truth. [Pay 50 dollars]',
          nextNodeId: 'truth_purchase',
          conditions: [{ type: 'gold_gte', value: 50 }],
          effects: [{ type: 'take_gold', value: 50 }],
        },
        {
          text: 'Something dangerous. [Pay 100 dollars]',
          nextNodeId: 'danger_purchase',
          conditions: [{ type: 'gold_gte', value: 100 }],
          effects: [{ type: 'take_gold', value: 100 }],
        },
        {
          text: 'Let me think about it.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'rumor_purchase',
      text: "*Pockets the money* A rumor, then. Word is that 'The Engineer' - the real saboteur at Iron Gulch - isn't working alone. Someone high up in IVRC is feeding him targets. A traitor in their own ranks. Interesting, no?",
      onEnterEffects: [{ type: 'set_flag', target: 'whisper_rumor_ivrc_traitor' }],
      choices: [
        {
          text: 'Who is the traitor?',
          nextNodeId: 'need_more_money',
        },
        {
          text: 'Interesting. Thank you.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'truth_purchase',
      text: "*Nods approvingly* A truth. The Engineer's real name is Victor Marsh. He was IVRC's chief inventor before they stole his designs and left him for dead. Now he wants revenge. You can find him in the caves north of here - but he doesn't welcome visitors.",
      onEnterEffects: [{ type: 'set_flag', target: 'whisper_knows_engineer_name' }],
      choices: [
        {
          text: 'Where exactly are these caves?',
          nextNodeId: 'cave_location',
        },
        {
          text: 'Valuable information. Thank you.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'danger_purchase',
      text: "*Their voice drops even lower* Something dangerous, then. IVRC isn't just mining copper and iron. There's a hidden project - 'Project Remnant.' Automatons. Machines that think. The prototypes went wrong, and they buried the evidence. But some survived, hidden in the old mines. They're the key to bringing IVRC down - or destroying the territory.",
      onEnterEffects: [{ type: 'set_flag', target: 'whisper_knows_remnant' }],
      choices: [
        {
          text: 'Automatons? That sounds like a fairy tale.',
          nextNodeId: 'not_fairy_tale',
        },
        {
          text: 'Where can I find proof?',
          nextNodeId: 'remnant_proof',
        },
      ],
    },
    {
      id: 'not_fairy_tale',
      text: "*A mirthless chuckle* Believe what you wish. But ask yourself - why does IVRC guard certain mine shafts so heavily? What are they hiding in the dark? The Remnant is real, and it's waiting.",
      choices: [
        {
          text: 'I believe you. Where can I find proof?',
          nextNodeId: 'remnant_proof',
        },
        {
          text: "I'll keep that in mind.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'remnant_proof',
      text: "The abandoned research facility beneath Iron Gulch. IVRC sealed it years ago, but there's a way in through the old drainage tunnels. Find the facility, and you'll find your proof. But be careful... not everything down there is as dead as it should be.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_remnant_location' }],
      choices: [
        {
          text: 'Thank you for the warning.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'need_more_money',
      text: "*Shakes their head* Names cost extra. Come back with more coin, and I might remember more details.",
      choices: [
        {
          text: "I'll be back.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'cave_location',
      text: "Follow the canyon north until you reach the triple fork. Take the left path into the narrows. The caves are hidden behind a waterfall - dry this time of year. Knock three times, pause, then twice more. That's the signal.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_engineer_hideout' }],
      choices: [
        {
          text: 'Got it.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'trade_offer',
      text: "*Interest piques* Information for information. What do you know that I don't?",
      choices: [
        {
          text: "I know about IVRC's safety violations.",
          nextNodeId: 'safety_trade',
          conditions: [{ type: 'flag_set', target: 'clara_hinted_resistance' }],
        },
        {
          text: 'I know where the Freeminers are hiding.',
          nextNodeId: 'freeminer_trade',
          conditions: [{ type: 'flag_set', target: 'heard_about_freeminers' }],
        },
        {
          text: 'Nothing of interest, I suppose.',
          nextNodeId: 'nothing_interesting',
        },
      ],
    },
    {
      id: 'safety_trade',
      text: "*Nods slowly* Useful, but not new. Still, a fair trade. In return: Foreman Burke takes bribes to look the other way when safety equipment goes missing. IVRC supplies the Copperheads through a corrupt middle man. Everyone has their price.",
      choices: [
        {
          text: 'Good to know.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'freeminer_trade',
      text: "*Clicks tongue* The Freeminer location is valuable, but not to me. I already know where they are. Offer me something else, or pay in coin.",
      choices: [
        {
          text: "I'll pay money instead.",
          nextNodeId: 'money_offer',
        },
        {
          text: 'Another time, then.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'nothing_interesting',
      text: "*Shrugs* Then our business is done for now. Return when you have coin or secrets. Whisper is always listening.",
      choices: [
        {
          text: 'Until next time.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'secrets_sample',
      text: "What secrets? *Counts on fingers* IVRC's real plans for the territory. The Engineer's hideout. Who's really behind the Copperhead raids. The location of a certain... project. But all of these have a price. What are you buying?",
      choices: [
        {
          text: "I'll pay for information.",
          nextNodeId: 'money_offer',
        },
        {
          text: 'Maybe another time.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'identity_response',
      text: "*Laughs softly* Who is Whisper? No one. Everyone. I am whatever people need me to be - a shadow, a rumor, a source. My true name died long ago. Only Whisper remains.",
      choices: [
        {
          text: 'Mysterious. What do you do here?',
          nextNodeId: 'information_response',
        },
        {
          text: 'Fair enough.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'knowing_response',
      text: "Because I know everything. *Pause* Or at least, everything that matters. I know you came here for a reason. I know you have questions. The only question is whether you can afford the answers.",
      choices: [
        {
          text: 'What do you know about me?',
          nextNodeId: 'know_about_player',
        },
        {
          text: 'Let me ask my questions.',
          nextNodeId: 'information_response',
        },
      ],
    },
    {
      id: 'know_about_player',
      text: "*Studies you* I know you received a letter with a gear symbol. I know you're looking for answers about your past. And I know that your search will lead you to places most fear to tread. Beyond that... you'll need to pay.",
      onEnterEffects: [{ type: 'set_flag', target: 'whisper_knows_player' }],
      choices: [
        {
          text: 'How do you know about the letter?',
          nextNodeId: 'letter_knowledge',
        },
        {
          text: "Impressive. Let's talk business.",
          nextNodeId: 'information_response',
        },
      ],
    },
    {
      id: 'letter_knowledge',
      text: "I make it my business to know things. The gear symbol belongs to the old Ironpick family. Freeminers who had evidence against IVRC. Evidence that was never destroyed, only hidden. That's all I'll say for free.",
      choices: [
        {
          text: "I need to know more.",
          nextNodeId: 'money_offer',
        },
        {
          text: "That's enough for now.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "*From the shadows* You return. Seeking more secrets?",
      choices: [
        {
          text: 'What can you tell me?',
          nextNodeId: 'money_offer',
        },
        {
          text: 'Just passing through.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const BountyHunterColeDialogue: DialogueTree = {
  id: 'bounty_hunter_cole_main',
  name: 'Bounty Hunter Cole - Main Conversation',
  description: 'Primary dialogue for the bounty hunter',
  tags: ['mesa_point', 'bounty_hunter', 'neutral'],

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
      text: "*Doesn't look up from cleaning his rifle* Another lost soul in the outlaw's den. You're either running from the law or looking for someone who is. Which is it?",
      expression: 'cold',
      choices: [
        {
          text: "Neither. I'm just passing through.",
          nextNodeId: 'passing_through',
        },
        {
          text: 'What are YOU doing here, bounty hunter?',
          nextNodeId: 'hunter_purpose',
        },
        {
          text: "Looking for work, actually.",
          nextNodeId: 'work_offer',
        },
      ],
    },
    {
      id: 'passing_through',
      text: "Passing through an outlaw hideout? Either you're very confident or very stupid. *Finally looks at you* You don't seem stupid. Which means you're here for a reason. Care to share?",
      choices: [
        {
          text: 'Why should I trust you?',
          nextNodeId: 'trust_question',
        },
        {
          text: "I'm looking for information about IVRC.",
          nextNodeId: 'ivrc_interest',
        },
      ],
    },
    {
      id: 'hunter_purpose',
      text: "*Slight smile* Hunting, of course. There's a bounty on Red Eye Reyna worth more than most miners make in a year. But she's protected here. I'm biding my time, waiting for the right moment.",
      choices: [
        {
          text: "Why tell me this?",
          nextNodeId: 'why_tell',
        },
        {
          text: "You're planning to kill her?",
          nextNodeId: 'kill_plan',
        },
      ],
    },
    {
      id: 'why_tell',
      text: "Because you might be useful. New faces don't last long here unless they're trusted. If you're getting close to Reyna, you might learn things. Things I'd pay for.",
      choices: [
        {
          text: 'What kind of information?',
          nextNodeId: 'info_request',
        },
        {
          text: "I'm not a snitch.",
          nextNodeId: 'not_snitch',
        },
      ],
    },
    {
      id: 'info_request',
      text: "Her patrol routes. When she leaves the settlement. Who her trusted guards are. Anything that helps me take her alive. IVRC wants a public trial - the bounty's double if she's breathing.",
      choices: [
        {
          text: "I'll think about it.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'cole_offered_deal' }],
        },
        {
          text: "Not interested.",
          nextNodeId: 'not_interested',
        },
      ],
    },
    {
      id: 'not_snitch',
      text: "*Shrugs* Everyone's got a price. Come find me when you discover yours.",
      choices: [
        {
          text: 'We\'ll see.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'not_interested',
      text: "Suit yourself. But remember - I'm not the only hunter out there. Sooner or later, someone will collect that bounty. Might as well be someone who profits from it.",
      choices: [
        {
          text: "I'll keep that in mind.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'kill_plan',
      text: "Kill her? No. Dead outlaws pay half. IVRC wants her alive for a show trial. I plan to collect the full bounty. It's just business.",
      choices: [
        {
          text: 'Sounds cold.',
          nextNodeId: 'cold_business',
        },
        {
          text: "Business is business.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'cold_business',
      text: "The frontier is cold. I didn't make the rules, I just survive by them. Reyna knew the risks when she started robbing trains. Now she pays the price.",
      choices: [
        {
          text: 'Fair point.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'trust_question',
      text: "You shouldn't. I hunt people for money. But right now, you're not worth hunting. That might change depending on what you do here. Make the smart choices.",
      choices: [
        {
          text: 'Noted.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'ivrc_interest',
      text: "*Interest flickers* IVRC? *Leans forward* Then we might have common ground. I've got history with the railroad company. They're not exactly on my Christmas list.",
      choices: [
        {
          text: 'What kind of history?',
          nextNodeId: 'ivrc_history',
        },
        {
          text: 'What do you know about them?',
          nextNodeId: 'ivrc_knowledge',
        },
      ],
    },
    {
      id: 'ivrc_history',
      text: "They hired me once to 'deal with' a union organizer. When I found out what they really wanted, I walked. They sent Pinkertons after me. We came to an... understanding. But I don't work for them anymore.",
      choices: [
        {
          text: 'You have principles.',
          nextNodeId: 'principles_response',
        },
        {
          text: 'What do you know about their operations?',
          nextNodeId: 'ivrc_knowledge',
        },
      ],
    },
    {
      id: 'principles_response',
      text: "*Snorts* Don't mistake self-preservation for principles. IVRC's dangerous enemies. I hunt bounties, not armies. But if someone were to weaken them... I wouldn't cry.",
      choices: [
        {
          text: 'Good to know.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'ivrc_knowledge',
      text: "I know they've got secrets they'd kill to protect. Something about old research projects, before they focused on mining. The higher-ups get nervous when anyone asks questions about the 'old days.'",
      onEnterEffects: [{ type: 'set_flag', target: 'cole_ivrc_hints' }],
      choices: [
        {
          text: 'Old research projects?',
          nextNodeId: 'research_hint',
        },
        {
          text: 'Interesting. Thanks.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'research_hint',
      text: "Before my time, but I've heard whispers. Machines, experiments, things that went wrong. Most of it's buried - literally and figuratively. But not everything. The truth is out there for anyone brave enough to dig.",
      choices: [
        {
          text: "I'll keep digging.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'work_offer',
      text: "*Considers* Work? I usually work alone. But if you're useful... I might have something. There's a bounty on a man named Victor Marsh. 'The Engineer.' Dangerous, but worth a lot dead or alive.",
      choices: [
        {
          text: 'Tell me more about this Engineer.',
          nextNodeId: 'engineer_bounty',
        },
        {
          text: "Not interested in bounty hunting.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'engineer_bounty',
      text: "Ex-IVRC inventor. They say he's behind the mine sabotage at Iron Gulch. Thousand-dollar bounty. He's holed up somewhere in the badlands - maybe with the Copperheads, maybe alone. Find him, and we'll split the take.",
      onEnterEffects: [{ type: 'set_flag', target: 'cole_engineer_bounty' }],
      choices: [
        {
          text: "I'll keep my eyes open.",
          nextNodeId: null,
        },
        {
          text: 'Not my kind of work.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "*Nods* You're still breathing. Good. Got anything useful for me?",
      choices: [
        {
          text: 'Not yet.',
          nextNodeId: null,
        },
        {
          text: "What's the offer again?",
          nextNodeId: 'info_request',
        },
      ],
    },
  ],
};

export const TheFenceDialogue: DialogueTree = {
  id: 'the_fence_main',
  name: 'The Fence - Main Conversation',
  description: 'Primary dialogue for the black market merchant',
  tags: ['mesa_point', 'merchant', 'fence'],

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
      text: "*Rubs his hands together* Ah, a customer! Welcome, welcome to Solomon's Emporium of Previously-Owned Goods. I buy, I sell, I don't ask questions. What can I do for you?",
      expression: 'greedy',
      choices: [
        {
          text: "I want to see what you're selling.",
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'mesa_point_black_market' }],
        },
        {
          text: "I've got things to sell.",
          nextNodeId: 'sell_intro',
        },
        {
          text: 'Previously-owned? You mean stolen.',
          nextNodeId: 'stolen_response',
        },
      ],
    },
    {
      id: 'sell_intro',
      text: "*Eyes light up* Excellent! Solomon pays fair prices for... unconventional merchandise. Show me what you've got, and I'll make you an offer.",
      choices: [
        {
          text: 'Show me your prices.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'mesa_point_fence' }],
        },
      ],
    },
    {
      id: 'stolen_response',
      text: "*Mock offense* Stolen? Such an ugly word! I prefer 'liberated' or 'redistributed.' The goods come from those who have too much and go to those who need them. It's practically charity!",
      choices: [
        {
          text: '*Laughs* Sure it is. Show me your goods.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'mesa_point_black_market' }],
        },
        {
          text: "I'll pass on the 'charity.'",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "Ah, you're back! Ready to do business?",
      choices: [
        {
          text: 'Show me what you have.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'mesa_point_black_market' }],
        },
        {
          text: "I've got things to sell.",
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'mesa_point_fence' }],
        },
        {
          text: 'Not right now.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

// ============================================================================
// SHOPS
// ============================================================================

export const MesaPointBlackMarket: ShopDefinition = {
  id: 'mesa_point_black_market',
  name: "Solomon's Emporium",
  description: "Rare and 'liberated' goods. No questions asked.",
  ownerId: 'the_fence',
  inventory: [
    // Weapons - better than normal stores
    { itemId: 'schofield', stock: 1, priceModifier: 0.8 },
    { itemId: 'repeater', stock: 2, priceModifier: 0.85 },
    { itemId: 'shotgun_coach', stock: 1, priceModifier: 0.8 },

    // Explosives
    { itemId: 'dynamite', stock: 15, priceModifier: 0.9 },

    // Rare consumables
    { itemId: 'stimulant', stock: 5, priceModifier: 1.0 },
    { itemId: 'snake_oil', stock: 3, priceModifier: 0.9 },

    // Ammo - cheap here
    { itemId: 'revolver_ammo', stock: 100, priceModifier: 0.7 },
    { itemId: 'rifle_ammo', stock: 80, priceModifier: 0.7 },
    { itemId: 'shotgun_shells', stock: 60, priceModifier: 0.7 },

    // Special
    { itemId: 'ivrc_pass', stock: 1, priceModifier: 3.0, minReputation: 20, hidden: true },
  ],
  buyModifier: 0.6, // Pays better for stolen goods
  canSell: true,
  acceptedTypes: ['weapon', 'armor', 'consumable', 'junk', 'key_item'],
  tags: ['black_market', 'mesa_point', 'fence'],
};

export const MesaPointFence: ShopDefinition = {
  id: 'mesa_point_fence',
  name: "Solomon's Buying Counter",
  description: "Sell anything - absolutely anything. No questions asked.",
  ownerId: 'the_fence',
  inventory: [],
  buyModifier: 0.7, // Pays 70% of value - better than most
  canSell: true,
  acceptedTypes: ['weapon', 'armor', 'consumable', 'junk', 'key_item', 'currency'],
  tags: ['fence', 'mesa_point', 'sell_only'],
};

// ============================================================================
// QUESTS
// ============================================================================

export const HonorAmongThievesQuest: Quest = {
  id: 'honor_among_thieves',
  title: 'Honor Among Thieves',
  description:
    "Help the Copperheads rob an IVRC payroll shipment to prove your loyalty - or gather evidence to betray them.",
  type: 'side',
  giverNpcId: 'red_eye_reyna',
  startLocationId: 'mesa_point',
  recommendedLevel: 3,
  tags: ['side', 'heist', 'copperhead', 'choice'],
  repeatable: false,
  timeLimitHours: 48,

  prerequisites: {
    completedQuests: ['deep_trouble'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_prepare',
      title: 'Prepare for the Heist',
      description: "Get ready for the ambush at Devil's Pass.",
      onStartText:
        "The payroll wagon leaves Iron Gulch tomorrow. Meet the Copperheads at Devil's Pass.",
      onCompleteText:
        "You're in position. The wagon will arrive soon.",
      objectives: [
        {
          id: 'obj_travel_pass',
          description: "Travel to Devil's Pass",
          type: 'visit',
          target: 'devils_pass',
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
      id: 'stage_heist',
      title: 'Execute the Heist',
      description: 'Help the Copperheads rob the payroll wagon.',
      onStartText:
        'The wagon is coming. Stop the guards and secure the payroll.',
      onCompleteText:
        "The heist is complete. Now you must decide what to do with what you've learned.",
      objectives: [
        {
          id: 'obj_stop_wagon',
          description: 'Stop the payroll wagon',
          type: 'kill',
          target: 'ivrc_guard',
          count: 4,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_secure_payroll',
          description: 'Secure the payroll',
          type: 'collect',
          target: 'ivrc_payroll',
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
        reputation: { copperhead: 25 },
      },
    },
    {
      id: 'stage_return',
      title: 'Return to Mesa Point',
      description: 'Deliver the payroll to Red Eye Reyna.',
      onStartText:
        "Return to Mesa Point with the payroll. Reyna will be waiting.",
      onCompleteText:
        "Reyna is pleased. You've proven yourself to the Copperheads.",
      objectives: [
        {
          id: 'obj_deliver_payroll',
          description: 'Deliver the payroll to Reyna',
          type: 'deliver',
          target: 'ivrc_payroll',
          deliverTo: 'red_eye_reyna',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 50,
        gold: 100,
        items: [],
        reputation: { copperhead: 25, ivrc: -30 },
      },
    },
  ],

  rewards: {
    xp: 150,
    gold: 150,
    items: [{ itemId: 'revolver_fancy', quantity: 1 }],
    reputation: { copperhead: 50, ivrc: -50 },
    unlocksQuests: [],
  },
};

export const InformantsPriceQuest: Quest = {
  id: 'informants_price',
  title: "The Informant's Price",
  description:
    "Whisper has information about your past, but the price is high. Complete a dangerous task to earn it.",
  type: 'side',
  giverNpcId: 'whisper',
  startLocationId: 'mesa_point',
  recommendedLevel: 4,
  tags: ['side', 'stealth', 'mystery'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: [],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_negotiate',
      title: 'Negotiate with Whisper',
      description: "Learn what Whisper wants in exchange for information about your past.",
      onStartText:
        "Whisper knows something about the letter you received. But nothing comes free.",
      onCompleteText:
        "Whisper wants a document from the IVRC telegraph office. Sounds simple - but it won't be.",
      objectives: [
        {
          id: 'obj_talk_whisper',
          description: 'Negotiate with Whisper',
          type: 'talk',
          target: 'whisper',
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
      id: 'stage_steal',
      title: 'Steal the Document',
      description: "Infiltrate the IVRC telegraph office in Iron Gulch and steal the coded document.",
      onStartText:
        "The document is kept in a safe at the telegraph office. Get in, get it, get out.",
      onCompleteText:
        "You have the document. Time to return to Whisper.",
      objectives: [
        {
          id: 'obj_steal_document',
          description: 'Steal the coded document',
          type: 'collect',
          target: 'coded_telegraph_document',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 60,
        gold: 0,
        items: [],
        reputation: { ivrc: -15 },
      },
    },
    {
      id: 'stage_deliver',
      title: 'Return to Whisper',
      description: 'Deliver the document and receive your payment.',
      onStartText:
        "Whisper is waiting for the document.",
      onCompleteText:
        "Whisper reveals that the gear symbol belongs to your parent - a Freeminer leader who was killed by IVRC. The truth begins to unfold.",
      objectives: [
        {
          id: 'obj_deliver_document',
          description: 'Deliver the document to Whisper',
          type: 'deliver',
          target: 'coded_telegraph_document',
          deliverTo: 'whisper',
          count: 1,
          current: 0,
          optional: false,
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
    xp: 100,
    gold: 0,
    items: [],
    reputation: {},
    unlocksQuests: [],
  },
};

// ============================================================================
// TOWN DEFINITION
// ============================================================================

export const MesaPointTown: Town = {
  id: 'mesa_point',
  name: 'Mesa Point',
  description:
    "A hidden settlement in the badlands, controlled by the Copperhead Gang. Outlaws, fugitives, and those with nowhere else to go find refuge here. IVRC's laws don't reach this far.",
  theme: 'outlaw',
  position: { x: 75, z: -50 },
  size: 'small',

  npcs: ['red_eye_reyna', 'whisper', 'bounty_hunter_cole', 'the_fence'],

  shops: [
    {
      id: 'mesa_point_black_market',
      name: "Solomon's Emporium",
      type: 'black_market',
      operatorNpcId: 'the_fence',
      shopInventoryId: 'mesa_point_black_market',
      hours: null,
      priceModifier: 0.9,
      description: 'Rare goods and stolen merchandise.',
    },
    {
      id: 'mesa_point_fence',
      name: "Solomon's Buying Counter",
      type: 'trading_post',
      operatorNpcId: 'the_fence',
      shopInventoryId: 'mesa_point_fence',
      hours: null,
      priceModifier: 1.0,
      description: 'Sell anything. No questions asked.',
    },
  ],

  quests: ['honor_among_thieves', 'informants_price'],

  buildings: [
    {
      id: 'hidden_saloon',
      type: 'saloon',
      name: "The Rattler's Den",
      enterable: true,
      residentNpcIds: ['red_eye_reyna'],
      tags: ['social', 'copperhead'],
    },
    {
      id: 'stash_house',
      type: 'warehouse',
      name: 'Stash House',
      enterable: false,
      residentNpcIds: [],
      tags: ['storage', 'copperhead'],
    },
    {
      id: 'lookout_tower',
      type: 'watch_tower',
      name: 'Lookout Tower',
      enterable: false,
      residentNpcIds: [],
      tags: ['defense', 'lookout'],
    },
    {
      id: 'caves',
      type: 'cabin',
      name: 'Cave Dwellings',
      enterable: true,
      residentNpcIds: ['whisper'],
      tags: ['shelter', 'hidden'],
    },
    {
      id: 'fence_shop',
      type: 'general_store',
      name: "Solomon's Shop",
      enterable: true,
      residentNpcIds: ['the_fence'],
      tags: ['shop', 'black_market'],
    },
  ],

  unlockCondition: {
    type: 'flag',
    target: 'knows_engineer_location',
  },

  startDiscovered: false,
  dangerLevel: 5,
  economyLevel: 4,
  lawLevel: 'lawless',
  controllingFaction: 'copperhead',

  lore: "Mesa Point was once a mining camp, abandoned when the ore ran out. The Copperhead Gang moved in and made it their base of operations. The narrow approach and high walls make it easy to defend - and hard to find.",

  mapIcon: 'camp',

  entryPoints: [
    { id: 'desert_pass', direction: 'north', routeId: 'desert_pass' },
    { id: 'badlands_trail', direction: 'east', routeId: 'badlands_trail' },
  ],

  tags: ['outlaw', 'copperhead', 'hidden', 'act_2'],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const MESA_POINT_NPCS: NPCDefinition[] = [
  RedEyeReyna,
  Whisper,
  BountyHunterCole,
  TheFence,
];

export const MESA_POINT_DIALOGUES: DialogueTree[] = [
  RedEyeReynaDialogue,
  WhisperDialogue,
  BountyHunterColeDialogue,
  TheFenceDialogue,
];

export const MESA_POINT_SHOPS: ShopDefinition[] = [
  MesaPointBlackMarket,
  MesaPointFence,
];

export const MESA_POINT_QUESTS: Quest[] = [
  HonorAmongThievesQuest,
  InformantsPriceQuest,
];
