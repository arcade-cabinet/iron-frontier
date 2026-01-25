/**
 * Ambient Dialogue System - Iron Frontier
 *
 * Background NPC "barks" - one-liners said as the player walks by.
 * These create atmosphere and convey world state without direct interaction.
 *
 * Categories:
 * - General Town Chatter: Weather, gossip, work, greetings
 * - IVRC Territory: Company propaganda, fear, quotas
 * - Freeminer Territory: Union talk, hope, warnings
 * - Saloon Chatter: Drunken boasts, gambling, tales
 * - Reaction to Player: Stranger comments, reputation-based
 * - Time/Weather Based: Morning, evening, storm reactions
 */

import { z } from 'zod';

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

/**
 * Categories of ambient dialogue
 */
export const AmbientDialogueCategorySchema = z.enum([
  'general_town',
  'ivrc_territory',
  'freeminer_territory',
  'saloon',
  'player_reaction',
  'time_weather',
]);
export type AmbientDialogueCategory = z.infer<typeof AmbientDialogueCategorySchema>;

/**
 * Conditions that determine when dialogue can play
 */
export const AmbientConditionSchema = z.object({
  /** Required faction control of current location */
  factionControl: z.enum(['ivrc', 'freeminer', 'neutral', 'copperhead']).optional(),
  /** Required time of day */
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
  /** Required weather condition */
  weather: z.enum(['clear', 'rain', 'storm', 'hot', 'cold', 'dust']).optional(),
  /** Required location type */
  locationType: z.enum(['town', 'saloon', 'mine', 'ranch', 'camp', 'church']).optional(),
  /** Minimum player reputation with faction */
  minReputation: z.number().int().min(-100).max(100).optional(),
  /** Maximum player reputation with faction */
  maxReputation: z.number().int().min(-100).max(100).optional(),
  /** Required quest state (quest_id:state) */
  questState: z.string().optional(),
  /** Player has visited before */
  playerIsKnown: z.boolean().optional(),
  /** Required game flags */
  requiredFlags: z.array(z.string()).optional(),
});
export type AmbientCondition = z.infer<typeof AmbientConditionSchema>;

/**
 * Single ambient dialogue line
 */
export const AmbientDialogueSchema = z.object({
  /** Unique identifier */
  id: z.string(),
  /** The spoken text */
  text: z.string(),
  /** Category for organization */
  category: AmbientDialogueCategorySchema,
  /** Conditions for when this can play */
  conditions: AmbientConditionSchema.optional(),
  /** Tags for filtering */
  tags: z.array(z.string()),
  /** Priority (higher = more likely to be selected, default 5) */
  priority: z.number().int().min(1).max(10).optional(),
});
export type AmbientDialogue = z.infer<typeof AmbientDialogueSchema>;

/** Default priority for dialogue selection */
const DEFAULT_PRIORITY = 5;

// ============================================================================
// GENERAL TOWN CHATTER (20 lines)
// ============================================================================

