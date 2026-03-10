import type { DialogueNode } from '../../../schemas/npc.ts';

export const mayor_holt_nodes_1: DialogueNode[] = [
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
];
