import type { DialogueNode } from '../../../schemas/npc.ts';

export const father_miguel_nodes_1: DialogueNode[] = [
{
      id: 'family_resistance',
      text: "*He stares at you for a long moment, then his eyes fill with tears* Your family... there were many families in the Alliance. Good people. Brave people. Most of them paid a terrible price for standing up to IVRC. *He takes your hands* If you are their child, then you carry something important. A legacy.",
      expression: 'emotional',
      onEnterEffects: [
        { type: 'set_flag', target: 'miguel_recognizes_heritage' },
        { type: 'change_reputation', value: 15 },
      ],
      choices: [
        {
          text: 'Tell me about the Alliance. About what they fought for.',
          nextNodeId: 'alliance_story',
        },
        {
          text: 'Did you know my family?',
          nextNodeId: 'know_family',
        },
      ],
    },
{
      id: 'finding_out',
      text: "Then we will find out together. *He nods firmly* The gear symbol was used by the Workers' Alliance - people who organized against IVRC's abuses. I helped them. Hid them in this church when Thorne's men came looking. That was years ago. If someone is reviving the cause...",
      choices: [
        {
          text: 'You were part of the resistance?',
          nextNodeId: 'miguel_resistance',
        },
        {
          text: 'What happened to the Alliance?',
          nextNodeId: 'alliance_story',
        },
      ],
    },
{
      id: 'miguel_resistance',
      text: "Not the violence. Never the violence. But I provided sanctuary. This church has a... *He hesitates* ...a basement. It has sheltered many souls over the years. Workers escaping debt bondage. Families fleeing IVRC's enforcers. *He meets your eyes* It still does.",
      onEnterEffects: [{ type: 'set_flag', target: 'miguel_revealed_underground' }],
      choices: [
        {
          text: "You run an underground railroad.",
          nextNodeId: 'underground_confirmed',
        },
        {
          text: "That's incredibly dangerous.",
          nextNodeId: 'danger_acknowledged',
        },
      ],
    },
{
      id: 'underground_confirmed',
      text: "*He nods slowly* Chen Wei and I together. He heals them. I hide them. When it is safe, we send them north, to territories where IVRC has no reach. It is slow work. Dangerous work. But every life we save is a prayer answered.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_underground_railroad' }],
      choices: [
        {
          text: 'How can I help?',
          nextNodeId: 'help_underground',
        },
        {
          text: "I won't tell a soul.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'help_underground',
      text: "*His face breaks into a genuine smile* You would help? Truly? *He clasps your hands* We need supplies - food, blankets, medicine. We need safe houses along the northern route. And most of all... we need someone who can move freely. Someone IVRC is not watching.",
      onEnterEffects: [{ type: 'start_quest', target: 'sanctuary' }],
      choices: [
        {
          text: "I'm that someone. What do you need first?",
          nextNodeId: 'first_task',
        },
        {
          text: "I'll do what I can.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },
{
      id: 'first_task',
      text: "There is a family - a miner and his wife and children - hiding in a cabin north of town. IVRC enforcers are searching for them. They need to reach this church before nightfall. The enforcers patrol the main road, so they must go through the back trails. Can you guide them?",
      choices: [
        {
          text: "Tell me where the cabin is. I'll bring them safely.",
          nextNodeId: null,
          effects: [
            { type: 'set_flag', target: 'accepted_sanctuary_mission' },
            { type: 'unlock_location', target: 'northern_cabin' },
          ],
        },
        {
          text: "I'll need to prepare first, but I'll help.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'will_help_sanctuary' }],
        },
      ],
    },
{
      id: 'danger_acknowledged',
      text: "Every day I wake knowing it could be my last. *He smiles gently* But I have made my peace with God. If Thorne's men come for me, they will find a man who is not afraid. Fear is a luxury for those who have something to lose. I have only my conscience, and that is clear.",
      choices: [
        {
          text: "You're a braver man than most.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: 'How can I help?',
          nextNodeId: 'help_underground',
        },
      ],
    },
{
      id: 'alliance_story',
      text: "The Workers' Alliance formed five years ago, when conditions in the IVRC mines became unbearable. Miners, farmers, townsfolk - people from every background came together. They organized strikes, petitioned the territorial government, documented IVRC's abuses. For a brief time, there was hope.",
      choices: [
        {
          text: 'What happened?',
          nextNodeId: 'alliance_fall',
        },
      ],
    },
{
      id: 'alliance_fall',
      text: "Betrayal. Someone inside the Alliance fed information to IVRC. Names, meeting places, plans. Thorne's Pinkertons struck at dawn. Leaders arrested. Documents seized. The organization shattered in a single night. *He pauses* Those who escaped split into factions. The Copperheads chose violence. The Freeminers chose isolation. Both chose fear.",
      expression: 'sad',
      onEnterEffects: [{ type: 'set_flag', target: 'knows_alliance_history' }],
      choices: [
        {
          text: 'Who was the traitor?',
          nextNodeId: 'traitor_discussion',
        },
        {
          text: 'Could the Alliance be rebuilt?',
          nextNodeId: 'alliance_rebuild',
        },
        {
          text: "Samuel Ironpick was part of this.",
          nextNodeId: 'samuel_alliance',
        },
      ],
    },
{
      id: 'traitor_discussion',
      text: "*His expression darkens* I have my suspicions. But suspicion without proof is just another form of poison. It has already torn apart people who should be allies. Diamondback suspects the Freeminers. Samuel suspects the townfolk. And the truth hides in the shadows while good people point fingers.",
      choices: [
        {
          text: 'Do you think the traitor is still around?',
          nextNodeId: 'traitor_still_around',
        },
        {
          text: 'Finding the truth might heal those divisions.',
          nextNodeId: 'healing_divisions',
        },
      ],
    },
{
      id: 'traitor_still_around',
      text: "Possibly. Or they may have been eliminated by IVRC once they were no longer useful. Thorne discards tools as easily as he acquires them. *He sighs* If the traitor lives, they carry a burden that no confession can lift. I pray for their soul, even as I curse their actions.",
      choices: [
        {
          text: "That's remarkably forgiving.",
          nextNodeId: null,
        },
        {
          text: 'I intend to find the truth.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'seeking_traitor_identity' }],
        },
      ],
    },
{
      id: 'healing_divisions',
      text: "*He looks at you with something like hope* Si. Yes. That is exactly what is needed. If the factions could unite again - Copperheads, Freeminers, townfolk - IVRC could not stand against them. But unity requires trust, and trust requires truth. Someone must be the bridge.",
      choices: [
        {
          text: "I could be that bridge.",
          nextNodeId: 'be_the_bridge',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: "It won't be easy.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'be_the_bridge',
      text: "*His eyes shine* Then you have my blessing, for whatever that is worth. Speak to Samuel in the mountains. Speak to Diamondback if you can reach her. Tell them Father Miguel asks them to listen - just listen - before they judge. And if they need proof of good faith... send them to me.",
      onEnterEffects: [{ type: 'set_flag', target: 'miguel_endorsement' }],
      choices: [
        {
          text: "I'll carry your message.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'samuel_alliance',
      text: "Samuel was one of the founders. A good man - steady, honest, stubborn as a mule. When the Alliance fell, he lost everything. His son died in an IVRC mine shortly after. He took young Maggie and retreated to the mountains. I have not seen him in two years, but I pray for him daily.",
      choices: [
        {
          text: "He's still up there. Leading the Freeminers.",
          nextNodeId: 'samuel_leads',
        },
        {
          text: 'Were you close?',
          nextNodeId: 'miguel_samuel_friendship',
        },
      ],
    },
{
      id: 'samuel_leads',
      text: "Leading? *He smiles* That does not surprise me. Samuel was always the one others turned to. Not because he sought it, but because he could be trusted. *His smile fades* But leading a resistance in the mountains is a slow death. They need supplies, allies, hope. They need to know they are not forgotten.",
      choices: [
        {
          text: "I plan to find him.",
          nextNodeId: 'find_samuel_blessing',
        },
        {
          text: 'Can you get word to him?',
          nextNodeId: 'word_to_samuel',
        },
      ],
    },
{
      id: 'find_samuel_blessing',
      text: "*He makes the sign of the cross over you* Then go with God's protection. Tell Samuel that Miguel has not forgotten. That the church basement still has room. And that... *his voice catches* ...that I am sorry I could not save his son. I have carried that guilt every day since.",
      onEnterEffects: [{ type: 'set_flag', target: 'carries_miguel_message' }],
      choices: [
        {
          text: "I'll tell him. Thank you, Father.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
];
