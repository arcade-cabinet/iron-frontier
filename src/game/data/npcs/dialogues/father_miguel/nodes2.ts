import type { DialogueNode } from '../../../schemas/npc.ts';

export const father_miguel_nodes_2: DialogueNode[] = [
{
      id: 'word_to_samuel',
      text: "I have tried. Sent messages with traders, with travelers. None returned with a reply. The Freeminers trust no one from town. Perhaps a fresh face would have better luck. *He looks at you meaningfully* Someone carrying a message and the gear symbol, perhaps.",
      choices: [
        {
          text: 'I could carry your message.',
          nextNodeId: 'find_samuel_blessing',
        },
        {
          text: "I'll think about it.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'miguel_samuel_friendship',
      text: "Like brothers. We came to this territory around the same time - he seeking silver, I seeking souls. Neither of us found what we expected. *He laughs softly* Instead we found each other, and a cause worth fighting for. I miss him. The mountains may as well be the moon.",
      choices: [
        {
          text: "I plan to go there. I could carry a message.",
          nextNodeId: 'find_samuel_blessing',
        },
        {
          text: 'Old friendships die hard.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'know_family',
      text: "*He thinks carefully* There were many families. The Martinez family, the O'Briens, the Chens... *He pauses* What was your family name? Perhaps I remember.",
      choices: [
        {
          text: "I'm not sure they used their real name. The letter is all I have.",
          nextNodeId: 'letter_only_clue',
        },
        {
          text: "I'd rather not say yet. I need to learn more first.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'letter_only_clue',
      text: "Then the letter is where we must start. The gear symbol, the address on Copper Street... these are breadcrumbs left for you by someone who wanted you to find the truth. Follow them. And when you need help, this church will always be open to you.",
      choices: [
        {
          text: 'Thank you, Father. That means more than you know.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'fire_investigation',
      text: "*His expression hardens - a rare sight on his gentle face* The fire. Yes. I watched it burn from this window. *He points* That was no accident, my friend. That was a message. IVRC erasing evidence, erasing history. They are very good at it.",
      choices: [
        {
          text: 'What evidence was in that building?',
          nextNodeId: 'building_evidence',
        },
        {
          text: 'Did you see who set the fire?',
          nextNodeId: 'who_set_fire',
        },
      ],
    },
{
      id: 'building_evidence',
      text: "The Ironpick family kept records there. Documents, ledgers, letters between IVRC executives discussing... criminal activities. Mine safety cover-ups. Bribery. Even murder. Samuel Ironpick spent years collecting that evidence. It was his life's work after losing his son.",
      choices: [
        {
          text: 'Was it all destroyed?',
          nextNodeId: 'evidence_destroyed',
        },
        {
          text: 'Where is Samuel now?',
          nextNodeId: 'samuel_leads',
        },
      ],
    },
{
      id: 'evidence_destroyed',
      text: "*A faint smile crosses his face* Samuel Ironpick is many things, but stupid is not one of them. He would not have kept everything in one place. Copies, perhaps. Hidden in the mountains, or with trusted friends. *He pauses* I may know where some of it is. But that knowledge is dangerous to share.",
      onEnterEffects: [{ type: 'set_flag', target: 'miguel_knows_evidence_location' }],
      choices: [
        {
          text: "I need that knowledge to stop IVRC.",
          nextNodeId: 'evidence_location',
          conditions: [{ type: 'reputation_gte', value: 30 }],
        },
        {
          text: "I understand. When you're ready to trust me.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'evidence_location',
      text: "*He looks around the empty church, then lowers his voice* Samuel gave me a sealed envelope before he left for the mountains. He said to give it to someone worthy - someone carrying the gear. *He reaches into his robes* I believe that person is you.",
      onEnterEffects: [
        { type: 'give_item', target: 'ironpick_sealed_envelope' },
        { type: 'set_flag', target: 'received_ironpick_envelope' },
      ],
      choices: [
        {
          text: "I'll guard this with my life.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },
{
      id: 'who_set_fire',
      text: "I saw shadows. Three figures, moving quickly, professional. They poured something on the walls - coal oil, I think - and struck a match. By the time I reached the street, the building was engulfed. They vanished like smoke themselves.",
      choices: [
        {
          text: "IVRC's people.",
          nextNodeId: 'ivrc_arsonists',
        },
        {
          text: 'Did anyone else see anything?',
          nextNodeId: 'other_witnesses',
        },
      ],
    },
{
      id: 'ivrc_arsonists',
      text: "Pinkertons, most likely. Or hired men. Thorne never dirties his own hands. *He clenches his calloused fists* I wanted to stop them. But a priest with no weapon against three men with guns... I prayed instead. It felt inadequate.",
      expression: 'anguished',
      choices: [
        {
          text: 'Prayer has its place. So does action.',
          nextNodeId: null,
        },
        {
          text: "You can't fight alone. That's why I'm here.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'other_witnesses',
      text: "If they did, they know better than to speak. Fear is IVRC's most effective tool. More powerful than guns or money. When people are afraid, they see nothing, hear nothing, know nothing. It is a slow poison that kills a community's spirit.",
      choices: [
        {
          text: "Fear can be overcome.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'disappearances_interest',
      text: "*He grows very still* The disappearances. Yes. Miners who go into the deep mountains and do not return. I have blessed six families this year alone who lost someone. *He pauses* But there is something else. Something the families do not speak of openly.",
      choices: [
        {
          text: 'What is it?',
          nextNodeId: 'underground_rumors',
        },
        {
          text: "What aren't they saying?",
          nextNodeId: 'underground_rumors',
        },
      ],
    },
{
      id: 'underground_rumors',
      text: "The miners who do return - the ones who come back changed, frightened - they speak of sounds deep underground. Not natural sounds. Metallic. Rhythmic. Like... machinery. And one man, before he fled town, told me he saw writing on a wall deep in a tunnel. Writing in no language he had ever seen.",
      expression: 'troubled',
      onEnterEffects: [{ type: 'set_flag', target: 'miguel_told_underground_rumors' }],
      choices: [
        {
          text: 'Writing underground? Like ruins?',
          nextNodeId: 'ruins_discussion',
        },
        {
          text: 'Could it be an old mine?',
          nextNodeId: 'old_mine_theory',
        },
      ],
    },
{
      id: 'ruins_discussion',
      text: "Older than any ruin I know of. This territory has seen many peoples - the native tribes, the Spanish, the Americans. But what this man described... it was something else. Something from before all of them. *He crosses himself* I am a man of faith, but some things test even that.",
      choices: [
        {
          text: "This could be connected to why IVRC wants the mining claims.",
          nextNodeId: 'ivrc_connection',
        },
        {
          text: "I'll investigate when I reach the mountains.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'will_investigate_underground' }],
        },
      ],
    },
{
      id: 'old_mine_theory',
      text: "No mine I have ever heard of has smooth metal walls and strange writing. And the sounds... *He shakes his head* Mines creak, groan, sometimes collapse. They do not hum. Whatever is down there, it was built. The question is by whom, and for what purpose.",
      choices: [
        {
          text: "Maybe that's what IVRC is really after.",
          nextNodeId: 'ivrc_connection',
        },
        {
          text: "Strange things happen on the frontier.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'ivrc_connection',
      text: "You may be right. IVRC's obsession with the mining claims never made sense purely for copper. The ore is middling quality, the veins are thinning. But if there is something else underground... *His eyes widen* That would explain everything. The forced buyouts, the disappearances, the secrecy.",
      onEnterEffects: [{ type: 'set_flag', target: 'miguel_suspects_ivrc_secret' }],
      choices: [
        {
          text: 'Samuel Ironpick might know more.',
          nextNodeId: 'samuel_leads',
        },
        {
          text: "I need to see it for myself.",
          nextNodeId: null,
        },
      ],
    },
];
