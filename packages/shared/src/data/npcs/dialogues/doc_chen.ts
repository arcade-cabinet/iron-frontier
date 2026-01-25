/**
 * Doc Chen Wei - Dialogue Trees
 *
 * The town doctor who knows everyone's secrets. Observant, wise,
 * and quietly subversive. Runs an underground network helping
 * those fleeing IVRC's oppression.
 */

import type { DialogueTree } from '../../schemas/npc';

export const DocChenMainDialogue: DialogueTree = {
  id: 'doc_chen_main',
  name: 'Doc Chen Wei - Main Conversation',
  description: 'Primary dialogue tree for Doc Chen Wei',
  tags: ['dusty_springs', 'healer', 'information'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'wounded_greeting',
      conditions: [{ type: 'flag_set', target: 'player_wounded' }],
      priority: 8,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
    // First meeting
    {
      id: 'first_meeting',
      text: "*A weathered man with keen eyes looks up from grinding herbs* Ah, a new face in Dusty Springs. I am Chen Wei - most call me Doc. You appear healthy enough, which is unusual for travelers on these roads. What brings you to my practice?",
      expression: 'curious',
      choices: [
        {
          text: "Just looking around. Nice to meet you.",
          nextNodeId: 'polite_intro',
        },
        {
          text: "I might need medical supplies.",
          nextNodeId: 'medical_supplies',
        },
        {
          text: "I hear you know things about this town.",
          nextNodeId: 'information_seeker',
        },
      ],
    },

    {
      id: 'polite_intro',
      text: "And you as well. *He sets down his mortar and pestle* Forgive the mess - I was preparing a tonic for the miners. The dust in their lungs... it is a slow killer. But such is life on the frontier. Everything here takes its toll.",
      choices: [
        {
          text: "You treat the miners?",
          nextNodeId: 'miner_treatment',
        },
        {
          text: "You seem well-established here.",
          nextNodeId: 'history',
        },
        {
          text: "I should let you work.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'miner_treatment',
      text: "Those who can afford it, or those who cannot and need it anyway. *He smiles slightly* IVRC's company doctors are... selective in their care. A man who asks too many questions about safety finds himself suddenly ineligible for treatment. So they come to me.",
      choices: [
        {
          text: "That sounds like you're taking a risk.",
          nextNodeId: 'doc_risk',
        },
        {
          text: "How bad are the conditions?",
          nextNodeId: 'mine_conditions',
        },
      ],
    },

    {
      id: 'doc_risk',
      text: "*He shrugs* All medicine is risk. The risk of action, the risk of inaction. I came to this country to practice healing, not to serve corporations. If IVRC wishes to silence me... *he gestures to the shelves of remedies* ...they will find I am useful to too many people.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: "Brave of you.",
          nextNodeId: 'brave_response',
        },
        {
          text: "Or foolish.",
          nextNodeId: 'foolish_response',
        },
      ],
    },

    {
      id: 'brave_response',
      text: "Practical, I would say. *He returns to his work* A doctor who only heals the wealthy is not much of a doctor at all. Now - is there something specific I can help you with?",
      choices: [
        {
          text: "Tell me about the miners' conditions.",
          nextNodeId: 'mine_conditions',
        },
        {
          text: "I'd like to buy some supplies.",
          nextNodeId: 'medical_supplies',
        },
        {
          text: "Not right now. Thank you, Doc.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'foolish_response',
      text: "*He chuckles* Perhaps. But I have outlived wiser men by being useful. In my experience, the foolish are those who believe they have nothing left to learn. Are you such a person?",
      choices: [
        {
          text: "I'm always learning.",
          nextNodeId: 'learning_response',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: "I know what I need to know.",
          nextNodeId: 'know_it_all',
          effects: [{ type: 'change_reputation', value: -5 }],
        },
      ],
    },

    {
      id: 'learning_response',
      text: "Good. That will serve you well here. The frontier does not forgive ignorance. *He nods approvingly* If you have questions about this town or its people, you may ask. I have been here long enough to see much.",
      choices: [
        {
          text: "What should I know about Dusty Springs?",
          nextNodeId: 'town_overview',
        },
        {
          text: "I'll remember that. Thank you.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'know_it_all',
      text: "Mm. *He returns to his herbs without further comment* Then I wish you well. My door is open should you reconsider.",
      choices: [
        {
          text: "Fine.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'mine_conditions',
      text: "IVRC's operations care nothing for the workers. Twelve-hour shifts in tunnels thick with copper dust. No ventilation, no safety rails. When the ceiling collapses, they count it as 'acceptable loss' and hire the next desperate soul. I treat what I can, but many are beyond help by the time they reach me.",
      expression: 'sad',
      choices: [
        {
          text: "Can nothing be done?",
          nextNodeId: 'what_can_be_done',
        },
        {
          text: "Why do people work there?",
          nextNodeId: 'why_work_there',
        },
      ],
    },

    {
      id: 'what_can_be_done',
      text: "The Freeminers fight for better conditions. The Copperheads rob IVRC to hurt their profits. Father Miguel gives spiritual comfort. I... I heal who I can, and I listen. Sometimes, listening is medicine itself.",
      choices: [
        {
          text: "And the law?",
          nextNodeId: 'law_opinion',
        },
        {
          text: "There must be evidence of wrongdoing.",
          nextNodeId: 'evidence_question',
        },
      ],
    },

    {
      id: 'law_opinion',
      text: "Sheriff Cole is a good man, but his badge comes from authorities that answer to IVRC. He investigates what he can, arrests who he must. But systemic change? That requires power he does not possess. *He lowers his voice* Or evidence that cannot be ignored.",
      onEnterEffects: [{ type: 'set_flag', target: 'doc_mentioned_evidence' }],
      choices: [
        {
          text: "What kind of evidence?",
          nextNodeId: 'evidence_question',
        },
        {
          text: "I understand. Thank you for your candor.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'evidence_question',
      text: "*He glances toward the door, then speaks quietly* There were documents. Records of safety violations, bribes, deaths covered up. The Ironpick family had copies. Then their house burned, and they fled to the mountains. If those documents still exist...",
      onEnterEffects: [{ type: 'set_flag', target: 'doc_told_about_documents' }],
      choices: [
        {
          text: "Where might they be?",
          nextNodeId: 'document_location',
        },
        {
          text: "That's dangerous knowledge.",
          nextNodeId: 'dangerous_knowledge',
        },
      ],
    },

    {
      id: 'document_location',
      text: "Old Samuel Ironpick took his family to Freeminer's Hollow when IVRC's men came for them. If anyone knows where the evidence is hidden, it would be him. But he trusts no one now. Too many have tried to buy or steal what he knows.",
      choices: [
        {
          text: "How could someone earn his trust?",
          nextNodeId: 'earn_trust',
        },
        {
          text: "I'll look into it.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'seeking_ironpick_docs' }],
        },
      ],
    },

    {
      id: 'earn_trust',
      text: "Help his people without asking for anything in return. Protect them from claim jumpers. Bring them supplies they cannot get. Show that you value their cause, not just their secrets. Words mean nothing to Samuel. Only actions.",
      choices: [
        {
          text: "Thank you for the guidance, Doc.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'dangerous_knowledge',
      text: "All knowledge is dangerous. The question is what one does with it. *He meets your eyes* You seem like someone who might do something worthwhile. But that is for you to decide, not me.",
      choices: [
        {
          text: "I appreciate your discretion.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'why_work_there',
      text: "Because the alternative is starving. IVRC controls the water rights, the stores, the credit. A man in debt to the company store works where the company says, for wages the company sets. It is not so different from the bondage my grandfather fled.",
      expression: 'thoughtful',
      choices: [
        {
          text: "There must be a way out.",
          nextNodeId: 'way_out',
        },
        {
          text: "I'm sorry to hear that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'way_out',
      text: "*He leans in* There is. Father Miguel and I... we help people disappear. New names, passage to other territories. But it is risky work. IVRC does not like losing its labor supply. If you ever wish to help...",
      conditions: [],
      onEnterEffects: [{ type: 'set_flag', target: 'doc_underground_hint' }],
      choices: [
        {
          text: "I might be interested.",
          nextNodeId: 'underground_interest',
        },
        {
          text: "That's not my concern.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'underground_interest',
      text: "Good. We can discuss it more another time. For now, know that your willingness to help does not go unnoticed. *He nods toward a side door* When you are ready, there is much to be done.",
      onEnterEffects: [
        { type: 'set_flag', target: 'can_join_underground' },
        { type: 'change_reputation', value: 15 },
      ],
      choices: [
        {
          text: "I'll be back.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'history',
      text: "Thirty years in this territory. I came when the railroad was just a dream and the only law was what a man carried on his hip. I have watched Dusty Springs grow from a water stop to a town. Whether that is progress... some days I wonder.",
      choices: [
        {
          text: "You've seen a lot of change.",
          nextNodeId: 'seen_change',
        },
        {
          text: "What was it like before IVRC?",
          nextNodeId: 'before_ivrc',
        },
      ],
    },

    {
      id: 'seen_change',
      text: "Change is the only constant. When I arrived, the greatest danger was the land itself - heat, drought, rattlesnakes. Now the danger wears suits and carries contracts. Perhaps that is civilization.",
      choices: [
        {
          text: "A cynical view.",
          nextNodeId: 'cynical_view',
        },
        {
          text: "You prefer the old days?",
          nextNodeId: 'old_days',
        },
      ],
    },

    {
      id: 'cynical_view',
      text: "Realistic. Cynicism is the refuge of those who expected too much. I simply observe what is. *He shrugs* But I still believe in healing. That has not changed.",
      choices: [
        {
          text: "Fair enough.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'old_days',
      text: "I prefer people being honest about what they are. A bandit with a gun is straightforward. A corporation that steals through paperwork while calling it 'progress'... that I find harder to stomach.",
      choices: [
        {
          text: "An interesting perspective.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'before_ivrc',
      text: "Harder, but simpler. People mined their own claims, ran their own ranches. The strong survived, yes, but there was opportunity for anyone willing to work. Now IVRC owns the opportunity, and doles it out as they see fit.",
      choices: [
        {
          text: "Progress has its price.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'medical_supplies',
      text: "*He gestures to his shelves* I have tonics for general wellness, bandages, antiseptic herbs. For more serious injuries, I can treat you here. My prices are fair - I ask only what people can afford.",
      choices: [
        {
          text: "What do you recommend for travelers?",
          nextNodeId: 'travel_supplies',
        },
        {
          text: "I'm not injured, just preparing.",
          nextNodeId: 'preparing',
        },
        {
          text: "[Browse Shop] Show me what you have.",
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'doc_chen_shop' }],
          tags: ['shop'],
        },
        {
          text: "Maybe later. Thank you.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'travel_supplies',
      text: "A healing tonic or two. Bandages for minor wounds. If you're heading into rough country, a snakebite kit. The western desert is full of rattlers, and the antivenom is not cheap to make.",
      choices: [
        {
          text: "I'll take your advice.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'ready_to_shop_doc' }],
        },
      ],
    },

    {
      id: 'preparing',
      text: "Wise. Most who come to me wait until they are bleeding or feverish. Prevention is always better than cure. What manner of dangers do you expect to face?",
      choices: [
        {
          text: "The usual - bandits, wildlife.",
          nextNodeId: 'usual_dangers',
        },
        {
          text: "I'm not sure yet.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'usual_dangers',
      text: "Then you will want basic supplies. I will prepare a kit for you. *He begins gathering items* Though I should warn you - the most dangerous things in this territory do not attack with claws or guns. Watch for those who smile while they stab.",
      choices: [
        {
          text: "Anyone in particular?",
          nextNodeId: 'who_to_watch',
        },
        {
          text: "I'll be careful. Thank you.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'who_to_watch',
      text: "The Mayor means well but serves IVRC's interests. The railroad's agents pass through regularly - they are friendly until they are not. And there are... others. People who gather information for coin. Trust is earned here, not given.",
      choices: [
        {
          text: "Noted. I appreciate the warning.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'information_seeker',
      text: "*He pauses his work and studies you carefully* A doctor hears many things. Patients speak freely when they are in pain or fear. But I am no gossip. What, specifically, do you wish to know?",
      expression: 'suspicious',
      choices: [
        {
          text: "I'm looking for information about a letter I received.",
          nextNodeId: 'letter_info',
        },
        {
          text: "I'm interested in the power dynamics here.",
          nextNodeId: 'power_dynamics',
        },
        {
          text: "Nevermind. I shouldn't have asked.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'letter_info',
      text: "A letter? *His eyes sharpen with interest* Many letters pass through this town. Some carry good news. Others... summon the dead. What did this letter say?",
      choices: [
        {
          text: "It was signed with a gear symbol.",
          nextNodeId: 'gear_knowledge',
        },
        {
          text: "I'd rather not say.",
          nextNodeId: 'letter_secretive',
        },
      ],
    },

    {
      id: 'gear_knowledge',
      text: "*He inhales sharply* The gear. I have not seen that mark in years. It was the symbol of the workers' alliance, before IVRC crushed them. If someone is using it again... *He trails off* Who gave you this letter?",
      onEnterEffects: [{ type: 'set_flag', target: 'doc_knows_gear_symbol' }],
      choices: [
        {
          text: "I don't know. It was unsigned.",
          nextNodeId: 'unsigned_letter',
        },
        {
          text: "Why is the symbol significant?",
          nextNodeId: 'gear_significance',
        },
      ],
    },

    {
      id: 'unsigned_letter',
      text: "Then someone is being careful. Good. The gear marked the Freeminer resistance - those who fought IVRC's stranglehold on the territory. Most of their leaders are dead or in hiding now. If that symbol is appearing again... something is stirring.",
      choices: [
        {
          text: "What should I do?",
          nextNodeId: 'what_to_do',
        },
      ],
    },

    {
      id: 'what_to_do',
      text: "Follow the thread carefully. Someone wanted you here for a reason. Perhaps they see in you what they need. A fresh face, unconnected to the factions. Be that person - but be careful. Those who play between powers often get crushed between them.",
      choices: [
        {
          text: "Thank you, Doc. This helps.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'gear_significance',
      text: "The gear represented the workers - the gears of industry that made the railroad rich while staying poor themselves. When the alliance was betrayed, IVRC made the symbol illegal. Wearing it was grounds for arrest. Using it now is either brave or foolish.",
      choices: [
        {
          text: "Brave and foolish often look the same.",
          nextNodeId: 'brave_foolish',
        },
      ],
    },

    {
      id: 'brave_foolish',
      text: "*He smiles slightly* A wise observation. Perhaps there is hope for you yet. *He returns to his work* Come back if you learn more. I am interested in where this thread leads.",
      choices: [
        {
          text: "I will. Thank you.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'letter_secretive',
      text: "Secrets have their place. *He nods* But remember - secrets can also isolate. If you find yourself in need of an ally, my door is open. I have kept many confidences in my time here.",
      choices: [
        {
          text: "I'll remember that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'power_dynamics',
      text: "Ah, a student of politics. *He sets aside his work* In Dusty Springs, power flows like this: IVRC at the top, Mayor Holt as their local voice, Sheriff Cole struggling to maintain true law. Father Miguel holds moral authority. And the rest of us... we navigate as best we can.",
      choices: [
        {
          text: "Where do the Copperheads fit in?",
          nextNodeId: 'copperhead_fit',
        },
        {
          text: "And the Freeminers?",
          nextNodeId: 'freeminer_fit',
        },
        {
          text: "Where do you fit in?",
          nextNodeId: 'doc_fit',
        },
      ],
    },

    {
      id: 'copperhead_fit',
      text: "Outside the system, attacking it. Diamondback Dolores sees herself as a freedom fighter. IVRC sees her as a criminal. The truth? Somewhere between. She hurts the railroad's profits, which helps the workers. But violence breeds violence.",
      choices: [
        {
          text: "Do you support her?",
          nextNodeId: 'support_copperhead',
        },
        {
          text: "I see.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'support_copperhead',
      text: "I support healing. When her people are injured, I treat them. When IVRC's men are injured, I treat them too. *He shrugs* Medicine does not take sides. But if you ask where my sympathies lie... I have never seen IVRC heal anyone.",
      choices: [
        {
          text: "A telling point.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'freeminer_fit',
      text: "The Freeminers resist more quietly. They control the independent claims in the mountains, refuse to sell to IVRC. Old Samuel Ironpick leads them - or tries to. They are losing ground each year as IVRC buys more land and hires more enforcers.",
      choices: [
        {
          text: "Can they survive?",
          nextNodeId: 'freeminer_survival',
        },
      ],
    },

    {
      id: 'freeminer_survival',
      text: "Perhaps. They are stubborn, and the mountains favor defenders. But survival and victory are different things. Unless something changes - unless someone finds a way to shift the balance - they will eventually be absorbed or destroyed.",
      choices: [
        {
          text: "Maybe something will change.",
          nextNodeId: 'change_hope',
        },
      ],
    },

    {
      id: 'change_hope',
      text: "*He looks at you with renewed interest* Perhaps it already is. New faces sometimes bring new possibilities. *He returns to his herbs* We shall see what you become, stranger.",
      choices: [
        {
          text: "We shall.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'doc_fit',
      text: "*He smiles* I am the one who patches everyone up afterward. In a territory of factions, the healer belongs to no side and all sides. It is a precarious position, but it has kept me alive this long.",
      choices: [
        {
          text: "A clever strategy.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'town_overview',
      text: "Dusty Springs is the crossroads of the territory. All paths lead here eventually. The Mayor runs civil matters, the Sheriff keeps peace, Father Miguel tends souls. Everyone else is just trying to survive the squeeze between IVRC's expansion and outlaw desperation.",
      choices: [
        {
          text: "Thank you for the overview.",
          nextNodeId: null,
        },
      ],
    },

    // Return greeting
    {
      id: 'return_greeting',
      text: "*Doc Chen looks up from his work* Ah, you return. How fares your health? And your investigations?",
      expression: 'curious',
      choices: [
        {
          text: "I'm well. Any new developments?",
          nextNodeId: 'developments',
        },
        {
          text: "I need supplies.",
          nextNodeId: 'medical_supplies',
        },
        {
          text: "[Browse Shop] Let me see what you have.",
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'doc_chen_shop' }],
          tags: ['shop'],
        },
        {
          text: "Just checking in.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'wounded_greeting',
      text: "*Doc Chen takes one look at you and gestures to a chair* Sit. Let me see those wounds. *He begins preparing bandages* You can tell me what happened while I work.",
      choices: [
        {
          text: "Thank you, Doc.",
          nextNodeId: 'treatment',
        },
      ],
    },

    {
      id: 'treatment',
      text: "*He works efficiently, cleaning and bandaging* These are not life-threatening, but they tell a story. You have been somewhere dangerous. The question is whether that danger found you, or you found it.",
      choices: [
        {
          text: "A bit of both.",
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
      text: "The usual troubles. More miners coming in with lung problems. Rumors of Copperhead activity near the railroad. And the Mayor has been meeting with IVRC representatives again. Something is being planned, though I know not what.",
      choices: [
        {
          text: "Keep me informed if you hear more.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
  ],
};

export const DocChenDialogues = [DocChenMainDialogue];
