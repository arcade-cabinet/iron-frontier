/**
 * Iron Frontier - World Lore Codex
 *
 * The complete collection of discoverable lore entries that reveal
 * the history, factions, locations, technology, and legends of the
 * Iron Frontier. Each entry is unlocked through gameplay.
 *
 * Categories:
 * - History (6 entries): The events that shaped the frontier
 * - Factions (4 entries): The powers that vie for control
 * - Locations (6 entries): The places players will explore
 * - Technology (4 entries): The innovations of the steam age
 * - Characters (4 entries): The legends and notable figures
 */

import type {
  DiscoveryCondition,
  LoreCategory,
  LoreCodexState,
  LoreEntry,
} from '../schemas/lore';

// ============================================================================
// HISTORY LORE ENTRIES
// ============================================================================

const HISTORY_ENTRIES: LoreEntry[] = [
  {
    id: 'lore_history_ivrc_founding',
    title: 'The Iron Valley Railroad Company',
    category: 'history',
    text: `In the spring of 1862, Cornelius Thorne and a consortium of Eastern industrialists filed the charter for the Iron Valley Railroad Company. What began as a modest venture to connect mining camps soon became the most powerful force in the territory.

Thorne's vision was audacious: a network of iron rails linking every settlement, every mine, every resource to the hungry markets of the East. He secured land grants from a cooperative territorial government and brought in thousands of workers—many Chinese immigrants, many desperate men fleeing the war back East.

The IVRC grew with ruthless efficiency. Towns that welcomed the railroad prospered; those that resisted found themselves bypassed and left to wither. Within a decade, the Company owned not just the rails but the telegraph lines, the water rights, and the politicians who were supposed to regulate them. The iron horse had become an iron fist.`,
    discoveryCondition: {
      type: 'automatic',
      hint: 'Known from the start',
    },
    unlocked: true,
    relatedEntries: ['lore_faction_ivrc', 'lore_history_thorne_dynasty'],
    tags: ['railroad', 'ivrc', 'founding', 'thorne'],
    sortOrder: 1,
  },
  {
    id: 'lore_history_mine_collapse',
    title: "The Great Mine Collapse of '78",
    category: 'history',
    text: `September 14th, 1878. The day Iron Gulch died.

The Thorne Mining Company's main shaft had been sinking deeper for years, chasing the richest copper vein anyone had ever seen. Safety inspectors warned of unstable rock formations. The Company ignored them—every day of delay cost thousands in lost revenue.

At 2:47 in the afternoon, the mountain spoke. A deep rumble, then a roar that survivors said sounded like God clearing his throat. The main shaft collapsed, taking three hundred and twelve men with it. The resulting dust cloud was visible from Dusty Springs, twenty miles away.

The Company paid each widow fifty dollars and a letter of condolence signed by Cornelius Thorne himself. They never recovered most of the bodies. The mine was sealed, and the Company moved operations to a new site. To this day, old-timers swear you can hear tapping from deep underground—the ghosts of miners still working their eternal shift.`,
    discoveryCondition: {
      type: 'visit_location',
      target: 'iron_gulch',
      hint: 'Visit Iron Gulch to learn its dark history',
    },
    unlocked: false,
    relatedEntries: ['lore_location_iron_gulch', 'lore_history_freeminer_movement'],
    tags: ['mining', 'disaster', 'tragedy', 'iron_gulch'],
    sortOrder: 2,
  },
  {
    id: 'lore_history_copperhead_origins',
    title: 'The Copperhead Rebellion',
    category: 'history',
    text: `They say the Copperheads were born in blood and betrayal, and they would not be wrong.

After the Great Mine Collapse, a group of survivors and widows demanded justice. They formed the Iron Gulch Workers' Alliance and called for an investigation. The Company's response was swift: Pinkerton agents broke up their meetings, blacklisted organizers from every mine in the territory, and when that wasn't enough, hired guns made examples of the loudest voices.

But you cannot kill an idea with bullets. The Alliance went underground, literally—meeting in abandoned mine shafts and mountain hideouts. They took the name Copperhead, after the snake that strikes without warning. What began as labor organizing became something harder, more dangerous.

Now the Copperheads rob Company payrolls, sabotage railroad lines, and wage a shadow war against everything Thorne built. Heroes to some, terrorists to others, they are the conscience the frontier wishes it didn't need.`,
    discoveryCondition: {
      type: 'reputation',
      target: 'copperhead',
      value: 10,
      hint: 'Gain reputation with the Copperheads to learn their origins',
    },
    unlocked: false,
    relatedEntries: ['lore_faction_copperheads', 'lore_history_mine_collapse'],
    tags: ['copperhead', 'rebellion', 'labor', 'resistance'],
    sortOrder: 3,
  },
  {
    id: 'lore_history_freeminer_movement',
    title: 'The Freeminer Movement',
    category: 'history',
    text: `Long before the great companies came, men dug for riches with nothing but picks, pans, and prayers. They called themselves freeminers—beholden to no man, owners of whatever they could claim and hold.

The corporate mining operations changed everything. With their steam-powered drills and dynamite, they could process in a day what a freeminer worked months to extract. One by one, the independents were bought out, muscled out, or simply rendered obsolete.

But some refused to surrender. The Freeminer Coalition formed in 1871, a loose alliance of independent prospectors, small claim holders, and those who simply couldn't stomach working for the Company. They share information about deposits the corporations haven't found, pool resources to buy equipment, and maintain a network of safe houses throughout the territory.

The Coalition isn't political like the Copperheads. They don't want to tear down the system—they just want to be left alone to work their claims in peace. In this land of iron monopolies, that's rebellion enough.`,
    discoveryCondition: {
      type: 'talk_to_npc',
      target: 'samuel_ironpick',
      hint: 'Speak with a Freeminer to understand their ways',
    },
    unlocked: false,
    relatedEntries: ['lore_faction_freeminers', 'lore_char_samuel_ironpick'],
    tags: ['freeminer', 'mining', 'independence', 'coalition'],
    sortOrder: 4,
  },
  {
    id: 'lore_history_thorne_dynasty',
    title: 'The Thorne Family Dynasty',
    category: 'history',
    text: `Three generations of Thornes have ruled the Iron Frontier, each leaving their mark in iron and blood.

Cornelius Thorne, the patriarch, arrived with nothing but ambition and a talent for making powerful friends. He built the railroad, crushed his competitors, and died in his bed at seventy-two, the richest man west of the Mississippi.

His son, Ezekiel, expanded the empire into mining and manufacturing. Cold where his father was calculating, cruel where Cornelius was merely ruthless, Ezekiel ordered the response to the Workers' Alliance that created the Copperheads. He fell from a hotel balcony in 1885—officially an accident, though the whiskey bottle in his hand and the note in his pocket suggested otherwise.

Now Victoria Thorne holds the reins, the first woman to run a major Western corporation. Educated in Paris, hardened by necessity, she maintains her family's grip with a silk glove over an iron fist. They say she keeps a list of everyone who ever wronged a Thorne, and she checks off names one by one.`,
    discoveryCondition: {
      type: 'progress',
      value: 3,
      hint: 'Progress through the main story to learn of the Thorne legacy',
    },
    unlocked: false,
    relatedEntries: ['lore_history_ivrc_founding', 'lore_faction_ivrc'],
    tags: ['thorne', 'dynasty', 'ivrc', 'corporate'],
    sortOrder: 5,
  },
  {
    id: 'lore_history_original_settlers',
    title: 'The Original Settlers',
    category: 'history',
    text: `Before the railroad, before the mining companies, before the Territory was even named, others called this land home.

The Kawaiisu, Serrano, and Chemehuevi peoples lived in these valleys and mountains for generations beyond counting. They knew where the water flowed underground, which plants healed and which killed, where the spirits dwelt in the rocks. The land provided, and they respected its gifts.

Then came the Spanish missionaries, seeking souls. Then the Mexican rancheros, seeking land. Then the Americans, seeking gold. Each wave pushed the original peoples further into the margins, their treaties broken as soon as the ink dried, their sacred sites desecrated in the name of progress.

Some fled to reservations—patches of land deemed worthless until someone discovered copper underneath. Others vanished into the deep wilderness, living as their ancestors did. A few adapted, becoming guides, laborers, or outlaws. But the old knowledge persists, passed down in whispers, waiting for a time when the iron age ends and the land remembers who truly belongs here.`,
    discoveryCondition: {
      type: 'visit_location',
      target: 'rattlesnake_canyon',
      hint: 'The canyon walls hold ancient memories',
    },
    unlocked: false,
    relatedEntries: ['lore_location_rattlesnake_canyon'],
    tags: ['native', 'history', 'settlers', 'displacement'],
    sortOrder: 6,
  },
];

