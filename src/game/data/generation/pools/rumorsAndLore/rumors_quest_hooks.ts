/**
 * Rumor Templates - Quest Hooks and Location Hints
 */

import type { RumorTemplate } from '../../../schemas/generation.ts';

export const RUMOR_QUEST_HOOK_TEMPLATES: RumorTemplate[] = [

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
  }
];
