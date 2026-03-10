/**
 * Quest Dialogue Snippets
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const QUEST_OFFER_SNIPPETS: DialogueSnippet[] = [
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
      'Say, you looking for work? Got something might interest you.',
      "If you've got time, I could use a hand with something.",
      'Interested in making some money? I have a proposition.',
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['casual'],
  },
  {
    id: 'quest_offer_professional_1',
    category: 'quest_offer',
    textTemplates: [
      'I have a job that requires someone of your skills.',
      "There's work to be done, if you're interested.",
      'I could use someone reliable. You seem capable.',
    ],
    validRoles: ['sheriff', 'mayor', 'merchant'],
    tags: ['professional', 'business'],
  },
  {
    id: 'quest_offer_bounty_1',
    category: 'quest_offer',
    textTemplates: [
      'Got a wanted poster here. {{target}} is worth good money, dead or alive.',
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
      'I have a... delicate matter that needs handling.',
      'This stays between us. Understood?',
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
      'Name your price. Within reason.',
    ],
    personalityMin: { greed: 0.4 },
    tags: ['reward', 'money'],
  },
  {
    id: 'quest_offer_authority_1',
    category: 'quest_offer',
    textTemplates: [
      "In the name of the law, I'm asking for your assistance.",
      'The town needs you. Will you answer the call?',
      'This is official business. I need your help.',
    ],
    validRoles: ['sheriff', 'deputy', 'mayor'],
    tags: ['official', 'authority'],
  },
  {
    id: 'quest_offer_adventure_1',
    category: 'quest_offer',
    textTemplates: [
      'Interested in a little adventure?',
      "I've got something that might interest someone like you.",
      "You look like someone who doesn't shy from excitement.",
    ],
    tags: ['adventure', 'exciting'],
  },
  {
    id: 'quest_offer_moral_1',
    category: 'quest_offer',
    textTemplates: [
      'Someone has to set things right. Will you be that person?',
      'An injustice has been done. I need your help to fix it.',
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
      'A mystery needs solving. Interested?',
    ],
    personalityMin: { curiosity: 0.4 },
    tags: ['mystery', 'investigation'],
  },
  {
    id: 'quest_offer_revenge_1',
    category: 'quest_offer',
    textTemplates: [
      'They wronged me. I want them to pay.',
      'Help me get justice. Or revenge. Same thing.',
      'Someone needs to answer for what they did.',
    ],
    personalityMin: { aggression: 0.4 },
    tags: ['revenge'],
  },
  {
    id: 'quest_offer_rancher_1',
    category: 'quest_offer',
    textTemplates: [
      'My cattle are in trouble. I need help.',
      'Rustlers hit the ranch. Will you track them down?',
      'The herd needs protection. Interested in ranch work?',
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
      'Interested in some work? Keep your mouth shut and get paid.',
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
      'Easy work, easy money. Interested?',
      "Won't take much of your time. What do you say?",
    ],
    tags: ['simple', 'easy'],
  },
];

export const QUEST_UPDATE_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'quest_update_progress_1',
    category: 'quest_update',
    textTemplates: [
      "How's that job coming along?",
      'Any progress on what we discussed?',
      'You got news for me?',
    ],
    tags: ['check_in'],
  },
  {
    id: 'quest_update_progress_2',
    category: 'quest_update',
    textTemplates: [
      'Good progress so far. Keep it up.',
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
      'New information has come to light.',
    ],
    tags: ['information', 'update'],
  },
  {
    id: 'quest_update_complication_1',
    category: 'quest_update',
    textTemplates: [
      "There's a problem. Things have gotten complicated.",
      'Bad news. The situation has changed.',
      "We've hit a snag. Hear me out.",
    ],
    tags: ['complication', 'problem'],
  },
  {
    id: 'quest_update_encouragement_1',
    category: 'quest_update',
    textTemplates: [
      "You're doing great. Almost there.",
      'I knew I could count on you. Keep going.',
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
      'Try checking near {{location}}. Might find something.',
      'Someone at {{location}} might know more.',
      'Have you talked to everyone at {{location}}?',
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

export const QUEST_COMPLETE_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'quest_complete_grateful_1',
    category: 'quest_complete',
    textTemplates: [
      'You did it! I knew I could count on you.',
      "Outstanding work. Here's what I owe you.",
      'The town owes you a debt of gratitude.',
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
      'Payment as agreed. Pleasure doing business.',
    ],
    tags: ['business'],
  },
  {
    id: 'quest_complete_surprised_1',
    category: 'quest_complete',
    textTemplates: [
      "I... I didn't think you could actually do it.",
      "Well, I'll be damned. You actually pulled it off.",
      'Color me impressed. I had my doubts.',
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
      'Justice has been served. The town thanks you.',
      "You've done the law a great service today.",
      'This makes my job easier. Well done.',
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority', 'justice'],
  },
  {
    id: 'quest_complete_merchant_1',
    category: 'quest_complete',
    textTemplates: [
      "Business is saved! You've earned a permanent discount.",
      'My livelihood, restored. Thank you!',
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
      'I suppose you did alright.',
      'Hmph. Better than I expected.',
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
      'Consider me in your debt. Anything you need.',
      'From now on, my door is always open to you.',
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['friendship', 'loyalty'],
  },
];