const GENERAL_TOWN_DIALOGUE: AmbientDialogue[] = [
  // Weather comments
  {
    id: 'general_weather_1',
    text: "Looks like rain's comin'. Better get the horses in.",
    category: 'general_town',
    tags: ['weather', 'observation'],
  },
  {
    id: 'general_weather_2',
    text: "Sun's brutal today. Could fry an egg on them railroad tracks.",
    category: 'general_town',
    tags: ['weather', 'hot'],
  },
  {
    id: 'general_weather_3',
    text: 'Wind like this carries dust clean from the badlands.',
    category: 'general_town',
    tags: ['weather', 'wind'],
  },

  // Gossip about events
  {
    id: 'general_gossip_1',
    text: 'Did you hear? Another wagon went missing on the north road.',
    category: 'general_town',
    tags: ['gossip', 'danger'],
  },
  {
    id: 'general_gossip_2',
    text: "They say there's gold in them hills. Folk always say that.",
    category: 'general_town',
    tags: ['gossip', 'gold'],
  },
  {
    id: 'general_gossip_3',
    text: "Doc patched up three men last night. Won't say from what.",
    category: 'general_town',
    tags: ['gossip', 'violence'],
  },
  {
    id: 'general_gossip_4',
    text: 'Railroad brought in more strangers yesterday. Town keeps growin\'.',
    category: 'general_town',
    tags: ['gossip', 'railroad'],
  },

  // Work complaints
  {
    id: 'general_work_1',
    text: "My back ain't what it used to be. Twenty years of haulin' does that.",
    category: 'general_town',
    tags: ['work', 'complaint'],
  },
  {
    id: 'general_work_2',
    text: "Boss wants more, always more. Don't matter how hard we work.",
    category: 'general_town',
    tags: ['work', 'complaint'],
  },
  {
    id: 'general_work_3',
    text: 'Prices keep goin\' up but wages stay the same.',
    category: 'general_town',
    tags: ['work', 'economy'],
  },
  {
    id: 'general_work_4',
    text: "Ain't no rest for honest folk in these parts.",
    category: 'general_town',
    tags: ['work', 'tired'],
  },

  // Greetings
  {
    id: 'general_greeting_1',
    text: 'Fine day for a walk, stranger.',
    category: 'general_town',
    tags: ['greeting', 'friendly'],
  },
  {
    id: 'general_greeting_2',
    text: "Afternoon. Stay out of trouble now.",
    category: 'general_town',
    tags: ['greeting', 'neutral'],
  },
  {
    id: 'general_greeting_3',
    text: "Howdy. You ain't from around here, are ya?",
    category: 'general_town',
    tags: ['greeting', 'curious'],
  },
  {
    id: 'general_greeting_4',
    text: "Watch your step. Them boardwalks get slick.",
    category: 'general_town',
    tags: ['greeting', 'warning'],
  },

  // General observations
  {
    id: 'general_observe_1',
    text: "Town's changed since the company moved in. Not for the better.",
    category: 'general_town',
    tags: ['observation', 'change'],
  },
  {
    id: 'general_observe_2',
    text: 'Used to be you could leave your door unlocked at night.',
    category: 'general_town',
    tags: ['observation', 'nostalgia'],
  },
  {
    id: 'general_observe_3',
    text: "Preacher says we reap what we sow. Hope that's true.",
    category: 'general_town',
    tags: ['observation', 'philosophical'],
  },
  {
    id: 'general_observe_4',
    text: 'Lot of new faces lately. Makes a body nervous.',
    category: 'general_town',
    tags: ['observation', 'suspicious'],
  },
  {
    id: 'general_observe_5',
    text: 'Quiet day. Too quiet, if you ask me.',
    category: 'general_town',
    tags: ['observation', 'ominous'],
  },
];

// ============================================================================
// IVRC TERRITORY DIALOGUE (15 lines)
// ============================================================================

const IVRC_TERRITORY_DIALOGUE: AmbientDialogue[] = [
  // Pro-company propaganda
  {
    id: 'ivrc_propaganda_1',
    text: 'The Company takes care of us. Three meals a day, roof over our heads.',
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['propaganda', 'company'],
  },
  {
    id: 'ivrc_propaganda_2',
    text: "Progress don't come cheap. IVRC's buildin' the future.",
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['propaganda', 'progress'],
  },
  {
    id: 'ivrc_propaganda_3',
    text: 'Better to work for the Company than starve like them Freeminers.',
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['propaganda', 'comparison'],
  },

  // Fearful whispers
  {
    id: 'ivrc_fear_1',
    text: "*hushed* Keep your voice down. Pinkertons have ears everywhere.",
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['fear', 'whisper'],
    priority: 3,
  },
  {
    id: 'ivrc_fear_2',
    text: "*nervous* You didn't hear this from me, understand?",
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['fear', 'whisper'],
    priority: 3,
  },
  {
    id: 'ivrc_fear_3',
    text: "Last fella who complained about conditions... well, he ain't here no more.",
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['fear', 'warning'],
    priority: 4,
  },
  {
    id: 'ivrc_fear_4',
    text: "*looks around* We don't talk about the old shaft. Best forgotten.",
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['fear', 'mystery'],
    priority: 3,
  },

  // Work quotas
  {
    id: 'ivrc_quota_1',
    text: "Twenty tons this week. Foreman says thirty next. It ain't possible.",
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['quota', 'work'],
  },
  {
    id: 'ivrc_quota_2',
    text: "Missed quota again. They'll dock my wages for sure.",
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['quota', 'worry'],
  },
  {
    id: 'ivrc_quota_3',
    text: "New quotas came down from headquarters. Ain't nobody happy.",
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['quota', 'announcement'],
  },

  // Company store complaints
  {
    id: 'ivrc_store_1',
    text: 'Company scrip only. Cash money\'s worth nothin\' at the store.',
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['store', 'scrip'],
  },
  {
    id: 'ivrc_store_2',
    text: 'Prices at the company store went up again. Flour costs more than gold.',
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['store', 'prices'],
  },
  {
    id: 'ivrc_store_3',
    text: "I owe the company more than I make. Ain't never gettin' free.",
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['store', 'debt'],
    priority: 6,
  },
  {
    id: 'ivrc_store_4',
    text: "They say work hard and you'll get ahead. But the debt just grows.",
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['store', 'debt'],
  },
  {
    id: 'ivrc_store_5',
    text: 'My father owed the company. His father before him. Reckon I will too.',
    category: 'ivrc_territory',
    conditions: { factionControl: 'ivrc' },
    tags: ['store', 'generational'],
    priority: 7,
  },
];

