/**
 * Salvation - Endgame Religious Settlement
 *
 * A mysterious religious community in the badlands where the final
 * confrontation takes place. Preacher Solomon holds secrets that
 * could make him either the final villain or a crucial ally,
 * depending on the player's choices throughout the game.
 *
 * Theme: Religious settlement, final confrontation
 * Act: 3 (Endgame)
 */

import type { DialogueTree, NPCDefinition } from '../../schemas/npc';
import type { Quest } from '../../schemas/quest';
import type { ShopDefinition } from '../../shops/index';
import type { Town } from '../townSchema';

// ============================================================================
// NPCs
// ============================================================================

export const PreacherSolomon: NPCDefinition = {
  id: 'preacher_solomon',
  name: 'Jeremiah Solomon',
  title: 'Preacher',
  role: 'preacher',
  faction: 'neutral',
  locationId: 'salvation',
  spawnCoord: { q: 15, r: 15 },
  personality: {
    aggression: 0.3,
    friendliness: 0.6,
    curiosity: 0.4,
    greed: 0.2,
    honesty: 0.5, // Complex - hides things
    lawfulness: 0.5,
  },
  description:
    'A charismatic man in simple preacher\'s clothes, his silver hair swept back and his eyes burning with conviction. His voice can soothe or terrify, depending on his sermon.',
  portraitId: 'preacher_solomon',
  dialogueTreeIds: ['preacher_solomon_main'],
  primaryDialogueId: 'preacher_solomon_main',
  essential: true,
  questGiver: true,
  questIds: ['reckoning', 'redemption'],
  backstory:
    "Solomon was once an IVRC executive who witnessed Project Remnant's horrors firsthand. Overcome with guilt, he fled and founded Salvation as penance. He knows all of IVRC's secrets - but whether he uses them for good or to complete IVRC's work depends on how he's approached.",
  relationships: [
    { npcId: 'sister_hope', type: 'ally', notes: 'His most devoted follower' },
    { npcId: 'brother_cain', type: 'neutral', notes: 'Questions his methods' },
  ],
  tags: ['authority', 'religious', 'morally_grey', 'endgame', 'secret_villain_or_ally'],
};

export const SisterHope: NPCDefinition = {
  id: 'sister_hope',
  name: 'Hope Williams',
  title: 'Sister',
  role: 'preacher',
  faction: 'neutral',
  locationId: 'salvation',
  spawnCoord: { q: 12, r: 18 },
  personality: {
    aggression: 0.0,
    friendliness: 0.9,
    curiosity: 0.5,
    greed: 0.0,
    honesty: 0.9,
    lawfulness: 0.8,
  },
  description:
    'A gentle young woman with kind eyes and a serene smile. She truly believes in Salvation\'s mission and sees only good in Preacher Solomon.',
  portraitId: 'sister_hope',
  dialogueTreeIds: ['sister_hope_main'],
  primaryDialogueId: 'sister_hope_main',
  essential: false,
  questGiver: false,
  questIds: [],
  backstory:
    "Hope was orphaned when IVRC's mining operations destroyed her village. Solomon took her in and raised her as his own. She's completely devoted to him and the community, unaware of his complicated past.",
  relationships: [
    { npcId: 'preacher_solomon', type: 'family', notes: 'Sees him as a father figure' },
  ],
  tags: ['religious', 'innocent', 'information'],
};

export const BrotherCain: NPCDefinition = {
  id: 'brother_cain',
  name: 'Marcus Kane',
  title: 'Brother Cain',
  role: 'drifter',
  faction: 'neutral',
  locationId: 'salvation',
  spawnCoord: { q: 20, r: 12 },
  personality: {
    aggression: 0.4,
    friendliness: 0.4,
    curiosity: 0.7,
    greed: 0.2,
    honesty: 0.7,
    lawfulness: 0.4,
  },
  description:
    "A scarred man with watchful eyes who converted to Solomon's faith but never lost his edge. He guards the settlement and has his own suspicions about the Preacher's past.",
  portraitId: 'brother_cain',
  dialogueTreeIds: ['brother_cain_main'],
  primaryDialogueId: 'brother_cain_main',
  essential: false,
  questGiver: false,
  questIds: [],
  backstory:
    "Kane was a gunfighter before he found faith. He protects Salvation with deadly skill but has noticed inconsistencies in Solomon's story. He suspects the Preacher is hiding something and may become an ally to expose the truth.",
  relationships: [
    { npcId: 'preacher_solomon', type: 'neutral', notes: 'Loyal but suspicious' },
    { npcId: 'sister_hope', type: 'ally', notes: 'Protective of her innocence' },
  ],
  tags: ['guard', 'suspicious', 'potential_ally'],
};

export const FinalAlly: NPCDefinition = {
  id: 'final_ally',
  name: 'Samuel Ironpick Jr.',
  title: '',
  role: 'miner',
  faction: 'freeminer',
  locationId: 'salvation',
  spawnCoord: { q: 18, r: 20 },
  personality: {
    aggression: 0.5,
    friendliness: 0.5,
    curiosity: 0.6,
    greed: 0.1,
    honesty: 0.9,
    lawfulness: 0.6,
  },
  description:
    "A young man with his grandfather's determined eyes. He carries himself with the weight of responsibility and the fire of vengeance.",
  portraitId: 'final_ally',
  dialogueTreeIds: ['final_ally_main'],
  primaryDialogueId: 'final_ally_main',
  essential: true,
  questGiver: false,
  questIds: [],
  backstory:
    "Samuel Jr. is the grandson of Old Samuel Ironpick, leader of the Freeminers. He came to Salvation seeking the truth about his family's connection to IVRC - and discovered that Solomon holds the key to everything.",
  relationships: [
    { npcId: 'preacher_solomon', type: 'enemy', notes: 'Suspects him of betraying the Freeminers' },
  ],
  tags: ['freeminer', 'endgame', 'ally'],
};

