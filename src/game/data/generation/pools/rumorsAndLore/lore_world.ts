/**
 * Lore Fragments - Locations, items, people, creatures, technology
 */

import type { LoreFragment } from '../../../schemas/generation.ts';

export const LORE_WORLD_FRAGMENTS: LoreFragment[] = [
  {
    id: 'lore_location_summit_city',
    category: 'location_lore',
    title: 'Summit City - The Iron Capital',
    text: `Summit City sits at the highest point of the central pass, where three railroad lines converge. It is the territorial capital in law and the center of power in practice.

The city is a study in contrasts. Grand Victorian buildings house the territorial legislature and the offices of the great companies. But in their shadow sprawl tent cities of workers, transients, and those displaced by progress.

The Governor's Palace dominates the skyline, its steam-powered clock tower visible for miles. Within, the political games that shape the territory are played out daily, as railroad barons, mining interests, and reformers vie for control of the frontier's future.`,
    relatedIds: ['location_summit_city'],
    discoveryMethod: 'automatic',
    tags: ['capital', 'politics', 'urban'],
  },
  {
    id: 'lore_location_dead_mule_gulch',
    category: 'location_lore',
    title: 'Dead Mule Gulch - The Wound That Never Heals',
    text: `Dead Mule Gulch was once called Promise Valley, one of the first settlements in the territory. It died in a single night when the Thornton Mining Company's tailings dam collapsed.

A wall of toxic sludge swept through the valley, killing over three hundred people and poisoning the land for generations. The company paid minimal compensation and the disaster was covered up by compliant newspapers.

Now the gulch is a wasteland. Nothing grows there. The ruins of buildings poke through crusted earth. Travelers avoid it, saying the ghosts of the dead cry out for justice. But occasionally, fortune hunters brave the contaminated zone, for the company never recovered all the gold that washed downstream.`,
    relatedIds: ['location_dead_mule_gulch', 'faction_miners'],
    discoveryMethod: 'exploration',
    tags: ['disaster', 'tragedy', 'haunted'],
  },
  {
    id: 'lore_location_whispering_caves',
    category: 'location_lore',
    title: 'The Whispering Caves of Echo Ridge',
    text: `The caves at Echo Ridge were sacred to the native tribes long before settlers arrived. They believed the caves were a gateway to the spirit world, where the voices of ancestors could still be heard.

When prospectors explored the caves seeking minerals, they reported strange phenomena. Whispers in unknown languages. Visions of people who weren't there. Equipment that malfunctioned inexplicably.

The tribes say the spirits are angry at the desecration of their sacred space. The Artificer Guild claims unusual mineral deposits create acoustic and electromagnetic anomalies. Whatever the truth, those who venture deep into the caves are changed by the experience, and some never return at all.`,
    relatedIds: ['location_whispering_caves', 'faction_tribes'],
    discoveryMethod: 'exploration',
    tags: ['sacred', 'supernatural', 'mystery'],
  },
  {
    id: 'lore_location_rust_town',
    category: 'location_lore',
    title: 'Rust Town - Where Machines Go to Die',
    text: `In the shadow of the great smelting works lies Rust Town, an ever-growing graveyard of broken machinery. When steam engines fail, when clockwork winds down, when automatons cease to function, they end up here.

The town that grew around this mechanical cemetery is home to scavengers and salvagers who pick through the ruins for valuable components. It's dirty, dangerous work, but for those with no other options, it's a living.

The Artificer Guild officially prohibits the sale of salvaged parts, but in Rust Town, anything can be bought for the right price. Inventors barred from legitimate workshops come here to build their forbidden dreams. And sometimes, among the rusted hulks, something stirs that wasn't supposed to work anymore.`,
    relatedIds: ['location_rust_town', 'creature_automaton'],
    discoveryMethod: 'exploration',
    tags: ['industrial', 'poverty', 'salvage'],
  },
  {
    id: 'lore_item_judges_pistol',
    category: 'item_lore',
    title: "The Judge's Pistol",
    text: `In the lawless years before the Rangers, Judge Ezra Matthias brought order to the frontier with nothing but his wits and a specially crafted steam-pistol. The weapon, made by the finest artificers of the age, never needed to be cleaned and never missed its mark.

When Matthias died, the pistol vanished. Some say it was buried with him in an unmarked grave. Others claim it was stolen by the very outlaws he'd brought to justice.

Legends hold that the pistol can only be fired by one who truly seeks justice, not vengeance. In the wrong hands, it will misfire. But for the righteous, it grants unerring aim and the authority to judge the guilty.`,
    relatedIds: ['item_judges_pistol'],
    discoveryMethod: 'book',
    tags: ['weapon', 'legendary', 'justice'],
  },
  {
    id: 'lore_item_compass_of_whispers',
    category: 'item_lore',
    title: 'The Compass of Whispers',
    text: `The Compass of Whispers was said to be crafted by a tribal shaman who had mastered the secrets of both spiritual power and steam technology. Instead of pointing north, it points toward whatever the holder truly desires.

The compass was last seen in the possession of the outlaw Belle Morrow, who used it to find the legendary Lost Cathedral of Gold. She was never seen again.

Those who seek the compass should beware. It does not distinguish between desire and need, and it has led many to their doom. The compass shows you what you want, not what you should have.`,
    relatedIds: ['item_compass_whispers', 'lore_legend_lost_spanish_gold'],
    discoveryMethod: 'quest',
    tags: ['artifact', 'navigation', 'danger'],
  },
  {
    id: 'lore_item_peacemakers_badge',
    category: 'item_lore',
    title: "The First Peacemaker's Badge",
    text: `When the Territorial Rangers were founded, the first Chief Marshal forged a special badge from metal salvaged from weapons surrendered by former outlaws. It became a symbol of redemption and justice.

The badge passed from Chief Marshal to Chief Marshal until it was lost during the Railroad Wars. Both sides sought it, knowing its symbolic power, but it was never recovered.

Legend says the badge grants its wearer protection from ambush and betrayal, for it carries the accumulated honor of every lawman who wore it. But it also carries their burden, and weighs heavily on those unworthy of its legacy.`,
    relatedIds: ['item_peacemaker_badge', 'faction_rangers'],
    discoveryMethod: 'dialogue',
    tags: ['badge', 'legendary', 'protection'],
  },
  {
    id: 'lore_person_blackwood',
    category: 'person_lore',
    title: 'Governor Josiah Blackwood',
    text: `Josiah Blackwood was appointed first territorial governor with a mandate to bring civilization to the frontier. A former military officer and diplomat, he was known for his vision and his ruthlessness.

Under Blackwood, the railroad came, the Rangers were founded, and the territory transformed from lawless wilderness to functioning society. But he also authorized the forced relocation of native tribes and the violent suppression of labor organizing.

His death in 1867 remains officially unsolved. He was found in his study, doors locked from inside, with no visible wounds. Some say he was killed by dark arts practiced by those he wronged. Others whisper that he faked his death and watches still from the shadows.`,
    relatedIds: ['location_summit_city', 'faction_rangers'],
    discoveryMethod: 'book',
    tags: ['founder', 'politics', 'mystery'],
  },
  {
    id: 'lore_person_belle_morrow',
    category: 'person_lore',
    title: 'Belle Morrow - The Copper Queen',
    text: `Belle Morrow started as a dance hall girl in a mining camp. Within ten years, she owned the mine, the town, and most of the surrounding territory. They called her the Copper Queen, and she ruled her domain with charm and cold steel.

She was a contradiction: ruthless in business but generous to her workers. She funded schools and hospitals while crushing competitors through sabotage and bribery. When the Railroad tried to acquire her holdings, she fought them to a standstill.

At the height of her power, she vanished during an expedition into the mountains, seeking the Lost Cathedral of Gold. Whether she found it or met her end trying, none can say. But her fortune was never found.`,
    relatedIds: ['faction_miners', 'lore_legend_lost_spanish_gold'],
    discoveryMethod: 'dialogue',
    tags: ['legendary', 'business', 'mystery'],
  },
  {
    id: 'lore_person_singing_wolf',
    category: 'person_lore',
    title: 'Singing Wolf - The Last War Chief',
    text: `When the tribes resisted displacement, Singing Wolf united the scattered bands into a force that fought the army to a standstill for three years. A brilliant tactician, he knew the land in ways the invaders never could.

His tactics combined traditional warfare with captured steam technology, turning the settlers' weapons against them. For a time, it seemed the tribes might actually win.

The end came through betrayal, not defeat. A trusted advisor sold Singing Wolf's location to the army. He died fighting, taking thirty soldiers with him. His body was never recovered, and some say he still rides the high country, preparing for a battle that has not yet come.`,
    relatedIds: ['faction_tribes', 'lore_history_native_displacement'],
    discoveryMethod: 'dialogue',
    tags: ['hero', 'resistance', 'legendary'],
  },
  {
    id: 'lore_person_doctor_cogsworth',
    category: 'person_lore',
    title: 'Doctor Helena Cogsworth',
    text: `Doctor Helena Cogsworth was the first woman admitted to the Artificer Guild, breaking barriers that had stood since its founding. Her innovations in medical steam-technology saved thousands of lives across the frontier.

Her greatest achievement was the Cogsworth Heart, a mechanical replacement for the human organ that could keep a patient alive indefinitely. The procedure was rare and expensive, but it represented a triumph over mortality itself.

She disappeared during an expedition to study the Whispering Caves, seeking what she called "the frequency of life itself." Her notes, recovered later, described discoveries that the Guild immediately classified. They remain sealed to this day.`,
    relatedIds: ['faction_engineers', 'item_clockwork_heart', 'location_whispering_caves'],
    discoveryMethod: 'book',
    tags: ['inventor', 'pioneer', 'mystery'],
  },
  {
    id: 'lore_creature_automaton',
    category: 'creature_lore',
    title: 'Steam Automatons',
    text: `Steam automatons are the mechanical servants of the frontier, performing labor too dangerous or tedious for human workers. From mining drones to railway maintenance units, they have become essential to the territory's economy.

Modern automatons are built with strict behavioral constraints, lessons learned from the Brass Rebellion of 1871. Their cogitation engines can process simple commands but are incapable of true independent thought. Or so the Guild assures us.

Workers have long reported that some automatons develop quirks over time. Preferences for certain tasks. Reluctance to be decommissioned. Even what might be called attachment to specific humans. The Guild insists these are mere mechanical wear patterns. But in the darkness of the mines, some swear the machines whisper to each other.`,
    relatedIds: ['faction_engineers', 'lore_history_automaton_uprising'],
    discoveryMethod: 'automatic',
    tags: ['technology', 'automaton', 'mystery'],
  },
  {
    id: 'lore_creature_dust_devils',
    category: 'creature_lore',
    title: 'The Dust Devils of the Wastes',
    text: `The native tribes speak of spirits that dwell in the desert whirlwinds, ancient beings of sand and spite who prey on travelers foolish enough to brave the wastes alone.

Settlers dismissed these stories as superstition until the bodies started appearing. Travelers found stripped of flesh, their bones scoured clean by sand, in patterns no natural storm could explain.

The Artificer Guild theorizes a previously unknown form of electrical phenomenon in the mineral-rich desert air. The tribes say the Dust Devils are the angry ghosts of those who died of thirst, eternally seeking to share their fate. Regardless of the truth, wise travelers never cross the wastes alone, and always carry offerings of water to pour upon the sand.`,
    relatedIds: ['region_desert'],
    discoveryMethod: 'dialogue',
    tags: ['supernatural', 'desert', 'danger'],
  },
  {
    id: 'lore_tech_steam_crystal',
    category: 'technology_lore',
    title: 'Steam-Reactive Crystals',
    text: `The foundation of all steam technology is the steam-reactive crystal, a mineral found only in certain mountain formations. When exposed to pressurized steam, these crystals generate consistent electromagnetic energy that can power mechanical devices for years.

The exact mechanism remains poorly understood, even by Guild artificers. The crystals seem to convert thermal energy into electrical current with near-perfect efficiency, a feat that should be impossible according to conventional physics.

Theories abound. Some claim the crystals are remnants of an ancient civilization. Others suggest they are biological in origin, perhaps fossilized organs of creatures that no longer exist. The Guild maintains a strict monopoly on crystal mining and processing, making independent research difficult.`,
    relatedIds: ['faction_engineers', 'lore_history_steam_rush'],
    discoveryMethod: 'book',
    tags: ['technology', 'resource', 'mystery'],
  },
  {
    id: 'lore_tech_cogitation_engine',
    category: 'technology_lore',
    title: 'The Cogitation Engine',
    text: `The cogitation engine is the mechanical brain of an automaton, a marvel of precision engineering that can process commands and respond to its environment. Simple units can follow basic instructions; complex ones can navigate obstacles and make limited decisions.

Each cogitation engine contains thousands of precisely machined gears, cams, and levers, arranged in patterns discovered through decades of trial and error. The most advanced designs are closely guarded Guild secrets, worth fortunes to rival inventors.

The question of whether a sufficiently complex cogitation engine could achieve true consciousness remains hotly debated. The Guild officially denies the possibility, but the events of the Brass Rebellion suggest otherwise. And in Rust Town, stories persist of ancient engines that speak in human voices.`,
    relatedIds: ['creature_automaton', 'faction_engineers'],
    discoveryMethod: 'dialogue',
    tags: ['technology', 'automaton', 'consciousness'],
  },
  {
    id: 'lore_tech_pneumatic_transport',
    category: 'technology_lore',
    title: 'The Pneumatic Network',
    text: `Beneath the streets of Summit City runs the Pneumatic Network, a system of pressurized tubes that can transport small packages across the city in minutes. What began as a postal service has expanded into a vast infrastructure connecting government offices, banks, and major businesses.

The Network is maintained by a dedicated corps of engineers who work in the cramped tunnels beneath the city. They have developed their own subculture, complete with traditions, slang, and a fierce loyalty to their underground domain.

Rumors persist of secret sections of the Network, tubes that lead to hidden facilities or connect to the personal residences of the powerful. The tube-runners claim to hear strange sounds from these forbidden passages, and more than one has disappeared while investigating.`,
    relatedIds: ['location_summit_city', 'faction_engineers'],
    discoveryMethod: 'exploration',
    tags: ['technology', 'infrastructure', 'urban'],
  },

];
