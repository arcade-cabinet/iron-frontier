// R3F Vegetation System - Index
// Export all vegetation components and utilities

// Types
export * from './types';

// Geometry generators
export {
  createCactusGeometry,
  useCactusGeometry,
  createJoshuaTreeGeometry,
  useJoshuaTreeGeometry,
  createSagebrushGeometry,
  useSagebrushGeometry,
  createDeadTreeGeometry,
  useDeadTreeGeometry,
  createTumbleweedGeometry,
  useTumbleweedGeometry,
  createRockGeometry,
  useRockGeometry,
  createBarrelCactusGeometry,
  useBarrelCactusGeometry,
  createPricklyPearGeometry,
  usePricklyPearGeometry,
  createYuccaGeometry,
  useYuccaGeometry,
  createAgaveGeometry,
  useAgaveGeometry,
  createMesquiteGeometry,
  useMesquiteGeometry,
  createCottonwoodGeometry,
  useCottonwoodGeometry,
  createWillowGeometry,
  useWillowGeometry,
  createVegetationGeometry,
  useVegetationGeometries,
} from './VegetationTypes';

// Spawner hook
export {
  useVegetationSpawner,
  generateStaticVegetation,
  type UseVegetationSpawnerResult,
  type StaticSpawnConfig,
} from './useVegetationSpawner';

// Instance rendering
export {
  VegetationInstances,
  SingleTypeInstances,
  StaticVegetation,
  type VegetationInstancesProps,
  type SingleTypeInstancesProps,
  type StaticVegetationProps,
} from './VegetationInstances';

// Biome-aware vegetation
export {
  BiomeVegetation,
  DesertVegetation,
  GrasslandVegetation,
  RiversideVegetation,
  TownVegetation,
  BadlandsVegetation,
  MixedBiomeVegetation,
  VegetationDebug,
  VegetationStats,
  type BiomeVegetationProps,
  type MixedBiomeVegetationProps,
  type VegetationDebugProps,
  type VegetationStatsProps,
} from './BiomeVegetation';
