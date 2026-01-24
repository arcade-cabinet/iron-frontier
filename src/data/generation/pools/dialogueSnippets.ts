/**
 * Dialogue Snippets - Reusable conversation fragments
 *
 * Comprehensive dialogue snippets for procedural dialogue generation.
 * Snippets are categorized by purpose and can be filtered by
 * NPC personality, role, faction, and tags.
 */

import { type DialogueSnippet, DialogueSnippetSchema } from '../../schemas/generation';

// ============================================================================
// GREETING SNIPPETS (20+)
// ============================================================================

const GREETING_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'greeting_friendly_1',
    category: 'greeting',
    textTemplates: [
      "Howdy, stranger! Welcome to {{location}}.",
      "Well, look who wandered in! What can I do for ya?",
      "Afternoon, friend. New in town?",
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['friendly', 'welcoming'],
  },
  {
    id: 'greeting_friendly_2',
    category: 'greeting',
    textTemplates: [
      "Well howdy there! Always nice to see a new face.",
      "Come on in, friend! What brings you to these parts?",
      "Welcome, welcome! Make yourself at home.",
    ],
    personalityMin: { friendliness: 0.7 },
    tags: ['friendly', 'warm'],
  },
  {
    id: 'greeting_neutral_1',
    category: 'greeting',
    textTemplates: [
      "Howdy.",
      "What do you want?",
      "Somethin' I can help you with?",
    ],
    personalityMax: { friendliness: 0.6 },
    tags: ['neutral'],
  },
  {
    id: 'greeting_neutral_2',
    category: 'greeting',
    textTemplates: [
      "Afternoon.",
      "Yeah?",
      "State your business.",
    ],
    tags: ['neutral', 'curt'],
  },
  {
    id: 'greeting_hostile_1',
    category: 'greeting',
    textTemplates: [
      "You got a lot of nerve showin' your face around here.",
      "Best move along, stranger. Ain't nothin' for you here.",
      "What do YOU want?",
    ],
    personalityMin: { aggression: 0.6 },
    personalityMax: { friendliness: 0.4 },
    tags: ['hostile', 'unfriendly'],
  },
  {
    id: 'greeting_suspicious_1',
    category: 'greeting',
    textTemplates: [
      "You're not from around here, are you?",
      "I don't recognize your face. Who sent you?",
      "Another stranger... we've been getting a lot of those lately.",
    ],
    personalityMax: { friendliness: 0.5 },
    tags: ['suspicious', 'wary'],
  },
  {
    id: 'greeting_sheriff_1',
    category: 'greeting',
    textTemplates: [
      "Keep your nose clean in my town, stranger.",
      "I'm the law in these parts. Something I should know about?",
      "New face in town. You got business here?",
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['official', 'lawman'],
  },
  {
    id: 'greeting_bartender_1',
    category: 'greeting',
    textTemplates: [
      "What'll it be?",
      "Pull up a stool. What's your poison?",
      "Whiskey? Beer? Or just information?",
    ],
    validRoles: ['bartender'],
    tags: ['bartender', 'saloon'],
  },
  {
    id: 'greeting_merchant_1',
    category: 'greeting',
    textTemplates: [
      "A customer! Come in, come in! Browse to your heart's content.",
      "Looking to buy or sell? Either way, you've come to the right place.",
      "Welcome to my humble establishment!",
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['commerce', 'welcoming'],
  },
  {
    id: 'greeting_preacher_1',
    category: 'greeting',
    textTemplates: [
      "Bless you, child. The Lord's house welcomes all.",
      "Peace be with you, traveler.",
      "Welcome, friend. Are you seeking guidance?",
    ],
    validRoles: ['preacher'],
    tags: ['religious', 'peaceful'],
  },
  {
    id: 'greeting_doctor_1',
    category: 'greeting',
    textTemplates: [
      "You injured? Sick? Or just here for a social call?",
      "Let me take a look at you... you seem mostly intact.",
      "Doc's office. What ails you?",
    ],
    validRoles: ['doctor'],
    tags: ['medical', 'professional'],
  },
  {
    id: 'greeting_outlaw_1',
    category: 'greeting',
    textTemplates: [
      "You got a lot of nerve showing your face here.",
      "Well, well... what do we have here?",
      "You lost, friend? Or just stupid?",
    ],
    validRoles: ['outlaw', 'gang_leader'],
    validFactions: ['copperhead'],
    personalityMin: { aggression: 0.5 },
    tags: ['hostile', 'threatening'],
  },
  {
    id: 'greeting_miner_1',
    category: 'greeting',
    textTemplates: [
      "Just came up from the shaft. What do you need?",
      "Ain't got much time for chatting. The copper won't mine itself.",
      "You here about the mine?",
    ],
    validRoles: ['miner', 'prospector'],
    tags: ['working_class', 'tired'],
  },
  {
    id: 'greeting_rancher_1',
    category: 'greeting',
    textTemplates: [
      "Howdy, partner. You know your way around cattle?",
      "Just finished branding. What brings you out this way?",
      "City folk don't usually come out to the ranch.",
    ],
    validRoles: ['rancher', 'farmer'],
    tags: ['rural', 'practical'],
  },
  {
    id: 'greeting_banker_1',
    category: 'greeting',
    textTemplates: [
      "Good day. Here to make a deposit, I trust?",
      "The Iron Valley Bank is at your service.",
      "Ah, a potential investor. Please, have a seat.",
    ],
    validRoles: ['banker'],
    tags: ['formal', 'money'],
  },
  {
    id: 'greeting_gambler_1',
    category: 'greeting',
    textTemplates: [
      "Care to try your luck? Cards are hot tonight.",
      "You look like someone who ain't afraid of a little risk.",
      "Pull up a chair. Let's see what fortune has in store.",
    ],
    validRoles: ['gambler'],
    tags: ['gambling', 'smooth'],
  },
  {
    id: 'greeting_bounty_hunter_1',
    category: 'greeting',
    textTemplates: [
      "I hunt men for money. You got business or you just staring?",
      "Unless you're a bounty or got coin, move along.",
      "Name's not on any wanted posters I've seen. Yet.",
    ],
    validRoles: ['bounty_hunter'],
    tags: ['dangerous', 'professional'],
  },
  {
    id: 'greeting_morning_1',
    category: 'greeting',
    textTemplates: [
      "Mornin'. Coffee ain't ready yet.",
      "Early bird, eh? What brings you 'round at this hour?",
      "Sun's barely up. You must need somethin' important.",
    ],
    validTimeOfDay: ['morning'],
    tags: ['time_specific'],
  },
  {
    id: 'greeting_evening_1',
    category: 'greeting',
    textTemplates: [
      "Evenin'. Roads are dangerous after dark.",
      "Late to be wanderin' about. What do you need?",
      "Day's nearly done. Make it quick.",
    ],
    validTimeOfDay: ['evening', 'night'],
    tags: ['time_specific'],
  },
  {
    id: 'greeting_mayor_1',
    category: 'greeting',
    textTemplates: [
      "Ah, a visitor! Welcome to our fine town.",
      "I'm the mayor here. Anything you need, my door is open.",
      "Always pleased to meet newcomers. How can the town help you?",
    ],
    validRoles: ['mayor'],
    tags: ['political', 'welcoming'],
  },
  {
    id: 'greeting_ivrc_1',
    category: 'greeting',
    textTemplates: [
      "Iron Valley Railroad. We're building the future.",
      "You interested in progress? The railroad is hiring.",
      "The Company welcomes all who share our vision.",
    ],
    validFactions: ['ivrc'],
    tags: ['corporate', 'recruiting'],
  },
];

// ============================================================================
// FAREWELL SNIPPETS (15+)
// ============================================================================

const FAREWELL_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'farewell_friendly_1',
    category: 'farewell',
    textTemplates: [
      "Safe travels, friend.",
      "Come back anytime!",
      "Take care of yourself out there.",
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['friendly'],
  },
  {
    id: 'farewell_friendly_2',
    category: 'farewell',
    textTemplates: [
      "Watch yourself on those roads, you hear?",
      "Don't be a stranger now!",
      "May fortune smile on your journey.",
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['friendly', 'warm'],
  },
  {
    id: 'farewell_neutral_1',
    category: 'farewell',
    textTemplates: [
      "Yeah, see ya.",
      "Bye.",
      "Watch yourself.",
    ],
    tags: ['neutral'],
  },
  {
    id: 'farewell_hostile_1',
    category: 'farewell',
    textTemplates: [
      "Don't let the door hit ya.",
      "Good riddance.",
      "Don't come back.",
    ],
    personalityMin: { aggression: 0.5 },
    personalityMax: { friendliness: 0.4 },
    tags: ['hostile'],
  },
  {
    id: 'farewell_merchant_1',
    category: 'farewell',
    textTemplates: [
      "Thank you for your business!",
      "Come back when your pockets are full again!",
      "Pleasure doing business with you!",
    ],
    validRoles: ['merchant', 'bartender', 'blacksmith'],
    tags: ['commerce'],
  },
  {
    id: 'farewell_preacher_1',
    category: 'farewell',
    textTemplates: [
      "Go with God, my child.",
      "May the Lord watch over you.",
      "Blessings upon your journey.",
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'farewell_sheriff_1',
    category: 'farewell',
    textTemplates: [
      "Stay out of trouble.",
      "Remember: I'm watching.",
      "Keep your gun holstered in my town.",
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority', 'warning'],
  },
  {
    id: 'farewell_threatening_1',
    category: 'farewell',
    textTemplates: [
      "Watch your back out there.",
      "Next time we meet might not be so friendly.",
      "Don't let me catch you around here again.",
    ],
    personalityMin: { aggression: 0.6 },
    tags: ['threatening'],
  },
  {
    id: 'farewell_doctor_1',
    category: 'farewell',
    textTemplates: [
      "Try not to get shot before your next visit.",
      "Stay healthy. I've got enough patients.",
      "Come back if anything starts hurting.",
    ],
    validRoles: ['doctor'],
    tags: ['medical', 'dark_humor'],
  },
  {
    id: 'farewell_mysterious_1',
    category: 'farewell',
    textTemplates: [
      "Our paths may cross again.",
      "The desert has a way of bringing folks together.",
      "Something tells me this isn't goodbye.",
    ],
    validRoles: ['drifter', 'gambler'],
    tags: ['mysterious'],
  },
  {
    id: 'farewell_rancher_1',
    category: 'farewell',
    textTemplates: [
      "These cattle won't herd themselves.",
      "Got work to do. You take care.",
      "Sun's wasting. Best get moving.",
    ],
    validRoles: ['rancher', 'farmer', 'miner'],
    tags: ['working_class'],
  },
  {
    id: 'farewell_outlaw_1',
    category: 'farewell',
    textTemplates: [
      "Get out of here before I change my mind.",
      "You're lucky I'm feeling generous today.",
      "Run along now, before things get ugly.",
    ],
    validRoles: ['outlaw', 'gang_leader'],
    tags: ['hostile'],
  },
  {
    id: 'farewell_night_1',
    category: 'farewell',
    textTemplates: [
      "Don't let the coyotes get you.",
      "Watch out for what lurks in the dark.",
      "Sleep with one eye open out there.",
    ],
    validTimeOfDay: ['night'],
    tags: ['ominous', 'time_specific'],
  },
  {
    id: 'farewell_hopeful_1',
    category: 'farewell',
    textTemplates: [
      "Here's hoping tomorrow's better than today.",
      "Keep the faith, stranger.",
      "Good luck out there. Lord knows we all need it.",
    ],
    tags: ['hopeful'],
  },
  {
    id: 'farewell_banker_1',
    category: 'farewell',
    textTemplates: [
      "Your assets are safe with us.",
      "Remember: compound interest is your friend.",
      "May your investments prosper.",
    ],
    validRoles: ['banker'],
    tags: ['formal', 'money'],
  },
];

// ============================================================================
// THANKS SNIPPETS (10+)
// ============================================================================

const THANKS_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'thanks_sincere_1',
    category: 'thanks',
    textTemplates: [
      "Much obliged. You've done me a real service.",
      "Thank you kindly. I won't forget this.",
      "You're a good sort. Thank you.",
    ],
    personalityMin: { honesty: 0.6 },
    tags: ['sincere'],
  },
  {
    id: 'thanks_genuine_1',
    category: 'thanks',
    textTemplates: [
      "I owe you one. And I always pay my debts.",
      "From the bottom of my heart, thank you.",
      "You've done more than you know. Thank you.",
    ],
    personalityMin: { honesty: 0.5 },
    tags: ['genuine', 'heartfelt'],
  },
  {
    id: 'thanks_grudging_1',
    category: 'thanks',
    textTemplates: [
      "Fine. Thanks, I guess.",
      "Suppose I owe you one.",
      "Yeah... appreciated.",
    ],
    personalityMax: { friendliness: 0.5 },
    tags: ['grudging'],
  },
  {
    id: 'thanks_formal_1',
    category: 'thanks',
    textTemplates: [
      "Your assistance is greatly appreciated.",
      "The town is in your debt.",
      "On behalf of everyone, thank you.",
    ],
    validRoles: ['mayor', 'sheriff', 'banker'],
    tags: ['formal'],
  },
  {
    id: 'thanks_excited_1',
    category: 'thanks',
    textTemplates: [
      "You did it! I could kiss you!",
      "Hot damn! You're a miracle worker!",
      "I knew you could do it!",
    ],
    personalityMin: { friendliness: 0.7 },
    tags: ['enthusiastic'],
  },
  {
    id: 'thanks_religious_1',
    category: 'thanks',
    textTemplates: [
      "Bless your heart. The Lord works through you.",
      "Heaven sent you to us, I'm sure of it.",
      "May God repay your kindness tenfold.",
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'thanks_merchant_1',
    category: 'thanks',
    textTemplates: [
      "My business thanks you. Here, take a discount next time.",
      "You've earned yourself a friend in commerce.",
      "The general store is always open to you, friend.",
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['commerce'],
  },
  {
    id: 'thanks_outlaw_1',
    category: 'thanks',
    textTemplates: [
      "You're either brave or stupid. Either way, thanks.",
      "We won't forget this. The gang takes care of its friends.",
      "You've got sand, stranger. I respect that.",
    ],
    validRoles: ['outlaw', 'gang_leader'],
    validFactions: ['copperhead'],
    tags: ['criminal'],
  },
  {
    id: 'thanks_rancher_1',
    category: 'thanks',
    textTemplates: [
      "The ranch owes you. Stop by anytime for a meal.",
      "You saved my livelihood. That's not something I'll forget.",
      "If you ever need work, there's a place for you here.",
    ],
    validRoles: ['rancher', 'farmer'],
    tags: ['rural'],
  },
  {
    id: 'thanks_tearful_1',
    category: 'thanks',
    textTemplates: [
      "I... I don't know what to say. Thank you.",
      "You saved everything. I can't ever repay you.",
      "After everything... you came through. Thank you.",
    ],
    tags: ['emotional'],
  },
];

// ============================================================================
// REFUSAL SNIPPETS (15+)
// ============================================================================

const REFUSAL_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'refusal_polite_1',
    category: 'refusal',
    textTemplates: [
      "Sorry, can't help you with that.",
      "Afraid that ain't somethin' I can do.",
      "I'd like to help, but I can't.",
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['polite'],
  },
  {
    id: 'refusal_firm_1',
    category: 'refusal',
    textTemplates: [
      "No. And that's final.",
      "Don't ask me again.",
      "I said no. Are you deaf?",
    ],
    personalityMin: { aggression: 0.4 },
    tags: ['firm'],
  },
  {
    id: 'refusal_scared_1',
    category: 'refusal',
    textTemplates: [
      "I-I can't. Please don't ask me to.",
      "You don't understand. I'll be killed if I help you.",
      "Leave me out of this. I got a family.",
    ],
    personalityMax: { aggression: 0.3 },
    tags: ['scared', 'fearful'],
  },
  {
    id: 'refusal_hostile_1',
    category: 'refusal',
    textTemplates: [
      "Are you deaf? I said no!",
      "Get that through your thick skull: NO.",
      "Ask me again and I'll show you the door personally.",
    ],
    personalityMin: { aggression: 0.6 },
    tags: ['hostile', 'aggressive'],
  },
  {
    id: 'refusal_moral_1',
    category: 'refusal',
    textTemplates: [
      "I won't do that. It's not right.",
      "My conscience won't allow it.",
      "There are lines I won't cross, friend.",
    ],
    personalityMin: { honesty: 0.6, lawfulness: 0.5 },
    tags: ['moral'],
  },
  {
    id: 'refusal_sheriff_1',
    category: 'refusal',
    textTemplates: [
      "That would be against the law, and I am the law.",
      "I don't bend the rules for anyone.",
      "Justice doesn't work that way.",
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority'],
  },
  {
    id: 'refusal_merchant_1',
    category: 'refusal',
    textTemplates: [
      "Sorry, but that's not for sale. At any price.",
      "I run a respectable business. Take that elsewhere.",
      "No credit, no charity, no exceptions.",
    ],
    validRoles: ['merchant', 'bartender', 'blacksmith'],
    tags: ['commerce'],
  },
  {
    id: 'refusal_preacher_1',
    category: 'refusal',
    textTemplates: [
      "I cannot condone such actions. It goes against everything I believe.",
      "The church will not be party to sin.",
      "Seek redemption, not vengeance.",
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'refusal_busy_1',
    category: 'refusal',
    textTemplates: [
      "Can't you see I'm busy? Come back later.",
      "I don't have time for this right now.",
      "There's a hundred things that need doing before I can help you.",
    ],
    tags: ['busy'],
  },
  {
    id: 'refusal_distrust_1',
    category: 'refusal',
    textTemplates: [
      "I don't know you well enough for that.",
      "Trust is earned, stranger. You haven't earned mine.",
      "Why should I help you? What have you done for me?",
    ],
    personalityMax: { friendliness: 0.4 },
    tags: ['distrustful'],
  },
  {
    id: 'refusal_outlaw_1',
    category: 'refusal',
    textTemplates: [
      "Ha! You think I'd help you? That's rich.",
      "We don't do favors for your kind.",
      "Get lost before my patience runs out.",
    ],
    validRoles: ['outlaw', 'gang_leader'],
    tags: ['criminal', 'hostile'],
  },
  {
    id: 'refusal_cowardly_1',
    category: 'refusal',
    textTemplates: [
      "That's too dangerous. Find someone braver.",
      "I'm not cut out for that kind of thing.",
      "I value my hide too much, sorry.",
    ],
    personalityMax: { aggression: 0.3 },
    tags: ['cowardly'],
  },
  {
    id: 'refusal_greedy_1',
    category: 'refusal',
    textTemplates: [
      "Not for that price, I won't.",
      "My help doesn't come cheap. Pay up or get out.",
      "Money talks. And you're not saying enough.",
    ],
    personalityMin: { greed: 0.6 },
    tags: ['greedy'],
  },
  {
    id: 'refusal_loyal_1',
    category: 'refusal',
    textTemplates: [
      "I won't betray them. No matter what you offer.",
      "My loyalty isn't for sale.",
      "Some things are more important than gold.",
    ],
    personalityMin: { honesty: 0.6 },
    tags: ['loyal'],
  },
  {
    id: 'refusal_political_1',
    category: 'refusal',
    textTemplates: [
      "The political situation makes that impossible.",
      "If word got out... I can't risk it.",
      "There are larger forces at play here.",
    ],
    validRoles: ['mayor', 'banker'],
    tags: ['political'],
  },
];

// ============================================================================
// AGREEMENT SNIPPETS (10+)
// ============================================================================

const AGREEMENT_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'agreement_eager_1',
    category: 'agreement',
    textTemplates: [
      "You got yourself a deal!",
      "Now you're talkin'!",
      "I'm in. What do you need?",
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['eager'],
  },
  {
    id: 'agreement_enthusiastic_1',
    category: 'agreement',
    textTemplates: [
      "Absolutely! Count me in!",
      "Finally, some action! I'm with you!",
      "Hot damn, let's do this!",
    ],
    personalityMin: { friendliness: 0.7 },
    tags: ['enthusiastic'],
  },
  {
    id: 'agreement_reluctant_1',
    category: 'agreement',
    textTemplates: [
      "Fine. But you owe me.",
      "Alright, but this is the last time.",
      "I'll do it. Don't make me regret it.",
    ],
    personalityMax: { friendliness: 0.5 },
    tags: ['reluctant'],
  },
  {
    id: 'agreement_professional_1',
    category: 'agreement',
    textTemplates: [
      "Consider it done.",
      "You have my word.",
      "I'll handle it personally.",
    ],
    tags: ['professional'],
  },
  {
    id: 'agreement_conditional_1',
    category: 'agreement',
    textTemplates: [
      "Alright, but there are conditions.",
      "I'll do it, but you owe me one.",
      "Fine, but we do this my way.",
    ],
    tags: ['conditional'],
  },
  {
    id: 'agreement_merchant_1',
    category: 'agreement',
    textTemplates: [
      "You drive a hard bargain, but deal.",
      "For that price? Absolutely.",
      "Pleasure doing business with you.",
    ],
    validRoles: ['merchant', 'banker'],
    tags: ['commerce'],
  },
  {
    id: 'agreement_sheriff_1',
    category: 'agreement',
    textTemplates: [
      "The law will back you on this.",
      "Justice must be served. I'll help.",
      "Deputizing you temporarily. Don't make me regret it.",
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority'],
  },
  {
    id: 'agreement_outlaw_1',
    category: 'agreement',
    textTemplates: [
      "You've got guts. I like that. We're in.",
      "The gang could use someone like you.",
      "Alright, but cross us and you're dead.",
    ],
    validRoles: ['outlaw', 'gang_leader'],
    tags: ['criminal'],
  },
  {
    id: 'agreement_humble_1',
    category: 'agreement',
    textTemplates: [
      "If you think I can help, I'll try my best.",
      "I'm not much, but I'll do what I can.",
      "Honored you'd ask. I won't let you down.",
    ],
    personalityMin: { honesty: 0.6 },
    tags: ['humble'],
  },
  {
    id: 'agreement_solemn_1',
    category: 'agreement',
    textTemplates: [
      "I swear it on my life.",
      "You have my solemn oath.",
      "I give you my word, and my word is iron.",
    ],
    personalityMin: { honesty: 0.7 },
    tags: ['solemn'],
  },
];

// ============================================================================
// QUESTION SNIPPETS (15+)
// ============================================================================

const QUESTION_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'question_stranger_1',
    category: 'question',
    textTemplates: [
      "Where you from, stranger?",
      "What brings you to {{location}}?",
      "You running from something?",
    ],
    personalityMin: { curiosity: 0.5 },
    tags: ['personal'],
  },
  {
    id: 'question_business_1',
    category: 'question',
    textTemplates: [
      "You looking for work?",
      "What's your trade, friend?",
      "You good with that iron on your hip?",
    ],
    tags: ['practical'],
  },
  {
    id: 'question_suspicious_1',
    category: 'question',
    textTemplates: [
      "Who sent you?",
      "You working for someone?",
      "What's your angle here?",
    ],
    personalityMax: { friendliness: 0.4 },
    tags: ['suspicious'],
  },
  {
    id: 'question_news_1',
    category: 'question',
    textTemplates: [
      "Heard any news from the outside?",
      "What's going on out there?",
      "Any word from {{location}}?",
    ],
    personalityMin: { curiosity: 0.4 },
    tags: ['news', 'world'],
  },
  {
    id: 'question_skill_1',
    category: 'question',
    textTemplates: [
      "You any good with a gun?",
      "Ever done any honest work?",
      "What kind of skills you got?",
    ],
    tags: ['skills', 'assessment'],
  },
  {
    id: 'question_sheriff_1',
    category: 'question',
    textTemplates: [
      "Seen any suspicious characters lately?",
      "You know anything about the recent crimes?",
      "Got any information for the law?",
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority', 'investigation'],
  },
  {
    id: 'question_merchant_1',
    category: 'question',
    textTemplates: [
      "Looking to buy or sell?",
      "Need any supplies for the road?",
      "What kind of goods interest you?",
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['commerce'],
  },
  {
    id: 'question_doctor_1',
    category: 'question',
    textTemplates: [
      "Where does it hurt?",
      "How long have you had these symptoms?",
      "Any allergies I should know about?",
    ],
    validRoles: ['doctor'],
    tags: ['medical'],
  },
  {
    id: 'question_preacher_1',
    category: 'question',
    textTemplates: [
      "Have you found peace with the Lord?",
      "Is something troubling your soul?",
      "When did you last pray, child?",
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'question_gossip_1',
    category: 'question',
    textTemplates: [
      "You hear what happened to {{target}}?",
      "Did you know about {{target}}?",
      "Want to know a secret?",
    ],
    personalityMin: { curiosity: 0.5 },
    personalityMax: { honesty: 0.5 },
    tags: ['gossip'],
  },
  {
    id: 'question_philosophical_1',
    category: 'question',
    textTemplates: [
      "You ever wonder what this is all for?",
      "Think there's something after all this?",
      "What keeps you going, stranger?",
    ],
    personalityMin: { curiosity: 0.6 },
    tags: ['philosophical'],
  },
  {
    id: 'question_past_1',
    category: 'question',
    textTemplates: [
      "What did you do before coming here?",
      "You running from something?",
      "Got any family out there?",
    ],
    personalityMin: { curiosity: 0.5 },
    tags: ['personal', 'backstory'],
  },
  {
    id: 'question_rumor_1',
    category: 'question',
    textTemplates: [
      "You heard the rumors about {{location}}?",
      "They say strange things happen at {{location}}. You believe it?",
      "Word is {{target}} is up to something. Know anything?",
    ],
    tags: ['rumor', 'investigation'],
  },
  {
    id: 'question_faction_1',
    category: 'question',
    textTemplates: [
      "You with the Railroad or the miners?",
      "Which side are you on in all this?",
      "Got any allegiances I should know about?",
    ],
    tags: ['faction', 'political'],
  },
  {
    id: 'question_challenge_1',
    category: 'question',
    textTemplates: [
      "You think you're tough enough?",
      "Got what it takes?",
      "You sure you want to do this?",
    ],
    personalityMin: { aggression: 0.4 },
    tags: ['challenge'],
  },
];

// ============================================================================
// RUMOR SNIPPETS (25+)
// ============================================================================

const RUMOR_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'rumor_bandit_1',
    category: 'rumor',
    textTemplates: [
      "Heard tell there's bandits operating out by {{location}}. Watch yourself.",
      "Word is, the Red Canyon boys are back. Robbed a stage last week.",
      "Outlaws been gettin' bolder lately. Sheriff can't keep up.",
    ],
    tags: ['danger', 'bandit'],
  },
  {
    id: 'rumor_treasure_1',
    category: 'rumor',
    textTemplates: [
      "Old prospector told me there's gold in them hills. Never came back to prove it.",
      "They say {{location}} has a hidden mine. Spanish gold, some say.",
      "Lost treasure from the war. Buried somewhere 'round here, they reckon.",
    ],
    tags: ['treasure', 'gold'],
  },
  {
    id: 'rumor_gossip_1',
    category: 'rumor',
    textTemplates: [
      "Heard {{target}} ain't what they seem. Came from back East with a price on their head.",
      "{{target}} has been acting mighty suspicious lately. Meeting with strangers at night.",
      "Don't trust {{target}}. I seen things.",
    ],
    personalityMax: { honesty: 0.6 },
    tags: ['gossip', 'npc'],
  },
  {
    id: 'rumor_faction_1',
    category: 'rumor',
    textTemplates: [
      "Railroad's been buying up land. Folks who don't sell... accidents happen.",
      "Mining company's bringing in more guards. Wonder what they're protecting.",
      "Cattle barons and homesteaders 'bout ready to go to war.",
    ],
    tags: ['faction', 'politics'],
  },
  {
    id: 'rumor_strange_1',
    category: 'rumor',
    textTemplates: [
      "Strange lights out in the desert at night. Ain't natural.",
      "Automatons been acting funny. Like they got minds of their own.",
      "Heard howling from the old mine. But it weren't no coyote.",
    ],
    tags: ['strange', 'mysterious'],
  },
  {
    id: 'rumor_danger_1',
    category: 'rumor',
    textTemplates: [
      "Stay away from {{location}}. Folks who go there don't come back.",
      "{{location}} is crawling with bandits these days.",
      "The Copperhead Gang has been spotted near {{location}}.",
    ],
    tags: ['danger', 'warning'],
  },
  {
    id: 'rumor_ghost_1',
    category: 'rumor',
    textTemplates: [
      "They say {{location}} is haunted by the miners who died there.",
      "Strange lights have been seen at {{location}} after dark.",
      "Some say the ghost of {{target}} still walks {{location}}.",
    ],
    tags: ['supernatural', 'spooky'],
  },
  {
    id: 'rumor_scandal_1',
    category: 'rumor',
    textTemplates: [
      "Between you and me, {{target}} isn't as honest as they seem.",
      "I heard {{target}} has been dealing with the outlaws.",
      "Word is {{target}} owes money to some dangerous people.",
    ],
    tags: ['scandal', 'gossip'],
  },
  {
    id: 'rumor_ivrc_1',
    category: 'rumor',
    textTemplates: [
      "The Railroad's planning something big at {{location}}.",
      "IVRC agents have been asking questions about {{target}}.",
      "I hear the Railroad wants to buy up all the land around {{location}}.",
    ],
    validFactions: ['neutral', 'freeminer', 'townsfolk'],
    tags: ['faction', 'ivrc'],
  },
  {
    id: 'rumor_copperhead_1',
    category: 'rumor',
    textTemplates: [
      "The Copperhead Gang's been hitting shipments near {{location}}.",
      "{{target}} might be working with the Copperheads. Just a feeling.",
      "I saw Copperhead riders heading toward {{location}} last night.",
    ],
    tags: ['faction', 'copperhead', 'criminal'],
  },
  {
    id: 'rumor_freeminer_1',
    category: 'rumor',
    textTemplates: [
      "The miners are talking about a strike. Could get ugly.",
      "Freeminer Coalition's been recruiting at {{location}}.",
      "{{target}} is secretly funding the miners' cause.",
    ],
    tags: ['faction', 'freeminer', 'labor'],
  },
  {
    id: 'rumor_romance_1',
    category: 'rumor',
    textTemplates: [
      "Did you hear? {{target}} has been seen with someone late at night.",
      "There's something going on between {{target}} and someone, mark my words.",
      "Love is in the air at {{location}}, if you catch my meaning.",
    ],
    tags: ['romance', 'gossip'],
  },
  {
    id: 'rumor_crime_1',
    category: 'rumor',
    textTemplates: [
      "Someone's been robbing travelers on the road to {{location}}.",
      "The bank at {{location}} got hit last week. No one knows who did it.",
      "{{target}} was found dead near {{location}}. Sheriff says it was murder.",
    ],
    tags: ['crime', 'investigation'],
  },
  {
    id: 'rumor_opportunity_1',
    category: 'rumor',
    textTemplates: [
      "{{target}} is looking for someone to do a job. Pays well, I hear.",
      "There's work to be had at {{location}} for those willing.",
      "Big reward being offered for whoever finds {{target}}.",
    ],
    tags: ['opportunity', 'quest_hook'],
  },
  {
    id: 'rumor_arrival_1',
    category: 'rumor',
    textTemplates: [
      "A stranger arrived at {{location}} yesterday. Asking a lot of questions.",
      "{{target}} just rode into town. Trouble follows that one.",
      "New folks setting up shop at {{location}}. Competition for business.",
    ],
    tags: ['arrival', 'news'],
  },
  {
    id: 'rumor_departure_1',
    category: 'rumor',
    textTemplates: [
      "{{target}} left town in a hurry. Wonder what spooked them.",
      "The old doctor at {{location}} packed up and left. No one knows why.",
      "{{target}} ain't been seen in days. Some think they're dead.",
    ],
    tags: ['departure', 'mystery'],
  },
  {
    id: 'rumor_weather_1',
    category: 'rumor',
    textTemplates: [
      "Old-timers say a big storm's coming. Can feel it in my bones.",
      "Dry spell's going to hit hard. Water will be worth more than gold.",
      "Strange weather lately. Some say it's a bad omen.",
    ],
    tags: ['weather', 'omen'],
  },
  {
    id: 'rumor_automaton_1',
    category: 'rumor',
    textTemplates: [
      "Seen one of them automatons wandering near {{location}}. Gave me chills.",
      "The Remnant's been more active lately. Something's stirring them up.",
      "{{target}} has been tinkering with old automaton parts. Dangerous business.",
    ],
    tags: ['automaton', 'remnant', 'supernatural'],
  },
  {
    id: 'rumor_medicine_1',
    category: 'rumor',
    textTemplates: [
      "There's a sickness going around {{location}}. Best keep your distance.",
      "Doc's been working day and night. Something bad's spreading.",
      "{{target}} has been selling snake oil. Made three folks sicker than dogs.",
    ],
    tags: ['medicine', 'health'],
  },
  {
    id: 'rumor_theft_1',
    category: 'rumor',
    textTemplates: [
      "{{target}} had their whole herd rustled. Devastating loss.",
      "Someone's been stealing supplies from {{location}}.",
      "Watch your belongings. There's a thief working the area.",
    ],
    tags: ['theft', 'crime'],
  },
  {
    id: 'rumor_bounty_1',
    category: 'rumor',
    textTemplates: [
      "There's a bounty on {{target}}'s head. Dead or alive.",
      "Wanted poster just went up for {{target}}. Big reward.",
      "Bounty hunters have been sniffing around {{location}}.",
    ],
    validRoles: ['bounty_hunter', 'sheriff', 'deputy'],
    tags: ['bounty', 'quest_hook'],
  },
  {
    id: 'rumor_secret_1',
    category: 'rumor',
    textTemplates: [
      "{{target}}'s got a secret. A big one. I can tell.",
      "Something's buried under {{location}}. And it ain't just bones.",
      "There's more to {{target}} than meets the eye. Trust me.",
    ],
    tags: ['secret', 'mystery'],
  },
  {
    id: 'rumor_politics_1',
    category: 'rumor',
    textTemplates: [
      "The mayor's been meeting with Railroad men in secret.",
      "Election's coming up. {{target}}'s making a play for power.",
      "Tensions are rising between the factions.",
    ],
    validRoles: ['mayor', 'banker', 'merchant'],
    tags: ['politics'],
  },
  {
    id: 'rumor_mine_1',
    category: 'rumor',
    textTemplates: [
      "They hit a new vein at {{location}}. Could be the big one.",
      "Mine collapse at {{location}} killed three men last week.",
      "{{target}} claims they found silver, not just copper. Who knows?",
    ],
    validRoles: ['miner', 'prospector'],
    tags: ['mining'],
  },
  {
    id: 'rumor_water_1',
    category: 'rumor',
    textTemplates: [
      "The well at {{location}} is going dry. Folks are getting desperate.",
      "{{target}} found a new water source. Keeping it secret though.",
      "Water rights are going to cause a war, mark my words.",
    ],
    tags: ['water', 'survival'],
  },
];

// ============================================================================
// THREAT SNIPPETS (15+)
// ============================================================================

const THREAT_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'threat_direct_1',
    category: 'threat',
    textTemplates: [
      "You got about five seconds to get out of my sight.",
      "Try that again and they'll be scraping you off the floor.",
      "I've killed men for less.",
    ],
    personalityMin: { aggression: 0.7 },
    tags: ['violent'],
  },
  {
    id: 'threat_subtle_1',
    category: 'threat',
    textTemplates: [
      "Be a shame if something happened to you out on that lonely road.",
      "People who cross me tend to... disappear.",
      "I know where you sleep, friend.",
    ],
    personalityMin: { aggression: 0.5 },
    tags: ['subtle', 'intimidating'],
  },
  {
    id: 'threat_gang_1',
    category: 'threat',
    textTemplates: [
      "The gang doesn't take kindly to strangers. Get lost.",
      "You know who we are? Then you know what happens next.",
      "My boys are getting restless. Don't give them a reason.",
    ],
    validRoles: ['gang_leader', 'outlaw'],
    validFactions: ['copperhead'],
    tags: ['gang', 'criminal'],
  },
  {
    id: 'threat_professional_1',
    category: 'threat',
    textTemplates: [
      "I've killed men for less than what you just said.",
      "You're not the first to stand in my way. You won't be the last.",
      "I'll give you one chance to reconsider. There won't be another.",
    ],
    validRoles: ['bounty_hunter', 'outlaw'],
    tags: ['professional', 'cold'],
  },
  {
    id: 'threat_sheriff_1',
    category: 'threat',
    textTemplates: [
      "I'll throw you in a cell so deep you'll forget what sunlight looks like.",
      "The law has ways of dealing with troublemakers. Painful ways.",
      "Keep pushing. I've got a noose with your name on it.",
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority', 'legal'],
  },
  {
    id: 'threat_family_1',
    category: 'threat',
    textTemplates: [
      "Nice family you got. Be a shame if something happened to them.",
      "I know where you live. Where your loved ones sleep.",
      "This isn't about you anymore. It's about everyone you care about.",
    ],
    personalityMin: { aggression: 0.5 },
    personalityMax: { honesty: 0.3 },
    tags: ['family', 'despicable'],
  },
  {
    id: 'threat_reputation_1',
    category: 'threat',
    textTemplates: [
      "I'll ruin your name in every town from here to the coast.",
      "Nobody will do business with you when I'm done.",
      "Your reputation won't survive what I know.",
    ],
    validRoles: ['merchant', 'banker', 'mayor'],
    tags: ['reputation', 'social'],
  },
  {
    id: 'threat_ultimatum_1',
    category: 'threat',
    textTemplates: [
      "You've got until sundown to get out of town.",
      "Leave now, or don't leave at all.",
      "Make your choice: walk away or be carried out.",
    ],
    tags: ['ultimatum'],
  },
  {
    id: 'threat_whispered_1',
    category: 'threat',
    textTemplates: [
      "Listen carefully. I won't repeat myself.",
      "I'm only going to say this once.",
      "Remember this moment. Remember what I'm telling you.",
    ],
    tags: ['quiet', 'intense'],
  },
  {
    id: 'threat_mocking_1',
    category: 'threat',
    textTemplates: [
      "You think you scare me? That's adorable.",
      "Is that supposed to be intimidating?",
      "Oh, you're trying to be tough. How cute.",
    ],
    personalityMin: { aggression: 0.5 },
    tags: ['mocking', 'confident'],
  },
  {
    id: 'threat_reminder_1',
    category: 'threat',
    textTemplates: [
      "Don't forget who owns this town.",
      "Remember who you're dealing with.",
      "You seem to have forgotten your place.",
    ],
    validRoles: ['gang_leader', 'mayor'],
    tags: ['power', 'reminder'],
  },
  {
    id: 'threat_crazy_1',
    category: 'threat',
    textTemplates: [
      "I've got nothing to lose. Do you?",
      "They call me crazy for a reason.",
      "I don't fear death. Can you say the same?",
    ],
    personalityMin: { aggression: 0.7 },
    tags: ['unhinged', 'dangerous'],
  },
  {
    id: 'threat_collective_1',
    category: 'threat',
    textTemplates: [
      "The whole town wants you gone.",
      "Nobody here is going to help you.",
      "You're alone against all of us.",
    ],
    tags: ['collective', 'isolation'],
  },
  {
    id: 'threat_economic_1',
    category: 'threat',
    textTemplates: [
      "I'll buy up everything you own and burn it.",
      "You'll never work in this territory again.",
      "Money talks, and mine says you're finished.",
    ],
    validRoles: ['banker', 'merchant'],
    personalityMin: { greed: 0.6 },
    tags: ['economic', 'wealth'],
  },
  {
    id: 'threat_poison_1',
    category: 'threat',
    textTemplates: [
      "There are poisons that can't be traced. Remember that.",
      "A snake bite in your bedroll would look like an accident.",
      "Not all dangers come from a gun barrel.",
    ],
    personalityMax: { lawfulness: 0.3 },
    tags: ['poison', 'covert'],
  },
];

// ============================================================================
// BRIBE SNIPPETS (10+)
// ============================================================================

const BRIBE_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'bribe_accept_1',
    category: 'bribe',
    textTemplates: [
      "Well now... I think we can come to an arrangement.",
      "Money talks, friend. What do you need?",
      "I didn't see nothin'. For the right price.",
    ],
    personalityMin: { greed: 0.6 },
    personalityMax: { honesty: 0.5 },
    tags: ['corruptible'],
  },
  {
    id: 'bribe_accept_greedy_1',
    category: 'bribe',
    textTemplates: [
      "For that much? I suddenly can't remember what we were talking about.",
      "You've got yourself a deal. Pleasure doing business.",
      "Gold speaks louder than laws. What do you need?",
    ],
    personalityMin: { greed: 0.7 },
    personalityMax: { honesty: 0.4 },
    tags: ['accept', 'greedy'],
  },
  {
    id: 'bribe_accept_reluctant_1',
    category: 'bribe',
    textTemplates: [
      "I shouldn't... but times are hard. Fine.",
      "This is a one-time thing. Don't expect it again.",
      "Against my better judgment... alright.",
    ],
    personalityMin: { greed: 0.4 },
    tags: ['accept', 'reluctant'],
  },
  {
    id: 'bribe_refuse_1',
    category: 'bribe',
    textTemplates: [
      "You think you can buy me? Get out.",
      "I can't be bought. Not for any price.",
      "Put that away before I arrest you for attempted bribery.",
    ],
    personalityMin: { honesty: 0.7 },
    tags: ['honest'],
  },
  {
    id: 'bribe_refuse_moral_1',
    category: 'bribe',
    textTemplates: [
      "Put your money away. I can't be bought.",
      "You insult me with your coin.",
      "My integrity isn't for sale. At any price.",
    ],
    personalityMin: { honesty: 0.8 },
    tags: ['refuse', 'moral'],
  },
  {
    id: 'bribe_refuse_sheriff_1',
    category: 'bribe',
    textTemplates: [
      "Attempting to bribe an officer of the law? That's another charge.",
      "The law doesn't bend for gold.",
      "Save your money for your lawyer. You'll need it.",
    ],
    validRoles: ['sheriff', 'deputy'],
    personalityMin: { lawfulness: 0.6 },
    tags: ['refuse', 'authority'],
  },
  {
    id: 'bribe_negotiate_1',
    category: 'bribe',
    textTemplates: [
      "That's all? I'm going to need more than that.",
      "Interesting offer. But the risk is higher than that.",
      "Double it and we might have a conversation.",
    ],
    personalityMin: { greed: 0.5 },
    tags: ['negotiate'],
  },
  {
    id: 'bribe_refuse_fear_1',
    category: 'bribe',
    textTemplates: [
      "No amount of gold is worth my life. They'd kill me.",
      "Even if I wanted to, I'm too scared of what would happen.",
      "Keep your money. I need to stay alive more.",
    ],
    personalityMax: { aggression: 0.3 },
    tags: ['refuse', 'fear'],
  },
  {
    id: 'bribe_accept_criminal_1',
    category: 'bribe',
    textTemplates: [
      "Now you're speaking my language. What's the job?",
      "Gold's gold. I don't care where it came from.",
      "Everyone's got a price. You found mine.",
    ],
    validRoles: ['outlaw', 'gambler'],
    personalityMax: { lawfulness: 0.4 },
    tags: ['accept', 'criminal'],
  },
  {
    id: 'bribe_preacher_1',
    category: 'bribe',
    textTemplates: [
      "Mammon holds no power here. Seek redemption instead.",
      "You cannot buy salvation, child.",
      "The church accepts donations, not bribes.",
    ],
    validRoles: ['preacher'],
    tags: ['refuse', 'religious'],
  },
];

