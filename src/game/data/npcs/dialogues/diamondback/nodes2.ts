import type { DialogueNode } from '../../../schemas/npc.ts';

export const diamondback_nodes_2: DialogueNode[] = [
{
      id: 'prove_yourself',
      text: "Information. IVRC's got a supply run coming through Dry Creek Valley in three days. You tell me the route, the guards, the cargo - then maybe I believe you ain't one of Thorne's little birds.",
      choices: [
        {
          text: "I don't have that information.",
          nextNodeId: 'no_info',
        },
        {
          text: 'And if I could get it?',
          nextNodeId: 'get_info',
        },
      ],
    },
{
      id: 'no_info',
      text: "Then we got a problem. *She shrugs* Sit tight. My scouts'll check you out. If you're clean, we talk. If not... *she doesn't finish the sentence*",
      choices: [
        {
          text: 'I have nothing to hide.',
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
          text: 'Consider it done.',
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
          text: 'I want to help fight IVRC.',
          nextNodeId: 'want_to_fight',
        },
        {
          text: 'I have information you might want.',
          nextNodeId: 'have_info',
        },
        {
          text: 'Someone told me to find you.',
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
          text: 'I have skills you can use.',
          nextNodeId: 'skills',
        },
      ],
    },
{
      id: 'nothing_to_lose',
      text: "*Something flickers in her eyes - recognition, perhaps* That's a dangerous place to be. But also... *she nods slowly* ...useful. People with nothin' to lose fight harder than those protectin' somethin'.",
      choices: [
        {
          text: 'Then let me fight with you.',
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
          text: 'I know how to talk my way out of trouble.',
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
          text: 'Name the target.',
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
          text: 'I can handle it.',
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
          text: 'There are documents that could destroy IVRC. I know where to look.',
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
          text: 'I can get you what you need. Just give me time.',
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
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'someone_sent',
      text: 'Who? And why would anyone send a stranger to me?',
      choices: [
        {
          text: 'Doc Chen mentioned your name.',
          nextNodeId: 'doc_mention',
          conditions: [{ type: 'talked_to', target: 'doc_chen' }],
        },
        {
          text: 'Sheriff Cole... in a roundabout way.',
          nextNodeId: 'sheriff_mention',
          conditions: [{ type: 'talked_to', target: 'sheriff_cole' }],
        },
        {
          text: 'Someone who trusted I could help your cause.',
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
          text: 'That you fight IVRC because words failed.',
          nextNodeId: 'doc_understanding',
        },
      ],
    },
{
      id: 'doc_understanding',
      text: "He understands. Better than most. *She sits back down* Alright. You've got my attention. What do you want from the Copperheads?",
      choices: [
        {
          text: 'An alliance. Or at least cooperation.',
          nextNodeId: 'alliance_talk',
        },
        {
          text: "Information. About IVRC's weaknesses.",
          nextNodeId: 'ivrc_weaknesses',
        },
      ],
    },
];
