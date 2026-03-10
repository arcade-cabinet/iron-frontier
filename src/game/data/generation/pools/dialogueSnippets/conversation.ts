/**
 * Conversation Dialogue Snippets
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const QUESTION_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'question_stranger_1',
    category: 'question',
    textTemplates: [
      'Where you from, stranger?',
      'What brings you to {{location}}?',
      'You running from something?',
    ],
    personalityMin: { curiosity: 0.5 },
    tags: ['personal'],
  },
  {
    id: 'question_business_1',
    category: 'question',
    textTemplates: [
      'You looking for work?',
      "What's your trade, friend?",
      'You good with that iron on your hip?',
    ],
    tags: ['practical'],
  },
  {
    id: 'question_suspicious_1',
    category: 'question',
    textTemplates: ['Who sent you?', 'You working for someone?', "What's your angle here?"],
    personalityMax: { friendliness: 0.4 },
    tags: ['suspicious'],
  },
  {
    id: 'question_news_1',
    category: 'question',
    textTemplates: [
      'Heard any news from the outside?',
      "What's going on out there?",
      'Any word from {{location}}?',
    ],
    personalityMin: { curiosity: 0.4 },
    tags: ['news', 'world'],
  },
  {
    id: 'question_skill_1',
    category: 'question',
    textTemplates: [
      'You any good with a gun?',
      'Ever done any honest work?',
      'What kind of skills you got?',
    ],
    tags: ['skills', 'assessment'],
  },
  {
    id: 'question_sheriff_1',
    category: 'question',
    textTemplates: [
      'Seen any suspicious characters lately?',
      'You know anything about the recent crimes?',
      'Got any information for the law?',
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority', 'investigation'],
  },
  {
    id: 'question_merchant_1',
    category: 'question',
    textTemplates: [
      'Looking to buy or sell?',
      'Need any supplies for the road?',
      'What kind of goods interest you?',
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['commerce'],
  },
  {
    id: 'question_doctor_1',
    category: 'question',
    textTemplates: [
      'Where does it hurt?',
      'How long have you had these symptoms?',
      'Any allergies I should know about?',
    ],
    validRoles: ['doctor'],
    tags: ['medical'],
  },
  {
    id: 'question_preacher_1',
    category: 'question',
    textTemplates: [
      'Have you found peace with the Lord?',
      'Is something troubling your soul?',
      'When did you last pray, child?',
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'question_gossip_1',
    category: 'question',
    textTemplates: [
      'You hear what happened to {{target}}?',
      'Did you know about {{target}}?',
      'Want to know a secret?',
    ],
    personalityMin: { curiosity: 0.5 },
    personalityMax: { honesty: 0.5 },
    tags: ['gossip'],
  },
  {
    id: 'question_philosophical_1',
    category: 'question',
    textTemplates: [
      'You ever wonder what this is all for?',
      "Think there's something after all this?",
      'What keeps you going, stranger?',
    ],
    personalityMin: { curiosity: 0.6 },
    tags: ['philosophical'],
  },
  {
    id: 'question_past_1',
    category: 'question',
    textTemplates: [
      'What did you do before coming here?',
      'You running from something?',
      'Got any family out there?',
    ],
    personalityMin: { curiosity: 0.5 },
    tags: ['personal', 'backstory'],
  },
  {
    id: 'question_rumor_1',
    category: 'question',
    textTemplates: [
      'You heard the rumors about {{location}}?',
      'They say strange things happen at {{location}}. You believe it?',
      'Word is {{target}} is up to something. Know anything?',
    ],
    tags: ['rumor', 'investigation'],
  },
  {
    id: 'question_faction_1',
    category: 'question',
    textTemplates: [
      'You with the Railroad or the miners?',
      'Which side are you on in all this?',
      'Got any allegiances I should know about?',
    ],
    tags: ['faction', 'political'],
  },
  {
    id: 'question_challenge_1',
    category: 'question',
    textTemplates: [
      "You think you're tough enough?",
      'Got what it takes?',
      'You sure you want to do this?',
    ],
    personalityMin: { aggression: 0.4 },
    tags: ['challenge'],
  },
];

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

export const SMALL_TALK_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'small_talk_weather_1',
    category: 'small_talk',
    textTemplates: [
      "Hot one today, ain't it?",
      "Think we might get rain soon. Ground's thirsty.",
      "Dust storm's comin'. Can smell it.",
    ],
    tags: ['weather'],
  },
  {
    id: 'small_talk_weather_2',
    category: 'small_talk',
    textTemplates: [
      'Hot enough to fry an egg on the rocks.',
      "Wind's been kicking up something fierce.",
      "Desert heat'll kill you quicker than a bullet.",
    ],
    tags: ['weather'],
  },
  {
    id: 'small_talk_business_1',
    category: 'small_talk',
    textTemplates: [
      'Business been slow lately. Too much trouble on the roads.',
      "Can't complain. Folks always need what I'm selling.",
      "Railroad's been good for business, I'll say that much.",
    ],
    validRoles: ['merchant', 'bartender', 'blacksmith'],
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
    tags: ['local'],
  },
  {
    id: 'small_talk_town_2',
    category: 'small_talk',
    textTemplates: [
      'Not much happens in these parts.',
      "Quiet town. That's how we like it.",
      'Folks here mind their own business. Mostly.',
    ],
    validRoles: ['townsfolk'],
    tags: ['town', 'local'],
  },
  {
    id: 'small_talk_work_1',
    category: 'small_talk',
    textTemplates: [
      'Another day, another dollar.',
      'Work never ends around here.',
      "My back's killing me from all this labor.",
    ],
    validRoles: ['miner', 'farmer', 'rancher', 'blacksmith'],
    tags: ['work', 'labor'],
  },
  {
    id: 'small_talk_animals_1',
    category: 'small_talk',
    textTemplates: [
      'Saw a rattlesnake near the well yesterday.',
      'The coyotes have been bold lately.',
      'Wild horses been spotted up in the hills.',
    ],
    tags: ['animals', 'wildlife'],
  },
  {
    id: 'small_talk_saloon_1',
    category: 'small_talk',
    textTemplates: [
      "Whiskey here's not half bad.",
      'Got a good card game going most nights.',
      'Place gets rowdy on paydays.',
    ],
    validRoles: ['bartender', 'gambler'],
    tags: ['saloon'],
  },
  {
    id: 'small_talk_railroad_1',
    category: 'small_talk',
    textTemplates: [
      "Train's running late again.",
      "The Railroad's changed everything around here.",
      'Remember when this was all just empty land?',
    ],
    tags: ['railroad', 'progress'],
  },
  {
    id: 'small_talk_mining_1',
    category: 'small_talk',
    textTemplates: [
      'Copper prices have been up lately.',
      'Another cave-in at the main shaft last week.',
      "Mining's dangerous work, but it pays.",
    ],
    validRoles: ['miner', 'prospector'],
    tags: ['mining'],
  },
  {
    id: 'small_talk_ranching_1',
    category: 'small_talk',
    textTemplates: [
      'Lost two head to rustlers last month.',
      'Cattle drive coming up. Going to be busy.',
      'Price of beef keeps going down.',
    ],
    validRoles: ['rancher', 'farmer'],
    tags: ['ranching'],
  },
  {
    id: 'small_talk_memories_1',
    category: 'small_talk',
    textTemplates: [
      'I remember when this was all wilderness.',
      'Been here longer than most folks remember.',
      'Times change. Not always for the better.',
    ],
    tags: ['nostalgia', 'memories'],
  },
  {
    id: 'small_talk_future_1',
    category: 'small_talk',
    textTemplates: [
      'Wonder what this place will look like in ten years.',
      'Progress marches on, like it or not.',
      'Big changes coming. Can feel it in my bones.',
    ],
    tags: ['future', 'progress'],
  },
  {
    id: 'small_talk_health_1',
    category: 'small_talk',
    textTemplates: [
      'My joints ache something terrible.',
      'Getting too old for this life.',
      "Can't complain. Still breathing, ain't I?",
    ],
    tags: ['health', 'age'],
  },
  {
    id: 'small_talk_food_1',
    category: 'small_talk',
    textTemplates: [
      'Supplies are getting low at the general store.',
      'Miss a good home-cooked meal sometimes.',
      'Bean stew again tonight, I reckon.',
    ],
    tags: ['food'],
  },
  {
    id: 'small_talk_stranger_1',
    category: 'small_talk',
    textTemplates: [
      "We don't get many strangers around here.",
      'New face in town always causes a stir.',
      'You planning on staying long?',
    ],
    tags: ['stranger', 'newcomer'],
  },
  {
    id: 'small_talk_lawless_1',
    category: 'small_talk',
    textTemplates: [
      'Law barely reaches out here.',
      'Every man for himself in these parts.',
      "The strong survive. That's the only law.",
    ],
    validRoles: ['outlaw', 'drifter'],
    personalityMax: { lawfulness: 0.4 },
    tags: ['lawless'],
  },
  {
    id: 'small_talk_church_1',
    category: 'small_talk',
    textTemplates: [
      'Sunday service was well attended.',
      "The congregation's been growing.",
      'Faith keeps us going in hard times.',
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'small_talk_night_1',
    category: 'small_talk',
    textTemplates: [
      'Stars are bright tonight.',
      'Quiet night, for once.',
      'Night brings out the worst in some folks.',
    ],
    validTimeOfDay: ['night'],
    tags: ['night', 'time_specific'],
  },
  {
    id: 'small_talk_philosophy_1',
    category: 'small_talk',
    textTemplates: [
      'Life out here makes you think about what matters.',
      "We're all just passing through, when you think about it.",
      'The desert has a way of putting things in perspective.',
    ],
    personalityMin: { curiosity: 0.5 },
    tags: ['philosophical'],
  },
];
