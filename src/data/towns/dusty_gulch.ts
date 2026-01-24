/**
 * Dusty Gulch - Example starter town
 *
 * A small frontier town demonstrating the assemblage-based composition system.
 * This is what subagents would generate - fully validated Town data.
 */

import { Town, validateTown } from '../schemas';

export const DustyGulch: Town = validateTown({
  id: 'dusty_gulch',
  name: 'Dusty Gulch',
  type: 'town',
  size: 'small',
  description: 'A small frontier town clinging to existence at the edge of the badlands.',
  lore: `Founded by prospectors who found a reliable water source in an otherwise
barren stretch of desert. The town grew slowly as travelers needed a rest stop
on the long road to the mining camps further east. The sheriff keeps order with
an iron fist, though rumors persist of bandit activity in the surrounding hills.`,

  seed: 12345,
  width: 24,
  height: 24,
  baseBiome: 'sand',

  // Assemblages placed in the town
  assemblages: [
    // Town center
    { assemblageId: 'town_square_01', position: { q: 12, r: 12 }, rotation: 0 },

    // Main street buildings (north side)
    { assemblageId: 'single_saloon_01', position: { q: 14, r: 10 }, rotation: 0 },
    { assemblageId: 'single_store_01', position: { q: 17, r: 10 }, rotation: 0 },
    { assemblageId: 'single_sheriff_01', position: { q: 10, r: 10 }, rotation: 0 },

    // Main street buildings (south side)
    { assemblageId: 'single_church_01', position: { q: 14, r: 14 }, rotation: 3 },

    // Residential outskirts
    { assemblageId: 'single_cabin_01', position: { q: 8, r: 8 }, rotation: 1 },
    { assemblageId: 'single_cabin_01', position: { q: 18, r: 16 }, rotation: 4 },

    // Infrastructure
    { assemblageId: 'train_depot_01', position: { q: 20, r: 12 }, rotation: 0 },

    // Outskirts
    { assemblageId: 'graveyard_01', position: { q: 6, r: 16 }, rotation: 2 },
    { assemblageId: 'ranch_01', position: { q: 4, r: 6 }, rotation: 0 },
  ],

  // Custom terrain overrides (roads connecting everything)
  overrideTiles: [
    // Main street - east-west road through town
    { coord: { q: 8, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 9, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 10, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 11, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 13, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 14, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 15, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 16, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 17, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 18, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 19, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
  ],

  // NPCs
  npcs: [
    {
      id: 'npc_sheriff_mcgraw',
      name: 'Sheriff McGraw',
      role: 'sheriff',
      spawnCoord: { q: 10, r: 10 },
      schedule: [
        { time: 'morning', coord: { q: 10, r: 10 }, activity: 'paperwork' },
        { time: 'afternoon', coord: { q: 12, r: 12 }, activity: 'patrol' },
        { time: 'evening', coord: { q: 14, r: 10 }, activity: 'drinking' },
        { time: 'night', coord: { q: 10, r: 10 }, activity: 'sleeping' },
      ],
      dialogueId: 'dlg_sheriff_mcgraw',
      quests: ['quest_bandit_problem', 'quest_missing_prospector'],
      faction: 'law',
      essential: true,
    },
    {
      id: 'npc_bartender_sally',
      name: 'Salty Sally',
      role: 'bartender',
      spawnCoord: { q: 14, r: 10 },
      dialogueId: 'dlg_sally',
      shopId: 'shop_saloon_drinks',
      quests: ['quest_rat_cellar'],
      essential: false,
    },
    {
      id: 'npc_shopkeeper_chen',
      name: 'Mr. Chen',
      role: 'shopkeeper',
      spawnCoord: { q: 17, r: 10 },
      dialogueId: 'dlg_chen',
      shopId: 'shop_general_store',
      essential: false,
    },
    {
      id: 'npc_preacher_john',
      name: 'Preacher John',
      role: 'preacher',
      spawnCoord: { q: 14, r: 14 },
      schedule: [
        { time: 'morning', coord: { q: 14, r: 14 }, activity: 'prayer' },
        { time: 'afternoon', coord: { q: 6, r: 16 }, activity: 'tending_graves' },
        { time: 'evening', coord: { q: 14, r: 14 }, activity: 'sermon' },
        { time: 'night', coord: { q: 14, r: 14 }, activity: 'sleeping' },
      ],
      dialogueId: 'dlg_preacher',
      quests: ['quest_restless_spirits'],
      essential: false,
    },
    {
      id: 'npc_rancher_hank',
      name: 'Hank the Rancher',
      role: 'rancher',
      spawnCoord: { q: 4, r: 6 },
      dialogueId: 'dlg_hank',
      quests: ['quest_cattle_rustlers'],
      essential: false,
    },
    {
      id: 'npc_drifter_mysterious',
      name: 'The Stranger',
      role: 'drifter',
      spawnCoord: { q: 12, r: 12 },
      dialogueId: 'dlg_stranger',
      quests: ['quest_main_story_hook'],
      essential: true,
    },
  ],

  // Containers
  containers: [
    {
      id: 'cont_sheriff_safe',
      type: 'safe',
      coord: { q: 10, r: 10 },
      locked: true,
      lockDifficulty: 75,
      fixedItems: [
        { itemId: 'item_gold_coins', quantity: 50 },
        { itemId: 'item_evidence_letter', quantity: 1 },
      ],
    },
    {
      id: 'cont_store_stock',
      type: 'crate',
      coord: { q: 17, r: 9 },
      locked: false,
      lootTable: 'loot_general_goods',
      respawns: true,
    },
    {
      id: 'cont_church_donation',
      type: 'chest',
      coord: { q: 14, r: 14 },
      locked: false,
      lootTable: 'loot_poor_donations',
    },
    {
      id: 'cont_graveyard_hidden',
      type: 'grave',
      coord: { q: 6, r: 16 },
      locked: true,
      lockDifficulty: 30,
      fixedItems: [
        { itemId: 'item_old_revolver', quantity: 1 },
        { itemId: 'item_faded_photo', quantity: 1 },
      ],
    },
  ],

  // Entry/exit points
  entryPoints: [
    { id: 'entry_west', coord: { q: 2, r: 11 }, direction: 'west', label: 'Western Trail' },
    { id: 'entry_east', coord: { q: 22, r: 11 }, direction: 'east', label: 'Eastern Road' },
    { id: 'entry_train', coord: { q: 20, r: 12 }, direction: 'east', label: 'Train Station' },
  ],

  // World connections
  connections: [
    { targetLocationId: 'silver_ridge_mine', type: 'road' },
    { targetLocationId: 'red_rock_outpost', type: 'trail' },
    { targetLocationId: 'ironhorse_junction', type: 'railroad' },
  ],

  controllingFaction: 'law',
  economyLevel: 4,
  dangerLevel: 2,
  tags: ['starter', 'western', 'frontier', 'railroad'],
});

export default DustyGulch;
