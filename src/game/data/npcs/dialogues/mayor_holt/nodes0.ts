import type { DialogueNode } from '../../../schemas/npc.ts';

export const mayor_holt_nodes_0: DialogueNode[] = [
{
      id: 'first_meeting',
      text: "*A composed woman in fine eastern clothing rises from behind an oak desk. Her smile is practiced but her eyes are measuring.* Welcome to Dusty Springs. I'm Mayor Josephine Holt. It isn't often we receive visitors who come in through the front door. What brings you to my town?",
      expression: 'curious',
      choices: [
        {
          text: "Pleasure to meet you, Mayor. I'm new in town.",
          nextNodeId: 'polite_newcomer',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: "I received a letter directing me here. Something about an inheritance.",
          nextNodeId: 'inheritance_inquiry',
          tags: ['main_quest'],
        },
        {
          text: 'I hear IVRC runs things around here. That true?',
          nextNodeId: 'direct_ivrc_question',
          tags: ['confrontational'],
        },
        {
          text: "Just passing through. Nice office you've got.",
          nextNodeId: 'passing_through',
        },
      ],
    },
{
      id: 'polite_newcomer',
      text: "*She gestures to a chair* Please, sit. Dusty Springs may look rough around the edges, but we're building something here. A proper town, with proper laws and proper commerce. The railroad brought civilization, and I intend to keep it.",
      choices: [
        {
          text: 'The railroad seems to have a strong presence.',
          nextNodeId: 'railroad_presence',
        },
        {
          text: 'What should I know about the town?',
          nextNodeId: 'town_governance',
        },
        {
          text: 'Thank you for the welcome.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'passing_through',
      text: "*She nods, unconvinced* Most people say that. Few actually leave. There's something about the frontier that hooks people. If you change your mind about settling, come see me. I can always use capable individuals.",
      choices: [
        {
          text: "What kind of 'capable individuals' do you need?",
          nextNodeId: 'capable_individuals',
        },
        {
          text: "I'll keep that in mind.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'capable_individuals',
      text: "People who can solve problems quietly. The frontier generates... complications. Disputes over land, water rights, mining claims. Not everything can be handled through the courts. Sometimes a firm hand and a level head are worth more than a law degree.",
      choices: [
        {
          text: "Sounds like you're describing a fixer.",
          nextNodeId: 'fixer_response',
        },
        {
          text: 'I might be interested, if the pay is right.',
          nextNodeId: 'pay_response',
        },
      ],
    },
{
      id: 'fixer_response',
      text: "*A ghost of a real smile* I prefer the term 'problem solver.' Fixers work for criminals. Problem solvers work for the community. The distinction matters, at least on paper.",
      choices: [
        {
          text: 'And which do you actually need?',
          nextNodeId: 'honesty_moment',
        },
        {
          text: "Fair enough. I'll consider it.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'honesty_moment',
      text: "*She pauses, her practiced smile faltering for a moment* Both, if I'm honest. This town is caught between forces I can't fully control. The railroad wants expansion. The outlaws want revolution. And the people just want to survive. I do what I must to keep them alive.",
      expression: 'vulnerable',
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_showed_vulnerability' }],
      choices: [
        {
          text: "That's a heavy burden.",
          nextNodeId: 'burden_response',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: 'Or you do what keeps you in power.',
          nextNodeId: 'power_accusation',
          effects: [{ type: 'change_reputation', value: -5 }],
        },
      ],
    },
{
      id: 'burden_response',
      text: "*She straightens, composing herself* My husband understood that. He built this town with his bare hands before the railroad came. When he died, I promised I'd protect what he built. Even if the methods aren't always... clean.",
      choices: [
        {
          text: 'What happened to your husband?',
          nextNodeId: 'husband_story',
        },
        {
          text: 'I understand. We all make compromises.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'power_accusation',
      text: "*Her eyes harden* Power? You think I enjoy this? Every decision I make, someone suffers. I sign IVRC's permits, and miners lose their claims. I refuse, and the whole town loses its water supply. Don't presume to judge me until you've sat in this chair.",
      expression: 'angry',
      choices: [
        {
          text: "You're right. I spoke out of turn.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: "There's always another way.",
          nextNodeId: 'another_way',
        },
      ],
    },
{
      id: 'another_way',
      text: "*She laughs bitterly* Is there? Show me. Because I've been looking for years. The Copperheads think violence is the answer. The Freeminers think hiding in the mountains will save them. Sheriff Cole thinks his badge means something. None of it works.",
      choices: [
        {
          text: 'Maybe it takes someone new to see the path.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'challenged_mayor' }],
        },
      ],
    },
{
      id: 'pay_response',
      text: "The town's coffers aren't deep, but I can be... creative with compensation. Land grants, mining permits, introductions to the right people. In the territories, connections are worth more than coin.",
      choices: [
        {
          text: "I'll keep your offer in mind.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'inheritance_inquiry',
      text: "*Her composure slips for just a fraction of a second* An inheritance? In Dusty Springs? *She smooths her skirt* I oversee all property transfers in this territory. What name is on the claim?",
      expression: 'suspicious',
      choices: [
        {
          text: "The letter didn't say. Just an address - 14 Copper Street.",
          nextNodeId: 'copper_street',
        },
        {
          text: "I'd rather not say just yet.",
          nextNodeId: 'inheritance_secretive',
        },
        {
          text: 'Show her the letter.',
          nextNodeId: 'show_letter',
          conditions: [{ type: 'has_item', target: 'mysterious_letter' }],
        },
      ],
    },
{
      id: 'copper_street',
      text: "*She stiffens visibly* Fourteen Copper Street. That... that property burned down last month. An unfortunate accident, the fire marshal said. There's nothing left to inherit, I'm afraid.",
      expression: 'nervous',
      choices: [
        {
          text: 'You seem nervous about a simple fire.',
          nextNodeId: 'nervous_about_fire',
        },
        {
          text: 'Who owned the property?',
          nextNodeId: 'property_owner',
        },
        {
          text: 'An accident? The sheriff seems to think otherwise.',
          nextNodeId: 'sheriff_opinion',
          conditions: [{ type: 'flag_set', target: 'sheriff_knows_letter' }],
        },
      ],
    },
{
      id: 'nervous_about_fire',
      text: "*She forces a laugh* Nervous? I'm the mayor. I'm concerned about every building in my town. Fires are... common on the frontier. Dry wood, lanterns, wind. These things happen.",
      expression: 'defensive',
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_defensive_about_fire' }],
      choices: [
        {
          text: "Who ordered the fire, Mayor? IVRC?",
          nextNodeId: 'ivrc_fire_accusation',
          tags: ['aggressive'],
        },
        {
          text: "Of course. My mistake.",
          nextNodeId: 'backed_off',
        },
      ],
    },
{
      id: 'ivrc_fire_accusation',
      text: "*She stands abruptly* That is a dangerous accusation. I would advise you to be very careful with such talk. The Iron Valley Railroad Company is the lifeblood of this territory. Without them, Dusty Springs is just another ghost town waiting to happen.",
      expression: 'angry',
      onEnterEffects: [{ type: 'change_reputation', value: -10 }],
      choices: [
        {
          text: 'The truth has a way of coming out, Mayor.',
          nextNodeId: 'truth_warning',
          effects: [{ type: 'set_flag', target: 'threatened_mayor_with_truth' }],
        },
        {
          text: "I'll drop it. For now.",
          nextNodeId: null,
        },
      ],
    },
];
