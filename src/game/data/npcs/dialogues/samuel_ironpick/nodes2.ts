import type { DialogueNode } from '../../../schemas/npc.ts';

export const samuel_ironpick_nodes_2: DialogueNode[] = [
{
      id: 'gear_carrier',
      text: "*The old miner freezes when he sees you. His eyes lock onto something you're carrying.* That letter. Show it to me. Now.",
      expression: 'intense',
      choices: [
        {
          text: 'Hand him the letter.',
          nextNodeId: 'reads_letter',
        },
        {
          text: "I'll show it, but I need answers first.",
          nextNodeId: 'answers_first',
        },
      ],
    },
{
      id: 'reads_letter',
      text: "*He takes the letter with trembling hands, reads it twice. When he looks up, his hard eyes are glistening.* This is your parent's handwriting. I'd know it anywhere. *He sits down slowly* They said they'd send for someone when the time was right. I thought they were dead. Maybe they are. But this letter... this was written recently.",
      expression: 'emotional',
      onEnterEffects: [
        { type: 'set_flag', target: 'samuel_recognized_handwriting' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: 'You knew my parent?',
          nextNodeId: 'knew_parent',
        },
        {
          text: 'What do you mean, the time was right?',
          nextNodeId: 'right_time',
        },
      ],
    },
{
      id: 'knew_parent',
      text: "Knew them? *He laughs bitterly* They were one of us. Alliance through and through. Worked alongside me, Jacob, Miguel, all of us. When the Pinkertons came, they were the ones who got the documents out. Hid the most important ones somewhere even I don't know. Then they vanished. For your protection, they said.",
      choices: [
        {
          text: 'The documents. The ones that could bring down IVRC.',
          nextNodeId: 'critical_documents',
        },
        {
          text: 'Why did they leave me behind?',
          nextNodeId: 'why_left_behind',
        },
      ],
    },
{
      id: 'critical_documents',
      text: "Safety violations. Bribery records. Letters provin' Thorne ordered my son's death. Enough to bring federal marshals runnin' and newspapers screamin'. Your parent was the keeper. The only one who knew where all the copies were hidden. And now they've sent you to finish what they started.",
      onEnterEffects: [
        { type: 'advance_quest', target: 'main_the_inheritance' },
        { type: 'start_quest', target: 'find_documents' },
      ],
      choices: [
        {
          text: "Then I'll find them. All of them.",
          nextNodeId: 'find_them_all',
        },
        {
          text: "Why me? I don't even know where to look.",
          nextNodeId: 'why_me',
        },
      ],
    },
{
      id: 'find_them_all',
      text: "*He grips your hand* Good. This is it - the chance we've been waitin' for. Your parent hid caches in three locations. I know one - the old mineshaft behind the falls. The others... the letter may hold clues I can't see. But together, maybe we can figure it out.",
      onEnterEffects: [{ type: 'unlock_location', target: 'hidden_falls_mine' }],
      choices: [
        {
          text: "Let's start with what you know.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },
{
      id: 'why_me',
      text: "Because you're unknown. IVRC has files on every miner, every activist, every soul who ever crossed them. But you? You're nobody to them. *He says it without malice* That's your advantage. You can go where we can't. Ask questions we can't. And your parent trusted you with this for a reason.",
      choices: [
        {
          text: "Then I'll honor that trust.",
          nextNodeId: 'find_them_all',
        },
      ],
    },
{
      id: 'why_left_behind',
      text: "*His expression softens - something rare for him* To protect you. If Thorne's people knew they had a child... *He doesn't finish the sentence* Your parent made the hardest choice anyone can make. They chose your safety over their own heart. I've seen that kind of sacrifice up close. It ain't easy, and it ain't forgiven easy either.",
      choices: [
        {
          text: "I understand now.",
          nextNodeId: 'critical_documents',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'right_time',
      text: "They said they'd hidden the most damning evidence in places only they knew. When enough time had passed, when IVRC had grown complacent, when a new face could move freely... then they'd bring someone in. Someone connected to the cause but unknown to the enemy. *He looks at you* That's you.",
      choices: [
        {
          text: "A lot of weight for someone who just arrived.",
          nextNodeId: 'weight_response',
        },
        {
          text: "Then let's not waste the opportunity.",
          nextNodeId: 'critical_documents',
        },
      ],
    },
{
      id: 'weight_response',
      text: "*He nods* It is. But the world don't ask if you're ready before it drops trouble in your lap. My son learned that. I learned that. *He puts a hand on your shoulder - the first sign of warmth* You ain't alone in this. Whatever your parent started, we'll finish together.",
      choices: [
        {
          text: 'Together, then.',
          nextNodeId: 'critical_documents',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'answers_first',
      text: "*His jaw tightens* You're in no position to make demands, stranger. You're standin' on my mountain, breathin' my air, and carryin' somethin' that might be important to a lot of people. *He forces himself to calm down* But fine. Ask your questions. Then show me the letter.",
      choices: [
        {
          text: 'Who are the Freeminers, and what do you fight for?',
          nextNodeId: 'freeminer_cause',
        },
        {
          text: 'What happened at 14 Copper Street?',
          nextNodeId: 'copper_street_response',
        },
      ],
    },
{
      id: 'miguel_message',
      text: "*The old miner blocks your path, pickaxe in hand* Another outsider. I've told your kind before -",
      choices: [
        {
          text: 'Father Miguel sent me. He says he has not forgotten.',
          nextNodeId: 'miguel_remembered',
        },
      ],
    },
{
      id: 'miguel_remembered',
      text: "*He lowers the pickaxe slowly. Something cracks in his iron composure.* Miguel. *He turns away for a moment, composing himself* That old fool priest. Always sendin' messages I don't deserve. *He turns back, eyes red* He said that? That he hasn't forgotten?",
      expression: 'emotional',
      onEnterEffects: [{ type: 'change_reputation', value: 20 }],
      choices: [
        {
          text: "He said to tell you the church basement still has room. And that he's sorry about Jacob.",
          nextNodeId: 'miguel_full_message',
        },
        {
          text: 'He spoke of you like a brother.',
          nextNodeId: 'brother_response',
        },
      ],
    },
{
      id: 'miguel_full_message',
      text: "*He sits down heavily, running his hands over his face* Sorry about Jacob. *He laughs through tears* I've never blamed Miguel. Never. The only ones to blame are IVRC and the traitor who sold us out. *He looks up* You carried a good message up a hard mountain. That counts for somethin'. Sit. Talk. Tell me what's happenin' down in town.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_opened_up' }],
      choices: [
        {
          text: "People are scared, but they haven't given up.",
          nextNodeId: 'town_report',
        },
        {
          text: 'IVRC is tightening their grip. The underground is struggling.',
          nextNodeId: 'underground_report',
        },
      ],
    },
{
      id: 'brother_response',
      text: "He was more than a brother. He was my conscience. When I wanted to pick up a gun and start shootin', Miguel talked me down. When I wanted to give up, he reminded me why we fight. *He sighs* I miss that voice. These mountains get quiet. Too quiet for thinkin'.",
      choices: [
        {
          text: 'He misses you too. Worries about you.',
          nextNodeId: 'miguel_full_message',
        },
      ],
    },
{
      id: 'town_report',
      text: "*He listens intently* Good. Fear is IVRC's weapon, but it rusts over time. If people are still resistin', even quietly, there's somethin' to build on. *He looks at you differently* And you? Why'd you really come up here?",
      choices: [
        {
          text: 'I received a letter with a gear symbol.',
          nextNodeId: 'gear_letter_response',
        },
        {
          text: 'I want to help the resistance.',
          nextNodeId: 'want_to_help',
        },
      ],
    },
{
      id: 'underground_report',
      text: "The underground... *He winces* Miguel and Doc Chen are still runnin' it? Those brave fools. *He stands and paces* If IVRC catches 'em... I should've been helpin'. Hidin' up here like a coward while they risk their necks.",
      choices: [
        {
          text: "You're not hiding. You're protecting the evidence.",
          nextNodeId: 'protecting_evidence',
        },
        {
          text: "Come back with me. They need you.",
          nextNodeId: 'come_back',
        },
      ],
    },
{
      id: 'protecting_evidence',
      text: "*He pauses mid-step* The evidence. Yeah. *He nods slowly* That's what I tell myself. And it's true - if IVRC gets their hands on what I've got, it's over. But sometimes the right thing and the safe thing look too much alike, and I wonder which one I really chose.",
      choices: [
        {
          text: "Maybe it's time to use that evidence.",
          nextNodeId: 'time_to_use_evidence',
        },
      ],
    },
];
