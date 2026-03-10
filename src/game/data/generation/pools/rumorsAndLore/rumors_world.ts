/**
 * Rumor Templates - World events, treasure, danger, history
 */

import type { RumorTemplate } from '../../../schemas/generation.ts';

export const RUMOR_WORLD_TEMPLATES: RumorTemplate[] = [
  {
    id: 'rumor_event_weather',
    category: 'world_event',
    textTemplates: [
      "Big storm comin' from the West. Seen the clouds buildin' over the mountains.",
      "Drought's gettin' worse. Wells are runnin' dry across {{region}}.",
      "Dust storms been blowin' in from the desert. Best stay indoors when they hit.",
    ],
    prevalence: 0.6,
    tags: ['weather', 'warning'],
  },
  {
    id: 'rumor_event_railroad',
    category: 'world_event',
    textTemplates: [
      "Railroad's expandin' to {{location}}. Gonna change everything around here.",
      "They're layin' new track through {{region}}. Towns that ain't on the line will dry up.",
      "Steam Pacific's surveyin' routes. Might come through here if we're lucky.",
    ],
    prevalence: 0.5,
    tags: ['railroad', 'progress'],
  },
  {
    id: 'rumor_event_gold',
    category: 'world_event',
    textTemplates: [
      "Gold strike up at {{location}}! Folks are already floodin' in.",
      "They found a new vein in {{region}}. Biggest since '49.",
      "Silver deposit discovered near {{location}}. Boom's comin'.",
    ],
    prevalence: 0.4,
    tags: ['mining', 'gold_rush'],
  },
  {
    id: 'rumor_event_epidemic',
    category: 'world_event',
    textTemplates: [
      "Sickness spreadin' through {{location}}. Folks are quarantinin'.",
      'Cholera broke out at the mining camp. Stay away from {{location}}.',
      "The fever's takin' folks in {{region}}. Doc's overwhelmed.",
    ],
    prevalence: 0.3,
    tags: ['disease', 'danger'],
  },
  {
    id: 'rumor_event_law',
    category: 'world_event',
    textTemplates: [
      "New marshal's comin' to clean up {{region}}. Backed by federal authority.",
      "Martial law declared in {{location}}. Army's movin' in.",
      "The governor's sendin' Rangers to deal with the outlaw problem.",
    ],
    prevalence: 0.4,
    tags: ['law', 'authority'],
  },
  {
    id: 'rumor_event_migration',
    category: 'world_event',
    textTemplates: [
      'Big wagon train headed through next week. Hundreds of families.',
      "Settlers are abandonin' {{location}}. Headin' further West.",
      "New immigrants arrivin' by the trainload. Town's gonna double in size.",
    ],
    prevalence: 0.5,
    tags: ['migration', 'population'],
  },
  {
    id: 'rumor_event_territory',
    category: 'world_event',
    textTemplates: [
      "Territory's applyin' for statehood. Things gonna change around here.",
      "Federal surveyors been through. Redrawin' the borders.",
      "Land grants bein' issued in {{region}}. First come, first served.",
    ],
    prevalence: 0.3,
    tags: ['political', 'land'],
  },
  {
    id: 'rumor_treasure_outlaw',
    category: 'treasure_hint',
    textTemplates: [
      'Old {{outlaw}} buried their take somewhere near {{landmark}}. Never recovered.',
      "The {{gang}} hid their loot before the hangin'. Map's lost, but the gold's still there.",
      "{{outlaw}}'s gang split up. One of 'em buried the strongbox near {{location}}.",
    ],
    linkedLocationId: 'treasure_site',
    prevalence: 0.3,
    tags: ['treasure', 'outlaw'],
  },
  {
    id: 'rumor_treasure_mine',
    category: 'treasure_hint',
    textTemplates: [
      "There's a played-out mine at {{location}}. But they missed a vein. I'd bet my life on it.",
      'The Spaniards had a mine somewhere in {{region}}. Never mapped, never found.',
      'Old prospector died with a nugget big as your fist. Never said where he found it.',
    ],
    prevalence: 0.4,
    tags: ['treasure', 'mining'],
  },
  {
    id: 'rumor_treasure_cache',
    category: 'treasure_hint',
    textTemplates: [
      "Army payroll went missin' during the war. Wagon was found empty near {{location}}.",
      'Stagecoach got robbed ten years back. Money was never spent. Still hidden somewhere.',
      'Bank shipment vanished between {{location}} and {{destination}}. Driver never talked.',
    ],
    prevalence: 0.3,
    tags: ['treasure', 'historical'],
  },
  {
    id: 'rumor_treasure_artifact',
    category: 'treasure_hint',
    textTemplates: [
      'Native tribes had sacred gold at {{location}}. Hidden it from the conquistadors.',
      "There's a relic in the old mission. Priests hid it when the raiders came.",
      'Ancient burial site in {{region}}. Grave goods still there, but cursed, they say.',
    ],
    prevalence: 0.2,
    tags: ['treasure', 'artifact', 'sacred'],
  },
  {
    id: 'rumor_danger_bandits',
    category: 'danger_warning',
    textTemplates: [
      "Don't go near {{location}} - full of bandits. They'll take everything you got.",
      "The road through {{region}} ain't safe. Outlaws hit three wagons last month.",
      "{{location}} is bandit territory. Even the law won't go there.",
    ],
    prevalence: 0.6,
    tags: ['bandits', 'combat'],
  },
  {
    id: 'rumor_danger_wildlife',
    category: 'danger_warning',
    textTemplates: [
      'Mountain lions been spotted near {{location}}. Lost two cattle last week.',
      "Rattlesnake den at {{location}}. Biggest nest anyone's ever seen.",
      "There's a grizzly in {{region}} that's killed three men. Hunters can't bring it down.",
    ],
    prevalence: 0.5,
    tags: ['wildlife', 'nature'],
  },
  {
    id: 'rumor_danger_terrain',
    category: 'danger_warning',
    textTemplates: [
      'Quicksand at {{location}}. Swallowed a whole mule. Stay on the marked path.',
      "The canyon at {{location}} floods without warning. Don't camp there.",
      'Old mine shafts all through {{region}}. Ground can give way under your feet.',
    ],
    prevalence: 0.4,
    tags: ['terrain', 'hazard'],
  },
  {
    id: 'rumor_danger_supernatural',
    category: 'danger_warning',
    textTemplates: [
      "Folks who go to {{location}} at night don't come back right. Somethin's wrong there.",
      "There's evil at the old cemetery. Lights where there shouldn't be. Sounds too.",
      "{{location}} is haunted. I don't care what you believe - stay away.",
    ],
    prevalence: 0.3,
    tags: ['supernatural', 'mystery'],
  },
  {
    id: 'rumor_danger_hostile',
    category: 'danger_warning',
    textTemplates: [
      '{{faction}} controls {{location}}. They shoot strangers on sight.',
      "The folks at {{location}} don't take kindly to outsiders. Lost a friend there.",
      "Stay away from {{npc}}'s territory unless you want trouble.",
    ],
    prevalence: 0.5,
    tags: ['hostile', 'faction'],
  },
  {
    id: 'rumor_danger_disease',
    category: 'danger_warning',
    textTemplates: [
      "Water at {{location}} will make you sick. Somethin' dead upstream.",
      "Don't eat nothin' from {{location}}. The soil's poisoned from the old smelter.",
      "Mining camp at {{location}} got the fever. They're turnin' people away.",
    ],
    prevalence: 0.4,
    tags: ['disease', 'contamination'],
  },
  {
    id: 'rumor_history_battle',
    category: 'history',
    textTemplates: [
      'Big battle happened at {{location}} during the war. Still find bones out there.',
      'The cavalry made their last stand near {{landmark}}. Graves are unmarked.',
      '{{location}} was the site of the massacre. Nobody settles there now.',
    ],
    prevalence: 0.4,
    tags: ['war', 'historical'],
  },
  {
    id: 'rumor_history_founding',
    category: 'history',
    textTemplates: [
      "This town was founded by {{npc}}'s grandfather. Built it from nothing.",
      '{{location}} used to be a mission. Padre still haunts the old chapel, they say.',
      "Before the settlers came, {{region}} belonged to the tribes. We're guests here.",
    ],
    prevalence: 0.5,
    tags: ['founding', 'local'],
  },
  {
    id: 'rumor_history_disaster',
    category: 'history',
    textTemplates: [
      "The great fire of '72 burned half the town. Some folks never rebuilt.",
      'Flood took out {{location}} twenty years back. River changed course after.',
      'Mine collapse at {{location}} killed forty men. Owners never paid the families.',
    ],
    prevalence: 0.4,
    tags: ['disaster', 'tragedy'],
  },
  {
    id: 'rumor_history_legend',
    category: 'history',
    textTemplates: [
      "{{npc}} was the fastest gun in the territory. Killed twenty men before retirin'.",
      "The great train robbery of '68 started right here. Never caught the gang.",
      "First steam engine came through {{location}} in '71. Folks thought it was a dragon.",
    ],
    prevalence: 0.4,
    tags: ['legend', 'famous'],
  },
  {
    id: 'rumor_personal_loss',
    category: 'personal',
    textTemplates: [
      "{{npc}} lost their whole family to the fever. That's why they drink.",
      "Don't mention the war around {{npc}}. Lost three brothers at {{location}}.",
      '{{npc}} was married once. Spouse died in childbirth. Never been the same.',
    ],
    prevalence: 0.3,
    tags: ['tragedy', 'backstory'],
  },
  {
    id: 'rumor_personal_dream',
    category: 'personal',
    textTemplates: [
      "{{npc}} is savin' up to buy a ranch. Been dreamin' of it for years.",
      'All {{npc}} wants is to find their missing kin and go home.',
      "{{npc}}'s got plans to strike it rich and head back East. Show 'em all.",
    ],
    prevalence: 0.4,
    tags: ['ambition', 'personal'],
  },
  {
    id: 'rumor_personal_secret_skill',
    category: 'personal',
    textTemplates: [
      "{{npc}} can read and write in three languages. Don't look it, but it's true.",
      "Before comin' West, {{npc}} was a doctor. Still got the skills.",
      '{{npc}} is a crack shot. Won medals in the army.',
    ],
    prevalence: 0.4,
    tags: ['skill', 'hidden'],
  },
  {
    id: 'rumor_personal_kindness',
    category: 'personal',
    textTemplates: [
      "{{npc}} may seem rough, but they took in three orphans. Raisin' 'em as their own.",
      'When the mine collapsed, {{npc}} spent their savings on the widows. Never talks about it.',
      '{{npc}} always leaves food for the hungry. Does it quiet, so nobody knows.',
    ],
    prevalence: 0.4,
    tags: ['kindness', 'virtue'],
  },

];
