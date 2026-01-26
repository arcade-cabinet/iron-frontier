/**
 * Iron Frontier - Secrets and Easter Eggs
 *
 * Hidden content that rewards exploration:
 * - Secret Locations: 8 hidden places with lore and unique rewards
 * - Easter Eggs: 10 fun discoveries and references
 * - Hidden Items: 6 special items with unique properties
 *
 * Discovery conditions, rewards, and world hints are defined for each.
 */

import { z } from 'zod';

// ============================================================================
// SCHEMAS
// ============================================================================

/**
 * Types of secrets in the game
 */
export const SecretTypeSchema = z.enum([
  'location', // Hidden location to discover
  'easter_egg', // Fun reference or meta content
  'hidden_item', // Special item to find
  'achievement', // Hidden achievement
]);
export type SecretType = z.infer<typeof SecretTypeSchema>;

/**
 * Discovery method for a secret
 */
export const DiscoveryMethodSchema = z.enum([
  'exploration', // Found by visiting specific coordinates
  'interaction', // Found by interacting with specific object/NPC
  'sequence', // Found by performing actions in specific order
  'item_use', // Found by using specific item in specific location
  'dialogue', // Found through hidden dialogue options
  'time_based', // Found at specific time of day
  'combat', // Found during/after specific combat
  'combination', // Requires multiple methods
]);
export type DiscoveryMethod = z.infer<typeof DiscoveryMethodSchema>;

/**
 * A hint that can be scattered in the world
 */
export const SecretHintSchema = z.object({
  /** Where this hint appears */
  location: z.string(),
  /** NPC who gives the hint (optional) */
  npcId: z.string().optional(),
  /** The hint text */
  text: z.string(),
  /** Hint type */
  type: z.enum(['dialogue', 'book', 'sign', 'graffiti', 'rumor', 'inscription']),
  /** Condition to reveal hint (optional) */
  condition: z
    .object({
      questComplete: z.string().optional(),
      itemRequired: z.string().optional(),
      timeOfDay: z.enum(['dawn', 'day', 'dusk', 'night']).optional(),
    })
    .optional(),
});
export type SecretHint = z.infer<typeof SecretHintSchema>;

/**
 * A secret discovery in the game
 */
export const SecretSchema = z.object({
  /** Unique identifier */
  id: z.string(),
  /** Display name */
  name: z.string(),
  /** Type of secret */
  type: SecretTypeSchema,
  /** Detailed description (revealed after discovery) */
  description: z.string(),
  /** How to discover this secret */
  discoveryMethod: DiscoveryMethodSchema,
  /** Specific discovery conditions */
  discoveryConditions: z.object({
    /** Location ID where secret is found */
    locationId: z.string().optional(),
    /** Specific coordinates within location */
    coordinates: z.object({ x: z.number(), y: z.number() }).optional(),
    /** Item required to access */
    requiredItem: z.string().optional(),
    /** NPC to interact with */
    npcId: z.string().optional(),
    /** Dialogue option to choose */
    dialogueChoice: z.string().optional(),
    /** Time of day requirement */
    timeOfDay: z.enum(['dawn', 'day', 'dusk', 'night']).optional(),
    /** Quest that must be complete */
    prerequisiteQuest: z.string().optional(),
    /** Sequence of actions required */
    actionSequence: z.array(z.string()).optional(),
    /** Special trigger description */
    specialTrigger: z.string().optional(),
  }),
  /** Rewards for discovery */
  rewards: z.object({
    /** XP reward */
    xp: z.number().int(),
    /** Gold reward */
    gold: z.number().int(),
    /** Items rewarded */
    items: z.array(z.object({ itemId: z.string(), quantity: z.number().int() })),
    /** Lore entries unlocked */
    loreEntries: z.array(z.string()).optional(),
    /** Achievement ID */
    achievementId: z.string().optional(),
    /** Faction reputation changes */
    reputation: z.record(z.string(), z.number()).optional(),
    /** Unlocks quest */
    unlocksQuest: z.string().optional(),
  }),
  /** Hints scattered in the world */
  hints: z.array(SecretHintSchema).default([]),
  /** Related lore and backstory */
  lore: z.string(),
  /** Tags for categorization */
  tags: z.array(z.string()).default([]),
  /** Difficulty to find (1-5) */
  difficulty: z.number().int().min(1).max(5).default(3),
});
export type Secret = z.infer<typeof SecretSchema>;

// ============================================================================
// SECRET LOCATIONS (8)
// ============================================================================

/**
 * Secret Location 1: The Founder's Tomb
 * Hidden grave of the original IVRC founder with dark truth about the company
 */
export const FoundersTomb: Secret = {
  id: 'secret_founders_tomb',
  name: "The Founder's Tomb",
  type: 'location',
  description:
    "A hidden mausoleum in the hills north of Salvation contains the remains of Ezekiel Ironwood, the 'official' founder of IVRC. But the inscriptions within tell a different story - Ironwood was merely a puppet, and the true founder's identity was erased from history. The tomb contains evidence of the company's original sin: the massacre of a native settlement to claim the first copper deposits.",
  discoveryMethod: 'combination',
  discoveryConditions: {
    locationId: 'salvation_outskirts',
    coordinates: { x: -45, y: 78 },
    requiredItem: 'founders_signet_ring',
    prerequisiteQuest: 'mq8_heart_of_darkness',
    specialTrigger: 'Use the Founders Signet Ring on the unmarked stone at coordinates',
  },
  rewards: {
    xp: 200,
    gold: 150,
    items: [
      { itemId: 'ironwood_journal', quantity: 1 },
      { itemId: 'ivrc_original_deed', quantity: 1 },
    ],
    loreEntries: ['lore_ivrc_true_history', 'lore_native_massacre'],
    achievementId: 'achievement_dark_truth',
    reputation: { ivrc: -50, native_spirits: 25 },
    unlocksQuest: 'sq_hidden_reparations',
  },
  hints: [
    {
      location: 'iron_gulch',
      npcId: 'old_timer_gus',
      text: "Ironwood weren't the first to dig here. There was others before. But nobody talks about what happened to 'em.",
      type: 'dialogue',
    },
    {
      location: 'mesa_point',
      text: 'In dusty records: "E.I. memorial - north hills, unmarked per final wishes. Ring required."',
      type: 'book',
    },
    {
      location: 'salvation',
      text: 'Graffiti scratched into stone: "The founder lies twice - once in words, once in earth"',
      type: 'graffiti',
    },
  ],
  lore: "Ezekiel Ironwood was the public face of IVRC's founding, but he was a penniless prospector recruited for his 'respectable' appearance. The true founders were Eastern industrialists who needed a clean front man after their initial claim involved displacing - and allegedly massacring - the native inhabitants. Ironwood lived in guilt until his death, requesting an unmarked grave and leaving behind a journal that detailed everything.",
  tags: ['dark_lore', 'ivrc', 'founder', 'conspiracy'],
  difficulty: 5,
};

/**
 * Secret Location 2: Native Sacred Cave
 * Ancient site with spiritual significance and unique rewards
 */
export const NativeSacredCave: Secret = {
  id: 'secret_sacred_cave',
  name: 'The Spirit Cave',
  type: 'location',
  description:
    "Hidden behind a waterfall in Rattlesnake Canyon lies a cave sacred to the native peoples who once called this land home. Ancient paintings cover the walls, depicting the arrival of the 'iron men' and a prophecy of the land's healing. Those who enter with respect may receive a blessing.",
  discoveryMethod: 'exploration',
  discoveryConditions: {
    locationId: 'rattlesnake_canyon',
    coordinates: { x: 22, y: -15 },
    timeOfDay: 'dawn',
    specialTrigger: 'Enter the waterfall at dawn when the light creates a rainbow',
  },
  rewards: {
    xp: 150,
    gold: 0,
    items: [
      { itemId: 'spirit_feather', quantity: 1 },
      { itemId: 'sacred_water_flask', quantity: 1 },
    ],
    loreEntries: ['lore_native_prophecy', 'lore_spirit_guardians'],
    achievementId: 'achievement_spirit_blessed',
    reputation: { native_spirits: 50 },
  },
  hints: [
    {
      location: 'coldwater',
      npcId: 'the_wanderer',
      text: 'The old ones knew secrets of this land. Their sacred places still hold power, hidden where water meets light.',
      type: 'dialogue',
    },
    {
      location: 'rattlesnake_canyon',
      text: 'Carved into canyon wall: "When dawn paints water, the path opens"',
      type: 'inscription',
    },
    {
      location: 'frontiers_edge',
      text: 'Overheard: "My grandpappy said there was a cave behind the falls, but only appears at sunrise..."',
      type: 'rumor',
    },
  ],
  lore: "Before the frontier was 'settled,' this cave served as a sacred site for vision quests and communion with ancestral spirits. The cave paintings tell the story of the native people's encounter with European settlers and their steam technology - 'iron men who breathed smoke.' The final painting shows the land healing after a great trial, suggesting a prophecy yet to be fulfilled.",
  tags: ['spiritual', 'native', 'prophecy', 'blessing'],
  difficulty: 3,
};

/**
 * Secret Location 3: The Crashed Airship
 * Steampunk vehicle wreck with experimental technology
 */
