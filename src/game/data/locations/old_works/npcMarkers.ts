import type { Location } from '../../schemas/spatial.ts';

type NpcMarker = NonNullable<Location['npcMarkers']>[number];

export const oldWorksNpcMarkers: NpcMarker[] = [
  // The Foreman - malfunctioning command automaton (boss)
  {
    role: 'the_foreman',
    position: { x: 120, y: 0, z: 92 },
    facing: 180,
    activity: 'standing',
    assignedTo: 'command_center',
    tags: ['boss', 'automaton', 'hostile', 'story_critical'],
  },
  // Automaton sentry patrolling the entry hall
  {
    role: 'automaton_sentry',
    position: { x: 120, y: 0, z: 180 },
    facing: 0,
    activity: 'patrolling',
    waypoints: [
      { x: 120, y: 0, z: 180 },
      { x: 120, y: 0, z: 160 },
      { x: 120, y: 0, z: 140 },
      { x: 120, y: 0, z: 160 },
    ],
    tags: ['automaton', 'hostile', 'entry_guard'],
  },
  // Assembly hall automaton worker (still "building")
  {
    role: 'automaton_worker',
    position: { x: 120, y: 0, z: 136 },
    facing: 270,
    activity: 'working',
    assignedTo: 'assembly_hall',
    tags: ['automaton', 'hostile', 'worker'],
  },
  // Power station automaton maintaining the boilers
  {
    role: 'automaton_engineer',
    position: { x: 68, y: 0, z: 132 },
    facing: 0,
    activity: 'working',
    assignedTo: 'power_station',
    tags: ['automaton', 'hostile', 'engineer'],
  },
  // Automaton patrol in barracks area
  {
    role: 'automaton_sentry',
    position: { x: 176, y: 0, z: 136 },
    facing: 270,
    activity: 'patrolling',
    waypoints: [
      { x: 176, y: 0, z: 136 },
      { x: 176, y: 0, z: 100 },
      { x: 176, y: 0, z: 64 },
      { x: 176, y: 0, z: 100 },
    ],
    assignedTo: 'barracks',
    tags: ['automaton', 'hostile', 'barracks_patrol'],
  },
  // Heavy automaton guarding the armory
  {
    role: 'automaton_heavy',
    position: { x: 164, y: 0, z: 92 },
    facing: 180,
    activity: 'guarding',
    assignedTo: 'armory',
    tags: ['automaton', 'hostile', 'elite', 'armory_guard'],
  },
  // Trapped explorer in storage vaults (ally)
  {
    role: 'trapped_explorer',
    position: { x: 76, y: 0, z: 92 },
    facing: 90,
    activity: 'sitting',
    assignedTo: 'storage_vaults',
    tags: ['ally', 'quest', 'rescue', 'lore'],
  },
  // Automaton sentry in testing ground
  {
    role: 'automaton_prototype',
    position: { x: 176, y: 0, z: 52 },
    facing: 180,
    activity: 'patrolling',
    waypoints: [
      { x: 168, y: 0, z: 48 },
      { x: 184, y: 0, z: 48 },
      { x: 184, y: 0, z: 60 },
      { x: 168, y: 0, z: 60 },
    ],
    assignedTo: 'testing_ground',
    tags: ['automaton', 'hostile', 'prototype', 'dangerous'],
  },
];
