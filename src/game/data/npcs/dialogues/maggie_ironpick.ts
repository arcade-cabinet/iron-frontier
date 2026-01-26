/**
 * Maggie Ironpick (Margaret Ironpick) - Dialogue Trees
 *
 * Samuel's granddaughter with secret Copperhead sympathies. Lost her
 * father in a mine collapse caused by IVRC negligence. Torn between
 * loyalty to her grandfather's peaceful resistance and her desire
 * for direct action against the corporation.
 */

import type { DialogueTree } from '../../schemas/npc';

export const MaggieIronpickMainDialogue: DialogueTree = {
  id: 'maggie_ironpick_main',
  name: 'Maggie Ironpick - Main Conversation',
  description: 'Primary dialogue tree for Margaret "Maggie" Ironpick',
  tags: ['freeminer_hollow', 'freeminer', 'copperhead_connected', 'conflicted'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'trusted_greeting',
      conditions: [{ type: 'reputation_gte', value: 40 }],
      priority: 8,
    },
    {
      nodeId: 'knows_secret_greeting',
      conditions: [{ type: 'flag_set', target: 'knows_maggie_secret' }],
      priority: 7,
    },
    {
      nodeId: 'quest_active_greeting',
      conditions: [{ type: 'quest_active', target: 'maggies_secret' }],
      priority: 5,
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
      text: "*A young woman with fiery red hair looks up from sharpening a pickaxe, her green eyes immediately suspicious* Another outsider. Great. *She doesn't stop working* What do you want? If you're here to buy our claims, you can turn right back around.",
      expression: 'hostile',
      choices: [
        {
          text: "I'm not here to buy anything. I want to help.",
          nextNodeId: 'want_to_help',
        },
        {
          text: 'The Sheriff sent me to investigate the disappearances.',
          nextNodeId: 'sheriff_sent',
        },
        {
          text: "Just passing through. Didn't mean to disturb you.",
          nextNodeId: 'passing_through',
        },
      ],
    },

    {
      id: 'want_to_help',
      text: "*She laughs bitterly* Help? Everyone wants to 'help.' The politicians want to help by selling us out to IVRC. The lawmen want to help by arresting anyone who fights back. What's your angle?",
      choices: [
        {
          text: 'No angle. I just believe IVRC needs to be stopped.',
          nextNodeId: 'believe_ivrc_stopped',
        },
        {
          text: "I have my own reasons to hate them.",
          nextNodeId: 'own_reasons',
        },
        {
          text: "Maybe you're right to be suspicious.",
          nextNodeId: 'right_suspicious',
        },
      ],
    },

    {
      id: 'believe_ivrc_stopped',
      text: "*She pauses her work, studying you* That's what everyone says. Then they see what stopping them actually takes, and they run. *She sets down the pickaxe* My grandfather believes in patience. In waiting for the right moment. I've been waiting my whole life. The moment never comes.",
      choices: [
        {
          text: 'What would you do differently?',
          nextNodeId: 'do_differently',
        },
        {
          text: 'Sometimes patience is wisdom.',
          nextNodeId: 'patience_wisdom',
        },
        {
          text: 'Tell me about your grandfather.',
          nextNodeId: 'about_samuel',
        },
      ],
    },

    {
      id: 'do_differently',
      text: "*Her eyes flash* What I'd do? I'd hit them where it hurts. Their shipments, their supply lines, their precious profits. *She catches herself, glancing around* But that's... that's just talk. Grandfather would never approve of violence.",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_hinted_violence' }],
      choices: [
        {
          text: 'You sound like you admire the Copperheads.',
          nextNodeId: 'admire_copperheads',
        },
        {
          text: 'Violence has costs.',
          nextNodeId: 'violence_costs',
        },
        {
          text: "Your grandfather seems wise.",
          nextNodeId: 'about_samuel',
        },
      ],
    },

    {
      id: 'admire_copperheads',
      text: "*She freezes for just a moment, then forces a laugh* The Copperheads? They're outlaws. Criminals. *She doesn't meet your eyes* I'm just... frustrated. Forget I said anything.",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_copperhead_suspicion' }],
      choices: [
        {
          text: "[Perception] You're not a very good liar.",
          nextNodeId: 'not_good_liar',
          conditions: [{ type: 'reputation_gte', value: 20 }],
        },
        {
          text: "I understand frustration. I won't judge.",
          nextNodeId: 'wont_judge',
        },
        {
          text: "Alright. Let's talk about something else.",
          nextNodeId: 'change_subject',
        },
      ],
    },

    {
      id: 'not_good_liar',
      text: "*Her face flushes with anger and fear* You don't know what you're talking about. *She picks up the pickaxe again, grip tight* I think you should leave.",
      choices: [
        {
          text: "Your secret's safe with me.",
          nextNodeId: 'secret_safe',
        },
        {
          text: "Fine. I didn't mean to pry.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'secret_safe',
      text: "*She studies you intensely for a long moment* ...Why? Why would you keep my secret? You don't even know me. You could tell my grandfather, or worse, the Sheriff. What do you want from me?",
      choices: [
        {
          text: 'Nothing. I just believe in the same cause.',
          nextNodeId: 'same_cause',
        },
        {
          text: 'Maybe you could help me with something in return.',
          nextNodeId: 'help_in_return',
        },
        {
          text: "Because everyone deserves a chance to fight how they choose.",
          nextNodeId: 'fight_how_choose',
        },
      ],
    },

    {
      id: 'same_cause',
      text: "*She lets out a long breath* You're either the most honest person I've met, or the best manipulator. *She sets down the pickaxe* Fine. Yes. I've been... working with Diamondback's people. Passing information, sometimes supplies. Grandfather would disown me if he knew.",
      onEnterEffects: [
        { type: 'set_flag', target: 'knows_maggie_secret' },
        { type: 'change_reputation', value: 15 },
      ],
      choices: [
        {
          text: 'Why keep it from him?',
          nextNodeId: 'why_keep_secret',
        },
        {
          text: 'What kind of information?',
          nextNodeId: 'what_information',
        },
        {
          text: 'How did you get involved with the Copperheads?',
          nextNodeId: 'how_involved',
        },
      ],
    },

    {
      id: 'help_in_return',
      text: "*She narrows her eyes* There it is. Everyone wants something. *She sighs* Fine. What do you need? Within reason - I'm not going to betray my family or my people.",
      choices: [
        {
          text: "I need to get a message to Diamondback.",
          nextNodeId: 'message_diamondback',
        },
        {
          text: 'Information about IVRC movements.',
          nextNodeId: 'ivrc_movements',
        },
        {
          text: "Actually, I'll keep your secret for free. That's fair.",
          nextNodeId: 'same_cause',
        },
      ],
    },

    {
      id: 'message_diamondback',
      text: "*She hesitates, then nods slowly* I can do that. But it goes through channels - I don't have direct contact. And if this message is a trap... *Her hand moves to a knife at her belt* ...I'll know who to blame.",
      choices: [
        {
          text: "It's not a trap. I want to help their cause.",
          nextNodeId: 'help_cause',
        },
        {
          text: 'Fair enough. The message is...',
          nextNodeId: 'deliver_message',
        },
      ],
    },

    {
      id: 'help_cause',
      text: "*She studies you, some of her suspicion fading* You might be telling the truth. The Copperheads can always use allies. *She pulls out a worn piece of paper* Write your message. I'll see that it gets through. But no names, no locations. Code only.",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_will_contact_copperheads' }],
      choices: [
        {
          text: '[Write a message requesting contact]',
          nextNodeId: 'message_written',
        },
        {
          text: "Let me think about what to say first.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'message_written',
      text: "*She reads it over, nods* Simple and clear. Good. *She tucks it away* I'll pass this along. If they want to meet, you'll get word through... unconventional channels. Keep your eyes open.",
      onEnterEffects: [{ type: 'set_flag', target: 'copperhead_message_sent' }],
      choices: [
        {
          text: 'Thank you, Maggie.',
          nextNodeId: 'maggie_thanks',
        },
      ],
    },

    {
      id: 'maggie_thanks',
      text: "*She waves off the thanks* Don't thank me yet. If this goes wrong, we're both dead. *A small smile crosses her face* But if it goes right... maybe we can actually hurt those bastards for once.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: "We'll make it count.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'deliver_message',
      text: "*She waits, watching you carefully*",
      choices: [
        {
          text: "Tell them I know about Project Remnant.",
          nextNodeId: 'remnant_message',
          conditions: [{ type: 'flag_set', target: 'knows_remnant_details' }],
        },
        {
          text: 'Tell them I want to coordinate against IVRC.',
          nextNodeId: 'coordinate_message',
        },
      ],
    },

    {
      id: 'remnant_message',
      text: "*Her eyes widen* Remnant? You know about that? *She lowers her voice* Even the Copperheads only have rumors about that project. If you have real information... *She takes a breath* This changes things. Write exactly what you know. Diamondback will want to see this personally.",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_remnant_interest' }],
      choices: [
        {
          text: '[Write a detailed message]',
          nextNodeId: 'remnant_message_sent',
        },
      ],
    },

    {
      id: 'remnant_message_sent',
      text: "*She reads with growing intensity* This is... this is what we've been looking for. Evidence. Real evidence. *She looks at you with new respect* You might actually be the real thing. I'll get this to Diamondback immediately. Expect contact soon - and be ready to move fast.",
      onEnterEffects: [
        { type: 'set_flag', target: 'diamondback_urgent_contact' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: "I'll be ready.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'coordinate_message',
      text: "*She nods* Good. The resistance needs to work together, not apart. *She takes note of your message* I'll pass this along. Can't promise how quickly they'll respond - security is tight these days.",
      onEnterEffects: [{ type: 'set_flag', target: 'copperhead_message_sent' }],
      choices: [
        {
          text: 'Understood. Thank you.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ivrc_movements',
      text: "*She considers* I know some things. Supply schedules, patrol patterns - information I gather from... various sources. *She meets your eyes* What specifically do you need to know?",
      choices: [
        {
          text: 'When do shipments come through?',
          nextNodeId: 'shipment_info',
        },
        {
          text: 'Where are the guard rotations weakest?',
          nextNodeId: 'guard_info',
        },
        {
          text: "What's happening in the mountains?",
          nextNodeId: 'mountain_info',
        },
      ],
    },

    {
      id: 'shipment_info',
      text: "Main supply trains run every Tuesday and Friday. Guards are heaviest on those days - six to ten armed men per train. *She lowers her voice* But there's also a night shipment on Sundays. Smaller, lighter guard. That's what the Copperheads usually hit.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_shipment_schedule' }],
      choices: [
        {
          text: "That's useful. Thank you.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'guard_info',
      text: "The shift change at dawn is the weak point. About ten minutes where the night guards are tired and the day guards aren't quite in position. The western approach to the mining complex is least watched - they think the terrain protects it.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_guard_patterns' }],
      choices: [
        {
          text: "I'll remember that.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'mountain_info',
      text: "*She shakes her head* That's the one thing I don't know. Even the miners who work the regular shafts are kept away from certain areas. Heavy security, scientists coming and going. Whatever's happening up there, IVRC is keeping it under wraps.",
      choices: [
        {
          text: 'Have you heard the name Project Remnant?',
          nextNodeId: 'remnant_question_maggie',
        },
        {
          text: "I'll find out what they're hiding.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'remnant_question_maggie',
      text: "*She frowns* Remnant? I've heard whispers, but nothing concrete. Some kind of research project, maybe? *She shrugs* Whatever it is, it's important enough that IVRC is pulling resources from everywhere to protect it.",
      choices: [
        {
          text: "I'll learn more.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'fight_how_choose',
      text: "*Something in her expression softens* ...That's the first time anyone's said that to me. Grandfather thinks nonviolence is the only moral path. But people are dying. Workers disappearing. And all we do is wait. *She takes a shaky breath* Sometimes I feel like I'm going to explode.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: 'Tell me about your father.',
          nextNodeId: 'about_father',
        },
        {
          text: "That anger can be useful, if directed right.",
          nextNodeId: 'anger_useful',
        },
        {
          text: "I understand. I'll keep your confidence.",
          nextNodeId: 'same_cause',
        },
      ],
    },

    {
      id: 'about_father',
      text: "*Her face hardens* My father was Thomas Ironpick. Best miner in the territory. He reported safety violations at the IVRC mine - unstable tunnels, bad air, equipment failures. *Her voice cracks* They ignored him. A month later, the tunnel collapsed. Seventeen men dead. My father among them.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_father_death' }],
      choices: [
        {
          text: "I'm so sorry.",
          nextNodeId: 'sorry_father',
        },
        {
          text: 'And IVRC faced no consequences?',
          nextNodeId: 'no_consequences',
        },
      ],
    },

    {
      id: 'sorry_father',
      text: "*She wipes her eyes roughly* Don't be sorry. Be angry. My father did everything right - reported through proper channels, followed the rules. And he died anyway. The rules don't protect workers. They protect the people who own the mines.",
      choices: [
        {
          text: 'Then we change the rules.',
          nextNodeId: 'change_rules',
        },
        {
          text: 'Or we work outside them.',
          nextNodeId: 'outside_rules',
        },
      ],
    },

    {
      id: 'no_consequences',
      text: "*She laughs bitterly* Consequences? They paid a fine. A fine! Seventeen lives, reduced to numbers in a ledger. The inspector who signed off on the safety reports? He got promoted. *She spits* That's IVRC justice.",
      choices: [
        {
          text: 'That has to change.',
          nextNodeId: 'change_rules',
        },
        {
          text: 'Is that why you turned to the Copperheads?',
          nextNodeId: 'why_copperheads',
        },
      ],
    },

    {
      id: 'change_rules',
      text: "*She looks at you with desperate hope* You really believe that? That things can change? *She shakes her head* I've stopped believing. But... maybe that's why I need people like you. People who still have hope.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: "I'll prove it to you.",
          nextNodeId: 'prove_it',
        },
        {
          text: 'Hope is the last weapon they cannot take.',
          nextNodeId: 'hope_weapon',
        },
      ],
    },

    {
      id: 'prove_it',
      text: "*A small smile crosses her face - the first genuine one you've seen* Alright. Prove it. Show me that fighting back isn't pointless. Help me... help me do something that matters. Then maybe I'll believe again.",
      onEnterEffects: [{ type: 'start_quest', target: 'maggies_secret' }],
      choices: [
        {
          text: 'What do you need?',
          nextNodeId: 'maggies_quest_intro',
        },
      ],
    },

    {
      id: 'hope_weapon',
      text: "*She's quiet for a moment* My father said something similar, once. Before he died. *She takes a deep breath* Maybe... maybe I've been dishonoring his memory by giving up on his ideals. *She looks at you* Help me find another way.",
      onEnterEffects: [{ type: 'start_quest', target: 'maggies_secret' }],
      choices: [
        {
          text: "What can I do?",
          nextNodeId: 'maggies_quest_intro',
        },
      ],
    },

    {
      id: 'maggies_quest_intro',
      text: "*She glances around, then speaks quietly* There's something I've been planning. A way to hurt IVRC and expose what they did to my father. But I can't do it alone, and I can't tell Grandfather. *She meets your eyes* The documents he has - the ones proving IVRC's negligence? I know where copies are hidden. But they're in the burned house. In Dusty Springs.",
      choices: [
        {
          text: 'The Ironpick house that burned down?',
          nextNodeId: 'burned_house',
        },
        {
          text: "What's in the documents?",
          nextNodeId: 'documents_contents',
        },
      ],
    },

    {
      id: 'burned_house',
      text: "*She nods* IVRC burned it, thinking they destroyed everything. But my father was clever. He built a hidden compartment in the foundation - fireproof, waterproof. If those documents survived... they could prove that IVRC knew the mine was unsafe. That they killed my father and sixteen others through deliberate negligence.",
      choices: [
        {
          text: "I'll help you retrieve them.",
          nextNodeId: 'agree_retrieve',
        },
        {
          text: 'Why not tell your grandfather about this?',
          nextNodeId: 'why_not_samuel',
        },
      ],
    },

    {
      id: 'documents_contents',
      text: "Safety reports. Inspection records. Internal memos proving the company knew the tunnels were unstable but kept working anyway because shutting down would hurt profits. *Her voice hardens* Proof that they murdered my father and called it an accident.",
      choices: [
        {
          text: "That's powerful evidence. Let's get it.",
          nextNodeId: 'agree_retrieve',
        },
        {
          text: 'Has anyone else tried to retrieve these?',
          nextNodeId: 'others_tried',
        },
      ],
    },

    {
      id: 'agree_retrieve',
      text: "*Her face lights up* You'll help? Really? *She composes herself* The site is watched - not constantly, but IVRC patrols pass by regularly. We'll need to go at night, move fast, and get out before anyone notices. Can you meet me there after dark?",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_quest_started' }],
      choices: [
        {
          text: "I'll be there. After dark, the burned house.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'why_not_samuel',
      text: "*She sighs* Because he'd try to stop me. He thinks the documents should be saved for 'the right moment' - some perfect opportunity that never comes. *Her jaw tightens* I'm tired of waiting. My father waited, and he died. I won't make the same mistake.",
      choices: [
        {
          text: "Your grandfather might surprise you.",
          nextNodeId: 'grandfather_surprise',
        },
        {
          text: 'Then we do this without him.',
          nextNodeId: 'agree_retrieve',
        },
      ],
    },

    {
      id: 'grandfather_surprise',
      text: "*She shakes her head sadly* I love him, but I know him. He's seen too much violence in his life. He thinks all fighting leads to more death. Maybe he's right. But doing nothing leads to death too - just slower, and they call it 'progress.' *She looks away* At least with fighting, you die on your feet.",
      choices: [
        {
          text: 'Let me help you, then.',
          nextNodeId: 'agree_retrieve',
        },
        {
          text: 'Think carefully before acting.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'others_tried',
      text: "Not that I know of. Most people think everything was destroyed in the fire. And the site's considered bad luck - haunted, some say. *She snorts* The only ghosts there are the ones IVRC created. That's the real haunting.",
      choices: [
        {
          text: "Ghosts don't scare me. Let's do this.",
          nextNodeId: 'agree_retrieve',
        },
      ],
    },

    {
      id: 'outside_rules',
      text: "*Her eyes meet yours, and for the first time, she really seems to see you* Yes. That's exactly it. The rules are designed by those in power to keep power. The only way to fight back is to refuse to play by them. *She steps closer* You understand. You really understand.",
      onEnterEffects: [{ type: 'change_reputation', value: 15 }],
      choices: [
        {
          text: "Tell me about your work with the Copperheads.",
          nextNodeId: 'same_cause',
        },
        {
          text: "What do you want to do?",
          nextNodeId: 'what_do_now',
        },
      ],
    },

    {
      id: 'what_do_now',
      text: "*She takes a breath* Something that matters. Something that actually hurts them. The documents about my father's death - if we could get them out, make them public... it would prove that IVRC murdered those miners. It wouldn't bring anyone back, but it might save others. And it would make them pay.",
      choices: [
        {
          text: "I'll help you.",
          nextNodeId: 'agree_retrieve',
        },
        {
          text: 'How would we make them public?',
          nextNodeId: 'make_public',
        },
      ],
    },

    {
      id: 'make_public',
      text: "The newspapers back east would print it - they love scandal. Or we could give it to politicians looking for ammunition against the railroad. *She grins darkly* Or the Copperheads could use it to rally more support. People need to see what IVRC really is.",
      choices: [
        {
          text: "First we get the documents. Then we decide.",
          nextNodeId: 'agree_retrieve',
        },
      ],
    },

    {
      id: 'why_copperheads',
      text: "*She's quiet for a moment* Diamondback found me, not the other way around. She'd heard about my father, about what IVRC did. She offered me a way to fight back that didn't involve waiting and hoping. *She meets your eyes* How could I refuse?",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_maggie_secret' }],
      choices: [
        {
          text: 'What have you done for them?',
          nextNodeId: 'what_done_copperheads',
        },
        {
          text: "I understand. I won't judge you.",
          nextNodeId: 'understand_copperheads',
        },
      ],
    },

    {
      id: 'what_done_copperheads',
      text: "Information, mostly. Schedules, patrol routes, which miners might be sympathetic. Nothing that gets blood on my hands directly. *She looks away* But I know what that information is used for. And I don't regret it. Every train they rob is a blow against the people who killed my father.",
      choices: [
        {
          text: "That's a heavy burden to carry alone.",
          nextNodeId: 'burden_alone',
        },
        {
          text: 'Does your grandfather suspect?',
          nextNodeId: 'grandfather_suspect',
        },
      ],
    },

    {
      id: 'burden_alone',
      text: "*Her voice cracks* It is. Sometimes I lie awake at night wondering if I'm betraying everything my grandfather believes in. If my father would be ashamed of me. *She straightens* But then I remember watching them carry out his body. And I know I'm doing what needs to be done.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: "You're not alone anymore.",
          nextNodeId: 'not_alone',
        },
        {
          text: "Let me help shoulder that burden.",
          nextNodeId: 'not_alone',
        },
      ],
    },

    {
      id: 'not_alone',
      text: "*Tears well up in her eyes, though she blinks them back angrily* I... thank you. I've been carrying this so long. *She takes a steadying breath* Maybe together we can actually make a difference. Not just fighting blindly, but fighting smart. Fighting to win.",
      onEnterEffects: [
        { type: 'set_flag', target: 'maggie_ally' },
        { type: 'change_reputation', value: 15 },
      ],
      choices: [
        {
          text: 'What should we do first?',
          nextNodeId: 'maggies_quest_intro',
        },
      ],
    },

    {
      id: 'grandfather_suspect',
      text: "*She shakes her head* If he did, he'd confront me. He's not one for silence when he thinks something's wrong. *She sighs* He just thinks I'm angry and impatient. Which is true. He doesn't know where I'm channeling that anger.",
      choices: [
        {
          text: "Maybe someday you can tell him the truth.",
          nextNodeId: 'tell_truth_someday',
        },
        {
          text: "He might understand more than you think.",
          nextNodeId: 'understand_more',
        },
      ],
    },

    {
      id: 'tell_truth_someday',
      text: "Maybe. When IVRC is ash and the workers are free. *A sad smile crosses her face* Or maybe I'll die before that day comes, and he'll never know. Either way, I can live with myself. That's all I can ask.",
      choices: [
        {
          text: "You'll live to see that day. I'll make sure of it.",
          nextNodeId: 'not_alone',
        },
      ],
    },

    {
      id: 'understand_more',
      text: "*She shakes her head* You don't know him like I do. He lost his son to violence. He sees any fighting as leading to more death. *She pauses* Maybe he's right. Maybe I'm just feeding a cycle that will never end. But I can't stop. Not until they pay.",
      choices: [
        {
          text: 'There are ways to make them pay without endless violence.',
          nextNodeId: 'not_alone',
        },
      ],
    },

    {
      id: 'understand_copperheads',
      text: "*She seems genuinely surprised* You mean that, don't you? Most people would condemn me. Call me a traitor or a criminal. *She studies you* Maybe you really are different.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: "I believe in your cause, even if I question methods.",
          nextNodeId: 'not_alone',
        },
      ],
    },

    {
      id: 'anger_useful',
      text: "*She nods slowly* That's what Diamondback says. She channels her rage into action. Into hitting IVRC where it hurts. *She glances at you* I've been channeling mine the same way. Probably shouldn't tell you that, but... something about you makes me want to trust you.",
      choices: [
        {
          text: "You can trust me.",
          nextNodeId: 'same_cause',
        },
        {
          text: 'Trust is earned. Let me prove myself.',
          nextNodeId: 'prove_trust',
        },
      ],
    },

    {
      id: 'prove_trust',
      text: "*She considers* Alright. There's something I need help with. Something I can't ask Grandfather or the other miners. *She lowers her voice* Meet me after dark by the old cairn north of camp. If you show up, I'll know you're serious.",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_meeting_offered' }],
      choices: [
        {
          text: "I'll be there.",
          nextNodeId: null,
        },
        {
          text: 'What is this about?',
          nextNodeId: 'meeting_about',
        },
      ],
    },

    {
      id: 'meeting_about',
      text: "*She shakes her head* Not here. Too many ears. Just... show up if you want to help. If you don't, no hard feelings. But don't waste my time.",
      choices: [
        {
          text: "I'll be there.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'wont_judge',
      text: "*She relaxes slightly* I... appreciate that. Everyone around here is so sure they know what's right. Grandfather says patience. Diamondback says violence. The workers say wait for someone else to fix it. *She sighs* I just want it all to end.",
      choices: [
        {
          text: "What do you believe is right?",
          nextNodeId: 'what_believes',
        },
        {
          text: "Sometimes there's no clear answer.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'what_believes',
      text: "*She's quiet for a long moment* I believe in justice. Not the kind IVRC buys with lawyers and bribes. Real justice. Eye for an eye. They took my father's life - someone should pay for that. Not with money. With consequences.",
      choices: [
        {
          text: 'Revenge and justice are different things.',
          nextNodeId: 'revenge_justice',
        },
        {
          text: "That kind of justice often destroys the seeker.",
          nextNodeId: 'destroys_seeker',
        },
        {
          text: 'I understand that feeling.',
          nextNodeId: 'understand_feeling',
        },
      ],
    },

    {
      id: 'revenge_justice',
      text: "*Her eyes flash* Are they? When the law protects the guilty and punishes the innocent, what's left but revenge? Call it what you want. I call it balancing the scales.",
      choices: [
        {
          text: "There might be another way to balance them.",
          nextNodeId: 'prove_it',
        },
        {
          text: "You're not wrong.",
          nextNodeId: 'understand_feeling',
        },
      ],
    },

    {
      id: 'destroys_seeker',
      text: "*She laughs bitterly* Then I'm already destroyed. Have been since the day they brought my father's body out of that mine. *She meets your eyes* At least this way, my destruction means something.",
      choices: [
        {
          text: "You're not destroyed. You're still fighting.",
          nextNodeId: 'still_fighting',
        },
        {
          text: "There's still time to choose a different path.",
          nextNodeId: 'different_path',
        },
      ],
    },

    {
      id: 'still_fighting',
      text: "*Something flickers in her eyes - hope, maybe, buried deep* Fighting. Yeah. That's what this is, isn't it? Not giving up. *She takes a breath* Maybe you're right. Maybe I'm not as lost as I thought.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: "You're not lost. You just need direction.",
          nextNodeId: 'not_alone',
        },
      ],
    },

    {
      id: 'different_path',
      text: "*She shakes her head* The path was chosen for me the day they killed my father. All I can do now is walk it to the end. *She pauses* But... maybe I don't have to walk it alone.",
      choices: [
        {
          text: "You don't. I'll walk with you.",
          nextNodeId: 'not_alone',
        },
      ],
    },

    {
      id: 'understand_feeling',
      text: "*She looks at you with new interest* You've lost someone too, haven't you? To people who faced no consequences. *She nods slowly* Then you know. You know why I can't just wait and hope.",
      choices: [
        {
          text: 'Yes. I know.',
          nextNodeId: 'not_alone',
        },
      ],
    },

    {
      id: 'change_subject',
      text: "*She shrugs, picking up her pickaxe again* Sure. What do you want to know about? The mines? The camp? The fascinating world of pickaxe maintenance?",
      choices: [
        {
          text: 'Tell me about your grandfather.',
          nextNodeId: 'about_samuel',
        },
        {
          text: 'What is life like here?',
          nextNodeId: 'life_here',
        },
        {
          text: "I should go. We'll talk later.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'life_here',
      text: "Hard. Honest. *She gestures around* We work the claims ourselves, keep what we find. IVRC hates it - they want all the ore, all the profit. But as long as we hold the mountains, they can't just take it. *She smiles grimly* That's worth something.",
      choices: [
        {
          text: 'How long can you hold out?',
          nextNodeId: 'hold_out',
        },
        {
          text: "You're independent here.",
          nextNodeId: 'independent',
        },
      ],
    },

    {
      id: 'hold_out',
      text: "*Her smile fades* I don't know. They're pushing harder each year. Buying up water rights, blocking supply routes. Grandfather says we can last indefinitely if we're careful. But... *She trails off* I wonder sometimes if he really believes that.",
      choices: [
        {
          text: "Maybe outside help could change things.",
          nextNodeId: 'outside_help',
        },
        {
          text: "You sound worried.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'outside_help',
      text: "*She looks at you sharply* Outside help? From who? The government is bought. The law is bought. The only 'help' that's interested is IVRC, and their help means chains. *She pauses* Unless... you have something else in mind?",
      choices: [
        {
          text: "I'm building a coalition against IVRC.",
          nextNodeId: 'coalition_mention',
          conditions: [{ type: 'flag_set', target: 'building_coalition' }],
        },
        {
          text: "Sometimes help comes from unexpected places.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'coalition_mention',
      text: "*Her eyes widen* A coalition? Who's involved? *She lowers her voice eagerly* If there's a real chance to coordinate resistance, to actually fight back together... I could convince some of the younger miners. And maybe even persuade Grandfather to contribute the documents.",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_coalition_interest' }],
      choices: [
        {
          text: '[Tell her about your allies]',
          nextNodeId: 'share_allies',
        },
        {
          text: "It's still coming together. I'll tell you more soon.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'share_allies',
      text: "*She listens intently as you describe your contacts* The bounty hunter... the professor... *She nods slowly* These are real resources. Real possibilities. *She grips your arm* Don't let this fall apart. For the first time in years, I actually feel like we have a chance.",
      onEnterEffects: [
        { type: 'set_flag', target: 'maggie_in_coalition' },
        { type: 'change_reputation', value: 15 },
      ],
      choices: [
        {
          text: "We'll make it work. I promise.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'independent',
      text: "For now. *She nods* It's worth fighting for. My father died believing that workers should own their labor, keep what they earn. The Freeminers are his legacy. I won't let IVRC take that away.",
      choices: [
        {
          text: "It's a legacy worth protecting.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'about_samuel',
      text: "*Her expression softens* Grandfather is... he's the best man I know. Lost his son, his home, nearly lost everything. Still finds it in himself to hope, to lead, to believe things can change peacefully. *She sighs* I wish I had his faith.",
      choices: [
        {
          text: 'You seem to disagree with his methods.',
          nextNodeId: 'disagree_methods',
        },
        {
          text: 'He sounds like a good man.',
          nextNodeId: 'good_man',
        },
      ],
    },

    {
      id: 'disagree_methods',
      text: "Disagree? *She laughs* That's putting it mildly. He thinks patience and righteousness will win out. That if we just hold on long enough, justice will come. *Her voice hardens* Justice doesn't come. It has to be taken.",
      choices: [
        {
          text: 'Both approaches have merit.',
          nextNodeId: 'both_merit',
        },
        {
          text: "You sound frustrated.",
          nextNodeId: 'frustrated',
        },
      ],
    },

    {
      id: 'both_merit',
      text: "*She considers this* Maybe. Grandfather builds support, keeps people together. The Copperheads... they provide pressure, make IVRC bleed. *She shrugs* Maybe we need both. I just wish we could coordinate better instead of working at cross purposes.",
      choices: [
        {
          text: 'That could be arranged.',
          nextNodeId: 'coordinate_idea',
        },
        {
          text: "It's a difficult balance.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'coordinate_idea',
      text: "*She looks at you sharply* What do you mean? Are you suggesting... *She glances around* You'd have to talk to Grandfather. And somehow get word to Diamondback. They don't exactly exchange letters.",
      choices: [
        {
          text: 'I might be able to bridge that gap.',
          nextNodeId: 'bridge_gap',
        },
        {
          text: 'Just thinking out loud.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'bridge_gap',
      text: "*Her eyes widen with hope* If you could... if the Freeminers and the Copperheads actually worked together... *She shakes her head* It would be risky. If Grandfather found out I've been in contact with outlaws... but it might be worth it.",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_bridge_idea' }],
      choices: [
        {
          text: "Let's make it happen.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'frustrated',
      text: "Frustrated doesn't cover it. *She gestures at the mountains* We have the high ground, the resources, the moral right. And we're losing anyway because IVRC has money and power and the ability to wait us out. Something has to change.",
      choices: [
        {
          text: "Maybe I can help change it.",
          nextNodeId: 'prove_it',
        },
        {
          text: "I understand your frustration.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'good_man',
      text: "He is. Too good for this world, maybe. *She picks up her pickaxe* That's why I have to protect him. Even from knowing what I've become.",
      choices: [
        {
          text: "What you've become is a fighter.",
          nextNodeId: 'fighter',
        },
        {
          text: "He might understand more than you think.",
          nextNodeId: 'understand_more',
        },
      ],
    },

    {
      id: 'fighter',
      text: "*She pauses* A fighter. *She tests the word* I suppose that's one way to put it. Better than 'traitor' or 'criminal,' anyway. *A small smile* Thanks for that.",
      choices: [
        {
          text: "You're welcome. We should talk more sometime.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'sheriff_sent',
      text: "*Her expression closes off completely* The Sheriff? Cole sent you? *She sets down the pickaxe and crosses her arms* He's been trying to get information from us for months. Whatever he thinks happened to those miners, we didn't do it.",
      choices: [
        {
          text: "He doesn't suspect you. He suspects IVRC.",
          nextNodeId: 'suspects_ivrc',
        },
        {
          text: "I'm not here to accuse anyone.",
          nextNodeId: 'not_accuse',
        },
        {
          text: 'What do you know about the disappearances?',
          nextNodeId: 'disappearances',
        },
      ],
    },

    {
      id: 'suspects_ivrc',
      text: "*She blinks* He does? *Her posture relaxes slightly* That's... unexpected. The law usually sides with the company. *She studies you* If he's investigating IVRC, maybe he's not as useless as I thought.",
      choices: [
        {
          text: "He's trying to do the right thing.",
          nextNodeId: 'cole_right_thing',
        },
        {
          text: 'Do you have information that could help?',
          nextNodeId: 'disappearances',
        },
      ],
    },

    {
      id: 'cole_right_thing',
      text: "*She snorts* The right thing with a badge paid for by IVRC taxes? But... *She hesitates* He did try to investigate my father's death. Before they shut him down. Maybe he's not all bad.",
      choices: [
        {
          text: 'What happened when he investigated?',
          nextNodeId: 'cole_investigation',
        },
        {
          text: "Perhaps you could work together.",
          nextNodeId: 'work_together',
        },
      ],
    },

    {
      id: 'cole_investigation',
      text: "He asked questions, gathered statements. For about a week. Then IVRC's lawyers showed up, the investigation was 'concluded,' and everything was ruled an accident. *Her voice is bitter* Cole didn't fight hard enough. But at least he tried.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_cole_tried' }],
      choices: [
        {
          text: "Maybe this time it'll be different.",
          nextNodeId: 'different_time',
        },
      ],
    },

    {
      id: 'different_time',
      text: "*She shakes her head* Different how? IVRC still has lawyers. They still own judges. What's changed?",
      choices: [
        {
          text: 'I have evidence they cannot bury.',
          nextNodeId: 'evidence_cannot_bury',
          conditions: [{ type: 'flag_set', target: 'knows_remnant_details' }],
        },
        {
          text: "People are waking up. There's growing resistance.",
          nextNodeId: 'growing_resistance',
        },
      ],
    },

    {
      id: 'evidence_cannot_bury',
      text: "*Her eyes sharpen* What kind of evidence? *She steps closer* If you have something real - something that could actually hurt them - I want to know about it.",
      choices: [
        {
          text: '[Tell her about Project Remnant]',
          nextNodeId: 'share_remnant_info',
        },
        {
          text: "Not yet. I need to verify it first.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'share_remnant_info',
      text: "*She listens intently, eyes widening* They're doing what in the mountains? *She shakes her head in disbelief* We knew something was happening up there, but this... *She meets your eyes* This changes everything. If we can prove this, IVRC is finished.",
      onEnterEffects: [
        { type: 'set_flag', target: 'maggie_knows_remnant' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: "That's the goal.",
          nextNodeId: 'not_alone',
        },
      ],
    },

    {
      id: 'growing_resistance',
      text: "*She nods slowly* I've noticed. More people willing to speak up, more 'accidents' that aren't accidents. *She looks at you* If there's really a movement building... maybe we have a chance after all.",
      choices: [
        {
          text: 'There is. And I want you to be part of it.',
          nextNodeId: 'not_alone',
        },
      ],
    },

    {
      id: 'work_together',
      text: "*She considers* Work with a lawman? *She shakes her head slowly* The last time we trusted the law, my father ended up dead and the killers went free. But... *She sighs* If Cole is actually investigating IVRC now, maybe things are changing.",
      choices: [
        {
          text: 'Trust has to start somewhere.',
          nextNodeId: 'trust_starts',
        },
      ],
    },

    {
      id: 'trust_starts',
      text: "*She meets your eyes* Maybe it starts with you, then. You seem to move between worlds - the law, the outlaws, us. Maybe that's what we need. A bridge. *She extends her hand* I'm Maggie. Margaret Ironpick, if you want the full name. And maybe... maybe I'll trust you. A little.",
      onEnterEffects: [
        { type: 'change_reputation', value: 10 },
        { type: 'set_flag', target: 'maggie_introduced' },
      ],
      choices: [
        {
          text: '*Shake her hand* A little is a start.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'not_accuse',
      text: "*She relaxes slightly* Fine. Then why are you here? What does a stranger care about missing miners?",
      choices: [
        {
          text: 'Because IVRC hurts people everywhere they go.',
          nextNodeId: 'believe_ivrc_stopped',
        },
        {
          text: 'Someone has to care.',
          nextNodeId: 'someone_cares',
        },
      ],
    },

    {
      id: 'someone_cares',
      text: "*She studies you for a long moment* ...Yeah. Someone does. *Her voice softens* Sorry for the hostility. We've had too many false friends lately. People who say they want to help, then sell us out to IVRC.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: "I'm not that kind of person.",
          nextNodeId: 'not_that_person',
        },
      ],
    },

    {
      id: 'not_that_person',
      text: "*She nods slowly* Maybe not. We'll see. *She picks up her pickaxe* Ask your questions. I'll answer what I can.",
      choices: [
        {
          text: 'Tell me about the disappearances.',
          nextNodeId: 'disappearances',
        },
        {
          text: 'What can you tell me about IVRC operations?',
          nextNodeId: 'ivrc_operations',
        },
      ],
    },

    {
      id: 'disappearances',
      text: "Miners going missing? *She frowns* It happens. The mountains are dangerous. But lately... *She lowers her voice* There's a pattern. People who work certain shifts, near certain tunnels. People who ask questions about what IVRC's doing up in the restricted areas. They just... vanish.",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_disappearance_info' }],
      choices: [
        {
          text: 'What restricted areas?',
          nextNodeId: 'restricted_areas',
        },
        {
          text: 'Do you have any names?',
          nextNodeId: 'missing_names',
        },
      ],
    },

    {
      id: 'restricted_areas',
      text: "Deep in the mountains. The old tunnels that supposedly played out years ago. *She shakes her head* But they didn't play out. IVRC just took them over and blocked everyone else. Heavy guards, no trespassing. Even their own miners aren't allowed in.",
      choices: [
        {
          text: 'What do you think is there?',
          nextNodeId: 'what_there',
        },
        {
          text: "I've heard about Project Remnant.",
          nextNodeId: 'remnant_question_maggie',
          conditions: [{ type: 'flag_set', target: 'heard_project_remnant' }],
        },
      ],
    },

    {
      id: 'what_there',
      text: "*She shrugs* I don't know. Nobody does. Some say a rich vein they're keeping secret. Others say weapons testing. And some... *She lowers her voice* Some say they found something. Something that was already there, buried in the rock.",
      choices: [
        {
          text: 'Something buried?',
          nextNodeId: 'something_buried',
        },
        {
          text: "Sounds like rumors.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'something_buried',
      text: "Old legends say the mountains were sacred to tribes that lived here long ago. That they sealed something away in the deepest caverns. *She shakes her head* Probably just stories. But IVRC's behavior up there... it's not normal. Not for a mining company.",
      choices: [
        {
          text: "I'll investigate further.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'investigating_mountains' }],
        },
      ],
    },

    {
      id: 'missing_names',
      text: "Tom Reeves, worked the night shift. Sarah Chen - no relation to the doctor - she was a surveyor. Old Pete Hannigan, been mining forty years. *Her voice hardens* All gone in the last six months. IVRC says they 'left for other opportunities.' Nobody believes that.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_missing_names' }],
      choices: [
        {
          text: 'Thank you for the names. It helps.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'ivrc_operations',
      text: "What don't I know? *She counts on her fingers* They control the main mines, the railroad, most of the water rights. They've been squeezing independent operators for years. And lately they've been hiring more guards, more scientists. Something big is happening.",
      choices: [
        {
          text: 'Scientists?',
          nextNodeId: 'scientists',
        },
        {
          text: 'How are they squeezing independents?',
          nextNodeId: 'squeezing_independents',
        },
      ],
    },

    {
      id: 'scientists',
      text: "*She nods* Eastern types. Not miners, not engineers - researchers. They come in on guarded coaches, go straight to the restricted areas. I've seen equipment being hauled up there that isn't mining gear. *She frowns* Something's wrong up in those mountains.",
      choices: [
        {
          text: "I'll find out what.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'squeezing_independents',
      text: "Everything you can imagine. Buying up water rights so we can't process ore. Blocking access to the railroad so we can't ship. Bribing suppliers to refuse us. *She gestures around* We survive by being stubborn and self-sufficient. But they're patient. They can wait us out.",
      choices: [
        {
          text: "Unless something changes.",
          nextNodeId: 'unless_changes',
        },
      ],
    },

    {
      id: 'unless_changes',
      text: "*She looks at you with sudden intensity* Are you that something? The change that tips the balance? *She shakes her head* Sorry. Just... hoping. We've been hoping for a long time.",
      choices: [
        {
          text: 'I intend to be.',
          nextNodeId: 'prove_it',
        },
        {
          text: "I'll do what I can.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'passing_through',
      text: "*She shrugs* Passing through the Freeminer's Hollow? Strange place to pass through. The trail doesn't go anywhere except deeper into the mountains. *Her suspicion returns* What are you really here for?",
      choices: [
        {
          text: "I'm looking to join the resistance against IVRC.",
          nextNodeId: 'believe_ivrc_stopped',
        },
        {
          text: 'I was told to seek out Samuel Ironpick.',
          nextNodeId: 'seeking_samuel',
        },
      ],
    },

    {
      id: 'seeking_samuel',
      text: "*Her expression hardens* Grandfather doesn't see just anyone. Who sent you, and why?",
      choices: [
        {
          text: 'Sheriff Cole suggested I could help.',
          nextNodeId: 'sheriff_sent',
        },
        {
          text: 'Doc Chen mentioned him.',
          nextNodeId: 'doc_mentioned',
        },
        {
          text: "I came on my own. I've heard he leads the resistance.",
          nextNodeId: 'own_initiative',
        },
      ],
    },

    {
      id: 'doc_mentioned',
      text: "*She relaxes slightly* Doc Chen? He's one of the few outsiders we trust. If he sent you... *She studies you* I'll take you to Grandfather. But watch what you say. He doesn't suffer fools or liars.",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_will_introduce_samuel' }],
      choices: [
        {
          text: "I understand. Thank you.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'own_initiative',
      text: "*She snorts* Bold. Stupid, maybe, but bold. *She considers* Alright. I'll see if Grandfather will meet you. But don't expect a warm welcome. We've learned the hard way not to trust easily.",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_considering' }],
      choices: [
        {
          text: "I'll earn your trust.",
          nextNodeId: 'earn_trust',
        },
      ],
    },

    {
      id: 'earn_trust',
      text: "*She nods slowly* Good answer. *She sets down the pickaxe* Come on, then. Let's see what you're made of.",
      choices: [
        {
          text: 'Lead the way.',
          nextNodeId: null,
        },
      ],
    },

    // Return greetings
    {
      id: 'return_greeting',
      text: "*Maggie looks up from her work* Back again. *She sets down her tools* What is it this time?",
      expression: 'neutral',
      choices: [
        {
          text: 'How are things in the Hollow?',
          nextNodeId: 'hollow_status',
        },
        {
          text: 'Any news from your contacts?',
          nextNodeId: 'contact_news',
          conditions: [{ type: 'flag_set', target: 'knows_maggie_secret' }],
        },
        {
          text: 'Just checking in.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'hollow_status',
      text: "Same as always. IVRC pressuring us, Grandfather holding firm. *She sighs* The younger miners are getting restless. They want to do something, not just wait. I know the feeling.",
      choices: [
        {
          text: 'Maybe the time for action is coming.',
          nextNodeId: 'time_for_action',
        },
        {
          text: "Patience can be strength too.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'time_for_action',
      text: "*Her eyes light up* You think so? *She lowers her voice* I've been preparing. Gathering information, making contacts. When the moment comes, I want to be ready.",
      choices: [
        {
          text: 'I might have news soon.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'contact_news',
      text: "*She glances around, then speaks quietly* The Copperheads hit another shipment last week. Big one - weapons bound for the mining security. Diamondback's people are better armed now. *She smiles grimly* IVRC is scrambling.",
      choices: [
        {
          text: 'Good. Keep me posted.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'trusted_greeting',
      text: "*Maggie's face lights up when she sees you* There you are! I was hoping you'd come back. *She pulls you aside* I have news.",
      expression: 'eager',
      choices: [
        {
          text: 'What kind of news?',
          nextNodeId: 'trusted_news',
        },
        {
          text: 'I have news too.',
          nextNodeId: 'share_news',
        },
      ],
    },

    {
      id: 'trusted_news',
      text: "*She speaks quickly* Diamondback wants to meet you. In person. *She grips your arm* This is huge. She doesn't meet with anyone she doesn't trust completely. Whatever you've been doing, it's working.",
      onEnterEffects: [{ type: 'set_flag', target: 'diamondback_meeting_offered' }],
      choices: [
        {
          text: 'When and where?',
          nextNodeId: 'meeting_details',
        },
        {
          text: "I'm ready.",
          nextNodeId: 'meeting_details',
        },
      ],
    },

    {
      id: 'meeting_details',
      text: "Three days from now, at the Hanging Oak crossroads. Midnight. Come alone, unarmed, and approach from the east. *She meets your eyes* Don't be late, and don't try anything clever. Diamondback doesn't give second chances.",
      onEnterEffects: [{ type: 'set_flag', target: 'diamondback_meeting_scheduled' }],
      choices: [
        {
          text: "I'll be there.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'share_news',
      text: "*She listens intently* What have you learned?",
      choices: [
        {
          text: '[Share coalition progress]',
          nextNodeId: 'coalition_update',
          conditions: [{ type: 'flag_set', target: 'building_coalition' }],
        },
        {
          text: '[Share Remnant information]',
          nextNodeId: 'share_remnant_info',
          conditions: [{ type: 'flag_set', target: 'knows_remnant_details' }],
        },
      ],
    },

    {
      id: 'coalition_update',
      text: "*Her eyes widen as you describe the growing alliance* Belle... the professor... *She shakes her head in amazement* You're actually doing it. Building something real. *She grips your hand* Count me in. Whatever you need.",
      onEnterEffects: [
        { type: 'set_flag', target: 'maggie_fully_committed' },
        { type: 'change_reputation', value: 15 },
      ],
      choices: [
        {
          text: "I knew I could count on you.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'knows_secret_greeting',
      text: "*Maggie pulls you aside immediately* We need to talk. Privately. *She leads you to a secluded spot* I've been thinking about what you said. About finding another way.",
      expression: 'serious',
      choices: [
        {
          text: "I'm listening.",
          nextNodeId: 'reconsidering',
        },
      ],
    },

    {
      id: 'reconsidering',
      text: "Maybe... maybe violence isn't the only answer. Or at least, not the first answer. *She takes a breath* The documents about my father. If we could get them out, make them public... that could hurt IVRC more than any raid. And no one has to die.",
      choices: [
        {
          text: "That's the Maggie I was hoping to see.",
          nextNodeId: 'agree_retrieve',
        },
        {
          text: "Are you sure you're ready for this?",
          nextNodeId: 'sure_ready',
        },
      ],
    },

    {
      id: 'sure_ready',
      text: "*She nods firmly* I'm sure. I've been fighting blind, hitting whatever target I could reach. But you showed me there's a bigger picture. A way to actually win, not just hurt them. *She meets your eyes* I want to be part of that.",
      choices: [
        {
          text: "Then let's get those documents.",
          nextNodeId: 'agree_retrieve',
        },
      ],
    },

    {
      id: 'quest_active_greeting',
      text: "*Maggie looks at you urgently* Did you get to the burned house? Were the documents still there?",
      expression: 'anxious',
      choices: [
        {
          text: 'Not yet. Still planning.',
          nextNodeId: 'still_planning',
        },
        {
          text: "[If you have the documents] I have them.",
          nextNodeId: 'documents_retrieved',
          conditions: [{ type: 'has_item', target: 'ironpick_documents' }],
        },
      ],
    },

    {
      id: 'still_planning',
      text: "*She nods tensely* Be careful. IVRC's increased patrols around the old site. Someone must have tipped them off that we're interested. *She frowns* Or they're just paranoid. Either way, watch yourself.",
      choices: [
        {
          text: "I'll be careful.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'documents_retrieved',
      text: "*Her eyes go wide* You... you actually got them? *She takes the papers with trembling hands* These are... oh my God. *Tears stream down her face* My father's reports. His signatures. Everything IVRC tried to destroy. *She looks at you* You did it. You really did it.",
      onEnterEffects: [
        { type: 'complete_quest', target: 'maggies_secret' },
        { type: 'change_reputation', value: 25 },
        { type: 'set_flag', target: 'documents_recovered' },
      ],
      choices: [
        {
          text: 'What will you do with them?',
          nextNodeId: 'documents_plan',
        },
      ],
    },

    {
      id: 'documents_plan',
      text: "*She wipes her eyes* Show Grandfather first. He needs to see that his son's death wasn't in vain. Then... *She straightens* Then we get these to people who can use them. Newspapers, politicians, anyone who will listen. IVRC's crimes will finally be exposed.",
      choices: [
        {
          text: "I'm proud of you, Maggie.",
          nextNodeId: 'proud_maggie',
        },
        {
          text: "Your father would be proud.",
          nextNodeId: 'father_proud',
        },
      ],
    },

    {
      id: 'proud_maggie',
      text: "*She laughs through her tears* I haven't done anything yet. But I will. *She grips your hand* Thank you. For believing in me when I'd stopped believing in myself. For showing me there's more than one way to fight.",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_full_ally' }],
      choices: [
        {
          text: "We're just getting started.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'father_proud',
      text: "*Her voice catches* You think so? *She looks at the documents* He died trying to do the right thing. Now I get to finish what he started. *She meets your eyes* That's worth everything. Everything.",
      onEnterEffects: [{ type: 'set_flag', target: 'maggie_full_ally' }],
      choices: [
        {
          text: "He'd be proud. I know it.",
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const MaggieIronpickDialogues = [MaggieIronpickMainDialogue];
