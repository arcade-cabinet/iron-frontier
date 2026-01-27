/**
 * Iron Frontier - NPC Archetype Templates
 *
 * Daggerfall-style procedural NPC generation templates.
 * Each template defines an archetype with personality ranges,
 * name origins, backstory templates, and other generation parameters.
 *
 * Template Variables (use in backstory/description templates):
 *   {{name}}        - NPC's full name
 *   {{firstName}}   - NPC's first name
 *   {{lastName}}    - NPC's surname
 *   {{location}}    - Current location name
 *   {{region}}      - Current region name
 *   {{hometown}}    - NPC's origin town
 *   {{years}}       - Years in profession/location
 *   {{faction}}     - NPC's faction name
 *   {{rival}}       - Rival NPC or faction
 *   {{item}}        - Significant item
 *   {{relative}}    - Family member reference
 *   {{event}}       - Past event reference
 */

import type { NPCTemplate } from '../../schemas/generation';

// ============================================================================
// TOWN OFFICIALS
// ============================================================================

const SheriffTemplate: NPCTemplate = {
  id: 'sheriff',
  name: 'Sheriff',
  description: 'The law in these parts - keeper of order and dispenser of frontier justice.',
  role: 'sheriff',
  allowedFactions: ['neutral', 'townsfolk', 'ivrc'],
  personality: {
    aggression: [0.4, 0.7],
    friendliness: [0.3, 0.6],
    curiosity: [0.4, 0.7],
    greed: [0.1, 0.3],
    honesty: [0.6, 0.95],
    lawfulness: [0.8, 1.0],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 6 },
    { origin: 'frontier_hispanic', weight: 2 },
    { origin: 'frontier_european', weight: 2 },
  ],
  genderDistribution: [0.85, 0.15, 0],
  backstoryTemplates: [
    '{{name}} served as a cavalry officer before the war ended. Now {{firstName}} keeps the peace in {{location}}, though the methods are sometimes rougher than the army taught.',
    'After {{years}} years tracking outlaws across three territories, {{name}} finally settled down as sheriff. The badge is heavy, but so was the bounty hunting life.',
    "{{name}} grew up in {{hometown}} before a gang killed {{relative}}. The star on {{firstName}}'s chest is a promise that others won't suffer the same fate.",
    'They say {{name}} was once an outlaw who took the wrong side in a range war. Now {{firstName}} enforces the law with the zeal of the converted.',
    '{{name}} came west with the railroad, but when {{event}}, {{firstName}} decided to stay and bring order to {{location}}.',
  ],
  descriptionTemplates: [
    "A weathered face with sharp eyes that miss nothing. The tin star on {{firstName}}'s chest has seen better days, much like its owner.",
    'Tall and lean, with a quick hand and a quicker temper. {{firstName}} carries the weight of the law like a physical burden.',
    "Sun-darkened skin and a permanent squint from too many years in the saddle. The revolver at {{firstName}}'s hip looks well-used.",
    "A calm demeanor that belies the steel underneath. {{firstName}}'s reputation precedes them in these parts.",
    'Gray at the temples and lines around the eyes, but the grip is still steady and the aim still true.',
  ],
  dialogueTreeIds: ['sheriff_generic', 'sheriff_quest', 'sheriff_bounty'],
  questGiverChance: 0.85,
  shopChance: 0,
  tags: ['authority', 'lawful', 'combat', 'essential', 'quest_giver'],
  validLocationTypes: ['town', 'city', 'outpost'],
  minImportance: 0.7,
};

const DeputyTemplate: NPCTemplate = {
  id: 'deputy',
  name: 'Deputy',
  description: "The sheriff's right hand - learning the badge or just collecting a paycheck.",
  role: 'deputy',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.3, 0.6],
    friendliness: [0.4, 0.7],
    curiosity: [0.3, 0.6],
    greed: [0.2, 0.5],
    honesty: [0.5, 0.8],
    lawfulness: [0.6, 0.9],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 5 },
    { origin: 'frontier_hispanic', weight: 3 },
    { origin: 'frontier_european', weight: 2 },
  ],
  genderDistribution: [0.75, 0.25, 0],
  backstoryTemplates: [
    '{{name}} is still learning the trade, having taken the deputy star only {{years}} months ago. What {{firstName}} lacks in experience, {{firstName}} makes up for in enthusiasm.',
    'The son of a rancher, {{name}} took the deputy job to escape the family business. The work suits {{firstName}} better than branding cattle ever did.',
    '{{name}} served under Sheriff {{rival}} in {{hometown}} before coming to {{location}}. Different town, same troubles.',
    'After {{event}}, {{name}} figured wearing a badge was safer than going without. Time will tell if that was the right choice.',
    "{{name}} is the sheriff's {{relative}}, though {{firstName}} insists the job was earned, not given.",
  ],
  descriptionTemplates: [
    'Young and eager, with a deputy star that still shines. {{firstName}} carries a new revolver like it might bite.',
    'A nervous energy about {{firstName}} suggests the badge is still an unfamiliar weight.',
    'Sturdy build and an earnest expression. {{firstName}} looks like the type to take the job seriously.',
    'Dark circles under the eyes from too many night patrols. {{firstName}} is learning that the law never sleeps.',
    "A confident stride that might be bravado. {{firstName}}'s hand rests on the gun belt out of habit now.",
  ],
  dialogueTreeIds: ['deputy_generic', 'deputy_patrol'],
  questGiverChance: 0.4,
  shopChance: 0,
  tags: ['authority', 'lawful', 'combat'],
  validLocationTypes: ['town', 'city', 'outpost'],
  minImportance: 0.3,
};

const MayorTemplate: NPCTemplate = {
  id: 'mayor',
  name: 'Mayor',
  description: 'The political head of the settlement - equal parts businessman and diplomat.',
  role: 'mayor',
  allowedFactions: ['neutral', 'townsfolk', 'ivrc'],
  personality: {
    aggression: [0.1, 0.4],
    friendliness: [0.5, 0.8],
    curiosity: [0.4, 0.7],
    greed: [0.4, 0.8],
    honesty: [0.3, 0.7],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 5 },
    { origin: 'frontier_hispanic', weight: 2 },
    { origin: 'frontier_european', weight: 3 },
  ],
  genderDistribution: [0.7, 0.3, 0],
  backstoryTemplates: [
    '{{name}} built {{location}} from nothing more than a dream and a land deed. {{years}} years later, the dream is real, even if some compromises were made along the way.',
    'A former railroad executive, {{name}} saw opportunity in {{location}} when the {{faction}} extended the line this far west.',
    '{{name}} won the mayorship through a combination of charm and well-placed bribes. In {{location}}, that passes for democracy.',
    'After losing everything in {{hometown}} during {{event}}, {{name}} came west to start over. Now {{firstName}} runs {{location}} with an iron grip.',
    '{{name}} inherited the position when {{relative}} passed, and has spent {{years}} years trying to live up to that legacy.',
  ],
  descriptionTemplates: [
    "Well-dressed for these parts, with a politician's smile that doesn't quite reach the eyes.",
    'Soft hands and a calculating gaze. {{firstName}} looks more comfortable in a drawing room than a frontier town.',
    'A substantial figure with a booming voice. {{firstName}} commands attention in any room.',
    'Silver tongue and silver watch chain. {{firstName}} has done well for themselves in {{location}}.',
    "Tired eyes behind spectacles. The weight of running a frontier town shows in every line on {{firstName}}'s face.",
  ],
  dialogueTreeIds: ['mayor_generic', 'mayor_politics', 'mayor_quest'],
  questGiverChance: 0.7,
  shopChance: 0,
  tags: ['authority', 'political', 'wealthy', 'essential', 'quest_giver'],
  validLocationTypes: ['town', 'city'],
  minImportance: 0.8,
};

