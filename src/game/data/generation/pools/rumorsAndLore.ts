/**
 * Iron Frontier - Rumors and Lore Pools
 *
 * World-building content for procedural dialogue and discovery.
 * Rumors provide dynamic hints about quests, locations, and NPCs.
 * Lore fragments build the world's history and mythology.
 */

import type { GenerationContext, LoreFragment, RumorTemplate } from '../../schemas/generation';
import type { SeededRandom } from '../seededRandom';

// ============================================================================
// RUMOR TEMPLATES
// ============================================================================

export const RUMOR_TEMPLATES: RumorTemplate[] = [
  // -------------------------------------------------------------------------
  // QUEST HOOK (10+)
  // -------------------------------------------------------------------------
  {
    id: 'rumor_quest_bounty_outlaw',
    category: 'quest_hook',
    textTemplates: [
      "Heard tell {{npc}} is lookin' for someone to hunt down that {{outlaw}} character. Pays well, I reckon.",
      "{{npc}} down at the {{building}} been askin' around for someone with grit. Somethin' about a bounty.",
      "Word is there's a price on {{outlaw}}'s head. {{npc}} might know more about it.",
    ],
    prevalence: 0.7,
    tags: ['combat', 'bounty'],
  },
  {
    id: 'rumor_quest_delivery',
    category: 'quest_hook',
    textTemplates: [
      "{{npc}} needs somethin' delivered to {{location}}. Ain't safe work, but the pay's honest.",
      "Heard {{npc}} is desperate for a courier. Package needs to reach {{location}} before week's end.",
      "Got a friend who knows {{npc}} - they need someone trustworthy to carry somethin' valuable.",
    ],
    prevalence: 0.6,
    tags: ['delivery', 'travel'],
  },
  {
    id: 'rumor_quest_escort',
    category: 'quest_hook',
    textTemplates: [
      '{{npc}} is headed to {{location}} and needs protection on the road. Bandits been thick lately.',
      "There's a wagon train formin' up. {{npc}} is payin' guards. Dangerous route through {{region}}.",
      "{{npc}} won't travel alone no more. Not after what happened at {{location}}. Needs an escort.",
    ],
    prevalence: 0.5,
    tags: ['escort', 'combat', 'travel'],
  },
  {
    id: 'rumor_quest_retrieve',
    category: 'quest_hook',
    textTemplates: [
      "{{npc}} lost somethin' precious out near {{location}}. Offerin' good coin to whoever brings it back.",
      "Heard there's a family heirloom went missin'. {{npc}} wants it found real bad.",
      '{{npc}} was robbed on the road to {{location}}. Wants their property back, no questions asked.',
    ],
    prevalence: 0.6,
    tags: ['retrieve', 'exploration'],
  },
  {
    id: 'rumor_quest_investigate',
    category: 'quest_hook',
    textTemplates: [
      "Strange goin's on at {{location}}. {{npc}} wants someone to look into it, quiet-like.",
      "{{npc}} thinks somethin' ain't right with the {{faction}}. Needs proof before goin' to the sheriff.",
      "Folks been disappearin' near {{location}}. {{npc}} is payin' for answers.",
    ],
    prevalence: 0.5,
    tags: ['investigation', 'mystery'],
  },
  {
    id: 'rumor_quest_collection',
    category: 'quest_hook',
    textTemplates: [
      "{{npc}} needs someone to collect a debt from a fella out at {{location}}. Might need persuadin'.",
      "There's back rent owed to {{npc}}. Previous collectors ain't come back.",
      '{{npc}} loaned money to the wrong sort. Now they need someone to get it back.',
    ],
    prevalence: 0.4,
    tags: ['collection', 'social'],
  },
  {
    id: 'rumor_quest_sabotage',
    category: 'quest_hook',
    textTemplates: [
      "{{npc}} wants the {{faction}}'s operation at {{location}} disrupted. Don't ask why.",
      "Heard {{npc}} is payin' handsomely to slow down the railroad. Political reasons.",
      "Someone's gotta stop what's happenin' at {{location}}. {{npc}} knows who's behind it.",
    ],
    prevalence: 0.3,
    tags: ['sabotage', 'faction'],
  },
  {
    id: 'rumor_quest_mining',
    category: 'quest_hook',
    textTemplates: [
      "The mine at {{location}} needs workers. {{npc}} is hirin' for dangerous work underground.",
      "{{npc}} struck somethin' in the old shaft. Needs help excavatin' before claim jumpers show.",
      "There's talk of a new vein at {{location}}. {{npc}} is puttin' together a crew.",
    ],
    prevalence: 0.5,
    tags: ['mining', 'labor'],
  },
  {
    id: 'rumor_quest_medicine',
    category: 'quest_hook',
    textTemplates: [
      "Doc {{npc}} needs rare herbs from up in {{location}}. It's for the sick folks in town.",
      "{{npc}}'s child is ailin'. Needs medicine from {{location}} and they're too old to fetch it.",
      "The fever's spreadin'. {{npc}} knows a cure but needs ingredients from the wilds.",
    ],
    prevalence: 0.4,
    tags: ['medicine', 'urgent'],
  },
  {
    id: 'rumor_quest_competition',
    category: 'quest_hook',
    textTemplates: [
      "{{npc}} is enterin' the shootin' competition. Needs a partner who can handle a gun.",
      "There's a horse race comin' up. {{npc}} is lookin' for a rider.",
      'Poker tournament at {{location}}. {{npc}} needs someone to watch their back.',
    ],
    prevalence: 0.4,
    tags: ['competition', 'social'],
  },
  {
    id: 'rumor_quest_rescue',
    category: 'quest_hook',
    textTemplates: [
      "{{npc}}'s kin got taken by bandits. They're holed up somewhere near {{location}}.",
      "Heard {{npc}} is offerin' everything they got to save their family from the {{faction}}.",
      "Someone's bein' held at {{location}}. {{npc}} needs help gettin' 'em out.",
    ],
    prevalence: 0.5,
    tags: ['rescue', 'combat', 'urgent'],
  },

  // -------------------------------------------------------------------------
  // LOCATION HINT (8+)
  // -------------------------------------------------------------------------
  {
    id: 'rumor_location_cache',
    category: 'location_hint',
    textTemplates: [
      "They say there's a hidden cache of {{treasure}} somewhere in {{location}}. Old prospector talked about it 'fore he died.",
      "If you're headin' to {{location}}, keep your eyes peeled. Somethin' valuable's buried there.",
      'My grandfather spoke of {{treasure}} hidden near {{location}}. Never found it himself.',
    ],
    prevalence: 0.5,
    tags: ['treasure', 'exploration'],
  },
  {
    id: 'rumor_location_shortcut',
    category: 'location_hint',
    textTemplates: [
      "There's a pass through {{location}} most folks don't know about. Cuts travel time in half.",
      'Old trail near {{location}} leads straight to {{destination}}. Rough going, but faster.',
      'The natives used a hidden path through {{region}}. Entrance is near {{landmark}}.',
    ],
    prevalence: 0.4,
    tags: ['travel', 'shortcut'],
  },
  {
    id: 'rumor_location_abandoned',
    category: 'location_hint',
    textTemplates: [
      "Ghost town out at {{location}}. Folks left in a hurry - didn't take everything with 'em.",
      "There's an abandoned mine at {{location}}. Previous owners hit somethin' and sealed it up.",
      'Old homestead near {{location}} been empty for years. Might still have supplies.',
    ],
    prevalence: 0.6,
    tags: ['abandoned', 'exploration'],
  },
  {
    id: 'rumor_location_water',
    category: 'location_hint',
    textTemplates: [
      "If you're crossin' the desert, there's a spring hidden at {{location}}. Could save your life.",
      "Water's scarce, but there's an oasis near {{landmark}}. Not on any map.",
      'Underground stream surfaces at {{location}}. Only ones who know are the old-timers.',
    ],
    prevalence: 0.5,
    tags: ['survival', 'water'],
  },
  {
    id: 'rumor_location_camp',
    category: 'location_hint',
    textTemplates: [
      'Travelers camp at {{location}}. Safe spot, good water, and you might hear useful talk.',
      "There's a waystation near {{location}}. {{npc}} runs it - honest folk.",
      'If you need rest on the road to {{destination}}, stop at {{location}}. Worth the detour.',
    ],
    prevalence: 0.5,
    tags: ['rest', 'travel'],
  },
  {
    id: 'rumor_location_view',
    category: 'location_hint',
    textTemplates: [
      "Climb up to {{location}} on a clear day. You can see for miles. Good for scoutin'.",
      "The mesa at {{location}} gives you a view of the whole valley. Useful to know what's comin'.",
      "There's a lookout point near {{landmark}}. Rangers used it during the wars.",
    ],
    prevalence: 0.3,
    tags: ['scouting', 'exploration'],
  },
  {
    id: 'rumor_location_meeting',
    category: 'location_hint',
    textTemplates: [
      "The {{faction}} been meetin' in secret at {{location}}. After dark, usually.",
      'If you want to find the black market, head to {{location}} around midnight.',
      "Smugglers use {{location}} for exchanges. Law don't go there.",
    ],
    prevalence: 0.4,
    tags: ['criminal', 'faction'],
  },
  {
    id: 'rumor_location_sacred',
    category: 'location_hint',
    textTemplates: [
      '{{location}} is sacred to the tribes. Treat it with respect if you go there.',
      "There's old magic at {{location}}. Or so the stories say. Healin' properties.",
      'The spirits watch over {{location}}. Some say prayers are answered there.',
    ],
    prevalence: 0.3,
    tags: ['sacred', 'mystery'],
  },

  // -------------------------------------------------------------------------
  // NPC GOSSIP (10+)
  // -------------------------------------------------------------------------
  {
    id: 'rumor_gossip_past',
    category: 'npc_gossip',
    textTemplates: [
      "{{npc}} ain't what they seem. Heard they {{secret}} back East before comin' here.",
      "Don't let {{npc}}'s demeanor fool ya. Word is they {{secret}}.",
      '{{npc}} changed their name when they came West. Used to be known for {{secret}}.',
    ],
    prevalence: 0.5,
    tags: ['secret', 'backstory'],
  },
  {
    id: 'rumor_gossip_affair',
    category: 'npc_gossip',
    textTemplates: [
      "{{npc}} been seen visitin' {{npc2}} after dark. Folks are talkin'.",
      "There's somethin' between {{npc}} and {{npc2}}. Everybody knows but pretends they don't.",
      "{{npc}}'s marriage ain't as solid as it looks. {{npc2}} is involved.",
    ],
    prevalence: 0.4,
    tags: ['romance', 'scandal'],
  },
  {
    id: 'rumor_gossip_money',
    category: 'npc_gossip',
    textTemplates: [
      "{{npc}} came into money recently. Suspicious, considerin' they were broke last month.",
      "Where'd {{npc}} get the coin for that new {{item}}? Ain't from honest work, I'll tell ya.",
      "{{npc}} been payin' in gold. Pure gold. Where's it comin' from?",
    ],
    prevalence: 0.5,
    tags: ['money', 'suspicious'],
  },
  {
    id: 'rumor_gossip_connection',
    category: 'npc_gossip',
    textTemplates: [
      "{{npc}} is connected to the {{faction}}. Don't let on that you know.",
      'Heard {{npc}} reports to someone in {{location}}. Might be a spy.',
      "{{npc}} ain't just a {{occupation}}. Got friends in high places.",
    ],
    prevalence: 0.4,
    tags: ['faction', 'spy'],
  },
  {
    id: 'rumor_gossip_skill',
    category: 'npc_gossip',
    textTemplates: [
      "{{npc}} is the best {{skill}} in three counties. Don't look like much, but trust me.",
      'If you need {{skill}}, talk to {{npc}}. Expensive, but worth every penny.',
      '{{npc}} learned {{skill}} from the best. Could teach you a thing or two.',
    ],
    prevalence: 0.5,
    tags: ['skill', 'helpful'],
  },
  {
    id: 'rumor_gossip_grudge',
    category: 'npc_gossip',
    textTemplates: [
      "{{npc}} and {{npc2}} got bad blood. Don't mention one to the other.",
      "There's a feud between {{npc}} and {{npc2}}. Goes back years.",
      "{{npc}} swore vengeance on {{npc2}}. Somethin' about a betrayal.",
    ],
    prevalence: 0.4,
    tags: ['conflict', 'feud'],
  },
  {
    id: 'rumor_gossip_illness',
    category: 'npc_gossip',
    textTemplates: [
      "{{npc}} ain't lookin' well lately. Keeps it quiet, but folks notice.",
      "Poor {{npc}}. Doc says it ain't good. Tryin' to get affairs in order.",
      "{{npc}} been coughin' somethin' fierce. Hope it ain't the consumption.",
    ],
    prevalence: 0.3,
    tags: ['illness', 'sympathy'],
  },
  {
    id: 'rumor_gossip_betrayal',
    category: 'npc_gossip',
    textTemplates: [
      "{{npc}} sold out their partners to the law. That's how they got clemency.",
      "Don't trust {{npc}}. They turned on {{npc2}} when times got tough.",
      "{{npc}} informed on the gang. How else you think they're walkin' free?",
    ],
    prevalence: 0.3,
    tags: ['betrayal', 'warning'],
  },
  {
    id: 'rumor_gossip_family',
    category: 'npc_gossip',
    textTemplates: [
      "{{npc}}'s got kin out in {{location}}. Don't talk about 'em though.",
      'Did you know {{npc}} and {{npc2}} are related? Cousins, I think.',
      "{{npc}} lost their whole family in the {{disaster}}. That's why they're the way they are.",
    ],
    prevalence: 0.4,
    tags: ['family', 'backstory'],
  },
  {
    id: 'rumor_gossip_wanted',
    category: 'npc_gossip',
    textTemplates: [
      "{{npc}} is wanted in another territory. Sheriff here don't know yet.",
      "That bounty poster in {{location}}? Pretty sure that's {{npc}}.",
      "{{npc}} been livin' under a false name. Law's catchin' up though.",
    ],
    prevalence: 0.3,
    tags: ['wanted', 'outlaw'],
  },

  // -------------------------------------------------------------------------
  // FACTION NEWS (8+)
  // -------------------------------------------------------------------------
  {
    id: 'rumor_faction_expansion',
    category: 'faction_news',
    textTemplates: [
      "The {{faction}} been makin' moves around {{region}}. Buyin' up property.",
      "{{faction}} is expandin' their operation. Hired new guns last week.",
      "Word is the {{faction}} got their eye on {{location}}. Movin' in soon.",
    ],
    prevalence: 0.6,
    tags: ['expansion', 'territory'],
  },
  {
    id: 'rumor_faction_conflict',
    category: 'faction_news',
    textTemplates: [
      "{{faction}} and {{faction2}} nearly came to blows at {{location}}. Tension's risin'.",
      "There's gonna be a war between {{faction}} and {{faction2}}. Mark my words.",
      "The {{faction}} killed one of {{faction2}}'s men. This ain't over.",
    ],
    prevalence: 0.5,
    tags: ['conflict', 'violence'],
  },
  {
    id: 'rumor_faction_leader',
    category: 'faction_news',
    textTemplates: [
      "{{npc}} is takin' over the {{faction}}. Old boss met an unfortunate end.",
      "The {{faction}}'s got new leadership. {{npc}} runs things now.",
      'Power struggle in the {{faction}}. {{npc}} came out on top.',
    ],
    prevalence: 0.4,
    tags: ['leadership', 'change'],
  },
  {
    id: 'rumor_faction_deal',
    category: 'faction_news',
    textTemplates: [
      "The {{faction}} made a deal with the {{faction2}}. Ain't good for regular folk.",
      "{{faction}} and {{faction2}} are workin' together now. Strange bedfellows.",
      "Heard the {{faction}} is sellin' information to {{faction2}}. Dangerous alliance.",
    ],
    prevalence: 0.4,
    tags: ['alliance', 'deal'],
  },
  {
    id: 'rumor_faction_recruitment',
    category: 'faction_news',
    textTemplates: [
      "The {{faction}} is recruitin'. If you got the stomach for it, they pay well.",
      "{{faction}} lost a lot of men at {{location}}. Lookin' for replacements.",
      'Want to join the {{faction}}? Talk to {{npc}}. But think hard before you do.',
    ],
    prevalence: 0.5,
    tags: ['recruitment', 'opportunity'],
  },
  {
    id: 'rumor_faction_crime',
    category: 'faction_news',
    textTemplates: [
      'The {{faction}} robbed the bank at {{location}}. Got away clean.',
      "{{faction}} been runnin' contraband through {{region}}. Sheriff's in their pocket.",
      "That train robbery? {{faction}}'s handiwork. Bold as brass.",
    ],
    prevalence: 0.5,
    tags: ['crime', 'heist'],
  },
  {
    id: 'rumor_faction_weakness',
    category: 'faction_news',
    textTemplates: [
      "The {{faction}}'s coffers are runnin' low. Desperate times for them.",
      "{{faction}} ain't as strong as they used to be. Vulnerable now.",
      "Their best gun, {{npc}}, left the {{faction}}. Things are fallin' apart.",
    ],
    prevalence: 0.4,
    tags: ['weakness', 'opportunity'],
  },
  {
    id: 'rumor_faction_secret',
    category: 'faction_news',
    textTemplates: [
      "The {{faction}}'s got a hideout nobody knows about. Somewhere in {{region}}.",
      "{{faction}} is hidin' somethin' at {{location}}. Guards there day and night.",
      "I know where the {{faction}} keeps their gold. But I ain't tellin' the law.",
    ],
    prevalence: 0.3,
    tags: ['secret', 'hideout'],
  },

  // -------------------------------------------------------------------------
  // WORLD EVENT (6+)
  // -------------------------------------------------------------------------
  {
    id: 'rumor_event_weather',
    category: 'world_event',
    textTemplates: [
      "Big storm comin' from the West. Seen the clouds buildin' over the mountains.",
      "Drought's gettin' worse. Wells are runnin' dry across {{region}}.",
      "Dust storms been blowin' in from the desert. Best stay indoors when they hit.",
    ],
    prevalence: 0.6,
    tags: ['weather', 'warning'],
  },
  {
    id: 'rumor_event_railroad',
    category: 'world_event',
    textTemplates: [
      "Railroad's expandin' to {{location}}. Gonna change everything around here.",
      "They're layin' new track through {{region}}. Towns that ain't on the line will dry up.",
      "Steam Pacific's surveyin' routes. Might come through here if we're lucky.",
    ],
    prevalence: 0.5,
    tags: ['railroad', 'progress'],
  },
  {
    id: 'rumor_event_gold',
    category: 'world_event',
    textTemplates: [
      "Gold strike up at {{location}}! Folks are already floodin' in.",
      "They found a new vein in {{region}}. Biggest since '49.",
      "Silver deposit discovered near {{location}}. Boom's comin'.",
    ],
    prevalence: 0.4,
    tags: ['mining', 'gold_rush'],
  },
  {
    id: 'rumor_event_epidemic',
    category: 'world_event',
    textTemplates: [
      "Sickness spreadin' through {{location}}. Folks are quarantinin'.",
      'Cholera broke out at the mining camp. Stay away from {{location}}.',
      "The fever's takin' folks in {{region}}. Doc's overwhelmed.",
    ],
    prevalence: 0.3,
    tags: ['disease', 'danger'],
  },
  {
    id: 'rumor_event_law',
    category: 'world_event',
    textTemplates: [
      "New marshal's comin' to clean up {{region}}. Backed by federal authority.",
      "Martial law declared in {{location}}. Army's movin' in.",
      "The governor's sendin' Rangers to deal with the outlaw problem.",
    ],
    prevalence: 0.4,
    tags: ['law', 'authority'],
  },
  {
    id: 'rumor_event_migration',
    category: 'world_event',
    textTemplates: [
      'Big wagon train headed through next week. Hundreds of families.',
      "Settlers are abandonin' {{location}}. Headin' further West.",
      "New immigrants arrivin' by the trainload. Town's gonna double in size.",
    ],
    prevalence: 0.5,
    tags: ['migration', 'population'],
  },
  {
    id: 'rumor_event_territory',
    category: 'world_event',
    textTemplates: [
      "Territory's applyin' for statehood. Things gonna change around here.",
      "Federal surveyors been through. Redrawin' the borders.",
      "Land grants bein' issued in {{region}}. First come, first served.",
    ],
    prevalence: 0.3,
    tags: ['political', 'land'],
  },

  // -------------------------------------------------------------------------
  // TREASURE HINT (4+)
  // -------------------------------------------------------------------------
  {
    id: 'rumor_treasure_outlaw',
    category: 'treasure_hint',
    textTemplates: [
      'Old {{outlaw}} buried their take somewhere near {{landmark}}. Never recovered.',
      "The {{gang}} hid their loot before the hangin'. Map's lost, but the gold's still there.",
      "{{outlaw}}'s gang split up. One of 'em buried the strongbox near {{location}}.",
    ],
    linkedLocationId: 'treasure_site',
    prevalence: 0.3,
    tags: ['treasure', 'outlaw'],
  },
  {
    id: 'rumor_treasure_mine',
    category: 'treasure_hint',
    textTemplates: [
      "There's a played-out mine at {{location}}. But they missed a vein. I'd bet my life on it.",
      'The Spaniards had a mine somewhere in {{region}}. Never mapped, never found.',
      'Old prospector died with a nugget big as your fist. Never said where he found it.',
    ],
    prevalence: 0.4,
    tags: ['treasure', 'mining'],
  },
  {
    id: 'rumor_treasure_cache',
    category: 'treasure_hint',
    textTemplates: [
      "Army payroll went missin' during the war. Wagon was found empty near {{location}}.",
      'Stagecoach got robbed ten years back. Money was never spent. Still hidden somewhere.',
      'Bank shipment vanished between {{location}} and {{destination}}. Driver never talked.',
    ],
    prevalence: 0.3,
    tags: ['treasure', 'historical'],
  },
  {
    id: 'rumor_treasure_artifact',
    category: 'treasure_hint',
    textTemplates: [
      'Native tribes had sacred gold at {{location}}. Hidden it from the conquistadors.',
      "There's a relic in the old mission. Priests hid it when the raiders came.",
      'Ancient burial site in {{region}}. Grave goods still there, but cursed, they say.',
    ],
    prevalence: 0.2,
    tags: ['treasure', 'artifact', 'sacred'],
  },

  // -------------------------------------------------------------------------
  // DANGER WARNING (6+)
  // -------------------------------------------------------------------------
  {
    id: 'rumor_danger_bandits',
    category: 'danger_warning',
    textTemplates: [
      "Don't go near {{location}} - full of bandits. They'll take everything you got.",
      "The road through {{region}} ain't safe. Outlaws hit three wagons last month.",
      "{{location}} is bandit territory. Even the law won't go there.",
    ],
    prevalence: 0.6,
    tags: ['bandits', 'combat'],
  },
  {
    id: 'rumor_danger_wildlife',
    category: 'danger_warning',
    textTemplates: [
      'Mountain lions been spotted near {{location}}. Lost two cattle last week.',
      "Rattlesnake den at {{location}}. Biggest nest anyone's ever seen.",
      "There's a grizzly in {{region}} that's killed three men. Hunters can't bring it down.",
    ],
    prevalence: 0.5,
    tags: ['wildlife', 'nature'],
  },
  {
    id: 'rumor_danger_terrain',
    category: 'danger_warning',
    textTemplates: [
      'Quicksand at {{location}}. Swallowed a whole mule. Stay on the marked path.',
      "The canyon at {{location}} floods without warning. Don't camp there.",
      'Old mine shafts all through {{region}}. Ground can give way under your feet.',
    ],
    prevalence: 0.4,
    tags: ['terrain', 'hazard'],
  },
  {
    id: 'rumor_danger_supernatural',
    category: 'danger_warning',
    textTemplates: [
      "Folks who go to {{location}} at night don't come back right. Somethin's wrong there.",
      "There's evil at the old cemetery. Lights where there shouldn't be. Sounds too.",
      "{{location}} is haunted. I don't care what you believe - stay away.",
    ],
    prevalence: 0.3,
    tags: ['supernatural', 'mystery'],
  },
  {
    id: 'rumor_danger_hostile',
    category: 'danger_warning',
    textTemplates: [
      '{{faction}} controls {{location}}. They shoot strangers on sight.',
      "The folks at {{location}} don't take kindly to outsiders. Lost a friend there.",
      "Stay away from {{npc}}'s territory unless you want trouble.",
    ],
    prevalence: 0.5,
    tags: ['hostile', 'faction'],
  },
  {
    id: 'rumor_danger_disease',
    category: 'danger_warning',
    textTemplates: [
      "Water at {{location}} will make you sick. Somethin' dead upstream.",
      "Don't eat nothin' from {{location}}. The soil's poisoned from the old smelter.",
      "Mining camp at {{location}} got the fever. They're turnin' people away.",
    ],
    prevalence: 0.4,
    tags: ['disease', 'contamination'],
  },

  // -------------------------------------------------------------------------
  // HISTORY (4+)
  // -------------------------------------------------------------------------
  {
    id: 'rumor_history_battle',
    category: 'history',
    textTemplates: [
      'Big battle happened at {{location}} during the war. Still find bones out there.',
      'The cavalry made their last stand near {{landmark}}. Graves are unmarked.',
      '{{location}} was the site of the massacre. Nobody settles there now.',
    ],
    prevalence: 0.4,
    tags: ['war', 'historical'],
  },
  {
    id: 'rumor_history_founding',
    category: 'history',
    textTemplates: [
      "This town was founded by {{npc}}'s grandfather. Built it from nothing.",
      '{{location}} used to be a mission. Padre still haunts the old chapel, they say.',
      "Before the settlers came, {{region}} belonged to the tribes. We're guests here.",
    ],
    prevalence: 0.5,
    tags: ['founding', 'local'],
  },
  {
    id: 'rumor_history_disaster',
    category: 'history',
    textTemplates: [
      "The great fire of '72 burned half the town. Some folks never rebuilt.",
      'Flood took out {{location}} twenty years back. River changed course after.',
      'Mine collapse at {{location}} killed forty men. Owners never paid the families.',
    ],
    prevalence: 0.4,
    tags: ['disaster', 'tragedy'],
  },
  {
    id: 'rumor_history_legend',
    category: 'history',
    textTemplates: [
      "{{npc}} was the fastest gun in the territory. Killed twenty men before retirin'.",
      "The great train robbery of '68 started right here. Never caught the gang.",
      "First steam engine came through {{location}} in '71. Folks thought it was a dragon.",
    ],
    prevalence: 0.4,
    tags: ['legend', 'famous'],
  },

  // -------------------------------------------------------------------------
  // PERSONAL (4+)
  // -------------------------------------------------------------------------
  {
    id: 'rumor_personal_loss',
    category: 'personal',
    textTemplates: [
      "{{npc}} lost their whole family to the fever. That's why they drink.",
      "Don't mention the war around {{npc}}. Lost three brothers at {{location}}.",
      '{{npc}} was married once. Spouse died in childbirth. Never been the same.',
    ],
    prevalence: 0.3,
    tags: ['tragedy', 'backstory'],
  },
  {
    id: 'rumor_personal_dream',
    category: 'personal',
    textTemplates: [
      "{{npc}} is savin' up to buy a ranch. Been dreamin' of it for years.",
      'All {{npc}} wants is to find their missing kin and go home.',
      "{{npc}}'s got plans to strike it rich and head back East. Show 'em all.",
    ],
    prevalence: 0.4,
    tags: ['ambition', 'personal'],
  },
  {
    id: 'rumor_personal_secret_skill',
    category: 'personal',
    textTemplates: [
      "{{npc}} can read and write in three languages. Don't look it, but it's true.",
      "Before comin' West, {{npc}} was a doctor. Still got the skills.",
      '{{npc}} is a crack shot. Won medals in the army.',
    ],
    prevalence: 0.4,
    tags: ['skill', 'hidden'],
  },
  {
    id: 'rumor_personal_kindness',
    category: 'personal',
    textTemplates: [
      "{{npc}} may seem rough, but they took in three orphans. Raisin' 'em as their own.",
      'When the mine collapsed, {{npc}} spent their savings on the widows. Never talks about it.',
      '{{npc}} always leaves food for the hungry. Does it quiet, so nobody knows.',
    ],
    prevalence: 0.4,
    tags: ['kindness', 'virtue'],
  },
];

