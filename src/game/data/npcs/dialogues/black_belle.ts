/**
 * Black Belle (Isabelle Crow) - Dialogue Trees
 *
 * A legendary bounty hunter dressed in black. Former Pinkerton
 * agent who left when she discovered corruption. Now works for
 * whoever pays, but has her own code of honor.
 */

import type { DialogueTree } from '../../schemas/npc';

export const BlackBelleMainDialogue: DialogueTree = {
  id: 'black_belle_main',
  name: 'Black Belle - Main Conversation',
  description: 'Primary dialogue tree for Black Belle (Isabelle Crow)',
  tags: ['mesa_point', 'bounty_hunter', 'for_hire', 'dangerous'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'hired_greeting',
      conditions: [{ type: 'flag_set', target: 'hired_belle' }],
      priority: 8,
    },
    {
      nodeId: 'high_rep_greeting',
      conditions: [{ type: 'reputation_gte', value: 50 }],
      priority: 5,
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
      text: "*A woman in black regards you with cold, calculating eyes. Her hands rest casually near the matched revolvers at her hips* You're either very brave or very stupid, approaching me like that. Most folk cross the street when they see me coming. State your business.",
      expression: 'cold',
      choices: [
        {
          text: "I've heard of you. Black Belle, right?",
          nextNodeId: 'knows_reputation',
        },
        {
          text: 'Sorry, I meant no offense. Just looking to talk.',
          nextNodeId: 'apologetic',
        },
        {
          text: "I'm not afraid of you.",
          nextNodeId: 'not_afraid',
        },
      ],
    },

    {
      id: 'knows_reputation',
      text: "*She tilts her head slightly, a ghost of amusement crossing her features* The name's Isabelle Crow. 'Black Belle' is what they call me when they think I'm not listening. You want an autograph, or do you have actual business?",
      choices: [
        {
          text: "I might have work for you.",
          nextNodeId: 'have_work',
        },
        {
          text: 'I wanted to ask about your bounty hunting.',
          nextNodeId: 'about_bounties',
        },
        {
          text: "Just curious about the famous bounty hunter.",
          nextNodeId: 'just_curious',
        },
      ],
    },

    {
      id: 'apologetic',
      text: "*Her posture relaxes marginally* Apology accepted. Caution's just good sense out here. Now, talk about what exactly? I'm not much for idle conversation.",
      choices: [
        {
          text: "I'm looking for work. Heard you might know something.",
          nextNodeId: 'looking_for_work',
        },
        {
          text: 'I need information about someone.',
          nextNodeId: 'need_info',
        },
        {
          text: "Maybe I could hire you for something.",
          nextNodeId: 'have_work',
        },
      ],
    },

    {
      id: 'not_afraid',
      text: "*Her lips curve into something that might be a smile* Then you're stupid. But I respect stupid bravery - it's gotten me through tight spots before. *She crosses her arms* What do you want?",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: "I want to hire you.",
          nextNodeId: 'have_work',
        },
        {
          text: 'Information. About the territory.',
          nextNodeId: 'territory_info',
        },
        {
          text: 'Just to talk. Learn from the best.',
          nextNodeId: 'learn_from_best',
        },
      ],
    },

    {
      id: 'have_work',
      text: "*She uncrosses her arms, interest flickering in her dark eyes* I'm listening. But know this - I don't take every job that comes my way. I have rules. No women, no children, and nobody who don't deserve what's coming to them. What's the job?",
      choices: [
        {
          text: 'I need protection for a dangerous journey.',
          nextNodeId: 'protection_job',
        },
        {
          text: "There's someone threatening innocent people.",
          nextNodeId: 'threat_job',
        },
        {
          text: "I need you to find someone for me.",
          nextNodeId: 'find_someone',
        },
        {
          text: "Actually, let me think about it first.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'protection_job',
      text: "*She considers* Protection work. Not my usual line, but the pay's steady and it keeps my skills sharp. Where you headed, and who's likely to try stopping you?",
      choices: [
        {
          text: "To the Iron Mountains. IVRC won't be happy.",
          nextNodeId: 'mountains_job',
        },
        {
          text: 'Through Copperhead territory.',
          nextNodeId: 'copperhead_territory',
        },
        {
          text: "I'd rather not say yet.",
          nextNodeId: 'secretive_client',
        },
      ],
    },

    {
      id: 'mountains_job',
      text: "*She nods slowly* IVRC, huh? They've got Pinkertons and hired guns, but nothing I can't handle. It'll cost you though - fifty gold a day, plus expenses. And if it gets hot, combat pay kicks in. You good with that?",
      choices: [
        {
          text: "[Pay 100 gold] Here's advance for two days.",
          nextNodeId: 'accept_mountain_job',
          effects: [{ type: 'take_gold', value: 100 }],
          conditions: [{ type: 'gold_gte', value: 100 }],
        },
        {
          text: "That's steep. Can we negotiate?",
          nextNodeId: 'negotiate_price',
        },
        {
          text: "Let me get the funds first.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'accept_mountain_job',
      text: "*She pockets the gold with a satisfied nod* Smart. I'll meet you at the north trail head at dawn. Pack light, bring water, and whatever weapons you're comfortable with. And don't be late - I don't wait for anybody.",
      onEnterEffects: [
        { type: 'set_flag', target: 'hired_belle' },
        { type: 'start_quest', target: 'hired_gun' },
      ],
      choices: [
        {
          text: "I'll be there.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'negotiate_price',
      text: "*She shakes her head firmly* My rates are my rates. I'm the best at what I do, and that costs money. You want cheap protection, hire some drunk with a pistol. You want to survive? You pay my price.",
      choices: [
        {
          text: "Fair enough. I'll get the money.",
          nextNodeId: null,
        },
        {
          text: "Maybe there's another way to pay...",
          nextNodeId: 'another_payment',
        },
      ],
    },

    {
      id: 'another_payment',
      text: "*She raises an eyebrow* I'm listening. If you've got information worth more than gold, or a favor I might need down the line, we could arrange something. What did you have in mind?",
      choices: [
        {
          text: 'I have information about IVRC movements.',
          nextNodeId: 'ivrc_payment',
          conditions: [{ type: 'flag_set', target: 'knows_ivrc_info' }],
        },
        {
          text: 'I could help you with a job of yours.',
          nextNodeId: 'help_her_job',
        },
        {
          text: "Actually, forget it. I'll pay in gold.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ivrc_payment',
      text: "*Her interest sharpens noticeably* IVRC information? Now that's valuable. I've got... personal reasons to want their operations disrupted. Tell me what you know, and we'll call it half payment. The other half in gold.",
      choices: [
        {
          text: '[Share IVRC information] Tell her about the shipment schedules.',
          nextNodeId: 'share_ivrc_info',
          effects: [{ type: 'clear_flag', target: 'knows_ivrc_info' }],
        },
        {
          text: "Let me think about whether to share that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'share_ivrc_info',
      text: "*She memorizes every detail, eyes gleaming* This is good. Very good. Alright, we have a deal. Half the rate, and this information. *She extends her hand* Don't make me regret trusting you.",
      onEnterEffects: [
        { type: 'change_reputation', value: 15 },
        { type: 'set_flag', target: 'belle_deal_made' },
      ],
      choices: [
        {
          text: "*Shake her hand* You can trust me.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'help_her_job',
      text: "*She considers this* There is something, actually. I've got a bounty that's proving... troublesome. Thomas Burke, the mine foreman. Fifty dollar bounty for questioning. He's got too many guards for me to grab alone. You help me take him, we call it even.",
      choices: [
        {
          text: "I'll help you catch Burke.",
          nextNodeId: 'burke_bounty',
          effects: [{ type: 'start_quest', target: 'belles_bounty' }],
        },
        {
          text: "Burke's dangerous. Tell me more first.",
          nextNodeId: 'burke_details',
        },
        {
          text: "That's too risky. I'll find another way.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'burke_bounty',
      text: "*She nods approvingly* Good. Burke's wanted for questioning about some missing workers. IVRC claims they ran off, but their families say otherwise. Meet me outside the mine at midnight. We'll grab him when he leaves for his nightly... entertainment.",
      onEnterEffects: [{ type: 'set_flag', target: 'helping_belle_burke' }],
      choices: [
        {
          text: "I'll be there.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'burke_details',
      text: "Burke runs the IVRC mine with an iron fist. He's got six guards, rotates them in shifts. But every night around midnight, he sneaks out to visit a certain widow in town. That's our window. Two guards walk him there. We take them down quiet, grab Burke, question him about the missing miners.",
      choices: [
        {
          text: 'And the bounty?',
          nextNodeId: 'bounty_details',
        },
        {
          text: "What makes you think he knows about missing miners?",
          nextNodeId: 'burke_suspicion',
        },
      ],
    },

    {
      id: 'bounty_details',
      text: "The families pooled their money. Fifty gold, split between us if we get answers. Not much, but it's not about the money for me. *Her jaw tightens* I've seen what IVRC does to workers who 'disappear.' Someone needs to answer for it.",
      choices: [
        {
          text: "Count me in.",
          nextNodeId: 'burke_bounty',
          effects: [{ type: 'start_quest', target: 'belles_bounty' }],
        },
        {
          text: "Sounds like you have a personal stake.",
          nextNodeId: 'personal_stake',
        },
      ],
    },

    {
      id: 'personal_stake',
      text: "*Her eyes go cold* I was a Pinkerton once. Back then, we were supposed to protect people. Then I found out who we were really protecting - the corporations. Men like Thorne. When I tried to report what I'd seen... *She trails off* Let's just say I learned who the real criminals are.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_belle_backstory' }],
      choices: [
        {
          text: "That's why you left the Pinkertons.",
          nextNodeId: 'why_left',
        },
        {
          text: "So you have a grudge against IVRC.",
          nextNodeId: 'grudge_ivrc',
        },
      ],
    },

    {
      id: 'why_left',
      text: "Left? *She laughs bitterly* I ran. They killed my partner when he tried to help me expose what we'd found. I barely made it out alive. Now I work for myself, by my own rules. And when I get a chance to hurt IVRC... I take it.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: "I'm sorry about your partner.",
          nextNodeId: 'sorry_partner',
        },
        {
          text: 'Then we should work together.',
          nextNodeId: 'work_together',
        },
      ],
    },

    {
      id: 'sorry_partner',
      text: "*She's quiet for a moment* His name was James. Good man. Believed in justice, real justice. *She straightens* But dwelling on the dead don't help nobody. Best thing I can do is keep fighting. You want to help with that?",
      choices: [
        {
          text: 'Yes. Let me help with the Burke job.',
          nextNodeId: 'burke_bounty',
          effects: [{ type: 'start_quest', target: 'belles_bounty' }],
        },
        {
          text: 'I need time to think.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'work_together',
      text: "*She studies you appraisingly* Maybe. You seem genuine enough. Help me with Burke, and we'll see where things go from there. I don't trust easy, but I reward those who prove themselves.",
      choices: [
        {
          text: "I'll prove myself. Count me in.",
          nextNodeId: 'burke_bounty',
          effects: [{ type: 'start_quest', target: 'belles_bounty' }],
        },
        {
          text: "Fair enough. Let me prepare first.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'grudge_ivrc',
      text: "Call it what you want. I call it justice. IVRC's got blood on their hands - worker blood, settler blood, anyone who gets in their way. Someone needs to hold them accountable. The law won't do it. So I will.",
      choices: [
        {
          text: 'A noble cause.',
          nextNodeId: 'noble_cause',
        },
        {
          text: "Revenge and justice aren't the same thing.",
          nextNodeId: 'revenge_justice',
        },
      ],
    },

    {
      id: 'noble_cause',
      text: "*She shrugs* Noble or not, it's what I do. Every bounty I collect on an IVRC man, every job I take that hurts their operations - that's a small victory. Enough small victories add up to something bigger.",
      choices: [
        {
          text: "I'd like to help.",
          nextNodeId: 'work_together',
        },
        {
          text: 'I understand. Good luck.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'revenge_justice',
      text: "*Her eyes flash dangerously* Don't lecture me. You haven't seen what I've seen. When a corporation can murder with impunity because they own the law... revenge is the only justice left. *She takes a breath* But you're right about one thing. I need to be careful it doesn't consume me.",
      choices: [
        {
          text: 'As long as you recognize that.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'burke_suspicion',
      text: "Because I've been watching him. Men go down into that mine and don't come back. Burke signs off on 'accidents' without investigation. And last month, I saw him talking to Victoria Ashworth - Thorne's enforcer. Men who talk to Ashworth tend to have secrets worth killing for.",
      onEnterEffects: [{ type: 'set_flag', target: 'burke_ashworth_connection' }],
      choices: [
        {
          text: "That's compelling evidence.",
          nextNodeId: 'bounty_details',
        },
        {
          text: 'Who is Victoria Ashworth?',
          nextNodeId: 'ashworth_info',
        },
      ],
    },

    {
      id: 'ashworth_info',
      text: "Thorne's right hand. Beautiful, deadly, utterly without conscience. She 'handles' problems for IVRC - and I don't mean paperwork. If she's involved with Burke, whatever's happening to those miners is deliberate, not accident.",
      onEnterEffects: [{ type: 'set_flag', target: 'warned_about_ashworth' }],
      choices: [
        {
          text: "Then we need to stop them.",
          nextNodeId: 'burke_bounty',
          effects: [{ type: 'start_quest', target: 'belles_bounty' }],
        },
        {
          text: "She sounds dangerous to cross.",
          nextNodeId: 'ashworth_dangerous',
        },
      ],
    },

    {
      id: 'ashworth_dangerous',
      text: "She is. I've been avoiding her for two years now. But sooner or later, our paths will cross. *She touches the handle of her revolver* When they do, only one of us will walk away. I intend for it to be me.",
      choices: [
        {
          text: "I hope you're right.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'copperhead_territory',
      text: "*She tilts her head* The Copperheads, hmm? They know better than to shoot at me - professional courtesy among those who live by the gun. But if you're carrying something they want, that might not hold. What's the cargo?",
      choices: [
        {
          text: 'Just myself and some supplies.',
          nextNodeId: 'simple_cargo',
        },
        {
          text: "Something IVRC would prefer stayed hidden.",
          nextNodeId: 'secret_cargo',
        },
        {
          text: "I'd rather not say.",
          nextNodeId: 'secretive_client',
        },
      ],
    },

    {
      id: 'simple_cargo',
      text: "Then it shouldn't be too bad. Thirty gold a day for Copperhead territory. I know their patrol patterns, and Diamondback and I have an... understanding. She won't hit anything I'm protecting, long as I don't bring trouble to her door.",
      choices: [
        {
          text: 'You know Diamondback?',
          nextNodeId: 'know_diamondback',
        },
        {
          text: "[Pay 60 gold] Here's for two days.",
          nextNodeId: 'accept_copperhead_job',
          effects: [{ type: 'take_gold', value: 60 }],
          conditions: [{ type: 'gold_gte', value: 60 }],
        },
      ],
    },

    {
      id: 'know_diamondback',
      text: "We've crossed paths. She knows I won't take bounties on her people - not because I agree with her methods, but because the bounties come from IVRC, and I don't do their dirty work. In return, her gang leaves me alone. It's a practical arrangement.",
      choices: [
        {
          text: 'Interesting relationship.',
          nextNodeId: 'interesting_relationship',
        },
        {
          text: 'Could you introduce me to her?',
          nextNodeId: 'introduce_diamondback',
        },
      ],
    },

    {
      id: 'interesting_relationship',
      text: "Professional respect. We're both women surviving in a world that don't make it easy. Different methods, but we understand each other. *She shrugs* Doesn't mean I trust her, but I don't have to shoot her either.",
      choices: [
        {
          text: "Makes sense. About that job...",
          nextNodeId: 'simple_cargo',
        },
      ],
    },

    {
      id: 'introduce_diamondback',
      text: "*She laughs sharply* Introduce you to the most wanted outlaw in the territory? That's not how it works. If Diamondback wants to meet you, she'll find you. If she doesn't, no amount of looking will turn her up. But I could pass along a message, for the right price.",
      choices: [
        {
          text: '[Pay 20 gold] Tell her I want to talk.',
          nextNodeId: 'message_diamondback',
          effects: [{ type: 'take_gold', value: 20 }],
          conditions: [{ type: 'gold_gte', value: 20 }],
        },
        {
          text: "Maybe later. Let's focus on the job.",
          nextNodeId: 'simple_cargo',
        },
      ],
    },

    {
      id: 'message_diamondback',
      text: "*She pockets the gold* I'll see that she gets word. No guarantee she'll respond, but she'll know you're looking. *She gives you a measured look* If you betray her to IVRC after this, I'll know. And I'll find you.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_contacted_diamondback' }],
      choices: [
        {
          text: "I'm not working for IVRC.",
          nextNodeId: 'not_ivrc',
        },
        {
          text: "Understood. I'll await her response.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'not_ivrc',
      text: "*She nods slowly* Good. Because anyone who helps those bastards is my enemy. And you don't want me as an enemy. *Her hand rests on her gun* We clear?",
      choices: [
        {
          text: 'Crystal clear.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'secret_cargo',
      text: "*Her eyes sharpen with interest* Now that's more intriguing. If IVRC wants it hidden, it might be worth letting them come for it. *She considers* Double my rate - a hundred gold a day - but I guarantee they won't touch it. Or you.",
      choices: [
        {
          text: "That's a lot of money.",
          nextNodeId: 'lot_of_money',
        },
        {
          text: "Done. When can we leave?",
          nextNodeId: 'accept_secret_job',
          conditions: [{ type: 'gold_gte', value: 200 }],
        },
      ],
    },

    {
      id: 'lot_of_money',
      text: "It's a lot of risk. IVRC doesn't mess around when they want something. Pinkertons, hired guns, maybe even military connections. You're asking me to make powerful enemies. That costs.",
      choices: [
        {
          text: "Let me see if I can find other help.",
          nextNodeId: null,
        },
        {
          text: "You're right. Here's the payment.",
          nextNodeId: 'accept_secret_job',
          conditions: [{ type: 'gold_gte', value: 200 }],
          effects: [{ type: 'take_gold', value: 200 }],
        },
      ],
    },

    {
      id: 'accept_secret_job',
      text: "*She counts the gold carefully, then nods* Alright, we have a deal. I'll meet you at whatever departure point you choose. And I'll bring extra ammunition - something tells me we're going to need it.",
      onEnterEffects: [
        { type: 'set_flag', target: 'hired_belle_secret' },
        { type: 'start_quest', target: 'hired_gun' },
      ],
      choices: [
        {
          text: "Thank you, Belle. This means a lot.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'accept_copperhead_job',
      text: "*She tucks away the payment* Smart investment. Meet me at the southern trail at first light. Travel light, stay quiet, and follow my lead. The Copperheads won't be a problem if we move smart.",
      onEnterEffects: [
        { type: 'set_flag', target: 'hired_belle' },
        { type: 'start_quest', target: 'hired_gun' },
      ],
      choices: [
        {
          text: "I'll be ready.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'secretive_client',
      text: "*She holds up a hand* If you want my help, I need to know what I'm protecting. I don't walk into situations blind. Too many ways for that to go wrong. Tell me, or find someone else.",
      choices: [
        {
          text: "Fine. It's documents that could hurt IVRC.",
          nextNodeId: 'documents_reveal',
        },
        {
          text: "I understand. Let me think about it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'documents_reveal',
      text: "*Her eyes light up* Now we're talking. Documents that could hurt IVRC are exactly the kind of cargo I love protecting. *She leans in* Tell me more, and I might even give you a discount.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: 'Evidence of their crimes against workers.',
          nextNodeId: 'worker_evidence',
        },
        {
          text: 'Something about a project called Remnant.',
          nextNodeId: 'remnant_documents',
        },
      ],
    },

    {
      id: 'worker_evidence',
      text: "*She nods grimly* Safety violations, cover-ups, the usual IVRC filth. That's worth protecting. Half my usual rate - consider it a personal investment in justice. Those documents get out, it could change everything.",
      choices: [
        {
          text: '[Pay 50 gold] Deal.',
          nextNodeId: 'accept_mountain_job',
          effects: [{ type: 'take_gold', value: 50 }],
          conditions: [{ type: 'gold_gte', value: 50 }],
        },
      ],
    },

    {
      id: 'remnant_documents',
      text: "*Her expression becomes unreadable* Project Remnant? *She's quiet for a long moment* I've heard whispers about that. Nothing concrete, but enough to know it's big. Very big. If you have documents related to Remnant... I'll do this job for free.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_knows_remnant' }],
      choices: [
        {
          text: 'Why for free?',
          nextNodeId: 'why_free',
        },
        {
          text: "Then we have a deal.",
          nextNodeId: 'remnant_deal',
        },
      ],
    },

    {
      id: 'why_free',
      text: "Because whatever Remnant is, IVRC has killed to keep it secret. My partner... he was getting close to something before they killed him. Something in the mountains. If those documents can expose what happened... *Her voice catches* I need to know.",
      choices: [
        {
          text: "I'll share what I find. Partners?",
          nextNodeId: 'remnant_deal',
        },
        {
          text: "I understand. Let's do this.",
          nextNodeId: 'remnant_deal',
        },
      ],
    },

    {
      id: 'remnant_deal',
      text: "*She extends her hand, her grip firm* Partners. You get those documents out, and I'll make sure nothing stops us. Not Pinkertons, not IVRC enforcers, not even Thorne himself. This is personal now.",
      onEnterEffects: [
        { type: 'set_flag', target: 'belle_ally' },
        { type: 'set_flag', target: 'hired_belle' },
        { type: 'start_quest', target: 'hired_gun' },
        { type: 'change_reputation', value: 25 },
      ],
      choices: [
        {
          text: 'Partners.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'threat_job',
      text: "*Her posture shifts to attention* Innocent people being threatened falls within my rules. Who's the threat, and what have they done?",
      choices: [
        {
          text: 'IVRC enforcers harassing a family.',
          nextNodeId: 'ivrc_threat',
        },
        {
          text: 'Bandits demanding protection money.',
          nextNodeId: 'bandit_threat',
        },
        {
          text: 'Someone I need dealt with quietly.',
          nextNodeId: 'quiet_deal',
        },
      ],
    },

    {
      id: 'ivrc_threat',
      text: "*Her jaw tightens* IVRC harassment. My specialty. Tell me about the family - where they are, how many enforcers, what IVRC wants from them. I'll make the problem go away.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_ivrc_job' }],
      choices: [
        {
          text: '[Describe the situation]',
          nextNodeId: 'ivrc_job_accept',
        },
        {
          text: "Let me get more details first.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ivrc_job_accept',
      text: "*She listens carefully, memorizing every detail* I know the type. Probably trying to pressure them into selling their land. I'll pay them a visit, make it clear they should find easier targets. No killing unless they force the issue.",
      choices: [
        {
          text: 'What will it cost?',
          nextNodeId: 'ivrc_job_cost',
        },
      ],
    },

    {
      id: 'ivrc_job_cost',
      text: "For IVRC enforcers? Twenty gold covers my time and ammunition. But if this leads to bigger fish - supervisors, executives - the price goes up. And so does the danger.",
      choices: [
        {
          text: '[Pay 20 gold] Handle it.',
          nextNodeId: 'ivrc_job_paid',
          effects: [{ type: 'take_gold', value: 20 }],
          conditions: [{ type: 'gold_gte', value: 20 }],
        },
        {
          text: "I'll get the money.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ivrc_job_paid',
      text: "*She pockets the gold* Consider it done. Give me two days to work. The enforcers will either leave that family alone, or they'll be leaving in pine boxes. Their choice.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_handling_enforcers' }],
      choices: [
        {
          text: 'Thank you, Belle.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'bandit_threat',
      text: "Bandits are simple. Point me at them, I'll make them regret their life choices. How many are we talking, and where do they operate?",
      choices: [
        {
          text: '[Describe the bandits]',
          nextNodeId: 'bandit_job_details',
        },
        {
          text: "Let me gather more information first.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'bandit_job_details',
      text: "*She nods as you describe them* Sounds like a small-time outfit. Probably desperate folk turned to crime. I'll give them one chance to scatter. If they don't take it... *She pats her revolvers* Thirty gold for a gang that size.",
      choices: [
        {
          text: '[Pay 30 gold] Clear them out.',
          nextNodeId: 'bandit_job_paid',
          effects: [{ type: 'take_gold', value: 30 }],
          conditions: [{ type: 'gold_gte', value: 30 }],
        },
        {
          text: 'Can you do it without killing?',
          nextNodeId: 'no_kill_bandits',
        },
      ],
    },

    {
      id: 'no_kill_bandits',
      text: "*She considers* I can try. Sometimes a show of force is enough - a bullet through a hat, a gun to a leader's head. But if they shoot first, I shoot back. That's not negotiable.",
      choices: [
        {
          text: "That's fair. [Pay 30 gold]",
          nextNodeId: 'bandit_job_paid',
          effects: [{ type: 'take_gold', value: 30 }],
          conditions: [{ type: 'gold_gte', value: 30 }],
        },
        {
          text: "Let me think about it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'bandit_job_paid',
      text: "*She takes the payment* I'll ride out tonight. By this time tomorrow, your bandit problem will be solved, one way or another. Check back with me in two days for the report.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_handling_bandits' }],
      choices: [
        {
          text: "Appreciate it. Good hunting.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'quiet_deal',
      text: "*Her eyes narrow* 'Dealt with quietly' sounds like murder. I don't do assassinations. If someone needs killing, it's because they drew on me first or because they've got a legitimate bounty on their head. Which is this?",
      choices: [
        {
          text: "You're right, I shouldn't have asked that way.",
          nextNodeId: 'apologize_quiet',
        },
        {
          text: 'There might be a bounty...',
          nextNodeId: 'check_bounty',
        },
      ],
    },

    {
      id: 'apologize_quiet',
      text: "*She relaxes slightly* Good. I've got a reputation to maintain, and it doesn't include back-alley murder. If you've got a legitimate problem, describe it properly and I'll see if I can help.",
      choices: [
        {
          text: "[Describe a real threat]",
          nextNodeId: 'threat_job',
        },
        {
          text: "Never mind. Forget I asked.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'check_bounty',
      text: "If there's a proper bounty - posted by law or by someone with legitimate grievance - that's different. Who's the target, and what are they wanted for?",
      choices: [
        {
          text: '[Provide bounty details]',
          nextNodeId: 'bounty_evaluation',
        },
        {
          text: "Actually, there's no official bounty.",
          nextNodeId: 'apologize_quiet',
        },
      ],
    },

    {
      id: 'bounty_evaluation',
      text: "*She considers the information* I'll look into it. If the bounty's legitimate and the target deserves what's coming, I'll take the job. If not, I walk away. Come back tomorrow and I'll let you know.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_evaluating_bounty' }],
      choices: [
        {
          text: "Fair enough. I'll return tomorrow.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'find_someone',
      text: "Finding people is what I do best. Some folks don't want to be found. Others don't know they're being looked for. Which kind is your target?",
      choices: [
        {
          text: 'Someone who went missing.',
          nextNodeId: 'missing_person',
        },
        {
          text: 'Someone hiding from me.',
          nextNodeId: 'hiding_person',
        },
        {
          text: 'Someone with information I need.',
          nextNodeId: 'info_person',
        },
      ],
    },

    {
      id: 'missing_person',
      text: "*Her expression softens slightly* Missing person. Family? Friend? *She pulls out a small notebook* Give me a name, description, last known location. I'll see what I can find.",
      choices: [
        {
          text: '[Provide details about the missing person]',
          nextNodeId: 'missing_search',
        },
        {
          text: "Let me gather more information first.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'missing_search',
      text: "*She writes quickly* I'll make inquiries. Finding missing folk is tricky - could be they don't want to be found, could be someone made sure they couldn't be found. Twenty gold gets you my best effort for a week.",
      choices: [
        {
          text: '[Pay 20 gold] Please, find them.',
          nextNodeId: 'missing_paid',
          effects: [{ type: 'take_gold', value: 20 }],
          conditions: [{ type: 'gold_gte', value: 20 }],
        },
        {
          text: "I'll get the money.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'missing_paid',
      text: "*She tucks away the gold and her notebook* I'll start tonight. Check back with me in a few days - if there's anything to find, I'll find it. And if the news is bad... *She meets your eyes* I'll tell you straight.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_searching' }],
      choices: [
        {
          text: 'Thank you, Belle.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'hiding_person',
      text: "Someone hiding means someone with a reason to hide. Before I take this job, I need to know why they're running and why you're chasing. I don't help abusers find their victims.",
      choices: [
        {
          text: 'They stole from me.',
          nextNodeId: 'thief_hunt',
        },
        {
          text: 'They have answers I need.',
          nextNodeId: 'info_person',
        },
        {
          text: "Forget it. Too many questions.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'thief_hunt',
      text: "Theft I can work with. What did they take, and can you prove it was yours? I need to know I'm not being used to run down someone's innocent ex-partner.",
      choices: [
        {
          text: '[Explain the theft]',
          nextNodeId: 'thief_job',
        },
        {
          text: "Maybe I should handle this myself.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'thief_job',
      text: "*She nods* Alright, sounds legitimate. Thirty gold to track them, plus a percentage of whatever I recover. If they've already spent or sold your property, I'll at least tell you where they went. Deal?",
      choices: [
        {
          text: '[Pay 30 gold] Find them.',
          nextNodeId: 'thief_paid',
          effects: [{ type: 'take_gold', value: 30 }],
          conditions: [{ type: 'gold_gte', value: 30 }],
        },
        {
          text: "I need to think about it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'thief_paid',
      text: "*She pockets the gold* Smart move. Thieves who think they've escaped tend to get sloppy. I'll have something for you within the week.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_hunting_thief' }],
      choices: [
        {
          text: 'Good hunting.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'info_person',
      text: "Information gathering is delicate work. Approach wrong, and they clam up or run. Let me handle the finding and the first contact. I'm better at getting people to talk than you'd think.",
      choices: [
        {
          text: '[Pay 25 gold] Make it happen.',
          nextNodeId: 'info_job_paid',
          effects: [{ type: 'take_gold', value: 25 }],
          conditions: [{ type: 'gold_gte', value: 25 }],
        },
        {
          text: "What's your approach?",
          nextNodeId: 'info_approach',
        },
      ],
    },

    {
      id: 'info_approach',
      text: "Depends on the person. Some respond to money. Some to threats. Some just want someone to listen to their story. I read people well - it's how I've stayed alive this long. I'll find the right pressure point.",
      choices: [
        {
          text: '[Pay 25 gold] I trust your judgment.',
          nextNodeId: 'info_job_paid',
          effects: [{ type: 'take_gold', value: 25 }],
          conditions: [{ type: 'gold_gte', value: 25 }],
        },
        {
          text: "Let me consider my options.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'info_job_paid',
      text: "*She nods* Good. Give me three days. I'll have your information, one way or another. Meet me back here, and come alone.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_gathering_info' }],
      choices: [
        {
          text: "I'll be here.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'about_bounties',
      text: "Bounty hunting? It's simple enough. Someone does wrong, someone else posts a price. I collect. The trick is knowing which bounties are legitimate and which are just rich folk trying to remove inconveniences.",
      choices: [
        {
          text: 'How do you tell the difference?',
          nextNodeId: 'tell_difference',
        },
        {
          text: 'What bounties are you working now?',
          nextNodeId: 'current_bounties',
        },
        {
          text: 'Ever caught anyone famous?',
          nextNodeId: 'famous_catches',
        },
      ],
    },

    {
      id: 'tell_difference',
      text: "Experience, mostly. And investigation. Before I take a bounty, I learn everything I can about the target. If the story doesn't add up, I walk away. My conscience is worth more than any reward.",
      choices: [
        {
          text: 'An honorable code.',
          nextNodeId: 'honorable_code',
        },
        {
          text: "Doesn't that cost you money?",
          nextNodeId: 'cost_money',
        },
      ],
    },

    {
      id: 'honorable_code',
      text: "*She shrugs* Honor's a luxury in this business, but it's one I can afford. I've made enough enemies doing the right thing - I don't need to add to the list by hurting innocents.",
      choices: [
        {
          text: 'A good philosophy.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'cost_money',
      text: "Sometimes. But sleeping well is worth more than gold. Besides, my reputation for fairness means legitimate clients trust me. That's worth more in the long run than taking every dirty job that comes along.",
      choices: [
        {
          text: 'Smart business, too.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'current_bounties',
      text: "*She considers what to share* Got a few open. A horse thief working the ranches west of here. An IVRC foreman wanted for questioning by some families. And a standing job - the Copperhead Gang, though I've declined to pursue that one.",
      choices: [
        {
          text: "Why decline the Copperhead bounty?",
          nextNodeId: 'why_decline_copperhead',
        },
        {
          text: 'Could I help with any of those?',
          nextNodeId: 'help_bounties',
        },
      ],
    },

    {
      id: 'why_decline_copperhead',
      text: "Because it comes from IVRC, and I don't work for them. Also because Diamondback's people are fighting for something real, even if I don't agree with their methods. The railroad doesn't get to use me to crush resistance.",
      choices: [
        {
          text: "That's principled of you.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'help_bounties',
      text: "*She considers* The Burke job could use a second pair of hands. It's the foreman I mentioned - Thomas Burke. Wanted for questioning about missing workers. The families pooled fifty gold. Interested?",
      choices: [
        {
          text: "I'm in. Tell me more.",
          nextNodeId: 'burke_details',
        },
        {
          text: "Not right now, but keep me in mind.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'famous_catches',
      text: "*A ghost of a smile crosses her face* A few. Brought in 'Mad' Marcus Caine after he killed three lawmen. Tracked the Williamson brothers through two territories. And I once faced down a whole gang single-handed to collect on their leader.",
      choices: [
        {
          text: 'Impressive. How do you survive these encounters?',
          nextNodeId: 'how_survive',
        },
        {
          text: "You make it sound easy.",
          nextNodeId: 'not_easy',
        },
      ],
    },

    {
      id: 'how_survive',
      text: "Preparation. I never go into a situation without knowing every way out. I study my targets - their habits, weaknesses, fears. By the time I make my move, the outcome's already decided. Luck is for amateurs.",
      choices: [
        {
          text: 'Could you teach me some of that?',
          nextNodeId: 'teach_skills',
        },
        {
          text: "Wise approach.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'teach_skills',
      text: "*She studies you appraisingly* Maybe. If you prove yourself reliable. Competent people are hard to find out here. Help me with a job, and I'll show you a few tricks that might keep you alive.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_might_teach' }],
      choices: [
        {
          text: "I'd appreciate that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'not_easy',
      text: "Easy? *She laughs shortly* Nothing about this life is easy. Every job could be my last. But I'm still here, and most who tried to stop me aren't. That's not luck - it's being better prepared and faster on the draw.",
      choices: [
        {
          text: 'Respect.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'just_curious',
      text: "*She sighs* Curiosity. Fine. Yes, I'm a bounty hunter. Yes, I'm good at it. No, I won't sign your wanted poster. Anything else?",
      choices: [
        {
          text: "Actually, I might have work for you.",
          nextNodeId: 'have_work',
        },
        {
          text: 'Sorry to bother you.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'looking_for_work',
      text: "Work comes to those who earn it. Prove yourself useful to the right people, and opportunities appear. Prove yourself untrustworthy, and... *She pats her guns* Well. Different kind of opportunity.",
      choices: [
        {
          text: 'Who are the right people?',
          nextNodeId: 'right_people',
        },
        {
          text: 'Point taken.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'right_people',
      text: "Depends what kind of work you want. Honest labor? Talk to the ranchers, the merchants. Something more... exciting? There's always someone who needs problems solved quietly. Just know what you're getting into.",
      choices: [
        {
          text: 'And you? Do you have work?',
          nextNodeId: 'have_work',
        },
        {
          text: 'Thanks for the advice.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'need_info',
      text: "Information has a price. Who are you looking for, and why?",
      choices: [
        {
          text: '[Ask about a specific person]',
          nextNodeId: 'find_someone',
        },
        {
          text: "General information about the territory.",
          nextNodeId: 'territory_info',
        },
      ],
    },

    {
      id: 'territory_info',
      text: "The territory? IVRC runs most of it, Copperheads raid what they can, and everyone else scrapes by in between. The law exists where it's convenient for the railroad and nowhere else. That cover it?",
      choices: [
        {
          text: 'What about the Freeminers?',
          nextNodeId: 'freeminer_info',
        },
        {
          text: "What's IVRC really up to?",
          nextNodeId: 'ivrc_info',
        },
        {
          text: 'Thanks for the overview.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'freeminer_info',
      text: "Mountain folk. Keep to themselves, refuse to sell to IVRC. They've got guts, I'll give them that. Old Samuel Ironpick leads them - stubborn man, but decent. If IVRC ever moves on them seriously, it'll be a bloodbath.",
      choices: [
        {
          text: "Would you help them if it came to that?",
          nextNodeId: 'help_freeminers',
        },
        {
          text: 'Good to know.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'help_freeminers',
      text: "*She's quiet for a moment* Maybe. The Freeminers never did anyone wrong - they just want to work their claims in peace. If IVRC comes to slaughter them... *Her hand tightens on her gun* That might be worth dying to stop.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_freeminer_sympathy' }],
      choices: [
        {
          text: 'Glad to hear it.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'ivrc_info',
      text: "IVRC is doing what all corporations do - grabbing everything they can and crushing anyone who objects. But lately... there's something else. Something they're keeping very quiet, even from their own people. I aim to find out what.",
      choices: [
        {
          text: 'Project Remnant?',
          nextNodeId: 'remnant_mention',
          conditions: [{ type: 'flag_set', target: 'heard_project_remnant' }],
        },
        {
          text: "If you find out, let me know.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'remnant_mention',
      text: "*Her eyes sharpen* Where did you hear that name? *She steps closer* Tell me everything you know about Project Remnant. Now.",
      choices: [
        {
          text: '[Share what you know]',
          nextNodeId: 'share_remnant',
        },
        {
          text: 'First tell me why you care so much.',
          nextNodeId: 'why_care_remnant',
        },
      ],
    },

    {
      id: 'share_remnant',
      text: "*She listens intently, committing every detail to memory* This confirms what I suspected. Whatever Remnant is, it's big enough to kill for. My partner was getting close to something like this before they silenced him. *She meets your eyes* We need to work together on this.",
      onEnterEffects: [
        { type: 'set_flag', target: 'belle_remnant_ally' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: 'Agreed. Partners.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'why_care_remnant',
      text: "Because my partner died trying to expose IVRC's secrets. Before they killed him, he sent me one word: 'Remnant.' I've been trying to find out what it means ever since. If you know something... *Her voice hardens* Don't play games with me.",
      choices: [
        {
          text: '[Tell her what you know]',
          nextNodeId: 'share_remnant',
        },
        {
          text: "I only know the name. Nothing more.",
          nextNodeId: 'only_name',
        },
      ],
    },

    {
      id: 'only_name',
      text: "*She deflates slightly* More than most people know. If you learn anything else... *She hands you a small token* Show this at any general store and ask for a message to Belle. I'll find you.",
      onEnterEffects: [
        { type: 'give_item', target: 'belle_token' },
        { type: 'set_flag', target: 'belle_contact' },
      ],
      choices: [
        {
          text: "I'll be in touch.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'learn_from_best',
      text: "*She raises an eyebrow* Learn? From me? *She considers you* Most folks want to hire me or run from me. Not many want lessons. What exactly are you hoping to learn?",
      choices: [
        {
          text: 'How to track people.',
          nextNodeId: 'tracking_lesson',
        },
        {
          text: 'How to survive in dangerous situations.',
          nextNodeId: 'survival_lesson',
        },
        {
          text: 'How to read people.',
          nextNodeId: 'reading_lesson',
        },
      ],
    },

    {
      id: 'tracking_lesson',
      text: "Tracking's about patience and attention to detail. People leave signs everywhere - footprints, broken branches, disturbed dust. The trick is knowing which signs matter. *She glances around* See that dust pattern by the door? Someone left in a hurry this morning, heading east.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_tracking_tip' }],
      choices: [
        {
          text: "I didn't notice that at all.",
          nextNodeId: 'didnt_notice',
        },
        {
          text: 'How can you tell the direction?',
          nextNodeId: 'direction_tell',
        },
      ],
    },

    {
      id: 'didnt_notice',
      text: "That's why you're not a tracker. Yet. *She almost smiles* Practice looking at everything as evidence. Every room tells a story. Every trail has a beginning and an end. Learn to read those stories.",
      choices: [
        {
          text: "I'll practice. Thank you.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'direction_tell',
      text: "Dust displacement. When you push off to move, the dust spreads in the opposite direction of travel. That pattern points west, which means the person headed east. Basic physics, once you know to look for it.",
      choices: [
        {
          text: 'Fascinating. Any other tips?',
          nextNodeId: 'more_tips',
        },
      ],
    },

    {
      id: 'more_tips',
      text: "*She considers* One more, free of charge. When tracking someone, don't just follow their trail. Think like them. Where would they go? What would they need? Sometimes you can get ahead of your target just by understanding their goals.",
      choices: [
        {
          text: 'Valuable advice. Thank you, Belle.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'survival_lesson',
      text: "Survival's simple. Be aware of your surroundings, always have an exit, and never let anyone get behind you. *She demonstrates, positioning herself with her back to a wall* See? Now I can see every door, every window, every potential threat.",
      choices: [
        {
          text: 'You do that automatically?',
          nextNodeId: 'automatic_habit',
        },
        {
          text: 'What about when there is no safe position?',
          nextNodeId: 'no_safe_position',
        },
      ],
    },

    {
      id: 'automatic_habit',
      text: "After enough close calls, it becomes instinct. First time someone shot at me from behind, I learned my lesson fast. Now I never sit with my back to a door. Saved my life more than once.",
      choices: [
        {
          text: "I'll remember that.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'belle_survival_tip' }],
        },
      ],
    },

    {
      id: 'no_safe_position',
      text: "Then you make one. Flip a table for cover, position near the most defensible corner, keep moving so you're a harder target. And sometimes... *She pats her guns* ...you just have to be faster than whoever's threatening you.",
      choices: [
        {
          text: 'Practical advice. Thanks.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'belle_survival_tip' }],
        },
      ],
    },

    {
      id: 'reading_lesson',
      text: "Reading people is about watching what they don't say. Everyone's got tells - the way they hold their hands, where their eyes go, how they breathe. A liar looks different from someone telling the truth. Learn to spot the difference.",
      choices: [
        {
          text: 'How do you tell a liar?',
          nextNodeId: 'spot_liar',
        },
        {
          text: 'Can you read me right now?',
          nextNodeId: 'read_player',
        },
      ],
    },

    {
      id: 'spot_liar',
      text: "Liars usually avoid eye contact or maintain it too intensely. They touch their face more, especially the nose and mouth. Their stories have too much detail or not enough. And most importantly - their body says one thing while their words say another.",
      onEnterEffects: [{ type: 'set_flag', target: 'belle_reading_tip' }],
      choices: [
        {
          text: "I'll watch for that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'read_player',
      text: "*She studies you intently* You're nervous but trying not to show it. You've got questions you haven't asked yet. You're not sure if you can trust me, but you want to. *She tilts her head* And there's something driving you. Something personal. How'd I do?",
      choices: [
        {
          text: "...Frighteningly accurate.",
          nextNodeId: 'frighteningly_accurate',
        },
        {
          text: 'Not bad, but not perfect.',
          nextNodeId: 'not_perfect',
        },
      ],
    },

    {
      id: 'frighteningly_accurate',
      text: "*She almost smiles* Years of practice. Now you know why people cross the street. It's unsettling when someone sees through you. *She steps back* Use that skill wisely. It can make friends or enemies.",
      choices: [
        {
          text: 'Thank you for the lesson.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'not_perfect',
      text: "*She shrugs* Nobody's perfect, and you're harder to read than most. That's actually a compliment - it means you've learned to guard your tells. Keep practicing and you might give me a run for my money.",
      choices: [
        {
          text: "High praise from you.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    // Return greetings
    {
      id: 'return_greeting',
      text: "*Belle acknowledges you with a slight nod* Back again. What do you need?",
      expression: 'neutral',
      choices: [
        {
          text: 'Any news on the jobs we discussed?',
          nextNodeId: 'job_status',
          conditions: [{ type: 'flag_set', target: 'belle_has_jobs' }],
        },
        {
          text: 'I have new work for you.',
          nextNodeId: 'have_work',
        },
        {
          text: 'Just checking in.',
          nextNodeId: 'just_checking',
        },
      ],
    },

    {
      id: 'job_status',
      text: "Still working on it. These things take time if you want them done right. Check back in a day or two.",
      choices: [
        {
          text: "I'll do that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'just_checking',
      text: "Checking in is fine, but I work better without someone looking over my shoulder. Anything specific you need, or...?",
      choices: [
        {
          text: "No, I'll leave you to it.",
          nextNodeId: null,
        },
        {
          text: 'Actually, yes...',
          nextNodeId: 'have_work',
        },
      ],
    },

    {
      id: 'hired_greeting',
      text: "*Belle looks up from cleaning her revolver* You ready to move? I've been scouting the route. It's clear for now, but that won't last. We should go soon.",
      choices: [
        {
          text: "I'm ready. Let's go.",
          nextNodeId: 'ready_to_go',
        },
        {
          text: 'I need more time to prepare.',
          nextNodeId: 'need_more_time',
        },
        {
          text: "What did you find scouting?",
          nextNodeId: 'scouting_report',
        },
      ],
    },

    {
      id: 'ready_to_go',
      text: "*She holsters her weapon and stands* Good. Stay close, follow my lead, and keep your eyes open. If I say run, you run. If I say shoot, you shoot. Questions?",
      choices: [
        {
          text: 'No questions. Lead the way.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'departed_with_belle' }],
        },
      ],
    },

    {
      id: 'need_more_time',
      text: "*She frowns* Don't take too long. The window's closing. Every hour we wait is another hour for IVRC to get wind of our plans. I'll be here, but don't keep me waiting forever.",
      choices: [
        {
          text: 'Understood. Soon.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'scouting_report',
      text: "Two IVRC patrols on the main road, but they're on a schedule - easy to avoid. The mountain pass is clear, though I saw smoke from a campfire two ridges over. Could be travelers, could be Copperheads. We'll go around to be safe.",
      choices: [
        {
          text: 'Thorough as always.',
          nextNodeId: 'ready_to_go',
        },
        {
          text: 'Let me prepare first.',
          nextNodeId: 'need_more_time',
        },
      ],
    },

    {
      id: 'high_rep_greeting',
      text: "*Belle actually smiles when she sees you* Well, if it isn't my favorite client. What brings you back? Another job, or just enjoying my company?",
      expression: 'friendly',
      choices: [
        {
          text: "Can't it be both?",
          nextNodeId: 'both_greeting',
        },
        {
          text: 'I have another job, actually.',
          nextNodeId: 'have_work',
        },
        {
          text: 'Just wanted to see how you were.',
          nextNodeId: 'friendly_checkin',
        },
      ],
    },

    {
      id: 'both_greeting',
      text: "*She laughs - a rare, genuine sound* I suppose it can. You've proven yourself reliable, which is more than I can say for most people in this territory. What's on your mind?",
      choices: [
        {
          text: 'I have a new job.',
          nextNodeId: 'have_work',
        },
        {
          text: 'Any word on Remnant?',
          nextNodeId: 'remnant_update',
          conditions: [{ type: 'flag_set', target: 'belle_remnant_ally' }],
        },
      ],
    },

    {
      id: 'friendly_checkin',
      text: "*She seems genuinely touched* That's... kind. I'm not used to people caring about my wellbeing. *She shrugs* I'm fine. Keeping busy, staying sharp. You?",
      choices: [
        {
          text: 'Same. It is good to see you.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'remnant_update',
      text: "*Her expression grows serious* I've been digging. Whatever Remnant is, it's centered in the Iron Mountains. Heavy guard activity, supply wagons going up but nothing coming down. Scientists, too - eastern types, not local. Something big is happening up there.",
      choices: [
        {
          text: 'We need to investigate.',
          nextNodeId: 'investigate_remnant',
        },
        {
          text: "Keep gathering information. I'll help when I can.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'investigate_remnant',
      text: "*She nods grimly* Agreed. But we need to be smart about it. IVRC has that mountain locked down tight. We'll need inside help, or one hell of a distraction. *She meets your eyes* When you're ready to move, say the word. I'll be there.",
      onEnterEffects: [{ type: 'set_flag', target: 'ready_for_remnant' }],
      choices: [
        {
          text: "Soon. I need to prepare first.",
          nextNodeId: null,
        },
        {
          text: "I might know someone who can help.",
          nextNodeId: 'inside_help',
        },
      ],
    },

    {
      id: 'inside_help',
      text: "*Her eyes sharpen* Inside help? That changes things. Who do you have in mind?",
      choices: [
        {
          text: 'The Freeminers know those mountains.',
          nextNodeId: 'freeminer_help',
        },
        {
          text: "Professor Cogsworth used to work for IVRC.",
          nextNodeId: 'cogsworth_help',
          conditions: [{ type: 'flag_set', target: 'knows_about_cogsworth' }],
        },
      ],
    },

    {
      id: 'freeminer_help',
      text: "*She considers* Samuel Ironpick's people. They hate IVRC as much as I do, and they know every tunnel and trail in those mountains. If you can get them to trust us... that could work. Can you arrange a meeting?",
      choices: [
        {
          text: "I'll work on it.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'planning_freeminer_alliance' }],
        },
      ],
    },

    {
      id: 'cogsworth_help',
      text: "*She nods slowly* The professor. I've heard of him - brilliant, they say, but too ethical for IVRC's taste. If he has inside knowledge of their operations... *She trails off* Get him on board. I'll handle the rest.",
      choices: [
        {
          text: "I'll talk to him.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'planning_cogsworth_help' }],
        },
      ],
    },
  ],
};

export const BlackBelleDialogues = [BlackBelleMainDialogue];
