/**
 * Rumor Templates - Quest hooks, locations, gossip, factions
 */

import type { RumorTemplate } from '../../../schemas/generation.ts';

export const RUMOR_HOOK_TEMPLATES: RumorTemplate[] = [

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

];