// ============================================================================
// LORE FRAGMENTS
// ============================================================================

export const LORE_FRAGMENTS: LoreFragment[] = [
  // -------------------------------------------------------------------------
  // HISTORY (6+)
  // -------------------------------------------------------------------------
  {
    id: 'lore_history_steam_rush',
    category: 'history',
    title: 'The Great Steam Rush',
    text: `In the year 1849, the discovery of steam-reactive minerals in the Sierra Nevada changed the frontier forever. Unlike ordinary gold, these crystalline deposits could power the new generation of clockwork machinery that was revolutionizing the East.

Within months, thousands poured westward seeking fortune. Boomtowns sprang up overnight around major deposits. The rush brought inventors, engineers, and dreamers alongside the prospectors and desperados.

The Steam Rush created the fortunes that built the great railroad companies and established the industrial barons who still control much of the territory today.`,
    relatedIds: ['faction_railroad', 'region_mountains'],
    discoveryMethod: 'book',
    tags: ['founding', 'steam', 'prosperity'],
  },
  {
    id: 'lore_history_railroad_wars',
    category: 'history',
    title: 'The Railroad Wars',
    text: `From 1868 to 1872, the great railroad companies fought for dominance of the western routes. It began with competing surveys and land claims, but soon escalated to sabotage, hired guns, and outright battles between company militias.

The Steam Pacific and Iron Mountain lines clashed repeatedly at junction points and valuable passes. Towns caught between them were forced to choose sides or face destruction.

The wars ended only when federal troops intervened and the Pacific Consolidation Act forced the merger of the major lines. But bad blood remains, and some say the companies still settle scores when the law isn't looking.`,
    relatedIds: ['faction_railroad', 'faction_iron_mountain'],
    discoveryMethod: 'dialogue',
    tags: ['conflict', 'railroad', 'corporate'],
  },
  {
    id: 'lore_history_native_displacement',
    category: 'history',
    title: 'The Trail of Broken Promises',
    text: `Before the settlers came, dozens of tribes called these lands home. They had lived in balance with the harsh landscape for generations, knowing its secrets and respecting its spirits.

The arrival of steam technology changed everything. Sacred sites containing the minerals needed for clockwork machinery were seized. Treaties were signed and broken. Resistance was met with overwhelming force.

Now the surviving tribes live on reservation lands deemed worthless by the mining companies. But they remember. And they know things about this land that the newcomers have yet to learn.`,
    relatedIds: ['faction_tribes', 'region_sacred_lands'],
    discoveryMethod: 'exploration',
    tags: ['tragedy', 'native', 'displacement'],
  },
  {
    id: 'lore_history_crimson_winter',
    category: 'history',
    title: 'The Crimson Winter of 1876',
    text: `They call it the Crimson Winter because of the blood that stained the snow across three territories. It began when the mining companies cut wages and the workers organized.

Strike camps formed at every major operation. The companies brought in private militias and automatons. Shots were fired at the Copper Creek demonstration, and everything spiraled from there.

By spring, hundreds were dead on both sides. The companies won, but at a cost. To this day, labor organizing is met with swift and brutal response. And in the mining towns, they still tell stories of the martyrs who fell.`,
    relatedIds: ['faction_miners', 'location_copper_creek'],
    discoveryMethod: 'dialogue',
    tags: ['conflict', 'labor', 'tragedy'],
  },
  {
    id: 'lore_history_automaton_uprising',
    category: 'history',
    title: 'The Brass Rebellion',
    text: `In 1871, a malfunction in the central cogitation engine of the Thornton Mining Company's automaton workforce led to what historians call the Brass Rebellion. For three days, mining automatons refused commands and barricaded themselves in the main shaft.

Some claimed the machines had achieved true consciousness and were demanding rights. Others said it was merely a cascading logic error. The company sealed the shaft and flooded it with steam.

Whatever the truth, automaton design was changed after that incident. Modern units have fail-safes and loyalty constraints built into their core gearing. But some engineers whisper that consciousness cannot be engineered away forever.`,
    relatedIds: ['faction_engineers', 'creature_automaton'],
    discoveryMethod: 'book',
    tags: ['technology', 'automaton', 'mystery'],
  },
  {
    id: 'lore_history_territorial_founding',
    category: 'history',
    title: 'Founding of the Territory',
    text: `The Iron Frontier Territory was established by federal charter in 1858, carved from lands claimed by Mexico and purchased in the wake of the war. The first territorial governor, Josiah Blackwood, was tasked with bringing order to a lawless land.

Blackwood established the territorial capital at Summit City and created the Ranger service to enforce federal law beyond town limits. His tenure saw the first major railroad completed and the establishment of the federal assay offices that still regulate the steam-mineral trade.

Blackwood died under mysterious circumstances in 1867, and the territory has been under provisional governance ever since, its statehood perpetually delayed by political maneuvering in the capital.`,
    relatedIds: ['faction_rangers', 'location_summit_city'],
    discoveryMethod: 'automatic',
    tags: ['founding', 'politics', 'territory'],
  },

  // -------------------------------------------------------------------------
  // LEGEND (5+)
  // -------------------------------------------------------------------------
  {
    id: 'lore_legend_ghost_engineer',
    category: 'legend',
    title: 'The Ghost Engineer',
    text: `They say on moonless nights, you can hear the whistle of a phantom train echoing through the canyons. It's the Ghost Engineer, forever running the line he died building.

Ezekiel Stone was the chief engineer on the original trans-territorial route. When the company demanded he cut through sacred ground, he refused. They replaced him, and the new route claimed dozens of lives in a tunnel collapse.

Stone was killed trying to rescue workers from the disaster. Now his spirit rides an engine made of mist and starlight, warning travelers of danger on the rails. Those who see him are either blessed with safe journey or cursed to die within the year, depending on who tells the tale.`,
    relatedIds: ['faction_railroad', 'region_canyons'],
    discoveryMethod: 'dialogue',
    tags: ['ghost', 'railroad', 'supernatural'],
  },
  {
    id: 'lore_legend_clockwork_heart',
    category: 'legend',
    title: 'The Man with the Clockwork Heart',
    text: `The old-timers speak of a wandering gunfighter who cannot die. They call him the Man with the Clockwork Heart, for where his chest should beat with flesh, there ticks instead an engine of brass and crystal.

Some say he was a soldier, mortally wounded in the wars, rebuilt by a mad inventor who sought to conquer death itself. Others claim he made a deal with something ancient in the desert, trading his humanity for eternal vengeance.

He appears when great injustice is done, they say, and those who cross him find that bullets pass through him like smoke. He has been seen at a dozen massacres, always on the side of the wronged, never speaking, never stopping until the last oppressor falls.`,
    relatedIds: ['item_clockwork_heart'],
    discoveryMethod: 'dialogue',
    tags: ['supernatural', 'gunfighter', 'justice'],
  },
  {
    id: 'lore_legend_lost_spanish_gold',
    category: 'legend',
    title: 'The Lost Cathedral of Gold',
    text: `Before the Americans came, before even the Mexican settlers, Spanish conquistadors carved a secret cathedral into the heart of the mountains. Within, they say, lies enough gold to buy an empire.

The location was known only to the priests who served there, mining native labor until rebellion claimed them all. The sole survivor, a young friar, drew a map on his deathbed, but the document was lost in a fire a century later.

Pieces of the map surface from time to time, sending treasure hunters into the wilderness. Few return. Those who do speak of ancient traps, guardian spirits, and glimpses of golden light deep within impossible caves.`,
    relatedIds: ['region_mountains', 'location_lost_cathedral'],
    discoveryMethod: 'book',
    tags: ['treasure', 'spanish', 'mystery'],
  },
  {
    id: 'lore_legend_devil_mesa',
    category: 'legend',
    title: "The Devil's Bargain at Red Mesa",
    text: `Red Mesa rises from the desert like an altar to something older than humanity. The tribes avoided it for generations, calling it the Place Where Promises Are Kept.

Legend holds that desperate souls can climb to the mesa's peak and call out their deepest desire. Something will answer. Something will offer a deal. The price is never what you expect, and the consequences ripple for generations.

A rancher who bargained for rain saw his lands flooded and his family drowned. A gunfighter who asked for unbeatable skill found himself compelled to duel everyone he met until he begged for death. Yet still the desperate climb, for the power is real, even if the cost is beyond imagining.`,
    relatedIds: ['location_red_mesa'],
    discoveryMethod: 'exploration',
    tags: ['supernatural', 'desert', 'bargain'],
  },
  {
    id: 'lore_legend_iron_coyote',
    category: 'legend',
    title: 'The Iron Coyote',
    text: `When the first steam engines came to the frontier, the tribal shamans saw something the engineers did not. The spirit of Coyote, the trickster, had found a new form.

The Iron Coyote is said to inhabit machines that develop quirks and personalities. An engine that runs on the wrong fuel. A clockwork that winds itself. An automaton that disobeys at the most inconvenient moment.

The wise know that the Iron Coyote can be appeased with offerings of fine oil and polished gears left at crossroads. Those who mock the old ways may find their most reliable equipment failing at the worst possible time, and swear they can hear laughter in the grinding gears.`,
    relatedIds: ['faction_tribes', 'creature_automaton'],
    discoveryMethod: 'dialogue',
    tags: ['supernatural', 'trickster', 'technology'],
  },

  // -------------------------------------------------------------------------
  // FACTION LORE (5+)
  // -------------------------------------------------------------------------
  {
    id: 'lore_faction_railroad',
    category: 'faction_lore',
    title: 'Steam Pacific Railroad',
    text: `The Steam Pacific Railroad Company emerged victorious from the Railroad Wars to become the dominant transportation power in the territory. Their iron lines connect every major settlement, and their steam-powered locomotives move people and goods across vast distances.

But the company is more than a transportation network. They own vast tracts of land, operate their own private security force, and have politicians on payroll from the territorial legislature to the federal capital.

Workers and settlers have learned that crossing the Railroad means facing eviction, blacklisting, and worse. Yet without them, the frontier would collapse into isolated settlements. They are both lifeline and noose.`,
    relatedIds: ['faction_railroad'],
    discoveryMethod: 'automatic',
    tags: ['faction', 'corporate', 'power'],
  },
  {
    id: 'lore_faction_rangers',
    category: 'faction_lore',
    title: 'The Territorial Rangers',
    text: `When the federal government established the territory, they knew that marshals alone could not bring law to such a vast and wild land. The Territorial Rangers were created to ride where others could not, bringing justice to the lawless frontier.

Each Ranger operates with near-complete autonomy, empowered to pursue criminals across county and even territorial lines. They answer only to the Chief Marshal in Summit City and, ultimately, to federal authority.

The Rangers have a reputation for incorruptibility in a land where every other authority can be bought. This makes them heroes to some and dangerous obstacles to others. More than one Ranger has been found dead in the wilderness, their killer never identified.`,
    relatedIds: ['faction_rangers'],
    discoveryMethod: 'dialogue',
    tags: ['faction', 'law', 'justice'],
  },
  {
    id: 'lore_faction_outlaws',
    category: 'faction_lore',
    title: 'The Crimson Riders',
    text: `The Crimson Riders began as labor organizers driven underground after the Crimson Winter. When legal means of change were crushed, they turned to robbery, targeting railroad payrolls and company shipments.

Over the years, the Riders have evolved into something between political movement and criminal enterprise. They redistribute some of their take to struggling workers and their families, earning loyalty in mining towns across the territory.

The Railroad and the Rangers hunt them relentlessly, but the Riders have sympathizers everywhere. A farmer who lets them water their horses. A telegraph operator who sends warnings. A sheriff who looks the other way. They survive because the people they claim to fight for protect them.`,
    relatedIds: ['faction_outlaws', 'faction_miners'],
    discoveryMethod: 'dialogue',
    tags: ['faction', 'outlaw', 'rebellion'],
  },
  {
    id: 'lore_faction_engineers',
    category: 'faction_lore',
    title: 'The Artificer Guild',
    text: `The Artificer Guild controls the knowledge of steam technology. Every legitimate engineer, clockwork designer, and automaton builder holds membership, and the Guild guards its secrets jealously.

Guild workshops are the only places where new steam technology can be legally developed and sold. Their certification process is rigorous, and working without it means facing both legal persecution and professional exile.

But the Guild's monopoly breeds resentment. Independent inventors chafe at restrictions that seem designed to benefit established members. Rumors persist of suppressed technologies and promising inventions that threatened powerful interests within the Guild.`,
    relatedIds: ['faction_engineers'],
    discoveryMethod: 'dialogue',
    tags: ['faction', 'technology', 'guild'],
  },
  {
    id: 'lore_faction_church',
    category: 'faction_lore',
    title: 'The New Covenant Church',
    text: `When steam power transformed the world, traditional faiths struggled to explain God's role in an age of machinery. The New Covenant Church arose to fill that void, teaching that steam technology is a divine gift meant to redeem a fallen world.

The Church operates missions and schools across the frontier, providing education and charity where government fails. Their priests bless new machines and console those displaced by progress, preaching that the righteous will inherit the mechanical paradise to come.

Critics accuse them of being too close to the industrial powers, blessing exploitation as divine will. But for many settlers, the Church is the only institution that cares for their souls in a harsh land.`,
    relatedIds: ['faction_church'],
    discoveryMethod: 'automatic',
    tags: ['faction', 'religion', 'technology'],
  },

  // -------------------------------------------------------------------------
  // LOCATION LORE (4+)
  // -------------------------------------------------------------------------
  {
    id: 'lore_location_summit_city',
    category: 'location_lore',
    title: 'Summit City - The Iron Capital',
    text: `Summit City sits at the highest point of the central pass, where three railroad lines converge. It is the territorial capital in law and the center of power in practice.

The city is a study in contrasts. Grand Victorian buildings house the territorial legislature and the offices of the great companies. But in their shadow sprawl tent cities of workers, transients, and those displaced by progress.

The Governor's Palace dominates the skyline, its steam-powered clock tower visible for miles. Within, the political games that shape the territory are played out daily, as railroad barons, mining interests, and reformers vie for control of the frontier's future.`,
    relatedIds: ['location_summit_city'],
    discoveryMethod: 'automatic',
    tags: ['capital', 'politics', 'urban'],
  },
  {
    id: 'lore_location_dead_mule_gulch',
    category: 'location_lore',
    title: 'Dead Mule Gulch - The Wound That Never Heals',
    text: `Dead Mule Gulch was once called Promise Valley, one of the first settlements in the territory. It died in a single night when the Thornton Mining Company's tailings dam collapsed.

A wall of toxic sludge swept through the valley, killing over three hundred people and poisoning the land for generations. The company paid minimal compensation and the disaster was covered up by compliant newspapers.

Now the gulch is a wasteland. Nothing grows there. The ruins of buildings poke through crusted earth. Travelers avoid it, saying the ghosts of the dead cry out for justice. But occasionally, fortune hunters brave the contaminated zone, for the company never recovered all the gold that washed downstream.`,
    relatedIds: ['location_dead_mule_gulch', 'faction_miners'],
    discoveryMethod: 'exploration',
    tags: ['disaster', 'tragedy', 'haunted'],
  },
  {
    id: 'lore_location_whispering_caves',
    category: 'location_lore',
    title: 'The Whispering Caves of Echo Ridge',
    text: `The caves at Echo Ridge were sacred to the native tribes long before settlers arrived. They believed the caves were a gateway to the spirit world, where the voices of ancestors could still be heard.

When prospectors explored the caves seeking minerals, they reported strange phenomena. Whispers in unknown languages. Visions of people who weren't there. Equipment that malfunctioned inexplicably.

The tribes say the spirits are angry at the desecration of their sacred space. The Artificer Guild claims unusual mineral deposits create acoustic and electromagnetic anomalies. Whatever the truth, those who venture deep into the caves are changed by the experience, and some never return at all.`,
    relatedIds: ['location_whispering_caves', 'faction_tribes'],
    discoveryMethod: 'exploration',
    tags: ['sacred', 'supernatural', 'mystery'],
  },
  {
    id: 'lore_location_rust_town',
    category: 'location_lore',
    title: 'Rust Town - Where Machines Go to Die',
    text: `In the shadow of the great smelting works lies Rust Town, an ever-growing graveyard of broken machinery. When steam engines fail, when clockwork winds down, when automatons cease to function, they end up here.

The town that grew around this mechanical cemetery is home to scavengers and salvagers who pick through the ruins for valuable components. It's dirty, dangerous work, but for those with no other options, it's a living.

The Artificer Guild officially prohibits the sale of salvaged parts, but in Rust Town, anything can be bought for the right price. Inventors barred from legitimate workshops come here to build their forbidden dreams. And sometimes, among the rusted hulks, something stirs that wasn't supposed to work anymore.`,
    relatedIds: ['location_rust_town', 'creature_automaton'],
    discoveryMethod: 'exploration',
    tags: ['industrial', 'poverty', 'salvage'],
  },

  // -------------------------------------------------------------------------
  // ITEM LORE (3+)
  // -------------------------------------------------------------------------
  {
    id: 'lore_item_judges_pistol',
    category: 'item_lore',
    title: "The Judge's Pistol",
    text: `In the lawless years before the Rangers, Judge Ezra Matthias brought order to the frontier with nothing but his wits and a specially crafted steam-pistol. The weapon, made by the finest artificers of the age, never needed to be cleaned and never missed its mark.

When Matthias died, the pistol vanished. Some say it was buried with him in an unmarked grave. Others claim it was stolen by the very outlaws he'd brought to justice.

Legends hold that the pistol can only be fired by one who truly seeks justice, not vengeance. In the wrong hands, it will misfire. But for the righteous, it grants unerring aim and the authority to judge the guilty.`,
    relatedIds: ['item_judges_pistol'],
    discoveryMethod: 'book',
    tags: ['weapon', 'legendary', 'justice'],
  },
  {
    id: 'lore_item_compass_of_whispers',
    category: 'item_lore',
    title: 'The Compass of Whispers',
    text: `The Compass of Whispers was said to be crafted by a tribal shaman who had mastered the secrets of both spiritual power and steam technology. Instead of pointing north, it points toward whatever the holder truly desires.

The compass was last seen in the possession of the outlaw Belle Morrow, who used it to find the legendary Lost Cathedral of Gold. She was never seen again.

Those who seek the compass should beware. It does not distinguish between desire and need, and it has led many to their doom. The compass shows you what you want, not what you should have.`,
    relatedIds: ['item_compass_whispers', 'lore_legend_lost_spanish_gold'],
    discoveryMethod: 'quest',
    tags: ['artifact', 'navigation', 'danger'],
  },
  {
    id: 'lore_item_peacemakers_badge',
    category: 'item_lore',
    title: "The First Peacemaker's Badge",
    text: `When the Territorial Rangers were founded, the first Chief Marshal forged a special badge from metal salvaged from weapons surrendered by former outlaws. It became a symbol of redemption and justice.

The badge passed from Chief Marshal to Chief Marshal until it was lost during the Railroad Wars. Both sides sought it, knowing its symbolic power, but it was never recovered.

Legend says the badge grants its wearer protection from ambush and betrayal, for it carries the accumulated honor of every lawman who wore it. But it also carries their burden, and weighs heavily on those unworthy of its legacy.`,
    relatedIds: ['item_peacemaker_badge', 'faction_rangers'],
    discoveryMethod: 'dialogue',
    tags: ['badge', 'legendary', 'protection'],
  },

  // -------------------------------------------------------------------------
  // PERSON LORE (4+)
  // -------------------------------------------------------------------------
  {
    id: 'lore_person_blackwood',
    category: 'person_lore',
    title: 'Governor Josiah Blackwood',
    text: `Josiah Blackwood was appointed first territorial governor with a mandate to bring civilization to the frontier. A former military officer and diplomat, he was known for his vision and his ruthlessness.

Under Blackwood, the railroad came, the Rangers were founded, and the territory transformed from lawless wilderness to functioning society. But he also authorized the forced relocation of native tribes and the violent suppression of labor organizing.

His death in 1867 remains officially unsolved. He was found in his study, doors locked from inside, with no visible wounds. Some say he was killed by dark arts practiced by those he wronged. Others whisper that he faked his death and watches still from the shadows.`,
    relatedIds: ['location_summit_city', 'faction_rangers'],
    discoveryMethod: 'book',
    tags: ['founder', 'politics', 'mystery'],
  },
  {
    id: 'lore_person_belle_morrow',
    category: 'person_lore',
    title: 'Belle Morrow - The Copper Queen',
    text: `Belle Morrow started as a dance hall girl in a mining camp. Within ten years, she owned the mine, the town, and most of the surrounding territory. They called her the Copper Queen, and she ruled her domain with charm and cold steel.

She was a contradiction: ruthless in business but generous to her workers. She funded schools and hospitals while crushing competitors through sabotage and bribery. When the Railroad tried to acquire her holdings, she fought them to a standstill.

At the height of her power, she vanished during an expedition into the mountains, seeking the Lost Cathedral of Gold. Whether she found it or met her end trying, none can say. But her fortune was never found.`,
    relatedIds: ['faction_miners', 'lore_legend_lost_spanish_gold'],
    discoveryMethod: 'dialogue',
    tags: ['legendary', 'business', 'mystery'],
  },
  {
    id: 'lore_person_singing_wolf',
    category: 'person_lore',
    title: 'Singing Wolf - The Last War Chief',
    text: `When the tribes resisted displacement, Singing Wolf united the scattered bands into a force that fought the army to a standstill for three years. A brilliant tactician, he knew the land in ways the invaders never could.

His tactics combined traditional warfare with captured steam technology, turning the settlers' weapons against them. For a time, it seemed the tribes might actually win.

The end came through betrayal, not defeat. A trusted advisor sold Singing Wolf's location to the army. He died fighting, taking thirty soldiers with him. His body was never recovered, and some say he still rides the high country, preparing for a battle that has not yet come.`,
    relatedIds: ['faction_tribes', 'lore_history_native_displacement'],
    discoveryMethod: 'dialogue',
    tags: ['hero', 'resistance', 'legendary'],
  },
  {
    id: 'lore_person_doctor_cogsworth',
    category: 'person_lore',
    title: 'Doctor Helena Cogsworth',
    text: `Doctor Helena Cogsworth was the first woman admitted to the Artificer Guild, breaking barriers that had stood since its founding. Her innovations in medical steam-technology saved thousands of lives across the frontier.

Her greatest achievement was the Cogsworth Heart, a mechanical replacement for the human organ that could keep a patient alive indefinitely. The procedure was rare and expensive, but it represented a triumph over mortality itself.

She disappeared during an expedition to study the Whispering Caves, seeking what she called "the frequency of life itself." Her notes, recovered later, described discoveries that the Guild immediately classified. They remain sealed to this day.`,
    relatedIds: ['faction_engineers', 'item_clockwork_heart', 'location_whispering_caves'],
    discoveryMethod: 'book',
    tags: ['inventor', 'pioneer', 'mystery'],
  },

  // -------------------------------------------------------------------------
  // CREATURE LORE (2+)
  // -------------------------------------------------------------------------
  {
    id: 'lore_creature_automaton',
    category: 'creature_lore',
    title: 'Steam Automatons',
    text: `Steam automatons are the mechanical servants of the frontier, performing labor too dangerous or tedious for human workers. From mining drones to railway maintenance units, they have become essential to the territory's economy.

Modern automatons are built with strict behavioral constraints, lessons learned from the Brass Rebellion of 1871. Their cogitation engines can process simple commands but are incapable of true independent thought. Or so the Guild assures us.

Workers have long reported that some automatons develop quirks over time. Preferences for certain tasks. Reluctance to be decommissioned. Even what might be called attachment to specific humans. The Guild insists these are mere mechanical wear patterns. But in the darkness of the mines, some swear the machines whisper to each other.`,
    relatedIds: ['faction_engineers', 'lore_history_automaton_uprising'],
    discoveryMethod: 'automatic',
    tags: ['technology', 'automaton', 'mystery'],
  },
  {
    id: 'lore_creature_dust_devils',
    category: 'creature_lore',
    title: 'The Dust Devils of the Wastes',
    text: `The native tribes speak of spirits that dwell in the desert whirlwinds, ancient beings of sand and spite who prey on travelers foolish enough to brave the wastes alone.

Settlers dismissed these stories as superstition until the bodies started appearing. Travelers found stripped of flesh, their bones scoured clean by sand, in patterns no natural storm could explain.

The Artificer Guild theorizes a previously unknown form of electrical phenomenon in the mineral-rich desert air. The tribes say the Dust Devils are the angry ghosts of those who died of thirst, eternally seeking to share their fate. Regardless of the truth, wise travelers never cross the wastes alone, and always carry offerings of water to pour upon the sand.`,
    relatedIds: ['region_desert'],
    discoveryMethod: 'dialogue',
    tags: ['supernatural', 'desert', 'danger'],
  },

  // -------------------------------------------------------------------------
  // TECHNOLOGY LORE (3+)
  // -------------------------------------------------------------------------
  {
    id: 'lore_tech_steam_crystal',
    category: 'technology_lore',
    title: 'Steam-Reactive Crystals',
    text: `The foundation of all steam technology is the steam-reactive crystal, a mineral found only in certain mountain formations. When exposed to pressurized steam, these crystals generate consistent electromagnetic energy that can power mechanical devices for years.

The exact mechanism remains poorly understood, even by Guild artificers. The crystals seem to convert thermal energy into electrical current with near-perfect efficiency, a feat that should be impossible according to conventional physics.

Theories abound. Some claim the crystals are remnants of an ancient civilization. Others suggest they are biological in origin, perhaps fossilized organs of creatures that no longer exist. The Guild maintains a strict monopoly on crystal mining and processing, making independent research difficult.`,
    relatedIds: ['faction_engineers', 'lore_history_steam_rush'],
    discoveryMethod: 'book',
    tags: ['technology', 'resource', 'mystery'],
  },
  {
    id: 'lore_tech_cogitation_engine',
    category: 'technology_lore',
    title: 'The Cogitation Engine',
    text: `The cogitation engine is the mechanical brain of an automaton, a marvel of precision engineering that can process commands and respond to its environment. Simple units can follow basic instructions; complex ones can navigate obstacles and make limited decisions.

Each cogitation engine contains thousands of precisely machined gears, cams, and levers, arranged in patterns discovered through decades of trial and error. The most advanced designs are closely guarded Guild secrets, worth fortunes to rival inventors.

The question of whether a sufficiently complex cogitation engine could achieve true consciousness remains hotly debated. The Guild officially denies the possibility, but the events of the Brass Rebellion suggest otherwise. And in Rust Town, stories persist of ancient engines that speak in human voices.`,
    relatedIds: ['creature_automaton', 'faction_engineers'],
    discoveryMethod: 'dialogue',
    tags: ['technology', 'automaton', 'consciousness'],
  },
  {
    id: 'lore_tech_pneumatic_transport',
    category: 'technology_lore',
    title: 'The Pneumatic Network',
    text: `Beneath the streets of Summit City runs the Pneumatic Network, a system of pressurized tubes that can transport small packages across the city in minutes. What began as a postal service has expanded into a vast infrastructure connecting government offices, banks, and major businesses.

The Network is maintained by a dedicated corps of engineers who work in the cramped tunnels beneath the city. They have developed their own subculture, complete with traditions, slang, and a fierce loyalty to their underground domain.

Rumors persist of secret sections of the Network, tubes that lead to hidden facilities or connect to the personal residences of the powerful. The tube-runners claim to hear strange sounds from these forbidden passages, and more than one has disappeared while investigating.`,
    relatedIds: ['location_summit_city', 'faction_engineers'],
    discoveryMethod: 'exploration',
    tags: ['technology', 'infrastructure', 'urban'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all rumors of a specific category
 */
export function getRumorsByCategory(category: RumorTemplate['category']): RumorTemplate[] {
  return RUMOR_TEMPLATES.filter((rumor) => rumor.category === category);
}

/**
 * Get rumors filtered by tags
 */
export function getRumorsByTags(tags: string[]): RumorTemplate[] {
  if (tags.length === 0) return RUMOR_TEMPLATES;
  return RUMOR_TEMPLATES.filter((rumor) => rumor.tags?.some((tag) => tags.includes(tag)));
}

/**
 * Get a random rumor appropriate for the context
 */
export function getRandomRumor(
  context: GenerationContext,
  rng: SeededRandom,
  options?: {
    category?: RumorTemplate['category'];
    tags?: string[];
    excludeIds?: string[];
  }
): RumorTemplate | null {
  let candidates = [...RUMOR_TEMPLATES];

  // Filter by category
  if (options?.category) {
    candidates = candidates.filter((r) => r.category === options.category);
  }

  // Filter by tags
  if (options?.tags && options.tags.length > 0) {
    candidates = candidates.filter((r) => r.tags?.some((tag) => options.tags!.includes(tag)));
  }

  // Exclude specific IDs
  if (options?.excludeIds && options.excludeIds.length > 0) {
    candidates = candidates.filter((r) => !options.excludeIds!.includes(r.id));
  }

  // Filter by context tags if provided
  if (context.contextTags.length > 0) {
    const contextFiltered = candidates.filter((r) =>
      r.tags?.some((tag) => context.contextTags.includes(tag))
    );
    // Only use context filtering if it leaves some candidates
    if (contextFiltered.length > 0) {
      candidates = contextFiltered;
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  // Weight by prevalence
  const weights = candidates.map((r) => r.prevalence ?? 0.5);
  return rng.weightedPick(candidates, weights);
}

/**
 * Get all lore fragments of a specific category
 */
export function getLoreByCategory(category: LoreFragment['category']): LoreFragment[] {
  return LORE_FRAGMENTS.filter((lore) => lore.category === category);
}

/**
 * Get lore fragments related to a specific entity ID
 */
export function getLoreByRelatedId(id: string): LoreFragment[] {
  return LORE_FRAGMENTS.filter((lore) => lore.relatedIds?.includes(id));
}

/**
 * Get lore filtered by tags
 */
export function getLoreByTags(tags: string[]): LoreFragment[] {
  if (tags.length === 0) return LORE_FRAGMENTS;
  return LORE_FRAGMENTS.filter((lore) => lore.tags?.some((tag) => tags.includes(tag)));
}

/**
 * Get lore filtered by discovery method
 */
export function getLoreByDiscoveryMethod(method: LoreFragment['discoveryMethod']): LoreFragment[] {
  return LORE_FRAGMENTS.filter((lore) => lore.discoveryMethod === method);
}

/**
 * Get a random lore fragment appropriate for context
 */
export function getRandomLore(
  rng: SeededRandom,
  options?: {
    category?: LoreFragment['category'];
    discoveryMethod?: LoreFragment['discoveryMethod'];
    tags?: string[];
    relatedId?: string;
    excludeIds?: string[];
  }
): LoreFragment | null {
  let candidates = [...LORE_FRAGMENTS];

  // Filter by category
  if (options?.category) {
    candidates = candidates.filter((l) => l.category === options.category);
  }

  // Filter by discovery method
  if (options?.discoveryMethod) {
    candidates = candidates.filter((l) => l.discoveryMethod === options.discoveryMethod);
  }

  // Filter by tags
  if (options?.tags && options.tags.length > 0) {
    candidates = candidates.filter((l) => l.tags?.some((tag) => options.tags!.includes(tag)));
  }

  // Filter by related ID
  if (options?.relatedId) {
    candidates = candidates.filter((l) => l.relatedIds?.includes(options.relatedId!));
  }

  // Exclude specific IDs
  if (options?.excludeIds && options.excludeIds.length > 0) {
    candidates = candidates.filter((l) => !options.excludeIds!.includes(l.id));
  }

  if (candidates.length === 0) {
    return null;
  }

  return rng.pick(candidates);
}

/**
 * Get automatic lore (known from the start)
 */
export function getAutomaticLore(): LoreFragment[] {
  return LORE_FRAGMENTS.filter((lore) => lore.discoveryMethod === 'automatic');
}

/**
 * Get all rumor template IDs
 */
export function getAllRumorIds(): string[] {
  return RUMOR_TEMPLATES.map((r) => r.id);
}

/**
 * Get all lore fragment IDs
 */
export function getAllLoreIds(): string[] {
  return LORE_FRAGMENTS.map((l) => l.id);
}

/**
 * Get a specific rumor by ID
 */
export function getRumorById(id: string): RumorTemplate | undefined {
  return RUMOR_TEMPLATES.find((r) => r.id === id);
}

/**
 * Get a specific lore fragment by ID
 */
export function getLoreById(id: string): LoreFragment | undefined {
  return LORE_FRAGMENTS.find((l) => l.id === id);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  RUMOR_TEMPLATES,
  LORE_FRAGMENTS,
  getRumorsByCategory,
  getRumorsByTags,
  getRandomRumor,
  getLoreByCategory,
  getLoreByRelatedId,
  getLoreByTags,
  getLoreByDiscoveryMethod,
  getRandomLore,
  getAutomaticLore,
  getAllRumorIds,
  getAllLoreIds,
  getRumorById,
  getLoreById,
};
