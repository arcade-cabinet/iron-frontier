/**
 * "Diamondback" Dolores Vega - Dialogue Trees
 *
 * Leader of the Copperhead Gang. Former IVRC worker turned outlaw after
 * witnessing the company's atrocities. Fierce, principled, and dangerous.
 * Potential ally against IVRC if the player earns her trust.
 */

import type { DialogueTree } from '../../schemas/npc';

export const DiamondbackMainDialogue: DialogueTree = {
  id: 'diamondback_main',
  name: 'Diamondback Dolores - Main Conversation',
  description: 'Primary dialogue tree for Diamondback Dolores',
  tags: ['rattlesnake_canyon', 'outlaw', 'faction_leader', 'copperhead'],

  entryPoints: [
    {
      nodeId: 'captured_entry',
      conditions: [{ type: 'flag_set', target: 'captured_by_copperheads' }],
      priority: 15,
    },
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'trusted_greeting',
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
    // Captured entry - player was brought to her
    {
      id: 'captured_entry',
      text: "*A striking woman with sun-weathered skin and cold eyes studies you from across the campfire. A rattlesnake tattoo coils up her neck.* So. You're the one who's been askin' questions about my gang. Either you're brave, stupid, or workin' for Thorne. Which is it?",
      expression: 'threatening',
      choices: [
        {
          text: "I'm no friend of IVRC.",
          nextNodeId: 'not_ivrc',
        },
        {
          text: "I was looking for you specifically.",
          nextNodeId: 'looking_for_you',
        },
        {
          text: "Let me go and we'll forget this happened.",
          nextNodeId: 'defiant',
        },
      ],
    },

    {
      id: 'not_ivrc',
      text: "*She leans forward* Everyone says that. The company sends spies dressed as drifters, as merchants, as lost travelers. *She pulls a knife, begins cleaning her nails* Give me one reason to believe you ain't one of 'em.",
      expression: 'suspicious',
      choices: [
        {
          text: "I received a letter with a gear symbol. I'm following it.",
          nextNodeId: 'gear_reveal',
          conditions: [{ type: 'has_item', target: 'mysterious_letter' }],
        },
        {
          text: "IVRC killed people I cared about.",
          nextNodeId: 'personal_grudge',
        },
        {
          text: "You don't have to believe me. But killing me won't help your cause.",
          nextNodeId: 'practical_argument',
        },
      ],
    },

    {
      id: 'gear_reveal',
      text: "*Her knife pauses mid-stroke. For a moment, something cracks through her hard exterior.* The gear. Where did you get that letter? *She holds out her hand* Show me.",
      expression: 'shocked',
      choices: [
        {
          text: "*Hand over the letter*",
          nextNodeId: 'letter_examination',
        },
        {
          text: "I'll show you, but I want answers first.",
          nextNodeId: 'answers_first',
        },
      ],
    },

    {
      id: 'letter_examination',
      text: "*She reads it carefully, then looks up with changed eyes* This is the old code. The worker's symbol. I thought everyone who knew it was dead or in hidin'. *She folds the letter carefully* You didn't write this. Which means someone sent for you. Someone from the old days.",
      onEnterEffects: [
        { type: 'set_flag', target: 'showed_diamondback_letter' },
        { type: 'change_reputation', value: 25 },
      ],
      choices: [
        {
          text: "What does it mean?",
          nextNodeId: 'letter_meaning',
        },
        {
          text: "Who would send such a letter?",
          nextNodeId: 'who_sent_letter',
        },
      ],
    },

    {
      id: 'letter_meaning',
      text: "It means you're connected to somethin' bigger than you know. The gear was the symbol of the first resistance - the workers who tried to organize against IVRC before Thorne crushed them. If someone's using it again... *she pauses* ...they must have good reason.",
      choices: [
        {
          text: "I want to find out who sent it.",
          nextNodeId: 'find_sender',
        },
        {
          text: "What happened to the first resistance?",
          nextNodeId: 'first_resistance',
        },
      ],
    },

    {
      id: 'find_sender',
      text: "*She hands back the letter* If I were you, I'd start with Old Samuel up in Freeminer's Hollow. He was one of the original leaders. If anyone knows who's still usin' that symbol, it'd be him. *She waves to her men* Cut 'em loose. They ain't IVRC.",
      onEnterEffects: [
        { type: 'clear_flag', target: 'captured_by_copperheads' },
        { type: 'unlock_location', target: 'freeminer_hollow' },
      ],
      choices: [
        {
          text: "Thank you. Can I ask you more questions?",
          nextNodeId: 'more_questions',
        },
        {
          text: "I'll find Samuel.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'first_resistance',
      text: "Thorne called 'em 'agitators.' They called themselves the Worker's Coalition. Tried to get fair wages, safer conditions. Thorne's answer was to burn their meeting halls, arrest their leaders, and blacklist anyone who'd spoken up. Some died. Some disappeared. The rest scattered.",
      expression: 'bitter',
      choices: [
        {
          text: "That's why you fight.",
          nextNodeId: 'why_fight',
        },
        {
          text: "And you formed the Copperheads from the survivors?",
          nextNodeId: 'copperhead_origin',
        },
      ],
    },

    {
      id: 'why_fight',
      text: "I fight because words failed. Petitions failed. The law failed. When peaceful means are crushed, what's left? *She spreads her hands* IVRC understands one thing: money. I take their money. It's the only language they speak.",
      choices: [
        {
          text: "Violence breeds violence.",
          nextNodeId: 'violence_debate',
        },
        {
          text: "Sometimes that's what it takes.",
          nextNodeId: 'agree_violence',
        },
      ],
    },

    {
      id: 'violence_debate',
      text: "You think I don't know that? *Her voice hardens* Every raid, every bullet - it weighs on me. But so do the faces of the miners who die in cave-ins while Thorne counts his gold. There's violence either way. At least mine has a purpose.",
      choices: [
        {
          text: "Is there no other way?",
          nextNodeId: 'other_way',
        },
        {
          text: "I understand your position.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'other_way',
      text: "*She stares into the fire* If there is, I ain't found it. The Freeminers hide in the mountains. Father Miguel prays for change. Doc Chen patches up the wounded. But nothing changes. IVRC grows stronger each year. Someone has to strike back.",
      choices: [
        {
          text: "Maybe the right evidence could change things.",
          nextNodeId: 'evidence_idea',
        },
        {
          text: "I hope you find that other way someday.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'evidence_idea',
      text: "*Her eyes narrow with interest* Evidence? You mean proof of their crimes? *She laughs bitterly* We all know their crimes. The problem is makin' anyone care. Thorne owns the judges, the newspapers, the politicians...",
      choices: [
        {
          text: "But there might be documents. Hidden records.",
          nextNodeId: 'documents_hint',
        },
      ],
    },

    {
      id: 'documents_hint',
      text: "*She stands abruptly* The Ironpick documents. Old Samuel mentioned them once. Proof that IVRC bribed safety inspectors, covered up deaths, stole land. If those still exist... *She turns to face you* Find them. Bring them to light. Maybe then my way won't be the only way.",
      onEnterEffects: [
        { type: 'set_flag', target: 'diamondback_wants_documents' },
        { type: 'start_quest', target: 'find_ironpick_documents' },
      ],
      choices: [
        {
          text: "I'll try.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 20 }],
        },
      ],
    },

    {
      id: 'agree_violence',
      text: "*She nods slowly* You understand. Not everyone does. *She signals to her men* This one's alright. Get 'em some food and water. We can talk more when they've rested.",
      onEnterEffects: [
        { type: 'change_reputation', value: 15 },
        { type: 'clear_flag', target: 'captured_by_copperheads' },
      ],
      choices: [
        {
          text: "Thank you.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'copperhead_origin',
      text: "Formed it from scratch. People who had nothin' left to lose. Former miners, ranchers who lost their land, workers blacklisted for speakin' up. We ain't saints, but we ain't devils neither. We hit IVRC where it hurts and share what we take with those who need it.",
      choices: [
        {
          text: "Robin Hood of the frontier.",
          nextNodeId: 'robin_hood',
        },
        {
          text: "How many are you?",
          nextNodeId: 'gang_numbers',
        },
      ],
    },

    {
      id: 'robin_hood',
      text: "*She smirks* Somethin' like that. Though I ain't much for fancy tales. The reality is dirtier. We kill when we have to. We steal because we need to. But every coin we take from IVRC is one less they can use to crush people.",
      choices: [
        {
          text: "The ends justify the means?",
          nextNodeId: 'ends_means',
        },
      ],
    },

    {
      id: 'ends_means',
      text: "Don't lecture me about morality. IVRC works men to death in the mines and calls it 'employment.' They poison the water and call it 'progress.' At least I'm honest about what I am. Can Thorne say the same?",
      choices: [
        {
          text: "You have a point.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'gang_numbers',
      text: "Enough to cause trouble. Not enough to win a war. *She shrugs* We raid, we disappear, we survive. That's the best we can do for now. IVRC's got Pinkertons, private armies, endless money. We've got determination and knowledge of the land.",
      choices: [
        {
          text: "Could the Freeminers help?",
          nextNodeId: 'freeminer_alliance',
        },
        {
          text: "I see.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'freeminer_alliance',
      text: "Old Samuel and I don't see eye to eye. He thinks violence makes us no better than IVRC. I think his peaceful resistance will get everyone killed. *She sighs* But if there was something that could unite us... something worth fighting for together...",
      onEnterEffects: [{ type: 'set_flag', target: 'diamondback_open_to_alliance' }],
      choices: [
        {
          text: "Like the documents?",
          nextNodeId: 'documents_alliance',
        },
      ],
    },

    {
      id: 'documents_alliance',
      text: "Maybe. Proof that could actually bring IVRC down legally... that'd be worth putting aside differences for. But those documents are just a rumor at this point. Someone would need to find them, verify they're real, get them to people who matter.",
      choices: [
        {
          text: "I might be that someone.",
          nextNodeId: 'volunteer',
        },
      ],
    },

    {
      id: 'volunteer',
      text: "*She studies you for a long moment* You might be. Fresh face, no faction ties, that letter in your pocket... *She nods slowly* Alright. You want to help? Start by earning Samuel's trust. Find those documents. Then we'll talk about what comes next.",
      onEnterEffects: [
        { type: 'set_flag', target: 'diamondback_ally' },
        { type: 'change_reputation', value: 25 },
      ],
      choices: [
        {
          text: "You'll hear from me.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'who_sent_letter',
      text: "Could be any of the old guard who survived. Problem is, most of 'em are dead, disappeared, or hidin' so deep they might as well be ghosts. But if I had to guess... *she thinks* ...Samuel Ironpick would know. He kept records of everyone in the movement.",
      choices: [
        {
          text: "Where can I find him?",
          nextNodeId: 'samuel_location',
        },
      ],
    },

    {
      id: 'samuel_location',
      text: "Freeminer's Hollow, up in the Iron Mountains. He don't trust strangers - don't blame him after what happened - but show him that letter and he'll at least hear you out. Tell him Dolores sends her regards... for what that's worth.",
      onEnterEffects: [{ type: 'unlock_location', target: 'freeminer_hollow' }],
      choices: [
        {
          text: "Thank you, Diamondback.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'answers_first',
      text: "*She laughs - a harsh, humorless sound* You're in no position to make demands. But I respect the nerve. *She leans back* Fine. One question. Then you show me that letter.",
      choices: [
        {
          text: "Why did you turn against IVRC?",
          nextNodeId: 'origin_story',
        },
        {
          text: "What happened to the workers' movement?",
          nextNodeId: 'movement_history',
        },
      ],
    },

    {
      id: 'origin_story',
      text: "I worked for 'em. Telegraph operator at Junction City. Saw the messages that passed through - the orders to crush strikes, the bribes to officials, the cover-ups of mine deaths. When I tried to blow the whistle, they tried to bury me with the dead. *Her eyes go cold* I decided to bury them instead.",
      onEnterEffects: [{ type: 'set_flag', target: 'heard_diamondback_story' }],
      choices: [
        {
          text: "*Show her the letter*",
          nextNodeId: 'letter_examination',
        },
      ],
    },

    {
      id: 'movement_history',
      text: "Crushed. Thorne's men came in the night, burned meeting halls, arrested leaders on fake charges. Some were hanged as 'agitators.' Others vanished into IVRC's private prisons. The lucky ones scattered to the mountains or changed their names.",
      choices: [
        {
          text: "*Show her the letter*",
          nextNodeId: 'letter_examination',
        },
      ],
    },

    {
      id: 'personal_grudge',
      text: "*Her expression softens, just slightly* That makes two of us. IVRC takes and takes, and never answers for it. *She sheathes her knife* Tell me what happened.",
      choices: [
        {
          text: "My family lost everything to their land grabs.",
          nextNodeId: 'land_grab_story',
        },
        {
          text: "Someone close to me died in their mines.",
          nextNodeId: 'mine_death_story',
        },
        {
          text: "I'd rather not say. Just know I have reason.",
          nextNodeId: 'private_reason',
        },
      ],
    },

    {
      id: 'land_grab_story',
      text: "*She nods grimly* Seen it a hundred times. IVRC wants land, they take it. Legal papers don't mean nothin' when you've got lawyers on retainer and sheriffs in your pocket. *She gestures* Sit. You ain't our enemy. Let's talk.",
      onEnterEffects: [
        { type: 'clear_flag', target: 'captured_by_copperheads' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: "Thank you.",
          nextNodeId: 'more_questions',
        },
      ],
    },

    {
      id: 'mine_death_story',
      text: "*Her jaw tightens* The mines. Thorne's money pit, fed by bodies. How many good people have I met with that same story? *She waves to her men* Release 'em. This one knows our pain.",
      onEnterEffects: [
        { type: 'clear_flag', target: 'captured_by_copperheads' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: "I want to make them pay.",
          nextNodeId: 'make_them_pay',
        },
      ],
    },

    {
      id: 'make_them_pay',
      text: "Then you're in the right place. We hit IVRC where it hurts - their shipments, their payrolls, their pride. It ain't justice in the legal sense, but it's the only kind we can get. You want in?",
      choices: [
        {
          text: "I'm in.",
          nextNodeId: 'join_copperheads',
        },
        {
          text: "Maybe there's another way to hurt them.",
          nextNodeId: 'other_way',
        },
      ],
    },

    {
      id: 'join_copperheads',
      text: "*She extends a calloused hand* Then welcome to the Copperheads. We'll start you on small jobs, see what you're made of. Prove yourself, and you'll be family. Betray us... *her grip tightens* ...well, don't betray us.",
      onEnterEffects: [
        { type: 'set_flag', target: 'copperhead_member' },
        { type: 'change_reputation', value: 30 },
      ],
      choices: [
        {
          text: "I won't.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'private_reason',
      text: "Fair enough. We all got ghosts. *She studies you* Long as those ghosts point you toward IVRC and not toward us, we can work together. Sit down. I'll tell you what we're about.",
      onEnterEffects: [
        { type: 'clear_flag', target: 'captured_by_copperheads' },
        { type: 'change_reputation', value: 10 },
      ],
      choices: [
        {
          text: "I'd like to hear it.",
          nextNodeId: 'copperhead_mission',
        },
      ],
    },

    {
      id: 'copperhead_mission',
      text: "We take from IVRC. Money, supplies, weapons. Whatever hurts their operations. We share with the folks they've ground down - miners' families, displaced ranchers, anyone blacklisted for standin' up. It ain't legal, but neither is what they do.",
      choices: [
        {
          text: "How can I help?",
          nextNodeId: 'help_copperheads',
        },
        {
          text: "I'll think about it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'help_copperheads',
      text: "First, you help yourself. Go find what you came here for - whoever sent that letter has plans for you. Once you know more, come back. We'll find work that fits your talents.",
      choices: [
        {
          text: "I'll return when I know more.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'practical_argument',
      text: "*She pauses, then laughs* Got some stones, don't you? *She sheathes the knife* Fine. You're right - bodies attract attention, and attention's the last thing we need right now. But you're not leavin' til you prove you're not a threat.",
      choices: [
        {
          text: "What do you need?",
          nextNodeId: 'prove_yourself',
        },
      ],
    },

    {
      id: 'prove_yourself',
      text: "Information. IVRC's got a supply run coming through Dry Creek Valley in three days. You tell me the route, the guards, the cargo - then maybe I believe you ain't one of Thorne's little birds.",
      choices: [
        {
          text: "I don't have that information.",
          nextNodeId: 'no_info',
        },
        {
          text: "And if I could get it?",
          nextNodeId: 'get_info',
        },
      ],
    },

    {
      id: 'no_info',
      text: "Then we got a problem. *She shrugs* Sit tight. My scouts'll check you out. If you're clean, we talk. If not... *she doesn't finish the sentence*",
      choices: [
        {
          text: "I have nothing to hide.",
          nextNodeId: 'waiting',
        },
      ],
    },

    {
      id: 'waiting',
      text: "We'll see about that.",
      nextNodeId: null,
    },

    {
      id: 'get_info',
      text: "*Her eyebrows rise* Now we're talkin'. You bring me that information, and you've got yourself an ally. Maybe more. The Copperheads remember who helps us.",
      onEnterEffects: [
        { type: 'start_quest', target: 'scout_ivrc_supply' },
        { type: 'clear_flag', target: 'captured_by_copperheads' },
      ],
      choices: [
        {
          text: "Consider it done.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'looking_for_you',
      text: "*She rises, hand on her gun* That's either very brave or very stupid. What business would a stranger have with me?",
      expression: 'threatening',
      choices: [
        {
          text: "I want to help fight IVRC.",
          nextNodeId: 'want_to_fight',
        },
        {
          text: "I have information you might want.",
          nextNodeId: 'have_info',
        },
        {
          text: "Someone told me to find you.",
          nextNodeId: 'someone_sent',
        },
      ],
    },

    {
      id: 'want_to_fight',
      text: "Plenty of people want to fight. Most of 'em get themselves killed or worse - get my people killed. *She circles you* What makes you different?",
      choices: [
        {
          text: "I've got nothing left to lose.",
          nextNodeId: 'nothing_to_lose',
        },
        {
          text: "I have skills you can use.",
          nextNodeId: 'skills',
        },
      ],
    },

    {
      id: 'nothing_to_lose',
      text: "*Something flickers in her eyes - recognition, perhaps* That's a dangerous place to be. But also... *she nods slowly* ...useful. People with nothin' to lose fight harder than those protectin' somethin'.",
      choices: [
        {
          text: "Then let me fight with you.",
          nextNodeId: 'join_copperheads',
        },
      ],
    },

    {
      id: 'skills',
      text: "What kind of skills? I got fighters, trackers, even a few who can read railroad schedules. What do you bring that I don't already have?",
      choices: [
        {
          text: "I'm good at getting into places I shouldn't be.",
          nextNodeId: 'infiltrator',
        },
        {
          text: "I know how to talk my way out of trouble.",
          nextNodeId: 'smooth_talker',
        },
      ],
    },

    {
      id: 'infiltrator',
      text: "*She grins - the first real smile she's shown* Now that's useful. IVRC's got guards everywhere, but guards can be bypassed. You prove you can get in and out of somewhere difficult, and you've got yourself a job.",
      onEnterEffects: [{ type: 'start_quest', target: 'prove_infiltration' }],
      choices: [
        {
          text: "Name the target.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'smooth_talker',
      text: "Talk's cheap on the frontier. But... *she considers* ...we could use someone who can get close to IVRC's people. Learn their plans, sow confusion. You'd be at risk, though. Thorne's people ain't stupid.",
      onEnterEffects: [{ type: 'start_quest', target: 'prove_smooth_talk' }],
      choices: [
        {
          text: "I can handle it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'have_info',
      text: "*She gestures to her men to lower their weapons* I'm listening. Make it good.",
      choices: [
        {
          text: "IVRC's sending a VIP through the territory. Victoria Ashworth.",
          nextNodeId: 'ashworth_info',
          conditions: [{ type: 'flag_set', target: 'warned_about_ashworth' }],
        },
        {
          text: "There are documents that could destroy IVRC. I know where to look.",
          nextNodeId: 'documents_hint',
          conditions: [{ type: 'flag_set', target: 'seeking_ironpick_docs' }],
        },
        {
          text: "Actually, I'm still gathering information.",
          nextNodeId: 'bluffing',
        },
      ],
    },

    {
      id: 'ashworth_info',
      text: "*Her eyes widen* Ashworth? Thorne's right hand? *She grabs your shoulder* When? Where? This could change everything.",
      onEnterEffects: [{ type: 'change_reputation', value: 25 }],
      choices: [
        {
          text: "I don't know the details yet, but she's coming.",
          nextNodeId: 'ashworth_limited',
        },
      ],
    },

    {
      id: 'ashworth_limited',
      text: "Find out more. I don't care how. Ashworth's the key to Thorne's operations in this territory. If we could get to her... *she trails off, scheming* ...come back when you know more. You've just become very valuable to me.",
      onEnterEffects: [
        { type: 'start_quest', target: 'track_ashworth' },
        { type: 'clear_flag', target: 'captured_by_copperheads' },
      ],
      choices: [
        {
          text: "I'll be in touch.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'bluffing',
      text: "*Her face hardens* Wasting my time ain't healthy, stranger. You've got one more chance to prove you're worth somethin'. Otherwise... *she leaves the threat hanging*",
      onEnterEffects: [{ type: 'change_reputation', value: -15 }],
      choices: [
        {
          text: "I can get you what you need. Just give me time.",
          nextNodeId: 'ask_for_time',
        },
      ],
    },

    {
      id: 'ask_for_time',
      text: "Time's the one thing I ain't got much of. *She waves dismissively* Get out of here. Come back when you've got somethin' real.",
      onEnterEffects: [{ type: 'clear_flag', target: 'captured_by_copperheads' }],
      choices: [
        {
          text: "*Leave*",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'someone_sent',
      text: "Who? And why would anyone send a stranger to me?",
      choices: [
        {
          text: "Doc Chen mentioned your name.",
          nextNodeId: 'doc_mention',
          conditions: [{ type: 'talked_to', target: 'doc_chen' }],
        },
        {
          text: "Sheriff Cole... in a roundabout way.",
          nextNodeId: 'sheriff_mention',
          conditions: [{ type: 'talked_to', target: 'sheriff_cole' }],
        },
        {
          text: "Someone who trusted I could help your cause.",
          nextNodeId: 'vague_sender',
        },
      ],
    },

    {
      id: 'doc_mention',
      text: "*She relaxes slightly* Doc's a good man. Patches up my people without askin' too many questions. If he trusts you... *she nods* ...that counts for somethin'. What did he say about me?",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: "That you fight IVRC because words failed.",
          nextNodeId: 'doc_understanding',
        },
      ],
    },

    {
      id: 'doc_understanding',
      text: "He understands. Better than most. *She sits back down* Alright. You've got my attention. What do you want from the Copperheads?",
      choices: [
        {
          text: "An alliance. Or at least cooperation.",
          nextNodeId: 'alliance_talk',
        },
        {
          text: "Information. About IVRC's weaknesses.",
          nextNodeId: 'ivrc_weaknesses',
        },
      ],
    },

    {
      id: 'alliance_talk',
      text: "Alliance implies equals. Right now, you're just a stranger with friends in low places. *She leans forward* Prove yourself. Help us with something real. Then we can talk about alliance.",
      onEnterEffects: [{ type: 'start_quest', target: 'prove_to_copperheads' }],
      choices: [
        {
          text: "What do you need?",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ivrc_weaknesses',
      text: "Their biggest weakness is their greed. They spread themselves thin, trying to control everything. The second is their arrogance - they think no one can touch them. Hit them where they're weak, and they panic. But hit wrong, and they bring the full force of their private army.",
      choices: [
        {
          text: "Where would you recommend hitting?",
          nextNodeId: 'target_recommendation',
        },
      ],
    },

    {
      id: 'target_recommendation',
      text: "Their supply lines. They can't operate without equipment, food, ammunition for their guards. Disrupt those, and the whole machine slows down. But they're well-protected. You'd need good intel, good timing, and a bit of luck.",
      choices: [
        {
          text: "Thank you. That's useful.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'sheriff_mention',
      text: "*She laughs harshly* Cole sent you? That's rich. Man's so tangled between duty and conscience, I'm surprised he can walk straight. What'd he say about me?",
      choices: [
        {
          text: "That you're a problem he can't solve.",
          nextNodeId: 'problem_response',
        },
        {
          text: "That some call you an outlaw, others a hero.",
          nextNodeId: 'hero_outlaw',
        },
      ],
    },

    {
      id: 'problem_response',
      text: "*She grins* He ain't wrong. But neither am I. Cole knows what's right - he just can't do anythin' about it with that badge on his chest. Sometimes I think he's jealous of my freedom.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: "Maybe he wishes he could join you.",
          nextNodeId: 'cole_join',
        },
      ],
    },

    {
      id: 'cole_join',
      text: "Part of him, maybe. But Cole believes in the law, even when the law fails. It's noble. Foolish, but noble. *She shrugs* We fight different battles toward the same end. Someday, one of us might win.",
      choices: [
        {
          text: "I hope it's soon.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'hero_outlaw',
      text: "Depends on whether IVRC's stolen from you yet. *Her face hardens* I've never robbed a poor man, never hurt someone who didn't shoot first. Can Thorne's 'legitimate' business say the same?",
      choices: [
        {
          text: "No. They can't.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'vague_sender',
      text: "*She studies you skeptically* Mighty vague. But you're here, and you ain't dead yet. That's either luck or skill. Which is it?",
      choices: [
        {
          text: "A bit of both.",
          nextNodeId: 'bit_of_both',
        },
      ],
    },

    {
      id: 'bit_of_both',
      text: "Honest answer. *She waves to her people* Stand down. This one's not a threat. *To you* You want to talk to me, you've got five minutes. Make 'em count.",
      onEnterEffects: [{ type: 'clear_flag', target: 'captured_by_copperheads' }],
      choices: [
        {
          text: "I want to help fight IVRC.",
          nextNodeId: 'want_to_fight',
        },
        {
          text: "I need to find Samuel Ironpick.",
          nextNodeId: 'find_samuel',
        },
      ],
    },

    {
      id: 'find_samuel',
      text: "Old Samuel? *She softens slightly* He's a good man. Stubborn as the mountain rock, but good. He's up at Freeminer's Hollow. Tell him Dolores sent you... though fair warning, he might not care.",
      onEnterEffects: [{ type: 'unlock_location', target: 'freeminer_hollow' }],
      choices: [
        {
          text: "Why wouldn't he care?",
          nextNodeId: 'samuel_dolores',
        },
      ],
    },

    {
      id: 'samuel_dolores',
      text: "We had... disagreements. He wanted peaceful resistance. I wanted action. Both of us lost people we cared about. Now we barely speak. *She shakes her head* Maybe you can bridge what I couldn't. Stranger things have happened.",
      choices: [
        {
          text: "I'll try.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'defiant',
      text: "*She laughs coldly* Bold. But out here, bold gets you buried. *She nods to her men* Keep 'em comfortable but contained. We'll see who comes lookin' for this one.",
      choices: [
        {
          text: "*Wait for developments*",
          nextNodeId: 'waiting',
        },
      ],
    },

    {
      id: 'more_questions',
      text: "Ask away. But don't push your luck.",
      choices: [
        {
          text: "What's your history with IVRC?",
          nextNodeId: 'origin_story',
        },
        {
          text: "What do you know about the Freeminers?",
          nextNodeId: 'freeminer_info',
        },
        {
          text: "I should go.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'freeminer_info',
      text: "Good people, mostly. Old Samuel leads them. They work their own claims, refuse to sell to IVRC. Independent, stubborn. We share goals but disagree on methods. He won't raid trains with me, and I won't sit in the mountains waitin' to be overrun.",
      choices: [
        {
          text: "Could you work together?",
          nextNodeId: 'freeminer_alliance',
        },
        {
          text: "I understand.",
          nextNodeId: null,
        },
      ],
    },

    // First meeting - voluntary arrival
    {
      id: 'first_meeting',
      text: "*A woman with sun-darkened skin and a coiled rattlesnake tattoo on her neck steps from the shadows. Her hand rests on a worn pistol.* You've got sand, comin' to Rattlesnake Canyon on your own. Most folks only come here at gunpoint. So which are you - brave, or suicidal?",
      expression: 'suspicious',
      choices: [
        {
          text: "I'm looking for Diamondback Dolores.",
          nextNodeId: 'looking_for_you',
        },
        {
          text: "Neither. I've got business that concerns us both.",
          nextNodeId: 'business',
        },
        {
          text: "Maybe both. But I'm not your enemy.",
          nextNodeId: 'not_enemy',
        },
      ],
    },

    {
      id: 'business',
      text: "*She tilts her head* Business. I like business. *She steps closer* But out here, business means profit, and profit means someone loses. Who's losing if you win?",
      choices: [
        {
          text: "IVRC. Cornelius Thorne.",
          nextNodeId: 'thorne_business',
        },
        {
          text: "That depends on who's willing to deal.",
          nextNodeId: 'dealing',
        },
      ],
    },

    {
      id: 'thorne_business',
      text: "*Her eyes light up with dangerous interest* Now that's the kind of business I like. *She waves off her guards* Let's talk somewhere private. You've earned yourself a conversation.",
      onEnterEffects: [{ type: 'change_reputation', value: 15 }],
      choices: [
        {
          text: "Lead the way.",
          nextNodeId: 'more_questions',
        },
      ],
    },

    {
      id: 'dealing',
      text: "Cagey. I respect that. *She folds her arms* But I don't deal with people I don't understand. Give me something real, or this conversation ends with you walkin' back the way you came - if you're lucky.",
      choices: [
        {
          text: "I have information that could hurt IVRC.",
          nextNodeId: 'have_info',
        },
        {
          text: "I want to join your fight.",
          nextNodeId: 'want_to_fight',
        },
      ],
    },

    {
      id: 'not_enemy',
      text: "Everyone's an enemy until proven otherwise. *She studies you* But you walked in here alone, no backup, no weapon drawn. Either you trust us, or you're too stupid to live. Which is it?",
      choices: [
        {
          text: "I trust you. Partly.",
          nextNodeId: 'partial_trust',
        },
        {
          text: "I calculated the risk was worth it.",
          nextNodeId: 'calculated',
        },
      ],
    },

    {
      id: 'partial_trust',
      text: "*She almost smiles* Partial trust. That's honest, at least. Most people either lie about trusting completely or lie about not trusting at all. *She nods* Alright. You've got my attention. Talk.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: "I want to fight IVRC.",
          nextNodeId: 'want_to_fight',
        },
        {
          text: "I'm looking for information about the gear symbol.",
          nextNodeId: 'gear_question',
        },
      ],
    },

    {
      id: 'calculated',
      text: "Cold. I like cold. *She gestures toward the camp* Come on. Anyone stupid enough to walk into a outlaw camp alone deserves to at least hear what we're about before dyin'.",
      choices: [
        {
          text: "I appreciate the hospitality.",
          nextNodeId: 'copperhead_mission',
        },
      ],
    },

    {
      id: 'gear_question',
      text: "*She goes very still* Where did you hear about that symbol?",
      expression: 'serious',
      choices: [
        {
          text: "I have a letter marked with it.",
          nextNodeId: 'gear_reveal',
          conditions: [{ type: 'has_item', target: 'mysterious_letter' }],
        },
        {
          text: "Doc Chen mentioned it.",
          nextNodeId: 'doc_gear_mention',
        },
      ],
    },

    {
      id: 'doc_gear_mention',
      text: "Doc's got a long memory. *She relaxes slightly* The gear was the workers' symbol, back when there was still hope of peaceful change. IVRC destroyed that hope. Now the symbol's just a ghost... unless someone's tryin' to resurrect it.",
      choices: [
        {
          text: "Maybe someone is.",
          nextNodeId: 'resurrection',
        },
      ],
    },

    {
      id: 'resurrection',
      text: "*She studies you intently* If that's true... it changes things. The old guard, the Freeminers, even my people - we could unite under that symbol. But it would take something real. Proof that IVRC can be beaten.",
      choices: [
        {
          text: "Like the Ironpick documents?",
          nextNodeId: 'documents_alliance',
        },
        {
          text: "Like a decisive strike against their operations?",
          nextNodeId: 'decisive_strike',
        },
      ],
    },

    {
      id: 'decisive_strike',
      text: "Blood gets attention, but it don't change laws. *She shakes her head* If you want to really hurt IVRC, you need to expose 'em. Make even their bought politicians distance themselves. Violence just makes martyrs - theirs and ours.",
      choices: [
        {
          text: "The documents, then.",
          nextNodeId: 'documents_alliance',
        },
      ],
    },

    // Trusted greeting
    {
      id: 'trusted_greeting',
      text: "*Diamondback rises from her seat with something approaching a smile* Look who's back. My people say you've been busy. Causin' trouble for IVRC, from what I hear. That sits well with me.",
      expression: 'friendly',
      choices: [
        {
          text: "Just doing what needs done.",
          nextNodeId: 'humble_response',
        },
        {
          text: "Any news from your end?",
          nextNodeId: 'copperhead_news',
        },
        {
          text: "I may have a lead on those documents.",
          nextNodeId: 'documents_lead',
          conditions: [{ type: 'flag_set', target: 'found_document_clue' }],
        },
      ],
    },

    {
      id: 'humble_response',
      text: "Humble too. Don't see that often in this line of work. *She claps your shoulder* Keep it up. You're makin' friends in the right places and enemies in the right places. That's the sign of someone who knows what they're doin'.",
      choices: [
        {
          text: "What's our next move?",
          nextNodeId: 'next_move',
        },
      ],
    },

    {
      id: 'next_move',
      text: "IVRC's bringin' in more enforcers. Victoria Ashworth's supposed to be somewhere in the territory now. Things are heatin' up. We need to be ready for whatever comes.",
      choices: [
        {
          text: "I'll keep my eyes open.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'copperhead_news',
      text: "Same old dance. We hit a supply wagon last week - nothin' major, but it'll keep us fed. IVRC's bringin' in more guards from the east. And there's talk of Victoria Ashworth herself comin' to 'clean up' the territory. Means they're scared.",
      choices: [
        {
          text: "Scared is good.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'documents_lead',
      text: "*She straightens immediately* You found somethin'? Tell me everything.",
      expression: 'eager',
      choices: [
        {
          text: "Samuel Ironpick has them hidden. I know where.",
          nextNodeId: 'documents_location',
        },
        {
          text: "I'm close. Need a bit more time.",
          nextNodeId: 'documents_patience',
        },
      ],
    },

    {
      id: 'documents_location',
      text: "*She grabs your arm* Then we go get them. Now. Before IVRC realizes someone's close. My people can provide cover if needed.",
      onEnterEffects: [{ type: 'start_quest', target: 'retrieve_documents' }],
      choices: [
        {
          text: "This needs to be quiet. Too many people will spook Samuel.",
          nextNodeId: 'quiet_approach',
        },
        {
          text: "Backup would be good. Just in case.",
          nextNodeId: 'backup_approach',
        },
      ],
    },

    {
      id: 'quiet_approach',
      text: "*She nods reluctantly* You know the old man better than I do. But the moment things go wrong, you send word. The Copperheads'll ride.",
      choices: [
        {
          text: "I'll get it done.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'backup_approach',
      text: "Silent Pete and two others'll shadow you. Stay out of sight unless needed. *She grins* Go get those documents. This could change everything.",
      onEnterEffects: [{ type: 'set_flag', target: 'copperhead_backup' }],
      choices: [
        {
          text: "Let's do this.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'documents_patience',
      text: "*She forces herself to sit back down* Alright. But don't take too long. Every day those documents stay hidden is another day IVRC gets stronger. Find 'em, and find 'em fast.",
      choices: [
        {
          text: "I won't let you down.",
          nextNodeId: null,
        },
      ],
    },

    // Return greeting
    {
      id: 'return_greeting',
      text: "*Diamondback looks up from a map spread across a makeshift table* Back again. Got news, or just lookin' for trouble?",
      choices: [
        {
          text: "Checking in. What's the situation?",
          nextNodeId: 'situation_update',
        },
        {
          text: "I might have a lead.",
          nextNodeId: 'lead_check',
        },
        {
          text: "Just passing through.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'situation_update',
      text: "IVRC's got the railroad locked down tighter than a drum. Harder to hit their shipments now. But they can't guard everything. We're still findin' soft spots. Just takes more planning.",
      choices: [
        {
          text: "Anything I can help with?",
          nextNodeId: 'help_request',
        },
        {
          text: "Stay safe out there.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'help_request',
      text: "There's always somethin'. But right now, the best thing you can do is keep workin' on whatever brought you here. The documents, Samuel, the gear symbol - that's the long game. We'll handle the short game.",
      choices: [
        {
          text: "Understood.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'lead_check',
      text: "A lead on what? The documents? Victoria Ashworth? I'm all ears.",
      choices: [
        {
          text: "Still working on it. Nothing solid yet.",
          nextNodeId: 'keep_working',
        },
      ],
    },

    {
      id: 'keep_working',
      text: "Then keep working. Every piece of the puzzle matters. When you've got somethin' solid, you know where to find me.",
      choices: [
        {
          text: "I'll be back.",
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const DiamondbackDialogues = [DiamondbackMainDialogue];