// ============================================================================
// DIALOGUES
// ============================================================================

export const PreacherSolomonDialogue: DialogueTree = {
  id: 'preacher_solomon_main',
  name: 'Preacher Solomon - Main Conversation',
  description: 'Primary dialogue for the enigmatic preacher',
  tags: ['salvation', 'religious', 'endgame'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'quest_active',
      conditions: [{ type: 'quest_active', target: 'reckoning' }],
      priority: 5,
    },
    {
      nodeId: 'good_reputation',
      conditions: [{ type: 'reputation_gte', value: 50 }],
      priority: 3,
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
      text: "*Spreads his arms in welcome* A traveler, guided by providence to Salvation. Welcome, child. I am Jeremiah Solomon, shepherd of this flock. What brings you to the edge of the world?",
      expression: 'warm',
      choices: [
        {
          text: "I'm looking for answers about IVRC.",
          nextNodeId: 'ivrc_question',
        },
        {
          text: 'What is this place?',
          nextNodeId: 'place_explanation',
        },
        {
          text: 'I know who you really are, Solomon.',
          nextNodeId: 'confrontation',
          conditions: [{ type: 'flag_set', target: 'knows_solomon_secret' }],
        },
      ],
    },
    {
      id: 'place_explanation',
      text: "Salvation is a refuge for the lost and the seeking. Those who have been broken by the world come here to find peace. We live simply, pray together, and prepare for the day of reckoning that approaches.",
      choices: [
        {
          text: 'Day of reckoning?',
          nextNodeId: 'reckoning_explanation',
        },
        {
          text: 'Sounds peaceful.',
          nextNodeId: 'peaceful_response',
        },
      ],
    },
    {
      id: 'reckoning_explanation',
      text: "*His eyes gleam* A day when all accounts are settled. When those who have sinned against the innocent will face judgment. IVRC, the railroad barons, all who have exploited the weak... their time is coming.",
      choices: [
        {
          text: 'You know about IVRC?',
          nextNodeId: 'ivrc_knowledge',
        },
        {
          text: 'That sounds like a threat.',
          nextNodeId: 'threat_response',
        },
      ],
    },
    {
      id: 'ivrc_knowledge',
      text: "*His expression darkens* I know them better than most. I know their sins, their secrets, their monstrous experiments. I was... close to their inner circle, once. Before I saw the truth and fled.",
      choices: [
        {
          text: 'You worked for IVRC?',
          nextNodeId: 'ivrc_confession',
        },
        {
          text: 'What experiments?',
          nextNodeId: 'remnant_reveal',
        },
      ],
    },
    {
      id: 'ivrc_confession',
      text: "*Long pause* Yes. I was one of them. An executive who helped build their empire on the backs of the exploited. I witnessed things... terrible things. Project Remnant. The automatons. The test subjects. *Voice breaks* I could have stopped it. I didn't.",
      choices: [
        {
          text: 'Why are you telling me this?',
          nextNodeId: 'why_confess',
        },
        {
          text: 'You should pay for what you did.',
          nextNodeId: 'pay_for_sins',
        },
      ],
    },
    {
      id: 'why_confess',
      text: "Because the reckoning approaches, and I cannot face it alone. I've spent years preparing, gathering evidence, building this sanctuary. But to truly destroy IVRC, I need help. Someone from outside. Someone like you.",
      choices: [
        {
          text: 'What do you need me to do?',
          nextNodeId: 'reckoning_quest',
        },
        {
          text: 'Why should I trust you?',
          nextNodeId: 'trust_question',
        },
      ],
    },
    {
      id: 'reckoning_quest',
      text: "The final piece of evidence is hidden in IVRC's vault in Iron Gulch. Documents, research, names of everyone involved. With it, we can expose them to the world. But the vault is heavily guarded. I need someone who can get inside.",
      choices: [
        {
          text: "I'll do it.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'reckoning' }],
        },
        {
          text: 'What do I get out of this?',
          nextNodeId: 'reward_discussion',
        },
      ],
    },
    {
      id: 'reward_discussion',
      text: "Justice. Answers about your own past. And if that's not enough - the vault contains a fortune in gold. Take what you want. I only need the documents.",
      choices: [
        {
          text: 'Fair enough.',
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'reckoning' }],
        },
      ],
    },
    {
      id: 'pay_for_sins',
      text: "*Nods slowly* Perhaps I should. But dying won't help the people still suffering. Let me use what's left of my life to make amends. Help me destroy IVRC, and then... you can judge me as you see fit.",
      choices: [
        {
          text: 'What do you propose?',
          nextNodeId: 'reckoning_quest',
        },
        {
          text: 'No. You face justice now.',
          nextNodeId: 'confrontation_hostile',
        },
      ],
    },
    {
      id: 'trust_question',
      text: "Trust? *Laughs bitterly* I don't ask for trust. I ask for a transaction. I have information you need. You have skills I need. Work with me, and we both get what we want. After that, you can do as your conscience dictates.",
      choices: [
        {
          text: 'Fair enough. What is the plan?',
          nextNodeId: 'reckoning_quest',
        },
        {
          text: 'I need to think about this.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'remnant_reveal',
      text: "*Voice drops to a whisper* Project Remnant. IVRC's attempt to create the perfect workers - then the perfect soldiers. They experimented on people, enhanced them with machinery and chemicals. Most died. The survivors... some escaped. Others are still out there, controlled.",
      onEnterEffects: [{ type: 'set_flag', target: 'solomon_revealed_remnant' }],
      choices: [
        {
          text: 'The Wanderer mentioned something similar.',
          nextNodeId: 'wanderer_connection',
          conditions: [{ type: 'flag_set', target: 'wanderer_revealed_remnant' }],
        },
        {
          text: "Why hasn't anyone exposed this?",
          nextNodeId: 'why_secret',
        },
      ],
    },
    {
      id: 'wanderer_connection',
      text: "*Eyes widen* The Wanderer lives? One of the escaped subjects... I thought they were all dead or recaptured. This changes things. If they can testify to what was done... we might have a chance to expose everything.",
      choices: [
        {
          text: 'Help me bring down IVRC.',
          nextNodeId: 'reckoning_quest',
        },
      ],
    },
    {
      id: 'why_secret',
      text: "Because IVRC owns the law, the press, the politicians. Anyone who tried to speak was silenced. I survived only by disappearing completely, by becoming Preacher Solomon instead of... who I was before. The evidence is buried, but not destroyed. I know where it is.",
      choices: [
        {
          text: 'Then let us dig it up.',
          nextNodeId: 'reckoning_quest',
        },
      ],
    },
    {
      id: 'ivrc_question',
      text: "*His welcoming smile falters* IVRC? Why do you seek answers about the railroad company? They are not the sort of entity one questions lightly.",
      choices: [
        {
          text: 'They killed my family.',
          nextNodeId: 'family_sympathy',
        },
        {
          text: 'I have evidence of their crimes.',
          nextNodeId: 'evidence_interest',
        },
        {
          text: "Something called 'Project Remnant.'",
          nextNodeId: 'remnant_reveal',
        },
      ],
    },
    {
      id: 'family_sympathy',
      text: "*His expression softens with genuine pain* Then we share a common wound. IVRC has destroyed countless families. Perhaps providence truly did guide you here. I may be able to help you find justice - and vengeance.",
      choices: [
        {
          text: 'How?',
          nextNodeId: 'ivrc_knowledge',
        },
      ],
    },
    {
      id: 'evidence_interest',
      text: "*Leans forward* Evidence? What kind of evidence? I have been... collecting information myself. Perhaps together we could accomplish what neither could alone.",
      choices: [
        {
          text: 'Show me what you have.',
          nextNodeId: 'ivrc_knowledge',
        },
        {
          text: 'You first.',
          nextNodeId: 'ivrc_knowledge',
        },
      ],
    },
    {
      id: 'peaceful_response',
      text: "It is. Peace is what we offer here - peace from the troubles of the world, peace from the pursuit of those who would exploit the weak. All are welcome in Salvation.",
      choices: [
        {
          text: 'Even those who have done wrong?',
          nextNodeId: 'wrong_discussion',
        },
        {
          text: 'Thank you.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'wrong_discussion',
      text: "*Pauses thoughtfully* Especially those who have done wrong, if they truly seek redemption. We all carry burdens. Some heavier than others. The question is whether we let those burdens define us, or whether we rise above them.",
      choices: [
        {
          text: 'Wise words.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'threat_response',
      text: "*Shakes his head* Not a threat - a prophecy. The wicked always fall, in time. IVRC's empire is built on sand and blood. It will crumble. The only question is whether the innocent will be saved when it does.",
      choices: [
        {
          text: 'You sound very certain.',
          nextNodeId: 'ivrc_knowledge',
        },
      ],
    },
    {
      id: 'confrontation',
      text: "*His warm facade cracks* Ah. You've been digging. *Sighs* Then you know I was part of IVRC. You know about Project Remnant. The question is - what do you intend to do with that knowledge?",
      expression: 'serious',
      choices: [
        {
          text: 'I want the truth.',
          nextNodeId: 'ivrc_confession',
        },
        {
          text: 'I want justice.',
          nextNodeId: 'pay_for_sins',
        },
        {
          text: 'I want your help destroying IVRC.',
          nextNodeId: 'reckoning_quest',
        },
      ],
    },
    {
      id: 'confrontation_hostile',
      text: "*Stands tall* Then you are a fool. Kill me, and the evidence dies with me. IVRC wins. Is that what you want? Or can you set aside your anger long enough to see the bigger picture?",
      choices: [
        {
          text: '*Reluctantly* Fine. What is your plan?',
          nextNodeId: 'reckoning_quest',
        },
        {
          text: 'Your death is justice enough.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'hostile_to_solomon' }],
        },
      ],
    },
    {
      id: 'good_reputation',
      text: "*Greets you warmly* You have proven yourself a friend to Salvation and to justice. The day of reckoning approaches. Are you ready?",
      choices: [
        {
          text: "I'm ready.",
          nextNodeId: 'reckoning_quest',
        },
        {
          text: 'Tell me more about the plan.',
          nextNodeId: 'reckoning_quest',
        },
      ],
    },
    {
      id: 'quest_active',
      text: "The vault awaits. Have you found a way inside?",
      choices: [
        {
          text: 'Still working on it.',
          nextNodeId: null,
        },
        {
          text: 'Remind me of the plan.',
          nextNodeId: 'reckoning_quest',
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "Welcome back, seeker. How may I serve you today?",
      choices: [
        {
          text: 'I have questions about IVRC.',
          nextNodeId: 'ivrc_knowledge',
        },
        {
          text: 'Just visiting.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const SisterHopeDialogue: DialogueTree = {
  id: 'sister_hope_main',
  name: 'Sister Hope - Main Conversation',
  description: 'Primary dialogue for the innocent follower',
  tags: ['salvation', 'religious', 'innocent'],

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
      text: "*Smiles serenely* Welcome to Salvation, traveler. I'm Sister Hope. If you're weary or lost, you've come to the right place. Would you like some water? A place to rest?",
      expression: 'kind',
      choices: [
        {
          text: 'Thank you. Tell me about this place.',
          nextNodeId: 'place_description',
        },
        {
          text: 'What can you tell me about Preacher Solomon?',
          nextNodeId: 'solomon_praise',
        },
        {
          text: "I'm just passing through.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'place_description',
      text: "Salvation is a sanctuary for those who have nowhere else to go. Father Solomon founded it years ago as a place of healing and hope. We grow our own food, pray together, and prepare for the day when justice will come to the territory.",
      choices: [
        {
          text: 'Justice for what?',
          nextNodeId: 'justice_explanation',
        },
        {
          text: 'Father Solomon?',
          nextNodeId: 'solomon_praise',
        },
      ],
    },
    {
      id: 'justice_explanation',
      text: "For all the wrongs done by those in power. The railroad company, the mining barons - they've hurt so many people. Father Solomon says that one day, they'll answer for their crimes. He's preparing us for that day.",
      choices: [
        {
          text: 'How is he preparing you?',
          nextNodeId: 'preparation',
        },
        {
          text: 'That sounds intense.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'preparation',
      text: "Prayer, mostly. And learning the truth about what's really happening in the territory. Father Solomon knows so much - about the railroad, about what they've done. He's the wisest man I've ever known.",
      choices: [
        {
          text: 'What has he told you?',
          nextNodeId: 'what_told',
        },
        {
          text: 'He sounds remarkable.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'what_told',
      text: "*Frowns slightly* He doesn't share everything. Says some truths are too heavy for gentle souls. But I know the railroad has done terrible things. I've seen the refugees who come here, broken by what they've endured.",
      choices: [
        {
          text: "You don't know about his past?",
          nextNodeId: 'past_question',
        },
        {
          text: 'That must be hard to witness.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'past_question',
      text: "*Puzzled* His past? He was a preacher back East before he came here. At least, that's what he told me. *Hesitates* Why? Do you know something different?",
      choices: [
        {
          text: "No, just curious. Forget I asked.",
          nextNodeId: null,
        },
        {
          text: 'Ask him yourself someday.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'hope_curious_about_solomon' }],
        },
      ],
    },
    {
      id: 'solomon_praise',
      text: "*Eyes light up* Father Solomon is the kindest, most generous man I've ever known. He saved me when I had nothing and no one. He took me in, raised me, taught me everything. I owe him everything.",
      choices: [
        {
          text: 'What happened to your family?',
          nextNodeId: 'family_story',
        },
        {
          text: "He sounds like a good man.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'family_story',
      text: "*Her smile fades* A mining company took our land. When we refused to leave, there was a fire. I was the only survivor. Father Solomon found me wandering in the desert, half-dead. He brought me here and gave me a new family.",
      choices: [
        {
          text: "I'm sorry for your loss.",
          nextNodeId: null,
        },
        {
          text: 'The mining company - was it IVRC?',
          nextNodeId: 'ivrc_question_hope',
        },
      ],
    },
    {
      id: 'ivrc_question_hope',
      text: "*Nods darkly* IVRC. The Iron Valley Railroad Company. They destroy everything they touch. But Father Solomon says their time will come. And I believe him.",
      choices: [
        {
          text: 'I hope you find peace.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "*Smiles warmly* Welcome back! Can I help you with anything?",
      choices: [
        {
          text: 'Just visiting.',
          nextNodeId: null,
        },
        {
          text: "How is everyone here?",
          nextNodeId: 'community_update',
        },
      ],
    },
    {
      id: 'community_update',
      text: "Well, thank you for asking! The crops are growing, the prayers are strong, and Father Solomon has been in good spirits. Something important is coming, he says. A turning point.",
      choices: [
        {
          text: "That's good to hear.",
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const BrotherCainDialogue: DialogueTree = {
  id: 'brother_cain_main',
  name: 'Brother Cain - Main Conversation',
  description: 'Primary dialogue for the suspicious guard',
  tags: ['salvation', 'guard', 'suspicious'],

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
      text: "*Hand rests on his gun* Hold up. State your business. Salvation doesn't take kindly to strangers who can't explain themselves.",
      expression: 'suspicious',
      choices: [
        {
          text: "I'm looking for Preacher Solomon.",
          nextNodeId: 'solomon_directions',
        },
        {
          text: "Relax. I'm not here for trouble.",
          nextNodeId: 'relax_response',
        },
        {
          text: 'What are YOU doing here?',
          nextNodeId: 'cain_backstory',
        },
      ],
    },
    {
      id: 'solomon_directions',
      text: "*Eyes narrow* Everyone wants to see the Preacher. Question is, why? He's in the church, praying probably. But you'll answer my questions first. What do you want with him?",
      choices: [
        {
          text: 'I have questions about IVRC.',
          nextNodeId: 'ivrc_interest',
        },
        {
          text: 'Personal business.',
          nextNodeId: 'personal_business',
        },
      ],
    },
    {
      id: 'ivrc_interest',
      text: "*Tension eases slightly* IVRC, huh? Then maybe we're on the same side. The Preacher knows things about that company. Things that could get people killed. Be careful what you ask for.",
      choices: [
        {
          text: 'What do you know about his past?',
          nextNodeId: 'solomon_suspicion',
        },
        {
          text: "I can handle it.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'solomon_suspicion',
      text: "*Glances around, lowers voice* He wasn't always a preacher. Something in his past, something big. I've heard him talk in his sleep about experiments, about guilt. He knows more than he says. Watch yourself around him.",
      onEnterEffects: [{ type: 'set_flag', target: 'cain_warned_about_solomon' }],
      choices: [
        {
          text: 'Why are you telling me this?',
          nextNodeId: 'why_warn',
        },
        {
          text: "I'll be careful.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'why_warn',
      text: "Because I've got a bad feeling. Solomon's been acting strange lately, talking about 'the reckoning' like it's imminent. Something's coming, and I want to be ready. If you find out what it is, let me know.",
      onEnterEffects: [{ type: 'set_flag', target: 'cain_potential_ally' }],
      choices: [
        {
          text: "I'll keep you informed.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'personal_business',
      text: "Personal, huh? Fine. Keep your secrets. But know this - I protect this community. Anyone who threatens it answers to me. We understand each other?",
      choices: [
        {
          text: 'Understood.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'relax_response',
      text: "Easy for you to say. In my experience, 'not here for trouble' usually means trouble's about five minutes behind. But fine. I'll give you a chance. Don't waste it.",
      choices: [
        {
          text: "I won't.",
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'cain_backstory',
      text: "*Slight smile* Former gunfighter, found faith, protecting the innocent now. It's the short version. The long version involves a lot of blood and a grave I should be in. Anything else?",
      choices: [
        {
          text: 'Why this place?',
          nextNodeId: 'why_here',
        },
        {
          text: 'No, that covers it.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'why_here',
      text: "Solomon gave me a second chance when no one else would. That buys a lot of loyalty. Doesn't mean I trust him completely - old habits die hard - but I owe him my life. That counts for something.",
      choices: [
        {
          text: 'Loyalty with doubts.',
          nextNodeId: 'solomon_suspicion',
        },
        {
          text: 'Fair enough.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "*Nods in recognition* You again. Still poking around?",
      choices: [
        {
          text: 'Any news?',
          nextNodeId: 'news_check',
        },
        {
          text: 'Just passing through.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'news_check',
      text: "Solomon's been meeting with strangers. People from outside, people who shouldn't know this place exists. Something's happening. Stay alert.",
      choices: [
        {
          text: 'Thanks for the heads up.',
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const FinalAllyDialogue: DialogueTree = {
  id: 'final_ally_main',
  name: 'Samuel Jr. - Main Conversation',
  description: 'Primary dialogue for the final ally',
  tags: ['salvation', 'freeminer', 'ally'],

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
      text: "*Looks at you with tired eyes* Another seeker. Let me guess - you came here looking for answers about IVRC, and Solomon promised to help. Same story as me.",
      expression: 'weary',
      choices: [
        {
          text: 'Who are you?',
          nextNodeId: 'identity_reveal',
        },
        {
          text: "What do you mean, 'same story'?",
          nextNodeId: 'story_explanation',
        },
      ],
    },
    {
      id: 'identity_reveal',
      text: "Samuel Ironpick. Junior. My grandfather leads the Freeminers in the mountains. Or led them, until IVRC pushed us to the brink. I came here because Solomon claimed to have information that could save my people. Instead, I found more questions.",
      choices: [
        {
          text: 'The Ironpicks. I know that name.',
          nextNodeId: 'name_recognition',
          conditions: [{ type: 'flag_set', target: 'heard_about_freeminers' }],
        },
        {
          text: 'What questions?',
          nextNodeId: 'questions_reveal',
        },
      ],
    },
    {
      id: 'name_recognition',
      text: "*Nods* Then you know our history. We've been fighting IVRC since before I was born. My father died in the struggle, and now my grandfather is too old to fight. It falls to me to finish what they started.",
      choices: [
        {
          text: 'How can I help?',
          nextNodeId: 'help_request',
        },
        {
          text: "What does Solomon have to do with this?",
          nextNodeId: 'solomon_connection',
        },
      ],
    },
    {
      id: 'story_explanation',
      text: "Solomon collects people like us. People who want to bring down IVRC. He promises answers, help, justice. But he holds back as much as he gives. I've been here a week, and I still don't know if he's an ally or just using us for his own ends.",
      choices: [
        {
          text: "What do you think he's hiding?",
          nextNodeId: 'solomon_suspicion_ally',
        },
        {
          text: 'Maybe we can work together.',
          nextNodeId: 'work_together',
        },
      ],
    },
    {
      id: 'solomon_suspicion_ally',
      text: "I think he was part of IVRC. High up, maybe. The way he talks, the things he knows... it's too detailed to be secondhand. He carries guilt like a physical weight. Whatever he did, it haunts him.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_suspects_solomon' }],
      choices: [
        {
          text: 'He was. He confessed it to me.',
          nextNodeId: 'confession_reveal',
          conditions: [{ type: 'flag_set', target: 'knows_solomon_secret' }],
        },
        {
          text: 'Should we confront him?',
          nextNodeId: 'confrontation_discussion',
        },
      ],
    },
    {
      id: 'confession_reveal',
      text: "*Eyes widen* He admitted it? *Clenches fists* All this time... Do you know what that company did to my family? And he was part of it? *Takes a deep breath* But if he wants to destroy them now... maybe we can use him.",
      choices: [
        {
          text: "That's what I was thinking.",
          nextNodeId: 'alliance_formed',
        },
        {
          text: 'Or we could turn him in.',
          nextNodeId: 'turn_in_option',
        },
      ],
    },
    {
      id: 'alliance_formed',
      text: "Then we work together. Solomon knows where the evidence is. We get it, expose IVRC, and bring them down. After that... we decide what to do about Solomon.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_alliance' }],
      choices: [
        {
          text: 'Agreed.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'turn_in_option',
      text: "Turn him in to who? IVRC owns the law. No, we use him. Get what we need, then decide his fate. Revenge can wait until justice is done.",
      choices: [
        {
          text: 'Fair point. Let us work together.',
          nextNodeId: 'alliance_formed',
        },
      ],
    },
    {
      id: 'confrontation_discussion',
      text: "Confront him? Maybe. But he has information we need. If we push too hard, he might clam up. Better to play along for now, gather what we can, then decide what to do.",
      choices: [
        {
          text: 'Sound strategy.',
          nextNodeId: 'work_together',
        },
      ],
    },
    {
      id: 'questions_reveal',
      text: "Like why he knows so much about IVRC's inner workings. Like why he's so interested in finding test subjects from Project Remnant. Like what he's really planning with all this 'reckoning' talk. Something doesn't add up.",
      choices: [
        {
          text: "Maybe we can find answers together.",
          nextNodeId: 'work_together',
        },
      ],
    },
    {
      id: 'solomon_connection',
      text: "He claims to have documents that could destroy IVRC. Evidence of their crimes, including Project Remnant. My grandfather mentioned those experiments - said they were connected to why IVRC targeted us. I need to know the truth.",
      choices: [
        {
          text: 'Let us find it together.',
          nextNodeId: 'work_together',
        },
      ],
    },
    {
      id: 'help_request',
      text: "Help me find the truth about IVRC and about Solomon. If he's genuine, we work with him. If he's using us... we deal with that. Either way, I need allies I can trust. Are you one of them?",
      choices: [
        {
          text: 'You can count on me.',
          nextNodeId: 'alliance_formed',
        },
        {
          text: 'Let me think about it.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'work_together',
      text: "Good. Two heads are better than one, especially in a snake pit like this. Keep your eyes open, report anything suspicious, and don't trust Solomon completely. Not until we know the full truth.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_alliance' }],
      choices: [
        {
          text: 'Agreed.',
          nextNodeId: null,
        },
      ],
    },
    {
      id: 'return_greeting',
      text: "Any news? Have you learned anything new about Solomon or IVRC?",
      choices: [
        {
          text: 'Still investigating.',
          nextNodeId: null,
        },
        {
          text: 'Solomon confessed his past to me.',
          nextNodeId: 'confession_reveal',
          conditions: [{ type: 'flag_set', target: 'knows_solomon_secret' }],
        },
      ],
    },
  ],
};

// ============================================================================
// SHOPS
// ============================================================================

export const SalvationProvisions: ShopDefinition = {
  id: 'salvation_provisions',
  name: 'Salvation Community Store',
  description: 'Simple provisions shared by the community. Fair prices, honest goods.',
  ownerId: 'community_store',
  inventory: [
    // Food - community grown, cheap
    { itemId: 'trail_biscuits', stock: 20, priceModifier: 0.65 },
    { itemId: 'dried_jerky', stock: 15, priceModifier: 0.65 },
    { itemId: 'beans', stock: 15, priceModifier: 0.6 },
    { itemId: 'hot_meal', stock: 10, priceModifier: 0.7 },
    { itemId: 'water_canteen', stock: 10, priceModifier: 0.75 },
    { itemId: 'coffee_beans', stock: 8, priceModifier: 0.7 },

    // Medical - community healer
    { itemId: 'bandages', stock: 15, priceModifier: 0.75 },
    { itemId: 'herbal_remedy', stock: 12, priceModifier: 0.7 },
    { itemId: 'antidote', stock: 5, priceModifier: 0.8 },
    { itemId: 'health_potion', stock: 4, priceModifier: 0.85 },

    // Basic equipment
    { itemId: 'lantern', stock: 4, priceModifier: 0.85 },
    { itemId: 'rope', stock: 5, priceModifier: 0.8 },
    { itemId: 'oil_can', stock: 6, priceModifier: 0.8 },
  ],
  buyModifier: 0.4,
  canSell: true,
  acceptedTypes: ['consumable', 'junk'],
  tags: ['provisions', 'salvation', 'community'],
};

export const SalvationIVRCMegastore: ShopDefinition = {
  id: 'salvation_ivrc_megastore',
  name: 'IVRC Frontier Outpost',
  description:
    'The IVRC has established a presence here. Premium prices for company goods. IVRC script accepted.',
  ownerId: 'ivrc_megastore_clerk',
  inventory: [
    // Food - HEAVILY overpriced (1.5-1.8x)
    { itemId: 'trail_biscuits', stock: 30, priceModifier: 1.6 },
    { itemId: 'dried_jerky', stock: 25, priceModifier: 1.6 },
    { itemId: 'beans', stock: 20, priceModifier: 1.5 },
    { itemId: 'coffee_beans', stock: 15, priceModifier: 1.7 },
    { itemId: 'water_canteen', stock: 15, priceModifier: 1.5 },
    { itemId: 'hot_meal', stock: 10, priceModifier: 1.8 },

    // Medical - OVERPRICED
    { itemId: 'bandages', stock: 25, priceModifier: 1.5 },
    { itemId: 'medical_kit', stock: 8, priceModifier: 1.6 },
    { itemId: 'laudanum', stock: 10, priceModifier: 1.7 },
    { itemId: 'herbal_remedy', stock: 15, priceModifier: 1.5 },

    // Equipment - OVERPRICED
    { itemId: 'lantern', stock: 10, priceModifier: 1.5 },
    { itemId: 'rope', stock: 12, priceModifier: 1.4 },
    { itemId: 'oil_can', stock: 15, priceModifier: 1.4 },

    // Weapons - premium prices
    { itemId: 'revolver', stock: 3, priceModifier: 1.5 },
    { itemId: 'hunting_rifle', stock: 2, priceModifier: 1.5 },
    { itemId: 'shotgun', stock: 2, priceModifier: 1.5 },
    { itemId: 'hunting_knife', stock: 4, priceModifier: 1.4 },

    // Ammo - marked up
    { itemId: 'revolver_ammo', stock: 100, priceModifier: 1.4 },
    { itemId: 'rifle_ammo', stock: 80, priceModifier: 1.4 },
    { itemId: 'shotgun_shells', stock: 60, priceModifier: 1.4 },

    // IVRC exclusive gear
    { itemId: 'ivrc_executive_suit', stock: 1, priceModifier: 1.2, minReputation: 25 },
    { itemId: 'reinforced_leather', stock: 2, priceModifier: 1.5 },

    // Mining supplies
    { itemId: 'pickaxe', stock: 8, priceModifier: 1.4 },
    { itemId: 'dynamite', stock: 15, priceModifier: 1.6 },
  ],
  buyModifier: 0.3, // Pays poorly for goods
  canSell: true,
  acceptedTypes: ['weapon', 'armor', 'consumable', 'junk'],
  tags: ['ivrc', 'salvation', 'megastore', 'overpriced'],
};

export const SalvationBlackMarket: ShopDefinition = {
  id: 'salvation_black_market',
  name: 'The Underground',
  description:
    'Hidden resistance supplies. Weapons, intel, and hope for those fighting IVRC. Find it in the church basement.',
  ownerId: 'resistance_supplier',
  inventory: [
    // Weapons - resistance arsenal
    { itemId: 'revolver', stock: 3, priceModifier: 0.8, hidden: true },
    { itemId: 'navy_revolver', stock: 2, priceModifier: 0.8, hidden: true },
    { itemId: 'schofield', stock: 1, priceModifier: 0.85, hidden: true },
    { itemId: 'repeater', stock: 2, priceModifier: 0.85, hidden: true },
    { itemId: 'hunting_rifle', stock: 2, priceModifier: 0.8, hidden: true },
    { itemId: 'shotgun', stock: 2, priceModifier: 0.8, hidden: true },
    { itemId: 'shotgun_coach', stock: 1, priceModifier: 0.85, hidden: true },
    { itemId: 'bowie_knife', stock: 4, priceModifier: 0.75, hidden: true },

    // Explosives for sabotage
    { itemId: 'dynamite', stock: 30, priceModifier: 0.7, hidden: true },

    // Ammo - heavily discounted for the cause
    { itemId: 'revolver_ammo', stock: 150, priceModifier: 0.6, hidden: true },
    { itemId: 'rifle_ammo', stock: 120, priceModifier: 0.6, hidden: true },
    { itemId: 'shotgun_shells', stock: 80, priceModifier: 0.6, hidden: true },

    // Medical supplies for wounded
    { itemId: 'bandages', stock: 30, priceModifier: 0.7, hidden: true },
    { itemId: 'medical_kit', stock: 10, priceModifier: 0.8, hidden: true },
    { itemId: 'health_potion', stock: 8, priceModifier: 0.85, hidden: true },
    { itemId: 'health_potion_greater', stock: 4, priceModifier: 0.9, hidden: true },
    { itemId: 'stimulant', stock: 10, priceModifier: 0.85, hidden: true },

    // Special resistance gear - requires high reputation
    { itemId: 'freeminers_harness', stock: 2, priceModifier: 0.8, minReputation: 20, hidden: true },
    { itemId: 'preachers_vestments', stock: 1, priceModifier: 0.9, minReputation: 25, hidden: true },

    // Unique weapons for trusted allies
    { itemId: 'thornes_judgment', stock: 1, priceModifier: 1.0, minReputation: 35, hidden: true },
    { itemId: 'ironpicks_legacy', stock: 1, priceModifier: 1.0, minReputation: 40, hidden: true },

    // Stolen IVRC intel
    { itemId: 'ivrc_pass', stock: 2, priceModifier: 1.5, minReputation: 15, hidden: true },
  ],
  buyModifier: 0.6, // Pays well for IVRC loot
  canSell: true,
  acceptedTypes: ['weapon', 'armor', 'consumable', 'junk', 'key_item'],
  tags: ['black_market', 'salvation', 'resistance', 'hidden'],
};

// ============================================================================
// QUESTS
// ============================================================================

export const ReckoningQuest: Quest = {
  id: 'reckoning',
  title: 'Reckoning',
  description:
    "The final confrontation with IVRC approaches. Break into their vault, retrieve the evidence, and bring down the company once and for all.",
  type: 'main',
  giverNpcId: 'preacher_solomon',
  startLocationId: 'salvation',
  recommendedLevel: 5,
  tags: ['main', 'finale', 'heist'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['wanderers_tale'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_plan',
      title: 'Plan the Heist',
      description: 'Gather information about the IVRC vault and plan your approach.',
      onStartText:
        "Solomon's plan requires breaking into IVRC's vault in Iron Gulch. Gather allies and intelligence before attempting the infiltration.",
      onCompleteText:
        "You've gathered enough information. The vault is in the basement of IVRC headquarters. Time to move.",
      objectives: [
        {
          id: 'obj_gather_intel',
          description: 'Gather intelligence about the vault',
          type: 'talk',
          target: 'engineer_clara',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_ally_samuel',
          description: 'Secure Samuel Ironpick Jr. as an ally',
          type: 'talk',
          target: 'final_ally',
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
      id: 'stage_infiltrate',
      title: 'Infiltrate the Vault',
      description: 'Break into IVRC headquarters and access the vault.',
      onStartText:
        "The vault is heavily guarded. Use stealth, bribery, or force - whatever it takes.",
      onCompleteText:
        "You're inside the vault. The evidence is here, along with something unexpected...",
      objectives: [
        {
          id: 'obj_enter_hq',
          description: 'Enter IVRC Headquarters',
          type: 'visit',
          target: 'ivrc_headquarters',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_reach_vault',
          description: 'Reach the vault',
          type: 'visit',
          target: 'ivrc_vault',
          count: 1,
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
      id: 'stage_retrieve',
      title: 'Retrieve the Evidence',
      description: 'Find the documents that will expose IVRC.',
      onStartText:
        "Search the vault for Project Remnant documents and evidence of IVRC's crimes.",
      onCompleteText:
        "You have the evidence. But there's more here than expected - records showing Solomon's true role in Project Remnant.",
      objectives: [
        {
          id: 'obj_find_documents',
          description: 'Find the Project Remnant documents',
          type: 'collect',
          target: 'project_remnant_evidence',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_find_solomon_file',
          description: 'Find Solomon\'s personnel file',
          type: 'collect',
          target: 'solomon_personnel_file',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 75,
        gold: 100,
        items: [],
        reputation: {},
      },
    },
    {
      id: 'stage_choice',
      title: 'The Final Choice',
      description: 'Decide what to do with the evidence - and with Solomon.',
      onStartText:
        "You have the evidence to destroy IVRC. You also know the full truth about Solomon. What will you do?",
      onCompleteText:
        "You've made your choice. The consequences will shape the future of the territory.",
      objectives: [
        {
          id: 'obj_confront_solomon',
          description: 'Confront Solomon with the evidence',
          type: 'talk',
          target: 'preacher_solomon',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 100,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 500,
    gold: 500,
    items: [],
    reputation: { freeminers: 100, ivrc: -100 },
    unlocksQuests: [],
  },
};

export const RedemptionQuest: Quest = {
  id: 'redemption',
  title: 'Redemption',
  description:
    "Based on your choices throughout the game, seek redemption for yourself and those you've helped - or harmed.",
  type: 'main',
  giverNpcId: 'preacher_solomon',
  startLocationId: 'salvation',
  recommendedLevel: 5,
  tags: ['main', 'epilogue', 'choices'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['reckoning'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    {
      id: 'stage_reflection',
      title: 'Reflection',
      description: 'Consider the choices you have made and their consequences.',
      onStartText:
        "The evidence is out. IVRC is falling. But what about those affected by your journey?",
      onCompleteText:
        "You've reflected on your actions. Now it's time for the final accounting.",
      objectives: [
        {
          id: 'obj_visit_affected',
          description: 'Visit those affected by your choices',
          type: 'talk',
          target: 'various',
          count: 3,
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
      id: 'stage_final',
      title: 'The New Dawn',
      description: 'See the results of your actions and choose your future.',
      onStartText:
        "The territory is changing. What role will you play in the new order?",
      onCompleteText:
        "Your story concludes - but the frontier continues. Whatever comes next, you've left your mark.",
      objectives: [
        {
          id: 'obj_final_choice',
          description: 'Make your final choice',
          type: 'talk',
          target: 'preacher_solomon',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 100,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 250,
    gold: 250,
    items: [],
    reputation: {},
    unlocksQuests: [],
  },
};

// ============================================================================
// TOWN DEFINITION
// ============================================================================

export const SalvationTown: Town = {
  id: 'salvation',
  name: 'Salvation',
  description:
    "A remote religious settlement in the badlands, founded by the enigmatic Preacher Solomon. The community lives simply, prays together, and prepares for a 'day of reckoning.' Something about this place feels both sacred and sinister.",
  theme: 'religious',
  position: { x: 150, z: -100 },
  size: 'small',

  npcs: ['preacher_solomon', 'sister_hope', 'brother_cain', 'final_ally'],

  shops: [
    {
      id: 'salvation_provisions',
      name: 'Community Store',
      type: 'general_store',
      operatorNpcId: 'community_store',
      shopInventoryId: 'salvation_provisions',
      hours: { open: 6, close: 20 },
      priceModifier: 0.8,
      description: 'Simple provisions shared by the community.',
    },
  ],

  quests: ['reckoning', 'redemption'],

  buildings: [
    {
      id: 'church',
      type: 'church',
      name: 'Chapel of Salvation',
      enterable: true,
      residentNpcIds: ['preacher_solomon', 'sister_hope'],
      tags: ['religious', 'main'],
    },
    {
      id: 'graveyard',
      type: 'church',
      name: 'Salvation Cemetery',
      enterable: false,
      residentNpcIds: [],
      tags: ['graveyard', 'atmospheric'],
    },
    {
      id: 'community_hall',
      type: 'town_hall',
      name: 'Community Hall',
      enterable: true,
      residentNpcIds: ['brother_cain'],
      tags: ['community', 'meeting'],
    },
    {
      id: 'guest_quarters',
      type: 'hotel',
      name: 'Guest Quarters',
      enterable: true,
      residentNpcIds: ['final_ally'],
      tags: ['lodging', 'rest'],
    },
    {
      id: 'dungeon_entrance',
      type: 'cabin',
      name: 'Old Cellar',
      enterable: true,
      residentNpcIds: [],
      tags: ['dungeon', 'hidden', 'final'],
    },
  ],

  unlockCondition: {
    type: 'quest_complete',
    target: 'wanderers_tale',
  },

  startDiscovered: false,
  dangerLevel: 4,
  economyLevel: 2,
  lawLevel: 'orderly',

  lore: "Salvation was founded by Preacher Solomon as a refuge for those fleeing IVRC's reach. The community lives by strict rules and simple faith. But whispers suggest that Solomon's true purpose is something darker - or perhaps, something that could bring real justice to the territory.",

  mapIcon: 'special',

  entryPoints: [
    { id: 'badlands_path', direction: 'north', routeId: 'badlands_path' },
  ],

  tags: ['religious', 'endgame', 'finale', 'act_3'],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const SALVATION_NPCS: NPCDefinition[] = [
  PreacherSolomon,
  SisterHope,
  BrotherCain,
  FinalAlly,
];

export const SALVATION_DIALOGUES: DialogueTree[] = [
  PreacherSolomonDialogue,
  SisterHopeDialogue,
  BrotherCainDialogue,
  FinalAllyDialogue,
];

export const SALVATION_SHOPS: ShopDefinition[] = [
  SalvationProvisions,
  SalvationIVRCMegastore,
  SalvationBlackMarket,
];

export const SALVATION_QUESTS: Quest[] = [
  ReckoningQuest,
  RedemptionQuest,
];
