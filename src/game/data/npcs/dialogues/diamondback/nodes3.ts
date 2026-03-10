import type { DialogueNode } from '../../../schemas/npc.ts';

export const diamondback_nodes_3: DialogueNode[] = [
{
      id: 'alliance_talk',
      text: "Alliance implies equals. Right now, you're just a stranger with friends in low places. *She leans forward* Prove yourself. Help us with something real. Then we can talk about alliance.",
      onEnterEffects: [{ type: 'start_quest', target: 'prove_to_copperheads' }],
      choices: [
        {
          text: 'What do you need?',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'ivrc_weaknesses',
      text: "Their biggest weakness is their greed. They spread themselves thin, trying to control everything. The second is their arrogance - they think no one can touch them. Hit them where they're weak, and they panic. But hit wrong, and they bring the full force of their private army.",
      choices: [
        {
          text: 'Where would you recommend hitting?',
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
          text: 'That some call you an outlaw, others a hero.',
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
          text: 'Maybe he wishes he could join you.',
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
          text: 'A bit of both.',
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
          text: 'I want to help fight IVRC.',
          nextNodeId: 'want_to_fight',
        },
        {
          text: 'I need to find Samuel Ironpick.',
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
          text: '*Wait for developments*',
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
          text: 'What do you know about the Freeminers?',
          nextNodeId: 'freeminer_info',
        },
        {
          text: 'I should go.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'freeminer_info',
      text: "Good people, mostly. Old Samuel leads them. They work their own claims, refuse to sell to IVRC. Independent, stubborn. We share goals but disagree on methods. He won't raid trains with me, and I won't sit in the mountains waitin' to be overrun.",
      choices: [
        {
          text: 'Could you work together?',
          nextNodeId: 'freeminer_alliance',
        },
        {
          text: 'I understand.',
          nextNodeId: null,
        },
      ],
    },
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
          text: 'IVRC. Cornelius Thorne.',
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
          text: 'Lead the way.',
          nextNodeId: 'more_questions',
        },
      ],
    },
{
      id: 'dealing',
      text: "Cagey. I respect that. *She folds her arms* But I don't deal with people I don't understand. Give me something real, or this conversation ends with you walkin' back the way you came - if you're lucky.",
      choices: [
        {
          text: 'I have information that could hurt IVRC.',
          nextNodeId: 'have_info',
        },
        {
          text: 'I want to join your fight.',
          nextNodeId: 'want_to_fight',
        },
      ],
    },
{
      id: 'not_enemy',
      text: "Everyone's an enemy until proven otherwise. *She studies you* But you walked in here alone, no backup, no weapon drawn. Either you trust us, or you're too stupid to live. Which is it?",
      choices: [
        {
          text: 'I trust you. Partly.',
          nextNodeId: 'partial_trust',
        },
        {
          text: 'I calculated the risk was worth it.',
          nextNodeId: 'calculated',
        },
      ],
    },
];