// ============================================================================
// FREEMINER TERRITORY DIALOGUE (15 lines)
// ============================================================================

const FREEMINER_TERRITORY_DIALOGUE: AmbientDialogue[] = [
  // Union talk
  {
    id: 'freeminer_union_1',
    text: 'Together we stand. Divided we fall. Old Samuel taught us that.',
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['union', 'solidarity'],
  },
  {
    id: 'freeminer_union_2',
    text: "Every miner deserves a fair wage. That's worth fightin' for.",
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['union', 'rights'],
  },
  {
    id: 'freeminer_union_3',
    text: 'The bosses got their gold. Time we got ours.',
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['union', 'wealth'],
  },
  {
    id: 'freeminer_union_4',
    text: "Meeting tonight at the hollow. Spread the word quiet-like.",
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['union', 'organizing'],
    priority: 4,
  },

  // Hope for change
  {
    id: 'freeminer_hope_1',
    text: "Things are changin'. I can feel it in my bones.",
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['hope', 'change'],
  },
  {
    id: 'freeminer_hope_2',
    text: "My children won't live under the Company's boot. I'll make sure of it.",
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['hope', 'future'],
    priority: 6,
  },
  {
    id: 'freeminer_hope_3',
    text: "Free miners, free lives. That's the dream.",
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['hope', 'freedom'],
  },
  {
    id: 'freeminer_hope_4',
    text: 'Every small victory counts. Remember that.',
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['hope', 'encouragement'],
  },

  // Stories of the cause
  {
    id: 'freeminer_story_1',
    text: 'Old Samuel lost his son to a preventable collapse. Never forget why we fight.',
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['story', 'history'],
    priority: 7,
  },
  {
    id: 'freeminer_story_2',
    text: "Three years ago we had nothin'. Now look at us.",
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['story', 'progress'],
  },
  {
    id: 'freeminer_story_3',
    text: "The Coppertown strike of '72. That's when everything changed.",
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['story', 'history'],
  },

  // Warnings about IVRC
  {
    id: 'freeminer_warning_1',
    text: "Don't trust anyone in a company suit. They smile while they rob you.",
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['warning', 'ivrc'],
  },
  {
    id: 'freeminer_warning_2',
    text: 'IVRC Pinkertons been sniffin\' around. Watch yourself.',
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['warning', 'danger'],
    priority: 6,
  },
  {
    id: 'freeminer_warning_3',
    text: "Word is the Company's planning somethin'. Keep your powder dry.",
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['warning', 'threat'],
  },
  {
    id: 'freeminer_warning_4',
    text: 'Company men burned a settlement last month. Could happen here too.',
    category: 'freeminer_territory',
    conditions: { factionControl: 'freeminer' },
    tags: ['warning', 'violence'],
    priority: 7,
  },
];

// ============================================================================
// SALOON CHATTER (15 lines)
// ============================================================================

