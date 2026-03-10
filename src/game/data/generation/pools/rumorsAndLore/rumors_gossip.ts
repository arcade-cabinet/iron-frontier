/**
 * Rumor Templates - NPC Gossip, Faction News
 */

import type { RumorTemplate } from '../../../schemas/generation.ts';

export const RUMOR_GOSSIP_TEMPLATES: RumorTemplate[] = [
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
  }
];