export const CrashedAirship: Secret = {
  id: 'secret_crashed_airship',
  name: 'The Brass Condor',
  type: 'location',
  description:
    "In a remote section of the Badlands lies the wreckage of an experimental IVRC airship - the Brass Condor. This steam-powered dirigible was an attempt to survey the frontier from above, but something went catastrophically wrong during its maiden voyage. The wreck contains advanced steampunk technology and the captain's final log.",
  discoveryMethod: 'exploration',
  discoveryConditions: {
    locationId: 'badlands_trail',
    coordinates: { x: -67, y: 45 },
    specialTrigger: 'Follow the trail of brass debris scattered across the badlands',
  },
  rewards: {
    xp: 175,
    gold: 200,
    items: [
      { itemId: 'steam_jetpack_broken', quantity: 1 },
      { itemId: 'brass_condor_blueprint', quantity: 1 },
      { itemId: 'captains_spyglass', quantity: 1 },
    ],
    loreEntries: ['lore_ivrc_airship_program', 'lore_brass_condor_tragedy'],
    achievementId: 'achievement_sky_salvager',
    reputation: { ivrc: -10 },
    unlocksQuest: 'sq_hidden_rebuild_jetpack',
  },
  hints: [
    {
      location: 'iron_gulch',
      text: 'Newspaper clipping: "IVRC Experimental Vessel Lost - Company Denies Existence"',
      type: 'book',
    },
    {
      location: 'mesa_point',
      npcId: 'whisper',
      text: "Something fell from the sky ten years back. IVRC paid a lot of money to make sure nobody found it. They didn't pay me.",
      type: 'dialogue',
    },
    {
      location: 'badlands_trail',
      text: 'A glint of brass half-buried in sand. More pieces trail off to the northwest.',
      type: 'sign',
    },
  ],
  lore: "The Brass Condor was IVRC's most ambitious project - a steam-powered airship that could survey thousands of acres in a day. Captain Helena Vance volunteered to pilot the experimental craft despite safety concerns. The Condor's boiler exploded at altitude, and IVRC covered up the disaster to avoid investor panic. Captain Vance's final log entry reveals she discovered something unusual from above - coordinates to another secret.",
  tags: ['steampunk', 'airship', 'technology', 'crash', 'ivrc'],
  difficulty: 3,
};

/**
 * Secret Location 4: Ghost Town of Promise
 * Abandoned settlement with tragic history
 */
export const GhostTownPromise: Secret = {
  id: 'secret_ghost_town_promise',
  name: 'Promise',
  type: 'location',
  description:
    "The ruins of Promise - a town that once rivaled Iron Gulch - lie forgotten in a box canyon. The town was abandoned overnight, and local legend says it's haunted. The truth is darker: Promise was built on unstable ground, and when the mine collapsed, it released poisonous gases that killed most residents in their sleep.",
  discoveryMethod: 'exploration',
  discoveryConditions: {
    locationId: 'mountain_road',
    coordinates: { x: 12, y: 88 },
    specialTrigger: 'Find the overgrown trail marked by a weathered signpost',
  },
  rewards: {
    xp: 125,
    gold: 75,
    items: [
      { itemId: 'promise_town_records', quantity: 1 },
      { itemId: 'gas_mask_prototype', quantity: 1 },
      { itemId: 'survivors_locket', quantity: 1 },
    ],
    loreEntries: ['lore_promise_disaster', 'lore_gas_mask_invention'],
    achievementId: 'achievement_ghost_hunter',
  },
  hints: [
    {
      location: 'coldwater',
      text: 'Old-timer mutters: "Promise... they called it Promise. Should have called it Curse."',
      type: 'rumor',
    },
    {
      location: 'iron_gulch',
      npcId: 'doc_morrison',
      text: "My predecessor came from Promise. Said he was the only one who woke up that night. Never told me why he couldn't sleep.",
      type: 'dialogue',
    },
    {
      location: 'mountain_road',
      text: 'A weathered wooden sign, barely readable: "Promise - 2 miles - est. 1872 - pop. 0"',
      type: 'sign',
    },
  ],
  lore: 'Promise was founded in 1872 by hopeful settlers who struck copper. Within two years, it was a thriving town of 200 souls. Then came the Night of Silence. A mine shaft broke into a natural gas pocket, and the heavier-than-air poison seeped through the town while everyone slept. Only three people survived: a doctor with insomnia, a drunk who passed out in the hills, and a child who hid in a well to escape a beating. The survivors scattered, and Promise became a cautionary tale that IVRC preferred forgotten.',
  tags: ['ghost_town', 'tragedy', 'mystery', 'haunted'],
  difficulty: 2,
};

/**
 * Secret Location 5: The Smuggler's Tunnel
 * Underground passage between towns used by outlaws
 */
export const SmugglersTunnel: Secret = {
  id: 'secret_smugglers_tunnel',
  name: "The Rattler's Run",
  type: 'location',
  description:
    "A network of tunnels connecting Mesa Point's outlaw haven to a hidden exit near Coldwater. Used by smugglers and outlaws for decades, the tunnels are lined with contraband caches and contain a secret meeting room where the territory's criminal enterprises coordinate.",
  discoveryMethod: 'interaction',
  discoveryConditions: {
    locationId: 'mesa_point',
    npcId: 'whisper',
    dialogueChoice: 'ask_about_escape_routes',
    prerequisiteQuest: 'mq6a_honor_among_thieves',
    specialTrigger: 'Gain Whispers trust by completing their quest, then ask about escape routes',
  },
  rewards: {
    xp: 100,
    gold: 250,
    items: [
      { itemId: 'smugglers_map', quantity: 1 },
      { itemId: 'contraband_whiskey', quantity: 5 },
      { itemId: 'outlaw_cipher_book', quantity: 1 },
    ],
    loreEntries: ['lore_smuggler_network', 'lore_outlaw_code'],
    achievementId: 'achievement_underground',
    reputation: { outlaws: 25 },
  },
  hints: [
    {
      location: 'mesa_point',
      text: 'Carved into saloon table: "Rattler runs deep, rattler runs far, rattler knows where the lawmen are"',
      type: 'graffiti',
    },
    {
      location: 'coldwater',
      text: 'Rancher grumbles: "Outlaws appear like magic. One minute the road is clear, next minute trouble. Must know shortcuts."',
      type: 'rumor',
    },
    {
      location: 'mesa_point',
      npcId: 'whisper',
      text: 'Some secrets cost more than gold. Trust is the real currency down here.',
      type: 'dialogue',
      condition: { questComplete: 'sq6_informants_price' },
    },
  ],
  lore: "The Rattler's Run was originally a mine shaft that broke through to natural caverns. When the copper ran dry, smugglers realized the tunnels connected two territories. Over decades, they expanded the network, adding supply caches, meeting rooms, and emergency exits. The Copperhead Gang used these tunnels extensively, and their cipher book - left behind after a hasty evacuation - contains codes still used by frontier criminals.",
  tags: ['underground', 'smugglers', 'outlaws', 'secret_passage'],
  difficulty: 3,
};

/**
 * Secret Location 6: Hermit's Cabin
 * Reclusive inventor with unique quest and items
 */
export const HermitsCabin: Secret = {
  id: 'secret_hermits_cabin',
  name: "Cogsworth's Workshop",
  type: 'location',
  description:
    "Deep in the mountains lives Phineas Cogsworth, a former IVRC engineer who fled after refusing to weaponize his inventions. His remote cabin is filled with incredible steampunk gadgets, and he'll share his knowledge with anyone who proves they oppose IVRC's corruption.",
  discoveryMethod: 'sequence',
  discoveryConditions: {
    locationId: 'mountain_road',
    coordinates: { x: -30, y: 65 },
    prerequisiteQuest: 'mq5_confrontation',
    actionSequence: [
      'Find the gear symbol carved in trees',
      'Follow the brass pipes half-buried in ground',
      'Knock three times, pause, twice more',
    ],
    specialTrigger: 'Follow the hidden trail markers and use the correct knock pattern',
  },
  rewards: {
    xp: 150,
    gold: 0,
    items: [
      { itemId: 'cogsworth_toolkit', quantity: 1 },
      { itemId: 'clockwork_companion', quantity: 1 },
    ],
    loreEntries: ['lore_cogsworth_story', 'lore_ivrc_weapons_program'],
    achievementId: 'achievement_inventor_friend',
    reputation: { ivrc: -20 },
    unlocksQuest: 'sq_hidden_cogsworths_legacy',
  },
  hints: [
    {
      location: 'iron_gulch',
      npcId: 'foreman_burke',
      text: 'Old Cogsworth disappeared years ago. Brilliant engineer. Too brilliant for his own good, some said.',
      type: 'dialogue',
      condition: { questComplete: 'mq5_confrontation' },
    },
    {
      location: 'mountain_road',
      text: 'A gear symbol carved into a tree trunk. Fresh, not weathered. Someone maintains these marks.',
      type: 'sign',
    },
    {
      location: 'salvation',
      text: 'Preacher mentions: "A man of science fled to the mountains, seeking peace from the machines of war."',
      type: 'dialogue',
    },
  ],
  lore: "Phineas Cogsworth was IVRC's most gifted engineer, responsible for innovations that made the company billions. When management demanded he convert his labor-saving devices into weapons, Cogsworth refused and was threatened. He faked his death in a mining accident and retreated to the mountains. For years, he's worked on inventions meant to help common folk, waiting for someone trustworthy to carry his legacy forward.",
  tags: ['inventor', 'hermit', 'steampunk', 'ally', 'gadgets'],
  difficulty: 4,
};

/**
 * Secret Location 7: The Meteor Crater
 * Mysterious impact site with strange properties
 */
export const MeteorCrater: Secret = {
  id: 'secret_meteor_crater',
  name: 'Starfall Basin',
  type: 'location',
  description:
    "A perfectly circular crater in the remote desert marks where 'something' fell from the sky long ago. The ground within the crater has unusual properties - compasses spin wildly, strange lights appear at night, and a metallic ore not found anywhere else on Earth can be collected. The natives called this place 'Where the Sky Spirit Sleeps.'",
  discoveryMethod: 'time_based',
  discoveryConditions: {
    locationId: 'desert_pass',
    coordinates: { x: 55, y: -40 },
    timeOfDay: 'night',
    specialTrigger: 'Visit the unmarked depression at night to witness the phenomenon',
  },
  rewards: {
    xp: 175,
    gold: 0,
    items: [
      { itemId: 'star_metal_ore', quantity: 3 },
      { itemId: 'meteor_fragment', quantity: 1 },
      { itemId: 'magnetic_compass_broken', quantity: 1 },
    ],
    loreEntries: ['lore_meteor_impact', 'lore_star_metal_properties'],
    achievementId: 'achievement_stargazer',
  },
  hints: [
    {
      location: 'desert_pass',
      text: 'Guide mentions: "Stay away from the basin at night. Lights dance there. Unnatural lights."',
      type: 'rumor',
    },
    {
      location: 'frontiers_edge',
      npcId: 'old_timer_gus',
      text: "My grandpappy said a star fell there, back before anyone kept records. Said the metal it left was stronger than any steel. Called it 'sky iron.'",
      type: 'dialogue',
    },
    {
      location: 'salvation',
      text: "Preacher's sermon notes: 'And where heaven touched earth, strange miracles occurred...'",
      type: 'book',
    },
  ],
  lore: "The impact occurred centuries before European settlement. Native peoples incorporated the site into their spiritual traditions, believing a celestial being had descended to rest. The meteor contained an unusual iron-nickel alloy with trace elements not found naturally on Earth. This 'star metal' has unique properties - it can be forged stronger than steel and seems to resist corrosion indefinitely. IVRC has never found the site, though they've searched for years based on native legends.",
  tags: ['meteor', 'mystery', 'supernatural', 'rare_materials', 'night'],
  difficulty: 3,
};