// ============================================================================
// FACTION LORE ENTRIES
// ============================================================================

const FACTION_ENTRIES: LoreEntry[] = [
  {
    id: 'lore_faction_ivrc',
    title: 'IVRC: The Iron Giant',
    category: 'factions',
    text: `The Iron Valley Railroad Company is more than a business—it is a nation within a nation, a power unto itself.

At its height, the IVRC employs over twelve thousand workers across the territory. Its rails carry everything that moves: ore, cattle, passengers, mail, and the lifeblood of commerce itself. The Company owns the telegraph lines that connect remote towns to civilization, the water rights that determine who lives and who dies in the desert, and enough politicians to ensure the laws favor their interests.

The IVRC's corporate structure is byzantine by design. Local managers answer to regional superintendents who answer to division chiefs who answer to the Board in their marble offices back East. This distance allows plausible deniability when uncomfortable things happen—a striking worker beaten, a competing business burned out, a stubborn landowner who suffers an unfortunate accident.

At the top sits the Thorne family, shareholders and directors, pulling strings from the shadows. The Company is their kingdom, and everyone in the territory is their subject whether they know it or not.`,
    discoveryCondition: {
      type: 'automatic',
      hint: 'Known from the start',
    },
    unlocked: true,
    relatedEntries: ['lore_history_ivrc_founding', 'lore_history_thorne_dynasty'],
    tags: ['ivrc', 'faction', 'corporate', 'railroad'],
    sortOrder: 1,
  },
  {
    id: 'lore_faction_copperheads',
    title: 'Copperheads: Outlaws or Freedom Fighters?',
    category: 'factions',
    text: `The Copperhead Gang operates like no other outlaw band in the territory. They are organized, disciplined, and driven by something more than greed.

Their cells are scattered across the frontier, each operating independently but coordinating through a network of coded messages and dead drops. New recruits undergo a rigorous vetting process—the Copperheads have been infiltrated before and learned their lessons in blood.

Their targets are carefully chosen: Company payrolls, railroad shipments, Thorne family holdings. They avoid robbing ordinary citizens and have been known to distribute stolen money to mining widows and struggling families. This has earned them grudging respect even from those who disapprove of their methods.

Leadership remains shrouded in mystery. They say a council of veterans from the original Workers' Alliance makes the big decisions, but no one outside the inner circle knows for certain. What is known is their ultimate goal: nothing less than the complete dismantling of the Thorne empire and the creation of a territory where working people have a voice.`,
    discoveryCondition: {
      type: 'complete_quest',
      target: 'quest_copperhead_contact',
      hint: 'Complete a quest involving the Copperheads',
    },
    unlocked: false,
    relatedEntries: ['lore_history_copperhead_origins'],
    tags: ['copperhead', 'faction', 'outlaw', 'resistance'],
    sortOrder: 2,
  },
  {
    id: 'lore_faction_freeminers',
    title: 'Freeminers: The Last Independents',
    category: 'factions',
    text: `The Freeminer Coalition is less an organization than a stubborn state of mind. Its members share one thing in common: they refuse to work for anyone but themselves.

Coalition members pay modest dues that fund a mutual aid network. When a freeminer's equipment breaks, the Coalition provides loans. When claim jumpers come calling, other freeminers ride to help. When the Company tries to buy someone out, Coalition lawyers—yes, they have lawyers now—tie up the paperwork for years.

They maintain a loose territorial government with elected representatives from each major mining district. Decisions require consensus, which means meetings can drag on for days as grizzled prospectors argue over water rights and trail maintenance. It's messy, inefficient, and somehow works.

The Coalition's greatest asset is knowledge. Generations of prospecting wisdom, passed down and shared freely among members. They know deposits the Company hasn't found, routes through mountains that don't appear on any map, and survival tricks that have kept independent miners alive when corporate operations failed.`,
    discoveryCondition: {
      type: 'visit_location',
      target: 'freeminer_hollow',
      hint: 'Visit a Freeminer settlement',
    },
    unlocked: false,
    relatedEntries: ['lore_history_freeminer_movement', 'lore_char_samuel_ironpick'],
    tags: ['freeminer', 'faction', 'coalition', 'independence'],
    sortOrder: 3,
  },
  {
    id: 'lore_faction_law',
    title: "The Sheriff's Jurisdiction",
    category: 'factions',
    text: `Law in the Iron Frontier is a patchwork of competing authorities, overlapping jurisdictions, and convenient blind spots.

Town sheriffs handle local matters—bar fights, petty theft, the occasional murder. They're elected officials, which means they serve at the pleasure of whoever has the most votes, and in Company towns, the Company always has the most votes. Smart sheriffs learn quickly which crimes to pursue and which to overlook.

U.S. Marshals have broader authority but limited resources. A handful of marshals cover a territory larger than some Eastern states. They focus on federal crimes—mail robbery, crimes on railroad property, offenses against Company interests that have friends in Washington.

Then there are the Pinkertons and Company security—private law enforcement answerable only to their employers. They operate in a gray zone, technically limited to protecting Company property but somehow always present when labor organizers need intimidating or competitors need discouraging.

The result is a legal system where justice depends largely on who you are and who you know. The wealthy and connected operate with impunity; the poor and friendless face the full weight of whatever law is convenient.`,
    discoveryCondition: {
      type: 'talk_to_npc',
      target: 'sheriff_cole',
      hint: 'Discuss the law with Sheriff Cole',
    },
    unlocked: false,
    relatedEntries: [],
    tags: ['law', 'faction', 'sheriff', 'justice'],
    sortOrder: 4,
  },
];