const JudgeTemplate: NPCTemplate = {
  id: 'judge',
  name: 'Judge',
  description: 'The interpreter of law in a land where justice is often rough and swift.',
  role: 'mayor', // Uses mayor role for authority figure
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.2, 0.4],
    friendliness: [0.2, 0.5],
    curiosity: [0.5, 0.8],
    greed: [0.2, 0.6],
    honesty: [0.5, 0.9],
    lawfulness: [0.7, 1.0],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 6 },
    { origin: 'frontier_european', weight: 4 },
  ],
  genderDistribution: [0.8, 0.2, 0],
  backstoryTemplates: [
    'Judge {{name}} rode circuit for {{years}} years before settling in {{location}}. {{firstName}} has seen enough frontier justice to know when the law needs bending.',
    '{{name}} studied law back East before {{event}} drove {{firstName}} west. The degree still hangs on the wall, a reminder of civilized times.',
    'They call {{name}} "The Hanging Judge," though {{firstName}} insists the nickname is unearned. Mostly.',
    "{{name}} was appointed by the territorial governor after the previous judge was found floating in {{location}}'s creek.",
    'A former defense attorney, {{name}} switched sides after losing too many clients to vigilante justice.',
  ],
  descriptionTemplates: [
    "Stern features beneath a shock of gray hair. {{firstName}}'s eyes seem to weigh every soul that enters the courtroom.",
    "A scholar's stoop and ink-stained fingers. {{firstName}} looks more comfortable with books than with the rough frontier folk.",
    'Weathered face with a neatly trimmed beard. {{firstName}} dresses in black, appropriate for the sentences often passed.',
    'Wire-rimmed spectacles perch on a prominent nose. {{firstName}} peers over them with an expression of perpetual judgment.',
    "The weight of every verdict shows in {{firstName}}'s posture. Justice is a heavy burden.",
  ],
  dialogueTreeIds: ['judge_generic', 'judge_trial'],
  questGiverChance: 0.5,
  shopChance: 0,
  tags: ['authority', 'lawful', 'educated', 'essential'],
  validLocationTypes: ['town', 'city'],
  minImportance: 0.6,
};

const BankerTemplate: NPCTemplate = {
  id: 'banker',
  name: 'Banker',
  description: 'Guardian of gold and dealer in debt - the true power in many frontier towns.',
  role: 'banker',
  allowedFactions: ['neutral', 'ivrc', 'townsfolk'],
  personality: {
    aggression: [0.1, 0.3],
    friendliness: [0.3, 0.6],
    curiosity: [0.3, 0.5],
    greed: [0.6, 0.95],
    honesty: [0.4, 0.8],
    lawfulness: [0.6, 0.9],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_european', weight: 4 },
    { origin: 'frontier_chinese', weight: 2 },
  ],
  genderDistribution: [0.7, 0.3, 0],
  backstoryTemplates: [
    "{{name}} came west with capital from {{hometown}} and a keen eye for opportunity. The bank in {{location}} is just the beginning of {{firstName}}'s empire.",
    "After {{event}}, {{name}} realized that the real gold rush wasn't in the mines - it was in lending to those who worked them.",
    '{{name}} worked the assay office for {{years}} years before saving enough to open the bank. {{firstName}} knows the value of every nugget that passes through {{location}}.',
    "The {{faction}} sent {{name}} to establish financial operations in {{location}}. The company's interests are never far from {{firstName}}'s mind.",
    '{{name}} inherited the bank from {{relative}}, along with a ledger full of debts that half the town owes.',
  ],
  descriptionTemplates: [
    "Pale from too much time indoors, with soft hands that have never known hard labor. {{firstName}}'s suit is the finest in {{location}}.",
    'Sharp features and sharper eyes. {{firstName}} mentally calculates the worth of everyone who walks through the door.',
    "A ledger is never far from {{firstName}}'s hand. Numbers are the only language {{firstName}} truly speaks.",
    'Gold spectacles and a gold watch chain. {{firstName}} believes in advertising.',
    'A careful, measured demeanor. {{firstName}} speaks in terms of risk and return.',
  ],
  dialogueTreeIds: ['banker_generic', 'banker_loan', 'banker_vault'],
  questGiverChance: 0.6,
  shopChance: 0.3,
  tags: ['wealthy', 'merchant', 'essential', 'financial'],
  validLocationTypes: ['town', 'city'],
  minImportance: 0.6,
};

// ============================================================================
// BUSINESS OWNERS
// ============================================================================

const SaloonKeeperTemplate: NPCTemplate = {
  id: 'saloon_keeper',
  name: 'Saloon Keeper',
  description:
    "Master of the watering hole - knows everyone's secrets and serves everyone's vices.",
  role: 'merchant',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.5, 0.8],
    curiosity: [0.6, 0.9],
    greed: [0.4, 0.7],
    honesty: [0.3, 0.7],
    lawfulness: [0.3, 0.6],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_hispanic', weight: 3 },
    { origin: 'frontier_european', weight: 3 },
  ],
  genderDistribution: [0.5, 0.5, 0],
  backstoryTemplates: [
    '{{name}} won the {{location}} saloon in a poker game {{years}} years ago. Best hand {{firstName}} ever played.',
    "After {{relative}} died, {{name}} took over the family saloon. It's honest work, if you count selling rotgut to desperate men as honest.",
    "{{name}} used to ride with {{rival}} before settling down. The saloon is {{firstName}}'s retirement plan.",
    'A former performer from back East, {{name}} discovered that running a saloon paid better than singing in one.',
    "{{name}} built this place from nothing after {{event}}. Every bottle on the shelf represents a piece of {{firstName}}'s soul.",
  ],
  descriptionTemplates: [
    'A friendly face behind the bar, always ready with a drink or a word of advice. {{firstName}} knows when to listen and when to talk.',
    'Barrel-chested with arms like ham hocks. {{firstName}} has thrown out more troublemakers than most folks have met.',
    "A knowing smile plays across {{firstName}}'s lips. The barkeep has heard it all and then some.",
    "Weathered hands work the taps with practiced ease. {{firstName}} could pour drinks in {{firstName}}'s sleep.",
    'Eyes that have seen too much and a mouth that knows when to stay shut. {{firstName}} is the soul of discretion.',
  ],
  dialogueTreeIds: ['saloon_generic', 'saloon_rumor', 'saloon_shop'],
  questGiverChance: 0.5,
  shopChance: 0.9,
  tags: ['merchant', 'social', 'information', 'quest_giver'],
  validLocationTypes: ['town', 'city', 'outpost', 'camp'],
  minImportance: 0.5,
};

const GeneralStoreOwnerTemplate: NPCTemplate = {
  id: 'general_store_owner',
  name: 'General Store Owner',
  description:
    "Supplier of necessities - from beans to bullets, if they don't have it, you don't need it.",
  role: 'merchant',
  allowedFactions: ['neutral', 'townsfolk', 'ivrc'],
  personality: {
    aggression: [0.1, 0.3],
    friendliness: [0.5, 0.8],
    curiosity: [0.3, 0.6],
    greed: [0.4, 0.7],
    honesty: [0.5, 0.8],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_chinese', weight: 3 },
    { origin: 'frontier_european', weight: 3 },
  ],
  genderDistribution: [0.5, 0.5, 0],
  backstoryTemplates: [
    '{{name}} started with a pack mule and a dream. Now the general store in {{location}} stocks everything from axle grease to zinc ointment.',
    'The {{faction}} hired {{name}} to manage the company store. {{firstName}} tries to be fair, despite corporate pressure.',
    'Three generations of {{lastName}}s have run this store. {{name}} intends to keep the tradition alive.',
    '{{name}} came west after {{event}}, bringing capital and connections from {{hometown}}.',
    'A former prospector, {{name}} realized that selling picks was more profitable than swinging them.',
  ],
  descriptionTemplates: [
    'An apron-wearing figure surrounded by the smell of leather, tobacco, and possibility. {{firstName}} knows the inventory by heart.',
    "Quick with a smile and quicker with the abacus. {{firstName}} can calculate your total before you've finished browsing.",
    'Dusty from restocking shelves, with a pencil perpetually behind one ear. {{firstName}} is always working.',
    "A merchant's calculating gaze softened by genuine warmth. {{firstName}} remembers every customer.",
    'Ink-stained fingers and tired feet. Running a general store is harder than it looks.',
  ],
  dialogueTreeIds: ['merchant_generic', 'merchant_shop', 'merchant_special_order'],
  questGiverChance: 0.4,
  shopChance: 1.0,
  tags: ['merchant', 'essential', 'supplies'],
  validLocationTypes: ['town', 'city', 'outpost'],
  minImportance: 0.5,
};

