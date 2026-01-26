/**
 * Iron Frontier - Journal & Codex System
 *
 * The player's journal containing notes, maps, and collected information.
 * Entries unlock through gameplay, creating a persistent record of discoveries.
 *
 * Sections:
 * 1. Quest Notes - Auto-generated quest tracking
 * 2. Character Profiles - NPC information unlocked on meeting
 * 3. Location Notes - Town and area descriptions
 * 4. Bestiary - Enemy information unlocked by defeating
 * 5. Item Encyclopedia - Important item descriptions
 * 6. Player Notes - Custom note system
 */

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

/** Base journal entry with common fields */
export interface JournalEntry {
  id: string;
  title: string;
  category: JournalCategory;
  unlocked: boolean;
  unlockedAt?: number; // Timestamp
  read: boolean;
  bookmarked: boolean;
  tags: string[];
}

export type JournalCategory =
  | 'quest_notes'
  | 'character_profiles'
  | 'location_notes'
  | 'bestiary'
  | 'item_encyclopedia'
  | 'player_notes';

// ============================================================================
// QUEST NOTES - Auto-generated from active quests
// ============================================================================

export interface QuestNote extends JournalEntry {
  category: 'quest_notes';
  questId: string;
  questType: 'main' | 'side';
  status: 'active' | 'completed' | 'failed';
  currentObjective: string;
  npcNames: string[];
  locations: string[];
  clues: string[];
  playerNotes: string;
}

/** Template for generating quest notes */
export const QUEST_NOTE_TEMPLATES = {
  main: {
    prefix: '[MAIN QUEST]',
    format: (title: string, objective: string) =>
      `${title}\n\nCurrent Objective: ${objective}`,
  },
  side: {
    prefix: '[SIDE QUEST]',
    format: (title: string, objective: string) =>
      `${title}\n\nObjective: ${objective}`,
  },
  investigation: {
    prefix: '[INVESTIGATION]',
    format: (title: string, clues: string[]) =>
      `${title}\n\nClues Gathered:\n${clues.map((c) => `- ${c}`).join('\n')}`,
  },
  bounty: {
    prefix: '[BOUNTY]',
    format: (target: string, reward: number, location: string) =>
      `Target: ${target}\nReward: $${reward}\nLast Seen: ${location}`,
  },
  delivery: {
    prefix: '[DELIVERY]',
    format: (item: string, destination: string, deadline?: string) =>
      `Deliver: ${item}\nTo: ${destination}${deadline ? `\nDeadline: ${deadline}` : ''}`,
  },
};

// ============================================================================
// CHARACTER PROFILES - NPCs encountered
// ============================================================================

export interface CharacterProfile extends JournalEntry {
  category: 'character_profiles';
  npcId: string;
  name: string;
  characterTitle?: string; // Distinct from JournalEntry.title
  physicalDescription: string;
  knownInformation: string[];
  relationshipStatus: 'unknown' | 'neutral' | 'friendly' | 'hostile' | 'allied';
  lastKnownLocation: string;
  portrait?: string;
  faction?: string;
  specialNotes: string[];
}