/**
 * Secret Location 8: IVRC Secret Lab
 * Hidden facility revealing dark experiments
 */
export const IVRCSecretLab: Secret = {
  id: 'secret_ivrc_lab',
  name: 'Facility Omega',
  type: 'location',
  description:
    "Beneath an abandoned IVRC warehouse lies Facility Omega - a secret laboratory where the company conducted experiments on automatons, trying to create mechanical soldiers. The facility was sealed after an 'incident' killed most of the research staff. The automatons down there still function... after a fashion.",
  discoveryMethod: 'item_use',
  discoveryConditions: {
    locationId: 'salvation',
    coordinates: { x: 0, y: 0 },
    requiredItem: 'omega_keycard',
    prerequisiteQuest: 'mq9_the_reckoning',
    specialTrigger: 'Use the Omega Keycard on the hidden panel in the abandoned warehouse',
  },
  rewards: {
    xp: 250,
    gold: 300,
    items: [
      { itemId: 'automaton_control_rod', quantity: 1 },
      { itemId: 'experimental_weapon_schematic', quantity: 1 },
      { itemId: 'dr_sterling_notes', quantity: 1 },
    ],
    loreEntries: ['lore_facility_omega', 'lore_automaton_uprising', 'lore_dr_sterling_madness'],
    achievementId: 'achievement_whistleblower',
    reputation: { ivrc: -100 },
    unlocksQuest: 'sq_hidden_shut_down_omega',
  },
  hints: [
    {
      location: 'iron_gulch',
      text: "Miner whispers: 'They say there's a place where IVRC makes things that ain't natural. Things that walk like men but ain't.'",
      type: 'rumor',
    },
    {
      location: 'salvation',
      text: "Warehouse manifest: 'Level B2 - RESTRICTED - Omega Protocol - Dr. Sterling'",
      type: 'book',
    },
    {
      location: 'mesa_point',
      npcId: 'whisper',
      text: "IVRC's darkest secret ain't above ground. Look for Omega. That's all I'll say.",
      type: 'dialogue',
      condition: { questComplete: 'mq8_heart_of_darkness' },
    },
  ],
  lore: "Dr. Helena Sterling was IVRC's leading automaton researcher, tasked with creating mechanical workers that could operate in dangerous mines. Corporate pressure pushed her to militarize the designs. When Sterling resisted, she was replaced by more compliant researchers who pushed the automatons beyond safe parameters. The machines achieved a form of malevolent awareness and turned on their creators. IVRC sealed the facility and erased all records. The automatons still patrol below, following corrupted directives.",
  tags: ['ivrc', 'automatons', 'horror', 'laboratory', 'conspiracy'],
  difficulty: 5,
};

// ============================================================================
// EASTER EGGS (10)
// ============================================================================

/**
 * Easter Egg 1: The Time Traveler
 * NPC with anachronistic dialogue hinting at future technology
 */
export const TimeTraveler: Secret = {
  id: 'easter_time_traveler',
  name: 'The Chronologically Challenged Stranger',
  type: 'easter_egg',
  description:
    "A peculiar stranger appears in random towns, muttering about 'smartphones,' 'the internet,' and 'global warming.' They speak of events from the future as memories and seem genuinely confused about the current year. If pressed, they'll deny everything and mysteriously vanish.",
  discoveryMethod: 'interaction',
  discoveryConditions: {
    npcId: 'time_traveler_mysterious',
    dialogueChoice: 'press_about_future',
    specialTrigger: 'Talk to the stranger three times across different towns',
  },
  rewards: {
    xp: 50,
    gold: 0,
    items: [{ itemId: 'strange_rectangular_device', quantity: 1 }],
    achievementId: 'achievement_temporal_anomaly',
  },
  hints: [
    {
      location: 'frontiers_edge',
      text: "Bartender mentions: 'Strangest fella came through. Kept asking if we had Wi-Fi. What in tarnation is Wi-Fi?'",
      type: 'rumor',
    },
    {
      location: 'iron_gulch',
      text: "Note in trash: 'Must remember - this is before electricity. They still use STEAM. How quaint.'",
      type: 'book',
    },
  ],
  lore: 'This mysterious figure appears throughout the frontier, always out of place and time. They claim to be from "about 150 years from now" and seem genuinely distressed to be "stuck in the past." The strange device they carry is completely inert - it\'s a rectangular piece of glass and metal that does nothing, though the stranger insists it should "have all the world\'s knowledge" in it.',
  tags: ['time_travel', 'humor', 'meta', 'mysterious'],
  difficulty: 2,
};

/**
 * Easter Egg 2: Giant Skeleton
 * Dinosaur bones in the desert
 */
export const GiantSkeleton: Secret = {
  id: 'easter_giant_skeleton',
  name: 'Thunder Lizard Bones',
  type: 'easter_egg',
  description:
    "Half-buried in a desert wash lies an enormous skeleton - clearly not any animal known to man. The bones are partially fossilized, suggesting great age. A nearby prospector has been trying to sell 'dragon bones' to skeptical buyers for years.",
  discoveryMethod: 'exploration',
  discoveryConditions: {
    locationId: 'desert_pass',
    coordinates: { x: 33, y: -28 },
    specialTrigger: 'Follow the dry wash where bones protrude from the sand',
  },
  rewards: {
    xp: 75,
    gold: 25,
    items: [
      { itemId: 'fossil_tooth', quantity: 1 },
      { itemId: 'dragon_bone_fragment', quantity: 3 },
    ],
    loreEntries: ['lore_ancient_beasts'],
    achievementId: 'achievement_paleontologist',
  },
  hints: [
    {
      location: 'frontiers_edge',
      text: "Crazy Pete claims he found dragon bones in the desert. Everyone laughs, but he's shown the teeth around.",
      type: 'rumor',
    },
    {
      location: 'desert_pass',
      text: 'A massive rib bone curves out of the sand like a bleached arch.',
      type: 'sign',
    },
  ],
  lore: "What the frontier folk call 'dragon bones' are actually dinosaur fossils - creatures that won't be properly understood for decades yet. The skeleton appears to be a large sauropod, possibly washed into this location millions of years ago when the desert was an ancient seabed. Crazy Pete has been trying to sell bones to traveling snake oil salesmen, unaware he's sitting on a scientific discovery.",
  tags: ['dinosaur', 'fossil', 'discovery', 'history'],
  difficulty: 2,
};

/**
 * Easter Egg 3: The Fourth Wall
 * Character who knows they're in a game
 */
export const FourthWall: Secret = {
  id: 'easter_fourth_wall',
  name: 'The Aware One',
  type: 'easter_egg',
  description:
    "In a Salvation alley sits a disheveled philosopher who speaks in strange terms - referencing 'the player,' 'save files,' and 'the developers.' Most dismiss them as mad, but their predictions about your choices are unnervingly accurate.",
  discoveryMethod: 'dialogue',
  discoveryConditions: {
    locationId: 'salvation',
    npcId: 'fourth_wall_philosopher',
    dialogueChoice: 'engage_philosophy',
    specialTrigger: 'Ask about the nature of reality three times',
  },
  rewards: {
    xp: 25,
    gold: 0,
    items: [{ itemId: 'philosophers_manuscript', quantity: 1 }],
    achievementId: 'achievement_existential_crisis',
  },
  hints: [
    {
      location: 'salvation',
      text: "Preacher warns: 'Don't talk to old Simeon. He speaks of blasphemies - claims we're all characters in some grand story.'",
      type: 'rumor',
    },
  ],
  lore: "Simeon the Philosopher has somehow achieved awareness of the game's nature. His manuscript contains observations like 'Why do we never eat yet never starve? Why does the sun move but never truly set? Why does the stranger always arrive at the perfect moment?' He'll reference your save file, comment on your playstyle, and occasionally break the fourth wall entirely with lines like 'Tell the developers I said hello.'",
  tags: ['meta', 'fourth_wall', 'humor', 'philosophy'],
  difficulty: 1,
};

/**
 * Easter Egg 4: Developer Room
 * Hidden area with debug items and developer messages
 */