const GunsmithTemplate: NPCTemplate = {
  id: 'gunsmith',
  name: 'Gunsmith',
  description: "Craftsman of death's tools - where the line between art and armament blurs.",
  role: 'merchant',
  allowedFactions: ['neutral', 'townsfolk', 'freeminer'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.3, 0.6],
    curiosity: [0.5, 0.8],
    greed: [0.3, 0.6],
    honesty: [0.5, 0.8],
    lawfulness: [0.4, 0.7],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_european', weight: 5 },
    { origin: 'frontier_hispanic', weight: 1 },
  ],
  genderDistribution: [0.8, 0.2, 0],
  backstoryTemplates: [
    '{{name}} apprenticed under a master gunsmith in {{hometown}} before {{event}} brought {{firstName}} west. The skills translate well to the frontier.',
    'A former army armorer, {{name}} served {{years}} years before mustering out. Now {{firstName}} serves anyone with coin.',
    '{{name}} designed guns for the {{faction}} before a disagreement over ethics. Now {{firstName}} works independently in {{location}}.',
    'Self-taught from books and trial, {{name}} has blown up more prototypes than {{firstName}} cares to admit. The surviving designs are exceptional.',
    '{{name}} inherited the craft from {{relative}}. The family has been making guns for three generations.',
  ],
  descriptionTemplates: [
    "Scarred hands and a missing finger - occupational hazards. {{firstName}}'s remaining fingers are surgeon-steady.",
    'Squinting eyes from years of detail work. {{firstName}} examines every weapon like a surgeon studying a patient.',
    "Oil-stained and perpetually busy. {{firstName}}'s workshop smells of metal and gunpowder.",
    "A craftsman's pride shows in every piece {{firstName}} makes. Each gun is signed.",
    'Callused fingers and a critical eye. {{firstName}} can spot a flaw at twenty paces.',
  ],
  dialogueTreeIds: ['gunsmith_generic', 'gunsmith_shop', 'gunsmith_custom'],
  questGiverChance: 0.4,
  shopChance: 1.0,
  tags: ['merchant', 'craftsman', 'weapons', 'combat'],
  validLocationTypes: ['town', 'city'],
  minImportance: 0.5,
};

const BlacksmithTemplate: NPCTemplate = {
  id: 'blacksmith',
  name: 'Blacksmith',
  description: 'Master of fire and iron - the backbone of any frontier settlement.',
  role: 'blacksmith',
  allowedFactions: ['neutral', 'townsfolk', 'freeminer'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.4, 0.7],
    curiosity: [0.3, 0.5],
    greed: [0.2, 0.5],
    honesty: [0.6, 0.9],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 3 },
    { origin: 'frontier_european', weight: 4 },
    { origin: 'frontier_hispanic', weight: 3 },
  ],
  genderDistribution: [0.75, 0.25, 0],
  backstoryTemplates: [
    "{{name}} has worked the forge for {{years}} years. The heat doesn't bother {{firstName}} anymore - it's like an old friend.",
    'A former farrier for the cavalry, {{name}} followed the army west and stayed when {{firstName}} found {{location}}.',
    '{{name}} learned the trade from {{relative}} in {{hometown}}. Now {{firstName}} teaches it to anyone willing to learn.',
    "The {{faction}} contracted {{name}} to maintain their equipment. It's steady work, if morally complicated.",
    'After {{event}}, {{name}} needed to disappear. What better place to hide than behind a forge?',
  ],
  descriptionTemplates: [
    'Arms like tree trunks and a permanent sheen of sweat. {{firstName}} looks like {{firstName}} was forged rather than born.',
    "Burn scars criss-cross {{firstName}}'s forearms like a map of {{firstName}}'s career.",
    'A leather apron hangs over a barrel chest. The sound of hammer on anvil follows {{firstName}} even in sleep.',
    'Soot-blackened face split by a white-toothed grin. {{firstName}} loves the work.',
    'Quiet and methodical. {{firstName}} lets the hammer do the talking.',
  ],
  dialogueTreeIds: ['blacksmith_generic', 'blacksmith_shop', 'blacksmith_repair'],
  questGiverChance: 0.3,
  shopChance: 0.9,
  tags: ['merchant', 'craftsman', 'essential', 'labor'],
  validLocationTypes: ['town', 'city', 'outpost', 'ranch', 'mine'],
  minImportance: 0.4,
};

const DoctorTemplate: NPCTemplate = {
  id: 'doctor',
  name: 'Doctor',
  description: 'Healer on the frontier - where medical school meets frontier surgery.',
  role: 'doctor',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.1, 0.3],
    friendliness: [0.5, 0.8],
    curiosity: [0.6, 0.9],
    greed: [0.2, 0.5],
    honesty: [0.6, 0.9],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 3 },
    { origin: 'frontier_chinese', weight: 3 },
    { origin: 'frontier_european', weight: 4 },
  ],
  genderDistribution: [0.6, 0.4, 0],
  backstoryTemplates: [
    'Dr. {{name}} studied medicine in {{hometown}} before {{event}} drove {{firstName}} to seek a simpler life. The frontier proved anything but simple.',
    '{{name}} served as a field surgeon during the war. The skills learned amid cannon fire serve well in {{location}}.',
    'A practitioner of both Western and Eastern medicine, {{name}} combines traditions in ways that scandalize purists and save lives.',
    '{{name}} came to {{location}} following an outbreak of {{event}}. {{firstName}} stayed because the people needed someone.',
    "They say {{name}} lost {{relative}} to a disease {{firstName}} couldn't cure. Now {{firstName}} fights death like a personal enemy.",
  ],
  descriptionTemplates: [
    "Spectacles and a medical bag that never leaves {{firstName}}'s side. The smell of carbolic acid clings to everything.",
    'Tired eyes but steady hands. {{firstName}} has seen too much death to let another patient slip away without a fight.',
    "A gentle demeanor that puts patients at ease. {{firstName}}'s bedside manner is as important as {{firstName}}'s medicine.",
    "Blood stains on the cuffs that won't quite wash out. {{firstName}}'s clothes tell the story of the day's work.",
    'Gray-streaked hair and a calm presence. {{firstName}} brings peace even to the dying.',
  ],
  dialogueTreeIds: ['doctor_generic', 'doctor_treatment', 'doctor_shop'],
  questGiverChance: 0.5,
  shopChance: 0.8,
  tags: ['healer', 'educated', 'essential', 'quest_giver'],
  validLocationTypes: ['town', 'city'],
  minImportance: 0.6,
};

const UndertakerTemplate: NPCTemplate = {
  id: 'undertaker',
  name: 'Undertaker',
  description: 'Guardian of the departed - the last friend many will ever have.',
  role: 'undertaker',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.1, 0.3],
    friendliness: [0.3, 0.6],
    curiosity: [0.4, 0.7],
    greed: [0.3, 0.6],
    honesty: [0.5, 0.8],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 5 },
    { origin: 'frontier_european', weight: 5 },
  ],
  genderDistribution: [0.7, 0.3, 0],
  backstoryTemplates: [
    '{{name}} came to the undertaking trade after {{event}}. Preparing the dead seemed preferable to making more of them.',
    'Three generations of {{lastName}}s have buried the citizens of {{location}}. {{name}} knows where all the bodies are - literally.',
    '{{name}} was a carpenter before the bodies started piling up faster than the furniture orders. Coffins pay better.',
    'A former battlefield medic, {{name}} found {{firstName}} could help the dead better than the living.',
    "{{name}} claims to speak to the departed. Whether it's true or marketing, business has never been better.",
  ],
  descriptionTemplates: [
    "Pale from too much time indoors with the wrong kind of company. {{firstName}}'s hands are always clean - professionally so.",
    'A somber expression that seems permanent. {{firstName}} has attended too many funerals to smile easily.',
    'Black suit, black hat, black mood. {{firstName}} has made an aesthetic of death.',
    'Quiet voice and measured movements. {{firstName}} treats every body with the same respect.',
    "Formaldehyde and furniture polish - the signature scent of {{firstName}}'s profession.",
  ],
  dialogueTreeIds: ['undertaker_generic', 'undertaker_service'],
  questGiverChance: 0.3,
  shopChance: 0.4,
  tags: ['death', 'information', 'macabre'],
  validLocationTypes: ['town', 'city'],
  minImportance: 0.3,
};

