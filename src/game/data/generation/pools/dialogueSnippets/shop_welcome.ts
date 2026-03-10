/**
 * Shop Welcome and Browse Snippets
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const SHOP_WELCOME_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'shop_welcome_1',
    category: 'shop_welcome',
    textTemplates: [
      'Welcome! Take a look around.',
      'Got the finest goods in {{location}}. What do you need?',
      'Browser or buyer? Either way, come in.',
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['welcoming'],
  },
  {
    id: 'shop_welcome_enthusiastic_1',
    category: 'shop_welcome',
    textTemplates: [
      "Welcome, welcome! Come see what we've got!",
      'A customer! Step right up!',
      'Come in, come in! Best prices in town!',
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['enthusiastic', 'welcoming'],
  },
  {
    id: 'shop_welcome_professional_1',
    category: 'shop_welcome',
    textTemplates: [
      'Good day. How may I help you?',
      'Welcome to my establishment. Browse at your leisure.',
      'At your service. What are you looking for?',
    ],
    tags: ['professional'],
  },
  {
    id: 'shop_welcome_gruff_1',
    category: 'shop_welcome',
    textTemplates: [
      'Yeah? You buying or just looking?',
      "Store's open. Don't touch what you can't afford.",
      'State your business.',
    ],
    personalityMax: { friendliness: 0.4 },
    tags: ['gruff'],
  },
  {
    id: 'shop_welcome_saloon_1',
    category: 'shop_welcome',
    textTemplates: [
      "Step up to the bar. What's your pleasure?",
      'Whiskey, beer, or something stronger?',
      'New face at the bar. Welcome.',
    ],
    validRoles: ['bartender'],
    tags: ['saloon', 'drinks'],
  },
  {
    id: 'shop_welcome_gunsmith_1',
    category: 'shop_welcome',
    textTemplates: [
      "Looking for firepower? You've come to the right place.",
      'Guns and ammo. Best in the territory.',
      "Something for defense? I've got you covered.",
    ],
    tags: ['guns', 'weapons'],
  },
  {
    id: 'shop_welcome_general_1',
    category: 'shop_welcome',
    textTemplates: [
      "General store. We've got a bit of everything.",
      'Supplies, tools, provisions. What do you need?',
      'Stock up before heading out. Smart move.',
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
      'Step into the forge. What can I make for you?',
    ],
    validRoles: ['blacksmith'],
    tags: ['blacksmith'],
  },
  {
    id: 'shop_welcome_doctor_1',
    category: 'shop_welcome',
    textTemplates: [
      "Doc's office. You hurt or just buying medicine?",
      'Tonics, bandages, or medical attention?',
      'Health comes first. What do you need?',
    ],
    validRoles: ['doctor'],
    tags: ['medical'],
  },
  {
    id: 'shop_welcome_repeat_1',
    category: 'shop_welcome',
    textTemplates: [
      'Back again! Good to see a regular.',
      "Welcome back. Know what you're looking for?",
      'Ah, a familiar face. What can I get you today?',
    ],
    tags: ['repeat_customer'],
  },
];

export const SHOP_BROWSE_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'shop_browse_1',
    category: 'shop_browse',
    textTemplates: [
      'See anything you like?',
      'Quality merchandise. Fair prices.',
      'Let me know if you need help finding something.',
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['helpful'],
  },
  {
    id: 'shop_browse_encourage_1',
    category: 'shop_browse',
    textTemplates: [
      'Take your time. Look around.',
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
      'Those are popular items there.',
      'Might I suggest our newest stock?',
      "That's quality merchandise you're looking at.",
    ],
    tags: ['suggestion'],
  },
  {
    id: 'shop_browse_impatient_1',
    category: 'shop_browse',
    textTemplates: [
      'You gonna buy something or just window shop?',
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
      'Only the finest goods in my shop.',
      'Everything here is quality. No junk.',
      'I stand behind every item I sell.',
    ],
    personalityMin: { honesty: 0.5 },
    tags: ['proud', 'quality'],
  },
  {
    id: 'shop_browse_deal_1',
    category: 'shop_browse',
    textTemplates: [
      'Got some items on sale today.',
      'Looking for a bargain? I might have something.',
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
      'Better buy now. Might not be here tomorrow.',
      'Supplies are limited. Choose wisely.',
    ],
    tags: ['scarcity', 'urgency'],
  },
  {
    id: 'shop_browse_new_1',
    category: 'shop_browse',
    textTemplates: [
      'Just got a fresh shipment. Take a look.',
      'New items just came in on the train.',
      'Check out the new arrivals.',
    ],
    tags: ['new_stock'],
  },
];

export const SHOP_BUY_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'shop_buy_1',
    category: 'shop_buy',
    textTemplates: [
      "Good choice. That'll be {{price}} gold.",
      'Fine selection. Anything else?',
      'Pleasure doing business with you.',
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['transaction'],
  },
  {
    id: 'shop_buy_confirm_1',
    category: 'shop_buy',
    textTemplates: [
      "That'll be {{price}} gold. Deal?",
      '{{price}} gold for the lot. You want it?',
      "{{price}} gold, and it's yours.",
    ],
    tags: ['confirm', 'price'],
  },
  {
    id: 'shop_buy_complete_1',
    category: 'shop_buy',
    textTemplates: [
      'Pleasure doing business with you.',
      'Thank you kindly. Come back soon.',
      'Sold! Good choice.',
    ],
    tags: ['complete', 'thanks'],
  },
  {
    id: 'shop_buy_haggle_refuse_1',
    category: 'shop_buy',
    textTemplates: [
      'Price is firm. Take it or leave it.',
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
      'Alright, you drive a hard bargain. Deal.',
      'Fine, fine. You win this round.',
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
      'You get what you pay for.',
      "It's an investment. Trust me.",
    ],
    tags: ['expensive', 'justify'],
  },
  {
    id: 'shop_buy_insufficient_1',
    category: 'shop_buy',
    textTemplates: [
      "You don't have enough gold for that.",
      'Come back when your pockets are fuller.',
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