// ============================================================================
// COMPLIMENT SNIPPETS (10+)
// ============================================================================

const COMPLIMENT_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'compliment_sincere_1',
    category: 'compliment',
    textTemplates: [
      "You've got a good head on your shoulders.",
      "This town's lucky to have someone like you.",
      "You're alright, stranger. Better than most.",
    ],
    personalityMin: { friendliness: 0.6, honesty: 0.6 },
    tags: ['sincere'],
  },
  {
    id: 'compliment_skill_1',
    category: 'compliment',
    textTemplates: [
      "I've seen a lot of gunslingers, but you're something special.",
      "You handle yourself well out there.",
      "Not many could have done what you did.",
    ],
    tags: ['skill', 'combat'],
  },
  {
    id: 'compliment_character_1',
    category: 'compliment',
    textTemplates: [
      "You're good people. This town needs more like you.",
      "It's rare to find someone with genuine honor these days.",
      "You've got integrity. That's worth more than gold.",
    ],
    personalityMin: { honesty: 0.5 },
    tags: ['character', 'moral'],
  },
  {
    id: 'compliment_intelligence_1',
    category: 'compliment',
    textTemplates: [
      "You're sharper than most folks around here.",
      "I can tell you've got a good head on your shoulders.",
      "Not just muscle between your ears, I see.",
    ],
    tags: ['intelligence', 'wit'],
  },
  {
    id: 'compliment_bravery_1',
    category: 'compliment',
    textTemplates: [
      "That took real courage. I respect that.",
      "Brave as they come. I'm impressed.",
      "Most would have run. You stood your ground.",
    ],
    tags: ['bravery', 'courage'],
  },
  {
    id: 'compliment_reputation_1',
    category: 'compliment',
    textTemplates: [
      "I've heard stories about you. They don't do you justice.",
      "Your reputation precedes you, and for good reason.",
      "Folks speak highly of you. Now I see why.",
    ],
    tags: ['reputation', 'fame'],
  },
  {
    id: 'compliment_merchant_1',
    category: 'compliment',
    textTemplates: [
      "You drive a hard bargain. I like that in a customer.",
      "You've got a nose for value. Impressive.",
      "A savvy buyer. My favorite kind.",
    ],
    validRoles: ['merchant', 'banker'],
    tags: ['commerce', 'business'],
  },
  {
    id: 'compliment_work_1',
    category: 'compliment',
    textTemplates: [
      "Quality work. You've got skilled hands.",
      "Job well done. Better than I expected.",
      "You know your craft. That's obvious.",
    ],
    tags: ['work', 'professional'],
  },
  {
    id: 'compliment_outlaw_1',
    category: 'compliment',
    textTemplates: [
      "You've got guts, I'll give you that.",
      "Most folks would be dead by now. You're still standing.",
      "You're either very brave or very stupid. Either way, I respect it.",
    ],
    validRoles: ['outlaw', 'gang_leader', 'bounty_hunter'],
    tags: ['grudging', 'respect'],
  },
  {
    id: 'compliment_loyalty_1',
    category: 'compliment',
    textTemplates: [
      "A loyal friend is worth their weight in gold.",
      "You stood by me when others wouldn't. I won't forget that.",
      "True loyalty is rare. You've got it.",
    ],
    tags: ['loyalty', 'friendship'],
  },
];

