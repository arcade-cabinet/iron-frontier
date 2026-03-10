// scene — Barrel export for R3F scene components

export { CombatSystem, type CombatSystemProps } from "./CombatSystem.tsx";
export { DayNightCycle, type DayNightCycleProps } from "./DayNightCycle.tsx";
export { DesertEnvironment, type DesertEnvironmentProps } from "./DesertEnvironment.tsx";
export { EntitySpawner, type EntitySpawnerProps } from "./EntitySpawner/index.ts";
export { Fireflies, type FirefliesProps } from "./Fireflies.tsx";
export { FPSCamera } from "./FPSCamera.tsx";
export { GameScene, type GameSceneProps } from "./GameScene.tsx";
export {
  InteractionDetector,
  type InteractionDetectorProps,
  type InteractionTarget,
  type InteractionType,
} from "./InteractionDetector.tsx";
export { Lighting, type LightingProps } from "./Lighting.tsx";
export { NPCIndicators } from "./NPCIndicator.tsx";
export { ObjectiveMarker } from "./ObjectiveMarker.tsx";
export { OpenWorld, type OpenWorldProps } from "./OpenWorld/index.ts";
export { PhysicsProvider, type PhysicsProviderProps, usePhysics } from "./PhysicsProvider.tsx";
export {
  PropCluster,
  type PropClusterProps,
  type PropPlacement,
  type PropType,
} from "./PropCluster.tsx";
export { Sky, type SkyProps } from "./Sky.tsx";
export { StealthDetector } from "./StealthDetector.tsx";
export { Terrain, type TerrainProps } from "./Terrain.tsx";
export {
  VegetationField,
  type VegetationFieldProps,
  type VegetationType,
} from "./VegetationField.tsx";
export { WeaponView, type WeaponViewProps } from "./WeaponView.tsx";
export { WorldItems } from "./WorldItems.tsx";