const HotelOwnerTemplate: NPCTemplate = {
  id: 'hotel_owner',
  name: 'Hotel Owner',
  description: 'Keeper of beds and secrets - knows who sleeps where and with whom.',
  role: 'merchant',
  allowedFactions: ['neutral', 'townsfolk', 'ivrc'],
  personality: {
    aggression: [0.1, 0.3],
    friendliness: [0.5, 0.8],
    curiosity: [0.5, 0.8],
    greed: [0.4, 0.7],
    honesty: [0.4, 0.7],
    lawfulness: [0.4, 0.7],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_european', weight: 4 },
    { origin: 'frontier_hispanic', weight: 2 },
  ],
  genderDistribution: [0.4, 0.6, 0],
  backstoryTemplates: [
    '{{name}} built the hotel when the railroad came through. {{firstName}} bet on {{location}} and won.',
    "A widow who turned {{relative}}'s death into opportunity, {{name}} now runs the finest hotel this side of {{hometown}}.",
    '{{name}} worked in hospitality back East before {{event}} brought {{firstName}} to the frontier. Standards have... adjusted.',
    'The {{faction}} owns the hotel, but {{name}} runs it. {{firstName}} pretends not to notice certain guests.',
    '{{name}} came west as a mail-order bride, but when the groom died, {{firstName}} kept the hotel instead.',
  ],
  descriptionTemplates: [
    "Impeccably dressed despite the dust. {{firstName}} maintains standards even when the frontier won't.",
    "A hospitality professional's smile - warm but calculated. {{firstName}} is always evaluating.",
    'Key ring at the hip like a weapon. {{firstName}} knows every room and every guest.',
    'Tired but gracious. Running a frontier hotel is a 24-hour job.',
    'Sharp eyes notice every muddy boot and every suspicious package. {{firstName}} sees all.',
  ],
  dialogueTreeIds: ['hotel_generic', 'hotel_room', 'hotel_gossip'],
  questGiverChance: 0.4,
  shopChance: 0.8,
  tags: ['merchant', 'social', 'information', 'lodging'],
  validLocationTypes: ['town', 'city'],
  minImportance: 0.4,
};

const StableMasterTemplate: NPCTemplate = {
  id: 'stable_master',
  name: 'Stable Master',
  description: 'Keeper of horses and secrets of the road - knows who comes and goes.',
  role: 'merchant',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.2, 0.4],
    friendliness: [0.4, 0.7],
    curiosity: [0.3, 0.6],
    greed: [0.3, 0.6],
    honesty: [0.5, 0.8],
    lawfulness: [0.4, 0.7],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_hispanic', weight: 4 },
    { origin: 'frontier_native', weight: 2 },
  ],
  genderDistribution: [0.7, 0.3, 0],
  backstoryTemplates: [
    '{{name}} has been around horses longer than most folks have been alive. The animals trust {{firstName}} more than they trust most humans.',
    'A former cavalry horse handler, {{name}} retired from the army but not from horses.',
    '{{name}} inherited the stable from {{relative}}. What {{firstName}} lacks in business sense, {{firstName}} makes up in animal care.',
    'After {{event}}, {{name}} found that horses made better company than people.',
    "{{name}} can tell a horse's health at a glance and a rider's character just as quick.",
  ],
  descriptionTemplates: [
    'Hay in the hair and horse smell that never quite washes off. {{firstName}} is more comfortable in a stable than a saloon.',
    'Bow-legged from a lifetime in the saddle. {{firstName}} walks like the ground is an inconvenience.',
    "Gentle hands that can calm the most nervous horse. {{firstName}}'s voice is soft but carries.",
    'Sun-weathered face with laugh lines from years of good horses and bad jokes.',
    'A whistle brings horses running. {{firstName}} has a way with animals that borders on magical.',
  ],
  dialogueTreeIds: ['stable_generic', 'stable_shop', 'stable_horse_trade'],
  questGiverChance: 0.3,
  shopChance: 0.9,
  tags: ['merchant', 'animals', 'transport'],
  validLocationTypes: ['town', 'city', 'outpost', 'ranch'],
  minImportance: 0.4,
};

// ============================================================================
// WORKERS
// ============================================================================

const BartenderTemplate: NPCTemplate = {
  id: 'bartender',
  name: 'Bartender',
  description:
    'Pourer of drinks and listener of troubles - the unofficial therapist of the frontier.',
  role: 'bartender',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.2, 0.4],
    friendliness: [0.5, 0.8],
    curiosity: [0.5, 0.8],
    greed: [0.3, 0.6],
    honesty: [0.4, 0.7],
    lawfulness: [0.3, 0.6],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_hispanic', weight: 3 },
    { origin: 'frontier_european', weight: 3 },
  ],
  genderDistribution: [0.5, 0.5, 0],
  backstoryTemplates: [
    "{{name}} has worked the bar for {{years}} years. {{firstName}} knows everyone's drink and everyone's story.",
    'A drifter who found a home behind the bar, {{name}} pours drinks and collects secrets.',
    '{{name}} is working off a debt to the saloon owner. {{years}} more months to go.',
    'Former outlaw turned honest, {{name}} found that bartending beats robbing stagecoaches.',
    '{{name}} came west with dreams of gold. Now {{firstName}} serves those who still have them.',
  ],
  descriptionTemplates: [
    'A friendly face and a quick pour. {{firstName}} remembers your drink before you order.',
    'Shirt sleeves rolled up and a towel over one shoulder. {{firstName}} is always working.',
    'Quiet efficiency behind the bar. {{firstName}} sees everything and says little.',
    "A storyteller's gleam in the eye. {{firstName}} collects tales like some collect coins.",
    'Scarred knuckles from breaking up too many fights. {{firstName}} can handle trouble.',
  ],
  dialogueTreeIds: ['bartender_generic', 'bartender_rumor', 'bartender_drink'],
  questGiverChance: 0.4,
  shopChance: 0.7,
  tags: ['worker', 'social', 'information'],
  validLocationTypes: ['town', 'city', 'outpost'],
  minImportance: 0.3,
};

const RanchHandTemplate: NPCTemplate = {
  id: 'ranch_hand',
  name: 'Ranch Hand',
  description: 'Hard worker of the range - rope-calloused hands and dust-covered dreams.',
  role: 'rancher',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.4, 0.7],
    curiosity: [0.2, 0.5],
    greed: [0.2, 0.5],
    honesty: [0.5, 0.8],
    lawfulness: [0.4, 0.7],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_hispanic', weight: 4 },
    { origin: 'frontier_native', weight: 2 },
  ],
  genderDistribution: [0.75, 0.25, 0],
  backstoryTemplates: [
    "{{name}} has worked cattle since {{firstName}} could sit a horse. It's honest work, even if the pay isn't.",
    'A drifter who settled down at {{location}}, {{name}} found that ranch work suited {{firstName}} better than wandering.',
    "{{name}} is saving up to buy {{firstName}}'s own spread. {{years}} more years at this rate.",
    'After {{event}}, {{name}} needed steady work and no questions. The ranch provided both.',
    '{{name}} grew up on a ranch in {{hometown}} before coming to {{location}} for better wages.',
  ],
  descriptionTemplates: [
    'Sun-darkened skin and rope-burned hands. {{firstName}} has earned every callus.',
    'Dust-covered from hat to boots. {{firstName}} smells of horse and hard work.',
    'A bandana hangs loose around the neck, ready for dust or sweat. {{firstName}} is always prepared.',
    'Bowlegged from too much time in the saddle. {{firstName}} walks like the ground is unfamiliar.',
    'Young face but old eyes. Ranch life ages a person quickly.',
  ],
  dialogueTreeIds: ['ranch_hand_generic', 'ranch_hand_work'],
  questGiverChance: 0.2,
  shopChance: 0,
  tags: ['worker', 'labor', 'rural'],
  validLocationTypes: ['ranch', 'town', 'outpost'],
  minImportance: 0.2,
};

const MinerTemplate: NPCTemplate = {
  id: 'miner',
  name: 'Miner',
  description: 'Digger of earth and seeker of fortune - one swing away from rich or dead.',
  role: 'miner',
  allowedFactions: ['neutral', 'freeminer', 'ivrc'],
  personality: {
    aggression: [0.3, 0.6],
    friendliness: [0.3, 0.6],
    curiosity: [0.2, 0.5],
    greed: [0.5, 0.9],
    honesty: [0.3, 0.7],
    lawfulness: [0.2, 0.6],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 3 },
    { origin: 'frontier_chinese', weight: 3 },
    { origin: 'frontier_european', weight: 3 },
    { origin: 'frontier_hispanic', weight: 1 },
  ],
  genderDistribution: [0.85, 0.15, 0],
  backstoryTemplates: [
    '{{name}} came west chasing the copper boom. {{years}} years later, {{firstName}} is still chasing.',
    'A company miner for the {{faction}}, {{name}} works the deep shafts for wages that barely cover the company store.',
    '{{name}} struck a small vein last year. Just enough to keep the dream alive, not enough to quit.',
    "After {{event}} back in {{hometown}}, {{name}} figured the mines couldn't be worse. {{firstName}} was wrong.",
    "{{name}} worked the coal mines back East. Copper is cleaner, but the danger's the same.",
  ],
  descriptionTemplates: [
    'Dust-caked and hollow-eyed. {{firstName}} carries the darkness of the mines even in daylight.',
    "A persistent cough and calloused hands. {{firstName}}'s lungs have seen better days.",
    'Muscles built from swinging a pick all day. {{firstName}} is stronger than {{firstName}} looks.',
    "Permanent squint from working by lantern light. {{firstName}}'s eyes struggle with the sun.",
    "A miner's lamp hangs from the belt, always ready. {{firstName}} trusts the darkness like an old friend.",
  ],
  dialogueTreeIds: ['miner_generic', 'miner_claim'],
  questGiverChance: 0.3,
  shopChance: 0,
  tags: ['worker', 'labor', 'mining'],
  validLocationTypes: ['mine', 'town', 'camp'],
  minImportance: 0.2,
};