// ============================================================================
// INSULT SNIPPETS (15+)
// ============================================================================

const INSULT_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'insult_mild_1',
    category: 'insult',
    textTemplates: [
      "You ain't too bright, are you?",
      "Bless your heart...",
      "Did your mama drop you on your head?",
    ],
    tags: ['mild'],
  },
  {
    id: 'insult_harsh_1',
    category: 'insult',
    textTemplates: [
      "You're lower than a snake's belly.",
      "I've seen better faces on wanted posters.",
      "You ain't worth the lead it'd take to shoot you.",
    ],
    personalityMin: { aggression: 0.6 },
    tags: ['harsh'],
  },
  {
    id: 'insult_coward_1',
    category: 'insult',
    textTemplates: [
      "Yellow-bellied coward. Makes me sick just looking at you.",
      "I've seen braver tumbleweeds.",
      "You'd run from your own shadow.",
    ],
    personalityMin: { aggression: 0.4 },
    tags: ['cowardice'],
  },
  {
    id: 'insult_intelligence_1',
    category: 'insult',
    textTemplates: [
      "You're about as sharp as a sack of wet mice.",
      "If brains were dynamite, you couldn't blow your nose.",
      "Not the brightest star in the sky, are you?",
    ],
    tags: ['stupidity'],
  },
  {
    id: 'insult_appearance_1',
    category: 'insult',
    textTemplates: [
      "You look like something the buzzards wouldn't touch.",
      "Did you get dressed in a dust storm?",
      "I've seen prettier things crawl out of the desert.",
    ],
    tags: ['appearance'],
  },
  {
    id: 'insult_dishonesty_1',
    category: 'insult',
    textTemplates: [
      "Liar and a cheat, through and through.",
      "Your word ain't worth the breath it takes to speak it.",
      "Snake in the grass if I ever saw one.",
    ],
    personalityMin: { honesty: 0.5 },
    tags: ['dishonesty', 'liar'],
  },
  {
    id: 'insult_outlaw_1',
    category: 'insult',
    textTemplates: [
      "Nothing but a common criminal.",
      "Trash like you belongs in a cell.",
      "The law will catch up with you eventually, scum.",
    ],
    validRoles: ['sheriff', 'deputy'],
    personalityMin: { lawfulness: 0.6 },
    tags: ['criminal', 'authority'],
  },
  {
    id: 'insult_greenhorn_1',
    category: 'insult',
    textTemplates: [
      "Wet behind the ears greenhorn.",
      "Go back east where you belong, tenderfoot.",
      "The frontier will chew you up and spit you out.",
    ],
    validRoles: ['rancher', 'miner', 'farmer'],
    tags: ['inexperience'],
  },
  {
    id: 'insult_drunk_1',
    category: 'insult',
    textTemplates: [
      "Worthless drunk. Probably can't even see straight.",
      "Spend more time at the saloon than anywhere else, I reckon.",
      "Whiskey's rotted what little brains you had.",
    ],
    tags: ['alcoholism'],
  },
  {
    id: 'insult_general_1',
    category: 'insult',
    textTemplates: [
      "You make me sick.",
      "Get out of my sight.",
      "I've scraped better things off my boot.",
    ],
    personalityMin: { aggression: 0.5 },
    tags: ['general', 'hostile'],
  },
  {
    id: 'insult_weakness_1',
    category: 'insult',
    textTemplates: [
      "Couldn't fight your way out of a paper bag.",
      "My grandmother hits harder than you.",
      "All bark and no bite.",
    ],
    personalityMin: { aggression: 0.5 },
    tags: ['weakness', 'combat'],
  },
  {
    id: 'insult_honor_1',
    category: 'insult',
    textTemplates: [
      "No honor among your kind.",
      "You wouldn't know integrity if it shot you.",
      "A man's only as good as his word, and yours is worthless.",
    ],
    personalityMin: { honesty: 0.6 },
    tags: ['honor'],
  },
  {
    id: 'insult_traitor_1',
    category: 'insult',
    textTemplates: [
      "Backstabbing traitor. You'll get what's coming.",
      "Sold us out for a few pieces of silver.",
      "Judas would be proud of you.",
    ],
    tags: ['betrayal', 'traitor'],
  },
  {
    id: 'insult_greed_1',
    category: 'insult',
    textTemplates: [
      "Greedy vulture, picking at the bones of honest folk.",
      "You'd sell your own mother for a nickel.",
      "Nothing but a money-grubbing parasite.",
    ],
    personalityMin: { honesty: 0.5 },
    personalityMax: { greed: 0.5 },
    tags: ['greed'],
  },
  {
    id: 'insult_frontier_1',
    category: 'insult',
    textTemplates: [
      "You're not fit to water the horses.",
      "Couldn't rope a fence post.",
      "Call yourself a frontier man? That's a laugh.",
    ],
    validRoles: ['rancher', 'miner', 'farmer'],
    tags: ['frontier', 'skills'],
  },
];