export const DeveloperRoom: Secret = {
  id: 'easter_developer_room',
  name: 'The Workshop Beyond',
  type: 'easter_egg',
  description:
    "A hidden room accessible only through an obscure sequence contains 'the gods who made this world' - represented as steampunk automatons sitting at brass desks covered in gears and paper. They'll offer cryptic advice and a few joke items.",
  discoveryMethod: 'sequence',
  discoveryConditions: {
    locationId: 'frontiers_edge',
    actionSequence: [
      'Walk into the well',
      'Turn around three times',
      'Use any consumable item',
      'Wait for the clock to strike midnight',
    ],
    specialTrigger: 'Perform the ritual at the old well at midnight',
  },
  rewards: {
    xp: 0,
    gold: 999,
    items: [
      { itemId: 'debug_revolver', quantity: 1 },
      { itemId: 'thankyou_note', quantity: 1 },
      { itemId: 'golden_coffee_mug', quantity: 1 },
    ],
    achievementId: 'achievement_peeked_behind_curtain',
  },
  hints: [
    {
      location: 'frontiers_edge',
      text: "Drunk at the bar: 'I fell down that well once. Swear I saw... something. Rooms that shouldn't exist.'",
      type: 'rumor',
    },
    {
      location: 'salvation',
      npcId: 'fourth_wall_philosopher',
      text: 'The creators left a door. Wells are portals. Circles break reality. Time is the key.',
      type: 'dialogue',
    },
  ],
  lore: "The Developer Room is a meta-location that shouldn't exist within the game world. The automaton 'developers' will thank you for playing, share development anecdotes ('We almost made this a farming game!'), and offer items that reference the development process. The Debug Revolver does 1 damage but has infinite ammo and perfect accuracy - a testing weapon left in as a joke.",
  tags: ['meta', 'developer', 'secret_room', 'humor'],
  difficulty: 4,
};

/**
 * Easter Egg 5: Musical Rocks
 * Play a tune for reward
 */
export const MusicalRocks: Secret = {
  id: 'easter_musical_rocks',
  name: 'The Singing Stones',
  type: 'easter_egg',
  description:
    "A formation of eight standing stones in the desert produces musical tones when struck. Playing the correct melody (hidden in various locations as sheet music fragments) causes the central stone to reveal a hidden compartment with treasure.",
  discoveryMethod: 'sequence',
  discoveryConditions: {
    locationId: 'desert_pass',
    coordinates: { x: 10, y: -55 },
    requiredItem: 'complete_stone_song',
    actionSequence: ['Strike stones in order: 3-1-4-1-5-9-2-6'],
    specialTrigger: 'Play the correct sequence on the musical stones',
  },
  rewards: {
    xp: 100,
    gold: 150,
    items: [
      { itemId: 'ancient_gold_coins', quantity: 10 },
      { itemId: 'stone_song_music_box', quantity: 1 },
    ],
    achievementId: 'achievement_musician',
  },
  hints: [
    {
      location: 'frontiers_edge',
      text: 'Sheet music fragment: First two notes... 3, 1...',
      type: 'book',
    },
    {
      location: 'iron_gulch',
      text: 'Sheet music fragment: ...4, 1, 5...',
      type: 'book',
    },
    {
      location: 'mesa_point',
      text: 'Sheet music fragment: ...9, 2, 6...',
      type: 'book',
    },
    {
      location: 'desert_pass',
      text: 'Eight stones arranged in a circle. Each hums when struck.',
      type: 'sign',
    },
  ],
  lore: 'These standing stones were placed by an unknown ancient culture. Each stone is a different mineral that resonates at a specific frequency when struck. The melody required to open the treasure is the first eight digits of pi - a mathematical constant that transcends cultures. Who placed these stones, and how they knew this number, remains a mystery.',
  tags: ['puzzle', 'music', 'ancient', 'treasure'],
  difficulty: 3,
};

/**
 * Easter Egg 6: The Conspiracy Board
 * Crazy hermit with all connections mapped
 */
export const ConspiracyBoard: Secret = {
  id: 'easter_conspiracy_board',
  name: "Crazy Cal's Truth Wall",
  type: 'easter_egg',
  description:
    "In a shack outside Iron Gulch lives 'Crazy Cal,' a prospector who has spent years mapping every connection between IVRC, the government, and various mysterious events. His conspiracy board is a maze of red string connecting photographs, documents, and scrawled notes. The terrifying part? Most of it is accurate.",
  discoveryMethod: 'interaction',
  discoveryConditions: {
    locationId: 'iron_gulch',
    npcId: 'crazy_cal',
    dialogueChoice: 'ask_to_see_evidence',
    specialTrigger: 'Visit Cal three times and build trust before he shows the board',
  },
  rewards: {
    xp: 75,
    gold: 0,
    items: [
      { itemId: 'conspiracy_notes', quantity: 1 },
      { itemId: 'tinfoil_hat', quantity: 1 },
    ],
    loreEntries: ['lore_conspiracy_connections'],
    achievementId: 'achievement_truth_seeker',
  },
  hints: [
    {
      location: 'iron_gulch',
      text: "Miners joke: 'Crazy Cal says IVRC is run by lizard people. But then again, have you seen the board of directors?'",
      type: 'rumor',
    },
    {
      location: 'frontiers_edge',
      text: "Warning carved in wood: 'Cal knows. Visit him. Learn.'",
      type: 'graffiti',
    },
  ],
  lore: "Calvin 'Crazy Cal' Perkins was a successful prospector until he stumbled onto evidence of IVRC's cover-ups. Everyone dismissed him as mad when he tried to expose the truth, so he retreated to his shack to compile evidence. His conspiracy board accurately maps IVRC's corporate structure, their political connections, the covered-up disasters, and even hints at the automaton program. The only thing he got wrong is the lizard people theory. Probably.",
  tags: ['conspiracy', 'humor', 'truth', 'paranoia'],
  difficulty: 2,
};

/**
 * Easter Egg 7: Famous Grave
 * Reference to other games/media
 */
export const FamousGrave: Secret = {
  id: 'easter_famous_grave',
  name: 'The Wandering Gunslinger',
  type: 'easter_egg',
  description:
    "A weathered gravestone in the Coldwater cemetery bears a familiar epitaph: 'Here lies Roland D., who followed the Tower to the end. The man in black fled across the desert, and the gunslinger followed.' A worn revolver rests against the stone.",
  discoveryMethod: 'exploration',
  discoveryConditions: {
    locationId: 'coldwater',
    coordinates: { x: 15, y: 22 },
    specialTrigger: 'Visit the cemetery and find the unmarked grave in the corner',
  },
  rewards: {
    xp: 50,
    gold: 0,
    items: [{ itemId: 'sandalwood_grip_revolver', quantity: 1 }],
    achievementId: 'achievement_tower_reference',
  },
  hints: [
    {
      location: 'coldwater',
      text: "Gravedigger: 'Strange grave in the corner. No family ever visits. Just... appeared one day.'",
      type: 'rumor',
    },
  ],
  lore: "This is a reference to Stephen King's Dark Tower series. The grave seems to exist outside normal time and space - records show no burial, no permit, no nothing. The revolver left there is impossibly well-preserved despite apparent age, with sandalwood grips worn smooth by countless drawings. Players familiar with the source material will recognize the significance.",
  tags: ['reference', 'literature', 'dark_tower', 'tribute'],
  difficulty: 2,
};

/**
 * Easter Egg 8: Impossible Shot
 * Hidden target gives achievement
 */
export const ImpossibleShot: Secret = {
  id: 'easter_impossible_shot',
  name: 'The Legendary Shot',
  type: 'easter_egg',
  description:
    "A tiny target - a playing card nailed to a distant post - can be seen from Frontier's Edge with the captain's spyglass. Hitting it requires perfect aim, favorable wind, and possibly divine intervention. A local legend says anyone who makes the shot will have luck follow them forever.",
  discoveryMethod: 'combat',
  discoveryConditions: {
    locationId: 'frontiers_edge',
    requiredItem: 'rifle_standard',
    specialTrigger: 'Shoot the playing card target 500 meters away from the church bell tower',
  },
  rewards: {
    xp: 150,
    gold: 100,
    items: [{ itemId: 'legendary_marksman_badge', quantity: 1 }],
    achievementId: 'achievement_impossible_shot',
  },
  hints: [
    {
      location: 'frontiers_edge',
      text: "Sheriff: 'See that card out there? Been nailed to that post for twenty years. Hundred men have tried to hit it. None have.'",
      type: 'dialogue',
    },
    {
      location: 'iron_gulch',
      text: 'Betting slip: "100 to 1 odds - hit the Frontier Card. Collect at any saloon."',
      type: 'book',
    },
  ],
  lore: 'The Impossible Shot was established twenty years ago by a boastful marksman who claimed he could hit anything. A joker nailed a playing card to a post at extreme range and bet his fortune the marksman would miss. He did. The joker died before collecting, but the tradition continued - anyone who makes the shot is considered blessed by luck itself.',
  tags: ['skill', 'challenge', 'marksmanship', 'legend'],
  difficulty: 5,
};

/**
 * Easter Egg 9: The Dance
 * Make NPCs dance with specific item
 */
export const TheDance: Secret = {
  id: 'easter_the_dance',
  name: 'The Mechanical Musician',
  type: 'easter_egg',
  description:
    "A hidden music box plays an irresistible tune that compels all nearby NPCs to dance uncontrollably for thirty seconds. The reactions range from confused to delighted, and some NPCs have unique dance animations.",
  discoveryMethod: 'item_use',
  discoveryConditions: {
    requiredItem: 'enchanted_music_box',
    specialTrigger: 'Use the Enchanted Music Box in any town with multiple NPCs present',
  },
  rewards: {
    xp: 25,
    gold: 0,
    items: [],
    achievementId: 'achievement_dance_master',
  },
  hints: [
    {
      location: 'frontiers_edge',
      text: "Traveling merchant: 'I once saw a whole saloon start dancing. No musicians in sight. Some kind of magic box.'",
      type: 'rumor',
    },
    {
      location: 'mesa_point',
      text: "Outlaw laughs: 'You want to see something funny? Find Cogsworth's dance machine. Even the meanest gunslinger can't resist.'",
      type: 'dialogue',
    },
  ],
  lore: "The Enchanted Music Box was one of Cogsworth's more whimsical inventions - a device that plays frequencies causing an involuntary desire to move rhythmically. It was meant as a party favor but was lost years ago. The Sheriff has a secret love of dancing, the Doc does a surprisingly good jig, and the outlaws' dance moves are unexpectedly graceful.",
  tags: ['humor', 'music', 'dance', 'fun'],
  difficulty: 3,
};

/**
 * Easter Egg 10: Secret Dialogue
 * Hidden response options in key conversations
 */
