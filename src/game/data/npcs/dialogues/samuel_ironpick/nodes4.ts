import type { DialogueNode } from '../../../schemas/npc.ts';

export const samuel_ironpick_nodes_4: DialogueNode[] = [
{
      id: 'freeminer_cause',
      text: "The Freeminers are what's left of honest minin' in this territory. We work claims our families staked before IVRC existed. We answer to no company, owe no debts, bow to no railroad baron. *He stands taller* We fight for the right to dig our own ground and keep what we find. That shouldn't be revolutionary, but here we are.",
      choices: [
        {
          text: 'And IVRC wants your claims.',
          nextNodeId: 'claims_connection',
        },
        {
          text: "A noble cause.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'return_greeting',
      text: "*Samuel looks up from his work* You again. *His tone is gruff but not unwelcoming* What brings you back up the mountain?",
      choices: [
        {
          text: 'I brought supplies for your people.',
          nextNodeId: 'brought_supplies',
          conditions: [{ type: 'flag_set', target: 'supply_run_accepted' }],
        },
        {
          text: "I wanted to ask about what's underground.",
          nextNodeId: 'old_works_explanation',
        },
        {
          text: 'Any word from the outside?',
          nextNodeId: 'outside_news',
        },
        {
          text: "How's the Hollow holding up?",
          nextNodeId: 'hollow_status',
        },
        {
          text: 'Just visiting.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'brought_supplies',
      text: "*He checks the packs, and something in his hard expression softens* Medicine. Bandages. Food that isn't jerky or hardtack. *He looks at you* You came through. I'll be honest - I didn't expect you would. Most talk big and never come back.",
      onEnterEffects: [{ type: 'change_reputation', value: 20 }],
      choices: [
        {
          text: "I said I would. I keep my word.",
          nextNodeId: 'keep_word_response',
        },
        {
          text: "Your people need it. It's that simple.",
          nextNodeId: 'simple_kindness',
        },
      ],
    },
{
      id: 'keep_word_response',
      text: "*He nods slowly, and for the first time, there's genuine warmth in his eyes* That you do. *He extends his hand* Samuel Ironpick. And for the first time in a long time, I'm glad to know someone new.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_trusts_player' }],
      choices: [
        {
          text: '*Shake his hand* The feeling is mutual.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'simple_kindness',
      text: "Simple. *He almost laughs* Nothin' is simple on the frontier, friend. But you make it look that way. *He claps you on the shoulder* Come on. Let me introduce you proper to the camp. You've earned it.",
      onEnterEffects: [{ type: 'set_flag', target: 'welcome_in_hollow' }],
      choices: [
        {
          text: "I'd like that.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'outside_news',
      text: "We're isolated up here. News comes slow, and usually bad. What's happenin' in town?",
      choices: [
        {
          text: 'IVRC is expanding. More enforcers, more permits.',
          nextNodeId: 'ivrc_expanding',
        },
        {
          text: "Father Miguel and Doc Chen send their regards.",
          nextNodeId: 'regards_from_friends',
        },
      ],
    },
{
      id: 'ivrc_expanding',
      text: "*He grimaces* Figured as much. They've been sendin' surveyors closer to our boundaries too. Testin' us. Seein' how far they can push before we push back. *He grips his pickaxe* One day they'll push too far.",
      choices: [
        {
          text: "Let's make sure you're ready for that day.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'regards_from_friends',
      text: "*His face softens for just a moment* Miguel and Doc Chen. *He nods* Tell 'em... tell 'em the mountain's still standin'. And so am I. *Quietly* And that I think of 'em. Both of 'em.",
      choices: [
        {
          text: "I'll pass that along.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'hollow_status',
      text: "We're survivin'. That's about all I can say. Lost two more miners last month to the deep tunnels. Food's short. Morale's... *He sighs* Well, it was bad before you showed up. Your visits help, whether I say it or not.",
      choices: [
        {
          text: "I'll keep coming. And I'll bring what I can.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'trusted_greeting',
      text: "*Samuel sees you and his weathered face breaks into a rare smile* Well I'll be. Look who's climbin' the mountain again. *He clasps your arm* Good to see you, friend. And I don't use that word lightly.",
      expression: 'warm',
      choices: [
        {
          text: 'Good to see you too, Samuel. How are things?',
          nextNodeId: 'trusted_status',
        },
        {
          text: "I have news. We need to talk.",
          nextNodeId: 'trusted_news',
        },
        {
          text: 'Ready to talk about those documents?',
          nextNodeId: 'ready_for_documents',
          conditions: [{ type: 'flag_set', target: 'samuel_trusts_player' }],
        },
      ],
    },
{
      id: 'trusted_status',
      text: "Better, thanks to you. The supplies are holdin', morale's up since word spread that we've got a friend on the outside. Maggie's been askin' about you. *He lowers his voice* And the sounds from underground... they've changed. Somethin's happenin' down there.",
      choices: [
        {
          text: 'Changed how?',
          nextNodeId: 'sounds_changed',
        },
        {
          text: 'Good. We need to move soon.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'sounds_changed',
      text: "Louder. More... organized. Used to be random humming, like a beehive deep in the earth. Now it's rhythmic. Almost like... *He struggles for words* ...like a heartbeat. A slow, metal heartbeat. The Remnant is wakin' up, friend. And IVRC's diggin' is gettin' closer to it every day.",
      expression: 'fearful',
      choices: [
        {
          text: 'Then we are running out of time.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'remnant_awakening_confirmed' }],
        },
      ],
    },
{
      id: 'trusted_news',
      text: "*He leads you to a quiet spot away from the other miners* Alright, I'm listenin'. What've you learned?",
      choices: [
        {
          text: "The mayor knows about The Old Works. She's willing to help.",
          nextNodeId: 'mayor_willing',
          conditions: [{ type: 'flag_set', target: 'mayor_secret_ally' }],
        },
        {
          text: "IVRC is accelerating their digging. We need the documents now.",
          nextNodeId: 'need_documents_now',
        },
      ],
    },
{
      id: 'mayor_willing',
      text: "*He scoffs, then catches himself* Josephine Holt. *He strokes his beard* I don't trust her. She bends to IVRC like a reed in the wind. But... if she's willin' to use her position to help... maybe that reed can be useful after all.",
      choices: [
        {
          text: "She has connections to eastern newspapers and territorial courts.",
          nextNodeId: 'mayor_connections',
        },
        {
          text: "She lost her husband to IVRC too. She understands.",
          nextNodeId: 'shared_loss',
        },
      ],
    },
{
      id: 'mayor_connections',
      text: "*His eyes widen* Newspapers. Courts. *He breathes out slowly* That's what we've been missin'. All the evidence in the world don't matter if nobody sees it. If Holt can get it in front of the right eyes... *He nods firmly* Then maybe it's time to dig those documents up.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_will_share_documents' }],
      choices: [
        {
          text: "Now you're talking.",
          nextNodeId: 'ready_for_documents',
        },
      ],
    },
{
      id: 'shared_loss',
      text: "*He's quiet for a long moment* Thomas Holt. Yeah. He was one of the good ones, even if his wife plays politics. *He sighs* Loss don't make people better or worse. It just makes 'em more of what they already are. If Josephine's still got some fight in her... maybe there's hope yet.",
      choices: [
        {
          text: 'Hope is the one thing IVRC cannot buy.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'need_documents_now',
      text: "*He nods grimly* I know. The tremors are gettin' worse. The Remnant down there... it's stirrin'. If IVRC breaks through to the main chamber before we expose 'em... *He shakes his head* We won't get another chance.",
      choices: [
        {
          text: 'Then give me the documents. I know people who can use them.',
          nextNodeId: 'ready_for_documents',
        },
      ],
    },
];