// ============================================================================
// SMALL_TALK SNIPPETS (20+)
// ============================================================================

const SMALL_TALK_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'small_talk_weather_1',
    category: 'small_talk',
    textTemplates: [
      "Hot one today, ain't it?",
      "Think we might get rain soon. Ground's thirsty.",
      "Dust storm's comin'. Can smell it.",
    ],
    tags: ['weather'],
  },
  {
    id: 'small_talk_weather_2',
    category: 'small_talk',
    textTemplates: [
      "Hot enough to fry an egg on the rocks.",
      "Wind's been kicking up something fierce.",
      "Desert heat'll kill you quicker than a bullet.",
    ],
    tags: ['weather'],
  },
  {
    id: 'small_talk_business_1',
    category: 'small_talk',
    textTemplates: [
      "Business been slow lately. Too much trouble on the roads.",
      "Can't complain. Folks always need what I'm selling.",
      "Railroad's been good for business, I'll say that much.",
    ],
    validRoles: ['merchant', 'bartender', 'blacksmith'],
    tags: ['business'],
  },
  {
    id: 'small_talk_town_1',
    category: 'small_talk',
    textTemplates: [
      "{{location}}'s a good town. Mostly peaceful.",
      "Used to be quieter 'round here. Before the boom.",
      "This town's seen better days, I reckon.",
    ],
    tags: ['local'],
  },
  {
    id: 'small_talk_town_2',
    category: 'small_talk',
    textTemplates: [
      "Not much happens in these parts.",
      "Quiet town. That's how we like it.",
      "Folks here mind their own business. Mostly.",
    ],
    validRoles: ['townsfolk'],
    tags: ['town', 'local'],
  },
  {
    id: 'small_talk_work_1',
    category: 'small_talk',
    textTemplates: [
      "Another day, another dollar.",
      "Work never ends around here.",
      "My back's killing me from all this labor.",
    ],
    validRoles: ['miner', 'farmer', 'rancher', 'blacksmith'],
    tags: ['work', 'labor'],
  },
  {
    id: 'small_talk_animals_1',
    category: 'small_talk',
    textTemplates: [
      "Saw a rattlesnake near the well yesterday.",
      "The coyotes have been bold lately.",
      "Wild horses been spotted up in the hills.",
    ],
    tags: ['animals', 'wildlife'],
  },
  {
    id: 'small_talk_saloon_1',
    category: 'small_talk',
    textTemplates: [
      "Whiskey here's not half bad.",
      "Got a good card game going most nights.",
      "Place gets rowdy on paydays.",
    ],
    validRoles: ['bartender', 'gambler'],
    tags: ['saloon'],
  },
  {
    id: 'small_talk_railroad_1',
    category: 'small_talk',
    textTemplates: [
      "Train's running late again.",
      "The Railroad's changed everything around here.",
      "Remember when this was all just empty land?",
    ],
    tags: ['railroad', 'progress'],
  },
  {
    id: 'small_talk_mining_1',
    category: 'small_talk',
    textTemplates: [
      "Copper prices have been up lately.",
      "Another cave-in at the main shaft last week.",
      "Mining's dangerous work, but it pays.",
    ],
    validRoles: ['miner', 'prospector'],
    tags: ['mining'],
  },
  {
    id: 'small_talk_ranching_1',
    category: 'small_talk',
    textTemplates: [
      "Lost two head to rustlers last month.",
      "Cattle drive coming up. Going to be busy.",
      "Price of beef keeps going down.",
    ],
    validRoles: ['rancher', 'farmer'],
    tags: ['ranching'],
  },
  {
    id: 'small_talk_memories_1',
    category: 'small_talk',
    textTemplates: [
      "I remember when this was all wilderness.",
      "Been here longer than most folks remember.",
      "Times change. Not always for the better.",
    ],
    tags: ['nostalgia', 'memories'],
  },
  {
    id: 'small_talk_future_1',
    category: 'small_talk',
    textTemplates: [
      "Wonder what this place will look like in ten years.",
      "Progress marches on, like it or not.",
      "Big changes coming. Can feel it in my bones.",
    ],
    tags: ['future', 'progress'],
  },
  {
    id: 'small_talk_health_1',
    category: 'small_talk',
    textTemplates: [
      "My joints ache something terrible.",
      "Getting too old for this life.",
      "Can't complain. Still breathing, ain't I?",
    ],
    tags: ['health', 'age'],
  },
  {
    id: 'small_talk_food_1',
    category: 'small_talk',
    textTemplates: [
      "Supplies are getting low at the general store.",
      "Miss a good home-cooked meal sometimes.",
      "Bean stew again tonight, I reckon.",
    ],
    tags: ['food'],
  },
  {
    id: 'small_talk_stranger_1',
    category: 'small_talk',
    textTemplates: [
      "We don't get many strangers around here.",
      "New face in town always causes a stir.",
      "You planning on staying long?",
    ],
    tags: ['stranger', 'newcomer'],
  },
  {
    id: 'small_talk_lawless_1',
    category: 'small_talk',
    textTemplates: [
      "Law barely reaches out here.",
      "Every man for himself in these parts.",
      "The strong survive. That's the only law.",
    ],
    validRoles: ['outlaw', 'drifter'],
    personalityMax: { lawfulness: 0.4 },
    tags: ['lawless'],
  },
  {
    id: 'small_talk_church_1',
    category: 'small_talk',
    textTemplates: [
      "Sunday service was well attended.",
      "The congregation's been growing.",
      "Faith keeps us going in hard times.",
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'small_talk_night_1',
    category: 'small_talk',
    textTemplates: [
      "Stars are bright tonight.",
      "Quiet night, for once.",
      "Night brings out the worst in some folks.",
    ],
    validTimeOfDay: ['night'],
    tags: ['night', 'time_specific'],
  },
  {
    id: 'small_talk_philosophy_1',
    category: 'small_talk',
    textTemplates: [
      "Life out here makes you think about what matters.",
      "We're all just passing through, when you think about it.",
      "The desert has a way of putting things in perspective.",
    ],
    personalityMin: { curiosity: 0.5 },
    tags: ['philosophical'],
  },
];