const SALOON_DIALOGUE: AmbientDialogue[] = [
  // Drunken boasts
  {
    id: 'saloon_boast_1',
    text: "*slurred* I could outshoot any man in this territory... if I could see straight.",
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['drunk', 'boast'],
  },
  {
    id: 'saloon_boast_2',
    text: '*loud* Three men I killed! Well, two. One might have lived.',
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['drunk', 'boast'],
  },
  {
    id: 'saloon_boast_3',
    text: "*swaying* You shoulda seen the nugget I found. Big as my fist!",
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['drunk', 'boast', 'gold'],
  },
  {
    id: 'saloon_boast_4',
    text: "Ain't nobody tougher than me west of the Mississippi. That's a fact.",
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['drunk', 'boast'],
  },

  // Gambling references
  {
    id: 'saloon_gamble_1',
    text: 'Lady Luck owes me. Tonight I can feel my fortune turnin\'.',
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['gambling', 'hope'],
  },
  {
    id: 'saloon_gamble_2',
    text: '*muttering* Should never have bet on that hand. Never.',
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['gambling', 'regret'],
  },
  {
    id: 'saloon_gamble_3',
    text: "Cards don't lie, friend. And right now they say I'm winnin'.",
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['gambling', 'confident'],
  },
  {
    id: 'saloon_gamble_4',
    text: 'Fella at the corner table? Cheats. I seen him deal from the bottom.',
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['gambling', 'accusation'],
    priority: 4,
  },

  // Tale-telling
  {
    id: 'saloon_tale_1',
    text: "Ever hear about the ghost train? Runs at midnight, they say...",
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['tale', 'supernatural'],
  },
  {
    id: 'saloon_tale_2',
    text: "Old timer told me about mechanical men in the mines. Thought he was crazy.",
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['tale', 'automatons'],
    priority: 6,
  },
  {
    id: 'saloon_tale_3',
    text: "There's a canyon out west where compasses don't work. Swear on my mother.",
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['tale', 'mystery'],
  },

  // Rumors and gossip
  {
    id: 'saloon_rumor_1',
    text: "Word is Diamondback's gang hit another payroll. Company's furious.",
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['rumor', 'copperhead'],
    priority: 7,
  },
  {
    id: 'saloon_rumor_2',
    text: 'Sheriff\'s been askin\' questions. Somebody\'s in trouble.',
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['rumor', 'law'],
  },
  {
    id: 'saloon_rumor_3',
    text: 'Railroad\'s bringing something in tomorrow. Heavy security.',
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['rumor', 'railroad'],
    priority: 5,
  },
  {
    id: 'saloon_rumor_4',
    text: "They found another body in the desert. Fourth one this month.",
    category: 'saloon',
    conditions: { locationType: 'saloon' },
    tags: ['rumor', 'dark'],
    priority: 6,
  },
];

// ============================================================================
// REACTION TO PLAYER (20 lines)
// ============================================================================