// ============================================================================
// LOCATION LORE ENTRIES
// ============================================================================

const LOCATION_ENTRIES: LoreEntry[] = [
  {
    id: 'lore_location_dusty_springs',
    title: 'Dusty Springs: Crossroads of the Frontier',
    category: 'locations',
    text: `Every territory has a town that serves as its heart, and Dusty Springs beats at the center of the Iron Frontier.

The town grew up around a natural spring that early settlers discovered—reliable water in a land where water means life. First came the trading post, then the saloon, then the general store. When the railroad arrived in 1867, Dusty Springs transformed from frontier outpost to bustling hub.

Today the town boasts three hotels, two banks, a telegraph office, and more saloons than any sensible place needs. The railroad station sees a dozen trains daily, carrying ore to Eastern smelters and bringing back finished goods, hopeful settlers, and trouble of every variety.

Dusty Springs sits at the junction of the northern and southern rail lines, which means everyone passes through eventually. Miners heading to the copper camps, ranchers driving cattle to market, outlaws looking for anonymity, lawmen looking for outlaws—they all water their horses at the same springs and drink at the same bars. It's a town where fortunes are made and lost, where secrets are traded like currency, and where the past has a way of catching up with you.`,
    discoveryCondition: {
      type: 'automatic',
      hint: 'Known from the start',
    },
    unlocked: true,
    relatedEntries: [],
    tags: ['dusty_springs', 'town', 'railroad', 'hub'],
    sortOrder: 1,
  },
  {
    id: 'lore_location_iron_gulch',
    title: 'Iron Gulch: Where the Mountain Wept',
    category: 'locations',
    text: `Iron Gulch was supposed to be the crown jewel of Thorne mining operations. Now it stands as a monument to hubris and tragedy.

The copper deposits here were among the richest ever discovered in the territory. At its peak, the Gulch employed over a thousand miners working three shifts around the clock. Company housing stretched for half a mile, and the smelter's fires lit the night sky like a second sun.

Then came the collapse of '78. The mountain swallowed three hundred men, and something in the town's spirit died with them. The Company relocated operations to a new site, leaving behind abandoned buildings, rusting equipment, and too many graves.

Today Iron Gulch is a ghost of its former self. A few stubborn souls remain—widows with nowhere else to go, prospectors working the tailings for overlooked ore, and those who simply can't let go of the past. The sealed mine entrance looms over the town like a tombstone, and on quiet nights, old-timers swear they can hear tapping from deep underground.`,
    discoveryCondition: {
      type: 'visit_location',
      target: 'iron_gulch',
      hint: 'Visit Iron Gulch',
    },
    unlocked: false,
    relatedEntries: ['lore_history_mine_collapse'],
    tags: ['iron_gulch', 'mining', 'ghost_town', 'tragedy'],
    sortOrder: 2,
  },
  {
    id: 'lore_location_rattlesnake_canyon',
    title: 'Rattlesnake Canyon: Land of Serpents and Spirits',
    category: 'locations',
    text: `Rattlesnake Canyon cuts through the heart of the eastern mountains like a wound that never healed. The native peoples avoided it for generations, calling it the Place Where the Earth Speaks.

The canyon walls rise hundreds of feet, striped in red and orange stone laid down before humans walked the earth. Ancient petroglyphs mark certain passages—warnings, some say, left by peoples who understood something about this place that we have forgotten.

Prospectors who ventured into the canyon told strange stories. Compasses that spun wildly. Echoes that didn't match the sounds that made them. The sensation of being watched by something just out of sight. Most came back empty-handed and shaken. Some didn't come back at all.

The rattlesnakes that give the canyon its name are real enough—more abundant here than anywhere else in the territory. But the local tribes speak of a different kind of serpent, a spirit guardian that protects the canyon's secrets. Whether you believe in spirits or just respect the dangers of rough terrain and venomous snakes, Rattlesnake Canyon demands caution from all who enter.`,
    discoveryCondition: {
      type: 'visit_location',
      target: 'rattlesnake_canyon',
      hint: 'Brave the dangers of Rattlesnake Canyon',
    },
    unlocked: false,
    relatedEntries: ['lore_history_original_settlers'],
    tags: ['rattlesnake_canyon', 'wilderness', 'danger', 'sacred'],
    sortOrder: 3,
  },
  {
    id: 'lore_location_coldwater',
    title: 'Coldwater: The Mountain Retreat',
    category: 'locations',
    text: `High in the northern mountains, where pine forests give way to bare granite peaks, lies the town of Coldwater. It's a place people come to disappear.

The town began as a logging camp, harvesting timber for the railroad's endless appetite. When the easily accessible trees were gone, most workers moved on. Those who stayed discovered that Coldwater's isolation had value of its own.

The wealthy built summer retreats here, escaping the desert heat in lodges with grand views and no neighbors. Consumptives came seeking the thin, clean mountain air that doctors promised would cure their affliction. And others came because Coldwater asked no questions and kept no records.

Today the town exists in a kind of genteel decay. The grand lodges are maintained by skeleton staffs waiting for owners who visit less each year. The sanatorium still operates, though its patients rarely recover. And in the saloons and boarding houses, men with hard eyes and false names conduct business best done far from prying eyes. Coldwater keeps its secrets as surely as the mountains keep their snow.`,
    discoveryCondition: {
      type: 'visit_location',
      target: 'coldwater',
      hint: 'Climb to the mountain town of Coldwater',
    },
    unlocked: false,
    relatedEntries: [],
    tags: ['coldwater', 'mountains', 'retreat', 'secrets'],
    sortOrder: 4,
  },
  {
    id: 'lore_location_badlands',
    title: 'The Badlands: Where Nothing Good Grows',
    category: 'locations',
    text: `South of the main rail line, the land turns hostile. This is the Badlands—a maze of eroded stone, box canyons, and desert so harsh that even the cacti struggle to survive.

Early surveyors marked the region as "unfit for settlement or development" and moved on. The railroad curves around it, adding fifty miles to the southern route rather than attempt a crossing. Even the native peoples traditionally used the Badlands only as a place of exile for the worst criminals.

Which makes it perfect for those who don't want to be found.

The Badlands shelter outlaw camps, hidden caches, and men whose crimes have placed them beyond any hope of redemption. Water is scarce—those who know the territory guard the locations of springs and seeps like gold. Food is whatever you can carry in or kill. Survival requires either deep knowledge of the terrain or profound desperation.

Yet the Badlands hold secrets for those brave or foolish enough to seek them. Abandoned mines. Crashed wagons with their cargo intact. Ruins that predate any known settlement. The Badlands take many who enter, but occasionally, they give something back.`,
    discoveryCondition: {
      type: 'progress',
      value: 2,
      hint: 'Advance in the main story to hear tales of the Badlands',
    },
    unlocked: false,
    relatedEntries: [],
    tags: ['badlands', 'desert', 'danger', 'outlaw'],
    sortOrder: 5,
  },
  {
    id: 'lore_location_salvation',
    title: 'Salvation: The Company Town',
    category: 'locations',
    text: `Salvation is everything the Iron Valley Railroad Company thinks a town should be. Which is to say, it is entirely owned and operated by the Company.

Every building bears the IVRC stamp. The houses where workers live—Company property, rent deducted from wages. The general store where they shop—Company owned, prices set by Company accountants. The saloon where they drink—Company licensed, serving Company-approved entertainment. Even the church was built with Company funds, and the preacher knows better than to sermonize about the sins of wealth.

Workers are paid in Company scrip, redeemable only at Company stores. Anyone who wants to leave must first settle their accounts, which somehow never quite balance. The Company provides everything its workers need, and in return, the workers provide everything they have.

It is efficient. It is profitable. It is, according to Company literature, a model community where labor and capital exist in perfect harmony. The workers themselves tell a different story, but only in whispers, and only to those they trust. In Salvation, the walls have ears, and they all report to the same master.`,
    discoveryCondition: {
      type: 'visit_location',
      target: 'salvation',
      hint: 'Visit the Company town of Salvation',
    },
    unlocked: false,
    relatedEntries: ['lore_faction_ivrc'],
    tags: ['salvation', 'company_town', 'ivrc', 'control'],
    sortOrder: 6,
  },
];