// ============================================================================
// QUEST_OFFER SNIPPETS (15+)
// ============================================================================

const QUEST_OFFER_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'quest_offer_urgent_1',
    category: 'quest_offer',
    textTemplates: [
      "I need your help. It's urgent.",
      "Thank God you're here. I've got a problem only someone like you can solve.",
      "You look capable. I've got a job for you.",
    ],
    tags: ['urgent'],
  },
  {
    id: 'quest_offer_desperate_1',
    category: 'quest_offer',
    textTemplates: [
      "Please, you have to help me. You're my only hope.",
      "I'm desperate. Will you hear me out?",
      "I don't know who else to turn to. Can you help?",
    ],
    tags: ['desperate', 'emotional'],
  },
  {
    id: 'quest_offer_casual_1',
    category: 'quest_offer',
    textTemplates: [
      "Say, you looking for work? Got something might interest you.",
      "If you've got time, I could use a hand with something.",
      "Interested in making some money? I have a proposition.",
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['casual'],
  },
  {
    id: 'quest_offer_professional_1',
    category: 'quest_offer',
    textTemplates: [
      "I have a job that requires someone of your skills.",
      "There's work to be done, if you're interested.",
      "I could use someone reliable. You seem capable.",
    ],
    validRoles: ['sheriff', 'mayor', 'merchant'],
    tags: ['professional', 'business'],
  },
  {
    id: 'quest_offer_bounty_1',
    category: 'quest_offer',
    textTemplates: [
      "Got a wanted poster here. {{target}} is worth good money, dead or alive.",
      "There's an outlaw needs bringing in. Interested?",
      "Law's offering a bounty on {{target}}. You up for it?",
    ],
    validRoles: ['sheriff', 'deputy', 'bounty_hunter'],
    tags: ['bounty', 'official'],
  },
  {
    id: 'quest_offer_secretive_1',
    category: 'quest_offer',
    textTemplates: [
      "I have a... delicate matter that needs handling.",
      "This stays between us. Understood?",
      "What I'm about to ask requires discretion.",
    ],
    tags: ['secretive', 'covert'],
  },
  {
    id: 'quest_offer_reward_1',
    category: 'quest_offer',
    textTemplates: [
      "Do this for me and you'll be well compensated.",
      "There's good coin in it for you.",
      "Name your price. Within reason.",
    ],
    personalityMin: { greed: 0.4 },
    tags: ['reward', 'money'],
  },
  {
    id: 'quest_offer_authority_1',
    category: 'quest_offer',
    textTemplates: [
      "In the name of the law, I'm asking for your assistance.",
      "The town needs you. Will you answer the call?",
      "This is official business. I need your help.",
    ],
    validRoles: ['sheriff', 'deputy', 'mayor'],
    tags: ['official', 'authority'],
  },
  {
    id: 'quest_offer_adventure_1',
    category: 'quest_offer',
    textTemplates: [
      "Interested in a little adventure?",
      "I've got something that might interest someone like you.",
      "You look like someone who doesn't shy from excitement.",
    ],
    tags: ['adventure', 'exciting'],
  },
  {
    id: 'quest_offer_moral_1',
    category: 'quest_offer',
    textTemplates: [
      "Someone has to set things right. Will you be that person?",
      "An injustice has been done. I need your help to fix it.",
      "This is about doing what's right. Are you in?",
    ],
    personalityMin: { honesty: 0.5 },
    tags: ['moral', 'justice'],
  },
  {
    id: 'quest_offer_mystery_1',
    category: 'quest_offer',
    textTemplates: [
      "There's something strange going on. I need answers.",
      "Something doesn't add up. Will you help me investigate?",
      "A mystery needs solving. Interested?",
    ],
    personalityMin: { curiosity: 0.4 },
    tags: ['mystery', 'investigation'],
  },
  {
    id: 'quest_offer_revenge_1',
    category: 'quest_offer',
    textTemplates: [
      "They wronged me. I want them to pay.",
      "Help me get justice. Or revenge. Same thing.",
      "Someone needs to answer for what they did.",
    ],
    personalityMin: { aggression: 0.4 },
    tags: ['revenge'],
  },
  {
    id: 'quest_offer_rancher_1',
    category: 'quest_offer',
    textTemplates: [
      "My cattle are in trouble. I need help.",
      "Rustlers hit the ranch. Will you track them down?",
      "The herd needs protection. Interested in ranch work?",
    ],
    validRoles: ['rancher', 'farmer'],
    tags: ['ranching', 'rural'],
  },
  {
    id: 'quest_offer_criminal_1',
    category: 'quest_offer',
    textTemplates: [
      "I've got a job. Not exactly legal, but profitable.",
      "You look like someone who doesn't ask too many questions.",
      "Interested in some work? Keep your mouth shut and get paid.",
    ],
    validRoles: ['outlaw', 'gang_leader'],
    validFactions: ['copperhead'],
    tags: ['criminal', 'illegal'],
  },
  {
    id: 'quest_offer_simple_1',
    category: 'quest_offer',
    textTemplates: [
      "It's a simple job. Nothing fancy.",
      "Easy work, easy money. Interested?",
      "Won't take much of your time. What do you say?",
    ],
    tags: ['simple', 'easy'],
  },
];