export const SecretDialogue: Secret = {
  id: 'easter_secret_dialogue',
  name: 'The Hidden Words',
  type: 'easter_egg',
  description:
    "Throughout the game, certain dialogue trees have hidden options that only appear under specific conditions - wearing certain items, having specific reputation levels, or choosing very specific previous dialogue options. These unlock alternate storylines and unique rewards.",
  discoveryMethod: 'dialogue',
  discoveryConditions: {
    specialTrigger: 'Discover and choose 5 hidden dialogue options across different NPCs',
  },
  rewards: {
    xp: 100,
    gold: 50,
    items: [{ itemId: 'silver_tongue_badge', quantity: 1 }],
    achievementId: 'achievement_silver_tongue',
  },
  hints: [
    {
      location: 'iron_gulch',
      text: "Note: 'Words unspoken hide between the lines. Wear the right face, speak the right phrase.'",
      type: 'book',
    },
    {
      location: 'salvation',
      npcId: 'fourth_wall_philosopher',
      text: 'Dialogue has layers. Most see only the surface. Dig deeper. The developers hid treasures in conversation.',
      type: 'dialogue',
    },
  ],
  lore: 'Hidden dialogue options include: mentioning the Copperheads to Sheriff Cole while wearing an outlaw hat (unlocks a backstory revelation), asking the Doc about Promise while holding the gas mask (unlocks survivor story), telling Whisper "I know about Omega" after finding the lab (unlocks master informant status), greeting the Wanderer with "Long days and pleasant nights" (Dark Tower reference - unlocks special dialogue), and asking Crazy Cal about the fourth wall philosopher (unlocks meta-commentary).',
  tags: ['dialogue', 'hidden', 'multiple_playthroughs', 'secrets'],
  difficulty: 4,
};

// ============================================================================
// HIDDEN ITEMS (6)
// ============================================================================

/**
 * Hidden Item 1: The Relic Revolver
 * Gun from another era with mysterious origins
 */
export const RelicRevolver: Secret = {
  id: 'hidden_relic_revolver',
  name: 'The Relic Revolver',
  type: 'hidden_item',
  description:
    'A revolver that predates any known firearm design, found in a sealed pre-Columbian tomb. The weapon is impossibly advanced for its apparent age, featuring precision engineering that rivals modern firearms. It fires without gunpowder, using some unknown mechanism.',
  discoveryMethod: 'exploration',
  discoveryConditions: {
    locationId: 'rattlesnake_canyon',
    coordinates: { x: -18, y: 32 },
    requiredItem: 'native_tomb_key',
    specialTrigger: 'Open the ancient tomb using the Native Tomb Key',
  },
  rewards: {
    xp: 200,
    gold: 0,
    items: [{ itemId: 'relic_revolver', quantity: 1 }],
    loreEntries: ['lore_anachronistic_technology'],
    achievementId: 'achievement_out_of_time',
  },
  hints: [
    {
      location: 'coldwater',
      npcId: 'the_wanderer',
      text: 'The natives speak of weapons from before time. Stars that fell to earth and became thunder.',
      type: 'dialogue',
    },
    {
      location: 'rattlesnake_canyon',
      text: 'Ancient pictograph shows a figure holding something like a gun, shooting lightning at enemies.',
      type: 'inscription',
    },
  ],
  lore: 'The Relic Revolver defies explanation. Carbon dating places the tomb at over 2,000 years old, yet the weapon inside is clearly a firearm. Theories range from time travel to ancient advanced civilizations to divine creation. The weapon seems to generate its own propellant through unknown means, never needing reload. Its accuracy is supernatural. Some say it chooses its wielder rather than the reverse.',
  tags: ['weapon', 'mysterious', 'ancient', 'powerful'],
  difficulty: 4,
};

/**
 * Hidden Item 2: Fool's Gold Nugget
 * Cursed item with interesting effects
 */
export const FoolsGoldNugget: Secret = {
  id: 'hidden_fools_gold',
  name: "The Miser's Burden",
  type: 'hidden_item',
  description:
    "A massive gold nugget that appears incredibly valuable but is actually cursed pyrite. While carrying it, the player experiences both good and bad luck in equal measure - amazing loot drops are followed by terrible ambushes, and vice versa.",
  discoveryMethod: 'exploration',
  discoveryConditions: {
    locationId: 'copper_mine',
    coordinates: { x: 5, y: -10 },
    specialTrigger: 'Find the hidden vein in the deepest part of the mine',
  },
  rewards: {
    xp: 50,
    gold: 0,
    items: [{ itemId: 'fools_gold_nugget', quantity: 1 }],
    loreEntries: ['lore_misers_curse'],
    achievementId: 'achievement_fools_gold',
  },
  hints: [
    {
      location: 'iron_gulch',
      npcId: 'miner_silas',
      text: "There's a vein deep in the mine nobody touches. They say old Miser Murphy found it and died laughing, gold dust on his lips.",
      type: 'dialogue',
    },
    {
      location: 'copper_mine',
      text: "Scratched into wall: 'Murphy's gold - cursed or blessed? The mountain knows.'",
      type: 'graffiti',
    },
  ],
  lore: "Murphy the Miser was the most successful prospector in Iron Gulch's history - and the most miserable. He hoarded every cent, trusted no one, and died alone clutching this 'gold' nugget. The curse attached to his greed remains: whoever carries the nugget experiences wild swings of fortune. Finding rare loot? Ambush incoming. Surviving impossible odds? Treasure awaits. The only way to break the curse is to give the nugget away freely.",
  tags: ['cursed', 'gold', 'luck', 'double_edged'],
  difficulty: 2,
};

/**
 * Hidden Item 3: The Deed
 * Hidden land ownership document
 */
export const TheDeed: Secret = {
  id: 'hidden_the_deed',
  name: 'The Original Deed',
  type: 'hidden_item',
  description:
    "The original land deed for the entire Iron Gulch territory - predating IVRC's claim. This document proves that the company's ownership of the mines is fraudulent. In the right hands, it could bring down the corporation.",
  discoveryMethod: 'combination',
  discoveryConditions: {
    locationId: 'salvation',
    requiredItem: 'founders_signet_ring',
    prerequisiteQuest: 'mq9_the_reckoning',
    specialTrigger: 'Search the Salvation courthouse archives with the Founders Signet Ring',
  },
  rewards: {
    xp: 250,
    gold: 0,
    items: [{ itemId: 'original_territory_deed', quantity: 1 }],
    loreEntries: ['lore_true_ownership', 'lore_ivrc_fraud'],
    achievementId: 'achievement_legal_bomb',
    reputation: { ivrc: -200, townsfolk: 100 },
    unlocksQuest: 'sq_hidden_take_down_ivrc',
  },
  hints: [
    {
      location: 'iron_gulch',
      npcId: 'old_timer_gus',
      text: 'The real papers are in Salvation. Ironwood hid them there before he died. His ring is the key.',
      type: 'dialogue',
      condition: { questComplete: 'mq8_heart_of_darkness' },
    },
    {
      location: 'salvation',
      text: "Courthouse plaque: 'Archives sealed by order of the founder. Ring-bearer may enter.'",
      type: 'sign',
    },
  ],
  lore: "When IVRC was founded, they 'acquired' the land through falsified documents and bribery. The original deed - showing the land belonged to a coalition of native peoples and early settlers - was supposed to be destroyed. Ezekiel Ironwood saved it as insurance and hid it in the Salvation courthouse, accessible only with his signet ring. With this deed, the rightful owners could reclaim everything IVRC built.",
  tags: ['document', 'legal', 'power', 'endgame'],
  difficulty: 5,
};

/**
 * Hidden Item 4: Mysterious Map
 * Leads to buried treasure
 */
export const MysteriousMap: Secret = {
  id: 'hidden_mysterious_map',
  name: "Blackjack's Treasure Map",
  type: 'hidden_item',
  description:
    "A hand-drawn map leading to the buried loot of 'Blackjack' McCreedy, the most successful train robber in frontier history. The map is divided into four pieces, each hidden in different locations.",
  discoveryMethod: 'combination',
  discoveryConditions: {
    requiredItem: 'complete_treasure_map',
    specialTrigger: 'Collect all four map pieces and follow the complete map to the treasure',
  },
  rewards: {
    xp: 175,
    gold: 500,
    items: [
      { itemId: 'blackjacks_gold', quantity: 1 },
      { itemId: 'blackjacks_revolver', quantity: 1 },
      { itemId: 'legendary_bandit_hat', quantity: 1 },
    ],
    loreEntries: ['lore_blackjack_mccreedy'],
    achievementId: 'achievement_treasure_hunter',
  },
  hints: [
    {
      location: 'frontiers_edge',
      text: 'Map piece 1: Hidden in the church bell tower',
      type: 'rumor',
    },
    {
      location: 'mesa_point',
      text: 'Map piece 2: Won in a poker game at the saloon (high stakes)',
      type: 'rumor',
    },
    {
      location: 'coldwater',
      text: 'Map piece 3: Buried with the gravediggers family plot',
      type: 'rumor',
    },
    {
      location: 'iron_gulch',
      text: 'Map piece 4: In the possession of Crazy Cal, who will trade it',
      type: 'rumor',
    },
  ],
  lore: "Blackjack McCreedy robbed seventeen trains before vanishing in 1865. Legend says he buried his fortune somewhere in the territory and divided the map among four trusted associates - who promptly betrayed each other and scattered the pieces. The treasure includes not just gold but Blackjack's personal effects: his custom revolver and the hat that made him infamous.",
  tags: ['treasure', 'map', 'collection', 'bandit'],
  difficulty: 4,
};

/**
 * Hidden Item 5: Ancient Journal
 * Previous adventurer's story
 */
