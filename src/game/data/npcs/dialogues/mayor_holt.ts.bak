/**
 * Mayor Josephine Holt - Dialogue Trees
 *
 * An elegant, politically savvy woman who serves as mayor of Dusty Springs.
 * Aligned with IVRC out of pragmatism and fear, but not without conscience.
 * Involved in the main quest through land disputes and inheritance matters.
 * Morally grey - she does what she believes necessary to keep the town alive.
 */

import type { DialogueTree } from '../../schemas/npc';

export const MayorHoltMainDialogue: DialogueTree = {
  id: 'mayor_holt_main',
  name: 'Mayor Holt - Main Conversation',
  description: 'Primary dialogue tree for Mayor Josephine Holt',
  tags: ['dusty_springs', 'authority', 'ivrc_connected', 'morally_grey'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'inheritance_discussion',
      conditions: [{ type: 'quest_active', target: 'main_the_inheritance' }],
      priority: 8,
    },
    {
      nodeId: 'post_investigation',
      conditions: [{ type: 'flag_set', target: 'found_partial_manifest' }],
      priority: 6,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
    // ========================================================================
    // FIRST MEETING
    // ========================================================================
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

    // ========================================================================
    // INHERITANCE / MAIN QUEST
    // ========================================================================
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

    {
      id: 'truth_warning',
      text: "*She sits back down slowly, her knuckles white on the desk* Perhaps it does. And perhaps when it does, you'll understand that some truths are more complicated than they appear. *She lowers her voice* I did not order that fire. But I know who did. And that knowledge keeps me up at night.",
      expression: 'conflicted',
      onEnterEffects: [
        { type: 'set_flag', target: 'mayor_admitted_knowledge' },
        { type: 'change_reputation', value: 10 },
      ],
      choices: [
        {
          text: 'Tell me who did it.',
          nextNodeId: 'who_ordered_fire',
        },
        {
          text: 'Why not stop them?',
          nextNodeId: 'why_not_stop',
        },
      ],
    },

    {
      id: 'who_ordered_fire',
      text: "*She glances at the door* Victoria Ashworth. Thorne's enforcer. She arrived in town, asked questions about the Ironpick property, and three days later it burned. I have no proof - she's meticulous. But I know it was her people.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_ashworth_arsonist' }],
      choices: [
        {
          text: 'Who are the Ironpicks?',
          nextNodeId: 'ironpick_info',
        },
        {
          text: "I'll remember this, Mayor.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'ironpick_info',
      text: "A mining family. Old Samuel Ironpick was one of the first settlers here, before my husband even. He had claims in the mountains that IVRC wanted. When he wouldn't sell, things got... unpleasant. His son died in a mine collapse. Samuel took his granddaughter and fled to the mountains. The house on Copper Street was all he had left in town.",
      choices: [
        {
          text: 'And now that house is gone too.',
          nextNodeId: 'house_gone',
        },
        {
          text: 'Where can I find Samuel?',
          nextNodeId: 'samuel_directions',
        },
      ],
    },

    {
      id: 'house_gone',
      text: "*She nods heavily* Along with whatever was inside it. Samuel kept records - documents, ledgers, correspondence. Evidence of IVRC's wrongdoing, he claimed. If those burned with the house... then Thorne has won another battle. If they didn't...",
      choices: [
        {
          text: "Then there's still hope.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'mayor_hinted_at_documents' }],
        },
      ],
    },

    {
      id: 'samuel_directions',
      text: "Freeminer's Hollow, somewhere in the Iron Mountains. I don't know the exact location - they move their camps. But the trail north of town leads into the passes. *She pauses* If you find him... tell him Josephine sent you. It won't help much, but it's something.",
      onEnterEffects: [
        { type: 'unlock_location', target: 'freeminer_hollow' },
        { type: 'set_flag', target: 'mayor_endorsed_player' },
      ],
      choices: [
        {
          text: "I'll tell him. Thank you, Mayor.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'why_not_stop',
      text: "Stop Cornelius Thorne? With what army? He has Pinkertons, lawyers, and half the territorial legislature in his pocket. I tried to oppose him once. *She touches her throat unconsciously* He made it clear what would happen to this town if I did it again.",
      expression: 'frightened',
      choices: [
        {
          text: 'He threatened you directly?',
          nextNodeId: 'thorne_threat',
        },
        {
          text: 'There must be someone who can stand up to him.',
          nextNodeId: 'stand_up_to_thorne',
        },
      ],
    },

    {
      id: 'thorne_threat',
      text: "Not in so many words. But the message was unmistakable. The town's water supply runs through IVRC land. Our telegraph line passes through their stations. Even the stagecoach route depends on their goodwill. One word from Thorne, and Dusty Springs dies of thirst.",
      choices: [
        {
          text: "That's extortion.",
          nextNodeId: 'extortion_response',
        },
        {
          text: 'I see the bind you are in.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'extortion_response',
      text: "*She smiles sadly* It's business. At least that's what the lawyers call it. All perfectly legal, all perfectly devastating. Welcome to the territories.",
      choices: [
        {
          text: 'Legal and moral are not the same thing.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'moral_argument_with_mayor' }],
        },
      ],
    },

    {
      id: 'stand_up_to_thorne',
      text: "*She studies you with renewed interest* The Copperheads try, with guns and robbery. The Freeminers try, with stubbornness and isolation. Sheriff Cole tries, with a badge and good intentions. None of it has worked. Perhaps a different approach...",
      choices: [
        {
          text: "What kind of approach?",
          nextNodeId: 'different_approach',
        },
      ],
    },

    {
      id: 'different_approach',
      text: "Evidence. Real, documented proof of IVRC's crimes - bribes, safety violations, the deaths they've covered up. Enough to reach newspapers back east, territorial courts that aren't bought. That would hurt Thorne more than any robbery. But gathering it... that's the dangerous part.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_wants_evidence' }],
      choices: [
        {
          text: 'Maybe I can help with that.',
          nextNodeId: 'help_gather_evidence',
          effects: [{ type: 'change_reputation', value: 15 }],
        },
        {
          text: "That's a tall order.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'help_gather_evidence',
      text: "*Her eyes widen slightly* You'd risk that? *She composes herself* I won't pretend to understand your motives, but I won't refuse the help. The Ironpick documents would be a start. If Samuel still has them... and if you can convince him to share them...",
      choices: [
        {
          text: "I'll find Samuel and see what I can learn.",
          nextNodeId: null,
          effects: [{ type: 'advance_quest', target: 'main_the_inheritance' }],
        },
      ],
    },

    {
      id: 'backed_off',
      text: "*She relaxes slightly* Good. I like you, stranger. Don't make me regret that. *She shuffles papers on her desk* Is there anything else I can help with? As mayor, I'm here to serve the public.",
      choices: [
        {
          text: 'Tell me about the town.',
          nextNodeId: 'town_governance',
        },
        {
          text: "No, that's all. Thank you.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'property_owner',
      text: "The property was registered to the Ironpick family. Miners, originally. Old family, been here since before the railroad. Samuel Ironpick left town some years ago after... difficulties with the railroad company. The house sat empty until the fire.",
      choices: [
        {
          text: "What kind of 'difficulties'?",
          nextNodeId: 'ironpick_difficulties',
        },
        {
          text: 'Is Samuel still alive?',
          nextNodeId: 'samuel_alive',
        },
      ],
    },

    {
      id: 'ironpick_difficulties',
      text: "Business disputes. IVRC wanted his mining claims. He refused to sell. These things can get... contentious in the territories. *She chooses her words carefully* Eventually he decided the mountains were safer than town. Many disagreed with that assessment.",
      choices: [
        {
          text: "Sounds like he was forced out.",
          nextNodeId: 'forced_out',
        },
        {
          text: 'I see. Thank you.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'forced_out',
      text: "*Long pause* The frontier is harsh. People make difficult choices. I tried to mediate, for what it's worth. But Cornelius Thorne doesn't negotiate. He acquires. *She looks away* I regret that I couldn't do more.",
      expression: 'sad',
      choices: [
        {
          text: 'Is it too late to make it right?',
          nextNodeId: 'make_it_right',
        },
        {
          text: 'At least you tried.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'make_it_right',
      text: "Perhaps not. *She meets your eyes* If someone were to find Samuel, bridge the gap between the Freeminers and the town... maybe something could change. But it would take someone with no ties to either side. Someone new.",
      choices: [
        {
          text: 'Someone like me.',
          nextNodeId: null,
          effects: [
            { type: 'set_flag', target: 'mayor_suggested_mediator' },
            { type: 'change_reputation', value: 10 },
          ],
        },
      ],
    },

    {
      id: 'samuel_alive',
      text: "As far as I know. He retreated to the mountains with his granddaughter Maggie. The Freeminers took him in. He's stubborn as the rock he mines - I'd wager he's still up there, pickaxe in hand, refusing to give an inch.",
      choices: [
        {
          text: 'How do I find the Freeminers?',
          nextNodeId: 'samuel_directions',
        },
        {
          text: 'Thank you for the information.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'inheritance_secretive',
      text: "*She arches an eyebrow* Secretive. I respect that, though it makes my job harder. Property transfers require documentation. If you have a legitimate claim, I can help process it. If not... *she shrugs* ...there are lawyers in Junction City who handle disputes.",
      choices: [
        {
          text: "I'll come back when I know more.",
          nextNodeId: null,
        },
        {
          text: 'Actually, it mentions 14 Copper Street.',
          nextNodeId: 'copper_street',
        },
      ],
    },

    {
      id: 'show_letter',
      text: "*She takes the letter, reads it, and her face goes pale* This... this is the gear symbol. The workers' mark. *She sets the letter down with trembling fingers* Where did you get this?",
      expression: 'shocked',
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_saw_letter' }],
      choices: [
        {
          text: 'It was sent to me. I think by family.',
          nextNodeId: 'family_connection',
        },
        {
          text: 'You recognize the symbol.',
          nextNodeId: 'gear_recognition',
        },
      ],
    },

    {
      id: 'family_connection',
      text: "*She sinks back in her chair* Family. Then you may be connected to the Ironpicks, or someone close to them. *She pushes the letter back* You need to find Samuel Ironpick. Whatever this letter means, he'll know. But be careful - IVRC watches the roads.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: 'Why would IVRC care about me?',
          nextNodeId: 'ivrc_cares',
        },
        {
          text: "I'll find him. Thank you, Mayor.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ivrc_cares',
      text: "Because someone sent this letter after the house burned. That means someone survived who knows what was in that house. IVRC thought they'd buried those secrets. If you're carrying them to the surface... *she shakes her head* They'll come for you.",
      choices: [
        {
          text: 'Let them come.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'defiant_to_mayor' }],
        },
        {
          text: 'Then I need allies.',
          nextNodeId: 'need_allies',
        },
      ],
    },

    {
      id: 'need_allies',
      text: "*She considers for a long moment* I cannot openly support you. Not while IVRC controls our water and our telegraph. But... I can ensure certain doors stay open. And I can warn you when Thorne's people come to town. It's not much. It's all I have.",
      onEnterEffects: [
        { type: 'set_flag', target: 'mayor_secret_ally' },
        { type: 'change_reputation', value: 15 },
      ],
      choices: [
        {
          text: "It's more than you think. Thank you, Josephine.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'gear_recognition',
      text: "Everyone who was here five years ago knows that symbol. The Workers' Alliance used it - the movement that tried to organize against IVRC's labor practices. Thorne crushed them. Their leaders were arrested, exiled, or... disappeared. Using that symbol now is practically a death sentence.",
      choices: [
        {
          text: 'Then why would someone send it to me?',
          nextNodeId: 'family_connection',
        },
        {
          text: 'What happened to the Alliance?',
          nextNodeId: 'alliance_history',
        },
      ],
    },

    {
      id: 'alliance_history',
      text: "They were betrayed. Someone inside leaked their plans to IVRC. The Pinkertons raided their meeting places, confiscated their documents. The survivors scattered - some to the Copperheads, others to the Freeminers. A few simply vanished. My husband was sympathetic to their cause. He died shortly after the raids.",
      expression: 'sad',
      choices: [
        {
          text: "I'm sorry about your husband.",
          nextNodeId: 'husband_story',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: 'Do you think the betrayal came from inside?',
          nextNodeId: 'betrayal_question',
        },
      ],
    },

    {
      id: 'husband_story',
      text: "Thomas Holt. Built this town from nothing. When the railroad came, he saw opportunity. When IVRC came, he saw danger. He tried to negotiate fair terms for the workers. Three months later, he fell from his horse on a clear road he'd ridden a thousand times. *She pauses* The coroner ruled it an accident.",
      expression: 'grief',
      onEnterEffects: [{ type: 'set_flag', target: 'knows_about_thomas_holt' }],
      choices: [
        {
          text: "You don't believe it was an accident.",
          nextNodeId: 'not_accident',
        },
        {
          text: "I'm sorry for your loss.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'not_accident',
      text: "*Her jaw tightens* I believe my husband was a healthy man who could ride before he could walk. I believe he died the same month he stood up to Cornelius Thorne. And I believe that if I push too hard for answers, I'll join him in the ground. So I smile, and I sign their permits, and I keep this town alive. That is my penance.",
      expression: 'determined',
      choices: [
        {
          text: "Surviving isn't something to be ashamed of.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'betrayal_question',
      text: "I know it did. *She speaks barely above a whisper* Someone close to the Alliance leadership informed on them. Suspicion fell on several people - some unfairly. The trust was shattered. That's why the Freeminers and Copperheads can't work together today. Too much suspicion.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_about_betrayal' }],
      choices: [
        {
          text: 'Do you know who the traitor was?',
          nextNodeId: 'traitor_identity',
        },
        {
          text: 'A divided opposition is easy to control.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'traitor_identity',
      text: "*She looks at you for a long time* Some questions are better left unasked, friend. For both our sakes. *She returns to her papers* Is there anything else I can help with?",
      expression: 'guarded',
      choices: [
        {
          text: 'Tell me about the town governance.',
          nextNodeId: 'town_governance',
        },
        {
          text: "I understand. I'll be going.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'sheriff_opinion',
      text: "*She flinches* The sheriff says many things. Some of them are even accurate. *She lowers her voice* Cole is a good man with limited perspective. He sees crime and justice. The world is more... complicated than that.",
      choices: [
        {
          text: 'Complicated how?',
          nextNodeId: 'truth_warning',
        },
        {
          text: "You and the sheriff don't see eye to eye.",
          nextNodeId: 'sheriff_relationship',
        },
      ],
    },

    {
      id: 'sheriff_relationship',
      text: "Marcus Cole thinks I'm corrupt. I think he's naive. We're probably both right. *She sighs* He doesn't understand that sometimes you have to bend to avoid breaking. Every concession I make to IVRC is a concession that keeps this town standing one more day.",
      choices: [
        {
          text: "There's a difference between bending and breaking.",
          nextNodeId: null,
        },
        {
          text: 'At least you both care about the town.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    // ========================================================================
    // TOWN GOVERNANCE
    // ========================================================================
    {
      id: 'town_governance',
      text: "Dusty Springs operates under territorial law, which means I handle civil matters - property, commerce, water rights, building permits. Sheriff Cole handles criminal law. Father Miguel handles... the rest. *She waves vaguely* Souls, consciences, that sort of thing.",
      choices: [
        {
          text: 'And IVRC? What role do they play?',
          nextNodeId: 'ivrc_role',
        },
        {
          text: 'What are the biggest challenges facing the town?',
          nextNodeId: 'town_challenges',
        },
        {
          text: 'Tell me about the land disputes.',
          nextNodeId: 'land_disputes',
        },
        {
          text: 'Thank you. Good to know how things work.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ivrc_role',
      text: "Officially? They're a private enterprise that provides employment, infrastructure, and commerce. *She pauses* Unofficially? They own the water pumps, the telegraph, the main supply routes, and most of the productive land. They don't need to run the town. They just need to own everything the town needs to survive.",
      choices: [
        {
          text: "That's a stranglehold.",
          nextNodeId: 'stranglehold',
        },
        {
          text: 'How did it get this bad?',
          nextNodeId: 'how_it_got_bad',
        },
      ],
    },

    {
      id: 'stranglehold',
      text: "An apt word. But strangleholds can be broken - carefully, slowly. Not with guns and dynamite like the Copperheads want. With leverage. Legal leverage, political leverage, public opinion back east. The trick is surviving long enough to apply it.",
      choices: [
        {
          text: 'A patient strategy.',
          nextNodeId: null,
        },
      ],
    },

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

    // ========================================================================
    // RAILROAD DISCUSSION
    // ========================================================================
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

    // ========================================================================
    // RETURN VISITS
    // ========================================================================
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

    {
      id: 'latest_developments',
      text: "IVRC is pressuring me for more building permits on the west side of town. They want to expand their freight depot. It would mean tearing down three homesteads. *She rubs her temples* And the Copperheads hit another payroll shipment last Tuesday. Thorne is furious.",
      choices: [
        {
          text: 'Will you approve the permits?',
          nextNodeId: 'permit_dilemma',
        },
        {
          text: 'The Copperhead raids are escalating.',
          nextNodeId: 'copperhead_damage',
        },
        {
          text: "Difficult times. I hope you manage.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'permit_dilemma',
      text: "I'm stalling. Adding conditions, requesting environmental assessments, demanding impact studies. It won't last forever, but every week those families have their homes is a week I've won. *She smiles thinly* Bureaucracy has its uses.",
      choices: [
        {
          text: "Fighting fire with paperwork. I respect that.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'ivrc_operations_rumor',
      text: "*She closes the door to her office* What have you heard? And from whom?",
      expression: 'alert',
      choices: [
        {
          text: 'People talk about safety violations, covered-up deaths.',
          nextNodeId: 'safety_violations',
        },
        {
          text: "I'd rather not say who told me.",
          nextNodeId: 'protect_source',
        },
      ],
    },

    {
      id: 'safety_violations',
      text: "*She nods slowly* I've heard the same. Seen some of it myself, when I visited the Coppertown operations. Conditions that would shut down any mine back east. But out here, territorial law is... flexible. And the inspectors answer to Thorne.",
      choices: [
        {
          text: 'Proof could change that.',
          nextNodeId: 'proof_discussion',
        },
        {
          text: 'How do you live with knowing?',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'questioned_mayor_conscience' }],
        },
      ],
    },

    {
      id: 'proof_discussion',
      text: "The right proof, in the right hands... yes. Federal oversight, eastern newspapers, territorial reform. It's happened before in other territories. But the proof has to be ironclad. Thorne's lawyers can shred anything less. *She meets your eyes* If you find something solid, bring it to me. I may not be able to act openly, but I have connections.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_will_use_evidence' }],
      choices: [
        {
          text: "I'll see what I can find.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'protect_source',
      text: "*She nods* Smart. In this town, protecting your sources is survival. Just know that whatever you've heard, it's probably worse than you think. IVRC is very good at hiding the full scope of their operations.",
      choices: [
        {
          text: 'Then I need to dig deeper.',
          nextNodeId: null,
        },
      ],
    },

    // ========================================================================
    // QUEST-ACTIVE STATE
    // ========================================================================
    {
      id: 'inheritance_discussion',
      text: "*Mayor Holt sets down her pen* I've been thinking about your situation. The Ironpick property, the letter, all of it. Have you made any progress?",
      choices: [
        {
          text: "I've been investigating. Found some things.",
          nextNodeId: 'progress_report',
        },
        {
          text: 'Not yet. Any advice?',
          nextNodeId: 'mayor_advice',
        },
        {
          text: "I'm handling it. Is there anything else?",
          nextNodeId: 'town_governance',
        },
      ],
    },

    {
      id: 'progress_report',
      text: "*She leans forward* What have you found? And please - be careful what you share with others. Not everyone in this town can be trusted.",
      choices: [
        {
          text: 'The fire was arson, just as we suspected.',
          nextNodeId: 'arson_confirmed',
          conditions: [{ type: 'flag_set', target: 'found_arson_evidence' }],
        },
        {
          text: "I'm still piecing things together.",
          nextNodeId: 'mayor_advice',
        },
      ],
    },

    {
      id: 'arson_confirmed',
      text: "I'm not surprised, but hearing it confirmed... *She shakes her head* Ashworth's work, no doubt. She was in town that week with a team of 'surveyors.' *She emphasizes the word with disgust* If you can link her directly to the fire, that's the kind of evidence that could matter.",
      choices: [
        {
          text: "I'll keep looking.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'mayor_advice',
      text: "My advice? Talk to Father Miguel. He knows more about the underground history of this territory than anyone alive. And he's one of the few people I'd trust with my life. He and Doc Chen both. If you haven't visited them yet, you should.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_recommended_miguel' }],
      choices: [
        {
          text: "I'll pay them a visit.",
          nextNodeId: null,
        },
        {
          text: 'Thank you, Mayor.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    // ========================================================================
    // POST-INVESTIGATION STATE
    // ========================================================================
    {
      id: 'post_investigation',
      text: "*Mayor Holt closes her office door behind you* I heard you found something in the ruins. *She keeps her voice low* The walls have ears in this town. Tell me quickly - what did the manifest say?",
      expression: 'urgent',
      choices: [
        {
          text: "It mentions 'The Old Works' - some kind of location.",
          nextNodeId: 'old_works_reaction',
        },
        {
          text: "I'd rather not share the details yet.",
          nextNodeId: 'withholding_info',
        },
      ],
    },

    {
      id: 'old_works_reaction',
      text: "*Her eyes widen* The Old Works. I've heard that name once before, from my husband, the night before he died. He said it was something IVRC found underground - something they built their whole operation around. He never got to explain what it was.",
      expression: 'shocked',
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_knows_old_works' }],
      choices: [
        {
          text: 'Your husband knew about this?',
          nextNodeId: 'thomas_knew',
        },
        {
          text: 'Something underground... the miners have seen things too.',
          nextNodeId: 'underground_connection',
        },
      ],
    },

    {
      id: 'thomas_knew',
      text: "He knew something. Not everything. He was trying to find out more when... when the accident happened. *She steadies herself* Whatever The Old Works is, IVRC considers it valuable enough to kill for. That makes it valuable enough to fight for.",
      choices: [
        {
          text: "I'll find out what it is.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },

    {
      id: 'underground_connection',
      text: "Metal walls underground. Strange sounds. Miners who disappear. *She connects the dots* The Old Works isn't a metaphor. It's a real place, under the mountains. And IVRC found it. *She looks frightened* That's why they want the mining claims so badly. It was never about copper.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_suspects_old_works_location' }],
      choices: [
        {
          text: "This changes everything.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'withholding_info',
      text: "*She nods, though frustration flickers across her face* I understand caution. But remember - I've risked a great deal sharing what I know with you. Trust is a two-way bridge, stranger. When you're ready to cross it, you know where to find me.",
      choices: [
        {
          text: "I'll share more when I know more.",
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const MayorHoltDialogues = [MayorHoltMainDialogue];
