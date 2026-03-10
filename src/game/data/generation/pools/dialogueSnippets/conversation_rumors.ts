/**
 * Conversation Dialogue Snippets - RUMOR
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const RUMOR_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'rumor_bandit_1',
    category: 'rumor',
    textTemplates: [
      "Heard tell there's bandits operating out by {{location}}. Watch yourself.",
      'Word is, the Red Canyon boys are back. Robbed a stage last week.',
      "Outlaws been gettin' bolder lately. Sheriff can't keep up.",
    ],
    tags: ['danger', 'bandit'],
  },
  {
    id: 'rumor_treasure_1',
    category: 'rumor',
    textTemplates: [
      "Old prospector told me there's gold in them hills. Never came back to prove it.",
      'They say {{location}} has a hidden mine. Spanish gold, some say.',
      "Lost treasure from the war. Buried somewhere 'round here, they reckon.",
    ],
    tags: ['treasure', 'gold'],
  },
  {
    id: 'rumor_gossip_1',
    category: 'rumor',
    textTemplates: [
      "Heard {{target}} ain't what they seem. Came from back East with a price on their head.",
      '{{target}} has been acting mighty suspicious lately. Meeting with strangers at night.',
      "Don't trust {{target}}. I seen things.",
    ],
    personalityMax: { honesty: 0.6 },
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
    tags: ['faction', 'politics'],
  },
  {
    id: 'rumor_strange_1',
    category: 'rumor',
    textTemplates: [
      "Strange lights out in the desert at night. Ain't natural.",
      'Automatons been acting funny. Like they got minds of their own.',
      "Heard howling from the old mine. But it weren't no coyote.",
    ],
    tags: ['strange', 'mysterious'],
  },
  {
    id: 'rumor_danger_1',
    category: 'rumor',
    textTemplates: [
      "Stay away from {{location}}. Folks who go there don't come back.",
      '{{location}} is crawling with bandits these days.',
      'The Copperhead Gang has been spotted near {{location}}.',
    ],
    tags: ['danger', 'warning'],
  },
  {
    id: 'rumor_ghost_1',
    category: 'rumor',
    textTemplates: [
      'They say {{location}} is haunted by the miners who died there.',
      'Strange lights have been seen at {{location}} after dark.',
      'Some say the ghost of {{target}} still walks {{location}}.',
    ],
    tags: ['supernatural', 'spooky'],
  },
  {
    id: 'rumor_scandal_1',
    category: 'rumor',
    textTemplates: [
      "Between you and me, {{target}} isn't as honest as they seem.",
      'I heard {{target}} has been dealing with the outlaws.',
      'Word is {{target}} owes money to some dangerous people.',
    ],
    tags: ['scandal', 'gossip'],
  },
  {
    id: 'rumor_ivrc_1',
    category: 'rumor',
    textTemplates: [
      "The Railroad's planning something big at {{location}}.",
      'IVRC agents have been asking questions about {{target}}.',
      'I hear the Railroad wants to buy up all the land around {{location}}.',
    ],
    validFactions: ['neutral', 'freeminer', 'townsfolk'],
    tags: ['faction', 'ivrc'],
  },
  {
    id: 'rumor_copperhead_1',
    category: 'rumor',
    textTemplates: [
      "The Copperhead Gang's been hitting shipments near {{location}}.",
      '{{target}} might be working with the Copperheads. Just a feeling.',
      'I saw Copperhead riders heading toward {{location}} last night.',
    ],
    tags: ['faction', 'copperhead', 'criminal'],
  },
  {
    id: 'rumor_freeminer_1',
    category: 'rumor',
    textTemplates: [
      'The miners are talking about a strike. Could get ugly.',
      "Freeminer Coalition's been recruiting at {{location}}.",
      "{{target}} is secretly funding the miners' cause.",
    ],
    tags: ['faction', 'freeminer', 'labor'],
  },
  {
    id: 'rumor_romance_1',
    category: 'rumor',
    textTemplates: [
      'Did you hear? {{target}} has been seen with someone late at night.',
      "There's something going on between {{target}} and someone, mark my words.",
      'Love is in the air at {{location}}, if you catch my meaning.',
    ],
    tags: ['romance', 'gossip'],
  },
  {
    id: 'rumor_crime_1',
    category: 'rumor',
    textTemplates: [
      "Someone's been robbing travelers on the road to {{location}}.",
      'The bank at {{location}} got hit last week. No one knows who did it.',
      '{{target}} was found dead near {{location}}. Sheriff says it was murder.',
    ],
    tags: ['crime', 'investigation'],
  },
  {
    id: 'rumor_opportunity_1',
    category: 'rumor',
    textTemplates: [
      '{{target}} is looking for someone to do a job. Pays well, I hear.',
      "There's work to be had at {{location}} for those willing.",
      'Big reward being offered for whoever finds {{target}}.',
    ],
    tags: ['opportunity', 'quest_hook'],
  },
  {
    id: 'rumor_arrival_1',
    category: 'rumor',
    textTemplates: [
      'A stranger arrived at {{location}} yesterday. Asking a lot of questions.',
      '{{target}} just rode into town. Trouble follows that one.',
      'New folks setting up shop at {{location}}. Competition for business.',
    ],
    tags: ['arrival', 'news'],
  },
  {
    id: 'rumor_departure_1',
    category: 'rumor',
    textTemplates: [
      '{{target}} left town in a hurry. Wonder what spooked them.',
      'The old doctor at {{location}} packed up and left. No one knows why.',
      "{{target}} ain't been seen in days. Some think they're dead.",
    ],
    tags: ['departure', 'mystery'],
  },
  {
    id: 'rumor_weather_1',
    category: 'rumor',
    textTemplates: [
      "Old-timers say a big storm's coming. Can feel it in my bones.",
      "Dry spell's going to hit hard. Water will be worth more than gold.",
      "Strange weather lately. Some say it's a bad omen.",
    ],
    tags: ['weather', 'omen'],
  },
  {
    id: 'rumor_automaton_1',
    category: 'rumor',
    textTemplates: [
      'Seen one of them automatons wandering near {{location}}. Gave me chills.',
      "The Remnant's been more active lately. Something's stirring them up.",
      '{{target}} has been tinkering with old automaton parts. Dangerous business.',
    ],
    tags: ['automaton', 'remnant', 'supernatural'],
  },
  {
    id: 'rumor_medicine_1',
    category: 'rumor',
    textTemplates: [
      "There's a sickness going around {{location}}. Best keep your distance.",
      "Doc's been working day and night. Something bad's spreading.",
      '{{target}} has been selling snake oil. Made three folks sicker than dogs.',
    ],
    tags: ['medicine', 'health'],
  },
  {
    id: 'rumor_theft_1',
    category: 'rumor',
    textTemplates: [
      '{{target}} had their whole herd rustled. Devastating loss.',
      "Someone's been stealing supplies from {{location}}.",
      "Watch your belongings. There's a thief working the area.",
    ],
    tags: ['theft', 'crime'],
  },
  {
    id: 'rumor_bounty_1',
    category: 'rumor',
    textTemplates: [
      "There's a bounty on {{target}}'s head. Dead or alive.",
      'Wanted poster just went up for {{target}}. Big reward.',
      'Bounty hunters have been sniffing around {{location}}.',
    ],
    validRoles: ['bounty_hunter', 'sheriff', 'deputy'],
    tags: ['bounty', 'quest_hook'],
  },
  {
    id: 'rumor_secret_1',
    category: 'rumor',
    textTemplates: [
      "{{target}}'s got a secret. A big one. I can tell.",
      "Something's buried under {{location}}. And it ain't just bones.",
      "There's more to {{target}} than meets the eye. Trust me.",
    ],
    tags: ['secret', 'mystery'],
  },
  {
    id: 'rumor_politics_1',
    category: 'rumor',
    textTemplates: [
      "The mayor's been meeting with Railroad men in secret.",
      "Election's coming up. {{target}}'s making a play for power.",
      'Tensions are rising between the factions.',
    ],
    validRoles: ['mayor', 'banker', 'merchant'],
    tags: ['politics'],
  },
  {
    id: 'rumor_mine_1',
    category: 'rumor',
    textTemplates: [
      'They hit a new vein at {{location}}. Could be the big one.',
      'Mine collapse at {{location}} killed three men last week.',
      '{{target}} claims they found silver, not just copper. Who knows?',
    ],
    validRoles: ['miner', 'prospector'],
    tags: ['mining'],
  },
  {
    id: 'rumor_water_1',
    category: 'rumor',
    textTemplates: [
      'The well at {{location}} is going dry. Folks are getting desperate.',
      '{{target}} found a new water source. Keeping it secret though.',
      'Water rights are going to cause a war, mark my words.',
    ],
    tags: ['water', 'survival'],
  },
];