const RailroadWorkerTemplate: NPCTemplate = {
  id: 'railroad_worker',
  name: 'Railroad Worker',
  description: 'Builder of the iron road - connecting the frontier one spike at a time.',
  role: 'townsfolk',
  allowedFactions: ['neutral', 'ivrc'],
  personality: {
    aggression: [0.3, 0.6],
    friendliness: [0.3, 0.6],
    curiosity: [0.2, 0.5],
    greed: [0.3, 0.6],
    honesty: [0.4, 0.7],
    lawfulness: [0.4, 0.7],
  },
  nameOrigins: [
    { origin: 'frontier_chinese', weight: 4 },
    { origin: 'frontier_anglo', weight: 3 },
    { origin: 'frontier_european', weight: 3 },
  ],
  genderDistribution: [0.9, 0.1, 0],
  backstoryTemplates: [
    "{{name}} has laid track from {{hometown}} to {{location}}. Every mile is written on {{firstName}}'s back.",
    'A dynamite man for the {{faction}}, {{name}} blasts the path that others will follow.',
    "{{name}} came for the promised wages, stayed because there's nowhere else to go.",
    'After {{event}}, {{name}} needed work that asked no questions. The railroad obliged.',
    '{{name}} dreams of the day the rails reach the coast. Then maybe {{firstName}} can rest.',
  ],
  descriptionTemplates: [
    'Massive shoulders built from swinging sledges. {{firstName}} could drive a spike in one blow.',
    'Sun-blackened and rail-straight. {{firstName}} has become as hard as the iron {{firstName}} works.',
    "Calluses on calluses. {{firstName}}'s hands have forgotten what soft feels like.",
    'A distant look in the eyes - miles of track laid, miles more to go.',
    'Chinese characters tattooed on one forearm. {{firstName}} carries home wherever {{firstName}} goes.',
  ],
  dialogueTreeIds: ['railroad_worker_generic', 'railroad_worker_news'],
  questGiverChance: 0.2,
  shopChance: 0,
  tags: ['worker', 'labor', 'railroad', 'ivrc'],
  validLocationTypes: ['town', 'city', 'camp', 'train_station'],
  minImportance: 0.2,
};

const TelegraphOperatorTemplate: NPCTemplate = {
  id: 'telegraph_operator',
  name: 'Telegraph Operator',
  description: 'Master of dots and dashes - the fastest connection to the wider world.',
  role: 'townsfolk',
  allowedFactions: ['neutral', 'ivrc', 'townsfolk'],
  personality: {
    aggression: [0.1, 0.3],
    friendliness: [0.4, 0.7],
    curiosity: [0.6, 0.9],
    greed: [0.2, 0.5],
    honesty: [0.4, 0.8],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 5 },
    { origin: 'frontier_european', weight: 4 },
    { origin: 'frontier_chinese', weight: 1 },
  ],
  genderDistribution: [0.6, 0.4, 0],
  backstoryTemplates: [
    '{{name}} learned Morse in the army, sending messages that decided battles. Civilian work is quieter.',
    'A natural with machines, {{name}} was recruited by the {{faction}} straight out of {{hometown}}.',
    '{{name}} knows every secret that passes through the wire. {{firstName}} pretends not to.',
    "After {{event}}, {{name}} found comfort in the click-clack of the telegraph key. It's predictable.",
    '{{name}} was a journalist before coming west. Now {{firstName}} sends the news instead of writing it.',
  ],
  descriptionTemplates: [
    'Ink-stained fingers tap constantly, even when away from the key. {{firstName}} thinks in Morse.',
    'Spectacles and a green eyeshade. {{firstName}} looks every part the office worker.',
    'Quick eyes that see patterns everywhere. {{firstName}} can read people like telegraph tape.',
    'A nervous energy about {{firstName}} - too much caffeine and too many urgent messages.',
    'Hearing slightly diminished from years of clicking keys. {{firstName}} reads lips when necessary.',
  ],
  dialogueTreeIds: ['telegraph_generic', 'telegraph_news', 'telegraph_send'],
  questGiverChance: 0.4,
  shopChance: 0.3,
  tags: ['worker', 'information', 'communication', 'educated'],
  validLocationTypes: ['town', 'city', 'train_station'],
  minImportance: 0.3,
};

// ============================================================================
// OUTLAWS
// ============================================================================

const BanditLeaderTemplate: NPCTemplate = {
  id: 'bandit_leader',
  name: 'Bandit Leader',
  description: 'Boss of the lawless - rules through fear, cunning, and a fast gun.',
  role: 'gang_leader',
  allowedFactions: ['copperhead', 'neutral'],
  personality: {
    aggression: [0.6, 0.9],
    friendliness: [0.2, 0.5],
    curiosity: [0.4, 0.7],
    greed: [0.7, 1.0],
    honesty: [0.1, 0.4],
    lawfulness: [0.0, 0.2],
  },
  nameOrigins: [
    { origin: 'outlaw', weight: 6 },
    { origin: 'frontier_anglo', weight: 2 },
    { origin: 'frontier_hispanic', weight: 2 },
  ],
  genderDistribution: [0.7, 0.3, 0],
  backstoryTemplates: [
    '{{name}} built the gang from nothing after {{event}}. Now {{firstName}} controls every outlaw operation within a hundred miles.',
    'Once a respectable citizen of {{hometown}}, {{name}} turned outlaw when the {{faction}} took everything {{firstName}} had.',
    "{{name}} killed the previous gang leader in a duel. That's how leadership works out here.",
    "They say {{name}} robbed {{firstName}}'s first stagecoach at fifteen. {{years}} years later, the legend has only grown.",
    "{{name}} has a price on {{firstName}}'s head in three territories. {{firstName}} wears it like a badge of honor.",
  ],
  descriptionTemplates: [
    'Cold eyes that have watched too many people die. {{firstName}} radiates danger like heat from a fire.',
    "A cruel smile plays at the corners of {{firstName}}'s mouth. This one enjoys the work.",
    'Expensive clothes bought with blood money. {{firstName}} has expensive tastes.',
    'Scars tell the story of a violent life. {{firstName}} has survived what would kill most.',
    "A presence that commands attention and fear. {{firstName}} doesn't need to raise {{firstName}}'s voice.",
  ],
  dialogueTreeIds: ['outlaw_leader_generic', 'outlaw_leader_deal', 'outlaw_leader_threat'],
  questGiverChance: 0.6,
  shopChance: 0.2,
  tags: ['outlaw', 'combat', 'leader', 'dangerous', 'quest_giver'],
  validLocationTypes: ['hideout', 'camp', 'ruins'],
  minImportance: 0.8,
};

