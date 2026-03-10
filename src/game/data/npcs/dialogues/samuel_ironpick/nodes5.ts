import type { DialogueNode } from '../../../schemas/npc.ts';

export const samuel_ironpick_nodes_5: DialogueNode[] = [
{
      id: 'ready_for_documents',
      text: "*He studies your face for a long time, searching for something. Whatever he finds, it satisfies him.* Alright. You've earned this. *He pulls out a worn leather satchel from beneath his bunk* These are copies. Testimony, safety reports, Thorne's own letters. Enough to bury IVRC ten times over. Guard 'em with your life.",
      onEnterEffects: [
        { type: 'give_item', target: 'ironpick_documents' },
        { type: 'start_quest', target: 'find_documents' },
        { type: 'set_flag', target: 'has_ironpick_documents' },
      ],
      choices: [
        {
          text: "I won't let you down, Samuel.",
          nextNodeId: 'document_farewell',
          effects: [{ type: 'change_reputation', value: 20 }],
        },
      ],
    },
{
      id: 'document_farewell',
      text: "*He grips your shoulder hard* I know you won't. You're like Jacob that way. Too damn stubborn to fail. *His voice rough* Now get those documents to someone who can use 'em. And if Thorne's people come for you... don't let 'em take the papers. Burn 'em before you let that happen. The truth is worth more than any of us.",
      expression: 'determined',
      choices: [
        {
          text: 'The truth will come out. I swear it.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'quest_update',
      text: "*Samuel is pacing when you arrive* You're back. Tell me - have you found the other caches? The documents your parent hid?",
      choices: [
        {
          text: "I'm still looking. Any more clues?",
          nextNodeId: 'more_clues',
        },
        {
          text: "I found one. There's evidence of a second location.",
          nextNodeId: 'found_cache',
          conditions: [{ type: 'flag_set', target: 'found_first_cache' }],
        },
        {
          text: 'Not yet, but I will.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'more_clues',
      text: "I've been thinkin'. Your parent was methodical. They wouldn't hide everything together. *He counts on his fingers* The mineshaft behind the falls - we've checked there. The old telegraph station south of town - IVRC uses it now, so that's risky. And the third... *He frowns* ...somethin' about a 'copper grave.' I never figured out what that meant.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_gave_cache_clues' }],
      choices: [
        {
          text: "Copper grave. Could that be the cemetery?",
          nextNodeId: 'copper_grave_theory',
        },
        {
          text: "I'll figure it out. Thank you.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'copper_grave_theory',
      text: "*He snaps his fingers* The cemetery. Father Miguel's cemetery behind the church. There's a grave marker for a miner who never existed - 'Copper Jack,' they called him. A memorial for all the unnamed miners who died. If your parent hid documents there... *He almost laughs* ...they hid 'em under the protection of the dead. Clever.",
      onEnterEffects: [
        { type: 'set_flag', target: 'knows_cemetery_cache' },
        { type: 'unlock_location', target: 'copper_jack_grave' },
      ],
      choices: [
        {
          text: "I'll check the grave. Father Miguel might know more.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'found_cache',
      text: "*His eyes light up* You found one? *He grabs your arm* What was in it? How much survived?",
      choices: [
        {
          text: 'More documents. Financial records showing IVRC bribery.',
          nextNodeId: 'bribery_records',
        },
        {
          text: 'A journal. Written by my parent.',
          nextNodeId: 'parent_journal',
        },
      ],
    },
{
      id: 'bribery_records',
      text: "*He slams his fist into his palm* Bribery records. That's the piece we've been missin'. The safety violations prove IVRC was negligent. But bribery? That's criminal. Federal criminal. The kind of thing that brings marshals and trials and front-page headlines.",
      choices: [
        {
          text: "Combined with your testimony, it's enough.",
          nextNodeId: null,
          effects: [{ type: 'advance_quest', target: 'find_documents' }],
        },
      ],
    },
{
      id: 'parent_journal',
      text: "*He goes very quiet* A journal. *He swallows hard* What does it say? About... about us? About Jacob? About what happened?",
      expression: 'emotional',
      choices: [
        {
          text: "They wrote about all of you. With love and regret.",
          nextNodeId: 'journal_contents',
        },
      ],
    },
{
      id: 'journal_contents',
      text: "*He turns away, and his shoulders shake silently. When he faces you again, his eyes are red but his jaw is set.* Then it wasn't for nothin'. None of it. *He wipes his eyes roughly* Let's finish what they started. For Jacob. For all of 'em.",
      choices: [
        {
          text: "For all of them.",
          nextNodeId: null,
          effects: [
            { type: 'change_reputation', value: 15 },
            { type: 'advance_quest', target: 'find_documents' },
          ],
        },
      ],
    },
];