/** Character profiles - unlocked when meeting NPCs */
export const CHARACTER_PROFILES: CharacterProfile[] = [
  // ============================================================================
  // MAIN STORY NPCs
  // ============================================================================
  {
    id: 'profile_sheriff_cole',
    title: 'Sheriff Marcus Cole',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['authority', 'law', 'dusty_springs', 'ally_potential'],
    npcId: 'sheriff_cole',
    name: 'Marcus Cole',
    physicalDescription:
      'A weathered man in his forties with sun-creased eyes and a silver-streaked beard. His badge is polished despite the dust that clings to everything else. Deep lines around his mouth suggest a man who has made too many hard decisions. He carries himself with quiet authority, though there is weariness in his stance.',
    knownInformation: [
      'Sheriff of Dusty Springs for the past eight years',
      'Former Union cavalry officer - served with distinction',
      'Struggles with IVRC influence over local politics',
      "Known for being fair but firm - won't bend the law for anyone",
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: "Sheriff's Office, Dusty Springs",
    faction: 'neutral',
    specialNotes: [
      'Seems conflicted about something - perhaps his duty versus his conscience',
      'Mentioned knowing about IVRC activities but lacking proof',
    ],
  },
  {
    id: 'profile_doc_chen',
    title: 'Doc Chen Wei',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['healer', 'underground', 'dusty_springs', 'ally_potential'],
    npcId: 'doc_chen',
    name: 'Chen Wei',
    physicalDescription:
      'An older Chinese gentleman with thoughtful eyes behind wire-rimmed spectacles. His hands are steady and precise, the hands of a skilled surgeon. His small office is a curious blend of Western medicine bottles and traditional Chinese remedies in ceramic jars. Despite his calm demeanor, there is steel in his gaze.',
    knownInformation: [
      'Trained in both Western and traditional Chinese medicine',
      'Came to America seeking opportunity, found discrimination instead',
      'Treats everyone regardless of ability to pay',
      'Sells medical supplies at fair prices',
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: "Doc Chen's Office, Dusty Springs",
    faction: 'neutral',
    specialNotes: [
      'Rumored to help workers escape IVRC debt bondage',
      'Has connections to an underground network',
      'Knows more than he lets on about local events',
    ],
  },
  {
    id: 'profile_diamondback',
    title: 'Diamondback (Dolores Vega)',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['outlaw', 'copperhead', 'gang_leader', 'dangerous'],
    npcId: 'diamondback',
    name: 'Dolores Vega',
    physicalDescription:
      'A striking woman with sun-darkened skin and cold, calculating eyes that miss nothing. A coiled rattlesnake tattoo winds up the side of her neck - her namesake. She moves with predatory grace, and a pair of well-worn revolvers hang at her hips. Beautiful and deadly in equal measure.',
    knownInformation: [
      'Leader of the infamous Copperhead Gang',
      'Former IVRC telegraph operator - knows company secrets',
      'Survived an IVRC assassination attempt that left scars',
      'Commands absolute loyalty from her gang',
    ],
    relationshipStatus: 'unknown',
    lastKnownLocation: 'Rattlesnake Canyon / Mesa Point',
    faction: 'copperhead',
    specialNotes: [
      'Not motivated by greed - has a personal vendetta against IVRC',
      'May be willing to work with others against common enemies',
      'Extremely dangerous but follows her own code of honor',
    ],
  },
  {
    id: 'profile_cornelius_thorne',
    title: 'Director Cornelius Thorne',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['ivrc', 'antagonist', 'authority', 'dangerous'],
    npcId: 'cornelius_thorne',
    name: 'Cornelius Thorne',
    physicalDescription:
      "A tall, gaunt man in an impeccable black suit that seems to absorb light. His pale eyes are cold as a winter grave, and his thin lips rarely curve into anything resembling warmth. Every gesture is calculated, every word precise. He carries no visible weapons - he doesn't need them.",
    knownInformation: [
      'Regional Director of IVRC operations',
      'Rose through company ranks with ruthless efficiency',
      'Controls most commerce and politics in the territory',
      'Rumored to have eliminated rivals both professionally and permanently',
    ],
    relationshipStatus: 'unknown',
    lastKnownLocation: 'IVRC Headquarters, Iron Gulch',
    faction: 'ivrc',
    specialNotes: [
      'THE most powerful man in the territory - approach with extreme caution',
      'Connected to something called "Project Remnant"',
      'Has eyes and ears everywhere',
    ],
  },
  {
    id: 'profile_samuel_ironpick',
    title: 'Old Samuel Ironpick',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['freeminer', 'leader', 'resistance', 'ally_potential'],
    npcId: 'samuel_ironpick',
    name: 'Samuel Ironpick',
    physicalDescription:
      'A grizzled old miner with a silver beard and hands like leather, permanently stained with the dust of a hundred mines. His eyes hold both wisdom and deep sorrow - the look of a man who has lost too much. Despite his worn clothes, he carries himself with quiet dignity.',
    knownInformation: [
      'Leader of the Freeminer resistance movement',
      'Lost his son to a preventable mine collapse',
      'Advocates for peaceful resistance against IVRC',
      'Commands deep respect among independent miners',
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: 'Freeminer Hollow',
    faction: 'freeminer',
    specialNotes: [
      'Holds documents that could destroy IVRC - if he can be convinced to use them',
      "Granddaughter Maggie disagrees with his peaceful methods",
      'May be the key to uniting the resistance',
    ],
  },
  {
    id: 'profile_engineer_clara',
    title: 'Engineer Clara Whitmore',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['engineer', 'iron_gulch', 'ally_potential', 'information'],
    npcId: 'engineer_clara',
    name: 'Clara Whitmore',
    physicalDescription:
      'A young woman in work-stained overalls with intelligent eyes behind wire-rimmed spectacles. Grease streaks her face, and an array of tools hangs from her belt. She speaks rapidly, her mind always working on multiple problems at once. Her hands are calloused from honest work.',
    knownInformation: [
      'Chief engineer for IVRC mining operations at Iron Gulch',
      'Designed most of the modern mining equipment in use',
      'Educated back East at a prestigious engineering school',
      'Secretly sympathizes with the workers and Freeminers',
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: 'Engineering Workshop, Iron Gulch',
    faction: 'neutral',
    specialNotes: [
      'May be feeding safety information to the Freeminers',
      'Knows technical details about the mine sabotage',
      'Could be a valuable ally with the right approach',
    ],
  },
  {
    id: 'profile_foreman_burke',
    title: 'Foreman Harold Burke',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['ivrc', 'authority', 'iron_gulch', 'quest_giver'],
    npcId: 'foreman_burke',
    name: 'Harold Burke',
    physicalDescription:
      "A heavyset man with coal-dust permanently embedded in his weathered skin. His eyes are hard as the iron he mines, and his hands are harder still. He runs the main IVRC mine with an iron fist, brooking no nonsense from workers or visitors alike.",
    knownInformation: [
      'Foreman of the main IVRC mine at Iron Gulch',
      'Started as a simple miner thirty years ago',
      'Loyal to IVRC - they made him what he is',
      'Desperately seeking the mine saboteur',
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: "Foreman's Office, Iron Gulch",
    faction: 'ivrc',
    specialNotes: [
      'Suspects Silas Crane of being the saboteur',
      'Will pay well for information leading to the culprit',
      'More complex than he first appears',
    ],
  },
  {
    id: 'profile_black_belle',
    title: 'Black Belle (Isabelle Crow)',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['bounty_hunter', 'for_hire', 'dangerous', 'mesa_point'],
    npcId: 'black_belle',
    name: 'Isabelle Crow',
    physicalDescription:
      'A striking woman dressed entirely in black, from her wide-brimmed hat to her polished boots. A matched pair of silver revolvers hang at her hips, well-worn from use. Her dark eyes miss nothing, calculating odds and threats with every glance. Beautiful and deadly in equal measure.',
    knownInformation: [
      'Former Pinkerton agent turned bounty hunter',
      'Left the agency after discovering they covered up IVRC crimes',
      'Works for anyone who pays - outlaws, lawmen, even IVRC',
      'Has a code: no women, no children, no one who does not deserve it',
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: 'Mesa Point',
    faction: 'neutral',
    specialNotes: [
      'Has turned down bounties on Diamondback - for now',
      'Knows what Thorne did to her old partner',
      'Can be hired for certain jobs',
    ],
  },
  {
    id: 'profile_professor_cogsworth',
    title: 'Professor Emmett Cogsworth',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['inventor', 'eccentric', 'coldwater', 'information'],
    npcId: 'professor_cogsworth',
    name: 'Emmett Cogsworth',
    physicalDescription:
      'A wild-haired man with thick spectacles and burn marks on his fingers that speak to countless experiments gone awry. His workshop coat is covered in grease stains and scorch marks. He speaks rapidly, often trailing off mid-sentence as a new idea strikes him.',
    knownInformation: [
      'Former IVRC researcher dismissed for "dangerous ideas"',
      'Creates inventions ranging from brilliant to bizarre',
      'Settled in Coldwater to continue his work in peace',
      'Sells unique gadgets and modified equipment',
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: 'Workshop, Coldwater',
    faction: 'neutral',
    specialNotes: [
      'Knows more about Project Remnant than he admits',
      'Worked on its early stages before being reassigned',
      'May have useful information or inventions',
    ],
  },
  {
    id: 'profile_father_miguel',
    title: 'Father Miguel Santos',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['priest', 'underground', 'sanctuary', 'ally_potential'],
    npcId: 'father_miguel',
    name: 'Miguel Santos',
    physicalDescription:
      "A gentle man in simple priest's robes, his hands calloused from work alongside his flock. His Spanish accent thickens when speaking of injustice. Despite his serene demeanor, there is a quiet strength in his bearing - a man who has seen darkness and chosen to stand against it.",
    knownInformation: [
      'Runs the church in Dusty Springs',
      'Former missionary who lost faith in the Church but not in God',
      'Provides sanctuary to those in need',
      "Works closely with Doc Chen on 'special cases'",
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: "St. Michael's Church, Dusty Springs",
    faction: 'neutral',
    specialNotes: [
      'Operates an underground railroad for escaped IVRC workers',
      'Hides refugees in the church basement',
      'Sister Maria handles the more dangerous logistics',
    ],
  },
  {
    id: 'profile_whiskey_pete',
    title: 'Whiskey Pete (Peter Sullivan)',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['bartender', 'information', 'iron_gulch', 'rumors'],
    npcId: 'whiskey_pete',
    name: 'Peter Sullivan',
    physicalDescription:
      "A portly man with a ruddy complexion and twinkling eyes that see everything. His apron is perpetually stained, and he polishes the same glass endlessly while listening to every word spoken in his establishment. He has the look of a man with many secrets - and none of his own.",
    knownInformation: [
      'Owns the Golden Nugget Saloon in Iron Gulch',
      'Came west after a scandal in Chicago - something about a dead man and cards',
      'Sells information to anyone who pays',
      'Stays carefully neutral in all conflicts',
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: 'Golden Nugget Saloon, Iron Gulch',
    faction: 'neutral',
    specialNotes: [
      'Knows every secret in town - for a price',
      'Foreman Burke drinks here when stressed',
      'Good source for rumors and leads',
    ],
  },
  {
    id: 'profile_maggie_ironpick',
    title: 'Margaret "Maggie" Ironpick',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['freeminer', 'copperhead_connected', 'conflicted', 'ally_potential'],
    npcId: 'maggie_ironpick',
    name: 'Margaret Ironpick',
    physicalDescription:
      "A young woman with fiery red hair and fierce green eyes that burn with barely contained anger. Her hands are calloused from mine work, but her restless energy suggests she yearns for more than the hollow can offer. There is her grandfather's determination in her jaw, but none of his patience.",
    knownInformation: [
      "Samuel Ironpick's granddaughter",
      'Orphaned when her father died in a mine collapse',
      'Works the Freeminer claims alongside her people',
      'Known for speaking her mind and challenging authority',
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: 'Freeminer Hollow',
    faction: 'freeminer',
    specialNotes: [
      'Secretly works with Diamondback and the Copperheads',
      "Believes direct action is the only answer - disagrees with grandfather's passive resistance",
      'Her dual loyalties could tear the resistance apart... or unite it',
    ],
  },
  {
    id: 'profile_lucky_lou',
    title: 'Lucky Lou (Louis Fontaine)',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['gambler', 'information', 'iron_gulch', 'morally_grey'],
    npcId: 'lucky_lou',
    name: 'Louis Fontaine',
    physicalDescription:
      "A dapper man in a slightly worn but well-maintained suit, with nimble fingers that never stray far from a deck of cards. His winning smile comes easily, and his eyes constantly calculate odds - of cards, of people, of everything. He has the look of a man who has talked his way out of trouble more times than he can count.",
    knownInformation: [
      'Professional gambler who drifted in following the mining money',
      'Runs high-stakes poker games for miners',
      "His 'luck' is mostly skill and a few tricks from New Orleans",
      'Has a code - only fleeces those who can afford it',
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: 'Lucky Strike Saloon, Iron Gulch',
    faction: 'neutral',
    specialNotes: [
      'Occasionally helps those in genuine need',
      'Connected to various underground activities',
      'Good source for information if you know how to ask',
    ],
  },
  {
    id: 'profile_deputy_jake',
    title: 'Deputy Jacob Hawkins',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['law', 'authority', 'dusty_springs', 'idealistic'],
    npcId: 'deputy_jake',
    name: 'Jacob Hawkins',
    physicalDescription:
      "A fresh-faced young man barely out of his teens, with earnest blue eyes and a badge he polishes every morning without fail. His quick draw is impressive for his age, but his idealism has yet to be tested by the hard choices of frontier justice. There is something almost innocent about him.",
    knownInformation: [
      "Sheriff Cole's newest and most promising deputy",
      'Hand-picked for his honesty and quick reflexes',
      'Believes absolutely in the law - black and white, right and wrong',
      'Sees Sheriff Cole as his mentor and hero',
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: "Sheriff's Office, Dusty Springs",
    faction: 'neutral',
    specialNotes: [
      "His faith in the system will be tested when he discovers IVRC's influence",
      'Would follow Sheriff Cole anywhere',
      'Unaware of the moral complexities around him - for now',
    ],
  },
  {
    id: 'profile_sister_maria',
    title: 'Sister Maria Esperanza',
    category: 'character_profiles',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['nun', 'underground', 'sanctuary', 'ally_potential'],
    npcId: 'sister_maria',
    name: 'Maria Esperanza',
    physicalDescription:
      "A young nun with kind brown eyes and a gentle smile that belies the steel in her spine. Her habit is worn but clean, and her hands are rough from hard work. She moves with surprising purpose for one who has taken vows of peace - and there are calluses on her hands that don't come from prayer.",
    knownInformation: [
      'Came from a convent in Mexico to assist Father Miguel',
      'Helps run the underground railroad for escaped workers',
      'More pragmatic than the Father - handles the dangerous logistics',
      'Trained in basic medicine to help Doc Chen',
    ],
    relationshipStatus: 'neutral',
    lastKnownLocation: "St. Michael's Church, Dusty Springs",
    faction: 'neutral',
    specialNotes: [
      "Forges papers and bribes guards when prayers aren't enough",
      'Has been known to wield a shotgun in defense of the innocent',
      'The backbone of the underground operation',
    ],
  },
];

// ============================================================================
// LOCATION NOTES - Towns and areas discovered
// ============================================================================

export interface LocationNote extends JournalEntry {
  category: 'location_notes';
  locationId: string;
  description: string;
  notableBuildings: string[];
  shopLocations: { name: string; description: string }[];
  dangerWarnings: string[];
  fastTravelUnlocked: boolean;
  discoveredSecrets: string[];
  localRumors: string[];
}

/** Location notes - unlocked when visiting areas */
export const LOCATION_NOTES: LocationNote[] = [
  {
    id: 'location_frontiers_edge',
    title: "Frontier's Edge",
    category: 'location_notes',
    unlocked: true, // Starting location
    read: false,
    bookmarked: false,
    tags: ['town', 'starter', 'tutorial', 'safe'],
    locationId: 'frontiers_edge',
    description:
      "A small frontier outpost at the very edge of civilization - the last stop before the wild country begins. It's not much more than a handful of weathered buildings clustered around a dusty crossroads, but there's an honest simplicity to the place. The people here are few but friendly, accustomed to strangers passing through on their way to greater things. The air smells of sagebrush and possibility.",
    notableBuildings: [
      "Sheriff's Office - Jake Harmon keeps the peace, such as it is",
      'Hawkins General Store - Everything a traveler needs for the road',
      "Traveler's Rest Inn - Simple lodging and Old Timer Gus's stories",
      'Town Stables - Horses and travel arrangements',
    ],
    shopLocations: [
      {
        name: 'Hawkins General Store',
        description: "Martha Hawkins runs the only shop in town. Fair prices, honest dealings. She'll stock you up with everything needed for frontier travel.",
      },
    ],
    dangerWarnings: [
      'Coyotes occasionally bold enough to approach the outskirts',
      'The road east to Iron Gulch passes through Coyote Canyon - be prepared',
    ],
    fastTravelUnlocked: true,
    discoveredSecrets: [],
    localRumors: [
      'Old Timer Gus knows every trail and mine in the territory',
      'IVRC has been expanding their operations aggressively',
      'Strange folk have been passing through, asking questions',
    ],
  },
  {
    id: 'location_dusty_springs',
    title: 'Dusty Springs',
    category: 'location_notes',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['town', 'transition', 'main_quest'],
    locationId: 'dusty_springs',
    description:
      "A larger frontier town built around a natural spring - the source of its name and its survival in this arid land. The town serves as a crossroads between the mining operations to the north and the ranching lands to the south. Sheriff Cole maintains order here, though the long arm of IVRC reaches even this far. There's tension beneath the town's dusty surface.",
    notableBuildings: [
      "Sheriff's Office - Sheriff Marcus Cole, a man of principle",
      "Doc Chen's Office - Medical supplies and a keen observer",
      "St. Michael's Church - Father Miguel offers spiritual comfort",
      'Telegraph Office - Penny keeps the wires humming',
      'General Store - Basic supplies at fair prices',
      'Gunsmith - Quality firearms and ammunition',
    ],
    shopLocations: [
      {
        name: 'General Store',
        description: 'Standard frontier supplies, provisions for travel.',
      },
      {
        name: "Doc Chen's Office",
        description: 'Medical supplies, both Western and traditional remedies.',
      },
      {
        name: 'Gunsmith',
        description: 'Firearms, ammunition, and weapon repairs.',
      },
    ],
    dangerWarnings: [
      'IVRC has informants throughout the town',
      'Copperhead Gang activity reported on the roads',
      'The spring water is safe, but watch for claim-jumpers at remote wells',
    ],
    fastTravelUnlocked: false,
    discoveredSecrets: [],
    localRumors: [
      'The church basement holds more than old hymn books',
      'Doc Chen heals people IVRC would rather see forgotten',
      'Sheriff Cole and the Mayor clash regularly over company business',
    ],
  },
  {
    id: 'location_iron_gulch',
    title: 'Iron Gulch',
    category: 'location_notes',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['town', 'mining', 'ivrc', 'main_hub', 'act_1'],
    locationId: 'iron_gulch',
    description:
      "The industrial heart of the territory, a bustling mining town carved into a narrow canyon. Smoke rises from the smelters day and night, and the constant clang of pickaxes echoes from the surrounding mountains. IVRC controls everything here - the mines, the stores, even the air men breathe. It's a place where fortunes are made and lives are lost in equal measure. The town never sleeps, running on three shifts of miners who fuel the company's endless hunger for ore.",
    notableBuildings: [
      'IVRC Mine Entrance - The heart of company operations',
      "Foreman's Office - Burke runs things with an iron fist",
      'Engineering Workshop - Clara Whitmore keeps the machines running',
      'Lucky Strike Saloon - Molly serves drinks and information',
      "Doc Holloway's Office - A drunk but capable surgeon",
      "Miners' Boarding House - Where workers rest between shifts",
      'Iron Valley Mining Supply - Company store, company prices',
    ],
    shopLocations: [
      {
        name: 'Iron Valley Mining Supply',
        description: 'IVRC-owned depot. Mining equipment, explosives, supplies. Prices favor the company.',
      },
      {
        name: 'Lucky Strike Saloon',
        description: 'Drinks, hot meals, and rumors. Molly knows everything.',
      },
      {
        name: "Doc Holloway's Medicine",
        description: 'Medical supplies for mining injuries. The doc drinks but his hands are steady.',
      },
    ],
    dangerWarnings: [
      'Mine sabotage has killed six men this month',
      'IVRC enforcers patrol the streets - watch your words',
      'The deep sections of the mine are off-limits without authorization',
      'Tensions between company men and Freeminer sympathizers run high',
    ],
    fastTravelUnlocked: false,
    discoveredSecrets: [],
    localRumors: [
      "Someone called 'The Engineer' is behind the sabotage",
      'Silas Crane is the popular scapegoat, but is he really guilty?',
      'Strange machinery has been heard deep in the old shafts',
      'Project Remnant - a name whispered only in shadows',
    ],
  },
  {
    id: 'location_mesa_point',
    title: 'Mesa Point',
    category: 'location_notes',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['town', 'outlaw', 'copperhead', 'dangerous', 'act_2'],
    locationId: 'mesa_point',
    description:
      "An outlaw settlement perched atop a defensible mesa - one way in, one way out. The Copperhead Gang runs things here, though they call it a 'free settlement.' It's a place where the law has no jurisdiction and questions get you killed. Despite its lawless nature, there's a strange order to Mesa Point - Diamondback's order. Cross her, and the vultures will find you in the desert.",
    notableBuildings: [
      'The Hideout - Where Diamondback holds court',
      'Black Market - Stolen goods and no questions asked',
      "The Fence - Where hot items become cold cash",
      'Outlaw Saloon - Rough drinks for rough people',
      'Makeshift Stables - Fast horses for fast getaways',
    ],
    shopLocations: [
      {
        name: 'Black Market',
        description: 'Stolen goods, illegal weapons, explosives. No questions asked, no receipts given.',
      },
      {
        name: 'The Fence',
        description: 'Convert valuable items to cash. Takes a cut, but no judgment.',
      },
    ],
    dangerWarnings: [
      'Strangers are not welcome - earn trust or earn a grave',
      'Never speak to lawmen about what happens here',
      'Cheating at cards is a killing offense',
      'Respect Diamondback or face the consequences',
    ],
    fastTravelUnlocked: false,
    discoveredSecrets: [],
    localRumors: [
      'Diamondback has a vendetta against IVRC - something personal',
      'The gang has been hitting company shipments with uncanny accuracy',
      "There's talk of an alliance between the Copperheads and Freeminers",
      'Someone inside IVRC is feeding information to the outlaws',
    ],
  },
  {
    id: 'location_coldwater',
    title: 'Coldwater',
    category: 'location_notes',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['town', 'ranching', 'peaceful', 'respite'],
    locationId: 'coldwater',
    description:
      "A pastoral ranching community far from the noise and smoke of the mining operations. The rolling grasslands support cattle ranches that have operated for generations. It's a place where people still tip their hats to strangers and water their horses at community troughs. But even here, the shadow of IVRC reaches - rustlers have been hitting the ranches, and some whisper it's no coincidence.",
    notableBuildings: [
      "McGraw's Ranch House - Rancher McGraw leads the community",
      "Vet Nell's Office - Animal doctor and more",
      "Rose's Inn - Comfortable lodging and home cooking",
      'Ranch Supply - Everything for cattle and horses',
      "The Wanderer's Camp - A mysterious traveler outside town",
    ],
    shopLocations: [
      {
        name: 'Ranch Supply',
        description: 'Equipment for ranchers - ropes, tools, animal feed, and basic provisions.',
      },
      {
        name: "Rose's Inn",
        description: 'Good food, clean beds, and respite from the road.',
      },
      {
        name: "Vet Nell's Office",
        description: 'Animal medicine, but she knows human anatomy too.',
      },
    ],
    dangerWarnings: [
      'Rustlers have been hitting ranches - travel in groups',
      'The badlands to the south are dangerous territory',
      'Watch for rattlesnakes in the tall grass',
    ],
    fastTravelUnlocked: false,
    discoveredSecrets: [],
    localRumors: [
      'The Wanderer has been tracking something for years',
      'The rustlers are too organized to be common thieves',
      'Professor Cogsworth has a workshop nearby - creates strange devices',
      'Some connection between the rustling and the conspiracy',
    ],
  },
  {
    id: 'location_salvation',
    title: 'Salvation',
    category: 'location_notes',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['town', 'religious', 'endgame', 'dangerous', 'act_3'],
    locationId: 'salvation',
    description:
      "A town risen from the desert badlands like a mirage - or a warning. A massive church steeple dominates the skyline, and Preacher Solomon's faithful move through the streets with disturbing purpose. Everything here feels wrong - too clean, too quiet, too devoted. The townsfolk speak in hushed tones of 'the coming salvation,' and their eyes hold the fervor of true believers. What has Solomon promised them?",
    notableBuildings: [
      "Solomon's Church - The heart of whatever this place truly is",
      'Community Hall - Where the faithful gather',
      'Provisions Store - Basic supplies, no luxuries',
      "Guest Quarters - For new arrivals being 'welcomed'",
    ],
    shopLocations: [
      {
        name: 'Salvation Provisions',
        description: 'Basic supplies only. The faithful need little material comfort.',
      },
    ],
    dangerWarnings: [
      'DO NOT trust anyone in this town',
      "The faithful are fanatically devoted to Solomon's cause",
      'Something ancient and dangerous lies beneath the church',
      'There may be no turning back once you enter',
    ],
    fastTravelUnlocked: false,
    discoveredSecrets: [],
    localRumors: [
      "Solomon is called 'The Shepherd' by those who fear him",
      'The conspiracy across the territory leads here',
      'Something from the old world sleeps beneath the altar',
      'The truth about Project Remnant can be found here',
    ],
  },
  // Route locations
  {
    id: 'location_dusty_trail',
    title: 'Dusty Trail',
    category: 'location_notes',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['route', 'travel', 'moderate_danger'],
    locationId: 'dusty_trail',
    description:
      "The main road connecting Frontier's Edge to Iron Gulch, winding through parched canyon lands and scrub desert. The journey takes about a day on horseback, longer on foot. Abandoned wagons and bleached bones along the trail serve as reminders that the frontier claims the unprepared.",
    notableBuildings: [],
    shopLocations: [],
    dangerWarnings: [
      'Bandits frequently ambush travelers',
      'Coyotes hunt in packs along the trail',
      'No water sources for miles - carry extra',
      'Coyote Canyon is particularly dangerous',
    ],
    fastTravelUnlocked: false,
    discoveredSecrets: [],
    localRumors: [
      'An abandoned wagon contains clues about a missing prospector',
      "Something strange was seen near the old prospector's claim",
    ],
  },
  {
    id: 'location_desert_pass',
    title: 'Desert Pass',
    category: 'location_notes',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['route', 'travel', 'high_danger'],
    locationId: 'desert_pass',
    description:
      "A treacherous route through sun-baked canyons connecting Iron Gulch to Mesa Point. The pass earned its reputation as a death trap - IVRC supply wagons are favorite targets of the Copperhead Gang. Only the desperate or the dangerous travel this road.",
    notableBuildings: [],
    shopLocations: [],
    dangerWarnings: [
      'Copperhead ambush territory - travel is extremely risky',
      'No shade or shelter for miles',
      'Rattlesnakes nest in the canyon walls',
      'IVRC patrols make it dangerous for outlaws AND honest folk',
    ],
    fastTravelUnlocked: false,
    discoveredSecrets: [],
    localRumors: [
      'The Copperheads know this territory like the back of their hands',
      'IVRC has increased patrols after recent robberies',
    ],
  },
  {
    id: 'location_mountain_road',
    title: 'Mountain Road',
    category: 'location_notes',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['route', 'travel', 'moderate_danger'],
    locationId: 'mountain_road',
    description:
      "A winding mountain path connecting Iron Gulch to Coldwater through the Iron Mountains. The road climbs through pine forests and alpine meadows, a welcome change from the desert. But the mountains have their own dangers - predators, harsh weather, and treacherous terrain.",
    notableBuildings: [],
    shopLocations: [],
    dangerWarnings: [
      'Mountain lions hunt along the higher elevations',
      'Weather can change rapidly - be prepared for cold',
      'Wolves have been spotted in the pine forests',
      'Some sections are treacherous in bad weather',
    ],
    fastTravelUnlocked: false,
    discoveredSecrets: [],
    localRumors: [
      'Freeminer camps are hidden somewhere in these mountains',
      'Old mines dot the hillsides - some still hold treasures',
    ],
  },
  {
    id: 'location_badlands_trail',
    title: 'Badlands Trail',
    category: 'location_notes',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['route', 'travel', 'high_danger'],
    locationId: 'badlands_trail',
    description:
      "A harsh trail through eroded badlands connecting Mesa Point and Coldwater to the final road to Salvation. The landscape is alien and hostile - twisted rock formations, dry gulches, and an ever-present sense of being watched. Few travel this route by choice.",
    notableBuildings: [],
    shopLocations: [],
    dangerWarnings: [
      'The land itself seems hostile - easy to get lost',
      'Dangerous creatures nest in the rock formations',
      'No reliable water sources',
      'Cult fanatics patrol closer to Salvation',
    ],
    fastTravelUnlocked: false,
    discoveredSecrets: [],
    localRumors: [
      'Rustler camps are hidden in the gulches',
      'Strange lights have been seen at night',
    ],
  },
  {
    id: 'location_final_trail',
    title: 'Final Trail',
    category: 'location_notes',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['route', 'travel', 'extreme_danger', 'point_of_no_return'],
    locationId: 'final_trail',
    description:
      "The last road to Salvation - a journey through the most desolate reaches of the badlands. This is the point of no return. Once you set foot on this trail, there is no turning back until the matter is settled. The faithful guard this approach, and ancient things stir in the earth below.",
    notableBuildings: [],
    shopLocations: [],
    dangerWarnings: [
      'POINT OF NO RETURN - Be absolutely prepared',
      'Cult fanatics attack all who approach',
      'Strange machinery can be heard underground',
      'There is no retreat from what awaits',
    ],
    fastTravelUnlocked: false,
    discoveredSecrets: [],
    localRumors: [
      'Those who enter Salvation rarely leave',
      'The truth of the conspiracy ends here',
    ],
  },
];

// ============================================================================
// BESTIARY - Enemies encountered
// ============================================================================

export interface BestiaryEntry extends JournalEntry {
  category: 'bestiary';
  enemyId: string;
  description: string;
  weaknesses: string[];
  resistances: string[];
  dropTable: { item: string; chance: string }[];
  loreBackground: string;
  combatTips: string[];
  timesDefeated: number;
}

/** Bestiary entries - unlocked by defeating enemies */
export const BESTIARY_ENTRIES: BestiaryEntry[] = [
  // ============================================================================
  // WILDLIFE
  // ============================================================================
  {
    id: 'bestiary_coyote',
    title: 'Coyote',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['wildlife', 'common', 'melee', 'pack'],
    enemyId: 'coyote',
    description:
      'Scrappy desert predators that hunt in small packs of two to three. Lean and hungry, they have adapted perfectly to the harsh frontier environment. What they lack in individual strength they make up for in numbers and persistence.',
    weaknesses: ['Fire', 'Loud noises can scatter the pack', 'Weak individually'],
    resistances: ['None - fairly vulnerable to all damage types'],
    dropTable: [
      { item: 'Coyote Pelt', chance: 'Common' },
      { item: 'Fangs', chance: 'Uncommon' },
    ],
    loreBackground:
      'Coyotes have lived in these lands since time immemorial, adapting to hunt everything from rabbits to unwary travelers. The frontier settlers learned quickly to keep fires burning at night and travel in groups. A lone coyote is a nuisance; a pack is a genuine threat.',
    combatTips: [
      'Focus on eliminating one at a time to reduce their numbers',
      'Keep moving to avoid being surrounded',
      'They will flee if enough of the pack is killed',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_rattlesnake',
    title: 'Rattlesnake',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['wildlife', 'common', 'melee', 'poison'],
    enemyId: 'rattlesnake',
    description:
      'A venomous serpent coiled among the rocks, recognizable by its distinctive rattle. Low health but delivers a poisonous bite that can debilitate even the hardiest frontier veteran. Their camouflage makes them difficult to spot before it is too late.',
    weaknesses: [
      'Low health - can be killed quickly if spotted',
      'Cold slows their reactions',
      'Fire',
    ],
    resistances: ['Poison (immune)'],
    dropTable: [
      { item: 'Snake Venom', chance: 'Common' },
      { item: 'Rattlesnake Skin', chance: 'Uncommon' },
    ],
    loreBackground:
      'The diamondback rattlesnake is feared throughout the frontier. Its venom can kill a man in hours without treatment, and even survivors often lose limbs. The rattle is nature\'s warning - if you hear it, you\'re already in the strike zone. Antivenom is worth its weight in gold out here.',
    combatTips: [
      'Keep antidote on hand at all times',
      'Listen for the rattle to detect them before they strike',
      'Kill quickly before poison can take effect',
      'Boots and thick clothing offer some protection',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_scorpion',
    title: 'Scorpion',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['wildlife', 'common', 'melee', 'poison', 'armored'],
    enemyId: 'scorpion',
    description:
      'A desert scorpion with a thick carapace and venomous stinger. Surprisingly resilient for their size, these creatures defend themselves aggressively when disturbed. Their natural armor deflects weaker attacks.',
    weaknesses: ['Fire', 'Crushing weapons bypass the carapace'],
    resistances: ['Light slashing damage', 'Poison (immune)'],
    dropTable: [
      { item: 'Scorpion Stinger', chance: 'Common' },
      { item: 'Carapace Fragment', chance: 'Uncommon' },
    ],
    loreBackground:
      'Scorpions have survived in the desert since before humans walked these lands. The frontier variety grows larger than those back East, their carapaces toughened by the harsh environment. Miners fear them most - scorpions love the cool darkness of mine shafts.',
    combatTips: [
      'Their armor is tough - use heavy weapons',
      'Watch for the tail strike when at close range',
      'Easier to avoid than to fight',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_wolf',
    title: 'Wolf',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['wildlife', 'uncommon', 'melee', 'pack'],
    enemyId: 'wolf',
    description:
      'Fierce pack hunters that coordinate their attacks with devastating effectiveness. Larger and more dangerous than coyotes, wolves hunt larger prey - including humans when food is scarce. Their howls echo through the mountains.',
    weaknesses: ['Fire - they fear flames instinctively', 'Isolated wolves are vulnerable'],
    resistances: ['Cold weather improves their performance'],
    dropTable: [
      { item: 'Wolf Pelt', chance: 'Common' },
      { item: 'Wolf Fangs', chance: 'Uncommon' },
    ],
    loreBackground:
      'Mountain wolves were nearly hunted to extinction by ranchers protecting their cattle, but they have returned to the high country with a vengeance. They remember what humans did to their kind, and show no mercy to the unwary. Their pack tactics are sophisticated - they will try to separate and surround their prey.',
    combatTips: [
      'Never fight wolves alone if you can avoid it',
      'Keep your back to something solid',
      'Killing the alpha can cause the pack to scatter',
      'Fire is your best defense',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_mountain_lion',
    title: 'Mountain Lion',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['wildlife', 'uncommon', 'melee', 'fast'],
    enemyId: 'mountain_lion',
    description:
      'A powerful feline ambush predator that strikes from concealment. Fast, agile, and armed with razor-sharp claws. They prefer to attack from above, dropping onto prey from rocky outcrops or tree branches.',
    weaknesses: ['Cannot attack effectively if you see them coming', 'Fire'],
    resistances: ['High evasion makes them hard to hit'],
    dropTable: [
      { item: 'Mountain Lion Pelt', chance: 'Uncommon' },
      { item: 'Mountain Lion Claw', chance: 'Common' },
    ],
    loreBackground:
      'The mountain lion is the apex predator of the Iron Mountains. Silent and patient, they can stalk prey for miles before striking. Ranchers lose cattle to them every year, and more than a few prospectors have disappeared in lion territory. If you feel like you are being watched in the mountains, you probably are.',
    combatTips: [
      'Keep looking up - they attack from above',
      'Travel in groups through lion territory',
      'Make noise to reduce the chance of ambush',
      'Once engaged, be aggressive - they flee from determined prey',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_bear',
    title: 'Grizzly Bear',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['wildlife', 'rare', 'melee', 'tank'],
    enemyId: 'bear',
    description:
      'A massive grizzly bear - hundreds of pounds of muscle, fur, and fury. Slow but devastating when it connects. Its thick hide reduces damage from most weapons. Encountering one unprepared is often fatal.',
    weaknesses: ['Slow movement', 'Fire', 'Can be distracted by food'],
    resistances: ['High armor reduces physical damage', 'Intimidation - they fear nothing'],
    dropTable: [
      { item: 'Bear Pelt', chance: 'Uncommon' },
      { item: 'Bear Claws', chance: 'Uncommon' },
      { item: 'Bear Meat', chance: 'Common' },
    ],
    loreBackground:
      'The grizzly bear is the undisputed king of the frontier wilderness. These massive predators can weigh over a thousand pounds and have been known to tear apart wagons to get at food stores. Most frontier wisdom says to avoid them entirely - but some hunters seek them out for their valuable pelts.',
    combatTips: [
      'Do NOT engage without heavy firepower',
      'Keep your distance - their reach is deceptive',
      'Aim for the head if you have a rifle',
      'Running is often the wisest choice',
      'Playing dead may work - or may not',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_giant_scorpion',
    title: 'Giant Scorpion',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['wildlife', 'uncommon', 'melee', 'poison', 'armored'],
    enemyId: 'giant_scorpion',
    description:
      'A monstrous scorpion the size of a large dog, with a carapace like armor plating and venom that can kill a horse. These aberrations are found in the deeper desert and ancient mine shafts. No one knows why they grow so large here.',
    weaknesses: ['Fire', 'Underbelly is vulnerable', 'Slow movement'],
    resistances: ['Heavy armor on top', 'Poison (immune)'],
    dropTable: [
      { item: 'Giant Stinger', chance: 'Uncommon' },
      { item: 'Reinforced Carapace', chance: 'Rare' },
      { item: 'Potent Venom', chance: 'Uncommon' },
    ],
    loreBackground:
      'Giant scorpions are nightmares given form. Some say they grow large from feeding on the strange minerals in the deep mines. Others whisper of older origins - remnants of a time when monsters walked the earth. Whatever the truth, these creatures are territorial and deadly.',
    combatTips: [
      'Their armor is nearly impenetrable - target the joints',
      'Keep antidote ready - their venom is concentrated',
      'Use explosives if available',
      'Attack from range to avoid the deadly claws',
    ],
    timesDefeated: 0,
  },
  // ============================================================================
  // BANDITS
  // ============================================================================
  {
    id: 'bestiary_lone_bandit',
    title: 'Lone Bandit',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['human', 'common', 'melee', 'bandit'],
    enemyId: 'lone_bandit',
    description:
      'A desperate criminal surviving on the frontier through theft and violence. Basic equipment and limited training, but dangerous when cornered. These men have nothing left to lose.',
    weaknesses: ['Poor equipment', 'No backup', 'Desperate - may surrender'],
    resistances: ['None'],
    dropTable: [
      { item: "Bandit's Pouch", chance: 'Common' },
      { item: 'Worn Knife', chance: 'Common' },
      { item: 'Stolen Goods', chance: 'Uncommon' },
    ],
    loreBackground:
      'The frontier attracts men fleeing the law, failed prospectors, and those with nowhere else to go. Many turn to banditry when honest work proves impossible. Most lone bandits are more pathetic than dangerous - but a desperate man with a knife is still deadly.',
    combatTips: [
      'Often willing to surrender if outmatched',
      'Watch for concealed weapons',
      'May have friends nearby',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_bandit_gunner',
    title: 'Bandit Gunner',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['human', 'common', 'ranged', 'bandit'],
    enemyId: 'bandit_gunner',
    description:
      'A pistol-wielding outlaw who prefers to fight from range. More dangerous than knife-wielding bandits, these criminals have acquired firearms through theft or murder. They know enough to take cover and aim.',
    weaknesses: ['Light armor', 'Poor accuracy compared to trained shooters'],
    resistances: ['None'],
    dropTable: [
      { item: "Bandit's Pouch", chance: 'Common' },
      { item: 'Worn Revolver', chance: 'Uncommon' },
      { item: 'Pistol Ammo', chance: 'Common' },
    ],
    loreBackground:
      'A gun changes everything on the frontier. Even a poor shot becomes dangerous when armed. Bandit gunners often acquired their weapons by killing their previous owners - a reminder that violence begets violence out here.',
    combatTips: [
      'Close the distance quickly to reduce their advantage',
      'Use cover - their accuracy improves at range',
      'Prioritize them over melee bandits',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_bandit_leader',
    title: 'Bandit Leader',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['human', 'uncommon', 'ranged', 'bandit', 'leader'],
    enemyId: 'bandit_leader',
    description:
      'The leader of a bandit gang - a hardened criminal who commands through fear and proven violence. Better equipped and more skilled than their followers, they direct attacks and inspire (or terrify) their men into fighting harder.',
    weaknesses: ['Killing them may cause followers to flee'],
    resistances: ['Better armor than regular bandits'],
    dropTable: [
      { item: 'Quality Revolver', chance: 'Uncommon' },
      { item: 'Stolen Valuables', chance: 'Uncommon' },
      { item: 'Gang Badge', chance: 'Common' },
    ],
    loreBackground:
      'A bandit becomes a leader through brutality and cunning. They keep the best loot, the best weapons, and the prettiest horses. But leadership comes with enemies - both lawmen hunting them and subordinates waiting for their chance to take over.',
    combatTips: [
      'Eliminating the leader first can break morale',
      'They often have the best cover position',
      'Expect them to have better weapons',
      'May try to escape if the fight goes badly',
    ],
    timesDefeated: 0,
  },
  // ============================================================================
  // COPPERHEAD GANG
  // ============================================================================
  {
    id: 'bestiary_outlaw_gunslinger',
    title: 'Copperhead Gunslinger',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['human', 'uncommon', 'ranged', 'copperhead', 'fast'],
    enemyId: 'outlaw_gunslinger',
    description:
      'A quick-draw artist loyal to the Copperhead Gang. These are not desperate bandits but trained outlaws who have chosen their path. High damage and deadly accurate, they live and die by the gun.',
    weaknesses: ['Light armor for mobility', 'Cocky - may take risks'],
    resistances: ['High evasion', 'Fast reflexes'],
    dropTable: [
      { item: 'Quality Revolver', chance: 'Uncommon' },
      { item: 'Outlaw Badge', chance: 'Common' },
      { item: 'Pistol Ammo', chance: 'Common' },
    ],
    loreBackground:
      'The Copperhead Gang recruits the best - or the most desperate. Their gunslingers practice quick-draw religiously, and many were hired guns or lawmen before they turned outlaw. They see themselves as freedom fighters against IVRC, which makes them all the more dangerous.',
    combatTips: [
      'Do not try to outdraw them - use cover',
      'Their accuracy drops in close combat',
      'Watch for dual-wielding variants',
      'They will prioritize targets who seem threatening',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_outlaw_enforcer',
    title: 'Copperhead Enforcer',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['human', 'uncommon', 'ranged', 'copperhead', 'tank'],
    enemyId: 'outlaw_enforcer',
    description:
      'A heavily armored gang enforcer carrying a devastating shotgun. These are the muscle of the Copperhead Gang - big, tough, and not afraid to get close. They protect more valuable gang members.',
    weaknesses: ['Slow', 'Poor at range', 'Heavy armor makes stealth impossible'],
    resistances: ['High armor', 'Difficult to stagger'],
    dropTable: [
      { item: 'Shotgun', chance: 'Uncommon' },
      { item: 'Shotgun Shells', chance: 'Common' },
      { item: 'Reinforced Coat', chance: 'Rare' },
    ],
    loreBackground:
      'Enforcers are the gang\'s answer to IVRC guards - armored brutes who can take and deal punishment. Many are former miners who joined the gang after IVRC wronged them. Their hatred of the company makes them fearless in battle.',
    combatTips: [
      'Keep your distance - shotguns are devastating up close',
      'Focus fire to get through their armor',
      'Use cover to force them to advance',
      'They are slow - use mobility to your advantage',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_copperhead_dynamiter',
    title: 'Copperhead Dynamiter',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['human', 'rare', 'ranged', 'copperhead', 'explosives'],
    enemyId: 'copperhead_dynamiter',
    description:
      'A demolitions expert who loves making things go boom. These specialists carry dynamite and are not afraid to use it, even at questionable ranges. The blast radius of their attacks makes them terrifying.',
    weaknesses: ['Light armor', 'Their own explosives can backfire'],
    resistances: ['None'],
    dropTable: [
      { item: 'Dynamite Stick', chance: 'Common' },
      { item: 'Fuse Wire', chance: 'Uncommon' },
      { item: 'Blast Caps', chance: 'Uncommon' },
    ],
    loreBackground:
      'Former miners make the best demolitions experts - they understand explosives intimately. The Copperheads use dynamiters to destroy IVRC property, blow open safes, and create chaos. Their psychology tends toward the... enthusiastic.',
    combatTips: [
      'Kill them before they can throw',
      'Keep spread out to minimize blast damage',
      'Shooting their dynamite can be... effective',
      'They telegraph their throws - dodge accordingly',
    ],
    timesDefeated: 0,
  },
  // ============================================================================
  // IVRC FORCES
  // ============================================================================
  {
    id: 'bestiary_ivrc_guard',
    title: 'IVRC Guard',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['human', 'common', 'ranged', 'ivrc'],
    enemyId: 'ivrc_guard',
    description:
      'A company security guard protecting IVRC interests. Professional, disciplined, and well-equipped with standard-issue firearms. They follow orders without question and show no mercy to enemies of the company.',
    weaknesses: ['Predictable tactics', 'Rely on backup'],
    resistances: ['Company armor provides moderate protection'],
    dropTable: [
      { item: 'Company Revolver', chance: 'Uncommon' },
      { item: 'IVRC Badge', chance: 'Common' },
      { item: 'Guard Uniform', chance: 'Common' },
    ],
    loreBackground:
      'IVRC guards are hired for their obedience rather than their conscience. The company pays well and asks few questions - the perfect arrangement for men willing to do dirty work. Many are former soldiers, criminals, or simply desperate.',
    combatTips: [
      'They work in teams - isolate them if possible',
      'Expect reinforcements if shots are fired',
      'Company doctrine emphasizes defense',
      'May have knowledge of local patrol routes',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_ivrc_marksman',
    title: 'IVRC Marksman',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['human', 'uncommon', 'ranged', 'ivrc'],
    enemyId: 'ivrc_marksman',
    description:
      'An elite company sniper stationed in elevated positions. Deadly accurate with a rifle, they provide overwatch for IVRC operations. Taking them out first is essential.',
    weaknesses: ['Vulnerable in close combat', 'Exposed positions'],
    resistances: ['Hard to spot', 'Extreme accuracy at range'],
    dropTable: [
      { item: 'Company Rifle', chance: 'Uncommon' },
      { item: 'Rifle Ammo', chance: 'Common' },
      { item: 'Scope', chance: 'Rare' },
    ],
    loreBackground:
      'IVRC learned early that snipers are worth their weight in gold. Marksmen protect key installations, eliminate troublemakers from a distance, and make examples of those who resist. They are cold, patient, and deadly.',
    combatTips: [
      'Find cover immediately if under sniper fire',
      'Use smoke or distractions to close distance',
      'They must reload - time your advances',
      'Mark their position and flank if possible',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_ivrc_captain',
    title: 'IVRC Captain',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['human', 'rare', 'ranged', 'ivrc', 'mini_boss'],
    enemyId: 'ivrc_captain',
    description:
      'A seasoned commander of IVRC security forces. Captains coordinate guard units, have access to better equipment, and are authorized to use lethal force at their discretion. Encountering one means you have become a priority target.',
    weaknesses: ['Elimination causes disruption to guard coordination'],
    resistances: ['Superior equipment', 'Tactical awareness', 'Backup on call'],
    dropTable: [
      { item: 'Officer Revolver', chance: 'Rare' },
      { item: 'Captain Insignia', chance: 'Common' },
      { item: 'Company Documents', chance: 'Uncommon' },
    ],
    loreBackground:
      'IVRC captains have proven their loyalty through years of service - and through deeds they do not discuss. They have the authority to order executions, arrest anyone on company property, and requisition any resources they need. Crossing one is equivalent to declaring war on the company.',
    combatTips: [
      'Expect tactical competence - they know combat',
      'May carry secondary weapons',
      'Their death will bring investigation',
      'May have valuable intelligence',
    ],
    timesDefeated: 0,
  },
  // ============================================================================
  // AUTOMATONS
  // ============================================================================
  {
    id: 'bestiary_clockwork_drone',
    title: 'Clockwork Drone',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['automaton', 'uncommon', 'ranged', 'armored'],
    enemyId: 'clockwork_drone',
    description:
      'A small mechanical drone that patrols ancient ruins and forbidden areas. Relics of a forgotten project, these constructs attack intruders on sight. Their brass and steel construction makes them resistant to conventional weapons.',
    weaknesses: ['Water disrupts mechanisms', 'Lightning/electrical damage'],
    resistances: ['High armor', 'Immune to poison', 'Immune to fear'],
    dropTable: [
      { item: 'Mechanical Parts', chance: 'Common' },
      { item: 'Copper Wire', chance: 'Common' },
      { item: 'Power Cell', chance: 'Rare' },
    ],
    loreBackground:
      'Nobody knows who built the clockwork drones or why. They guard places that have been abandoned for decades, attacking anyone who enters. Some whisper that they are connected to Project Remnant - IVRC\'s most closely guarded secret.',
    combatTips: [
      'Aim for joints and sensors',
      'They have predictable patrol patterns',
      'EMPs or electrical attacks are highly effective',
      'Salvaging destroyed drones yields valuable parts',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_steam_golem',
    title: 'Steam Golem',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['automaton', 'rare', 'melee', 'tank'],
    enemyId: 'steam_golem',
    description:
      'A massive steam-powered construct that lumbers through ancient facilities. Extremely slow but hits like a locomotive. The sound of its approach - hissing steam and grinding gears - gives warning but also terror.',
    weaknesses: ['Very slow', 'Needs time to build steam pressure'],
    resistances: ['Extreme armor', 'Immune to most status effects'],
    dropTable: [
      { item: 'Steam Valve', chance: 'Uncommon' },
      { item: 'Automaton Plating', chance: 'Uncommon' },
      { item: 'Pressure Gauge', chance: 'Rare' },
    ],
    loreBackground:
      'Steam golems were built for heavy labor - moving earth, hauling ore, clearing obstacles. But someone reprogrammed them for war. They are walking siege engines, nearly unstoppable once they build momentum. The technology to create them has been lost... or hidden.',
    combatTips: [
      'Keep moving - they cannot turn quickly',
      'Attack the boiler on their back if possible',
      'Use the environment against them',
      'Fighting one head-on is suicide',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_corrupted_prospector',
    title: 'Corrupted Prospector',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['corrupted', 'uncommon', 'melee'],
    enemyId: 'corrupted_prospector',
    description:
      'A miner twisted by exposure to strange machinery in the deep mines. Once human, now something between flesh and machine. They attack with the tools of their former trade, driven by instincts no longer recognizable as human.',
    weaknesses: ['Fire cleanses the corruption', 'Holy symbols may cause hesitation'],
    resistances: ['Feels no pain', 'Immune to fear', 'Partial poison resistance'],
    dropTable: [
      { item: 'Corrupted Ore', chance: 'Common' },
      { item: 'Mining Equipment', chance: 'Uncommon' },
      { item: 'Strange Implant', chance: 'Rare' },
    ],
    loreBackground:
      'Something in the deep mines changes those who stay too long. It starts with strange dreams, then blackouts, then... this. The corrupted still wear their mining clothes, still carry their picks. But there is nothing human left behind their eyes. What transformed them? Project Remnant may hold the answer.',
    combatTips: [
      'They feel no pain - disabling attacks are ineffective',
      'Fire is highly effective',
      'May have been someone you knew',
      'Watch for mechanical augmentations',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_mechanical_horror',
    title: 'Mechanical Horror',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['automaton', 'rare', 'melee', 'late_game'],
    enemyId: 'mechanical_horror',
    description:
      'A nightmarish fusion of machine and something organic. These abominations are found only in the deepest ruins, guarding secrets that were meant to stay buried. Multiple attack types and terrifying appearance.',
    weaknesses: ['Fire damages the organic components', 'EMP disrupts mechanical systems'],
    resistances: ['High armor', 'Regenerates slowly', 'Multiple attack modes'],
    dropTable: [
      { item: 'Horror Core', chance: 'Rare' },
      { item: 'Organic Mesh', chance: 'Uncommon' },
      { item: 'Ancient Circuitry', chance: 'Rare' },
    ],
    loreBackground:
      'The mechanical horrors are the darkest secret of Project Remnant - attempts to merge human consciousness with machine. The experiments failed... or perhaps succeeded too well. They are aware, in their way. And they are angry.',
    combatTips: [
      'Late-game threat - be fully prepared',
      'They adapt to repeated tactics',
      'Destroying the core stops regeneration',
      'Not worth fighting unless necessary',
    ],
    timesDefeated: 0,
  },
  // ============================================================================
  // BOSSES
  // ============================================================================
  {
    id: 'bestiary_bandit_king',
    title: 'The Bandit King',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['human', 'legendary', 'boss', 'act1'],
    enemyId: 'bandit_king',
    description:
      'The ruthless ruler of the frontier bandits, commanding loyalty through fear and gold. Armed with the finest stolen weapons and protected by loyal guards, he has carved out a kingdom of crime in the wilderness.',
    weaknesses: ['Arrogance may lead to mistakes', 'His guards can be turned'],
    resistances: ['Excellent equipment', 'Combat experience', 'Human shields'],
    dropTable: [
      { item: "King's Revolver", chance: 'Guaranteed' },
      { item: "Bandit King's Crown", chance: 'Guaranteed' },
      { item: 'Treasure Stash Key', chance: 'Guaranteed' },
    ],
    loreBackground:
      'Every frontier breeds its kings, and this one rose through blood and betrayal. He controls the bandit gangs through a network of lieutenants and informants. IVRC has tried to eliminate him, the law has posted bounties, but he remains elusive and dangerous.',
    combatTips: [
      'Eliminate his guards first to isolate him',
      'He has multiple phases in combat',
      'May try to escape if losing',
      'Watch for hidden weapons',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_rattlesnake_king',
    title: 'The Rattlesnake King',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['animal', 'legendary', 'boss', 'optional'],
    enemyId: 'rattlesnake_king',
    description:
      'A monstrous rattlesnake of impossible size, mutated by exposure to strange minerals in the deep canyons. Its venom can kill a horse in seconds. Coiled in its lair, it guards a treasure hoard accumulated from countless victims.',
    weaknesses: ['Cold slows it significantly', 'Eyes are vulnerable'],
    resistances: ['Thick scales deflect bullets', 'Poison immune', 'Massive health pool'],
    dropTable: [
      { item: 'Rattlesnake Crown', chance: 'Guaranteed' },
      { item: 'Royal Venom Sac', chance: 'Guaranteed' },
      { item: 'Ancient Scale', chance: 'Guaranteed' },
    ],
    loreBackground:
      'Native legends speak of the great serpent that sleeps in the earth - a guardian of the land from the time before humans. Whether this creature is that legend or merely the result of unnatural mutation, it is worshipped by some and feared by all.',
    combatTips: [
      'Stock MANY antidotes before attempting',
      'Watch for coil crush attack',
      'The rattle precedes a strike',
      'Can be bypassed with enough Snake Venom or knowledge',
    ],
    timesDefeated: 0,
  },
  {
    id: 'bestiary_iron_tyrant',
    title: 'The Iron Tyrant',
    category: 'bestiary',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['automaton', 'legendary', 'boss', 'final'],
    enemyId: 'iron_tyrant',
    description:
      'The final boss - a massive war machine awakened from the depths. This is Project Remnant\'s ultimate creation: an automaton of unprecedented power fueled by ancient technology and terrible purpose. Multiple combat phases as it reveals new weapons.',
    weaknesses: ['Exposed core between phases', 'Ancient control words'],
    resistances: ['Nearly impervious armor', 'Multiple weapon systems', 'Self-repair'],
    dropTable: [
      { item: "Tyrant's Core", chance: 'Guaranteed' },
      { item: 'Ancient Power Source', chance: 'Guaranteed' },
      { item: 'Victory Trophy', chance: 'Guaranteed' },
    ],
    loreBackground:
      'The Iron Tyrant was built in an age before the frontier was settled - a weapon of war from a civilization that fell to its own creations. IVRC found it and tried to control it. They failed. Now it rises, and only those who have gathered allies and knowledge across the territory have any hope of stopping it.',
    combatTips: [
      'THE final challenge - bring everything',
      'Allies gathered throughout the game can help',
      'Learn its attack patterns in phase one',
      'The core is vulnerable between phases',
      'Do not give up - victory is possible',
    ],
    timesDefeated: 0,
  },
];

// ============================================================================
// ITEM ENCYCLOPEDIA - Important items
// ============================================================================

export interface ItemEncyclopediaEntry extends JournalEntry {
  category: 'item_encyclopedia';
  itemId: string;
  description: string;
  historicalSignificance: string;
  usageTips: string[];
  whereFound: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

/** Item encyclopedia - key and unique items */
export const ITEM_ENCYCLOPEDIA: ItemEncyclopediaEntry[] = [
  // ============================================================================
  // QUEST ITEMS
  // ============================================================================
  {
    id: 'item_prospector_journal',
    title: "Jed's Journal",
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['quest_item', 'document', 'clue'],
    itemId: 'prospector_journal',
    description:
      "The personal journal of Jed, the missing prospector. Water-stained and dog-eared, it contains detailed notes about his claims, observations about suspicious activity, and his growing fear that someone was following him.",
    historicalSignificance:
      "This journal provides the first concrete evidence of the conspiracy. Jed noticed patterns that others missed - IVRC men asking questions, strangers watching the trails, accidents that seemed too convenient.",
    usageTips: [
      'Reading it unlocks clues about the conspiracy',
      'Can be shown to certain NPCs for additional information',
      "The last entry mentions 'sabotage at the mine' - a crucial lead",
    ],
    whereFound: ["Hidden in Jed's abandoned wagon on Dusty Trail"],
    rarity: 'uncommon',
  },
  {
    id: 'item_mine_evidence',
    title: 'Mine Sabotage Evidence',
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['quest_item', 'evidence', 'clue'],
    itemId: 'mine_sabotage_evidence',
    description:
      'Physical evidence of deliberate sabotage: a cut support beam, remnants of tampered equipment, and a torn piece of distinctive cloth caught on a nail. This proves the mine accidents are no accident.',
    historicalSignificance:
      'This evidence could expose the conspiracy or condemn the wrong man, depending on how it is used. The truth is more complex than simple sabotage - someone wants to frame the Freeminers for crimes they did not commit.',
    usageTips: [
      'Can be presented to Foreman Burke',
      'May be used to clear Silas Crane',
      'Points toward "The Engineer" as the true culprit',
    ],
    whereFound: ['Deep section of the Iron Gulch mine'],
    rarity: 'uncommon',
  },
  {
    id: 'item_claras_gadget',
    title: "Clara's Gadget",
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['quest_item', 'tool', 'steampunk'],
    itemId: 'claras_gadget',
    description:
      "A curious mechanical device designed by Engineer Clara. It appears to detect vibrations through solid rock, potentially useful for finding hidden chambers or detecting approaching danger underground.",
    historicalSignificance:
      "Clara's innovations are ahead of their time. This gadget represents her dream of using technology to save lives rather than exploit workers. It may prove invaluable in the challenges ahead.",
    usageTips: [
      'Can detect hidden passages in mines and ruins',
      'Warns of approaching danger underground',
      'May reveal secrets invisible to the naked eye',
    ],
    whereFound: ['Given by Clara Whitmore if you earn her trust'],
    rarity: 'rare',
  },
  {
    id: 'item_conspiracy_documents',
    title: 'Conspiracy Documents',
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['quest_item', 'document', 'evidence'],
    itemId: 'conspiracy_documents',
    description:
      'Incriminating papers that outline the conspiracy: payments to saboteurs, references to "The Shepherd" and Salvation, and hints about Project Remnant. The handwriting is precise and cold.',
    historicalSignificance:
      "These documents connect the dots between the sabotage, the outlaws, and the mysterious settlement of Salvation. They prove that something much larger than mine accidents is unfolding across the territory.",
    usageTips: [
      'Essential for understanding the full conspiracy',
      'Can be shown to allies to gain their support',
      'Points the way to the final confrontation',
    ],
    whereFound: ['Found on enemies connected to the conspiracy'],
    rarity: 'rare',
  },
  {
    id: 'item_wanted_poster',
    title: 'Wanted Poster',
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['bounty', 'document'],
    itemId: 'wanted_poster',
    description:
      "An official bounty notice for a known outlaw. The paper is cheap but the reward is real - dead or alive, though 'alive' often pays more. Every frontier town has these plastered on boards.",
    historicalSignificance:
      "Bounty hunting has been a frontier tradition since the first outlaws fled West. These posters represent both justice and its limitations - often the innocent are hunted while the truly guilty walk free.",
    usageTips: [
      'Track down the target to claim the bounty',
      'Some targets may be willing to negotiate',
      'Dead bounties pay less but are simpler',
    ],
    whereFound: ["Sheriff's offices and bounty boards throughout the territory"],
    rarity: 'common',
  },
  // ============================================================================
  // WEAPONS
  // ============================================================================
  {
    id: 'item_revolver',
    title: 'Standard Revolver',
    category: 'item_encyclopedia',
    unlocked: true, // Common enough to start known
    read: false,
    bookmarked: false,
    tags: ['weapon', 'firearm', 'pistol'],
    itemId: 'revolver_standard',
    description:
      'A reliable six-shooter, the standard sidearm of the American frontier. This particular model holds six .45 caliber rounds and can be reloaded in about three seconds by an experienced shooter.',
    historicalSignificance:
      "The revolver democratized violence on the frontier. Suddenly a small shopkeeper could defend himself against a larger opponent. 'God made men, but Sam Colt made them equal,' as the saying goes.",
    usageTips: [
      'Balance of damage and accuracy',
      'Keep spare ammunition on hand',
      'Regular cleaning prevents jamming',
      'Effective at medium range',
    ],
    whereFound: ['Sold at most gun shops', 'Common loot from human enemies'],
    rarity: 'common',
  },
  {
    id: 'item_rifle',
    title: 'Bolt-Action Rifle',
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['weapon', 'firearm', 'long_gun'],
    itemId: 'rifle_standard',
    description:
      'A bolt-action rifle accurate at long range but slow to fire. The workmanship is solid if unexceptional, designed for frontier conditions - dust, heat, and rough handling.',
    historicalSignificance:
      "Rifles changed warfare and hunting alike. A skilled rifleman can engage targets at ranges where pistols are useless. On the frontier, a good rifle means the difference between eating and starving.",
    usageTips: [
      'Excellent for starting combat from concealment',
      'Slow rate of fire - make every shot count',
      'Keep distance from enemies',
      'Regular cleaning is essential',
    ],
    whereFound: ['Gun shops', 'Hunters and marksmen'],
    rarity: 'uncommon',
  },
  {
    id: 'item_shotgun',
    title: 'Double-Barrel Shotgun',
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['weapon', 'firearm', 'close_range'],
    itemId: 'shotgun_standard',
    description:
      'A devastating weapon at close range, this double-barrel shotgun fires buckshot that spreads in a wide pattern. Two shots before reloading, but those two shots often end the fight.',
    historicalSignificance:
      "Shotguns are the great equalizer in close quarters. Even an amateur can cause devastation at short range. They're favored by stagecoach guards, homesteaders, and anyone who might face multiple attackers.",
    usageTips: [
      'Devastating up close, useless at range',
      'Two shots, then a long reload',
      'Effective against groups of enemies',
      'The sound alone can deter attackers',
    ],
    whereFound: ['Gun shops', 'Ranch supply stores', 'Guards and enforcers'],
    rarity: 'uncommon',
  },
  {
    id: 'item_steampunk_blade',
    title: 'Steampunk Blade',
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['weapon', 'melee', 'steampunk', 'late_game'],
    itemId: 'steampunk_blade',
    description:
      'A mechanically-enhanced blade from the Old Works, humming with barely contained power. Brass fittings and copper inlays channel energy through the blade, causing it to vibrate at frequencies that cut through armor.',
    historicalSignificance:
      "This is technology from Project Remnant - proof that IVRC's experiments went far beyond simple mining improvements. Who made this blade, and why? The answers lie in the depths.",
    usageTips: [
      'Exceptional damage for a melee weapon',
      'Cuts through armor effectively',
      'The humming may reveal your position',
      'Requires maintenance with specialized tools',
    ],
    whereFound: ['Ancient ruins and Old Works facilities'],
    rarity: 'rare',
  },
  // ============================================================================
  // CONSUMABLES
  // ============================================================================
  {
    id: 'item_health_tonic',
    title: 'Health Tonic',
    category: 'item_encyclopedia',
    unlocked: true,
    read: false,
    bookmarked: false,
    tags: ['consumable', 'medical', 'healing'],
    itemId: 'health_potion',
    description:
      "Dr. Thornton's Patent Medicine - a thick brown liquid that tastes like turpentine mixed with honey. Despite the dubious taste, it genuinely accelerates healing and dulls pain.",
    historicalSignificance:
      "Patent medicines are the frontier's answer to limited medical care. Most are useless snake oil, but a few - like this one - contain ingredients that actually work. The recipe is a closely guarded secret.",
    usageTips: [
      'Restores 30 health points',
      'Can be used during combat',
      'Stock up before dangerous areas',
      'Works best when not critically wounded',
    ],
    whereFound: ['General stores', 'Doctor offices', 'Medical supplies'],
    rarity: 'common',
  },
  {
    id: 'item_antidote',
    title: 'Antidote',
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['consumable', 'medical', 'cure'],
    itemId: 'antidote',
    description:
      'A carefully prepared extract that counteracts snake and scorpion venom. The milky liquid must be taken quickly after envenomation to be effective.',
    historicalSignificance:
      'Antidote production is an art passed down through generations. The ingredients must be gathered fresh and prepared precisely. A single dose can mean the difference between life and an agonizing death.',
    usageTips: [
      'Cures poison and restores some health',
      'Essential in areas with venomous creatures',
      'Provides temporary poison resistance',
      'Carry several when exploring canyons or mines',
    ],
    whereFound: ['Doctor offices', 'Alchemists', 'Can be crafted from venom'],
    rarity: 'common',
  },
  {
    id: 'item_stimulant',
    title: 'Stimulant Tonic',
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['consumable', 'medical', 'buff'],
    itemId: 'stimulant_tonic',
    description:
      'A powerful pick-me-up that banishes fatigue and sharpens the senses. The ingredients are questionable, but the effects are undeniable. Extended use is not recommended.',
    historicalSignificance:
      'Stimulants have kept miners working double shifts, soldiers marching through the night, and travelers pushing past their limits. The cost comes later, but sometimes later is acceptable.',
    usageTips: [
      'Reduces fatigue significantly',
      'Boosts stamina regeneration',
      'Use before long journeys or difficult fights',
      'Side effects include jitters and poor sleep',
    ],
    whereFound: ['Doc Holloway', 'Black market', 'Certain merchants'],
    rarity: 'uncommon',
  },
  // ============================================================================
  // VALUABLE ITEMS
  // ============================================================================
  {
    id: 'item_automaton_core',
    title: 'Automaton Power Core',
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['valuable', 'steampunk', 'technology'],
    itemId: 'automaton_core',
    description:
      'A strange glowing core extracted from a destroyed automaton. It pulses with contained energy, warm to the touch even hours after removal. The technology to create these is lost... or hidden.',
    historicalSignificance:
      'These cores are the heart of Project Remnant. Each one represents decades of research and impossible engineering. Collectors pay handsomely, but some believe they should be destroyed rather than sold.',
    usageTips: [
      'Extremely valuable to the right buyers',
      'Can be used in certain crafting recipes',
      'Professor Cogsworth may be interested',
      'Carrying too many may attract attention',
    ],
    whereFound: ['Destroyed automatons', 'Ancient ruins'],
    rarity: 'rare',
  },
  {
    id: 'item_bear_pelt',
    title: 'Bear Pelt',
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['trade_good', 'animal', 'valuable'],
    itemId: 'bear_pelt',
    description:
      'A massive grizzly bear pelt, thick and lustrous. The fur is prized for both warmth and prestige. Obtaining one requires either exceptional hunting skill or exceptional luck.',
    historicalSignificance:
      'Bear pelts have been traded on the frontier since the first trappers arrived. They represent both the danger and the bounty of the wilderness. A man wearing a bear coat is either very wealthy or very dangerous.',
    usageTips: [
      'Very valuable trade good',
      'Some craftsmen can make armor from it',
      'Impressive gift for certain NPCs',
      'Heavy - consider carrying capacity',
    ],
    whereFound: ['Killed grizzly bears'],
    rarity: 'rare',
  },
  // ============================================================================
  // LORE ITEMS
  // ============================================================================
  {
    id: 'item_mine_key',
    title: 'Mine Key',
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['key_item', 'unlock'],
    itemId: 'mine_key',
    description:
      'A rusted iron key with a pickaxe symbol stamped into the bow. It opens restricted areas of the mines - places IVRC does not want workers or visitors to see.',
    historicalSignificance:
      'Keys like this are given only to foremen and company officials. Possessing one without authorization is grounds for immediate arrest... or worse.',
    usageTips: [
      'Opens locked mine doors',
      'May grant access to secret areas',
      'Keep hidden - possession is suspicious',
    ],
    whereFound: ['Foremen', 'IVRC officials', 'Hidden in offices'],
    rarity: 'uncommon',
  },
  {
    id: 'item_town_pass',
    title: 'Town Pass',
    category: 'item_encyclopedia',
    unlocked: false,
    read: false,
    bookmarked: false,
    tags: ['key_item', 'access'],
    itemId: 'town_pass',
    description:
      'Official documentation granting access to restricted areas. The paper is stamped with IVRC seals and signed by authorized officials. Forgeries are common but risky.',
    historicalSignificance:
      'IVRC controls movement in their territory through bureaucracy as much as force. Without proper papers, you are automatically suspicious. With them, doors open and questions stop.',
    usageTips: [
      'Grants access to restricted areas',
      'May avoid confrontation with guards',
      'Forgeries can be detected - use carefully',
    ],
    whereFound: ['Issued by officials', 'Can be stolen or forged'],
    rarity: 'uncommon',
  },
];

// ============================================================================
// PLAYER NOTES - Custom note system
// ============================================================================

export interface PlayerNote extends JournalEntry {
  category: 'player_notes';
  content: string;
  linkedLocationId?: string;
  linkedNpcId?: string;
  linkedQuestId?: string;
  mapMarker?: { x: number; z: number; label: string };
  createdAt: number;
  updatedAt: number;
}

/** Default player note template */
export const createPlayerNote = (id: string, title: string, content: string): PlayerNote => ({
  id,
  title,
  category: 'player_notes',
  unlocked: true,
  read: true,
  bookmarked: false,
  tags: ['custom'],
  content,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// ============================================================================
// JOURNAL STATE
// ============================================================================

export interface JournalState {
  questNotes: QuestNote[];
  characterProfiles: CharacterProfile[];
  locationNotes: LocationNote[];
  bestiaryEntries: BestiaryEntry[];
  itemEncyclopedia: ItemEncyclopediaEntry[];
  playerNotes: PlayerNote[];
  bookmarks: string[]; // Entry IDs
  searchHistory: string[];
  lastViewed?: string; // Entry ID
}

export const createInitialJournalState = (): JournalState => ({
  questNotes: [],
  characterProfiles: [...CHARACTER_PROFILES],
  locationNotes: [...LOCATION_NOTES],
  bestiaryEntries: [...BESTIARY_ENTRIES],
  itemEncyclopedia: [...ITEM_ENCYCLOPEDIA],
  playerNotes: [],
  bookmarks: [],
  searchHistory: [],
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Unlock a journal entry by ID
 */
export function unlockJournalEntry(
  state: JournalState,
  entryId: string
): JournalState {
  const findAndUnlock = <T extends JournalEntry>(entries: T[]): T[] =>
    entries.map((entry) =>
      entry.id === entryId
        ? { ...entry, unlocked: true, unlockedAt: Date.now() }
        : entry
    );

  return {
    ...state,
    characterProfiles: findAndUnlock(state.characterProfiles),
    locationNotes: findAndUnlock(state.locationNotes),
    bestiaryEntries: findAndUnlock(state.bestiaryEntries),
    itemEncyclopedia: findAndUnlock(state.itemEncyclopedia),
  };
}

/**
 * Mark entry as read
 */
export function markEntryRead(state: JournalState, entryId: string): JournalState {
  const markRead = <T extends JournalEntry>(entries: T[]): T[] =>
    entries.map((entry) =>
      entry.id === entryId ? { ...entry, read: true } : entry
    );

  return {
    ...state,
    characterProfiles: markRead(state.characterProfiles),
    locationNotes: markRead(state.locationNotes),
    bestiaryEntries: markRead(state.bestiaryEntries),
    itemEncyclopedia: markRead(state.itemEncyclopedia),
    playerNotes: markRead(state.playerNotes),
    lastViewed: entryId,
  };
}

/**
 * Toggle bookmark on entry
 */
export function toggleBookmark(state: JournalState, entryId: string): JournalState {
  const toggleBM = <T extends JournalEntry>(entries: T[]): T[] =>
    entries.map((entry) =>
      entry.id === entryId ? { ...entry, bookmarked: !entry.bookmarked } : entry
    );

  const isBookmarked = state.bookmarks.includes(entryId);
  const bookmarks = isBookmarked
    ? state.bookmarks.filter((id) => id !== entryId)
    : [...state.bookmarks, entryId];

  return {
    ...state,
    characterProfiles: toggleBM(state.characterProfiles),
    locationNotes: toggleBM(state.locationNotes),
    bestiaryEntries: toggleBM(state.bestiaryEntries),
    itemEncyclopedia: toggleBM(state.itemEncyclopedia),
    playerNotes: toggleBM(state.playerNotes),
    bookmarks,
  };
}

/**
 * Search journal entries
 */
export function searchJournal(
  state: JournalState,
  query: string
): JournalEntry[] {
  const lowerQuery = query.toLowerCase();

  const searchEntries = <T extends JournalEntry>(entries: T[]): T[] =>
    entries.filter(
      (entry) =>
        entry.unlocked &&
        (entry.title.toLowerCase().includes(lowerQuery) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)))
    );

  return [
    ...searchEntries(state.characterProfiles),
    ...searchEntries(state.locationNotes),
    ...searchEntries(state.bestiaryEntries),
    ...searchEntries(state.itemEncyclopedia),
    ...searchEntries(state.playerNotes),
  ];
}

/**
 * Get entries by category
 */
export function getEntriesByCategory(
  state: JournalState,
  category: JournalCategory,
  includeUnlocked: boolean = true
): JournalEntry[] {
  const filterUnlocked = <T extends JournalEntry>(entries: T[]): T[] =>
    includeUnlocked ? entries.filter((e) => e.unlocked) : entries;

  switch (category) {
    case 'quest_notes':
      return filterUnlocked(state.questNotes);
    case 'character_profiles':
      return filterUnlocked(state.characterProfiles);
    case 'location_notes':
      return filterUnlocked(state.locationNotes);
    case 'bestiary':
      return filterUnlocked(state.bestiaryEntries);
    case 'item_encyclopedia':
      return filterUnlocked(state.itemEncyclopedia);
    case 'player_notes':
      return state.playerNotes;
    default:
      return [];
  }
}

/**
 * Get unread count
 */
export function getUnreadCount(state: JournalState): number {
  const countUnread = <T extends JournalEntry>(entries: T[]): number =>
    entries.filter((e) => e.unlocked && !e.read).length;

  return (
    countUnread(state.characterProfiles) +
    countUnread(state.locationNotes) +
    countUnread(state.bestiaryEntries) +
    countUnread(state.itemEncyclopedia)
  );
}

/**
 * Add player note
 */
export function addPlayerNote(
  state: JournalState,
  title: string,
  content: string,
  options?: {
    linkedLocationId?: string;
    linkedNpcId?: string;
    linkedQuestId?: string;
    mapMarker?: { x: number; z: number; label: string };
  }
): JournalState {
  const note: PlayerNote = {
    ...createPlayerNote(`note_${Date.now()}`, title, content),
    ...options,
  };

  return {
    ...state,
    playerNotes: [...state.playerNotes, note],
  };
}

/**
 * Update player note
 */
export function updatePlayerNote(
  state: JournalState,
  noteId: string,
  updates: Partial<Pick<PlayerNote, 'title' | 'content' | 'linkedLocationId' | 'linkedNpcId' | 'linkedQuestId' | 'mapMarker'>>
): JournalState {
  return {
    ...state,
    playerNotes: state.playerNotes.map((note) =>
      note.id === noteId
        ? { ...note, ...updates, updatedAt: Date.now() }
        : note
    ),
  };
}

/**
 * Delete player note
 */
export function deletePlayerNote(state: JournalState, noteId: string): JournalState {
  return {
    ...state,
    playerNotes: state.playerNotes.filter((note) => note.id !== noteId),
    bookmarks: state.bookmarks.filter((id) => id !== noteId),
  };
}

/**
 * Increment times defeated for bestiary entry
 */
export function incrementEnemyDefeated(
  state: JournalState,
  enemyId: string
): JournalState {
  return {
    ...state,
    bestiaryEntries: state.bestiaryEntries.map((entry) =>
      entry.enemyId === enemyId
        ? {
            ...entry,
            timesDefeated: entry.timesDefeated + 1,
            unlocked: true,
            unlockedAt: entry.unlockedAt || Date.now(),
          }
        : entry
    ),
  };
}

/**
 * Update character relationship status
 */
export function updateCharacterRelationship(
  state: JournalState,
  npcId: string,
  status: CharacterProfile['relationshipStatus']
): JournalState {
  return {
    ...state,
    characterProfiles: state.characterProfiles.map((profile) =>
      profile.npcId === npcId
        ? { ...profile, relationshipStatus: status }
        : profile
    ),
  };
}

/**
 * Add discovered secret to location
 */
export function addLocationSecret(
  state: JournalState,
  locationId: string,
  secret: string
): JournalState {
  return {
    ...state,
    locationNotes: state.locationNotes.map((note) =>
      note.locationId === locationId &&
      !note.discoveredSecrets.includes(secret)
        ? {
            ...note,
            discoveredSecrets: [...note.discoveredSecrets, secret],
          }
        : note
    ),
  };
}

/**
 * Unlock fast travel for location
 */
export function unlockFastTravel(
  state: JournalState,
  locationId: string
): JournalState {
  return {
    ...state,
    locationNotes: state.locationNotes.map((note) =>
      note.locationId === locationId
        ? { ...note, fastTravelUnlocked: true }
        : note
    ),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ALL_CHARACTER_PROFILES = CHARACTER_PROFILES;
export const ALL_LOCATION_NOTES = LOCATION_NOTES;
export const ALL_BESTIARY_ENTRIES = BESTIARY_ENTRIES;
export const ALL_ITEM_ENCYCLOPEDIA = ITEM_ENCYCLOPEDIA;

// Registry lookups
export const CHARACTER_PROFILES_BY_NPC_ID: Record<string, CharacterProfile> =
  Object.fromEntries(CHARACTER_PROFILES.map((p) => [p.npcId, p]));

export const LOCATION_NOTES_BY_ID: Record<string, LocationNote> =
  Object.fromEntries(LOCATION_NOTES.map((l) => [l.locationId, l]));

export const BESTIARY_BY_ENEMY_ID: Record<string, BestiaryEntry> =
  Object.fromEntries(BESTIARY_ENTRIES.map((b) => [b.enemyId, b]));

export const ITEM_ENCYCLOPEDIA_BY_ITEM_ID: Record<string, ItemEncyclopediaEntry> =
  Object.fromEntries(ITEM_ENCYCLOPEDIA.map((i) => [i.itemId, i]));

// Statistics
export const JOURNAL_STATS = {
  totalCharacterProfiles: CHARACTER_PROFILES.length,
  totalLocationNotes: LOCATION_NOTES.length,
  totalBestiaryEntries: BESTIARY_ENTRIES.length,
  totalItemEncyclopedia: ITEM_ENCYCLOPEDIA.length,
};