// ============================================================================
// TECHNOLOGY LORE ENTRIES
// ============================================================================

const TECHNOLOGY_ENTRIES: LoreEntry[] = [
  {
    id: 'lore_tech_steam_machinery',
    title: 'Steam-Powered Machinery',
    category: 'technology',
    text: `The steam engine transformed the frontier from a land of muscle and determination to a place where machines do the work of a hundred men.

It started with the railroad—massive locomotives hauling impossible loads across impossible distances. But the real revolution came when inventors miniaturized steam technology for other applications. Steam-powered drills that could bore through solid rock. Pumps that could drain flooded mine shafts. Hoists that could lift ore from depths no human should reach.

The technology requires coal or wood for fuel, water for steam, and skilled operators to prevent catastrophic failures. Boiler explosions have killed more miners than cave-ins in recent years. But the productivity gains are undeniable, and no operation can compete without mechanization.

Some say we've merely traded one form of servitude for another—that men who once were slaves to the land are now slaves to the machine. But the machines don't care about philosophy. They only care about pressure and temperature, about fuel and water, about the endless cycle of heat and motion that drives the modern world.`,
    discoveryCondition: {
      type: 'automatic',
      hint: 'Known from the start',
    },
    unlocked: true,
    relatedEntries: ['lore_tech_innovations'],
    tags: ['technology', 'steam', 'machinery', 'industry'],
    sortOrder: 1,
  },
  {
    id: 'lore_tech_telegraph',
    title: 'The Telegraph Network',
    category: 'technology',
    text: `Before the telegraph, news traveled at the speed of a horse. Now it travels at the speed of lightning.

The IVRC owns and operates the territory's telegraph network, running wires along the railroad right-of-way to every station and major town. For a fee, anyone can send a message across hundreds of miles in minutes—a revolution in communication that has transformed business, law enforcement, and daily life.

Telegraph operators occupy a peculiar social position. They know everyone's secrets—business deals, love affairs, criminal conspiracies—all flowing through their keys in dots and dashes. A good operator is worth their weight in gold; a corrupt one can bring down an empire.

The Company monitors all traffic for "security purposes," which means nothing sent by wire is truly private. Smart operators speak of this openly; smarter users develop codes and ciphers. The Copperheads are said to have their own telegraph network, tapping into Company lines and routing messages through sympathetic operators. In the age of instant communication, information is power, and the Company intends to control every bit of it.`,
    discoveryCondition: {
      type: 'visit_location',
      target: 'telegraph_office',
      hint: 'Visit a telegraph office',
    },
    unlocked: false,
    relatedEntries: ['lore_faction_ivrc'],
    tags: ['technology', 'telegraph', 'communication', 'ivrc'],
    sortOrder: 2,
  },
  {
    id: 'lore_tech_mining',
    title: 'Mining Techniques',
    category: 'technology',
    text: `The copper and silver that built the frontier's fortunes don't surrender easily. Extracting them requires techniques that push the boundaries of engineering and human endurance.

Surface mining—stripping away earth to reach shallow deposits—is the simplest method. But the easy pickings are long gone. Modern operations go deep, sinking shafts hundreds of feet into the earth and following veins wherever they lead.

The dangers are endless. Cave-ins from unstable rock. Floods from underground water sources. Pockets of poisonous gas that kill without warning. The deeper you dig, the hotter it gets, until men work in conditions that would kill an unacclimated worker in hours.

Blasting opened new possibilities and new horrors. Dynamite can shatter rock that would take weeks to break by hand, but it can also bring down entire tunnel systems if used carelessly. The Company employs powder men who are either brave or crazy—the work pays triple wages, and for good reason.

Despite all this, men still line up for mining jobs. The pay is better than farming, better than cowboying, better than any honest work available to a man with strong arms and no education. They trade their health and often their lives for Company wages, and the mountain always wins in the end.`,
    discoveryCondition: {
      type: 'visit_location',
      target: 'copper_mine',
      hint: 'Visit an active mining operation',
    },
    unlocked: false,
    relatedEntries: ['lore_history_mine_collapse', 'lore_location_iron_gulch'],
    tags: ['technology', 'mining', 'industry', 'danger'],
    sortOrder: 3,
  },
  {
    id: 'lore_tech_innovations',
    title: "The IVRC's Dark Innovations",
    category: 'technology',
    text: `The Iron Valley Railroad Company's engineering department develops more than locomotives and mining equipment. Some projects never appear in company reports or shareholder meetings.

In heavily guarded workshops, Company engineers experiment with weaponized steam technology. Repeating firearms powered by compressed air. Armored railcars that can suppress riots with mechanical efficiency. Devices that can monitor conversations from a distance. The Company's private security forces field-test these innovations against striking workers and resistant communities.

Most disturbing are the reports of experiments in mechanical labor—attempts to create tireless workers that need no food, no sleep, no wages. The technology remains crude, but Company leadership seems determined to solve the problem of human unreliability once and for all.

These projects are officially denied, of course. But enough workers have seen things, enough engineers have talked in their cups, that the rumors persist. The Company's vision for the future involves not just controlling the land and the rails, but reshaping the very nature of work and workers themselves.`,
    discoveryCondition: {
      type: 'complete_quest',
      target: 'quest_stolen_blueprints',
      hint: 'Uncover Company secrets',
    },
    unlocked: false,
    relatedEntries: ['lore_faction_ivrc', 'lore_tech_steam_machinery'],
    tags: ['technology', 'ivrc', 'weapons', 'dark', 'secrets'],
    sortOrder: 4,
  },
];

