import type { DialogueNode } from '../../../schemas/npc.ts';

export const mayor_holt_nodes_3: DialogueNode[] = [
{
      id: 'how_it_got_bad',
      text: "Gradually. First the railroad, bringing jobs. Then the company stores, undercutting local merchants. Then the water rights, bought cheap from desperate farmers. Then the enforcers, to 'protect company assets.' By the time anyone noticed the pattern, it was too late to stop it through normal channels.",
      choices: [
        {
          text: "The frog in boiling water.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'town_challenges',
      text: "Water is always the first concern - IVRC controls the main pumps. Then there's the Copperhead raids, which provoke IVRC into sending more enforcers. The mines are producing less ore each season. And the disappearances... miners going up to the Iron Mountains and never coming back.",
      choices: [
        {
          text: 'Tell me about the disappearances.',
          nextNodeId: 'mayor_disappearances',
        },
        {
          text: 'Do the Copperheads cause real damage?',
          nextNodeId: 'copperhead_damage',
        },
        {
          text: 'Sounds like a lot to manage.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'mayor_disappearances',
      text: "Miners who head into the deep mountains to work independent claims. Some say claim jumpers. Others say the mountains themselves are dangerous - unstable tunnels, flash floods. *She hesitates* There are also... stranger rumors. Things underground that aren't natural. But I don't put stock in prospector tales.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_mentioned_underground' }],
      choices: [
        {
          text: 'What kind of strange things?',
          nextNodeId: 'strange_underground',
        },
        {
          text: 'Has anyone investigated?',
          nextNodeId: 'investigation_status',
        },
      ],
    },
{
      id: 'strange_underground',
      text: "Sounds from deep in the tunnels. Lights where there shouldn't be any. One miner came back raving about metal walls underground - smooth, perfect metal, not ore or natural rock. He was half-dead from exposure and fever. Doc Chen treated him, but he left town the next day. Wouldn't say another word.",
      choices: [
        {
          text: "That's worth investigating.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'intrigued_by_underground' }],
        },
        {
          text: 'Probably just fever dreams.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'investigation_status',
      text: "Sheriff Cole wanted to send a posse, but the mountains are Freeminer territory. They don't welcome outsiders, especially ones wearing badges. And IVRC shows no interest - which is suspicious in itself. They usually jump at any excuse to expand their operations.",
      choices: [
        {
          text: "IVRC's lack of interest is telling.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'noticed_ivrc_disinterest' }],
        },
        {
          text: 'Thank you for the information.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'copperhead_damage',
      text: "They hit supply trains, rob payroll shipments, harass IVRC surveyors. Nuisance level, mostly. But each raid gives Thorne an excuse to tighten security, station more Pinkertons, restrict movement. The Copperheads think they're fighting IVRC. In truth, they're giving IVRC exactly what it wants - justification.",
      choices: [
        {
          text: 'A vicious cycle.',
          nextNodeId: null,
        },
        {
          text: "Have you tried talking to Diamondback?",
          nextNodeId: 'talking_to_diamondback',
        },
      ],
    },
{
      id: 'talking_to_diamondback',
      text: "*She scoffs* Dolores Vega doesn't talk to people she considers collaborators. And in her eyes, anyone who works within the system is a collaborator. She's not entirely wrong, which makes it harder to argue. But her methods will get this town burned to the ground.",
      choices: [
        {
          text: 'Someone needs to bridge that gap.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'land_disputes',
      text: "IVRC holds territorial land grants that they interpret... broadly. They claim mineral rights extend to any land adjacent to existing claims. Ranchers and homesteaders have been pushed off their property through legal intimidation. Those who resist find their water cut off or their credit revoked.",
      choices: [
        {
          text: "And you approve these claims as mayor?",
          nextNodeId: 'approve_claims',
        },
        {
          text: 'Is there any recourse for the displaced?',
          nextNodeId: 'recourse',
        },
      ],
    },
{
      id: 'approve_claims',
      text: "*She bristles* I process them according to territorial law. The law that IVRC's lawyers helped write. Do I approve? *She lowers her voice* No. But the alternative is losing my position to someone who would approve them enthusiastically. At least I slow the process. Add conditions. Buy time.",
      choices: [
        {
          text: 'A thin defense, but I understand.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'recourse',
      text: "Legally? The territorial courts, which are stacked with IVRC-friendly judges. Practically? The Freeminers refuse to leave their mountain claims, and so far IVRC hasn't pushed hard enough to start a shooting war. But that patience won't last forever.",
      choices: [
        {
          text: "Something has to change before it comes to that.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'railroad_presence',
      text: "The Iron Valley Railroad Company built the line that connects us to the outside world. Without it, there'd be no commerce, no mail, no medicine. *She pauses* Of course, the price of that connection is... significant. But one must be pragmatic about such things.",
      choices: [
        {
          text: 'What price, exactly?',
          nextNodeId: 'ivrc_role',
        },
        {
          text: "You sound like you're trying to convince yourself.",
          nextNodeId: 'convince_herself',
        },
        {
          text: "Progress always comes at a cost.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'convince_herself',
      text: "*Her smile falters* Perhaps I am. Every morning I look in the mirror and practice the reasons why cooperating with IVRC is necessary. Some mornings, I even believe them. *She recovers quickly* But that's the burden of leadership, isn't it? Making the choices no one else wants to make.",
      choices: [
        {
          text: 'At least you question yourself. That counts for something.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: 'Self-deception is still deception.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: -5 }],
        },
      ],
    },
{
      id: 'direct_ivrc_question',
      text: "*Her expression cools* That's a direct question. I appreciate directness, even when it's inconvenient. *She folds her hands* IVRC is the largest employer and landowner in the territory. They built the railroad, the telegraph, and most of the infrastructure. Does that mean they 'run things'? I prefer to say they're a significant stakeholder.",
      choices: [
        {
          text: "Stakeholder. That's a polite word for it.",
          nextNodeId: 'ivrc_role',
        },
        {
          text: 'And what are you? Their puppet?',
          nextNodeId: 'puppet_accusation',
          tags: ['aggressive'],
        },
        {
          text: "Fair enough. I'm sure it's complicated.",
          nextNodeId: 'town_governance',
        },
      ],
    },
{
      id: 'puppet_accusation',
      text: "*Her eyes flash dangerously* I buried my husband, raised this town from dust, and survived things that would break most men. If you think I'm anyone's puppet, you're a fool. I make compromises because the alternative is watching my people starve. Call that what you will.",
      expression: 'angry',
      onEnterEffects: [{ type: 'change_reputation', value: -15 }],
      choices: [
        {
          text: "I apologize. That was out of line.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: 'Compromises have a way of becoming surrender.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'return_greeting',
      text: "*Mayor Holt looks up from a stack of documents* Back again. I hope the town is treating you well. What can I do for you?",
      choices: [
        {
          text: 'Any news I should know about?',
          nextNodeId: 'latest_developments',
        },
        {
          text: 'I want to ask about the land disputes.',
          nextNodeId: 'land_disputes',
        },
        {
          text: "I've been hearing things about IVRC's operations.",
          nextNodeId: 'ivrc_operations_rumor',
          conditions: [{ type: 'flag_set', target: 'doc_told_about_documents' }],
        },
        {
          text: 'Just checking in.',
          nextNodeId: null,
        },
      ],
    },
];