const PLAYER_REACTION_DIALOGUE: AmbientDialogue[] = [
  // New stranger comments
  {
    id: 'player_stranger_1',
    text: "New face in town. Wonder what brought 'em here.",
    category: 'player_reaction',
    conditions: { playerIsKnown: false },
    tags: ['stranger', 'curious'],
  },
  {
    id: 'player_stranger_2',
    text: "*staring* Another drifter. We get a lot of those.",
    category: 'player_reaction',
    conditions: { playerIsKnown: false },
    tags: ['stranger', 'suspicious'],
  },
  {
    id: 'player_stranger_3',
    text: "You look like you've traveled far. Roads ain't safe these days.",
    category: 'player_reaction',
    conditions: { playerIsKnown: false },
    tags: ['stranger', 'observation'],
  },
  {
    id: 'player_stranger_4',
    text: "Stranger... best mind your business and we'll mind ours.",
    category: 'player_reaction',
    conditions: { playerIsKnown: false },
    tags: ['stranger', 'warning'],
  },
  {
    id: 'player_stranger_5',
    text: 'Fresh off the trail, I reckon. Town well\'s that way.',
    category: 'player_reaction',
    conditions: { playerIsKnown: false },
    tags: ['stranger', 'helpful'],
  },

  // Positive reputation reactions
  {
    id: 'player_hero_1',
    text: "That's the one who helped the Hendersons. Good folk.",
    category: 'player_reaction',
    conditions: { minReputation: 50 },
    tags: ['reputation', 'positive'],
  },
  {
    id: 'player_hero_2',
    text: "*nods respectfully* Heard what you did. Town's grateful.",
    category: 'player_reaction',
    conditions: { minReputation: 50 },
    tags: ['reputation', 'positive'],
  },
  {
    id: 'player_hero_3',
    text: "There goes a true friend of the people. God bless 'em.",
    category: 'player_reaction',
    conditions: { minReputation: 75 },
    tags: ['reputation', 'positive'],
    priority: 7,
  },
  {
    id: 'player_hero_4',
    text: "If you need anything, just ask. We don't forget who helped us.",
    category: 'player_reaction',
    conditions: { minReputation: 60 },
    tags: ['reputation', 'positive'],
  },

  // Negative reputation reactions
  {
    id: 'player_villain_1',
    text: "*spits* There's that troublemaker. Keep walkin'.",
    category: 'player_reaction',
    conditions: { maxReputation: -25 },
    tags: ['reputation', 'negative'],
  },
  {
    id: 'player_villain_2',
    text: '*averts eyes* ...pretend you didn\'t see them. Don\'t make eye contact.',
    category: 'player_reaction',
    conditions: { maxReputation: -50 },
    tags: ['reputation', 'negative'],
    priority: 6,
  },
  {
    id: 'player_villain_3',
    text: "*gripping weapon* Stay away from my family, you hear?",
    category: 'player_reaction',
    conditions: { maxReputation: -75 },
    tags: ['reputation', 'negative'],
    priority: 8,
  },
  {
    id: 'player_villain_4',
    text: "Sheriff ought to run that one out of town.",
    category: 'player_reaction',
    conditions: { maxReputation: -40 },
    tags: ['reputation', 'negative'],
  },

  // Post-quest reactions
  {
    id: 'player_quest_1',
    text: 'Heard you took care of that business at the mine. Well done.',
    category: 'player_reaction',
    conditions: { questState: 'any:completed' },
    tags: ['quest', 'acknowledgment'],
  },
  {
    id: 'player_quest_2',
    text: "Things have been better since you came to town.",
    category: 'player_reaction',
    conditions: { questState: 'any:completed', minReputation: 25 },
    tags: ['quest', 'gratitude'],
  },

  // Faction-based reactions
  {
    id: 'player_faction_ivrc_1',
    text: 'Company friend, are ya? *cold stare* We remember faces.',
    category: 'player_reaction',
    conditions: { factionControl: 'freeminer' },
    tags: ['faction', 'ivrc', 'hostile'],
    priority: 6,
  },
  {
    id: 'player_faction_freeminer_1',
    text: "*whisper* Keep your union talk quiet around here. Walls have ears.",
    category: 'player_reaction',
    conditions: { factionControl: 'ivrc' },
    tags: ['faction', 'freeminer', 'warning'],
  },
  {
    id: 'player_faction_copperhead_1',
    text: "Heard you run with Diamondback's crew. Brave... or foolish.",
    category: 'player_reaction',
    tags: ['faction', 'copperhead', 'observation'],
    priority: 5,
  },
  {
    id: 'player_faction_neutral_1',
    text: "Smart to stay neutral in these parts. Safer that way.",
    category: 'player_reaction',
    tags: ['faction', 'neutral', 'advice'],
  },
  {
    id: 'player_return_1',
    text: "You're back. Thought you'd moved on by now.",
    category: 'player_reaction',
    conditions: { playerIsKnown: true },
    tags: ['return', 'familiar'],
  },
];

// ============================================================================
// TIME/WEATHER BASED DIALOGUE (15 lines)
// ============================================================================

