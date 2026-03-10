// engine/renderers — Barrel export for all procedural renderers

export {
  createCactus,
  createTumbleweed,
  createScrubBrush,
  createDeadTree,
  createRock,
  type CactusVariant,
  type RockSize,
} from './Vegetation';

export {
  createHitchingPost,
  createWaterTrough,
  createBarrel,
  createCrate,
  createWagonWheel,
  createMineCart,
  createRailroadTrack,
} from './Props';

export {
  constructEnemy,
  type EnemyType,
} from './MonsterFactory';

export {
  createAnimState,
  tickIdleAnimation,
  type EnemyAnimState,
} from './EnemyAnimations';
