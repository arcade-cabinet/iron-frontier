/**
 * Father Miguel Santos - Dialogue Trees
 *
 * A former missionary who lost faith in the Church but not in God.
 * Runs an underground railroad for escaped IVRC workers, hiding them
 * in the church basement. Gentle, wise, and quietly subversive.
 * Partners with Doc Chen in the underground resistance.
 */

import type { DialogueTree } from '../../schemas/npc';

export const FatherMiguelMainDialogue: DialogueTree = {
  id: 'father_miguel_main',
  name: 'Father Miguel - Main Conversation',
  description: 'Primary dialogue tree for Father Miguel Santos',
  tags: ['dusty_springs', 'spiritual', 'underground', 'sanctuary'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'underground_active',
      conditions: [{ type: 'quest_active', target: 'sanctuary' }],
      priority: 8,
    },
    {
      nodeId: 'trusted_greeting',
      conditions: [{ type: 'reputation_gte', value: 40 }],
      priority: 5,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
    // ========================================================================
    // FIRST MEETING
    // ========================================================================
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

    // ========================================================================
    // TOWN HISTORY
    // ========================================================================
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

    // ========================================================================
    // HOW LONG / CHURCH PURPOSE
    // ========================================================================
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

    {
      id: 'mine_safety',
      text: "Doc Chen documents what he can. I write letters to the territorial authorities. Sheriff Cole files reports. All of it disappears into a bureaucratic void. IVRC's lawyers are very efficient at making complaints vanish. Without hard evidence - the kind that can't be buried - nothing changes.",
      choices: [
        {
          text: 'There must be evidence somewhere.',
          nextNodeId: 'evidence_destroyed',
        },
        {
          text: "Don't lose hope.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'church_purpose',
      text: "This church is many things. A place of worship, yes. But also a school, a hospital when Doc Chen's office overflows, a shelter in storms. *He lowers his voice* And sometimes... a hiding place for those who have nowhere else to go.",
      choices: [
        {
          text: 'A hiding place?',
          nextNodeId: 'lawbreaking_hint',
        },
        {
          text: "A church that serves its community. As it should be.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'open_to_all',
      text: "Rare, yes. But necessary. IVRC divides people - by race, by language, by how much they owe the company store. In this church, the Chinese miner sits beside the Mexican farmer sits beside the American rancher. We are all equal before God and before the frontier.",
      choices: [
        {
          text: "That's a powerful statement in a divided town.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: 'Does IVRC approve of your open-door policy?',
          nextNodeId: 'ivrc_disapproval',
        },
      ],
    },

    {
      id: 'ivrc_disapproval',
      text: "*He smiles* They tolerate it because shutting down a church would be bad for their reputation back east. Even Cornelius Thorne must maintain appearances. But there have been... suggestions. That I should preach more about the virtue of hard work and less about the rights of workers.",
      choices: [
        {
          text: "And you ignore those suggestions.",
          nextNodeId: null,
        },
      ],
    },

    // ========================================================================
    // RETURN VISITS
    // ========================================================================
    {
      id: 'return_greeting',
      text: "*Father Miguel looks up from his Bible with a warm smile* Ah, my friend returns. Come, sit. How are you? And I do not mean your body - Doc Chen can tend to that. How is your spirit?",
      expression: 'warm',
      choices: [
        {
          text: "Honestly? This territory weighs on me.",
          nextNodeId: 'spiritual_guidance',
        },
        {
          text: "I'm well. Any news from the underground?",
          nextNodeId: 'underground_news',
          conditions: [{ type: 'flag_set', target: 'knows_underground_railroad' }],
        },
        {
          text: 'I wanted to ask about the town history.',
          nextNodeId: 'town_history_interest',
        },
        {
          text: 'Just wanted to visit. This place is peaceful.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'spiritual_guidance',
      text: "*He nods knowingly* The frontier tests us all. It strips away pretense, leaves us face to face with what we truly are. That can be frightening. *He places a hand on your shoulder* But remember - you chose to be here. Whatever brought you, you chose to stay and fight. That says something about who you are.",
      choices: [
        {
          text: 'Do you ever doubt, Father?',
          nextNodeId: 'miguel_doubts',
        },
        {
          text: 'Thank you. I needed to hear that.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'miguel_doubts',
      text: "Every day. *He laughs gently* A priest who does not doubt is not thinking. I doubt my choices, my courage, my ability to make a difference. But then I see a child I helped bring into this world, or a worker who escaped because of our underground... and the doubt fades. Purpose is the antidote to doubt.",
      expression: 'thoughtful',
      choices: [
        {
          text: "Wise words.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'underground_news',
      text: "*He moves closer, speaking quietly* We moved three families last week. All safe, thank God. But IVRC has increased patrols on the northern road. Someone is informing on us - or they are simply tightening control everywhere. Either way, it is getting harder.",
      choices: [
        {
          text: 'Do you need help with anything?',
          nextNodeId: 'help_needed',
        },
        {
          text: 'Be careful, Father.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'help_needed',
      text: "Always. We need supplies at the safe house north of town. And there is a woman at the Coppertown company barracks who wants out - she has two children. If you are heading that direction... *He presses a folded note into your hand* Give her this. She will know what it means.",
      onEnterEffects: [{ type: 'give_item', target: 'miguels_note' }],
      choices: [
        {
          text: "I'll see it done.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    // ========================================================================
    // TRUSTED GREETING
    // ========================================================================
    {
      id: 'trusted_greeting',
      text: "*Father Miguel embraces you warmly* Mi amigo! It is good to see you. The Lord's work continues because of people like you. Come - I have fresh coffee, and there is much to discuss.",
      expression: 'joyful',
      choices: [
        {
          text: 'Good to see you too, Father. What news?',
          nextNodeId: 'trusted_news',
        },
        {
          text: "I could use your counsel.",
          nextNodeId: 'spiritual_guidance',
        },
        {
          text: "How's the underground?",
          nextNodeId: 'underground_news',
        },
      ],
    },

    {
      id: 'trusted_news',
      text: "The wind is changing, friend. I feel it. More people are speaking up, quietly. The fear that IVRC built is cracking. And the evidence you have been gathering... it gives people hope. Hope is the most dangerous weapon against tyranny.",
      choices: [
        {
          text: "We're not done yet. But we're getting closer.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    // ========================================================================
    // QUEST ACTIVE STATE
    // ========================================================================
    {
      id: 'underground_active',
      text: "*Father Miguel hurries to meet you, anxiety etched on his face* Thank God you're here. We have a situation. Have you made progress with the sanctuary work?",
      expression: 'anxious',
      choices: [
        {
          text: "I'm working on it. What's the situation?",
          nextNodeId: 'sanctuary_update',
        },
        {
          text: "The family is safe. I got them through.",
          nextNodeId: 'family_safe',
          conditions: [{ type: 'flag_set', target: 'sanctuary_family_rescued' }],
        },
      ],
    },

    {
      id: 'sanctuary_update',
      text: "IVRC enforcers are getting closer to the northern safe house. We may need to move our route. And Doc Chen says he is running low on the medicines we send with the families. If you can help with either of these things...",
      choices: [
        {
          text: "I'll handle the safe house first.",
          nextNodeId: null,
        },
        {
          text: "I'll get Doc Chen the supplies he needs.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'family_safe',
      text: "*His face floods with relief, and he clasps your hands* Gracias a Dios. Thank you, my friend. You have saved lives today. Those children will grow up free because of what you did. *His eyes glisten* That is worth more than all the gold in these mountains.",
      expression: 'joyful',
      onEnterEffects: [
        { type: 'change_reputation', value: 20 },
        { type: 'advance_quest', target: 'sanctuary' },
      ],
      choices: [
        {
          text: "Anyone would have done the same.",
          nextNodeId: null,
        },
        {
          text: "Don't thank me yet. There are more families to save.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'dedicated_to_underground' }],
        },
      ],
    },

    {
      id: 'alliance_rebuild',
      text: "*His eyes light up with a fire that seems almost too young for his weathered face* Rebuilt? That is the dream I carry in my heart every day. If the Copperheads, the Freeminers, and the townfolk could unite again... IVRC could not stand against them. But it would take a miracle. Or perhaps... just the right person.",
      choices: [
        {
          text: "Then let's make that miracle happen.",
          nextNodeId: 'be_the_bridge',
        },
        {
          text: "One step at a time.",
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const FatherMiguelDialogues = [FatherMiguelMainDialogue];
