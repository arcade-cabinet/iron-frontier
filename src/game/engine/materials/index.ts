// engine/materials — Canvas-painted procedural material system + PBR loaders
// Re-exports every public texture factory function and the cache.

export {
  createFabricTexture,
  createMetalTexture,
  createSandTexture,
  createStoneTexture,
  createWoodTexture,
} from './CanvasTextureFactory';

export {
  createDirtTexture,
  createGlassTexture,
  createLeatherTexture,
  createRustTexture,
  createSkinTexture,
} from './CanvasTextureFactory.organic';

export {
  createPBRBrickOld,
  createPBRClayAdobe,
  createPBRGravelRoad,
  createPBRGroundDesert,
  createPBRGroundSandy,
  createPBRMetalCorrugated,
  createPBRMetalRusted,
  createPBRRustHeavy,
  createPBRStoneRough,
  createPBRWoodAged,
  createPBRWoodPlanks,
  createPBRWoodSiding,
} from './PBRMaterialFactory';

export { TextureCache, globalTextureCache } from './TextureCache';