// ============================================================================
// CHARACTER LORE ENTRIES
// ============================================================================

const CHARACTER_ENTRIES: LoreEntry[] = [
  {
    id: 'lore_char_diamondback',
    title: 'The Legend of Diamondback',
    category: 'characters',
    text: `No outlaw in the territory commands more fear and fascination than the one they call Diamondback.

The stories conflict wildly. Some say Diamondback is a woman—a former saloon singer who watched Company men kill her family and swore vengeance. Others insist Diamondback is a man—a Civil War veteran driven mad by what he saw at Antietam, channeling his demons into a private war against the wealthy. A few claim there is no single Diamondback, but rather a name passed down through a succession of outlaws, a legend kept alive by whoever wears the rattlesnake-skin hatband.

What's certain is the body count. Diamondback has robbed more Company payrolls than any three other outlaws combined. At least a dozen Pinkerton agents have died trying to bring them in. The bounty now stands at five thousand dollars—dead or alive, the Company doesn't care.

But Diamondback never kills civilians, never robs ordinary travelers, and has been known to leave stolen money at the doors of struggling families. Hero or villain, legend or flesh and blood, Diamondback has become something the territory needs: proof that the powerful can still be made to fear.`,
    discoveryCondition: {
      type: 'talk_to_npc',
      target: 'doc_chen',
      hint: 'Ask around about frontier legends',
    },
    unlocked: false,
    relatedEntries: ['lore_faction_copperheads'],
    tags: ['diamondback', 'legend', 'outlaw', 'mystery'],
    sortOrder: 1,
  },
  {
    id: 'lore_char_doc_chen',
    title: "Doc Chen's Journey West",
    category: 'characters',
    text: `Wei Chen came to the Iron Frontier as a railroad worker, one of thousands of Chinese laborers who built the lines that connected the territory to the world. He left as something far more valuable: the only doctor for fifty miles in any direction.

Chen had trained as a physician in Canton before circumstances forced him to emigrate. The railroad company saw only another back to break, another life to spend on dangerous construction. But when a blasting accident left two dozen workers dying and the Company doctor too drunk to help, Chen stepped forward with knowledge his employers never suspected he possessed.

He saved nineteen of the twenty-four. The Company offered him the position of camp physician, thinking they'd get a skilled doctor at coolie wages. Chen had other ideas. He bought his contract out, set up practice in Dusty Springs, and now treats anyone who walks through his door—Company men, outlaws, freeminers, natives, anyone with a wound that needs binding or a sickness that needs curing.

Doc Chen asks no questions about how his patients got their injuries. In return, even the roughest outlaws respect his neutrality. In a land where everyone takes sides, the Doc stands alone, owing allegiance only to the oath he swore in a language none of his patients understand.`,
    discoveryCondition: {
      type: 'talk_to_npc',
      target: 'doc_chen',
      hint: 'Speak with Doc Chen about his past',
    },
    unlocked: false,
    relatedEntries: ['lore_location_dusty_springs'],
    tags: ['doc_chen', 'doctor', 'immigrant', 'healer'],
    sortOrder: 2,
  },
  {
    id: 'lore_char_samuel_ironpick',
    title: "Samuel Ironpick's Sacrifice",
    category: 'characters',
    text: `They say Samuel Ironpick has found more copper with his bare hands than the Company extracts with all its machinery. They also say he's the stubbornest man alive, which is why he's still alive at all.

Ironpick was working the Iron Gulch mines when the collapse happened. He wasn't inside—pure luck had him at the surface, dealing with a balky mule. He watched the mountain swallow his brother, his two sons, and forty years of friends.

The Company offered him a supervisory position at the new mine, recognition of his experience and a way to keep him quiet. Ironpick spat in the superintendent's face and walked away from corporate mining forever.

Now he leads the Freeminer Coalition with the same dogged determination that made him a legendary prospector. He's found three major deposits that the Company didn't know existed and shared the locations with coalition members rather than sell to the highest bidder. His claim in Freeminer Hollow produces enough to keep him comfortable, but he gives most of it away—to widows, to injured miners, to anyone fighting the Company's endless expansion.

Some call him a saint. He calls himself a man who couldn't save his family and spends every day trying to save someone else's.`,
    discoveryCondition: {
      type: 'talk_to_npc',
      target: 'samuel_ironpick',
      hint: 'Learn Samuel Ironpick\'s story',
    },
    unlocked: false,
    relatedEntries: ['lore_faction_freeminers', 'lore_history_freeminer_movement'],
    tags: ['samuel_ironpick', 'freeminer', 'leader', 'sacrifice'],
    sortOrder: 3,
  },
  {
    id: 'lore_char_father_miguel',
    title: "Father Miguel's Fall from Grace",
    category: 'characters',
    text: `Father Miguel Esperanza was once the most respected clergyman in the territory. His fall from grace has become a cautionary tale whispered in saloons and sanctuaries alike.

He came to the frontier burning with missionary zeal, determined to bring salvation to the godless wilderness. For twenty years he built churches, established schools, and ministered to communities that had never seen a priest. His sermons drew crowds from miles around, and even hardened sinners felt the pull of his conviction.

Then came the strike at Salvation. Workers asked Father Miguel to speak on their behalf, to use his moral authority against Company injustice. He agreed, delivered a sermon condemning the exploitation of workers as an offense against God, and called for the faithful to stand with their brothers.

The Company's response was swift. They pressured the diocese to reassign him. When he refused to go quietly, they produced witnesses who testified to sins that may or may not have occurred. The Church suspended him; the Company blacklisted any town that offered him shelter.

Now Father Miguel wanders the territory, an unfrocked priest who still tends to souls. He performs marriages the Church won't recognize, offers comfort to the dying, and preaches to anyone who'll listen. Some call him fallen. Others say he finally rose to meet the calling he'd always heard.`,
    discoveryCondition: {
      type: 'talk_to_npc',
      target: 'father_miguel',
      hint: 'Encounter Father Miguel on your travels',
    },
    unlocked: false,
    relatedEntries: ['lore_location_salvation', 'lore_faction_ivrc'],
    tags: ['father_miguel', 'priest', 'fallen', 'faith'],
    sortOrder: 4,
  },
];

