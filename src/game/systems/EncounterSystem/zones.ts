import type { EncounterZone } from './types';

/**
 * Create default route encounter zones (distance-based for 3D).
 *
 * Design target: average encounter every 200-400m of wilderness travel.
 * minDistance is the mandatory safe travel before first possible encounter.
 * baseRate is the per-check (every 10m) chance once past minDistance.
 *
 * Encounter pool IDs reference templates in encounterTemplates.ts.
 * Each zone is matched to appropriate biome/terrain enemies:
 * - Desert: rattlesnakes, scorpions, bandits, desert predators
 * - Mountain: bears, mountain lions, cave creatures, mine guards
 * - Grassland: coyote packs, rustlers, storms, stampedes
 * - Badlands: copperhead gang, automatons, dynamite ambush
 * - Road: lone bandits, corrupt deputies, duels
 */
export function createRouteEncounterZones(): EncounterZone[] {
  return [
    {
      id: 'dusty_trail',
      baseRate: 0.08,
      minDistance: 150,
      encounterPool: [
        'lone_bandit',
        'bandit_ambush',
        'coyote_pack',
        'rattlesnake_nest',
        'scorpion_swarm',
        'desert_survival',
      ],
      timeModifiers: { dawn: 0.8, day: 1.0, dusk: 1.2, night: 1.5 },
      terrain: 'desert',
    },
    {
      id: 'canyon_pass',
      baseRate: 0.10,
      minDistance: 100,
      encounterPool: [
        'gang_raid',
        'bear_encounter',
        'cave_creatures',
        'claim_jumpers',
        'dynamite_ambush',
        'mine_guards',
      ],
      timeModifiers: { dawn: 0.9, day: 1.0, dusk: 1.3, night: 1.8 },
      terrain: 'mountain',
    },
    {
      id: 'riverside_path',
      baseRate: 0.06,
      minDistance: 200,
      encounterPool: [
        'rattlesnake_nest',
        'coyote_pack',
        'cattle_rustlers',
        'quicksand_trap',
        'stagecoach_robbery',
      ],
      timeModifiers: { dawn: 1.1, day: 0.9, dusk: 1.0, night: 1.3 },
      terrain: 'grass',
    },
    {
      id: 'badlands_trail',
      baseRate: 0.09,
      minDistance: 120,
      encounterPool: [
        'copperhead_patrol',
        'copperhead_raid',
        'automaton_malfunction',
        'remnant_awakening',
        'bandit_camp_assault',
        'storm_danger',
      ],
      timeModifiers: { dawn: 1.0, day: 0.8, dusk: 1.4, night: 2.0 },
      terrain: 'desert',
    },
    {
      id: 'main_road',
      baseRate: 0.03,
      minDistance: 300,
      encounterPool: [
        'lone_bandit',
        'corrupt_deputies',
        'duel_challenge',
        'railroad_thugs',
      ],
      timeModifiers: { dawn: 0.5, day: 0.3, dusk: 0.8, night: 1.5 },
      terrain: 'road',
    },
  ];
}