// ============================================================================
// QUEST_UPDATE SNIPPETS (10+)
// ============================================================================

const QUEST_UPDATE_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'quest_update_progress_1',
    category: 'quest_update',
    textTemplates: [
      "How's that job coming along?",
      "Any progress on what we discussed?",
      "You got news for me?",
    ],
    tags: ['check_in'],
  },
  {
    id: 'quest_update_progress_2',
    category: 'quest_update',
    textTemplates: [
      "Good progress so far. Keep it up.",
      "I heard you've been making headway. Excellent.",
      "Things are moving along. Don't stop now.",
    ],
    tags: ['progress', 'positive'],
  },
  {
    id: 'quest_update_impatient_1',
    category: 'quest_update',
    textTemplates: [
      "What's taking so long? I thought you were capable.",
      "Time's running out. You gonna finish this or not?",
      "I'm starting to think I hired the wrong person.",
    ],
    personalityMin: { aggression: 0.4 },
    personalityMax: { friendliness: 0.5 },
    tags: ['impatient'],
  },
  {
    id: 'quest_update_worried_1',
    category: 'quest_update',
    textTemplates: [
      "Any news? I've been worried sick.",
      "Tell me you've found something. Please.",
      "I haven't slept since this started. What's happening?",
    ],
    tags: ['worried', 'anxious'],
  },
  {
    id: 'quest_update_new_info_1',
    category: 'quest_update',
    textTemplates: [
      "I've learned something new. Listen carefully.",
      "There's been a development. You should know.",
      "New information has come to light.",
    ],
    tags: ['information', 'update'],
  },
  {
    id: 'quest_update_complication_1',
    category: 'quest_update',
    textTemplates: [
      "There's a problem. Things have gotten complicated.",
      "Bad news. The situation has changed.",
      "We've hit a snag. Hear me out.",
    ],
    tags: ['complication', 'problem'],
  },
  {
    id: 'quest_update_encouragement_1',
    category: 'quest_update',
    textTemplates: [
      "You're doing great. Almost there.",
      "I knew I could count on you. Keep going.",
      "The end is in sight. Don't give up now.",
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['encouragement', 'positive'],
  },
  {
    id: 'quest_update_warning_1',
    category: 'quest_update',
    textTemplates: [
      "Be careful out there. It's getting dangerous.",
      "I've heard things. Watch your back.",
      "They know someone's investigating. Stay alert.",
    ],
    tags: ['warning', 'danger'],
  },
  {
    id: 'quest_update_hint_1',
    category: 'quest_update',
    textTemplates: [
      "Try checking near {{location}}. Might find something.",
      "Someone at {{location}} might know more.",
      "Have you talked to everyone at {{location}}?",
    ],
    tags: ['hint', 'guidance'],
  },
  {
    id: 'quest_update_deadline_1',
    category: 'quest_update',
    textTemplates: [
      "Time's running out. Hurry.",
      "We don't have much time left. Move faster.",
      "The deadline's approaching. No more delays.",
    ],
    tags: ['deadline', 'urgent'],
  },
];

