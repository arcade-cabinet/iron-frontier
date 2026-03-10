import type { DialogueNode } from '../../../schemas/npc.ts';

export const doc_chen_nodes_2: DialogueNode[] = [
{
      id: 'brave_foolish',
      text: '*He smiles slightly* A wise observation. Perhaps there is hope for you yet. *He returns to his work* Come back if you learn more. I am interested in where this thread leads.',
      choices: [
        {
          text: 'I will. Thank you.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'letter_secretive',
      text: 'Secrets have their place. *He nods* But remember - secrets can also isolate. If you find yourself in need of an ally, my door is open. I have kept many confidences in my time here.',
      choices: [
        {
          text: "I'll remember that.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'power_dynamics',
      text: 'Ah, a student of politics. *He sets aside his work* In Dusty Springs, power flows like this: IVRC at the top, Mayor Holt as their local voice, Sheriff Cole struggling to maintain true law. Father Miguel holds moral authority. And the rest of us... we navigate as best we can.',
      choices: [
        {
          text: 'Where do the Copperheads fit in?',
          nextNodeId: 'copperhead_fit',
        },
        {
          text: 'And the Freeminers?',
          nextNodeId: 'freeminer_fit',
        },
        {
          text: 'Where do you fit in?',
          nextNodeId: 'doc_fit',
        },
      ],
    },
{
      id: 'copperhead_fit',
      text: "Outside the system, attacking it. Diamondback Dolores sees herself as a freedom fighter. IVRC sees her as a criminal. The truth? Somewhere between. She hurts the railroad's profits, which helps the workers. But violence breeds violence.",
      choices: [
        {
          text: 'Do you support her?',
          nextNodeId: 'support_copperhead',
        },
        {
          text: 'I see.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'support_copperhead',
      text: "I support healing. When her people are injured, I treat them. When IVRC's men are injured, I treat them too. *He shrugs* Medicine does not take sides. But if you ask where my sympathies lie... I have never seen IVRC heal anyone.",
      choices: [
        {
          text: 'A telling point.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'freeminer_fit',
      text: 'The Freeminers resist more quietly. They control the independent claims in the mountains, refuse to sell to IVRC. Old Samuel Ironpick leads them - or tries to. They are losing ground each year as IVRC buys more land and hires more enforcers.',
      choices: [
        {
          text: 'Can they survive?',
          nextNodeId: 'freeminer_survival',
        },
      ],
    },
{
      id: 'freeminer_survival',
      text: 'Perhaps. They are stubborn, and the mountains favor defenders. But survival and victory are different things. Unless something changes - unless someone finds a way to shift the balance - they will eventually be absorbed or destroyed.',
      choices: [
        {
          text: 'Maybe something will change.',
          nextNodeId: 'change_hope',
        },
      ],
    },
{
      id: 'change_hope',
      text: '*He looks at you with renewed interest* Perhaps it already is. New faces sometimes bring new possibilities. *He returns to his herbs* We shall see what you become, stranger.',
      choices: [
        {
          text: 'We shall.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'doc_fit',
      text: '*He smiles* I am the one who patches everyone up afterward. In a territory of factions, the healer belongs to no side and all sides. It is a precarious position, but it has kept me alive this long.',
      choices: [
        {
          text: 'A clever strategy.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'town_overview',
      text: "Dusty Springs is the crossroads of the territory. All paths lead here eventually. The Mayor runs civil matters, the Sheriff keeps peace, Father Miguel tends souls. Everyone else is just trying to survive the squeeze between IVRC's expansion and outlaw desperation.",
      choices: [
        {
          text: 'Thank you for the overview.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'return_greeting',
      text: '*Doc Chen looks up from his work* Ah, you return. How fares your health? And your investigations?',
      expression: 'curious',
      choices: [
        {
          text: "I'm well. Any new developments?",
          nextNodeId: 'developments',
        },
        {
          text: 'I need supplies.',
          nextNodeId: 'medical_supplies',
        },
        {
          text: '[Browse Shop] Let me see what you have.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'doc_chen_shop' }],
          tags: ['shop'],
        },
        {
          text: 'Just checking in.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'wounded_greeting',
      text: '*Doc Chen takes one look at you and gestures to a chair* Sit. Let me see those wounds. *He begins preparing bandages* You can tell me what happened while I work.',
      choices: [
        {
          text: 'Thank you, Doc.',
          nextNodeId: 'treatment',
        },
      ],
    },
{
      id: 'treatment',
      text: '*He works efficiently, cleaning and bandaging* These are not life-threatening, but they tell a story. You have been somewhere dangerous. The question is whether that danger found you, or you found it.',
      choices: [
        {
          text: 'A bit of both.',
          nextNodeId: null,
          effects: [
            { type: 'clear_flag', target: 'player_wounded' },
            { type: 'take_gold', value: 15 },
          ],
        },
      ],
    },
{
      id: 'developments',
      text: 'The usual troubles. More miners coming in with lung problems. Rumors of Copperhead activity near the railroad. And the Mayor has been meeting with IVRC representatives again. Something is being planned, though I know not what.',
      choices: [
        {
          text: 'Keep me informed if you hear more.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
];