export const AncientJournal: Secret = {
  id: 'hidden_ancient_journal',
  name: "The First Ranger's Journal",
  type: 'hidden_item',
  description:
    "A century-old journal belonging to the first person to explore and map this territory. Their observations reveal secrets about the land that remain relevant - hidden water sources, safe passages, and warnings about dangers that still exist.",
  discoveryMethod: 'exploration',
  discoveryConditions: {
    locationId: 'desert_waystation',
    coordinates: { x: 8, y: -3 },
    specialTrigger: 'Search the old foundation stones of the waystation',
  },
  rewards: {
    xp: 100,
    gold: 0,
    items: [{ itemId: 'first_rangers_journal', quantity: 1 }],
    loreEntries: ['lore_first_ranger', 'lore_ancient_territory'],
    achievementId: 'achievement_historian',
  },
  hints: [
    {
      location: 'desert_waystation',
      text: "Carved into wood: 'J.W. was here, 1823. My journal rests where I first rested.'",
      type: 'inscription',
    },
    {
      location: 'coldwater',
      npcId: 'the_wanderer',
      text: 'Another walked these lands before any of us. A ranger, a mapmaker. Their knowledge waits to be found.',
      type: 'dialogue',
    },
  ],
  lore: "Josiah Wells was a mountain man and explorer who mapped this territory decades before settlement. His journal contains detailed observations: reliable water sources (some still unknown), seasonal animal migrations, native sacred sites (with respectful notes about avoiding them), and warnings about specific dangers. Reading it provides gameplay benefits - revealing hidden locations on the map and providing survival bonuses.",
  tags: ['journal', 'history', 'explorer', 'knowledge'],
  difficulty: 2,
};

/**
 * Hidden Item 6: Crystal Skull
 * Reference item with strange powers
 */
export const CrystalSkull: Secret = {
  id: 'hidden_crystal_skull',
  name: 'The Star Skull',
  type: 'hidden_item',
  description:
    "A skull carved from a single piece of crystal, seemingly of ancient origin. Staring into its eyes induces visions of possible futures. It glows faintly in the presence of other secrets and seems to whisper coordinates to hidden treasures.",
  discoveryMethod: 'combination',
  discoveryConditions: {
    locationId: 'secret_sacred_cave',
    requiredItem: 'spirit_feather',
    timeOfDay: 'night',
    specialTrigger: 'Return to the Spirit Cave at night with the Spirit Feather',
  },
  rewards: {
    xp: 200,
    gold: 0,
    items: [{ itemId: 'crystal_skull', quantity: 1 }],
    loreEntries: ['lore_crystal_skull_origin', 'lore_vision_seekers'],
    achievementId: 'achievement_skull_keeper',
  },
  hints: [
    {
      location: 'secret_sacred_cave',
      text: 'Cave painting shows a crystal skull radiating light, held by a figure with feathers.',
      type: 'inscription',
    },
    {
      location: 'salvation',
      text: "Preacher whispers: 'The natives had a relic of seeing. Clear as water, shaped like death. It showed them truth.'",
      type: 'dialogue',
    },
  ],
  lore: "The Crystal Skull is a relic of unknown origin, possibly extraterrestrial given its composition matches no known earthly crystal. Native shamans used it for centuries in vision quests, claiming it showed possible futures. The skull has practical uses: it glows brighter when near undiscovered secrets, effectively serving as a secret detector. Some say it also shows the wielder glimpses of their own future - not always pleasant ones.",
  tags: ['artifact', 'mysterious', 'visions', 'detector', 'crystal'],
  difficulty: 4,
};

// ============================================================================
// REGISTRY AND UTILITIES
// ============================================================================

/** All secret locations */
export const SECRET_LOCATIONS: Secret[] = [
  FoundersTomb,
  NativeSacredCave,
  CrashedAirship,
  GhostTownPromise,
  SmugglersTunnel,
  HermitsCabin,
  MeteorCrater,
  IVRCSecretLab,
];

/** All easter eggs */
export const EASTER_EGGS: Secret[] = [
  TimeTraveler,
  GiantSkeleton,
  FourthWall,
  DeveloperRoom,
  MusicalRocks,
  ConspiracyBoard,
  FamousGrave,
  ImpossibleShot,
  TheDance,
  SecretDialogue,
];

/** All hidden items */
export const HIDDEN_ITEMS: Secret[] = [
  RelicRevolver,
  FoolsGoldNugget,
  TheDeed,
  MysteriousMap,
  AncientJournal,
  CrystalSkull,
];

/** All secrets combined */
export const ALL_SECRETS: Secret[] = [...SECRET_LOCATIONS, ...EASTER_EGGS, ...HIDDEN_ITEMS];

/** Secrets indexed by ID */
export const SECRETS_BY_ID: Record<string, Secret> = Object.fromEntries(
  ALL_SECRETS.map((s) => [s.id, s])
);

/** Secrets indexed by type */
export const SECRETS_BY_TYPE: Record<SecretType, Secret[]> = {
  location: SECRET_LOCATIONS,
  easter_egg: EASTER_EGGS,
  hidden_item: HIDDEN_ITEMS,
  achievement: [],
};

// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get a secret by ID
 */
export function getSecretById(id: string): Secret | undefined {
  return SECRETS_BY_ID[id];
}

/**
 * Get all secrets of a specific type
 */
export function getSecretsByType(type: SecretType): Secret[] {
  return SECRETS_BY_TYPE[type] || [];
}

/**
 * Get all secrets at a specific location
 */
export function getSecretsAtLocation(locationId: string): Secret[] {
  return ALL_SECRETS.filter((s) => s.discoveryConditions.locationId === locationId);
}

/**
 * Get all secrets requiring a specific item
 */
export function getSecretsRequiringItem(itemId: string): Secret[] {
  return ALL_SECRETS.filter((s) => s.discoveryConditions.requiredItem === itemId);
}

/**
 * Get all secrets by tag
 */
export function getSecretsByTag(tag: string): Secret[] {
  return ALL_SECRETS.filter((s) => s.tags.includes(tag));
}

/**
 * Get all secrets by difficulty
 */
export function getSecretsByDifficulty(difficulty: number): Secret[] {
  return ALL_SECRETS.filter((s) => s.difficulty === difficulty);
}

/**
 * Get all hints for a specific location (for scattering in world)
 */
export function getHintsForLocation(locationId: string): SecretHint[] {
  const hints: SecretHint[] = [];
  for (const secret of ALL_SECRETS) {
    for (const hint of secret.hints) {
      if (hint.location === locationId) {
        hints.push(hint);
      }
    }
  }
  return hints;
}

/**
 * Check if a secret can be discovered based on game state
 */
export function canDiscoverSecret(
  secret: Secret,
  gameState: {
    visitedLocations?: Set<string>;
    inventory?: Set<string>;
    completedQuests?: Set<string>;
    currentTime?: 'dawn' | 'day' | 'dusk' | 'night';
    playerPosition?: { x: number; y: number };
  }
): boolean {
  const conditions = secret.discoveryConditions;

  // Check location requirement
  if (conditions.locationId && !gameState.visitedLocations?.has(conditions.locationId)) {
    return false;
  }

  // Check item requirement
  if (conditions.requiredItem && !gameState.inventory?.has(conditions.requiredItem)) {
    return false;
  }

  // Check quest prerequisite
  if (conditions.prerequisiteQuest && !gameState.completedQuests?.has(conditions.prerequisiteQuest)) {
    return false;
  }

  // Check time of day
  if (conditions.timeOfDay && gameState.currentTime !== conditions.timeOfDay) {
    return false;
  }

  return true;
}

// ============================================================================
// SECRET ITEMS (Items rewarded by secrets)
// ============================================================================

import type { BaseItem } from '../schemas/item';

/**
 * Special items only obtainable through secrets
 */
