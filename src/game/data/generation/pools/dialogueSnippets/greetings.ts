/**
 * Greetings Dialogue Snippets
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const GREETING_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'greeting_friendly_1',
    category: 'greeting',
    textTemplates: [
      'Howdy, stranger! Welcome to {{location}}.',
      'Well, look who wandered in! What can I do for ya?',
      'Afternoon, friend. New in town?',
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['friendly', 'welcoming'],
  },
  {
    id: 'greeting_friendly_2',
    category: 'greeting',
    textTemplates: [
      'Well howdy there! Always nice to see a new face.',
      'Come on in, friend! What brings you to these parts?',
      'Welcome, welcome! Make yourself at home.',
    ],
    personalityMin: { friendliness: 0.7 },
    tags: ['friendly', 'warm'],
  },
  {
    id: 'greeting_neutral_1',
    category: 'greeting',
    textTemplates: ['Howdy.', 'What do you want?', "Somethin' I can help you with?"],
    personalityMax: { friendliness: 0.6 },
    tags: ['neutral'],
  },
  {
    id: 'greeting_neutral_2',
    category: 'greeting',
    textTemplates: ['Afternoon.', 'Yeah?', 'State your business.'],
    tags: ['neutral', 'curt'],
  },
  {
    id: 'greeting_hostile_1',
    category: 'greeting',
    textTemplates: [
      "You got a lot of nerve showin' your face around here.",
      "Best move along, stranger. Ain't nothin' for you here.",
      'What do YOU want?',
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
      'Keep your nose clean in my town, stranger.',
      "I'm the law in these parts. Something I should know about?",
      'New face in town. You got business here?',
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
      'Whiskey? Beer? Or just information?',
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
      'Welcome to my humble establishment!',
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['commerce', 'welcoming'],
  },
  {
    id: 'greeting_preacher_1',
    category: 'greeting',
    textTemplates: [
      "Bless you, child. The Lord's house welcomes all.",
      'Peace be with you, traveler.',
      'Welcome, friend. Are you seeking guidance?',
    ],
    validRoles: ['preacher'],
    tags: ['religious', 'peaceful'],
  },
  {
    id: 'greeting_doctor_1',
    category: 'greeting',
    textTemplates: [
      'You injured? Sick? Or just here for a social call?',
      'Let me take a look at you... you seem mostly intact.',
      "Doc's office. What ails you?",
    ],
    validRoles: ['doctor'],
    tags: ['medical', 'professional'],
  },
  {
    id: 'greeting_outlaw_1',
    category: 'greeting',
    textTemplates: [
      'You got a lot of nerve showing your face here.',
      'Well, well... what do we have here?',
      'You lost, friend? Or just stupid?',
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
      'Just came up from the shaft. What do you need?',
      "Ain't got much time for chatting. The copper won't mine itself.",
      'You here about the mine?',
    ],
    validRoles: ['miner', 'prospector'],
    tags: ['working_class', 'tired'],
  },
  {
    id: 'greeting_rancher_1',
    category: 'greeting',
    textTemplates: [
      'Howdy, partner. You know your way around cattle?',
      'Just finished branding. What brings you out this way?',
      "City folk don't usually come out to the ranch.",
    ],
    validRoles: ['rancher', 'farmer'],
    tags: ['rural', 'practical'],
  },
  {
    id: 'greeting_banker_1',
    category: 'greeting',
    textTemplates: [
      'Good day. Here to make a deposit, I trust?',
      'The Iron Valley Bank is at your service.',
      'Ah, a potential investor. Please, have a seat.',
    ],
    validRoles: ['banker'],
    tags: ['formal', 'money'],
  },
  {
    id: 'greeting_gambler_1',
    category: 'greeting',
    textTemplates: [
      'Care to try your luck? Cards are hot tonight.',
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
      'I hunt men for money. You got business or you just staring?',
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
      'Ah, a visitor! Welcome to our fine town.',
      "I'm the mayor here. Anything you need, my door is open.",
      'Always pleased to meet newcomers. How can the town help you?',
    ],
    validRoles: ['mayor'],
    tags: ['political', 'welcoming'],
  },
  {
    id: 'greeting_ivrc_1',
    category: 'greeting',
    textTemplates: [
      "Iron Valley Railroad. We're building the future.",
      'You interested in progress? The railroad is hiring.',
      'The Company welcomes all who share our vision.',
    ],
    validFactions: ['ivrc'],
    tags: ['corporate', 'recruiting'],
  },
];

export const FAREWELL_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'farewell_friendly_1',
    category: 'farewell',
    textTemplates: [
      'Safe travels, friend.',
      'Come back anytime!',
      'Take care of yourself out there.',
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['friendly'],
  },
  {
    id: 'farewell_friendly_2',
    category: 'farewell',
    textTemplates: [
      'Watch yourself on those roads, you hear?',
      "Don't be a stranger now!",
      'May fortune smile on your journey.',
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['friendly', 'warm'],
  },
  {
    id: 'farewell_neutral_1',
    category: 'farewell',
    textTemplates: ['Yeah, see ya.', 'Bye.', 'Watch yourself.'],
    tags: ['neutral'],
  },
  {
    id: 'farewell_hostile_1',
    category: 'farewell',
    textTemplates: ["Don't let the door hit ya.", 'Good riddance.', "Don't come back."],
    personalityMin: { aggression: 0.5 },
    personalityMax: { friendliness: 0.4 },
    tags: ['hostile'],
  },
  {
    id: 'farewell_merchant_1',
    category: 'farewell',
    textTemplates: [
      'Thank you for your business!',
      'Come back when your pockets are full again!',
      'Pleasure doing business with you!',
    ],
    validRoles: ['merchant', 'bartender', 'blacksmith'],
    tags: ['commerce'],
  },
  {
    id: 'farewell_preacher_1',
    category: 'farewell',
    textTemplates: [
      'Go with God, my child.',
      'May the Lord watch over you.',
      'Blessings upon your journey.',
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'farewell_sheriff_1',
    category: 'farewell',
    textTemplates: [
      'Stay out of trouble.',
      "Remember: I'm watching.",
      'Keep your gun holstered in my town.',
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority', 'warning'],
  },
  {
    id: 'farewell_threatening_1',
    category: 'farewell',
    textTemplates: [
      'Watch your back out there.',
      'Next time we meet might not be so friendly.',
      "Don't let me catch you around here again.",
    ],
    personalityMin: { aggression: 0.6 },
    tags: ['threatening'],
  },
  {
    id: 'farewell_doctor_1',
    category: 'farewell',
    textTemplates: [
      'Try not to get shot before your next visit.',
      "Stay healthy. I've got enough patients.",
      'Come back if anything starts hurting.',
    ],
    validRoles: ['doctor'],
    tags: ['medical', 'dark_humor'],
  },
  {
    id: 'farewell_mysterious_1',
    category: 'farewell',
    textTemplates: [
      'Our paths may cross again.',
      'The desert has a way of bringing folks together.',
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
      'Got work to do. You take care.',
      "Sun's wasting. Best get moving.",
    ],
    validRoles: ['rancher', 'farmer', 'miner'],
    tags: ['working_class'],
  },
  {
    id: 'farewell_outlaw_1',
    category: 'farewell',
    textTemplates: [
      'Get out of here before I change my mind.',
      "You're lucky I'm feeling generous today.",
      'Run along now, before things get ugly.',
    ],
    validRoles: ['outlaw', 'gang_leader'],
    tags: ['hostile'],
  },
  {
    id: 'farewell_night_1',
    category: 'farewell',
    textTemplates: [
      "Don't let the coyotes get you.",
      'Watch out for what lurks in the dark.',
      'Sleep with one eye open out there.',
    ],
    validTimeOfDay: ['night'],
    tags: ['ominous', 'time_specific'],
  },
  {
    id: 'farewell_hopeful_1',
    category: 'farewell',
    textTemplates: [
      "Here's hoping tomorrow's better than today.",
      'Keep the faith, stranger.',
      'Good luck out there. Lord knows we all need it.',
    ],
    tags: ['hopeful'],
  },
  {
    id: 'farewell_banker_1',
    category: 'farewell',
    textTemplates: [
      'Your assets are safe with us.',
      'Remember: compound interest is your friend.',
      'May your investments prosper.',
    ],
    validRoles: ['banker'],
    tags: ['formal', 'money'],
  },
];
