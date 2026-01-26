/**
 * Father Miguel Santos - Dialogue Trees
 *
 * A gentle priest running an underground railroad for escaped IVRC workers.
 * Lost faith in the Church but not in God. Partners with Doc Chen in the
 * resistance. Located at St. Michael's Church in Dusty Springs.
 *
 * Character traits:
 * - Gentle, thoughtful, occasionally quotes scripture
 * - Spanish accent hints in dialogue
 * - Deeply compassionate, especially toward the oppressed
 * - Conflicted about his relationship with the institutional Church
 * - Quietly subversive, uses the sanctuary of the church for protection
 */

import type { DialogueTree } from '../../schemas/npc';

export const FatherMiguelMainDialogue: DialogueTree = {
  id: 'father_miguel_main',
  name: 'Father Miguel Santos - Main Conversation',
  description: 'Primary dialogue tree for Father Miguel Santos',
  tags: ['dusty_springs', 'spiritual', 'underground', 'sanctuary', 'quest_giver'],

  entryPoints: [
    {
      nodeId: 'player_harmed_workers',
      conditions: [{ type: 'flag_set', target: 'harmed_ivrc_workers' }],
      priority: 20,
    },
    {
      nodeId: 'sanctuary_quest_complete',
      conditions: [{ type: 'quest_complete', target: 'sanctuary' }],
      priority: 15,
    },
    {
      nodeId: 'sanctuary_quest_active',
      conditions: [{ type: 'quest_active', target: 'sanctuary' }],
      priority: 12,
    },
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'underground_revealed',
      conditions: [{ type: 'flag_set', target: 'knows_underground_railroad' }],
      priority: 8,
    },
    {
      nodeId: 'trusted_greeting',
      conditions: [{ type: 'reputation_gte', value: 40 }],
      priority: 5,
    },
    {
      nodeId: 'night_greeting',
      conditions: [{ type: 'time_of_day', stringValue: 'night' }],
      priority: 3,
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
      text: "*A gentle man in worn priest's robes looks up from tending candles at the altar. His hands are calloused, his eyes kind but shadowed with weariness.* Bienvenido, traveler. Welcome to St. Michael's. I am Father Miguel Santos. The door of this church, she is always open to those who seek... peace.",
      expression: 'warm',
      choices: [
        {
          text: 'Thank you, Father. This is a beautiful church.',
          nextNodeId: 'church_beauty',
        },
        {
          text: "I'm new to Dusty Springs. What can you tell me about the town?",
          nextNodeId: 'town_info',
        },
        {
          text: "I'm not much for religion, but I appreciate the welcome.",
          nextNodeId: 'not_religious',
        },
        {
          text: 'Peace seems hard to find in this territory.',
          nextNodeId: 'peace_difficult',
        },
      ],
    },

    {
      id: 'church_beauty',
      text: "*He smiles, a warmth reaching his tired eyes* Gracias. The people of this town, they built her with their own hands, back before... *he pauses* ...before the railroad came. Each beam, each stone carries the prayers of those who placed it. She is simple, si, but she is honest.",
      choices: [
        {
          text: "What changed when the railroad came?",
          nextNodeId: 'railroad_changes',
        },
        {
          text: 'You must have been here a long time.',
          nextNodeId: 'father_history',
        },
        {
          text: "It's peaceful here.",
          nextNodeId: 'peace_here',
        },
      ],
    },

    {
      id: 'railroad_changes',
      text: "*His expression darkens* Progress, they called it. But progress for whom, eh? The small ranchers lost their water rights. The independent miners were pushed out or... absorbed. And the workers IVRC brought in... *he crosses himself* ...they are not employees. They are prisoners who receive wages that go straight back to the company store.",
      expression: 'sad',
      choices: [
        {
          text: 'That sounds like debt slavery.',
          nextNodeId: 'debt_slavery',
        },
        {
          text: "Can't anyone do something?",
          nextNodeId: 'anyone_help',
        },
        {
          text: "I've heard similar stories elsewhere.",
          nextNodeId: 'similar_stories',
        },
      ],
    },

    {
      id: 'debt_slavery',
      text: "*He nods gravely* 'The borrower is slave to the lender,' says Proverbs. But this... this is worse. The company creates the debt, controls the prices, owns the housing. A man signs a contract for honest work and finds himself trapped for years. His family too. *His voice drops* Some try to escape. Most are caught.",
      onEnterEffects: [{ type: 'set_flag', target: 'father_mentioned_escapes' }],
      choices: [
        {
          text: 'What happens to those who are caught?',
          nextNodeId: 'caught_escapees',
        },
        {
          text: 'And those who succeed?',
          nextNodeId: 'successful_escapes',
          conditions: [{ type: 'reputation_gte', value: 15 }],
        },
        {
          text: "The law doesn't help?",
          nextNodeId: 'law_question',
        },
      ],
    },

    {
      id: 'caught_escapees',
      text: "*He closes his eyes briefly* They are returned to the camps. Their debt is increased - a fine for 'breach of contract.' Some are beaten, made examples. A few... disappear entirely. IVRC calls them 'labor discipline.' I call it what the scriptures call it: an abomination.",
      expression: 'pained',
      choices: [
        {
          text: 'Someone should stop them.',
          nextNodeId: 'stop_them',
        },
        {
          text: 'How do you bear witness to this?',
          nextNodeId: 'bearing_witness',
        },
      ],
    },

    {
      id: 'successful_escapes',
      text: "*He glances toward the door, then back to you. His voice becomes very quiet* Some... find their way to freedom. With help. There are paths through the mountains, safe houses along the way. People who risk everything to guide them. *He meets your eyes* 'I was a stranger, and you welcomed me.'",
      onEnterEffects: [{ type: 'set_flag', target: 'father_hinted_underground' }],
      choices: [
        {
          text: 'Are you one of those people, Father?',
          nextNodeId: 'are_you_involved',
          conditions: [{ type: 'reputation_gte', value: 20 }],
        },
        {
          text: 'That takes courage.',
          nextNodeId: 'courage_comment',
        },
        {
          text: "I won't ask more. Some things are better left unsaid.",
          nextNodeId: 'discretion',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'are_you_involved',
      text: "*He studies your face for a long moment, then sighs* You have kind eyes, my friend. And I am perhaps too tired to be as careful as I should be. *He gestures to a pew* Sit. Let me tell you a story - not confession, just... a story.",
      choices: [
        {
          text: '*Sit down and listen*',
          nextNodeId: 'underground_story',
        },
      ],
    },

    {
      id: 'underground_story',
      text: "*He sits beside you, hands folded* There was once a priest who came to the frontier full of faith in his Church. He believed the institution would protect the weak, as Christ commanded. But he watched that Church make... accommodations. With power. With money. IVRC donated handsomely, you see. And in return, certain questions were not asked.",
      expression: 'thoughtful',
      choices: [
        {
          text: 'Go on.',
          nextNodeId: 'story_continues',
        },
      ],
    },

    {
      id: 'story_continues',
      text: "*His voice grows heavier* This priest, he lost faith in his Church. But not in God. Never in God. And he remembered the words: 'Whatever you did for the least of these, you did for me.' So he began to help. Quietly. A family hidden in the cellar. A guide through the mountains. New papers, new names, new lives.",
      onEnterEffects: [
        { type: 'set_flag', target: 'knows_underground_railroad' },
        { type: 'change_reputation', value: 15 },
      ],
      choices: [
        {
          text: 'How can I help?',
          nextNodeId: 'offer_help_underground',
        },
        {
          text: 'You take a great risk, Father.',
          nextNodeId: 'risk_discussion',
        },
        {
          text: 'Does Doc Chen help you?',
          nextNodeId: 'doc_chen_connection',
        },
      ],
    },

    {
      id: 'offer_help_underground',
      text: "*His eyes widen slightly, then soften* You would risk yourself for strangers? *He clasps your hands* Bless you, child. There is always need. Right now, there is a family - a mother and two children - waiting for passage. But the usual route, it is watched. IVRC has men on the mountain trails.",
      choices: [
        {
          text: 'What do you need me to do?',
          nextNodeId: 'sanctuary_quest_start',
        },
        {
          text: "I'll help however I can.",
          nextNodeId: 'sanctuary_quest_start',
        },
      ],
    },

    {
      id: 'sanctuary_quest_start',
      text: "*He stands, suddenly animated* There is an old mining tunnel that leads through Iron Ridge - forgotten by IVRC but known to the Freeminers. If someone could scout the path, make sure it is safe, this family could reach Samuel Ironpick's people by week's end. They would be free.",
      onEnterEffects: [
        { type: 'start_quest', target: 'sanctuary' },
        { type: 'unlock_location', target: 'iron_ridge_tunnel' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: "I'll scout the tunnel.",
          nextNodeId: 'quest_accepted',
        },
        {
          text: 'Tell me more about this family.',
          nextNodeId: 'family_story',
        },
      ],
    },

    {
      id: 'quest_accepted',
      text: "*He grips your shoulder* Vaya con Dios, my friend. Go with God. The tunnel entrance is hidden behind the old Henderson claim - look for the stone marker with the gear symbol. *He presses a small iron key into your hand* This opens the gate. Return to me when you know the path is clear.",
      onEnterEffects: [{ type: 'give_item', target: 'tunnel_key' }],
      choices: [
        {
          text: "I won't fail them.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'family_story',
      text: "*He sits heavily* Maria Esperanza and her children, Rosa and little Tomás. Her husband, he died in the copper mine - a collapse that should never have happened. The company said she owed his debt. Fourteen years of labor to pay it off. For her and her children both.",
      expression: 'sad',
      choices: [
        {
          text: "That's monstrous.",
          nextNodeId: 'monstrous_response',
        },
        {
          text: 'How old are the children?',
          nextNodeId: 'children_ages',
        },
      ],
    },

    {
      id: 'monstrous_response',
      text: "'The love of money is the root of all evil.' *He shakes his head* Maria worked in their laundry, Rosa in the kitchens at only twelve years old. When I heard... *his jaw tightens* ...I could not stand idle. They hide here now, in the church cellar. Sanctuary.",
      choices: [
        {
          text: "I'll make sure they reach freedom.",
          nextNodeId: 'quest_accepted',
        },
      ],
    },

    {
      id: 'children_ages',
      text: "*His voice catches* Rosa is twelve. Tomás is seven. Seven years old, and already IVRC considers him property. He has nightmares, that little one. Screams in his sleep about the dark places where they kept the workers who disobeyed.",
      expression: 'pained',
      choices: [
        {
          text: "I'll get them out. I promise.",
          nextNodeId: 'quest_accepted',
        },
      ],
    },

    {
      id: 'risk_discussion',
      text: "*He smiles tiredly* If they discover what I do? Excommunication would be the least of it. But I have made my peace with that. 'Greater love has no one than this: to lay down his life for his friends.' I am ready, if it comes to that.",
      choices: [
        {
          text: "It won't come to that. How can I help?",
          nextNodeId: 'offer_help_underground',
        },
        {
          text: "You're a brave man, Father.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'doc_chen_connection',
      text: "*A genuine smile* Ah, Wei. Yes, we are partners in this... ministry. He heals their bodies, I tend their souls. He provides medicine, forged papers. I provide shelter, and the protection this collar still offers. Together, we have helped perhaps fifty people find freedom.",
      onEnterEffects: [{ type: 'set_flag', target: 'confirmed_doc_chen_partner' }],
      choices: [
        {
          text: 'Fifty people. That is something to be proud of.',
          nextNodeId: 'pride_response',
        },
        {
          text: 'How long have you been doing this?',
          nextNodeId: 'how_long',
        },
      ],
    },

    {
      id: 'pride_response',
      text: "*He shakes his head* Pride is a sin, my friend. And fifty... fifty is not enough. There are hundreds more in those camps. Thousands across the territory. We save who we can, but it is like... how do you say... pulling drops from the ocean.",
      expression: 'sad',
      choices: [
        {
          text: 'Every drop matters.',
          nextNodeId: 'every_drop',
        },
        {
          text: 'Maybe the ocean can be drained another way.',
          nextNodeId: 'another_way',
        },
      ],
    },

    {
      id: 'every_drop',
      text: "*He places a hand over his heart* You understand. Yes. To Maria and her children, to every soul we have saved - they are not drops. They are worlds. Entire universes of possibility. Thank you for reminding me.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: 'How can I help?',
          nextNodeId: 'offer_help_underground',
        },
        {
          text: 'I should let you rest, Father.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'another_way',
      text: "*His eyes sharpen* You speak of the documents? The proof of IVRC's crimes? *He leans forward* Samuel Ironpick has them - or so the stories say. If those documents could reach the right people... newspapers in the East, honest judges... the dam could break.",
      onEnterEffects: [{ type: 'set_flag', target: 'father_mentioned_documents' }],
      choices: [
        {
          text: 'Do you know where Samuel hides them?',
          nextNodeId: 'samuel_documents',
        },
        {
          text: "I've heard about these documents. I'm looking for them.",
          nextNodeId: 'looking_for_documents',
        },
      ],
    },

    {
      id: 'samuel_documents',
      text: "Samuel trusts very few. We were friends once - before the violence, before his son died. He helped me establish the railroad, gave me maps of the mountain passages. But he has grown bitter, suspicious. Even of me, sometimes. *He sighs* The documents are his insurance, his last weapon. He will not give them up easily.",
      choices: [
        {
          text: 'Maybe I can convince him.',
          nextNodeId: 'convince_samuel',
        },
        {
          text: 'What happened between you?',
          nextNodeId: 'samuel_rift',
        },
      ],
    },

    {
      id: 'convince_samuel',
      text: "*He considers* If anyone could... perhaps a fresh face, someone not tangled in our old grievances. Samuel values action over words. Help his people - protect a mining claim, bring them supplies - and he will listen. Tell him... tell him Miguel still prays for him.",
      onEnterEffects: [{ type: 'set_flag', target: 'miguel_message_for_samuel' }],
      choices: [
        {
          text: "I'll find him.",
          nextNodeId: null,
          effects: [{ type: 'unlock_location', target: 'freeminer_hollow' }],
        },
      ],
    },

    {
      id: 'samuel_rift',
      text: "*He stares at his hands* When the violence began - when Diamondback started her raids - Samuel blamed me for not stopping it. He thought I should have counseled peace, that my words could have prevented bloodshed. But those workers were being killed slowly in the mines. How could I tell them not to fight?",
      expression: 'conflicted',
      choices: [
        {
          text: 'There are no easy answers.',
          nextNodeId: 'no_easy_answers',
        },
        {
          text: 'You did what you thought was right.',
          nextNodeId: 'right_thing',
        },
      ],
    },

    {
      id: 'no_easy_answers',
      text: "*He laughs softly, but there is no humor in it* No. There are not. 'Blessed are the peacemakers,' the scripture says. But what peace can there be when one side holds all the power and uses it to crush the other? Sometimes I wonder if my God has any answers either.",
      choices: [
        {
          text: 'You still believe?',
          nextNodeId: 'still_believe',
        },
        {
          text: 'That is a heavy burden to carry.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'right_thing',
      text: "*He meets your eyes* Did I? I helped people escape, yes. But I also failed to prevent what came after. The raids, the reprisals, the cycle of violence. Every dead Pinkerton has a family. Every dead miner has a family. And I stand in the middle, praying for both, saving neither.",
      expression: 'troubled',
      choices: [
        {
          text: 'You cannot carry that guilt alone.',
          nextNodeId: 'carry_guilt',
        },
        {
          text: 'Sometimes there is no preventing violence.',
          nextNodeId: 'inevitable_violence',
        },
      ],
    },

    {
      id: 'carry_guilt',
      text: "*He touches the cross at his neck* 'Cast your burden on the Lord, and He will sustain you.' I try. Some nights it is easier than others. *He straightens* But enough of an old man's regrets. There is work to be done, yes? People to help.",
      choices: [
        {
          text: 'Tell me how I can help.',
          nextNodeId: 'offer_help_underground',
        },
        {
          text: "You're stronger than you know, Father.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'inevitable_violence',
      text: "Perhaps. 'There is a time for war and a time for peace,' says Ecclesiastes. But how do we know which time it is? When is fighting justified, and when does it only breed more suffering? *He shakes his head* These are questions I cannot answer. Only God can.",
      choices: [
        {
          text: 'Maybe the answer is different for everyone.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'looking_for_documents',
      text: "*His eyebrows rise* You seek them too? Then perhaps God has sent you here for more than one purpose. *He considers* Samuel will not give them to a stranger. But if you prove yourself - help our cause, help his people - perhaps the door will open. Paths have a way of revealing themselves to those who walk in faith.",
      choices: [
        {
          text: 'I want to help. Where do I start?',
          nextNodeId: 'offer_help_underground',
        },
        {
          text: 'Can you introduce me to Samuel?',
          nextNodeId: 'introduce_samuel',
        },
      ],
    },

    {
      id: 'introduce_samuel',
      text: "*He sighs* Our friendship is... strained. He may not welcome a messenger from me. But I can tell you where to find him - Freeminer's Hollow, in the Iron Mountains. Show him that you are a friend of the workers. That will mean more than any introduction from a priest he no longer trusts.",
      onEnterEffects: [{ type: 'unlock_location', target: 'freeminer_hollow' }],
      choices: [
        {
          text: "I'll find him.",
          nextNodeId: null,
        },
        {
          text: 'Thank you, Father.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'how_long',
      text: "Six years now. Since the fire at the Ironpick homestead. That night, a family came to my door - burned, frightened, carrying only what they could grab. The company men were hunting them. What was I to do? Turn them away? *He shakes his head* That night, I became something more than a priest. Something the Church would not approve of.",
      choices: [
        {
          text: 'You became a hero.',
          nextNodeId: 'not_a_hero',
        },
        {
          text: 'The Church is wrong about many things.',
          nextNodeId: 'church_wrong',
        },
      ],
    },

    {
      id: 'not_a_hero',
      text: "*He waves dismissively* No, no. The heroes are the people who risk their lives to flee. The guides who walk them through dangerous territory. I merely... open my door. Any decent person would do the same.",
      choices: [
        {
          text: 'Not everyone does.',
          nextNodeId: 'not_everyone',
        },
      ],
    },

    {
      id: 'not_everyone',
      text: "*His expression grows sad* No. Many turn away. Fear makes cowards of us all, sometimes. The Mayor knows, I think. She chooses not to see. Others inform to IVRC for coin. *His voice hardens* There is a special judgment waiting for those who betray the vulnerable for silver.",
      choices: [
        {
          text: 'I would never betray these people.',
          nextNodeId: 'never_betray',
        },
      ],
    },

    {
      id: 'never_betray',
      text: "*He studies your face, then nods slowly* I believe you. There is something in your eyes... a fire that is not cruelty. Perhaps you are the answer to a prayer I did not know I was praying.",
      onEnterEffects: [{ type: 'change_reputation', value: 15 }],
      choices: [
        {
          text: 'How can I help?',
          nextNodeId: 'offer_help_underground',
        },
      ],
    },

    {
      id: 'church_wrong',
      text: "*A bitter laugh escapes him* The institution errs. Men errs. But God? No. The teachings of Christ are clear: 'Love your neighbor as yourself.' 'Whatever you did for the least of these, you did for me.' The Church has forgotten. I have not.",
      choices: [
        {
          text: 'You follow a higher calling.',
          nextNodeId: 'higher_calling',
        },
        {
          text: 'How do you reconcile being a priest with defying the Church?',
          nextNodeId: 'reconcile',
        },
      ],
    },

    {
      id: 'higher_calling',
      text: "*He touches his collar* This still means something to me. Not the hierarchy, not the politics - but the promise I made. To serve God and His children. If my superiors disagree with how I keep that promise... *he shrugs* ...I will answer to a higher judge than the Bishop.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: 'I respect that.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'reconcile',
      text: "Some days I cannot. Some days I look at this collar and feel like a hypocrite. Other days... *he touches the altar* ...I stand before God and know I am doing what He asks. Faith is not certainty, my friend. Faith is walking forward when you cannot see the path.",
      expression: 'thoughtful',
      choices: [
        {
          text: 'That is wisdom, Father.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    // ========================================================================
    // COURAGE AND DISCRETION RESPONSES
    // ========================================================================
    {
      id: 'courage_comment',
      text: "Courage... or perhaps desperation dressed as bravery. *He sighs* When you have seen enough suffering, when the weight of all those faces keeps you awake at night... courage becomes the only choice you can live with.",
      choices: [
        {
          text: 'I understand.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'discretion',
      text: "*He nods approvingly* You have wisdom beyond your years. In this territory, knowing when to speak and when to stay silent... it keeps people alive. If ever you wish to know more, you know where to find me. My door is always open.",
      choices: [
        {
          text: "I'll remember that.",
          nextNodeId: null,
        },
      ],
    },

    // ========================================================================
    // ALTERNATE FIRST MEETING BRANCHES
    // ========================================================================
    {
      id: 'town_info',
      text: "*He gestures to a nearby pew* Please, sit. Dusty Springs is... complicated. On the surface, a frontier town like any other. Beneath... *he considers his words* ...there are currents. Powers that pull people in different directions. You would do well to be careful who you trust.",
      choices: [
        {
          text: 'Who should I trust?',
          nextNodeId: 'who_to_trust',
        },
        {
          text: 'Tell me about IVRC.',
          nextNodeId: 'ivrc_info',
        },
        {
          text: 'Who should I avoid?',
          nextNodeId: 'who_to_avoid',
        },
      ],
    },

    {
      id: 'who_to_trust',
      text: "*He considers carefully* Sheriff Cole is an honest man - a rarity in a badge. He struggles between duty and conscience, but his heart is good. Doc Chen... Wei is a healer in more ways than one. The Mayor... *he pauses* ...she means well, but she is tangled in debts she does not fully understand.",
      onEnterEffects: [{ type: 'set_flag', target: 'father_gave_guidance' }],
      choices: [
        {
          text: 'And you, Father?',
          nextNodeId: 'trust_father',
        },
        {
          text: 'What about the Copperheads?',
          nextNodeId: 'copperhead_opinion',
        },
      ],
    },

    {
      id: 'trust_father',
      text: "*He smiles gently* I am but a humble servant of God. Whether you trust me... that is between you and your conscience. I will say only this: I try to help those who cannot help themselves. If that aligns with your path, perhaps we will speak again.",
      choices: [
        {
          text: 'I think we will.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'copperhead_opinion',
      text: "*He sighs deeply* Dolores and her people... they fight IVRC with fire. I understand their anger - God knows I share it. But violence begets violence. Every raid brings reprisals. Every dead guard brings punishment on the workers. Yet... *he trails off* ...who am I to judge those who fight back against tyranny?",
      expression: 'conflicted',
      choices: [
        {
          text: 'You seem torn.',
          nextNodeId: 'torn',
        },
        {
          text: 'Sometimes violence is the only answer.',
          nextNodeId: 'violence_answer',
        },
        {
          text: 'Peace is always the better path.',
          nextNodeId: 'peace_better',
        },
      ],
    },

    {
      id: 'torn',
      text: "Always. 'Blessed are the peacemakers,' says the scripture. But also, 'Deliver the weak and needy; rescue them from the hand of the wicked.' How do you deliver the weak when the wicked hold all the power? These questions... they haunt me.",
      choices: [
        {
          text: 'Perhaps there are other ways to fight.',
          nextNodeId: 'other_fights',
        },
      ],
    },

    {
      id: 'violence_answer',
      text: "*His expression grows troubled* Perhaps. When all peaceful means have failed, when the oppressor will not listen... 'There is a time for war,' Ecclesiastes says. But I have seen too much blood soaked into this land. I pray for another way.",
      choices: [
        {
          text: 'What other way?',
          nextNodeId: 'other_fights',
        },
      ],
    },

    {
      id: 'peace_better',
      text: "*He nods* I want to believe that. With all my heart, I want to believe. But when children labor in the mines, when families are torn apart by debt... peace for whom? The oppressor loves peace. It lets him continue his work undisturbed.",
      choices: [
        {
          text: "You're right. Peace isn't enough.",
          nextNodeId: 'other_fights',
        },
      ],
    },

    {
      id: 'other_fights',
      text: "*His eyes light up* Si. There are. Information is power. The truth, exposed to the light... that is a weapon more powerful than any gun. There are documents - proof of IVRC's crimes - that could change everything. If they could reach the right people...",
      onEnterEffects: [{ type: 'set_flag', target: 'father_mentioned_documents' }],
      choices: [
        {
          text: 'Tell me more about these documents.',
          nextNodeId: 'samuel_documents',
        },
        {
          text: 'How can I help?',
          nextNodeId: 'help_question',
        },
      ],
    },

    {
      id: 'help_question',
      text: "*He studies you* You wish to help? Truly? *He touches the cross at his neck* There are people who need safe passage out of the territory. Workers who have escaped IVRC's camps. If you are willing to risk yourself for strangers...",
      choices: [
        {
          text: "I'm willing.",
          nextNodeId: 'offer_help_underground',
        },
        {
          text: 'Tell me more first.',
          nextNodeId: 'underground_story',
        },
      ],
    },

    {
      id: 'ivrc_info',
      text: "The Iron Valley Railroad Company. *His voice carries a weight of sorrow* They came with promises of prosperity. Jobs, progress, connection to the wider world. What they brought instead was... a different kind of slavery. Debt bondage, they call it. The workers cannot leave until their debts are paid. But the debts... the debts never end.",
      choices: [
        {
          text: 'That sounds illegal.',
          nextNodeId: 'legal_question',
        },
        {
          text: "Who runs IVRC?",
          nextNodeId: 'thorne_info',
        },
      ],
    },

    {
      id: 'legal_question',
      text: "*A bitter sound escapes him* The law is written by those with power, interpreted by those with money. IVRC's contracts are technically legal. The workers signed them, after all. But when you are starving, when your family needs medicine... what choice is there but to sign?",
      choices: [
        {
          text: "Can't someone challenge these contracts?",
          nextNodeId: 'challenge_contracts',
        },
      ],
    },

    {
      id: 'challenge_contracts',
      text: "There is talk of documents. Records that prove IVRC bribed officials, falsified safety reports, covered up deaths. If those records could reach honest judges in the East... *he shakes his head* ...but they are hidden. Protected. And anyone who looks too closely tends to... disappear.",
      choices: [
        {
          text: 'I might be able to help find them.',
          nextNodeId: 'another_way',
        },
      ],
    },

    {
      id: 'thorne_info',
      text: "Cornelius Thorne. A man who prays in the finest churches back East while his workers die in darkness out here. He has never set foot in Dusty Springs - he does not need to. His money reaches everywhere. His agents, his lawyers, his hired guns... they do his bidding.",
      expression: 'contempt',
      choices: [
        {
          text: 'He sounds like a monster.',
          nextNodeId: 'thorne_monster',
        },
        {
          text: 'Is there anyone who can stand against him?',
          nextNodeId: 'stand_against',
        },
      ],
    },

    {
      id: 'thorne_monster',
      text: "*He touches the altar cross* Monsters are easy to hate. Thorne is worse - he is a man who has convinced himself he is doing good. Progress. Civilization. Economic development. The words of the devil, dressed as an angel of light.",
      choices: [
        {
          text: 'Someone needs to stop him.',
          nextNodeId: 'stop_thorne',
        },
      ],
    },

    {
      id: 'stop_thorne',
      text: "Many have tried. The Copperheads rob his trains. The Freeminers resist his expansion. I... *he gestures vaguely* ...do what I can in my own way. But Thorne has power. Real power. To stop him would require proof of his crimes so damning that even his bought politicians could not ignore it.",
      choices: [
        {
          text: 'The documents.',
          nextNodeId: 'samuel_documents',
        },
      ],
    },

    {
      id: 'stand_against',
      text: "The Copperheads fight with guns. The Freeminers fight by refusing to sell. And there are those of us who fight in... quieter ways. But it is not enough. We are drops against an ocean. Unless something changes - unless someone finds a way to break his power at its root...",
      choices: [
        {
          text: 'What would break his power?',
          nextNodeId: 'break_power',
        },
      ],
    },

    {
      id: 'break_power',
      text: "Exposure. Truth. There are documents hidden somewhere - proof of every bribe, every covered death, every illegal contract. If those reached the newspapers in the East, if honest judges saw them... even Thorne could not survive such scandal. But finding them... that is the question.",
      choices: [
        {
          text: 'Where would I look?',
          nextNodeId: 'samuel_documents',
        },
      ],
    },

    {
      id: 'who_to_avoid',
      text: "*He considers* The Mayor's secretary - Mr. Crane - reports everything to IVRC. The company's agents pass through regularly; they are easy to spot by their eastern clothes and suspicious eyes. And there are informants among the townspeople... paid to watch for troublemakers.",
      choices: [
        {
          text: 'Who are the informants?',
          nextNodeId: 'informants',
        },
        {
          text: "I'll be careful.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'informants',
      text: "*He shakes his head* I do not know them all. That is part of IVRC's power - the suspicion they create. Anyone could be watching. Anyone could report you. It makes trust... difficult. But not impossible. Watch what people do, not what they say.",
      onEnterEffects: [{ type: 'set_flag', target: 'warned_about_informants' }],
      choices: [
        {
          text: 'Good advice.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'not_religious',
      text: "*He chuckles warmly* Neither was Christ fond of the religious authorities of His day, if you read the scriptures closely. You do not need to believe to be welcome here. The doors of St. Michael's are open to all who seek shelter - from the sun, from danger, from the weight of the world.",
      choices: [
        {
          text: 'That is generous of you.',
          nextNodeId: 'generous_response',
        },
        {
          text: 'What kind of shelter do people need here?',
          nextNodeId: 'shelter_question',
        },
      ],
    },

    {
      id: 'generous_response',
      text: "It is not generosity - it is duty. 'I was a stranger, and you welcomed me.' These are not suggestions in the scripture, my friend. They are commands. If I am to call myself a man of God, I must live as one.",
      choices: [
        {
          text: 'You take your faith seriously.',
          nextNodeId: 'faith_serious',
        },
      ],
    },

    {
      id: 'faith_serious',
      text: "*He touches the worn cross at his neck* It is all I have left that is truly mine. My Church has disappointed me. The institutions of men have failed. But my faith... that remains. Battered, yes. Questioned, often. But still burning.",
      choices: [
        {
          text: 'What disappointed you about the Church?',
          nextNodeId: 'church_disappointment',
        },
        {
          text: 'I admire your conviction.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'church_disappointment',
      text: "The compromises. IVRC donates handsomely to the diocese. And in return... silence. When I spoke against the working conditions, I was counseled to focus on 'spiritual matters.' When I helped a family escape, I was warned about 'interfering with legitimate business.' *His voice hardens* God's work became inconvenient for the budget.",
      expression: 'bitter',
      choices: [
        {
          text: 'You did the right thing.',
          nextNodeId: 'right_thing_response',
        },
        {
          text: 'That must have been painful.',
          nextNodeId: 'painful_response',
        },
      ],
    },

    {
      id: 'right_thing_response',
      text: "*He sighs* I hope so. Some days I am certain. Other days I wonder if I am just an old man playing at heroism, putting people at risk for my own conscience. *He straightens* But then I see a family reach safety, start a new life... and I know.",
      choices: [
        {
          text: 'The families you help - how many have escaped?',
          nextNodeId: 'how_long',
        },
      ],
    },

    {
      id: 'painful_response',
      text: "Si. Very painful. The Church raised me, educated me, gave me purpose. To see it choose money over mercy... *he touches the altar* ...but God is not the Church. God is here, in these candles, in the desperate prayers of the suffering. That is what I serve now.",
      choices: [
        {
          text: 'You serve well, Father.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'shelter_question',
      text: "*His expression becomes guarded, then softens* Many kinds. Some need only a roof for the night. Others... *he glances toward the back of the church* ...others need more. Protection. A way out. You understand?",
      choices: [
        {
          text: 'I think I do. You help people escape.',
          nextNodeId: 'escape_acknowledgment',
        },
        {
          text: "I won't pry.",
          nextNodeId: 'discretion',
        },
      ],
    },

    {
      id: 'escape_acknowledgment',
      text: "*He looks at you sharply, then relaxes* You have observant eyes. Yes. There are those in this territory who are trapped - by debt, by contracts, by fear. Some find their way to freedom. I merely... open doors.",
      onEnterEffects: [{ type: 'set_flag', target: 'father_hinted_underground' }],
      choices: [
        {
          text: 'I would like to help open those doors.',
          nextNodeId: 'offer_help_underground',
        },
        {
          text: "Your secret is safe with me.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },

    {
      id: 'peace_difficult',
      text: "*He nods slowly, his eyes clouded with old sorrows* Si, you speak truth. 'Peace I leave with you,' Christ said. But He also said, 'I did not come to bring peace, but a sword.' In this territory, that sword cuts deep. Everyone is bleeding from something.",
      expression: 'sad',
      choices: [
        {
          text: 'What are you bleeding from, Father?',
          nextNodeId: 'father_wounds',
        },
        {
          text: 'Is there no hope for peace?',
          nextNodeId: 'hope_for_peace',
        },
      ],
    },

    {
      id: 'father_wounds',
      text: "*He is silent for a long moment* I bleed for the people I cannot save. The families torn apart. The workers who die in darkness while I stand in the light, unable to reach them. Some nights I hear their voices. Praying for help that never comes.",
      expression: 'pained',
      choices: [
        {
          text: 'You help more than you know.',
          nextNodeId: 'help_more_than_know',
        },
        {
          text: 'What would help you save more?',
          nextNodeId: 'save_more',
        },
      ],
    },

    {
      id: 'help_more_than_know',
      text: "*He shakes his head* Kind words, but... *he pauses* ...perhaps you are right. I count my failures, not my successes. A priest's habit. *A small smile* Thank you for the reminder, my friend.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: 'Tell me about your successes.',
          nextNodeId: 'underground_story',
        },
      ],
    },

    {
      id: 'save_more',
      text: "Safe routes through the mountains. Medicine for the sick and wounded. Papers to give people new identities. And brave souls willing to guide families through dangerous territory. *He meets your eyes* Are you such a soul?",
      choices: [
        {
          text: 'I might be.',
          nextNodeId: 'offer_help_underground',
        },
        {
          text: 'Tell me more first.',
          nextNodeId: 'underground_story',
        },
      ],
    },

    {
      id: 'hope_for_peace',
      text: "*He touches the altar* There is always hope. 'Now we see through a glass, darkly, but then face to face.' Perhaps peace will come. Perhaps justice will prevail. But hoping is not enough. We must work, struggle, sacrifice. Peace is not given. It is built, brick by painful brick.",
      choices: [
        {
          text: 'How do you build peace here?',
          nextNodeId: 'build_peace',
        },
      ],
    },

    {
      id: 'build_peace',
      text: "One life at a time. One family escaping bondage. One child reaching safety. One truth exposed. It is slow work. Maddening work. But when the great flood comes - and it will come - perhaps we will have laid enough foundation for something new to grow.",
      choices: [
        {
          text: 'Let me help lay that foundation.',
          nextNodeId: 'offer_help_underground',
        },
      ],
    },

    {
      id: 'father_history',
      text: "Twenty years I have served this church. I came from Mexico, a young missionary full of zeal. I would bring God's word to the frontier! *He chuckles* God had different plans. He taught me that His word means nothing without His works. Faith without action is dead, as the scriptures say.",
      choices: [
        {
          text: 'What changed you?',
          nextNodeId: 'what_changed',
        },
        {
          text: 'You found your true calling.',
          nextNodeId: 'true_calling',
        },
      ],
    },

    {
      id: 'what_changed',
      text: "A little girl. Maria Rosalia was her name. Seven years old, working in the IVRC laundry. Her hands were burned, blistered. I bandaged them, prayed for her. The next day, she was sent back to work. The day after... *his voice catches* ...there was an accident. She did not survive.",
      expression: 'grief',
      choices: [
        {
          text: 'I am sorry, Father.',
          nextNodeId: 'sorry_response',
        },
      ],
    },

    {
      id: 'sorry_response',
      text: "*He wipes his eyes* It was many years ago. But I still see her face. She asked me why God let bad things happen. I had no answer then. I have none now. Only that we must be God's hands in the world. We must stop the bad things ourselves.",
      choices: [
        {
          text: 'And so you started helping people escape.',
          nextNodeId: 'underground_story',
        },
      ],
    },

    {
      id: 'true_calling',
      text: "Perhaps. Or perhaps I simply stopped hiding behind scriptures and started living them. *He gestures around the church* These walls have heard many prayers. But prayers alone change nothing. God works through us, through our actions. I had to learn that the hard way.",
      choices: [
        {
          text: 'What actions do you take?',
          nextNodeId: 'underground_story',
        },
      ],
    },

    {
      id: 'peace_here',
      text: "*He looks around the candlelit interior* Si. It is. This is holy ground - not because of any blessing I could give, but because of the hopes and prayers soaked into every stone. Here, even IVRC's reach is... limited. For now.",
      onEnterEffects: [{ type: 'set_flag', target: 'church_is_sanctuary' }],
      choices: [
        {
          text: 'Why only for now?',
          nextNodeId: 'sanctuary_limited',
        },
        {
          text: 'Sanctuary.',
          nextNodeId: 'sanctuary_concept',
        },
      ],
    },

    {
      id: 'sanctuary_limited',
      text: "IVRC grows bolder. Their agents have already hinted that the church's... immunity... is a courtesy, not a right. If they believe I am harboring fugitives... *he shrugs* ...they will find an excuse. Arson, perhaps. 'Unfortunate accident,' they will call it.",
      expression: 'worried',
      choices: [
        {
          text: 'They would burn a church?',
          nextNodeId: 'burn_church',
        },
      ],
    },

    {
      id: 'burn_church',
      text: "They burned the Ironpick homestead. They have beaten and killed union organizers. A church is just a building to them - and I am just a man. *He squares his shoulders* But until that day comes, I will continue my work. Fear is the devil's weapon. I refuse to wield it against myself.",
      choices: [
        {
          text: 'You are braver than most.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'sanctuary_concept',
      text: "Ah, you know the old traditions. Yes, this is a sanctuary in the ancient sense. Those who enter seeking protection cannot be harmed here - that is the law of the Church, even if the secular authorities do not recognize it. *His voice drops* Some have found more than spiritual protection within these walls.",
      onEnterEffects: [{ type: 'set_flag', target: 'father_hinted_underground' }],
      choices: [
        {
          text: 'You hide people here.',
          nextNodeId: 'hide_people',
        },
        {
          text: "I won't ask questions.",
          nextNodeId: 'discretion',
        },
      ],
    },

    {
      id: 'hide_people',
      text: "*He meets your eyes directly* The cellar has seen many guests over the years. Workers fleeing debt bondage. Families escaping forced labor. They stay until a route is clear, then move on to freedom. If you are the kind of person who would report such things... *he waits*",
      choices: [
        {
          text: 'I am not. I want to help.',
          nextNodeId: 'underground_story',
        },
        {
          text: 'Your secret is safe.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },

    // ========================================================================
    // RETURN GREETINGS AND ONGOING INTERACTIONS
    // ========================================================================
    {
      id: 'return_greeting',
      text: "*Father Miguel looks up from his prayer book* Ah, you return. I am glad. Please, come in. How can I help you today?",
      choices: [
        {
          text: 'I wanted to ask about the workers again.',
          nextNodeId: 'workers_again',
        },
        {
          text: 'I need spiritual guidance.',
          nextNodeId: 'spiritual_guidance',
        },
        {
          text: 'Any news from your... network?',
          nextNodeId: 'network_news',
          conditions: [{ type: 'flag_set', target: 'knows_underground_railroad' }],
        },
        {
          text: 'Just passing through.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'workers_again',
      text: "The situation grows worse. IVRC has increased patrols on the mountain roads. Two families we were helping... they had to turn back. One was captured. *He crosses himself* We do what we can, but the company's reach grows longer each day.",
      choices: [
        {
          text: 'Is there anything I can do?',
          nextNodeId: 'help_now',
        },
        {
          text: 'Have you heard anything about the documents?',
          nextNodeId: 'documents_news',
        },
      ],
    },

    {
      id: 'help_now',
      text: "*He considers* There is always need. Supplies for the families in transit - food, medicine. Information about IVRC patrol routes. And always, always, brave souls willing to guide people through dangerous territory. Which of these calls to you?",
      choices: [
        {
          text: "I can scout patrol routes.",
          nextNodeId: 'scout_routes',
        },
        {
          text: 'I can guide families to safety.',
          nextNodeId: 'guide_families',
        },
        {
          text: 'I have supplies to donate.',
          nextNodeId: 'donate_supplies',
        },
      ],
    },

    {
      id: 'scout_routes',
      text: "Dangerous work, but valuable. The mountain passes shift - IVRC moves their checkpoints to catch those trying to memorize patterns. If you could map the current patrol routes and bring that information back... many lives could be saved.",
      onEnterEffects: [{ type: 'start_quest', target: 'scout_patrol_routes' }],
      choices: [
        {
          text: "I'll do it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'guide_families',
      text: "*His eyes brighten* Truly? That is the most dangerous work of all, but also the most rewarding. When you hold a child's hand through the darkness and bring them to safety... *he touches his heart* ...there is no greater blessing.",
      onEnterEffects: [{ type: 'set_flag', target: 'offered_to_guide' }],
      choices: [
        {
          text: 'When is the next family ready to move?',
          nextNodeId: 'next_family',
        },
      ],
    },

    {
      id: 'next_family',
      text: "There is a young couple - Pedro and Consuela. They have been hiding in the old mill outside town. IVRC believes they fled north, but they have been waiting here for the right moment. If you are ready, I can take you to them tonight.",
      choices: [
        {
          text: "I'm ready.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'guide_pedro_consuela' }],
        },
        {
          text: 'I need to prepare first.',
          nextNodeId: 'prepare_first',
        },
      ],
    },

    {
      id: 'prepare_first',
      text: "Wise. The journey takes three days through rough terrain. You will need supplies, warm clothing, and a weapon - the mountains have wolves, and sometimes worse. Return when you are ready, and I will arrange the meeting.",
      choices: [
        {
          text: "I'll be back soon.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'donate_supplies',
      text: "*He clasps your hands* Bless you. Every scrap of food, every bandage, every coin... it all matters. The families often arrive with nothing - just the clothes on their backs. Your generosity will ease their suffering.",
      choices: [
        {
          text: '[Give 50 gold worth of supplies]',
          nextNodeId: 'supplies_given',
          conditions: [{ type: 'gold_gte', value: 50 }],
          effects: [{ type: 'take_gold', value: 50 }],
        },
        {
          text: '[Give 100 gold worth of supplies]',
          nextNodeId: 'generous_supplies',
          conditions: [{ type: 'gold_gte', value: 100 }],
          effects: [{ type: 'take_gold', value: 100 }],
        },
        {
          text: "I'll gather what I can and return.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'supplies_given',
      text: "*He accepts the donation with humble gratitude* This will feed a family for a week on the road. May God multiply your kindness back to you tenfold. You are doing holy work, my friend.",
      onEnterEffects: [{ type: 'change_reputation', value: 15 }],
      choices: [
        {
          text: 'Use it well.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'generous_supplies',
      text: "*His eyes fill with emotion* Such generosity... *he blinks rapidly* This will equip an entire family for their journey. New clothes for the children, medicine for the sick, food for the road. You may have just saved lives, my friend. God bless you.",
      onEnterEffects: [
        { type: 'change_reputation', value: 30 },
        { type: 'set_flag', target: 'major_donor' },
      ],
      choices: [
        {
          text: 'It is the least I can do.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'documents_news',
      text: "*He shakes his head* Samuel guards them closely. He fears betrayal - and can you blame him? His son is dead, his home was burned, his movement was crushed. But if you can earn his trust... he might share what he knows. Have you been to Freeminer's Hollow?",
      choices: [
        {
          text: 'Not yet. I need to prepare.',
          nextNodeId: null,
        },
        {
          text: 'Yes, I have met Samuel.',
          nextNodeId: 'met_samuel',
          conditions: [{ type: 'talked_to', target: 'samuel_ironpick' }],
        },
      ],
    },

    {
      id: 'met_samuel',
      text: "*His face lightens* You have? Tell me - how is he? Does he... does he speak of me at all? *A flash of old pain crosses his features* We were friends once. Before everything went wrong.",
      choices: [
        {
          text: 'He is well. Still fighting.',
          nextNodeId: 'samuel_well',
        },
        {
          text: 'He mentioned you. With respect.',
          nextNodeId: 'samuel_respect',
        },
        {
          text: 'He is bitter. Suspicious.',
          nextNodeId: 'samuel_bitter',
        },
      ],
    },

    {
      id: 'samuel_well',
      text: "*He exhales* Good. Good. He is a stubborn old goat, but he has a heart of iron. If anyone can keep the resistance alive, it is Samuel. Thank you for telling me. It... it helps to know he still fights.",
      choices: [
        {
          text: 'He asked me to pass on a message.',
          nextNodeId: 'pass_message',
          conditions: [{ type: 'flag_set', target: 'samuel_message_for_miguel' }],
        },
        {
          text: 'He could use our help.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'samuel_respect',
      text: "*His eyes fill with hope* He did? *He turns away briefly* Forgive an old man's emotions. We parted... badly. Angry words, accusations. I thought he hated me. To know that respect remains... *he crosses himself* ...thank you. Thank you for telling me.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: 'Perhaps you could reconcile.',
          nextNodeId: 'reconcile_idea',
        },
      ],
    },

    {
      id: 'reconcile_idea',
      text: "Perhaps. If God wills it. *He considers* Would you carry a message to him? Tell him... tell him I still pray for him every night. That I am sorry for the words we exchanged. That my door is always open, if he wishes to talk.",
      onEnterEffects: [{ type: 'set_flag', target: 'miguel_message_for_samuel' }],
      choices: [
        {
          text: "I'll tell him.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'samuel_bitter',
      text: "*He nods sadly* I feared as much. The years have been hard on him. Losing his son, then his home... and the movement he gave everything for, crushed. Bitterness is a natural response. I pray it does not consume him entirely.",
      choices: [
        {
          text: 'He still fights for what matters.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'pass_message',
      text: "*He goes very still* He... he sent a message? To me? *He steadies himself against a pew* Please. Tell me.",
      choices: [
        {
          text: 'He says he forgives you. He wants to work together again.',
          nextNodeId: 'forgiveness_message',
        },
        {
          text: 'He says the time for divisions is past. The fight is bigger than old grudges.',
          nextNodeId: 'unity_message',
        },
      ],
    },

    {
      id: 'forgiveness_message',
      text: "*He covers his face with his hands. His shoulders shake.* Gracias a Dios. Thank you, God. *He looks up, eyes wet* And thank you, my friend. You have given an old priest a gift beyond measure. Perhaps... perhaps there is still hope for us all.",
      onEnterEffects: [
        { type: 'change_reputation', value: 25 },
        { type: 'set_flag', target: 'miguel_samuel_reconciled' },
      ],
      choices: [
        {
          text: 'There is always hope.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'unity_message',
      text: "*He takes a deep breath* He is right. Of course he is right. We cannot defeat IVRC while fighting among ourselves. *He squares his shoulders* Tell him I agree. Whatever resources I have, whatever connections - they are at his disposal. Together, perhaps we can finally make a difference.",
      onEnterEffects: [
        { type: 'change_reputation', value: 20 },
        { type: 'set_flag', target: 'miguel_samuel_allied' },
      ],
      choices: [
        {
          text: 'United you are stronger.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'spiritual_guidance',
      text: "*He sets aside his book and gives you his full attention* Of course. This is my purpose, after all - not just the practical work, but the care of souls. What troubles you?",
      choices: [
        {
          text: "I've done things I'm not proud of.",
          nextNodeId: 'guilt_counseling',
        },
        {
          text: "I don't know if I'm doing the right thing.",
          nextNodeId: 'right_thing_counseling',
        },
        {
          text: 'How do you keep faith when everything seems hopeless?',
          nextNodeId: 'faith_counseling',
        },
      ],
    },

    {
      id: 'guilt_counseling',
      text: "*He nods gently* We all have. 'All have sinned and fallen short,' the scripture says. What matters is not what you have done, but what you do now. Repentance is not just feeling sorry - it is turning around, walking a new path. Are you ready to turn?",
      choices: [
        {
          text: "I'm trying.",
          nextNodeId: 'trying_response',
        },
        {
          text: "I don't know if I can change.",
          nextNodeId: 'cant_change',
        },
      ],
    },

    {
      id: 'trying_response',
      text: "*He smiles* Then you have already begun. 'Behold, I make all things new.' Every day is a chance to start fresh. Do not let your past define your future. Help someone today. Tomorrow, help another. Soon, the person you were will be just a shadow.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: 'Thank you, Father.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'cant_change',
      text: "*He takes your hands* No one changes alone. We need help - from God, from community, from friends who believe in us when we cannot believe in ourselves. You came to me today. That took courage. Let that courage carry you forward.",
      choices: [
        {
          text: "I'll try.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'right_thing_counseling',
      text: "Ah, the eternal question. *He gestures to the altar* I ask myself this every day. The truth is, we rarely know for certain. We see only a small piece of God's tapestry. But there are guides. Does your action help the vulnerable? Does it resist injustice? Does it cost you something?",
      choices: [
        {
          text: 'Sometimes I have to choose between evils.',
          nextNodeId: 'lesser_evil',
        },
        {
          text: 'What if helping some means hurting others?',
          nextNodeId: 'hurting_others',
        },
      ],
    },

    {
      id: 'lesser_evil',
      text: "*He nods slowly* The 'lesser evil.' I know this choice well. When I help families escape, I put my church at risk. When I stay silent to protect my flock, others suffer. There is no perfect answer. We can only pray for wisdom and do our best.",
      choices: [
        {
          text: 'That is not very comforting.',
          nextNodeId: 'not_comforting',
        },
        {
          text: 'Then I will do my best.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'not_comforting',
      text: "*A rueful smile* No. Comfort is easy to give. Truth is harder. But I will tell you this: a person who agonizes over right and wrong is already better than one who never thinks about it at all. Your struggle is itself a kind of prayer.",
      choices: [
        {
          text: 'I had not thought of it that way.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'hurting_others',
      text: "Then you must weigh the harm against the good. How many are helped? How many hurt? Is the hurt temporary, the help lasting? *He sighs* These calculations are cold, I know. But we live in a world where perfect choices do not exist. Only less imperfect ones.",
      choices: [
        {
          text: 'Thank you, Father. That helps.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'faith_counseling',
      text: "*He is quiet for a moment* That is perhaps the hardest question anyone can ask. *He looks at the cross on the altar* I will tell you a secret, my friend. I do not always keep faith. Some nights, I doubt everything - God's existence, my purpose, whether any of this matters at all.",
      expression: 'vulnerable',
      choices: [
        {
          text: 'But you continue anyway.',
          nextNodeId: 'continue_anyway',
        },
        {
          text: 'How do you get through those nights?',
          nextNodeId: 'get_through',
        },
      ],
    },

    {
      id: 'continue_anyway',
      text: "Yes. Because doubt is not the opposite of faith - certainty is. To have faith means to believe without proof. On the dark nights, I remind myself of the lives I have touched, the people I have helped. That is not proof of God, but it is proof that my actions matter. That is enough.",
      choices: [
        {
          text: 'That is beautiful, Father.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'get_through',
      text: "I remember the faces. Maria Rosalia, the girl who died because I could not save her. But also the faces of those I did save - the children who reached safety, the families starting new lives. On the darkest nights, those faces are my candles in the void.",
      choices: [
        {
          text: "You've helped me, Father. Thank you.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'network_news',
      text: "*He glances toward the door, then speaks quietly* There is movement. A large group of workers is planning to flee the northern camps. If they succeed, it will be the biggest escape in years. But IVRC is suspicious - they have doubled the guards.",
      choices: [
        {
          text: 'Can I help?',
          nextNodeId: 'help_mass_escape',
        },
        {
          text: 'Is it too dangerous?',
          nextNodeId: 'too_dangerous',
        },
      ],
    },

    {
      id: 'help_mass_escape',
      text: "Perhaps. We need a distraction - something to draw the guards away while the workers slip through. The Copperheads have been contacted, but Diamondback and I... we do not always see eye to eye. An intermediary would be helpful.",
      choices: [
        {
          text: "I know Diamondback. I can talk to her.",
          nextNodeId: 'talk_to_diamondback',
          conditions: [{ type: 'talked_to', target: 'diamondback' }],
        },
        {
          text: 'What kind of distraction?',
          nextNodeId: 'distraction_type',
        },
      ],
    },

    {
      id: 'talk_to_diamondback',
      text: "*His eyes widen* You know her? Truly? *He clasps your hands* This could be the answer to my prayers. If you could convince her to create a diversion - nothing too violent, just enough to draw attention - dozens of people could reach freedom.",
      onEnterEffects: [{ type: 'start_quest', target: 'coordinate_mass_escape' }],
      choices: [
        {
          text: "I'll speak with her.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'distraction_type',
      text: "Something loud, obvious, that draws IVRC's enforcers away from the northern passes. A fire at an unimportant facility, perhaps. A staged robbery. The Copperheads are skilled at such things, but they often... escalate. We need precision, not a massacre.",
      choices: [
        {
          text: 'I understand. Let me see what I can arrange.',
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'plan_diversion' }],
        },
      ],
    },

    {
      id: 'too_dangerous',
      text: "*He sighs* Every escape is dangerous. But doing nothing is also dangerous - to our souls, if not our bodies. The question is not whether we will risk, but what we are willing to risk for. These workers have families, dreams, lives waiting to be lived. Is that not worth some danger?",
      choices: [
        {
          text: 'You are right. What can I do?',
          nextNodeId: 'help_mass_escape',
        },
        {
          text: 'I need to think about it.',
          nextNodeId: null,
        },
      ],
    },

    // ========================================================================
    // TRUSTED AND SPECIAL GREETINGS
    // ========================================================================
    {
      id: 'trusted_greeting',
      text: "*Father Miguel's face brightens as you enter* Ah, my friend. You bring light to an old man's day. Come, sit. The work continues, but it is good to see a friendly face. How can I help you today?",
      expression: 'happy',
      choices: [
        {
          text: 'How are the families doing?',
          nextNodeId: 'families_update',
        },
        {
          text: 'I came to see if you need anything.',
          nextNodeId: 'need_anything',
        },
        {
          text: 'Any word on the documents?',
          nextNodeId: 'documents_news',
        },
        {
          text: 'Just wanted to visit.',
          nextNodeId: 'just_visit',
        },
      ],
    },

    {
      id: 'families_update',
      text: "The Hernandez family reached the eastern settlements last week. They sent word through the network - they are safe. Little Diego is starting school for the first time in his life. *His voice catches* Moments like these... they make everything worthwhile.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: "That's wonderful news.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'need_anything',
      text: "*He considers* Supplies are always needed. And there is a family waiting to move - but the usual route is watched. If you know of any safe passages through the mountains... *he trails off hopefully*",
      choices: [
        {
          text: "I'll scout some new routes.",
          nextNodeId: 'scout_routes',
        },
        {
          text: 'Let me see what supplies I can gather.',
          nextNodeId: 'donate_supplies',
        },
      ],
    },

    {
      id: 'just_visit',
      text: "*His smile warms* Then let us sit together and rest. Even servants of God need fellowship. *He gestures to a pew* Tell me how you fare. The work we do... it can weigh on the soul. It helps to talk.",
      choices: [
        {
          text: "I'm managing. It's good work.",
          nextNodeId: 'good_work_response',
        },
        {
          text: 'It is hard sometimes.',
          nextNodeId: 'hard_times',
        },
      ],
    },

    {
      id: 'good_work_response',
      text: "*He nods* It is. When doubt creeps in, remember the faces you have helped. They are your testimony. 'Well done, good and faithful servant.' These words await all who persevere.",
      choices: [
        {
          text: 'Thank you, Father.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'hard_times',
      text: "*He places a hand on your shoulder* I know. There are nights I question everything - whether we are making a difference, whether the cost is too high. But then morning comes, and there is more work to do. And we do it. That is faith in action.",
      choices: [
        {
          text: 'Your words help.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'night_greeting',
      text: "*Father Miguel looks up from his prayers, a candle casting shadows across his face* A visitor at this hour? You are either troubled or... *he studies your face* ...on business that cannot wait for daylight. Which is it, my friend?",
      choices: [
        {
          text: "I need help moving someone to safety. Tonight.",
          nextNodeId: 'urgent_movement',
        },
        {
          text: 'I could not sleep. Needed someone to talk to.',
          nextNodeId: 'cant_sleep',
        },
        {
          text: 'I came to warn you. IVRC agents are asking questions.',
          nextNodeId: 'warning',
        },
      ],
    },

    {
      id: 'urgent_movement',
      text: "*He rises immediately* Tonight? *He moves toward the back of the church* There is a family in the cellar who has waited long enough. If you have found a route... lead the way. I will pray for your safety.",
      choices: [
        {
          text: 'The northern pass is clear. We go now.',
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'midnight_escape' }],
        },
        {
          text: "I'm still scouting. I wanted you to be ready.",
          nextNodeId: 'be_ready',
        },
      ],
    },

    {
      id: 'be_ready',
      text: "*He nods* I understand. They are ready to move at a moment's notice. When you have confirmed the route, come back. Day or night, I will be here. *He grips your shoulder* Thank you for your dedication, my friend.",
      choices: [
        {
          text: 'Soon.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'cant_sleep',
      text: "*His expression softens* These are restless times. Come, sit with me. *He gestures to a pew beside his* Sometimes the best prayers are the ones we do not speak aloud - the simply being present with another soul in the darkness.",
      choices: [
        {
          text: '*Sit in comfortable silence*',
          nextNodeId: 'silence',
        },
        {
          text: 'Father, I need your counsel.',
          nextNodeId: 'late_counsel',
        },
      ],
    },

    {
      id: 'silence',
      text: "*The two of you sit in the candlelit church, the only sounds the distant wind and your own breathing. After a long while, Father Miguel speaks softly* 'Be still, and know that I am God.' Sometimes stillness is the answer we seek.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: 'Thank you, Father. I feel better.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'late_counsel',
      text: "*He turns to face you fully* Speak what is on your heart. God does not keep office hours, and neither do I. Whatever burdens you, we will carry it together.",
      choices: [
        {
          text: "I'm afraid I'm not strong enough for this work.",
          nextNodeId: 'not_strong_enough',
        },
        {
          text: 'I had to make a choice today that may have cost lives.',
          nextNodeId: 'difficult_choice',
        },
      ],
    },

    {
      id: 'not_strong_enough',
      text: "*He takes your hands* Listen to me. Strength is not the absence of fear. Strength is doing what must be done despite the fear. You came to me tonight, afraid. But you have not stopped. You have not fled. That is strength.",
      choices: [
        {
          text: 'What if I fail?',
          nextNodeId: 'what_if_fail',
        },
      ],
    },

    {
      id: 'what_if_fail',
      text: "Then you will fail trying. 'I have fought the good fight, I have finished the race, I have kept the faith.' Paul did not promise victory in this life. He promised meaning. Your struggle means something, whether you win or lose.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: 'Thank you, Father. I needed to hear that.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'difficult_choice',
      text: "*His expression grows grave* Tell me what happened. Without judgment, I will listen.",
      choices: [
        {
          text: 'I had to choose who to save. I could not save everyone.',
          nextNodeId: 'could_not_save_all',
        },
        {
          text: 'I did what I thought was right, but people got hurt.',
          nextNodeId: 'people_got_hurt',
        },
      ],
    },

    {
      id: 'could_not_save_all',
      text: "*He closes his eyes* The choice of Sophie. The impossible decision. *He opens his eyes* You did not choose who would die. You chose who would live. That is not the same thing. Carry the grief, yes. But do not carry the guilt of a choice that was never truly yours to make.",
      choices: [
        {
          text: 'How do I live with it?',
          nextNodeId: 'live_with_it',
        },
      ],
    },

    {
      id: 'live_with_it',
      text: "You honor those who were lost by helping those who remain. Their memory becomes your motivation. *He touches the altar* I keep a list in my heart of everyone I could not save. They drive me forward. Let yours do the same.",
      onEnterEffects: [{ type: 'change_reputation', value: 15 }],
      choices: [
        {
          text: "I'll try, Father.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'people_got_hurt',
      text: "Unintended consequences. The weight of every action. *He sighs* Were you trying to do good? Did you think carefully before acting? Then you are not guilty of malice, only of being human. We cannot foresee every outcome. We can only act with the knowledge we have.",
      choices: [
        {
          text: 'Thank you, Father. That helps.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'warning',
      text: "*He goes pale but remains calm* IVRC agents? What are they asking? *He begins extinguishing candles* If they are close, we must act quickly. There are people in the cellar who cannot be found.",
      expression: 'worried',
      choices: [
        {
          text: 'They are asking about escaped workers. Checking churches.',
          nextNodeId: 'checking_churches',
        },
        {
          text: "Someone may have informed. I don't know who.",
          nextNodeId: 'possible_informer',
        },
      ],
    },

    {
      id: 'checking_churches',
      text: "*He nods grimly* Then we have time, but not much. *He moves toward the back of the church* Help me move the families to the secondary location - there is a root cellar beneath the old Henderson barn. IVRC does not know about it... yet.",
      onEnterEffects: [{ type: 'start_quest', target: 'emergency_evacuation' }],
      choices: [
        {
          text: 'Lead the way.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'possible_informer',
      text: "*His face hardens* An informer. *He crosses himself* 'Even my close friend in whom I trusted has lifted up his heel against me.' If there is a traitor among us... *he takes a deep breath* ...we must find them before more lives are lost. Will you help?",
      choices: [
        {
          text: "I'll investigate quietly.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'find_informer' }],
        },
      ],
    },

    // ========================================================================
    // SANCTUARY QUEST UPDATES
    // ========================================================================
    {
      id: 'sanctuary_quest_active',
      text: "*Father Miguel hurries to you as you enter* Have you scouted the tunnel? Is the path clear for Maria and her children?",
      expression: 'anxious',
      choices: [
        {
          text: 'The tunnel is clear. We can move them tonight.',
          nextNodeId: 'tunnel_clear',
        },
        {
          text: "There's a problem. The tunnel is watched.",
          nextNodeId: 'tunnel_watched',
        },
        {
          text: 'Still working on it. I need more time.',
          nextNodeId: 'need_more_time',
        },
      ],
    },

    {
      id: 'tunnel_clear',
      text: "*Relief floods his face* Gracias a Dios! *He embraces you* Tonight then. I will prepare Maria and the children. Meet us at the church's back entrance after midnight. You will guide them to the Freeminers. God willing, by dawn they will be free.",
      onEnterEffects: [{ type: 'advance_quest', target: 'sanctuary', stringValue: 'tunnel_clear' }],
      choices: [
        {
          text: "I'll be there.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'tunnel_watched',
      text: "*His face falls* Watched? By IVRC? *He paces anxiously* Then we need another route. There is an old mining trail over Iron Ridge - longer, more exposed, but if we time it right... can you scout that path as well?",
      choices: [
        {
          text: "I'll find another way.",
          nextNodeId: null,
          effects: [{ type: 'unlock_location', target: 'iron_ridge_trail' }],
        },
      ],
    },

    {
      id: 'need_more_time',
      text: "*He nods, though worry creases his brow* I understand. But time is not our friend. Every day Maria and her children remain hidden is another day we risk discovery. Please... work quickly if you can.",
      choices: [
        {
          text: 'I will.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'sanctuary_quest_complete',
      text: "*Father Miguel's eyes fill with tears as you enter* You did it. Word came this morning - Maria and her children reached Freeminer's Hollow safely. They are free. *He clasps both your hands* You have performed a miracle, my friend. A true miracle.",
      expression: 'joyful',
      onEnterEffects: [{ type: 'change_reputation', value: 25 }],
      choices: [
        {
          text: 'It was worth every step.',
          nextNodeId: 'worth_every_step',
        },
        {
          text: 'What about the next family?',
          nextNodeId: 'next_family_after_success',
        },
      ],
    },

    {
      id: 'worth_every_step',
      text: "*He wipes his eyes* Maria wanted me to give you something. *He presses a small medallion into your hand* Saint Joseph, patron of workers and travelers. She said you are both now. May he watch over you always.",
      onEnterEffects: [{ type: 'give_item', target: 'saint_joseph_medallion' }],
      choices: [
        {
          text: "I'll treasure it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'next_family_after_success',
      text: "*He laughs through his tears* Already thinking of the next souls to save. You have the heart of a true shepherd. Yes, there are more waiting. When you are ready, we will talk. But for now... let us give thanks for this victory.",
      choices: [
        {
          text: 'A moment to breathe.',
          nextNodeId: null,
        },
      ],
    },

    // ========================================================================
    // PLAYER HARMED WORKERS BRANCH
    // ========================================================================
    {
      id: 'player_harmed_workers',
      text: "*Father Miguel's face is cold, his usual warmth completely absent* I have heard what you have done. The workers at the northern camp - beaten, some killed. By your hand or your order. *His voice shakes with barely controlled anger* Why have you come here?",
      expression: 'angry',
      choices: [
        {
          text: 'I had no choice. It was them or me.',
          nextNodeId: 'no_choice_excuse',
        },
        {
          text: 'I was wrong. I have come to confess.',
          nextNodeId: 'confession',
        },
        {
          text: 'They were IVRC loyalists. They deserved it.',
          nextNodeId: 'deserved_it',
        },
      ],
    },

    {
      id: 'no_choice_excuse',
      text: "*He shakes his head slowly* There is always a choice. Always. 'Thou shalt not kill' is not a suggestion, it is a commandment. Those workers were prisoners of IVRC, just as much as those I try to free. And you treated them as enemies.",
      onEnterEffects: [{ type: 'change_reputation', value: -25 }],
      choices: [
        {
          text: 'How can I make it right?',
          nextNodeId: 'make_it_right',
        },
        {
          text: "You don't understand what I faced.",
          nextNodeId: 'dont_understand',
        },
      ],
    },

    {
      id: 'confession',
      text: "*Something softens in his eyes, though the pain remains* Confession is the first step. But words alone cannot heal the harm you have done. Those people had families, dreams. They trusted that God would send help, and instead... *he cannot finish*",
      choices: [
        {
          text: 'Tell me how to atone.',
          nextNodeId: 'make_it_right',
        },
      ],
    },

    {
      id: 'deserved_it',
      text: "*His face hardens further* Deserved it? *He steps back* Then you are no different from IVRC. They also believe their victims deserve their fate. 'It's just business,' they say. 'They signed contracts.' Different words, same evil. Leave this church.",
      onEnterEffects: [
        { type: 'change_reputation', value: -50 },
        { type: 'set_flag', target: 'banished_from_church' },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'make_it_right',
      text: "*He considers for a long moment* I do not know if you can make it right. Some things cannot be undone. But... *he sighs* ...redemption is always possible. If you truly wish to change, prove it. Help those you harmed - their families, their communities. Not for reward, not for forgiveness. Simply because it is right.",
      onEnterEffects: [{ type: 'start_quest', target: 'redemption' }],
      choices: [
        {
          text: 'I will try.',
          nextNodeId: 'will_try',
        },
      ],
    },

    {
      id: 'will_try',
      text: "Trying is all we can ever do. Go now. Return when you have shown through actions, not words, that you have changed. Until then... *he turns away* ...my door remains open, but my trust does not.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'dont_understand',
      text: "Perhaps I do not. I have never been forced to choose between killing and dying. But I have watched children die in mines, families torn apart, men broken by labor. I understand suffering. And I know that adding to it - for any reason - cannot be the answer God wants.",
      choices: [
        {
          text: 'What would God have me do now?',
          nextNodeId: 'make_it_right',
        },
        {
          text: 'Then your God and I have nothing to discuss.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: -20 }],
        },
      ],
    },

    // ========================================================================
    // STORIES OF THOSE HE'S HELPED
    // ========================================================================
    {
      id: 'escape_stories',
      text: "*Father Miguel settles into a pew, his eyes distant with memory* You want to know about those we have helped? There are so many stories. Some triumphant, some... *his voice catches* ...some that still haunt me.",
      choices: [
        {
          text: 'Tell me about a triumph.',
          nextNodeId: 'triumph_story',
        },
        {
          text: 'Tell me about one who haunts you.',
          nextNodeId: 'haunting_story',
        },
      ],
    },

    {
      id: 'triumph_story',
      text: "The Morales family. Five people - grandmother, mother, three children. The father died in the mines, left them with his debt. They would have been trapped for twenty years. *His face brightens* We moved them on Christmas Eve, through a blizzard. The children thought it was an adventure.",
      choices: [
        {
          text: 'Where are they now?',
          nextNodeId: 'morales_now',
        },
      ],
    },

    {
      id: 'morales_now',
      text: "Oregon territory. The grandmother passed last year - peacefully, surrounded by family. The mother remarried, a good man. The children... *his eyes shine* ...the oldest is studying to be a teacher. Can you imagine? From a life of slavery to educating others. That is why we fight.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: 'That is beautiful.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'haunting_story',
      text: "*His voice drops* The Chen family. Not Wei's blood, but he treated them like his own. We had planned everything perfectly - the route, the timing, the safe houses. But someone talked. IVRC was waiting. The father tried to fight so the others could run...",
      expression: 'grief',
      choices: [
        {
          text: 'What happened?',
          nextNodeId: 'chen_fate',
        },
        {
          text: "You don't have to tell me.",
          nextNodeId: 'dont_tell_me',
        },
      ],
    },

    {
      id: 'chen_fate',
      text: "*He crosses himself* The father was killed. The mother and daughter were taken back to the camps. I never learned what happened to them after. Wei... he does not speak of it. But I see it in his eyes sometimes, when he thinks no one is watching. That failure binds us together.",
      choices: [
        {
          text: 'It was not your fault.',
          nextNodeId: 'not_your_fault',
        },
      ],
    },

    {
      id: 'not_your_fault',
      text: "*He shakes his head* It was someone's fault. The informer, yes. IVRC, certainly. But also me - I should have been more careful, planned better. *He looks up* That is why I am so cautious now. Every failure teaches us to be better. It must, or the suffering is for nothing.",
      choices: [
        {
          text: 'I understand.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'dont_tell_me',
      text: "*He nods* Some memories are too heavy to share. It is enough to know that not every story ends well. That is why each success matters so much. We balance the scales, one soul at a time.",
      choices: [
        {
          text: 'Let me help balance those scales.',
          nextNodeId: 'offer_help_underground',
        },
      ],
    },

    // ========================================================================
    // STILL BELIEVE (FAITH DISCUSSION)
    // ========================================================================
    {
      id: 'still_believe',
      text: "*He touches the cross at his neck* Some days more than others. Faith is not certainty - it is choosing to believe despite the darkness. When I see a child suffer, I rage at God. When I see that same child reach freedom, I weep with gratitude. Both are prayers.",
      expression: 'thoughtful',
      choices: [
        {
          text: 'That is a strange kind of faith.',
          nextNodeId: 'strange_faith',
        },
        {
          text: 'It sounds exhausting.',
          nextNodeId: 'exhausting_faith',
        },
      ],
    },

    {
      id: 'strange_faith',
      text: "*He laughs softly* All faith is strange, if you look at it closely. To believe in something you cannot see, cannot prove? It is madness. But it is also what makes us human. We reach for meaning in a world that offers none. That reaching itself is holy.",
      choices: [
        {
          text: 'I wish I had your faith.',
          nextNodeId: 'wish_faith',
        },
      ],
    },

    {
      id: 'wish_faith',
      text: "*He places a hand over his heart* Then start small. Believe that helping one person matters. Believe that kindness is not weakness. Believe that tomorrow can be better than today. These are acts of faith too. The rest... the rest comes in time. Or it does not. Either way, the kindness remains.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: 'Thank you, Father.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'exhausting_faith',
      text: "Si, it is. *He sits heavily* Some nights I want nothing more than to walk away, find a quiet parish in the East where no one is dying, no one is fleeing. But then I think of Maria Rosalia. And I know I cannot stop. Not while children are still suffering.",
      choices: [
        {
          text: 'You carry a heavy burden.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
  ],
};

export const FatherMiguelDialogues = [FatherMiguelMainDialogue];