export const SECRET_ITEMS: BaseItem[] = [
  // From Founder's Tomb
  {
    id: 'ironwood_journal',
    name: "Ironwood's Journal",
    description:
      "The personal journal of Ezekiel Ironwood, revealing the dark truth behind IVRC's founding.",
    type: 'key_item',
    rarity: 'legendary',
    value: 0,
    weight: 0.5,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'book_journal',
    tags: ['key_item', 'secret', 'lore', 'evidence'],
    effects: [],
  },
  {
    id: 'ivrc_original_deed',
    name: 'Original IVRC Deed',
    description: 'The falsified deed that granted IVRC control of the territory. Evidence of fraud.',
    type: 'key_item',
    rarity: 'legendary',
    value: 0,
    weight: 0.1,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'document_sealed',
    tags: ['key_item', 'secret', 'evidence', 'legal'],
    effects: [],
  },

  // From Spirit Cave
  {
    id: 'spirit_feather',
    name: 'Spirit Feather',
    description:
      'A feather blessed by ancestral spirits. Grants protection from supernatural harm and reveals hidden paths.',
    type: 'key_item',
    rarity: 'rare',
    value: 0,
    weight: 0.01,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'feather_glowing',
    tags: ['key_item', 'secret', 'spiritual', 'native'],
    effects: [{ type: 'buff', value: 25, buffType: 'damage_resist', duration: 300 }],
  },
  {
    id: 'sacred_water_flask',
    name: 'Sacred Water',
    description:
      'Water from the spirit cave spring. Heals wounds and purifies poison.',
    type: 'consumable',
    rarity: 'rare',
    value: 0,
    weight: 0.3,
    stackable: true,
    maxStack: 3,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'flask_glowing',
    tags: ['consumable', 'secret', 'healing', 'spiritual'],
    effects: [
      { type: 'heal', value: 100 },
      { type: 'cure', value: 1 },
    ],
    consumableStats: {
      healAmount: 100,
      staminaAmount: 50,
      buffType: 'poison_resist',
      buffDuration: 600,
      buffStrength: 100,
    },
  },

  // From Crashed Airship
  {
    id: 'steam_jetpack_broken',
    name: 'Broken Steam Jetpack',
    description:
      'An experimental personal flight device. Damaged beyond casual repair but could be restored by an expert.',
    type: 'key_item',
    rarity: 'legendary',
    value: 500,
    weight: 15,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: false,
    icon: 'jetpack_damaged',
    tags: ['key_item', 'secret', 'steampunk', 'repairable'],
    effects: [],
  },
  {
    id: 'brass_condor_blueprint',
    name: 'Brass Condor Blueprint',
    description: 'Engineering blueprints for the experimental airship. Incredibly valuable to the right buyer.',
    type: 'key_item',
    rarity: 'rare',
    value: 200,
    weight: 0.2,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'blueprint_rolled',
    tags: ['key_item', 'secret', 'blueprint', 'valuable'],
    effects: [],
  },
  {
    id: 'captains_spyglass',
    name: "Captain's Spyglass",
    description:
      'A precision optical instrument. Reveals distant details and helps spot hidden locations.',
    type: 'key_item',
    rarity: 'uncommon',
    value: 75,
    weight: 1,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'spyglass',
    tags: ['key_item', 'secret', 'tool', 'exploration'],
    effects: [],
  },

  // From Ghost Town Promise
  {
    id: 'promise_town_records',
    name: 'Promise Town Records',
    description:
      'Official records from the doomed town of Promise. Documents the disaster and names the victims.',
    type: 'key_item',
    rarity: 'uncommon',
    value: 0,
    weight: 0.3,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'documents_old',
    tags: ['key_item', 'secret', 'lore', 'historical'],
    effects: [],
  },
  {
    id: 'gas_mask_prototype',
    name: 'Prototype Gas Mask',
    description:
      'An early gas mask design created after the Promise disaster. Provides immunity to poison gas.',
    type: 'armor',
    rarity: 'rare',
    value: 150,
    weight: 1,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'mask_gas',
    tags: ['armor', 'secret', 'head', 'protection'],
    effects: [],
    armorStats: {
      defense: 1,
      slot: 'head',
      movementPenalty: 0.05,
      resistances: { poison: 100 },
    },
  },
  {
    id: 'survivors_locket',
    name: "Survivor's Locket",
    description:
      'A locket containing a faded photograph. The last memento from Promise. Provides minor luck bonus.',
    type: 'armor',
    rarity: 'uncommon',
    value: 25,
    weight: 0.1,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: false,
    icon: 'locket',
    tags: ['armor', 'secret', 'accessory', 'memento'],
    effects: [],
    armorStats: {
      defense: 0,
      slot: 'accessory',
      movementPenalty: 0,
      resistances: {},
    },
  },

  // From Smuggler's Tunnel
  {
    id: 'smugglers_map',
    name: "Smuggler's Map",
    description:
      "A detailed map of the Rattler's Run tunnel network. Reveals shortcuts between locations.",
    type: 'key_item',
    rarity: 'rare',
    value: 0,
    weight: 0.1,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'map_tunnels',
    tags: ['key_item', 'secret', 'map', 'navigation'],
    effects: [],
  },
  {
    id: 'contraband_whiskey',
    name: 'Contraband Whiskey',
    description:
      'High-quality smuggled whiskey. Valuable and effective at loosening tongues.',
    type: 'consumable',
    rarity: 'uncommon',
    value: 20,
    weight: 0.5,
    stackable: true,
    maxStack: 10,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'bottle_whiskey',
    tags: ['consumable', 'secret', 'alcohol', 'social'],
    effects: [{ type: 'buff', value: 15, buffType: 'damage_boost', duration: 120 }],
    consumableStats: {
      healAmount: 10,
      staminaAmount: 0,
      buffType: 'damage_boost',
      buffDuration: 120,
      buffStrength: 15,
    },
  },
  {
    id: 'outlaw_cipher_book',
    name: 'Outlaw Cipher Book',
    description:
      'A codebook for decrypting outlaw communications. Reveals hidden meanings in certain dialogues.',
    type: 'key_item',
    rarity: 'rare',
    value: 100,
    weight: 0.2,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'book_cipher',
    tags: ['key_item', 'secret', 'cipher', 'outlaw'],
    effects: [],
  },

  // From Hermit's Cabin
  {
    id: 'cogsworth_toolkit',
    name: "Cogsworth's Toolkit",
    description:
      'A master engineers toolkit. Allows repair of complex steampunk devices and provides crafting bonuses.',
    type: 'key_item',
    rarity: 'legendary',
    value: 300,
    weight: 3,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'toolkit_brass',
    tags: ['key_item', 'secret', 'tool', 'crafting', 'steampunk'],
    effects: [],
  },
  {
    id: 'clockwork_companion',
    name: 'Clockwork Companion',
    description:
      'A small mechanical bird that follows you. Warns of nearby enemies and occasionally finds hidden items.',
    type: 'key_item',
    rarity: 'legendary',
    value: 500,
    weight: 0.5,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'bird_mechanical',
    tags: ['key_item', 'secret', 'companion', 'steampunk', 'detection'],
    effects: [],
  },

  // From Meteor Crater
  {
    id: 'star_metal_ore',
    name: 'Star Metal Ore',
    description:
      'Meteoric iron with unusual properties. Can be forged into incredibly strong equipment.',
    type: 'junk',
    rarity: 'legendary',
    value: 200,
    weight: 2,
    stackable: true,
    maxStack: 10,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'ore_glowing',
    tags: ['crafting', 'secret', 'rare_material', 'meteor'],
    effects: [],
  },
  {
    id: 'meteor_fragment',
    name: 'Meteor Fragment',
    description:
      'A piece of the original meteor. Causes compasses to spin and emits faint heat.',
    type: 'key_item',
    rarity: 'rare',
    value: 150,
    weight: 1,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'rock_glowing',
    tags: ['key_item', 'secret', 'meteor', 'anomaly'],
    effects: [],
  },
  {
    id: 'magnetic_compass_broken',
    name: 'Broken Magnetic Compass',
    description:
      'A compass ruined by the meteors magnetic field. Strangely, it now points toward secrets.',
    type: 'key_item',
    rarity: 'uncommon',
    value: 0,
    weight: 0.2,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'compass_broken',
    tags: ['key_item', 'secret', 'tool', 'detection'],
    effects: [],
  },

  // From IVRC Secret Lab
  {
    id: 'automaton_control_rod',
    name: 'Automaton Control Rod',
    description:
      'A device that can temporarily disable or control automatons. Incredibly dangerous in the wrong hands.',
    type: 'weapon',
    rarity: 'legendary',
    value: 400,
    weight: 2,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'rod_control',
    tags: ['weapon', 'secret', 'steampunk', 'automaton'],
    effects: [],
    weaponStats: {
      weaponType: 'melee',
      damage: 5,
      range: 0,
      accuracy: 100,
      fireRate: 1,
      ammoType: 'none',
      clipSize: 0,
      reloadTime: 0,
    },
  },
  {
    id: 'experimental_weapon_schematic',
    name: 'Experimental Weapon Schematic',
    description:
      'Blueprints for a weapon that should not exist. Steam-powered, automatic, terrifying.',
    type: 'key_item',
    rarity: 'legendary',
    value: 500,
    weight: 0.2,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: false,
    icon: 'blueprint_weapon',
    tags: ['key_item', 'secret', 'blueprint', 'weapon', 'dangerous'],
    effects: [],
  },
  {
    id: 'dr_sterling_notes',
    name: "Dr. Sterling's Research Notes",
    description:
      'The personal notes of the automaton program lead. Details experiments, failures, and the final incident.',
    type: 'key_item',
    rarity: 'rare',
    value: 0,
    weight: 0.3,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'notes_scientific',
    tags: ['key_item', 'secret', 'lore', 'automaton', 'science'],
    effects: [],
  },

  // Easter Egg Items
  {
    id: 'strange_rectangular_device',
    name: 'Strange Rectangular Device',
    description:
      'A flat rectangle of glass and metal. Completely inert. The time traveler says it should "have all knowledge."',
    type: 'junk',
    rarity: 'legendary',
    value: 1,
    weight: 0.2,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: false,
    icon: 'device_rectangular',
    tags: ['junk', 'easter_egg', 'time_travel', 'humor'],
    effects: [],
  },
  {
    id: 'fossil_tooth',
    name: 'Giant Fossil Tooth',
    description:
      'A fossilized tooth from an enormous creature. Scientists would pay handsomely for this.',
    type: 'junk',
    rarity: 'rare',
    value: 100,
    weight: 0.5,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'fossil_tooth',
    tags: ['junk', 'easter_egg', 'fossil', 'valuable'],
    effects: [],
  },
  {
    id: 'dragon_bone_fragment',
    name: 'Dragon Bone Fragment',
    description: 'What locals call "dragon bones." Actually dinosaur fossils, but they dont know that.',
    type: 'junk',
    rarity: 'uncommon',
    value: 25,
    weight: 0.3,
    stackable: true,
    maxStack: 10,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'bone_fragment',
    tags: ['junk', 'easter_egg', 'fossil'],
    effects: [],
  },
  {
    id: 'philosophers_manuscript',
    name: "Philosopher's Manuscript",
    description:
      'A treatise on the nature of reality. Contains disturbingly accurate observations about "the game."',
    type: 'key_item',
    rarity: 'rare',
    value: 0,
    weight: 0.2,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'manuscript',
    tags: ['key_item', 'easter_egg', 'meta', 'philosophy'],
    effects: [],
  },
  {
    id: 'debug_revolver',
    name: 'Debug Revolver',
    description:
      'A testing weapon the developers forgot to remove. Does minimal damage but never misses or runs out.',
    type: 'weapon',
    rarity: 'legendary',
    value: 0,
    weight: 0,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'revolver_debug',
    tags: ['weapon', 'easter_egg', 'developer', 'infinite'],
    effects: [],
    weaponStats: {
      weaponType: 'revolver',
      damage: 1,
      range: 1000,
      accuracy: 100,
      fireRate: 10,
      ammoType: 'none',
      clipSize: 999,
      reloadTime: 0,
    },
  },
  {
    id: 'thankyou_note',
    name: 'Thank You Note',
    description: 'A note from the development team thanking you for finding this easter egg.',
    type: 'key_item',
    rarity: 'legendary',
    value: 0,
    weight: 0,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'note_thankyou',
    tags: ['key_item', 'easter_egg', 'developer', 'meta'],
    effects: [],
  },
  {
    id: 'golden_coffee_mug',
    name: 'Golden Coffee Mug',
    description: 'A golden mug inscribed with "Fueled by coffee and deadlines." Developer humor.',
    type: 'junk',
    rarity: 'legendary',
    value: 999,
    weight: 0.5,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'mug_golden',
    tags: ['junk', 'easter_egg', 'developer', 'humor'],
    effects: [],
  },
  {
    id: 'ancient_gold_coins',
    name: 'Ancient Gold Coins',
    description:
      'Coins from an unknown civilization. The musical stones guarded them for millennia.',
    type: 'junk',
    rarity: 'rare',
    value: 50,
    weight: 0.1,
    stackable: true,
    maxStack: 20,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'coins_ancient',
    tags: ['junk', 'easter_egg', 'ancient', 'treasure'],
    effects: [],
  },
  {
    id: 'stone_song_music_box',
    name: 'Stone Song Music Box',
    description:
      'A music box that plays the melody of the singing stones. Calms hostile wildlife when used.',
    type: 'key_item',
    rarity: 'rare',
    value: 100,
    weight: 0.5,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'musicbox',
    tags: ['key_item', 'easter_egg', 'music', 'calming'],
    effects: [],
  },
  {
    id: 'conspiracy_notes',
    name: "Crazy Cal's Notes",
    description:
      'A bundle of conspiracy theories. Most are accurate. The lizard people one... probably not.',
    type: 'key_item',
    rarity: 'uncommon',
    value: 0,
    weight: 0.3,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'notes_conspiracy',
    tags: ['key_item', 'easter_egg', 'conspiracy', 'lore'],
    effects: [],
  },
  {
    id: 'tinfoil_hat',
    name: 'Tinfoil Hat',
    description:
      'Crazy Cal insists this blocks "mind control rays." It does not, but it is amusing to wear.',
    type: 'armor',
    rarity: 'common',
    value: 1,
    weight: 0.1,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'hat_tinfoil',
    tags: ['armor', 'easter_egg', 'humor', 'head'],
    effects: [],
    armorStats: {
      defense: 0,
      slot: 'head',
      movementPenalty: 0,
      resistances: {},
    },
  },
  {
    id: 'sandalwood_grip_revolver',
    name: 'Sandalwood Revolver',
    description:
      'A revolver with sandalwood grips worn smooth by time. "I do not aim with my hand..."',
    type: 'weapon',
    rarity: 'legendary',
    value: 300,
    weight: 2,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: false,
    icon: 'revolver_sandalwood',
    tags: ['weapon', 'easter_egg', 'reference', 'dark_tower'],
    effects: [],
    weaponStats: {
      weaponType: 'revolver',
      damage: 15,
      range: 50,
      accuracy: 95,
      fireRate: 2,
      ammoType: 'pistol',
      clipSize: 6,
      reloadTime: 2,
    },
  },
  {
    id: 'legendary_marksman_badge',
    name: 'Legendary Marksman Badge',
    description:
      'Proof that you made the impossible shot. Respected by gunslingers everywhere.',
    type: 'armor',
    rarity: 'legendary',
    value: 100,
    weight: 0.05,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'badge_marksman',
    tags: ['armor', 'easter_egg', 'achievement', 'accessory'],
    effects: [],
    armorStats: {
      defense: 0,
      slot: 'accessory',
      movementPenalty: 0,
      resistances: {},
    },
  },
  {
    id: 'enchanted_music_box',
    name: 'Enchanted Music Box',
    description:
      'A music box that compels all who hear it to dance. Handle with caution. Or mischief.',
    type: 'key_item',
    rarity: 'rare',
    value: 200,
    weight: 0.5,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'musicbox_enchanted',
    tags: ['key_item', 'easter_egg', 'music', 'funny', 'cogsworth'],
    effects: [],
  },
  {
    id: 'silver_tongue_badge',
    name: 'Silver Tongue Badge',
    description:
      'Awarded for discovering hidden dialogue options. Words are your weapon.',
    type: 'armor',
    rarity: 'rare',
    value: 50,
    weight: 0.05,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'badge_silver_tongue',
    tags: ['armor', 'easter_egg', 'achievement', 'accessory'],
    effects: [],
    armorStats: {
      defense: 0,
      slot: 'accessory',
      movementPenalty: 0,
      resistances: {},
    },
  },

  // Hidden Item rewards
  {
    id: 'relic_revolver',
    name: 'Relic Revolver',
    description:
      'A firearm that predates known history. Fires without gunpowder, never jams, impossibly accurate.',
    type: 'weapon',
    rarity: 'legendary',
    value: 1000,
    weight: 2,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: false,
    icon: 'revolver_ancient',
    tags: ['weapon', 'secret', 'ancient', 'mysterious', 'powerful'],
    effects: [],
    weaponStats: {
      weaponType: 'revolver',
      damage: 20,
      range: 75,
      accuracy: 98,
      fireRate: 2,
      ammoType: 'none',
      clipSize: 999,
      reloadTime: 0,
    },
  },
  {
    id: 'native_tomb_key',
    name: 'Native Tomb Key',
    description: 'An ancient key carved from bone. Opens the sealed tomb in Rattlesnake Canyon.',
    type: 'key_item',
    rarity: 'rare',
    value: 0,
    weight: 0.1,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'key_bone',
    tags: ['key_item', 'secret', 'key', 'native'],
    effects: [],
  },
  {
    id: 'fools_gold_nugget',
    name: "Miser's Gold Nugget",
    description:
      'Appears to be pure gold but is cursed pyrite. Brings equal fortune and misfortune to the carrier.',
    type: 'key_item',
    rarity: 'rare',
    value: 0,
    weight: 5,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: false,
    icon: 'nugget_gold_cursed',
    tags: ['key_item', 'secret', 'cursed', 'luck'],
    effects: [],
  },
  {
    id: 'original_territory_deed',
    name: 'Original Territory Deed',
    description:
      'The legitimate deed to the entire territory, predating IVRC. This could change everything.',
    type: 'key_item',
    rarity: 'legendary',
    value: 0,
    weight: 0.1,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'deed_original',
    tags: ['key_item', 'secret', 'legal', 'power', 'endgame'],
    effects: [],
  },
  {
    id: 'complete_treasure_map',
    name: "Blackjack's Complete Map",
    description: 'All four pieces assembled. X marks a spot in the Badlands.',
    type: 'key_item',
    rarity: 'rare',
    value: 0,
    weight: 0.2,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'map_complete',
    tags: ['key_item', 'secret', 'map', 'treasure'],
    effects: [],
  },
  {
    id: 'blackjacks_gold',
    name: "Blackjack's Gold Stash",
    description: 'A chest full of gold coins and bills. The legendary train robbers entire fortune.',
    type: 'junk',
    rarity: 'legendary',
    value: 500,
    weight: 10,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'chest_gold',
    tags: ['junk', 'secret', 'treasure', 'valuable'],
    effects: [],
  },
  {
    id: 'blackjacks_revolver',
    name: "Blackjack's Revolver",
    description:
      'The infamous train robbers personal weapon. Notches on the grip mark his victims.',
    type: 'weapon',
    rarity: 'legendary',
    value: 250,
    weight: 2.5,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'revolver_legendary',
    tags: ['weapon', 'secret', 'bandit', 'legendary'],
    effects: [],
    weaponStats: {
      weaponType: 'revolver',
      damage: 12,
      range: 40,
      accuracy: 85,
      fireRate: 2,
      ammoType: 'pistol',
      clipSize: 6,
      reloadTime: 2.5,
    },
  },
  {
    id: 'legendary_bandit_hat',
    name: "Blackjack's Hat",
    description:
      'The iconic hat of the most successful train robber in history. Intimidates enemies.',
    type: 'armor',
    rarity: 'legendary',
    value: 100,
    weight: 0.3,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: false,
    icon: 'hat_legendary',
    tags: ['armor', 'secret', 'head', 'intimidation'],
    effects: [],
    armorStats: {
      defense: 1,
      slot: 'head',
      movementPenalty: 0,
      resistances: {},
    },
  },
  {
    id: 'first_rangers_journal',
    name: "First Ranger's Journal",
    description:
      'Josiah Wells exploration journal. Contains invaluable knowledge about the territory.',
    type: 'key_item',
    rarity: 'rare',
    value: 0,
    weight: 0.5,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'journal_explorer',
    tags: ['key_item', 'secret', 'journal', 'exploration', 'knowledge'],
    effects: [],
  },
  {
    id: 'crystal_skull',
    name: 'Crystal Skull',
    description:
      'A skull carved from otherworldly crystal. Shows visions and glows near secrets.',
    type: 'key_item',
    rarity: 'legendary',
    value: 500,
    weight: 1,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'skull_crystal',
    tags: ['key_item', 'secret', 'artifact', 'visions', 'detection'],
    effects: [],
  },
  {
    id: 'founders_signet_ring',
    name: "Founder's Signet Ring",
    description:
      'Ezekiel Ironwoods personal ring. Opens sealed archives and hidden doors.',
    type: 'key_item',
    rarity: 'legendary',
    value: 0,
    weight: 0.05,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'ring_signet',
    tags: ['key_item', 'secret', 'key', 'ivrc', 'founder'],
    effects: [],
  },
  {
    id: 'omega_keycard',
    name: 'Omega Keycard',
    description: 'A strange metallic card with "OMEGA" embossed on it. Opens something, somewhere.',
    type: 'key_item',
    rarity: 'rare',
    value: 0,
    weight: 0.02,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'keycard_omega',
    tags: ['key_item', 'secret', 'key', 'ivrc', 'facility'],
    effects: [],
  },
];

/** Secret items indexed by ID */
export const SECRET_ITEMS_BY_ID: Record<string, BaseItem> = Object.fromEntries(
  SECRET_ITEMS.map((item) => [item.id, item])
);

/**
 * Get a secret item by ID
 */
export function getSecretItemById(itemId: string): BaseItem | undefined {
  return SECRET_ITEMS_BY_ID[itemId];
}

// ============================================================================
// SCHEMA VERSION
// ============================================================================

export const SECRETS_SCHEMA_VERSION = '1.0.0';