const TIME_WEATHER_DIALOGUE: AmbientDialogue[] = [
  // Morning greetings
  {
    id: 'time_morning_1',
    text: "Beautiful morning. Lord willin', it'll stay that way.",
    category: 'time_weather',
    conditions: { timeOfDay: 'morning' },
    tags: ['morning', 'pleasant'],
  },
  {
    id: 'time_morning_2',
    text: '*yawning* Coffee ain\'t kicked in yet. Give me an hour.',
    category: 'time_weather',
    conditions: { timeOfDay: 'morning' },
    tags: ['morning', 'tired'],
  },
  {
    id: 'time_morning_3',
    text: "Early bird gets the worm. Late bird gets the scraps.",
    category: 'time_weather',
    conditions: { timeOfDay: 'morning' },
    tags: ['morning', 'wisdom'],
  },
  {
    id: 'time_morning_4',
    text: "Sun's up, which means I should be workin'. *sighs*",
    category: 'time_weather',
    conditions: { timeOfDay: 'morning' },
    tags: ['morning', 'work'],
  },

  // Evening farewells
  {
    id: 'time_evening_1',
    text: 'Sun\'s settin\'. Time to head home before dark.',
    category: 'time_weather',
    conditions: { timeOfDay: 'evening' },
    tags: ['evening', 'farewell'],
  },
  {
    id: 'time_evening_2',
    text: "Another day survived. That's somethin' in these parts.",
    category: 'time_weather',
    conditions: { timeOfDay: 'evening' },
    tags: ['evening', 'reflective'],
  },
  {
    id: 'time_evening_3',
    text: "Night's comin'. Lock your doors tight.",
    category: 'time_weather',
    conditions: { timeOfDay: 'evening' },
    tags: ['evening', 'warning'],
  },
  {
    id: 'time_evening_4',
    text: "Red sky at night, shepherd's delight. Tomorrow'll be fine.",
    category: 'time_weather',
    conditions: { timeOfDay: 'evening' },
    tags: ['evening', 'weather'],
  },

  // Storm comments
  {
    id: 'weather_storm_1',
    text: "Storm's rollin' in fast. Find shelter while you can.",
    category: 'time_weather',
    conditions: { weather: 'storm' },
    tags: ['storm', 'warning'],
    priority: 7,
  },
  {
    id: 'weather_storm_2',
    text: '*looking at sky* Thunder means trouble. Always does.',
    category: 'time_weather',
    conditions: { weather: 'storm' },
    tags: ['storm', 'ominous'],
  },
  {
    id: 'weather_storm_3',
    text: "Lightnin' struck the old oak last night. Burned clean through.",
    category: 'time_weather',
    conditions: { weather: 'storm' },
    tags: ['storm', 'aftermath'],
  },

  // Hot day complaints
  {
    id: 'weather_hot_1',
    text: "Hotter than a branding iron today. Can barely breathe.",
    category: 'time_weather',
    conditions: { weather: 'hot' },
    tags: ['hot', 'complaint'],
  },
  {
    id: 'weather_hot_2',
    text: '*wiping brow* This heat\'s gonna kill someone. Mark my words.',
    category: 'time_weather',
    conditions: { weather: 'hot' },
    tags: ['hot', 'complaint'],
  },
  {
    id: 'weather_hot_3',
    text: "Animals know better. They're all hidin' in the shade.",
    category: 'time_weather',
    conditions: { weather: 'hot' },
    tags: ['hot', 'observation'],
  },
  {
    id: 'weather_hot_4',
    text: "Water's worth more than gold on days like this.",
    category: 'time_weather',
    conditions: { weather: 'hot' },
    tags: ['hot', 'wisdom'],
  },
];

// ============================================================================
// COMBINED DIALOGUE REGISTRY
// ============================================================================

export const ALL_AMBIENT_DIALOGUE: AmbientDialogue[] = [
  ...GENERAL_TOWN_DIALOGUE,
  ...IVRC_TERRITORY_DIALOGUE,
  ...FREEMINER_TERRITORY_DIALOGUE,
  ...SALOON_DIALOGUE,
  ...PLAYER_REACTION_DIALOGUE,
  ...TIME_WEATHER_DIALOGUE,
];

// Indexed by category for fast lookup
export const AMBIENT_DIALOGUE_BY_CATEGORY: Record<AmbientDialogueCategory, AmbientDialogue[]> = {
  general_town: GENERAL_TOWN_DIALOGUE,
  ivrc_territory: IVRC_TERRITORY_DIALOGUE,
  freeminer_territory: FREEMINER_TERRITORY_DIALOGUE,
  saloon: SALOON_DIALOGUE,
  player_reaction: PLAYER_REACTION_DIALOGUE,
  time_weather: TIME_WEATHER_DIALOGUE,
};