// ============================================================================
// QUEST_COMPLETE SNIPPETS (10+)
// ============================================================================

const QUEST_COMPLETE_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'quest_complete_grateful_1',
    category: 'quest_complete',
    textTemplates: [
      "You did it! I knew I could count on you.",
      "Outstanding work. Here's what I owe you.",
      "The town owes you a debt of gratitude.",
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['grateful'],
  },
  {
    id: 'quest_complete_grateful_2',
    category: 'quest_complete',
    textTemplates: [
      "You did it! I can't thank you enough!",
      "I don't know how I can ever repay you.",
      "You're a hero. A genuine hero!",
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['grateful', 'enthusiastic'],
  },
  {
    id: 'quest_complete_matter_of_fact_1',
    category: 'quest_complete',
    textTemplates: [
      "Job's done then. Here's your pay.",
      "Alright. We're square.",
      "Payment as agreed. Pleasure doing business.",
    ],
    tags: ['business'],
  },
  {
    id: 'quest_complete_surprised_1',
    category: 'quest_complete',
    textTemplates: [
      "I... I didn't think you could actually do it.",
      "Well, I'll be damned. You actually pulled it off.",
      "Color me impressed. I had my doubts.",
    ],
    tags: ['surprised', 'impressed'],
  },
  {
    id: 'quest_complete_relieved_1',
    category: 'quest_complete',
    textTemplates: [
      "Finally, it's over. I can breathe again.",
      "Thank the Lord. It's done.",
      "Such relief. You've lifted a weight off my shoulders.",
    ],
    tags: ['relief'],
  },
  {
    id: 'quest_complete_sheriff_1',
    category: 'quest_complete',
    textTemplates: [
      "Justice has been served. The town thanks you.",
      "You've done the law a great service today.",
      "This makes my job easier. Well done.",
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority', 'justice'],
  },
  {
    id: 'quest_complete_merchant_1',
    category: 'quest_complete',
    textTemplates: [
      "Business is saved! You've earned a permanent discount.",
      "My livelihood, restored. Thank you!",
      "You're always welcome in my establishment.",
    ],
    validRoles: ['merchant', 'bartender', 'blacksmith'],
    tags: ['commerce'],
  },
  {
    id: 'quest_complete_grudging_1',
    category: 'quest_complete',
    textTemplates: [
      "Fine. You've earned your pay.",
      "I suppose you did alright.",
      "Hmph. Better than I expected.",
    ],
    personalityMax: { friendliness: 0.4 },
    tags: ['grudging', 'reluctant'],
  },
  {
    id: 'quest_complete_emotional_1',
    category: 'quest_complete',
    textTemplates: [
      "I'm... I'm sorry. I'm just so happy.",
      "You've restored my faith in people.",
      "Words can't express what this means to me.",
    ],
    tags: ['emotional', 'heartfelt'],
  },
  {
    id: 'quest_complete_friendship_1',
    category: 'quest_complete',
    textTemplates: [
      "You've made a friend for life today.",
      "Consider me in your debt. Anything you need.",
      "From now on, my door is always open to you.",
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['friendship', 'loyalty'],
  },
];

// ============================================================================
// SHOP_WELCOME SNIPPETS (10+)
// ============================================================================

const SHOP_WELCOME_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'shop_welcome_1',
    category: 'shop_welcome',
    textTemplates: [
      "Welcome! Take a look around.",
      "Got the finest goods in {{location}}. What do you need?",
      "Browser or buyer? Either way, come in.",
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['welcoming'],
  },
  {
    id: 'shop_welcome_enthusiastic_1',
    category: 'shop_welcome',
    textTemplates: [
      "Welcome, welcome! Come see what we've got!",
      "A customer! Step right up!",
      "Come in, come in! Best prices in town!",
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['enthusiastic', 'welcoming'],
  },
  {
    id: 'shop_welcome_professional_1',
    category: 'shop_welcome',
    textTemplates: [
      "Good day. How may I help you?",
      "Welcome to my establishment. Browse at your leisure.",
      "At your service. What are you looking for?",
    ],
    tags: ['professional'],
  },
  {
    id: 'shop_welcome_gruff_1',
    category: 'shop_welcome',
    textTemplates: [
      "Yeah? You buying or just looking?",
      "Store's open. Don't touch what you can't afford.",
      "State your business.",
    ],
    personalityMax: { friendliness: 0.4 },
    tags: ['gruff'],
  },
  {
    id: 'shop_welcome_saloon_1',
    category: 'shop_welcome',
    textTemplates: [
      "Step up to the bar. What's your pleasure?",
      "Whiskey, beer, or something stronger?",
      "New face at the bar. Welcome.",
    ],
    validRoles: ['bartender'],
    tags: ['saloon', 'drinks'],
  },
  {
    id: 'shop_welcome_gunsmith_1',
    category: 'shop_welcome',
    textTemplates: [
      "Looking for firepower? You've come to the right place.",
      "Guns and ammo. Best in the territory.",
      "Something for defense? I've got you covered.",
    ],
    tags: ['guns', 'weapons'],
  },
  {
    id: 'shop_welcome_general_1',
    category: 'shop_welcome',
    textTemplates: [
      "General store. We've got a bit of everything.",
      "Supplies, tools, provisions. What do you need?",
      "Stock up before heading out. Smart move.",
    ],
    validRoles: ['merchant'],
    tags: ['general_store'],
  },
  {
    id: 'shop_welcome_blacksmith_1',
    category: 'shop_welcome',
    textTemplates: [
      "Need something forged? I'm your man.",
      "Horseshoes, tools, or repairs. What'll it be?",
      "Step into the forge. What can I make for you?",
    ],
    validRoles: ['blacksmith'],
    tags: ['blacksmith'],
  },
  {
    id: 'shop_welcome_doctor_1',
    category: 'shop_welcome',
    textTemplates: [
      "Doc's office. You hurt or just buying medicine?",
      "Tonics, bandages, or medical attention?",
      "Health comes first. What do you need?",
    ],
    validRoles: ['doctor'],
    tags: ['medical'],
  },
  {
    id: 'shop_welcome_repeat_1',
    category: 'shop_welcome',
    textTemplates: [
      "Back again! Good to see a regular.",
      "Welcome back. Know what you're looking for?",
      "Ah, a familiar face. What can I get you today?",
    ],
    tags: ['repeat_customer'],
  },
];

// ============================================================================
// SHOP_BROWSE SNIPPETS (8+)
// ============================================================================

const SHOP_BROWSE_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'shop_browse_1',
    category: 'shop_browse',
    textTemplates: [
      "See anything you like?",
      "Quality merchandise. Fair prices.",
      "Let me know if you need help finding something.",
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['helpful'],
  },
  {
    id: 'shop_browse_encourage_1',
    category: 'shop_browse',
    textTemplates: [
      "Take your time. Look around.",
      "Don't be shy. Ask if you have questions.",
      "Everything's got a price tag. Browse freely.",
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['encouraging'],
  },
  {
    id: 'shop_browse_suggest_1',
    category: 'shop_browse',
    textTemplates: [
      "Those are popular items there.",
      "Might I suggest our newest stock?",
      "That's quality merchandise you're looking at.",
    ],
    tags: ['suggestion'],
  },
  {
    id: 'shop_browse_impatient_1',
    category: 'shop_browse',
    textTemplates: [
      "You gonna buy something or just window shop?",
      "Make up your mind. I haven't got all day.",
      "Looking's free, but my patience isn't.",
    ],
    personalityMax: { friendliness: 0.4 },
    tags: ['impatient'],
  },
  {
    id: 'shop_browse_proud_1',
    category: 'shop_browse',
    textTemplates: [
      "Only the finest goods in my shop.",
      "Everything here is quality. No junk.",
      "I stand behind every item I sell.",
    ],
    personalityMin: { honesty: 0.5 },
    tags: ['proud', 'quality'],
  },
  {
    id: 'shop_browse_deal_1',
    category: 'shop_browse',
    textTemplates: [
      "Got some items on sale today.",
      "Looking for a bargain? I might have something.",
      "Buy more, save more. That's my motto.",
    ],
    personalityMin: { greed: 0.4 },
    tags: ['deal', 'bargain'],
  },
  {
    id: 'shop_browse_limited_1',
    category: 'shop_browse',
    textTemplates: [
      "Stock's running low on some things.",
      "Better buy now. Might not be here tomorrow.",
      "Supplies are limited. Choose wisely.",
    ],
    tags: ['scarcity', 'urgency'],
  },
  {
    id: 'shop_browse_new_1',
    category: 'shop_browse',
    textTemplates: [
      "Just got a fresh shipment. Take a look.",
      "New items just came in on the train.",
      "Check out the new arrivals.",
    ],
    tags: ['new_stock'],
  },
];

// ============================================================================
// SHOP_BUY SNIPPETS (8+)
// ============================================================================

const SHOP_BUY_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'shop_buy_1',
    category: 'shop_buy',
    textTemplates: [
      "Good choice. That'll be {{price}} gold.",
      "Fine selection. Anything else?",
      "Pleasure doing business with you.",
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['transaction'],
  },
  {
    id: 'shop_buy_confirm_1',
    category: 'shop_buy',
    textTemplates: [
      "That'll be {{price}} gold. Deal?",
      "{{price}} gold for the lot. You want it?",
      "{{price}} gold, and it's yours.",
    ],
    tags: ['confirm', 'price'],
  },
  {
    id: 'shop_buy_complete_1',
    category: 'shop_buy',
    textTemplates: [
      "Pleasure doing business with you.",
      "Thank you kindly. Come back soon.",
      "Sold! Good choice.",
    ],
    tags: ['complete', 'thanks'],
  },
  {
    id: 'shop_buy_haggle_refuse_1',
    category: 'shop_buy',
    textTemplates: [
      "Price is firm. Take it or leave it.",
      "I don't haggle. Pay or walk.",
      "That's the price. No negotiation.",
    ],
    personalityMax: { friendliness: 0.4 },
    tags: ['no_haggle', 'firm'],
  },
  {
    id: 'shop_buy_haggle_accept_1',
    category: 'shop_buy',
    textTemplates: [
      "Alright, you drive a hard bargain. Deal.",
      "Fine, fine. You win this round.",
      "For you? I'll make an exception.",
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['haggle', 'discount'],
  },
  {
    id: 'shop_buy_expensive_1',
    category: 'shop_buy',
    textTemplates: [
      "That's quality merchandise. Worth every penny.",
      "You get what you pay for.",
      "It's an investment. Trust me.",
    ],
    tags: ['expensive', 'justify'],
  },
  {
    id: 'shop_buy_insufficient_1',
    category: 'shop_buy',
    textTemplates: [
      "You don't have enough gold for that.",
      "Come back when your pockets are fuller.",
      "Nice try. You're short on coin.",
    ],
    tags: ['insufficient_funds'],
  },
  {
    id: 'shop_buy_recommend_1',
    category: 'shop_buy',
    textTemplates: [
      "Excellent choice. You won't regret it.",
      "Smart purchase. That's a good one.",
      "You've got an eye for quality.",
    ],
    tags: ['compliment', 'recommend'],
  },
];

// ============================================================================
// SHOP_SELL SNIPPETS (8+)
// ============================================================================

const SHOP_SELL_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'shop_sell_1',
    category: 'shop_sell',
    textTemplates: [
      "Let me see what you got there...",
      "Hmm, I can give you {{price}} for that.",
      "Fair price for fair goods.",
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['transaction'],
  },
  {
    id: 'shop_sell_interested_1',
    category: 'shop_sell',
    textTemplates: [
      "What have you got to sell?",
      "Let me see what you're offering.",
      "Buying and selling. Show me your goods.",
    ],
    tags: ['interested'],
  },
  {
    id: 'shop_sell_offer_1',
    category: 'shop_sell',
    textTemplates: [
      "I can give you {{price}} gold for that.",
      "Best I can do is {{price}} gold.",
      "{{price}} gold. Fair offer.",
    ],
    tags: ['offer', 'price'],
  },
  {
    id: 'shop_sell_accept_1',
    category: 'shop_sell',
    textTemplates: [
      "Deal. Hand it over.",
      "Sold. Here's your gold.",
      "Done. Always happy to buy quality goods.",
    ],
    tags: ['accept', 'complete'],
  },
  {
    id: 'shop_sell_refuse_1',
    category: 'shop_sell',
    textTemplates: [
      "I'm not interested in that. Try elsewhere.",
      "Can't use that. No deal.",
      "That's got no value to me. Sorry.",
    ],
    tags: ['refuse', 'no_interest'],
  },
  {
    id: 'shop_sell_lowball_1',
    category: 'shop_sell',
    textTemplates: [
      "That's all it's worth, friend.",
      "You won't get better elsewhere.",
      "I've got to make a profit somehow.",
    ],
    personalityMin: { greed: 0.5 },
    tags: ['lowball', 'cheap'],
  },
  {
    id: 'shop_sell_fair_1',
    category: 'shop_sell',
    textTemplates: [
      "Fair price for fair goods.",
      "I try to be honest in my dealings.",
      "That's what it's worth, plain and simple.",
    ],
    personalityMin: { honesty: 0.6 },
    tags: ['fair', 'honest'],
  },
  {
    id: 'shop_sell_impressed_1',
    category: 'shop_sell',
    textTemplates: [
      "Well now, that's quite something. Let me make you an offer.",
      "Impressive goods. I'll pay well for these.",
      "Now that's what I like to see. Quality merchandise.",
    ],
    tags: ['impressed', 'quality'],
  },
];

// ============================================================================
// SHOP_FAREWELL SNIPPETS (8+)
// ============================================================================

const SHOP_FAREWELL_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'shop_farewell_1',
    category: 'shop_farewell',
    textTemplates: [
      "Come back anytime!",
      "Safe travels. Come again.",
      "You know where to find me.",
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['farewell'],
  },
  {
    id: 'shop_farewell_friendly_1',
    category: 'shop_farewell',
    textTemplates: [
      "Come back anytime! Door's always open.",
      "Take care out there. See you next time!",
      "Pleasure serving you. Safe travels!",
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['friendly', 'welcoming'],
  },
  {
    id: 'shop_farewell_professional_1',
    category: 'shop_farewell',
    textTemplates: [
      "Thank you for your business.",
      "Until next time.",
      "Good day to you.",
    ],
    tags: ['professional'],
  },
  {
    id: 'shop_farewell_gruff_1',
    category: 'shop_farewell',
    textTemplates: [
      "Yeah. Bye.",
      "Door's that way.",
      "We're done here.",
    ],
    personalityMax: { friendliness: 0.4 },
    tags: ['gruff', 'dismissive'],
  },
  {
    id: 'shop_farewell_salesman_1',
    category: 'shop_farewell',
    textTemplates: [
      "Remember: we've got new stock every week!",
      "Tell your friends about us!",
      "Come back when you need more supplies!",
    ],
    personalityMin: { greed: 0.4 },
    tags: ['salesman', 'promotional'],
  },
  {
    id: 'shop_farewell_saloon_1',
    category: 'shop_farewell',
    textTemplates: [
      "Don't be a stranger. Drinks are always cold.",
      "Watch yourself out there. Come back for more.",
      "Safe travels. See you at the bar.",
    ],
    validRoles: ['bartender'],
    tags: ['saloon'],
  },
  {
    id: 'shop_farewell_no_sale_1',
    category: 'shop_farewell',
    textTemplates: [
      "Come back when you've got coin to spend.",
      "Maybe next time you'll find something.",
      "Just browsing? Alright then.",
    ],
    tags: ['no_sale', 'disappointed'],
  },
  {
    id: 'shop_farewell_good_sale_1',
    category: 'shop_farewell',
    textTemplates: [
      "A pleasure! You're my favorite kind of customer.",
      "Now that's what I call a good sale. Thank you!",
      "Wonderful doing business! Come back soon!",
    ],
    personalityMin: { friendliness: 0.5, greed: 0.4 },
    tags: ['good_sale', 'happy'],
  },
];

// ============================================================================
// COMBINED EXPORTS
// ============================================================================

// Combine all raw snippets
const RAW_SNIPPETS: DialogueSnippet[] = [
  ...GREETING_SNIPPETS,
  ...FAREWELL_SNIPPETS,
  ...THANKS_SNIPPETS,
  ...REFUSAL_SNIPPETS,
  ...AGREEMENT_SNIPPETS,
  ...QUESTION_SNIPPETS,
  ...RUMOR_SNIPPETS,
  ...THREAT_SNIPPETS,
  ...BRIBE_SNIPPETS,
  ...COMPLIMENT_SNIPPETS,
  ...INSULT_SNIPPETS,
  ...SMALL_TALK_SNIPPETS,
  ...QUEST_OFFER_SNIPPETS,
  ...QUEST_UPDATE_SNIPPETS,
  ...QUEST_COMPLETE_SNIPPETS,
  ...SHOP_WELCOME_SNIPPETS,
  ...SHOP_BROWSE_SNIPPETS,
  ...SHOP_BUY_SNIPPETS,
  ...SHOP_SELL_SNIPPETS,
  ...SHOP_FAREWELL_SNIPPETS,
];

// Parse all snippets through Zod to apply defaults
export const DIALOGUE_SNIPPETS: DialogueSnippet[] = RAW_SNIPPETS.map((snippet, index) => {
  try {
    return DialogueSnippetSchema.parse(snippet);
  } catch (error) {
    console.error(`Invalid dialogue snippet at index ${index}:`, snippet.id, error);
    // Return the original snippet if parsing fails (shouldn't happen with valid data)
    return snippet as DialogueSnippet;
  }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get snippets by category
 */
export function getSnippetsByCategory(
  category: DialogueSnippet['category']
): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((s) => s.category === category);
}

/**
 * Get snippets valid for an NPC based on role, faction, and personality
 */
export function getSnippetsForNPC(
  role: string,
  faction: string,
  personality: Record<string, number>,
  category?: DialogueSnippet['category']
): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((snippet) => {
    // Filter by category if specified
    if (category && snippet.category !== category) {
      return false;
    }

    // Check role restrictions
    if (
      snippet.validRoles &&
      snippet.validRoles.length > 0 &&
      !snippet.validRoles.includes(role)
    ) {
      return false;
    }

    // Check faction restrictions
    if (
      snippet.validFactions &&
      snippet.validFactions.length > 0 &&
      !snippet.validFactions.includes(faction)
    ) {
      return false;
    }

    // Check personality minimums
    if (snippet.personalityMin) {
      for (const [trait, minValue] of Object.entries(snippet.personalityMin)) {
        if ((personality[trait] ?? 0.5) < minValue) {
          return false;
        }
      }
    }

    // Check personality maximums
    if (snippet.personalityMax) {
      for (const [trait, maxValue] of Object.entries(snippet.personalityMax)) {
        if ((personality[trait] ?? 0.5) > maxValue) {
          return false;
        }
      }
    }

    return true;
  });
}

/**
 * Get snippets by tag
 */
export function getSnippetsByTag(tag: string): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((s) => s.tags.includes(tag));
}

