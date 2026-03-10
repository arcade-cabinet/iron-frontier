/**
 * Dialogue Snippets - Reusable conversation fragments
 */

export { GREETING_SNIPPETS, FAREWELL_SNIPPETS } from './greetings.ts';
export { THANKS_SNIPPETS, REFUSAL_SNIPPETS, AGREEMENT_SNIPPETS } from './social.ts';
export { QUESTION_SNIPPETS, RUMOR_SNIPPETS, SMALL_TALK_SNIPPETS } from './conversation.ts';
export { THREAT_SNIPPETS, BRIBE_SNIPPETS, COMPLIMENT_SNIPPETS, INSULT_SNIPPETS } from './conflict.ts';
export { QUEST_OFFER_SNIPPETS, QUEST_UPDATE_SNIPPETS, QUEST_COMPLETE_SNIPPETS } from './quest.ts';
export { SHOP_WELCOME_SNIPPETS, SHOP_BROWSE_SNIPPETS, SHOP_BUY_SNIPPETS, SHOP_SELL_SNIPPETS, SHOP_FAREWELL_SNIPPETS } from './shop.ts';

export {
  DIALOGUE_SNIPPETS,
  getRandomSnippet,
  getRandomText,
  getSnippetsByCategory,
  getSnippetsByTag,
  getSnippetsByTags,
  getSnippetsByTimeOfDay,
  getSnippetsForNPC,
} from './helpers.ts';
