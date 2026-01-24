/**
 * Dialogue Snippets - Reusable conversation fragments
 *
 * Snippets are categorized by purpose and can be filtered by
 * NPC personality, role, and faction.
 */

import { type DialogueSnippet, DialogueSnippetSchema } from '../../schemas/generation';

/**
 * All dialogue snippets
 */
export const DIALOGUE_SNIPPETS: DialogueSnippet[] = [
  // ============================================================================
  // GREETINGS
  // ============================================================================
  {
    id: 'greeting_friendly_1',
    category: 'greeting',
    textTemplates: [
      "Howdy, stranger! Welcome to {{location}}.",
      "Well, look who wandered in! What can I do for ya?",
      "Afternoon, friend. New in town?",
    ],
    personalityMin: { friendliness: 0.6 },
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['friendly', 'welcoming'],
  },
  {
    id: 'greeting_neutral_1',
    category: 'greeting',
    textTemplates: [
      "Howdy.",
      "What do you want?",
      "Yeah?",
      "Somethin' I can help you with?",
    ],
    personalityMin: {},
    personalityMax: { friendliness: 0.6 },
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['neutral'],
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
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['hostile', 'unfriendly'],
  },
  {
    id: 'greeting_sheriff_1',
    category: 'greeting',
    textTemplates: [
      "Keep your nose clean in my town, stranger.",
      "I'm Sheriff {{npcLastName}}. You causin' trouble?",
      "New face in town. You got business here?",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: ['sheriff'],
    validFactions: ['law_enforcement'],
    validTimeOfDay: [],
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
    personalityMin: {},
    personalityMax: {},
    validRoles: ['bartender', 'saloon_keeper'],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['bartender', 'saloon'],
  },
  {
    id: 'greeting_morning_1',
    category: 'greeting',
    textTemplates: [
      "Mornin'. Coffee ain't ready yet.",
      "Early bird, eh? What brings you 'round at this hour?",
      "Sun's barely up. You must need somethin' important.",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
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
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: ['evening', 'night'],
    tags: ['time_specific'],
  },

  // ============================================================================
  // FAREWELLS
  // ============================================================================
  {
    id: 'farewell_friendly_1',
    category: 'farewell',
    textTemplates: [
      "Safe travels, friend.",
      "Come back anytime!",
      "Take care of yourself out there.",
      "Good luck to ya.",
    ],
    personalityMin: { friendliness: 0.5 },
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['friendly'],
  },
  {
    id: 'farewell_neutral_1',
    category: 'farewell',
    textTemplates: [
      "Yeah, see ya.",
      "Bye.",
      "Watch yourself.",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
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
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['hostile'],
  },

  // ============================================================================
  // THANKS
  // ============================================================================
  {
    id: 'thanks_sincere_1',
    category: 'thanks',
    textTemplates: [
      "Much obliged. You've done me a real service.",
      "Thank you kindly. I won't forget this.",
      "You're a good sort. Thank you.",
    ],
    personalityMin: { honesty: 0.6 },
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['sincere'],
  },
  {
    id: 'thanks_grudging_1',
    category: 'thanks',
    textTemplates: [
      "Fine. Thanks, I guess.",
      "Suppose I owe you one.",
      "Yeah... appreciated.",
    ],
    personalityMin: {},
    personalityMax: { friendliness: 0.5 },
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['grudging'],
  },

  // ============================================================================
  // REFUSALS
  // ============================================================================
  {
    id: 'refusal_polite_1',
    category: 'refusal',
    textTemplates: [
      "Sorry, can't help you with that.",
      "Afraid that ain't somethin' I can do.",
      "I'd like to help, but I can't.",
    ],
    personalityMin: { friendliness: 0.5 },
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
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
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
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
    personalityMin: {},
    personalityMax: { aggression: 0.3 },
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['scared', 'fearful'],
  },

  // ============================================================================
  // AGREEMENTS
  // ============================================================================
  {
    id: 'agreement_eager_1',
    category: 'agreement',
    textTemplates: [
      "You got yourself a deal!",
      "Now you're talkin'!",
      "I'm in. What do you need?",
    ],
    personalityMin: { friendliness: 0.6 },
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['eager'],
  },
  {
    id: 'agreement_reluctant_1',
    category: 'agreement',
    textTemplates: [
      "Fine. But you owe me.",
      "Alright, but this is the last time.",
      "I'll do it. Don't make me regret it.",
    ],
    personalityMin: {},
    personalityMax: { friendliness: 0.5 },
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['reluctant'],
  },

  // ============================================================================
  // RUMORS
  // ============================================================================
  {
    id: 'rumor_bandit_1',
    category: 'rumor',
    textTemplates: [
      "Heard tell there's bandits operating out by {{location}}. Watch yourself.",
      "Word is, the Red Canyon boys are back. Robbed a stage last week.",
      "Outlaws been gettin' bolder lately. Sheriff can't keep up.",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
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
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
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
    personalityMin: {},
    personalityMax: { honesty: 0.6 },
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
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
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
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
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['strange', 'mysterious'],
  },

  // ============================================================================
  // THREATS
  // ============================================================================
  {
    id: 'threat_direct_1',
    category: 'threat',
    textTemplates: [
      "You got about five seconds to get out of my sight.",
      "Try that again and they'll be scraping you off the floor.",
      "I've killed men for less.",
    ],
    personalityMin: { aggression: 0.7 },
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
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
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['subtle', 'intimidating'],
  },

  // ============================================================================
  // SMALL TALK
  // ============================================================================
  {
    id: 'small_talk_weather_1',
    category: 'small_talk',
    textTemplates: [
      "Hot one today, ain't it?",
      "Think we might get rain soon. Ground's thirsty.",
      "Dust storm's comin'. Can smell it.",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
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
    personalityMin: {},
    personalityMax: {},
    validRoles: ['shopkeeper', 'saloon_keeper', 'gunsmith', 'blacksmith'],
    validFactions: [],
    validTimeOfDay: [],
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
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['local'],
  },

  // ============================================================================
  // QUEST OFFERS
  // ============================================================================
  {
    id: 'quest_offer_urgent_1',
    category: 'quest_offer',
    textTemplates: [
      "I need your help. It's urgent.",
      "Thank God you're here. I've got a problem only someone like you can solve.",
      "You look capable. I've got a job for you.",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['urgent'],
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
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['casual'],
  },
  {
    id: 'quest_offer_bounty_1',
    category: 'quest_offer',
    textTemplates: [
      "Got a wanted poster here. {{target}} is worth good money, dead or alive.",
      "There's an outlaw needs bringing in. Interested?",
      "Law's offering a bounty on {{target}}. You up for it?",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: ['sheriff', 'deputy', 'bounty_hunter'],
    validFactions: ['law_enforcement'],
    validTimeOfDay: [],
    tags: ['bounty', 'official'],
  },

  // ============================================================================
  // QUEST UPDATES
  // ============================================================================
  {
    id: 'quest_update_progress_1',
    category: 'quest_update',
    textTemplates: [
      "How's that job coming along?",
      "Any progress on what we discussed?",
      "You got news for me?",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['check_in'],
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
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['impatient'],
  },

  // ============================================================================
  // QUEST COMPLETE
  // ============================================================================
  {
    id: 'quest_complete_grateful_1',
    category: 'quest_complete',
    textTemplates: [
      "You did it! I knew I could count on you.",
      "Outstanding work. Here's what I owe you.",
      "The town owes you a debt of gratitude.",
    ],
    personalityMin: { friendliness: 0.5 },
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['grateful'],
  },
  {
    id: 'quest_complete_matter_of_fact_1',
    category: 'quest_complete',
    textTemplates: [
      "Job's done then. Here's your pay.",
      "Alright. We're square.",
      "Payment as agreed. Pleasure doing business.",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['business'],
  },

  // ============================================================================
  // SHOP DIALOGUE
  // ============================================================================
  {
    id: 'shop_welcome_1',
    category: 'shop_welcome',
    textTemplates: [
      "Welcome! Take a look around.",
      "Got the finest goods in {{location}}. What do you need?",
      "Browser or buyer? Either way, come in.",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: ['shopkeeper', 'gunsmith', 'blacksmith'],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['welcoming'],
  },
  {
    id: 'shop_browse_1',
    category: 'shop_browse',
    textTemplates: [
      "See anything you like?",
      "Quality merchandise. Fair prices.",
      "Let me know if you need help finding something.",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: ['shopkeeper', 'gunsmith', 'blacksmith'],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['helpful'],
  },
  {
    id: 'shop_buy_1',
    category: 'shop_buy',
    textTemplates: [
      "Good choice. That'll be {{price}} gold.",
      "Fine selection. Anything else?",
      "Pleasure doing business with you.",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: ['shopkeeper', 'gunsmith', 'blacksmith'],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['transaction'],
  },
  {
    id: 'shop_sell_1',
    category: 'shop_sell',
    textTemplates: [
      "Let me see what you got there...",
      "Hmm, I can give you {{price}} for that.",
      "Fair price for fair goods.",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: ['shopkeeper', 'gunsmith', 'blacksmith'],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['transaction'],
  },
  {
    id: 'shop_farewell_1',
    category: 'shop_farewell',
    textTemplates: [
      "Come back anytime!",
      "Safe travels. Come again.",
      "You know where to find me.",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: ['shopkeeper', 'gunsmith', 'blacksmith'],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['farewell'],
  },

  // ============================================================================
  // INSULTS
  // ============================================================================
  {
    id: 'insult_mild_1',
    category: 'insult',
    textTemplates: [
      "You ain't too bright, are you?",
      "Bless your heart...",
      "Did your mama drop you on your head?",
    ],
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
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
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['harsh'],
  },

  // ============================================================================
  // COMPLIMENTS
  // ============================================================================
  {
    id: 'compliment_sincere_1',
    category: 'compliment',
    textTemplates: [
      "You've got a good head on your shoulders.",
      "This town's lucky to have someone like you.",
      "You're alright, stranger. Better than most.",
    ],
    personalityMin: { friendliness: 0.6, honesty: 0.6 },
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['sincere'],
  },

  // ============================================================================
  // BRIBE RESPONSES
  // ============================================================================
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
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['corruptible'],
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
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['honest'],
  },

  // ============================================================================
  // QUESTIONS
  // ============================================================================
  {
    id: 'question_stranger_1',
    category: 'question',
    textTemplates: [
      "Where you from, stranger?",
      "What brings you to {{location}}?",
      "You running from something?",
    ],
    personalityMin: { curiosity: 0.5 },
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
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
    personalityMin: {},
    personalityMax: {},
    validRoles: [],
    validFactions: [],
    validTimeOfDay: [],
    tags: ['practical'],
  },
];

// Validate all snippets
DIALOGUE_SNIPPETS.forEach((snippet, index) => {
  try {
    DialogueSnippetSchema.parse(snippet);
  } catch (error) {
    console.error(`Invalid dialogue snippet at index ${index}:`, snippet.id, error);
  }
});

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
  category: DialogueSnippet['category'],
  role: string,
  faction: string,
  personality: Record<string, number>
): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((snippet) => {
    if (snippet.category !== category) return false;

    // Check role
    if (snippet.validRoles.length > 0 && !snippet.validRoles.includes(role)) {
      return false;
    }

    // Check faction
    if (snippet.validFactions.length > 0 && !snippet.validFactions.includes(faction)) {
      return false;
    }

    // Check personality minimums
    for (const [trait, minValue] of Object.entries(snippet.personalityMin)) {
      if ((personality[trait] ?? 0.5) < minValue) {
        return false;
      }
    }

    // Check personality maximums
    for (const [trait, maxValue] of Object.entries(snippet.personalityMax)) {
      if ((personality[trait] ?? 0.5) > maxValue) {
        return false;
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