// Indexed by ID for direct lookup
export const AMBIENT_DIALOGUE_BY_ID: Record<string, AmbientDialogue> = Object.fromEntries(
  ALL_AMBIENT_DIALOGUE.map((d) => [d.id, d])
);

// ============================================================================
// COOLDOWN SYSTEM
// ============================================================================

/**
 * Tracks recently played dialogue to prevent repetition
 */
class DialogueCooldownManager {
  private recentlyPlayed: Map<string, number> = new Map();
  private readonly defaultCooldownMs: number = 60000; // 1 minute default
  private readonly maxRecentEntries: number = 50;

  /**
   * Check if a dialogue is on cooldown
   */
  isOnCooldown(dialogueId: string): boolean {
    const lastPlayed = this.recentlyPlayed.get(dialogueId);
    if (!lastPlayed) return false;
    return Date.now() - lastPlayed < this.defaultCooldownMs;
  }

  /**
   * Mark a dialogue as recently played
   */
  markPlayed(dialogueId: string): void {
    this.recentlyPlayed.set(dialogueId, Date.now());

    // Cleanup old entries if needed
    if (this.recentlyPlayed.size > this.maxRecentEntries) {
      const entries = [...this.recentlyPlayed.entries()];
      entries.sort((a, b) => a[1] - b[1]);
      // Remove oldest quarter
      const toRemove = entries.slice(0, Math.floor(this.maxRecentEntries / 4));
      for (const [id] of toRemove) {
        this.recentlyPlayed.delete(id);
      }
    }
  }

  /**
   * Clear all cooldowns (e.g., when changing locations)
   */
  clearAll(): void {
    this.recentlyPlayed.clear();
  }

  /**
   * Clear cooldown for a specific dialogue
   */
  clearCooldown(dialogueId: string): void {
    this.recentlyPlayed.delete(dialogueId);
  }
}

// Singleton instance
export const dialogueCooldowns = new DialogueCooldownManager();

// ============================================================================
// CONTEXT TYPE FOR DIALOGUE SELECTION
// ============================================================================

/**
 * Current game context for filtering dialogue
 */
