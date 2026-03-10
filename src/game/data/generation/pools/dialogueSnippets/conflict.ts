/**
 * Conflict Dialogue Snippets
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const THREAT_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'threat_direct_1',
    category: 'threat',
    textTemplates: [
      'You got about five seconds to get out of my sight.',
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
      'Be a shame if something happened to you out on that lonely road.',
      'People who cross me tend to... disappear.',
      'I know where you sleep, friend.',
    ],
    personalityMin: { aggression: 0.5 },
    tags: ['subtle', 'intimidating'],
  },
  {
    id: 'threat_gang_1',
    category: 'threat',
    textTemplates: [
      "The gang doesn't take kindly to strangers. Get lost.",
      'You know who we are? Then you know what happens next.',
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
      'The law has ways of dealing with troublemakers. Painful ways.',
      "Keep pushing. I've got a noose with your name on it.",
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority', 'legal'],
  },
  {
    id: 'threat_family_1',
    category: 'threat',
    textTemplates: [
      'Nice family you got. Be a shame if something happened to them.',
      'I know where you live. Where your loved ones sleep.',
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
      'Make your choice: walk away or be carried out.',
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
      'Is that supposed to be intimidating?',
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
      'You seem to have forgotten your place.',
    ],
    validRoles: ['gang_leader', 'mayor'],
    tags: ['power', 'reminder'],
  },
  {
    id: 'threat_crazy_1',
    category: 'threat',
    textTemplates: [
      "I've got nothing to lose. Do you?",
      'They call me crazy for a reason.',
      "I don't fear death. Can you say the same?",
    ],
    personalityMin: { aggression: 0.7 },
    tags: ['unhinged', 'dangerous'],
  },
  {
    id: 'threat_collective_1',
    category: 'threat',
    textTemplates: [
      'The whole town wants you gone.',
      'Nobody here is going to help you.',
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
      'A snake bite in your bedroll would look like an accident.',
      'Not all dangers come from a gun barrel.',
    ],
    personalityMax: { lawfulness: 0.3 },
    tags: ['poison', 'covert'],
  },
];

export const BRIBE_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'bribe_accept_1',
    category: 'bribe',
    textTemplates: [
      'Well now... I think we can come to an arrangement.',
      'Money talks, friend. What do you need?',
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
      'Gold speaks louder than laws. What do you need?',
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
      'Against my better judgment... alright.',
    ],
    personalityMin: { greed: 0.4 },
    tags: ['accept', 'reluctant'],
  },
  {
    id: 'bribe_refuse_1',
    category: 'bribe',
    textTemplates: [
      'You think you can buy me? Get out.',
      "I can't be bought. Not for any price.",
      'Put that away before I arrest you for attempted bribery.',
    ],
    personalityMin: { honesty: 0.7 },
    tags: ['honest'],
  },
  {
    id: 'bribe_refuse_moral_1',
    category: 'bribe',
    textTemplates: [
      "Put your money away. I can't be bought.",
      'You insult me with your coin.',
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
      'Interesting offer. But the risk is higher than that.',
      'Double it and we might have a conversation.',
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
      'Keep your money. I need to stay alive more.',
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
      'Mammon holds no power here. Seek redemption instead.',
      'You cannot buy salvation, child.',
      'The church accepts donations, not bribes.',
    ],
    validRoles: ['preacher'],
    tags: ['refuse', 'religious'],
  },
];

export const COMPLIMENT_SNIPPETS: DialogueSnippet[] = [
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
      'You handle yourself well out there.',
      'Not many could have done what you did.',
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
      'Not just muscle between your ears, I see.',
    ],
    tags: ['intelligence', 'wit'],
  },
  {
    id: 'compliment_bravery_1',
    category: 'compliment',
    textTemplates: [
      'That took real courage. I respect that.',
      "Brave as they come. I'm impressed.",
      'Most would have run. You stood your ground.',
    ],
    tags: ['bravery', 'courage'],
  },
  {
    id: 'compliment_reputation_1',
    category: 'compliment',
    textTemplates: [
      "I've heard stories about you. They don't do you justice.",
      'Your reputation precedes you, and for good reason.',
      'Folks speak highly of you. Now I see why.',
    ],
    tags: ['reputation', 'fame'],
  },
  {
    id: 'compliment_merchant_1',
    category: 'compliment',
    textTemplates: [
      'You drive a hard bargain. I like that in a customer.',
      "You've got a nose for value. Impressive.",
      'A savvy buyer. My favorite kind.',
    ],
    validRoles: ['merchant', 'banker'],
    tags: ['commerce', 'business'],
  },
  {
    id: 'compliment_work_1',
    category: 'compliment',
    textTemplates: [
      "Quality work. You've got skilled hands.",
      'Job well done. Better than I expected.',
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
      'A loyal friend is worth their weight in gold.',
      "You stood by me when others wouldn't. I won't forget that.",
      "True loyalty is rare. You've got it.",
    ],
    tags: ['loyalty', 'friendship'],
  },
];

export const INSULT_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'insult_mild_1',
    category: 'insult',
    textTemplates: [
      "You ain't too bright, are you?",
      'Bless your heart...',
      'Did your mama drop you on your head?',
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
      'Yellow-bellied coward. Makes me sick just looking at you.',
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
      'Not the brightest star in the sky, are you?',
    ],
    tags: ['stupidity'],
  },
  {
    id: 'insult_appearance_1',
    category: 'insult',
    textTemplates: [
      "You look like something the buzzards wouldn't touch.",
      'Did you get dressed in a dust storm?',
      "I've seen prettier things crawl out of the desert.",
    ],
    tags: ['appearance'],
  },
  {
    id: 'insult_dishonesty_1',
    category: 'insult',
    textTemplates: [
      'Liar and a cheat, through and through.',
      "Your word ain't worth the breath it takes to speak it.",
      'Snake in the grass if I ever saw one.',
    ],
    personalityMin: { honesty: 0.5 },
    tags: ['dishonesty', 'liar'],
  },
  {
    id: 'insult_outlaw_1',
    category: 'insult',
    textTemplates: [
      'Nothing but a common criminal.',
      'Trash like you belongs in a cell.',
      'The law will catch up with you eventually, scum.',
    ],
    validRoles: ['sheriff', 'deputy'],
    personalityMin: { lawfulness: 0.6 },
    tags: ['criminal', 'authority'],
  },
  {
    id: 'insult_greenhorn_1',
    category: 'insult',
    textTemplates: [
      'Wet behind the ears greenhorn.',
      'Go back east where you belong, tenderfoot.',
      'The frontier will chew you up and spit you out.',
    ],
    validRoles: ['rancher', 'miner', 'farmer'],
    tags: ['inexperience'],
  },
  {
    id: 'insult_drunk_1',
    category: 'insult',
    textTemplates: [
      "Worthless drunk. Probably can't even see straight.",
      'Spend more time at the saloon than anywhere else, I reckon.',
      "Whiskey's rotted what little brains you had.",
    ],
    tags: ['alcoholism'],
  },
  {
    id: 'insult_general_1',
    category: 'insult',
    textTemplates: [
      'You make me sick.',
      'Get out of my sight.',
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
      'My grandmother hits harder than you.',
      'All bark and no bite.',
    ],
    personalityMin: { aggression: 0.5 },
    tags: ['weakness', 'combat'],
  },
  {
    id: 'insult_honor_1',
    category: 'insult',
    textTemplates: [
      'No honor among your kind.',
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
      'Sold us out for a few pieces of silver.',
      'Judas would be proud of you.',
    ],
    tags: ['betrayal', 'traitor'],
  },
  {
    id: 'insult_greed_1',
    category: 'insult',
    textTemplates: [
      'Greedy vulture, picking at the bones of honest folk.',
      "You'd sell your own mother for a nickel.",
      'Nothing but a money-grubbing parasite.',
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
