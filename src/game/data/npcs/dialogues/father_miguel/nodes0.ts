import type { DialogueNode } from '../../../schemas/npc.ts';

export const father_miguel_nodes_0: DialogueNode[] = [
{
      id: 'first_meeting',
      text: "*A gentle man in worn priest's robes looks up from sweeping the church steps. His hands are calloused, his smile warm.* Bienvenido, stranger. Welcome to St. Michael's. You look like someone who has traveled far. Would you rest a while?",
      expression: 'warm',
      choices: [
        {
          text: 'Thank you, Father. This is a peaceful place.',
          nextNodeId: 'peaceful_response',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: "I'm not much for religion, but I appreciate the welcome.",
          nextNodeId: 'not_religious',
        },
        {
          text: "I've heard you know things about this town's history.",
          nextNodeId: 'town_history_interest',
        },
        {
          text: "Are you Father Miguel? I was told to find you.",
          nextNodeId: 'seeking_miguel',
          conditions: [{ type: 'flag_set', target: 'mayor_recommended_miguel' }],
        },
      ],
    },
{
      id: 'peaceful_response',
      text: "*He leans the broom against the wall* Peace is hard to come by on the frontier. This church is not much - adobe walls and a tin roof - but it is open to all who need it. God does not ask for papers or payment at the door. *His accent thickens* Neither do I.",
      choices: [
        {
          text: 'How long have you been here?',
          nextNodeId: 'how_long',
        },
        {
          text: 'A church open to all. That seems rare.',
          nextNodeId: 'open_to_all',
        },
        {
          text: "It's good to know there's somewhere safe in town.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'not_religious',
      text: "*He chuckles softly* God does not require belief to be generous. And a church is just a building until people fill it with purpose. Come in as a traveler, a neighbor, a friend. The label matters less than the intent.",
      choices: [
        {
          text: "That's an unusually open view for a priest.",
          nextNodeId: 'open_view',
        },
        {
          text: 'What purpose does this church serve?',
          nextNodeId: 'church_purpose',
        },
        {
          text: 'I appreciate that. Thank you.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'open_view',
      text: "The Church I left would disagree with me. *He smiles sadly* I was a missionary once. Sent to save souls in places that didn't ask to be saved. I learned more from the people I was sent to 'help' than they ever learned from me. Now I serve differently.",
      choices: [
        {
          text: 'You left the Church?',
          nextNodeId: 'left_church',
        },
        {
          text: 'What did you learn?',
          nextNodeId: 'lessons_learned',
        },
      ],
    },
{
      id: 'left_church',
      text: "I left the institution, not the faith. When the Church ordered me to bless a mining operation that was killing workers - to tell them their suffering was God's will... *His gentle voice hardens* I could not do that. So I came here. Built this place with my own hands. And I answer to a higher authority than Rome.",
      expression: 'determined',
      choices: [
        {
          text: 'That took courage.',
          nextNodeId: 'courage_response',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: "You're a man of conviction.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'courage_response',
      text: "Courage? *He shakes his head* No, mi amigo. Stubbornness, perhaps. Or guilt. I spent years telling people that their suffering had meaning while doing nothing to stop it. When I finally acted... it was not courage. It was shame that I had waited so long.",
      choices: [
        {
          text: "Better late than never.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: 'What do you do differently now?',
          nextNodeId: 'church_purpose',
        },
      ],
    },
{
      id: 'lessons_learned',
      text: "That suffering is not a test from God. It is a consequence of greed, indifference, and the powerful crushing the weak. That true ministry is not prayer alone - it is action. Feeding the hungry, sheltering the lost, and yes... sometimes breaking unjust laws.",
      onEnterEffects: [{ type: 'set_flag', target: 'miguel_hinted_at_lawbreaking' }],
      choices: [
        {
          text: 'Breaking laws? What do you mean?',
          nextNodeId: 'lawbreaking_hint',
        },
        {
          text: 'A radical philosophy for a priest.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'lawbreaking_hint',
      text: "*He glances around, then speaks more softly* When a law says a man must work until he dies because he owes a company for the shoes on his feet... that law is an abomination. And breaking it is not a sin. *He catches himself* But I speak too freely. Perhaps another time.",
      choices: [
        {
          text: 'I understand. Your secret is safe.',
          nextNodeId: null,
          effects: [
            { type: 'set_flag', target: 'miguel_trusts_player_slightly' },
            { type: 'change_reputation', value: 10 },
          ],
        },
        {
          text: 'You can trust me, Father.',
          nextNodeId: 'trust_building',
        },
      ],
    },
{
      id: 'trust_building',
      text: "*He studies you carefully* Trust is earned slowly and lost quickly. I have seen too many well-meaning strangers who could not keep silent when silence mattered. *He softens* But you have kind eyes. Perhaps. We shall see.",
      choices: [
        {
          text: "I'll prove myself through actions.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'seeking_miguel',
      text: "*His expression becomes guarded* Someone sent you to me? And who might that be?",
      expression: 'cautious',
      choices: [
        {
          text: 'Mayor Holt suggested I speak with you.',
          nextNodeId: 'mayor_sent',
        },
        {
          text: 'Doc Chen mentioned your name.',
          nextNodeId: 'doc_sent',
          conditions: [{ type: 'flag_set', target: 'doc_underground_hint' }],
        },
        {
          text: "I'd rather not say. But I'm looking into the Ironpick situation.",
          nextNodeId: 'ironpick_mention',
        },
      ],
    },
{
      id: 'mayor_sent',
      text: "*He relaxes slightly* Josephine. She carries a heavy burden, that one. Too proud to ask for help, too wise to refuse it. If she sent you... *He nods* Come inside. We should talk away from the street.",
      choices: [
        {
          text: 'Lead the way.',
          nextNodeId: 'inside_church',
        },
      ],
    },
{
      id: 'doc_sent',
      text: "*His eyes light up* Chen Wei is my oldest friend in this territory. If he trusts you enough to speak my name... *He takes your arm* Come. Inside. Quickly, please.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: 'Of course.',
          nextNodeId: 'inside_church',
        },
      ],
    },
{
      id: 'ironpick_mention',
      text: "*He freezes mid-step* The Ironpick situation. *He looks up and down the street, then takes your elbow firmly* Inside. Now. Those are not words to speak where the wind can carry them.",
      expression: 'alarmed',
      choices: [
        {
          text: 'Right behind you.',
          nextNodeId: 'inside_church',
        },
      ],
    },
{
      id: 'inside_church',
      text: "*He closes the heavy door behind you. The church is simple - rough-hewn pews, a modest altar, candles burning in the dim light.* Now. Tell me everything, from the beginning. Why are you here, and what do you know about Samuel Ironpick?",
      choices: [
        {
          text: "I received a letter with a gear symbol, directing me to Dusty Springs.",
          nextNodeId: 'gear_symbol_reaction',
        },
        {
          text: "I'm investigating the fire at 14 Copper Street.",
          nextNodeId: 'fire_investigation',
        },
        {
          text: "People have been disappearing in the mountains. I want to know why.",
          nextNodeId: 'disappearances_interest',
        },
      ],
    },
{
      id: 'gear_symbol_reaction',
      text: "*He crosses himself* Madre de Dios. The gear. *He sits heavily in a pew* I thought that symbol died with the Alliance. If someone is using it again... *He looks at you with new intensity* Who are you? Are you connected to the old resistance?",
      expression: 'shocked',
      choices: [
        {
          text: "I think my family was. The letter seems to be from a relative.",
          nextNodeId: 'family_resistance',
        },
        {
          text: "I don't know. I'm trying to find out.",
          nextNodeId: 'finding_out',
        },
      ],
    },
];