export interface AmbientDialogueContext {
  factionControl?: 'ivrc' | 'freeminer' | 'neutral' | 'copperhead';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: 'clear' | 'rain' | 'storm' | 'hot' | 'cold' | 'dust';
  locationType?: 'town' | 'saloon' | 'mine' | 'ranch' | 'camp' | 'church';
  playerReputation?: number;
  playerIsKnown?: boolean;
  activeFlags?: string[];
  completedQuests?: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a dialogue's conditions are met by the current context
 */
export function checkConditions(
  dialogue: AmbientDialogue,
  context: AmbientDialogueContext
): boolean {
  const conditions = dialogue.conditions;
  if (!conditions) return true;

  // Faction control check
  if (conditions.factionControl && conditions.factionControl !== context.factionControl) {
    return false;
  }

  // Time of day check
  if (conditions.timeOfDay && conditions.timeOfDay !== context.timeOfDay) {
    return false;
  }

  // Weather check
  if (conditions.weather && conditions.weather !== context.weather) {
    return false;
  }

  // Location type check
  if (conditions.locationType && conditions.locationType !== context.locationType) {
    return false;
  }

  // Reputation checks
  if (
    conditions.minReputation !== undefined &&
    (context.playerReputation === undefined || context.playerReputation < conditions.minReputation)
  ) {
    return false;
  }
  if (
    conditions.maxReputation !== undefined &&
    (context.playerReputation === undefined || context.playerReputation > conditions.maxReputation)
  ) {
    return false;
  }

  // Player known check
  if (conditions.playerIsKnown !== undefined && conditions.playerIsKnown !== context.playerIsKnown) {
    return false;
  }

  // Required flags check
  if (conditions.requiredFlags && conditions.requiredFlags.length > 0) {
    const activeFlags = context.activeFlags || [];
    if (!conditions.requiredFlags.every((flag) => activeFlags.includes(flag))) {
      return false;
    }
  }

  return true;
}

/**
 * Get all dialogue that matches the current context
 */
export function getAvailableDialogue(
  context: AmbientDialogueContext,
  categories?: AmbientDialogueCategory[]
): AmbientDialogue[] {
  let pool = ALL_AMBIENT_DIALOGUE;

  // Filter by categories if specified
  if (categories && categories.length > 0) {
    pool = pool.filter((d) => categories.includes(d.category));
  }

  // Filter by conditions and cooldown
  return pool.filter((d) => checkConditions(d, context) && !dialogueCooldowns.isOnCooldown(d.id));
}

/**
 * Get the priority of a dialogue, using default if not specified
 */
function getPriority(dialogue: AmbientDialogue): number {
  return dialogue.priority ?? DEFAULT_PRIORITY;
}

/**
 * Get a random dialogue line based on context
 * Uses weighted selection based on priority
 */
export function getRandomDialogue(
  context: AmbientDialogueContext,
  categories?: AmbientDialogueCategory[]
): AmbientDialogue | null {
  const available = getAvailableDialogue(context, categories);

  if (available.length === 0) {
    return null;
  }

  // Weighted random selection based on priority
  const totalWeight = available.reduce((sum, d) => sum + getPriority(d), 0);
  let random = Math.random() * totalWeight;

  for (const dialogue of available) {
    random -= getPriority(dialogue);
    if (random <= 0) {
      dialogueCooldowns.markPlayed(dialogue.id);
      return dialogue;
    }
  }

  // Fallback (shouldn't reach here, but safety first)
  const fallback = available[0];
  dialogueCooldowns.markPlayed(fallback.id);
  return fallback;
}

/**
 * Get dialogue by specific tags
 */
export function getDialogueByTags(tags: string[], context?: AmbientDialogueContext): AmbientDialogue[] {
  let pool = ALL_AMBIENT_DIALOGUE;

  // Filter by tags (must have ALL specified tags)
  pool = pool.filter((d) => tags.every((tag) => d.tags.includes(tag)));

  // If context provided, also filter by conditions
  if (context) {
    pool = pool.filter((d) => checkConditions(d, context));
  }

  return pool;
}

/**
 * Get dialogue for a specific category
 */
export function getDialogueByCategory(
  category: AmbientDialogueCategory,
  context?: AmbientDialogueContext
): AmbientDialogue[] {
  const pool = AMBIENT_DIALOGUE_BY_CATEGORY[category] || [];

  if (!context) {
    return pool;
  }

  return pool.filter((d) => checkConditions(d, context));
}

/**
 * Get dialogue suitable for the current location and time
 * This is the main function for NPC bark selection
 */
export function getContextualDialogue(context: AmbientDialogueContext): AmbientDialogue | null {
  // Build category list based on context
  const categories: AmbientDialogueCategory[] = ['general_town'];

  // Add faction-specific dialogue
  if (context.factionControl === 'ivrc') {
    categories.push('ivrc_territory');
  } else if (context.factionControl === 'freeminer') {
    categories.push('freeminer_territory');
  }

  // Add location-specific dialogue
  if (context.locationType === 'saloon') {
    categories.push('saloon');
  }

  // Always include time/weather and player reactions
  categories.push('time_weather');
  categories.push('player_reaction');

  return getRandomDialogue(context, categories);
}

// ============================================================================
// STATISTICS AND DEBUG
// ============================================================================

/**
 * Get statistics about available dialogue
 */
export function getDialogueStats(): Record<string, number> {
  return {
    total: ALL_AMBIENT_DIALOGUE.length,
    general_town: GENERAL_TOWN_DIALOGUE.length,
    ivrc_territory: IVRC_TERRITORY_DIALOGUE.length,
    freeminer_territory: FREEMINER_TERRITORY_DIALOGUE.length,
    saloon: SALOON_DIALOGUE.length,
    player_reaction: PLAYER_REACTION_DIALOGUE.length,
    time_weather: TIME_WEATHER_DIALOGUE.length,
  };
}

/**
 * Validate all dialogue against schema
 */
export function validateAllDialogue(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const dialogue of ALL_AMBIENT_DIALOGUE) {
    try {
      AmbientDialogueSchema.parse(dialogue);
    } catch (e) {
      errors.push(`Invalid dialogue ${dialogue.id}: ${e}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
