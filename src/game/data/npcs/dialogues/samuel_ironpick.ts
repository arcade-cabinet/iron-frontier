/**
 * Old Samuel Ironpick - Dialogue Trees
 *
 * A grizzled miner and leader of the Freeminer resistance. Lost his son
 * to a preventable mine collapse caused by IVRC negligence. Holds critical
 * documents that could expose IVRC's crimes. Suspicious of outsiders but
 * fair once trust is earned. Key figure in the main quest chain.
 */

import type { DialogueTree } from '../../schemas/npc';

export const SamuelIronpickMainDialogue: DialogueTree = {
  id: 'samuel_ironpick_main',
  name: 'Samuel Ironpick - Main Conversation',
  description: 'Primary dialogue tree for Old Samuel Ironpick',
  tags: ['freeminer_hollow', 'faction_leader', 'freeminer', 'documents'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'gear_carrier',
      conditions: [
        { type: 'first_meeting' },
        { type: 'has_item', target: 'mysterious_letter' },
      ],
      priority: 15,
    },
    {
      nodeId: 'miguel_message',
      conditions: [
        { type: 'first_meeting' },
        { type: 'flag_set', target: 'carries_miguel_message' },
      ],
      priority: 12,
    },
    {
      nodeId: 'trusted_greeting',
      conditions: [{ type: 'reputation_gte', value: 50 }],
      priority: 5,
    },
    {
      nodeId: 'quest_update',
      conditions: [{ type: 'quest_active', target: 'find_documents' }],
      priority: 8,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
    // ========================================================================
    // FIRST MEETING (DEFAULT - NO SPECIAL CONDITIONS)
    // ========================================================================
    {
      id: 'first_meeting',
      text: "*A grizzled old man with a silver beard looks up from sharpening a pickaxe. His eyes are hard as the mountain rock around him.* Stop right there, stranger. You're on Freeminer land. State your business, or turn around and walk back the way you came.",
      expression: 'suspicious',
      choices: [
        {
          text: "I mean no harm. I'm looking for Samuel Ironpick.",
          nextNodeId: 'looking_for_samuel',
        },
        {
          text: "Sheriff Cole sent me. There's been disappearances.",
          nextNodeId: 'sheriff_sent',
          conditions: [{ type: 'quest_active', target: 'investigate_disappearances' }],
        },
        {
          text: 'I came to trade. Your people might need supplies.',
          nextNodeId: 'trade_offer',
        },
        {
          text: "I'll leave. Sorry to intrude.",
          nextNodeId: 'leave_peacefully',
        },
      ],
    },

    {
      id: 'looking_for_samuel',
      text: "*He sets down the pickaxe but keeps one hand near it* You found him. Question is, what do you want with an old miner who's got nothin' left to take? If IVRC sent you, save your breath. I ain't sellin'. Not today, not ever.",
      expression: 'guarded',
      choices: [
        {
          text: "IVRC didn't send me. I'm here about a letter.",
          nextNodeId: 'about_the_letter',
        },
        {
          text: "I've heard you lead the Freeminers. I want to help.",
          nextNodeId: 'want_to_help',
        },
        {
          text: "People in town speak well of you. I was curious.",
          nextNodeId: 'curious_visitor',
        },
      ],
    },

    {
      id: 'about_the_letter',
      text: "*His eyes narrow dangerously* A letter. *He stands slowly, his full height still impressive despite his age* What kind of letter? And who told you to bring it here?",
      expression: 'intense',
      choices: [
        {
          text: 'A letter with a gear symbol. It led me to your old house on Copper Street.',
          nextNodeId: 'gear_letter_response',
        },
        {
          text: "It's unsigned. Mentions an inheritance at 14 Copper Street.",
          nextNodeId: 'copper_street_response',
        },
      ],
    },

    {
      id: 'gear_letter_response',
      text: "*He goes very still. His weathered hand trembles slightly.* The gear. *He sits down heavily on a rock* I haven't seen that mark used in years. Not since the Alliance fell. *He looks up at you with different eyes* Who are you? Who are your people?",
      expression: 'shocked',
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_saw_gear' }],
      choices: [
        {
          text: "I don't know who sent it. I came here to find out.",
          nextNodeId: 'dont_know_sender',
        },
        {
          text: 'I think it was sent by family. But I need your help to understand why.',
          nextNodeId: 'family_sent',
        },
      ],
    },

    {
      id: 'copper_street_response',
      text: "Copper Street. *His jaw tightens* That was my home. For twenty years, that house held my family, my memories, my... *He stops* It burned. IVRC's people burned it. And now someone's sendin' letters about it? *He studies you* Why would someone send you to a pile of ashes?",
      choices: [
        {
          text: "That's what I'm trying to figure out. I found a partial manifest in the ruins.",
          nextNodeId: 'manifest_found',
          conditions: [{ type: 'has_item', target: 'item_partial_manifest' }],
        },
        {
          text: "I don't know. I was hoping you could tell me.",
          nextNodeId: 'dont_know_sender',
        },
      ],
    },

    {
      id: 'manifest_found',
      text: "*He snatches the manifest from your hand, reads it with trembling fingers* This... this is from the lockbox. Under the floorboards. I thought everything burned. *He looks at you with an expression between hope and terror* It mentions The Old Works. Do you know what that means?",
      expression: 'intense',
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_confirmed_manifest' }],
      choices: [
        {
          text: 'No. What are The Old Works?',
          nextNodeId: 'old_works_explanation',
        },
        {
          text: "I've heard rumors. Something underground that IVRC found.",
          nextNodeId: 'underground_knowledge',
          conditions: [{ type: 'flag_set', target: 'miguel_suspects_ivrc_secret' }],
        },
      ],
    },

    {
      id: 'old_works_explanation',
      text: "*He looks around to make sure no one is listening, then drops his voice* Deep under the Iron Mountains, there's somethin'. Not a mine. Not a cave. Somethin' built. Metal walls, corridors, machines that still hum after God knows how many centuries. IVRC found it five years ago. That's when everything changed.",
      expression: 'grave',
      onEnterEffects: [{ type: 'set_flag', target: 'knows_old_works_secret' }],
      choices: [
        {
          text: "You've seen it yourself?",
          nextNodeId: 'seen_it',
        },
        {
          text: "That's why they want the mining claims.",
          nextNodeId: 'claims_connection',
        },
        {
          text: 'What kind of machines?',
          nextNodeId: 'what_machines',
        },
      ],
    },

    {
      id: 'seen_it',
      text: "Once. My son Jacob found it first. A tunnel he was digging broke through into... somethin' else. Smooth walls, like nothin' I'd ever seen. He showed me before he told anyone else. *His voice cracks* I told him to seal it up. To forget about it. He didn't listen. Three weeks later, IVRC knew about it. A month after that, Jacob was dead.",
      expression: 'grief',
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_told_jacob_story' }],
      choices: [
        {
          text: 'IVRC killed him?',
          nextNodeId: 'jacob_death',
        },
        {
          text: "I'm sorry about your son.",
          nextNodeId: 'sorry_for_son',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'jacob_death',
      text: "Mine collapse. 'Structural failure,' they called it. In a tunnel my family had worked for ten years without a problem. And the only section that collapsed was the one nearest to the breakthrough into The Old Works. *He pounds his fist on his knee* They murdered my boy and called it an accident.",
      expression: 'angry',
      choices: [
        {
          text: 'Do you have proof?',
          nextNodeId: 'proof_of_murder',
        },
        {
          text: "They can't get away with this forever.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'proof_of_murder',
      text: "I have documents. Safety reports I copied before the originals disappeared. Testimony from miners who saw IVRC engineers weakening the supports. Letters between Thorne and his foreman discussing 'the Ironpick problem.' *He meets your eyes* I have proof enough to hang Cornelius Thorne. But proof means nothin' if there's no one honest enough to act on it.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_mentioned_proof' }],
      choices: [
        {
          text: 'Where are these documents?',
          nextNodeId: 'documents_location',
        },
        {
          text: "I'll help you get that proof to the right people.",
          nextNodeId: 'help_with_proof',
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },

    {
      id: 'documents_location',
      text: "*He shakes his head* I ain't tellin' you that. Not yet. I've had too many 'friends' who turned out to be IVRC informants. The documents are safe. They'll stay safe until I'm sure - absolutely sure - that they'll reach someone who can use 'em right.",
      choices: [
        {
          text: 'What would it take to earn your trust?',
          nextNodeId: 'earn_trust',
        },
        {
          text: 'I understand your caution.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'earn_trust',
      text: "*He looks you up and down* Actions, not words. My people are hurtin'. We need supplies - food, medicine, tools. We need protection from IVRC's claim jumpers who keep pushin' into our territory. Help us survive, and maybe - maybe - I'll believe you're not another snake.",
      onEnterEffects: [{ type: 'start_quest', target: 'freeminer_trust' }],
      choices: [
        {
          text: "Tell me what you need. I'll get it.",
          nextNodeId: 'supply_needs',
        },
        {
          text: "I'll prove myself. Watch.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'supply_needs',
      text: "Medicine, first. Doc Chen knows what we need - copper lung treatments, bandages, antiseptic. If you can get supplies from him without IVRC's spies followin' you, that'd be a start. We also need blasting powder. The legitimate kind - our supplier in Junction City got shut down by IVRC's licensing board.",
      choices: [
        {
          text: "I'll talk to Doc Chen.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'samuel_needs_medicine' }],
        },
        {
          text: "Where can I find blasting powder?",
          nextNodeId: 'blasting_powder',
        },
      ],
    },

    {
      id: 'blasting_powder',
      text: "There's a trader in Coppertown. Runs a side business out of the back of the general store. Goes by 'Powder Pete.' Tell him Samuel sent you, and he might not shoot you on sight. *He almost smiles* Might.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_powder_pete' }],
      choices: [
        {
          text: "Comforting. I'll find him.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'help_with_proof',
      text: "*He studies you for a long time* You remind me of someone. Someone who made promises like that once. *He sighs* Fine. Prove yourself first. Help my people, earn your place among us. Then we'll talk about the documents.",
      choices: [
        {
          text: 'What do your people need?',
          nextNodeId: 'earn_trust',
        },
      ],
    },

    {
      id: 'sorry_for_son',
      text: "*He nods, his eyes glistening* Jacob was... he was the best of us. Strong, smart, believed the world could be fair if good people fought for it. *He wipes his eyes roughly* His daughter Maggie, she's got his fire. Won't let me rest, always pushin' to do somethin' about IVRC. *A ghost of a smile* She's right, of course.",
      choices: [
        {
          text: 'I would like to meet Maggie.',
          nextNodeId: 'meet_maggie',
        },
        {
          text: "His legacy lives on through her - and through you.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'meet_maggie',
      text: "She's in the main lodge, probably arguin' with someone about our next move. *He chuckles* Girl's got opinions, I'll say that. *He grows serious* She's all I got left. If anything happened to her... *He trails off* You understand why I'm careful.",
      choices: [
        {
          text: 'I understand completely.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'claims_connection',
      text: "Now you're seein' it. The copper's worthless compared to what's down there. IVRC didn't come to this territory for ore. They came because someone whispered about ancient ruins under the mountains. Everything since - the railroad, the mines, the company towns - it's all a front. A way to dig without anyone askin' why.",
      onEnterEffects: [{ type: 'set_flag', target: 'understands_ivrc_motive' }],
      choices: [
        {
          text: "What do they want from The Old Works?",
          nextNodeId: 'what_ivrc_wants',
        },
        {
          text: 'This changes everything I thought I knew.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'what_ivrc_wants',
      text: "Technology. Machines that shouldn't exist. My son said he saw things down there that... *He struggles for words* Things that moved on their own. Metal that repaired itself. Lights that burned without flame or oil. If IVRC can figure out how it all works... *He shakes his head* They won't just control the territory. They'll control everything.",
      expression: 'fearful',
      onEnterEffects: [{ type: 'set_flag', target: 'knows_remnant_technology' }],
      choices: [
        {
          text: 'Self-repairing metal? That sounds impossible.',
          nextNodeId: 'impossible_tech',
        },
        {
          text: 'We have to stop them.',
          nextNodeId: 'stop_ivrc',
        },
      ],
    },

    {
      id: 'impossible_tech',
      text: "I'm a miner, not a philosopher. I know rock, I know ore, I know what belongs underground and what don't. And what's down there don't belong. Not in this world, not in this time. *He grips his pickaxe like a talisman* Jacob called it 'Remnant.' Said it felt like touching the bones of something ancient and vast.",
      choices: [
        {
          text: "The Remnant. Is that what IVRC calls it?",
          nextNodeId: 'remnant_name',
        },
        {
          text: "I need to see it for myself.",
          nextNodeId: 'see_it_yourself',
        },
      ],
    },

    {
      id: 'remnant_name',
      text: "IVRC calls it 'Project Prometheus' in their internal documents. Fancy name for grave robbin'. But Jacob's name was better. Remnant. The remains of somethin' that was here before any of us. Before the tribes, before anything. And now Thorne wants to wake it up and sell it.",
      choices: [
        {
          text: "Some things should stay buried.",
          nextNodeId: null,
        },
        {
          text: "Or maybe it can help the people instead of the powerful.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'interested_in_remnant_use' }],
        },
      ],
    },

    {
      id: 'see_it_yourself',
      text: "*He gives you a hard look* The tunnels ain't safe. IVRC's got guards at the main entries they've found. And beyond those guards... well, the miners who went too deep didn't come back. Or came back wrong. *He pauses* But if you earn your place here, I might show you the entrance Jacob found. The one IVRC don't know about.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_might_show_entrance' }],
      choices: [
        {
          text: "I'll earn that trust.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'stop_ivrc',
      text: "I've been tryin' for five years. Lost my son, my home, nearly lost my mind. The Copperheads rob their trains. We block their claims. None of it's enough. They just send more men, more lawyers, more money. *He clenches his fist* But the documents... if those reach the right hands...",
      choices: [
        {
          text: "Then let me help you get them out.",
          nextNodeId: 'help_with_proof',
        },
        {
          text: 'We need more than documents. We need unity.',
          nextNodeId: 'need_unity',
        },
      ],
    },

    {
      id: 'need_unity',
      text: "*He snorts* Unity. You sound like Miguel. The Copperheads are hot-headed fools who think shootin' solves everything. The townfolk are too scared to spit without IVRC's permission. And my people... my people are tired. Tired of fightin', tired of hidin', tired of losin'.",
      choices: [
        {
          text: 'Tired people still have strength when someone gives them a reason.',
          nextNodeId: 'reason_to_fight',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: "You gave up on the Alliance.",
          nextNodeId: 'gave_up_alliance',
        },
      ],
    },

    {
      id: 'reason_to_fight',
      text: "*He stares at you for a long moment, then his weathered face cracks into something almost like a smile* You talk like Jacob did. Like the world owes you a fair shake and you intend to collect. *He stands* Maybe that's what we need. Someone too stubborn to know when they're beat.",
      choices: [
        {
          text: "Then let me fight alongside you.",
          nextNodeId: null,
          effects: [
            { type: 'change_reputation', value: 15 },
            { type: 'set_flag', target: 'samuel_respects_player' },
          ],
        },
      ],
    },

    {
      id: 'gave_up_alliance',
      text: "*His eyes flash* I didn't give up nothin'. The Alliance was betrayed. Sold out from the inside. After that, trust died. Can't build an alliance when half the people in it might be workin' for the enemy. *He looks away* Maybe I should've fought harder. But when you lose your son... priorities change.",
      choices: [
        {
          text: "No one could blame you.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: 'The traitor is still out there. Finding them could rebuild trust.',
          nextNodeId: 'find_traitor',
        },
      ],
    },

    {
      id: 'find_traitor',
      text: "*He grips his pickaxe handle hard* I've wondered about that every damn night for five years. I've got suspicions but no proof. If you find the rat who sold us out... *His knuckles go white* ...bring them to me. I'll handle the rest.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_wants_traitor' }],
      choices: [
        {
          text: "Justice, not vengeance.",
          nextNodeId: 'justice_not_vengeance',
        },
        {
          text: "I'll find them.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'justice_not_vengeance',
      text: "*Long, heavy silence* You're right. Jacob wouldn't want vengeance. He'd want the truth. *He exhales slowly* Find the truth, then. But don't expect me to forgive easy. Forgivin' is for priests and saints. I'm just an old miner with a long memory.",
      choices: [
        {
          text: "That's fair enough.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'what_machines',
      text: "Jacob described 'em as... automatons. Metal bodies, shaped like people but not people. Standing in rows, deep underground. Silent. Still. Like soldiers waitin' for orders. *He shudders* He said they were beautiful and terrible at the same time. And he felt like they were watchin' him.",
      choices: [
        {
          text: 'Automatons? Like clockwork?',
          nextNodeId: 'not_clockwork',
        },
        {
          text: "That explains the strange sounds miners report.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'connected_sounds_to_remnant' }],
        },
      ],
    },

    {
      id: 'not_clockwork',
      text: "No. Not clockwork. Somethin'... else. Smooth metal, no visible gears or springs. Jacob said they had faces, but not human faces. *He shakes his head* I told him he'd been breathin' too much mine dust. Then I saw one myself. *Very quietly* They ain't sleepin'. They're waitin'.",
      expression: 'fearful',
      choices: [
        {
          text: 'Waiting for what?',
          nextNodeId: 'waiting_for_what',
        },
      ],
    },

    {
      id: 'waiting_for_what',
      text: "If I knew that, I'd either be runnin' for the border or sittin' on the biggest secret in human history. *He manages a grim smile* Maybe both. All I know is IVRC's diggin' closer to them every day. And the sounds from underground are gettin' louder.",
      choices: [
        {
          text: 'Then we need to stop IVRC before they wake something they cannot control.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'urgency_about_remnant' }],
        },
      ],
    },

    {
      id: 'underground_knowledge',
      text: "*He raises an eyebrow* So Miguel's been talkin'. *He sighs* I told that old priest to keep quiet. But I suppose if IVRC's gettin' closer, silence don't help nobody. Yeah, there's somethin' underground. Somethin' that shouldn't be there. And IVRC's been diggin' toward it for five years.",
      choices: [
        {
          text: "Tell me everything.",
          nextNodeId: 'old_works_explanation',
        },
      ],
    },

    // ========================================================================
    // FIRST MEETING - WITH GEAR LETTER
    // ========================================================================
    {
      id: 'gear_carrier',
      text: "*The old miner freezes when he sees you. His eyes lock onto something you're carrying.* That letter. Show it to me. Now.",
      expression: 'intense',
      choices: [
        {
          text: 'Hand him the letter.',
          nextNodeId: 'reads_letter',
        },
        {
          text: "I'll show it, but I need answers first.",
          nextNodeId: 'answers_first',
        },
      ],
    },

    {
      id: 'reads_letter',
      text: "*He takes the letter with trembling hands, reads it twice. When he looks up, his hard eyes are glistening.* This is your parent's handwriting. I'd know it anywhere. *He sits down slowly* They said they'd send for someone when the time was right. I thought they were dead. Maybe they are. But this letter... this was written recently.",
      expression: 'emotional',
      onEnterEffects: [
        { type: 'set_flag', target: 'samuel_recognized_handwriting' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: 'You knew my parent?',
          nextNodeId: 'knew_parent',
        },
        {
          text: 'What do you mean, the time was right?',
          nextNodeId: 'right_time',
        },
      ],
    },

    {
      id: 'knew_parent',
      text: "Knew them? *He laughs bitterly* They were one of us. Alliance through and through. Worked alongside me, Jacob, Miguel, all of us. When the Pinkertons came, they were the ones who got the documents out. Hid the most important ones somewhere even I don't know. Then they vanished. For your protection, they said.",
      choices: [
        {
          text: 'The documents. The ones that could bring down IVRC.',
          nextNodeId: 'critical_documents',
        },
        {
          text: 'Why did they leave me behind?',
          nextNodeId: 'why_left_behind',
        },
      ],
    },

    {
      id: 'critical_documents',
      text: "Safety violations. Bribery records. Letters provin' Thorne ordered my son's death. Enough to bring federal marshals runnin' and newspapers screamin'. Your parent was the keeper. The only one who knew where all the copies were hidden. And now they've sent you to finish what they started.",
      onEnterEffects: [
        { type: 'advance_quest', target: 'main_the_inheritance' },
        { type: 'start_quest', target: 'find_documents' },
      ],
      choices: [
        {
          text: "Then I'll find them. All of them.",
          nextNodeId: 'find_them_all',
        },
        {
          text: "Why me? I don't even know where to look.",
          nextNodeId: 'why_me',
        },
      ],
    },

    {
      id: 'find_them_all',
      text: "*He grips your hand* Good. This is it - the chance we've been waitin' for. Your parent hid caches in three locations. I know one - the old mineshaft behind the falls. The others... the letter may hold clues I can't see. But together, maybe we can figure it out.",
      onEnterEffects: [{ type: 'unlock_location', target: 'hidden_falls_mine' }],
      choices: [
        {
          text: "Let's start with what you know.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },

    {
      id: 'why_me',
      text: "Because you're unknown. IVRC has files on every miner, every activist, every soul who ever crossed them. But you? You're nobody to them. *He says it without malice* That's your advantage. You can go where we can't. Ask questions we can't. And your parent trusted you with this for a reason.",
      choices: [
        {
          text: "Then I'll honor that trust.",
          nextNodeId: 'find_them_all',
        },
      ],
    },

    {
      id: 'why_left_behind',
      text: "*His expression softens - something rare for him* To protect you. If Thorne's people knew they had a child... *He doesn't finish the sentence* Your parent made the hardest choice anyone can make. They chose your safety over their own heart. I've seen that kind of sacrifice up close. It ain't easy, and it ain't forgiven easy either.",
      choices: [
        {
          text: "I understand now.",
          nextNodeId: 'critical_documents',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'right_time',
      text: "They said they'd hidden the most damning evidence in places only they knew. When enough time had passed, when IVRC had grown complacent, when a new face could move freely... then they'd bring someone in. Someone connected to the cause but unknown to the enemy. *He looks at you* That's you.",
      choices: [
        {
          text: "A lot of weight for someone who just arrived.",
          nextNodeId: 'weight_response',
        },
        {
          text: "Then let's not waste the opportunity.",
          nextNodeId: 'critical_documents',
        },
      ],
    },

    {
      id: 'weight_response',
      text: "*He nods* It is. But the world don't ask if you're ready before it drops trouble in your lap. My son learned that. I learned that. *He puts a hand on your shoulder - the first sign of warmth* You ain't alone in this. Whatever your parent started, we'll finish together.",
      choices: [
        {
          text: 'Together, then.',
          nextNodeId: 'critical_documents',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'answers_first',
      text: "*His jaw tightens* You're in no position to make demands, stranger. You're standin' on my mountain, breathin' my air, and carryin' somethin' that might be important to a lot of people. *He forces himself to calm down* But fine. Ask your questions. Then show me the letter.",
      choices: [
        {
          text: 'Who are the Freeminers, and what do you fight for?',
          nextNodeId: 'freeminer_cause',
        },
        {
          text: 'What happened at 14 Copper Street?',
          nextNodeId: 'copper_street_response',
        },
      ],
    },

    // ========================================================================
    // FIRST MEETING - WITH MIGUEL'S MESSAGE
    // ========================================================================
    {
      id: 'miguel_message',
      text: "*The old miner blocks your path, pickaxe in hand* Another outsider. I've told your kind before -",
      choices: [
        {
          text: 'Father Miguel sent me. He says he has not forgotten.',
          nextNodeId: 'miguel_remembered',
        },
      ],
    },

    {
      id: 'miguel_remembered',
      text: "*He lowers the pickaxe slowly. Something cracks in his iron composure.* Miguel. *He turns away for a moment, composing himself* That old fool priest. Always sendin' messages I don't deserve. *He turns back, eyes red* He said that? That he hasn't forgotten?",
      expression: 'emotional',
      onEnterEffects: [{ type: 'change_reputation', value: 20 }],
      choices: [
        {
          text: "He said to tell you the church basement still has room. And that he's sorry about Jacob.",
          nextNodeId: 'miguel_full_message',
        },
        {
          text: 'He spoke of you like a brother.',
          nextNodeId: 'brother_response',
        },
      ],
    },

    {
      id: 'miguel_full_message',
      text: "*He sits down heavily, running his hands over his face* Sorry about Jacob. *He laughs through tears* I've never blamed Miguel. Never. The only ones to blame are IVRC and the traitor who sold us out. *He looks up* You carried a good message up a hard mountain. That counts for somethin'. Sit. Talk. Tell me what's happenin' down in town.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_opened_up' }],
      choices: [
        {
          text: "People are scared, but they haven't given up.",
          nextNodeId: 'town_report',
        },
        {
          text: 'IVRC is tightening their grip. The underground is struggling.',
          nextNodeId: 'underground_report',
        },
      ],
    },

    {
      id: 'brother_response',
      text: "He was more than a brother. He was my conscience. When I wanted to pick up a gun and start shootin', Miguel talked me down. When I wanted to give up, he reminded me why we fight. *He sighs* I miss that voice. These mountains get quiet. Too quiet for thinkin'.",
      choices: [
        {
          text: 'He misses you too. Worries about you.',
          nextNodeId: 'miguel_full_message',
        },
      ],
    },

    {
      id: 'town_report',
      text: "*He listens intently* Good. Fear is IVRC's weapon, but it rusts over time. If people are still resistin', even quietly, there's somethin' to build on. *He looks at you differently* And you? Why'd you really come up here?",
      choices: [
        {
          text: 'I received a letter with a gear symbol.',
          nextNodeId: 'gear_letter_response',
        },
        {
          text: 'I want to help the resistance.',
          nextNodeId: 'want_to_help',
        },
      ],
    },

    {
      id: 'underground_report',
      text: "The underground... *He winces* Miguel and Doc Chen are still runnin' it? Those brave fools. *He stands and paces* If IVRC catches 'em... I should've been helpin'. Hidin' up here like a coward while they risk their necks.",
      choices: [
        {
          text: "You're not hiding. You're protecting the evidence.",
          nextNodeId: 'protecting_evidence',
        },
        {
          text: "Come back with me. They need you.",
          nextNodeId: 'come_back',
        },
      ],
    },

    {
      id: 'protecting_evidence',
      text: "*He pauses mid-step* The evidence. Yeah. *He nods slowly* That's what I tell myself. And it's true - if IVRC gets their hands on what I've got, it's over. But sometimes the right thing and the safe thing look too much alike, and I wonder which one I really chose.",
      choices: [
        {
          text: "Maybe it's time to use that evidence.",
          nextNodeId: 'time_to_use_evidence',
        },
      ],
    },

    {
      id: 'come_back',
      text: "And leave the Hollow? Leave the miners who depend on me? *He shakes his head* I can't. Not yet. But if someone could carry word between us... be the connection we've been missin'... *He looks at you* Maybe that's why Miguel sent you.",
      choices: [
        {
          text: 'I can be that connection.',
          nextNodeId: null,
          effects: [
            { type: 'set_flag', target: 'liaison_between_factions' },
            { type: 'change_reputation', value: 15 },
          ],
        },
      ],
    },

    {
      id: 'time_to_use_evidence',
      text: "Maybe it is. I've been sittin' on a powder keg for five years, waitin' for the right moment. Your parent was supposed to deliver the evidence to federal authorities. They vanished before they could. *He looks at you with dawning realization* And now their child shows up carryin' the gear. Maybe the right moment is now.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_ready_to_act' }],
      choices: [
        {
          text: "Then let's not waste any more time.",
          nextNodeId: 'critical_documents',
        },
      ],
    },

    // ========================================================================
    // TRADE AND GENERAL CONVERSATION
    // ========================================================================
    {
      id: 'sheriff_sent',
      text: "*His expression darkens* Cole. *He spits to the side* He's not a bad man, but he's a lawman. And the law in these parts is IVRC's law. I've got nothin' to say to his badge.",
      choices: [
        {
          text: 'He cares about the missing miners. Same as you.',
          nextNodeId: 'cole_cares',
        },
        {
          text: "I understand your distrust. But people are dying.",
          nextNodeId: 'people_dying',
        },
      ],
    },

    {
      id: 'cole_cares',
      text: "Carin' and doin' are different things. Cole can care all he wants. But when Thorne's Pinkertons show up with warrants, he steps aside like a good boy. *He pauses* Still... he did warn me about the fire, even if it was too late. I suppose that counts for somethin'.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: 'People are disappearing in the deep mines. Cole thinks you might know why.',
          nextNodeId: 'disappearance_knowledge',
        },
        {
          text: 'Maybe it is time to work together.',
          nextNodeId: 'need_unity',
        },
      ],
    },

    {
      id: 'people_dying',
      text: "*He's quiet for a moment* Yeah. They are. My people, mostly. Miners who go into the deep tunnels and don't come back. *He grips his pickaxe* I've lost six this year. Good men. And the sounds from down there... they're gettin' worse.",
      choices: [
        {
          text: 'What sounds?',
          nextNodeId: 'what_machines',
        },
        {
          text: "Help me help them. What's happening down there?",
          nextNodeId: 'old_works_explanation',
        },
      ],
    },

    {
      id: 'disappearance_knowledge',
      text: "*He leans in close* The miners who vanish... they go deep. Deeper than any sensible man should dig. They find tunnels that weren't dug by human hands. And they don't come back because... *He stops* Because somethin' down there doesn't want 'em to.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_confirmed_dangers' }],
      choices: [
        {
          text: 'Something? What is it?',
          nextNodeId: 'old_works_explanation',
        },
        {
          text: "You've seen it.",
          nextNodeId: 'seen_it',
        },
      ],
    },

    {
      id: 'trade_offer',
      text: "*His suspicion eases slightly* Supplies, eh? We could use 'em, I won't deny that. The mountain provides ore and stone, but food, medicine, powder - those gotta come from down below. What've you got?",
      choices: [
        {
          text: 'I can get medicine from Doc Chen.',
          nextNodeId: 'doc_chen_connection',
        },
        {
          text: 'Food, tools, whatever you need. For a fair price.',
          nextNodeId: 'fair_trade',
        },
        {
          text: "I don't want payment. Consider it a gesture of goodwill.",
          nextNodeId: 'goodwill',
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },

    {
      id: 'doc_chen_connection',
      text: "You know Doc Chen? *His guard drops another notch* He's been sendin' supplies through traders, but half of 'em get intercepted by IVRC patrols. If you can make the run yourself, without bein' followed... we'd be in your debt.",
      choices: [
        {
          text: "I'll make the supply run.",
          nextNodeId: null,
          effects: [
            { type: 'set_flag', target: 'supply_run_accepted' },
            { type: 'change_reputation', value: 10 },
          ],
        },
      ],
    },

    {
      id: 'fair_trade',
      text: "Fair. That word don't mean what it used to. But I'll take you at face value, for now. *He gestures to the camp* We've got copper ore, silver nuggets, and mountain herbs that Doc Chen prizes. We trade straight - no company scrip, no credit. Honest weight for honest goods.",
      choices: [
        {
          text: "That's how it should be.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'goodwill',
      text: "*He stares at you, genuinely surprised* No payment. *He scratches his beard* Either you're the most generous fool I've met, or you want somethin' you ain't sayin'. *He pauses* Or maybe you're just a decent person. Been so long since I met one, I almost forgot what it looks like.",
      choices: [
        {
          text: "Decent people still exist. Even on the frontier.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'leave_peacefully',
      text: "*He watches you start to turn* Hold on. *He studies you a moment longer* Not many strangers show respect for our boundaries. Most come stormin' in demandin' this or that. *He lowers his pickaxe* You can stay. For now. But watch yourself.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: "Thank you. I'm actually looking for you - Samuel Ironpick.",
          nextNodeId: 'looking_for_samuel',
        },
        {
          text: 'I appreciate the hospitality.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'want_to_help',
      text: "*He laughs harshly* Help. Everyone wants to 'help.' Last person who said that was an IVRC spy who mapped our tunnels and nearly got us all killed. *He sobers* What makes you different?",
      choices: [
        {
          text: "I'm carrying a message from Father Miguel.",
          nextNodeId: 'miguel_remembered',
          conditions: [{ type: 'flag_set', target: 'carries_miguel_message' }],
        },
        {
          text: 'I have no love for IVRC. They burned the house on Copper Street.',
          nextNodeId: 'copper_street_response',
        },
        {
          text: "Nothing, yet. But give me a chance and I'll prove it.",
          nextNodeId: 'earn_trust',
        },
      ],
    },

    {
      id: 'curious_visitor',
      text: "Speak well of me? *He snorts* The townfolk barely know I exist, and those who do think I'm a crazy old hermit. *He pauses* Unless you've been talkin' to Doc Chen or Miguel. Those two know better.",
      choices: [
        {
          text: "Doc Chen told me about your situation.",
          nextNodeId: 'doc_told_me',
        },
        {
          text: 'Sheriff Cole mentioned you.',
          nextNodeId: 'sheriff_sent',
        },
      ],
    },

    {
      id: 'doc_told_me',
      text: "*He nods slowly* Chen Wei. Good man. Fixed my knee when I blew it out workin' the deep shafts. Never charged me a cent. *His eyes narrow* What exactly did he tell you?",
      choices: [
        {
          text: 'About the documents. The evidence against IVRC.',
          nextNodeId: 'proof_of_murder',
        },
        {
          text: 'That you could use help up here.',
          nextNodeId: 'earn_trust',
        },
      ],
    },

    {
      id: 'dont_know_sender',
      text: "Don't know who sent it. *He turns the letter over in his hands* But the gear, the address... this was deliberate. Someone who knew about the Alliance, knew about my house, and knew enough to send you there. *He thinks hard* There's only a handful of people alive who could've written this.",
      choices: [
        {
          text: 'Who are they?',
          nextNodeId: 'who_could_write',
        },
      ],
    },

    {
      id: 'who_could_write',
      text: "Me. Miguel. Doc Chen. Diamondback, maybe - she was on the edges of the Alliance. And... *He goes very quiet* ...there was one other. The person who hid the most important documents. The person who disappeared the night the Pinkertons came. Your parent.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_suspects_parent' }],
      choices: [
        {
          text: 'My parent?',
          nextNodeId: 'family_sent',
        },
      ],
    },

    {
      id: 'family_sent',
      text: "*He looks at you with a mixture of wonder and grief* I should've seen it sooner. You have their look about you. The way you carry yourself. *He sits back* Your parent was the Alliance's secret weapon - the one person Thorne never identified. They hid the evidence before the raids. And now... they've sent you to finish the job.",
      onEnterEffects: [
        { type: 'change_reputation', value: 15 },
        { type: 'set_flag', target: 'samuel_confirmed_parentage' },
      ],
      choices: [
        {
          text: "Then tell me everything I need to know.",
          nextNodeId: 'critical_documents',
        },
      ],
    },

    {
      id: 'freeminer_cause',
      text: "The Freeminers are what's left of honest minin' in this territory. We work claims our families staked before IVRC existed. We answer to no company, owe no debts, bow to no railroad baron. *He stands taller* We fight for the right to dig our own ground and keep what we find. That shouldn't be revolutionary, but here we are.",
      choices: [
        {
          text: 'And IVRC wants your claims.',
          nextNodeId: 'claims_connection',
        },
        {
          text: "A noble cause.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    // ========================================================================
    // RETURN VISITS
    // ========================================================================
    {
      id: 'return_greeting',
      text: "*Samuel looks up from his work* You again. *His tone is gruff but not unwelcoming* What brings you back up the mountain?",
      choices: [
        {
          text: 'I brought supplies for your people.',
          nextNodeId: 'brought_supplies',
          conditions: [{ type: 'flag_set', target: 'supply_run_accepted' }],
        },
        {
          text: "I wanted to ask about what's underground.",
          nextNodeId: 'old_works_explanation',
        },
        {
          text: 'Any word from the outside?',
          nextNodeId: 'outside_news',
        },
        {
          text: "How's the Hollow holding up?",
          nextNodeId: 'hollow_status',
        },
        {
          text: 'Just visiting.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'brought_supplies',
      text: "*He checks the packs, and something in his hard expression softens* Medicine. Bandages. Food that isn't jerky or hardtack. *He looks at you* You came through. I'll be honest - I didn't expect you would. Most talk big and never come back.",
      onEnterEffects: [{ type: 'change_reputation', value: 20 }],
      choices: [
        {
          text: "I said I would. I keep my word.",
          nextNodeId: 'keep_word_response',
        },
        {
          text: "Your people need it. It's that simple.",
          nextNodeId: 'simple_kindness',
        },
      ],
    },

    {
      id: 'keep_word_response',
      text: "*He nods slowly, and for the first time, there's genuine warmth in his eyes* That you do. *He extends his hand* Samuel Ironpick. And for the first time in a long time, I'm glad to know someone new.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_trusts_player' }],
      choices: [
        {
          text: '*Shake his hand* The feeling is mutual.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'simple_kindness',
      text: "Simple. *He almost laughs* Nothin' is simple on the frontier, friend. But you make it look that way. *He claps you on the shoulder* Come on. Let me introduce you proper to the camp. You've earned it.",
      onEnterEffects: [{ type: 'set_flag', target: 'welcome_in_hollow' }],
      choices: [
        {
          text: "I'd like that.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'outside_news',
      text: "We're isolated up here. News comes slow, and usually bad. What's happenin' in town?",
      choices: [
        {
          text: 'IVRC is expanding. More enforcers, more permits.',
          nextNodeId: 'ivrc_expanding',
        },
        {
          text: "Father Miguel and Doc Chen send their regards.",
          nextNodeId: 'regards_from_friends',
        },
      ],
    },

    {
      id: 'ivrc_expanding',
      text: "*He grimaces* Figured as much. They've been sendin' surveyors closer to our boundaries too. Testin' us. Seein' how far they can push before we push back. *He grips his pickaxe* One day they'll push too far.",
      choices: [
        {
          text: "Let's make sure you're ready for that day.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'regards_from_friends',
      text: "*His face softens for just a moment* Miguel and Doc Chen. *He nods* Tell 'em... tell 'em the mountain's still standin'. And so am I. *Quietly* And that I think of 'em. Both of 'em.",
      choices: [
        {
          text: "I'll pass that along.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'hollow_status',
      text: "We're survivin'. That's about all I can say. Lost two more miners last month to the deep tunnels. Food's short. Morale's... *He sighs* Well, it was bad before you showed up. Your visits help, whether I say it or not.",
      choices: [
        {
          text: "I'll keep coming. And I'll bring what I can.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    // ========================================================================
    // TRUSTED GREETING
    // ========================================================================
    {
      id: 'trusted_greeting',
      text: "*Samuel sees you and his weathered face breaks into a rare smile* Well I'll be. Look who's climbin' the mountain again. *He clasps your arm* Good to see you, friend. And I don't use that word lightly.",
      expression: 'warm',
      choices: [
        {
          text: 'Good to see you too, Samuel. How are things?',
          nextNodeId: 'trusted_status',
        },
        {
          text: "I have news. We need to talk.",
          nextNodeId: 'trusted_news',
        },
        {
          text: 'Ready to talk about those documents?',
          nextNodeId: 'ready_for_documents',
          conditions: [{ type: 'flag_set', target: 'samuel_trusts_player' }],
        },
      ],
    },

    {
      id: 'trusted_status',
      text: "Better, thanks to you. The supplies are holdin', morale's up since word spread that we've got a friend on the outside. Maggie's been askin' about you. *He lowers his voice* And the sounds from underground... they've changed. Somethin's happenin' down there.",
      choices: [
        {
          text: 'Changed how?',
          nextNodeId: 'sounds_changed',
        },
        {
          text: 'Good. We need to move soon.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'sounds_changed',
      text: "Louder. More... organized. Used to be random humming, like a beehive deep in the earth. Now it's rhythmic. Almost like... *He struggles for words* ...like a heartbeat. A slow, metal heartbeat. The Remnant is wakin' up, friend. And IVRC's diggin' is gettin' closer to it every day.",
      expression: 'fearful',
      choices: [
        {
          text: 'Then we are running out of time.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'remnant_awakening_confirmed' }],
        },
      ],
    },

    {
      id: 'trusted_news',
      text: "*He leads you to a quiet spot away from the other miners* Alright, I'm listenin'. What've you learned?",
      choices: [
        {
          text: "The mayor knows about The Old Works. She's willing to help.",
          nextNodeId: 'mayor_willing',
          conditions: [{ type: 'flag_set', target: 'mayor_secret_ally' }],
        },
        {
          text: "IVRC is accelerating their digging. We need the documents now.",
          nextNodeId: 'need_documents_now',
        },
      ],
    },

    {
      id: 'mayor_willing',
      text: "*He scoffs, then catches himself* Josephine Holt. *He strokes his beard* I don't trust her. She bends to IVRC like a reed in the wind. But... if she's willin' to use her position to help... maybe that reed can be useful after all.",
      choices: [
        {
          text: "She has connections to eastern newspapers and territorial courts.",
          nextNodeId: 'mayor_connections',
        },
        {
          text: "She lost her husband to IVRC too. She understands.",
          nextNodeId: 'shared_loss',
        },
      ],
    },

    {
      id: 'mayor_connections',
      text: "*His eyes widen* Newspapers. Courts. *He breathes out slowly* That's what we've been missin'. All the evidence in the world don't matter if nobody sees it. If Holt can get it in front of the right eyes... *He nods firmly* Then maybe it's time to dig those documents up.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_will_share_documents' }],
      choices: [
        {
          text: "Now you're talking.",
          nextNodeId: 'ready_for_documents',
        },
      ],
    },

    {
      id: 'shared_loss',
      text: "*He's quiet for a long moment* Thomas Holt. Yeah. He was one of the good ones, even if his wife plays politics. *He sighs* Loss don't make people better or worse. It just makes 'em more of what they already are. If Josephine's still got some fight in her... maybe there's hope yet.",
      choices: [
        {
          text: 'Hope is the one thing IVRC cannot buy.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'need_documents_now',
      text: "*He nods grimly* I know. The tremors are gettin' worse. The Remnant down there... it's stirrin'. If IVRC breaks through to the main chamber before we expose 'em... *He shakes his head* We won't get another chance.",
      choices: [
        {
          text: 'Then give me the documents. I know people who can use them.',
          nextNodeId: 'ready_for_documents',
        },
      ],
    },

    {
      id: 'ready_for_documents',
      text: "*He studies your face for a long time, searching for something. Whatever he finds, it satisfies him.* Alright. You've earned this. *He pulls out a worn leather satchel from beneath his bunk* These are copies. Testimony, safety reports, Thorne's own letters. Enough to bury IVRC ten times over. Guard 'em with your life.",
      onEnterEffects: [
        { type: 'give_item', target: 'ironpick_documents' },
        { type: 'start_quest', target: 'find_documents' },
        { type: 'set_flag', target: 'has_ironpick_documents' },
      ],
      choices: [
        {
          text: "I won't let you down, Samuel.",
          nextNodeId: 'document_farewell',
          effects: [{ type: 'change_reputation', value: 20 }],
        },
      ],
    },

    {
      id: 'document_farewell',
      text: "*He grips your shoulder hard* I know you won't. You're like Jacob that way. Too damn stubborn to fail. *His voice rough* Now get those documents to someone who can use 'em. And if Thorne's people come for you... don't let 'em take the papers. Burn 'em before you let that happen. The truth is worth more than any of us.",
      expression: 'determined',
      choices: [
        {
          text: 'The truth will come out. I swear it.',
          nextNodeId: null,
        },
      ],
    },

    // ========================================================================
    // QUEST UPDATE STATE
    // ========================================================================
    {
      id: 'quest_update',
      text: "*Samuel is pacing when you arrive* You're back. Tell me - have you found the other caches? The documents your parent hid?",
      choices: [
        {
          text: "I'm still looking. Any more clues?",
          nextNodeId: 'more_clues',
        },
        {
          text: "I found one. There's evidence of a second location.",
          nextNodeId: 'found_cache',
          conditions: [{ type: 'flag_set', target: 'found_first_cache' }],
        },
        {
          text: 'Not yet, but I will.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'more_clues',
      text: "I've been thinkin'. Your parent was methodical. They wouldn't hide everything together. *He counts on his fingers* The mineshaft behind the falls - we've checked there. The old telegraph station south of town - IVRC uses it now, so that's risky. And the third... *He frowns* ...somethin' about a 'copper grave.' I never figured out what that meant.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_gave_cache_clues' }],
      choices: [
        {
          text: "Copper grave. Could that be the cemetery?",
          nextNodeId: 'copper_grave_theory',
        },
        {
          text: "I'll figure it out. Thank you.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'copper_grave_theory',
      text: "*He snaps his fingers* The cemetery. Father Miguel's cemetery behind the church. There's a grave marker for a miner who never existed - 'Copper Jack,' they called him. A memorial for all the unnamed miners who died. If your parent hid documents there... *He almost laughs* ...they hid 'em under the protection of the dead. Clever.",
      onEnterEffects: [
        { type: 'set_flag', target: 'knows_cemetery_cache' },
        { type: 'unlock_location', target: 'copper_jack_grave' },
      ],
      choices: [
        {
          text: "I'll check the grave. Father Miguel might know more.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'found_cache',
      text: "*His eyes light up* You found one? *He grabs your arm* What was in it? How much survived?",
      choices: [
        {
          text: 'More documents. Financial records showing IVRC bribery.',
          nextNodeId: 'bribery_records',
        },
        {
          text: 'A journal. Written by my parent.',
          nextNodeId: 'parent_journal',
        },
      ],
    },

    {
      id: 'bribery_records',
      text: "*He slams his fist into his palm* Bribery records. That's the piece we've been missin'. The safety violations prove IVRC was negligent. But bribery? That's criminal. Federal criminal. The kind of thing that brings marshals and trials and front-page headlines.",
      choices: [
        {
          text: "Combined with your testimony, it's enough.",
          nextNodeId: null,
          effects: [{ type: 'advance_quest', target: 'find_documents' }],
        },
      ],
    },

    {
      id: 'parent_journal',
      text: "*He goes very quiet* A journal. *He swallows hard* What does it say? About... about us? About Jacob? About what happened?",
      expression: 'emotional',
      choices: [
        {
          text: "They wrote about all of you. With love and regret.",
          nextNodeId: 'journal_contents',
        },
      ],
    },

    {
      id: 'journal_contents',
      text: "*He turns away, and his shoulders shake silently. When he faces you again, his eyes are red but his jaw is set.* Then it wasn't for nothin'. None of it. *He wipes his eyes roughly* Let's finish what they started. For Jacob. For all of 'em.",
      choices: [
        {
          text: "For all of them.",
          nextNodeId: null,
          effects: [
            { type: 'change_reputation', value: 15 },
            { type: 'advance_quest', target: 'find_documents' },
          ],
        },
      ],
    },
  ],
};

export const SamuelIronpickDialogues = [SamuelIronpickMainDialogue];
