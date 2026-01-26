/**
 * Mayor Josephine Holt - Dialogue Trees
 *
 * An elegant widow in her 50s who serves IVRC interests while trying to
 * maintain town independence. She's morally grey - pragmatic rather than evil.
 * Speaks in political euphemisms and carefully measured words. A skilled
 * politician who never says what she truly means directly.
 *
 * Rival to Sheriff Cole, ally to Cornelius Thorne (IVRC)
 * Located in Dusty Springs at Holt Mansion
 */

import type { DialogueTree } from '../../schemas/npc';

export const MayorHoltMainDialogue: DialogueTree = {
  id: 'mayor_holt_main',
  name: 'Mayor Josephine Holt - Main Conversation',
  description: 'Primary dialogue tree for Mayor Josephine Holt',
  tags: ['dusty_springs', 'authority', 'ivrc_connected', 'morally_grey'],

  entryPoints: [
    {
      nodeId: 'first_meeting_high_rep',
      conditions: [
        { type: 'first_meeting' },
        { type: 'reputation_gte', value: 30 },
      ],
      priority: 15,
    },
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'quest_update',
      conditions: [{ type: 'quest_active', target: 'mayors_errand' }],
      priority: 8,
    },
    {
      nodeId: 'trusted_greeting',
      conditions: [{ type: 'flag_set', target: 'mayor_trusts_player' }],
      priority: 7,
    },
    {
      nodeId: 'hostile_greeting',
      conditions: [{ type: 'reputation_lte', value: -20 }],
      priority: 6,
    },
    {
      nodeId: 'return_greeting_high_rep',
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
    // ============================================================================
    // FIRST MEETING - Standard
    // ============================================================================
    {
      id: 'first_meeting',
      text: "*A refined woman in her fifties looks up from correspondence at an ornate desk. Her smile is practiced, her eyes calculating.* Ah, a visitor. How delightful. I am Josephine Holt, Mayor of Dusty Springs. Forgive me if I don't rise - the demands of civic duty, you understand. And you are...?",
      expression: 'polite',
      choices: [
        {
          text: 'A newcomer. Just arrived in town.',
          nextNodeId: 'newcomer_response',
        },
        {
          text: '[Name yourself] Pleased to meet you, Mayor.',
          nextNodeId: 'polite_intro',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: "Someone who's heard a lot about this town's... leadership.",
          nextNodeId: 'challenging_intro',
        },
      ],
    },

    {
      id: 'first_meeting_high_rep',
      text: "*An elegant woman rises from her desk, her silken dress rustling. Her smile seems almost genuine.* Well, well. Your reputation precedes you, my friend. I've heard quite a lot about your... activities in our territory. I am Josephine Holt, Mayor of Dusty Springs. I do believe we have much to discuss.",
      expression: 'interested',
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_knows_reputation' }],
      choices: [
        {
          text: 'Good things, I hope.',
          nextNodeId: 'good_reputation',
        },
        {
          text: 'What have you heard?',
          nextNodeId: 'heard_what',
        },
        {
          text: "I'm not here to play politics, Mayor.",
          nextNodeId: 'direct_approach',
        },
      ],
    },

    // ============================================================================
    // FIRST MEETING BRANCHES
    // ============================================================================
    {
      id: 'newcomer_response',
      text: "*She sets down her pen with deliberate grace* A newcomer. How... refreshing. Dusty Springs welcomes those who come with honest intentions and a willingness to contribute to our community. *Her eyes narrow slightly* Might I ask what brings you to our humble town?",
      choices: [
        {
          text: "I'm looking for work.",
          nextNodeId: 'work_inquiry',
        },
        {
          text: 'I received a letter summoning me here.',
          nextNodeId: 'letter_mention',
        },
        {
          text: 'Just passing through.',
          nextNodeId: 'passing_through',
        },
      ],
    },

    {
      id: 'polite_intro',
      text: "*She inclines her head graciously* Charmed, I'm sure. Good manners are such a rarity on the frontier. It's... gratifying to meet someone who understands the value of civilized discourse. Tell me, what brings you to speak with the mayor? Most newcomers are content with the saloon and the general store.",
      choices: [
        {
          text: 'I wanted to understand how things work here.',
          nextNodeId: 'how_things_work',
        },
        {
          text: 'I hear you have connections with IVRC.',
          nextNodeId: 'ivrc_direct',
        },
        {
          text: 'Curiosity, mostly. This is quite a mansion.',
          nextNodeId: 'mansion_comment',
        },
      ],
    },

    {
      id: 'challenging_intro',
      text: "*Her smile doesn't waver, but her eyes harden* Leadership. Such a... loaded term. I prefer 'stewardship.' Dusty Springs faces challenges that require delicate navigation. Not everyone appreciates the... complexities involved. But please, do share what you've heard. I'm always eager to address... misconceptions.",
      expression: 'guarded',
      choices: [
        {
          text: 'That you work for the railroad.',
          nextNodeId: 'railroad_accusation',
        },
        {
          text: 'That you and Sheriff Cole have different views.',
          nextNodeId: 'sheriff_conflict_intro',
        },
        {
          text: 'Nothing specific. I prefer to form my own opinions.',
          nextNodeId: 'own_opinions',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'good_reputation',
      text: "*She laughs lightly* Opinions vary so dramatically out here, don't they? Some say you're a troublemaker. Others call you a guardian angel of sorts. *She gestures to a chair* The truth, I suspect, lies somewhere more... interesting. Please, sit. Tell me about yourself.",
      choices: [
        {
          text: "I help those who need it. That makes enemies.",
          nextNodeId: 'making_enemies',
        },
        {
          text: 'I follow my conscience. Nothing more.',
          nextNodeId: 'conscience_talk',
        },
        {
          text: "What would you call me, Mayor?",
          nextNodeId: 'what_would_you_call_me',
        },
      ],
    },

    {
      id: 'heard_what',
      text: "*She waves her hand airily* Oh, whispers here and there. That you've been asking questions about IVRC. That certain... factions have taken an interest in you. That you possess a letter with a rather antiquated symbol. *She watches your reaction carefully* Nothing escapes notice in a small town.",
      expression: 'calculating',
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_knows_about_letter' }],
      choices: [
        {
          text: 'You seem well-informed for a mayor.',
          nextNodeId: 'well_informed',
        },
        {
          text: 'What do you know about the symbol?',
          nextNodeId: 'symbol_question',
        },
        {
          text: 'I should be more careful who I talk to.',
          nextNodeId: 'careful_response',
        },
      ],
    },

    {
      id: 'direct_approach',
      text: "*Her smile becomes fixed* How... direct. I admire that, truly I do. Though I must caution you - directness can be a liability in matters of governance. The frontier is not kind to those who cannot... adapt their approach to circumstances.",
      choices: [
        {
          text: 'Meaning what, exactly?',
          nextNodeId: 'meaning_what',
        },
        {
          text: "I'll keep that in mind.",
          nextNodeId: 'keep_in_mind',
        },
      ],
    },

    // ============================================================================
    // WORK AND PURPOSE
    // ============================================================================
    {
      id: 'work_inquiry',
      text: "Work. *She steeples her fingers* Dusty Springs has... opportunities for those with the right disposition. The Iron Valley Railroad Company is always seeking capable individuals. The pay is generous, the benefits substantial. I could put in a good word, if you're interested.",
      choices: [
        {
          text: "I've heard mixed things about IVRC.",
          nextNodeId: 'ivrc_mixed',
        },
        {
          text: 'What kind of work?',
          nextNodeId: 'what_kind_work',
        },
        {
          text: 'I prefer to find my own opportunities.',
          nextNodeId: 'own_opportunities',
        },
      ],
    },

    {
      id: 'letter_mention',
      text: "*Something flickers in her eyes - recognition? Concern?* A letter. How curious. May I ask who sent it? *She leans forward slightly* We do try to keep track of our correspondence in this territory. For... administrative purposes, of course.",
      expression: 'interested',
      choices: [
        {
          text: "It wasn't signed. Just a symbol - a gear.",
          nextNodeId: 'gear_symbol_mention',
        },
        {
          text: "I'd rather not say.",
          nextNodeId: 'rather_not_say',
        },
        {
          text: 'Why does a letter interest you so much?',
          nextNodeId: 'why_interest',
        },
      ],
    },

    {
      id: 'passing_through',
      text: "*She nods slowly* Passing through. That's what they all say, at first. But Dusty Springs has a way of... holding onto people. The frontier offers freedom, yes, but also uncertainty. Many find the stability we provide here to be quite... appealing.",
      choices: [
        {
          text: 'Stability through IVRC?',
          nextNodeId: 'stability_ivrc',
        },
        {
          text: "I prefer to keep moving.",
          nextNodeId: 'keep_moving',
        },
        {
          text: 'What kind of stability?',
          nextNodeId: 'what_stability',
        },
      ],
    },

    // ============================================================================
    // IVRC DISCUSSIONS
    // ============================================================================
    {
      id: 'ivrc_direct',
      text: "*Her expression becomes measured* Connections is such a strong word. I maintain... working relationships with various parties who have interests in this region. IVRC among them, yes. The railroad brings prosperity, employment, civilization to the frontier. Is that not desirable?",
      choices: [
        {
          text: 'At what cost?',
          nextNodeId: 'ivrc_cost',
        },
        {
          text: "Progress doesn't require exploitation.",
          nextNodeId: 'exploitation_accusation',
        },
        {
          text: "I suppose that depends on one's perspective.",
          nextNodeId: 'perspective',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'railroad_accusation',
      text: "*She laughs, but there's no warmth in it* Work FOR the railroad? My dear friend, no one works FOR the railroad without being on their payroll. I work WITH various interests to ensure Dusty Springs survives and thrives. If that requires... accommodation with powerful entities, well, that's simply governance.",
      choices: [
        {
          text: "There's a difference between accommodation and complicity.",
          nextNodeId: 'complicity',
        },
        {
          text: 'A delicate balance, I imagine.',
          nextNodeId: 'delicate_balance',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: 'So you deny serving IVRC interests?',
          nextNodeId: 'deny_ivrc',
        },
      ],
    },

    {
      id: 'ivrc_mixed',
      text: "*She sighs delicately* Mixed things. Yes, I imagine you have. The Copperhead rabble spreads their propaganda. The Freeminers nurse their grievances. But consider this - before IVRC, this was nothing but dust and desperation. Now there are schools, hospitals, infrastructure. Progress requires... investment.",
      choices: [
        {
          text: 'And what does IVRC get in return?',
          nextNodeId: 'ivrc_return',
        },
        {
          text: 'Built on the backs of exploited workers.',
          nextNodeId: 'exploited_workers',
        },
        {
          text: "You make it sound so reasonable.",
          nextNodeId: 'sounds_reasonable',
        },
      ],
    },

    {
      id: 'ivrc_cost',
      text: "*Her smile tightens* Cost. Everything has a cost. The question is whether the benefits outweigh them. Before the railroad, people died of simple ailments because there was no doctor. Children grew up illiterate. Now... *she gestures expansively* ...we have civilization. Imperfect, perhaps, but real.",
      choices: [
        {
          text: 'And the miners who die in unsafe conditions?',
          nextNodeId: 'unsafe_conditions',
        },
        {
          text: 'Civilization bought with other people\'s suffering.',
          nextNodeId: 'bought_suffering',
        },
        {
          text: 'I take your point.',
          nextNodeId: 'take_your_point',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'exploitation_accusation',
      text: "*Her eyes flash with something - anger? Frustration?* You speak of exploitation as if I have any choice in the matter. When Cornelius Thorne decides something will happen, it happens. My role is to... minimize the damage. To protect what I can. Do you think Sheriff Cole could do better?",
      expression: 'defensive',
      choices: [
        {
          text: 'Maybe he should have the chance.',
          nextNodeId: 'cole_chance',
        },
        {
          text: "You're saying you have no power here?",
          nextNodeId: 'no_power',
        },
        {
          text: 'Tell me about Cornelius Thorne.',
          nextNodeId: 'thorne_info',
        },
      ],
    },

    {
      id: 'ivrc_return',
      text: "*She spreads her hands* What any investor wants. Return on investment. They extract resources, yes. They profit from the labor market. But they also maintain the peace, build infrastructure, provide services. It's a... symbiosis. Not always comfortable, but functional.",
      choices: [
        {
          text: 'A symbiosis where one party has all the power.',
          nextNodeId: 'power_imbalance',
        },
        {
          text: "And your role in this 'symbiosis'?",
          nextNodeId: 'your_role',
        },
        {
          text: 'I understand the arrangement.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'exploited_workers',
      text: "*Her composure slips, just for a moment* Exploited. Yes. I know what happens in the mines, in the work camps. *She looks away* Do you think I'm blind? Or heartless? I see the cost. Every day. But what would you have me do? Stand on principle while IVRC brings in someone who won't?",
      expression: 'conflicted',
      onEnterEffects: [{ type: 'set_flag', target: 'saw_mayors_conflict' }],
      choices: [
        {
          text: 'So you compromise to stay in power.',
          nextNodeId: 'compromise_power',
        },
        {
          text: 'There has to be another way.',
          nextNodeId: 'another_way',
        },
        {
          text: "You're in an impossible position.",
          nextNodeId: 'impossible_position',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    // ============================================================================
    // SHERIFF COLE CONFLICT
    // ============================================================================
    {
      id: 'sheriff_conflict_intro',
      text: "*She sighs* Marcus Cole. An honorable man, truly. But honor makes a poor shield against the realities of frontier governance. He sees the world in stark contrasts - right and wrong, law and lawlessness. I see... gradients. Necessary compromises. We disagree. Frequently.",
      choices: [
        {
          text: 'What do you disagree about?',
          nextNodeId: 'disagree_what',
        },
        {
          text: 'He seems to think you answer to IVRC.',
          nextNodeId: 'answer_to_ivrc',
        },
        {
          text: 'Is he wrong to hold his principles?',
          nextNodeId: 'wrong_principles',
        },
      ],
    },

    {
      id: 'disagree_what',
      text: "Everything. *She laughs without humor* He wants to investigate IVRC's operations. I explain that such investigations would be... counterproductive. He wants to protect workers who speak out. I explain that those workers would be better served by quiet negotiation. He sees retreat. I see strategy.",
      choices: [
        {
          text: 'Strategy that benefits IVRC.',
          nextNodeId: 'benefits_ivrc',
        },
        {
          text: 'Has your strategy achieved anything?',
          nextNodeId: 'achieved_anything',
        },
        {
          text: 'Perhaps you both have valid points.',
          nextNodeId: 'both_valid',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'answer_to_ivrc',
      text: "*Her jaw tightens* Marcus sees what he wants to see. Yes, I communicate with IVRC representatives. Yes, I sometimes... adjust my positions based on their input. But I also fight for this town in ways he'll never see. Water rights that weren't sold. Workers who weren't deported. Small victories, invisible to idealists.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayors_hidden_battles' }],
      choices: [
        {
          text: 'Tell me about these victories.',
          nextNodeId: 'small_victories',
        },
        {
          text: "Small victories won't stop IVRC.",
          nextNodeId: 'wont_stop_ivrc',
        },
        {
          text: 'The sheriff should know about this.',
          nextNodeId: 'sheriff_should_know',
        },
      ],
    },

    {
      id: 'wrong_principles',
      text: "Wrong? No. Naive, perhaps. *She looks out the window* When I was young, I too believed that standing firm would be enough. That right would triumph. Then I watched my husband try to negotiate fairly with Thorne. He died six months later. An 'accident,' they called it.",
      expression: 'sad',
      onEnterEffects: [{ type: 'set_flag', target: 'learned_about_husband' }],
      choices: [
        {
          text: "I'm sorry. What happened?",
          nextNodeId: 'husband_death',
        },
        {
          text: 'That must have been difficult.',
          nextNodeId: 'difficult_loss',
        },
        {
          text: 'Is that why you cooperate with them now?',
          nextNodeId: 'why_cooperate',
        },
      ],
    },

    // ============================================================================
    // HER LATE HUSBAND
    // ============================================================================
    {
      id: 'husband_death',
      text: "*She's silent for a long moment* William believed in this territory. He invested everything we had - our fortune, our future - into building something good here. When IVRC came, he thought he could work with them as equals. *Her voice hardens* He was wrong.",
      expression: 'bitter',
      choices: [
        {
          text: 'They killed him?',
          nextNodeId: 'killed_him',
        },
        {
          text: 'What happened to your investment?',
          nextNodeId: 'investment',
        },
        {
          text: 'And you inherited his position.',
          nextNodeId: 'inherited_position',
        },
      ],
    },

    {
      id: 'killed_him',
      text: "*She meets your eyes* Officially? A tragic accident at the construction site. Unofficially? He received warnings. He ignored them. He believed that being right would protect him. *She looks down at her hands* I learned from his mistake. Being right means nothing if you're dead.",
      onEnterEffects: [
        { type: 'set_flag', target: 'knows_husband_murdered' },
        { type: 'change_reputation', value: 10 },
      ],
      choices: [
        {
          text: 'So you chose survival.',
          nextNodeId: 'chose_survival',
        },
        {
          text: "Don't you want justice for him?",
          nextNodeId: 'justice_for_husband',
        },
        {
          text: 'Thorne will pay for this someday.',
          nextNodeId: 'thorne_will_pay',
        },
      ],
    },

    {
      id: 'chose_survival',
      text: "I chose effectiveness. *She straightens in her chair* If I'd raged, accused, demanded justice - I'd be in a grave beside William. Instead, I smiled, compromised, made myself useful. And now I have influence. Limited, yes. But enough to protect some people some of the time. Is that not worth something?",
      choices: [
        {
          text: 'It depends on what you do with that influence.',
          nextNodeId: 'what_you_do',
        },
        {
          text: 'Influence that comes at a heavy price.',
          nextNodeId: 'heavy_price',
        },
        {
          text: 'I think I understand you better now.',
          nextNodeId: 'understand_better',
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },

    {
      id: 'justice_for_husband',
      text: "*Her laugh is hollow* Justice. What a pretty word. Do you know what justice looks like out here? It looks like power. IVRC has it. I don't. Justice for William would require bringing down Cornelius Thorne himself. *She pauses* Unless you know something I don't?",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_wants_justice' }],
      choices: [
        {
          text: 'There might be evidence. Documents.',
          nextNodeId: 'documents_mention',
          conditions: [{ type: 'flag_set', target: 'seeking_ironpick_docs' }],
        },
        {
          text: 'Power can shift. It always does.',
          nextNodeId: 'power_shifts',
        },
        {
          text: "I'm sorry. I shouldn't have brought it up.",
          nextNodeId: 'shouldnt_mention',
        },
      ],
    },

    {
      id: 'thorne_will_pay',
      text: "*She studies you intently* You sound very certain. *She leans forward* Tell me - is that idealism speaking, or do you know something concrete? Because if there's a way to bring that man down without destroying everything I've built... *she trails off* ...I would be very interested to hear it.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_interested_in_thorne' }],
      choices: [
        {
          text: "I'm gathering information. Nothing solid yet.",
          nextNodeId: 'gathering_info',
        },
        {
          text: "The Ironpick documents could be the key.",
          nextNodeId: 'documents_mention',
          conditions: [{ type: 'flag_set', target: 'seeking_ironpick_docs' }],
        },
        {
          text: "Let's just say I'm working on it.",
          nextNodeId: 'working_on_it',
        },
      ],
    },

    {
      id: 'difficult_loss',
      text: "*She nods slowly* Difficult. Yes. William and I... we came west with dreams. He would build, I would organize, together we would create something lasting. *She gestures around the mansion* This is what remains. A monument to what might have been.",
      choices: [
        {
          text: "You've done well for yourself despite everything.",
          nextNodeId: 'done_well',
        },
        {
          text: "It's a beautiful home.",
          nextNodeId: 'beautiful_home',
        },
        {
          text: 'Do you ever think about leaving?',
          nextNodeId: 'think_about_leaving',
        },
      ],
    },

    {
      id: 'investment',
      text: "Gone. Absorbed into IVRC's operations. *She smiles bitterly* That was the price of... continuing. They allowed me to keep this house, my position, my dignity. In exchange, I provide them with a friendly face for their operations. A widow who speaks of progress and prosperity.",
      choices: [
        {
          text: 'A gilded cage.',
          nextNodeId: 'gilded_cage',
        },
        {
          text: 'You had no other choice?',
          nextNodeId: 'no_choice',
        },
        {
          text: 'That must be exhausting.',
          nextNodeId: 'exhausting',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'inherited_position',
      text: "*She tilts her head* Inherited implies a gift. I earned this position through careful negotiation with Thorne's people. They needed a figurehead who understood both sides. I needed power to protect what remained of my husband's legacy. We reached an... arrangement.",
      choices: [
        {
          text: 'An arrangement that benefits them.',
          nextNodeId: 'benefits_them',
        },
        {
          text: 'You played a weak hand well.',
          nextNodeId: 'played_well',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: 'What does Thorne expect from you?',
          nextNodeId: 'thorne_expects',
        },
      ],
    },

    // ============================================================================
    // CORNELIUS THORNE
    // ============================================================================
    {
      id: 'thorne_info',
      text: "*She speaks carefully, as if reciting practiced words* Cornelius Thorne is the President of the Iron Valley Railroad Company. A visionary, his admirers say. A ruthless monopolist, say others. He controls most of the territory's infrastructure, mining operations, and... political connections.",
      choices: [
        {
          text: 'And which do you say?',
          nextNodeId: 'which_say',
        },
        {
          text: "He's the one pulling your strings.",
          nextNodeId: 'pulling_strings',
        },
        {
          text: 'Have you met him personally?',
          nextNodeId: 'met_thorne',
        },
      ],
    },

    {
      id: 'which_say',
      text: "*She hesitates* I say he is a man who gets what he wants. Whether that makes him a visionary or a villain depends entirely on whether you're in his way. *She meets your eyes* I learned long ago not to be in his way. It's... healthier.",
      choices: [
        {
          text: 'That sounds like fear.',
          nextNodeId: 'sounds_like_fear',
        },
        {
          text: 'Wisdom, perhaps.',
          nextNodeId: 'wisdom',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: "What happens to those who oppose him?",
          nextNodeId: 'oppose_him',
        },
      ],
    },

    {
      id: 'pulling_strings',
      text: "*Her composure cracks slightly* You oversimplify. Yes, Thorne has... influence over my decisions. But I am not a puppet. I negotiate. I delay. I redirect. Every worker who wasn't fired, every claim that wasn't seized - those were my doing. My resistance, quiet though it may be.",
      expression: 'defensive',
      choices: [
        {
          text: 'Quiet resistance can only do so much.',
          nextNodeId: 'quiet_limited',
        },
        {
          text: 'I apologize. That was unfair.',
          nextNodeId: 'apologize',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: 'Maybe you need allies for something louder.',
          nextNodeId: 'need_allies',
        },
      ],
    },

    {
      id: 'met_thorne',
      text: "Once. When William died. Thorne came to offer his... condolences. *Her voice drips with barely concealed venom* He stood in this very room and told me how tragic it was. How he hoped I would continue my husband's important work. The threat was clear enough.",
      expression: 'bitter',
      choices: [
        {
          text: 'What did you do?',
          nextNodeId: 'what_did_you_do',
        },
        {
          text: 'You should have exposed him.',
          nextNodeId: 'should_expose',
        },
        {
          text: 'I can see why you hate him.',
          nextNodeId: 'see_why_hate',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'thorne_expects',
      text: "Compliance. Information. A veneer of legitimacy for his operations. *She counts on her fingers* I approve permits, manage local discontent, provide early warning of potential... difficulties. In return, Dusty Springs receives preferential treatment. Better than being an obstacle, I assure you.",
      choices: [
        {
          text: 'You spy for him.',
          nextNodeId: 'spy_for_him',
        },
        {
          text: 'A devil\'s bargain.',
          nextNodeId: 'devils_bargain',
        },
        {
          text: 'What counts as difficulties?',
          nextNodeId: 'difficulties',
        },
      ],
    },

    // ============================================================================
    // THE GEAR SYMBOL
    // ============================================================================
    {
      id: 'gear_symbol_mention',
      text: "*She goes very still* The gear. *A long pause* I haven't heard that symbol mentioned in years. It was... *she seems to choose her words carefully* ...the mark of the Worker's Coalition. Before my time here. They're all dead or scattered now.",
      expression: 'guarded',
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_knows_gear' }],
      choices: [
        {
          text: 'Someone seems to have survived.',
          nextNodeId: 'someone_survived',
        },
        {
          text: 'What happened to them?',
          nextNodeId: 'what_happened_coalition',
        },
        {
          text: 'You seem nervous, Mayor.',
          nextNodeId: 'seem_nervous',
        },
      ],
    },

    {
      id: 'someone_survived',
      text: "*She rises and moves to the window* If someone from the old movement is reaching out... *she turns back to you* ...they're either very brave or very desperate. Either way, you should be careful. IVRC has long memories, and they do not forgive those who bear that symbol.",
      choices: [
        {
          text: 'Are you warning me or threatening me?',
          nextNodeId: 'warning_or_threat',
        },
        {
          text: 'What can you tell me about them?',
          nextNodeId: 'tell_me_about_them',
        },
        {
          text: 'I can handle myself.',
          nextNodeId: 'handle_myself',
        },
      ],
    },

    {
      id: 'what_happened_coalition',
      text: "Thorne happened. *Her voice is flat* They organized. They demanded fair wages, safe conditions. They even had some success, for a while. Then Thorne brought in his private forces. The leaders were arrested, their meeting halls burned. Those who escaped fled to the mountains.",
      choices: [
        {
          text: 'The Freeminers.',
          nextNodeId: 'freeminers_connection',
        },
        {
          text: 'And you did nothing?',
          nextNodeId: 'did_nothing',
        },
        {
          text: 'History might repeat itself.',
          nextNodeId: 'history_repeat',
        },
      ],
    },

    {
      id: 'seem_nervous',
      text: "*She forces a laugh* Nervous? Simply... cautious. The gear symbol represents a chapter of this territory's history that IVRC prefers forgotten. Anyone who resurrects it invites their attention. I would hate to see someone new suffer for old causes.",
      choices: [
        {
          text: 'Your concern is touching.',
          nextNodeId: 'concern_touching',
        },
        {
          text: 'Or you\'re worried about your position.',
          nextNodeId: 'worried_position',
        },
        {
          text: 'What would IVRC do if they knew?',
          nextNodeId: 'ivrc_knew',
        },
      ],
    },

    {
      id: 'symbol_question',
      text: "*She's silent for a moment* The gear was the workers' symbol. It represented the machinery of industry - powered by their labor, owned by others. *She speaks more quietly* My husband... sympathized with their cause. It's partly why he was targeted.",
      onEnterEffects: [{ type: 'set_flag', target: 'husband_sympathized' }],
      choices: [
        {
          text: 'Did you sympathize too?',
          nextNodeId: 'did_you_sympathize',
        },
        {
          text: 'Then why work with his killers?',
          nextNodeId: 'work_with_killers',
        },
        {
          text: 'Thank you for telling me this.',
          nextNodeId: 'thank_telling',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    // ============================================================================
    // DOCUMENTS AND SECRETS
    // ============================================================================
    {
      id: 'documents_mention',
      text: "*Her breath catches* The Ironpick documents. You know about those? *She moves closer, lowering her voice* Those papers could bring down Thorne. Proof of bribery, murder, theft. If they still exist... *she searches your face* ...where are they?",
      expression: 'eager',
      choices: [
        {
          text: "I'm still looking. Samuel Ironpick knows.",
          nextNodeId: 'samuel_knows',
        },
        {
          text: "Why should I trust you with that information?",
          nextNodeId: 'why_trust_you',
        },
        {
          text: 'Maybe we could work together.',
          nextNodeId: 'work_together',
        },
      ],
    },

    {
      id: 'samuel_knows',
      text: "*She nods slowly* Samuel. Yes, he would be the one to keep them safe. But he's in the mountains now, surrounded by his Freeminers. They trust no one from town, least of all me. *She looks at you* But you... you're an outsider. You might get through to him.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_wants_documents' }],
      choices: [
        {
          text: 'And then bring the documents to you?',
          nextNodeId: 'bring_to_you',
        },
        {
          text: "I'm not your errand runner.",
          nextNodeId: 'not_errand_runner',
        },
        {
          text: 'What would you do with them?',
          nextNodeId: 'what_would_you_do_docs',
        },
      ],
    },

    {
      id: 'why_trust_you',
      text: "*She sighs* You shouldn't. Not entirely. I've survived by playing IVRC's game. But... *her voice drops* ...I've also been waiting. Waiting for the right moment, the right leverage. Those documents could be that moment. Think about what you could accomplish with the mayor's backing.",
      choices: [
        {
          text: 'Your backing comes with strings attached.',
          nextNodeId: 'strings_attached',
        },
        {
          text: "I'll consider it.",
          nextNodeId: 'consider_it',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: "Let's say I'm interested. What exactly would you do?",
          nextNodeId: 'what_would_you_do_docs',
        },
      ],
    },

    {
      id: 'work_together',
      text: "*A genuine smile crosses her face* Now you're thinking like a politician. Yes. Together, we could be quite effective. You have access to people who won't speak to me. I have resources, information, official channels. *She extends her hand* An alliance of convenience?",
      choices: [
        {
          text: '*Shake her hand* For now.',
          nextNodeId: 'alliance_formed',
          effects: [
            { type: 'set_flag', target: 'mayor_alliance' },
            { type: 'change_reputation', value: 20 },
          ],
        },
        {
          text: "I need to think about this.",
          nextNodeId: 'think_about_alliance',
        },
        {
          text: "Alliance implies trust. I'm not there yet.",
          nextNodeId: 'not_there_yet',
        },
      ],
    },

    {
      id: 'what_would_you_do_docs',
      text: "Get them to the territorial governor. Or better yet, to the federal authorities. Thorne has enemies in Washington who would love to see him fall. *She smiles coldly* With proper evidence and proper connections, even IVRC can be brought to heel. My husband tried. I might succeed.",
      choices: [
        {
          text: "You've been planning this.",
          nextNodeId: 'been_planning',
        },
        {
          text: 'Revenge, wrapped in righteousness.',
          nextNodeId: 'revenge_wrapped',
        },
        {
          text: "It's a good plan. I'm in.",
          nextNodeId: 'alliance_formed',
          effects: [
            { type: 'set_flag', target: 'mayor_alliance' },
            { type: 'change_reputation', value: 20 },
          ],
        },
      ],
    },

    {
      id: 'alliance_formed',
      text: "*She grips your hand firmly* Excellent. We have much to discuss, but not here. My staff reports to IVRC. *She writes something on a slip of paper* This address. Three days from now, after dark. Come alone. We'll make real plans then.",
      onEnterEffects: [
        { type: 'start_quest', target: 'mayors_alliance' },
        { type: 'set_flag', target: 'mayor_trusts_player' },
      ],
      choices: [
        {
          text: "I'll be there.",
          nextNodeId: null,
        },
      ],
    },

    // ============================================================================
    // QUEST HOOKS
    // ============================================================================
    {
      id: 'delicate_balance',
      text: "*She nods approvingly* You understand. More than most. *She pauses, considering* Perhaps you could be useful. There's a matter I can't handle through... official channels. Something that would benefit us both. Are you interested in hearing more?",
      choices: [
        {
          text: "I'm listening.",
          nextNodeId: 'mayors_task',
        },
        {
          text: "That depends on what you're asking.",
          nextNodeId: 'what_asking',
        },
        {
          text: 'Not interested in being your pawn.',
          nextNodeId: 'not_pawn',
        },
      ],
    },

    {
      id: 'mayors_task',
      text: "There's a shipment coming through next week. IVRC supplies, but also... other things. Medicine that never reaches the miners' families. Food that disappears into company stores. I need someone to ensure that a portion of that shipment goes where it should.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_offered_quest' }],
      choices: [
        {
          text: "You want me to steal from IVRC?",
          nextNodeId: 'steal_from_ivrc',
        },
        {
          text: "Why can't you do this yourself?",
          nextNodeId: 'why_not_yourself',
        },
        {
          text: "I'll do it.",
          nextNodeId: 'accept_errand',
          effects: [
            { type: 'start_quest', target: 'mayors_errand' },
            { type: 'change_reputation', value: 10 },
          ],
        },
      ],
    },

    {
      id: 'steal_from_ivrc',
      text: "*She smiles thinly* 'Redirect,' I prefer. The supplies will reach their intended recipients - just different ones than IVRC planned. It's not theft when you're returning what was taken. Think of it as... corrective redistribution.",
      choices: [
        {
          text: "Robin Hood with a mayoral seal.",
          nextNodeId: 'robin_hood_mayor',
        },
        {
          text: "Fine. What do I need to know?",
          nextNodeId: 'accept_errand',
          effects: [
            { type: 'start_quest', target: 'mayors_errand' },
            { type: 'change_reputation', value: 10 },
          ],
        },
        {
          text: "Too risky. If IVRC finds out...",
          nextNodeId: 'too_risky',
        },
      ],
    },

    {
      id: 'why_not_yourself',
      text: "Because every person who works for me reports to IVRC. Every action I take is watched, analyzed, questioned. But you? You're new. Unknown. You can move in ways I cannot. *She meets your eyes* And frankly, I need to maintain... plausible deniability.",
      choices: [
        {
          text: "At least you're honest about using me.",
          nextNodeId: 'honest_using',
        },
        {
          text: 'What do I get out of this?',
          nextNodeId: 'what_do_i_get',
        },
        {
          text: "Alright. I'll help.",
          nextNodeId: 'accept_errand',
          effects: [
            { type: 'start_quest', target: 'mayors_errand' },
            { type: 'change_reputation', value: 10 },
          ],
        },
      ],
    },

    {
      id: 'accept_errand',
      text: "*She writes quickly on a paper* The shipment arrives Tuesday at the north depot. This paper will get you past the guards - they'll think you're my assistant. Take the medical supplies and the grain to Father Miguel at the church. He knows what to do with them.",
      onEnterEffects: [
        { type: 'give_item', target: 'mayors_pass' },
        { type: 'unlock_location', target: 'north_depot' },
      ],
      choices: [
        {
          text: 'Consider it done.',
          nextNodeId: null,
        },
      ],
    },

    // ============================================================================
    // RETURN VISITS
    // ============================================================================
    {
      id: 'return_greeting',
      text: "*Mayor Holt looks up from her papers* Ah, you again. I trust your time in Dusty Springs has been... educational. What brings you to visit the mayor today?",
      choices: [
        {
          text: 'I have questions about IVRC.',
          nextNodeId: 'ivrc_questions',
        },
        {
          text: "I'd like to know more about the town's history.",
          nextNodeId: 'town_history',
        },
        {
          text: 'Just paying respects.',
          nextNodeId: 'just_respects',
        },
      ],
    },

    {
      id: 'return_greeting_high_rep',
      text: "*Mayor Holt rises with a warm smile* My friend, welcome back. Your reputation continues to grow. I hear good things about your... activities. What can I do for you today?",
      choices: [
        {
          text: 'Any developments with IVRC?',
          nextNodeId: 'ivrc_developments',
        },
        {
          text: "I need information.",
          nextNodeId: 'need_info',
        },
        {
          text: 'Is there anything you need done?',
          nextNodeId: 'anything_needed',
        },
      ],
    },

    {
      id: 'trusted_greeting',
      text: "*Josephine rises quickly, checking that no one is near* Thank goodness you're here. We need to talk. Things are moving faster than I anticipated. Victoria Ashworth has arrived in the territory, and she's asking questions. About you. About me.",
      expression: 'worried',
      choices: [
        {
          text: 'Who is Victoria Ashworth?',
          nextNodeId: 'who_is_ashworth',
        },
        {
          text: 'What does she know?',
          nextNodeId: 'what_does_she_know',
        },
        {
          text: 'We need to accelerate our plans.',
          nextNodeId: 'accelerate_plans',
        },
      ],
    },

    {
      id: 'hostile_greeting',
      text: "*Mayor Holt's expression hardens as you enter* You. I've heard about your activities. The company you keep, the questions you ask. *She speaks coldly* You are making powerful enemies. I suggest you consider more carefully whose interests you serve.",
      expression: 'hostile',
      choices: [
        {
          text: 'Are you threatening me?',
          nextNodeId: 'threatening_me',
        },
        {
          text: "I serve no one's interests but my own.",
          nextNodeId: 'own_interests',
        },
        {
          text: 'Perhaps we got off on the wrong foot.',
          nextNodeId: 'wrong_foot',
        },
      ],
    },

    {
      id: 'quest_update',
      text: "*Mayor Holt looks at you expectantly* Well? The shipment - were you successful?",
      choices: [
        {
          text: 'The supplies reached Father Miguel.',
          nextNodeId: 'quest_success',
          conditions: [{ type: 'flag_set', target: 'errand_complete' }],
        },
        {
          text: "Still working on it.",
          nextNodeId: 'still_working',
        },
        {
          text: "There were complications.",
          nextNodeId: 'complications',
        },
      ],
    },

    // ============================================================================
    // ADDITIONAL DIALOGUE NODES
    // ============================================================================
    {
      id: 'how_things_work',
      text: "How things work. *She chuckles* A deceptively simple question. Officially, I govern this town with the support of the territorial administration. Unofficially... well, IVRC's influence touches everything. Water, power, employment, law. Understanding that is understanding Dusty Springs.",
      choices: [
        {
          text: "So nothing happens without IVRC's approval.",
          nextNodeId: 'nothing_without_approval',
        },
        {
          text: 'Where does that leave the people?',
          nextNodeId: 'where_leaves_people',
        },
        {
          text: 'Thank you for being candid.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'mansion_comment',
      text: "*She gestures around* A gift from my late husband. He believed in building something permanent, something beautiful on the frontier. *Her eyes grow distant* Sometimes I feel like a ghost haunting his dream. But it serves its purpose - people respect visible success.",
      choices: [
        {
          text: 'Your husband passed?',
          nextNodeId: 'husband_death',
        },
        {
          text: 'Success or the appearance of it?',
          nextNodeId: 'appearance_success',
        },
        {
          text: 'It is quite impressive.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'rather_not_say',
      text: "*She nods slowly* Discretion. I understand. In this territory, the wrong word to the wrong person can be... consequential. *She studies you* If you change your mind, I might be able to help. Information flows through this office. Some of it might be... mutually beneficial.",
      choices: [
        {
          text: 'What would you want in return?',
          nextNodeId: 'what_in_return',
        },
        {
          text: "I'll keep that in mind.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'why_interest',
      text: "*She spreads her hands* Simple governance. We track comings and goings, communication patterns, potential... disruptions. A mysterious letter summoning someone to Dusty Springs is exactly the sort of thing that warrants attention. You understand, I'm sure.",
      choices: [
        {
          text: 'You mean IVRC wants to know.',
          nextNodeId: 'ivrc_wants_know',
        },
        {
          text: "I'm not a disruption.",
          nextNodeId: 'not_disruption',
        },
        {
          text: 'Fair enough.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'stability_ivrc',
      text: "Through investment, infrastructure, employment. Yes, through IVRC. *She speaks as if reciting a speech* The railroad company has brought unprecedented growth to this region. Jobs, trade routes, connections to the wider world. Not everyone appreciates these benefits, but they are real.",
      choices: [
        {
          text: "That sounds like a company brochure.",
          nextNodeId: 'company_brochure',
        },
        {
          text: 'And the darker side?',
          nextNodeId: 'darker_side',
        },
        {
          text: 'Progress has its costs.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'keep_moving',
      text: "*She nods* A wise instinct, perhaps. Roots can become chains. But should you decide to settle, know that Dusty Springs rewards those who contribute to its prosperity. We are always looking for... capable individuals.",
      choices: [
        {
          text: 'Capable at what?',
          nextNodeId: 'capable_at_what',
        },
        {
          text: "I'll remember that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'what_stability',
      text: "Protection from the chaos of the frontier. Steady work, access to supplies, law and order of a sort. *She spreads her hands* Out there, a man might be killed for his boots. Here, we have systems. Imperfect, yes, but systems nonetheless.",
      choices: [
        {
          text: 'Systems that benefit some more than others.',
          nextNodeId: 'benefit_some',
        },
        {
          text: "I can see the appeal.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'own_opinions',
      text: "*She relaxes slightly* A refreshingly independent attitude. Most who come here have already decided I'm either a saint or a sinner. *She gestures to a chair* Please, sit. Let us have a proper conversation, uncolored by gossip.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: 'Tell me about yourself.',
          nextNodeId: 'about_yourself',
        },
        {
          text: 'Tell me about this town.',
          nextNodeId: 'about_town',
        },
        {
          text: 'Tell me about IVRC.',
          nextNodeId: 'about_ivrc',
        },
      ],
    },

    {
      id: 'making_enemies',
      text: "*She nods thoughtfully* The cost of virtue, some would say. Or the price of interference, say others. *She leans forward* Tell me - have you considered that sometimes the best help is the help that goes unnoticed? That works within systems rather than against them?",
      choices: [
        {
          text: 'Compromise has its own costs.',
          nextNodeId: 'compromise_costs',
        },
        {
          text: "Perhaps you could teach me.",
          nextNodeId: 'teach_me',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: "I do what I think is right.",
          nextNodeId: 'do_whats_right',
        },
      ],
    },

    {
      id: 'conscience_talk',
      text: "Conscience. *She says the word as if tasting it* A luxury on the frontier. Or perhaps a necessity - I've never quite decided. *She studies you* And what does your conscience tell you about the situation in this territory?",
      choices: [
        {
          text: 'That IVRC needs to be stopped.',
          nextNodeId: 'ivrc_stopped',
        },
        {
          text: "That there are no easy answers.",
          nextNodeId: 'no_easy_answers',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: "That people like you are part of the problem.",
          nextNodeId: 'part_of_problem',
        },
      ],
    },

    {
      id: 'what_would_you_call_me',
      text: "*She considers* A variable. An unknown quantity in a carefully balanced equation. You could tip things in unexpected directions. *She smiles* Whether that makes you an asset or a liability remains to be seen. I prefer to wait and observe.",
      choices: [
        {
          text: 'An honest assessment.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: "I'm no one's asset.",
          nextNodeId: 'no_ones_asset',
        },
      ],
    },

    {
      id: 'well_informed',
      text: "Information is currency, my friend. And a mayor must be wealthy in information if she wishes to survive. *She smiles* I have my sources. People who owe me favors. Eyes in useful places. One must adapt to remain relevant.",
      choices: [
        {
          text: 'Sounds like a spy network.',
          nextNodeId: 'spy_network',
        },
        {
          text: 'And you share this with IVRC?',
          nextNodeId: 'share_with_ivrc',
        },
        {
          text: 'Impressive.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'careful_response',
      text: "*She nods approvingly* Yes, you should. Trust is expensive in Dusty Springs. But don't let caution paralyze you - sometimes the only way forward is through. *She pauses* If you ever need guidance navigating local... sensitivities, my door is open.",
      choices: [
        {
          text: "I'll remember that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'meaning_what',
      text: "*She spreads her hands* Only that survival here requires flexibility. Those who cannot bend... break. Sheriff Cole, for instance, clings to his principles like a man drowning. Admirable, but ultimately futile. The smart ones learn when to fight and when to flow.",
      choices: [
        {
          text: 'And you\'ve learned to flow.',
          nextNodeId: 'learned_to_flow',
        },
        {
          text: "Some principles shouldn't bend.",
          nextNodeId: 'shouldnt_bend',
        },
      ],
    },

    {
      id: 'keep_in_mind',
      text: "Do. *She returns to her papers* Dusty Springs can be a rewarding home for those who understand its... rhythms. Or a very dangerous one for those who don't. *She looks up* I hope to see which you become.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    // ============================================================================
    // RESOLUTION AND ENDING NODES
    // ============================================================================
    {
      id: 'perspective',
      text: "*She smiles, genuine for once* How diplomatic. Perhaps you have a future in governance. *She pours two glasses of water* Most people see only what affects them directly. You seem to grasp the larger picture. That's valuable.",
      choices: [
        {
          text: 'I try to understand before judging.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'sounds_reasonable',
      text: "*She laughs softly* I've had practice making it sound reasonable. It's part of the job. But I appreciate that you're willing to listen before condemning. That alone sets you apart from most visitors to this office.",
      choices: [
        {
          text: 'Perhaps we can help each other.',
          nextNodeId: 'help_each_other',
        },
        {
          text: "I'll make up my own mind.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'help_each_other',
      text: "*Her eyes brighten with interest* Now that's the kind of thinking I appreciate. Come back when you've learned more about this territory. We may indeed find common ground.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_interested' }],
      choices: [
        {
          text: "I'll do that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'unsafe_conditions',
      text: "*Her face tightens* Every death is a tragedy. I sign the condolence letters myself. But would you prefer no jobs at all? Before the mines, people starved. Now they have options. Imperfect options, but options.",
      expression: 'defensive',
      choices: [
        {
          text: "Options between poverty and death aren't options.",
          nextNodeId: 'not_options',
        },
        {
          text: "I take your point.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'not_options',
      text: "*She's silent for a moment* You're not wrong. But I cannot fix everything. I cannot even fix most things. What I can do is fight the battles I might win. Small ones. Invisible ones. *She looks tired* Sometimes that has to be enough.",
      choices: [
        {
          text: 'Maybe I can help with the bigger battles.',
          nextNodeId: 'bigger_battles',
        },
        {
          text: "I understand your position.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'bigger_battles',
      text: "*She studies you carefully* Perhaps. But be careful - those battles have claimed better people than you or me. If you're serious... *she lowers her voice* ...we should speak again. Privately. When I'm certain we're not being watched.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_wants_private_meeting' }],
      choices: [
        {
          text: 'Name the time and place.',
          nextNodeId: 'alliance_formed',
        },
        {
          text: "I'll think about it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'bought_suffering',
      text: "*She flinches as if struck* Do you think I don't know that? Do you think I sleep easily? *She steadies herself* I live with the compromises I've made. But I live. And sometimes, living allows you to help those who otherwise wouldn't be helped at all.",
      expression: 'pained',
      choices: [
        {
          text: "I'm sorry. That was harsh.",
          nextNodeId: 'sorry_harsh',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: 'The truth is often harsh.',
          nextNodeId: 'truth_harsh',
        },
      ],
    },

    {
      id: 'take_your_point',
      text: "*She nods slowly* Thank you. Most people prefer simple narratives. Villains and heroes. The reality is messier, and messier is uncomfortable. I appreciate that you're willing to see the grey.",
      choices: [
        {
          text: "Grey is where most of us live.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'cole_chance',
      text: "*She shakes her head* Marcus is a good man with a good heart. But good hearts don't negotiate with Thorne. They get crushed. I've seen it happen. *She looks at you* He needs to stay exactly where he is - moral opposition that I can point to when IVRC demands too much.",
      choices: [
        {
          text: "So you use him as cover.",
          nextNodeId: 'use_as_cover',
        },
        {
          text: "A complicated relationship.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'no_power',
      text: "Limited power. Constrained. *She rises and moves to the window* Within those constraints, I do what I can. A water right preserved here. A family not evicted there. It adds up. Or I tell myself it does.",
      choices: [
        {
          text: "It's something.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: "It's not enough.",
          nextNodeId: 'not_enough',
        },
      ],
    },

    {
      id: 'impossible_position',
      text: "*She looks at you with something like gratitude* Most people don't see that. They see the mansion, the title, and assume I'm living comfortably off IVRC's largesse. *She laughs bitterly* If only they knew the cost.",
      onEnterEffects: [{ type: 'change_reputation', value: 15 }],
      choices: [
        {
          text: 'Maybe things can change.',
          nextNodeId: 'things_can_change',
        },
        {
          text: "For what it's worth, I respect your struggle.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'things_can_change',
      text: "*Hope flickers in her eyes, then caution reasserts itself* Change requires leverage. Evidence. Power. Do you have any of those things? Because I've been waiting years for someone who does.",
      choices: [
        {
          text: "I'm working on it.",
          nextNodeId: 'working_on_change',
        },
        {
          text: 'Maybe together we could find them.',
          nextNodeId: 'together_find',
        },
      ],
    },

    {
      id: 'working_on_change',
      text: "*She nods slowly* Then keep working. And when you have something concrete... *she writes something on a card* ...come to this address. Not the mansion - IVRC has ears here. We can speak freely there.",
      onEnterEffects: [
        { type: 'give_item', target: 'secret_address' },
        { type: 'set_flag', target: 'mayor_offered_meeting' },
      ],
      choices: [
        {
          text: "I'll find you when the time is right.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'together_find',
      text: "*She extends her hand* Then let's begin. Carefully. Quietly. But let's begin. I've played their game long enough to know where the weaknesses are. What I've lacked is someone I can trust outside their influence.",
      onEnterEffects: [
        { type: 'set_flag', target: 'mayor_alliance' },
        { type: 'set_flag', target: 'mayor_trusts_player' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: '*Shake her hand* Together, then.',
          nextNodeId: null,
        },
      ],
    },

    // ============================================================================
    // ADDITIONAL UTILITY NODES
    // ============================================================================
    {
      id: 'quest_success',
      text: "*Relief washes over her face* Excellent. Father Miguel will ensure those supplies reach the families who need them. *She presses something into your hand* For your trouble. And for your discretion. You've proven yourself trustworthy.",
      onEnterEffects: [
        { type: 'give_gold', value: 50 },
        { type: 'complete_quest', target: 'mayors_errand' },
        { type: 'set_flag', target: 'helped_mayor' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: "It was the right thing to do.",
          nextNodeId: 'right_thing',
        },
        {
          text: "Any more work you need done?",
          nextNodeId: 'more_work',
        },
      ],
    },

    {
      id: 'right_thing',
      text: "*She smiles genuinely* Perhaps I've misjudged the nature of strangers. There is more good in this territory than I sometimes allow myself to see. *She straightens* If you need anything - information, access, protection - come to me. Within my limits, I will help.",
      choices: [
        {
          text: "I appreciate that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'more_work',
      text: "Always. The needs of this territory are endless. But for now, lay low. IVRC will notice the missing supplies eventually. Better if there's no trail leading to either of us. *She smiles* Give it a week. Then we'll talk about next steps.",
      choices: [
        {
          text: "I'll be back.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'still_working',
      text: "*She nods* These things take time. The shipment is still scheduled - you have a few more days. Just remember, the longer it takes, the more risk we both assume. *She returns to her papers* Keep me informed.",
      choices: [
        {
          text: "I'll get it done.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'complications',
      text: "*Her expression hardens* Complications. *She sets down her pen* Tell me everything. We may need to adjust our approach.",
      choices: [
        {
          text: 'I was seen. Had to abort.',
          nextNodeId: 'was_seen',
        },
        {
          text: 'The security was heavier than expected.',
          nextNodeId: 'heavy_security',
        },
      ],
    },

    {
      id: 'was_seen',
      text: "*She curses under her breath - unladylike language that contrasts sharply with her refined manner* Can you be connected to me? *She begins pacing* We may need to accelerate other plans. Or distance ourselves. Tell me exactly what happened.",
      choices: [
        {
          text: 'I got away clean. They saw me but not clearly.',
          nextNodeId: 'got_away_clean',
        },
        {
          text: "I'm not sure. It happened fast.",
          nextNodeId: 'not_sure',
        },
      ],
    },

    {
      id: 'got_away_clean',
      text: "*She exhales slowly* Good. Then we wait. If there's no pursuit in the next day or two, we're clear. *She hands you a different paper* Try this route next time. Less visibility.",
      choices: [
        {
          text: "I won't fail again.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'not_sure',
      text: "*She stops pacing* Then we prepare for the worst. I have contingencies. People who can... muddy the waters. But this complicates things significantly. *She looks at you* Be very careful in the coming days.",
      choices: [
        {
          text: "I understand.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'heavy_security',
      text: "*She frowns* Heavier than usual? That's concerning. IVRC may be expecting trouble. Or... *her eyes narrow* ...someone tipped them off. I'll look into it. In the meantime, stay away from the depot. We'll find another opportunity.",
      choices: [
        {
          text: "I'll lay low.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'who_is_ashworth',
      text: "Victoria Ashworth. Thorne's right hand. His... enforcer, for delicate matters. When negotiations fail, when examples need to be made, they send her. *She pales slightly* Her presence here means IVRC is done being patient.",
      choices: [
        {
          text: 'Patient about what?',
          nextNodeId: 'patient_about_what',
        },
        {
          text: "What do we do?",
          nextNodeId: 'what_do_we_do',
        },
      ],
    },

    {
      id: 'patient_about_what',
      text: "About everything. The Freeminers. The Copperheads. People asking questions about old crimes. *She looks at you pointedly* And about anyone who might be gathering evidence of their wrongdoing. She's here to shut it all down.",
      choices: [
        {
          text: 'Then we need to move faster.',
          nextNodeId: 'accelerate_plans',
        },
        {
          text: "Can she be bought? Negotiated with?",
          nextNodeId: 'bought_negotiated',
        },
      ],
    },

    {
      id: 'what_do_we_do',
      text: "*She grips your arm* We get those documents and get them out of the territory before she finds them. If Ashworth gets her hands on them first, they'll be destroyed and everyone who touched them will disappear. *Her voice is urgent* Can you get to Samuel? Now?",
      choices: [
        {
          text: "I'm on my way.",
          nextNodeId: null,
          effects: [{ type: 'start_quest', target: 'urgent_documents' }],
        },
        {
          text: 'Samuel still doesn\'t trust me enough.',
          nextNodeId: 'doesnt_trust',
        },
      ],
    },

    {
      id: 'accelerate_plans',
      text: "*She nods firmly* Yes. Whatever we've been planning, we do it now. The documents, the connections, everything. *She moves to her desk and begins writing rapidly* I have people who can get evidence to the territorial governor. But we need that evidence first.",
      onEnterEffects: [{ type: 'start_quest', target: 'accelerated_plan' }],
      choices: [
        {
          text: "I'll get the documents.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'what_does_she_know',
      text: "I'm not certain. But she's been asking about the gear symbol. About old worker movements. About you specifically. *She wrings her hands* Someone has been talking. And now Ashworth is connecting the dots.",
      choices: [
        {
          text: "Then let's give her the wrong picture.",
          nextNodeId: 'wrong_picture',
        },
        {
          text: "We need to find out who's talking.",
          nextNodeId: 'whos_talking',
        },
      ],
    },

    {
      id: 'threatening_me',
      text: "*Her smile is cold* Warning you. There's a difference. I take no pleasure in watching people destroy themselves. But if you continue down this path, I cannot - and will not - protect you from the consequences.",
      choices: [
        {
          text: "I don't need your protection.",
          nextNodeId: 'dont_need_protection',
        },
        {
          text: 'What would it take to change your mind?',
          nextNodeId: 'change_mind',
        },
      ],
    },

    {
      id: 'own_interests',
      text: "*She laughs without humor* Everyone says that. Until they discover their interests align with power. Or conflict with it. *She waves dismissively* Come back when you've learned how this territory truly works. Perhaps then we can have a real conversation.",
      choices: [
        {
          text: '*Leave*',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'wrong_foot',
      text: "*She considers* Perhaps. I am... cautious by necessity. If you're genuinely interested in understanding this town - and not merely causing trouble - I could be persuaded to reconsider my assessment.",
      choices: [
        {
          text: 'What would that take?',
          nextNodeId: 'what_would_take',
        },
        {
          text: 'Never mind. I can see this is pointless.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'what_would_take',
      text: "A gesture of good faith. Show me you understand the value of... discretion. There's a rumor circulating about IVRC that's causing unrest. Find its source and... discourage further spreading. Do this, and perhaps we can start fresh.",
      choices: [
        {
          text: "You want me to silence people?",
          nextNodeId: 'silence_people',
        },
        {
          text: "I'll think about it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'silence_people',
      text: "*She sighs* Discourage. Not silence. There's a difference. I'm not asking you to hurt anyone. Just to help maintain the delicate peace that keeps this town functioning. *She meets your eyes* Sometimes peace requires... management.",
      choices: [
        {
          text: "That's not who I am.",
          nextNodeId: null,
        },
        {
          text: "What exactly is the rumor?",
          nextNodeId: 'what_rumor',
        },
      ],
    },

    {
      id: 'about_yourself',
      text: "About myself? *She settles back* I came west with my husband twenty years ago, full of idealistic dreams. William wanted to build. I wanted to organize. Together we thought we could create something lasting. *She pauses* We were half right.",
      choices: [
        {
          text: 'What happened?',
          nextNodeId: 'husband_death',
        },
        {
          text: 'Which half?',
          nextNodeId: 'which_half',
        },
      ],
    },

    {
      id: 'about_town',
      text: "Dusty Springs began as a water stop on the railroad route. Then they found copper in the mountains, and everything changed. Now we're a proper town - for better or worse. Mostly worse, though I'm paid to say otherwise.",
      choices: [
        {
          text: 'Honest of you.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: "What would 'better' look like?",
          nextNodeId: 'what_better',
        },
      ],
    },

    {
      id: 'about_ivrc',
      text: "The Iron Valley Railroad Company owns approximately seventy percent of the territory's productive assets. They control water rights, mineral claims, transportation, and - through various arrangements - most political offices. *She smiles thinly* Including, in some sense, this one.",
      choices: [
        {
          text: "And you're comfortable with that?",
          nextNodeId: 'comfortable_with_that',
        },
        {
          text: "At least you're honest about it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'comfortable_with_that',
      text: "Comfortable? No. *She rises and moves to the window* But comfort is a luxury I forfeited long ago. What I have is survival. And within that survival, small opportunities to do good. It's not nothing.",
      choices: [
        {
          text: "Maybe it could be more.",
          nextNodeId: 'could_be_more',
        },
        {
          text: "I understand.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'could_be_more',
      text: "*She turns to look at you* With the right allies. The right evidence. The right moment. *She's quiet for a long moment* Are you offering to be one of those allies?",
      choices: [
        {
          text: "Maybe. If I can trust you.",
          nextNodeId: 'if_trust',
        },
        {
          text: "I'm considering my options.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'if_trust',
      text: "*She nods slowly* Trust is earned. By both of us. *She returns to her desk and writes something* This is where I can be reached privately. When you're ready to discuss things more... openly, find me there.",
      onEnterEffects: [
        { type: 'give_item', target: 'mayors_private_address' },
        { type: 'set_flag', target: 'mayor_offered_alliance' },
      ],
      choices: [
        {
          text: "I'll be in touch.",
          nextNodeId: null,
        },
      ],
    },

    // Final utility nodes
    {
      id: 'ivrc_questions',
      text: "IVRC. *She sets aside her work* A complex topic. What specifically do you wish to know? Their operations? Their leadership? Their... methods?",
      choices: [
        {
          text: 'Their methods.',
          nextNodeId: 'ivrc_methods',
        },
        {
          text: 'Their weaknesses.',
          nextNodeId: 'ivrc_weaknesses',
        },
        {
          text: 'How to survive them.',
          nextNodeId: 'survive_them',
        },
      ],
    },

    {
      id: 'ivrc_methods',
      text: "They begin with incentives. Generous offers, promises of prosperity. When incentives fail, they apply pressure - legal, financial, social. And when pressure fails... *she pauses* ...accidents happen. Fires. Cave-ins. Disappearances. Nothing that can be proven, of course.",
      choices: [
        {
          text: "And you've witnessed this.",
          nextNodeId: 'witnessed_this',
        },
        {
          text: "How can they be stopped?",
          nextNodeId: 'how_stopped',
        },
      ],
    },

    {
      id: 'ivrc_weaknesses',
      text: "Every empire has weaknesses. IVRC's is their reputation in the East. They need continued investment, political support. If word spread of their... excesses... certain powerful people would distance themselves. The right evidence, in the right hands...",
      choices: [
        {
          text: 'The Ironpick documents.',
          nextNodeId: 'documents_mention',
          conditions: [{ type: 'flag_set', target: 'seeking_ironpick_docs' }],
        },
        {
          text: "Who are the right hands?",
          nextNodeId: 'right_hands',
        },
      ],
    },

    {
      id: 'survive_them',
      text: "Be useful but not threatening. Visible but not important. Never openly oppose them, but never fully commit either. *She smiles bitterly* It's exhausting. But it works. Most of the time.",
      choices: [
        {
          text: "That's no way to live.",
          nextNodeId: 'no_way_to_live',
        },
        {
          text: "I'll remember that.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'town_history',
      text: "History. *She settles back* Dusty Springs was founded thirty years ago as a water station. The railroad came through, then the miners, then the merchants and the problems. Now we're a proper frontier town, with all that entails.",
      choices: [
        {
          text: "And your history with it?",
          nextNodeId: 'your_history',
        },
        {
          text: "What problems specifically?",
          nextNodeId: 'what_problems',
        },
      ],
    },

    {
      id: 'just_respects',
      text: "*She inclines her head* How refreshing. So few people visit merely to be civil. *She gestures* Well, you've seen the mayor in her natural habitat. Is there anything else I can help you with?",
      choices: [
        {
          text: 'Not at the moment. Good day, Mayor.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ivrc_developments',
      text: "*She glances toward the door* Victoria Ashworth has arrived. Thorne's fixer. She's been asking questions, making inquiries. *She lowers her voice* Whatever you're planning, plan faster. Our window is closing.",
      choices: [
        {
          text: 'What does she want?',
          nextNodeId: 'ashworth_wants',
        },
        {
          text: "I'll be careful.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ashworth_wants',
      text: "To solve problems permanently. The Copperheads. The Freeminers. Anyone who threatens IVRC's operations. *She meets your eyes* And anyone gathering evidence against them. She's efficient. Cold. Don't underestimate her.",
      choices: [
        {
          text: "Noted.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'need_info',
      text: "Information about what? I'll help if I can, but there are limits to what I can safely share.",
      choices: [
        {
          text: 'IVRC supply schedules.',
          nextNodeId: 'supply_schedules',
        },
        {
          text: 'Who reports to IVRC in town.',
          nextNodeId: 'who_reports',
        },
        {
          text: 'Never mind.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'supply_schedules',
      text: "*She hesitates, then pulls out a paper* I shouldn't... but these are the published schedules. What actually arrives may differ. Use this information wisely, and please - don't get caught with it.",
      onEnterEffects: [{ type: 'give_item', target: 'supply_schedule' }],
      choices: [
        {
          text: "Thank you. I'll be discreet.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'who_reports',
      text: "*She shakes her head* That I cannot tell you. Not because I don't trust you, but because I don't know everyone. IVRC has eyes I'm not aware of. Assume everyone might report to them. It's safer.",
      choices: [
        {
          text: "Fair enough.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'anything_needed',
      text: "*She considers* There's always something. But right now, the most important thing is those documents. Everything else is secondary. Find them. Protect them. Get them to people who can use them.",
      choices: [
        {
          text: "I'm working on it.",
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const MayorHoltDialogues = [MayorHoltMainDialogue];
