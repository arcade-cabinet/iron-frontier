/**
 * Whiskey Pete - Dialogue Trees
 *
 * Saloon owner and information broker. Hears every secret that
 * passes through his establishment. Sells rumors for gold and
 * maintains careful neutrality in the conflicts around him.
 */

import type { DialogueTree } from '../../schemas/npc';

export const WhiskeyPeteMainDialogue: DialogueTree = {
  id: 'whiskey_pete_main',
  name: 'Whiskey Pete - Main Conversation',
  description: 'Primary dialogue tree for Whiskey Pete (Peter Sullivan)',
  tags: ['iron_gulch', 'saloon', 'information', 'rumors'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'has_gold_greeting',
      conditions: [{ type: 'gold_gte', value: 50 }],
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
      text: "*A portly man with a ruddy face looks up from polishing a glass, his eyes twinkling with practiced warmth* Well now, fresh face in the Golden Nugget! Name's Pete - Whiskey Pete to most folks. What can I pour ya, stranger?",
      expression: 'friendly',
      choices: [
        {
          text: "Just looking around. Nice place you've got.",
          nextNodeId: 'place_response',
        },
        {
          text: "I'll take whatever's strong.",
          nextNodeId: 'drink_order',
        },
        {
          text: "I hear you're the man to talk to for information.",
          nextNodeId: 'information_intro',
        },
      ],
    },

    {
      id: 'place_response',
      text: "*He beams with pride* Built her up from nothin' when I came west. Every plank, every bottle, earned honest... mostly. *He winks* The Golden Nugget sees all kinds - miners with dust in their pockets, railroad men with secrets on their tongues. Best entertainment in Iron Gulch, if I do say so myself.",
      choices: [
        {
          text: 'You must hear a lot of interesting things.',
          nextNodeId: 'hear_things',
        },
        {
          text: "What's the story with you coming west?",
          nextNodeId: 'backstory',
        },
        {
          text: "I'll take that drink now.",
          nextNodeId: 'drink_order',
        },
      ],
    },

    {
      id: 'backstory',
      text: "*His smile flickers for just a moment* Ah, the usual story. Man gets in trouble back east, man heads where trouble can't follow. Chicago was gettin' too hot, if you catch my meanin'. But that's ancient history now. Out here, a man can be whoever he wants to be.",
      choices: [
        {
          text: 'What kind of trouble?',
          nextNodeId: 'chicago_trouble',
        },
        {
          text: "I understand. Fresh starts are valuable.",
          nextNodeId: 'fresh_start',
        },
      ],
    },

    {
      id: 'chicago_trouble',
      text: "*He leans in conspiratorially* Let's just say a card game went wrong and a man ended up dead. Wasn't my fault - he drew first - but the fella's brother was a police captain. *He shrugs* Justice is funny that way. Out here, though? Nobody cares what you did before. Only what you do now.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_pete_past' }],
      choices: [
        {
          text: "Your secret's safe with me.",
          nextNodeId: 'secret_safe',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: 'Sounds like you got lucky.',
          nextNodeId: 'got_lucky',
        },
      ],
    },

    {
      id: 'secret_safe',
      text: "*He nods appreciatively* You're alright, friend. I like someone who knows how to keep their mouth shut. That's a rare quality 'round here. *He pours you a drink* This one's on the house. Consider it an investment in friendship.",
      onEnterEffects: [{ type: 'set_flag', target: 'pete_friendly' }],
      choices: [
        {
          text: 'Much obliged. So what goes on around here?',
          nextNodeId: 'town_gossip_intro',
        },
        {
          text: 'Thanks, Pete.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'got_lucky',
      text: "Lucky Pete, they used to call me. *He chuckles* Though I prefer 'Whiskey' now. Less questions about the past. But enough about me - you didn't come to hear an old man's stories. What brings you to Iron Gulch?",
      choices: [
        {
          text: 'Looking for work.',
          nextNodeId: 'looking_for_work',
        },
        {
          text: 'Looking for information.',
          nextNodeId: 'information_intro',
        },
      ],
    },

    {
      id: 'fresh_start',
      text: "That they are. *He raises a glass* To fresh starts and no questions asked. Now then - what can old Pete do for ya?",
      choices: [
        {
          text: "I'm looking for work.",
          nextNodeId: 'looking_for_work',
        },
        {
          text: 'What can you tell me about this town?',
          nextNodeId: 'town_gossip_intro',
        },
      ],
    },

    {
      id: 'drink_order',
      text: "*He pours a generous measure of amber liquid* That'll be two bits. Local stuff - not the finest, but it'll put hair on your chest and fire in your belly. *He slides the glass over* You look like someone with questions. I got answers, if you got coin.",
      choices: [
        {
          text: 'What kind of answers?',
          nextNodeId: 'what_answers',
        },
        {
          text: '[Pay 2 gold] Here you go.',
          nextNodeId: 'paid_for_drink',
          effects: [{ type: 'take_gold', value: 2 }],
          conditions: [{ type: 'gold_gte', value: 2 }],
        },
        {
          text: "I'll pass on the drink.",
          nextNodeId: 'pass_drink',
        },
      ],
    },

    {
      id: 'paid_for_drink',
      text: "*He pockets the coins smoothly* A pleasure doin' business. Now, what's on your mind? You want gossip about the town? Information about specific folks? Or maybe you're lookin' for... opportunities?",
      choices: [
        {
          text: 'Tell me about the town.',
          nextNodeId: 'town_gossip_intro',
        },
        {
          text: "What kind of 'opportunities'?",
          nextNodeId: 'opportunities',
        },
        {
          text: "I'm looking for someone specific.",
          nextNodeId: 'looking_for_someone',
        },
      ],
    },

    {
      id: 'pass_drink',
      text: "Suit yourself. Though a man who don't drink in a saloon tends to make folks nervous. *He shrugs* But I ain't one to judge. What can I help you with?",
      choices: [
        {
          text: 'I need information.',
          nextNodeId: 'information_intro',
        },
        {
          text: 'Just looking around.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'hear_things',
      text: "*He taps his ear with a knowing smile* These old ears have heard more secrets than a priest's confession box. Men get drunk, men talk. Important men, unimportant men - they all spill eventually. The trick is knowin' what's worth rememberin'.",
      choices: [
        {
          text: "And I suppose remembering costs extra?",
          nextNodeId: 'costs_extra',
        },
        {
          text: "What's the most interesting thing you've heard lately?",
          nextNodeId: 'interesting_lately',
        },
      ],
    },

    {
      id: 'costs_extra',
      text: "*He grins widely* Now you're catchin' on. Information's a commodity, just like whiskey. The better the vintage, the higher the price. But I'm fair - you won't find no gougin' here. Just honest trade.",
      choices: [
        {
          text: 'What do you have to sell?',
          nextNodeId: 'rumors_for_sale',
        },
        {
          text: 'Maybe another time.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'information_intro',
      text: "*His friendly demeanor sharpens just slightly* Ah, a direct one. I appreciate that. Yes, I deal in information. Nothing dangerous, mind you - just... helpful knowledge. Who's lookin' for what, who's got problems, that sort of thing. Interested?",
      choices: [
        {
          text: 'What do you know about IVRC?',
          nextNodeId: 'ivrc_rumors',
        },
        {
          text: 'What about the Copperhead Gang?',
          nextNodeId: 'copperhead_rumors',
        },
        {
          text: 'Any work opportunities?',
          nextNodeId: 'opportunities',
        },
        {
          text: "What's happening in town right now?",
          nextNodeId: 'current_events',
        },
      ],
    },

    {
      id: 'what_answers',
      text: "Depends what you're askin'. I know who's hidin' from who, what shipments are comin' in, which folks got grudges and which got gold. I know when the Pinkertons are in town and when the Copperheads are movin'. All available for the right price.",
      choices: [
        {
          text: 'How much for a rumor?',
          nextNodeId: 'rumor_prices',
        },
        {
          text: "That's quite a service you run.",
          nextNodeId: 'service_comment',
        },
      ],
    },

    {
      id: 'rumor_prices',
      text: "Simple gossip? Five gold. Useful information? Ten to twenty, dependin' on how fresh it is. The real juicy stuff - names, dates, locations - that'll cost you proper. But I guarantee quality. Pete don't sell rumors that don't pan out.",
      choices: [
        {
          text: '[Pay 5 gold] Give me something simple.',
          nextNodeId: 'simple_rumor',
          effects: [{ type: 'take_gold', value: 5 }],
          conditions: [{ type: 'gold_gte', value: 5 }],
        },
        {
          text: '[Pay 15 gold] I want something useful.',
          nextNodeId: 'useful_rumor',
          effects: [{ type: 'take_gold', value: 15 }],
          conditions: [{ type: 'gold_gte', value: 15 }],
        },
        {
          text: "I'll think about it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'simple_rumor',
      text: "*He pockets the gold* Alright, here's one for free - the foreman at the main IVRC mine, Burke's his name, he's been skimmin' supplies. Sellin' 'em on the side. Word is the company's gettin' suspicious. Might be an opportunity for someone willin' to exploit that situation.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_burke_stealing' }],
      choices: [
        {
          text: 'Interesting. Tell me more about Burke.',
          nextNodeId: 'burke_info',
        },
        {
          text: 'Thanks. Good to know.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'useful_rumor',
      text: "*He leans close, voice dropping* There's a Pinkerton agent in town. Goes by the name Morrison, but that ain't his real name. He's been askin' about the Copperheads, payin' good money for tips. *He pauses* He's also been askin' about someone matchin' your description. New arrival, askin' questions. Thought you'd want to know.",
      onEnterEffects: [{ type: 'set_flag', target: 'pinkerton_watching' }],
      choices: [
        {
          text: 'Where can I find this Morrison?',
          nextNodeId: 'morrison_location',
        },
        {
          text: "Thanks for the warning. I'll be careful.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'morrison_location',
      text: "He's been stayin' at the boarding house on Third Street. Room at the back, always keeps the curtains drawn. Comes in here most evenings, sits in the corner, watches everyone. If you're gonna approach him, be careful. Pinkertons don't take kindly to bein' made.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_morrison_location' }],
      choices: [
        {
          text: 'Good information. Thanks, Pete.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'burke_info',
      text: "Thomas Burke. Mean drunk, meaner sober. Runs the crews with an iron fist. IVRC loves him 'cause he gets results, don't care how. But his gamblin' debts have been pilin' up - that's why he's stealin'. If someone had leverage on him...",
      choices: [
        {
          text: 'He could be useful.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'considering_burke_leverage' }],
        },
      ],
    },

    {
      id: 'service_comment',
      text: "*He shrugs modestly* Everyone needs a way to make a livin'. I just happen to have big ears and a good memory. Plus, runnin' a saloon means everyone comes to me eventually. Why not profit from human nature?",
      choices: [
        {
          text: 'A practical philosophy.',
          nextNodeId: 'rumors_for_sale',
        },
      ],
    },

    {
      id: 'rumors_for_sale',
      text: "So what'll it be? I got information on the major players in town, word about IVRC's movements, gossip about the Copperheads. Even some... quieter opportunities, if you're the type.",
      choices: [
        {
          text: 'Tell me about IVRC.',
          nextNodeId: 'ivrc_rumors',
        },
        {
          text: 'What about the Copperheads?',
          nextNodeId: 'copperhead_rumors',
        },
        {
          text: 'What opportunities?',
          nextNodeId: 'opportunities',
        },
        {
          text: 'Maybe later.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ivrc_rumors',
      text: "*He glances around before speaking quietly* IVRC's got their fingers in everything. But lately? They've been nervous. Shipments goin' missin', workers organizin' in secret. Word is Director Thorne himself is comin' to sort things out. When he moves, people disappear.",
      choices: [
        {
          text: '[Pay 10 gold] Tell me more about Thorne.',
          nextNodeId: 'thorne_info',
          effects: [{ type: 'take_gold', value: 10 }],
          conditions: [{ type: 'gold_gte', value: 10 }],
        },
        {
          text: 'What about the missing shipments?',
          nextNodeId: 'shipments_info',
        },
        {
          text: 'Workers organizing?',
          nextNodeId: 'workers_organizing',
        },
      ],
    },

    {
      id: 'thorne_info',
      text: "Cornelius Thorne. The man himself. *Pete's voice drops to barely a whisper* Cold as a winter grave, that one. Came up through the ranks by makin' problems disappear - and not just business problems. Word is he's got a whole network of informants, enforcers. Even the Pinkertons answer to him in this territory.",
      onEnterEffects: [{ type: 'set_flag', target: 'pete_told_about_thorne' }],
      choices: [
        {
          text: "What's he planning?",
          nextNodeId: 'thorne_plans',
        },
        {
          text: 'How do you know all this?',
          nextNodeId: 'how_know_thorne',
        },
      ],
    },

    {
      id: 'thorne_plans',
      text: "That I couldn't say for certain. But there's been talk of a 'final solution' to the Freeminer problem. Land seizures, mass arrests. Maybe worse. If I were involved with any resistance, I'd be very careful right now.",
      choices: [
        {
          text: 'Thanks for the warning.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'warned_about_thorne_plans' }],
        },
      ],
    },

    {
      id: 'how_know_thorne',
      text: "*He taps his nose* I told you - men talk when they drink. Thorne's agents need to unwind same as anyone. A few shots of whiskey and they're braggin' about their important boss. They don't see old Pete as a threat. That's their mistake.",
      choices: [
        {
          text: 'A valuable mistake for you.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'shipments_info',
      text: "The Copperheads have been hittin' the railroad hard. But here's the thing - they seem to know exactly which trains to hit. Either they got real good luck, or someone's feedin' them information from inside IVRC. Thorne's been tearin' his hair out tryin' to find the leak.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_copperhead_inside_info' }],
      choices: [
        {
          text: 'Any idea who the leak might be?',
          nextNodeId: 'leak_identity',
        },
        {
          text: 'Interesting. Thanks.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'leak_identity',
      text: "*He shakes his head* If I knew that, I'd be a rich man - or a dead one. But I've noticed that Victoria Ashworth, Thorne's right hand, has been askin' the same question. Very... thoroughly. If you catch my meanin'.",
      choices: [
        {
          text: 'She sounds dangerous.',
          nextNodeId: 'ashworth_dangerous',
        },
      ],
    },

    {
      id: 'ashworth_dangerous',
      text: "Dangerous don't begin to cover it. Beautiful woman, cold heart. They say she handles Thorne's 'special problems.' The kind that need to stop breathin'. If she's lookin' for someone, that someone had best start runnin'.",
      onEnterEffects: [{ type: 'set_flag', target: 'warned_about_ashworth' }],
      choices: [
        {
          text: "I'll keep my distance.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'workers_organizing',
      text: "Quietly, mind you. Very quietly. But yeah, there's been meetin's. Late at night, in the abandoned mine shafts. Talk of strikes, demands for better conditions. IVRC would crush 'em if they knew, but the workers are gettin' desperate.",
      choices: [
        {
          text: 'Who leads these meetings?',
          nextNodeId: 'meeting_leader',
        },
        {
          text: "Sounds like trouble brewing.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'meeting_leader',
      text: "*He hesitates* That's the kind of information that gets people killed. But... for another ten gold, I might recall a name or two.",
      choices: [
        {
          text: '[Pay 10 gold] Tell me.',
          nextNodeId: 'meeting_names',
          effects: [{ type: 'take_gold', value: 10 }],
          conditions: [{ type: 'gold_gte', value: 10 }],
        },
        {
          text: "Forget I asked.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'meeting_names',
      text: "*He speaks barely above a whisper* There's a woman. Goes by 'Red' among the workers. Fiery hair, fiercer temper. She's been the one stirrin' folks up. Careful with that name though - if it gets back to IVRC that I told you...",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_about_red' }],
      choices: [
        {
          text: "I'll be discreet.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'copperhead_rumors',
      text: "Ah, Diamondback's boys. Now there's a topic that could get a man's tongue cut out. *He grins* Lucky for you, I got a loose tongue and a locked door. What do you want to know?",
      choices: [
        {
          text: "Where's their hideout?",
          nextNodeId: 'hideout_question',
        },
        {
          text: 'Tell me about Diamondback.',
          nextNodeId: 'diamondback_info',
        },
        {
          text: 'Are they really as bad as people say?',
          nextNodeId: 'copperhead_reputation',
        },
      ],
    },

    {
      id: 'hideout_question',
      text: "*He laughs* If I knew that, do you think I'd still be pourin' drinks? That information's worth more than this whole saloon. What I can tell you is they move around. Never stay in one place long. Smart, that Diamondback.",
      choices: [
        {
          text: 'How do people contact them?',
          nextNodeId: 'contact_copperheads',
        },
        {
          text: 'Fair enough.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'contact_copperheads',
      text: "*He lowers his voice* There's a tree at the crossroads, three miles south. Folks call it the Hangin' Oak. You want to get a message to the Copperheads, you leave it there. Can't promise they'll respond, but they're watchin'.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_copperhead_dropoff' }],
      choices: [
        {
          text: 'Good to know.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'diamondback_info',
      text: "Dolores Vega, they say her real name is. Used to work for IVRC - telegraph operator or some such. Story goes she found out somethin' she shouldn't have, and they tried to kill her for it. She lived. They regret it.",
      choices: [
        {
          text: 'What did she find out?',
          nextNodeId: 'diamondback_secret',
        },
        {
          text: "She sounds like someone with a grudge.",
          nextNodeId: 'diamondback_grudge',
        },
      ],
    },

    {
      id: 'diamondback_secret',
      text: "*He shakes his head* That's the million dollar question, ain't it? Whatever it was, it turned a mousy clerk into the most wanted outlaw in the territory. Must've been somethin' big. Real big.",
      choices: [
        {
          text: 'Interesting...',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'curious_about_diamondback_secret' }],
        },
      ],
    },

    {
      id: 'diamondback_grudge',
      text: "Grudge? *He snorts* That woman's got enough hate to burn down IVRC headquarters and salt the earth after. But here's the thing - she only hits corporate targets. Never touches regular folks. Some say she gives half her take to poor families. Robin Hood in a rattlesnake skin.",
      choices: [
        {
          text: 'Sounds almost heroic.',
          nextNodeId: 'heroic_diamondback',
        },
        {
          text: "She's still an outlaw.",
          nextNodeId: 'still_outlaw',
        },
      ],
    },

    {
      id: 'heroic_diamondback',
      text: "Depends who you ask. To the miners and ranchers IVRC's crushed? She's a hero. To the law and the railroad? She's a murderer and a thief. *He shrugs* Me? I just serve drinks and keep my head down.",
      choices: [
        {
          text: 'Wise policy.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'still_outlaw',
      text: "That she is. And the law's closin' in. IVRC's put a five thousand dollar bounty on her head. That kind of money makes friends scarce and enemies plenty. I give her another year, maybe two, before someone collects.",
      choices: [
        {
          text: 'Maybe sooner.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'copperhead_reputation',
      text: "Bad? Good? Depends on your perspective. They've killed IVRC men, sure. But they also raided a company supply train last month and distributed the food to starvin' families in Coldwater. Complicated folk, the Copperheads.",
      choices: [
        {
          text: 'The world is rarely black and white.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'opportunities',
      text: "*His eyes gleam* Now we're talkin'. There's always work for someone willin' to get their hands dirty. Nothin' too illegal, mind you - I got a business to protect. But there's folks who need things done and don't want to do 'em themselves.",
      choices: [
        {
          text: 'What kind of work?',
          nextNodeId: 'work_types',
        },
        {
          text: "How dirty are we talking?",
          nextNodeId: 'how_dirty',
        },
      ],
    },

    {
      id: 'work_types',
      text: "Deliveries, mostly. Packages that need to get somewhere without too many questions. Sometimes it's collectin' debts - folk who owe but don't pay. Occasionally there's... competitive intelligence. Findin' out what the other saloons are plannin'.",
      onEnterEffects: [{ type: 'set_flag', target: 'pete_offered_work' }],
      choices: [
        {
          text: "I might be interested. What's the pay?",
          nextNodeId: 'work_pay',
        },
        {
          text: "That's not really my line.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'work_pay',
      text: "Depends on the job. Simple delivery, five to ten gold. Debt collection, twenty plus whatever percentage you can squeeze out. The intelligence work... that pays the best, but it's also the riskiest. You game?",
      choices: [
        {
          text: "I'll take a delivery job to start.",
          nextNodeId: 'delivery_job',
          effects: [{ type: 'start_quest', target: 'saloon_secrets' }],
        },
        {
          text: "I need to think about it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'delivery_job',
      text: "*He nods approvingly* Smart, startin' small. Alright, here's the deal. Got a package needs to go to a fella at the mining camp. Name's Jennings. You give him this, he gives you a letter, you bring it back. Simple. Twenty gold when it's done.",
      onEnterEffects: [{ type: 'give_item', target: 'sealed_package' }],
      choices: [
        {
          text: "I'll handle it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'how_dirty',
      text: "Not murder, if that's what you're worried about. I don't deal in that. But some of it... let's say it wouldn't look good in a court of law. Then again, the law out here is whatever IVRC says it is, so who's to judge?",
      choices: [
        {
          text: 'You have a point.',
          nextNodeId: 'work_types',
        },
        {
          text: "I'll stick to legal work.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'looking_for_work',
      text: "Work? Plenty of that in Iron Gulch, though most of it's backbreakin' and low-payin'. IVRC's always hirin' for the mines if you don't mind shortened lifespan. But if you're lookin' for somethin' more... interesting...",
      choices: [
        {
          text: "I'm listening.",
          nextNodeId: 'opportunities',
        },
        {
          text: 'What about legitimate work?',
          nextNodeId: 'legitimate_work',
        },
      ],
    },

    {
      id: 'legitimate_work',
      text: "General store's always needin' hands to move inventory. The stables could use a spare groom. Or you could hire out as a guard - lots of folks need protection on the roads these days, what with the Copperheads about.",
      choices: [
        {
          text: 'Guard work might suit me.',
          nextNodeId: 'guard_work',
        },
        {
          text: "Thanks for the suggestions.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'guard_work',
      text: "Talk to the freight office down the street. They're always lookin' for guns to ride shotgun on the wagons. Pay's decent, risk is moderate. Just don't expect IVRC to cover your funeral if the Copperheads hit your convoy.",
      choices: [
        {
          text: "I'll check it out.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'knows_guard_work' }],
        },
      ],
    },

    {
      id: 'looking_for_someone',
      text: "*He raises an eyebrow* Now that's a service I offer, for the right price. Who you lookin' for? And more importantly... why?",
      choices: [
        {
          text: "I'm looking for Samuel Ironpick.",
          nextNodeId: 'looking_samuel',
        },
        {
          text: 'A bounty hunter called Black Belle.',
          nextNodeId: 'looking_belle',
        },
        {
          text: 'Never mind.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'looking_samuel',
      text: "*He whistles low* Old Samuel? That's a name that carries weight. He's up in Freeminer's Hollow, but good luck gettin' to him. Those mountain folk don't trust strangers. What's your business with him?",
      choices: [
        {
          text: 'Personal matter.',
          nextNodeId: 'samuel_personal',
        },
        {
          text: 'Someone told me to find him.',
          nextNodeId: 'samuel_referred',
        },
      ],
    },

    {
      id: 'samuel_personal',
      text: "*He shrugs* Fair enough. Just know that if you go up there with bad intentions, you won't come back down. Samuel's got loyal people around him, and they shoot first when it comes to outsiders.",
      choices: [
        {
          text: "I'll be careful.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'samuel_referred',
      text: "Oh? Who would that be? *He studies you carefully* Not many folk recommend visitors to the Ironpicks these days. That's either a very good sign... or a very bad one for you.",
      choices: [
        {
          text: "The Sheriff mentioned him.",
          nextNodeId: 'sheriff_mentioned',
        },
        {
          text: "I'd rather not say.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'sheriff_mentioned',
      text: "*He nods slowly* Cole's a decent man, even if he is law. If he sent you to Samuel, there's a reason. Just tell the mountain folk that straight out - might save you catchin' a bullet.",
      choices: [
        {
          text: 'Thanks for the advice.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'looking_belle',
      text: "Black Belle? *He laughs* Good luck findin' her unless she wants to be found. But I heard she's been workin' the mesa country lately. Bunch of bounties out there. If you got a job for her, leave word at the general store in Mesa Point. She checks in there.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_belle_location' }],
      choices: [
        {
          text: "That's helpful. Thanks.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'town_gossip_intro',
      text: "Iron Gulch? It's IVRC's company town, through and through. They own the mine, the stores, most of the buildings. Mayor's in their pocket, law looks the other way. If you're not workin' for them, you're barely survivin' despite them.",
      choices: [
        {
          text: 'Sounds oppressive.',
          nextNodeId: 'oppressive',
        },
        {
          text: 'Any bright spots?',
          nextNodeId: 'bright_spots',
        },
        {
          text: "Who should I know about?",
          nextNodeId: 'who_to_know',
        },
      ],
    },

    {
      id: 'oppressive',
      text: "That's puttin' it mildly. Company script instead of real money, prices set by the company store, hours set by the company. A man could work his whole life here and never save enough to leave. That's by design.",
      choices: [
        {
          text: "Sounds like people need options.",
          nextNodeId: 'need_options',
        },
        {
          text: "Surely some folks prosper.",
          nextNodeId: 'who_prospers',
        },
      ],
    },

    {
      id: 'need_options',
      text: "That they do. *He leans in* There's folks workin' on that. Quietly. If you're the type to help, there might be opportunities. But I didn't say nothin', understand?",
      onEnterEffects: [{ type: 'set_flag', target: 'pete_hinted_resistance' }],
      choices: [
        {
          text: 'I understand perfectly.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'who_prospers',
      text: "The overseers. The company men. The folk who sold their souls for a comfortable boot on their neighbors' necks. They do just fine. The rest of us? We scrape by and dream of better days.",
      choices: [
        {
          text: 'A grim picture.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'bright_spots',
      text: "The people. Despite everything, folks here look out for each other. Share food when times are hard, take care of the sick and elderly. IVRC can't crush that, hard as they try. And the sunsets... *He smiles* The sunsets here are somethin' else.",
      choices: [
        {
          text: 'There is beauty even in hard places.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'who_to_know',
      text: "Well now, that depends on what you need. The foreman Burke runs the mine - cruel man but useful to know. There's a professor type, Cogsworth, lives outside town - invents strange things. And if you need healin' or supplies, Doc Chen down in Dusty Springs is your best bet.",
      choices: [
        {
          text: 'Tell me about the professor.',
          nextNodeId: 'about_cogsworth',
        },
        {
          text: 'What about Burke?',
          nextNodeId: 'about_burke',
        },
        {
          text: "Thanks for the rundown.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'about_cogsworth',
      text: "Emmett Cogsworth. Used to work for IVRC, from what I hear. Got fired for bein' too... creative. Now he tinkers in a workshop out in Coldwater. Half his inventions explode, but the ones that work? Remarkable stuff. Strange fellow, but harmless.",
      choices: [
        {
          text: 'He sounds interesting.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'knows_about_cogsworth' }],
        },
      ],
    },

    {
      id: 'about_burke',
      text: "Thomas Burke. Foreman of the main IVRC mine. *Pete's face darkens* Mean bastard, pardon my language. Works his crews half to death and takes pleasure in it. Got a gamblin' problem and a drinkin' problem - which is good for my business but bad for anyone who owes him money.",
      choices: [
        {
          text: 'Not someone to cross.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'interesting_lately',
      text: "*He strokes his chin thoughtfully* Most interesting? Hmm. Well, there's been talk of somethin' called 'Project Remnant' among the IVRC higher-ups. Don't know what it is, but it's got 'em nervous and excited in equal measure. Whatever it is, it's big.",
      onEnterEffects: [{ type: 'set_flag', target: 'heard_project_remnant' }],
      choices: [
        {
          text: 'Project Remnant? Tell me more.',
          nextNodeId: 'remnant_info',
        },
        {
          text: 'Interesting. Thanks.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'remnant_info',
      text: "Wish I could. All I know is it involves the mountains, big shipments goin' up there under heavy guard, and scientists who ain't from around here. When IVRC starts bringin' in educated folk, it usually means they found somethin' valuable. Or dangerous.",
      choices: [
        {
          text: 'Or both.',
          nextNodeId: 'or_both',
        },
      ],
    },

    {
      id: 'or_both',
      text: "*He nods grimly* Or both. That'd be just like IVRC. Find somethin' powerful, use it to crush anyone in their way. *He tops off your glass* Whatever it is, I'd stay clear of it if I were you. Some secrets are better left buried.",
      choices: [
        {
          text: "Sound advice. I'll be careful.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'current_events',
      text: "Right now? Tensions are high. IVRC's crackin' down on any talk of unions. The Copperheads just hit another shipment last week. And there's a bounty hunter in town - Black Belle - lookin' for someone. Don't know who, but people are nervous.",
      choices: [
        {
          text: 'Black Belle is here?',
          nextNodeId: 'belle_here',
        },
        {
          text: "What's this about unions?",
          nextNodeId: 'union_talk',
        },
        {
          text: 'Thanks for the update.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'belle_here',
      text: "Was here. Came through yesterday, asked a few questions, then headed out toward the mesa. Scary woman, that one. Beautiful as a rattlesnake and just as deadly. If she's after someone, I feel sorry for 'em.",
      choices: [
        {
          text: 'What was she asking about?',
          nextNodeId: 'belle_asking',
        },
        {
          text: 'I see.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'belle_asking',
      text: "Wanted to know about recent arrivals. People askin' questions, actin' suspicious. *He gives you a meaningful look* Sound like anyone you know?",
      choices: [
        {
          text: "I've done nothing wrong.",
          nextNodeId: 'nothing_wrong',
        },
        {
          text: "Maybe I should find her first.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'wants_to_find_belle' }],
        },
      ],
    },

    {
      id: 'nothing_wrong',
      text: "*He holds up his hands* Hey, I ain't accusin' nobody. Just... lettin' you know. Information, remember? That's what I sell.",
      choices: [
        {
          text: 'Right. Thanks for the tip.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'union_talk',
      text: "Workers have been meetin' in secret, talkin' about demands. Better pay, safer conditions, the right to leave when their contracts are up. IVRC's sent in Pinkertons to sniff out the ringleaders. It's gonna get ugly before it gets better.",
      choices: [
        {
          text: 'Someone should help them.',
          nextNodeId: 'help_workers',
        },
        {
          text: "Sounds dangerous to get involved.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'help_workers',
      text: "*He studies you carefully* Maybe. But helpin' them means makin' enemies with IVRC. That's not a choice to make lightly. Think on it before you go playin' hero.",
      choices: [
        {
          text: "I'll consider it carefully.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'considering_helping_workers' }],
        },
      ],
    },

    // Return greeting
    {
      id: 'return_greeting',
      text: "*Pete looks up with a knowing smile* Well, well. Back for more drinks or more information? Either way, pull up a stool.",
      expression: 'friendly',
      choices: [
        {
          text: 'What news today?',
          nextNodeId: 'current_events',
        },
        {
          text: "I'm looking to buy some rumors.",
          nextNodeId: 'rumors_for_sale',
        },
        {
          text: 'Just a drink, thanks.',
          nextNodeId: 'drink_order',
        },
        {
          text: "Any work for me?",
          nextNodeId: 'opportunities',
          conditions: [{ type: 'flag_set', target: 'pete_offered_work' }],
        },
        {
          text: 'Just passing through.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'has_gold_greeting',
      text: "*Pete's eyes light up at the jingle of coins on your belt* Well now, looks like someone's doin' alright for themselves! What can old Pete do for a valued customer today?",
      expression: 'eager',
      choices: [
        {
          text: "I'm in a buying mood. What have you got?",
          nextNodeId: 'rumors_for_sale',
        },
        {
          text: 'Just the usual.',
          nextNodeId: 'return_greeting',
        },
      ],
    },
  ],
};

export const WhiskeyPeteDialogues = [WhiskeyPeteMainDialogue];
