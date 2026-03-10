import type { DialogueNode } from '../../../schemas/npc.ts';

export const samuel_ironpick_nodes_3: DialogueNode[] = [
{
      id: 'come_back',
      text: "And leave the Hollow? Leave the miners who depend on me? *He shakes his head* I can't. Not yet. But if someone could carry word between us... be the connection we've been missin'... *He looks at you* Maybe that's why Miguel sent you.",
      choices: [
        {
          text: 'I can be that connection.',
          nextNodeId: null,
          effects: [
            { type: 'set_flag', target: 'liaison_between_factions' },
            { type: 'change_reputation', value: 15 },
          ],
        },
      ],
    },
{
      id: 'time_to_use_evidence',
      text: "Maybe it is. I've been sittin' on a powder keg for five years, waitin' for the right moment. Your parent was supposed to deliver the evidence to federal authorities. They vanished before they could. *He looks at you with dawning realization* And now their child shows up carryin' the gear. Maybe the right moment is now.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_ready_to_act' }],
      choices: [
        {
          text: "Then let's not waste any more time.",
          nextNodeId: 'critical_documents',
        },
      ],
    },
{
      id: 'sheriff_sent',
      text: "*His expression darkens* Cole. *He spits to the side* He's not a bad man, but he's a lawman. And the law in these parts is IVRC's law. I've got nothin' to say to his badge.",
      choices: [
        {
          text: 'He cares about the missing miners. Same as you.',
          nextNodeId: 'cole_cares',
        },
        {
          text: "I understand your distrust. But people are dying.",
          nextNodeId: 'people_dying',
        },
      ],
    },
{
      id: 'cole_cares',
      text: "Carin' and doin' are different things. Cole can care all he wants. But when Thorne's Pinkertons show up with warrants, he steps aside like a good boy. *He pauses* Still... he did warn me about the fire, even if it was too late. I suppose that counts for somethin'.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: 'People are disappearing in the deep mines. Cole thinks you might know why.',
          nextNodeId: 'disappearance_knowledge',
        },
        {
          text: 'Maybe it is time to work together.',
          nextNodeId: 'need_unity',
        },
      ],
    },
{
      id: 'people_dying',
      text: "*He's quiet for a moment* Yeah. They are. My people, mostly. Miners who go into the deep tunnels and don't come back. *He grips his pickaxe* I've lost six this year. Good men. And the sounds from down there... they're gettin' worse.",
      choices: [
        {
          text: 'What sounds?',
          nextNodeId: 'what_machines',
        },
        {
          text: "Help me help them. What's happening down there?",
          nextNodeId: 'old_works_explanation',
        },
      ],
    },
{
      id: 'disappearance_knowledge',
      text: "*He leans in close* The miners who vanish... they go deep. Deeper than any sensible man should dig. They find tunnels that weren't dug by human hands. And they don't come back because... *He stops* Because somethin' down there doesn't want 'em to.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_confirmed_dangers' }],
      choices: [
        {
          text: 'Something? What is it?',
          nextNodeId: 'old_works_explanation',
        },
        {
          text: "You've seen it.",
          nextNodeId: 'seen_it',
        },
      ],
    },
{
      id: 'trade_offer',
      text: "*His suspicion eases slightly* Supplies, eh? We could use 'em, I won't deny that. The mountain provides ore and stone, but food, medicine, powder - those gotta come from down below. What've you got?",
      choices: [
        {
          text: 'I can get medicine from Doc Chen.',
          nextNodeId: 'doc_chen_connection',
        },
        {
          text: 'Food, tools, whatever you need. For a fair price.',
          nextNodeId: 'fair_trade',
        },
        {
          text: "I don't want payment. Consider it a gesture of goodwill.",
          nextNodeId: 'goodwill',
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },
{
      id: 'doc_chen_connection',
      text: "You know Doc Chen? *His guard drops another notch* He's been sendin' supplies through traders, but half of 'em get intercepted by IVRC patrols. If you can make the run yourself, without bein' followed... we'd be in your debt.",
      choices: [
        {
          text: "I'll make the supply run.",
          nextNodeId: null,
          effects: [
            { type: 'set_flag', target: 'supply_run_accepted' },
            { type: 'change_reputation', value: 10 },
          ],
        },
      ],
    },
{
      id: 'fair_trade',
      text: "Fair. That word don't mean what it used to. But I'll take you at face value, for now. *He gestures to the camp* We've got copper ore, silver nuggets, and mountain herbs that Doc Chen prizes. We trade straight - no company scrip, no credit. Honest weight for honest goods.",
      choices: [
        {
          text: "That's how it should be.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'goodwill',
      text: "*He stares at you, genuinely surprised* No payment. *He scratches his beard* Either you're the most generous fool I've met, or you want somethin' you ain't sayin'. *He pauses* Or maybe you're just a decent person. Been so long since I met one, I almost forgot what it looks like.",
      choices: [
        {
          text: "Decent people still exist. Even on the frontier.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'leave_peacefully',
      text: "*He watches you start to turn* Hold on. *He studies you a moment longer* Not many strangers show respect for our boundaries. Most come stormin' in demandin' this or that. *He lowers his pickaxe* You can stay. For now. But watch yourself.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: "Thank you. I'm actually looking for you - Samuel Ironpick.",
          nextNodeId: 'looking_for_samuel',
        },
        {
          text: 'I appreciate the hospitality.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'want_to_help',
      text: "*He laughs harshly* Help. Everyone wants to 'help.' Last person who said that was an IVRC spy who mapped our tunnels and nearly got us all killed. *He sobers* What makes you different?",
      choices: [
        {
          text: "I'm carrying a message from Father Miguel.",
          nextNodeId: 'miguel_remembered',
          conditions: [{ type: 'flag_set', target: 'carries_miguel_message' }],
        },
        {
          text: 'I have no love for IVRC. They burned the house on Copper Street.',
          nextNodeId: 'copper_street_response',
        },
        {
          text: "Nothing, yet. But give me a chance and I'll prove it.",
          nextNodeId: 'earn_trust',
        },
      ],
    },
{
      id: 'curious_visitor',
      text: "Speak well of me? *He snorts* The townfolk barely know I exist, and those who do think I'm a crazy old hermit. *He pauses* Unless you've been talkin' to Doc Chen or Miguel. Those two know better.",
      choices: [
        {
          text: "Doc Chen told me about your situation.",
          nextNodeId: 'doc_told_me',
        },
        {
          text: 'Sheriff Cole mentioned you.',
          nextNodeId: 'sheriff_sent',
        },
      ],
    },
{
      id: 'doc_told_me',
      text: "*He nods slowly* Chen Wei. Good man. Fixed my knee when I blew it out workin' the deep shafts. Never charged me a cent. *His eyes narrow* What exactly did he tell you?",
      choices: [
        {
          text: 'About the documents. The evidence against IVRC.',
          nextNodeId: 'proof_of_murder',
        },
        {
          text: 'That you could use help up here.',
          nextNodeId: 'earn_trust',
        },
      ],
    },
{
      id: 'dont_know_sender',
      text: "Don't know who sent it. *He turns the letter over in his hands* But the gear, the address... this was deliberate. Someone who knew about the Alliance, knew about my house, and knew enough to send you there. *He thinks hard* There's only a handful of people alive who could've written this.",
      choices: [
        {
          text: 'Who are they?',
          nextNodeId: 'who_could_write',
        },
      ],
    },
{
      id: 'who_could_write',
      text: "Me. Miguel. Doc Chen. Diamondback, maybe - she was on the edges of the Alliance. And... *He goes very quiet* ...there was one other. The person who hid the most important documents. The person who disappeared the night the Pinkertons came. Your parent.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_suspects_parent' }],
      choices: [
        {
          text: 'My parent?',
          nextNodeId: 'family_sent',
        },
      ],
    },
{
      id: 'family_sent',
      text: "*He looks at you with a mixture of wonder and grief* I should've seen it sooner. You have their look about you. The way you carry yourself. *He sits back* Your parent was the Alliance's secret weapon - the one person Thorne never identified. They hid the evidence before the raids. And now... they've sent you to finish the job.",
      onEnterEffects: [
        { type: 'change_reputation', value: 15 },
        { type: 'set_flag', target: 'samuel_confirmed_parentage' },
      ],
      choices: [
        {
          text: "Then tell me everything I need to know.",
          nextNodeId: 'critical_documents',
        },
      ],
    },
];
