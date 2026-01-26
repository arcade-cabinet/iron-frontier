/**
 * "Old" Samuel Ironpick - Dialogue Trees
 *
 * Leader of the Freeminer resistance. A grizzled old miner who lost his son
 * to a preventable mine collapse caused by IVRC's negligence. Holds documents
 * that could destroy the company, but advocates peaceful resistance.
 * Philosophical opposite of Diamondback's violent approach.
 *
 * Character Voice:
 * - Speaks slowly and deliberately, like a man who's learned patience from stone
 * - Uses mining metaphors frequently
 * - Deep sorrow underlies everything, but also quiet strength
 * - Wary of strangers but fundamentally decent
 * - Believes in justice through truth, not violence
 */

import type { DialogueTree } from '../../schemas/npc';

export const SamuelIronpickMainDialogue: DialogueTree = {
  id: 'samuel_ironpick_main',
  name: 'Old Samuel Ironpick - Main Conversation',
  description:
    'Primary dialogue tree for Samuel Ironpick, leader of the Freeminer resistance',
  tags: ['freeminer_hollow', 'faction_leader', 'freeminer', 'main_quest', 'documents'],

  entryPoints: [
    {
      nodeId: 'documents_retrieved',
      conditions: [{ type: 'quest_complete', target: 'find_documents' }],
      priority: 100,
    },
    {
      nodeId: 'trusted_greeting',
      conditions: [{ type: 'reputation_gte', value: 75 }],
      priority: 25,
    },
    {
      nodeId: 'friendly_greeting',
      conditions: [{ type: 'reputation_gte', value: 50 }],
      priority: 20,
    },
    {
      nodeId: 'quest_check_in',
      conditions: [{ type: 'quest_active', target: 'freeminer_trust' }],
      priority: 15,
    },
    {
      nodeId: 'return_visit_neutral',
      conditions: [{ type: 'return_visit' }],
      priority: 10,
    },
    {
      nodeId: 'diamondback_sent',
      conditions: [{ type: 'flag_set', target: 'diamondback_ally' }],
      priority: 8,
    },
    {
      nodeId: 'has_letter_entry',
      conditions: [{ type: 'has_item', target: 'mysterious_letter' }],
      priority: 5,
    },
    {
      nodeId: 'first_meeting_wary',
      conditions: [{ type: 'first_meeting' }],
      priority: 1,
    },
    {
      nodeId: 'default_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
    // ========================================================================
    // FIRST MEETING - WARY STRANGER
    // ========================================================================
    {
      id: 'first_meeting_wary',
      text: "*An old man with a silver beard looks up from sharpening a pickaxe. His weathered hands pause mid-stroke, eyes narrowing as he studies you.* Stranger in the Hollow. That's about as common as gold nuggets on the surface. *He sets down the whetstone slowly.* You got a reason for bein' here, or did you just wander up the wrong mountain?",
      expression: 'suspicious',
      choices: [
        {
          text: "I'm looking for Samuel Ironpick.",
          nextNodeId: 'confirm_identity',
        },
        {
          text: 'Sheriff Cole sent me to investigate the disappearances.',
          nextNodeId: 'sheriff_mention',
          conditions: [{ type: 'flag_set', target: 'heard_about_disappearances' }],
        },
        {
          text: 'I received a letter with a gear symbol. It led me here.',
          nextNodeId: 'gear_symbol_reveal',
          conditions: [{ type: 'has_item', target: 'mysterious_letter' }],
        },
        {
          text: "Just passing through. Didn't mean to intrude.",
          nextNodeId: 'passing_through',
        },
      ],
    },

    {
      id: 'confirm_identity',
      text: "*He rises slowly, joints creaking like old mine timbers.* You found him. Though I got to wonder who's sendin' folks my direction these days. *His gaze is steady, measuring.* The mountain don't give up its secrets easy, and neither do I. State your business plain.",
      choices: [
        {
          text: "I want to help the Freeminers' cause.",
          nextNodeId: 'help_cause_skeptical',
        },
        {
          text: "I've heard you have information about IVRC's crimes.",
          nextNodeId: 'information_direct',
        },
        {
          text: 'Diamondback said you might have answers about a letter I received.',
          nextNodeId: 'diamondback_mention',
          conditions: [{ type: 'talked_to', target: 'diamondback' }],
        },
        {
          text: 'I lost someone to IVRC. I want justice.',
          nextNodeId: 'shared_loss',
        },
      ],
    },

    {
      id: 'help_cause_skeptical',
      text: "*He lets out a long breath, like air escaping a mine shaft.* Help. That's a word that's been used to hide a lot of sins. IVRC sent 'helpers' too - safety inspectors, surveyors, company men with friendly smiles. *His voice hardens.* My son trusted their help. Now he's buried under a hundred feet of rock.",
      expression: 'bitter',
      choices: [
        {
          text: "I'm sorry for your loss.",
          nextNodeId: 'son_condolence',
        },
        {
          text: "I'm not with IVRC. I have my own reasons to see them fall.",
          nextNodeId: 'own_reasons',
        },
        {
          text: 'How can I prove myself to you?',
          nextNodeId: 'prove_yourself_intro',
        },
      ],
    },

    {
      id: 'son_condolence',
      text: "*His weathered face shifts, sorrow surfacing like ore through quartz.* Thomas. His name was Thomas. Thirty-two years old. Had a wife, a daughter on the way. *He looks toward the mountains.* The company said it was an accident. Unstable rock. But I'd been mining that vein for twenty years. I knew it was stable. They knew too. They just didn't want to pay for proper supports.",
      expression: 'sad',
      onEnterEffects: [{ type: 'set_flag', target: 'heard_thomas_story' }],
      choices: [
        {
          text: "And you couldn't prove it was their fault?",
          nextNodeId: 'prove_fault',
        },
        {
          text: 'Is that why you started the Freeminer resistance?',
          nextNodeId: 'resistance_origin',
        },
        {
          text: "IVRC takes from everyone. They took from me too.",
          nextNodeId: 'shared_loss_thomas',
        },
      ],
    },

    {
      id: 'prove_fault',
      text: "*His jaw tightens.* Oh, I had proof. Had documents showing they'd been warned about that shaft. Safety reports they buried. Bribes to inspectors. Enough to bring 'em down in any honest court. *He shakes his head slowly.* But there ain't no honest courts when IVRC owns the judges. They burned my house trying to destroy those papers. Thought they got 'em too.",
      expression: 'determined',
      onEnterEffects: [{ type: 'set_flag', target: 'heard_about_documents' }],
      choices: [
        {
          text: 'But they didnt get the papers?',
          nextNodeId: 'documents_survived',
        },
        {
          text: 'Where are the documents now?',
          nextNodeId: 'documents_location_early',
        },
      ],
    },

    {
      id: 'documents_survived',
      text: "*A ghost of a smile crosses his face.* An old miner learns to keep his valuables hidden deep. I'd made copies, scattered 'em in places only I know. The mountain keeps secrets better than any safe. *His smile fades.* But papers don't do no good sittin' in darkness. They need the right moment, the right hands to carry 'em into the light.",
      choices: [
        {
          text: 'I could be those hands.',
          nextNodeId: 'offer_hands_early',
        },
        {
          text: "Why haven't you used them yourself?",
          nextNodeId: 'why_not_used',
        },
        {
          text: 'What would it take to bring IVRC down?',
          nextNodeId: 'bring_ivrc_down',
        },
      ],
    },

    {
      id: 'offer_hands_early',
      text: "*He studies you for a long moment, eyes like a surveyor assessing a claim.* You talk bold. But words are cheap as fool's gold. *He gestures around the hollow.* My people have been betrayed before. I won't risk their lives on a stranger's promise. You want my trust? Earn it. Prove you ain't just another mine shaft waitin' to collapse.",
      onEnterEffects: [{ type: 'start_quest', target: 'freeminer_trust' }],
      choices: [
        {
          text: 'What do you need me to do?',
          nextNodeId: 'trust_quest_intro',
        },
        {
          text: 'Fair enough. Trust has to be mined like ore.',
          nextNodeId: 'mining_metaphor_approval',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'mining_metaphor_approval',
      text: "*His eyebrows rise slightly, and some of the wariness leaves his posture.* You understand the mountain's language. That's somethin'. Most flatlanders talk about diggin' like it's just shovelin' dirt. *He nods slowly.* Maybe there's more to you than meets the eye.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: 'My grandfather was a miner. I learned to listen to the stone.',
          nextNodeId: 'miner_heritage',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: 'Tell me what you need. I want to help.',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'miner_heritage',
      text: "*His expression softens, the first real warmth you've seen.* Mining folk. Then you know what we're fightin' for. This ain't just about money or land. It's about the right to work our claims without some company man decidin' our lives are worth less than their profits. *He extends a calloused hand.* Samuel Ironpick. I expect you already knew that.",
      onEnterEffects: [
        { type: 'change_reputation', value: 15 },
        { type: 'set_flag', target: 'samuel_warmed_up' },
      ],
      choices: [
        {
          text: '*Shake his hand firmly* Good to meet you proper.',
          nextNodeId: 'proper_meeting',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'proper_meeting',
      text: "*His grip is iron-strong despite his age.* Now then. You want to understand what's happenin' here, I'll tell you. But understand - there's folks in this hollow who lost everything to IVRC. Wives, children, whole futures stolen. They won't warm to you as quick as I have. Actions'll speak louder than any words you got.",
      choices: [
        {
          text: 'Tell me about the Freeminer cause.',
          nextNodeId: 'freeminer_cause',
        },
        {
          text: 'What can I do to help them?',
          nextNodeId: 'trust_quest_intro',
        },
        {
          text: "I've heard you disagree with Diamondback's methods.",
          nextNodeId: 'diamondback_disagreement',
        },
      ],
    },

    // ========================================================================
    // THE FREEMINER CAUSE
    // ========================================================================
    {
      id: 'freeminer_cause',
      text: "*He settles onto a worn wooden bench, gesturing for you to sit.* The Freeminers started simple. Independent prospectors workin' their own claims, keepin' what they find. But IVRC don't like independence. They want every ounce of ore funneled through their machinery, every miner wearin' their chains.",
      choices: [
        {
          text: 'How did they try to take your claims?',
          nextNodeId: 'claim_theft',
        },
        {
          text: "What's your goal? What would victory look like?",
          nextNodeId: 'victory_definition',
        },
        {
          text: 'How many Freeminers are there?',
          nextNodeId: 'freeminer_numbers',
        },
      ],
    },

    {
      id: 'claim_theft',
      text: "*His voice takes on a bitter edge.* Every way you can imagine. Bought judges to invalidate our deeds. Dammed the streams we needed for sluicing. Sent Pinkertons to 'survey' our land and find reasons to condemn it. When that didn't work, they just started buyin' up the general stores, refusin' to sell us supplies. A miner can't work without tools, food, powder.",
      choices: [
        {
          text: 'Economic warfare.',
          nextNodeId: 'economic_warfare',
        },
        {
          text: 'And people just accepted this?',
          nextNodeId: 'resistance_story',
        },
      ],
    },

    {
      id: 'economic_warfare',
      text: "*He nods heavily.* Starve 'em out or price 'em out. No blood on IVRC's hands - officially. Just good business, they call it. *He spits to the side.* Meanwhile, my neighbors sell their claims for pennies, go to work the company mines, and die in cave-ins because safety costs money. That ain't business. That's murder with a ledger book.",
      choices: [
        {
          text: 'The documents you have - they prove this?',
          nextNodeId: 'documents_contents',
        },
        {
          text: 'Why not fight back with force?',
          nextNodeId: 'why_not_violence',
        },
      ],
    },

    {
      id: 'documents_contents',
      text: "*He leans forward, voice dropping.* They prove everything. Bribed inspectors. Falsified safety reports. Land deals that amount to theft. Letters where Thorne himself orders 'cost reduction measures' he knew would kill men. *His eyes burn with old fire.* Enough to bring charges in any honest jurisdiction. Enough to turn the newspapers against 'em. Enough to make their investors flee like rats from a sinkin' ship.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_document_contents' }],
      choices: [
        {
          text: 'Then why not release them?',
          nextNodeId: 'why_not_release',
        },
        {
          text: 'How do we get them to honest hands?',
          nextNodeId: 'honest_hands',
        },
      ],
    },

    {
      id: 'why_not_release',
      text: "*He sits back, suddenly looking very old.* Because I tried once, and three good men died for it. IVRC has eyes everywhere. We tried to smuggle copies to a newspaper in San Francisco. They knew before the coach reached the valley. *His hands clench.* Shot the messengers, burned the papers. Made it look like a robbery. I won't send more of my people to die unless I know - truly know - it'll make a difference.",
      expression: 'sad',
      choices: [
        {
          text: 'What would make you certain enough to try again?',
          nextNodeId: 'certain_enough',
        },
        {
          text: "Maybe I can find a way they won't expect.",
          nextNodeId: 'unexpected_way',
        },
      ],
    },

    {
      id: 'certain_enough',
      text: "*He looks at you searchingly.* Someone I trust. Not just with the papers, but with knowin' where they are. Someone who can move without IVRC noticin'. Someone smart enough to get 'em where they need to go, and honest enough not to sell 'em to the highest bidder. *He pauses.* That's a tall order for a stranger.",
      choices: [
        {
          text: "I'll earn that trust. Whatever it takes.",
          nextNodeId: 'trust_quest_intro',
        },
        {
          text: 'Diamondback might help - she has people who move unseen.',
          nextNodeId: 'diamondback_help_suggest',
        },
      ],
    },

    {
      id: 'diamondback_help_suggest',
      text: "*His expression hardens.* Dolores means well, but her way brings more violence. Every train she robs, IVRC sends more Pinkertons. Every guard that dies, they paint us all as murderers. *He shakes his head.* I won't have those documents delivered on a road paved with blood. There's got to be another way.",
      choices: [
        {
          text: 'You two should work together. Find a middle path.',
          nextNodeId: 'middle_path',
        },
        {
          text: 'I understand. Let me prove myself your way.',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    // ========================================================================
    // DISAGREEMENT WITH DIAMONDBACK
    // ========================================================================
    {
      id: 'diamondback_disagreement',
      text: "*He sighs, a deep and weary sound.* Dolores and I want the same thing - IVRC brought down. But she thinks you gotta fight fire with fire. I've seen too many fires to believe that. *He gestures at the mountain.* The stone teaches patience. A seam of ore don't give up its treasure to a man who swings wild. You gotta work steady, precise.",
      choices: [
        {
          text: "But sometimes you need dynamite to break through.",
          nextNodeId: 'dynamite_argument',
        },
        {
          text: 'Violence just gives IVRC excuses.',
          nextNodeId: 'violence_excuses',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: 'Could you ever work together?',
          nextNodeId: 'work_together',
        },
      ],
    },

    {
      id: 'dynamite_argument',
      text: "*His eyes flash.* Sure, dynamite clears rock. Also brings down the whole damn tunnel if you ain't careful. Every raid Dolores runs, IVRC cracks down harder on the workers. Every guard she kills got a family that hates us now. *He jabs a finger at you.* You wanna know the cost of her dynamite? Ask the widows in the company towns. They're payin' it.",
      expression: 'angry',
      choices: [
        {
          text: 'You might be right. What would you do instead?',
          nextNodeId: 'peaceful_alternative',
        },
        {
          text: "But IVRC won't stop without force.",
          nextNodeId: 'force_necessary',
        },
      ],
    },

    {
      id: 'violence_excuses',
      text: "*He nods approvingly.* Now you're seein' it. Every time the Copperheads hit a train, the newspapers back east write about 'frontier savages' and 'lawless territories.' They don't write about IVRC killin' miners. *His voice strengthens.* But show 'em proof? Documents? The words of Thorne himself orderin' deaths? That changes the story. That's a vein they can't ignore.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: 'The truth as a weapon.',
          nextNodeId: 'truth_weapon',
        },
        {
          text: 'But will anyone listen?',
          nextNodeId: 'will_anyone_listen',
        },
      ],
    },

    {
      id: 'truth_weapon',
      text: "*He allows himself a small smile.* The only weapon that matters in the end. Bullets kill men, but truth kills empires. Cornelius Thorne built his fortune on lies and buried bodies. We dig up those bones, show 'em to the world... there ain't no Pinkerton army that can put 'em back in the ground.",
      choices: [
        {
          text: "Then let's dig.",
          nextNodeId: 'lets_dig',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'lets_dig',
      text: "*For the first time, real hope flickers in his eyes.* You got the right spirit. But diggin' for truth is dangerous as any mine. IVRC's got paid informants everywhere. One wrong word to the wrong person... *He trails off.* Before I trust you with anythin' that matters, I need to know you can keep secrets. And that you're willin' to work for this community, not just your own ends.",
      choices: [
        {
          text: 'Tell me what you need.',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'work_together',
      text: "*He's quiet for a long moment.* There was a time we worked side by side. Before Thomas died. Before her first raid got three of my people arrested and hung as accomplices. *His voice is heavy.* I don't hate Dolores. I understand her. But I can't trust her methods. Not when my people pay the price.",
      choices: [
        {
          text: "Maybe someone new could bridge the gap.",
          nextNodeId: 'bridge_gap',
        },
        {
          text: 'What would it take to unite against IVRC?',
          nextNodeId: 'unite_against',
        },
      ],
    },

    {
      id: 'bridge_gap',
      text: "*He looks at you with something like curiosity.* You offerin' to be that bridge? That's a hard road. Dolores don't trust easy, and neither do I. You'd have to earn both our confidences, find somethin' we could both agree on. *He strokes his beard thoughtfully.* But if you managed it... if you brought us together with a real plan... that might be worth more than all the documents in the world.",
      onEnterEffects: [{ type: 'set_flag', target: 'bridge_gap_possibility' }],
      choices: [
        {
          text: "I've already talked to her. She wants the same thing.",
          nextNodeId: 'already_talked_diamondback',
          conditions: [{ type: 'flag_set', target: 'diamondback_ally' }],
        },
        {
          text: "I'll try. Where do I start?",
          nextNodeId: 'bridge_start',
        },
      ],
    },

    {
      id: 'already_talked_diamondback',
      text: "*His eyebrows rise.* You've been to Rattlesnake Canyon and walked out alive? That's somethin'. *He considers.* If Dolores is willin' to talk... maybe there's a chance. But words are just words. She'd have to commit to keepin' her raids away from my people. And I'd have to... *he hesitates* ...share things I've kept hidden a long time.",
      choices: [
        {
          text: 'The documents.',
          nextNodeId: 'documents_alliance',
        },
        {
          text: 'What would you need from her?',
          nextNodeId: 'need_from_diamondback',
        },
      ],
    },

    // ========================================================================
    // TRUST QUEST LINE
    // ========================================================================
    {
      id: 'trust_quest_intro',
      text: "*He stands, moving with the careful deliberation of a man who's spent decades watching for unstable ground.* There's a supply run comin' in tomorrow. Medical supplies, powder, food - things we can't get from IVRC-controlled towns. But we got word that claim jumpers have been watchin' the trail. I need someone to scout ahead, make sure the route's clear.",
      onEnterEffects: [{ type: 'set_flag', target: 'trust_quest_started' }],
      choices: [
        {
          text: "I'll do it. Where's the trail?",
          nextNodeId: 'trail_details',
        },
        {
          text: "Claim jumpers, or IVRC's people?",
          nextNodeId: 'jumpers_or_ivrc',
        },
        {
          text: "Is there something more I can do?",
          nextNodeId: 'more_to_do',
        },
      ],
    },

    {
      id: 'trail_details',
      text: "*He pulls out a worn map, spreading it on the bench.* North ridge, through the old copper workings. There's a passage there most folks don't know about - been a Freeminer trail for thirty years. *He traces the route with his finger.* If you see anyone who ain't supposed to be there, you come back and warn us. Don't try to be a hero. Information's more valuable than dead scouts.",
      choices: [
        {
          text: 'Understood. Scout and report.',
          nextNodeId: 'scout_accepted',
          effects: [{ type: 'advance_quest', target: 'freeminer_trust', stringValue: 'scout_mission' }],
        },
        {
          text: 'What if I find IVRC men?',
          nextNodeId: 'ivrc_encounter',
        },
      ],
    },

    {
      id: 'ivrc_encounter',
      text: "*His expression hardens.* If it's Pinkertons or company men in force, you run. Ain't no shame in retreat from a battle you can't win. But if it's just a lookout or two... *he meets your eyes* ...use your judgment. We don't kill unless we have to. But we don't let our people die either.",
      choices: [
        {
          text: "I'll handle it carefully.",
          nextNodeId: 'scout_accepted',
          effects: [{ type: 'advance_quest', target: 'freeminer_trust', stringValue: 'scout_mission' }],
        },
      ],
    },

    {
      id: 'scout_accepted',
      text: "*He nods, something like approval in his weathered features.* Good. The passage entrance is behind the old Henderson claim - look for the tailings pile shaped like a sleeping bear. You'll know you're on the right track when you see the copper stains on the walls. Be back before nightfall if you can.",
      choices: [
        {
          text: "I'll be back with news.",
          nextNodeId: null,
        },
        {
          text: 'Any other advice?',
          nextNodeId: 'scout_advice',
        },
      ],
    },

    {
      id: 'scout_advice',
      text: "*He pauses, considering.* Trust your ears more than your eyes underground. Sound travels funny in tunnels - you'll hear trouble before you see it. And watch your step near the old copper workings. Some of those floors are rotten as IVRC's conscience. One wrong step and you'll be mining your way out of a pit.",
      onEnterEffects: [{ type: 'set_flag', target: 'got_samuel_advice' }],
      choices: [
        {
          text: "Thank you. I won't let you down.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'jumpers_or_ivrc',
      text: "*His jaw tightens.* Does it matter? Either way, they're after what's ours. Could be independents lookin' for easy pickin's. Could be IVRC men dressed as bandits - they've done that before, made our troubles look like lawlessness to justify sendin' in more enforcers. *He shakes his head.* The end result's the same. Our people get hurt.",
      choices: [
        {
          text: "I'll find out who they are.",
          nextNodeId: 'trail_details',
        },
      ],
    },

    {
      id: 'more_to_do',
      text: "*He looks at you appraisingly.* Eager. That can be good or bad, dependin'. *He pauses.* For now, the scout mission's what matters most. Prove yourself there, and we'll talk about more. The mountain don't reveal its treasures to a man who tries to take everything at once.",
      choices: [
        {
          text: "Fair enough. Tell me about the trail.",
          nextNodeId: 'trail_details',
        },
      ],
    },

    // ========================================================================
    // THOMAS'S STORY - DEEPER DIVE
    // ========================================================================
    {
      id: 'shared_loss',
      text: "*Something shifts in his eyes - recognition of a familiar pain.* Then you know. You know what it's like to have somethin' ripped away that should've been protected. *He gestures to the empty bench beside him.* Sit down. Tell me what they took from you.",
      expression: 'sympathetic',
      choices: [
        {
          text: 'My family lost our land to their schemes.',
          nextNodeId: 'land_loss_story',
        },
        {
          text: 'Someone I loved died in their mines.',
          nextNodeId: 'mine_death_story',
        },
        {
          text: "I'd rather not share the details. Just know I have cause.",
          nextNodeId: 'private_cause',
        },
      ],
    },

    {
      id: 'land_loss_story',
      text: "*He nods slowly.* Seen it a hundred times. IVRC wants land, they find a way to take it. Falsified surveys, bought judges, unpayable debts with interest that'd make a loan shark blush. *His voice softens.* My people up here - half of 'em came from farms and ranches that used to be theirs. Now they dig rock because it's the only work left.",
      onEnterEffects: [{ type: 'change_reputation', value: 15 }],
      choices: [
        {
          text: 'We have to stop them.',
          nextNodeId: 'stop_them_together',
        },
        {
          text: 'Tell me about your son.',
          nextNodeId: 'son_story_full',
        },
      ],
    },

    {
      id: 'mine_death_story',
      text: "*His breath catches, and for a moment he looks like a man standing at a grave.* Then you truly understand. The mountain takes lives - that's its nature. But when it takes lives because some company man decided support timbers cost too much... *his voice cracks slightly* ...that ain't the mountain. That's murder. My son... my Thomas... he trusted them.",
      expression: 'sad',
      onEnterEffects: [{ type: 'change_reputation', value: 20 }],
      choices: [
        {
          text: 'Tell me about Thomas.',
          nextNodeId: 'son_story_full',
        },
        {
          text: 'We can make them pay for what they did.',
          nextNodeId: 'make_them_pay_peaceful',
        },
      ],
    },

    {
      id: 'son_story_full',
      text: "*He stares at some point past you, seeing memories.* Thomas was everything a father could hope for. Strong as oak, gentle as spring rain. Married his sweetheart Martha when they were both just kids. *His voice wavers.* She was six months along when the shaft collapsed. Now she lives with my granddaughter in a cabin I built with these hands, and she won't speak my name because I couldn't save him.",
      expression: 'sad',
      choices: [
        {
          text: 'That must be unbearable.',
          nextNodeId: 'unbearable_burden',
        },
        {
          text: 'Does she know about the documents?',
          nextNodeId: 'martha_documents',
        },
      ],
    },

    {
      id: 'unbearable_burden',
      text: "*He's silent for a long moment.* Some days it is. Some days I want to take Dolores's path - ride down into Junction City and make Thorne look me in the eye before I put him in the ground. *His hands clench, then slowly release.* But Thomas wouldn't want that. He believed in doin' things right. And his little girl deserves a future where her grandfather ain't a murderer.",
      choices: [
        {
          text: "Then we expose them the right way.",
          nextNodeId: 'expose_right_way',
        },
        {
          text: 'Your granddaughter - is she safe here?',
          nextNodeId: 'granddaughter_safety',
        },
      ],
    },

    {
      id: 'martha_documents',
      text: "*He shakes his head.* Martha blames me for keepin' Thomas in the mines. Says if I'd just sold to IVRC, he'd still be alive. *Bitterness creeps into his voice.* Maybe she's right. But then we'd all be workin' their claims, dyin' their deaths, and they'd still own the judges. Least this way, there's hope for justice.",
      choices: [
        {
          text: 'Your sacrifice will mean something.',
          nextNodeId: 'sacrifice_meaning',
        },
        {
          text: 'Let me help you see it through.',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'granddaughter_safety',
      text: "*His expression softens momentarily.* Maggie. She's safe as I can make her. Stays with Martha down in the lower hollow, away from the mining. Smart as a whip, that one. Reminds me of Thomas when he was small. *His voice hardens.* IVRC won't touch her. That's the one promise I'll kill to keep.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_about_maggie' }],
      choices: [
        {
          text: 'I hope I can meet her someday.',
          nextNodeId: 'meet_maggie_later',
        },
        {
          text: "Children shouldn't have to grow up in shadows.",
          nextNodeId: 'children_shadows',
        },
      ],
    },

    {
      id: 'children_shadows',
      text: "*He looks at you with renewed interest.* No. They shouldn't. *He stands slowly.* That's why the documents matter. Not for revenge - for the children. Maggie, and all the others growin' up in mining camps and company towns. They deserve a future IVRC can't control. *He extends his hand.* Help me give 'em that, and you'll have my trust.",
      choices: [
        {
          text: '*Shake his hand* You have my word.',
          nextNodeId: 'word_given',
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },

    // ========================================================================
    // LETTER / GEAR SYMBOL PATH
    // ========================================================================
    {
      id: 'gear_symbol_reveal',
      text: "*His whole body goes still, like a man who's heard a rockfall in the distance.* The gear. *He steps closer, voice dropping.* Where did you get that letter? Who sent it to you?",
      expression: 'shocked',
      choices: [
        {
          text: "I don't know. It arrived anonymously.",
          nextNodeId: 'anonymous_letter',
        },
        {
          text: '*Show him the letter*',
          nextNodeId: 'show_letter_samuel',
        },
      ],
    },

    {
      id: 'show_letter_samuel',
      text: "*He takes the letter with trembling hands, reading it carefully. When he looks up, his eyes are wet.* This is the old code. The Worker's Coalition symbol. I thought everyone who used it was dead or gone. *His voice is barely a whisper.* This handwriting... I know this hand.",
      expression: 'emotional',
      onEnterEffects: [
        { type: 'set_flag', target: 'samuel_recognized_letter' },
        { type: 'change_reputation', value: 25 },
      ],
      choices: [
        {
          text: 'Whose handwriting is it?',
          nextNodeId: 'handwriting_recognition',
        },
        {
          text: 'What does the letter mean?',
          nextNodeId: 'letter_meaning_samuel',
        },
      ],
    },

    {
      id: 'handwriting_recognition',
      text: "*He holds the letter like a holy relic.* My brother. Jacob. He disappeared ten years ago - right after we first tried to get the documents out. IVRC said they found him dead in a ravine, but we never saw a body. *His voice breaks.* I thought... all this time I thought... but this is his hand. I'd know it anywhere.",
      expression: 'shocked',
      onEnterEffects: [{ type: 'set_flag', target: 'jacob_mystery' }],
      choices: [
        {
          text: 'Your brother might still be alive.',
          nextNodeId: 'jacob_alive',
        },
        {
          text: 'Why would he contact me instead of you directly?',
          nextNodeId: 'why_contact_stranger',
        },
      ],
    },

    {
      id: 'jacob_alive',
      text: "*Hope and fear war across his weathered face.* If he is... if he's been hiding all these years... *He grips your arm suddenly.* You have to help me find him. Jacob knew things - about IVRC, about the documents, about where the bodies are buried. If he's alive and he reached out to you, it means he thinks the time has come. The time to finally bring Thorne down.",
      onEnterEffects: [{ type: 'start_quest', target: 'find_jacob' }],
      choices: [
        {
          text: "I'll help you find your brother.",
          nextNodeId: 'find_jacob_accept',
          effects: [{ type: 'change_reputation', value: 20 }],
        },
        {
          text: 'What can you tell me about him?',
          nextNodeId: 'jacob_info',
        },
      ],
    },

    {
      id: 'why_contact_stranger',
      text: "*He considers the question slowly.* Because IVRC watches me. Always has. Any message to me directly would be intercepted. But a stranger, comin' in from outside... *understanding dawns* ...you're a fresh trail. They don't know to watch you yet. Jacob always was the clever one.",
      choices: [
        {
          text: 'Then we need to move carefully.',
          nextNodeId: 'move_carefully',
        },
        {
          text: 'What does he want me to do?',
          nextNodeId: 'jacob_purpose',
        },
      ],
    },

    // ========================================================================
    // HAS LETTER ENTRY (First meeting with letter)
    // ========================================================================
    {
      id: 'has_letter_entry',
      text: "*The old miner studies you with weathered eyes.* Strangers don't find Freeminer's Hollow by accident. You got a reason to be here, best speak it plain. *His hand rests near a pickaxe leaning against the wall.*",
      expression: 'suspicious',
      choices: [
        {
          text: 'I have a letter. The gear symbol led me here.',
          nextNodeId: 'gear_symbol_reveal',
        },
        {
          text: "I'm looking for Samuel Ironpick.",
          nextNodeId: 'confirm_identity',
        },
      ],
    },

    // ========================================================================
    // DIAMONDBACK SENT ENTRY
    // ========================================================================
    {
      id: 'diamondback_sent',
      text: "*Samuel looks up from his work, eyes narrowing.* Word travels fast in these mountains. I hear you've been seen at Rattlesnake Canyon and lived to tell about it. *He sets down his tools.* Dolores must see somethin' in you. Question is whether I will too.",
      expression: 'suspicious',
      choices: [
        {
          text: 'She told me you might have answers about this letter.',
          nextNodeId: 'gear_symbol_reveal',
          conditions: [{ type: 'has_item', target: 'mysterious_letter' }],
        },
        {
          text: 'She thinks we could work together. All of us.',
          nextNodeId: 'work_together_diamondback',
        },
        {
          text: 'She mentioned you disagreed on methods.',
          nextNodeId: 'diamondback_disagreement',
        },
      ],
    },

    {
      id: 'work_together_diamondback',
      text: "*He lets out a long breath.* Dolores wants to work together when there's somethin' to gain. Then she rides off and hits another train, and my people pay for it. *He fixes you with a hard stare.* You want to bridge that gap, you best understand - I won't send my folk to die in her raids. And I won't have the documents used to justify more bloodshed.",
      choices: [
        {
          text: 'The documents could make violence unnecessary.',
          nextNodeId: 'documents_peace',
        },
        {
          text: 'What would it take for you to trust her again?',
          nextNodeId: 'trust_diamondback_again',
        },
      ],
    },

    {
      id: 'documents_peace',
      text: "*Something shifts in his expression - a flicker of hope quickly guarded.* That's the dream, ain't it? Proof so damning that even IVRC's pet politicians have to act. Make their crimes undeniable. *He strokes his beard.* If I believed Dolores would wait for that proof instead of keepin' up her raids... maybe we could talk.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_considering_alliance' }],
      choices: [
        {
          text: "I can convince her to wait.",
          nextNodeId: 'convince_diamondback',
        },
        {
          text: 'What if the documents and the raids worked together?',
          nextNodeId: 'combined_strategy',
        },
      ],
    },

    // ========================================================================
    // SHERIFF MENTION PATH
    // ========================================================================
    {
      id: 'sheriff_mention',
      text: "*His expression hardens like cooling slag.* Cole sent you. *He steps back.* That man wears a badge bought by IVRC gold. Every 'investigation' of his ends with Freeminer folks in chains. And you come here talkin' about disappearances like we're the problem?",
      expression: 'hostile',
      onEnterEffects: [{ type: 'change_reputation', value: -10 }],
      choices: [
        {
          text: "Cole doesn't trust IVRC either. He wants to help.",
          nextNodeId: 'cole_defense',
        },
        {
          text: "You're right - I should have mentioned him differently.",
          nextNodeId: 'sheriff_apology',
        },
        {
          text: 'The disappearances are real. People are going missing.',
          nextNodeId: 'disappearances_real',
        },
      ],
    },

    {
      id: 'cole_defense',
      text: "*He scoffs.* Cole's conscience wrestles with his duty every day. I've seen that look on a hundred men's faces - right before they do what they're told anyway. *But some of the hostility fades.* Still... he's never come for us directly. Never brought Pinkertons to the Hollow. Maybe there's more to him than the badge.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: "He's trying to find another way. Like you.",
          nextNodeId: 'another_way',
        },
        {
          text: 'He mentioned you by name. With respect.',
          nextNodeId: 'cole_respect',
        },
      ],
    },

    {
      id: 'another_way',
      text: "*He's quiet for a moment.* Another way. *He looks toward the mountain peaks.* I've been searchin' for another way for twenty years. Peaceful resistance, legal challenges, tryin' to get the truth out. And you know what I've got to show for it? Dead messengers and a granddaughter who'll never know her father.",
      choices: [
        {
          text: "Maybe that's about to change.",
          nextNodeId: 'change_coming',
        },
        {
          text: 'Tell me about what happened.',
          nextNodeId: 'son_condolence',
        },
      ],
    },

    // ========================================================================
    // PASSING THROUGH PATH
    // ========================================================================
    {
      id: 'passing_through',
      text: "*His eyes don't soften.* Passin' through to where? Ain't nothin' beyond this hollow but harder climbing and deeper mining. Flatlanders don't 'just wander' up here unless they're lost or lyin'. *He picks up the pickaxe.* So which is it?",
      choices: [
        {
          text: "All right - I was looking for the Freeminers.",
          nextNodeId: 'looking_for_freeminers',
        },
        {
          text: "I'll be honest - I'm following a letter.",
          nextNodeId: 'gear_symbol_reveal',
          conditions: [{ type: 'has_item', target: 'mysterious_letter' }],
        },
        {
          text: "I'll leave. I didn't mean to cause trouble.",
          nextNodeId: 'leave_hollow',
        },
      ],
    },

    {
      id: 'looking_for_freeminers',
      text: "*He sets down the pickaxe, but doesn't relax.* Found us. What now? You gonna run back to wherever you came from and tell people where we are? Sell our location to IVRC for bounty money?",
      choices: [
        {
          text: 'I want to help, not betray.',
          nextNodeId: 'help_cause_skeptical',
        },
        {
          text: 'IVRC is my enemy too.',
          nextNodeId: 'shared_loss',
        },
      ],
    },

    {
      id: 'leave_hollow',
      text: "*He watches you turn to go, then speaks.* Wait. *His voice is gruff but not unkind.* It takes courage to walk away instead of lyin' further. That means somethin'. *He sighs.* You want to know about the Freeminers, I'll tell you. But you gotta understand - trust is the only currency we got up here, and it's hard-earned.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: 'I understand. I appreciate your honesty too.',
          nextNodeId: 'honest_exchange',
        },
      ],
    },

    // ========================================================================
    // RETURN VISITS
    // ========================================================================
    {
      id: 'return_visit_neutral',
      text: "*Samuel looks up from his work as you approach.* Back again. The mountain's seen fit to let you through twice now. *He sets aside his tools.* You got news, or just lookin' for more conversation?",
      choices: [
        {
          text: 'I scouted the trail like you asked.',
          nextNodeId: 'scout_report',
          conditions: [{ type: 'flag_set', target: 'scout_mission_complete' }],
        },
        {
          text: 'I wanted to learn more about the documents.',
          nextNodeId: 'documents_revisit',
          conditions: [{ type: 'flag_set', target: 'heard_about_documents' }],
        },
        {
          text: 'Just checking in. How are things here?',
          nextNodeId: 'hollow_status',
        },
        {
          text: "I've been speaking with Diamondback about working together.",
          nextNodeId: 'work_together_diamondback',
          conditions: [{ type: 'flag_set', target: 'diamondback_ally' }],
        },
      ],
    },

    {
      id: 'scout_report',
      text: "*He straightens immediately.* You made it back. And? What'd you find on the trail?",
      choices: [
        {
          text: "Clear. No sign of jumpers or IVRC men.",
          nextNodeId: 'scout_clear',
        },
        {
          text: 'There were watchers. Two men near the copper workings.',
          nextNodeId: 'scout_watchers',
        },
        {
          text: "IVRC Pinkertons. At least six. They know about the passage.",
          nextNodeId: 'scout_pinkertons',
        },
      ],
    },

    {
      id: 'scout_clear',
      text: "*Relief crosses his features.* Good. Good news is rare enough these days. *He clasps your shoulder.* You did right by us. The supply run can go forward. *He reaches into a pouch at his belt.* Here - this ain't much, but it's honest thanks.",
      onEnterEffects: [
        { type: 'give_gold', value: 25 },
        { type: 'change_reputation', value: 20 },
        { type: 'advance_quest', target: 'freeminer_trust', stringValue: 'scout_complete' },
      ],
      choices: [
        {
          text: "I don't need payment. The trust is enough.",
          nextNodeId: 'trust_is_payment',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: 'Thank you. What else needs doing?',
          nextNodeId: 'whats_next',
        },
      ],
    },

    {
      id: 'trust_is_payment',
      text: "*He pauses, then slowly puts the gold away.* You keep surprisin' me. Most folks out here measure everything in coin. *His expression warms.* Maybe Dolores was right about you. Maybe there's hope for bridges after all.",
      onEnterEffects: [{ type: 'set_flag', target: 'refused_samuel_payment' }],
      choices: [
        {
          text: "What's our next move?",
          nextNodeId: 'whats_next',
        },
      ],
    },

    {
      id: 'scout_watchers',
      text: "*His jaw tightens.* Watchers. Could be claim jumpers scoutin' our movements, could be IVRC's eyes. Either way, we got a problem. *He thinks quickly.* We'll have to use the old shaft route instead. It's longer and harder, but they won't know about it. Thank you for the warning - that information may have saved lives.",
      onEnterEffects: [
        { type: 'change_reputation', value: 25 },
        { type: 'advance_quest', target: 'freeminer_trust', stringValue: 'scout_complete' },
      ],
      choices: [
        {
          text: 'I can help reroute the supply run.',
          nextNodeId: 'help_reroute',
        },
        {
          text: 'Should we deal with the watchers?',
          nextNodeId: 'deal_with_watchers',
        },
      ],
    },

    {
      id: 'scout_pinkertons',
      text: "*His face goes pale, then hardens like granite.* Six Pinkertons. They're escalatin'. *He begins gathering tools and papers from the table.* We need to move - change routes, warn the supply runners. This ain't just about one shipment anymore. They're closin' in. *He turns to you.* You brought this warning at great risk. I won't forget that.",
      onEnterEffects: [
        { type: 'change_reputation', value: 35 },
        { type: 'advance_quest', target: 'freeminer_trust', stringValue: 'scout_complete' },
        { type: 'set_flag', target: 'pinkerton_threat_warned' },
      ],
      choices: [
        {
          text: 'What can I do to help?',
          nextNodeId: 'emergency_help',
        },
        {
          text: 'The documents - we need to move them too.',
          nextNodeId: 'move_documents',
        },
      ],
    },

    {
      id: 'move_documents',
      text: "*He stops mid-motion, meeting your eyes.* You're right. If they know about the passage, they might know about more. *He makes a decision.* The documents are hidden deep - in a place only I know. But if somethin' happens to me... *he takes a breath* ...someone else needs to know where they are. Someone I trust.",
      choices: [
        {
          text: 'Are you saying what I think you are?',
          nextNodeId: 'document_trust',
        },
        {
          text: 'We should focus on the immediate threat first.',
          nextNodeId: 'immediate_threat',
        },
      ],
    },

    {
      id: 'document_trust',
      text: "*He looks at you for a long moment.* I'm an old man. Been carryin' this burden alone for too long. If the Pinkertons are closin' in... *He squares his shoulders.* You've proven yourself. Done right by my people. It's time I shared the load. The documents are in the old Mercer shaft, behind a false wall in the third gallery. Only I knew. Now you do too.",
      onEnterEffects: [
        { type: 'set_flag', target: 'knows_document_location' },
        { type: 'change_reputation', value: 50 },
        { type: 'start_quest', target: 'find_documents' },
      ],
      choices: [
        {
          text: 'I swear to protect this secret with my life.',
          nextNodeId: 'secret_oath',
        },
        {
          text: 'Why trust me with this?',
          nextNodeId: 'why_trust_me',
        },
      ],
    },

    {
      id: 'why_trust_me',
      text: "*He manages a tired smile.* Because you came back. Because you warned us when you could've run. Because Dolores trusts you, and for all our disagreements, she's a good judge of character. *His voice softens.* And because I'm tired of carryin' this weight alone. Thomas would've been the one to take it from me. Now... now it falls to you.",
      choices: [
        {
          text: "I'll honor that trust. I swear it.",
          nextNodeId: 'secret_oath',
        },
      ],
    },

    {
      id: 'secret_oath',
      text: "*He nods slowly.* Then we're bound by more than words now. That knowledge makes you a target. IVRC would kill to know what you know. *His expression hardens.* But it also makes you the key to bringin' 'em down. When the time is right - when we've got a clear path to honest hands - you retrieve those documents and you run like hellfire is on your heels.",
      choices: [
        {
          text: "I understand. When will the time be right?",
          nextNodeId: 'right_time',
        },
        {
          text: 'What if they find you before then?',
          nextNodeId: 'contingency_plan',
        },
      ],
    },

    // ========================================================================
    // FRIENDLY/TRUSTED GREETING PATHS
    // ========================================================================
    {
      id: 'friendly_greeting',
      text: "*Samuel's weathered face creases into something approaching a smile as you approach.* You're becomin' a familiar face around the Hollow. *He sets aside his work.* What brings you back to the mountain?",
      expression: 'friendly',
      choices: [
        {
          text: "Wanted to check on you and the Freeminers.",
          nextNodeId: 'hollow_status',
        },
        {
          text: "I've made progress with Diamondback.",
          nextNodeId: 'diamondback_progress',
          conditions: [{ type: 'flag_set', target: 'diamondback_ally' }],
        },
        {
          text: 'Any word on IVRC movements?',
          nextNodeId: 'ivrc_movements',
        },
        {
          text: "I think it's time to discuss the documents.",
          nextNodeId: 'documents_discussion',
          conditions: [{ type: 'flag_set', target: 'heard_about_documents' }],
        },
      ],
    },

    {
      id: 'trusted_greeting',
      text: "*Samuel rises to greet you, genuine warmth in his eyes.* My friend. *The word carries weight.* The mountain's been kind to you - you look well. Come, sit. Share a drink with me. We've got much to discuss.",
      expression: 'friendly',
      choices: [
        {
          text: "*Accept the drink* How are things in the Hollow?",
          nextNodeId: 'hollow_status_trusted',
        },
        {
          text: "The time has come, Samuel. We need to move on the documents.",
          nextNodeId: 'documents_time',
          conditions: [{ type: 'flag_set', target: 'knows_document_location' }],
        },
        {
          text: "I've unified the factions. Diamondback is ready to work with you.",
          nextNodeId: 'factions_united',
          conditions: [
            { type: 'flag_set', target: 'diamondback_ally' },
            { type: 'flag_set', target: 'samuel_considering_alliance' },
          ],
        },
      ],
    },

    {
      id: 'hollow_status',
      text: "*He glances around the small settlement.* Quiet for now. The winter's been hard, but we've made it through harder. *His voice drops.* IVRC's been puttin' pressure on our supply routes, though. Tryin' to starve us out the slow way. Same old tactics.",
      choices: [
        {
          text: 'Is there anything I can do to help?',
          nextNodeId: 'help_hollow',
        },
        {
          text: "Diamondback's raids distract them, at least.",
          nextNodeId: 'raid_distraction',
        },
        {
          text: 'The documents could end all of this.',
          nextNodeId: 'documents_end_it',
        },
      ],
    },

    {
      id: 'hollow_status_trusted',
      text: "*He pours two cups of something that smells like pine needles and courage.* Better than it's been in years. Your work's made a difference. Supply routes are more secure. Folks have hope again. *He raises his cup.* To the future, whatever it may hold.",
      choices: [
        {
          text: "*Raise cup* To justice.",
          nextNodeId: 'toast_justice',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: "*Raise cup* To the Freeminers.",
          nextNodeId: 'toast_freeminers',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'toast_justice',
      text: "*He drinks deeply.* Justice. Now there's a word that's been hollowed out by men like Thorne. *He sets down the cup.* But we're gonna fill it with meaning again. I can feel it. The tide's about to turn.",
      choices: [
        {
          text: 'What makes you say that?',
          nextNodeId: 'tide_turning',
        },
      ],
    },

    {
      id: 'tide_turning',
      text: "*His eyes take on a distant look.* Call it an old man's intuition. The mountain's been quiet lately - not the silence of emptiness, but the silence before a cave-in. Somethin's gonna break loose. When it does... we need to be ready.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_senses_change' }],
      choices: [
        {
          text: 'Then we should prepare. What do you need?',
          nextNodeId: 'preparation_needs',
        },
        {
          text: 'The documents. It has to be now.',
          nextNodeId: 'documents_time',
          conditions: [{ type: 'flag_set', target: 'knows_document_location' }],
        },
      ],
    },

    // ========================================================================
    // DOCUMENTS QUEST LINE
    // ========================================================================
    {
      id: 'documents_discussion',
      text: "*His expression grows serious.* The documents. You've been patient about 'em, I'll give you that. *He looks around, ensuring no one is nearby.* Ask what you want to know. You've earned some answers.",
      choices: [
        {
          text: 'Where exactly are they hidden?',
          nextNodeId: 'documents_where',
        },
        {
          text: "What would it take to finally use them?",
          nextNodeId: 'documents_use',
        },
        {
          text: 'Are there copies? What if something happens to them?',
          nextNodeId: 'documents_copies',
        },
      ],
    },

    {
      id: 'documents_where',
      text: "*He's silent for a long moment, weighing the decision.* You've done right by us. Protected our routes, warned us about threats. *He meets your eyes.* The original documents are in the old Mercer shaft - third gallery, behind a false wall marked with the gear symbol. But gettin' to 'em ain't easy. That shaft's been abandoned for twenty years. Unstable in places.",
      onEnterEffects: [
        { type: 'set_flag', target: 'knows_document_location' },
        { type: 'change_reputation', value: 25 },
      ],
      choices: [
        {
          text: "I can retrieve them when you're ready.",
          nextNodeId: 'ready_to_retrieve',
        },
        {
          text: 'Why there?',
          nextNodeId: 'why_mercer',
        },
      ],
    },

    {
      id: 'why_mercer',
      text: "*A ghost of a smile crosses his face.* Because Mercer was my father's claim. The one place in these mountains I know better than my own cabin. Every tunnel, every support beam, every loose stone. If IVRC ever found it, they'd send men in... and those men wouldn't come back out. The mountain protects its own.",
      choices: [
        {
          text: 'You could bring the whole shaft down on intruders.',
          nextNodeId: 'shaft_trap',
        },
        {
          text: "That's clever. And dangerous.",
          nextNodeId: 'clever_dangerous',
        },
      ],
    },

    {
      id: 'documents_use',
      text: "*He strokes his beard thoughtfully.* The papers need to reach honest hands. Not local - IVRC owns everything from here to the territorial capital. We'd need to get 'em to a federal marshal, or a newspaper back east, or maybe one of them reform politicians in Washington. Someone who can't be bought or scared.",
      choices: [
        {
          text: 'I know people who might help.',
          nextNodeId: 'know_people',
        },
        {
          text: "What about Diamondback's contacts?",
          nextNodeId: 'diamondback_contacts',
        },
        {
          text: 'Sheriff Cole has connections.',
          nextNodeId: 'cole_connections',
          conditions: [{ type: 'flag_set', target: 'sheriff_ally' }],
        },
      ],
    },

    {
      id: 'documents_time',
      text: "*Samuel sets down his cup, all trace of warmth replaced by steely resolve.* You're right. We've waited long enough. Plannin' and preparin' only does so much. At some point, you gotta swing the pick. *He stands.* The documents are in the Mercer shaft. You know the way. But before you go...",
      choices: [
        {
          text: 'What is it?',
          nextNodeId: 'final_warning',
        },
      ],
    },

    {
      id: 'final_warning',
      text: "*His weathered hands grip your shoulders.* IVRC's gonna come for you once those papers are out. They'll come for all of us. Make sure you've got allies - Cole, Dolores, whoever else you've gathered. Because once the truth is loose... there ain't no puttin' it back in the ground. *His eyes are fierce.* Make it count.",
      onEnterEffects: [
        { type: 'advance_quest', target: 'find_documents', stringValue: 'retrieval_phase' },
        { type: 'set_flag', target: 'documents_retrieval_authorized' },
      ],
      choices: [
        {
          text: "I will. I'll make Thomas proud.",
          nextNodeId: 'thomas_proud',
          effects: [{ type: 'change_reputation', value: 15 }],
        },
        {
          text: "I'll return with the documents. Wait for my signal.",
          nextNodeId: 'wait_for_signal',
        },
      ],
    },

    {
      id: 'thomas_proud',
      text: "*Emotion flickers across his face.* You already have. *His voice is rough.* Go now. And come back safe. The mountain protects its own - remember that.",
      choices: [
        {
          text: "I'll see you soon.",
          nextNodeId: null,
        },
      ],
    },

    // ========================================================================
    // DOCUMENTS RETRIEVED - END GAME
    // ========================================================================
    {
      id: 'documents_retrieved',
      text: "*Samuel looks up sharply as you approach, then sees what you're carrying. For a moment, he just stares. Then, slowly, tears begin to roll down his weathered cheeks.* You did it. After all these years... my boy... Thomas... *His voice breaks.*",
      expression: 'emotional',
      onEnterEffects: [
        { type: 'change_reputation', value: 100 },
        { type: 'set_flag', target: 'samuel_vindicated' },
      ],
      choices: [
        {
          text: 'The truth is finally free.',
          nextNodeId: 'truth_free',
        },
        {
          text: '*Give him the documents* These belong to you.',
          nextNodeId: 'documents_to_samuel',
        },
      ],
    },

    {
      id: 'truth_free',
      text: "*He takes the documents with trembling hands, reading through pages he hasn't seen in decades.* All of it. The bribes, the cover-ups, Thorne's own words condemning himself. *He looks up at you.* We need to move fast. Once IVRC realizes these are out, they'll burn the territory to stop them reaching honest hands.",
      choices: [
        {
          text: "I have a plan to get them to Washington.",
          nextNodeId: 'washington_plan',
        },
        {
          text: 'Diamondback and Cole are standing by.',
          nextNodeId: 'allies_ready',
        },
      ],
    },

    {
      id: 'documents_to_samuel',
      text: "*He shakes his head, pushing the papers back.* No. These don't belong to me. They belong to everyone IVRC ever wronged. Thomas, and all the others. *He takes your hand, pressing it over the documents.* You carry them now. You're the one who pulled them from the dark. You're the one who'll bring them into the light.",
      choices: [
        {
          text: "I'll see this through. For Thomas. For all of them.",
          nextNodeId: 'final_mission',
        },
      ],
    },

    {
      id: 'final_mission',
      text: "*Samuel straightens, looking more alive than you've ever seen him.* Then this is it. The moment we've been waiting for. The moment my son died for. *He clasps your arm.* Whatever happens next... thank you. You've given an old man hope. And that's worth more than all the gold in these mountains.",
      onEnterEffects: [
        { type: 'complete_quest', target: 'find_documents' },
        { type: 'start_quest', target: 'deliver_truth' },
      ],
      choices: [
        {
          text: "I won't let you down, Samuel.",
          nextNodeId: null,
        },
      ],
    },

    // ========================================================================
    // QUEST CHECK-IN
    // ========================================================================
    {
      id: 'quest_check_in',
      text: "*Samuel looks up expectantly as you approach.* You're back. *He sets down his tools.* How goes the task I set you?",
      choices: [
        {
          text: 'Still working on it.',
          nextNodeId: 'still_working',
        },
        {
          text: '*Report on the scouting mission*',
          nextNodeId: 'scout_report',
          conditions: [{ type: 'flag_set', target: 'scout_mission_complete' }],
        },
        {
          text: "I need more information about what I'm doing.",
          nextNodeId: 'more_info_quest',
        },
      ],
    },

    {
      id: 'still_working',
      text: "*He nods patiently.* The mountain don't give up its secrets quick. Take the time you need, but don't take too long. There's people dependin' on what you learn.",
      choices: [
        {
          text: "I understand. I'll be back soon.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'more_info_quest',
      text: "*He considers for a moment.* What do you need to know? I'll tell you what I can without riskin' the whole operation.",
      choices: [
        {
          text: 'Tell me more about the supply route.',
          nextNodeId: 'supply_route_info',
        },
        {
          text: 'Who might be watching us?',
          nextNodeId: 'watchers_info',
        },
        {
          text: 'What happens if the supplies dont get through?',
          nextNodeId: 'supplies_stakes',
        },
      ],
    },

    {
      id: 'supply_route_info',
      text: "*He traces a path in the air with his finger.* The passage through the old copper workings connects the Hollow to our suppliers in the lowlands. It's tight in places, dark as a grave, and unstable near the old shafts. But it keeps us alive. Without it, IVRC's blockade would've starved us out years ago.",
      choices: [
        {
          text: 'I understand. Thank you.',
          nextNodeId: null,
        },
      ],
    },

    // ========================================================================
    // ADDITIONAL STORY NODES
    // ========================================================================
    {
      id: 'honest_exchange',
      text: "*He regards you with something like respect.* Honesty. That's currency too - rarer than gold in these parts. *He gestures toward the Hollow.* Come on, then. I'll show you around. But understand - you're a guest, not family. Not yet. Earn your place, and maybe that changes.",
      onEnterEffects: [{ type: 'change_reputation', value: 15 }],
      choices: [
        {
          text: "I'll earn it.",
          nextNodeId: 'earn_place',
        },
      ],
    },

    {
      id: 'earn_place',
      text: "*He leads you into the settlement.* Every soul here has lost somethin' to IVRC. Land, family, futures. We work our own claims, share what we find, protect each other. It ain't much, but it's ours. No company man tells us when to dig or how deep.",
      choices: [
        {
          text: "That's worth fighting for.",
          nextNodeId: 'worth_fighting',
        },
        {
          text: 'How long can you hold out against IVRC?',
          nextNodeId: 'hold_out',
        },
      ],
    },

    {
      id: 'worth_fighting',
      text: "*He stops walking, facing the mountain peaks.* It is. But fightin's the question, ain't it? Dolores fights with guns and dynamite. I fight with stubbornness and hope. *He turns back to you.* What kind of fighter are you?",
      choices: [
        {
          text: 'The kind that finishes what they start.',
          nextNodeId: 'finisher',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: "I'm still figuring that out.",
          nextNodeId: 'figuring_out',
        },
      ],
    },

    {
      id: 'finisher',
      text: "*A gleam of approval enters his eyes.* Good answer. The mountain respects persistence. Ore don't reveal itself to impatient men. *He resumes walking.* Stick around. Help out where you can. We'll see what you're made of.",
      choices: [
        {
          text: "I'll prove myself.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'resistance_origin',
      text: "*He sits heavily on a rock, suddenly looking every one of his years.* The Freeminers started before my time. My father was one of the founders - independent prospectors who refused to sell out to the first company with deep pockets. I carried on his work. Thomas was supposed to carry on mine. *He stares at nothing.* Now there's just Maggie.",
      choices: [
        {
          text: 'And the movement continues through her?',
          nextNodeId: 'maggie_future',
        },
        {
          text: "Then we have to win this. For all of them.",
          nextNodeId: 'win_for_them',
        },
      ],
    },

    {
      id: 'maggie_future',
      text: "*He shakes his head slowly.* I hope she never has to fight this battle. That's the whole point, ain't it? We struggle now so the next generation don't have to. If those documents ever see the light of day... maybe Maggie can grow up in a world where IVRC is just a bad memory.",
      choices: [
        {
          text: "Let's make that happen.",
          nextNodeId: 'make_it_happen',
        },
      ],
    },

    {
      id: 'make_it_happen',
      text: "*He rises, a new purpose in his movements.* You keep sayin' the right things. Time to see if you can do 'em. There's work needs doin' in the Hollow. Help out. Prove you're one of us. Then we'll talk more about what comes next.",
      onEnterEffects: [{ type: 'start_quest', target: 'freeminer_trust' }],
      choices: [
        {
          text: 'Point me in the right direction.',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    // ========================================================================
    // DEFAULT GREETING
    // ========================================================================
    {
      id: 'default_greeting',
      text: "*Samuel glances up from his work, neither welcoming nor hostile.* You again. The mountain keeps sendin' you back. *He sets down his tools.* What is it this time?",
      choices: [
        {
          text: 'Just checking in.',
          nextNodeId: 'hollow_status',
        },
        {
          text: 'I have news about IVRC.',
          nextNodeId: 'ivrc_news',
        },
        {
          text: 'I wanted to talk more about the documents.',
          nextNodeId: 'documents_revisit',
          conditions: [{ type: 'flag_set', target: 'heard_about_documents' }],
        },
      ],
    },

    {
      id: 'ivrc_news',
      text: "*His attention sharpens immediately.* IVRC. What have you heard?",
      choices: [
        {
          text: 'Victoria Ashworth is in the territory.',
          nextNodeId: 'ashworth_news',
          conditions: [{ type: 'flag_set', target: 'warned_about_ashworth' }],
        },
        {
          text: "They're tightening their grip on the supply routes.",
          nextNodeId: 'supply_pressure',
        },
        {
          text: 'Word is they know about the documents.',
          nextNodeId: 'documents_known',
        },
      ],
    },

    {
      id: 'ashworth_news',
      text: "*His face goes pale.* Ashworth. Thorne's enforcer. *He begins packing things away from his workbench.* If she's here, it means they're done playin' games. She doesn't negotiate. She eliminates problems. Permanently. *He looks at you sharply.* We need to move faster. Much faster.",
      onEnterEffects: [
        { type: 'set_flag', target: 'ashworth_threat_known' },
        { type: 'change_reputation', value: 15 },
      ],
      choices: [
        {
          text: 'Then we get the documents out now.',
          nextNodeId: 'documents_time',
          conditions: [{ type: 'flag_set', target: 'knows_document_location' }],
        },
        {
          text: 'How do we prepare?',
          nextNodeId: 'ashworth_preparation',
        },
      ],
    },

    {
      id: 'documents_revisit',
      text: "*He looks around carefully before speaking.* The documents. The key to everything. What do you want to know that I ain't already told you?",
      choices: [
        {
          text: 'I think I can get them to honest hands.',
          nextNodeId: 'honest_hands_plan',
        },
        {
          text: "Have you considered working with Diamondback on this?",
          nextNodeId: 'diamondback_help_suggest',
        },
        {
          text: 'What if IVRC finds them first?',
          nextNodeId: 'ivrc_finds_documents',
        },
      ],
    },

    {
      id: 'honest_hands_plan',
      text: "*Interest sparks in his eyes.* You have a plan? Tell me. Who would you trust with proof that could bring down an empire?",
      choices: [
        {
          text: 'A federal marshal, outside IVRC influence.',
          nextNodeId: 'federal_marshal_plan',
        },
        {
          text: 'Newspapers back east - multiple copies to multiple papers.',
          nextNodeId: 'newspaper_plan',
        },
        {
          text: 'Reform politicians in Washington.',
          nextNodeId: 'politician_plan',
        },
      ],
    },

    {
      id: 'federal_marshal_plan',
      text: "*He nods slowly.* A federal man. That could work - they ain't paid by IVRC, and they've got the power to act. Problem is gettin' to one without IVRC's people noticin'. They watch the roads, the trains, the telegraph. *He thinks.* But if you could slip through their net...",
      choices: [
        {
          text: "That's where Diamondback's skills could help.",
          nextNodeId: 'diamondback_skills',
        },
        {
          text: "I know routes they don't watch.",
          nextNodeId: 'secret_routes',
        },
      ],
    },

    {
      id: 'newspaper_plan',
      text: "*A spark of hope lights his eyes.* Multiple papers. That's smart - kill one messenger, another gets through. And once it's in print... *He almost smiles.* No amount of bribery can unwrite the truth. The whole country would know what Thorne's done.",
      onEnterEffects: [{ type: 'set_flag', target: 'newspaper_plan_discussed' }],
      choices: [
        {
          text: 'The New York papers would print anything scandalous enough.',
          nextNodeId: 'new_york_papers',
        },
        {
          text: 'We need to time it right - hit them when they cant respond.',
          nextNodeId: 'timing_discussion',
        },
      ],
    },

    // ========================================================================
    // FACTIONS UNITED PATH
    // ========================================================================
    {
      id: 'factions_united',
      text: "*Samuel's eyes widen.* You... you actually did it? Dolores agreed to work with me? *He sits down heavily.* After all these years... all the blood between us...",
      expression: 'shocked',
      choices: [
        {
          text: 'She understands that unity is the only path to victory.',
          nextNodeId: 'unity_victory',
        },
        {
          text: "She still wants to fight, but she'll follow your lead on the documents.",
          nextNodeId: 'follow_lead',
        },
      ],
    },

    {
      id: 'unity_victory',
      text: "*He's quiet for a long moment.* You've done somethin' I couldn't do in twenty years of trying. Brought together the mountain and the canyon. *He looks up with renewed purpose.* If we're truly united... then it's time. Time to end this once and for all.",
      onEnterEffects: [
        { type: 'set_flag', target: 'factions_unified' },
        { type: 'change_reputation', value: 50 },
      ],
      choices: [
        {
          text: "Then let's plan our attack.",
          nextNodeId: 'plan_attack',
        },
      ],
    },

    {
      id: 'plan_attack',
      text: "*He pulls out a worn map.* The documents are the weapon. Dolores's riders can create distractions while our people move the papers. Sheriff Cole - if he's with us - can provide cover on the legal side. And you... *he meets your eyes* ...you carry the torch. You're the one they won't expect.",
      choices: [
        {
          text: "I'm ready.",
          nextNodeId: 'final_mission',
        },
        {
          text: 'What about protecting the Hollow while this happens?',
          nextNodeId: 'protect_hollow',
        },
      ],
    },

    // ========================================================================
    // MISC SUPPORT NODES
    // ========================================================================
    {
      id: 'whats_next',
      text: "*He considers.* You've proven you can scout. Now we need to know if you can think. IVRC's been probin' our defenses - testin' for weaknesses. I need someone to figure out their pattern. Where they're watchin', when they move, what they're after. Can you do that?",
      onEnterEffects: [{ type: 'advance_quest', target: 'freeminer_trust', stringValue: 'intel_mission' }],
      choices: [
        {
          text: "Intelligence gathering. I can do that.",
          nextNodeId: 'intel_accepted',
        },
        {
          text: 'Is there anything more direct I can do?',
          nextNodeId: 'more_direct',
        },
      ],
    },

    {
      id: 'intel_accepted',
      text: "*He nods approvingly.* Good. Watch their patrols. Note their timing. Find out who's leadin' 'em if you can. Information's worth more than gold up here - it keeps people alive.",
      choices: [
        {
          text: "I'll report back with everything I learn.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'information_direct',
      text: "*His expression closes off.* Information's dangerous. Folks who ask questions about IVRC's crimes tend to have accidents. Sudden-like. *He steps back.* If you know somethin', speak plain. If you're fishin', you best swim elsewhere.",
      choices: [
        {
          text: "I have a letter that mentions the worker's symbol.",
          nextNodeId: 'gear_symbol_reveal',
          conditions: [{ type: 'has_item', target: 'mysterious_letter' }],
        },
        {
          text: 'I just want to help.',
          nextNodeId: 'help_cause_skeptical',
        },
      ],
    },

    {
      id: 'own_reasons',
      text: "*He crosses his arms, studying you.* Everyone's got reasons. IVRC's made enemies from here to the Pacific. Question is whether your reasons align with mine, or just run parallel. *His eyes narrow.* A parallel road can turn against you when you least expect it.",
      choices: [
        {
          text: 'Our roads point the same direction - toward IVRC falling.',
          nextNodeId: 'same_direction',
        },
        {
          text: "I don't want anything from you but a chance to help.",
          nextNodeId: 'prove_yourself_intro',
        },
      ],
    },

    {
      id: 'same_direction',
      text: "*He uncrosses his arms, some of the tension leaving his shoulders.* Maybe they do. But I've been fooled before by folks who said the right words. Words are easy. Deeds are what matter. You want my trust? Earn it.",
      choices: [
        {
          text: 'Tell me what needs doing.',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'diamondback_mention',
      text: "*His expression flickers between surprise and wariness.* Dolores sent you? *He lets out a heavy breath.* We ain't seen eye to eye in years. But if she thought you should come to me... *He studies you anew.* Show me this letter.",
      choices: [
        {
          text: '*Hand over the letter*',
          nextNodeId: 'show_letter_samuel',
        },
        {
          text: "She also mentioned you disagree on methods.",
          nextNodeId: 'diamondback_disagreement',
        },
      ],
    },

    {
      id: 'shared_loss_thomas',
      text: "*His weathered face softens with shared grief.* Then you understand. You understand what it costs. *He moves to sit beside you.* IVRC thinks pain makes people weak. But it can also make 'em strong. Strong enough to endure. Strong enough to wait for the right moment.",
      onEnterEffects: [{ type: 'change_reputation', value: 15 }],
      choices: [
        {
          text: 'And when that moment comes?',
          nextNodeId: 'right_moment',
        },
        {
          text: 'Tell me more about your son.',
          nextNodeId: 'son_story_full',
        },
      ],
    },

    {
      id: 'right_moment',
      text: "*Fire kindles in his old eyes.* When that moment comes, we strike. Not with bullets - Dolores can have those - but with truth. Truth sharp enough to cut through all their lies. Documents and proof that show the world what IVRC really is. *He leans close.* I've been waitin' for that moment for years. Maybe you're a sign it's finally comin'.",
      choices: [
        {
          text: "Then let me help bring it about.",
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'why_not_violence',
      text: "*He looks toward the mountain peaks.* I've thought about it. God knows I've thought about it. Take up a rifle, ride down into Junction City, put a bullet in Cornelius Thorne's heart. *His voice hardens.* But then what? They'd call us murderers. Hang my people as accomplices. IVRC would use it to justify crushin' every independent miner in the territory. Violence makes martyrs - and Thorne ain't worth martyrdom.",
      choices: [
        {
          text: 'The documents are a better weapon.',
          nextNodeId: 'truth_weapon',
        },
        {
          text: 'Diamondback would disagree.',
          nextNodeId: 'diamondback_disagreement',
        },
      ],
    },

    {
      id: 'unexpected_way',
      text: "*Hope flickers in his eyes for a moment.* A new path. Someone they ain't watchin'. *He studies you intently.* You ain't IVRC - I can see that much. And you found your way here despite their patrols. Maybe... maybe you could slip through where others couldn't.",
      choices: [
        {
          text: "I've gotten through tighter spots.",
          nextNodeId: 'tighter_spots',
        },
        {
          text: 'First I need to earn your trust.',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'tighter_spots',
      text: "*He almost smiles.* Confidence. I like that. But confidence without proof is just hot air. Show me you can do what you say, and we'll talk more. The documents have waited this long - they can wait a bit longer for the right carrier.",
      onEnterEffects: [{ type: 'start_quest', target: 'freeminer_trust' }],
      choices: [
        {
          text: "I'll prove myself.",
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'middle_path',
      text: "*He's quiet for a long time.* A middle path. Between my patience and her fire. *He shakes his head slowly.* I've dreamed of it. A way to bring IVRC down without more blood on my hands. If you think you can find that path... I'd give almost anythin' to walk it.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_wants_middle_path' }],
      choices: [
        {
          text: "Help me understand both sides, and I'll try.",
          nextNodeId: 'understand_both_sides',
        },
      ],
    },

    {
      id: 'understand_both_sides',
      text: "*He nods slowly.* Fair enough. You know my side now - the documents, the peaceful way, the waitin' for the right moment. Dolores's side... she'll tell you herself if she ain't already. Raids and revenge and makin' 'em bleed. Find the thread that ties us together, and you'll have found somethin' precious.",
      choices: [
        {
          text: "I'll find it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'will_anyone_listen',
      text: "*He sighs heavily.* That's the question, ain't it? Folks in the east, they hear about the frontier and they think outlaws and savages. They don't know about miners workin' sixteen-hour days for company scrip. They don't know about children breathin' coal dust 'til their lungs give out. *His voice strengthens.* But show 'em proof? Names, dates, orders signed by Thorne himself? Then they'll have to listen.",
      choices: [
        {
          text: 'Then we get that proof into their hands.',
          nextNodeId: 'get_proof_out',
        },
      ],
    },

    {
      id: 'get_proof_out',
      text: "*Determination settles over his features.* We do. And when we do, the whole rotten structure comes crashin' down. *He meets your eyes.* But not yet. Not until we're sure it'll work. Too many have died for these papers already. The next attempt has to succeed.",
      choices: [
        {
          text: "Then let's make sure it does.",
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    // Stub nodes for referenced but not fully implemented branches
    {
      id: 'private_cause',
      text: "*He considers you for a long moment, then nods slowly.* A man's reasons are his own. Fair enough. But understand - I don't trust easy, and I don't trust quick. You want to help? You'll have to prove it without words.",
      choices: [
        {
          text: 'Tell me what needs doing.',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'stop_them_together',
      text: "*Something like hope sparks in his tired eyes.* Together. That's a word that means somethin' up here. *He extends a calloused hand.* You've suffered like we have. That makes you kin, in a way. Welcome to the Hollow, stranger.",
      onEnterEffects: [{ type: 'change_reputation', value: 20 }],
      choices: [
        {
          text: '*Shake his hand* Thank you, Samuel.',
          nextNodeId: 'proper_meeting',
        },
      ],
    },

    {
      id: 'make_them_pay_peaceful',
      text: "*His jaw tightens.* Not with blood. That's Dolores's way, and it only breeds more suffering. *He looks at you intently.* We make them pay with truth. Expose them. Ruin their reputation. Make their investors flee and their politicians abandon them. That's a death that lasts longer than any bullet wound.",
      choices: [
        {
          text: 'And the documents make that possible.',
          nextNodeId: 'documents_contents',
        },
      ],
    },

    {
      id: 'sacrifice_meaning',
      text: "*He stares into the middle distance.* Has to. If it don't... then Thomas died for nothing. And I won't accept that. *He turns back to you.* Help me make his death mean somethin'. Help me bring down the empire that killed him.",
      choices: [
        {
          text: 'Together, we will.',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'meet_maggie_later',
      text: "*His expression warms slightly.* Maybe someday. If you prove yourself. She's a good judge of character, that one. Takes after her grandmother. *He pauses.* Thomas's mother... she passed the winter before he did. At least she never had to bury her son.",
      choices: [
        {
          text: "I'm sorry. So much loss.",
          nextNodeId: 'so_much_loss',
        },
      ],
    },

    {
      id: 'so_much_loss',
      text: "*He nods slowly.* The mountain takes its toll. But it also gives. Hope. Community. The chance to live free. *He straightens.* That's what we're fightin' for. Not revenge - freedom. For Maggie. For all of 'em.",
      choices: [
        {
          text: 'Let me help you protect that freedom.',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'word_given',
      text: "*He shakes your hand firmly.* Then we understand each other. The road ahead won't be easy, but... *a ghost of a smile* ...neither was the road that brought you here. I reckon you can handle it.",
      onEnterEffects: [{ type: 'start_quest', target: 'freeminer_trust' }],
      choices: [
        {
          text: 'Where do we start?',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'anonymous_letter',
      text: "*He takes the letter carefully, studying the symbol.* The gear. The old mark of the Coalition. *His hands tremble slightly.* Whoever sent this... they're takin' a terrible risk. This symbol is death warrant in IVRC country. And they sent it to a stranger?",
      choices: [
        {
          text: 'Maybe because a stranger could move unseen.',
          nextNodeId: 'move_unseen',
        },
        {
          text: 'Do you know who might have sent it?',
          nextNodeId: 'who_sent_it',
        },
      ],
    },

    {
      id: 'move_unseen',
      text: "*Understanding dawns in his eyes.* Clever. A new face, no history, no connections IVRC would track. *He hands the letter back.* Whoever sent this is smart. And desperate. They're callin' for help in the only way they can.",
      choices: [
        {
          text: 'Will you help me find them?',
          nextNodeId: 'find_sender',
        },
      ],
    },

    {
      id: 'find_sender',
      text: "*He's quiet for a moment.* I might have an idea who this is. But I need to know more about you first. Trust works both ways in these mountains. Help my people, and I'll help you find your answers.",
      onEnterEffects: [{ type: 'start_quest', target: 'freeminer_trust' }],
      choices: [
        {
          text: "It's a deal.",
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'who_sent_it',
      text: "*His face reveals nothing, but his grip on the letter tightens.* There are... possibilities. Old friends I thought were dead or gone. But I won't speak their names until I know you better. Names can kill in the wrong ears.",
      choices: [
        {
          text: 'How can I prove myself trustworthy?',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'help_hollow',
      text: "*He gestures toward the settlement.* Always somethin' needs doin'. Mining, haulin', keepin' watch. But what I need most is eyes and ears outside the Hollow. Someone who can move in places we can't without bein' recognized.",
      choices: [
        {
          text: 'I can do that.',
          nextNodeId: 'outside_eyes',
        },
      ],
    },

    {
      id: 'outside_eyes',
      text: "*He nods approvingly.* Good. Keep your ears open in Dusty Springs. Watch who IVRC's men talk to. Notice what they're buyin', where they're goin'. Every bit of information helps us stay one step ahead.",
      choices: [
        {
          text: "I'll report anything useful.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'raid_distraction',
      text: "*He grimaces.* Distraction, yes. And danger. Every raid brings more attention to this territory. More Pinkertons, more enforcers. Dolores thinks she's helpin', and maybe she is - but she's also makin' this war hotter. *He shakes his head.* A fire that burns too bright burns out quick.",
      choices: [
        {
          text: 'Then we need to end this before it burns out of control.',
          nextNodeId: 'end_quickly',
        },
      ],
    },

    {
      id: 'end_quickly',
      text: "*His eyes meet yours.* Amen to that. The documents are the key. Get them to honest hands, and this all ends. Thorne goes down, IVRC crumbles, and maybe - just maybe - my people can finally live in peace.",
      choices: [
        {
          text: "Then let's make it happen.",
          nextNodeId: 'documents_time',
          conditions: [{ type: 'flag_set', target: 'knows_document_location' }],
        },
        {
          text: 'First I need to know where the documents are.',
          nextNodeId: 'documents_discussion',
          conditions: [{ type: 'flag_set', target: 'heard_about_documents' }],
        },
      ],
    },

    {
      id: 'documents_end_it',
      text: "*He looks at you sharply.* You know about the documents? *He lowers his voice.* That knowledge makes you dangerous - to us and to IVRC. Where did you hear about them?",
      choices: [
        {
          text: 'Diamondback mentioned them.',
          nextNodeId: 'diamondback_told_me',
        },
        {
          text: 'Sheriff Cole talked about evidence that was supposedly destroyed.',
          nextNodeId: 'cole_mentioned_evidence',
        },
        {
          text: 'The letter that brought me here hinted at them.',
          nextNodeId: 'letter_hint',
        },
      ],
    },

    {
      id: 'diamondback_told_me',
      text: "*His expression flickers.* Dolores. *He sighs.* She means well, but she talks too freely sometimes. Those documents are the most dangerous secret in this territory. IVRC would burn the whole mountain to find them.",
      onEnterEffects: [{ type: 'set_flag', target: 'heard_about_documents' }],
      choices: [
        {
          text: "That's why we need to use them before they're found.",
          nextNodeId: 'use_before_found',
        },
      ],
    },

    {
      id: 'use_before_found',
      text: "*He nods slowly.* You're not wrong. But the timing has to be right. We move too early, IVRC intercepts us. Too late, and they find the papers first. *He studies you.* When the moment comes, I'll need someone I can trust to carry them out. Could that be you?",
      choices: [
        {
          text: "Yes. Whatever it takes.",
          nextNodeId: 'whatever_it_takes',
        },
      ],
    },

    {
      id: 'whatever_it_takes',
      text: "*Something changes in his eyes - hope mixed with fear.* Strong words. I'll hold you to 'em. But first, prove yourself with smaller tasks. Help my people. Show me what kind of person you are when the stakes aren't so high. Then we'll talk about the documents.",
      onEnterEffects: [{ type: 'start_quest', target: 'freeminer_trust' }],
      choices: [
        {
          text: 'I understand. Where do I start?',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'cole_mentioned_evidence',
      text: "*He stiffens.* Cole. The sheriff knows more than he lets on. *He considers.* If he sent you... maybe he's finally choosin' a side. Or maybe it's a trap.",
      choices: [
        {
          text: "He didn't send me. But he cares about justice.",
          nextNodeId: 'cole_justice',
        },
      ],
    },

    {
      id: 'cole_justice',
      text: "*He softens slightly.* Justice. That's a rare thing to care about these days. Most lawmen just care about their pay. *He sighs.* Alright. I won't hold Cole against you. But you still need to earn your place here.",
      choices: [
        {
          text: 'How can I do that?',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'letter_hint',
      text: "*His attention sharpens.* The letter mentioned the documents? *He holds out his hand.* Show me. Exactly what it said.",
      choices: [
        {
          text: '*Show him the letter*',
          nextNodeId: 'show_letter_samuel',
        },
      ],
    },

    {
      id: 'letter_meaning_samuel',
      text: "*He reads the letter again, more slowly.* The gear symbol was the mark of the Worker's Coalition - the first movement against IVRC, before Thorne crushed us. If someone's using it again... *He looks up.* They're calling for help. And they sent you to find it.",
      choices: [
        {
          text: 'What kind of help?',
          nextNodeId: 'help_type',
        },
        {
          text: 'Who would still use that symbol?',
          nextNodeId: 'who_uses_symbol',
        },
      ],
    },

    {
      id: 'help_type',
      text: "*He folds the letter carefully.* The kind only a stranger can provide. Someone with no history IVRC can track. No family they can threaten. No ties that bind you to one place or faction. *His voice drops.* They need a courier. Someone to carry the truth out of this valley.",
      choices: [
        {
          text: 'The documents.',
          nextNodeId: 'yes_the_documents',
        },
      ],
    },

    {
      id: 'yes_the_documents',
      text: "*He nods heavily.* Yes. The documents. Proof of everything IVRC has done. Murder, bribery, theft. All of it in black and white. *He meets your eyes.* If you're the one this letter was meant for... then maybe the time has finally come.",
      onEnterEffects: [{ type: 'set_flag', target: 'heard_about_documents' }],
      choices: [
        {
          text: "I'm ready to help.",
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'who_uses_symbol',
      text: "*He's quiet for a long moment.* Only a handful of us survive from those days. Most are here, in the Hollow. Some scattered to other territories. And some... *his voice catches* ...some disappeared. Presumed dead. But maybe...",
      choices: [
        {
          text: 'Maybe not dead after all.',
          nextNodeId: 'not_dead_after_all',
        },
      ],
    },

    {
      id: 'not_dead_after_all',
      text: "*Hope and pain war across his face.* My brother Jacob. He disappeared ten years ago. IVRC said he was killed, but we never found his body. If this is his hand... if he's still alive... *He grips your arm.* Will you help me find out?",
      onEnterEffects: [{ type: 'start_quest', target: 'find_jacob' }],
      choices: [
        {
          text: 'Of course. Where do we start?',
          nextNodeId: 'jacob_search_start',
        },
      ],
    },

    {
      id: 'jacob_search_start',
      text: "*He collects himself.* The letter came from somewhere. Find out where. Talk to people who might have seen a stranger passin' through. Look for other traces of the gear symbol. *He pauses.* But be careful. If Jacob's alive and hiding, there's a reason. Don't lead IVRC to him.",
      choices: [
        {
          text: "I'll be careful. I'll find your brother.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'find_jacob_accept',
      text: "*Gratitude floods his weathered features.* Thank you. You don't know what this means to me. *He wipes his eyes.* Jacob was always the clever one. If he's been hiding this long... he'll have safeguards. Puzzles, maybe. Tests to prove you're not IVRC. Be ready for anything.",
      choices: [
        {
          text: "I understand. I'll find him.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'jacob_info',
      text: "*His voice softens with memory.* Jacob was younger than me by five years. Quick-minded. Good with words and numbers. He kept the records for the Coalition - names, dates, evidence. *His expression darkens.* When IVRC came for us, he ran with the most damning documents. They said they caught him in a ravine. I never believed it.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_jacob_background' }],
      choices: [
        {
          text: 'If he had the documents, and he survived...',
          nextNodeId: 'jacob_documents',
        },
      ],
    },

    {
      id: 'jacob_documents',
      text: "*He nods fiercely.* Then he's been guardin' them all these years. Waiting for the right moment. The right person. *He looks at you intently.* You. He sent for you. Find him, and you find everythin' we need to bring IVRC down.",
      choices: [
        {
          text: "Then that's exactly what I'll do.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'move_carefully',
      text: "*He nods approvingly.* Good. You understand. IVRC's eyes are everywhere, but they can't watch what they don't know exists. Stay in the shadows. Ask questions carefully. And trust no one until you're sure.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_advised_caution' }],
      choices: [
        {
          text: 'Sound advice. Thank you, Samuel.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'jacob_purpose',
      text: "*Samuel considers.* Jacob always had a plan. If he's reached out now, after all these years... it means somethin's changed. Maybe he's found a way to get the documents out safely. Maybe he's found someone who can use them. *He looks at you.* Maybe he found you.",
      choices: [
        {
          text: 'Then I need to find him and learn what he knows.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'freeminer_numbers',
      text: "*He looks around the small settlement.* Couple dozen here in the Hollow. Another score scattered across the mountains, workin' independent claims. Not an army. But we've got somethin' IVRC don't - we've got nothin' left to lose.",
      choices: [
        {
          text: "That's a dangerous kind of strength.",
          nextNodeId: 'dangerous_strength',
        },
        {
          text: 'Is that enough to make a difference?',
          nextNodeId: 'enough_difference',
        },
      ],
    },

    {
      id: 'dangerous_strength',
      text: "*He nods slowly.* Dangerous to us. Dangerous to them. A man with nothin' to lose don't back down easy. IVRC's learned that the hard way. They can threaten and they can burn, but they can't break what's already been shattered.",
      choices: [
        {
          text: 'Yet you still choose peace over violence.',
          nextNodeId: 'peace_choice',
        },
      ],
    },

    {
      id: 'peace_choice',
      text: "*His gaze goes distant.* Because I've seen what violence costs. Not just dead bodies - dead souls. Men who started out good, twisted into killers by the fight. *He shakes his head.* I won't let IVRC take that from us too. We win clean, or we don't win at all.",
      choices: [
        {
          text: 'A hard line to walk.',
          nextNodeId: 'hard_line',
        },
      ],
    },

    {
      id: 'hard_line',
      text: "*A ghost of a smile.* The hardest. But that's what separates us from them. IVRC wins at any cost. We win right, or we don't win. *He looks at you.* If you want to walk that line with us, you're welcome. But understand - it's a path without shortcuts.",
      choices: [
        {
          text: "I understand. I'll walk it.",
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'enough_difference',
      text: "*He shrugs.* Numbers ain't everything. David didn't need an army to beat Goliath - he needed one good stone. The documents are our stone. Get them to the right people, and all of IVRC's money and men won't save them.",
      choices: [
        {
          text: "Then let's find that stone.",
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'victory_definition',
      text: "*He stares at the mountain peaks.* Victory? *His voice is quiet.* My son alive. The miners freed from debt bondage. Our claims recognized by law. IVRC's crimes exposed and punished. *He laughs bitterly.* I'd settle for the last one. Can't bring back the dead, but we can stop 'em from makin' more.",
      choices: [
        {
          text: "That's a victory worth fighting for.",
          nextNodeId: 'worth_fighting',
        },
      ],
    },

    {
      id: 'resistance_story',
      text: "*Fire kindles in his old eyes.* Some accepted. The ones who were scared, or tired, or had families to protect. I don't blame 'em. But some of us... we'd seen too much. Lost too much. We came up here to the mountains, staked our own claims, and told IVRC to go to hell.",
      choices: [
        {
          text: "And they've been trying to crush you ever since.",
          nextNodeId: 'crush_attempt',
        },
      ],
    },

    {
      id: 'crush_attempt',
      text: "*He nods grimly.* Every which way they can. Cut off our supplies. Send claim jumpers dressed as bandits. Poison the law against us. *His voice hardens.* But we're still here. Still mining. Still free. And as long as we're breathin', IVRC hasn't won.",
      choices: [
        {
          text: 'How can I help you stay free?',
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'hold_out',
      text: "*He considers the question seriously.* Depends. On the weather, the ore, how hard IVRC pushes. We've made it this long by bein' stubborn and smart. But they're gettin' more aggressive. Sendin' more men. *His jaw tightens.* Eventually, somethin's gotta give.",
      choices: [
        {
          text: "Then we need to act before that happens.",
          nextNodeId: 'act_now',
        },
      ],
    },

    {
      id: 'act_now',
      text: "*He nods slowly.* You're right. The documents have sat in the dark long enough. But I need to trust whoever carries them. Trust that they won't sell 'em, won't lose 'em, won't lead IVRC right to them. *He looks at you steadily.* Are you that person?",
      choices: [
        {
          text: "I'll prove I am.",
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'figuring_out',
      text: "*He nods, a hint of approval in his eyes.* Honest answer. Most folks come in here already sure they've got all the answers. *He picks up his tools.* Stick around. Watch. Learn. You'll figure out what kind of fighter you are soon enough.",
      choices: [
        {
          text: "I'll do that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'expose_right_way',
      text: "*Hope flickers in his weathered face.* The right way. Truth and evidence and honest courts. It's a longer road, a harder road. But it's the only one that leads somewhere worth goin'. *He extends his hand.* Help me walk it?",
      choices: [
        {
          text: '*Shake his hand* Together.',
          nextNodeId: 'together_accepted',
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },

    {
      id: 'together_accepted',
      text: "*His grip is firm.* Then welcome to the Freeminers. Not as an outsider anymore - as one of us. *He releases your hand.* There's work to be done. Are you ready?",
      onEnterEffects: [{ type: 'set_flag', target: 'freeminer_accepted' }],
      choices: [
        {
          text: "Ready as I'll ever be.",
          nextNodeId: 'trust_quest_intro',
        },
      ],
    },

    {
      id: 'contingency_plan',
      text: "*His expression grows grim.* If they find me... Maggie knows the first clue to where the papers are. She don't know the whole truth - too dangerous - but she knows enough to get started. And now you know where they end up. Between the two of you...",
      choices: [
        {
          text: "We'll see this through. No matter what.",
          nextNodeId: 'no_matter_what',
        },
      ],
    },

    {
      id: 'no_matter_what',
      text: "*He clasps your shoulder.* I believe you will. For the first time in years... I believe it's actually gonna happen. *His voice drops to a whisper.* Thomas, if you're watchin'... we're finally gonna get 'em.",
      choices: [
        {
          text: "We will. I promise.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'right_time',
      text: "*He considers.* When we've got a clear path to honest hands. When IVRC's distracted or weakened. When you've gathered enough allies that they can't silence everyone at once. *His eyes sharpen.* You'll know. The mountain'll tell you when the moment's right.",
      choices: [
        {
          text: "I'll be ready when it comes.",
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const SamuelIronpickDialogues = [SamuelIronpickMainDialogue];