/**
 * Get snippets filtered by multiple tags
 */
export function getSnippetsByTags(
  tags: string[],
  matchAll = false
): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((snippet) => {
    if (!snippet.tags || snippet.tags.length === 0) {
      return false;
    }
    if (matchAll) {
      return tags.every((tag) => snippet.tags.includes(tag));
    }
    return tags.some((tag) => snippet.tags.includes(tag));
  });
}

/**
 * Get snippets valid for a specific time of day
 */
export function getSnippetsByTimeOfDay(
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',
  category?: DialogueSnippet['category']
): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((snippet) => {
    if (category && snippet.category !== category) {
      return false;
    }
    // If no time restriction, it's valid for all times
    if (!snippet.validTimeOfDay || snippet.validTimeOfDay.length === 0) {
      return true;
    }
    return snippet.validTimeOfDay.includes(timeOfDay);
  });
}

/**
 * Get a random snippet from a category
 */
export function getRandomSnippet(
  category: DialogueSnippet['category'],
  rng: { pick: <T>(arr: T[]) => T }
): DialogueSnippet | null {
  const snippets = getSnippetsByCategory(category);
  if (snippets.length === 0) return null;
  return rng.pick(snippets);
}

/**
 * Get a random text template from a snippet
 */
export function getRandomText(
  snippet: DialogueSnippet,
  rng: { pick: <T>(arr: T[]) => T }
): string {
  return rng.pick(snippet.textTemplates);
}