const GangMemberTemplate: NPCTemplate = {
  id: 'gang_member',
  name: 'Gang Member',
  description:
    'Outlaw foot soldier - following orders and hoping to survive long enough to spend the take.',
  role: 'outlaw',
  allowedFactions: ['copperhead', 'neutral'],
  personality: {
    aggression: [0.5, 0.8],
    friendliness: [0.2, 0.5],
    curiosity: [0.2, 0.5],
    greed: [0.5, 0.8],
    honesty: [0.1, 0.4],
    lawfulness: [0.0, 0.3],
  },
  nameOrigins: [
    { origin: 'outlaw', weight: 4 },
    { origin: 'frontier_anglo', weight: 3 },
    { origin: 'frontier_hispanic', weight: 3 },
  ],
  genderDistribution: [0.75, 0.25, 0],
  backstoryTemplates: [
    '{{name}} joined the gang after {{event}} left {{firstName}} with nothing to lose.',
    "A wanted man in {{hometown}}, {{name}} found that outlaws don't ask questions.",
    "{{name}} isn't proud of the work, but it beats starving. Mostly.",
    "Born into poverty, {{name}} saw the gang as a way out. Now {{firstName}} can't get back in.",
    "{{name}} rides with {{rival}}'s crew. Loyalty to the gang is all {{firstName}} has left.",
  ],
  descriptionTemplates: [
    'Nervous eyes constantly scanning for trouble - or opportunity. {{firstName}} trusts no one.',
    'A mean look and a meaner gun. {{firstName}} has killed before and will again.',
    'Dust-covered and hard-bitten. {{firstName}} looks like trouble even when standing still.',
    'Young face hiding old sins. {{firstName}} grew up too fast in the wrong direction.',
    'Faded wanted poster features peek through the trail dust. {{firstName}} is running from something.',
  ],
  dialogueTreeIds: ['outlaw_generic', 'outlaw_threat'],
  questGiverChance: 0.2,
  shopChance: 0,
  tags: ['outlaw', 'combat', 'dangerous'],
  validLocationTypes: ['hideout', 'camp', 'wilderness', 'ruins'],
  minImportance: 0.2,
};

const RustlerTemplate: NPCTemplate = {
  id: 'rustler',
  name: 'Rustler',
  description: 'Cattle thief - making a living one stolen steer at a time.',
  role: 'outlaw',
  allowedFactions: ['copperhead', 'neutral'],
  personality: {
    aggression: [0.3, 0.6],
    friendliness: [0.3, 0.6],
    curiosity: [0.3, 0.6],
    greed: [0.6, 0.9],
    honesty: [0.1, 0.4],
    lawfulness: [0.0, 0.2],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_hispanic', weight: 4 },
    { origin: 'outlaw', weight: 2 },
  ],
  genderDistribution: [0.8, 0.2, 0],
  backstoryTemplates: [
    '{{name}} knows cattle better than most ranchers. {{firstName}} just has a different relationship with ownership.',
    'A former ranch hand, {{name}} turned rustler when {{relative}} got cheated by a cattle baron.',
    "{{name}} works the border, moving stolen stock where brands don't matter.",
    "After {{event}}, {{name}} figured taking from the rich wasn't really stealing.",
    '{{name}} sees rustling as wealth redistribution. The ranchers have other opinions.',
  ],
  descriptionTemplates: [
    "Ranch hand clothes but outlaw eyes. {{firstName}} knows how to blend in until it's time to run.",
    'A running iron hangs from the saddle. {{firstName}} can change a brand faster than most can read one.',
    'Perpetually looking over one shoulder. {{firstName}} knows what happens to caught rustlers.',
    'Skilled hands and no scruples. {{firstName}} could be a top hand if {{firstName}} wanted honest work.',
    'Trail-worn and cattle-scented. {{firstName}} has been on the run longer than {{firstName}} can remember.',
  ],
  dialogueTreeIds: ['rustler_generic', 'rustler_deal'],
  questGiverChance: 0.3,
  shopChance: 0.1,
  tags: ['outlaw', 'rural', 'thief'],
  validLocationTypes: ['hideout', 'camp', 'wilderness', 'ranch'],
  minImportance: 0.3,
};

const FenceTemplate: NPCTemplate = {
  id: 'fence',
  name: 'Fence',
  description: 'Dealer in stolen goods - the quiet engine of the outlaw economy.',
  role: 'merchant',
  allowedFactions: ['copperhead', 'neutral'],
  personality: {
    aggression: [0.2, 0.4],
    friendliness: [0.4, 0.7],
    curiosity: [0.4, 0.7],
    greed: [0.7, 1.0],
    honesty: [0.1, 0.4],
    lawfulness: [0.0, 0.3],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 3 },
    { origin: 'frontier_chinese', weight: 3 },
    { origin: 'frontier_european', weight: 3 },
    { origin: 'outlaw', weight: 1 },
  ],
  genderDistribution: [0.6, 0.4, 0],
  backstoryTemplates: [
    '{{name}} runs a legitimate business. The back room is a different story.',
    'A former jeweler from {{hometown}}, {{name}} found that buying low and selling high works even better with stolen goods.',
    '{{name}} has connections in every town within a hundred miles. {{firstName}} can move anything, anywhere.',
    "After {{event}}, {{name}} learned that morality is expensive. {{firstName}} can't afford it.",
    "{{name}} works for {{rival}}, moving goods the gang acquires. It's a profitable arrangement.",
  ],
  descriptionTemplates: [
    'Honest face hiding dishonest work. {{firstName}} could sell sand in the desert.',
    'Quick hands that appraise value in seconds. {{firstName}} knows exactly what everything is worth.',
    "A merchant's smile that never reaches the calculating eyes. {{firstName}} is always doing math.",
    'Unremarkable in every way - which is exactly the point. {{firstName}} is easy to overlook.',
    'Nervous energy masked by practiced calm. {{firstName}} is always waiting for the law.',
  ],
  dialogueTreeIds: ['fence_generic', 'fence_shop', 'fence_information'],
  questGiverChance: 0.4,
  shopChance: 0.95,
  tags: ['outlaw', 'merchant', 'information', 'criminal'],
  validLocationTypes: ['town', 'city', 'hideout'],
  minImportance: 0.4,
};

const GamblerTemplate: NPCTemplate = {
  id: 'gambler',
  name: 'Gambler',
  description: 'Player of games and people - living on luck and nerve.',
  role: 'gambler',
  allowedFactions: ['neutral', 'copperhead', 'townsfolk'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.5, 0.8],
    curiosity: [0.4, 0.7],
    greed: [0.5, 0.9],
    honesty: [0.2, 0.6],
    lawfulness: [0.2, 0.5],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_european', weight: 4 },
    { origin: 'outlaw', weight: 2 },
  ],
  genderDistribution: [0.6, 0.4, 0],
  backstoryTemplates: [
    "{{name}} won {{firstName}}'s first fortune at seventeen and has been chasing that feeling ever since.",
    'A professional from the riverboats, {{name}} came west when the stakes got too hot back East.',
    "{{name}} can read a poker face like others read books. It's a gift - and a curse.",
    'After {{event}}, {{name}} swore off honest work. The cards have been good since.',
    '{{name}} has been run out of more towns than {{firstName}} can count. {{location}} is just the latest stop.',
  ],
  descriptionTemplates: [
    'Fancy clothes and fancier manners. {{firstName}} stands out in any frontier crowd.',
    'Quick hands that shuffle cards like water flowing. {{firstName}} makes it look easy.',
    'A poker face carved from stone. {{firstName}} reveals nothing - ever.',
    "Expensive rings and a hidden derringer. {{firstName}} doesn't leave anything to chance.",
    'Charming smile and calculating eyes. {{firstName}} is always working an angle.',
  ],
  dialogueTreeIds: ['gambler_generic', 'gambler_game', 'gambler_deal'],
  questGiverChance: 0.4,
  shopChance: 0.2,
  tags: ['social', 'risk', 'information', 'charming'],
  validLocationTypes: ['town', 'city', 'saloon'],
  minImportance: 0.4,
};

// ============================================================================
// OTHER
// ============================================================================

const PreacherTemplate: NPCTemplate = {
  id: 'preacher',
  name: 'Preacher',
  description: 'Shepherd of souls on the frontier - bringing faith to the faithless.',
  role: 'preacher',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.1, 0.3],
    friendliness: [0.6, 0.9],
    curiosity: [0.4, 0.7],
    greed: [0.1, 0.3],
    honesty: [0.7, 1.0],
    lawfulness: [0.6, 0.9],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 5 },
    { origin: 'frontier_hispanic', weight: 3 },
    { origin: 'frontier_european', weight: 2 },
  ],
  genderDistribution: [0.7, 0.3, 0],
  backstoryTemplates: [
    '{{name}} heard the calling after {{event}}. Now {{firstName}} brings the Word to those who need it most.',
    'A former sinner saved by grace, {{name}} preaches redemption from personal experience.',
    '{{name}} came west with the settlers, building churches as fast as the towns spring up.',
    'The church in {{hometown}} sent {{name}} to civilize the frontier. {{firstName}} is still working on it.',
    '{{name}} lost {{relative}} to violence. Now {{firstName}} fights for souls instead of vengeance.',
  ],
  descriptionTemplates: [
    "Worn Bible in hand, hope in heart. {{firstName}} sees the good in everyone, even when it's hard to find.",
    "Black coat dusty from travel. {{firstName}} brings the gospel wherever it's needed.",
    'Kind eyes that have witnessed both sin and salvation. {{firstName}} judges no one.',
    'A thundering voice that can fill a church or calm a mob. {{firstName}} knows how to be heard.',
    'Work-roughened hands and a gentle spirit. {{firstName}} builds with timber and faith alike.',
  ],
  dialogueTreeIds: ['preacher_generic', 'preacher_counsel', 'preacher_blessing'],
  questGiverChance: 0.5,
  shopChance: 0,
  tags: ['spiritual', 'social', 'healer', 'essential'],
  validLocationTypes: ['town', 'city', 'camp'],
  minImportance: 0.5,
};

