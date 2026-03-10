/**
 * Lore Fragments - History, legends, faction lore
 */

import type { LoreFragment } from '../../../schemas/generation.ts';

export const LORE_HISTORY_FRAGMENTS: LoreFragment[] = [

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

];
