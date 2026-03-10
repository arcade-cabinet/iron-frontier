import type { DialogueNode } from '../../../schemas/npc.ts';

export const father_miguel_nodes_3: DialogueNode[] = [
{
      id: 'town_history_interest',
      text: "*He sets down his broom and sits on the church steps* History is my weakness. I have watched this town grow from a water stop to a settlement to whatever it is now. A crossroads of hope and desperation. What would you like to know?",
      choices: [
        {
          text: 'How did the town get started?',
          nextNodeId: 'town_origins',
        },
        {
          text: 'What was it like before IVRC came?',
          nextNodeId: 'before_ivrc',
        },
        {
          text: 'Tell me about the people here.',
          nextNodeId: 'people_overview',
        },
      ],
    },
{
      id: 'town_origins',
      text: "Water. Everything on the frontier begins and ends with water. There is a natural spring here - dusty, but reliable. The first settlers came for it. Then the ranchers. Then the miners. And finally, the railroad. Each wave changed the town. Not always for the better.",
      choices: [
        {
          text: 'And the railroad changed everything.',
          nextNodeId: 'railroad_changed',
        },
        {
          text: 'Who were the first settlers?',
          nextNodeId: 'first_settlers',
        },
      ],
    },
{
      id: 'railroad_changed',
      text: "Like a second flood. Suddenly there was money, commerce, connection to the outside world. But also exploitation, corruption, and the slow death of independence. The railroad giveth and the railroad taketh away. *He smiles wryly* That is not scripture, but perhaps it should be.",
      choices: [
        {
          text: "You have a gift for words, Father.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'first_settlers',
      text: "Hardy folk. The Ironpicks, the Holts, a few others. They came with nothing but determination and pickaxes. Built homes, dug wells, planted roots in hard soil. Thomas Holt built the first general store. Samuel Ironpick found the first copper vein. Both families shaped this town's soul.",
      choices: [
        {
          text: 'And now one is dead and the other exiled.',
          nextNodeId: 'founders_fate',
        },
        {
          text: 'Thank you for the history.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'founders_fate',
      text: "*He nods heavily* That is the tragedy of Dusty Springs. The people who built it are the ones who have suffered most for it. Thomas Holt dead. Samuel Ironpick driven to the mountains. And the town they loved... slowly consumed by the very progress they invited. There is a sermon in that, but it is one I cannot bear to preach.",
      expression: 'sorrowful',
      choices: [
        {
          text: 'Maybe the story can still have a different ending.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'before_ivrc',
      text: "Simpler. Harder, but more honest. People worked for themselves, answered to no one. There was danger - bandits, drought, sickness - but there was also freedom. Real freedom, not the IVRC version where you're free to work yourself to death for company scrip.",
      choices: [
        {
          text: 'Do you think that freedom can come back?',
          nextNodeId: 'freedom_return',
        },
        {
          text: "Sounds like paradise lost.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'freedom_return',
      text: "With God, all things are possible. *He smiles* And with determined people, many things are probable. It would take unity, courage, and evidence strong enough to bring outside attention. But yes - I believe it can happen. I must believe it. Otherwise, what am I doing here?",
      choices: [
        {
          text: "Building something worth believing in.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'people_overview',
      text: "Where to begin? Sheriff Cole - a good man trapped by a corrupt system. Mayor Holt - a complicated woman doing her best in impossible circumstances. Doc Chen - the wisest person in this territory, and the most quietly brave. And then there are others, on the fringes...",
      choices: [
        {
          text: 'Tell me about Diamondback.',
          nextNodeId: 'miguel_on_diamondback',
        },
        {
          text: 'Tell me about the Freeminers.',
          nextNodeId: 'miguel_on_freeminers',
        },
        {
          text: "Thank you. That's helpful.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'miguel_on_diamondback',
      text: "Dolores Vega. *He sighs* A woman consumed by righteous anger. She was wronged by IVRC - terribly wronged - and chose revenge. I cannot condone her methods, but I understand her pain. She has come to this church, you know. Late at night, when no one is watching. Even outlaws need absolution.",
      choices: [
        {
          text: 'Could she be reasoned with?',
          nextNodeId: 'reason_with_diamondback',
        },
        {
          text: "Everyone needs someone to listen.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'reason_with_diamondback',
      text: "Perhaps. Her rage is real, but so is her love for the workers she protects. If someone showed her a path to justice that didn't require bloodshed... she might listen. But it would have to be someone who has earned her respect. That is no easy thing.",
      choices: [
        {
          text: "I'll find a way.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'will_approach_diamondback' }],
        },
      ],
    },
{
      id: 'miguel_on_freeminers',
      text: "Mountain folk, led by my old friend Samuel. They are the last holdouts against IVRC's total control of the mining territory. Independent, proud, suspicious of outsiders. They have reason to be. Too many strangers have come offering friendship and delivering betrayal.",
      choices: [
        {
          text: "You're still connected to them?",
          nextNodeId: 'connected_to_freeminers',
        },
        {
          text: 'How do I earn their trust?',
          nextNodeId: 'earn_freeminer_trust',
        },
      ],
    },
{
      id: 'connected_to_freeminers',
      text: "In spirit, always. In practice... the roads are watched, the passes are dangerous, and I am not a young man anymore. I send what I can through traders - supplies, messages. But Samuel has not replied in months. I worry.",
      choices: [
        {
          text: "I'll check on him when I go north.",
          nextNodeId: null,
          effects: [
            { type: 'set_flag', target: 'will_check_on_samuel_for_miguel' },
            { type: 'change_reputation', value: 5 },
          ],
        },
      ],
    },
{
      id: 'earn_freeminer_trust',
      text: "Actions, not words. Bring them something they need - food, medicine, ammunition. Defend them against claim jumpers. And most importantly, do not bring the stink of IVRC with you. They can smell it like wolves smell blood.",
      choices: [
        {
          text: 'Good advice. Thank you.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'how_long',
      text: "Twenty years in the territories. Fifteen here in Dusty Springs. I built this church with the help of the miners and their families. Every adobe brick was made by hands that had been swinging pickaxes all day. They gave their labor freely. That tells you what kind of people live here.",
      choices: [
        {
          text: "And you've served them all that time.",
          nextNodeId: 'served_long',
        },
        {
          text: 'The miners built this? Not IVRC?',
          nextNodeId: 'miners_built_it',
        },
      ],
    },
{
      id: 'served_long',
      text: "Served? I prefer to say 'walked alongside.' I baptize their children, marry their young, and bury their dead. Too often the last one. *His eyes grow distant* The mines take more than ore from the earth. They take fathers, sons, futures.",
      expression: 'sad',
      choices: [
        {
          text: "That must weigh on you.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: 'Is anything being done about the mine safety?',
          nextNodeId: 'mine_safety',
        },
      ],
    },
{
      id: 'miners_built_it',
      text: "*He laughs* IVRC? They offered to fund a 'proper' church once. With an IVRC plaque above the door and a requirement to include 'company prayers' in the service. *His laughter dies* I declined. This church belongs to the people, not the corporation.",
      choices: [
        {
          text: "'Company prayers'?",
          nextNodeId: 'company_prayers',
        },
        {
          text: 'Good for you.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'company_prayers',
      text: "Prayers for productivity. Prayers for obedience. Prayers thanking God for the opportunity to work in IVRC's mines. *His voice drips with disgust* As if God created the poor so the rich could exploit them. That is blasphemy dressed in a Sunday suit.",
      choices: [
        {
          text: "I can see why you turned them down.",
          nextNodeId: null,
        },
      ],
    },
];