// ============================================================================
// COMBINED LORE DATABASE
// ============================================================================

/**
 * All lore entries organized by category
 */
export const LORE_ENTRIES_BY_CATEGORY: Record<LoreCategory, LoreEntry[]> = {
  history: HISTORY_ENTRIES,
  factions: FACTION_ENTRIES,
  locations: LOCATION_ENTRIES,
  technology: TECHNOLOGY_ENTRIES,
  characters: CHARACTER_ENTRIES,
};

/**
 * Flat array of all lore entries
 */
export const ALL_LORE_ENTRIES: LoreEntry[] = [
  ...HISTORY_ENTRIES,
  ...FACTION_ENTRIES,
  ...LOCATION_ENTRIES,
  ...TECHNOLOGY_ENTRIES,
  ...CHARACTER_ENTRIES,
];

/**
 * Map of lore entries by ID for quick lookup
 */
export const LORE_ENTRIES_BY_ID: Map<string, LoreEntry> = new Map(
  ALL_LORE_ENTRIES.map((entry) => [entry.id, entry])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all lore entries in a specific category
 */
export function getLoreByCategory(category: LoreCategory): LoreEntry[] {
  return LORE_ENTRIES_BY_CATEGORY[category] ?? [];
}

/**
 * Get a specific lore entry by ID
 */
export function getLoreEntryById(id: string): LoreEntry | undefined {
  return LORE_ENTRIES_BY_ID.get(id);
}

/**
 * Get all unlocked lore entries from a codex state
 */
export function getUnlockedLore(codexState: LoreCodexState): LoreEntry[] {
  return codexState.unlockedEntries
    .map((id) => LORE_ENTRIES_BY_ID.get(id))
    .filter((entry): entry is LoreEntry => entry !== undefined);
}

/**
 * Get unlocked lore entries for a specific category
 */
export function getUnlockedLoreByCategory(
  codexState: LoreCodexState,
  category: LoreCategory
): LoreEntry[] {
  return getUnlockedLore(codexState).filter((entry) => entry.category === category);
}

/**
 * Attempt to discover/unlock a lore entry
 * Returns true if the entry was newly discovered, false if already unlocked or doesn't exist
 */
export function discoverLore(codexState: LoreCodexState, entryId: string): boolean {
  // Check if entry exists
  const entry = LORE_ENTRIES_BY_ID.get(entryId);
  if (!entry) {
    return false;
  }

  // Check if already unlocked
  if (codexState.unlockedEntries.includes(entryId)) {
    return false;
  }

  // Unlock the entry
  codexState.unlockedEntries.push(entryId);
  codexState.discoveryTimes[entryId] = Date.now();
  codexState.totalDiscovered += 1;

  return true;
}

/**
 * Check if a specific lore entry is unlocked
 */
export function isLoreUnlocked(codexState: LoreCodexState, entryId: string): boolean {
  return codexState.unlockedEntries.includes(entryId);
}

/**
 * Get lore entries that match specific tags
 */
export function getLoreByTags(tags: string[]): LoreEntry[] {
  if (tags.length === 0) return ALL_LORE_ENTRIES;
  return ALL_LORE_ENTRIES.filter((entry) =>
    tags.some((tag) => entry.tags.includes(tag))
  );
}

/**
 * Get related lore entries for a given entry
 */
export function getRelatedLore(entryId: string): LoreEntry[] {
  const entry = LORE_ENTRIES_BY_ID.get(entryId);
  if (!entry) return [];

  return entry.relatedEntries
    .map((id) => LORE_ENTRIES_BY_ID.get(id))
    .filter((e): e is LoreEntry => e !== undefined);
}

/**
 * Get lore entries that can be discovered at a specific location
 */
export function getLoreForLocation(locationId: string): LoreEntry[] {
  return ALL_LORE_ENTRIES.filter(
    (entry) =>
      entry.discoveryCondition.type === 'visit_location' &&
      entry.discoveryCondition.target === locationId
  );
}

/**
 * Get lore entries that can be discovered by talking to a specific NPC
 */
export function getLoreForNPC(npcId: string): LoreEntry[] {
  return ALL_LORE_ENTRIES.filter(
    (entry) =>
      entry.discoveryCondition.type === 'talk_to_npc' &&
      entry.discoveryCondition.target === npcId
  );
}

/**
 * Get lore entries that can be discovered by completing a specific quest
 */
export function getLoreForQuest(questId: string): LoreEntry[] {
  return ALL_LORE_ENTRIES.filter(
    (entry) =>
      entry.discoveryCondition.type === 'complete_quest' &&
      entry.discoveryCondition.target === questId
  );
}

/**
 * Get the total number of lore entries
 */
export function getTotalLoreCount(): number {
  return ALL_LORE_ENTRIES.length;
}

/**
 * Get lore discovery progress as a percentage
 */
export function getLoreProgress(codexState: LoreCodexState): number {
  const total = getTotalLoreCount();
  if (total === 0) return 100;
  return Math.round((codexState.totalDiscovered / total) * 100);
}

/**
 * Get automatically unlocked lore entries (for initial codex state)
 */
export function getAutomaticLoreEntries(): LoreEntry[] {
  return ALL_LORE_ENTRIES.filter(
    (entry) => entry.discoveryCondition.type === 'automatic'
  );
}

/**
 * Create initial codex state with automatic entries unlocked
 */
export function createInitialLoreCodexState(): LoreCodexState {
  const automaticEntries = getAutomaticLoreEntries().map((e) => e.id);
  const now = Date.now();
  const discoveryTimes: Record<string, number> = {};

  automaticEntries.forEach((id) => {
    discoveryTimes[id] = now;
  });

  return {
    unlockedEntries: automaticEntries,
    discoveryTimes,
    totalDiscovered: automaticEntries.length,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  HISTORY_ENTRIES,
  FACTION_ENTRIES,
  LOCATION_ENTRIES,
  TECHNOLOGY_ENTRIES,
  CHARACTER_ENTRIES,
};

export type { LoreEntry, LoreCategory, DiscoveryCondition, LoreCodexState };