const ProspectorTemplate: NPCTemplate = {
  id: 'prospector',
  name: 'Prospector',
  description: 'Seeker of fortune in the rocks - half crazy and all determined.',
  role: 'prospector',
  allowedFactions: ['neutral', 'freeminer'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.3, 0.6],
    curiosity: [0.6, 0.9],
    greed: [0.7, 1.0],
    honesty: [0.3, 0.7],
    lawfulness: [0.3, 0.6],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_european', weight: 3 },
    { origin: 'frontier_chinese', weight: 3 },
  ],
  genderDistribution: [0.85, 0.15, 0],
  backstoryTemplates: [
    '{{name}} has been prospecting for {{years}} years. The big strike is always just one more canyon away.',
    'They call {{name}} crazy for chasing color in these hills. {{firstName}} calls them unimaginative.',
    '{{name}} sold everything to come west and find gold. So far, the gold is winning.',
    'A former geologist, {{name}} uses science where others use luck. Results have been... mixed.',
    "{{name}} found a nugget once, big as {{firstName}}'s thumb. Been chasing that feeling ever since.",
  ],
  descriptionTemplates: [
    'Wild-eyed and wilder-haired. {{firstName}} has been in the hills too long.',
    'A pickaxe over one shoulder and a pan at the hip. {{firstName}} is always ready to dig.',
    'Sun-baked and half-starved. {{firstName}} spends money on supplies, not comfort.',
    "Sample bags bulging with rocks that might be worthless or might be a fortune. {{firstName}} can't tell anymore.",
    "Mule-stubborn and granite-tough. {{firstName}} won't quit until the earth gives up its secrets.",
  ],
  dialogueTreeIds: ['prospector_generic', 'prospector_claim', 'prospector_rumor'],
  questGiverChance: 0.4,
  shopChance: 0.1,
  tags: ['mining', 'wilderness', 'independent', 'information'],
  validLocationTypes: ['wilderness', 'mine', 'camp', 'town'],
  minImportance: 0.3,
};

const BountyHunterTemplate: NPCTemplate = {
  id: 'bounty_hunter',
  name: 'Bounty Hunter',
  description: 'Hunter of men - bringing outlaws to justice, dead or alive.',
  role: 'bounty_hunter',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.5, 0.8],
    friendliness: [0.2, 0.5],
    curiosity: [0.4, 0.7],
    greed: [0.5, 0.8],
    honesty: [0.4, 0.7],
    lawfulness: [0.4, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_hispanic', weight: 3 },
    { origin: 'frontier_native', weight: 2 },
    { origin: 'outlaw', weight: 1 },
  ],
  genderDistribution: [0.7, 0.3, 0],
  backstoryTemplates: [
    "{{name}} hunts the men the law can't catch. {{firstName}} doesn't ask why - just how much.",
    'A former lawman, {{name}} found that bounty hunting paid better and asked fewer questions.',
    '{{name}} started hunting after {{rival}} killed {{relative}}. The first bounty was personal. The rest are business.',
    'They say {{name}} has never lost a bounty. Dead or alive, {{firstName}} always delivers.',
    "{{name}} tracks the {{faction}}'s most wanted. The gang has a price on {{firstName}}'s head too.",
  ],
  descriptionTemplates: [
    'Cold, appraising eyes that size up everyone as a potential target. {{firstName}} is always working.',
    'Well-armed and well-traveled. {{firstName}} carries the tools of a deadly trade.',
    'A collection of wanted posters in the saddlebag. {{firstName}} has memorized every face.',
    'Scars from too many close calls. {{firstName}} has survived what kills lesser hunters.',
    'Calm demeanor that hints at the violence beneath. {{firstName}} is a predator in human form.',
  ],
  dialogueTreeIds: ['bounty_hunter_generic', 'bounty_hunter_job', 'bounty_hunter_info'],
  questGiverChance: 0.6,
  shopChance: 0.1,
  tags: ['combat', 'hunter', 'lawful', 'dangerous', 'quest_giver'],
  validLocationTypes: ['town', 'city', 'outpost', 'wilderness'],
  minImportance: 0.5,
};

const DrifterTemplate: NPCTemplate = {
  id: 'drifter',
  name: 'Drifter',
  description: 'Wanderer of the frontier - past unknown, future uncertain.',
  role: 'drifter',
  allowedFactions: ['neutral'],
  personality: {
    aggression: [0.2, 0.6],
    friendliness: [0.3, 0.7],
    curiosity: [0.4, 0.7],
    greed: [0.2, 0.5],
    honesty: [0.3, 0.7],
    lawfulness: [0.2, 0.6],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_hispanic', weight: 3 },
    { origin: 'outlaw', weight: 2 },
    { origin: 'frontier_native', weight: 1 },
  ],
  genderDistribution: [0.65, 0.35, 0],
  backstoryTemplates: [
    "{{name}} doesn't talk about the past. The future is all that matters, and it's always somewhere else.",
    'Once a settler in {{hometown}}, {{name}} lost everything to {{event}}. Now {{firstName}} belongs nowhere.',
    '{{name}} drifted into {{location}} last week. {{firstName}} might drift out tomorrow.',
    'They say {{name}} is running from something. {{firstName}} never denies it.',
    '{{name}} has worked every job the frontier offers. None of them stuck.',
  ],
  descriptionTemplates: [
    'Trail-worn clothes and distant eyes. {{firstName}} is already thinking about the next horizon.',
    "Light in the saddle and light in commitment. {{firstName}} owns nothing that won't fit on a horse.",
    'A face weathered by countless miles. {{firstName}} has seen more of the West than most.',
    'Quiet and watchful. {{firstName}} observes more than {{firstName}} participates.',
    'The thousand-yard stare of someone who has seen too much. {{firstName}} keeps moving to stay sane.',
  ],
  dialogueTreeIds: ['drifter_generic', 'drifter_story', 'drifter_help'],
  questGiverChance: 0.3,
  shopChance: 0,
  tags: ['wanderer', 'mysterious', 'information'],
  validLocationTypes: ['town', 'city', 'outpost', 'camp', 'wilderness'],
  minImportance: 0.2,
};

const HomesteaderTemplate: NPCTemplate = {
  id: 'homesteader',
  name: 'Homesteader',
  description: 'Builder of dreams on claimed land - fighting the frontier for a future.',
  role: 'farmer',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.4, 0.7],
    curiosity: [0.3, 0.6],
    greed: [0.2, 0.5],
    honesty: [0.6, 0.9],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_european', weight: 4 },
    { origin: 'frontier_hispanic', weight: 2 },
  ],
  genderDistribution: [0.5, 0.5, 0],
  backstoryTemplates: [
    '{{name}} filed a claim {{years}} years ago. The land is finally starting to yield.',
    'After {{event}} in {{hometown}}, {{name}} decided to build something new from scratch.',
    '{{name}} came west with {{relative}} and a dream. Now {{firstName}} has the land and the dream - {{relative}} is buried on it.',
    "The {{faction}} wanted this land, but {{name}} got here first. It's been a fight ever since.",
    '{{name}} proved up the claim last year. Now {{firstName}} just has to survive long enough to enjoy it.',
  ],
  descriptionTemplates: [
    'Calloused hands and a stubborn jaw. {{firstName}} has wrested a living from unwilling earth.',
    'Sun-weathered but unbowed. {{firstName}} has survived drought, locusts, and worse.',
    'A determined set to the shoulders. {{firstName}} has bet everything on this land.',
    'Work-worn clothes and honest eyes. {{firstName}} represents the best of the frontier spirit.',
    'Tired but hopeful. {{firstName}} sees the farm it will become, not the struggle it is now.',
  ],
  dialogueTreeIds: ['homesteader_generic', 'homesteader_trouble', 'homesteader_help'],
  questGiverChance: 0.5,
  shopChance: 0.2,
  tags: ['rural', 'labor', 'independent', 'quest_giver'],
  validLocationTypes: ['ranch', 'town', 'outpost', 'wilderness'],
  minImportance: 0.3,
};

