import type { DialogueNode } from '../../../schemas/npc.ts';

export const diamondback_nodes_0: DialogueNode[] = [
{
      id: 'captured_entry',
      text: "*A striking woman with sun-weathered skin and cold eyes studies you from across the campfire. A rattlesnake tattoo coils up her neck.* So. You're the one who's been askin' questions about my gang. Either you're brave, stupid, or workin' for Thorne. Which is it?",
      expression: 'threatening',
      choices: [
        {
          text: "I'm no friend of IVRC.",
          nextNodeId: 'not_ivrc',
        },
        {
          text: 'I was looking for you specifically.',
          nextNodeId: 'looking_for_you',
        },
        {
          text: "Let me go and we'll forget this happened.",
          nextNodeId: 'defiant',
        },
      ],
    },
{
      id: 'not_ivrc',
      text: "*She leans forward* Everyone says that. The company sends spies dressed as drifters, as merchants, as lost travelers. *She pulls a knife, begins cleaning her nails* Give me one reason to believe you ain't one of 'em.",
      expression: 'suspicious',
      choices: [
        {
          text: "I received a letter with a gear symbol. I'm following it.",
          nextNodeId: 'gear_reveal',
          conditions: [{ type: 'has_item', target: 'mysterious_letter' }],
        },
        {
          text: 'IVRC killed people I cared about.',
          nextNodeId: 'personal_grudge',
        },
        {
          text: "You don't have to believe me. But killing me won't help your cause.",
          nextNodeId: 'practical_argument',
        },
      ],
    },
{
      id: 'gear_reveal',
      text: '*Her knife pauses mid-stroke. For a moment, something cracks through her hard exterior.* The gear. Where did you get that letter? *She holds out her hand* Show me.',
      expression: 'shocked',
      choices: [
        {
          text: '*Hand over the letter*',
          nextNodeId: 'letter_examination',
        },
        {
          text: "I'll show you, but I want answers first.",
          nextNodeId: 'answers_first',
        },
      ],
    },
{
      id: 'letter_examination',
      text: "*She reads it carefully, then looks up with changed eyes* This is the old code. The worker's symbol. I thought everyone who knew it was dead or in hidin'. *She folds the letter carefully* You didn't write this. Which means someone sent for you. Someone from the old days.",
      onEnterEffects: [
        { type: 'set_flag', target: 'showed_diamondback_letter' },
        { type: 'change_reputation', value: 25 },
      ],
      choices: [
        {
          text: 'What does it mean?',
          nextNodeId: 'letter_meaning',
        },
        {
          text: 'Who would send such a letter?',
          nextNodeId: 'who_sent_letter',
        },
      ],
    },
{
      id: 'letter_meaning',
      text: "It means you're connected to somethin' bigger than you know. The gear was the symbol of the first resistance - the workers who tried to organize against IVRC before Thorne crushed them. If someone's using it again... *she pauses* ...they must have good reason.",
      choices: [
        {
          text: 'I want to find out who sent it.',
          nextNodeId: 'find_sender',
        },
        {
          text: 'What happened to the first resistance?',
          nextNodeId: 'first_resistance',
        },
      ],
    },
{
      id: 'find_sender',
      text: "*She hands back the letter* If I were you, I'd start with Old Samuel up in Freeminer's Hollow. He was one of the original leaders. If anyone knows who's still usin' that symbol, it'd be him. *She waves to her men* Cut 'em loose. They ain't IVRC.",
      onEnterEffects: [
        { type: 'clear_flag', target: 'captured_by_copperheads' },
        { type: 'unlock_location', target: 'freeminer_hollow' },
      ],
      choices: [
        {
          text: 'Thank you. Can I ask you more questions?',
          nextNodeId: 'more_questions',
        },
        {
          text: "I'll find Samuel.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'first_resistance',
      text: "Thorne called 'em 'agitators.' They called themselves the Worker's Coalition. Tried to get fair wages, safer conditions. Thorne's answer was to burn their meeting halls, arrest their leaders, and blacklist anyone who'd spoken up. Some died. Some disappeared. The rest scattered.",
      expression: 'bitter',
      choices: [
        {
          text: "That's why you fight.",
          nextNodeId: 'why_fight',
        },
        {
          text: 'And you formed the Copperheads from the survivors?',
          nextNodeId: 'copperhead_origin',
        },
      ],
    },
{
      id: 'why_fight',
      text: "I fight because words failed. Petitions failed. The law failed. When peaceful means are crushed, what's left? *She spreads her hands* IVRC understands one thing: money. I take their money. It's the only language they speak.",
      choices: [
        {
          text: 'Violence breeds violence.',
          nextNodeId: 'violence_debate',
        },
        {
          text: "Sometimes that's what it takes.",
          nextNodeId: 'agree_violence',
        },
      ],
    },
{
      id: 'violence_debate',
      text: "You think I don't know that? *Her voice hardens* Every raid, every bullet - it weighs on me. But so do the faces of the miners who die in cave-ins while Thorne counts his gold. There's violence either way. At least mine has a purpose.",
      choices: [
        {
          text: 'Is there no other way?',
          nextNodeId: 'other_way',
        },
        {
          text: 'I understand your position.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'other_way',
      text: "*She stares into the fire* If there is, I ain't found it. The Freeminers hide in the mountains. Father Miguel prays for change. Doc Chen patches up the wounded. But nothing changes. IVRC grows stronger each year. Someone has to strike back.",
      choices: [
        {
          text: 'Maybe the right evidence could change things.',
          nextNodeId: 'evidence_idea',
        },
        {
          text: 'I hope you find that other way someday.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'evidence_idea',
      text: "*Her eyes narrow with interest* Evidence? You mean proof of their crimes? *She laughs bitterly* We all know their crimes. The problem is makin' anyone care. Thorne owns the judges, the newspapers, the politicians...",
      choices: [
        {
          text: 'But there might be documents. Hidden records.',
          nextNodeId: 'documents_hint',
        },
      ],
    },
{
      id: 'documents_hint',
      text: "*She stands abruptly* The Ironpick documents. Old Samuel mentioned them once. Proof that IVRC bribed safety inspectors, covered up deaths, stole land. If those still exist... *She turns to face you* Find them. Bring them to light. Maybe then my way won't be the only way.",
      onEnterEffects: [
        { type: 'set_flag', target: 'diamondback_wants_documents' },
        { type: 'start_quest', target: 'find_ironpick_documents' },
      ],
      choices: [
        {
          text: "I'll try.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 20 }],
        },
      ],
    },
{
      id: 'agree_violence',
      text: "*She nods slowly* You understand. Not everyone does. *She signals to her men* This one's alright. Get 'em some food and water. We can talk more when they've rested.",
      onEnterEffects: [
        { type: 'change_reputation', value: 15 },
        { type: 'clear_flag', target: 'captured_by_copperheads' },
      ],
      choices: [
        {
          text: 'Thank you.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'copperhead_origin',
      text: "Formed it from scratch. People who had nothin' left to lose. Former miners, ranchers who lost their land, workers blacklisted for speakin' up. We ain't saints, but we ain't devils neither. We hit IVRC where it hurts and share what we take with those who need it.",
      choices: [
        {
          text: 'Robin Hood of the frontier.',
          nextNodeId: 'robin_hood',
        },
        {
          text: 'How many are you?',
          nextNodeId: 'gang_numbers',
        },
      ],
    },
{
      id: 'robin_hood',
      text: "*She smirks* Somethin' like that. Though I ain't much for fancy tales. The reality is dirtier. We kill when we have to. We steal because we need to. But every coin we take from IVRC is one less they can use to crush people.",
      choices: [
        {
          text: 'The ends justify the means?',
          nextNodeId: 'ends_means',
        },
      ],
    },
{
      id: 'ends_means',
      text: "Don't lecture me about morality. IVRC works men to death in the mines and calls it 'employment.' They poison the water and call it 'progress.' At least I'm honest about what I am. Can Thorne say the same?",
      choices: [
        {
          text: 'You have a point.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
];
