import type { DialogueNode } from '../../../schemas/npc.ts';

export const mayor_holt_nodes_2: DialogueNode[] = [
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
];