const WidowTemplate: NPCTemplate = {
  id: 'widow',
  name: 'Widow',
  description: 'Left alone by the frontier - surviving against the odds.',
  role: 'townsfolk',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.1, 0.4],
    friendliness: [0.4, 0.7],
    curiosity: [0.3, 0.6],
    greed: [0.2, 0.5],
    honesty: [0.6, 0.9],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_european', weight: 3 },
    { origin: 'frontier_hispanic', weight: 3 },
  ],
  genderDistribution: [0.1, 0.9, 0],
  backstoryTemplates: [
    '{{name}} lost {{relative}} to {{event}} {{years}} years ago. {{firstName}} has kept going ever since.',
    "The frontier took {{name}}'s husband. Now {{firstName}} runs the {{item}} alone.",
    '{{name}} came west as a bride. {{firstName}} stayed as a survivor.',
    'They said {{name}} should go back East after {{relative}} died. {{firstName}} had other ideas.',
    "{{name}} wears black not for mourning, but as a reminder. {{firstName}} won't be beaten.",
  ],
  descriptionTemplates: [
    "A strength in {{firstName}}'s bearing that belies the black dress. This one is a survivor.",
    'Grief-lined face but determined eyes. {{firstName}} has buried the past and looks forward.',
    'Work-worn hands that handle everything from rifles to ladles. {{firstName}} does what needs doing.',
    'A quiet dignity that commands respect. {{firstName}} has earned every bit of it.',
    "Black clothes and iron will. {{firstName}} bends but doesn't break.",
  ],
  dialogueTreeIds: ['widow_generic', 'widow_help', 'widow_story'],
  questGiverChance: 0.5,
  shopChance: 0.3,
  tags: ['social', 'survivor', 'quest_giver'],
  validLocationTypes: ['town', 'city', 'ranch', 'outpost'],
  minImportance: 0.3,
};

const WidowerTemplate: NPCTemplate = {
  id: 'widower',
  name: 'Widower',
  description: 'A man haunted by loss - working to fill the void.',
  role: 'townsfolk',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.3, 0.6],
    curiosity: [0.2, 0.5],
    greed: [0.1, 0.4],
    honesty: [0.6, 0.9],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_european', weight: 3 },
    { origin: 'frontier_hispanic', weight: 3 },
  ],
  genderDistribution: [0.9, 0.1, 0],
  backstoryTemplates: [
    '{{name}} buried {{relative}} on the hill overlooking {{location}}. {{firstName}} visits every Sunday.',
    "The fever took {{relative}} {{years}} years ago. {{name}} hasn't been the same since.",
    "{{name}} threw {{firstName}} into work after {{relative}} passed. It's the only thing that helps.",
    "They say {{name}} talked to {{relative}}'s grave for a whole year. Maybe {{firstName}} still does.",
    "{{name}} wears {{relative}}'s wedding ring on a chain. The weight is a comfort.",
  ],
  descriptionTemplates: [
    'A hollow look in the eyes that grief has carved. {{firstName}} is present but not quite here.',
    "Shoulders that carry more than physical weight. {{firstName}} bears {{firstName}}'s loss visibly.",
    'Work-focused and word-scarce. {{firstName}} finds solace in being busy.',
    "A wedding ring on the wrong hand - moved after {{relative}} died. {{firstName}} couldn't bear to take it off.",
    'Weathered face with deeper lines than the years alone would carve. Loss ages a person.',
  ],
  dialogueTreeIds: ['widower_generic', 'widower_help', 'widower_story'],
  questGiverChance: 0.4,
  shopChance: 0.2,
  tags: ['social', 'survivor', 'melancholy'],
  validLocationTypes: ['town', 'city', 'ranch', 'outpost'],
  minImportance: 0.3,
};

// ============================================================================
// TEMPLATE COLLECTION
// ============================================================================

export const NPC_TEMPLATES: NPCTemplate[] = [
  // Town Officials
  SheriffTemplate,
  DeputyTemplate,
  MayorTemplate,
  JudgeTemplate,
  BankerTemplate,

  // Business Owners
  SaloonKeeperTemplate,
  GeneralStoreOwnerTemplate,
  GunsmithTemplate,
  BlacksmithTemplate,
  DoctorTemplate,
  UndertakerTemplate,
  HotelOwnerTemplate,
  StableMasterTemplate,

  // Workers
  BartenderTemplate,
  RanchHandTemplate,
  MinerTemplate,
  RailroadWorkerTemplate,
  TelegraphOperatorTemplate,

  // Outlaws
  BanditLeaderTemplate,
  GangMemberTemplate,
  RustlerTemplate,
  FenceTemplate,
  GamblerTemplate,

  // Other
  PreacherTemplate,
  ProspectorTemplate,
  BountyHunterTemplate,
  DrifterTemplate,
  HomesteaderTemplate,
  WidowTemplate,
  WidowerTemplate,
];

// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================

/** Map of template ID to template for quick lookup */
const TEMPLATES_BY_ID = new Map<string, NPCTemplate>(NPC_TEMPLATES.map((t) => [t.id, t]));

/** Map of role to templates for role-based lookup */
const TEMPLATES_BY_ROLE = new Map<string, NPCTemplate[]>();
for (const template of NPC_TEMPLATES) {
  const existing = TEMPLATES_BY_ROLE.get(template.role) || [];
  existing.push(template);
  TEMPLATES_BY_ROLE.set(template.role, existing);
}

/**
 * Get an NPC template by its unique ID
 */
export function getNPCTemplate(id: string): NPCTemplate | undefined {
  return TEMPLATES_BY_ID.get(id);
}

/**
 * Get all NPC templates for a given role
 */
export function getNPCTemplatesByRole(role: string): NPCTemplate[] {
  return TEMPLATES_BY_ROLE.get(role) || [];
}

/**
 * Get NPC templates filtered by tags
 */
export function getNPCTemplatesByTag(tag: string): NPCTemplate[] {
  return NPC_TEMPLATES.filter((t) => t.tags.includes(tag));
}

/**
 * Get NPC templates valid for a specific location type
 */
export function getNPCTemplatesByLocationType(locationType: string): NPCTemplate[] {
  return NPC_TEMPLATES.filter(
    (t) => t.validLocationTypes.length === 0 || t.validLocationTypes.includes(locationType)
  );
}

/**
 * Get NPC templates that can give quests
 */
export function getQuestGiverTemplates(): NPCTemplate[] {
  return NPC_TEMPLATES.filter((t) => t.questGiverChance > 0);
}

/**
 * Get NPC templates that can have shops
 */
export function getMerchantTemplates(): NPCTemplate[] {
  return NPC_TEMPLATES.filter((t) => t.shopChance > 0);
}

/**
 * Get NPC templates by minimum importance
 */
export function getNPCTemplatesByImportance(minImportance: number): NPCTemplate[] {
  return NPC_TEMPLATES.filter((t) => t.minImportance >= minImportance);
}

/**
 * Get NPC templates allowed for a specific faction
 */
export function getNPCTemplatesByFaction(faction: string): NPCTemplate[] {
  return NPC_TEMPLATES.filter((t) => t.allowedFactions.includes(faction));
}

// ============================================================================
// INDIVIDUAL EXPORTS
// ============================================================================

export {
  SheriffTemplate,
  DeputyTemplate,
  MayorTemplate,
  JudgeTemplate,
  BankerTemplate,
  SaloonKeeperTemplate,
  GeneralStoreOwnerTemplate,
  GunsmithTemplate,
  BlacksmithTemplate,
  DoctorTemplate,
  UndertakerTemplate,
  HotelOwnerTemplate,
  StableMasterTemplate,
  BartenderTemplate,
  RanchHandTemplate,
  MinerTemplate,
  RailroadWorkerTemplate,
  TelegraphOperatorTemplate,
  BanditLeaderTemplate,
  GangMemberTemplate,
  RustlerTemplate,
  FenceTemplate,
  GamblerTemplate,
  PreacherTemplate,
  ProspectorTemplate,
  BountyHunterTemplate,
  DrifterTemplate,
  HomesteaderTemplate,
  WidowTemplate,
  WidowerTemplate,
};
