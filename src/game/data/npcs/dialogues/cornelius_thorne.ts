/**
 * Cornelius Thorne - Dialogue Trees
 *
 * IVRC Regional Director - the main antagonist of Iron Frontier.
 * A cold, calculating businessman who genuinely believes he's bringing
 * civilization and progress to the frontier. Not cartoonishly evil -
 * he sees himself as the hero of his own story.
 *
 * Character Voice:
 * - Educated, Eastern accent
 * - Uses business metaphors
 * - Never raises voice - quiet menace
 * - Occasionally shows humanity (complicated villain)
 */

import type { DialogueTree } from '../../schemas/npc';

// ============================================================================
// INITIAL MEETING - Player summoned to his office
// ============================================================================

export const ThorneInitialMeeting: DialogueTree = {
  id: 'thorne_initial_meeting',
  name: 'Cornelius Thorne - Initial Meeting',
  description: 'First encounter with Thorne when player is summoned to his office',
  tags: ['ivrc_headquarters', 'main_quest', 'antagonist', 'act1'],

  entryPoints: [
    {
      nodeId: 'summoned_entry',
      conditions: [{ type: 'flag_set', target: 'summoned_by_thorne' }],
      priority: 10,
    },
    {
      nodeId: 'voluntary_entry',
      conditions: [{ type: 'first_meeting' }],
      priority: 5,
    },
  ],

  nodes: [
    // Summoned entry - player received summons
    {
      id: 'summoned_entry',
      text: "*A man in an immaculate three-piece suit stands with his back to you, gazing out floor-to-ceiling windows at the sprawling railroad yards below. His office smells of tobacco and old money. Without turning, he speaks in a measured, cultured voice.* Ah, you've arrived. Please, sit. I've been looking forward to this conversation.",
      expression: 'neutral',
      choices: [
        {
          text: '*Sit down*',
          nextNodeId: 'take_seat',
        },
        {
          text: "I'll stand, thank you.",
          nextNodeId: 'remain_standing',
        },
        {
          text: 'Why was I summoned here?',
          nextNodeId: 'why_summoned',
        },
      ],
    },

    {
      id: 'voluntary_entry',
      text: "*A secretary in crisp attire blocks your path.* Mr. Thorne doesn't see visitors without an appointment. *From within the office, a calm voice calls out.* Let them in, Margaret. I find unscheduled guests are often the most... illuminating. *She steps aside reluctantly.*",
      choices: [
        {
          text: '*Enter the office*',
          nextNodeId: 'enter_office',
        },
      ],
    },

    {
      id: 'enter_office',
      text: "*The office is a monument to wealth and power. Mahogany furniture, maps of the territory on every wall, and a man who radiates controlled authority. Cornelius Thorne turns from the window, appraising you with eyes like polished coal.* Bold. I appreciate boldness. Most people who enter this office do so trembling. You don't appear to be trembling. Why is that?",
      expression: 'curious',
      choices: [
        {
          text: "I've dealt with powerful men before.",
          nextNodeId: 'dealt_with_powerful',
        },
        {
          text: "Should I be?",
          nextNodeId: 'should_i_tremble',
        },
        {
          text: "I came to talk business, not to be intimidated.",
          nextNodeId: 'business_talk',
        },
      ],
    },

    {
      id: 'dealt_with_powerful',
      text: "*A ghost of a smile crosses his face.* Have you now? And yet here you stand, unbroken and unowned. That tells me one of two things - either you've been lucky, or you're more capable than you appear. *He gestures to a chair.* Sit. Let's discover which.",
      choices: [
        {
          text: '*Sit down*',
          nextNodeId: 'take_seat',
        },
        {
          text: "I don't need your assessment.",
          nextNodeId: 'defiant_response',
        },
      ],
    },

    {
      id: 'should_i_tremble',
      text: "*He chuckles - a dry, humorless sound.* Most do. I control the railroad, the mines, the water rights. In this territory, I am the closest thing to God that most people will ever meet. *He turns back to the window.* But trembling bores me. Please, sit. I have a proposition.",
      choices: [
        {
          text: '*Sit down*',
          nextNodeId: 'take_seat',
        },
        {
          text: "God doesn't usually make propositions.",
          nextNodeId: 'god_proposition',
        },
      ],
    },

    {
      id: 'god_proposition',
      text: "*His reflection in the window shows amusement.* Clever. But even God needed angels to carry out his work. And the devil, for that matter. The question is which role appeals to you more. *He turns.* Sit. Let's find out.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_finds_player_clever' }],
      choices: [
        {
          text: '*Sit down*',
          nextNodeId: 'take_seat',
        },
      ],
    },

    {
      id: 'business_talk',
      text: "*He raises an eyebrow.* Business. How refreshingly direct. Most people dance around their intentions with me, hoping I won't notice their fear. You stride in demanding commerce. *He moves to his desk.* I can work with directness. Please, sit.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_respects_directness' }],
      choices: [
        {
          text: '*Sit down*',
          nextNodeId: 'take_seat',
        },
      ],
    },

    {
      id: 'remain_standing',
      text: "*He finally turns, and you see his face fully - distinguished, silver at the temples, eyes that seem to calculate your worth in dollars and cents.* Interesting. Most people sit when I offer. Standing suggests either defiance or readiness to leave quickly. Which is it?",
      expression: 'calculating',
      choices: [
        {
          text: 'Defiance.',
          nextNodeId: 'admit_defiance',
        },
        {
          text: "I haven't decided if this conversation is worth my time.",
          nextNodeId: 'time_value',
        },
        {
          text: 'Neither. I simply prefer to stand.',
          nextNodeId: 'simple_preference',
        },
      ],
    },

    {
      id: 'admit_defiance',
      text: "*A thin smile.* Honesty. How novel. Most people who defy me do so while pretending loyalty. You'll find such pretense is wasted on me. *He sits behind his desk, steepling his fingers.* I value those who speak their minds. Even when what they speak is opposition. Tell me why you defy IVRC.",
      onEnterEffects: [{ type: 'change_reputation', value: -5 }],
      choices: [
        {
          text: "I've seen what your company does to people.",
          nextNodeId: 'seen_atrocities',
        },
        {
          text: "I don't defy the company. I defy you.",
          nextNodeId: 'personal_defiance',
        },
        {
          text: "Maybe I'm just stubborn.",
          nextNodeId: 'stubborn_response',
        },
      ],
    },

    {
      id: 'seen_atrocities',
      text: "*He leans back, entirely unperturbed.* 'Does to people.' An interesting phrase. What we do is build. Railroads, industry, civilization. Yes, the building has costs. Progress always does. The pyramids were not constructed by well-rested men. But they stand eternal. Would you tear down the pyramids because of how they were built?",
      expression: 'philosophical',
      choices: [
        {
          text: "The pyramids were tombs. Your progress is a graveyard.",
          nextNodeId: 'graveyard_response',
        },
        {
          text: "That's a convenient philosophy for those doing the building.",
          nextNodeId: 'convenient_philosophy',
        },
        {
          text: '*Remain silent*',
          nextNodeId: 'silent_response',
        },
      ],
    },

    {
      id: 'graveyard_response',
      text: "*For a moment, something flickers in his eyes - not guilt, but perhaps acknowledgment.* Eloquent. And not entirely wrong. Men have died building my railroad. I won't pretend otherwise. *He stands, moving to a cabinet.* But without that railroad, this territory remains wilderness. No schools. No hospitals. No law. Just dust and violence. Is that preferable?",
      expression: 'thoughtful',
      choices: [
        {
          text: "At least in wilderness, people are free.",
          nextNodeId: 'freedom_argument',
        },
        {
          text: "You could build without exploitation.",
          nextNodeId: 'build_without_exploitation',
        },
        {
          text: "You're justifying murder with infrastructure.",
          nextNodeId: 'murder_infrastructure',
        },
      ],
    },

    {
      id: 'freedom_argument',
      text: "*He pours two glasses of whiskey, sets one near you without asking.* Freedom. A beautiful word. Tell me - how free were the settlers who died of cholera before we built water systems? How free are the ranchers when bandits raid their herds? Freedom without order is chaos. And chaos has a much higher body count than I do.",
      choices: [
        {
          text: '*Take the whiskey*',
          nextNodeId: 'take_whiskey',
        },
        {
          text: '*Ignore the whiskey*',
          nextNodeId: 'ignore_whiskey',
        },
      ],
    },

    {
      id: 'take_whiskey',
      text: "*He raises his glass.* To civilization. Imperfect as it may be. *He drinks, studying you.* You're not what I expected. Most crusaders against IVRC are simpler creatures - angry, shortsighted. You think. That makes you either valuable or dangerous. *He sets down his glass.* I prefer valuable.",
      onEnterEffects: [{ type: 'set_flag', target: 'shared_drink_with_thorne' }],
      choices: [
        {
          text: "What exactly are you proposing?",
          nextNodeId: 'job_offer',
        },
        {
          text: "I'm not for sale.",
          nextNodeId: 'not_for_sale',
        },
      ],
    },

    {
      id: 'ignore_whiskey',
      text: "*He notices, shrugs.* Cautious. Also not what I expected. Most people would drink simply to appear cooperative. You don't feel the need to pretend. *He drinks alone.* That either means you're confident in your position, or you genuinely don't care what I think of you. Either way... intriguing.",
      onEnterEffects: [{ type: 'set_flag', target: 'refused_thorne_drink' }],
      choices: [
        {
          text: "Why did you summon me here?",
          nextNodeId: 'why_summoned_direct',
        },
        {
          text: "I don't play social games.",
          nextNodeId: 'no_games',
        },
      ],
    },

    {
      id: 'build_without_exploitation',
      text: "*He pauses mid-pour.* Could I? Truly? Pay every worker a living wage, ensure perfect safety, honor every land claim? *He shakes his head.* The railroad would never be built. The mines would never open. Progress requires... momentum. And momentum requires sacrifice. I simply ensure the sacrifice comes from those with the least to lose.",
      expression: 'matter_of_fact',
      choices: [
        {
          text: "The 'least to lose'? They lose their lives.",
          nextNodeId: 'lives_argument',
        },
        {
          text: "That's monstrous logic.",
          nextNodeId: 'monstrous_logic',
        },
      ],
    },

    {
      id: 'lives_argument',
      text: "*He meets your eyes steadily.* Lives that would otherwise be spent in poverty, obscurity, and quiet desperation. I offer them purpose. Employment. The chance to be part of something greater than themselves. Is that truly worse than dying of consumption in some Eastern slum?",
      choices: [
        {
          text: "You don't give them a choice.",
          nextNodeId: 'no_choice_argument',
        },
        {
          text: "At least they'd die on their own terms.",
          nextNodeId: 'own_terms',
        },
      ],
    },

    {
      id: 'no_choice_argument',
      text: "*A flicker of something - irritation? Doubt?* Choice is a luxury of the comfortable. I came from nothing myself, you know. A factory worker's son. I had no choices - only opportunities to seize or lose. *He straightens his cuffs.* I seized. They can too. Those with the will find their way up. The others... well.",
      onEnterEffects: [{ type: 'set_flag', target: 'learned_thorne_origin' }],
      choices: [
        {
          text: "You climbed up by stepping on others.",
          nextNodeId: 'stepped_on_others',
        },
        {
          text: "Not everyone starts with the same ladder.",
          nextNodeId: 'different_ladders',
        },
      ],
    },

    {
      id: 'stepped_on_others',
      text: "*His jaw tightens almost imperceptibly.* I climbed because I refused to be stepped on. Everything I have, I built. No one gave me charity. No one held my hand. *He turns to the window again.* This sentimentality bores me. Let's discuss why you're actually here.",
      expression: 'cold',
      choices: [
        {
          text: "You summoned me. You tell me.",
          nextNodeId: 'why_summoned_direct',
        },
      ],
    },

    {
      id: 'different_ladders',
      text: "*He pauses.* No. They don't. *For a moment, he seems almost human.* The world isn't fair. I didn't make it unfair. I simply... learned to navigate its unfairness. *He clears his throat.* But we're not here to debate philosophy. Let me tell you why I asked you to come.",
      expression: 'reflective',
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_moment_of_humanity' }],
      choices: [
        {
          text: "I'm listening.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'monstrous_logic',
      text: "*He doesn't flinch.* Monstrous. Perhaps. History is written by the victorious, and monsters are merely builders whose methods offended contemporary sensibilities. In fifty years, they'll name schools after me. In a hundred, no one will remember the cost. Only the result.",
      expression: 'unflinching',
      choices: [
        {
          text: "I'll remember.",
          nextNodeId: 'you_will_remember',
        },
        {
          text: "That's horrifying.",
          nextNodeId: 'horrifying_response',
        },
      ],
    },

    {
      id: 'you_will_remember',
      text: "*He smiles thinly.* Will you? Bold words. But memory is fragile, and individuals are mortal. IVRC will outlast us both. The railroad will carry generations who never knew our names. That is immortality. What will you leave behind?",
      choices: [
        {
          text: "Something better than graves.",
          nextNodeId: 'better_than_graves',
        },
        {
          text: "We'll see whose legacy lasts.",
          nextNodeId: 'legacy_challenge',
        },
      ],
    },

    {
      id: 'better_than_graves',
      text: "*He regards you with what might be respect.* Ambitious. I almost believe you mean it. *He moves back to his desk.* Which brings us to why I summoned you. You have potential. I'd rather it work for me than against me. Shall we discuss terms?",
      choices: [
        {
          text: "What are you offering?",
          nextNodeId: 'job_offer',
        },
        {
          text: "I don't work for tyrants.",
          nextNodeId: 'tyrant_refusal',
        },
      ],
    },

    {
      id: 'legacy_challenge',
      text: "*His eyes gleam with something like anticipation.* A challenge. I haven't had one of those in years. Everyone either bows or dies. You propose to... compete? *He sits back.* Fascinating. Tell me - would you like to compete from within IVRC, or from without?",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_sees_rival' }],
      choices: [
        {
          text: "What do you mean, 'from within'?",
          nextNodeId: 'job_offer',
        },
        {
          text: "I'll take my chances outside.",
          nextNodeId: 'outside_chances',
        },
      ],
    },

    {
      id: 'murder_infrastructure',
      text: "*He sets down the whiskey bottle with careful precision.* Murder implies passion. Criminality. What I do is... strategic necessity. Unpleasant, yes. But necessary. Would you prefer the territory remain lawless forever? Bandits on every road, starvation in every winter? I bring order.",
      expression: 'cold',
      choices: [
        {
          text: "Your 'order' benefits only you.",
          nextNodeId: 'order_benefits',
        },
        {
          text: "There are other ways to bring order.",
          nextNodeId: 'other_ways',
        },
      ],
    },

    {
      id: 'order_benefits',
      text: "*He spreads his hands.* Of course it benefits me. I'm not a saint. But it also benefits the merchants who use my railroad, the towns that spring up along my routes, the miners who earn wages where before there was only wilderness. Rising tides, as they say.",
      choices: [
        {
          text: "Some boats get sunk by those tides.",
          nextNodeId: 'sunk_boats',
        },
        {
          text: "Spoken like a true robber baron.",
          nextNodeId: 'robber_baron',
        },
      ],
    },

    {
      id: 'sunk_boats',
      text: "*A micro-expression of something crosses his face - annoyance? Acknowledgment?* Some do. That's the nature of progress. Not everyone survives the transition from one era to the next. The question is whether more prosper than perish. By that metric, I'm a remarkable success.",
      choices: [
        {
          text: "Tell that to the dead miners' families.",
          nextNodeId: 'dead_miners',
        },
        {
          text: "You've calculated human lives into equations.",
          nextNodeId: 'calculated_lives',
        },
      ],
    },

    {
      id: 'dead_miners',
      text: "*His face hardens.* I've endowed a hospital. Funded a school. Established pensions for workers' widows. More than any frontier employer has ever done. Don't pretend my conscience is entirely absent simply because my methods are efficient.",
      expression: 'defensive',
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_defensive_about_miners' }],
      choices: [
        {
          text: "Charity doesn't undo exploitation.",
          nextNodeId: 'charity_exploitation',
        },
        {
          text: "*Consider this new information*",
          nextNodeId: 'consider_charity',
        },
      ],
    },

    {
      id: 'charity_exploitation',
      text: "*He leans forward, and for the first time shows genuine emotion - anger, carefully controlled.* Then what would? Tell me. In your grand moral vision, what would I do differently? Pay every worker until IVRC bankrupts? Build nothing? Let the wilderness swallow this territory whole?",
      expression: 'angry',
      choices: [
        {
          text: "I don't have all the answers. But I know what's wrong.",
          nextNodeId: 'know_whats_wrong',
        },
        {
          text: "Maybe the territory doesn't need you.",
          nextNodeId: 'doesnt_need_you',
        },
      ],
    },

    {
      id: 'know_whats_wrong',
      text: "*He laughs bitterly.* Everyone knows what's wrong. It's the easiest thing in the world. But building solutions? Actually creating change? That requires compromise. Sacrifice. Getting one's hands dirty. I got mine dirty. Can you say the same?",
      choices: [
        {
          text: "I will.",
          nextNodeId: 'you_will',
        },
        {
          text: "Not yet. But I'm learning.",
          nextNodeId: 'still_learning',
        },
      ],
    },

    {
      id: 'you_will',
      text: "*He studies you for a long moment.* You might, at that. Which is precisely why I wanted to speak with you. *He gestures to the chair again.* Sit. Please. I have a proposition that may... interest you.",
      choices: [
        {
          text: '*Sit down*',
          nextNodeId: 'job_offer',
        },
        {
          text: "I've heard enough.",
          nextNodeId: 'heard_enough',
        },
      ],
    },

    {
      id: 'still_learning',
      text: "*Something in his expression softens slightly.* Learning. That's more honest than most would dare to be. I was learning once too. *He pauses, then shakes off the moment.* Sit. I have something you need to hear.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_respects_honesty' }],
      choices: [
        {
          text: '*Sit down*',
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'consider_charity',
      text: "*He notes your hesitation.* Surprised? I'm not a monster - merely a pragmatist. I know the cost of what I build. I try to... offset it, where possible. It's never enough. It's never clean. But it's more than nothing.",
      expression: 'tired',
      choices: [
        {
          text: "Why are you telling me this?",
          nextNodeId: 'why_telling_me',
        },
      ],
    },

    {
      id: 'why_telling_me',
      text: "*He looks almost surprised by the question.* Because you listened. Most people who enter this office are too busy hating me to hear anything I say. You... disagree with me, clearly. But you're listening. That's rare enough to be valuable.",
      choices: [
        {
          text: "Get to the point. What do you want?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'doesnt_need_you',
      text: "*His expression goes glacial.* The territory needed someone. I was simply the one willing to do what was necessary. Remove me, and another will take my place. Likely worse. At least I have... standards.",
      expression: 'cold',
      choices: [
        {
          text: "That's a convenient excuse.",
          nextNodeId: 'convenient_excuse',
        },
        {
          text: "Maybe. But you're still the one here now.",
          nextNodeId: 'here_now',
        },
      ],
    },

    {
      id: 'convenient_excuse',
      text: "*He shrugs.* Convenient or not, it's true. The forces of expansion are greater than any individual. If not IVRC, then Pacific Western. If not them, the government. Someone would have built the railroad. I simply ensured it was built well.",
      choices: [
        {
          text: "'Well' is a matter of perspective.",
          nextNodeId: 'perspective_response',
        },
      ],
    },

    {
      id: 'here_now',
      text: "*He nods slowly.* Yes. I am here now. And so are you. Which brings me to why I summoned you.",
      choices: [
        {
          text: "I'm listening.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'perspective_response',
      text: "*He inclines his head.* Indeed it is. From mine, the railroad is a marvel. From a displaced rancher's, perhaps less so. We are all prisoners of our perspectives. *He moves to sit behind his desk.* Let me offer you a new one.",
      choices: [
        {
          text: "Go on.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'calculated_lives',
      text: "*He doesn't deny it.* Mathematics is the language of progress. Every decision can be quantified - costs, benefits, acceptable losses. Sentiment is a luxury I cannot afford. If I wept for every casualty, I would accomplish nothing.",
      expression: 'cold',
      choices: [
        {
          text: "There's something broken in you.",
          nextNodeId: 'something_broken',
        },
        {
          text: "Cold efficiency has its limits.",
          nextNodeId: 'efficiency_limits',
        },
      ],
    },

    {
      id: 'something_broken',
      text: "*He is silent for a moment.* Perhaps. Or perhaps I simply adapted to a broken world. I didn't create the rules by which industry operates. I merely... mastered them. *He turns away.* We're wasting time. Let me tell you why you're here.",
      expression: 'distant',
      choices: [
        {
          text: "Fine. Talk.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'efficiency_limits',
      text: "*He tilts his head.* Does it? The railroad is built. The territory is connected. Commerce flows. From where I sit, efficiency has accomplished everything I set out to achieve. *He gestures around his opulent office.* The results speak for themselves.",
      choices: [
        {
          text: "At what cost?",
          nextNodeId: 'at_what_cost',
        },
      ],
    },

    {
      id: 'at_what_cost',
      text: "*He meets your eyes.* Less than you think. More than I'd prefer. *He sits heavily.* But we're not here to debate my soul. We're here because I have a proposition for you.",
      choices: [
        {
          text: "What kind of proposition?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'other_ways',
      text: "*He gestures broadly.* By all means, enlighten me. Cooperation? Tried it - the other companies undercut us. Democracy? The territorial legislature is bought by whoever has the most money. Which is me. Violence? The Copperheads try that. They're insects against a locomotive.",
      choices: [
        {
          text: "Maybe the system needs to change.",
          nextNodeId: 'system_change',
        },
        {
          text: "You've rigged the game.",
          nextNodeId: 'rigged_game',
        },
      ],
    },

    {
      id: 'system_change',
      text: "*He laughs softly.* The system. Yes, I've heard that refrain. Change the system. But systems are built by people. And people are venal, selfish creatures who respond to incentives. I provide incentives. The system bends to accommodate them. That's not corruption - that's reality.",
      choices: [
        {
          text: "People can be better than that.",
          nextNodeId: 'people_can_be_better',
        },
        {
          text: "You're part of the problem.",
          nextNodeId: 'part_of_problem',
        },
      ],
    },

    {
      id: 'people_can_be_better',
      text: "*Something flickers across his face - almost wistfulness.* Can they? I used to believe that. Long ago. Before I saw what people do when they think no one's watching. Before I learned what drives men to betray, to steal, to kill. *He shakes his head.* No. People are what they are. I work with reality, not ideals.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_reveals_cynicism' }],
      choices: [
        {
          text: "Someone hurt you. Made you this way.",
          nextNodeId: 'someone_hurt_you',
        },
        {
          text: "Cynicism is its own kind of cowardice.",
          nextNodeId: 'cynicism_cowardice',
        },
      ],
    },

    {
      id: 'someone_hurt_you',
      text: "*He stiffens visibly.* We're not here to discuss my psychology. *But something has shifted - a crack in the armor.* Everyone is hurt. The difference is what you do afterward. I chose to ensure I would never be hurt again. *He straightens.* The proposition. Focus.",
      expression: 'guarded',
      onEnterEffects: [{ type: 'set_flag', target: 'touched_thorne_nerve' }],
      choices: [
        {
          text: "Very well. I'm listening.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'cynicism_cowardice',
      text: "*His eyes flash.* Cowardice? I've built an empire from nothing. I've faced down competitors who tried to kill me. I've made decisions that cost lives and lost sleep over them - regardless of what you think. Don't you dare call me a coward.",
      expression: 'angry',
      choices: [
        {
          text: "I meant your refusal to believe in anything better.",
          nextNodeId: 'believe_in_better',
        },
        {
          text: "I've touched a nerve.",
          nextNodeId: 'touched_nerve',
        },
      ],
    },

    {
      id: 'believe_in_better',
      text: "*He forces himself to calm.* Belief without evidence is fantasy. I believe in what I can build, control, measure. If you want to believe in human goodness, be my guest. But don't ask me to share your delusion.",
      choices: [
        {
          text: "Maybe someday you'll see differently.",
          nextNodeId: 'see_differently',
        },
      ],
    },

    {
      id: 'see_differently',
      text: "*He almost smiles.* Perhaps. When I'm dead, and it no longer matters. *He gestures sharply.* Enough. You didn't come here for philosophy, and I didn't summon you for therapy. Let's discuss business.",
      choices: [
        {
          text: "Agreed. What do you want?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'touched_nerve',
      text: "*He composes himself with visible effort.* You're perceptive. Annoying, but perceptive. *He moves behind his desk like a general behind fortifications.* Let's move on. I have a proposition for you.",
      choices: [
        {
          text: "I'm listening.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'rigged_game',
      text: "*He spreads his hands.* Of course I have. That's what winning means. The alternative was losing - being crushed by those who rigged it first. I simply rigged it better. *He leans forward.* And now I'm offering you a seat at the table.",
      choices: [
        {
          text: "What do you mean?",
          nextNodeId: 'job_offer',
        },
        {
          text: "I don't want a seat at a crooked table.",
          nextNodeId: 'crooked_table',
        },
      ],
    },

    {
      id: 'crooked_table',
      text: "*He sighs.* All tables are crooked. The only question is which angle benefits you. But very well - hear me out before you decide. You may find my offer more... nuanced than you expect.",
      choices: [
        {
          text: "Fine. Talk.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'part_of_problem',
      text: "*He laughs.* I am the problem? I am also the solution. The railroad exists because of me. The mines produce because of me. Half the towns in this territory exist because of me. You want to separate the builder from the building? Impossible.",
      choices: [
        {
          text: "Then maybe the building needs to come down.",
          nextNodeId: 'building_comes_down',
        },
        {
          text: "There must be another way.",
          nextNodeId: 'another_way_insistent',
        },
      ],
    },

    {
      id: 'building_comes_down',
      text: "*His expression goes very still.* Careful. That sounds like a threat. I don't respond well to threats. *He pauses.* But I also don't ignore potential. Which is why you're here.",
      expression: 'dangerous',
      choices: [
        {
          text: "Not a threat. An observation.",
          nextNodeId: 'observation_not_threat',
        },
      ],
    },

    {
      id: 'observation_not_threat',
      text: "*He relaxes slightly.* Very well. Observe this, then: I'm offering you a chance to be part of what comes next. Not as an enemy to be crushed. As a partner. Of sorts.",
      choices: [
        {
          text: "Explain.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'another_way_insistent',
      text: "*He waves dismissively.* Idealism. Fine. But while you search for your 'another way,' the world keeps turning. Decisions get made. Power shifts. You can stand on the sidelines protesting, or you can get involved and actually affect outcomes. I'm offering the latter.",
      choices: [
        {
          text: "What exactly are you offering?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    // ========================================================================
    // Core nodes referenced by multiple paths
    // ========================================================================

    {
      id: 'take_seat',
      text: "*You sit in a chair that costs more than most people earn in a year. Thorne settles into his own seat, fingers steepled.* Good. Now we can speak as... if not equals, then at least as individuals capable of reason. I've been watching your movements in the territory. You've made an impression.",
      expression: 'calculating',
      choices: [
        {
          text: "You've been watching me?",
          nextNodeId: 'watching_you',
        },
        {
          text: "What kind of impression?",
          nextNodeId: 'what_impression',
        },
        {
          text: "Get to the point.",
          nextNodeId: 'get_to_point',
        },
      ],
    },

    {
      id: 'watching_you',
      text: "*He dismisses the concern.* I watch everyone of consequence. It's how I've stayed ahead for thirty years. You've spoken with the Sheriff, the doctor, possibly even the Copperheads. You've asked questions about IVRC. About me. *He smiles thinly.* I prefer to meet those who take an interest in my affairs.",
      choices: [
        {
          text: "And if I hadn't come willingly?",
          nextNodeId: 'not_come_willingly',
        },
        {
          text: "So this is about intimidation.",
          nextNodeId: 'intimidation',
        },
        {
          text: "What's your point?",
          nextNodeId: 'your_point',
        },
      ],
    },

    {
      id: 'not_come_willingly',
      text: "*He shrugs elegantly.* Then we would have had this conversation under less comfortable circumstances. I do prefer to be civilized when possible. But necessity has its own demands.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_veiled_threat' }],
      choices: [
        {
          text: "That sounds like a threat.",
          nextNodeId: 'sounds_like_threat',
        },
        {
          text: "I'm here now. Continue.",
          nextNodeId: 'here_now_continue',
        },
      ],
    },

    {
      id: 'sounds_like_threat',
      text: "*He looks almost hurt.* A statement of fact. I don't make threats - they're inefficient. I make promises, and then I keep them. Consider that when evaluating what I'm about to offer you.",
      choices: [
        {
          text: "Go on.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'here_now_continue',
      text: "*He nods approvingly.* Practical. I appreciate that. Very well - let me tell you why you're valuable to me.",
      choices: [
        {
          text: "I'm listening.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'intimidation',
      text: "*He chuckles.* If I wanted to intimidate you, I would have had men drag you here in chains. This is about opportunity. I recognize potential when I see it. You have potential.",
      choices: [
        {
          text: "What kind of opportunity?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'your_point',
      text: "*He nods.* Direct. I like that. My point is this: you're capable. You've navigated the territory without getting yourself killed, which is more than most newcomers manage. I could use someone with your talents.",
      choices: [
        {
          text: "For what?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'what_impression',
      text: "*He opens a folder on his desk - a dossier with your name on it.* Resourceful. Capable of gaining trust quickly. Not easily intimidated. You've talked to people who should have killed you on sight. That takes either remarkable skill or remarkable luck. I'm betting on skill.",
      choices: [
        {
          text: "You have a file on me?",
          nextNodeId: 'file_on_me',
        },
        {
          text: "Why does this matter to you?",
          nextNodeId: 'why_matter',
        },
      ],
    },

    {
      id: 'file_on_me',
      text: "*He closes it.* I have files on everyone worth noticing. Information is the most valuable currency in any economy. You've accumulated quite a bit of it in your short time here. I'd rather have that working for me than against me.",
      choices: [
        {
          text: "Working for you how?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'why_matter',
      text: "*He sets the folder aside.* Because this territory is at a crossroads. The Copperheads grow bolder. The Freeminers grow more desperate. And someone has been stirring up talk of the old workers' movement. *He watches your reaction.* I need capable people to ensure the right outcome.",
      choices: [
        {
          text: "The 'right' outcome being yours.",
          nextNodeId: 'right_outcome',
        },
        {
          text: "What are you proposing?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'right_outcome',
      text: "*He spreads his hands.* Mine, the territory's, civilization's - they're the same thing. I am the order that holds chaos at bay. Without IVRC, this land descends into anarchy. I'm offering you a chance to help prevent that.",
      choices: [
        {
          text: "By doing what, exactly?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'get_to_point',
      text: "*He allows himself a small smile.* Impatient. That can be useful, properly channeled. Very well - I'll dispense with the pleasantries. I have a job offer for you.",
      choices: [
        {
          text: "I'm listening.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'why_summoned',
      text: "*He finally turns, revealing a distinguished face with calculating eyes.* Summoned. Such a dramatic word. I prefer 'invited.' You've been asking questions around town. About IVRC. About our operations. About me. *He moves to his desk.* I thought it only fair you get answers from the source.",
      choices: [
        {
          text: "Fair isn't a word I'd associate with you.",
          nextNodeId: 'fairness',
        },
        {
          text: "Then tell me. What is IVRC really doing here?",
          nextNodeId: 'what_is_ivrc_doing',
        },
      ],
    },

    {
      id: 'fairness',
      text: "*He tilts his head.* You've already judged me. Based on what - rumors? The complaints of malcontents and competitors? *He sits.* I invite you to form your own opinion. Sit. Let me show you who I really am.",
      choices: [
        {
          text: '*Sit down*',
          nextNodeId: 'take_seat',
        },
        {
          text: "I'll form my own opinions from here.",
          nextNodeId: 'own_opinions',
        },
      ],
    },

    {
      id: 'own_opinions',
      text: "*He shrugs.* As you wish. But you'll miss the nuance from that distance. Very well - let me tell you what I'm offering.",
      choices: [
        {
          text: "Go ahead.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'what_is_ivrc_doing',
      text: "*He gestures to the window, the sprawling railyards beyond.* Building. Connecting. Bringing civilization to wilderness. What we've 'really' been doing is dragging this territory into the modern age, despite the best efforts of bandits, saboteurs, and those who profit from chaos.",
      choices: [
        {
          text: "And those who oppose you are 'chaos'?",
          nextNodeId: 'oppose_chaos',
        },
        {
          text: "Pretty words for exploitation.",
          nextNodeId: 'pretty_words',
        },
      ],
    },

    {
      id: 'oppose_chaos',
      text: "*He considers.* Some are. The Copperheads certainly - they want to tear down what I build with no plan for what comes after. Others... *he pauses* ...have legitimate grievances, poorly expressed. I'm not blind to the costs of progress.",
      choices: [
        {
          text: "Then why not address those grievances?",
          nextNodeId: 'address_grievances',
        },
      ],
    },

    {
      id: 'address_grievances',
      text: "*He sighs.* Because there's no profit in it. And without profit, there's no railroad, no mines, no employment. I can't satisfy everyone. I can only build the most good for the most people. Some will always suffer. I've accepted that. *He meets your eyes.* Can you?",
      choices: [
        {
          text: "No. I can't.",
          nextNodeId: 'cannot_accept',
        },
        {
          text: "That depends on who's suffering.",
          nextNodeId: 'who_suffers',
        },
      ],
    },

    {
      id: 'cannot_accept',
      text: "*He almost smiles.* Idealist. The world will teach you otherwise. Or it will crush you. Either way, you're interesting. *He leans forward.* Let me make you an offer.",
      choices: [
        {
          text: "What kind of offer?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'who_suffers',
      text: "*He nods slowly.* A more nuanced answer than I expected. Yes - who suffers matters. And right now, the wrong people are suffering because the Copperheads and agitators make it impossible to operate safely. Help me end that, and I can ensure the suffering falls on more... deserving shoulders.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_appeals_to_pragmatism' }],
      choices: [
        {
          text: "What exactly are you asking?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'pretty_words',
      text: "*He shrugs.* Words are all we have to describe reality. You call it exploitation. I call it employment, development, progress. The workers in my mines earn more than subsistence farmers. The towns along my railroad thrive. Facts, not words.",
      choices: [
        {
          text: "The dead miners would disagree.",
          nextNodeId: 'dead_miners',
        },
        {
          text: "Fine. What do you want from me?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'why_summoned_direct',
      text: "*He moves to sit behind his desk.* Very well. No more dancing. I summoned you because you're either a threat or an opportunity. I'd prefer opportunity. Let me explain what I'm offering.",
      choices: [
        {
          text: "Explain.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'no_games',
      text: "*He regards you with something like respect.* Neither do I. They waste time. So let me be direct: I have a job that requires someone with your particular talents.",
      choices: [
        {
          text: "What job?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'personal_defiance',
      text: "*His eyebrow rises.* Me personally? How flattering. And what have I done to earn such focused enmity?",
      choices: [
        {
          text: "You represent everything wrong with progress.",
          nextNodeId: 'represent_wrong',
        },
        {
          text: "I haven't decided yet. Maybe you'll surprise me.",
          nextNodeId: 'might_surprise',
        },
      ],
    },

    {
      id: 'represent_wrong',
      text: "*He sighs.* Progress. Such a loaded word. Tell me - do you prefer the alternative? Stagnation? Wilderness? The frontier as it was, where might made right and the weak simply died? I brought order to that chaos.",
      choices: [
        {
          text: "Order built on bodies.",
          nextNodeId: 'order_on_bodies',
        },
      ],
    },

    {
      id: 'order_on_bodies',
      text: "*He doesn't flinch.* All order is built on bodies. Governments, armies, corporations - all require sacrifice. The only question is whose. I try to ensure the sacrifice serves purpose. Not everyone succeeds.",
      choices: [
        {
          text: "Your philosophy is monstrous.",
          nextNodeId: 'monstrous_philosophy',
        },
      ],
    },

    {
      id: 'monstrous_philosophy',
      text: "*He spreads his hands.* Perhaps. But it's built a railroad, employed thousands, connected a territory. What has your philosophy built? *He gestures to the chair.* Sit. I have something you need to hear.",
      choices: [
        {
          text: '*Sit down*',
          nextNodeId: 'job_offer',
        },
        {
          text: "I'll stand.",
          nextNodeId: 'stand_for_offer',
        },
      ],
    },

    {
      id: 'stand_for_offer',
      text: "*He shrugs.* As you wish. My offer stands either way.",
      choices: [
        {
          text: "Make your offer.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'might_surprise',
      text: "*A genuine smile, small but real.* An open mind. How refreshing. Most people decide who I am before they meet me. You're willing to form your own opinion. That's rare. That's valuable.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: "Don't mistake curiosity for approval.",
          nextNodeId: 'curiosity_not_approval',
        },
      ],
    },

    {
      id: 'curiosity_not_approval',
      text: "*He waves dismissively.* I don't need approval. I need competence. Which brings us to why you're here.",
      choices: [
        {
          text: "Continue.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'stubborn_response',
      text: "*He laughs softly.* Stubborn. I can respect that. I've been called stubborn myself - usually by people I was about to ruin. *He gestures.* Sit or stand, but listen. I have a proposition.",
      choices: [
        {
          text: "I'm listening.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'time_value',
      text: "*His lips twitch - almost a smile.* You're assessing whether I'm worth your time. That's... unusual. Most people assume my time is valuable and theirs is not. *He sits.* I assure you, this conversation will be worth having.",
      choices: [
        {
          text: "Prove it.",
          nextNodeId: 'prove_worth',
        },
      ],
    },

    {
      id: 'prove_worth',
      text: "*He gestures to the chair.* Sit, and I will. I have a proposition that could change your fortunes significantly. Or you can leave now, and we'll meet again under... different circumstances.",
      choices: [
        {
          text: '*Sit down*',
          nextNodeId: 'job_offer',
        },
        {
          text: "I'll take my chances.",
          nextNodeId: 'take_chances',
        },
      ],
    },

    {
      id: 'take_chances',
      text: "*He sighs.* A pity. Very well. The door is behind you. But know this: the next time we meet, it will not be as cordially. I've offered you a hand. You're choosing to make it a fist.",
      onEnterEffects: [
        { type: 'set_flag', target: 'rejected_thorne_first_meeting' },
        { type: 'change_reputation', value: -20 },
      ],
      choices: [
        {
          text: "I've survived fists before.",
          nextNodeId: 'survived_fists',
        },
        {
          text: "Wait. What's the offer?",
          nextNodeId: 'wait_what_offer',
        },
      ],
    },

    {
      id: 'survived_fists',
      text: "*He watches you with cold appraisal.* You may have. But you haven't survived mine. Yet. *He turns back to the window.* Leave. We'll speak again when circumstances are less... optional.",
      expression: 'cold',
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'wait_what_offer',
      text: "*He turns back, a hint of satisfaction in his eyes.* Changed your mind? Good. That shows adaptability. Sit. Listen. Then decide.",
      choices: [
        {
          text: '*Sit down*',
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'simple_preference',
      text: "*He studies you.* A simple preference. How refreshing in a world of complex machinations. *He sits.* Very well. Stand if you wish. But listen carefully. What I'm about to offer comes once.",
      choices: [
        {
          text: "I'm listening.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'defiant_response',
      text: "*His expression cools slightly.* You don't need it. Very well. But my assessment matters more than you realize. In this territory, I am the difference between prosperity and ruin, freedom and imprisonment. Remember that.",
      onEnterEffects: [{ type: 'change_reputation', value: -5 }],
      choices: [
        {
          text: "Threats don't impress me.",
          nextNodeId: 'threats_unimpressive',
        },
        {
          text: "I'll keep it in mind. What do you want?",
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'threats_unimpressive',
      text: "*He almost seems pleased.* Not a threat. A fact. But your resistance to intimidation is... useful. Sit. Or don't. But hear what I have to say.",
      choices: [
        {
          text: "Fine. Talk.",
          nextNodeId: 'job_offer',
        },
      ],
    },

    // ========================================================================
    // THE JOB OFFER - Core proposition
    // ========================================================================

    {
      id: 'job_offer',
      text: "*He opens a drawer, removes a document, slides it across the desk.* I need someone to investigate the Copperhead Gang. Not as a lawman - Sheriff Cole has proven... inadequate. As someone who can get close. Learn their plans. Their weaknesses. And report to me.",
      expression: 'businesslike',
      choices: [
        {
          text: "You want me to spy on them.",
          nextNodeId: 'spy_confirm',
        },
        {
          text: "Why me?",
          nextNodeId: 'why_me',
        },
        {
          text: "And if I refuse?",
          nextNodeId: 'if_refuse',
        },
      ],
    },

    {
      id: 'spy_confirm',
      text: "*He inclines his head.* 'Spy' is such an ugly word. I prefer 'intelligence gatherer.' The Copperheads have cost me millions in stolen goods and disrupted operations. They've killed my men. I need to understand them before I can... neutralize them.",
      choices: [
        {
          text: "'Neutralize.' You mean kill.",
          nextNodeId: 'neutralize_meaning',
        },
        {
          text: "What's in it for me?",
          nextNodeId: 'whats_in_it',
        },
        {
          text: "I won't betray people to their deaths.",
          nextNodeId: 'wont_betray',
        },
      ],
    },

    {
      id: 'neutralize_meaning',
      text: "*He doesn't flinch.* If necessary. Preferably, arrest and trial. But the Copperheads have shown they prefer violence. I simply respond in kind. *He leans forward.* Make no mistake - they would kill you without hesitation if they thought you were a threat.",
      choices: [
        {
          text: "That doesn't justify becoming like them.",
          nextNodeId: 'becoming_like_them',
        },
        {
          text: "What would you need from me, specifically?",
          nextNodeId: 'specifically_need',
        },
      ],
    },

    {
      id: 'becoming_like_them',
      text: "*Something flickers in his eyes.* No. It doesn't. But the alternative is letting them continue. More robberies. More deaths. More chaos. *He sighs.* I don't enjoy violence. I simply recognize when it's necessary. Tell me - what would you do differently?",
      choices: [
        {
          text: "Find out what they really want. Address the root causes.",
          nextNodeId: 'root_causes',
        },
        {
          text: "I don't know. But not this.",
          nextNodeId: 'not_this',
        },
      ],
    },

    {
      id: 'root_causes',
      text: "*He leans back, looking almost impressed.* The root causes. Do you know what they want? They want IVRC destroyed. Not reformed - destroyed. They want the railroad torn up, the mines closed, the territory returned to wilderness. *He shakes his head.* There is no negotiating with that.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_explains_copperhead_goals' }],
      choices: [
        {
          text: "Maybe they'd settle for less if you actually talked to them.",
          nextNodeId: 'talk_to_them',
        },
        {
          text: "You made them that extreme.",
          nextNodeId: 'made_them_extreme',
        },
      ],
    },

    {
      id: 'talk_to_them',
      text: "*He laughs bitterly.* Talk. I tried that, years ago. Sent negotiators. They came back in pieces. *His voice hardens.* Diamondback Vega doesn't want peace. She wants revenge. For slights real and imagined. You cannot reason with vengeance.",
      choices: [
        {
          text: "What did you do to her?",
          nextNodeId: 'what_did_you_do',
        },
        {
          text: "Maybe you sent the wrong negotiators.",
          nextNodeId: 'wrong_negotiators',
        },
      ],
    },

    {
      id: 'what_did_you_do',
      text: "*He pauses.* She was a telegraph operator. Discovered some... sensitive communications. Tried to use them against the company. I had her dismissed. Perhaps I was harsh. *He looks away.* She turned to crime. That was her choice, not mine.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_admits_diamondback_origin' }],
      choices: [
        {
          text: "'Harsh' is probably an understatement.",
          nextNodeId: 'harsh_understatement',
        },
        {
          text: "What were the 'sensitive communications'?",
          nextNodeId: 'sensitive_communications',
        },
      ],
    },

    {
      id: 'harsh_understatement',
      text: "*He meets your eyes.* Perhaps. I've made mistakes. I don't claim to be perfect. But she has killed people. Innocent guards with families. That blood is on her hands, not mine.",
      choices: [
        {
          text: "The blood on your hands is different only in scale.",
          nextNodeId: 'scale_of_blood',
        },
        {
          text: "What do you want me to do about her?",
          nextNodeId: 'what_about_her',
        },
      ],
    },

    {
      id: 'scale_of_blood',
      text: "*He doesn't argue.* Perhaps. But scale matters. A thousand employed, versus a dozen killed. The mathematics favor my approach. *He waves dismissively.* But we're not here to debate ethics. We're here to discuss your role.",
      choices: [
        {
          text: "What exactly would you want me to do?",
          nextNodeId: 'specifically_need',
        },
      ],
    },

    {
      id: 'sensitive_communications',
      text: "*He hesitates.* Internal memos. Regarding... operational decisions. Some of which could be misinterpreted by those unfamiliar with the realities of business. She tried to make them public. I prevented that.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_hiding_communications' }],
      choices: [
        {
          text: "'Misinterpreted.' You mean they showed wrongdoing.",
          nextNodeId: 'showed_wrongdoing',
        },
        {
          text: "What happened to those documents?",
          nextNodeId: 'what_happened_documents',
        },
      ],
    },

    {
      id: 'showed_wrongdoing',
      text: "*His jaw tightens.* They showed difficult decisions made under difficult circumstances. Nothing that would be understood by those who've never had to make such choices. *He stands abruptly.* This is not why you're here. The offer stands. What is your answer?",
      expression: 'defensive',
      choices: [
        {
          text: "I need to think about it.",
          nextNodeId: 'need_to_think',
        },
        {
          text: "I'm not interested in being your spy.",
          nextNodeId: 'not_interested_spy',
        },
        {
          text: "What's the compensation?",
          nextNodeId: 'compensation',
        },
      ],
    },

    {
      id: 'what_happened_documents',
      text: "*He waves vaguely.* Secured. Where they can't be used to destabilize the territory. The past is past. What matters is the future. *He redirects.* Will you help me secure that future, or not?",
      choices: [
        {
          text: "Tell me more about what you need.",
          nextNodeId: 'specifically_need',
        },
        {
          text: "I don't think I can help you.",
          nextNodeId: 'cant_help',
        },
      ],
    },

    {
      id: 'made_them_extreme',
      text: "*Something dark crosses his face.* I made them? They chose violence. They chose to rob, to kill, to terrorize. I offered employment, opportunity. They chose to be outlaws. Don't shift responsibility from those who bear it.",
      expression: 'angry',
      choices: [
        {
          text: "Actions have consequences. So did yours.",
          nextNodeId: 'actions_consequences',
        },
        {
          text: "You're both responsible.",
          nextNodeId: 'both_responsible',
        },
      ],
    },

    {
      id: 'actions_consequences',
      text: "*He forces himself to calm.* Consequences. Yes. My consequences built a railroad. Theirs destroyed innocent lives. We are not equivalent. *He sits back down.* But this debate is circular. Make a decision. Are you with me or against me?",
      choices: [
        {
          text: "What's the offer again?",
          nextNodeId: 'whats_in_it',
        },
        {
          text: "I need time to think.",
          nextNodeId: 'need_to_think',
        },
        {
          text: "I'm against you.",
          nextNodeId: 'against_you',
        },
      ],
    },

    {
      id: 'both_responsible',
      text: "*He considers this.* Perhaps. Perhaps we've both made mistakes that led here. But only one of us is trying to build something. Only one is offering a way forward. *He gestures to the document.* What do you say?",
      choices: [
        {
          text: "Tell me the details.",
          nextNodeId: 'specifically_need',
        },
        {
          text: "I can't work for you.",
          nextNodeId: 'cant_work_for',
        },
      ],
    },

    {
      id: 'wrong_negotiators',
      text: "*He raises an eyebrow.* You think you could do better? By all means - infiltrate her gang, gain her trust, bring her to the table. If you can accomplish that, I'll listen. *He slides the document closer.* But you'll need resources. My resources.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offers_negotiation_path' }],
      choices: [
        {
          text: "You'd actually negotiate if I could arrange it?",
          nextNodeId: 'actually_negotiate',
        },
        {
          text: "What kind of resources?",
          nextNodeId: 'what_resources',
        },
      ],
    },

    {
      id: 'actually_negotiate',
      text: "*He meets your eyes directly.* If you can bring Diamondback to genuine negotiation - not ambush, not tricks - I would hear what she has to say. I'm not unreasonable. Just... protective of what I've built. Can you do that?",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_promises_negotiation' }],
      choices: [
        {
          text: "I'll try. But I need you to promise no tricks either.",
          nextNodeId: 'promise_no_tricks',
        },
        {
          text: "I'll see what I can do. No promises.",
          nextNodeId: 'no_promises',
        },
      ],
    },

    {
      id: 'promise_no_tricks',
      text: "*He hesitates, then nods slowly.* Very well. If you can arrange genuine negotiation, I will attend in good faith. My word on it. *He extends his hand.* But if this is a trap, if she tries to kill me... there will be consequences.",
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_sworn_good_faith' },
        { type: 'change_reputation', value: 10 },
      ],
      choices: [
        {
          text: '*Shake his hand*',
          nextNodeId: 'shake_hand_negotiate',
        },
        {
          text: "I'm not shaking hands with you. But I'll try.",
          nextNodeId: 'no_handshake',
        },
      ],
    },

    {
      id: 'shake_hand_negotiate',
      text: "*His grip is firm, cold.* Then we have an understanding. You'll need funds for travel, credentials to move freely. I'll arrange them. *He releases your hand.* Don't disappoint me. I have very little patience for disappointment.",
      onEnterEffects: [
        { type: 'set_flag', target: 'working_for_thorne_negotiate' },
        { type: 'give_gold', value: 200 },
        { type: 'give_item', target: 'ivrc_travel_pass' },
        { type: 'start_quest', target: 'arrange_copperhead_negotiation' },
      ],
      choices: [
        {
          text: "I'll be in touch.",
          nextNodeId: 'negotiate_ending',
        },
      ],
    },

    {
      id: 'negotiate_ending',
      text: "*He nods curtly.* The door is behind you. My secretary will provide the documents. And remember - I'm watching. Always watching. *He turns back to the window, dismissing you.*",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'no_handshake',
      text: "*He withdraws his hand without apparent offense.* Symbolic gestures are overrated anyway. Results matter. Bring me results. *He moves to his desk, begins writing.* My secretary will give you what you need.",
      onEnterEffects: [
        { type: 'set_flag', target: 'working_for_thorne_negotiate' },
        { type: 'give_gold', value: 200 },
        { type: 'give_item', target: 'ivrc_travel_pass' },
        { type: 'start_quest', target: 'arrange_copperhead_negotiation' },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'no_promises',
      text: "*He nods.* Fair enough. No promises, no expectations. But if you succeed, I'll remember. And if you fail... *he lets the implication hang.* ...well, let's hope you don't fail.",
      onEnterEffects: [
        { type: 'set_flag', target: 'tentative_thorne_agreement' },
        { type: 'give_gold', value: 100 },
      ],
      choices: [
        {
          text: "I'll do what I can.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'what_resources',
      text: "*He ticks them off on his fingers.* Travel passes for IVRC facilities. Information about Copperhead movements we've gathered. Gold for expenses. And most importantly - my protection. Work for me, and no one in this territory touches you.",
      choices: [
        {
          text: "That's a lot of support for a spy mission.",
          nextNodeId: 'lot_of_support',
        },
        {
          text: "What do you expect in return?",
          nextNodeId: 'expect_in_return',
        },
      ],
    },

    {
      id: 'lot_of_support',
      text: "*He smiles thinly.* The Copperhead problem has cost me more than I care to admit. I'm willing to invest significantly in its solution. You represent a potential asset. I invest in assets.",
      choices: [
        {
          text: "And if I take your resources and betray you?",
          nextNodeId: 'betray_hypothetical',
        },
        {
          text: "Fair enough. I'll consider it.",
          nextNodeId: 'consider_offer',
        },
      ],
    },

    {
      id: 'betray_hypothetical',
      text: "*His eyes go cold.* Then you would learn why no one crosses IVRC twice. I have resources you cannot imagine. Reach that extends beyond this territory. Betray me, and you would never know peace again. *His voice softens.* But I don't think you will. You're smarter than that.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_warning_betrayal' }],
      choices: [
        {
          text: "Just laying out the possibilities.",
          nextNodeId: 'laying_possibilities',
        },
        {
          text: "That's quite a threat.",
          nextNodeId: 'quite_a_threat',
        },
      ],
    },

    {
      id: 'laying_possibilities',
      text: "*He nods.* And now they're laid. Work with me, prosper. Work against me, suffer. Simple as gravity. *He gestures to the document.* Your decision?",
      choices: [
        {
          text: "I'll work with you. For now.",
          nextNodeId: 'accept_offer',
        },
        {
          text: "I need time to think.",
          nextNodeId: 'need_to_think',
        },
        {
          text: "I decline.",
          nextNodeId: 'decline_offer',
        },
      ],
    },

    {
      id: 'quite_a_threat',
      text: "*He spreads his hands.* A promise. I keep my promises - positive and negative. Work with me, and I reward loyalty handsomely. Work against me... *he shrugs* ...I protect what I've built. As would anyone.",
      choices: [
        {
          text: "Your offer is noted. I need time.",
          nextNodeId: 'need_to_think',
        },
      ],
    },

    {
      id: 'consider_offer',
      text: "*He nods.* Consider carefully. But don't take too long. The situation with the Copperheads grows more volatile by the day. I need someone in place soon. *He stands.* You know where to find me when you've decided.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offer_pending' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'expect_in_return',
      text: "*He counts on his fingers.* Information. Who leads the Copperheads beyond Diamondback. Where they hide. When they plan to strike. Who funds them, who supplies them. And eventually... their vulnerabilities.",
      choices: [
        {
          text: "So I'd be marking them for death.",
          nextNodeId: 'marking_death',
        },
        {
          text: "That's extensive intelligence work.",
          nextNodeId: 'extensive_intel',
        },
      ],
    },

    {
      id: 'marking_death',
      text: "*He doesn't deny it.* If necessary. Or arrest. Or negotiation from a position of strength. Information enables options. Without information, I have only one option - overwhelming force. Which would you prefer?",
      choices: [
        {
          text: "Neither.",
          nextNodeId: 'neither_option',
        },
        {
          text: "You make a point.",
          nextNodeId: 'makes_point',
        },
      ],
    },

    {
      id: 'neither_option',
      text: "*He sighs.* Then offer me a third. I'm listening. But understand - doing nothing is not an option. The Copperheads grow bolder. Something must be done. If not my way, then tell me yours.",
      choices: [
        {
          text: "What if I found evidence that could end this peacefully?",
          nextNodeId: 'peaceful_evidence',
        },
        {
          text: "I don't have a better answer. Yet.",
          nextNodeId: 'no_better_answer',
        },
      ],
    },

    {
      id: 'peaceful_evidence',
      text: "*He pauses, curious despite himself.* What kind of evidence?",
      choices: [
        {
          text: "Documents that prove wrongdoing. On all sides. Leverage for real negotiation.",
          nextNodeId: 'documents_leverage',
        },
      ],
    },

    {
      id: 'documents_leverage',
      text: "*His expression becomes very careful.* Documents. You've heard about the Ironpick records, then. *He's quiet for a moment.* If such documents exist, they could be... destabilizing. To everyone involved. Including me.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_acknowledges_documents' }],
      choices: [
        {
          text: "Exactly. Leverage for real change.",
          nextNodeId: 'leverage_for_change',
        },
        {
          text: "Afraid of what they'd reveal?",
          nextNodeId: 'afraid_reveal',
        },
      ],
    },

    {
      id: 'leverage_for_change',
      text: "*He considers.* Change. Perhaps. But change can be destructive as well as constructive. *He meets your eyes.* If you find such documents, bring them to me first. Let me... assess their impact. We can determine together how best to use them.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_wants_documents' }],
      choices: [
        {
          text: "So you can destroy them?",
          nextNodeId: 'destroy_them',
        },
        {
          text: "I'll consider it.",
          nextNodeId: 'consider_documents',
        },
      ],
    },

    {
      id: 'destroy_them',
      text: "*He shakes his head.* So I can ensure they're used wisely. Revelation without context causes panic. Properly presented, even damaging information can lead to productive outcomes. Trust me - or don't. But consider that I have the most to lose if this is handled badly.",
      choices: [
        {
          text: "I'll think about what you've said.",
          nextNodeId: 'need_to_think',
        },
        {
          text: "I make no promises about what I'll do with what I find.",
          nextNodeId: 'no_promises_documents',
        },
      ],
    },

    {
      id: 'no_promises_documents',
      text: "*He nods slowly.* Fair. You're not my creature. I appreciate that, even as it frustrates me. *He stands.* Go. Do what you will. But remember - my door is always open. And I have a long memory.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_acknowledges_independence' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'consider_documents',
      text: "*He nods.* That's all I ask. Consider what's best for everyone - not just the righteous anger of those who've been hurt. Sometimes the greater good requires... uncomfortable alliances.",
      choices: [
        {
          text: "We'll see.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'afraid_reveal',
      text: "*His expression hardens.* Afraid? No. Concerned about how they might be used by those with less... perspective. Information is power. In the wrong hands, it becomes a weapon. I prefer weapons I control.",
      choices: [
        {
          text: "Weapons like your railroad. Your mines. Your money.",
          nextNodeId: 'your_weapons',
        },
        {
          text: "Maybe it's time power changed hands.",
          nextNodeId: 'power_change',
        },
      ],
    },

    {
      id: 'your_weapons',
      text: "*He spreads his hands.* Yes. I don't pretend otherwise. I have power, and I use it. The question is whether that power is used well or poorly. I believe I use it well. You may disagree. History will decide.",
      choices: [
        {
          text: "History is written by the victors.",
          nextNodeId: 'written_by_victors',
        },
      ],
    },

    {
      id: 'written_by_victors',
      text: "*He smiles grimly.* Indeed it is. And I intend to be victorious. *He gestures to the door.* You've given me much to think about. As I hope I've given you. We'll speak again.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'power_change',
      text: "*His eyes flash dangerously.* Be very careful. Power changing hands usually means bloodshed. The current order, imperfect as it is, provides stability. Destabilize it, and innocents suffer. *He leans forward.* Is that what you want?",
      choices: [
        {
          text: "Innocents are already suffering.",
          nextNodeId: 'already_suffering',
        },
        {
          text: "You've given me a lot to consider.",
          nextNodeId: 'lot_to_consider',
        },
      ],
    },

    {
      id: 'already_suffering',
      text: "*He's quiet for a moment.* Yes. They are. And that... troubles me more than you know. *He looks away.* Go. Think on what we've discussed. Perhaps there's a path neither of us has seen yet.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_admits_concern' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'lot_to_consider',
      text: "*He nods.* As have I. The door is always open, should you wish to talk further. Or to accept my offer. *He turns back to the window.* Think quickly. Events are accelerating.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offer_pending' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'no_better_answer',
      text: "*He nods slowly.* Honest. More honest than most who oppose me. *He sits back.* Then take time to find a better answer. But while you search, people will die. The question is whether fewer will die if you help me.",
      choices: [
        {
          text: "I'll think about it.",
          nextNodeId: 'need_to_think',
        },
      ],
    },

    {
      id: 'makes_point',
      text: "*He nods.* I often do. The world isn't black and white. It's a thousand shades of gray, and wisdom lies in choosing the lightest shade available. Help me, and fewer people die. Oppose me... and I cannot guarantee the same.",
      choices: [
        {
          text: "What would you need me to do first?",
          nextNodeId: 'first_assignment',
        },
        {
          text: "I need time.",
          nextNodeId: 'need_to_think',
        },
      ],
    },

    {
      id: 'first_assignment',
      text: "*He pulls out another document.* There's a Copperhead sympathizer in Dusty Springs. Name of Henderson. He passes information about railroad shipments. Find out how he communicates with the gang. Don't confront him - just observe. Bring me what you learn.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_first_assignment_given' }],
      choices: [
        {
          text: "That's surveillance, not infiltration.",
          nextNodeId: 'surveillance_not_infiltration',
        },
        {
          text: "And if I do this successfully?",
          nextNodeId: 'successful_assignment',
        },
      ],
    },

    {
      id: 'surveillance_not_infiltration',
      text: "*He nods.* A test. Prove yourself capable, and I'll trust you with more. Fail or betray me, and... well. Let's hope you're capable.",
      choices: [
        {
          text: "Fine. I'll do it.",
          nextNodeId: 'accept_first_assignment',
        },
        {
          text: "I need to think about this.",
          nextNodeId: 'need_to_think',
        },
      ],
    },

    {
      id: 'successful_assignment',
      text: "*He smiles thinly.* Then we move to phase two. Actual infiltration. Introductions to Copperhead contacts. Deeper access. Greater rewards. *He leans forward.* But first, prove yourself.",
      choices: [
        {
          text: "I'll do it.",
          nextNodeId: 'accept_first_assignment',
        },
      ],
    },

    {
      id: 'accept_first_assignment',
      text: "*He slides a pouch of coins across the desk.* Expenses. Be discreet. Report to me within the week. *He waves dismissively.* That will be all.",
      onEnterEffects: [
        { type: 'set_flag', target: 'working_for_thorne_spy' },
        { type: 'give_gold', value: 100 },
        { type: 'start_quest', target: 'observe_henderson' },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'extensive_intel',
      text: "*He nods.* It is. But you've demonstrated capability. The fact that you've survived this long, talked to the people you've talked to... you have skills. I merely want to direct them productively.",
      choices: [
        {
          text: "What's the pay?",
          nextNodeId: 'compensation',
        },
        {
          text: "I'll consider it.",
          nextNodeId: 'consider_offer',
        },
      ],
    },

    {
      id: 'not_this',
      text: "*He sighs.* A moral absolutist. How exhausting. *He stands.* Very well. You've heard my offer. Think on it. But don't take too long - the situation deteriorates daily. And my patience has limits.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offer_pending' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'why_me',
      text: "*He pulls out the dossier again.* You're an unknown quantity. No family ties to the region. No obvious loyalties. You can move between factions without raising immediate suspicion. In short - you're useful precisely because no one knows whose side you're on.",
      choices: [
        {
          text: "Including you.",
          nextNodeId: 'including_you',
        },
        {
          text: "That makes sense. What's the compensation?",
          nextNodeId: 'compensation',
        },
      ],
    },

    {
      id: 'including_you',
      text: "*He smiles thinly.* Including me. Which is why this is a proposition, not an order. I'm offering inducements, not threats. *He leans forward.* Accept, and you have my resources. Decline, and... we remain uncertain of each other. I don't like uncertainty.",
      choices: [
        {
          text: "What exactly are the inducements?",
          nextNodeId: 'compensation',
        },
        {
          text: "I prefer to remain uncertain for now.",
          nextNodeId: 'remain_uncertain',
        },
      ],
    },

    {
      id: 'remain_uncertain',
      text: "*He nods slowly.* Your prerogative. But uncertainty is uncomfortable for everyone. *He stands.* Think on my offer. The door is always open... for now.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offer_pending' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'if_refuse',
      text: "*His expression doesn't change.* Then we continue as we are. You, making inquiries that alarm my people. Me, wondering whether you're a threat to be neutralized or simply a curiosity to observe. *He spreads his hands.* I prefer certainty.",
      choices: [
        {
          text: "Is that a threat?",
          nextNodeId: 'is_that_threat',
        },
        {
          text: "What are you offering?",
          nextNodeId: 'compensation',
        },
      ],
    },

    {
      id: 'is_that_threat',
      text: "*He shakes his head.* A statement of reality. I don't threaten - I inform. Currently, you're an unknown. Unknowns make me cautious. Caution can take... various forms. *He gestures.* But none of that needs to happen if we understand each other.",
      choices: [
        {
          text: "I understand you perfectly.",
          nextNodeId: 'understand_perfectly',
        },
        {
          text: "Tell me more about this job.",
          nextNodeId: 'specifically_need',
        },
      ],
    },

    {
      id: 'understand_perfectly',
      text: "*He tilts his head.* Do you? Then you understand that I'm offering partnership, not servitude. Mutual benefit. Your skills, my resources. Together, we could accomplish much.",
      choices: [
        {
          text: "What do you consider 'mutual benefit'?",
          nextNodeId: 'compensation',
        },
        {
          text: "I don't partner with people like you.",
          nextNodeId: 'dont_partner',
        },
      ],
    },

    {
      id: 'dont_partner',
      text: "*His expression cools.* People like me. And what, precisely, are people like me? Builders? Pragmatists? Those willing to make hard choices while idealists wring their hands?",
      choices: [
        {
          text: "Exploiters. Tyrants.",
          nextNodeId: 'exploiters_tyrants',
        },
        {
          text: "People who value profit over lives.",
          nextNodeId: 'profit_over_lives',
        },
      ],
    },

    {
      id: 'exploiters_tyrants',
      text: "*He laughs softly.* Tyrant. I've been called worse. But ask yourself - if I'm a tyrant, why am I asking for your help? Tyrants command. I'm offering a deal. That's called business, not tyranny.",
      choices: [
        {
          text: "Dressed-up tyranny is still tyranny.",
          nextNodeId: 'dressed_up_tyranny',
        },
      ],
    },

    {
      id: 'dressed_up_tyranny',
      text: "*He sighs.* We're going in circles. You've made your position clear. *He gestures to the door.* You may go. But remember - refusing my offer doesn't make me your enemy. Only opposition does. Choose wisely what comes next.",
      onEnterEffects: [
        { type: 'set_flag', target: 'refused_thorne_offer' },
        { type: 'change_reputation', value: -10 },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'profit_over_lives',
      text: "*He's quiet for a moment.* Profit enables everything. Without profit, no railroad. Without railroad, no commerce. Without commerce, no towns, no hospitals, no schools. Profit isn't evil - it's fuel. What matters is what the engine builds.",
      choices: [
        {
          text: "Your engine runs on blood.",
          nextNodeId: 'engine_on_blood',
        },
        {
          text: "A convenient philosophy for the wealthy.",
          nextNodeId: 'convenient_wealthy',
        },
      ],
    },

    {
      id: 'engine_on_blood',
      text: "*He doesn't flinch.* All engines do. Every nation, every civilization, every advancement in human history has required sacrifice. The question is whether the sacrifice produces lasting good. I believe mine does.",
      choices: [
        {
          text: "We disagree on that.",
          nextNodeId: 'disagree',
        },
      ],
    },

    {
      id: 'disagree',
      text: "*He nods.* We do. And that's... acceptable. I'd rather have worthy opposition than sycophantic agreement. *He stands.* Go. Think. Return when you're ready to engage seriously.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_respects_opposition' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'convenient_wealthy',
      text: "*He inclines his head.* Perhaps. But I wasn't always wealthy. I built this from nothing. Every person in this territory has the same opportunity I had. Some will seize it. Others won't. I can't want success for them more than they want it themselves.",
      choices: [
        {
          text: "Not everyone starts from the same place.",
          nextNodeId: 'different_starts',
        },
        {
          text: "I've heard enough.",
          nextNodeId: 'heard_enough',
        },
      ],
    },

    {
      id: 'different_starts',
      text: "*He pauses.* No. They don't. *For a moment, something genuine shows through.* Life isn't fair. I didn't make it that way. I simply... adapted. As must everyone. *He straightens.* Are you done philosophizing?",
      choices: [
        {
          text: "For now.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'heard_enough',
      text: "*He waves dismissively.* Then go. My offer stands. Think on it when your moral certainty wavers - as it inevitably will. The world has a way of complicating simple ethics.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offer_pending' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'wont_betray',
      text: "*He tilts his head.* Admirable. But who said anything about betrayal? Information is neutral. What happens with that information... that's negotiable. Perhaps the Copperheads could be convinced to surrender peacefully. Without bloodshed.",
      choices: [
        {
          text: "You expect me to believe that?",
          nextNodeId: 'believe_peace',
        },
        {
          text: "What would a 'peaceful' resolution look like?",
          nextNodeId: 'peaceful_resolution',
        },
      ],
    },

    {
      id: 'believe_peace',
      text: "*He shrugs.* Believe what you wish. But consider - every Copperhead I capture alive is information. Every one killed is a question mark. I have practical reasons to prefer live prisoners. Dead outlaws tell no tales.",
      choices: [
        {
          text: "And then what? Trials? Or disappearances?",
          nextNodeId: 'trials_or_disappearances',
        },
      ],
    },

    {
      id: 'trials_or_disappearances',
      text: "*He meets your eyes steadily.* Trials. I'm not a monster. The law exists, and I use it. Yes, I influence it - but I don't circumvent it entirely. That would set a dangerous precedent.",
      choices: [
        {
          text: "A court you control isn't justice.",
          nextNodeId: 'court_control',
        },
        {
          text: "Fair enough. Tell me more about the job.",
          nextNodeId: 'specifically_need',
        },
      ],
    },

    {
      id: 'court_control',
      text: "*He sighs.* I don't control it entirely. I influence it. As does anyone with resources. That's simply how the world works. If you want pure justice, you'll need to build it yourself. In the meantime, I offer the best available.",
      choices: [
        {
          text: "Maybe I will build something better.",
          nextNodeId: 'build_better',
        },
      ],
    },

    {
      id: 'build_better',
      text: "*He almost smiles.* Maybe you will. I find myself almost hoping you succeed. *He stands.* Go. Build your better world. But remember my offer when the building gets hard.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_respects_ambition' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'peaceful_resolution',
      text: "*He steeples his fingers.* Amnesty for the rank and file. Prison for the leaders - but humane conditions, and the possibility of eventual release. The Copperheads disbanded, their grievances heard by a proper commission. Is that so unreasonable?",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offers_amnesty' }],
      choices: [
        {
          text: "Why would they trust you to keep that deal?",
          nextNodeId: 'trust_deal',
        },
        {
          text: "That's more reasonable than I expected.",
          nextNodeId: 'more_reasonable',
        },
      ],
    },

    {
      id: 'trust_deal',
      text: "*He spreads his hands.* They wouldn't. Which is where you come in. Someone they might trust to verify I'm keeping my word. A neutral party. *He leans forward.* Help me end this without more bloodshed. Surely that aligns with your ethics.",
      choices: [
        {
          text: "You're manipulating me.",
          nextNodeId: 'manipulating',
        },
        {
          text: "If this is genuine... I'll consider it.",
          nextNodeId: 'consider_genuine',
        },
      ],
    },

    {
      id: 'manipulating',
      text: "*He doesn't deny it.* Of course I am. As you are attempting to manipulate me by resisting. All conversation is manipulation. The question is whether the outcome benefits everyone, or only one side. I'm offering mutual benefit.",
      choices: [
        {
          text: "I need to think.",
          nextNodeId: 'need_to_think',
        },
      ],
    },

    {
      id: 'consider_genuine',
      text: "*He nods.* It is genuine. I gain nothing from endless conflict except expenses and headaches. A negotiated peace serves my interests as well as theirs. *He extends his hand.* What do you say?",
      choices: [
        {
          text: '*Shake his hand*',
          nextNodeId: 'accept_offer',
        },
        {
          text: "I'll consider it. Not shaking your hand yet.",
          nextNodeId: 'consider_offer',
        },
      ],
    },

    {
      id: 'more_reasonable',
      text: "*He looks almost offended.* I'm always reasonable. It's merely that reasonable often doesn't align with people's emotional expectations. They want villains and heroes. Reality is more... nuanced.",
      choices: [
        {
          text: "I'm starting to see that.",
          nextNodeId: 'starting_to_see',
        },
      ],
    },

    {
      id: 'starting_to_see',
      text: "*He nods approvingly.* Good. That's the first step to actually accomplishing something in this world. *He gestures to the document.* Will you help me accomplish something worthwhile?",
      choices: [
        {
          text: "Tell me the specifics.",
          nextNodeId: 'specifically_need',
        },
        {
          text: "I need time to think.",
          nextNodeId: 'need_to_think',
        },
      ],
    },

    {
      id: 'whats_in_it',
      text: "*He opens a ledger.* Five hundred dollars up front. Another thousand on successful completion. Plus expenses, protection, and my gratitude - which in this territory is worth more than gold.",
      choices: [
        {
          text: "That's a lot of money.",
          nextNodeId: 'lot_of_money',
        },
        {
          text: "Your gratitude buys me what, exactly?",
          nextNodeId: 'gratitude_worth',
        },
      ],
    },

    {
      id: 'compensation',
      text: "*He taps the desk.* Five hundred dollars immediately. One thousand upon completion. Expenses covered. And my protection - which means no one in this territory touches you without answering to me. In addition, future opportunities with IVRC. Career advancement.",
      choices: [
        {
          text: "A career built on betrayal.",
          nextNodeId: 'career_betrayal',
        },
        {
          text: "That's generous.",
          nextNodeId: 'generous_offer',
        },
        {
          text: "I'm not interested in money.",
          nextNodeId: 'not_interested_money',
        },
      ],
    },

    {
      id: 'lot_of_money',
      text: "*He shrugs.* The Copperheads cost me more than that weekly. You're an investment, not an expense. Succeed, and you'll have earned every penny. Fail... *he pauses* ...well, don't fail.",
      choices: [
        {
          text: "What exactly would I need to do?",
          nextNodeId: 'specifically_need',
        },
      ],
    },

    {
      id: 'gratitude_worth',
      text: "*He smiles thinly.* Doors that open. Problems that disappear. Opportunities that materialize. In this territory, my favor is the most valuable currency there is. It can't be stolen or counterfeited - only earned.",
      choices: [
        {
          text: "I'll think about it.",
          nextNodeId: 'need_to_think',
        },
        {
          text: "What would I need to do first?",
          nextNodeId: 'first_assignment',
        },
      ],
    },

    {
      id: 'career_betrayal',
      text: "*He waves dismissively.* Betrayal is a strong word. The Copperheads are criminals. Providing information about criminals isn't betrayal - it's civic duty. The fact that you're paid for it is merely practical.",
      choices: [
        {
          text: "I need to think.",
          nextNodeId: 'need_to_think',
        },
      ],
    },

    {
      id: 'generous_offer',
      text: "*He nods.* I reward those who serve me well. Ask anyone in my employ. Loyalty is repaid with loyalty. Treachery... *his eyes go cold* ...is repaid in kind.",
      choices: [
        {
          text: "I understand. I'll do it.",
          nextNodeId: 'accept_offer',
        },
        {
          text: "I need time to decide.",
          nextNodeId: 'need_to_think',
        },
      ],
    },

    {
      id: 'not_interested_money',
      text: "*He raises an eyebrow.* Then what does interest you? Everyone wants something. Power? Safety? Revenge? Tell me what you want, and perhaps we can come to an arrangement.",
      choices: [
        {
          text: "Justice.",
          nextNodeId: 'want_justice',
        },
        {
          text: "To understand what's really happening here.",
          nextNodeId: 'want_understanding',
        },
        {
          text: "For people to stop suffering.",
          nextNodeId: 'stop_suffering',
        },
      ],
    },

    {
      id: 'want_justice',
      text: "*He considers.* Justice. A noble goal. But justice requires power to enforce it. Work with me, gain that power, and use it for your 'justice.' That's not compromise - that's strategy.",
      choices: [
        {
          text: "An interesting perspective.",
          nextNodeId: 'interesting_perspective',
        },
        {
          text: "Justice bought with dirty money isn't justice.",
          nextNodeId: 'dirty_money',
        },
      ],
    },

    {
      id: 'interesting_perspective',
      text: "*He nods.* I'm full of them. *He stands.* Think on what I've said. The offer remains open... for now.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offer_pending' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'dirty_money',
      text: "*He sighs.* All money is dirty if you trace it far enough. The question is what you do with it. Build hospitals? Schools? Justice systems? Or let it moulder in righteous poverty?",
      choices: [
        {
          text: "I've heard enough philosophizing.",
          nextNodeId: 'heard_enough',
        },
      ],
    },

    {
      id: 'want_understanding',
      text: "*He tilts his head.* Understanding. That's... unusual. Most people want to act. You want to comprehend. *He considers.* Work with me, and you'll understand more than you ever could from outside. Every secret, every scheme, laid bare.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offers_knowledge' }],
      choices: [
        {
          text: "Knowledge in exchange for service.",
          nextNodeId: 'knowledge_service',
        },
      ],
    },

    {
      id: 'knowledge_service',
      text: "*He nods.* A fair trade. You help me, I help you understand. In time, you might even understand me. *He almost smiles.* I find myself curious what conclusions you'd reach.",
      choices: [
        {
          text: "I'll consider it.",
          nextNodeId: 'consider_offer',
        },
      ],
    },

    {
      id: 'stop_suffering',
      text: "*He's quiet for a moment.* An admirable goal. One I share, believe it or not. *He meets your eyes.* Help me end the Copperhead violence. Fewer raids mean fewer deaths. On both sides.",
      choices: [
        {
          text: "And the suffering your company causes?",
          nextNodeId: 'company_suffering',
        },
      ],
    },

    {
      id: 'company_suffering',
      text: "*He sighs.* Being addressed. Slowly. Reform takes time. Revolution causes more suffering than it prevents. Work within the system - help me prove that gradual change is possible.",
      choices: [
        {
          text: "I want to believe you.",
          nextNodeId: 'want_to_believe',
        },
        {
          text: "Words are easy. Show me proof.",
          nextNodeId: 'show_proof',
        },
      ],
    },

    {
      id: 'want_to_believe',
      text: "*Something genuine flickers in his eyes.* Then give me a chance to prove it. Work with me. Watch me. Hold me accountable. That's more than the Copperheads offer - only destruction, never construction.",
      choices: [
        {
          text: "I'll think about it.",
          nextNodeId: 'need_to_think',
        },
      ],
    },

    {
      id: 'show_proof',
      text: "*He nods slowly.* Fair. *He pulls out a document.* The new safety regulations I've implemented this year. The hospital wing I've funded. The pension system for injured workers. *He slides them across.* Read them. Verify them. Then decide.",
      onEnterEffects: [
        { type: 'give_item', target: 'thorne_reform_documents' },
        { type: 'set_flag', target: 'has_thorne_evidence' },
      ],
      choices: [
        {
          text: "I'll look into this.",
          nextNodeId: 'look_into',
        },
      ],
    },

    {
      id: 'look_into',
      text: "*He nods.* Do. And when you've verified I'm not the monster you assumed, come back. We have much to discuss.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offer_pending' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'specifically_need',
      text: "*He pulls out a map, marks several locations.* Copperhead movements. Meeting points. Communication methods. Who supplies them, who shelters them. The names of their inner circle beyond Diamondback. And eventually - their planned targets.",
      choices: [
        {
          text: "You want me to become one of them.",
          nextNodeId: 'become_one',
        },
        {
          text: "How long would this take?",
          nextNodeId: 'how_long',
        },
      ],
    },

    {
      id: 'become_one',
      text: "*He nods.* As much as necessary. Gain their trust. Learn their secrets. And when the time is right... help me end them. Peacefully if possible. Decisively if not.",
      choices: [
        {
          text: "And if I start to sympathize with them?",
          nextNodeId: 'sympathize',
        },
        {
          text: "I'll do it.",
          nextNodeId: 'accept_offer',
        },
        {
          text: "I can't do this.",
          nextNodeId: 'cant_do_this',
        },
      ],
    },

    {
      id: 'sympathize',
      text: "*He shrugs.* Then you'll understand them better. Which will help you help me. Sympathy and service aren't mutually exclusive. Many of my most effective agents feel for those they monitor. It makes them... thorough.",
      choices: [
        {
          text: "That's... disturbingly pragmatic.",
          nextNodeId: 'disturbingly_pragmatic',
        },
      ],
    },

    {
      id: 'disturbingly_pragmatic',
      text: "*He smiles thinly.* I prefer 'efficiently realistic.' Emotions are tools, like anything else. Use them wisely. *He slides the contract forward.* Your decision?",
      choices: [
        {
          text: "I accept.",
          nextNodeId: 'accept_offer',
        },
        {
          text: "I need time.",
          nextNodeId: 'need_to_think',
        },
        {
          text: "I refuse.",
          nextNodeId: 'decline_offer',
        },
      ],
    },

    {
      id: 'how_long',
      text: "*He shrugs.* Weeks. Months. However long it takes to get genuine access. I'm patient when patience serves. Rush this, and you'll either fail or die. Neither serves my purposes.",
      choices: [
        {
          text: "And I report to you how?",
          nextNodeId: 'reporting',
        },
      ],
    },

    {
      id: 'reporting',
      text: "*He produces a small cipher wheel.* Dead drops at locations I'll provide. Encoded messages only. Never come here unless summoned. The Copperheads have eyes everywhere - including, I suspect, in my own organization.",
      choices: [
        {
          text: "You suspect a mole?",
          nextNodeId: 'mole',
        },
        {
          text: "Understood. I'll do it.",
          nextNodeId: 'accept_offer',
        },
      ],
    },

    {
      id: 'mole',
      text: "*He nods grimly.* They know too much about our shipments. Either they have remarkable intelligence gathering, or someone inside is feeding them information. Finding that person is secondary to your main mission, but... keep your eyes open.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_suspects_mole' }],
      choices: [
        {
          text: "Two targets for one payment?",
          nextNodeId: 'two_targets',
        },
      ],
    },

    {
      id: 'two_targets',
      text: "*He waves dismissively.* Find the mole, and the payment doubles. Consider it a bonus objective. *He extends his hand.* Do we have a deal?",
      choices: [
        {
          text: '*Shake his hand*',
          nextNodeId: 'accept_offer',
        },
        {
          text: "I need to think.",
          nextNodeId: 'need_to_think',
        },
      ],
    },

    {
      id: 'cant_do_this',
      text: "*He sighs.* A pity. I thought you had potential. *He stands.* The door is behind you. But know this - if you choose to oppose me instead, our next meeting will be... less cordial.",
      onEnterEffects: [
        { type: 'set_flag', target: 'refused_thorne_offer' },
        { type: 'change_reputation', value: -10 },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    // ========================================================================
    // RESOLUTION NODES
    // ========================================================================

    {
      id: 'accept_offer',
      text: "*He clasps your hand firmly - a businessman's grip, measuring and measured.* Excellent. I knew you were intelligent. *He produces a purse of coins.* Your advance. My secretary will provide documentation and initial intelligence. *His grip tightens slightly.* Don't disappoint me.",
      expression: 'satisfied',
      onEnterEffects: [
        { type: 'set_flag', target: 'working_for_thorne' },
        { type: 'give_gold', value: 500 },
        { type: 'give_item', target: 'ivrc_cipher_wheel' },
        { type: 'start_quest', target: 'infiltrate_copperheads' },
      ],
      choices: [
        {
          text: "I won't. What's my first move?",
          nextNodeId: 'first_move',
        },
        {
          text: '*Take the money and leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'first_move',
      text: "*He releases your hand.* Make contact. The Copperheads recruit from the desperate - those who've lost land, family, hope. Become such a person. Be seen in the right places, saying the right things. They'll approach you. *He turns back to the window.* Now go. We shouldn't be seen together.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'need_to_think',
      text: "*He nods, unsurprised.* Of course. A decision of this magnitude deserves consideration. *He produces a card.* This will grant you one meeting with me. Use it within the week. After that... *he shrugs* ...the offer may no longer be available.",
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_offer_pending' },
        { type: 'give_item', target: 'thorne_calling_card' },
      ],
      choices: [
        {
          text: '*Take the card and leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'decline_offer',
      text: "*His expression doesn't change, but something cools in his eyes.* Unfortunate. I dislike uncertainty, and you've chosen to remain an unknown quantity. *He stands.* The door is behind you. I hope, for your sake, that our paths don't cross adversarially.",
      expression: 'cold',
      onEnterEffects: [
        { type: 'set_flag', target: 'refused_thorne_offer' },
        { type: 'change_reputation', value: -15 },
      ],
      choices: [
        {
          text: "Is that a threat?",
          nextNodeId: 'final_threat',
        },
        {
          text: '*Leave without a word*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'final_threat',
      text: "*He smiles - a cold expression.* Merely an observation. The territory is dangerous. Those without powerful friends often meet unfortunate ends. I'm offering friendship. You're declining. The consequences are your own.",
      choices: [
        {
          text: "I'll take my chances.",
          nextNodeId: 'take_your_chances',
        },
      ],
    },

    {
      id: 'take_your_chances',
      text: "*He waves dismissively.* As you wish. But don't say you weren't warned. *He turns back to the window, dismissing you.* Goodbye. For now.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'not_for_sale',
      text: "*He raises an eyebrow.* Everyone is for sale. The only question is the currency. Some want gold. Others want power, safety, revenge. What do you want?",
      choices: [
        {
          text: "Justice.",
          nextNodeId: 'want_justice',
        },
        {
          text: "Nothing you can provide.",
          nextNodeId: 'nothing_you_provide',
        },
      ],
    },

    {
      id: 'nothing_you_provide',
      text: "*He looks almost amused.* You haven't even heard my offer yet. How do you know what I can provide? *He gestures.* Sit. Listen. Then decide. That's all I ask.",
      choices: [
        {
          text: "Fine. Talk.",
          nextNodeId: 'job_offer',
        },
        {
          text: "I've heard enough about you to know.",
          nextNodeId: 'heard_enough_know',
        },
      ],
    },

    {
      id: 'heard_enough_know',
      text: "*He sighs.* Rumors. Gossip. The complaints of those I've outcompeted. Not exactly reliable sources. *He shrugs.* But if you've made up your mind before hearing me out, there's nothing to discuss. The door is behind you.",
      onEnterEffects: [
        { type: 'set_flag', target: 'refused_thorne_first_meeting' },
        { type: 'change_reputation', value: -10 },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
        {
          text: "Wait. Maybe I should hear you out.",
          nextNodeId: 'wait_hear_out',
        },
      ],
    },

    {
      id: 'wait_hear_out',
      text: "*A thin smile.* Changed your mind? Good. That shows adaptability. *He gestures to the chair.* Sit. Let's talk business.",
      choices: [
        {
          text: '*Sit*',
          nextNodeId: 'job_offer',
        },
      ],
    },

    {
      id: 'outside_chances',
      text: "*He inclines his head.* Bold. Foolish, perhaps, but bold. *He returns to his chair.* Very well. We'll see which of us proves correct. *He waves dismissively.* You may go. But don't be surprised when our paths cross again.",
      onEnterEffects: [
        { type: 'set_flag', target: 'refused_thorne_offer' },
        { type: 'change_reputation', value: -10 },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'tyrant_refusal',
      text: "*His expression hardens.* Tyrant. Such dramatic language. *He stands slowly.* Very well. If I'm a tyrant, then you're a rebel. And rebels, historically, don't fare well against established power. *He turns to the window.* You may go. Our next meeting will be less... optional.",
      expression: 'cold',
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_enemy' },
        { type: 'change_reputation', value: -20 },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'not_interested_spy',
      text: "*He nods slowly.* Principled. Or naive. The distinction often depends on outcomes. *He stands.* The offer remains open, should you reconsider. But don't take too long. My patience, like my generosity, has limits.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offer_pending' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'cant_help',
      text: "*He sighs.* A pity. You have potential. But potential unrealized is worthless. *He waves dismissively.* The door is behind you. Perhaps we'll speak again when you've had time to... reconsider your position.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offer_pending' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'cant_work_for',
      text: "*His expression remains neutral.* Can't, or won't? There's a difference. 'Can't' suggests obstacle. 'Won't' suggests choice. Which is it?",
      choices: [
        {
          text: "Won't. I choose not to serve you.",
          nextNodeId: 'choose_not_serve',
        },
        {
          text: "Can't. My conscience won't allow it.",
          nextNodeId: 'conscience_wont',
        },
      ],
    },

    {
      id: 'choose_not_serve',
      text: "*He nods slowly.* A choice. I respect that, even if I disagree with it. *He stands.* You've made your position clear. As I'll make mine: don't become my enemy. Opposition I can tolerate. Obstruction I cannot.",
      onEnterEffects: [
        { type: 'set_flag', target: 'refused_thorne_offer' },
        { type: 'change_reputation', value: -10 },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'conscience_wont',
      text: "*Something flickers in his eyes - contempt? Envy?* Conscience. How... limiting. *He turns away.* Go. Hold onto your conscience. It's more than most people have. *His voice hardens.* But know that it won't protect you from consequences.",
      expression: 'complex',
      onEnterEffects: [
        { type: 'set_flag', target: 'refused_thorne_offer' },
        { type: 'set_flag', target: 'thorne_noted_conscience' },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'against_you',
      text: "*His expression goes cold.* Against me. How... definitive. *He stands slowly.* Then we have nothing more to discuss. The next time we meet, it will be as adversaries. I suggest you prepare accordingly.",
      expression: 'cold',
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_enemy' },
        { type: 'change_reputation', value: -25 },
      ],
      choices: [
        {
          text: "So be it.",
          nextNodeId: 'so_be_it',
        },
      ],
    },

    {
      id: 'so_be_it',
      text: "*He nods once.* So be it. *He turns back to the window.* You may show yourself out. And... watch your back. The territory has become very dangerous of late.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },
  ],
};

// ============================================================================
// SECOND MEETING - Based on player's previous choices
// ============================================================================

export const ThorneSecondMeeting: DialogueTree = {
  id: 'thorne_second_meeting',
  name: 'Cornelius Thorne - Second Meeting',
  description: 'Follow-up meeting based on player relationship with Thorne',
  tags: ['ivrc_headquarters', 'main_quest', 'antagonist', 'act2'],

  entryPoints: [
    {
      nodeId: 'loyal_agent_return',
      conditions: [{ type: 'flag_set', target: 'working_for_thorne' }],
      priority: 15,
    },
    {
      nodeId: 'negotiator_return',
      conditions: [{ type: 'flag_set', target: 'working_for_thorne_negotiate' }],
      priority: 14,
    },
    {
      nodeId: 'enemy_return',
      conditions: [{ type: 'flag_set', target: 'thorne_enemy' }],
      priority: 12,
    },
    {
      nodeId: 'pending_offer_return',
      conditions: [{ type: 'flag_set', target: 'thorne_offer_pending' }],
      priority: 10,
    },
    {
      nodeId: 'refused_return',
      conditions: [{ type: 'flag_set', target: 'refused_thorne_offer' }],
      priority: 8,
    },
  ],

  nodes: [
    // Working for Thorne - loyal agent path
    {
      id: 'loyal_agent_return',
      text: "*Thorne looks up from a stack of papers as you enter.* Ah, my operative returns. *He sets down his pen.* I trust you have something to report? The Copperhead situation grows more pressing by the day.",
      expression: 'expectant',
      choices: [
        {
          text: "I've made contact with the Copperheads.",
          nextNodeId: 'made_contact',
          conditions: [{ type: 'flag_set', target: 'met_diamondback' }],
        },
        {
          text: "I'm still working on gaining their trust.",
          nextNodeId: 'still_working',
        },
        {
          text: "I've learned something important about IVRC.",
          nextNodeId: 'learned_about_ivrc',
          conditions: [{ type: 'flag_set', target: 'found_ivrc_evidence' }],
        },
        {
          text: "I want to renegotiate our arrangement.",
          nextNodeId: 'renegotiate',
        },
      ],
    },

    {
      id: 'made_contact',
      text: "*He leans forward, genuinely interested.* You've met Diamondback herself? Impressive. Most who seek her out don't return. *He steeples his fingers.* Tell me everything. Her disposition, her forces, her plans.",
      expression: 'eager',
      choices: [
        {
          text: '*Tell him truthful information*',
          nextNodeId: 'truthful_report',
        },
        {
          text: '*Give him misleading information*',
          nextNodeId: 'misleading_report',
        },
        {
          text: "I'll tell you, but first - I have questions.",
          nextNodeId: 'questions_first',
        },
      ],
    },

    {
      id: 'truthful_report',
      text: "*He listens intently, occasionally making notes.* Excellent work. This confirms some of my suspicions and reveals much I didn't know. *He slides a purse across the desk.* Your bonus. Continue your infiltration. The deeper you go, the more valuable you become.",
      onEnterEffects: [
        { type: 'give_gold', value: 300 },
        { type: 'set_flag', target: 'betrayed_copperheads_to_thorne' },
      ],
      choices: [
        {
          text: "What will you do with this information?",
          nextNodeId: 'what_will_do',
        },
        {
          text: '*Take the money and leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'what_will_do',
      text: "*He considers.* Prepare. Position assets. When the time comes to move against them, I want every advantage. *He meets your eyes.* Don't worry - I won't act precipitously. The information you gather will determine how we proceed. Peacefully, if possible.",
      choices: [
        {
          text: "I hope you mean that.",
          nextNodeId: 'hope_mean_it',
        },
        {
          text: '*Nod and leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'hope_mean_it',
      text: "*He holds your gaze.* I'm not a monster, despite what you've heard. Dead Copperheads are worthless. Converted ones, reformed ones, imprisoned ones - those have value. *He waves dismissively.* Continue your work. We'll speak again soon.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'misleading_report',
      text: "*He listens, but something in his eyes sharpens.* Interesting. Some of that contradicts other intelligence I've received. *He leans back.* You wouldn't be holding back on me, would you?",
      expression: 'suspicious',
      choices: [
        {
          text: "Your other intelligence may be wrong.",
          nextNodeId: 'other_intel_wrong',
        },
        {
          text: "I only report what I've seen.",
          nextNodeId: 'only_seen',
        },
        {
          text: '*Stay silent*',
          nextNodeId: 'stay_silent',
        },
      ],
    },

    {
      id: 'other_intel_wrong',
      text: "*He considers this.* Possible. My network isn't infallible. *But suspicion lingers in his gaze.* Very well. Continue your work. But remember - I reward loyalty, and I punish betrayal. Make sure you're on the right side of that equation.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_suspicious_of_player' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'only_seen',
      text: "*He nods slowly.* Of course. You can only report your observations. *He slides a smaller purse across.* Your payment. Keep watching. And remember who pays your salary.",
      onEnterEffects: [{ type: 'give_gold', value: 150 }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'stay_silent',
      text: "*His eyes narrow.* Silence. How... telling. *He stands slowly.* I'm a patient man, but my patience has limits. The next time we meet, I expect candor. Are we clear?",
      expression: 'threatening',
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_distrusts_player' }],
      choices: [
        {
          text: "Crystal clear.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'questions_first',
      text: "*He tilts his head.* Questions? You're in my employ. I ask questions, you provide answers. *But he settles back.* However... I reward initiative. Ask your questions. Then we'll discuss what you've learned.",
      choices: [
        {
          text: "What did you really do to Diamondback? To turn her into this?",
          nextNodeId: 'diamondback_truth',
        },
        {
          text: "The Ironpick documents - do they exist?",
          nextNodeId: 'ironpick_truth',
        },
        {
          text: "Why do you really want the Copperheads destroyed?",
          nextNodeId: 'real_reason',
        },
      ],
    },

    {
      id: 'diamondback_truth',
      text: "*He's silent for a long moment.* She discovered communications about... a mining accident. One we could have prevented. Should have prevented. *He looks away.* I had her silenced. Discredited. Threatened. She chose to fight back rather than disappear quietly. I... underestimated her resolve.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_admits_fault' }],
      expression: 'troubled',
      choices: [
        {
          text: "You created your own enemy.",
          nextNodeId: 'created_enemy',
        },
        {
          text: "Thank you for being honest.",
          nextNodeId: 'thanks_honest',
        },
      ],
    },

    {
      id: 'created_enemy',
      text: "*He nods slowly.* Yes. I did. One of my many mistakes, though not the worst. *He meets your eyes.* But understanding the past doesn't change the present. She's a threat now, regardless of how she became one. What do we do about it?",
      choices: [
        {
          text: "Maybe the truth could end this peacefully.",
          nextNodeId: 'truth_peace',
        },
        {
          text: "I don't know.",
          nextNodeId: 'dont_know',
        },
      ],
    },

    {
      id: 'truth_peace',
      text: "*He laughs bitterly.* You think admitting fault would satisfy her? After years of violence, of friends lost, of revenge sworn? *He shakes his head.* Some wounds don't heal with apology. Some can only be... cauterized.",
      choices: [
        {
          text: "You haven't even tried.",
          nextNodeId: 'havent_tried',
        },
        {
          text: "Maybe you're right.",
          nextNodeId: 'maybe_right',
        },
      ],
    },

    {
      id: 'havent_tried',
      text: "*Something genuine flickers across his face.* No. I haven't. *He's quiet.* Perhaps... if there were a mediator. Someone both sides might trust. *He looks at you meaningfully.* Would you be willing to carry a message?",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_offers_peace_mission' }],
      choices: [
        {
          text: "What message?",
          nextNodeId: 'what_message',
        },
        {
          text: "She wouldn't listen to anything from you.",
          nextNodeId: 'wouldnt_listen',
        },
      ],
    },

    {
      id: 'what_message',
      text: "*He moves to his desk, writes quickly.* An offer. Amnesty for her followers. A commission to investigate past wrongs. And... *he pauses* ...a public acknowledgment that IVRC made mistakes. It's more than I've ever offered anyone.",
      onEnterEffects: [
        { type: 'give_item', target: 'thorne_peace_letter' },
        { type: 'start_quest', target: 'deliver_peace_offer' },
      ],
      choices: [
        {
          text: "I'll deliver it. But I make no promises about her response.",
          nextNodeId: 'no_promises_peace',
        },
      ],
    },

    {
      id: 'no_promises_peace',
      text: "*He nods.* I expect none. But the attempt must be made. If she refuses... *his expression hardens* ...at least I can say I tried. And the consequences will be on her head, not mine.",
      choices: [
        {
          text: '*Take the letter and leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'wouldnt_listen',
      text: "*He sighs.* Probably not. But failure to try is also a choice. *He waves dismissively.* Perhaps you're right. Perhaps this ends only one way. Continue your work. We'll find another path.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'maybe_right',
      text: "*He nods grimly.* I usually am. Much as I wish otherwise. *He straightens.* Now - your report. What have you learned?",
      choices: [
        {
          text: '*Give your report*',
          nextNodeId: 'truthful_report',
        },
      ],
    },

    {
      id: 'thanks_honest',
      text: "*He looks almost surprised.* Honest. Yes. A rare commodity in my world. *He sighs.* Now you understand why I wanted you - someone who might see past the monster others have made me into. Report what you've learned. Please.",
      choices: [
        {
          text: '*Give your report*',
          nextNodeId: 'truthful_report',
        },
      ],
    },

    {
      id: 'dont_know',
      text: "*He nods slowly.* Neither do I. That's the tragedy of it. Two people locked in a cycle neither can escape. *He composes himself.* But dwelling on regret accomplishes nothing. Your report, please.",
      choices: [
        {
          text: '*Give your report*',
          nextNodeId: 'truthful_report',
        },
      ],
    },

    {
      id: 'ironpick_truth',
      text: "*His face goes carefully blank.* The Ironpick documents. You've heard of them, then. *He's silent for a moment.* Yes. They exist. Copies of internal communications, safety reports, financial records. If made public, they would be... damaging.",
      expression: 'guarded',
      choices: [
        {
          text: "Damaging enough to bring you down?",
          nextNodeId: 'bring_down',
        },
        {
          text: "Where are they?",
          nextNodeId: 'where_documents',
        },
      ],
    },

    {
      id: 'bring_down',
      text: "*He considers.* Possibly. They show decisions that... in retrospect... should have been made differently. Deaths that could have been prevented. *He meets your eyes.* But context matters. The pressures we were under, the alternatives available. Without that context, the documents tell only part of the story.",
      choices: [
        {
          text: "That sounds like excuses.",
          nextNodeId: 'sounds_excuses',
        },
        {
          text: "Context is important.",
          nextNodeId: 'context_important',
        },
      ],
    },

    {
      id: 'sounds_excuses',
      text: "*He doesn't argue.* Perhaps. But excuses and explanations aren't the same thing. I've done things I regret. The documents prove that. But destroying me won't undo those things. It will only destabilize the territory and cause more suffering.",
      choices: [
        {
          text: "That's convenient for you.",
          nextNodeId: 'convenient_you',
        },
      ],
    },

    {
      id: 'convenient_you',
      text: "*He nods slowly.* It is. I won't pretend otherwise. Self-interest and public interest sometimes align. *He leans forward.* The question is - what do you want? To punish the past, or to improve the future?",
      choices: [
        {
          text: "Why not both?",
          nextNodeId: 'why_not_both',
        },
      ],
    },

    {
      id: 'why_not_both',
      text: "*He's quiet for a long moment.* Perhaps you can. I'm not certain anymore what's possible. *He stands.* Find the documents if you wish. See what they contain. Then decide what to do. I can't stop you. I can only... hope you choose wisely.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_accepts_fate' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'context_important',
      text: "*He relaxes slightly.* Yes. It is. And the documents lack that context. Which is why I've kept them suppressed - not destroyed. *He pauses.* If you find them, bring them to me. Let me explain what they mean before you decide what to do with them.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_wants_to_explain' }],
      choices: [
        {
          text: "I'll consider it.",
          nextNodeId: 'consider_it',
        },
      ],
    },

    {
      id: 'consider_it',
      text: "*He nods.* That's all I ask. Consider. Think. Don't act on anger or incomplete information. *He gestures to the door.* Now - was there anything else?",
      choices: [
        {
          text: "No. I'll be in touch.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'where_documents',
      text: "*He shakes his head.* I don't know precisely. Old Samuel Ironpick has them hidden somewhere in the mountains. I've tried to find them for years. *He looks at you sharply.* Is that why you joined me? To find those documents?",
      choices: [
        {
          text: "Among other reasons.",
          nextNodeId: 'among_reasons',
        },
        {
          text: "No. I'm genuinely working for you.",
          nextNodeId: 'genuinely_working',
        },
      ],
    },

    {
      id: 'among_reasons',
      text: "*He laughs softly.* Honest. I appreciate that more than you know. *He leans back.* Find them if you can. But think carefully about what you do with them. Releasing them wouldn't just hurt me - it would destabilize everything I've built. Good and bad.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'genuinely_working',
      text: "*He studies you.* Are you? I'd like to believe that. But trust is... difficult for me. *He waves dismissively.* Continue your work. Prove your loyalty through actions. Words are cheap.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'real_reason',
      text: "*He's quiet for a moment.* The real reason? *He looks out the window.* Because I'm afraid. They represent chaos. Unpredictability. Everything I've built could come crashing down if they succeed. And I've given my life to this territory. I can't watch it burn.",
      expression: 'vulnerable',
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_admits_fear' }],
      choices: [
        {
          text: "That's more honest than I expected.",
          nextNodeId: 'honest_expected',
        },
        {
          text: "Maybe change isn't the same as burning.",
          nextNodeId: 'change_not_burning',
        },
      ],
    },

    {
      id: 'honest_expected',
      text: "*He almost smiles.* Fear is honest. It's the one thing I can't pretend away. *He straightens.* Now you know. Use that knowledge as you will. But remember - a cornered animal is the most dangerous.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'change_not_burning',
      text: "*He considers this.* Perhaps not. But controlled change, managed change - that I can work with. The Copperheads don't want that. They want revolution. And revolutions devour everyone, including those who start them.",
      choices: [
        {
          text: "Some revolutions are necessary.",
          nextNodeId: 'necessary_revolution',
        },
        {
          text: "You might be right.",
          nextNodeId: 'might_be_right',
        },
      ],
    },

    {
      id: 'necessary_revolution',
      text: "*He meets your eyes.* Perhaps. But not this one. Not now. The territory isn't ready. The people aren't ready. *He sighs.* Help me find a better way. Please.",
      choices: [
        {
          text: "I'll try.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'might_be_right',
      text: "*He nods slowly.* I often am. It's a burden as much as a gift. *He waves.* Go. Continue your work. We'll speak again when you have more to report.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'still_working',
      text: "*He frowns.* Still working. That's not particularly helpful. I need results, not efforts. *He drums his fingers on the desk.* What's the obstacle? Resources? Access? Information?",
      expression: 'impatient',
      choices: [
        {
          text: "Trust takes time to build.",
          nextNodeId: 'trust_takes_time',
        },
        {
          text: "I need more money for expenses.",
          nextNodeId: 'more_money',
        },
        {
          text: "I'm having second thoughts about this.",
          nextNodeId: 'second_thoughts',
        },
      ],
    },

    {
      id: 'trust_takes_time',
      text: "*He forces himself to calm.* Yes. It does. I forget that sometimes, surrounded by people who obey instantly. *He nods.* Take the time you need. But don't take too long. The situation deteriorates daily.",
      choices: [
        {
          text: "I understand.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'more_money',
      text: "*He raises an eyebrow but produces a smaller purse.* Expenses. Don't make a habit of this - I pay for results, not preparation. *He slides it across.* Now go. Prepare. And bring me something useful next time.",
      onEnterEffects: [{ type: 'give_gold', value: 100 }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'second_thoughts',
      text: "*His expression hardens.* Second thoughts. How... inconvenient. You've taken my money. You know my plans. And now you're having 'second thoughts'? *He stands slowly.* Explain yourself. Carefully.",
      expression: 'threatening',
      choices: [
        {
          text: "I didn't realize what I was getting into.",
          nextNodeId: 'didnt_realize',
        },
        {
          text: "The Copperheads aren't what you said they were.",
          nextNodeId: 'not_what_said',
        },
        {
          text: "I want out of our arrangement.",
          nextNodeId: 'want_out',
        },
      ],
    },

    {
      id: 'didnt_realize',
      text: "*He sighs.* No one ever does. The reality of difficult work is always harder than the imagination of it. *He sits back down.* But you committed. And I expect you to honor that commitment. Or there will be... consequences.",
      choices: [
        {
          text: "I'll continue. For now.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'not_what_said',
      text: "*He tilts his head.* Oh? And what are they, in your newfound wisdom? Freedom fighters? Misunderstood victims? *His voice hardens.* They're criminals. Whatever their motivations, they steal, they kill, they destroy. That doesn't change because you've grown sympathetic.",
      choices: [
        {
          text: "Maybe the line between criminal and freedom fighter isn't so clear.",
          nextNodeId: 'line_not_clear',
        },
        {
          text: "You're right. I'll continue.",
          nextNodeId: 'youre_right_continue',
        },
      ],
    },

    {
      id: 'line_not_clear',
      text: "*He stands abruptly.* Don't quote philosophy at me. I've killed men who quoted philosophy. *He leans on the desk.* You work for me. You will complete your mission. Or you will become a different kind of example. Choose.",
      expression: 'dangerous',
      choices: [
        {
          text: "I'll complete the mission.",
          nextNodeId: 'complete_mission',
        },
        {
          text: "Don't threaten me.",
          nextNodeId: 'dont_threaten',
        },
      ],
    },

    {
      id: 'complete_mission',
      text: "*He relaxes slightly.* Good. That's what I wanted to hear. *He returns to his seat.* I understand this is difficult. War is difficult. But we're on the same side. Remember that.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'dont_threaten',
      text: "*His eyes go cold.* Or what? You'll join them? Become another outlaw for my men to hunt? *He shakes his head.* I'm offering you a chance to walk away from this conversation with your position intact. Take it. Don't make me regret my generosity.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_relationship_strained' }],
      choices: [
        {
          text: '*Leave in silence*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'youre_right_continue',
      text: "*He nods.* Good. Moral complexity is a luxury for those not engaged in the struggle. We're engaged. Focus on the task. *He waves dismissively.* Go. And bring me results next time.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'want_out',
      text: "*He laughs - a cold, humorless sound.* Out? You want out? After taking my money, learning my secrets, infiltrating at my direction? *He shakes his head.* There is no 'out.' There is only forward, or... *he pauses* ...permanent retirement.",
      expression: 'threatening',
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_threatens_player' }],
      choices: [
        {
          text: "You wouldn't dare.",
          nextNodeId: 'wouldnt_dare',
        },
        {
          text: "Fine. I'll continue.",
          nextNodeId: 'fine_continue',
        },
        {
          text: "*Say nothing and leave*",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'wouldnt_dare',
      text: "*He smiles thinly.* Dare? I've dared much more than disposing of one troublesome operative. Don't test me. *He gestures to the door.* Go. Complete your mission. And pray we never have this conversation again.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'fine_continue',
      text: "*He nods.* Wise choice. Self-preservation is underrated. *He waves dismissively.* Go. Work. Succeed. We'll speak again when you have something worth hearing.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'learned_about_ivrc',
      text: "*He goes very still.* About IVRC? What, precisely, have you learned?",
      expression: 'guarded',
      choices: [
        {
          text: "The mole you suspected - I know who it is.",
          nextNodeId: 'know_mole',
          conditions: [{ type: 'flag_set', target: 'discovered_mole_identity' }],
        },
        {
          text: "I found evidence of the mining cover-ups.",
          nextNodeId: 'found_evidence',
          conditions: [{ type: 'flag_set', target: 'found_mining_evidence' }],
        },
        {
          text: "I know about Victoria Ashworth's real mission.",
          nextNodeId: 'ashworth_mission',
          conditions: [{ type: 'flag_set', target: 'learned_ashworth_plan' }],
        },
      ],
    },

    {
      id: 'know_mole',
      text: "*His eyes sharpen.* The mole. Tell me. Now.",
      expression: 'intense',
      choices: [
        {
          text: "*Reveal the mole's identity*",
          nextNodeId: 'reveal_mole',
        },
        {
          text: "First, I want assurances about what happens to them.",
          nextNodeId: 'assurances_mole',
        },
      ],
    },

    {
      id: 'reveal_mole',
      text: "*He listens, then nods slowly.* I suspected. But I needed confirmation. *He produces a significant purse.* You've earned this. The mole will be... dealt with. *His expression is grim.* Quietly. Professionally. No unnecessary suffering.",
      onEnterEffects: [
        { type: 'give_gold', value: 500 },
        { type: 'set_flag', target: 'revealed_mole_to_thorne' },
      ],
      choices: [
        {
          text: "'Dealt with.' You mean killed.",
          nextNodeId: 'dealt_with_killed',
        },
        {
          text: '*Take the money and leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'dealt_with_killed',
      text: "*He doesn't deny it.* Traitors cannot be allowed to remain. It sends the wrong message. *He meets your eyes.* You disapprove. I see that. But this is how empires are maintained. Through consequences.",
      choices: [
        {
          text: "I've made my choice. I'll live with it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'assurances_mole',
      text: "*He frowns.* Assurances? They betrayed IVRC. Betrayed me. What assurances would you have me give?",
      choices: [
        {
          text: "Exile instead of death.",
          nextNodeId: 'exile_instead',
        },
        {
          text: "Never mind. Here's what I know.",
          nextNodeId: 'reveal_mole',
        },
      ],
    },

    {
      id: 'exile_instead',
      text: "*He considers.* Exile. With what I know about their betrayal hanging over them. *He nods slowly.* Very well. They'll be given the opportunity to disappear. Permanently. If they refuse... *he shrugs* ...that's their choice.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_agrees_exile' }],
      choices: [
        {
          text: "That's acceptable. Here's what I know.",
          nextNodeId: 'reveal_mole',
        },
      ],
    },

    {
      id: 'found_evidence',
      text: "*His face goes carefully blank.* Evidence. Of what nature?",
      choices: [
        {
          text: "Documents showing IVRC knew about unsafe conditions. Before the accidents.",
          nextNodeId: 'knew_unsafe',
        },
        {
          text: "Records of bribes to safety inspectors.",
          nextNodeId: 'bribe_records',
        },
      ],
    },

    {
      id: 'knew_unsafe',
      text: "*He's silent for a long moment.* Yes. We knew. Some of us. *He looks away.* The calculations said the risk was acceptable. The calculations were wrong. *He meets your eyes.* What do you intend to do with this evidence?",
      expression: 'weary',
      choices: [
        {
          text: "I haven't decided yet.",
          nextNodeId: 'havent_decided',
        },
        {
          text: "Make it public. People deserve to know.",
          nextNodeId: 'make_public',
        },
        {
          text: "Use it to force reforms.",
          nextNodeId: 'force_reforms',
        },
      ],
    },

    {
      id: 'havent_decided',
      text: "*He nods.* Then let me make a case. Those deaths happened. Nothing changes that. But destroying IVRC won't bring them back. It will only cause more suffering. Let me... make amends. Quietly. Effectively.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_asks_mercy' }],
      choices: [
        {
          text: "What kind of amends?",
          nextNodeId: 'what_amends',
        },
        {
          text: "I don't trust quiet amends.",
          nextNodeId: 'dont_trust_quiet',
        },
      ],
    },

    {
      id: 'what_amends',
      text: "*He thinks.* Compensation for families. New safety protocols. Independent oversight. Public memorial for those lost. *He meets your eyes.* It's not justice in the way you imagine it. But it's something. Something real.",
      choices: [
        {
          text: "I'll think about it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'dont_trust_quiet',
      text: "*He sighs.* Then we're at an impasse. You hold leverage over me. I can't stop you from using it. *He looks tired.* Do what you think is right. I'll face the consequences.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_resigned_to_fate' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'make_public',
      text: "*He stands slowly.* Then you've made your choice. And I've made mine. *His expression hardens.* I hoped we could be allies. It seems we're to be adversaries instead. Leave now. While you still can.",
      expression: 'cold',
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_enemy' },
        { type: 'change_reputation', value: -30 },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'force_reforms',
      text: "*He considers this.* Reforms. Not destruction. *Something like hope flickers in his eyes.* What reforms? Be specific.",
      choices: [
        {
          text: "Independent safety inspections. Worker representation. Fair wages.",
          nextNodeId: 'reform_demands',
        },
      ],
    },

    {
      id: 'reform_demands',
      text: "*He's quiet for a long moment.* All of that would cost money. Significant money. IVRC shareholders would object. *But he doesn't refuse.* However... if the alternative is public exposure... perhaps they can be convinced.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_considers_reform' }],
      choices: [
        {
          text: "Then we have a basis for negotiation.",
          nextNodeId: 'basis_negotiation',
        },
      ],
    },

    {
      id: 'basis_negotiation',
      text: "*He nods slowly.* It seems we do. *He extends his hand - not a handshake of friendship, but of agreement.* You're a more formidable opponent than I anticipated. Perhaps... partner is the better word.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_reform_partnership' }],
      choices: [
        {
          text: '*Shake his hand*',
          nextNodeId: 'reform_agreement',
        },
        {
          text: "I'll see results before I shake your hand.",
          nextNodeId: 'results_first',
        },
      ],
    },

    {
      id: 'reform_agreement',
      text: "*His grip is firm.* Then we begin. Draft your demands formally. I'll present them to the board as my own initiative. *He releases your hand.* Don't make me regret this. I dislike regret.",
      onEnterEffects: [{ type: 'start_quest', target: 'negotiate_ivrc_reforms' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'results_first',
      text: "*He withdraws his hand without offense.* Fair. Trust is earned, not given. I'll implement the first reforms. When you see them taking effect, we'll shake hands. *He nods.* Until then.",
      onEnterEffects: [{ type: 'start_quest', target: 'verify_ivrc_reforms' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'bribe_records',
      text: "*His expression goes cold.* Bribes. Yes. That's how the system works. Everyone bribes everyone. The inspectors, the politicians, the judges. *He spreads his hands.* Expose me for bribing, and you expose how the entire territory functions. Is that what you want?",
      choices: [
        {
          text: "Maybe the whole system needs exposure.",
          nextNodeId: 'system_exposure',
        },
        {
          text: "I want you to change, not everyone.",
          nextNodeId: 'change_you',
        },
      ],
    },

    {
      id: 'system_exposure',
      text: "*He laughs bitterly.* An idealist. How refreshing. And how naive. Expose the system, and it doesn't change - it just hides better. The corruption remains. Only the faces change. *He shakes his head.* But do what you must.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'change_you',
      text: "*He tilts his head.* Change me. How? I am what circumstances made me. *But something shifts in his expression.* Although... if the right circumstances were created... perhaps even I could become something different.",
      choices: [
        {
          text: "Then let's create those circumstances.",
          nextNodeId: 'create_circumstances',
        },
      ],
    },

    {
      id: 'create_circumstances',
      text: "*He looks at you with something like wonder.* You actually believe that's possible. After everything you've learned about me. *He's quiet.* Perhaps... perhaps you're right. Or perhaps you're a fool. But either way... I find myself wanting to try.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_reformation_possible' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ashworth_mission',
      text: "*He freezes.* Victoria's mission. *His voice is very careful.* And what do you believe that mission to be?",
      expression: 'guarded',
      choices: [
        {
          text: "She's here to replace you. The board thinks you've lost control.",
          nextNodeId: 'replace_you',
        },
        {
          text: "She's planning something beyond the Copperheads. Something bigger.",
          nextNodeId: 'something_bigger',
        },
      ],
    },

    {
      id: 'replace_you',
      text: "*He's silent for a long moment.* So. They've finally decided. *He looks old suddenly - tired.* I built this territory. Every mile of track, every mine shaft, every town. And they think they can simply... remove me.",
      expression: 'defeated',
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_knows_replacement' }],
      choices: [
        {
          text: "I thought you should know.",
          nextNodeId: 'should_know',
        },
        {
          text: "What will you do?",
          nextNodeId: 'what_will_do_replacement',
        },
      ],
    },

    {
      id: 'should_know',
      text: "*He nods slowly.* Thank you. Whatever our differences, you've given me warning. That's... more than I expected. *He straightens.* I have preparations to make. We'll speak again. Soon.",
      onEnterEffects: [{ type: 'change_reputation', value: 15 }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'what_will_do_replacement',
      text: "*He looks at his hands.* I don't know. Fight? Negotiate? Accept the inevitable? *He looks up.* What would you do, in my position?",
      choices: [
        {
          text: "Fight. You've built too much to surrender it.",
          nextNodeId: 'advise_fight',
        },
        {
          text: "Maybe it's time to let go.",
          nextNodeId: 'advise_let_go',
        },
        {
          text: "Find allies. You're not alone in this.",
          nextNodeId: 'advise_allies',
        },
      ],
    },

    {
      id: 'advise_fight',
      text: "*He nods slowly.* Fight. Yes. I've fought my whole life. Why stop now? *He straightens.* Thank you. For the warning, and for the counsel. I won't forget this.",
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_will_fight_board' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'advise_let_go',
      text: "*He laughs softly.* Let go. Of everything I've built. Everything I've sacrificed for. *He's quiet.* Perhaps you're right. Perhaps it's time. *He looks very tired.* Thank you for your honesty.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_considers_retirement' }],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'advise_allies',
      text: "*His eyes sharpen.* Allies. The Freeminers? The Copperheads? *He laughs bitterly.* My enemies, as allies against a common foe. How ironic. *But something shifts in his expression.* Although... if Victoria threatens them too...",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_considers_alliance' }],
      choices: [
        {
          text: "Stranger alliances have been made.",
          nextNodeId: 'stranger_alliances',
        },
      ],
    },

    {
      id: 'stranger_alliances',
      text: "*He nods slowly.* They have. History is full of them. *He meets your eyes.* Would you help facilitate such an alliance? If it meant saving all of us from Victoria's plans?",
      choices: [
        {
          text: "I'll try.",
          nextNodeId: 'try_alliance',
        },
        {
          text: "I'd need guarantees. For everyone.",
          nextNodeId: 'need_guarantees',
        },
      ],
    },

    {
      id: 'try_alliance',
      text: "*He extends his hand.* Then we're partners. Not friends - I'm not sure I know how to have those anymore. But partners, at least, against a common threat.",
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_alliance_partner' },
        { type: 'start_quest', target: 'forge_alliance' },
      ],
      choices: [
        {
          text: '*Shake his hand*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'need_guarantees',
      text: "*He nods.* Fair. What guarantees?",
      choices: [
        {
          text: "Amnesty for the Copperheads. Fair treatment for the Freeminers. Reform for IVRC.",
          nextNodeId: 'full_guarantees',
        },
      ],
    },

    {
      id: 'full_guarantees',
      text: "*He's quiet for a long moment.* You ask much. But desperate times call for desperate measures. *He nods.* If this alliance succeeds, those will be my priorities. I swear it.",
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_sworn_guarantees' },
        { type: 'start_quest', target: 'forge_alliance' },
      ],
      choices: [
        {
          text: "Then we have an agreement.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'something_bigger',
      text: "*He leans forward.* Bigger? What do you mean?",
      choices: [
        {
          text: "She's planning to provoke a conflict. Use it to justify martial law.",
          nextNodeId: 'martial_law',
        },
        {
          text: "There are plans to eliminate all opposition - Copperheads, Freeminers, and you.",
          nextNodeId: 'eliminate_all',
        },
      ],
    },

    {
      id: 'martial_law',
      text: "*His face goes pale.* Martial law. Under federal authority. IVRC would lose everything... *He stands abruptly.* This is worse than I thought. Victoria isn't just replacing me - she's dismantling the entire structure.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_learns_martial_law' }],
      choices: [
        {
          text: "You need allies. Now.",
          nextNodeId: 'advise_allies',
        },
      ],
    },

    {
      id: 'eliminate_all',
      text: "*He goes very still.* All of us. A clean slate. *He laughs bitterly.* And they call me ruthless. *He meets your eyes.* Then we're all in danger. All of us. And perhaps... perhaps we should stop fighting each other.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_realizes_common_enemy' }],
      choices: [
        {
          text: "That's what I've been trying to tell you.",
          nextNodeId: 'been_telling',
        },
      ],
    },

    {
      id: 'been_telling',
      text: "*He nods slowly.* And I wasn't listening. Too focused on old enemies to see the new one. *He extends his hand.* Help me. Help all of us. Together, we might survive this.",
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_alliance_partner' },
        { type: 'start_quest', target: 'unite_factions' },
      ],
      choices: [
        {
          text: '*Shake his hand*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'renegotiate',
      text: "*He raises an eyebrow.* Renegotiate? You've barely begun your assignment. What could possibly need renegotiation?",
      choices: [
        {
          text: "The scope has changed. I need more resources.",
          nextNodeId: 'more_resources',
        },
        {
          text: "I want different terms. Less violence.",
          nextNodeId: 'less_violence',
        },
        {
          text: "I want to switch sides.",
          nextNodeId: 'switch_sides',
        },
      ],
    },

    {
      id: 'more_resources',
      text: "*He drums his fingers.* More resources for what, specifically?",
      choices: [
        {
          text: "The Copperheads are more organized than you thought. I need backup.",
          nextNodeId: 'need_backup',
        },
      ],
    },

    {
      id: 'need_backup',
      text: "*He considers.* I can provide discreet support. Not direct - that would blow your cover. But emergency extraction, if needed. Safe houses. Medical supplies. *He nods.* Done. What else?",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_provides_backup' }],
      choices: [
        {
          text: "That's sufficient. Thank you.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'less_violence',
      text: "*He frowns.* Less violence. And how do you propose to neutralize the Copperheads without violence?",
      choices: [
        {
          text: "Negotiation. Real negotiation.",
          nextNodeId: 'real_negotiation',
        },
        {
          text: "Turn them against each other. Let them destroy themselves.",
          nextNodeId: 'turn_against',
        },
      ],
    },

    {
      id: 'real_negotiation',
      text: "*He sighs.* We've discussed this. Diamondback doesn't want peace - she wants revenge. *But he looks thoughtful.* Although... if you've gained her trust... perhaps you could be the bridge I never could.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_allows_negotiation' }],
      choices: [
        {
          text: "Let me try.",
          nextNodeId: 'let_me_try',
        },
      ],
    },

    {
      id: 'let_me_try',
      text: "*He nods slowly.* Try. But don't raise expectations you can't meet. If this fails, we default to the original plan. *He meets your eyes.* And you'll need to be part of that plan, regardless of your feelings.",
      choices: [
        {
          text: "Understood.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'turn_against',
      text: "*His eyebrows rise.* Divide and conquer. A classic strategy. *He looks at you with new respect.* How would you accomplish this?",
      choices: [
        {
          text: "Create distrust. Make them suspicious of each other.",
          nextNodeId: 'create_distrust',
        },
      ],
    },

    {
      id: 'create_distrust',
      text: "*He nods slowly.* It could work. The Copperheads are held together by ideology, not loyalty. Ideology is fragile. *He slides more coins across.* Proceed. But carefully. If they discover what you're doing...",
      onEnterEffects: [
        { type: 'give_gold', value: 200 },
        { type: 'set_flag', target: 'thorne_sabotage_mission' },
      ],
      choices: [
        {
          text: "I know the risks.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'switch_sides',
      text: "*He goes very still.* Switch sides. To the Copperheads? After taking my money, learning my plans? *His voice drops dangerously.* That would be... unwise.",
      expression: 'dangerous',
      choices: [
        {
          text: "I said 'want to.' I haven't done it.",
          nextNodeId: 'havent_done_it',
        },
        {
          text: "What would you do to stop me?",
          nextNodeId: 'stop_me',
        },
      ],
    },

    {
      id: 'havent_done_it',
      text: "*He relaxes slightly.* Then you're testing me. Or warning me. *He considers.* Very well. What would convince you to remain loyal?",
      choices: [
        {
          text: "Reforms. Real ones. That I can verify.",
          nextNodeId: 'verify_reforms',
        },
        {
          text: "Nothing. But I'll continue for now.",
          nextNodeId: 'continue_for_now',
        },
      ],
    },

    {
      id: 'verify_reforms',
      text: "*He nods slowly.* Reforms that you verify. Accountability. *He considers.* It's more than anyone has demanded of me in years. *He extends his hand.* But if that's what it takes to keep you loyal... done.",
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_agrees_reforms' },
        { type: 'start_quest', target: 'verify_thorne_reforms' },
      ],
      choices: [
        {
          text: '*Shake his hand*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'continue_for_now',
      text: "*He nods grimly.* 'For now.' A temporary alliance of convenience. *He shrugs.* I'll take what I can get. Go. Continue your work. We'll reassess when circumstances change.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'stop_me',
      text: "*His expression goes cold.* You don't want to find out. *He stands slowly.* Leave. Now. Consider this your final warning. The next time you threaten to betray me, I won't offer conversation.",
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_final_warning' },
        { type: 'change_reputation', value: -25 },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    // Negotiator return path
    {
      id: 'negotiator_return',
      text: "*Thorne looks up as you enter.* Ah, my diplomat returns. *He sets aside his papers.* Tell me - has Diamondback agreed to meet?",
      expression: 'hopeful',
      choices: [
        {
          text: "She's willing to talk. But she has conditions.",
          nextNodeId: 'willing_conditions',
        },
        {
          text: "She refused. Violently.",
          nextNodeId: 'refused_violently',
        },
        {
          text: "Not yet. These things take time.",
          nextNodeId: 'take_time',
        },
      ],
    },

    {
      id: 'willing_conditions',
      text: "*He leans forward.* Conditions. Name them.",
      choices: [
        {
          text: "Neutral ground. No weapons. Just the two of you.",
          nextNodeId: 'neutral_ground',
        },
        {
          text: "She wants a gesture of good faith first.",
          nextNodeId: 'good_faith',
        },
      ],
    },

    {
      id: 'neutral_ground',
      text: "*He considers.* Neutral ground. No weapons. *He almost smiles.* She doesn't trust me. Fair enough - I don't trust her either. *He nods.* I accept. Arrange it. And... thank you. For making this possible.",
      onEnterEffects: [
        { type: 'set_flag', target: 'peace_talks_arranged' },
        { type: 'start_quest', target: 'arrange_peace_meeting' },
      ],
      choices: [
        {
          text: "Don't thank me yet. This could still go wrong.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'good_faith',
      text: "*He frowns.* What kind of gesture?",
      choices: [
        {
          text: "Release the Copperhead prisoners you're holding.",
          nextNodeId: 'release_prisoners',
        },
        {
          text: "Stop the railroad expansion into Freeminer territory.",
          nextNodeId: 'stop_expansion',
        },
      ],
    },

    {
      id: 'release_prisoners',
      text: "*He's quiet for a moment.* The prisoners. Some of them are murderers. *But he nods slowly.* If it brings peace... I can arrange temporary release. Parole. They stay in the territory, report regularly. Escape, and the deal is off.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_releases_prisoners' }],
      choices: [
        {
          text: "That should satisfy her.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'stop_expansion',
      text: "*He grimaces.* That's... difficult. The board expects that expansion. *But he sighs.* However, I can delay it. Indefinitely. Blame 'survey concerns' or 'geological instability.' *He nods.* Done. What else?",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_stops_expansion' }],
      choices: [
        {
          text: "That should be enough to bring her to the table.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'refused_violently',
      text: "*He slumps slightly.* Violently. Of course. *He's quiet.* I suppose I expected too much. Years of hatred don't dissolve with one offer of peace. *He looks old.* What do you recommend?",
      choices: [
        {
          text: "Give her time. Try again later.",
          nextNodeId: 'give_time',
        },
        {
          text: "Find another way to reach her. Through her people.",
          nextNodeId: 'through_people',
        },
        {
          text: "Maybe peace isn't possible.",
          nextNodeId: 'peace_impossible',
        },
      ],
    },

    {
      id: 'give_time',
      text: "*He nods slowly.* Time. Yes. Perhaps time will cool her anger. *He waves.* Continue your work. We'll try again when circumstances change.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'through_people',
      text: "*He looks interested.* Her people. You think some of them might be more... reasonable?",
      choices: [
        {
          text: "Some of them are tired of fighting. They want it to end.",
          nextNodeId: 'tired_fighting',
        },
      ],
    },

    {
      id: 'tired_fighting',
      text: "*He nods.* Tired soldiers make poor warriors and excellent negotiators. *He produces a pouch.* Find those people. Build bridges. Perhaps they can convince her where you couldn't.",
      onEnterEffects: [
        { type: 'give_gold', value: 200 },
        { type: 'start_quest', target: 'copperhead_moderates' },
      ],
      choices: [
        {
          text: "I'll do what I can.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'peace_impossible',
      text: "*He sighs.* Perhaps. Some conflicts have no resolution except exhaustion. *He looks at his hands.* I had hoped... but hoping doesn't change reality. *He straightens.* Continue your mission. The original parameters.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'take_time',
      text: "*He frowns.* Time. The one resource I have too little of. *But he nods.* Continue. But don't delay unnecessarily. The situation grows more volatile by the day.",
      choices: [
        {
          text: "I understand.",
          nextNodeId: null,
        },
      ],
    },

    // Enemy return path
    {
      id: 'enemy_return',
      text: "*Thorne looks up, and his expression goes cold.* You. I thought I made clear our next meeting would be... unpleasant. *He stands slowly.* Guards!",
      expression: 'hostile',
      choices: [
        {
          text: "Wait - I have information you need.",
          nextNodeId: 'information_need',
        },
        {
          text: "I'm here to negotiate. Not fight.",
          nextNodeId: 'negotiate_not_fight',
        },
        {
          text: "Call your guards. See what happens.",
          nextNodeId: 'see_what_happens',
        },
      ],
    },

    {
      id: 'information_need',
      text: "*He raises a hand, stopping the guards.* Information. What information could possibly justify walking into my office after threatening me?",
      choices: [
        {
          text: "Victoria Ashworth is planning to destroy you. Both of us.",
          nextNodeId: 'ashworth_destroy',
        },
        {
          text: "The Copperheads are planning a major strike. I know where and when.",
          nextNodeId: 'major_strike',
        },
      ],
    },

    {
      id: 'ashworth_destroy',
      text: "*He gestures the guards away.* Victoria. *He sits heavily.* Tell me everything.",
      choices: [
        {
          text: "*Explain Ashworth's plans*",
          nextNodeId: 'explain_ashworth',
        },
      ],
    },

    {
      id: 'explain_ashworth',
      text: "*He listens in silence, his face growing paler.* So. The board has decided I'm expendable. *He meets your eyes.* And you came to warn me. Why? We're enemies.",
      choices: [
        {
          text: "Because she's worse than you.",
          nextNodeId: 'worse_than_you',
        },
        {
          text: "Because the enemy of my enemy might be useful.",
          nextNodeId: 'enemy_of_enemy',
        },
      ],
    },

    {
      id: 'worse_than_you',
      text: "*He laughs bitterly.* 'Worse than me.' What a compliment. *But he nods.* You're right. Victoria has no attachment to this territory. She'll burn it to the ground if that's what the board wants. *He extends his hand.* Temporary truce?",
      onEnterEffects: [
        { type: 'clear_flag', target: 'thorne_enemy' },
        { type: 'set_flag', target: 'thorne_truce' },
      ],
      choices: [
        {
          text: '*Shake his hand*',
          nextNodeId: 'truce_accepted',
        },
      ],
    },

    {
      id: 'truce_accepted',
      text: "*His grip is firm.* We fight Victoria first. Then... we'll see. *He releases your hand.* What do you need from me?",
      onEnterEffects: [{ type: 'start_quest', target: 'stop_ashworth' }],
      choices: [
        {
          text: "Information. Resources. An alliance with the others.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'enemy_of_enemy',
      text: "*He nods slowly.* Pragmatic. I can work with pragmatic. *He gestures to a chair.* Sit. Let's discuss how we survive this together.",
      onEnterEffects: [
        { type: 'clear_flag', target: 'thorne_enemy' },
        { type: 'set_flag', target: 'thorne_tactical_alliance' },
      ],
      choices: [
        {
          text: '*Sit*',
          nextNodeId: 'tactical_discussion',
        },
      ],
    },

    {
      id: 'tactical_discussion',
      text: "*He pours two drinks.* Victoria has resources I can't match alone. But if we coordinate with the Copperheads, the Freeminers... *He hands you a glass.* Can you make that happen?",
      choices: [
        {
          text: "I can try.",
          nextNodeId: 'try_coordination',
        },
      ],
    },

    {
      id: 'try_coordination',
      text: "*He nods.* Try. It's all any of us can do. *He raises his glass.* To unlikely alliances.",
      onEnterEffects: [{ type: 'start_quest', target: 'coordinate_factions' }],
      choices: [
        {
          text: '*Drink and leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'major_strike',
      text: "*He leans forward.* A major strike. Where? When? *His eyes are calculating.* This could change everything.",
      choices: [
        {
          text: '*Provide the information*',
          nextNodeId: 'provide_strike_info',
        },
        {
          text: "First, I want something in return.",
          nextNodeId: 'want_return',
        },
      ],
    },

    {
      id: 'provide_strike_info',
      text: "*He listens intently, making notes.* This is valuable. Very valuable. *He looks at you with new calculation.* Why give this to me? You've made your opposition clear.",
      choices: [
        {
          text: "Because innocents will die if you're unprepared.",
          nextNodeId: 'innocents_die',
        },
        {
          text: "Because I want the violence to end. On both sides.",
          nextNodeId: 'violence_end',
        },
      ],
    },

    {
      id: 'innocents_die',
      text: "*He's quiet for a moment.* You care about innocents. Even IVRC innocents. *Something shifts in his expression.* Perhaps... perhaps I misjudged you. *He nods.* Thank you. I'll ensure minimal casualties.",
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_grateful' },
        { type: 'clear_flag', target: 'thorne_enemy' },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'violence_end',
      text: "*He looks at you for a long moment.* End the violence. Yes. That's what I want too, believe it or not. *He stands.* Perhaps we're not so different. Perhaps... we could find a way to work together, despite everything.",
      onEnterEffects: [
        { type: 'clear_flag', target: 'thorne_enemy' },
        { type: 'set_flag', target: 'thorne_reconsiders' },
      ],
      choices: [
        {
          text: "Perhaps. We'll see.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'want_return',
      text: "*He nods.* Of course you do. Nothing is free. What do you want?",
      choices: [
        {
          text: "Amnesty. For me and the Copperheads.",
          nextNodeId: 'amnesty_demand',
        },
        {
          text: "The Ironpick documents. All of them.",
          nextNodeId: 'documents_demand',
        },
      ],
    },

    {
      id: 'amnesty_demand',
      text: "*He considers.* Amnesty. For information that could save dozens of lives. *He nods slowly.* If the strike is prevented, amnesty for the rank and file. The leaders... *he pauses* ...we'll discuss.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_partial_amnesty' }],
      choices: [
        {
          text: "That's a start. Here's what I know.",
          nextNodeId: 'provide_strike_info',
        },
      ],
    },

    {
      id: 'documents_demand',
      text: "*He stiffens.* The Ironpick documents. You want leverage over me. *He's quiet.* Fine. If your information prevents the strike... I'll give you copies. Not the originals - those stay secured. But enough for your purposes.",
      onEnterEffects: [{ type: 'set_flag', target: 'thorne_promises_documents' }],
      choices: [
        {
          text: "Acceptable. Here's what I know.",
          nextNodeId: 'provide_strike_info',
        },
      ],
    },

    {
      id: 'negotiate_not_fight',
      text: "*He pauses, hand still raised.* Negotiate. After everything? *But curiosity overcomes hostility.* Speak quickly. My patience is limited.",
      choices: [
        {
          text: "I've learned things. About you, about Victoria, about the territory. We need to talk.",
          nextNodeId: 'need_to_talk',
        },
      ],
    },

    {
      id: 'need_to_talk',
      text: "*He gestures the guards away.* Talk. But this had better be worth my time.",
      choices: [
        {
          text: "*Explain what you've learned*",
          nextNodeId: 'explain_ashworth',
        },
      ],
    },

    {
      id: 'see_what_happens',
      text: "*His eyes narrow.* Threats? In my office? *He draws a small pistol from his desk.* I've killed men for less.",
      expression: 'dangerous',
      choices: [
        {
          text: "Then kill me. And never learn what I know.",
          nextNodeId: 'never_learn',
        },
        {
          text: "Put the gun away. We both know you need me.",
          nextNodeId: 'need_me',
        },
      ],
    },

    {
      id: 'never_learn',
      text: "*His finger hovers near the trigger.* What you know? *He's curious despite himself.* What could you possibly know that's worth your life?",
      choices: [
        {
          text: "Victoria Ashworth is coming to destroy you.",
          nextNodeId: 'ashworth_destroy',
        },
      ],
    },

    {
      id: 'need_me',
      text: "*He laughs coldly.* Need you? I've built an empire. I don't need anyone. *But he lowers the gun slightly.* Although... you wouldn't be here unless you had something valuable. Speak.",
      choices: [
        {
          text: "*Explain Ashworth's plans*",
          nextNodeId: 'explain_ashworth',
        },
      ],
    },

    // Pending offer return
    {
      id: 'pending_offer_return',
      text: "*Thorne looks up as you enter.* Ah. You've returned. I take it you've considered my offer?",
      expression: 'expectant',
      choices: [
        {
          text: "I accept.",
          nextNodeId: 'delayed_acceptance',
        },
        {
          text: "I have questions first.",
          nextNodeId: 'questions_before',
        },
        {
          text: "I decline.",
          nextNodeId: 'delayed_refusal',
        },
      ],
    },

    {
      id: 'delayed_acceptance',
      text: "*He nods, satisfied.* Good. I knew you'd see reason eventually. *He produces the contract and payment.* The terms remain as discussed. Sign here.",
      onEnterEffects: [
        { type: 'set_flag', target: 'working_for_thorne' },
        { type: 'give_gold', value: 500 },
        { type: 'start_quest', target: 'infiltrate_copperheads' },
      ],
      choices: [
        {
          text: '*Sign and leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'questions_before',
      text: "*He gestures impatiently.* Questions. Ask quickly.",
      choices: [
        {
          text: "What guarantees do I have that you'll keep your word?",
          nextNodeId: 'guarantees',
        },
        {
          text: "What happens to the Copperheads when this is over?",
          nextNodeId: 'copperhead_fate',
        },
      ],
    },

    {
      id: 'guarantees',
      text: "*He spreads his hands.* My word is law in this territory. Literally. But if you need more... *he writes something on a document* ...here. A signed agreement. Legally binding. Satisfied?",
      onEnterEffects: [{ type: 'give_item', target: 'thorne_contract' }],
      choices: [
        {
          text: "It's a start.",
          nextNodeId: 'delayed_acceptance',
        },
      ],
    },

    {
      id: 'copperhead_fate',
      text: "*He's quiet for a moment.* That depends on them. Surrender peacefully, face trial, serve sentences - they can rebuild their lives afterward. Resist violently... *he shrugs* ...they choose their fate.",
      choices: [
        {
          text: "I want to try negotiating peace first.",
          nextNodeId: 'try_peace',
        },
        {
          text: "Fair enough. I accept.",
          nextNodeId: 'delayed_acceptance',
        },
      ],
    },

    {
      id: 'try_peace',
      text: "*He considers.* Peace. If you can accomplish it, I'll be impressed. *He nods.* Very well. Try peace first. But if it fails, the original mission stands.",
      onEnterEffects: [
        { type: 'set_flag', target: 'working_for_thorne_negotiate' },
        { type: 'give_gold', value: 200 },
        { type: 'start_quest', target: 'negotiate_copperhead_peace' },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'delayed_refusal',
      text: "*His expression hardens.* You've wasted my time. I offered opportunity, and you've chosen... what? Principle? Stubbornness? *He stands.* Leave. We have nothing more to discuss.",
      onEnterEffects: [
        { type: 'set_flag', target: 'refused_thorne_offer' },
        { type: 'change_reputation', value: -15 },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    // Refused return
    {
      id: 'refused_return',
      text: "*Thorne barely glances up.* You again. I thought we had nothing to discuss.",
      expression: 'dismissive',
      choices: [
        {
          text: "I've changed my mind. I want to work with you.",
          nextNodeId: 'changed_mind',
        },
        {
          text: "Circumstances have changed. We need to talk.",
          nextNodeId: 'circumstances_changed',
        },
        {
          text: "I have information. A trade.",
          nextNodeId: 'information_trade',
        },
      ],
    },

    {
      id: 'changed_mind',
      text: "*He raises an eyebrow.* Changed your mind. How... convenient. *He studies you.* What changed it?",
      choices: [
        {
          text: "I've seen what the alternatives are. You're the lesser evil.",
          nextNodeId: 'lesser_evil',
        },
        {
          text: "I realized I can do more good from inside than outside.",
          nextNodeId: 'inside_good',
        },
      ],
    },

    {
      id: 'lesser_evil',
      text: "*He laughs softly.* 'Lesser evil.' What a compliment. *But he nods.* I'll take it. The terms have changed, however. You've proven yourself... unreliable. The payment is reduced. The expectations are higher. Take it or leave it.",
      onEnterEffects: [{ type: 'set_flag', target: 'reduced_thorne_offer' }],
      choices: [
        {
          text: "I'll take it.",
          nextNodeId: 'accept_reduced',
        },
        {
          text: "Those terms are unacceptable.",
          nextNodeId: 'unacceptable_terms',
        },
      ],
    },

    {
      id: 'accept_reduced',
      text: "*He nods.* Good. Don't disappoint me again. *He slides a smaller purse across.* Your advance. Now get to work.",
      onEnterEffects: [
        { type: 'set_flag', target: 'working_for_thorne' },
        { type: 'give_gold', value: 250 },
        { type: 'start_quest', target: 'infiltrate_copperheads' },
      ],
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'unacceptable_terms',
      text: "*He shrugs.* Then we remain as we were. *He returns to his papers.* You know the way out.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'inside_good',
      text: "*He studies you carefully.* A reformer infiltrating my organization. How... ambitious. *He considers.* I'll accept your service, but I'll be watching. Closely. Don't test my trust twice.",
      onEnterEffects: [
        { type: 'set_flag', target: 'working_for_thorne' },
        { type: 'set_flag', target: 'thorne_watching_closely' },
        { type: 'give_gold', value: 400 },
      ],
      choices: [
        {
          text: "I wouldn't expect anything less.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'circumstances_changed',
      text: "*He sets down his pen.* Circumstances. Explain.",
      choices: [
        {
          text: "Victoria Ashworth is coming. She's a threat to all of us.",
          nextNodeId: 'ashworth_threat',
        },
        {
          text: "The Copperheads are planning something big. Something that will hurt innocents.",
          nextNodeId: 'copperhead_threat',
        },
      ],
    },

    {
      id: 'ashworth_threat',
      text: "*He goes very still.* Victoria. *He looks at you with new calculation.* How do you know this?",
      choices: [
        {
          text: "*Explain what you've learned*",
          nextNodeId: 'explain_ashworth',
        },
      ],
    },

    {
      id: 'copperhead_threat',
      text: "*He leans forward.* Something big. Details.",
      choices: [
        {
          text: '*Share what you know*',
          nextNodeId: 'share_copperhead_plans',
        },
      ],
    },

    {
      id: 'share_copperhead_plans',
      text: "*He listens carefully, making notes.* This is valuable information. Why share it with me?",
      choices: [
        {
          text: "Because innocent people will die if I don't.",
          nextNodeId: 'innocents_die',
        },
        {
          text: "Because I want this to end. All of it.",
          nextNodeId: 'want_it_end',
        },
      ],
    },

    {
      id: 'want_it_end',
      text: "*He looks at you for a long moment.* End. Yes. I'm tired too, though I rarely admit it. *He sighs.* Perhaps... perhaps together we can find a way to end this without more bloodshed.",
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_tired' },
        { type: 'change_reputation', value: 15 },
      ],
      choices: [
        {
          text: "I'd like that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'information_trade',
      text: "*He raises an eyebrow.* A trade. What do you have, and what do you want?",
      choices: [
        {
          text: "I have the location of the Ironpick documents. I want safe passage for the Freeminers.",
          nextNodeId: 'documents_for_passage',
        },
        {
          text: "I know Victoria's plans. I want your protection.",
          nextNodeId: 'plans_for_protection',
        },
      ],
    },

    {
      id: 'documents_for_passage',
      text: "*His eyes widen slightly.* The documents. You know where they are? *He composes himself.* Safe passage for the Freeminers. That's... significant. But if the documents are what I think they are...",
      choices: [
        {
          text: "They're exactly what you think they are.",
          nextNodeId: 'exactly_what_think',
        },
      ],
    },

    {
      id: 'exactly_what_think',
      text: "*He's quiet for a long moment.* Then... yes. Safe passage. Written guarantees. Land rights respected. *He meets your eyes.* You drive a hard bargain. But fair. Deal.",
      onEnterEffects: [
        { type: 'set_flag', target: 'thorne_freeminer_deal' },
        { type: 'start_quest', target: 'retrieve_documents_for_thorne' },
      ],
      choices: [
        {
          text: "I'll bring you the documents.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'plans_for_protection',
      text: "*He leans forward.* Victoria's plans. And you want protection. *He considers.* If her plans threaten me, then protecting you aligns with my interests anyway. Tell me what you know.",
      choices: [
        {
          text: "*Explain what you've learned*",
          nextNodeId: 'explain_ashworth',
        },
      ],
    },
  ],
};

export const CorneliusThorneDialogues = [ThorneInitialMeeting, ThorneSecondMeeting];
